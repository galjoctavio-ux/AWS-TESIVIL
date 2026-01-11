/**
 * IA-Flow - reCAPTCHA Middleware
 * Verifies Google reCAPTCHA tokens
 */

/**
 * Verify reCAPTCHA token
 * POST /api/captcha/verify
 */
export async function verifyRecaptcha(req, res) {
    try {
        const { token } = req.body;

        if (!token) {
            return res.status(400).json({
                success: false,
                error: 'Token de CAPTCHA requerido'
            });
        }

        const secretKey = process.env.RECAPTCHA_SECRET_KEY;

        if (!secretKey) {
            console.warn('⚠️ reCAPTCHA secret key not configured');
            // In development, allow without verification
            if (process.env.NODE_ENV === 'development') {
                return res.json({ success: true, development: true });
            }
            return res.status(500).json({
                success: false,
                error: 'CAPTCHA no configurado'
            });
        }

        // Verify with Google
        const verifyUrl = 'https://www.google.com/recaptcha/api/siteverify';
        const params = new URLSearchParams({
            secret: secretKey,
            response: token,
            remoteip: req.headers['x-forwarded-for']?.split(',')[0].trim() || req.ip
        });

        const response = await fetch(verifyUrl, {
            method: 'POST',
            body: params
        });

        const data = await response.json();

        if (data.success) {
            // Store verification in session or return success
            res.json({
                success: true,
                score: data.score, // Only for reCAPTCHA v3
                action: data.action
            });
        } else {
            console.warn('reCAPTCHA verification failed:', data['error-codes']);
            res.json({
                success: false,
                error: 'Verificación fallida. Por favor, intenta de nuevo.',
                codes: data['error-codes']
            });
        }

    } catch (error) {
        console.error('reCAPTCHA verification error:', error);
        res.status(500).json({
            success: false,
            error: 'Error al verificar CAPTCHA'
        });
    }
}

/**
 * Middleware to require CAPTCHA verification for protected routes
 * This actually verifies the token with Google's API
 */
export async function requireCaptcha(req, res, next) {
    const captchaToken = req.headers['x-captcha-token'];

    if (!captchaToken) {
        return res.status(403).json({
            error: 'Verificación de CAPTCHA requerida',
            requiresCaptcha: true
        });
    }

    const secretKey = process.env.RECAPTCHA_SECRET_KEY;

    // In development without secret key, allow bypass with warning
    if (!secretKey) {
        if (process.env.NODE_ENV === 'development') {
            console.warn('⚠️ CAPTCHA verification skipped (no secret key in development)');
            return next();
        }
        return res.status(500).json({ error: 'CAPTCHA no configurado' });
    }

    try {
        // Verify token with Google
        const verifyUrl = 'https://www.google.com/recaptcha/api/siteverify';
        const params = new URLSearchParams({
            secret: secretKey,
            response: captchaToken,
            remoteip: req.headers['x-forwarded-for']?.split(',')[0].trim() || req.ip
        });

        const response = await fetch(verifyUrl, {
            method: 'POST',
            body: params
        });

        const data = await response.json();

        if (!data.success) {
            console.warn('CAPTCHA verification failed:', data['error-codes']);
            return res.status(403).json({
                error: 'Verificación CAPTCHA fallida',
                requiresCaptcha: true
            });
        }

        next();
    } catch (error) {
        console.error('CAPTCHA verification error:', error);
        return res.status(500).json({ error: 'Error verificando CAPTCHA' });
    }
}

export default {
    verifyRecaptcha,
    requireCaptcha
};
