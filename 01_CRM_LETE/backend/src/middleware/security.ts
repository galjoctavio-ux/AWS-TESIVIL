import { Request, Response, NextFunction } from 'express';
import dotenv from 'dotenv';

dotenv.config();

export const requireAuth = (req: Request, res: Response, next: NextFunction) => {
  // Permitimos que el Webhook de WhatsApp pase sin clave
  if (req.originalUrl.includes('/api/webhook') || req.originalUrl.includes('/webhook')) {
    return next();
  }

  // Buscamos la llave en los headers
  const apiKey = req.headers['x-app-key'];
  const validKey = process.env.APP_SECRET;

  if (!validKey) {
    console.error('⚠️ APP_SECRET no está configurado en .env');
    return res.status(500).json({ error: 'Error de configuración del servidor' });
  }

  if (!apiKey || apiKey !== validKey) {
    console.log(`🔒 Acceso denegado. Key recibida: ${apiKey ? 'presente pero incorrecta' : 'ausente'}`);
    return res.status(403).json({ error: 'Acceso Denegado. Falta la llave de seguridad.' });
  }

  next();
};
