-- WARNING: This schema is for context only and is not meant to be run.
-- Table order and constraints may not be valid for execution.

-- IMPORTANTE PARA ANTIGRAVITY!!!!!!
-- Este es el schema original de supabase, tiene columnas importantes que el dispositivo ESP32 requeire para poder funcionar, a esos valores le he agregado comentarios, son inamovibles y los tienes que incluir en el código y en las nuevas tablas de supabase
-- no utilizaremos estas mismas tablas, solo las columnas que requiere el dispositivo ESP32
-- crearemos tablas nuevas.

CREATE TABLE public.clientes (
  id bigint GENERATED ALWAYS AS IDENTITY NOT NULL,
  created_at timestamp with time zone NOT NULL DEFAULT now(),
  nombre text,
  telefono_whatsapp text,
  kwh_promedio_diario numeric,
  ciclo_bimestral text,
  dia_de_corte smallint,
  tipo_tarifa text,
  fecha_inicio_servicio timestamp with time zone,
  notificacion_nivel_tarifa boolean DEFAULT false,
  notificacion_dac boolean DEFAULT false,
  fecha_proximo_pago date,
  notificacion_corte_3dias_enviada boolean DEFAULT false,
  notificacion_dia_corte_enviada boolean DEFAULT false,
  notificacion_escalon1_enviada boolean DEFAULT false,
  notificacion_escalon2_enviada boolean DEFAULT false,
  estadisticas_consumo jsonb,
  subscription_status text DEFAULT 'inactive'::text,
  email text UNIQUE,
  auth_user_id uuid,
  lectura_medidor_inicial numeric,
  consumo_recibo_anterior numeric,
  stripe_subscription_id text,
  stripe_customer_id text,
  lectura_cierre_periodo_anterior numeric,
  primera_medicion_recibida boolean NOT NULL DEFAULT false,
  telegram_chat_id character varying,
  telegram_link_code character varying,
  en_chat_humano_hasta timestamp with time zone,
  telegram_link_expires_at timestamp with time zone,
  prefiere_telegram boolean DEFAULT false,
  alerta_fuga_activa boolean DEFAULT false,
  alerta_voltaje_estado character varying DEFAULT 'normal'::character varying,
  CONSTRAINT clientes_pkey PRIMARY KEY (id),
  CONSTRAINT fk_auth_user FOREIGN KEY (auth_user_id) REFERENCES auth.users(id)
);
CREATE TABLE public.dispositivo_boot_sessions (
  device_id character varying NOT NULL,
  boot_time_unix bigint NOT NULL,
  last_updated timestamp with time zone DEFAULT now(),
  CONSTRAINT dispositivo_boot_sessions_pkey PRIMARY KEY (device_id)
);
CREATE TABLE public.dispositivos_lete (
  device_id text NOT NULL UNIQUE,
  created_at timestamp with time zone NOT NULL DEFAULT now(),
  plan_id bigint NOT NULL,
  estado text NOT NULL DEFAULT 'sin_vender'::text,
  cliente_id bigint,
  --NOTA ANTIGRAVITY: estas columnas son inamovibles
  voltage_cal numeric,
  current_cal_1 numeric,
  current_cal_2 numeric,
  current_cal_3 numeric,
  current_cal_4 numeric,
  current_cal_5 numeric,
  power_cal numeric,
  data_server_url text,
  cal_update_pending boolean NOT NULL DEFAULT false,
  --NOTA ANTIGRAVITY: aqui terminan las columnas inamovibles
  command text,
  order_id bigint,
  CONSTRAINT dispositivos_lete_pkey PRIMARY KEY (device_id),
  CONSTRAINT dispositivos_lete_plan_id_fkey FOREIGN KEY (plan_id) REFERENCES public.planes_lete(id),
  CONSTRAINT dispositivos_lete_cliente_id_fkey FOREIGN KEY (cliente_id) REFERENCES public.clientes(id)
);
--NOTA ANTIGRAVITY: aqui empiezan las columnas inamovibles
CREATE TABLE public.mediciones_pendientes (
  id bigint NOT NULL DEFAULT nextval('mediciones_pendientes_id_seq'::regclass),
  device_id character varying NOT NULL,
  ts_unix bigint NOT NULL,
  payload_json text NOT NULL,
  created_at timestamp with time zone DEFAULT now(),
  CONSTRAINT mediciones_pendientes_pkey PRIMARY KEY (id)
  --NOTA ANTIGRAVITY: aqui terminan las columnas inamovibles
);
CREATE TABLE public.orders (
  id bigint GENERATED ALWAYS AS IDENTITY NOT NULL,
  created_at timestamp with time zone DEFAULT now(),
  stripe_session_id text NOT NULL UNIQUE,
  customer_name text,
  customer_email text NOT NULL,
  shipping_address text,
  customer_rfc text,
  amount_total integer,
  payment_status text,
  terms_accepted_version text,
  stripe_customer_id text,
  CONSTRAINT orders_pkey PRIMARY KEY (id)
);
CREATE TABLE public.perfiles_diagnostico (
    --NOTA ANTIGRAVITY: esto es importante para la sección de diagnostico 7 dias
  id bigint GENERATED ALWAYS AS IDENTITY NOT NULL,
  created_at timestamp with time zone DEFAULT now(),
  calle text NOT NULL,
  numero_domicilio text NOT NULL,
  colonia text NOT NULL,
  municipio text NOT NULL CHECK (municipio = ANY (ARRAY['guadalajara'::text, 'zapopan'::text, 'tlaquepaque'::text, 'tonala'::text, 'tlajomulco'::text, 'otro'::text])),
  telefono_whatsapp text NOT NULL,
  refri_cantidad integer DEFAULT 1,
  refri_antiguedad_anos integer DEFAULT 0,
  ac_cantidad integer DEFAULT 0,
  ac_tipo text DEFAULT 'no_se'::text,
  lavadora_cantidad integer DEFAULT 1,
  secadora_electrica_cantidad integer DEFAULT 0,
  secadora_gas_cantidad integer DEFAULT 0,
  estufa_electrica_cantidad integer DEFAULT 0,
  calentador_electrico_cantidad integer DEFAULT 0,
  bomba_agua_cantidad integer DEFAULT 0,
  bomba_alberca_cantidad integer DEFAULT 0,
  paneles_solares_cantidad integer DEFAULT 0,
  horno_electrico_cantidad integer DEFAULT 0,
  contexto_problema text,
  confirmo_no_conectar_raros boolean DEFAULT false,
  CONSTRAINT perfiles_diagnostico_pkey PRIMARY KEY (id)
);
CREATE TABLE public.planes_lete (
    --NOTA ANTIGRAVITY: esto es importante para el tipo de planes
  id bigint GENERATED ALWAYS AS IDENTITY NOT NULL,
  created_at timestamp with time zone NOT NULL DEFAULT now(),
  nombre_plan text NOT NULL,
  precio numeric NOT NULL,
  stripe_plan_id text NOT NULL UNIQUE,
  CONSTRAINT planes_lete_pkey PRIMARY KEY (id)
);