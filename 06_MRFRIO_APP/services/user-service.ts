import { doc, getDoc, setDoc, updateDoc, serverTimestamp } from 'firebase/firestore';
import { User } from 'firebase/auth';
import { db } from '../firebaseConfig';

// Tipos de rango según master_plan.md
export type UserRank = 'Novato' | 'Técnico' | 'Pro';

// Estadísticas del usuario
export interface UserStats {
    servicesCount: number;
    qrsActive: number;
    sosSolved: number;
    trainingCompleted: number;
}

// Interface completa según master_plan.md (Capítulo 4: Esquema de Datos)
export interface UserProfile {
    // Identidad
    email: string | null;
    alias: string;                    // Nombre público único (visible en bitácoras)
    businessName?: string;            // Nombre de empresa (opcional, privado)
    city: string;                     // Ciudad base (para BTU y precios)

    // Niveles y progreso
    rank: UserRank;                   // Novato < 2 años, Técnico > 2 años, Pro = suscriptor
    experienceYears: number;          // Años de experiencia
    profileCompletenessScore: number; // 0-100 (influye acceso a funciones PRO)

    // Estado
    role: 'technician' | 'admin';
    subscription: 'free' | 'premium';
    subscriptionEndDate?: any;
    isOnboarded: boolean;             // Ha completado el wizard inicial
    eligibleForDirectory: boolean;    // Flag manual de admin

    // Estadísticas de carrera (Lifetime Stats)
    stats: UserStats;

    // Legal (Aceptación obligatoria)
    termsAcceptedAt?: any;
    privacyAcceptedAt?: any;
    disclaimerAcceptedAt?: any;

    // Timestamps
    createdAt: any;
    updatedAt?: any;
}

// Perfil por defecto para usuarios nuevos
const DEFAULT_STATS: UserStats = {
    servicesCount: 0,
    qrsActive: 0,
    sosSolved: 0,
    trainingCompleted: 0,
};

/**
 * Calcula el porcentaje de completitud del perfil (0-100)
 * Basado en los campos requeridos según master_plan.md
 */
export const calculateProfileCompleteness = (profile: Partial<UserProfile>): number => {
    const fields = [
        { key: 'alias', weight: 25 },
        { key: 'city', weight: 20 },
        { key: 'experienceYears', weight: 15 },
        { key: 'businessName', weight: 10 },
        { key: 'termsAcceptedAt', weight: 15 },
        { key: 'privacyAcceptedAt', weight: 15 },
    ];

    let score = 0;
    for (const field of fields) {
        const value = profile[field.key as keyof UserProfile];
        if (value !== undefined && value !== null && value !== '') {
            score += field.weight;
        }
    }

    return Math.min(score, 100);
};

/**
 * Determina el rango basado en años de experiencia
 * Según master_plan.md: Novato < 2 años, Técnico >= 2 años
 */
export const calculateRank = (experienceYears: number, isPremium: boolean = false): UserRank => {
    if (isPremium) return 'Pro';
    if (experienceYears >= 2) return 'Técnico';
    return 'Novato';
};

/**
 * Inicializa perfil de usuario en Firestore.
 * Crea un perfil básico marcado como no-onboarded.
 */
export const initializeUserProfile = async (user: User): Promise<boolean> => {
    if (!user) return false;

    try {
        const userRef = doc(db, 'users', user.uid);
        const userSnap = await getDoc(userRef);

        if (!userSnap.exists()) {
            const newUserProfile: UserProfile = {
                email: user.email,
                alias: '',
                city: '',
                rank: 'Novato',
                experienceYears: 0,
                profileCompletenessScore: 0,
                role: 'technician',
                subscription: 'free',
                isOnboarded: false,
                eligibleForDirectory: false,
                stats: DEFAULT_STATS,
                createdAt: serverTimestamp(),
            };
            await setDoc(userRef, newUserProfile);
            console.log('User profile created for:', user.email);
        } else {
            console.log('User profile already exists for:', user.email);
        }
        return true;
    } catch (error: any) {
        if (error?.code === 'unavailable' || error?.message?.includes('offline')) {
            console.warn('Firestore offline - profile will be created when connection is restored');
        } else {
            console.error('Error initializing user profile:', error);
        }
        return false;
    }
};

/**
 * Obtiene el perfil del usuario desde Firestore
 */
export const getUserProfile = async (userId: string): Promise<UserProfile | null> => {
    try {
        const userRef = doc(db, 'users', userId);
        const userSnap = await getDoc(userRef);

        if (userSnap.exists()) {
            return userSnap.data() as UserProfile;
        }
        return null;
    } catch (error) {
        console.error('Error fetching user profile:', error);
        return null;
    }
};

/**
 * Verifica si el usuario ha completado el onboarding
 */
export const checkIfUserIsOnboarded = async (userId: string): Promise<boolean> => {
    try {
        const profile = await getUserProfile(userId);
        return profile?.isOnboarded ?? false;
    } catch (error) {
        console.error('Error checking onboarding status:', error);
        return false;
    }
};

/**
 * Actualiza el perfil del usuario
 */
export const updateUserProfile = async (
    userId: string,
    updates: Partial<UserProfile>
): Promise<boolean> => {
    try {
        const userRef = doc(db, 'users', userId);

        // Calcular completitud si hay cambios relevantes
        const currentProfile = await getUserProfile(userId);
        const mergedProfile = { ...currentProfile, ...updates };
        const completenessScore = calculateProfileCompleteness(mergedProfile);

        await updateDoc(userRef, {
            ...updates,
            profileCompletenessScore: completenessScore,
            updatedAt: serverTimestamp(),
        });

        console.log('User profile updated for:', userId);
        return true;
    } catch (error) {
        console.error('Error updating user profile:', error);
        return false;
    }
};

/**
 * Completa el onboarding del usuario
 */
export const completeOnboarding = async (
    userId: string,
    profileData: {
        alias: string;
        city: string;
        businessName?: string;
        experienceYears: number;
    }
): Promise<boolean> => {
    try {
        const rank = calculateRank(profileData.experienceYears);

        const updates: Partial<UserProfile> = {
            ...profileData,
            rank,
            isOnboarded: true,
            termsAcceptedAt: serverTimestamp(),
            privacyAcceptedAt: serverTimestamp(),
        };

        return await updateUserProfile(userId, updates);
    } catch (error) {
        console.error('Error completing onboarding:', error);
        return false;
    }
};

