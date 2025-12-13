import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';

dotenv.config();

const supabaseUrl = process.env.SUPABASE_URL;
// IMPORTANTE: Usamos la Service Key (Admin) para poder escribir/leer sin restricciones
const supabaseKey = process.env.SUPABASE_SERVICE_KEY;

if (!supabaseUrl || !supabaseKey) {
    console.error('❌ ERROR FATAL: Faltan variables SUPABASE_URL o SUPABASE_SERVICE_KEY en .env');
    // No lanzamos throw para no tumbar la app entera si falta config, pero los logs avisarán
}

export const supabaseAdmin = createClient(supabaseUrl || '', supabaseKey || '', {
    auth: {
        autoRefreshToken: false,
        persistSession: false
    }
});