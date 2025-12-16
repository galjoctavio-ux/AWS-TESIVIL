import { initializeApp } from 'firebase/app';
import { getAuth } from 'firebase/auth';
import { getFirestore } from 'firebase/firestore';

// Configuración de Firebase
// Para producción, usar variables de entorno en EAS Build o .env
const firebaseConfig = {
    apiKey: "AIzaSyCn7uUld0txJnAcaCPNPOF5bzavGPuQRrM",
    authDomain: "mr-frio.firebaseapp.com",
    projectId: "mr-frio",
    storageBucket: "mr-frio.firebasestorage.app",
    messagingSenderId: "639964722922",
    appId: "1:639964722922:web:e78eae98dee82df80b4993",
    measurementId: "G-786SJ1P9P7"
};

const app = initializeApp(firebaseConfig);

export const auth = getAuth(app);
export const db = getFirestore(app);

//hola
