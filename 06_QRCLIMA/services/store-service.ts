import {
    doc,
    getDoc,
    getDocs,
    updateDoc,
    addDoc,
    collection,
    query,
    where,
    orderBy,
    limit,
    increment,
    serverTimestamp,
    Timestamp
} from 'firebase/firestore';
import { db } from '../firebaseConfig';
import { spendTokens } from './wallet-service';

// ============================================
// TIPOS DE PRODUCTO
// ============================================

export interface DigitalBenefit {
    type: 'pro_days' | 'pdf_unlock' | 'token_boost' | 'tokens_grant';
    value: number;
    durationDays?: number;
}

export interface ProductVariant {
    id: string;
    name: string;
    stock: number;
}

export interface StoreProduct {
    id: string;
    name: string;
    description: string;
    imageUrl: string;

    // Precios
    priceTokens: number | null;
    priceMXN: number | null;

    // Categorización
    category: 'digital' | 'physical' | 'subscription';
    subcategory: string;

    // Inventario
    stock: number;  // -1 = ilimitado
    isActive: boolean;

    // Restricciones
    maxPerUser: number | null;
    cooldownDays: number | null;

    // Para productos digitales
    digitalBenefit?: DigitalBenefit;

    // Para productos físicos
    requiresShipping: boolean;
    variants?: ProductVariant[];

    sortOrder: number;
}

export interface ShippingAddress {
    fullName: string;
    street: string;
    city: string;
    state: string;
    postalCode: string;
    phone: string;
}

export interface Order {
    id?: string;
    userId: string;
    productId: string;
    productName: string;
    variantId?: string;
    status: 'pending' | 'paid' | 'processing' | 'shipped' | 'delivered' | 'cancelled';
    paymentMethod: 'tokens' | 'stripe' | 'oxxo';
    amountTokens?: number;
    amountMXN?: number;
    shippingAddress?: ShippingAddress;
    trackingNumber?: string;
    trackingCarrier?: string;
    createdAt: any;
}

// ============================================
// CACHE PARA PRODUCTOS
// ============================================

let productsCache: StoreProduct[] = [];
let productsCacheTime = 0;
const CACHE_TTL = 5 * 60 * 1000; // 5 minutos

// ============================================
// FUNCIONES DE PRODUCTO
// ============================================

/**
 * Obtiene todos los productos activos desde Firestore
 * Con cache de 5 minutos
 */
export const getProducts = async (currencyFilter: 'MXN' | 'Tokens' | 'All' = 'All'): Promise<StoreProduct[]> => {
    const now = Date.now();

    // Usar cache si es válido
    if (productsCache.length > 0 && now - productsCacheTime < CACHE_TTL) {
        return filterProducts(productsCache, currencyFilter);
    }

    try {
        const q = query(
            collection(db, 'store_products'),
            where('isActive', '==', true),
            orderBy('sortOrder', 'asc')
        );

        const snapshot = await getDocs(q);
        productsCache = snapshot.docs.map(doc => ({
            id: doc.id,
            ...doc.data()
        } as StoreProduct));

        productsCacheTime = now;
        console.log('✅ Products loaded from Firestore:', productsCache.length);

        return filterProducts(productsCache, currencyFilter);
    } catch (error) {
        console.error('Error loading products:', error);
        return [];
    }
};

const filterProducts = (products: StoreProduct[], currencyFilter: 'MXN' | 'Tokens' | 'All'): StoreProduct[] => {
    if (currencyFilter === 'All') return products;
    if (currencyFilter === 'Tokens') return products.filter(p => p.priceTokens !== null && p.priceTokens > 0);
    if (currencyFilter === 'MXN') return products.filter(p => p.priceMXN !== null && p.priceMXN > 0);
    return products;
};

/**
 * Invalida el cache de productos (llamar después de compras)
 */
export const invalidateProductsCache = () => {
    productsCacheTime = 0;
};

/**
 * Obtiene un producto por ID
 */
export const getProductById = async (productId: string): Promise<StoreProduct | null> => {
    // Primero intentar desde cache
    const cached = productsCache.find(p => p.id === productId);
    if (cached) return cached;

    try {
        const docRef = doc(db, 'store_products', productId);
        const docSnap = await getDoc(docRef);

        if (docSnap.exists()) {
            return { id: docSnap.id, ...docSnap.data() } as StoreProduct;
        }
        return null;
    } catch (error) {
        console.error('Error fetching product:', error);
        return null;
    }
};

// ============================================
// VALIDACIONES DE COMPRA
// ============================================

/**
 * Verifica si el usuario puede comprar el producto
 */
export const canPurchaseProduct = async (
    userId: string,
    productId: string
): Promise<{ canPurchase: boolean; reason?: string; waitDays?: number }> => {
    const product = await getProductById(productId);
    if (!product) return { canPurchase: false, reason: 'Producto no encontrado' };
    if (!product.isActive) return { canPurchase: false, reason: 'Producto no disponible' };
    if (product.stock === 0) return { canPurchase: false, reason: 'Sin stock' };

    console.log(`🔍 Checking purchase eligibility: product=${productId}, maxPerUser=${product.maxPerUser}, cooldownDays=${product.cooldownDays}`);

    // Verificar límite por usuario
    if (product.maxPerUser !== null && product.maxPerUser !== undefined) {
        const purchaseCount = await getUserPurchaseCount(userId, productId);
        console.log(`🔍 Purchase count for ${productId}: ${purchaseCount}/${product.maxPerUser}`);
        if (purchaseCount >= product.maxPerUser) {
            return { canPurchase: false, reason: `Límite alcanzado (${product.maxPerUser} máximo)` };
        }
    }

    // Verificar cooldown
    if (product.cooldownDays !== null && product.cooldownDays !== undefined && product.cooldownDays > 0) {
        const lastPurchase = await getLastPurchaseDate(userId, productId);
        console.log(`🔍 Last purchase for ${productId}: ${lastPurchase}`);
        if (lastPurchase) {
            const daysSince = Math.floor((Date.now() - lastPurchase.getTime()) / (24 * 60 * 60 * 1000));
            console.log(`🔍 Days since last purchase: ${daysSince}, cooldown required: ${product.cooldownDays}`);
            if (daysSince < product.cooldownDays) {
                const waitDays = product.cooldownDays - daysSince;
                return { canPurchase: false, reason: `Espera ${waitDays} días más`, waitDays };
            }
        }
    }

    return { canPurchase: true };
};

const getUserPurchaseCount = async (userId: string, productId: string): Promise<number> => {
    try {
        const q = query(
            collection(db, 'orders'),
            where('userId', '==', userId),
            where('productId', '==', productId),
            where('status', 'in', ['paid', 'processing', 'shipped', 'delivered'])
        );
        const snapshot = await getDocs(q);
        return snapshot.size;
    } catch (error) {
        return 0;
    }
};

const getLastPurchaseDate = async (userId: string, productId: string): Promise<Date | null> => {
    try {
        // Try with orderBy first (requires composite index)
        const q = query(
            collection(db, 'orders'),
            where('userId', '==', userId),
            where('productId', '==', productId),
            orderBy('createdAt', 'desc'),
            limit(1)
        );
        const snapshot = await getDocs(q);
        if (snapshot.empty) {
            console.log(`📦 No previous purchases found for user ${userId}, product ${productId}`);
            return null;
        }

        const data = snapshot.docs[0].data();
        const purchaseDate = data.createdAt?.toDate?.() || null;
        console.log(`📦 Last purchase found for product ${productId}: ${purchaseDate}`);
        return purchaseDate;
    } catch (error: any) {
        // If orderBy fails (index missing), try without orderBy and find manually
        console.warn(`⚠️ getLastPurchaseDate failed with orderBy, trying fallback:`, error?.message);

        try {
            const fallbackQ = query(
                collection(db, 'orders'),
                where('userId', '==', userId),
                where('productId', '==', productId)
            );
            const fallbackSnapshot = await getDocs(fallbackQ);
            if (fallbackSnapshot.empty) return null;

            // Find the most recent manually
            let latestDate: Date | null = null;
            fallbackSnapshot.docs.forEach(doc => {
                const data = doc.data();
                const docDate = data.createdAt?.toDate?.();
                if (docDate && (!latestDate || docDate > latestDate)) {
                    latestDate = docDate;
                }
            });
            console.log(`📦 Last purchase (fallback) for product ${productId}: ${latestDate}`);
            return latestDate;
        } catch (fallbackError) {
            console.error('❌ getLastPurchaseDate fallback also failed:', fallbackError);
            return null;
        }
    }
};

// ============================================
// COMPRA DE PRODUCTOS
// ============================================

/**
 * Compra un producto con tokens
 */
export const purchaseWithTokens = async (
    userId: string,
    productId: string,
    shippingAddress?: ShippingAddress,
    variantId?: string
): Promise<{ success: boolean; message: string; orderId?: string }> => {
    const product = await getProductById(productId);
    if (!product) return { success: false, message: 'Producto no encontrado' };
    if (product.priceTokens === null) return { success: false, message: 'Este producto no se vende con tokens' };

    // Validar si puede comprar
    const validation = await canPurchaseProduct(userId, productId);
    if (!validation.canPurchase) {
        return { success: false, message: validation.reason || 'No puedes comprar este producto' };
    }

    // Validar dirección si es producto físico
    if (product.requiresShipping && !shippingAddress) {
        return { success: false, message: 'Se requiere dirección de envío' };
    }

    // Validar variante si el producto tiene variantes
    if (product.variants && product.variants.length > 0 && !variantId) {
        return { success: false, message: 'Selecciona una variante' };
    }

    try {
        // Cobrar tokens
        const spendResult = await spendTokens(
            userId,
            product.priceTokens,
            `Compra: ${product.name}`,
            productId
        );

        if (!spendResult.success) {
            return { success: false, message: spendResult.message };
        }

        // A partir de aquí, si algo falla, debemos reembolsar los tokens
        try {
            // Crear orden
            console.log('📦 Creating order...');
            const order: Record<string, any> = {
                userId,
                productId,
                productName: product.name,
                category: product.category,
                requiresShipping: product.requiresShipping || false,
                status: product.category === 'digital' ? 'paid' : 'pending',
                paymentMethod: 'tokens',
                amountTokens: product.priceTokens,
                createdAt: serverTimestamp(),
            };

            if (variantId) order.variantId = variantId;
            if (shippingAddress) order.shippingAddress = shippingAddress;

            const orderRef = await addDoc(collection(db, 'orders'), order);
            console.log('✅ Order created:', orderRef.id);

            // Activar beneficio digital inmediatamente
            if (product.category === 'digital' && product.digitalBenefit) {
                console.log('🎁 Activating digital benefit:', product.digitalBenefit.type);
                await activateDigitalBenefit(userId, product.digitalBenefit);
                console.log('✅ Digital benefit activated');
            }

            // Descontar stock si no es ilimitado
            if (product.stock > 0) {
                console.log('📉 Updating stock for product:', productId);
                const productRef = doc(db, 'store_products', productId);
                await updateDoc(productRef, {
                    stock: increment(-1)
                });
                console.log('✅ Stock updated');
            }

            invalidateProductsCache();

            return {
                success: true,
                message: `Has adquirido: ${product.name}`,
                orderId: orderRef.id
            };
        } catch (postPaymentError: any) {
            // REEMBOLSO AUTOMÁTICO - Falló algo después de cobrar
            console.error('🚨 CRITICAL: Error post-payment, refunding tokens:', postPaymentError);

            try {
                // Devolver tokens al usuario
                const userRef = doc(db, 'users', userId);
                await updateDoc(userRef, {
                    tokenBalance: increment(product.priceTokens)
                });

                // Registrar el reembolso en el ledger
                await addDoc(collection(db, 'token_transactions'), {
                    userId,
                    type: 'admin_grant',
                    amount: product.priceTokens,
                    description: `Reembolso automático: ${product.name}`,
                    referenceId: productId,
                    createdAt: serverTimestamp(),
                });

                console.log(`✅ Tokens reembolsados: ${product.priceTokens}`);
            } catch (refundError) {
                console.error('🚨 CRITICAL: Failed to refund tokens:', refundError);
            }

            return {
                success: false,
                message: 'Error procesando el pedido. Tus tokens han sido devueltos.'
            };
        }
    } catch (error: any) {
        console.error('Error purchasing product:', error);
        return { success: false, message: error?.message || 'Error al procesar la compra' };
    }
};

// ============================================
// BENEFICIOS DIGITALES
// ============================================

/**
 * Activa un beneficio digital para el usuario
 */
const activateDigitalBenefit = async (userId: string, benefit: DigitalBenefit): Promise<void> => {
    const userRef = doc(db, 'users', userId);

    switch (benefit.type) {
        case 'pro_days':
            // Activar PRO por X días
            const { activateProSubscription } = await import('./user-service');
            await activateProSubscription(userId, 'Pro', benefit.value);
            console.log(`✅ PRO activado por ${benefit.value} días`);
            break;

        case 'pdf_unlock':
            // Agregar créditos de PDF
            await updateDoc(userRef, {
                pdfUnlocksAvailable: increment(benefit.value)
            });
            console.log(`✅ ${benefit.value} PDF unlocks agregados`);
            break;

        case 'token_boost':
            // Activar multiplicador de tokens
            // benefit.value should be the multiplier (e.g., 1.5)
            const multiplier = benefit.value || 1.5;
            const durationDays = benefit.durationDays || 7;
            const boostExpiry = new Date();
            boostExpiry.setDate(boostExpiry.getDate() + durationDays);
            await updateDoc(userRef, {
                tokenBoostMultiplier: multiplier,
                tokenBoostExpiry: Timestamp.fromDate(boostExpiry)
            });
            console.log(`✅ Boost ${multiplier}x activado por ${durationDays} días`);
            break;

        case 'tokens_grant':
            // Otorgar tokens directamente
            await updateDoc(userRef, {
                tokenBalance: increment(benefit.value)
            });
            console.log(`✅ ${benefit.value} tokens otorgados`);
            break;
    }
};

// ============================================
// FUNCIONES DE PDF (mantener compatibilidad)
// ============================================

/**
 * Consume one PDF unlock credit when generating a PDF without watermark
 */
export const consumePdfUnlock = async (userId: string): Promise<boolean> => {
    const userRef = doc(db, 'users', userId);
    const userSnap = await getDoc(userRef);

    if (!userSnap.exists()) return false;

    const credits = userSnap.data().pdfUnlocksAvailable || 0;
    if (credits <= 0) return false;

    await updateDoc(userRef, {
        pdfUnlocksAvailable: increment(-1)
    });

    console.log('PDF unlock credit consumed for user:', userId);
    return true;
};

/**
 * Check if user has PDF unlock credits available
 */
export const hasPdfUnlocks = async (userId: string): Promise<number> => {
    const userRef = doc(db, 'users', userId);
    const userSnap = await getDoc(userRef);

    if (!userSnap.exists()) return 0;
    return userSnap.data().pdfUnlocksAvailable || 0;
};

// ============================================
// COMPATIBILIDAD CON CÓDIGO ANTERIOR
// ============================================

// Para mantener compatibilidad con código que use purchaseProduct
export const purchaseProduct = purchaseWithTokens;

// Para verificar PRO week (ahora configurable desde admin)
export const canPurchaseProWeek = async (userId: string): Promise<{ canPurchase: boolean; waitDays?: number }> => {
    // Buscar producto de PRO week
    const products = await getProducts('Tokens');
    const proWeekProduct = products.find(p =>
        p.digitalBenefit?.type === 'pro_days' &&
        p.digitalBenefit?.value === 7
    );

    if (!proWeekProduct) return { canPurchase: true };

    const result = await canPurchaseProduct(userId, proWeekProduct.id);
    return { canPurchase: result.canPurchase, waitDays: result.waitDays };
};
