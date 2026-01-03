import React, { useEffect, useState } from 'react';
import { View, Text, ActivityIndicator, StyleSheet, Image } from 'react-native';
import * as Updates from 'expo-updates';
import Constants from 'expo-constants';
import { LinearGradient } from 'expo-linear-gradient';

export type UpdateStatus = 'checking' | 'downloading' | 'ready' | 'no-update' | 'error';

interface UpdateCheckerProps {
    onComplete: () => void;
}

export function UpdateChecker({ onComplete }: UpdateCheckerProps) {
    const [status, setStatus] = useState<UpdateStatus>('checking');
    const [progress, setProgress] = useState<string>('');

    const appVersion = Constants.expoConfig?.version || '1.0.0';

    useEffect(() => {
        checkForUpdates();
    }, []);

    const checkForUpdates = async () => {
        try {
            // In development, skip update check
            if (__DEV__) {
                setStatus('no-update');
                setTimeout(onComplete, 1000);
                return;
            }

            setStatus('checking');
            setProgress('Verificando actualizaciones...');

            const update = await Updates.checkForUpdateAsync();

            if (update.isAvailable) {
                setStatus('downloading');
                setProgress('Descargando actualización...');

                await Updates.fetchUpdateAsync();

                setStatus('ready');
                setProgress('¡Actualización lista! Reiniciando...');

                // Small delay before reload
                setTimeout(async () => {
                    await Updates.reloadAsync();
                }, 1500);
            } else {
                setStatus('no-update');
                setProgress('App actualizada');
                setTimeout(onComplete, 800);
            }
        } catch (error) {
            console.log('[UpdateChecker] Error checking updates:', error);
            setStatus('error');
            setProgress('Continuando...');
            // Continue to app even if update check fails
            setTimeout(onComplete, 1000);
        }
    };

    const getStatusMessage = () => {
        switch (status) {
            case 'checking':
                return 'Verificando actualizaciones...';
            case 'downloading':
                return 'Descargando actualización...';
            case 'ready':
                return '¡Actualización lista!';
            case 'no-update':
                return 'Todo listo';
            case 'error':
                return 'Iniciando...';
            default:
                return 'Cargando...';
        }
    };

    return (
        <LinearGradient
            colors={['#0B0E14', '#12151C', '#0B0E14']}
            style={styles.container}
        >
            <View style={styles.content}>
                {/* Logo */}
                <View style={styles.logoContainer}>
                    <Image
                        source={require('../assets/icon.png')}
                        style={styles.logo}
                        resizeMode="contain"
                    />
                </View>

                {/* App Name */}
                <Text style={styles.appName}>SYNAPSE AI</Text>

                {/* Version */}
                <Text style={styles.version}>v{appVersion}</Text>

                {/* Loading Indicator */}
                <View style={styles.loaderContainer}>
                    <ActivityIndicator
                        size="large"
                        color="#8B5CF6"
                        style={styles.loader}
                    />
                    <Text style={styles.statusText}>{getStatusMessage()}</Text>
                </View>
            </View>

            {/* Footer */}
            <View style={styles.footer}>
                <Text style={styles.footerText}>Powered by TESIVIL</Text>
            </View>
        </LinearGradient>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
    },
    content: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        paddingHorizontal: 40,
    },
    logoContainer: {
        width: 120,
        height: 120,
        borderRadius: 24,
        overflow: 'hidden',
        marginBottom: 24,
        shadowColor: '#8B5CF6',
        shadowOffset: { width: 0, height: 0 },
        shadowOpacity: 0.5,
        shadowRadius: 20,
        elevation: 10,
    },
    logo: {
        width: '100%',
        height: '100%',
    },
    appName: {
        fontSize: 28,
        fontWeight: '700',
        color: '#FFFFFF',
        letterSpacing: 2,
        marginBottom: 8,
    },
    version: {
        fontSize: 14,
        color: '#8B5CF6',
        fontWeight: '600',
        marginBottom: 48,
    },
    loaderContainer: {
        alignItems: 'center',
    },
    loader: {
        marginBottom: 16,
    },
    statusText: {
        fontSize: 14,
        color: '#A1A1AA',
        textAlign: 'center',
    },
    footer: {
        paddingBottom: 40,
    },
    footerText: {
        fontSize: 12,
        color: '#6B7280',
    },
});

export default UpdateChecker;
