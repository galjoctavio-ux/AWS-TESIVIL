import { addDoc, collection, serverTimestamp, doc, updateDoc, getDoc, query, where, getDocs, orderBy, limit } from 'firebase/firestore';
import { db } from '../firebaseConfig';
// import Constants from 'expo-constants'; // Uncomment when using real env vars

// ============================================
// SERVICIO DE PAGOS - QRclima
// Según master_plan.md - Módulos 7 y 8
// Estructura preparada para Stripe y MercadoPago
// ============================================

// ============================================
// TIPOS Y CONFIGURACIÓN
// ============================================

export type PaymentProvider = 'stripe' | 'mercadopago';
export type PaymentStatus = 'pending' | 'processing' | 'completed' | 'failed' | 'refunded' | 'cancelled';
export type PaymentType = 'subscription' | 'one_time' | 'token_purchase';

export interface PaymentConfig {
    provider: PaymentProvider;
    publicKey: string;
    isConfigured: boolean;
    testMode: boolean;
}

export interface PaymentIntent {
    id?: string;
    userId: string;
    productId: string;
    productName: string;
    amount: number;          // En centavos (Stripe) o pesos (MP)
    currency: 'MXN' | 'USD';
    provider: PaymentProvider;
    type: PaymentType;
    providerPaymentId?: string;  // ID del lado del proveedor
    providerClientSecret?: string; // Para Stripe PaymentIntent
    status: PaymentStatus;
    shippingAddress?: ShippingAddress;
    metadata?: Record<string, any>;
    createdAt: any;
    updatedAt?: any;
    completedAt?: any;
    errorMessage?: string;
}

export interface ShippingAddress {
    fullName: string;
    phone?: string;
    street: string;
    neighborhood?: string;     // Colonia
    city: string;
    state: string;
    postalCode: string;
    country?: string;
    references?: string;       // Referencias de entrega
}

export interface Product {
    id: string;
    name: string;
    description: string;
    priceMxn: number;        // Precio en pesos mexicanos
    priceTokens?: number;    // Precio alternativo en tokens
    type: 'physical' | 'digital' | 'subscription';
    category: 'qr_pack' | 'merch' | 'booster' | 'subscription';
    stock?: number;
    isActive: boolean;
    stripePriceId?: string;  // Para suscripciones
    imageUrl?: string;
}

export interface Order {
    id?: string;
    userId: string;
    paymentIntentId: string;
    products: { productId: string; quantity: number; unitPrice: number }[];
    totalAmount: number;
    status: 'pending' | 'paid' | 'processing' | 'shipped' | 'delivered' | 'cancelled';
    shippingAddress?: ShippingAddress;
    trackingNumber?: string;
    trackingCarrier?: string;
    createdAt: any;
    updatedAt?: any;
    notes?: string;
}

// ============================================
// CONFIGURACIÓN DE PROVEEDORES
// ============================================

/**
 * INSTRUCCIONES PARA CONFIGURAR:
 * 
 * 1. Copia env.example.md a un archivo .env en la raíz del proyecto
 * 2. Reemplaza los valores PLACEHOLDER con tus claves reales
 * 3. Las claves secretas NUNCA deben estar en el código cliente
 * 4. Usa Cloud Functions para operaciones que requieran claves secretas
 * 
 * STRIPE:
 * - Dashboard: https://dashboard.stripe.com/apikeys
 * - Usa pk_test_... para desarrollo
 * - Usa pk_live_... para producción
 * 
 * MERCADO PAGO:
 * - Dashboard: https://www.mercadopago.com.mx/developers/panel/app
 * - Usa TEST-... para desarrollo
 * - Usa APP_USR-... para producción
 */

const getEnvVar = (key: string, fallback: string = ''): string => {
    // En desarrollo, usa process.env directamente
    // En producción con Expo, usa Constants.expoConfig?.extra
    if (typeof process !== 'undefined' && process.env && process.env[key]) {
        return process.env[key] as string;
    }
    // Uncomment siguiente línea cuando configuremos app.json
    // return Constants.expoConfig?.extra?.[key] || fallback;
    return fallback;
};

export const PAYMENT_CONFIG: Record<PaymentProvider, PaymentConfig> = {
    stripe: {
        provider: 'stripe',
        publicKey: getEnvVar('EXPO_PUBLIC_STRIPE_PUBLISHABLE_KEY', 'pk_test_PLACEHOLDER'),
        isConfigured: !getEnvVar('EXPO_PUBLIC_STRIPE_PUBLISHABLE_KEY', 'pk_test_PLACEHOLDER').includes('PLACEHOLDER'),
        testMode: getEnvVar('EXPO_PUBLIC_STRIPE_PUBLISHABLE_KEY', 'pk_test_').startsWith('pk_test_'),
    },
    mercadopago: {
        provider: 'mercadopago',
        publicKey: getEnvVar('EXPO_PUBLIC_MP_PUBLIC_KEY', 'TEST-PLACEHOLDER'),
        isConfigured: !getEnvVar('EXPO_PUBLIC_MP_PUBLIC_KEY', 'TEST-PLACEHOLDER').includes('PLACEHOLDER'),
        testMode: getEnvVar('EXPO_PUBLIC_MP_PUBLIC_KEY', 'TEST-').startsWith('TEST-'),
    }
};

// Proveedor por defecto para México
const DEFAULT_PROVIDER: PaymentProvider = 'mercadopago';

// ============================================
// FUNCIONES PRINCIPALES
// ============================================

/**
 * Verifica si los pagos están configurados correctamente
 */
export const isPaymentConfigured = (provider?: PaymentProvider): boolean => {
    const config = PAYMENT_CONFIG[provider || DEFAULT_PROVIDER];
    return config.isConfigured;
};

/**
 * Obtiene la configuración del proveedor
 */
export const getPaymentConfig = (provider: PaymentProvider = DEFAULT_PROVIDER): PaymentConfig => {
    return PAYMENT_CONFIG[provider];
};

/**
 * Crea un PaymentIntent (paso 1 del flujo de pago)
 * 
 * En PRODUCCIÓN: Esto debería llamar a una Cloud Function que:
 * 1. Crea el PaymentIntent en Stripe/MP con la clave secreta
 * 2. Retorna el client_secret para completar el pago en el cliente
 */
export const createPaymentIntent = async (
    userId: string,
    productOrAmount: Product | number,
    quantityOrProvider: number | PaymentProvider = 1,
    providerOrMetadata?: PaymentProvider | { productId?: string; productName?: string; shippingAddress?: ShippingAddress },
    shippingAddress?: ShippingAddress
): Promise<PaymentIntent> => {
    try {
        let amount: number;
        let productId: string;
        let productName: string;
        let provider: PaymentProvider;
        let type: PaymentType = 'one_time';
        let finalShippingAddress: ShippingAddress | undefined;
        let metadata: Record<string, any> = {};

        // Handle simple amount-based call
        if (typeof productOrAmount === 'number') {
            amount = productOrAmount;
            provider = (typeof quantityOrProvider === 'string' ? quantityOrProvider : 'mercadopago') as PaymentProvider;
            const meta = providerOrMetadata as { productId?: string; productName?: string; shippingAddress?: ShippingAddress } | undefined;
            productId = meta?.productId || 'custom';
            productName = meta?.productName || 'Compra';
            finalShippingAddress = meta?.shippingAddress;
        } else {
            // Handle Product-based call
            const product = productOrAmount;
            const quantity = typeof quantityOrProvider === 'number' ? quantityOrProvider : 1;
            amount = product.priceMxn * quantity;
            provider = (typeof providerOrMetadata === 'string' ? providerOrMetadata : 'mercadopago') as PaymentProvider;
            productId = product.id;
            productName = product.name;
            type = product.type === 'subscription' ? 'subscription' : 'one_time';
            finalShippingAddress = product.type === 'physical' ? shippingAddress : undefined;
            metadata = { productCategory: product.category, quantity };
        }

        const paymentIntent: Omit<PaymentIntent, 'id'> = {
            userId,
            productId,
            productName,
            amount: provider === 'stripe' ? amount * 100 : amount, // Stripe usa centavos
            currency: 'MXN',
            provider,
            type,
            status: 'pending',
            shippingAddress: finalShippingAddress,
            metadata,
            createdAt: serverTimestamp(),
        };

        // Guardar en Firestore
        const docRef = await addDoc(collection(db, 'payment_intents'), paymentIntent);

        console.log('Payment intent created:', docRef.id);

        // =============================================
        // TODO: PRODUCCIÓN - Llamar a Cloud Function
        // =============================================
        // 
        // STRIPE:
        // const functions = getFunctions();
        // const createStripeIntent = httpsCallable(functions, 'createStripePaymentIntent');
        // const result = await createStripeIntent({ 
        //     amount: paymentIntent.amount, 
        //     productId: product.id,
        //     paymentIntentDocId: docRef.id 
        // });
        // return { ...paymentIntent, id: docRef.id, providerClientSecret: result.data.clientSecret };
        //
        // MERCADO PAGO:
        // const createMPPreference = httpsCallable(functions, 'createMPPreference');
        // const result = await createMPPreference({ 
        //     amount: paymentIntent.amount,
        //     title: product.name,
        //     paymentIntentDocId: docRef.id
        // });
        // return { ...paymentIntent, id: docRef.id, providerPaymentId: result.data.preferenceId };

        return { ...paymentIntent, id: docRef.id };
    } catch (error) {
        console.error('Error creating payment intent:', error);
        throw new Error('No se pudo iniciar el pago');
    }
};

/**
 * Procesa el pago después de la confirmación del usuario
 * MOCK: Simula procesamiento exitoso. En producción usa Stripe/MP SDK.
 */
export const processPayment = async (
    paymentIntentId: string,
    paymentMethodData?: any
): Promise<{ success: boolean; message: string; orderId?: string }> => {
    try {
        // Obtener el payment intent
        const intentRef = doc(db, 'payment_intents', paymentIntentId);
        const intentSnap = await getDoc(intentRef);

        if (!intentSnap.exists()) {
            throw new Error('Payment intent not found');
        }

        const intent = intentSnap.data() as PaymentIntent;

        // Actualizar a "processing"
        await updateDoc(intentRef, {
            status: 'processing',
            updatedAt: serverTimestamp(),
        });

        // =============================================
        // MOCK: Simular procesamiento (2 segundos)
        // En producción esto se maneja con webhooks
        // =============================================
        await new Promise(resolve => setTimeout(resolve, 2000));

        // Simular éxito (90%) o fallo (10%) para testing
        const isSuccess = Math.random() > 0.1;

        if (isSuccess) {
            // Actualizar a "completed"
            await updateDoc(intentRef, {
                status: 'completed',
                completedAt: serverTimestamp(),
                providerPaymentId: `mock_${Date.now()}`,
            });

            // Crear orden si es producto físico
            let orderId: string | undefined;
            if (intent.type === 'one_time' && intent.shippingAddress) {
                const order: Omit<Order, 'id'> = {
                    userId: intent.userId,
                    paymentIntentId,
                    products: [{
                        productId: intent.productId,
                        quantity: intent.metadata?.quantity || 1,
                        unitPrice: intent.amount
                    }],
                    totalAmount: intent.amount,
                    status: 'paid',
                    shippingAddress: intent.shippingAddress,
                    createdAt: serverTimestamp(),
                };
                const orderRef = await addDoc(collection(db, 'orders'), order);
                orderId = orderRef.id;
            }

            return {
                success: true,
                message: 'Pago procesado exitosamente',
                orderId,
            };
        } else {
            // Simular fallo
            await updateDoc(intentRef, {
                status: 'failed',
                errorMessage: 'Pago rechazado por el banco (simulado)',
                updatedAt: serverTimestamp(),
            });

            return {
                success: false,
                message: 'El pago fue rechazado. Por favor intenta con otro método de pago.',
            };
        }
    } catch (error) {
        console.error('Error processing payment:', error);
        return {
            success: false,
            message: 'Error al procesar el pago. Por favor intenta de nuevo.',
        };
    }
};

/**
 * Cancela un payment intent pendiente
 */
export const cancelPaymentIntent = async (paymentIntentId: string): Promise<boolean> => {
    try {
        const intentRef = doc(db, 'payment_intents', paymentIntentId);
        await updateDoc(intentRef, {
            status: 'cancelled',
            updatedAt: serverTimestamp(),
        });
        return true;
    } catch (error) {
        console.error('Error cancelling payment:', error);
        return false;
    }
};

/**
 * Obtiene el historial de pagos del usuario
 */
export const getPaymentHistory = async (
    userId: string,
    limitCount: number = 20
): Promise<PaymentIntent[]> => {
    try {
        const q = query(
            collection(db, 'payment_intents'),
            where('userId', '==', userId),
            orderBy('createdAt', 'desc'),
            limit(limitCount)
        );

        const snapshot = await getDocs(q);
        return snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as PaymentIntent));
    } catch (error) {
        console.error('Error fetching payment history:', error);
        return [];
    }
};

/**
 * Obtiene las órdenes del usuario
 */
export const getUserOrders = async (
    userId: string,
    limitCount: number = 20
): Promise<Order[]> => {
    try {
        const q = query(
            collection(db, 'orders'),
            where('userId', '==', userId),
            orderBy('createdAt', 'desc'),
            limit(limitCount)
        );

        const snapshot = await getDocs(q);
        return snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as Order));
    } catch (error) {
        console.error('Error fetching orders:', error);
        return [];
    }
};

// ============================================
// HELPERS PARA UI
// ============================================

/**
 * Formatea precio para mostrar en MXN
 */
export const formatPrice = (amount: number, provider?: PaymentProvider): string => {
    // Si viene de Stripe (centavos), convertir a pesos
    const pesos = provider === 'stripe' ? amount / 100 : amount;

    return new Intl.NumberFormat('es-MX', {
        style: 'currency',
        currency: 'MXN',
    }).format(pesos);
};

/**
 * Calcula la comisión de procesamiento (informativo para el técnico)
 */
export const calculateProcessingFee = (
    amount: number,
    provider: PaymentProvider = DEFAULT_PROVIDER
): { fee: number; netAmount: number; percentage: string } => {
    let fee: number;
    let percentage: string;

    if (provider === 'stripe') {
        // Stripe México: 3.6% + $3 MXN
        fee = amount * 0.036 + 3;
        percentage = '3.6% + $3';
    } else {
        // MercadoPago México: 3.49% + IVA
        fee = amount * 0.0349 * 1.16; // Con IVA
        percentage = '3.49% + IVA';
    }

    return {
        fee: Math.round(fee * 100) / 100,
        netAmount: Math.round((amount - fee) * 100) / 100,
        percentage,
    };
};

/**
 * Obtiene el texto de estado del pago para UI
 */
export const getPaymentStatusText = (status: PaymentStatus): { text: string; color: string } => {
    switch (status) {
        case 'pending':
            return { text: 'Pendiente', color: 'yellow' };
        case 'processing':
            return { text: 'Procesando...', color: 'blue' };
        case 'completed':
            return { text: 'Completado', color: 'green' };
        case 'failed':
            return { text: 'Fallido', color: 'red' };
        case 'refunded':
            return { text: 'Reembolsado', color: 'gray' };
        case 'cancelled':
            return { text: 'Cancelado', color: 'gray' };
        default:
            return { text: 'Desconocido', color: 'gray' };
    }
};

/**
 * Obtiene el texto de estado de orden para UI
 */
export const getOrderStatusText = (status: Order['status']): { text: string; color: string; icon: string } => {
    switch (status) {
        case 'pending':
            return { text: 'Pendiente de pago', color: 'yellow', icon: 'time-outline' };
        case 'paid':
            return { text: 'Pagado', color: 'green', icon: 'checkmark-circle-outline' };
        case 'processing':
            return { text: 'Preparando envío', color: 'blue', icon: 'cube-outline' };
        case 'shipped':
            return { text: 'Enviado', color: 'purple', icon: 'airplane-outline' };
        case 'delivered':
            return { text: 'Entregado', color: 'green', icon: 'checkmark-done-outline' };
        case 'cancelled':
            return { text: 'Cancelado', color: 'red', icon: 'close-circle-outline' };
        default:
            return { text: 'Desconocido', color: 'gray', icon: 'help-circle-outline' };
    }
};

// ============================================
// PRODUCTOS PRE-DEFINIDOS (Catálogo inicial)
// ============================================

export const STORE_PRODUCTS: Product[] = [
    {
        id: 'qr_pack_20',
        name: 'Pack Inicial (20 QRs)',
        description: '20 etiquetas QR profesionales resistentes a intemperie',
        priceMxn: 199,
        type: 'physical',
        category: 'qr_pack',
        stock: 100,
        isActive: true,
    },
    {
        id: 'qr_pack_50',
        name: 'Pack Taller (50 QRs)',
        description: '50 etiquetas QR profesionales + envío gratis',
        priceMxn: 399,
        type: 'physical',
        category: 'qr_pack',
        stock: 50,
        isActive: true,
    },
    {
        id: 'qr_pack_100',
        name: 'Pack Flotilla (100 QRs)',
        description: '100 etiquetas QR profesionales + envío gratis + bonus',
        priceMxn: 699,
        type: 'physical',
        category: 'qr_pack',
        stock: 30,
        isActive: true,
    },
    {
        id: 'pro_week',
        name: 'Semana PRO',
        description: 'Desbloquea todas las funciones PRO por 7 días',
        priceMxn: 0,
        priceTokens: 500,  // Standardized to 500 tokens
        type: 'digital',
        category: 'booster',
        isActive: true,
    },
    {
        id: 'pro_month',
        name: 'Suscripción PRO Mensual',
        description: 'Acceso completo a funciones PRO',
        priceMxn: 99,
        type: 'subscription',
        category: 'subscription',
        stripePriceId: 'price_PLACEHOLDER', // Reemplazar con ID real de Stripe
        isActive: true,
    },
    {
        id: 'pro_year',
        name: 'Suscripción PRO Anual',
        description: 'Acceso completo a funciones PRO (ahorra 2 meses)',
        priceMxn: 999,
        type: 'subscription',
        category: 'subscription',
        stripePriceId: 'price_PLACEHOLDER_YEAR', // Reemplazar con ID real de Stripe
        isActive: true,
    },
];

/**
 * Obtiene un producto por ID
 */
export const getProductById = (productId: string): Product | undefined => {
    return STORE_PRODUCTS.find(p => p.id === productId);
};

/**
 * Obtiene productos por categoría
 */
export const getProductsByCategory = (category: Product['category']): Product[] => {
    return STORE_PRODUCTS.filter(p => p.category === category && p.isActive);
};
