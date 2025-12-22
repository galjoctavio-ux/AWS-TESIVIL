import AsyncStorage from '@react-native-async-storage/async-storage';

const STATS_KEY = '@synapse_user_stats';

export interface UserStats {
    promptsGenerated: number;
    projectsViewed: number;
    reviewsGiven: number;
}

const DEFAULT_STATS: UserStats = {
    promptsGenerated: 0,
    projectsViewed: 0,
    reviewsGiven: 0,
};

export const getUserStats = async (): Promise<UserStats> => {
    try {
        const stats = await AsyncStorage.getItem(STATS_KEY);
        if (stats) {
            return { ...DEFAULT_STATS, ...JSON.parse(stats) };
        }
        return DEFAULT_STATS;
    } catch (error) {
        console.error('Error getting user stats:', error);
        return DEFAULT_STATS;
    }
};

export const incrementStat = async (stat: keyof UserStats): Promise<UserStats> => {
    try {
        const currentStats = await getUserStats();
        const newStats = {
            ...currentStats,
            [stat]: currentStats[stat] + 1,
        };
        await AsyncStorage.setItem(STATS_KEY, JSON.stringify(newStats));
        return newStats;
    } catch (error) {
        console.error('Error incrementing stat:', error);
        return await getUserStats();
    }
};

export const resetStats = async (): Promise<void> => {
    try {
        await AsyncStorage.removeItem(STATS_KEY);
    } catch (error) {
        console.error('Error resetting stats:', error);
    }
};
