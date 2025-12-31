import { NextResponse } from 'next/server';
import { cookies } from 'next/headers';

export async function GET() {
    try {
        const cookieStore = cookies();
        const sessionCookie = cookieStore.get('admin_session');

        if (!sessionCookie?.value) {
            return NextResponse.json({ user: null });
        }

        const sessionData = JSON.parse(sessionCookie.value);

        // Check if session is expired (7 days)
        const expirationTime = sessionData.createdAt + (60 * 60 * 24 * 7 * 1000);
        if (Date.now() > expirationTime) {
            return NextResponse.json({ user: null });
        }

        return NextResponse.json({
            user: {
                uid: sessionData.uid,
                email: sessionData.email,
            },
        });
    } catch (error) {
        console.error('Session check error:', error);
        return NextResponse.json({ user: null });
    }
}
