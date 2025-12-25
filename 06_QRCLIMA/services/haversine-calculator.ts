/**
 * Haversine Calculator Service
 * Used for "Linear Route Optimization" ($0 Cost Strategy)
 */

interface Coordinates {
    latitude: number;
    longitude: number;
}

/**
 * Calculates the linear distance (as the crow flies) between two points in Kilometers.
 * Uses the Haversine formula.
 */
export const getLinearDistance = (start: Coordinates, end: Coordinates): number => {
    const R = 6371; // Radius of the earth in km
    const dLat = deg2rad(end.latitude - start.latitude);
    const dLon = deg2rad(end.longitude - start.longitude);
    const a =
        Math.sin(dLat / 2) * Math.sin(dLat / 2) +
        Math.cos(deg2rad(start.latitude)) * Math.cos(deg2rad(end.latitude)) *
        Math.sin(dLon / 2) * Math.sin(dLon / 2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
    const d = R * c; // Distance in km
    return Number(d.toFixed(1)); // Return parsed float with 1 decimal
};

function deg2rad(deg: number): number {
    return deg * (Math.PI / 180);
}

/**
 * Formats a distance into a user-friendly string
 */
export const formatDistance = (km: number): string => {
    if (km < 1) {
        return `${Math.round(km * 1000)} m`;
    }
    return `${km.toFixed(1)} km`;
};

/**
 * Calculates total route efficiency (sum of linear distances)
 */
export const getRouteEfficiency = (points: Coordinates[]): number => {
    let totalKm = 0;
    for (let i = 0; i < points.length - 1; i++) {
        totalKm += getLinearDistance(points[i], points[i + 1]);
    }
    return Number(totalKm.toFixed(1));
};
