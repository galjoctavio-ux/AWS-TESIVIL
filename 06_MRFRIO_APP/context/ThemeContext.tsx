import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { useColorScheme } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';

type ThemeMode = 'light' | 'dark' | 'system';

interface ThemeContextType {
    theme: 'light' | 'dark';
    themeMode: ThemeMode;
    setThemeMode: (mode: ThemeMode) => void;
    isDark: boolean;
    toggleTheme: () => void;
}

const ThemeContext = createContext<ThemeContextType | undefined>(undefined);

const THEME_STORAGE_KEY = '@mrfrio_theme_mode';

export function ThemeProvider({ children }: { children: ReactNode }) {
    const systemColorScheme = useColorScheme();
    const [themeMode, setThemeModeState] = useState<ThemeMode>('system');
    const [isLoaded, setIsLoaded] = useState(false);

    // Calculate the actual theme based on mode
    const theme: 'light' | 'dark' =
        themeMode === 'system'
            ? (systemColorScheme ?? 'light')
            : themeMode;

    const isDark = theme === 'dark';

    // Load saved theme preference
    useEffect(() => {
        AsyncStorage.getItem(THEME_STORAGE_KEY)
            .then((savedMode) => {
                if (savedMode && ['light', 'dark', 'system'].includes(savedMode)) {
                    setThemeModeState(savedMode as ThemeMode);
                }
            })
            .finally(() => setIsLoaded(true));
    }, []);

    const setThemeMode = async (mode: ThemeMode) => {
        setThemeModeState(mode);
        await AsyncStorage.setItem(THEME_STORAGE_KEY, mode);
    };

    const toggleTheme = () => {
        const nextMode = themeMode === 'light' ? 'dark' : 'light';
        setThemeMode(nextMode);
    };

    if (!isLoaded) {
        return null; // Prevent flash of wrong theme
    }

    return (
        <ThemeContext.Provider value={{ theme, themeMode, setThemeMode, isDark, toggleTheme }}>
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

/**
 * Helper to get conditional dark mode classes
 * Usage: cn('bg-white', isDark && 'bg-dark-card')
 */
export function cn(...classes: (string | boolean | undefined | null)[]): string {
    return classes.filter(Boolean).join(' ');
}
