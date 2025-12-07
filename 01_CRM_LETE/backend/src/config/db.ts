import { Pool } from 'pg';
import dotenv from 'dotenv';

dotenv.config();

export const pool = new Pool({
  user: process.env.DB_USER,
  host: process.env.DB_HOST,
  database: process.env.DB_NAME,
  password: process.env.DB_PASS,
  port: parseInt(process.env.DB_PORT || '5432'),
});

pool.on('connect', (client) => {
  // ESTO ES VITAL: Forzamos la zona horaria a México en cada conexión
  client.query("SET TIME ZONE 'America/Mexico_City'")
    .catch(err => console.error('Error configurando TimeZone', err));
});

export const query = (text: string, params?: any[]) => pool.query(text, params);
