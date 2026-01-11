-- =============================================
-- CUENTATRON MVP - SCHEMA SUPABASE
-- Módulo 08: Backend/API
-- =============================================
-- ADVERTENCIA: Columnas marcadas [ESP32] son INAMOVIBLES
-- Referencia: 02_REGLAS_DE_EJECUCION_IA.md (Sección 6)

-- =============================================
-- 1. TIPOS ENUMERADOS
-- =============================================

-- Tipos de tarifa CFE
CREATE TYPE tarifa_cfe AS ENUM ('01', '01A', '01B', 'PDBT', 'DAC');

-- Estados de dispositivo
CREATE TYPE estado_dispositivo AS ENUM ('sin_vincular', 'vinculado', 'servicio_7dias', 'suscrito');

-- Estados de suscripción
CREATE TYPE estado_suscripcion AS ENUM ('inactive', 'active', 'grace_period', 'expired');

-- Tipos de plan
CREATE TYPE tipo_plan AS ENUM ('7_dias', 'permanente');

-- =============================================
-- 2. TABLA: planes
-- =============================================
-- Tipos de planes disponibles (4 tipos según UXUI-029)

CREATE TABLE public.planes (
  id bigserial PRIMARY KEY,
  created_at timestamptz DEFAULT now(),
  nombre_plan text NOT NULL,
  descripcion text,
  precio numeric NOT NULL DEFAULT 0,
  tipo tipo_plan NOT NULL,
  stripe_plan_id text UNIQUE,
  -- Características del plan
  con_paneles boolean DEFAULT false,
  bifasico boolean DEFAULT false
);

-- Insertar los 4 tipos de plan MVP
INSERT INTO public.planes (nombre_plan, descripcion, tipo, con_paneles, bifasico, precio) VALUES
  ('Monofásico Sin Paneles', 'Plan básico monofásico', 'permanente', false, false, 0),
  ('Monofásico Con Paneles', 'Plan monofásico con paneles solares', 'permanente', true, false, 0),
  ('Bifásico Sin Paneles', 'Plan bifásico', 'permanente', false, true, 0),
  ('Bifásico Con Paneles', 'Plan bifásico con paneles solares', 'permanente', true, true, 0);

-- =============================================
-- 3. TABLA: usuarios
-- =============================================
-- Usuarios de la app (extendida de auth.users de Supabase)

CREATE TABLE public.usuarios (
  id uuid PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now(),
  
  -- Datos básicos (Google Auth proporciona nombre/email)
  email text UNIQUE NOT NULL,
  nombre text,
  
  -- Datos CFE (Onboarding - modulo_01)
  tipo_tarifa tarifa_cfe,
  fecha_corte date,
  lectura_medidor_actual numeric,
  consumo_ultimo_recibo numeric,
  lectura_cierre_anterior numeric,
  onboarding_completado boolean DEFAULT false,
  
  -- Push Notifications
  push_token text,
  notificaciones_enabled boolean DEFAULT true,
  
  -- Suscripción
  subscription_status estado_suscripcion DEFAULT 'inactive',
  fecha_inicio_servicio timestamptz,
  fecha_proximo_pago date,
  stripe_customer_id text,
  stripe_subscription_id text
);

-- Trigger para updated_at
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER usuarios_updated_at
  BEFORE UPDATE ON public.usuarios
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- =============================================
-- 4. TABLA: dispositivos
-- =============================================
-- Dispositivos ESP32 vinculados a usuarios
-- CONTIENE COLUMNAS INAMOVIBLES PARA ESP32

CREATE TABLE public.dispositivos (
  device_id text PRIMARY KEY,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now(),
  
  -- Relaciones
  usuario_id uuid REFERENCES public.usuarios(id) ON DELETE SET NULL,
  plan_id bigint REFERENCES public.planes(id),
  
  -- Estado del dispositivo
  estado estado_dispositivo DEFAULT 'sin_vincular',
  nombre_personalizado text,
  fecha_vinculacion timestamptz,
  
  -- =============================================
  -- [ESP32] COLUMNAS INAMOVIBLES - NO MODIFICAR
  -- Referencia: 02_REGLAS_DE_EJECUCION_IA.md
  -- =============================================
  voltage_cal numeric,
  current_cal_1 numeric,
  current_cal_2 numeric,
  current_cal_3 numeric,
  current_cal_4 numeric,
  current_cal_5 numeric,
  power_cal numeric,
  data_server_url text,
  cal_update_pending boolean DEFAULT false
  -- =============================================
  -- FIN COLUMNAS INAMOVIBLES
  -- =============================================
);

CREATE TRIGGER dispositivos_updated_at
  BEFORE UPDATE ON public.dispositivos
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- =============================================
-- 5. TABLA: mediciones_pendientes [ESP32]
-- =============================================
-- Buffer para mediciones durante periodo de gracia
-- ESTRUCTURA INAMOVIBLE

CREATE TABLE public.mediciones_pendientes (
  id bigserial PRIMARY KEY,
  device_id varchar NOT NULL REFERENCES public.dispositivos(device_id) ON DELETE CASCADE,
  ts_unix bigint NOT NULL,
  payload_json text NOT NULL,
  created_at timestamptz DEFAULT now()
);

-- Índices para consultas eficientes
CREATE INDEX idx_mediciones_pendientes_device_id ON public.mediciones_pendientes(device_id);
CREATE INDEX idx_mediciones_pendientes_ts_unix ON public.mediciones_pendientes(ts_unix);

-- =============================================
-- 6. TABLA: dispositivo_boot_sessions
-- =============================================
-- Sesiones de arranque de dispositivos (usado por receptor_mqtt.py)

CREATE TABLE public.dispositivo_boot_sessions (
  device_id varchar(20) PRIMARY KEY REFERENCES public.dispositivos(device_id) ON DELETE CASCADE,
  boot_time_unix bigint NOT NULL,
  last_updated timestamptz DEFAULT now()
);

-- =============================================
-- 7. TABLA: alertas
-- =============================================
-- Alertas generadas por el sistema para usuarios

CREATE TABLE public.alertas (
  id bigserial PRIMARY KEY,
  created_at timestamptz DEFAULT now(),
  device_id text REFERENCES public.dispositivos(device_id) ON DELETE CASCADE,
  usuario_id uuid REFERENCES public.usuarios(id) ON DELETE CASCADE,
  
  -- Contenido de la alerta
  tipo text NOT NULL,  -- Según UXUI-034 a UXUI-042
  titulo text NOT NULL,
  mensaje text,
  
  -- Estado
  leida boolean DEFAULT false,
  fecha_lectura timestamptz,
  
  -- Metadata
  prioridad int DEFAULT 1,  -- 1=normal, 2=importante, 3=urgente
  datos_extra jsonb
);

CREATE INDEX idx_alertas_usuario ON public.alertas(usuario_id);
CREATE INDEX idx_alertas_device ON public.alertas(device_id);
CREATE INDEX idx_alertas_no_leidas ON public.alertas(usuario_id) WHERE leida = false;

-- =============================================
-- 8. TABLA: codigos_vinculacion
-- =============================================
-- Códigos QR/numéricos para vincular dispositivos

CREATE TABLE public.codigos_vinculacion (
  id bigserial PRIMARY KEY,
  created_at timestamptz DEFAULT now(),
  device_id text REFERENCES public.dispositivos(device_id) ON DELETE CASCADE,
  codigo text UNIQUE NOT NULL,
  tipo text DEFAULT 'qr',  -- 'qr' o 'manual'
  usado boolean DEFAULT false,
  fecha_uso timestamptz,
  expira_at timestamptz DEFAULT (now() + interval '24 hours')
);

CREATE INDEX idx_codigos_device ON public.codigos_vinculacion(device_id);
CREATE INDEX idx_codigos_activos ON public.codigos_vinculacion(codigo) WHERE usado = false;

-- =============================================
-- 9. ROW LEVEL SECURITY (RLS)
-- =============================================

-- Habilitar RLS en todas las tablas de usuario
ALTER TABLE public.usuarios ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.dispositivos ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.alertas ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.mediciones_pendientes ENABLE ROW LEVEL SECURITY;

-- Políticas para usuarios (solo ver/editar sus propios datos)
CREATE POLICY "usuarios_select_own" ON public.usuarios
  FOR SELECT USING (auth.uid() = id);

CREATE POLICY "usuarios_update_own" ON public.usuarios
  FOR UPDATE USING (auth.uid() = id);

-- Políticas para dispositivos
CREATE POLICY "dispositivos_select_own" ON public.dispositivos
  FOR SELECT USING (auth.uid() = usuario_id);

CREATE POLICY "dispositivos_update_own" ON public.dispositivos
  FOR UPDATE USING (auth.uid() = usuario_id);

-- Políticas para alertas
CREATE POLICY "alertas_select_own" ON public.alertas
  FOR SELECT USING (auth.uid() = usuario_id);

CREATE POLICY "alertas_update_own" ON public.alertas
  FOR UPDATE USING (auth.uid() = usuario_id);

-- Políticas para mediciones_pendientes (solo lectura por service role)
-- El receptor_mqtt.py usa service_role, no necesita políticas de usuario

-- Políticas para planes (lectura pública)
ALTER TABLE public.planes ENABLE ROW LEVEL SECURITY;
CREATE POLICY "planes_select_all" ON public.planes
  FOR SELECT USING (true);

-- =============================================
-- 10. FUNCIONES AUXILIARES
-- =============================================

-- Función para crear usuario automáticamente al registrarse
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.usuarios (id, email, nombre)
  VALUES (
    NEW.id,
    NEW.email,
    COALESCE(NEW.raw_user_meta_data->>'full_name', NEW.raw_user_meta_data->>'name', '')
  );
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Trigger para auto-crear perfil de usuario
CREATE OR REPLACE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW
  EXECUTE FUNCTION public.handle_new_user();

-- =============================================
-- FIN DEL SCHEMA
-- =============================================
