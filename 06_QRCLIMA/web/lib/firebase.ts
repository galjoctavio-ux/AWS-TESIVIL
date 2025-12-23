// Firebase config for web project
// Uses same project as mobile app

import { initializeApp, getApps } from 'firebase/app';
import { getFirestore } from 'firebase/firestore';

const firebaseConfig = {
    apiKey: "AIzaSyCn7uUld0txJnAcaCPNPOF5bzavGPuQRrM",
    authDomain: "mr-frio.firebaseapp.com",
    projectId: "mr-frio",
    storageBucket: "mr-frio.firebasestorage.app",
    messagingSenderId: "639964722922",
    appId: "1:639964722922:web:e78eae98dee82df80b4993"
};

// Initialize Firebase (prevent multiple initializations)
const app = getApps().length === 0 ? initializeApp(firebaseConfig) : getApps()[0];
const db = getFirestore(app);

export { db };
