import { doc, getDoc, updateDoc, increment, serverTimestamp } from 'firebase/firestore';
import { db } from '../firebaseConfig';
import AsyncStorage from '@react-native-async-storage/async-storage';

// ============================================
// QUICK ACTIONS - Hybrid System
// Auto-orders by usage + manual customization
// ============================================

export interface QuickAction {
    id: string;
    icon: string;
    label: string;
    route: string;
    primary?: boolean;
    alert?: boolean;
    color?: string;
}

// All available quick actions
export const ALL_QUICK_ACTIONS: QuickAction[] = [
    { id: 'service', icon: 'add-circle', label: 'Nuevo Servicio', route: '/(app)/scanner?mode=service', primary: true },
    { id: 'scan', icon: 'qr-code', label: 'Escanear QR', route: '/(app)/scanner' },
    { id: 'sos', icon: 'help-buoy', label: 'SOS', route: '/(app)/community', alert: true },
    { id: 'agenda', icon: 'calendar', label: 'Agenda', route: '/(app)/agenda' },
    { id: 'clients', icon: 'people', label: 'Clientes', route: '/(app)/clients' },
    { id: 'cotizador', icon: 'document-text', label: 'Cotizar', route: '/(app)/cotizador', color: 'bg-green-600' },
    { id: 'tools', icon: 'construct', label: 'Herramientas', route: '/(app)/tools' },
    { id: 'library', icon: 'warning', label: 'Códigos Error', route: '/(app)/library' },
    { id: 'btu', icon: 'calculator', label: 'BTU', route: '/(app)/tools/btu-calculator-free' },
    { id: 'wallet', icon: 'wallet', label: 'Billetera', route: '/(app)/wallet' },
    { id: 'training', icon: 'school', label: 'Capacitación', route: '/(app)/training' },
];

const MAX_VISIBLE_ACTIONS = 4;
const STORAGE_KEY_PINNED = 'quick_actions_pinned';
const STORAGE_KEY_USAGE = 'quick_actions_usage';

interface UsageData {
    [actionId: string]: number;
}

// ============================================
// LOCAL STORAGE (for fast access)
// ============================================

/**
 * Get pinned action IDs from local storage
 */
export const getPinnedActions = async (): Promise<string[]> => {
    try {
        const data = await AsyncStorage.getItem(STORAGE_KEY_PINNED);
        return data ? JSON.parse(data) : [];
    } catch (error) {
        console.error('Error getting pinned actions:', error);
        return [];
    }
};

/**
 * Save pinned action IDs to local storage
 */
export const savePinnedActions = async (pinnedIds: string[]): Promise<void> => {
    try {
        await AsyncStorage.setItem(STORAGE_KEY_PINNED, JSON.stringify(pinnedIds));
    } catch (error) {
        console.error('Error saving pinned actions:', error);
    }
};

/**
 * Get usage data from local storage
 */
export const getUsageData = async (): Promise<UsageData> => {
    try {
        const data = await AsyncStorage.getItem(STORAGE_KEY_USAGE);
        return data ? JSON.parse(data) : {};
    } catch (error) {
        console.error('Error getting usage data:', error);
        return {};
    }
};

/**
 * Track action usage (increment counter)
 */
export const trackActionUsage = async (actionId: string): Promise<void> => {
    try {
        const usage = await getUsageData();
        usage[actionId] = (usage[actionId] || 0) + 1;
        await AsyncStorage.setItem(STORAGE_KEY_USAGE, JSON.stringify(usage));
    } catch (error) {
        console.error('Error tracking action usage:', error);
    }
};

// ============================================
// MAIN FUNCTION: Get Ordered Quick Actions
// ============================================

/**
 * Get quick actions ordered by:
 * 1. Pinned actions first (in user's order)
 * 2. Fill remaining slots with most used (by frequency)
 * 3. If no history, use default order
 */
export const getOrderedQuickActions = async (): Promise<QuickAction[]> => {
    try {
        const [pinnedIds, usage] = await Promise.all([
            getPinnedActions(),
            getUsageData()
        ]);

        const result: QuickAction[] = [];
        const usedIds = new Set<string>();

        // 1. Add pinned actions first
        for (const id of pinnedIds) {
            const action = ALL_QUICK_ACTIONS.find(a => a.id === id);
            if (action && result.length < MAX_VISIBLE_ACTIONS) {
                result.push(action);
                usedIds.add(id);
            }
        }

        // 2. Fill remaining slots with most used
        if (result.length < MAX_VISIBLE_ACTIONS) {
            // Sort by usage frequency (descending)
            const sortedByUsage = ALL_QUICK_ACTIONS
                .filter(a => !usedIds.has(a.id))
                .sort((a, b) => (usage[b.id] || 0) - (usage[a.id] || 0));

            for (const action of sortedByUsage) {
                if (result.length >= MAX_VISIBLE_ACTIONS) break;
                result.push(action);
                usedIds.add(action.id);
            }
        }

        // 3. If still not enough (no history), use default order
        if (result.length < MAX_VISIBLE_ACTIONS) {
            for (const action of ALL_QUICK_ACTIONS) {
                if (result.length >= MAX_VISIBLE_ACTIONS) break;
                if (!usedIds.has(action.id)) {
                    result.push(action);
                }
            }
        }

        return result;
    } catch (error) {
        console.error('Error getting ordered quick actions:', error);
        // Fallback to default first 4
        return ALL_QUICK_ACTIONS.slice(0, MAX_VISIBLE_ACTIONS);
    }
};

/**
 * Toggle pin status for an action
 */
export const togglePinAction = async (actionId: string): Promise<string[]> => {
    const pinned = await getPinnedActions();

    if (pinned.includes(actionId)) {
        // Unpin
        const newPinned = pinned.filter(id => id !== actionId);
        await savePinnedActions(newPinned);
        return newPinned;
    } else {
        // Pin (max 4)
        if (pinned.length < MAX_VISIBLE_ACTIONS) {
            const newPinned = [...pinned, actionId];
            await savePinnedActions(newPinned);
            return newPinned;
        }
        return pinned;
    }
};

/**
 * Check if an action is pinned
 */
export const isActionPinned = async (actionId: string): Promise<boolean> => {
    const pinned = await getPinnedActions();
    return pinned.includes(actionId);
};

/**
 * Reset all customization (back to auto mode)
 */
export const resetQuickActions = async (): Promise<void> => {
    await AsyncStorage.multiRemove([STORAGE_KEY_PINNED, STORAGE_KEY_USAGE]);
};
