import { NextResponse } from 'next/server';
import { adminDb } from '@/lib/firebase-admin';

export async function GET() {
    try {
        if (!adminDb) {
            console.log('adminDb is null, returning empty stats');
            return NextResponse.json({
                stats: {
                    totalCirculating: 0,
                    emittedToday: 0,
                    averagePerUser: 0,
                    topUsers: [],
                    recentTransactions: [],
                },
            });
        }

        // Get all users - simple query
        let totalCirculating = 0;
        const topUsers: Array<{ id: string; alias: string; balance: number }> = [];
        let averagePerUser = 0;

        try {
            const usersSnapshot = await adminDb.collection('users')
                .limit(500)
                .get();

            const usersWithTokens: Array<{ id: string; alias: string; balance: number }> = [];

            usersSnapshot.docs.forEach((doc) => {
                const data = doc.data();
                // App uses 'tokenBalance' (camelCase)
                const balance = data.tokenBalance || 0;
                totalCirculating += balance;

                usersWithTokens.push({
                    id: doc.id,
                    alias: data.alias || data.displayName || data.fullName || 'Usuario',
                    balance,
                });
            });

            // Sort by balance and get top 10
            usersWithTokens.sort((a, b) => b.balance - a.balance);
            topUsers.push(...usersWithTokens.slice(0, 10));

            const userCount = usersSnapshot.size || 1;
            averagePerUser = totalCirculating / userCount;
        } catch (userError) {
            console.error('Error fetching users for tokens:', userError);
        }

        // Get tokens emitted today from token_transactions
        const today = new Date();
        today.setHours(0, 0, 0, 0);

        let emittedToday = 0;
        const recentTransactions: Array<{
            id: string;
            type: 'earn' | 'spend';
            amount: number;
            reason: string;
            userId: string;
            userAlias?: string;
            timestamp: string;
        }> = [];

        try {
            // App uses 'createdAt' for timestamps in token_transactions
            const txSnapshot = await adminDb.collection('token_transactions')
                .orderBy('createdAt', 'desc')
                .limit(50)
                .get();

            txSnapshot.docs.forEach((doc) => {
                const data = doc.data();
                const txDate = data.createdAt?.toDate?.() || new Date();
                const amount = data.amount || 0;

                if (txDate >= today && amount > 0) {
                    emittedToday += amount;
                }

                recentTransactions.push({
                    id: doc.id,
                    type: amount > 0 ? 'earn' : 'spend',
                    amount: Math.abs(amount),
                    reason: data.description || data.type || 'Transacción',
                    userId: data.userId || '',
                    userAlias: data.userAlias,
                    timestamp: txDate.toISOString(),
                });
            });
        } catch (e) {
            // Collection might not exist yet
            console.log('Token transactions collection not found or empty:', e);
        }

        return NextResponse.json({
            stats: {
                totalCirculating,
                emittedToday,
                averagePerUser,
                topUsers,
                recentTransactions: recentTransactions.slice(0, 20),
            },
        });
    } catch (error) {
        console.error('Error fetching token stats:', error);
        return NextResponse.json({
            stats: {
                totalCirculating: 0,
                emittedToday: 0,
                averagePerUser: 0,
                topUsers: [],
                recentTransactions: [],
            },
            error: 'Failed to fetch token stats',
        });
    }
}
