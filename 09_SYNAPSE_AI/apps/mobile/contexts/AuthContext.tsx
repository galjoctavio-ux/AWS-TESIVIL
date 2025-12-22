import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { supabase, getCurrentUser, signInWithEmail, signUpWithEmail, signOut as supabaseSignOut, signInWithGoogle } from '@/lib/supabase';
import { User, Session } from '@supabase/supabase-js';

interface AuthContextType {
    user: User | null;
    session: Session | null;
    isLoading: boolean;
    isAuthenticated: boolean;
    signIn: (email: string, password: string) => Promise<{ success: boolean; error?: string }>;
    signUp: (email: string, password: string) => Promise<{ success: boolean; error?: string }>;
    signInWithGoogleHandler: () => Promise<{ success: boolean; error?: string }>;
    signOut: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

interface AuthProviderProps {
    children: ReactNode;
}

export function AuthProvider({ children }: AuthProviderProps) {
    const [user, setUser] = useState<User | null>(null);
    const [session, setSession] = useState<Session | null>(null);
    const [isLoading, setIsLoading] = useState(true);

    useEffect(() => {
        // Check for existing session
        checkSession();

        // Listen for auth changes
        const { data: { subscription } } = supabase.auth.onAuthStateChange(
            async (event, session) => {
                console.log('Auth state changed:', event);
                setSession(session);
                setUser(session?.user ?? null);
                setIsLoading(false);
            }
        );

        return () => {
            subscription.unsubscribe();
        };
    }, []);

    const checkSession = async () => {
        try {
            const { data: { session } } = await supabase.auth.getSession();
            setSession(session);
            setUser(session?.user ?? null);
        } catch (error) {
            console.error('Error checking session:', error);
        } finally {
            setIsLoading(false);
        }
    };

    const signIn = async (email: string, password: string): Promise<{ success: boolean; error?: string }> => {
        try {
            const { data, error } = await signInWithEmail(email, password);
            if (error) {
                return { success: false, error: error.message };
            }
            return { success: true };
        } catch (error: any) {
            return { success: false, error: error.message || 'Error al iniciar sesión' };
        }
    };

    const signUp = async (email: string, password: string): Promise<{ success: boolean; error?: string }> => {
        try {
            const { data, error } = await signUpWithEmail(email, password);
            if (error) {
                return { success: false, error: error.message };
            }
            // Check if email confirmation is required
            if (data.user && !data.session) {
                return { success: true, error: 'Revisa tu correo para confirmar tu cuenta' };
            }
            return { success: true };
        } catch (error: any) {
            return { success: false, error: error.message || 'Error al registrar' };
        }
    };

    const signInWithGoogleHandler = async (): Promise<{ success: boolean; error?: string }> => {
        try {
            const { data, error } = await signInWithGoogle();
            if (error) {
                return { success: false, error: error.message };
            }
            return { success: true };
        } catch (error: any) {
            return { success: false, error: error.message || 'Error al iniciar sesión con Google' };
        }
    };

    const signOut = async (): Promise<void> => {
        try {
            await supabaseSignOut();
            setUser(null);
            setSession(null);
        } catch (error) {
            console.error('Error signing out:', error);
        }
    };

    const isAuthenticated = !!user;

    return (
        <AuthContext.Provider
            value={{
                user,
                session,
                isLoading,
                isAuthenticated,
                signIn,
                signUp,
                signInWithGoogleHandler,
                signOut,
            }}
        >
            {children}
        </AuthContext.Provider>
    );
}

export function useAuth() {
    const context = useContext(AuthContext);
    if (context === undefined) {
        throw new Error('useAuth must be used within an AuthProvider');
    }
    return context;
}
