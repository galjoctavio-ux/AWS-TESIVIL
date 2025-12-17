import * as ImageManipulator from 'expo-image-manipulator';
import * as FileSystem from 'expo-file-system';

// ============================================
// SERVICIO DE COMPRESIÓN DE IMÁGENES - Mr. Frío
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
        maxWidth: 1200,
        maxHeight: 1200,
        quality: 0.8,
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
