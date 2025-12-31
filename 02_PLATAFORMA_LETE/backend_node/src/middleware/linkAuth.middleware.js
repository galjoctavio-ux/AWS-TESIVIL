// backend_node/src/middleware/linkAuth.middleware.js

// Token simple para validar el acceso sin login.
// En producción, cámbialo por una cadena larga y segura en tu .env
const TOKEN_SECRETO = process.env.ACCESS_TOKEN_SECRET || 'TEMPORAL_DEV_TOKEN_123';

export const verifyLinkToken = (req, res, next) => {
    // Busca el token en el Header o en la URL (?token=...)
    const token = req.headers['x-access-token'] || req.query.token;

    if (!token || token !== TOKEN_SECRETO) {
        return res.status(403).json({
            error: 'Acceso denegado. Token de visualización inválido.'
        });
    }

    next();
};