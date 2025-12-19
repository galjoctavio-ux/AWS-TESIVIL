import { NextResponse } from 'next/server';
import { getGlobalStats, getPendingOrders, getFlaggedContent } from '@/lib/firebase-admin';

export async function GET() {
    try {
        const [stats, recentOrders, flaggedContent] = await Promise.all([
            getGlobalStats(),
            getPendingOrders(),
            getFlaggedContent(),
        ]);

        return NextResponse.json({
            stats: stats || {
                totalUsers: 0,
                proUsers: 0,
                servicesThisMonth: 0,
                tokenFloat: 0,
                pendingOrders: 0,
            },
            recentOrders: recentOrders?.slice(0, 5) || [],
            flaggedContent: flaggedContent?.slice(0, 5) || [],
        });
    } catch (error) {
        console.error('Error fetching dashboard stats:', error);
        return NextResponse.json(
            { error: 'Failed to fetch stats', message: String(error) },
            { status: 500 }
        );
    }
}
