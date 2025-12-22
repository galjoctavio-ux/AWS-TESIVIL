import { createClient } from '@supabase/supabase-js';
import AsyncStorage from '@react-native-async-storage/async-storage';
import * as AuthSession from 'expo-auth-session';
import * as WebBrowser from 'expo-web-browser';

// Complete any pending auth sessions
WebBrowser.maybeCompleteAuthSession();

// Storage adapter for React Native using AsyncStorage (compatible with Expo Go)
const asyncStorageAdapter = {
    getItem: async (key: string) => {
        const value = await AsyncStorage.getItem(key);
        return value ?? null;
    },
    setItem: async (key: string, value: string) => {
        await AsyncStorage.setItem(key, value);
    },
    removeItem: async (key: string) => {
        await AsyncStorage.removeItem(key);
    },
};

// Environment variables (set in app.json or .env)
const SUPABASE_URL = process.env.EXPO_PUBLIC_SUPABASE_URL || '';
const SUPABASE_ANON_KEY = process.env.EXPO_PUBLIC_SUPABASE_ANON_KEY || '';

if (!SUPABASE_URL || !SUPABASE_ANON_KEY) {
    console.warn('⚠️ Supabase credentials not set. Please configure EXPO_PUBLIC_SUPABASE_URL and EXPO_PUBLIC_SUPABASE_ANON_KEY');
}

// Create Supabase client
export const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY, {
    auth: {
        storage: asyncStorageAdapter,
        autoRefreshToken: true,
        persistSession: true,
        detectSessionInUrl: false, // Required for React Native
    },
});

// ═══════════════════════════════════════════════════════════════
// AUTH HELPERS
// ═══════════════════════════════════════════════════════════════

export async function signInWithEmail(email: string, password: string) {
    const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password,
    });
    return { data, error };
}

export async function signUpWithEmail(email: string, password: string) {
    const { data, error } = await supabase.auth.signUp({
        email,
        password,
    });
    return { data, error };
}

export async function signInWithMagicLink(email: string) {
    const { data, error } = await supabase.auth.signInWithOtp({
        email,
        options: {
            emailRedirectTo: 'synapse://auth/callback',
        },
    });
    return { data, error };
}

export async function signOut() {
    const { error } = await supabase.auth.signOut();
    return { error };
}

export async function getCurrentUser() {
    const { data: { user } } = await supabase.auth.getUser();
    return user;
}

export async function getSession() {
    const { data: { session } } = await supabase.auth.getSession();
    return session;
}

/**
 * Sign in with Google using OAuth
 * Uses expo-auth-session for the OAuth flow
 */
export async function signInWithGoogle() {
    try {
        // Create redirect URI for Expo
        // In Expo Go, this creates an appropriate redirect URI
        const redirectUri = AuthSession.makeRedirectUri({
            // For native builds use the scheme
            native: 'synapse://auth/callback',
        });

        console.log('Google Sign-In redirect URI:', redirectUri);

        // Start OAuth flow with Supabase
        const { data, error } = await supabase.auth.signInWithOAuth({
            provider: 'google',
            options: {
                redirectTo: redirectUri,
                skipBrowserRedirect: true,
                queryParams: {
                    access_type: 'offline',
                    prompt: 'consent',
                },
            },
        });

        if (error) {
            console.error('Supabase OAuth error:', error);
            return { data: null, error };
        }

        if (!data.url) {
            return { data: null, error: new Error('No authorization URL received') };
        }

        console.log('Opening browser for Google auth...');

        // Open browser for OAuth
        const result = await WebBrowser.openAuthSessionAsync(
            data.url,
            redirectUri,
        );

        console.log('Browser result:', result.type);

        if (result.type === 'success') {
            const url = new URL(result.url);

            // Check for access_token in hash (implicit flow)
            const hashParams = new URLSearchParams(url.hash.substring(1));
            const accessToken = hashParams.get('access_token');
            const refreshToken = hashParams.get('refresh_token');

            if (accessToken) {
                // Set session with tokens from hash
                const { data: sessionData, error: sessionError } =
                    await supabase.auth.setSession({
                        access_token: accessToken,
                        refresh_token: refreshToken || '',
                    });

                if (sessionError) {
                    console.error('Session error:', sessionError);
                    return { data: null, error: sessionError };
                }

                return { data: sessionData, error: null };
            }

            // Check for code in query params (PKCE flow)
            const code = url.searchParams.get('code');

            if (code) {
                const { data: sessionData, error: sessionError } =
                    await supabase.auth.exchangeCodeForSession(code);

                if (sessionError) {
                    console.error('Code exchange error:', sessionError);
                    return { data: null, error: sessionError };
                }

                return { data: sessionData, error: null };
            }

            // Check for error
            const errorParam = url.searchParams.get('error');
            if (errorParam) {
                const errorDescription = url.searchParams.get('error_description');
                return { data: null, error: new Error(errorDescription || errorParam) };
            }
        }

        if (result.type === 'cancel' || result.type === 'dismiss') {
            return { data: null, error: new Error('Authentication cancelled') };
        }

        return { data: null, error: new Error('Authentication failed') };
    } catch (error: any) {
        console.error('Google Sign-In error:', error);
        return { data: null, error };
    }
}

// ═══════════════════════════════════════════════════════════════
// PROFILE HELPERS
// ═══════════════════════════════════════════════════════════════

export async function getProfile(userId: string) {
    const { data, error } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', userId)
        .single();
    return { data, error };
}

export async function updateProfile(userId: string, updates: Partial<{
    alias: string;
    photo_url: string;
}>) {
    const { data, error } = await supabase
        .from('profiles')
        .update(updates)
        .eq('id', userId)
        .select()
        .single();
    return { data, error };
}

// ═══════════════════════════════════════════════════════════════
// STORAGE HELPERS
// ═══════════════════════════════════════════════════════════════

/**
 * Upload an image to Supabase Storage for projects
 * @param uri Local file URI (from ImagePicker)
 * @param folder Folder name (e.g., 'projects', 'profiles')
 * @returns Public URL of the uploaded image
 */
export async function uploadImage(uri: string, folder: string = 'projects'): Promise<string | null> {
    try {
        // Generate unique filename
        const timestamp = Date.now();
        const randomId = Math.random().toString(36).substring(7);
        const extension = uri.split('.').pop() || 'jpg';
        const fileName = `${folder}/${timestamp}_${randomId}.${extension}`;

        // Fetch the file from local URI
        const response = await fetch(uri);
        const blob = await response.blob();

        // Convert blob to ArrayBuffer
        const arrayBuffer = await new Response(blob).arrayBuffer();

        // Upload to Supabase Storage
        const { data, error } = await supabase.storage
            .from('uploads')
            .upload(fileName, arrayBuffer, {
                contentType: blob.type || 'image/jpeg',
                upsert: false,
            });

        if (error) {
            console.error('Upload error:', error);
            return null;
        }

        // Get public URL
        const { data: urlData } = supabase.storage
            .from('uploads')
            .getPublicUrl(data.path);

        return urlData.publicUrl;
    } catch (error) {
        console.error('Upload image error:', error);
        return null;
    }
}

/**
 * Upload multiple images
 * @param uris Array of local file URIs
 * @param folder Folder name
 * @returns Array of public URLs (nulls filtered out)
 */
export async function uploadMultipleImages(uris: string[], folder: string = 'projects'): Promise<string[]> {
    const uploadPromises = uris.map(uri => uploadImage(uri, folder));
    const results = await Promise.all(uploadPromises);
    return results.filter((url): url is string => url !== null);
}

export default supabase;
