/**
 * Storage Service - Firebase Storage utilities
 * For QRClima App
 */

import { ref, uploadBytes, getDownloadURL } from 'firebase/storage';
import { storage } from '../firebaseConfig';
import * as ImageManipulator from 'expo-image-manipulator';

/**
 * Upload a branding logo to Firebase Storage
 * Resizes image to max 400x400 before upload
 * 
 * @param userId - The user's ID
 * @param imageUri - Local URI of the image to upload
 * @returns Download URL of the uploaded image
 */
export const uploadBrandingLogo = async (
    userId: string,
    imageUri: string
): Promise<string> => {
    try {
        // Resize image to max 400x400 to save storage and bandwidth
        const manipulatedImage = await ImageManipulator.manipulateAsync(
            imageUri,
            [{ resize: { width: 400, height: 400 } }],
            { compress: 0.8, format: ImageManipulator.SaveFormat.PNG }
        );

        // Fetch the image as blob
        const response = await fetch(manipulatedImage.uri);
        const blob = await response.blob();

        // Create storage reference
        const storageRef = ref(storage, `branding/${userId}/logo.png`);

        // Upload
        await uploadBytes(storageRef, blob);

        // Get download URL
        const downloadURL = await getDownloadURL(storageRef);
        console.log('Logo uploaded successfully:', downloadURL);

        return downloadURL;
    } catch (error) {
        console.error('Error uploading branding logo:', error);
        throw error;
    }
};

/**
 * Upload a generic image to Firebase Storage
 * 
 * @param path - Storage path (e.g., "images/userId/filename.jpg")
 * @param imageUri - Local URI of the image
 * @param maxSize - Max width/height for resize (optional)
 * @returns Download URL
 */
export const uploadImage = async (
    path: string,
    imageUri: string,
    maxSize: number = 800
): Promise<string> => {
    try {
        // Resize image
        const manipulatedImage = await ImageManipulator.manipulateAsync(
            imageUri,
            [{ resize: { width: maxSize, height: maxSize } }],
            { compress: 0.8, format: ImageManipulator.SaveFormat.JPEG }
        );

        // Fetch as blob
        const response = await fetch(manipulatedImage.uri);
        const blob = await response.blob();

        // Upload
        const storageRef = ref(storage, path);
        await uploadBytes(storageRef, blob);

        // Get URL
        return await getDownloadURL(storageRef);
    } catch (error) {
        console.error('Error uploading image:', error);
        throw error;
    }
};
