/**
 * Google Auth Service for QRclima
 * Uses native Google Sign-In SDK for Android
 */

import { GoogleSignin, statusCodes } from '@react-native-google-signin/google-signin';
import { GoogleAuthProvider, signInWithCredential } from 'firebase/auth';
import { auth } from '../firebaseConfig';

// Web Client ID from Firebase (required for Firebase integration)
const GOOGLE_WEB_CLIENT_ID = '639964722922-o2uqfotiiia29u7u0c7ap80h84he7t5i.apps.googleusercontent.com';

// Configure Google Sign-In on app start
let isConfigured = false;

export function configureGoogleSignIn() {
    if (isConfigured) return;

    GoogleSignin.configure({
        webClientId: GOOGLE_WEB_CLIENT_ID,
        offlineAccess: true,
    });

    isConfigured = true;
    console.log('Google Sign-In configured');
}

/**
 * Sign in with Google using native SDK
 * @returns The signed-in Firebase user or null
 */
export async function signInWithGoogle() {
    try {
        // Ensure Google Sign-In is configured
        configureGoogleSignIn();

        // Check if Google Play Services is available
        await GoogleSignin.hasPlayServices({ showPlayServicesUpdateDialog: true });

        // Sign in with Google
        const signInResult = await GoogleSignin.signIn();

        console.log('Google Sign-In result:', signInResult);

        // Get the ID token
        const idToken = signInResult.data?.idToken;

        if (!idToken) {
            throw new Error('No se pudo obtener el token de Google');
        }

        // Create Firebase credential and sign in
        const credential = GoogleAuthProvider.credential(idToken);
        const userCredential = await signInWithCredential(auth, credential);

        console.log('Firebase Sign-In successful:', userCredential.user.email);
        return userCredential.user;

    } catch (error: any) {
        console.error('Google Sign-In error:', error);

        if (error.code === statusCodes.SIGN_IN_CANCELLED) {
            console.log('User cancelled the sign-in');
            return null;
        } else if (error.code === statusCodes.IN_PROGRESS) {
            console.log('Sign-in already in progress');
            return null;
        } else if (error.code === statusCodes.PLAY_SERVICES_NOT_AVAILABLE) {
            throw new Error('Google Play Services no disponible');
        }

        throw error;
    }
}

/**
 * Sign out from Google
 */
export async function signOutGoogle() {
    try {
        await GoogleSignin.signOut();
        console.log('Google Sign-Out successful');
    } catch (error) {
        console.error('Google Sign-Out error:', error);
    }
}

/**
 * Check if user is currently signed in with Google
 */
export async function isGoogleSignedIn() {
    try {
        const currentUser = GoogleSignin.getCurrentUser();
        return currentUser !== null;
    } catch (error) {
        console.error('Error checking Google sign-in status:', error);
        return false;
    }
}
