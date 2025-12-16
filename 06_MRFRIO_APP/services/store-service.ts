import { doc, getDoc, updateDoc, increment } from 'firebase/firestore';
import { db } from '../firebaseConfig';

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
const PRODUCT_CATALOG: StoreProduct[] = [
    {
        id: 'p1',
        name: 'Pack de 10 QRs',
        description: 'Etiquetas de aluminio anodizado con adhesivo industrial 3M. Vincula equipos y asegura tus clientes.',
        imageUrl: 'https://mrfrio.com/assets/qrs.png', // Replace with local asset later
        price: 450,
        currency: 'MXN',
        category: 'Merch',
        stock: 50
    },
    {
        id: 'p2',
        name: 'Gorra Oficial Mr. Frío',
        description: 'Bordado 3D de alta calidad. Protege del sol en la azotea.',
        imageUrl: 'https://mrfrio.com/assets/cap.png',
        price: 250,
        currency: 'MXN',
        category: 'Merch',
        stock: 20
    },
    {
        id: 'd1',
        name: 'Desbloqueo Manuales VRF York',
        description: 'Acceso permanente a la biblioteca de códigos de error de sistemas VRF York.',
        imageUrl: 'https://mrfrio.com/assets/manual.png',
        price: 500,
        currency: 'Tokens',
        category: 'Digital',
        stock: 999
    },
    {
        id: 'd2',
        name: 'Booster de Visibilidad (7 días)',
        description: 'Aparece destacado en la búsqueda de técnicos de la web pública por una semana.',
        imageUrl: 'https://mrfrio.com/assets/boost.png',
        price: 200,
        currency: 'Tokens',
        category: 'Digital',
        stock: 999
    }
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

    // 2. Validate User & Balance
    const userRef = doc(db, 'users', userId);
    const userSnap = await getDoc(userRef);

    if (!userSnap.exists()) throw new Error("Usuario no encontrado");

    const userData = userSnap.data();

    // 3. Logic for 'Tokens' purchase
    if (product.currency === 'Tokens') {
        const currentBalance = userData.token_balance || 0;
        if (currentBalance < product.price) {
            throw new Error(`Saldo insuficiente. Tienes ${currentBalance} FrioCoins.`);
        }

        // Deduct Tokens
        await updateDoc(userRef, {
            token_balance: increment(-product.price)
        });
    }

    // 4. Logic for 'MXN' (Mock Stripe)
    if (product.currency === 'MXN') {
        // Simulate payment success
        await new Promise(resolve => setTimeout(resolve, 1500));
    }

    // 5. Create Order Record (Simulated)
    // await addDoc(collection(db, 'orders'), { userId, productId, date: serverTimestamp() });

    return { success: true, message: `Has adquirido: ${product.name}` };
};
