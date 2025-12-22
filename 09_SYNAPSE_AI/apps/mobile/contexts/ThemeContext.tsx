import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { COLORS_LIGHT, COLORS_DARK, ThemeColors } from '@/constants/themes';

const THEME_STORAGE_KEY = '@synapse_theme_mode';

type ThemeMode = 'light' | 'dark';

interface ThemeContextType {
    theme: ThemeMode;
    colors: ThemeColors;
    isDark: boolean;
    toggleTheme: () => void;
    setTheme: (mode: ThemeMode) => void;
}

const ThemeContext = createContext<ThemeContextType | undefined>(undefined);

interface ThemeProviderProps {
    children: ReactNode;
}

export function ThemeProvider({ children }: ThemeProviderProps) {
    // Default to light theme as per user requirement
    const [theme, setThemeState] = useState<ThemeMode>('light');
    const [isLoaded, setIsLoaded] = useState(false);

    useEffect(() => {
        loadTheme();
    }, []);

    const loadTheme = async () => {
        try {
            const savedTheme = await AsyncStorage.getItem(THEME_STORAGE_KEY);
            if (savedTheme === 'light' || savedTheme === 'dark') {
                setThemeState(savedTheme);
            }
            // If no saved theme, keeps default 'light'
        } catch (error) {
            console.error('Error loading theme:', error);
        } finally {
            setIsLoaded(true);
        }
    };

    const saveTheme = async (mode: ThemeMode) => {
        try {
            await AsyncStorage.setItem(THEME_STORAGE_KEY, mode);
        } catch (error) {
            console.error('Error saving theme:', error);
        }
    };

    const setTheme = (mode: ThemeMode) => {
        setThemeState(mode);
        saveTheme(mode);
    };

    const toggleTheme = () => {
        const newTheme = theme === 'light' ? 'dark' : 'light';
        setTheme(newTheme);
    };

    const colors = theme === 'light' ? COLORS_LIGHT : COLORS_DARK;
    const isDark = theme === 'dark';

    // Don't render children until theme is loaded to prevent flash
    if (!isLoaded) {
        return null;
    }

    return (
        <ThemeContext.Provider value={{ theme, colors, isDark, toggleTheme, setTheme }}>
            {children}
        </ThemeContext.Provider>
    );
}

export function useTheme() {
    const context = useContext(ThemeContext);
    if (context === undefined) {
        throw new Error('useTheme must be used within a ThemeProvider');
    }
    return context;
}

// Hook to get just the colors (for components that don't need theme controls)
export function useColors() {
    const { colors } = useTheme();
    return colors;
}
