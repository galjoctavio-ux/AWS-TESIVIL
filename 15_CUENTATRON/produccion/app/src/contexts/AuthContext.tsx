/**
 * Authentication Context
 * Cuentatron MVP
 * 
 * Provides auth state and methods across the app
 * Referencia: modulo_01_auth_onboarding
 */

import React, { createContext, useContext, useEffect, useState, ReactNode } from 'react';
import { Session, User } from '@supabase/supabase-js';
import { supabase, Usuario } from '../lib/supabase';

// Auth Context Type
interface AuthContextType {
    // State
    session: Session | null;
    user: User | null;
    profile: Usuario | null;
    loading: boolean;

    // Auth Methods
    signInWithGoogle: () => Promise<void>;
    signInWithEmail: (email: string) => Promise<{ error: Error | null }>;
    verifyOTP: (email: string, token: string) => Promise<{ error: Error | null }>;
    signOut: () => Promise<void>;

    // Profile Methods
    updateProfile: (data: Partial<Usuario>) => Promise<{ error: Error | null }>;
    refreshProfile: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

// Provider Props
interface AuthProviderProps {
    children: ReactNode;
}

export function AuthProvider({ children }: AuthProviderProps) {
    const [session, setSession] = useState<Session | null>(null);
    const [user, setUser] = useState<User | null>(null);
    const [profile, setProfile] = useState<Usuario | null>(null);
    const [loading, setLoading] = useState(true);

    // Initialize auth state
    useEffect(() => {
        // Get current session
        supabase.auth.getSession().then(({ data: { session } }) => {
            setSession(session);
            setUser(session?.user ?? null);
            if (session?.user) {
                fetchProfile(session.user.id);
            } else {
                setLoading(false);
            }
        });

        // Listen for auth changes
        const { data: { subscription } } = supabase.auth.onAuthStateChange(
            async (_event, session) => {
                setSession(session);
                setUser(session?.user ?? null);
                if (session?.user) {
                    await fetchProfile(session.user.id);
                } else {
                    setProfile(null);
                }
            }
        );

        return () => subscription.unsubscribe();
    }, []);

    // Fetch user profile from database
    async function fetchProfile(userId: string) {
        try {
            const { data, error } = await supabase
                .from('usuarios')
                .select('*')
                .eq('id', userId)
                .single();

            if (error) throw error;
            setProfile(data);
        } catch (error) {
            console.error('Error fetching profile:', error);
        } finally {
            setLoading(false);
        }
    }

    // Refresh profile data
    async function refreshProfile() {
        if (user) {
            await fetchProfile(user.id);
        }
    }

    // Sign in with Google
    async function signInWithGoogle() {
        const { error } = await supabase.auth.signInWithOAuth({
            provider: 'google',
            options: {
                redirectTo: 'cuentatron://auth/callback',
            },
        });
        if (error) throw error;
    }

    // Sign in with Email (sends OTP code)
    async function signInWithEmail(email: string): Promise<{ error: Error | null }> {
        try {
            const { error } = await supabase.auth.signInWithOtp({
                email,
                options: {
                    shouldCreateUser: true,
                },
            });
            return { error: error ? new Error(error.message) : null };
        } catch (err) {
            return { error: err as Error };
        }
    }

    // Verify OTP code (signup token from signInWithOtp)
    async function verifyOTP(email: string, token: string): Promise<{ error: Error | null }> {
        try {
            // Use 'signup' type for tokens sent via signInWithOtp with shouldCreateUser: true
            const { error } = await supabase.auth.verifyOtp({
                email,
                token,
                type: 'signup',
            });
            return { error: error ? new Error(error.message) : null };
        } catch (err) {
            return { error: err as Error };
        }
    }

    // Sign out
    async function signOut() {
        const { error } = await supabase.auth.signOut();
        if (error) throw error;
        setProfile(null);
    }

    // Update user profile
    async function updateProfile(data: Partial<Usuario>): Promise<{ error: Error | null }> {
        if (!user) return { error: new Error('No user logged in') };

        try {
            const { error } = await supabase
                .from('usuarios')
                .update(data)
                .eq('id', user.id);

            if (error) throw error;

            // Refresh profile after update
            await refreshProfile();
            return { error: null };
        } catch (err) {
            return { error: err as Error };
        }
    }

    const value: AuthContextType = {
        session,
        user,
        profile,
        loading,
        signInWithGoogle,
        signInWithEmail,
        verifyOTP,
        signOut,
        updateProfile,
        refreshProfile,
    };

    return (
        <AuthContext.Provider value={value}>
            {children}
        </AuthContext.Provider>
    );
}

// Hook to use auth context
export function useAuth() {
    const context = useContext(AuthContext);
    if (context === undefined) {
        throw new Error('useAuth must be used within an AuthProvider');
    }
    return context;
}
