import * as ImageManipulator from 'expo-image-manipulator';
import * as FileSystem from 'expo-file-system';
import * as ImagePicker from 'expo-image-picker';
import { ref, uploadBytes, getDownloadURL } from 'firebase/storage';
import { storage } from '../firebaseConfig';
import { updateUserProfile } from './user-service';

// ============================================
// SERVICIO DE COMPRESIÓN DE IMÁGENES - QRclima
// ============================================

export interface CompressionOptions {
    maxWidth?: number;
    maxHeight?: number;
    quality?: number;        // 0-1, default 0.7
    format?: 'jpeg' | 'png';
}

export interface CompressionResult {
    uri: string;
    width: number;
    height: number;
    originalSize?: number;
    compressedSize?: number;
    compressionRatio?: number;
}

const DEFAULT_OPTIONS: CompressionOptions = {
    maxWidth: 1200,
    maxHeight: 1200,
    quality: 0.7,
    format: 'jpeg',
};

/**
 * Comprime una imagen antes de subirla
 * Reduce significativamente el tamaño para upload rápido
 */
export const compressImage = async (
    uri: string,
    options: CompressionOptions = {}
): Promise<CompressionResult> => {
    const opts = { ...DEFAULT_OPTIONS, ...options };

    try {
        // Get original file size
        let originalSize: number | undefined;
        try {
            const fileInfo = await FileSystem.getInfoAsync(uri);
            if (fileInfo.exists && 'size' in fileInfo) {
                originalSize = fileInfo.size;
            }
        } catch (e) {
            // Ignore if we can't get file size
        }

        // Define actions
        const actions: ImageManipulator.Action[] = [];

        // Add resize action if needed
        if (opts.maxWidth || opts.maxHeight) {
            actions.push({
                resize: {
                    width: opts.maxWidth,
                    height: opts.maxHeight,
                }
            });
        }

        // Compress the image
        const result = await ImageManipulator.manipulateAsync(
            uri,
            actions,
            {
                compress: opts.quality,
                format: opts.format === 'png'
                    ? ImageManipulator.SaveFormat.PNG
                    : ImageManipulator.SaveFormat.JPEG,
            }
        );

        // Get compressed file size
        let compressedSize: number | undefined;
        try {
            const fileInfo = await FileSystem.getInfoAsync(result.uri);
            if (fileInfo.exists && 'size' in fileInfo) {
                compressedSize = fileInfo.size;
            }
        } catch (e) {
            // Ignore
        }

        // Calculate compression ratio
        const compressionRatio = originalSize && compressedSize
            ? Math.round((1 - compressedSize / originalSize) * 100)
            : undefined;

        console.log(`Image compressed: ${originalSize ? (originalSize / 1024).toFixed(1) : '?'}KB -> ${compressedSize ? (compressedSize / 1024).toFixed(1) : '?'}KB (${compressionRatio || '?'}% reduction)`);

        return {
            uri: result.uri,
            width: result.width,
            height: result.height,
            originalSize,
            compressedSize,
            compressionRatio,
        };
    } catch (error) {
        console.error('Error compressing image:', error);
        // Return original if compression fails
        return {
            uri,
            width: 0,
            height: 0,
        };
    }
};

/**
 * Comprime múltiples imágenes en paralelo
 */
export const compressImages = async (
    uris: string[],
    options: CompressionOptions = {}
): Promise<CompressionResult[]> => {
    const promises = uris.map(uri => compressImage(uri, options));
    return Promise.all(promises);
};

/**
 * Preset para fotos de evidencia de servicio
 * Optimizado para calidad vs tamaño
 */
export const compressServicePhoto = async (uri: string): Promise<CompressionResult> => {
    return compressImage(uri, {
        maxWidth: 1024,
        maxHeight: 1024,
        quality: 0.6,
        format: 'jpeg',
    });
};

/**
 * Preset para fotos de perfil/avatar
 * Más pequeño y cuadrado
 */
export const compressProfilePhoto = async (uri: string): Promise<CompressionResult> => {
    return compressImage(uri, {
        maxWidth: 400,
        maxHeight: 400,
        quality: 0.85,
        format: 'jpeg',
    });
};

/**
 * Preset para thumbnails
 * Muy pequeño para listas
 */
export const compressThumbnail = async (uri: string): Promise<CompressionResult> => {
    return compressImage(uri, {
        maxWidth: 150,
        maxHeight: 150,
        quality: 0.7,
        format: 'jpeg',
    });
};

/**
 * Calcula el tamaño de archivo en formato legible
 */
export const formatFileSize = (bytes: number): string => {
    if (bytes < 1024) {
        return `${bytes} B`;
    } else if (bytes < 1024 * 1024) {
        return `${(bytes / 1024).toFixed(1)} KB`;
    } else {
        return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
    }
};

// ============================================
// FUNCIONES DE FOTO DE PERFIL
// ============================================

/**
 * Abre el selector de imágenes para elegir una foto de perfil.
 * La imagen se redimensiona automáticamente usando ImagePicker.
 */
export const pickProfileImage = async (): Promise<string | null> => {
    try {
        // Solicitar permisos
        const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
        if (status !== 'granted') {
            throw new Error('Se requiere permiso para acceder a la galería');
        }

        // Abrir selector con configuración de redimensionamiento
        const result = await ImagePicker.launchImageLibraryAsync({
            mediaTypes: 'images',
            allowsEditing: true,
            aspect: [1, 1],         // Cuadrada para perfil
            quality: 0.7,           // 70% calidad para ahorrar espacio
            exif: false,            // No necesitamos metadata EXIF
        });

        if (result.canceled || !result.assets || result.assets.length === 0) {
            return null;
        }

        return result.assets[0].uri;
    } catch (error) {
        console.error('Error picking profile image:', error);
        throw error;
    }
};

/**
 * Sube una imagen de perfil a Firebase Storage.
 * @param userId ID del usuario
 * @param imageUri URI local de la imagen
 * @returns URL de descarga de la imagen subida
 */
export const uploadProfilePhoto = async (
    userId: string,
    imageUri: string
): Promise<string> => {
    try {
        // Convertir URI a blob
        const response = await fetch(imageUri);
        const blob = await response.blob();

        // Referencia en Firebase Storage
        const photoRef = ref(storage, `profile_photos/${userId}_${Date.now()}.jpg`);

        // Subir imagen
        await uploadBytes(photoRef, blob);

        // Obtener URL de descarga
        const downloadURL = await getDownloadURL(photoRef);

        console.log('Profile photo uploaded:', downloadURL);
        return downloadURL;
    } catch (error) {
        console.error('Error uploading profile photo:', error);
        throw error;
    }
};

/**
 * Flujo completo: seleccionar, subir y actualizar perfil.
 * @param userId ID del usuario
 * @returns URL de la foto o null si se canceló
 */
export const updateProfilePhotoFlow = async (userId: string): Promise<string | null> => {
    try {
        // 1. Seleccionar imagen (ya comprimida por ImagePicker)
        const imageUri = await pickProfileImage();
        if (!imageUri) {
            return null; // Usuario canceló
        }

        // 2. Subir a Firebase Storage
        const photoURL = await uploadProfilePhoto(userId, imageUri);

        // 3. Actualizar perfil del usuario en Firestore
        await updateUserProfile(userId, { photoURL });

        return photoURL;
    } catch (error) {
        console.error('Error updating profile photo:', error);
        throw error;
    }
};

/**
 * Sube múltiples fotos de servicio a Firebase Storage.
 * @param uris Array de URIs locales de las imágenes
 * @returns Array de URLs de descarga
 */
export const uploadServicePhotos = async (uris: string[]): Promise<string[]> => {
    try {
        const uploadPromises = uris.map(async (uri) => {
            // Check if already a remote URL
            if (uri.startsWith('http')) return uri;

            const response = await fetch(uri);
            const blob = await response.blob();
            const filename = `service_evidence/${Date.now()}_${Math.random().toString(36).substring(7)}.jpg`;
            const photoRef = ref(storage, filename);

            await uploadBytes(photoRef, blob);
            return await getDownloadURL(photoRef);
        });

        return await Promise.all(uploadPromises);
    } catch (error) {
        console.error('Error uploading service photos:', error);
        throw error;
    }
};

