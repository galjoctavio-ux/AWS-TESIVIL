import React, { useRef } from 'react';
import { View, Text } from 'react-native';
import { GooglePlacesAutocomplete } from 'react-native-google-places-autocomplete';
import Constants from 'expo-constants';

interface AddressAutocompleteProps {
    value: string;
    onAddressSelect: (address: string, location?: { lat: number; lng: number }) => void;
    placeholder?: string;
}

export default function AddressAutocomplete({
    value,
    onAddressSelect,
    placeholder = "Buscar dirección..."
}: AddressAutocompleteProps) {
    const ref = useRef<any>(null);

    // Get API key from extra config
    const apiKey = Constants.expoConfig?.extra?.googleMapsApiKey || '';

    return (
        <View className="flex-1">
            <GooglePlacesAutocomplete
                ref={ref}
                placeholder={placeholder}
                textInputProps={{
                    value: value,
                    onChangeText: (text) => onAddressSelect(text),
                    placeholderTextColor: '#9CA3AF',
                }}
                onPress={(data, details = null) => {
                    const address = data.description;
                    const location = details?.geometry?.location;
                    onAddressSelect(address, location ? { lat: location.lat, lng: location.lng } : undefined);
                }}
                query={{
                    key: apiKey,
                    language: 'es',
                    components: 'country:mx', // Restrict to Mexico, remove or change as needed
                }}
                fetchDetails={true}
                enablePoweredByContainer={false}
                styles={{
                    container: {
                        flex: 0,
                    },
                    textInputContainer: {
                        backgroundColor: 'transparent',
                    },
                    textInput: {
                        backgroundColor: '#F9FAFB',
                        borderWidth: 1,
                        borderColor: '#E5E7EB',
                        borderRadius: 8,
                        paddingHorizontal: 12,
                        paddingVertical: 12,
                        fontSize: 16,
                        color: '#1F2937',
                        minHeight: 48,
                    },
                    listView: {
                        backgroundColor: 'white',
                        borderRadius: 8,
                        marginTop: 4,
                        borderWidth: 1,
                        borderColor: '#E5E7EB',
                        elevation: 3,
                        shadowColor: '#000',
                        shadowOffset: { width: 0, height: 2 },
                        shadowOpacity: 0.1,
                        shadowRadius: 4,
                    },
                    row: {
                        backgroundColor: 'white',
                        paddingVertical: 14,
                        paddingHorizontal: 12,
                    },
                    separator: {
                        height: 1,
                        backgroundColor: '#E5E7EB',
                    },
                    description: {
                        fontSize: 14,
                        color: '#374151',
                    },
                    predefinedPlacesDescription: {
                        color: '#EA580C',
                    },
                }}
                debounce={300}
                minLength={3}
                nearbyPlacesAPI="GooglePlacesSearch"
                GooglePlacesSearchQuery={{
                    rankby: 'distance',
                }}
            />
        </View>
    );
}
