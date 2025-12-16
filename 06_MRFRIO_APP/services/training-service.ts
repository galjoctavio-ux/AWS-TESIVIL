import { doc, updateDoc, increment, getDoc, setDoc } from 'firebase/firestore';
import { db } from '../firebaseConfig';

export interface TrainingCapsule {
    id: string;
    title: string;
    description: string;
    duration: string; // "30s"
    thumbnail: string; // Mock icon/color
    category: 'Técnico' | 'Seguridad' | 'Negocio';
    rewardTokens: number;
}

const CAPSULES: TrainingCapsule[] = [
    {
        id: 'c1',
        title: 'Buenas Prácticas de Vacío',
        description: 'Aprende por qué debes llegar a 500 micrones para evitar humedad en el sistema.',
        duration: '2 min',
        thumbnail: 'cube',
        category: 'Técnico',
        rewardTokens: 5
    },
    {
        id: 'c2',
        title: 'Seguridad en Alturas',
        description: 'Uso correcto de arnés y línea de vida en instalaciones de tercer piso.',
        duration: '3 min',
        thumbnail: 'body',
        category: 'Seguridad',
        rewardTokens: 10
    },
    {
        id: 'c3',
        title: 'Carga de Gas R410A',
        description: 'Diferencias entre carga líquida y gaseosa. ¿Por qué voltear el tanque?',
        duration: '4 min',
        thumbnail: 'flask',
        category: 'Técnico',
        rewardTokens: 8
    },
    {
        id: 'c4',
        title: 'Atención al Cliente',
        description: 'Cómo explicar una falla técnica sin usar tecnicismos para generar confianza.',
        duration: '1 min',
        thumbnail: 'people',
        category: 'Negocio',
        rewardTokens: 5
    },
    {
        id: 'c5',
        title: 'Mantenimiento de Drenajes',
        description: 'Técnicas para desobstruir bandejas de condensado llenas de lodo.',
        duration: '2 min',
        thumbnail: 'water',
        category: 'Técnico',
        rewardTokens: 5
    }
];

export const getCapsules = async () => {
    // Simulate delay
    await new Promise(resolve => setTimeout(resolve, 300));
    return CAPSULES;
};

export const completeCapsule = async (userId: string, capsuleId: string) => {
    // 1. Check if already completed (Mock: we'll check a 'training_progress' subcollection or map)
    const progressRef = doc(db, 'users', userId, 'training', capsuleId);
    const progressSnap = await getDoc(progressRef);

    if (progressSnap.exists()) {
        throw new Error("Ya completaste esta cápsula anteriormente.");
    }

    const capsule = CAPSULES.find(c => c.id === capsuleId);
    if (!capsule) throw new Error("Cápsula no encontrada");

    // 2. Mark as complete
    await setDoc(progressRef, {
        completedAt: new Date(),
        capsuleId
    });

    // 3. Award Tokens
    const userRef = doc(db, 'users', userId);
    await updateDoc(userRef, {
        token_balance: increment(capsule.rewardTokens)
    });

    return capsule.rewardTokens;
};
