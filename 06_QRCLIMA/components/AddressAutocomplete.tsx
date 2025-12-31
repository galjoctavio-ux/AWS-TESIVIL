import React, { useRef } from 'react';
import { View, Text } from 'react-native';
import { GooglePlacesAutocomplete } from 'react-native-google-places-autocomplete';
import Constants from 'expo-constants';

export interface AddressComponents {
    street: string;
    neighborhood: string;
    city: string;
    state: string;
    postalCode: string;
    country: string;
    fullAddress: string;
}

interface AddressAutocompleteProps {
    value: string;
    onAddressSelect: (address: string, location?: { lat: number; lng: number }) => void;
    onAddressComponents?: (components: AddressComponents) => void;
    placeholder?: string;
}

// Helper to extract address component by type
const getAddressComponent = (components: any[], type: string): string => {
    const component = components?.find((c: any) => c.types.includes(type));
    return component?.long_name || '';
};

const getAddressComponentShort = (components: any[], type: string): string => {
    const component = components?.find((c: any) => c.types.includes(type));
    return component?.short_name || '';
};

export default function AddressAutocomplete({
    value,
    onAddressSelect,
    onAddressComponents,
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
                    // Only use controlled value if explicitly provided (not undefined)
                    ...(value !== undefined ? { value } : {}),
                    onChangeText: (text) => onAddressSelect(text),
                    placeholderTextColor: '#9CA3AF',
                }}
                onPress={(data, details = null) => {
                    const address = data.description;
                    const location = details?.geometry?.location;
                    onAddressSelect(address, location ? { lat: location.lat, lng: location.lng } : undefined);

                    // Parse address components if callback provided
                    if (onAddressComponents && details?.address_components) {
                        const comp = details.address_components;
                        const components: AddressComponents = {
                            street: `${getAddressComponent(comp, 'route')} ${getAddressComponent(comp, 'street_number')}`.trim(),
                            neighborhood: getAddressComponent(comp, 'sublocality_level_1') ||
                                getAddressComponent(comp, 'sublocality') ||
                                getAddressComponent(comp, 'neighborhood'),
                            city: getAddressComponent(comp, 'locality') ||
                                getAddressComponent(comp, 'administrative_area_level_2'),
                            state: getAddressComponent(comp, 'administrative_area_level_1'),
                            postalCode: getAddressComponent(comp, 'postal_code'),
                            country: getAddressComponent(comp, 'country'),
                            fullAddress: address,
                        };
                        onAddressComponents(components);
                    }

                    // Clear the suggestions list by setting the address text
                    ref.current?.setAddressText(address);
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
                disableScroll={true}
                listViewDisplayed="auto"
                keyboardShouldPersistTaps="handled"
                nearbyPlacesAPI="GooglePlacesSearch"
                GooglePlacesSearchQuery={{
                    rankby: 'distance',
                }}
            />
        </View>
    );
}
