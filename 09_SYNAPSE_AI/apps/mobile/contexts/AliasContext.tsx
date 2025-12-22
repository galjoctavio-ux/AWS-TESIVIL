import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';

const ALIAS_STORAGE_KEY = '@synapse_user_alias';

interface AliasContextType {
    alias: string;
    setAlias: (alias: string) => Promise<void>;
    isLoading: boolean;
}

const AliasContext = createContext<AliasContextType | undefined>(undefined);

interface AliasProviderProps {
    children: ReactNode;
}

// Generate a random default alias
function generateDefaultAlias(): string {
    const randomNum = Math.floor(1000 + Math.random() * 9000);
    return `Usuario_${randomNum}`;
}

export function AliasProvider({ children }: AliasProviderProps) {
    const [alias, setAliasState] = useState<string>('');
    const [isLoading, setIsLoading] = useState(true);

    useEffect(() => {
        loadAlias();
    }, []);

    const loadAlias = async () => {
        try {
            const savedAlias = await AsyncStorage.getItem(ALIAS_STORAGE_KEY);
            if (savedAlias) {
                setAliasState(savedAlias);
            } else {
                // Generate and save a default alias
                const defaultAlias = generateDefaultAlias();
                await AsyncStorage.setItem(ALIAS_STORAGE_KEY, defaultAlias);
                setAliasState(defaultAlias);
            }
        } catch (error) {
            console.error('Error loading alias:', error);
            setAliasState(generateDefaultAlias());
        } finally {
            setIsLoading(false);
        }
    };

    const setAlias = async (newAlias: string): Promise<void> => {
        try {
            const trimmedAlias = newAlias.trim();
            await AsyncStorage.setItem(ALIAS_STORAGE_KEY, trimmedAlias);
            setAliasState(trimmedAlias);
        } catch (error) {
            console.error('Error saving alias:', error);
            throw error;
        }
    };

    return (
        <AliasContext.Provider value={{ alias, setAlias, isLoading }}>
            {children}
        </AliasContext.Provider>
    );
}

export function useAlias() {
    const context = useContext(AliasContext);
    if (context === undefined) {
        throw new Error('useAlias must be used within an AliasProvider');
    }
    return context;
}
