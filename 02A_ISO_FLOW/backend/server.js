/**
 * IA-Flow - Backend Server
 * Express server with API routes, rate limiting, and security
 */

import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import { config } from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';

// Routes
import chatRoutes from './routes/chat.js';
import flowRoutes from './routes/flow.js';
import stripeRoutes from './routes/stripe.js';

// Middleware
import { rateLimiter, donationPopupTracker } from './middleware/rateLimiter.js';
import { verifyRecaptcha } from './middleware/recaptcha.js';

// Load environment variables
config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const PORT = process.env.PORT || 3000;

// ==========================================
// Security Validation for Production
// ==========================================
if (process.env.NODE_ENV === 'production' && !process.env.FRONTEND_URL) {
    console.error('⚠️ CRITICAL: FRONTEND_URL not configured for production');
    process.exit(1);
}

// ==========================================
// Middleware
// ==========================================

// Security Headers with Helmet
app.use(helmet({
    contentSecurityPolicy: {
        directives: {
            defaultSrc: ["'self'"],
            scriptSrc: ["'self'", "'unsafe-inline'", "https://www.google.com", "https://www.gstatic.com", "https://js.stripe.com"],
            frameSrc: ["https://www.google.com", "https://js.stripe.com"],
            styleSrc: ["'self'", "'unsafe-inline'", "https://fonts.googleapis.com"],
            fontSrc: ["'self'", "https://fonts.gstatic.com"],
            imgSrc: ["'self'", "data:", "https:"],
            connectSrc: ["'self'", "https://api.stripe.com", "https://www.google.com"]
        }
    },
    crossOriginEmbedderPolicy: false // Required for Stripe embeds
}));

// CORS
app.use(cors({
    origin: process.env.NODE_ENV === 'production'
        ? process.env.FRONTEND_URL
        : ['http://localhost:5173', 'http://127.0.0.1:5173'],
    credentials: true
}));

// JSON body parser
app.use(express.json());

// ==========================================
// Request Logging Middleware (for PM2 logs)
// ==========================================
app.use((req, res, next) => {
    const startTime = Date.now();
    const timestamp = new Date().toISOString();

    // Log incoming request
    if (req.path.startsWith('/api')) {
        const clientIP = req.headers['x-forwarded-for'] || req.socket.remoteAddress || 'unknown';
        console.log(`[${timestamp}] [INFO] [REQUEST] ➡️ ${req.method} ${req.path} (IP: ${clientIP})`);

        // Log request body for POST requests (truncated)
        if (req.method === 'POST' && req.body) {
            const bodyPreview = JSON.stringify(req.body);
            console.log(`[${timestamp}] [DEBUG] [REQUEST] 📦 Body: ${bodyPreview.length > 200 ? bodyPreview.substring(0, 200) + '...' : bodyPreview}`);
        }
    }

    // Log response when finished
    res.on('finish', () => {
        if (req.path.startsWith('/api')) {
            const duration = Date.now() - startTime;
            const statusIcon = res.statusCode >= 400 ? '❌' : '✅';
            console.log(`[${timestamp}] [INFO] [RESPONSE] ${statusIcon} ${req.method} ${req.path} - ${res.statusCode} (${duration}ms)`);
        }
    });

    next();
});

// Static files (for production)
if (process.env.NODE_ENV === 'production') {
    app.use(express.static(path.join(__dirname, '../frontend')));
}

// Serve flujo-iso.json
app.use('/flujo-iso.json', express.static(path.join(__dirname, '../flujo-iso.json')));

// ==========================================
// Health Check
// ==========================================

app.get('/api/health', (req, res) => {
    res.json({
        status: 'ok',
        timestamp: new Date().toISOString(),
        version: '1.0.0'
    });
});

// ==========================================
// Configuration Endpoint
// ==========================================

app.get('/api/config', (req, res) => {
    res.json({
        recaptchaSiteKey: process.env.RECAPTCHA_SITE_KEY || '',
        stripePublishableKey: process.env.STRIPE_PUBLISHABLE_KEY || '',
        donationPopupQueries: parseInt(process.env.DONATION_POPUP_QUERIES) || 3,
        donationPopupWindowMs: parseInt(process.env.DONATION_POPUP_WINDOW_MS) || 300000
    });
});

// ==========================================
// API Routes
// ==========================================

// Apply rate limiter to all API routes
app.use('/api', rateLimiter);

// Apply donation popup tracker
app.use('/api/chat', donationPopupTracker);

// Chat routes
app.use('/api/chat', chatRoutes);

// Flow routes
app.use('/api/flow', flowRoutes);

// Stripe routes
app.use('/api/stripe', stripeRoutes);

// reCAPTCHA verification
app.post('/api/captcha/verify', verifyRecaptcha);

// ==========================================
// Donor verification
// ==========================================

import { verifyDonorToken } from './services/donorService.js';

app.get('/api/donor/verify', async (req, res) => {
    const authHeader = req.headers.authorization;

    if (!authHeader || !authHeader.startsWith('Bearer ')) {
        return res.json({ valid: false });
    }

    const token = authHeader.substring(7);
    const isValid = await verifyDonorToken(token);

    res.json({ valid: isValid });
});

// ==========================================
// Error Handling
// ==========================================

app.use((err, req, res, next) => {
    console.error('Server error:', err);

    // Rate limit exceeded
    if (err.status === 429) {
        return res.status(429).json({
            error: 'Has alcanzado el límite de consultas. Considera donar para aumentar tu límite.',
            retryAfter: err.retryAfter || 86400
        });
    }

    res.status(err.status || 500).json({
        error: err.message || 'Error interno del servidor'
    });
});

// 404 handler
app.use((req, res) => {
    res.status(404).json({ error: 'Endpoint no encontrado' });
});

// ==========================================
// Start Server
// ==========================================

app.listen(PORT, () => {
    console.log(`
╔══════════════════════════════════════════════╗
║                                              ║
║   ⚡ IA-Flow Server                          ║
║                                              ║
║   Running on: http://localhost:${PORT}          ║
║   Environment: ${process.env.NODE_ENV || 'development'}                  ║
║                                              ║
╚══════════════════════════════════════════════╝
    `);
});

export default app;
