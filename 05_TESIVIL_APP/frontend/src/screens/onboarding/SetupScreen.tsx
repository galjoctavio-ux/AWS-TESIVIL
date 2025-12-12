import React, { useState } from 'react';
import { View, Text, StyleSheet, Button, Switch, TextInput } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

export const SetupScreen = ({ navigation }: any) => {
    const [paysRent, setPaysRent] = useState(false);
    const [hasStaff, setHasStaff] = useState(false);
    const [profitMargin, setProfitMargin] = useState('30');

    const handleFinishSetup = () => {
        // Save config to DB/Storage here
        navigation.replace('Dashboard');
    };

    return (
        <SafeAreaView style={styles.container}>
            <Text style={styles.title}>Configuración de Empresa</Text>

            <View style={styles.optionRow}>
                <Text style={styles.label}>¿Pagas renta de local/bodega?</Text>
                <Switch value={paysRent} onValueChange={setPaysRent} />
            </View>

            <View style={styles.optionRow}>
                <Text style={styles.label}>¿Tienes personal administrativo?</Text>
                <Switch value={hasStaff} onValueChange={setHasStaff} />
            </View>

            <View style={styles.inputContainer}>
                <Text style={styles.label}>Margen de Utilidad Deseado (%)</Text>
                <TextInput
                    style={styles.input}
                    value={profitMargin}
                    onChangeText={setProfitMargin}
                    keyboardType="numeric"
                />
            </View>

            <Button title="Finalizar Configuración" onPress={handleFinishSetup} />
        </SafeAreaView>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#fff',
        padding: 20,
    },
    title: {
        fontSize: 22,
        fontWeight: 'bold',
        marginBottom: 30,
    },
    optionRow: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: 20,
        paddingVertical: 10,
        borderBottomWidth: 1,
        borderBottomColor: '#eee',
    },
    label: {
        fontSize: 16,
    },
    inputContainer: {
        marginBottom: 30,
    },
    input: {
        borderWidth: 1,
        borderColor: '#ccc',
        borderRadius: 5,
        padding: 10,
        fontSize: 18,
        marginTop: 10,
    }
});
