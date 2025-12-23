import React, { useRef } from 'react';
import { View, Text, Modal, TouchableOpacity, StyleSheet, ActivityIndicator } from 'react-native';
import SignatureScreen, { SignatureViewRef } from 'react-native-signature-canvas';
import { Ionicons } from '@expo/vector-icons';

interface SignatureModalProps {
    visible: boolean;
    onClose: () => void;
    onOK: (signature: string) => void;
    title?: string;
    description?: string;
    confirmText?: string;
    clearText?: string;
}

export default function SignatureModal({
    visible,
    onClose,
    onOK,
    title = 'Firma',
    description = 'Por favor firma en el recuadro de abajo',
    confirmText = 'Guardar Firma',
    clearText = 'Borrar'
}: SignatureModalProps) {
    const ref = useRef<SignatureViewRef>(null);

    const handleSignature = (signature: string) => {
        onOK(signature);
        onClose();
    };

    const handleEmpty = () => {
        console.log('Empty signature');
    };

    const handleClear = () => {
        ref.current?.clearSignature();
    };

    const handleConfirm = () => {
        ref.current?.readSignature();
    };

    const style = `.m-signature-pad--footer {display: none; margin: 0px;}
                   body,html {width: 100%; height: 100%;}`;

    return (
        <Modal visible={visible} animationType="slide" transparent={true} onRequestClose={onClose}>
            <View className="flex-1 bg-black/50 justify-end">
                <View className="bg-white rounded-t-3xl h-[85%] w-full overflow-hidden">
                    {/* Header */}
                    <View className="flex-row justify-between items-center p-4 border-b border-gray-100">
                        <TouchableOpacity onPress={onClose} className="p-2">
                            <Ionicons name="close" size={24} color="#374151" />
                        </TouchableOpacity>
                        <Text className="text-lg font-bold text-gray-800">{title}</Text>
                        <View className="w-10" />
                    </View>

                    <View className="p-4 bg-slate-50">
                        <Text className="text-center text-gray-500 text-sm mb-2">{description}</Text>
                    </View>

                    {/* Canvas Area */}
                    <View className="flex-1 bg-white border-y border-gray-100 relative">
                        <SignatureScreen
                            ref={ref}
                            onOK={handleSignature}
                            onEmpty={handleEmpty}
                            webStyle={style}
                            descriptionText={description}
                        />
                    </View>

                    {/* Custom Footer */}
                    <View className="flex-row p-6 bg-white gap-4 shadow-lg pb-10">
                        <TouchableOpacity
                            onPress={handleClear}
                            className="flex-1 bg-gray-100 py-4 rounded-xl items-center"
                        >
                            <Text className="text-gray-700 font-semibold">{clearText}</Text>
                        </TouchableOpacity>

                        <TouchableOpacity
                            onPress={handleConfirm}
                            className="flex-1 bg-blue-600 py-4 rounded-xl items-center shadow-md shadow-blue-200"
                        >
                            <Text className="text-white font-bold">{confirmText}</Text>
                        </TouchableOpacity>
                    </View>
                </View>
            </View>
        </Modal>
    );
}
