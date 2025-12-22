-- =============================================================================
-- TESIVIL App Hub - Database Schema
-- Execute this in Supabase SQL Editor
-- =============================================================================

-- Create apps table
CREATE TABLE IF NOT EXISTS apps (
  id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  nombre text NOT NULL,
  slug text UNIQUE NOT NULL,
  categoria text,
  icono_url text,
  preview_url text,
  descripcion_corta text,
  descripcion_larga text,
  features jsonb,
  drive_id text,
  url_web text,
  created_at timestamp with time zone DEFAULT timezone('utc'::text, now())
);

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_apps_categoria ON apps(categoria);
CREATE INDEX IF NOT EXISTS idx_apps_slug ON apps(slug);
CREATE INDEX IF NOT EXISTS idx_apps_created_at ON apps(created_at DESC);

-- Enable Row Level Security
ALTER TABLE apps ENABLE ROW LEVEL SECURITY;

-- Drop existing policy if exists and recreate
DROP POLICY IF EXISTS "Apps are viewable by everyone" ON apps;

CREATE POLICY "Apps are viewable by everyone" 
ON apps FOR SELECT 
TO anon 
USING (true);

-- =============================================================================
-- Sample Data (Optional - Remove in production)
-- =============================================================================

-- Insert sample apps for testing
INSERT INTO apps (nombre, slug, categoria, descripcion_corta, descripcion_larga, features, url_web)
VALUES 
(
  'QR Clima',
  'qrclima',
  'Web App',
  'Genera códigos QR con información meteorológica en tiempo real.',
  'QR Clima es una herramienta innovadora que combina la funcionalidad de códigos QR con datos meteorológicos actualizados. Perfecta para eventos al aire libre, señalización turística y más.',
  '["Generación instantánea de QR", "Datos meteorológicos en tiempo real", "Múltiples formatos de exportación", "Personalización de diseño", "API para integraciones"]',
  'https://qrclima.tesivil.com'
),
(
  'Synapse AI',
  'synapse-ai',
  'Android',
  'Tu asistente de inteligencia artificial de bolsillo.',
  'Synapse AI es una aplicación móvil que te conecta con los últimos avances en inteligencia artificial. Genera prompts, analiza modelos de IA y mantente al día con las noticias del sector.',
  '["Motor de prompts con IA", "Comparador de modelos", "Feed de noticias curado", "Showcase de proyectos", "Modo offline"]',
  NULL
),
(
  'Mr. Frío Admin',
  'mrfrio-admin',
  'Web App',
  'Panel de administración para la cadena Mr. Frío.',
  'Sistema completo de gestión para la cadena de heladerías Mr. Frío. Control de inventario, ventas, reportes y más.',
  '["Gestión de inventario", "Reportes de ventas", "Control de sucursales", "Dashboard en tiempo real", "Exportación de datos"]',
  'https://admin.mrfrio.com'
)
ON CONFLICT (slug) DO NOTHING;

-- =============================================================================
-- Verification Query
-- =============================================================================
-- Run this to verify the table was created correctly:
-- SELECT * FROM apps;
