import { initializeApp } from 'firebase/app';
// @ts-ignore - getReactNativePersistence exists at runtime but not in TS types
import { initializeAuth, getReactNativePersistence } from 'firebase/auth';
import { getFirestore } from 'firebase/firestore';
import { getStorage } from 'firebase/storage';
import { getFunctions } from 'firebase/functions';
import ReactNativeAsyncStorage from '@react-native-async-storage/async-storage';

// Configuración de Firebase
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

// Inicializar Auth con persistencia de AsyncStorage para React Native
export const auth = initializeAuth(app, {
    // @ts-ignore
    persistence: getReactNativePersistence(ReactNativeAsyncStorage)
});

// Firestore estándar (sin persistencia IndexedDB ya que no es soportado en RN)
export const db = getFirestore(app);

// Firebase Storage para subir imágenes (fotos de perfil, evidencias, etc.)
export const storage = getStorage(app);

// Firebase Functions para Cloud Functions
export const functions = getFunctions(app);

