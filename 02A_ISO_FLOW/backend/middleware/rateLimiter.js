/**
 * IA-Flow - Rate Limiter Middleware
 * Implements rate limiting per IP with different limits for donors
 */

import rateLimit from 'express-rate-limit';
import { getRateLimit, verifyDonorToken } from '../services/donorService.js';

// Store for tracking queries per IP (for donation popup)
const queryTracking = new Map();

/**
 * Main rate limiter
 * Limits requests per IP per day
 */
export const rateLimiter = rateLimit({
    windowMs: parseInt(process.env.RATE_LIMIT_WINDOW_MS) || 24 * 60 * 60 * 1000, // 24 hours
    max: async (req) => {
        // Check if user is a donor
        const authHeader = req.headers.authorization;
        if (authHeader && authHeader.startsWith('Bearer ')) {
            const token = authHeader.substring(7);
            const limit = getRateLimit(token);
            return limit;
        }
        return parseInt(process.env.RATE_LIMIT_MAX_REQUESTS) || 20;
    },
    message: {
        error: 'Has alcanzado el límite diario de consultas. Considera donar para aumentar tu límite.',
        retryAfter: 86400
    },
    standardHeaders: true,
    legacyHeaders: false,
    keyGenerator: (req) => {
        // Use X-Forwarded-For for proxied requests, otherwise use IP
        return req.headers['x-forwarded-for']?.split(',')[0].trim() || req.ip;
    },
    handler: (req, res, next, options) => {
        res.status(429).json({
            error: 'Has alcanzado el límite diario de consultas.',
            message: 'Considera donar para aumentar tu límite y apoyar el servicio.',
            retryAfter: Math.ceil((options.windowMs - (Date.now() % options.windowMs)) / 1000)
        });
    }
});

/**
 * Donation popup tracker middleware
 * Tracks queries within a time window to trigger donation popup
 */
export const donationPopupTracker = (req, res, next) => {
    // Skip for donors
    const authHeader = req.headers.authorization;
    if (authHeader && authHeader.startsWith('Bearer ')) {
        const token = authHeader.substring(7);
        // Async verification - for now just check if token exists
        if (token) {
            return next();
        }
    }

    const ip = req.headers['x-forwarded-for']?.split(',')[0].trim() || req.ip;
    const now = Date.now();
    const windowMs = parseInt(process.env.DONATION_POPUP_WINDOW_MS) || 300000; // 5 minutes
    const threshold = parseInt(process.env.DONATION_POPUP_QUERIES) || 3;

    // Get or create tracking data for this IP
    let tracking = queryTracking.get(ip);

    if (!tracking) {
        tracking = {
            queries: [],
            popupShown: false
        };
        queryTracking.set(ip, tracking);
    }

    // Remove old queries outside the window
    tracking.queries = tracking.queries.filter(time => now - time < windowMs);

    // Add current query
    tracking.queries.push(now);

    // Check if we should suggest showing popup
    if (tracking.queries.length >= threshold && !tracking.popupShown) {
        res.set('X-Show-Donation-Popup', 'true');
        tracking.popupShown = true;

        // Reset popup flag after window expires
        setTimeout(() => {
            if (queryTracking.has(ip)) {
                queryTracking.get(ip).popupShown = false;
            }
        }, windowMs);
    }

    // Save tracking data
    queryTracking.set(ip, tracking);

    next();
};

/**
 * Cleanup old tracking data periodically
 */
setInterval(() => {
    const now = Date.now();
    const windowMs = parseInt(process.env.DONATION_POPUP_WINDOW_MS) || 300000;

    for (const [ip, tracking] of queryTracking.entries()) {
        // Remove if no recent queries
        const recentQueries = tracking.queries.filter(time => now - time < windowMs);
        if (recentQueries.length === 0) {
            queryTracking.delete(ip);
        } else {
            tracking.queries = recentQueries;
        }
    }
}, 60000); // Cleanup every minute

export default {
    rateLimiter,
    donationPopupTracker
};
