import { NextResponse } from 'next/server';
import { adminDb } from '@/lib/firebase-admin';

export async function POST(request: Request) {
    try {
        const { email, password } = await request.json();

        if (!email || !password) {
            return NextResponse.json(
                { success: false, error: 'Email y contraseña son requeridos' },
                { status: 400 }
            );
        }

        // Verify admin email is in allowed list
        const adminEmails = process.env.ADMIN_EMAILS?.split(',').map(e => e.trim().toLowerCase()) || [];

        if (!adminEmails.includes(email.toLowerCase())) {
            return NextResponse.json(
                { success: false, error: 'No tienes permisos de administrador' },
                { status: 403 }
            );
        }

        // Verify password against fixed admin password
        const adminPassword = process.env.ADMIN_PASSWORD;

        if (!adminPassword) {
            console.error('ADMIN_PASSWORD not configured in .env.local');
            return NextResponse.json(
                { success: false, error: 'Sistema no configurado correctamente' },
                { status: 500 }
            );
        }

        if (password !== adminPassword) {
            return NextResponse.json(
                { success: false, error: 'Contraseña incorrecta' },
                { status: 401 }
            );
        }

        // Generate a simple user ID from email
        const uid = Buffer.from(email.toLowerCase()).toString('base64').replace(/[=]/g, '');

        // Create session cookie (valid for 7 days)
        const sessionData = {
            uid,
            email: email.toLowerCase(),
            isAdmin: true,
            createdAt: Date.now(),
        };

        // Log admin login
        if (adminDb) {
            try {
                await adminDb.collection('admin_logs').add({
                    action: 'admin_login',
                    adminId: uid,
                    adminEmail: email,
                    timestamp: new Date(),
                    ip: request.headers.get('x-forwarded-for') || 'unknown',
                });
            } catch (logError) {
                console.error('Error logging admin login:', logError);
            }
        }

        // Create response with session cookie
        const response = NextResponse.json({
            success: true,
            user: {
                uid,
                email: email.toLowerCase(),
            },
        });

        // Set session cookie
        response.cookies.set('admin_session', JSON.stringify(sessionData), {
            httpOnly: true,
            secure: process.env.NODE_ENV === 'production',
            sameSite: 'lax',
            maxAge: 60 * 60 * 24 * 7, // 7 days
            path: '/',
        });

        return response;
    } catch (error: any) {
        console.error('Login error:', error);
        return NextResponse.json(
            { success: false, error: 'Error de autenticación' },
            { status: 500 }
        );
    }
}
