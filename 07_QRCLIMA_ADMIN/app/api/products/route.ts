import { NextResponse } from 'next/server';
import { adminDb } from '@/lib/firebase-admin';
import { FieldValue } from 'firebase-admin/firestore';

// GET - Fetch all products
export async function GET() {
    try {
        if (!adminDb) {
            return NextResponse.json({ products: [] });
        }

        const snapshot = await adminDb.collection('store_products')
            .orderBy('sortOrder', 'asc')
            .get();

        const products = snapshot.docs.map((doc) => {
            const data = doc.data();
            return {
                id: doc.id,
                ...data,
                createdAt: data.createdAt?.toDate?.()?.toISOString() || null,
                updatedAt: data.updatedAt?.toDate?.()?.toISOString() || null,
            };
        });

        return NextResponse.json({ products });
    } catch (error) {
        console.error('Error fetching products:', error);
        return NextResponse.json(
            { error: 'Failed to fetch products', products: [] },
            { status: 500 }
        );
    }
}

// POST - Create new product
export async function POST(request: Request) {
    try {
        const product = await request.json();

        if (!product.name) {
            return NextResponse.json(
                { error: 'Product name is required' },
                { status: 400 }
            );
        }

        if (!adminDb) {
            return NextResponse.json(
                { error: 'Database not available' },
                { status: 500 }
            );
        }

        // Get next sort order
        const lastProduct = await adminDb.collection('store_products')
            .orderBy('sortOrder', 'desc')
            .limit(1)
            .get();

        const nextSortOrder = lastProduct.empty ? 0 : (lastProduct.docs[0].data().sortOrder || 0) + 1;

        const newProduct = {
            ...product,
            sortOrder: product.sortOrder ?? nextSortOrder,
            isActive: product.isActive ?? true,
            stock: product.stock ?? -1, // -1 = unlimited
            createdAt: FieldValue.serverTimestamp(),
            updatedAt: FieldValue.serverTimestamp(),
        };

        const docRef = await adminDb.collection('store_products').add(newProduct);

        // Log action
        await adminDb.collection('admin_logs').add({
            action: 'product_created',
            productId: docRef.id,
            productName: product.name,
            adminId: 'system',
            timestamp: FieldValue.serverTimestamp(),
        });

        return NextResponse.json({
            success: true,
            productId: docRef.id
        });
    } catch (error) {
        console.error('Error creating product:', error);
        return NextResponse.json(
            { error: 'Failed to create product' },
            { status: 500 }
        );
    }
}

// PATCH - Update product
export async function PATCH(request: Request) {
    try {
        const { productId, updates } = await request.json();

        if (!productId) {
            return NextResponse.json(
                { error: 'Product ID is required' },
                { status: 400 }
            );
        }

        if (!adminDb) {
            return NextResponse.json(
                { error: 'Database not available' },
                { status: 500 }
            );
        }

        await adminDb.collection('store_products').doc(productId).update({
            ...updates,
            updatedAt: FieldValue.serverTimestamp(),
        });

        // Log action
        await adminDb.collection('admin_logs').add({
            action: 'product_updated',
            productId,
            changes: Object.keys(updates),
            adminId: 'system',
            timestamp: FieldValue.serverTimestamp(),
        });

        return NextResponse.json({ success: true });
    } catch (error) {
        console.error('Error updating product:', error);
        return NextResponse.json(
            { error: 'Failed to update product' },
            { status: 500 }
        );
    }
}

// DELETE - Delete product
export async function DELETE(request: Request) {
    try {
        const { searchParams } = new URL(request.url);
        const productId = searchParams.get('id');

        if (!productId) {
            return NextResponse.json(
                { error: 'Product ID is required' },
                { status: 400 }
            );
        }

        if (!adminDb) {
            return NextResponse.json(
                { error: 'Database not available' },
                { status: 500 }
            );
        }

        // Get product name before deleting
        const productDoc = await adminDb.collection('store_products').doc(productId).get();
        const productName = productDoc.exists ? productDoc.data()?.name : 'Unknown';

        await adminDb.collection('store_products').doc(productId).delete();

        // Log action
        await adminDb.collection('admin_logs').add({
            action: 'product_deleted',
            productId,
            productName,
            adminId: 'system',
            timestamp: FieldValue.serverTimestamp(),
        });

        return NextResponse.json({ success: true });
    } catch (error) {
        console.error('Error deleting product:', error);
        return NextResponse.json(
            { error: 'Failed to delete product' },
            { status: 500 }
        );
    }
}
