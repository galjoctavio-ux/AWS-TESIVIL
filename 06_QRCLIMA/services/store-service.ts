import { doc, getDoc, updateDoc, increment, serverTimestamp } from 'firebase/firestore';
import { db } from '../firebaseConfig';
import { spendTokens } from './wallet-service';

export interface StoreProduct {
    id: string;
    name: string;
    description: string;
    imageUrl: string;
    price: number;
    currency: 'MXN' | 'Tokens';
    category: 'Herramientas' | 'Digital' | 'Merch';
    stock: number;
}

// HARDCODED CATALOG - Solo productos digitales canjeables
// Los productos físicos y adicionales se administrarán desde panel web
const PRODUCT_CATALOG: StoreProduct[] = [
    {
        id: 'boost-pro-week',
        name: 'Semana PRO',
        description: 'Desbloquea TODAS las funciones Premium por 7 días: Cotizador Pro, PDFs sin marca, recordatorios, y más.',
        imageUrl: '',
        price: 500,
        currency: 'Tokens',
        category: 'Digital',
        stock: 999
    },
    {
        id: 'pdf-unlock-1',
        name: 'PDF Sin Marca',
        description: 'Genera 1 PDF de cotización o reporte profesional sin marca de agua de QRclima.',
        imageUrl: '',
        price: 50,
        currency: 'Tokens',
        category: 'Digital',
        stock: 999
    },
];

// 6 months in milliseconds
const SIX_MONTHS_MS = 6 * 30 * 24 * 60 * 60 * 1000;

export const getProducts = async (currencyFilter: 'MXN' | 'Tokens' | 'All' = 'All') => {
    // Simulate API delay
    await new Promise(resolve => setTimeout(resolve, 500));

    if (currencyFilter === 'All') return PRODUCT_CATALOG;
    return PRODUCT_CATALOG.filter(p => p.currency === currencyFilter);
};

/**
 * Check if user can purchase PRO week (max 1 per 6 months)
 */
export const canPurchaseProWeek = async (userId: string): Promise<{ canPurchase: boolean; waitDays?: number }> => {
    const userRef = doc(db, 'users', userId);
    const userSnap = await getDoc(userRef);

    if (!userSnap.exists()) return { canPurchase: false };

    const userData = userSnap.data();
    const lastPurchase = userData.lastProWeekPurchase;

    if (!lastPurchase) return { canPurchase: true };

    const lastDate = lastPurchase.toDate ? lastPurchase.toDate() : new Date(lastPurchase);
    const timeSince = Date.now() - lastDate.getTime();

    if (timeSince >= SIX_MONTHS_MS) {
        return { canPurchase: true };
    }

    const remainingDays = Math.ceil((SIX_MONTHS_MS - timeSince) / (24 * 60 * 60 * 1000));
    return { canPurchase: false, waitDays: remainingDays };
};

export const purchaseProduct = async (userId: string, productId: string) => {
    // 1. Get Product
    const product = PRODUCT_CATALOG.find(p => p.id === productId);
    if (!product) throw new Error("Producto no encontrado");

    // 2. Validate User exists
    const userRef = doc(db, 'users', userId);
    const userSnap = await getDoc(userRef);

    if (!userSnap.exists()) throw new Error("Usuario no encontrado");

    // 2.5. Check PRO week restriction (1 per 6 months)
    if (productId === 'boost-pro-week') {
        const { canPurchase, waitDays } = await canPurchaseProWeek(userId);
        if (!canPurchase) {
            throw new Error(`Solo puedes comprar Semana PRO una vez cada 6 meses. Espera ${waitDays} días más.`);
        }
    }

    // 3. Logic for 'Tokens' purchase - Use wallet-service for proper logging
    if (product.currency === 'Tokens') {
        const result = await spendTokens(
            userId,
            product.price,
            `Compra: ${product.name}`,
            productId
        );

        if (!result.success) {
            throw new Error(result.message);
        }
    }

    // 4. Logic for 'MXN' (Mock Stripe - will integrate in Session 8)
    if (product.currency === 'MXN') {
        // Simulate payment processing
        await new Promise(resolve => setTimeout(resolve, 1500));
        // TODO: Add Stripe/MercadoPago integration in payment-service.ts
    }

    // 5. Create Order Record for physical items
    if (product.category === 'Merch' || product.category === 'Herramientas') {
        // TODO: Create order in 'orders' collection for fulfillment
        console.log('Order created for physical product:', product.name);
    }

    // 6. Activate digital benefits immediately
    if (product.category === 'Digital') {
        // Activate PRO subscription for boost-pro-week
        if (product.id === 'boost-pro-week') {
            const { activateProSubscription } = await import('./user-service');
            await activateProSubscription(userId, 'Pro', 7); // 7 days PRO
            // Record purchase date for 6-month restriction
            await updateDoc(userRef, {
                lastProWeekPurchase: serverTimestamp()
            });
            console.log('PRO subscription activated for 7 days');
        }
        // Add PDF unlock credit
        else if (product.id === 'pdf-unlock-1') {
            await updateDoc(userRef, {
                pdfUnlocksAvailable: increment(1)
            });
            console.log('PDF unlock credit added for user:', userId);
        }
    }

    return { success: true, message: `Has adquirido: ${product.name}` };
};

/**
 * Consume one PDF unlock credit when generating a PDF without watermark
 * Returns true if credit was consumed, false if no credits available
 */
export const consumePdfUnlock = async (userId: string): Promise<boolean> => {
    const userRef = doc(db, 'users', userId);
    const userSnap = await getDoc(userRef);

    if (!userSnap.exists()) return false;

    const userData = userSnap.data();
    const credits = userData.pdfUnlocksAvailable || 0;

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
