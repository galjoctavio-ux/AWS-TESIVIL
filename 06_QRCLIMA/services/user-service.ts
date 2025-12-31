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

// Profile Achievements - Logros de primera vez
export interface ProfileAchievements {
    firstClient?: boolean;      // Primer cliente creado
    firstAgenda?: boolean;      // Primera agenda creada  
    firstLabelsPdf?: boolean;   // Primer PDF de etiquetas generado
}

// Criterio individual para guía de perfil
export interface ProfileCriterion {
    id: string;
    label: string;
    description: string;
    weight: number;
    completed: boolean;
    icon: string;
    route?: string;             // Ruta para completar este ítem
    category: 'profile' | 'config' | 'achievement';
}

export interface UserProfile {
    // Identidad
    email: string | null;
    fullName?: string;                // Nombre real para reportes oficiales
    alias: string;                    // Nombre público único (visible en bitácoras)
    businessName?: string;            // Nombre de empresa (opcional, privado)
    city: string;                     // Ciudad base (para BTU y precios)
    phone?: string;                   // Teléfono para contacto en QR público
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
    tokenBoostMultiplier?: number;    // Multiplicador de tokens activo (ej: 1.5x)
    tokenBoostExpiry?: any;           // Fecha de expiración del boost
    lifetimeTokensEarned?: number;    // Total de tokens ganados en toda la historia (para niveles)

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

    // Perfil Completado v2.0 - Nuevos campos
    preferredNavigationApp?: 'google' | 'waze' | 'apple';  // App preferida para navegación
    achievements?: ProfileAchievements;                     // Logros de primera vez

    // Store purchases - PDF unlocks
    pdfUnlocksAvailable?: number;  // Number of PDF unlock credits purchased
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
 * Incluye datos de perfil, configuración y logros de uso
 */
export const calculateProfileCompleteness = (profile: Partial<UserProfile>): number => {
    const criteria = [
        // Datos de Perfil (25% - sin empresa que es opcional)
        { check: !!profile.alias, weight: 5 },
        { check: !!profile.city, weight: 5 },
        { check: (profile.experienceYears || 0) > 0, weight: 5 },
        { check: !!profile.termsAcceptedAt, weight: 5 },
        { check: !!profile.privacyAcceptedAt, weight: 5 },

        // Configuración (20%)
        { check: !!(profile.baseLat && profile.baseLng), weight: 5 },
        { check: !!profile.signature, weight: 5 },
        { check: !!profile.preferredNavigationApp, weight: 5 },
        { check: !!profile.photoURL, weight: 5 },

        // Logros de Uso (55% - aumentado para compensar empresa opcional)
        { check: (profile.stats?.servicesCount || 0) >= 1, weight: 13 },
        { check: (profile.stats?.qrsActive || 0) >= 1, weight: 8 },
        { check: !!profile.achievements?.firstClient, weight: 8 },
        { check: !!profile.achievements?.firstAgenda, weight: 8 },
        { check: !!profile.achievements?.firstLabelsPdf, weight: 6 },
        { check: (profile.stats?.sosSolved || 0) >= 1, weight: 6 },
        { check: (profile.stats?.trainingCompleted || 0) >= 1, weight: 6 },
    ];

    return criteria.reduce((sum, c) => sum + (c.check ? c.weight : 0), 0);
};

/**
 * Obtiene los criterios de completitud con su estado actual
 * Usado para mostrar la guía visual en el perfil
 */
export const getProfileCompletionCriteria = (profile: Partial<UserProfile>): ProfileCriterion[] => {
    return [
        // Datos de Perfil (30%)
        {
            id: 'alias',
            label: 'Nombre de usuario',
            description: 'Configura tu alias público',
            weight: 5,
            completed: !!profile.alias,
            icon: 'person',
            route: '/(app)/profile/settings',
            category: 'profile',
        },
        {
            id: 'city',
            label: 'Ciudad',
            description: 'Indica tu ciudad de trabajo',
            weight: 5,
            completed: !!profile.city,
            icon: 'location',
            route: '/(app)/profile/settings',
            category: 'profile',
        },
        {
            id: 'experience',
            label: 'Años de experiencia',
            description: 'Registra tu experiencia',
            weight: 5,
            completed: (profile.experienceYears || 0) > 0,
            icon: 'trophy',
            route: '/(app)/profile/settings',
            category: 'profile',
        },
        // Nota: businessName (empresa) es opcional y NO cuenta para el 100%
        {
            id: 'terms',
            label: 'Términos aceptados',
            description: 'Acepta los términos de uso',
            weight: 5,
            completed: !!profile.termsAcceptedAt,
            icon: 'document-text',
            category: 'profile',
        },
        {
            id: 'privacy',
            label: 'Privacidad aceptada',
            description: 'Acepta el aviso de privacidad',
            weight: 5,
            completed: !!profile.privacyAcceptedAt,
            icon: 'shield-checkmark',
            category: 'profile',
        },

        // Configuración (20%)
        {
            id: 'baseLocation',
            label: 'Ubicación base',
            description: 'Configura tu punto de partida',
            weight: 5,
            completed: !!(profile.baseLat && profile.baseLng),
            icon: 'home',
            route: '/(app)/profile/settings',
            category: 'config',
        },
        {
            id: 'signature',
            label: 'Firma digital',
            description: 'Crea tu firma para reportes',
            weight: 5,
            completed: !!profile.signature,
            icon: 'create',
            route: '/(app)/profile/signature',
            category: 'config',
        },
        {
            id: 'navApp',
            label: 'App de navegación',
            description: 'Elige Google Maps o Waze',
            weight: 5,
            completed: !!profile.preferredNavigationApp,
            icon: 'navigate',
            route: '/(app)/profile/settings',
            category: 'config',
        },
        {
            id: 'photo',
            label: 'Foto de perfil',
            description: 'Sube una foto profesional',
            weight: 5,
            completed: !!profile.photoURL,
            icon: 'camera',
            category: 'config',
        },

        // Logros de Uso (55% - aumentado para compensar empresa opcional)
        {
            id: 'firstService',
            label: 'Primer servicio',
            description: 'Registra tu primer servicio',
            weight: 13,
            completed: (profile.stats?.servicesCount || 0) >= 1,
            icon: 'construct',
            route: '/(app)/services',
            category: 'achievement',
        },
        {
            id: 'firstQR',
            label: 'Primer QR activo',
            description: 'Da de alta tu primer QR',
            weight: 8,
            completed: (profile.stats?.qrsActive || 0) >= 1,
            icon: 'qr-code',
            route: '/(app)/scanner',
            category: 'achievement',
        },
        {
            id: 'firstClient',
            label: 'Primer cliente',
            description: 'Crea tu primer cliente',
            weight: 8,
            completed: !!profile.achievements?.firstClient,
            icon: 'people',
            route: '/(app)/clients',
            category: 'achievement',
        },
        {
            id: 'firstAgenda',
            label: 'Primera agenda',
            description: 'Agenda tu primera cita',
            weight: 8,
            completed: !!profile.achievements?.firstAgenda,
            icon: 'calendar',
            route: '/(app)/agenda',
            category: 'achievement',
        },
        {
            id: 'firstLabelsPdf',
            label: 'Primer PDF de etiquetas',
            description: 'Genera etiquetas para equipos',
            weight: 6,
            completed: !!profile.achievements?.firstLabelsPdf,
            icon: 'document',
            route: '/(app)/tools/qr-labels',
            category: 'achievement',
        },
        {
            id: 'firstSOS',
            label: 'Caso SOS',
            description: 'Crea o responde un caso SOS',
            weight: 6,
            completed: (profile.stats?.sosSolved || 0) >= 1,
            icon: 'alert-circle',
            route: '/(app)/community',
            category: 'achievement',
        },
        {
            id: 'firstCourse',
            label: 'Curso completado',
            description: 'Completa un curso de capacitación',
            weight: 6,
            completed: (profile.stats?.trainingCompleted || 0) >= 1,
            icon: 'school',
            route: '/(app)/training',
            category: 'achievement',
        },
    ];
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
 * Si ya tiene PRO vigente, SUMA los días a la fecha existente
 */
export const activateProSubscription = async (
    userId: string,
    tier: 'Pro' | 'Pro+',
    durationDays: number
): Promise<boolean> => {
    // Obtener perfil actual para verificar si ya tiene PRO
    const currentProfile = await getUserProfile(userId);
    const now = new Date();
    let endDate: Date;

    // Si ya tiene PRO vigente, sumar días a la fecha existente
    if (currentProfile?.subscriptionEndDate &&
        (currentProfile.subscription === 'Pro' || currentProfile.subscription === 'Pro+')) {
        const existingEnd = currentProfile.subscriptionEndDate.toDate
            ? currentProfile.subscriptionEndDate.toDate()
            : new Date(currentProfile.subscriptionEndDate);

        // Solo sumar si la suscripción no ha expirado
        if (existingEnd > now) {
            endDate = new Date(existingEnd);
            console.log(`📅 Usuario ya tiene PRO hasta ${existingEnd.toLocaleDateString()}, sumando ${durationDays} días`);
        } else {
            endDate = now;
        }
    } else {
        endDate = now;
    }

    endDate.setDate(endDate.getDate() + durationDays);
    console.log(`✅ PRO ${tier} activado hasta ${endDate.toLocaleDateString()}`);

    return updateUserProfile(userId, {
        subscription: tier,
        subscriptionEndDate: endDate
    });
};

/**
 * Inicializa perfil de usuario en Firestore.
 * Crea un perfil básico marcado como no-onboarded.
 * Google Sign-In users get emailVerified: true automatically.
 */
export const initializeUserProfile = async (user: User): Promise<boolean> => {
    if (!user) return false;

    try {
        const userRef = doc(db, 'users', user.uid);
        const userSnap = await getDoc(userRef);

        // Check if user signed in with Google (email is auto-verified)
        const isGoogleUser = user.providerData.some(
            (provider) => provider.providerId === 'google.com'
        );

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
                emailVerified: isGoogleUser, // Auto-verify for Google users
                eligibleForDirectory: false,
                stats: DEFAULT_STATS,
                createdAt: serverTimestamp(),
            };
            await setDoc(userRef, newUserProfile);
            console.log('User profile created for:', user.email, isGoogleUser ? '(Google - auto-verified)' : '');
        } else {
            // If existing user signs in with Google, mark email as verified
            if (isGoogleUser) {
                const existingProfile = userSnap.data() as UserProfile;
                if (!existingProfile.emailVerified) {
                    await updateDoc(userRef, { emailVerified: true });
                    console.log('Email auto-verified for Google user:', user.email);
                }
            }
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

        if (!currentProfile) {
            console.error('User profile not found for ID:', userId);
            return false;
        }

        // Deep merge achievements to prevent overwriting
        let finalAchievements = currentProfile.achievements || {};
        if (updates.achievements) {
            finalAchievements = { ...finalAchievements, ...updates.achievements };
        }

        // Deep merge stats if present (though usually updated via increment)
        let finalStats = currentProfile.stats || { servicesCount: 0, qrsActive: 0, sosSolved: 0, trainingCompleted: 0 };
        if (updates.stats) {
            finalStats = { ...finalStats, ...updates.stats };
        }

        const mergedProfile = {
            ...currentProfile,
            ...updates,
            achievements: finalAchievements,
            stats: finalStats
        };
        const completenessScore = calculateProfileCompleteness(mergedProfile);

        // Prepare the actual update object for Firestore
        // We do NOT want to send the entire merged profile back as it might overwrite concurrent stats updates (like increments)
        // logic: only send what's in 'updates' + the calculated score + branding/achievements deep merged fields if they were modified

        const finalUpdates: any = {
            ...updates,
            profileCompletenessScore: completenessScore,
            updatedAt: serverTimestamp(),
        };

        // Explicitly set the deep merged objects if they were part of the update
        if (updates.achievements) {
            finalUpdates.achievements = finalAchievements;
        }

        // Caution: stats are usually updated atomically via increment in other services.
        // We should typically NOT overwrite 'stats' here unless we are sure. 
        // If updates.stats exists, we use it, otherwise we leave it out of finalUpdates to preserve Firestore increments.
        if (updates.stats) {
            finalUpdates.stats = finalStats;
        }

        // Recompensa: 3 días PRO al llegar al 100%
        if (completenessScore === 100 && (currentProfile?.profileCompletenessScore || 0) < 100) {
            console.log('🎉 Usuario completó su perfil al 100%');

            // Solo si es free o no tiene subscripción activa de pago
            if (!currentProfile?.subscription || currentProfile.subscription === 'free') {
                const rewardEndDate = new Date();
                rewardEndDate.setDate(rewardEndDate.getDate() + 3);

                finalUpdates.subscription = 'Pro';
                finalUpdates.subscriptionEndDate = rewardEndDate;
                console.log('🎁 Recompensa otorgada: 3 días PRO');
            }
        }

        await updateDoc(userRef, finalUpdates);

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

