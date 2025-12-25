/**
 * Traffic Distance Service
 * PRO Feature: Calculates real-time traffic distance using Google Directions API
 * 
 * Strategy:
 * - Cache results for 1 hour to minimize API costs
 * - Fallback to Haversine if API fails
 * - Persist cache in AsyncStorage for app restarts
 */

import AsyncStorage from '@react-native-async-storage/async-storage';
import { getLinearDistance } from './haversine-calculator';

// ==========================================
// TYPES
// ==========================================

export interface Coordinates {
    latitude: number;
    longitude: number;
}

export interface TrafficDistanceResult {
    distanceKm: number;
    durationMinutes: number;
    durationInTrafficMinutes?: number;
    isFromCache: boolean;
    lastUpdated: Date;
    isTrafficData: boolean; // true if from API, false if fallback to Haversine
}

interface CachedTrafficData {
    result: Omit<TrafficDistanceResult, 'isFromCache' | 'lastUpdated'> & { lastUpdated: string };
    cacheKey: string;
    expiresAt: number; // timestamp
}

// ==========================================
// CONSTANTS
// ==========================================

const CACHE_TTL_MS = 60 * 60 * 1000; // 1 hour in milliseconds
const CACHE_PREFIX = 'traffic_cache_';
const API_KEY = process.env.EXPO_PUBLIC_GOOGLE_DIRECTIONS_API_KEY;

// In-memory cache for faster access
const memoryCache: Map<string, CachedTrafficData> = new Map();

// ==========================================
// CACHE FUNCTIONS
// ==========================================

/**
 * Generate a cache key from origin and destination coordinates
 * Rounds to 3 decimal places (~111m precision) to increase cache hits
 */
const getCacheKey = (origin: Coordinates, destination: Coordinates): string => {
    const roundTo3 = (n: number) => Math.round(n * 1000) / 1000;
    return `${roundTo3(origin.latitude)},${roundTo3(origin.longitude)}_${roundTo3(destination.latitude)},${roundTo3(destination.longitude)}`;
};

/**
 * Get cached data if still valid
 */
const getCachedData = async (cacheKey: string): Promise<CachedTrafficData | null> => {
    // Check memory cache first
    const memCached = memoryCache.get(cacheKey);
    if (memCached && memCached.expiresAt > Date.now()) {
        return memCached;
    }

    // Check AsyncStorage
    try {
        const stored = await AsyncStorage.getItem(CACHE_PREFIX + cacheKey);
        if (stored) {
            const data: CachedTrafficData = JSON.parse(stored);
            if (data.expiresAt > Date.now()) {
                // Restore to memory cache
                memoryCache.set(cacheKey, data);
                return data;
            } else {
                // Expired, remove from storage
                await AsyncStorage.removeItem(CACHE_PREFIX + cacheKey);
            }
        }
    } catch (error) {
        console.warn('[TrafficService] Cache read error:', error);
    }

    return null;
};

/**
 * Save data to cache
 */
const setCachedData = async (cacheKey: string, result: TrafficDistanceResult): Promise<void> => {
    const cacheData: CachedTrafficData = {
        result: {
            distanceKm: result.distanceKm,
            durationMinutes: result.durationMinutes,
            durationInTrafficMinutes: result.durationInTrafficMinutes,
            isTrafficData: result.isTrafficData,
            lastUpdated: result.lastUpdated.toISOString(),
        },
        cacheKey,
        expiresAt: Date.now() + CACHE_TTL_MS,
    };

    // Save to memory
    memoryCache.set(cacheKey, cacheData);

    // Save to AsyncStorage
    try {
        await AsyncStorage.setItem(CACHE_PREFIX + cacheKey, JSON.stringify(cacheData));
    } catch (error) {
        console.warn('[TrafficService] Cache write error:', error);
    }
};

// ==========================================
// API FUNCTIONS
// ==========================================

/**
 * Fetch traffic distance from Google Directions API
 */
const fetchGoogleDirections = async (
    origin: Coordinates,
    destination: Coordinates
): Promise<TrafficDistanceResult | null> => {
    if (!API_KEY) {
        console.warn('[TrafficService] No API key configured');
        return null;
    }

    try {
        const url = `https://maps.googleapis.com/maps/api/directions/json?origin=${origin.latitude},${origin.longitude}&destination=${destination.latitude},${destination.longitude}&departure_time=now&traffic_model=best_guess&key=${API_KEY}`;

        const response = await fetch(url);
        const data = await response.json();

        if (data.status !== 'OK' || !data.routes?.[0]?.legs?.[0]) {
            console.warn('[TrafficService] API error:', data.status);
            return null;
        }

        const leg = data.routes[0].legs[0];

        return {
            distanceKm: Number((leg.distance.value / 1000).toFixed(1)),
            durationMinutes: Math.round(leg.duration.value / 60),
            durationInTrafficMinutes: leg.duration_in_traffic
                ? Math.round(leg.duration_in_traffic.value / 60)
                : Math.round(leg.duration.value / 60),
            isFromCache: false,
            lastUpdated: new Date(),
            isTrafficData: true,
        };
    } catch (error) {
        console.error('[TrafficService] API fetch error:', error);
        return null;
    }
};

/**
 * Fallback to Haversine distance when API is unavailable
 */
const getHaversineFallback = (origin: Coordinates, destination: Coordinates): TrafficDistanceResult => {
    const distanceKm = getLinearDistance(origin, destination);

    // Estimate duration: ~40 km/h average city speed
    const estimatedMinutes = Math.round((distanceKm / 40) * 60);

    return {
        distanceKm,
        durationMinutes: estimatedMinutes,
        durationInTrafficMinutes: estimatedMinutes,
        isFromCache: false,
        lastUpdated: new Date(),
        isTrafficData: false, // This is not real traffic data
    };
};

// ==========================================
// MAIN EXPORT
// ==========================================

/**
 * Get traffic distance between two points
 * - Returns cached data if available and less than 1 hour old
 * - Fetches from Google Directions API for PRO users
 * - Falls back to Haversine if API unavailable
 */
export const getTrafficDistance = async (
    origin: Coordinates,
    destination: Coordinates
): Promise<TrafficDistanceResult> => {
    const cacheKey = getCacheKey(origin, destination);

    // Check cache first
    const cached = await getCachedData(cacheKey);
    if (cached) {
        console.log('[TrafficService] Returning cached data');
        return {
            distanceKm: cached.result.distanceKm,
            durationMinutes: cached.result.durationMinutes,
            durationInTrafficMinutes: cached.result.durationInTrafficMinutes,
            isFromCache: true,
            lastUpdated: new Date(cached.result.lastUpdated),
            isTrafficData: cached.result.isTrafficData,
        };
    }

    // Fetch from API
    console.log('[TrafficService] Fetching from Google Directions API...');
    const apiResult = await fetchGoogleDirections(origin, destination);

    if (apiResult) {
        // Cache the result
        await setCachedData(cacheKey, apiResult);
        return apiResult;
    }

    // Fallback to Haversine
    console.log('[TrafficService] Falling back to Haversine');
    const fallback = getHaversineFallback(origin, destination);

    // Cache the fallback too (to avoid repeated failed API calls)
    await setCachedData(cacheKey, fallback);

    return fallback;
};

/**
 * Clear all traffic cache (useful for debugging)
 */
export const clearTrafficCache = async (): Promise<void> => {
    memoryCache.clear();

    try {
        const keys = await AsyncStorage.getAllKeys();
        const trafficKeys = keys.filter(k => k.startsWith(CACHE_PREFIX));
        await AsyncStorage.multiRemove(trafficKeys);
        console.log('[TrafficService] Cache cleared');
    } catch (error) {
        console.error('[TrafficService] Clear cache error:', error);
    }
};

/**
 * Format duration to user-friendly string
 */
export const formatDuration = (minutes: number): string => {
    if (minutes < 60) {
        return `${minutes} min`;
    }
    const hours = Math.floor(minutes / 60);
    const mins = minutes % 60;
    return mins > 0 ? `${hours}h ${mins}min` : `${hours}h`;
};
