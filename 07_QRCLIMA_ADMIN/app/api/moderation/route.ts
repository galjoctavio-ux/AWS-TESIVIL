import { NextResponse } from 'next/server';
import { getFlaggedContent, moderateContent, adminDb } from '@/lib/firebase-admin';

// GET - Fetch flagged content
export async function GET() {
    try {
        const items = await getFlaggedContent();

        // Enrich with author names if available
        const enrichedItems = await Promise.all(
            items.map(async (item: any) => {
                let authorName = null;
                if (item.authorId && adminDb) {
                    try {
                        const userDoc = await adminDb.collection('users').doc(item.authorId).get();
                        if (userDoc.exists) {
                            authorName = userDoc.data()?.alias || userDoc.data()?.displayName;
                        }
                    } catch (e) {
                        // Ignore errors fetching user
                    }
                }

                return {
                    ...item,
                    authorName,
                    createdAt: item.createdAt?.toDate?.()?.toISOString() || null,
                };
            })
        );

        return NextResponse.json({ items: enrichedItems });
    } catch (error) {
        console.error('Error fetching flagged content:', error);
        return NextResponse.json(
            { error: 'Failed to fetch flagged content', items: [] },
            { status: 500 }
        );
    }
}

// POST - Perform moderation action
export async function POST(request: Request) {
    try {
        const { contentId, contentType, action } = await request.json();

        if (!contentId || !contentType || !action) {
            return NextResponse.json(
                { error: 'Missing required fields' },
                { status: 400 }
            );
        }

        if (!['dismiss', 'delete', 'ban'].includes(action)) {
            return NextResponse.json(
                { error: 'Invalid action' },
                { status: 400 }
            );
        }

        if (!['thread', 'comment'].includes(contentType)) {
            return NextResponse.json(
                { error: 'Invalid content type' },
                { status: 400 }
            );
        }

        const success = await moderateContent(contentId, contentType, action);

        if (success) {
            return NextResponse.json({ success: true });
        } else {
            return NextResponse.json(
                { error: 'Moderation action failed' },
                { status: 500 }
            );
        }
    } catch (error) {
        console.error('Error performing moderation action:', error);
        return NextResponse.json(
            { error: 'Failed to perform moderation action' },
            { status: 500 }
        );
    }
}
