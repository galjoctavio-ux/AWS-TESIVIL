# SYNAPSE_AI – Contexto General de la Aplicación

> **Versión**: 2.0 | **Fecha**: 2025-12-18  
> **Estado**: Plan Maestro Validado ✅

---

## 1. Visión y Propósito

**SYNAPSE_AI** es un ecosistema móvil "Swiss-army-knife" para profesionales y creadores que buscan dominar la IA sin fricción. Actúa como un **hub central** para:

- Crear prompts profesionales (imágenes, workflows)
- Comparar y evaluar modelos de IA
- Consumir noticias curadas del mundo AI
- Compartir y descubrir proyectos de la comunidad

### Público Objetivo
- **Desarrolladores** que integran modelos de IA en sus proyectos
- **Creadores de contenido** que usan herramientas generativas
- **Profesionales técnicos** que necesitan mantenerse actualizados

---

## 2. Los 4 Pilares del Producto

| Pilar | Nombre | Descripción | Tecnología Core |
|-------|--------|-------------|-----------------|
| 🎨 | **Engine (Prompts)** | Constructor visual de prompts con refinamiento IA | Groq (Llama 3.3 70B) |
| 📊 | **The Pulse (Rankings)** | Monitor en tiempo real: benchmarks técnicos vs sentimiento comunitario | OpenRouter + LMSYS |
| 📰 | **Feed (News)** | Noticias resumidas automáticamente, anti-duplicados, push alerts | Gemini 2.0 Flash |
| 🚀 | **Showcase (Community)** | Galería de proyectos UGC con moderación automática | Groq + WebP Compression |

---

## 3. Arquitectura Técnica

### Stack Tecnológico Consolidado

```
┌─────────────────────────────────────────────────────────────┐
│                     FRONTEND MÓVIL                          │
│  React Native + Expo + NativeWind (Tailwind CSS)           │
│  TanStack Query para caché y estado                        │
└─────────────────────────────────────────────────────────────┘
                              │
                              ▼
┌─────────────────────────────────────────────────────────────┐
│                      BACKEND API                            │
│  Node.js (TypeScript) + Fastify + PM2                      │
│  Cron Jobs: node-cron (semanal/mensual)                    │
└─────────────────────────────────────────────────────────────┘
                              │
          ┌───────────────────┼───────────────────┐
          ▼                   ▼                   ▼
┌─────────────────┐  ┌─────────────────┐  ┌─────────────────┐
│    GROQ CLOUD   │  │  GEMINI FLASH   │  │   OPENROUTER    │
│  Llama 3.3 70B  │  │   2.0 Flash     │  │    Models API   │
│  - Prompts      │  │  - News Summary │  │  - Precios      │
│  - Moderación   │  │  - Dedup Logic  │  │  - Benchmarks   │
└─────────────────┘  └─────────────────┘  └─────────────────┘
                              │
                              ▼
┌─────────────────────────────────────────────────────────────┐
│                     SUPABASE (PostgreSQL)                   │
│  Auth + Storage (WebP) + Edge Functions + Realtime         │
└─────────────────────────────────────────────────────────────┘
                              │
                              ▼
┌─────────────────────────────────────────────────────────────┐
│                    ADMIN PANEL (WEB)                        │
│  React + Vite + Tailwind + Shadcn/UI                       │
└─────────────────────────────────────────────────────────────┘
```

### Infraestructura
- **Servidor**: AWS/GCP con Nginx como Reverse Proxy
- **Contenedores**: Docker para aislar microservicios
- **CDN**: CloudFront/Cloud CDN para assets estáticos

---

## 4. Modelo de Datos (Supabase PostgreSQL)

### Tablas Principales

#### Core Users
```sql
profiles (
  id UUID PRIMARY KEY REFERENCES auth.users,
  email TEXT,
  alias TEXT UNIQUE,
  photo_url TEXT,
  is_premium BOOLEAN DEFAULT false,
  role TEXT CHECK (role IN ('user', 'developer', 'partner')),
  created_at TIMESTAMPTZ DEFAULT now()
)
```

#### Módulo 1: Prompt Generator
```sql
prompt_builder_history (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES profiles(id),
  input_raw TEXT,
  input_enriched TEXT,
  config_json JSONB,  -- { style, light, aspect, lens }
  prompt_final TEXT,
  created_at TIMESTAMPTZ DEFAULT now()
)
```

#### Módulo 2: AI Rankings
```sql
ai_models (
  id TEXT PRIMARY KEY,  -- 'gemini-1-5-pro'
  name TEXT,
  brand TEXT,           -- 'Google', 'OpenAI', 'Anthropic'
  version TEXT,
  category TEXT,        -- 'Pro' | 'Flash'
  logo_url TEXT,
  pricing_input_1m DECIMAL,   -- Precio por 1M tokens input
  pricing_output_1m DECIMAL,  -- Precio por 1M tokens output
  context_window INTEGER,
  created_at TIMESTAMPTZ DEFAULT now()
)

ai_benchmarks (
  id UUID PRIMARY KEY,
  model_id TEXT REFERENCES ai_models(id),
  category TEXT,        -- 'coding', 'logic', 'creative', 'vision'
  score_tecnico DECIMAL,
  ranking_posicion INTEGER,
  updated_at TIMESTAMPTZ DEFAULT now()
)

ai_reviews (
  id UUID PRIMARY KEY,
  model_id TEXT REFERENCES ai_models(id),
  user_id UUID REFERENCES profiles(id),
  stars_speed INTEGER CHECK (stars_speed BETWEEN 1 AND 5),
  stars_precision INTEGER CHECK (stars_precision BETWEEN 1 AND 5),
  stars_hallucination INTEGER CHECK (stars_hallucination BETWEEN 1 AND 5),
  comment TEXT,
  use_case_tag TEXT,    -- '#Programación', '#Creatividad'
  is_helpful_count INTEGER DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT now()
)

ai_votes (
  id UUID PRIMARY KEY,
  review_id UUID REFERENCES ai_reviews(id),
  user_id UUID REFERENCES profiles(id),
  vote_type TEXT CHECK (vote_type IN ('upvote', 'downvote')),
  UNIQUE(review_id, user_id)
)
```

#### Módulo 3: News Feed
```sql
news_articles (
  id UUID PRIMARY KEY,
  topic_id TEXT,        -- Generado por Gemini (dedup)
  title TEXT,
  summary_json JSONB,   -- { bullets: [], why_it_matters: '' }
  source_name TEXT,
  url_original TEXT UNIQUE,
  image_url TEXT,
  importance INTEGER CHECK (importance BETWEEN 1 AND 10),
  created_at TIMESTAMPTZ DEFAULT now()
)

news_comments (
  id UUID PRIMARY KEY,
  article_id UUID REFERENCES news_articles(id),
  user_id UUID REFERENCES profiles(id),
  comment_text TEXT,
  created_at TIMESTAMPTZ DEFAULT now()
)
```

#### Módulo 4: Showcase
```sql
projects (
  id UUID PRIMARY KEY,
  user_id UUID REFERENCES profiles(id),
  title TEXT,
  description TEXT,
  tools_array TEXT[],   -- ['Cursor', 'ChatGPT', 'v0.dev']
  project_url TEXT,
  action_type TEXT CHECK (action_type IN ('visit', 'download', 'showcase')),
  image_urls TEXT[],    -- Max 3 WebP
  upvotes_count INTEGER DEFAULT 0,
  views_count INTEGER DEFAULT 0,
  is_featured_until TIMESTAMPTZ,
  report_count INTEGER DEFAULT 0,
  is_hidden BOOLEAN DEFAULT false,
  created_at TIMESTAMPTZ DEFAULT now()
)

project_comments (
  id UUID PRIMARY KEY,
  project_id UUID REFERENCES projects(id),
  user_id UUID REFERENCES profiles(id),
  comment_text TEXT,
  sentiment TEXT,       -- 'question' | 'praise' | 'neutral'
  is_moderated BOOLEAN DEFAULT false,
  created_at TIMESTAMPTZ DEFAULT now()
)
```

#### Analytics & Monetización
```sql
app_analytics (
  id UUID PRIMARY KEY,
  event_type TEXT,      -- 'click_ai_link', 'prompt_generated', 'project_viewed'
  target_id TEXT,
  user_id UUID,
  metadata JSONB,       -- { platform, version, source }
  created_at TIMESTAMPTZ DEFAULT now()
)

clicks (
  id UUID PRIMARY KEY,
  user_id UUID REFERENCES profiles(id),
  target_url TEXT,
  click_count INTEGER DEFAULT 1,
  last_clicked_at TIMESTAMPTZ DEFAULT now()
)
```

### Vistas Calculadas
```sql
CREATE VIEW ai_scores_global AS
SELECT 
  m.id,
  m.name,
  m.brand,
  AVG(b.score_tecnico) AS benchmark_avg,
  AVG((r.stars_speed + r.stars_precision + r.stars_hallucination) / 3.0) AS community_avg,
  (AVG(b.score_tecnico) * 0.6 + AVG(...) * 0.4) AS score_combinado
FROM ai_models m
LEFT JOIN ai_benchmarks b ON m.id = b.model_id
LEFT JOIN ai_reviews r ON m.id = r.model_id
GROUP BY m.id, m.name, m.brand;
```

---

## 5. UX/UI Unificada y Profesional

### Design System

| Elemento | Especificación |
|----------|----------------|
| **Paleta** | Dark mode primario, acentos vibrantes (azul eléctrico #3B82F6, púrpura #8B5CF6) |
| **Tipografía** | Inter/Roboto (UI), JetBrains Mono (código), escala: 12-14-16-20-24px |
| **Espaciado** | Sistema de 4px (4, 8, 12, 16, 24, 32, 48) |
| **Radios** | 8px (chips), 12px (cards), 16px (modals) |
| **Sombras** | Glassmorphism con blur 16px y opacidad 0.1 |

### Componentes Reutilizables
- **Cards**: Tarjetas con imagen, título, badges y acciones
- **Chips/Tags**: Filtros horizontales scrollables
- **Radar Chart**: Visualización spider-web para métricas
- **Bottom Sheet**: Detalle expandible desde la base
- **Toast**: Feedback inmediato ("¡Copiado!", "¡Guardado!")
- **Empty State**: Ilustración + CTA cuando no hay datos

### Flujos de Usuario por Módulo

#### Módulo 1: Prompt Generator (4 pasos)
```
[Input] → [Estilo (8 cards)] → [Parámetros dinámicos] → [Resultado + Copiar]
           └── 2 columnas        └── Lentes/Luz según       └── Toast + Historial
               50% width             estilo seleccionado        últimos 5
```

#### Módulo 2: AI Rankings
```
[Home: Podio Top 3] → [Lista infinita] → [Ficha detalle] → [Calificar/Comparar]
        │                    │                  │
        └── Filtros: Código, Gratis, Visión   └── Radar + Benchmarks + Comments
```

#### Módulo 3: News Feed
```
[Feed vertical] → [Tarjeta expandida] → [3 bullets + "¿Por qué importa?"]
        │                                       │
        └── Imagen + Título + Tiempo            └── Link original + Comentarios
```

#### Módulo 4: Showcase
```
[Grid Masonry] → [Detalle proyecto] → [Comentar/Votar/Visitar]
        │                │
        └── V2: Reel     └── 3 capturas + Stack tags + Métricas
```

### Estados Críticos de UX
- **Loading**: Skeleton shimmer en cards
- **Error**: Mensaje amigable + botón retry
- **Empty**: Ilustración + texto motivacional + CTA
- **Success**: Micro-animación de pulso en elementos actualizados

---

## 6. Automatización "Mantenimiento Cero"

### Cron Jobs Programados

| Job | Frecuencia | Fuente | Procesamiento |
|-----|------------|--------|---------------|
| **Sync Models** | Semanal | OpenRouter API | Groq filtra top 15 modelos |
| **Sync Benchmarks** | Mensual | LMSYS (Hugging Face) | Upsert scores técnicos |
| **News Aggregator** | Cada hora | RSS Feeds | Gemini resume + dedup |
| **Push Alerts** | Trigger | importance > 9 | Firebase Cloud Messaging |

### Lógica Anti-Duplicados (News)
1. **Capa 1**: Verificar `url_original` único en Supabase
2. **Capa 2**: Gemini genera `topic_id` semántico
3. **Capa 3**: Descartar si existe `topic_id` en últimas 24h

---

## 7. Monetización y Escalabilidad

### Fases de Monetización

| Fase | Estrategia | Implementación |
|------|------------|----------------|
| **1. Lanzamiento** | AdMob Native Ads | Integración en Feed y Showcase |
| **2. Validación** | Featured Slots ($5-10 USD/24h) | Columna `is_featured_until` en projects |
| **3. Madurez** | Suscripción Premium | RevenueCat + `is_premium` flag |

### Preparación Técnica
- **profiles.role**: Permisos diferenciados (user, developer, partner)
- **profiles.is_premium**: Renderizado condicional de features
- **/services/billing**: Stubs para Stripe/RevenueCat
- **clicks table**: Métricas para venta de espacio publicitario
- **app_analytics**: Datos para reportes B2B

---

## 8. Cumplimiento Legal

### Documentos Requeridos
- ✅ Términos y Condiciones de Uso (ToS)
- ✅ Aviso de Privacidad Integral (GDPR-like, ARCO)
- ✅ Disclaimer General de IA
- ✅ Take-Down Policy

### Integración en UI
- **Registro**: Checkbox obligatorio + enlaces a ToS y Privacy
- **Perfil → Ajustes → Legal**: Acceso permanente a todos los documentos
- **Avisos contextuales**: "Resultado generado por IA" en Prompt Generator

---

## 9. Análisis de Validación del Plan Maestro

### ✅ Fortalezas Identificadas

| Área | Observación |
|------|-------------|
| **Lógica** | Flujos de usuario claros y bien secuenciados por módulo |
| **Congruencia** | Arquitectura consistente: React Native + Supabase + Groq/Gemini |
| **Base de Datos** | Esquemas relacionales bien definidos con FKs y constraints |
| **UX** | Design system premium con componentes reutilizables |
| **Monetización** | Estrategia progresiva de 3 fases claramente definida |
| **Automatización** | Cron jobs para mantenimiento cero de datos |
| **Legal** | Documentación completa y flujos de aceptación definidos |

### ⚠️ Observaciones y Recomendaciones

| Área | Observación | Estado |
|------|-------------|--------|
| **Schema SQL** | Índices explícitos agregados en tablas críticas | ✅ Resuelto |
| **RLS** | Políticas Row Level Security definidas en Sección 10 | ✅ Resuelto |
| **Caché** | Estrategia TanStack Query documentada en Sección 11 | ✅ Resuelto |
| **Offline** | Datos offline definidos (ai_models, news, prompts) | ✅ Resuelto |
| **Testing** | Plan de testing completo en Sección 12 | ✅ Resuelto |
| **CI/CD** | Pipeline GitHub Actions en Sección 13 | ✅ Resuelto |

### 🔄 Nomenclatura Consolidada

El plan usa **TESIVIL_STACK** y **SYNAPSE_AI** indistintamente. Se recomienda:
- **Nombre público**: SYNAPSE_AI
- **Nombre técnico/repo**: 09_SYNAPSE_AI
- **Nombre legal**: TESIVIL_STACK (para ToS)

---

## 10. Roadmap de Desarrollo

| Fase | Timeline | Entregables |
|------|----------|-------------|
| **0. Fundaciones** | Q1 2026 | Skeleton app, Groq integration, UI framework |
| **1. Engine + Feed** | Q2 2026 | Prompt Builder, News aggregation pipeline |
| **2. The Pulse** | Q3 2026 | Rankings dashboard, voting system |
| **3. Showcase** | Q4 2026 | Community gallery, monetization hooks |
| **4. Premium** | H1 2027 | Subscriptions, marketplace, i18n |

---

## 11. Métricas de Éxito

| KPI | Target 2026 |
|-----|-------------|
| **MAU** | 10,000 usuarios activos mensuales |
| **Engagement** | ≥30 min tiempo de sesión promedio |
| **Conversión** | 5% upgrade a premium o compra de workflows |
| **Comunidad** | 1,000 proyectos publicados en Showcase |
| **Latencia** | <500ms respuesta Groq promedio |

---

*Este documento sirve como referencia central para desarrollo, revisión de arquitectura y alineación del equipo en la construcción de SYNAPSE_AI.*

*Última actualización: 2025-12-18*
