import { NextResponse } from 'next/server';
import { adminDb } from '@/lib/firebase-admin';
import { FieldValue } from 'firebase-admin/firestore';

export async function POST(request: Request) {
    try {
        const { userId, amount } = await request.json();

        if (!userId || !amount || amount <= 0) {
            return NextResponse.json(
                { error: 'User ID and valid amount are required' },
                { status: 400 }
            );
        }

        if (!adminDb) {
            return NextResponse.json(
                { error: 'Database not available' },
                { status: 500 }
            );
        }

        // Get current balance
        const userDoc = await adminDb.collection('users').doc(userId).get();

        if (!userDoc.exists) {
            return NextResponse.json(
                { error: 'User not found' },
                { status: 404 }
            );
        }

        const userData = userDoc.data();
        // App uses 'tokenBalance' (camelCase)
        const currentBalance = userData?.tokenBalance || 0;
        const newBalance = currentBalance + amount;

        // Update user balance using 'tokenBalance' field
        await adminDb.collection('users').doc(userId).update({
            tokenBalance: FieldValue.increment(amount),
            updatedAt: FieldValue.serverTimestamp(),
        });

        // Log the transaction in token_transactions (same as app does)
        await adminDb.collection('token_transactions').add({
            userId,
            type: 'admin_grant',  // Match app's TransactionType
            amount: amount,       // Positive for earnings
            description: 'Regalo de administrador',
            createdAt: FieldValue.serverTimestamp(),  // App uses 'createdAt'
        });

        // Log admin action
        await adminDb.collection('admin_logs').add({
            action: 'tokens_gift',
            userId,
            amount,
            adminId: 'system', // TODO: Get from session
            timestamp: FieldValue.serverTimestamp(),
        });

        return NextResponse.json({
            success: true,
            newBalance
        });
    } catch (error) {
        console.error('Error gifting tokens:', error);
        return NextResponse.json(
            { error: 'Failed to gift tokens' },
            { status: 500 }
        );
    }
}
