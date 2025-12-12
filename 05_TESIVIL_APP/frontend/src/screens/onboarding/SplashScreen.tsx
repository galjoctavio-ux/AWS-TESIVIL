import React, { useEffect } from 'react';
import { View, Text, StyleSheet, ActivityIndicator } from 'react-native';
import { useAuth } from '../../auth/AuthProvider';

export const SplashScreen = ({ navigation }: any) => {
    const { user, isLoading } = useAuth();

    useEffect(() => {
        if (!isLoading) {
            // Check if user has seen legal/setup. For now, just navigate.
            // In a real app, check Async Storage for 'onboarding_complete'
            if (user) {
                // Determine if first time or recurring
                navigation.replace('LegalAgreement'); // For demo flow, always go to Legal first
            } else {
                navigation.replace('LegalAgreement');
            }
        }
    }, [isLoading, user]);

    return (
        <View style={styles.container}>
            <Text style={styles.logo}>TESIVIL</Text>
            <ActivityIndicator size="large" color="#0000ff" />
            <Text>Cargando sistema...</Text>
        </View>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        backgroundColor: '#f5f5f5',
    },
    logo: {
        fontSize: 40,
        fontWeight: 'bold',
        marginBottom: 20,
    }
});
