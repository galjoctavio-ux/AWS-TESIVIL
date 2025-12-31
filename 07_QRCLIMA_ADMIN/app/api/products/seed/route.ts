import { NextResponse } from 'next/server';
import { adminDb } from '@/lib/firebase-admin';
import { FieldValue } from 'firebase-admin/firestore';

// Default products to seed
const defaultProducts = [
    // Digital Products
    {
        name: 'Semana PRO',
        description: 'Desbloquea TODAS las funciones Premium por 7 días: Cotizador Pro, PDFs sin marca, recordatorios, y más.',
        imageUrl: '',
        priceTokens: 500,
        priceMXN: null,
        category: 'digital',
        subcategory: 'pro_boost',
        stock: -1,
        isActive: true,
        maxPerUser: 2,
        cooldownDays: 180, // 6 meses
        digitalBenefit: { type: 'pro_days', value: 7 },
        requiresShipping: false,
        sortOrder: 1,
    },
    {
        name: '3 Días PRO',
        description: 'Mini trial PRO: prueba todas las funciones premium por 3 días.',
        imageUrl: '',
        priceTokens: 200,
        priceMXN: null,
        category: 'digital',
        subcategory: 'pro_boost',
        stock: -1,
        isActive: true,
        maxPerUser: null,
        cooldownDays: 30,
        digitalBenefit: { type: 'pro_days', value: 3 },
        requiresShipping: false,
        sortOrder: 2,
    },
    {
        name: 'PDF Sin Marca',
        description: 'Genera 1 PDF de cotización o reporte profesional sin marca de agua de QRclima.',
        imageUrl: '',
        priceTokens: 50,
        priceMXN: null,
        category: 'digital',
        subcategory: 'pdf',
        stock: -1,
        isActive: true,
        maxPerUser: null,
        cooldownDays: null,
        digitalBenefit: { type: 'pdf_unlock', value: 1 },
        requiresShipping: false,
        sortOrder: 3,
    },
    {
        name: 'Boost 1.5x Tokens',
        description: 'Gana 50% más tokens en todas tus acciones durante 7 días.',
        imageUrl: '',
        priceTokens: 100,
        priceMXN: null,
        category: 'digital',
        subcategory: 'pro_boost',
        stock: -1,
        isActive: true,
        maxPerUser: null,
        cooldownDays: 14,
        digitalBenefit: { type: 'token_boost', value: 1.5, durationDays: 7 },
        requiresShipping: false,
        sortOrder: 4,
    },
    // Token Purchase (subscription category)
    {
        name: 'Pack 50 Tokens',
        description: 'Recarga de 50 tokens para usar en la tienda.',
        imageUrl: '',
        priceTokens: null,
        priceMXN: 19,
        category: 'subscription',
        subcategory: 'tokens',
        stock: -1,
        isActive: true,
        maxPerUser: null,
        cooldownDays: null,
        digitalBenefit: { type: 'tokens_grant', value: 50 },
        requiresShipping: false,
        sortOrder: 10,
    },
    // Physical Products
    {
        name: 'Cinta Momia',
        description: 'Rollo de cinta aislante profesional para instalaciones.',
        imageUrl: '',
        priceTokens: 80,
        priceMXN: null,
        category: 'physical',
        subcategory: 'tools',
        stock: 50,
        isActive: true,
        maxPerUser: 5,
        cooldownDays: null,
        requiresShipping: true,
        sortOrder: 20,
    },
    {
        name: 'Kit 10 Stickers QR',
        description: '10 stickers QR premium resistentes al clima para equipos.',
        imageUrl: '',
        priceTokens: 120,
        priceMXN: null,
        category: 'physical',
        subcategory: 'tools',
        stock: 100,
        isActive: true,
        maxPerUser: 10,
        cooldownDays: null,
        requiresShipping: true,
        sortOrder: 21,
    },
];

// POST - Seed default products
export async function POST() {
    try {
        if (!adminDb) {
            return NextResponse.json(
                { error: 'Database not available' },
                { status: 500 }
            );
        }

        // Check if products already exist
        const existingProducts = await adminDb.collection('store_products').limit(1).get();
        if (!existingProducts.empty) {
            return NextResponse.json({
                success: false,
                message: 'Products already exist. Delete them first if you want to re-seed.'
            });
        }

        // Create all default products
        const batch = adminDb.batch();

        for (const product of defaultProducts) {
            const docRef = adminDb.collection('store_products').doc();
            batch.set(docRef, {
                ...product,
                createdAt: FieldValue.serverTimestamp(),
                updatedAt: FieldValue.serverTimestamp(),
            });
        }

        await batch.commit();

        // Log action
        await adminDb.collection('admin_logs').add({
            action: 'products_seeded',
            count: defaultProducts.length,
            adminId: 'system',
            timestamp: FieldValue.serverTimestamp(),
        });

        return NextResponse.json({
            success: true,
            message: `Seeded ${defaultProducts.length} products`,
            products: defaultProducts.map(p => p.name)
        });
    } catch (error) {
        console.error('Error seeding products:', error);
        return NextResponse.json(
            { error: 'Failed to seed products' },
            { status: 500 }
        );
    }
}

// GET - Check if products need seeding
export async function GET() {
    try {
        if (!adminDb) {
            return NextResponse.json({ needsSeeding: true, count: 0 });
        }

        const products = await adminDb.collection('store_products').get();
        return NextResponse.json({
            needsSeeding: products.empty,
            count: products.size
        });
    } catch (error) {
        return NextResponse.json({ needsSeeding: true, count: 0 });
    }
}
