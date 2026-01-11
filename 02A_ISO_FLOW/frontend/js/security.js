/**
 * IA-Flow - Security Utilities
 * Provides sanitization and security helpers for frontend
 */

/**
 * Sanitize a string to prevent XSS attacks
 * Escapes HTML special characters
 * @param {string} text - The text to sanitize
 * @returns {string} - Sanitized text safe for innerHTML
 */
export function sanitizeHTML(text) {
    if (!text) return '';
    if (typeof text !== 'string') return String(text);

    const div = document.createElement('div');
    div.textContent = text;
    return div.innerHTML;
}

/**
 * Escape attribute content for HTML
 * Use when inserting user content into HTML attributes
 * @param {string} str - The string to escape
 * @returns {string} - Escaped string safe for attributes
 */
export function escapeAttr(str) {
    if (!str) return '';
    return str
        .replace(/&/g, '&amp;')
        .replace(/"/g, '&quot;')
        .replace(/'/g, '&#39;')
        .replace(/</g, '&lt;')
        .replace(/>/g, '&gt;');
}

/**
 * Sanitize URL to prevent javascript: protocol attacks
 * @param {string} url - The URL to sanitize
 * @returns {string} - Sanitized URL or empty string if malicious
 */
export function sanitizeURL(url) {
    if (!url) return '';

    try {
        const parsed = new URL(url, window.location.origin);
        // Only allow http, https, and relative URLs
        if (!['http:', 'https:', ''].includes(parsed.protocol)) {
            console.warn('Blocked potentially malicious URL:', url);
            return '';
        }
        return url;
    } catch (e) {
        // If URL parsing fails, it might be a relative URL
        if (url.startsWith('/') || url.startsWith('./') || url.startsWith('../')) {
            return url;
        }
        console.warn('Invalid URL blocked:', url);
        return '';
    }
}

/**
 * Create a safe HTML element with text content (not innerHTML)
 * @param {string} tag - The HTML tag name
 * @param {object} attributes - Object with attributes
 * @param {string} textContent - Text content (will be escaped)
 * @returns {HTMLElement} - The created element
 */
export function createElement(tag, attributes = {}, textContent = '') {
    const element = document.createElement(tag);

    for (const [key, value] of Object.entries(attributes)) {
        if (key === 'className') {
            element.className = value;
        } else if (key === 'dataset') {
            for (const [dataKey, dataValue] of Object.entries(value)) {
                element.dataset[dataKey] = dataValue;
            }
        } else if (key.startsWith('on')) {
            // Skip event handlers for security
            console.warn('Event handler attributes are not allowed');
        } else {
            element.setAttribute(key, sanitizeHTML(value));
        }
    }

    if (textContent) {
        element.textContent = textContent;
    }

    return element;
}

export default {
    sanitizeHTML,
    escapeAttr,
    sanitizeURL,
    createElement
};
