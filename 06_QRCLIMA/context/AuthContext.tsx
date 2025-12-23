import React, { createContext, useContext, useEffect, useState, useCallback } from 'react';
import { onAuthStateChanged, User, signOut as firebaseSignOut } from 'firebase/auth';
import { auth } from '../firebaseConfig';
import { initializeUserProfile, getUserProfile } from '../services/user-service';

interface AuthContextType {
    user: User | null;
    loading: boolean;
    isOnboarded: boolean | null;
    checkingOnboarding: boolean;
    signOut: () => Promise<void>;
    refreshOnboardingStatus: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType>({
    user: null,
    loading: true,
    isOnboarded: null,
    checkingOnboarding: false,
    signOut: async () => { },
    refreshOnboardingStatus: async () => { },
});

export const useAuth = () => useContext(AuthContext);

export function AuthProvider({ children }: { children: React.ReactNode }) {
    const [user, setUser] = useState<User | null>(null);
    const [loading, setLoading] = useState(true);
    const [isOnboarded, setIsOnboarded] = useState<boolean | null>(null);
    const [checkingOnboarding, setCheckingOnboarding] = useState(false);

    // Función para verificar el estado de onboarding
    const checkOnboardingStatus = useCallback(async (userId: string) => {
        setCheckingOnboarding(true);
        try {
            const profile = await getUserProfile(userId);
            const onboarded = profile?.isOnboarded ?? false;
            console.log('Onboarding status checked:', onboarded);
            setIsOnboarded(onboarded);
        } catch (error) {
            console.error('Error checking onboarding status:', error);
            // En caso de error (ej: offline), asumimos que sí está onboarded
            setIsOnboarded(true);
        } finally {
            setCheckingOnboarding(false);
        }
    }, []);

    // Función pública para refrescar el estado de onboarding
    const refreshOnboardingStatus = useCallback(async () => {
        if (user) {
            await checkOnboardingStatus(user.uid);
        }
    }, [user, checkOnboardingStatus]);

    useEffect(() => {
        const unsubscribe = onAuthStateChanged(auth, async (authUser) => {
            console.log('Auth state changed:', authUser ? 'User logged in' : 'User logged out');

            // Set user immediately to unblock UI
            setUser(authUser);
            setLoading(false);

            if (authUser) {
                // Initialize profile in background
                initializeUserProfile(authUser).catch(err =>
                    console.error("Error initializing user profile:", err)
                );
                // Check onboarding status
                await checkOnboardingStatus(authUser.uid);
            } else {
                // Reset onboarding state when user logs out
                setIsOnboarded(null);
            }
        });

        return unsubscribe;
    }, [checkOnboardingStatus]);

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
            isOnboarded,
            checkingOnboarding,
            signOut,
            refreshOnboardingStatus
        }}>
            {children}
        </AuthContext.Provider>
    );
}
