import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

export const DashboardScreen = ({ navigation }: any) => {
    return (
        <SafeAreaView style={styles.container}>
            <Text style={styles.header}>Hola, Técnico</Text>

            <View style={styles.cardContainer}>
                <TouchableOpacity style={[styles.card, styles.cardBlue]} onPress={() => navigation.navigate('QuoteWizard')}>
                    <Text style={styles.cardTitle}>Cotización Detallada</Text>
                    <Text style={styles.cardDesc}>Obras completas, remodelaciones.</Text>
                </TouchableOpacity>

                <TouchableOpacity style={[styles.card, styles.cardGreen]} onPress={() => navigation.navigate('QuickQuote')}>
                    <Text style={styles.cardTitle}>Cotización Rápida</Text>
                    <Text style={styles.cardDesc}>Reparaciones, urgencias.</Text>
                </TouchableOpacity>
            </View>
        </SafeAreaView>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#f8f9fa',
        padding: 20,
    },
    header: {
        fontSize: 28,
        fontWeight: 'bold',
        marginBottom: 30,
    },
    cardContainer: {
        gap: 20,
    },
    card: {
        padding: 25,
        borderRadius: 15,
        shadowColor: "#000",
        shadowOffset: {
            width: 0,
            height: 2,
        },
        shadowOpacity: 0.25,
        shadowRadius: 3.84,
        elevation: 5,
    },
    cardBlue: {
        backgroundColor: '#007bff',
    },
    cardGreen: {
        backgroundColor: '#28a745',
    },
    cardTitle: {
        color: '#fff',
        fontSize: 22,
        fontWeight: 'bold',
        marginBottom: 5,
    },
    cardDesc: {
        color: 'rgba(255,255,255,0.8)',
        fontSize: 16,
    }
});
