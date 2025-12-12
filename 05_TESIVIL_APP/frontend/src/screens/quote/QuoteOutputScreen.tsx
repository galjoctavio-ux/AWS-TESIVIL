import React from 'react';
import { View, Text, StyleSheet, Button, Alert } from 'react-native';
import { useQuoteState } from '../../context/QuoteStateContext';
import { db } from '../../powersync/db';
import { useAuth } from '../../auth/AuthProvider';
import * as Crypto from 'expo-crypto';
import * as Sharing from 'expo-sharing';
import { generateQuotePdf } from '../../services/PdfService';


export const QuoteOutputScreen = ({ navigation }: any) => {
    const { items, totalMaterialCost, totalLaborCost, logisticsTier, obstructionFactor, isUrgent } = useQuoteState();
    const { user } = useAuth();

    const handleSave = async () => {
        if (items.length === 0) {
            Alert.alert("Error", "La cotización está vacía");
            return;
        }

        try {
            const quoteId = Crypto.randomUUID();

            // Insert Header
            await db.execute(
                `INSERT INTO quotes (id, user_id, status, logistics_tier, obstruction_factor, is_urgent, system_labor_total, created_at, updated_at)
                 VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)`,
                [
                    quoteId,
                    user?.id || 'anon',
                    'DRAFT',
                    logisticsTier,
                    obstructionFactor,
                    isUrgent ? 1 : 0,
                    totalLaborCost,
                    new Date().toISOString(),
                    new Date().toISOString()
                ]
            );

            // Insert Items
            for (const item of items) {
                await db.execute(
                    `INSERT INTO quote_items (id, quote_id, material_id, quantity, frozen_unit_price, calculated_labor, created_at)
                     VALUES (?, ?, ?, ?, ?, ?, ?)`,
                    [
                        Crypto.randomUUID(),
                        quoteId,
                        item.materialId,
                        item.quantity,
                        item.unitPrice,
                        item.laborCost,
                        new Date().toISOString()
                    ]
                );
            }

            Alert.alert("Guardado", "Cotización guardada exitosamente en BD Local.");
            // Reset Context? navigation to Dashboard?
        } catch (e) {
            console.error(e);
            Alert.alert("Error", "Falló al guardar en la base de datos.");
        }
    };

    const handleGeneratePDF = async () => {
        if (items.length === 0) return;
        try {
            const uri = await generateQuotePdf({ items, totalMaterialCost, totalLaborCost });
            if (await Sharing.isAvailableAsync()) {
                await Sharing.shareAsync(uri);
            } else {
                Alert.alert("PDF Generado", `Guardado en: ${uri}`);
            }
        } catch (e) {
            console.error(e);
            Alert.alert("Error", "No se pudo generar el PDF");
        }
    };

    return (
        <View style={styles.container}>
            <Text style={styles.title}>4. Salida y Exportación</Text>

            <View style={styles.summary}>
                <Text>Items: {items.length}</Text>
                <Text>Total Materiales: ${(totalMaterialCost / 100).toFixed(2)}</Text>
                <Text>Total Mano de Obra: ${(totalLaborCost / 100).toFixed(2)}</Text>
                <Text style={styles.total}>Gran Total: ${((totalMaterialCost + totalLaborCost) / 100).toFixed(2)}</Text>
            </View>

            <View style={styles.actions}>
                <Button title="Generar PDF y Compartir" onPress={handleGeneratePDF} />
                <View style={{ height: 10 }} />
                <View style={{ height: 30 }} />
                <Button title="Guardar y Salir" color="#007bff" onPress={handleSave} />
            </View>
        </View>
    );
};

const styles = StyleSheet.create({
    container: { flex: 1, padding: 20, backgroundColor: '#fff' },
    title: { fontSize: 22, fontWeight: 'bold', marginBottom: 20 },
    summary: { padding: 20, backgroundColor: '#eee', borderRadius: 8, marginBottom: 30 },
    total: { fontWeight: 'bold', marginTop: 10, fontSize: 18 },
    actions: { flex: 1 }
});
