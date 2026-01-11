/**
 * IA-Flow - Donor Service
 * Manages donor tokens and verification
 */

import { v4 as uuidv4 } from 'uuid';

// In-memory store (replace with database in production)
const donors = new Map();

// Token expiration: 30 days
const TOKEN_EXPIRATION_MS = 30 * 24 * 60 * 60 * 1000;

/**
 * Create a new donor token
 * @param {Object} donationData - Stripe payment data
 * @returns {string} - The donor token
 */
export function createDonorToken(donationData) {
    const token = uuidv4();

    donors.set(token, {
        createdAt: Date.now(),
        expiresAt: Date.now() + TOKEN_EXPIRATION_MS,
        amount: donationData.amount,
        currency: donationData.currency,
        stripeSessionId: donationData.sessionId,
        email: donationData.email
    });

    // Log token creation (without exposing token in production)
    if (process.env.NODE_ENV !== 'production') {
        console.log(`✅ New donor token created: ${token.substring(0, 8)}...`);
    } else {
        console.log('✅ New donor token created');
    }

    return token;
}

/**
 * Verify a donor token
 * @param {string} token - The donor token
 * @returns {boolean} - Whether the token is valid
 */
export async function verifyDonorToken(token) {
    if (!token) return false;

    const donor = donors.get(token);

    if (!donor) {
        return false;
    }

    // Check if expired
    if (Date.now() > donor.expiresAt) {
        donors.delete(token);
        return false;
    }

    return true;
}

/**
 * Get donor information
 * @param {string} token - The donor token
 * @returns {Object|null} - Donor information or null
 */
export function getDonorInfo(token) {
    if (!token) return null;

    const donor = donors.get(token);

    if (!donor || Date.now() > donor.expiresAt) {
        return null;
    }

    return {
        createdAt: donor.createdAt,
        expiresAt: donor.expiresAt,
        amount: donor.amount,
        currency: donor.currency
    };
}

/**
 * Get rate limit for a donor/non-donor
 * @param {string} token - The donor token (optional)
 * @returns {number} - Maximum requests allowed
 */
export function getRateLimit(token) {
    const defaultLimit = parseInt(process.env.RATE_LIMIT_MAX_REQUESTS) || 20;
    const donorLimit = parseInt(process.env.RATE_LIMIT_DONOR_MAX_REQUESTS) || 50;

    if (!token) return defaultLimit;

    const donor = donors.get(token);
    if (!donor || Date.now() > donor.expiresAt) {
        return defaultLimit;
    }

    return donorLimit;
}

/**
 * Clean up expired tokens (run periodically)
 */
export function cleanupExpiredTokens() {
    const now = Date.now();
    let cleaned = 0;

    for (const [token, donor] of donors.entries()) {
        if (now > donor.expiresAt) {
            donors.delete(token);
            cleaned++;
        }
    }

    if (cleaned > 0) {
        console.log(`🧹 Cleaned up ${cleaned} expired donor tokens`);
    }
}

// Run cleanup every hour
setInterval(cleanupExpiredTokens, 60 * 60 * 1000);

export default {
    createDonorToken,
    verifyDonorToken,
    getDonorInfo,
    getRateLimit,
    cleanupExpiredTokens
};
