import { NextResponse } from 'next/server';
import { adminDb, getPendingOrders, markOrderShipped } from '@/lib/firebase-admin';

// GET - Fetch all orders
export async function GET() {
    try {
        if (!adminDb) {
            return NextResponse.json({ orders: [] });
        }

        // Mostrar todas las órdenes (físicas y digitales)
        const snapshot = await adminDb.collection('orders')
            .orderBy('createdAt', 'desc')
            .limit(100)
            .get();

        const orders = await Promise.all(
            snapshot.docs.map(async (doc) => {
                const data = doc.data();

                // Get user info
                let userName = null;
                let userEmail = null;
                if (data.userId) {
                    try {
                        const userDoc = await adminDb.collection('users').doc(data.userId).get();
                        if (userDoc.exists) {
                            const userData = userDoc.data();
                            userName = userData?.alias || userData?.displayName;
                            userEmail = userData?.email;
                        }
                    } catch (e) {
                        // Ignore
                    }
                }

                return {
                    id: doc.id,
                    userId: data.userId,
                    userName,
                    userEmail,
                    product: data.product || data.productName,
                    amount: data.amount || data.total || data.amountCents ? Math.round((data.amountCents || 0) / 100) : 0,
                    amountTokens: data.amountTokens,
                    paymentMethod: data.paymentMethod || 'stripe',
                    status: data.status || 'pending',
                    date: data.createdAt?.toDate?.()?.toISOString()?.split('T')[0] || null,
                    // Format address as string if it's an object
                    address: (() => {
                        const addr = data.shippingAddress || data.address;
                        if (!addr) return 'Sin dirección';
                        if (typeof addr === 'string') return addr;
                        // It's an object, format it
                        return [
                            addr.street,
                            addr.neighborhood,
                            addr.city,
                            addr.state,
                            addr.postalCode ? `C.P. ${addr.postalCode}` : '',
                        ].filter(Boolean).join(', ') || 'Sin dirección';
                    })(),
                    trackingNumber: data.trackingNumber,
                    trackingCarrier: data.trackingCarrier,
                };
            })
        );

        return NextResponse.json({ orders });
    } catch (error) {
        console.error('Error fetching orders:', error);
        return NextResponse.json(
            { error: 'Failed to fetch orders', orders: [] },
            { status: 500 }
        );
    }
}

// POST - Mark order as shipped
export async function POST(request: Request) {
    try {
        const { orderId, trackingNumber, trackingCarrier } = await request.json();

        if (!orderId || !trackingNumber || !trackingCarrier) {
            return NextResponse.json(
                { error: 'Order ID, tracking number, and carrier are required' },
                { status: 400 }
            );
        }

        const success = await markOrderShipped(orderId, trackingNumber, trackingCarrier);

        if (success) {
            // Log the action
            if (adminDb) {
                await adminDb.collection('admin_logs').add({
                    action: 'order_shipped',
                    orderId,
                    trackingNumber,
                    trackingCarrier,
                    adminId: 'system', // TODO: Get from session
                    timestamp: new Date(),
                });
            }

            return NextResponse.json({ success: true });
        } else {
            return NextResponse.json(
                { error: 'Failed to mark order as shipped' },
                { status: 500 }
            );
        }
    } catch (error) {
        console.error('Error marking order as shipped:', error);
        return NextResponse.json(
            { error: 'Failed to mark order as shipped' },
            { status: 500 }
        );
    }
}
