import React from 'react';
import { View, Text, StyleSheet, Button, ScrollView } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

export const LegalAgreementScreen = ({ navigation }: any) => {
    const handleAccept = () => {
        navigation.navigate('Setup');
    };

    return (
        <SafeAreaView style={styles.container}>
            <ScrollView contentContainerStyle={styles.content}>
                <Text style={styles.title}>Acuerdo de Referencia Profesional</Text>
                <Text style={styles.text}>
                    TESIVIL te respalda con precios de mercado, pero tú eres el experto en tu obra.
                </Text>
                <Text style={styles.text}>
                    Esta herramienta es una guía para potenciar tu negocio.
                </Text>
                <View style={styles.warningBox}>
                    <Text style={styles.warningText}>
                        Entiendo que los precios son referencias y asumo el control de mi cotización.
                    </Text>
                </View>
            </ScrollView>
            <View style={styles.footer}>
                <Button title="Aceptar y Continuar" onPress={handleAccept} />
            </View>
        </SafeAreaView>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#fff',
    },
    content: {
        padding: 20,
    },
    title: {
        fontSize: 24,
        fontWeight: 'bold',
        marginBottom: 20,
    },
    text: {
        fontSize: 16,
        marginBottom: 15,
        lineHeight: 24,
    },
    warningBox: {
        backgroundColor: '#fff3cd',
        padding: 15,
        borderRadius: 8,
        marginTop: 20,
    },
    warningText: {
        color: '#856404',
        fontWeight: 'bold',
    },
    footer: {
        padding: 20,
        borderTopWidth: 1,
        borderTopColor: '#eee',
    }
});
