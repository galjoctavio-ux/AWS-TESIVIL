import { NextResponse } from 'next/server';
import { adminDb } from '@/lib/firebase-admin';
import { FieldValue } from 'firebase-admin/firestore';

// GET - Fetch remote config
export async function GET() {
    try {
        if (!adminDb) {
            return NextResponse.json({ config: null });
        }

        // Fetch general app config
        const appConfigDoc = await adminDb.collection('remote_config').doc('app_config').get();

        // Fetch token rules separately (used by the app's wallet-service)
        const tokenRulesDoc = await adminDb.collection('remote_config').doc('token_rules').get();

        const config: any = {};

        if (appConfigDoc.exists) {
            Object.assign(config, appConfigDoc.data());
        }

        if (tokenRulesDoc.exists) {
            config.tokenRules = tokenRulesDoc.data();
        }

        return NextResponse.json({ config });
    } catch (error) {
        console.error('Error fetching config:', error);
        return NextResponse.json(
            { error: 'Failed to fetch config', config: null },
            { status: 500 }
        );
    }
}

// POST - Save remote config
export async function POST(request: Request) {
    try {
        const { config } = await request.json();

        if (!config) {
            return NextResponse.json(
                { error: 'Config is required' },
                { status: 400 }
            );
        }

        if (!adminDb) {
            return NextResponse.json(
                { error: 'Database not available' },
                { status: 500 }
            );
        }

        const { tokenRules, ...otherConfig } = config;

        // Save token rules to separate document (used by app's wallet-service)
        if (tokenRules) {
            await adminDb.collection('remote_config').doc('token_rules').set({
                ...tokenRules,
                updatedAt: FieldValue.serverTimestamp(),
            });
        }

        // Save other config
        if (Object.keys(otherConfig).length > 0) {
            await adminDb.collection('remote_config').doc('app_config').set({
                ...otherConfig,
                updatedAt: FieldValue.serverTimestamp(),
            }, { merge: true });
        }

        // Log the action
        await adminDb.collection('admin_logs').add({
            action: 'config_update',
            changes: Object.keys(config),
            tokenRulesUpdated: !!tokenRules,
            adminId: 'system',
            timestamp: FieldValue.serverTimestamp(),
        });

        return NextResponse.json({ success: true });
    } catch (error) {
        console.error('Error saving config:', error);
        return NextResponse.json(
            { error: 'Failed to save config' },
            { status: 500 }
        );
    }
}
