import { doc, getDoc, setDoc, updateDoc, serverTimestamp } from 'firebase/firestore';
import { User } from 'firebase/auth';
import { db } from '../firebaseConfig';

// Tipos de rango según experiencia del técnico
export type UserRank = 'Novato' | 'Técnico' | 'Experto';

// Tipos de suscripción
export type SubscriptionType = 'free' | 'Pro' | 'Pro+';

// Estadísticas del usuario
export interface UserStats {
    servicesCount: number;
    qrsActive: number;
    sosSolved: number;
    trainingCompleted: number;
}

// Interface completa según master_plan.md (Capítulo 4: Esquema de Datos)

// PDF Branding Configuration (PRO only)
export interface BrandingConfig {
    logoURL?: string;               // Custom logo URL (stored in Firebase Storage)
    primaryColor?: string;          // Hex color e.g. "#FF5500"
    secondaryColor?: string;        // Hex color for accents
    footerText?: string;            // Custom footer ("Mi Empresa - Tel: 555-1234")
    showQRclimaWatermark?: boolean; // Default true, PRO+ can hide
}

export interface UserProfile {
    // Identidad
    email: string | null;
    fullName?: string;                // Nombre real para reportes oficiales
    alias: string;                    // Nombre público único (visible en bitácoras)
    businessName?: string;            // Nombre de empresa (opcional, privado)
    city: string;                     // Ciudad base (para BTU y precios)
    photoURL?: string;                // URL de foto de perfil (redimensionada)
    signature?: string;               // Firma digital (Base64)

    // Niveles y progreso
    rank: UserRank;                   // Novato < 2 años, Técnico > 2 años, Pro = suscriptor
    experienceYears: number;          // Años de experiencia
    profileCompletenessScore: number; // 0-100 (influye acceso a funciones PRO)

    // Estado
    role: 'technician' | 'admin';
    subscription: SubscriptionType;
    subscriptionEndDate?: any;
    emailVerified?: boolean;          // Email verificado via Resend
    emailVerifiedAt?: any;            // Timestamp de verificación
    isOnboarded: boolean;             // Ha completado el wizard inicial
    eligibleForDirectory: boolean;    // Flag manual de admin

    // Estadísticas de carrera (Lifetime Stats)
    stats: UserStats;

    // Economía de Tokens
    tokenBalance?: number;            // Balance de tokens (calculado desde wallet ledger)

    // PDF Branding (PRO only)
    branding?: BrandingConfig;

    // Legal (Aceptación obligatoria)
    termsAcceptedAt?: any;
    privacyAcceptedAt?: any;
    disclaimerAcceptedAt?: any;

    // Timestamps
    createdAt: any;
    updatedAt?: any;

    // AGENDA v1.0.0 - Base Location for Route Optimization
    baseLat?: number;            // Technician's home base latitude
    baseLng?: number;            // Technician's home base longitude

    // NOTIFICACIONES
    fcmToken?: string;
    fcmTokenUpdatedAt?: any;
    notificationPreferences?: {
        maintenanceReminders: boolean;
        appointmentReminders: boolean;
        sosReplies: boolean;
        walletUpdates: boolean;
        storeOrders: boolean;
    };
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
 * Novato < 2 años, Técnico 2-5 años, Experto > 5 años
 */
export const calculateRank = (experienceYears: number): UserRank => {
    if (experienceYears >= 5) return 'Experto';
    if (experienceYears >= 2) return 'Técnico';
    return 'Novato';
};

/**
 * Verifica si el usuario tiene suscripción PRO activa Y no expirada
 * DOBLE VALIDACIÓN: verifica tipo de suscripción + fecha de expiración
 */
export const isUserPro = (profile: UserProfile | null): boolean => {
    if (!profile) return false;

    // Verificar si tiene suscripción activa
    if (profile.subscription !== 'Pro' && profile.subscription !== 'Pro+') {
        return false;
    }

    // Verificar si la suscripción NO ha expirado
    if (profile.subscriptionEndDate) {
        const endDate = profile.subscriptionEndDate.toDate
            ? profile.subscriptionEndDate.toDate()
            : new Date(profile.subscriptionEndDate);

        if (endDate < new Date()) {
            // La suscripción expiró
            console.log('Suscripción expirada para usuario, acceso denegado');
            return false;
        }
    }

    return true;
};

/**
 * Expira la suscripción de un usuario (regresa a free)
 */
export const expireSubscription = async (userId: string): Promise<boolean> => {
    try {
        await updateUserProfile(userId, {
            subscription: 'free',
            subscriptionEndDate: null
        });
        console.log('Suscripción expirada para usuario:', userId);
        return true;
    } catch (error) {
        console.error('Error expirando suscripción:', error);
        return false;
    }
};

/**
 * Verifica y expira la suscripción si es necesario
 * Llamar cuando el usuario abre la app o accede a función PRO
 */
export const checkAndExpireSubscription = async (userId: string): Promise<boolean> => {
    try {
        const profile = await getUserProfile(userId);
        if (!profile) return false;

        // Si no tiene suscripción PRO, no hacer nada
        if (profile.subscription === 'free') return false;

        // Verificar fecha de expiración
        if (profile.subscriptionEndDate) {
            const endDate = profile.subscriptionEndDate.toDate
                ? profile.subscriptionEndDate.toDate()
                : new Date(profile.subscriptionEndDate);

            if (endDate < new Date()) {
                // La suscripción expiró - actualizar a free
                await expireSubscription(userId);
                return true; // Indica que SI se expiró
            }
        }

        return false; // No se expiró
    } catch (error) {
        console.error('Error verificando expiración:', error);
        return false;
    }
};

/**
 * Activa la suscripción PRO para un usuario
 */
export const activateProSubscription = async (
    userId: string,
    tier: 'Pro' | 'Pro+',
    durationDays: number
): Promise<boolean> => {
    const endDate = new Date();
    endDate.setDate(endDate.getDate() + durationDays);

    return updateUserProfile(userId, {
        subscription: tier,
        subscriptionEndDate: endDate
    });
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
        fullName: string;
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

