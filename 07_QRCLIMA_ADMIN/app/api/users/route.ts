import { NextResponse } from 'next/server';
import { adminDb } from '@/lib/firebase-admin';
import { FieldValue } from 'firebase-admin/firestore';

// GET - Fetch users with pagination
export async function GET(request: Request) {
    try {
        const { searchParams } = new URL(request.url);
        const limitCount = parseInt(searchParams.get('limit') || '50');

        if (!adminDb) {
            return NextResponse.json({ users: [] });
        }

        const snapshot = await adminDb.collection('users')
            .limit(limitCount)
            .get();

        const users = snapshot.docs.map((doc) => {
            const data = doc.data();
            return {
                id: doc.id,
                alias: data.alias || null,
                displayName: data.fullName || data.displayName || null,
                email: data.email || null,
                rank: data.rank || 'Novato',
                tokenBalance: data.tokenBalance || 0,  // Correct field name
                servicesCount: data.stats?.servicesCount || 0,
                is_premium: data.subscription === 'Pro' || data.subscription === 'Pro+',
                is_banned: data.is_banned || false,
                eligible_for_directory: data.eligibleForDirectory || false,
                city: data.city || null,
                photoURL: data.photoURL || null,  // Profile photo
                createdAt: data.createdAt?.toDate?.()?.toISOString() || null,
            };
        });

        return NextResponse.json({ users });
    } catch (error) {
        console.error('Error fetching users:', error);
        return NextResponse.json(
            { error: 'Failed to fetch users', users: [] },
            { status: 500 }
        );
    }
}

// PATCH - Update user
export async function PATCH(request: Request) {
    try {
        const { userId, updates } = await request.json();

        if (!userId) {
            return NextResponse.json(
                { error: 'User ID is required' },
                { status: 400 }
            );
        }

        if (!adminDb) {
            return NextResponse.json(
                { error: 'Database not available' },
                { status: 500 }
            );
        }

        // Map admin panel fields to app fields
        const firestoreUpdates: any = {
            updatedAt: FieldValue.serverTimestamp(),
        };

        if (updates.is_premium !== undefined) {
            firestoreUpdates.subscription = updates.is_premium ? 'Pro' : 'free';
            if (updates.is_premium) {
                // Grant 30 days of PRO
                const endDate = new Date();
                endDate.setDate(endDate.getDate() + 30);
                firestoreUpdates.subscriptionEndDate = endDate;
            }
        }

        if (updates.is_banned !== undefined) {
            firestoreUpdates.is_banned = updates.is_banned;
        }

        if (updates.eligible_for_directory !== undefined) {
            firestoreUpdates.eligibleForDirectory = updates.eligible_for_directory;
        }

        await adminDb.collection('users').doc(userId).update(firestoreUpdates);

        // Log the action
        await adminDb.collection('admin_logs').add({
            action: 'user_update',
            userId,
            updates: Object.keys(updates),
            adminId: 'system',
            timestamp: FieldValue.serverTimestamp(),
        });

        return NextResponse.json({ success: true });
    } catch (error) {
        console.error('Error updating user:', error);
        return NextResponse.json(
            { error: 'Failed to update user' },
            { status: 500 }
        );
    }
}
