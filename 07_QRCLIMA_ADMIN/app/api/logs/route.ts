import { NextResponse } from 'next/server';
import { adminDb } from '@/lib/firebase-admin';

export async function GET(request: Request) {
    try {
        const { searchParams } = new URL(request.url);
        const page = parseInt(searchParams.get('page') || '1');
        const limit = parseInt(searchParams.get('limit') || '20');
        const actionFilter = searchParams.get('action');

        if (!adminDb) {
            return NextResponse.json({ logs: [], hasMore: false });
        }

        let query = adminDb.collection('admin_logs')
            .orderBy('timestamp', 'desc');

        if (actionFilter && actionFilter !== 'all') {
            query = query.where('action', '==', actionFilter);
        }

        // Get one extra to determine if there are more
        const snapshot = await query
            .limit(limit + 1)
            .offset((page - 1) * limit)
            .get();

        const hasMore = snapshot.size > limit;
        const logs = snapshot.docs.slice(0, limit).map((doc) => {
            const data = doc.data();
            return {
                id: doc.id,
                action: data.action,
                adminId: data.adminId,
                adminEmail: data.adminEmail,
                contentId: data.contentId,
                contentType: data.contentType,
                authorId: data.authorId,
                userId: data.userId,
                details: data.details,
                timestamp: data.timestamp?.toDate?.()?.toISOString() || new Date().toISOString(),
                ip: data.ip,
            };
        });

        return NextResponse.json({ logs, hasMore });
    } catch (error) {
        console.error('Error fetching audit logs:', error);
        return NextResponse.json(
            { error: 'Failed to fetch logs', logs: [], hasMore: false },
            { status: 500 }
        );
    }
}
