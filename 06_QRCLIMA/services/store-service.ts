import { doc, getDoc, updateDoc, increment } from 'firebase/firestore';
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

// HARDCODED CATALOG (Mock for now, would be in Firestore 'store_products')
// Según master_plan.md - Módulo 8: Tienda y Recompensas
const PRODUCT_CATALOG: StoreProduct[] = [
    // ============================================
    // PRODUCTOS FÍSICOS (MXN) - Etiquetas QR
    // ============================================
    {
        id: 'qr-pack-20',
        name: 'Pack Inicial (20 QRs)',
        description: 'Etiquetas vinil resistente UV + adhesivo industrial. Ideal para probar el sistema.',
        imageUrl: '',
        price: 350,
        currency: 'MXN',
        category: 'Merch',
        stock: 100
    },
    {
        id: 'qr-pack-50',
        name: 'Pack Taller (50 QRs)',
        description: 'Mejor precio por unidad. Para técnicos con alta demanda.',
        imageUrl: '',
        price: 750,
        currency: 'MXN',
        category: 'Merch',
        stock: 50
    },
    {
        id: 'qr-pack-100',
        name: 'Pack Flotilla (100 QRs)',
        description: 'Margen máximo. Para empresas o técnicos con múltiples ayudantes.',
        imageUrl: '',
        price: 1200,
        currency: 'MXN',
        category: 'Merch',
        stock: 30
    },
    {
        id: 'gorra',
        name: 'Gorra Oficial QRclima',
        description: 'Bordado 3D de alta calidad. Protege del sol en la azotea.',
        imageUrl: '',
        price: 250,
        currency: 'MXN',
        category: 'Merch',
        stock: 20
    },

    // ============================================
    // PRODUCTOS DIGITALES (Tokens) - Margen 100%
    // ============================================
    {
        id: 'boost-pro-week',
        name: '🚀 Semana PRO',
        description: 'Desbloquea TODAS las funciones Premium por 7 días. Cotizador Pro, PDFs sin marca, y más.',
        imageUrl: '',
        price: 500,
        currency: 'Tokens',
        category: 'Digital',
        stock: 999
    },
    {
        id: 'pdf-unlock-1',
        name: '📄 1 PDF Sin Marca',
        description: 'Genera un PDF de cotización profesional sin marca de agua.',
        imageUrl: '',
        price: 50,
        currency: 'Tokens',
        category: 'Digital',
        stock: 999
    },
    {
        id: 'sos-highlight',
        name: '📢 Destacar Mi Pregunta',
        description: 'Tu hilo SOS aparece al inicio del foro por 24 horas.',
        imageUrl: '',
        price: 100,
        currency: 'Tokens',
        category: 'Digital',
        stock: 999
    },
    {
        id: 'vrf-codes-york',
        name: '🔧 Códigos VRF York',
        description: 'Acceso permanente a biblioteca de errores de sistemas VRF York.',
        imageUrl: '',
        price: 300,
        currency: 'Tokens',
        category: 'Digital',
        stock: 999
    },
    {
        id: 'vrf-codes-lg',
        name: '🔧 Códigos VRF LG',
        description: 'Acceso permanente a biblioteca de errores de sistemas VRF LG.',
        imageUrl: '',
        price: 300,
        currency: 'Tokens',
        category: 'Digital',
        stock: 999
    },
    {
        id: 'cupon-qr-20',
        name: '🎫 Cupón 20% en QRs',
        description: 'Descuento del 20% en tu próxima compra de etiquetas QR físicas.',
        imageUrl: '',
        price: 200,
        currency: 'Tokens',
        category: 'Digital',
        stock: 999
    },

    // ============================================
    // HERRAMIENTAS FÍSICAS (Tokens altos)
    // ============================================
    {
        id: 'tool-tape',
        name: '🧰 Cinta Momia (Rollo)',
        description: 'Cinta de alta resistencia para instalaciones. Envío gratis con pack QR.',
        imageUrl: '',
        price: 150,
        currency: 'Tokens',
        category: 'Herramientas',
        stock: 30
    },
    {
        id: 'tool-screwdriver',
        name: '🧰 Desarmador de Bolsillo',
        description: 'Desarmador compacto con puntas intercambiables.',
        imageUrl: '',
        price: 250,
        currency: 'Tokens',
        category: 'Herramientas',
        stock: 20
    },
];

export const getProducts = async (currencyFilter: 'MXN' | 'Tokens' | 'All' = 'All') => {
    // Simulate API delay
    await new Promise(resolve => setTimeout(resolve, 500));

    if (currencyFilter === 'All') return PRODUCT_CATALOG;
    return PRODUCT_CATALOG.filter(p => p.currency === currencyFilter);
};


export const purchaseProduct = async (userId: string, productId: string) => {
    // 1. Get Product
    const product = PRODUCT_CATALOG.find(p => p.id === productId);
    if (!product) throw new Error("Producto no encontrado");

    // 2. Validate User exists
    const userRef = doc(db, 'users', userId);
    const userSnap = await getDoc(userRef);

    if (!userSnap.exists()) throw new Error("Usuario no encontrado");

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
        // TODO: Update user's unlocked features based on productId
        console.log('Digital product activated:', product.id);
    }

    return { success: true, message: `Has adquirido: ${product.name}` };
};
