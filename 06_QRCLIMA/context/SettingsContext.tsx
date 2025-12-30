import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';

const SETTINGS_STORAGE_KEY = '@qrclima_settings';

export type NavAppPreference = 'waze' | 'google' | 'apple' | null;
export type DistanceMode = 'linear' | 'traffic';

export interface AppSettings {
    reminderMonths: number; // Default: 6 months for maintenance reminder
    preferredNavApp: NavAppPreference; // Preferred navigation app
    distanceMode: DistanceMode; // 'linear' = Haversine, 'traffic' = Google Directions (PRO only)
}

const DEFAULT_SETTINGS: AppSettings = {
    reminderMonths: 6,
    preferredNavApp: null, // null = always ask
    distanceMode: 'linear', // default to linear (free)
};

interface SettingsContextType {
    settings: AppSettings;
    updateSettings: (newSettings: Partial<AppSettings>) => Promise<void>;
    loading: boolean;
}

const SettingsContext = createContext<SettingsContextType | undefined>(undefined);

export function SettingsProvider({ children }: { children: ReactNode }) {
    const [settings, setSettings] = useState<AppSettings>(DEFAULT_SETTINGS);
    const [loading, setLoading] = useState(true);

    // Load settings on mount
    useEffect(() => {
        loadSettings();
    }, []);

    const loadSettings = async () => {
        try {
            const stored = await AsyncStorage.getItem(SETTINGS_STORAGE_KEY);
            if (stored) {
                const parsed = JSON.parse(stored);
                setSettings({ ...DEFAULT_SETTINGS, ...parsed });
            }
        } catch (error) {
            console.error('Error loading settings:', error);
        } finally {
            setLoading(false);
        }
    };

    const updateSettings = async (newSettings: Partial<AppSettings>) => {
        try {
            const updated = { ...settings, ...newSettings };
            setSettings(updated);
            await AsyncStorage.setItem(SETTINGS_STORAGE_KEY, JSON.stringify(updated));
        } catch (error) {
            console.error('Error saving settings:', error);
            throw error;
        }
    };

    return (
        <SettingsContext.Provider value={{ settings, updateSettings, loading }}>
            {children}
        </SettingsContext.Provider>
    );
}

export function useSettings() {
    const context = useContext(SettingsContext);
    if (context === undefined) {
        throw new Error('useSettings must be used within a SettingsProvider');
    }
    return context;
}
