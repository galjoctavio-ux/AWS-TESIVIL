import { NextResponse } from 'next/server';
import { adminDb } from '@/lib/firebase-admin';
import { cookies } from 'next/headers';

export async function POST() {
    try {
        const cookieStore = cookies();
        const sessionCookie = cookieStore.get('admin_session');

        // Log logout action
        if (sessionCookie?.value && adminDb) {
            const sessionData = JSON.parse(sessionCookie.value);
            await adminDb.collection('admin_logs').add({
                action: 'admin_logout',
                adminId: sessionData.uid,
                adminEmail: sessionData.email,
                timestamp: new Date(),
            });
        }

        // Create response and clear cookie
        const response = NextResponse.json({ success: true });

        response.cookies.set('admin_session', '', {
            httpOnly: true,
            secure: process.env.NODE_ENV === 'production',
            sameSite: 'lax',
            maxAge: 0,
            path: '/',
        });

        return response;
    } catch (error) {
        console.error('Logout error:', error);
        return NextResponse.json({ success: false }, { status: 500 });
    }
}
