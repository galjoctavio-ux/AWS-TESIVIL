import React, { createContext, useContext, useEffect, useState, useCallback } from 'react';
import { onAuthStateChanged, User, signOut as firebaseSignOut } from 'firebase/auth';
import { auth } from '../firebaseConfig';
import { initializeUserProfile, getUserProfile, checkAndExpireSubscription } from '../services/user-service';

interface AuthContextType {
    user: User | null;
    loading: boolean;
    emailVerified: boolean | null;
    isOnboarded: boolean | null;
    checkingOnboarding: boolean;
    signOut: () => Promise<void>;
    refreshOnboardingStatus: () => Promise<void>;
    refreshUserProfile: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType>({
    user: null,
    loading: true,
    emailVerified: null,
    isOnboarded: null,
    checkingOnboarding: false,
    signOut: async () => { },
    refreshOnboardingStatus: async () => { },
    refreshUserProfile: async () => { },
});

export const useAuth = () => useContext(AuthContext);

export function AuthProvider({ children }: { children: React.ReactNode }) {
    const [user, setUser] = useState<User | null>(null);
    const [loading, setLoading] = useState(true);
    const [emailVerified, setEmailVerified] = useState<boolean | null>(null);
    const [isOnboarded, setIsOnboarded] = useState<boolean | null>(null);
    const [checkingOnboarding, setCheckingOnboarding] = useState(false);

    // Función para verificar el estado del perfil (email verified + onboarding)
    const checkUserProfileStatus = useCallback(async (userId: string) => {
        setCheckingOnboarding(true);
        try {
            const profile = await getUserProfile(userId);
            const verified = profile?.emailVerified ?? false;
            const onboarded = profile?.isOnboarded ?? false;

            console.log('Profile status checked - emailVerified:', verified, 'isOnboarded:', onboarded);

            setEmailVerified(verified);
            setIsOnboarded(onboarded);
        } catch (error) {
            console.error('Error checking profile status:', error);
            // En caso de error (ej: offline), asumimos valores por defecto
            setEmailVerified(false);
            setIsOnboarded(true);
        } finally {
            setCheckingOnboarding(false);
        }
    }, []);

    // Función pública para refrescar el estado de onboarding
    const refreshOnboardingStatus = useCallback(async () => {
        if (user) {
            await checkUserProfileStatus(user.uid);
        }
    }, [user, checkUserProfileStatus]);

    // Alias para compatibilidad - refrescar perfil completo
    const refreshUserProfile = refreshOnboardingStatus;

    useEffect(() => {
        const unsubscribe = onAuthStateChanged(auth, async (authUser) => {
            console.log('Auth state changed:', authUser ? 'User logged in' : 'User logged out');

            // Set user immediately to unblock UI
            setUser(authUser);
            setLoading(false);

            if (authUser) {
                // IMPORTANT: Wait for profile initialization FIRST
                // This ensures Google users get emailVerified: true set before we check
                try {
                    await initializeUserProfile(authUser);
                } catch (err) {
                    console.error("Error initializing user profile:", err);
                }

                // Check and expire subscription if needed (triple layer protection)
                checkAndExpireSubscription(authUser.uid).then(expired => {
                    if (expired) console.log('Suscripción expirada automáticamente al iniciar app');
                }).catch(err => console.error('Error checking subscription:', err));

                // Check profile status (email verification + onboarding)
                // Now the profile exists with correct emailVerified value
                await checkUserProfileStatus(authUser.uid);
            } else {
                // Reset state when user logs out
                setEmailVerified(null);
                setIsOnboarded(null);
            }
        });

        return unsubscribe;
    }, [checkUserProfileStatus]);

    const signOut = async () => {
        try {
            await firebaseSignOut(auth);
        } catch (error) {
            console.error('Error signing out:', error);
        }
    };

    return (
        <AuthContext.Provider value={{
            user,
            loading,
            emailVerified,
            isOnboarded,
            checkingOnboarding,
            signOut,
            refreshOnboardingStatus,
            refreshUserProfile
        }}>
            {children}
        </AuthContext.Provider>
    );
}
