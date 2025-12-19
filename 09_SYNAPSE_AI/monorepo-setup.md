# SYNAPSE_AI — Monorepo Setup Guide

> **Versión**: 1.0 | **Fecha**: 2025-12-19
> **Estado**: ✅ Estructura lista para desarrollo

---

## 📁 Estructura del Monorepo

```
09_SYNAPSE_AI/
│
├── 📋 docs/                              # Documentación existente
│   ├── context.md
│   ├── master_plan.md
│   └── specs/
│       ├── 01_engine_spec.md
│       ├── 02_pulse_spec.md
│       ├── 03_feed_spec.md
│       └── 04_showcase_spec.md
│
├── 📱 apps/                              # Aplicaciones (por crear)
│   ├── mobile/                           # React Native + Expo
│   └── admin/                            # Panel Web (React + Vite)
│
├── 🔧 packages/                          # Código compartido
│   ├── api/                              # ✅ Backend Fastify
│   │   ├── src/
│   │   │   ├── index.ts                  # Entry point
│   │   │   ├── services/
│   │   │   │   ├── groq.ts               # ✅ Wrapper Groq
│   │   │   │   └── gemini.ts             # ✅ Wrapper Gemini
│   │   │   └── jobs/
│   │   │       └── index.ts              # ✅ Cron jobs
│   │   └── package.json
│   │
│   ├── db/                               # ✅ Esquemas SQL
│   │   └── migrations/
│   │       ├── 001_profiles.sql
│   │       ├── 002_prompt_history.sql
│   │       ├── 003_ai_models.sql
│   │       ├── 004_news_articles.sql
│   │       ├── 005_projects.sql
│   │       └── 006_analytics.sql
│   │
│   ├── prompts/                          # ✅ System Prompts
│   │   ├── engine/
│   │   │   ├── layer_a_enrichment.txt
│   │   │   └── layer_b_assembler.txt
│   │   ├── pulse/
│   │   │   └── model_refiner.txt
│   │   ├── feed/
│   │   │   └── news_processor.txt
│   │   └── showcase/
│   │       └── comment_moderator.txt
│   │
│   └── shared/                           # ✅ Tipos compartidos
│       └── types/
│           ├── index.ts
│           └── styles-config.ts
│
├── package.json                          # ✅ Turborepo root
├── turbo.json                            # ✅ Task config
├── env.example.md                        # ✅ Variables de entorno
└── monorepo-setup.md                     # 📖 Este archivo
```

---

## 🚀 Guía de Inicio Rápido

### 1. Prerrequisitos

```bash
# Versiones requeridas
node --version  # >= 20.0.0
npm --version   # >= 10.0.0
```

### 2. Instalación

```bash
cd 09_SYNAPSE_AI

# Instalar Turborepo y dependencias raíz
npm install

# Instalar dependencias de todos los workspaces
npm install --workspaces
```

### 3. Configurar Variables de Entorno

```bash
# Copiar template
copy env.example.md .env

# Editar con tus API keys
# Requeridas para MVP:
# - SUPABASE_URL
# - SUPABASE_ANON_KEY
# - SUPABASE_SERVICE_ROLE_KEY
# - GROQ_API_KEY
# - GEMINI_API_KEY
```

### 4. Configurar Base de Datos (Supabase)

```bash
# Opción 1: Ejecutar migraciones manualmente en Supabase Dashboard
# SQL Editor → Ejecutar cada archivo en packages/db/migrations/ en orden

# Opción 2: Usar Supabase CLI
supabase db push
```

### 5. Ejecutar en Desarrollo

```bash
# Todos los servicios
npm run dev

# Solo API
npm run api:dev

# Solo Mobile (cuando esté listo)
npm run mobile:dev

# Solo Admin (cuando esté listo)
npm run admin:dev
```

---

## 🧠 System Prompts — Referencia Rápida

### Módulo 1: ENGINE (Groq)

| Archivo | Propósito | Temperatura |
|---------|-----------|-------------|
| `engine/layer_a_enrichment.txt` | Enriquecimiento creativo de ideas | 0.7 |
| `engine/layer_b_assembler.txt` | Ensamblaje técnico del prompt | 0.2 |

**Flujo**: Input → Capa A (Varita Mágica) → Estilos → Capa B → Prompt Final

---

### Módulo 2: PULSE (Groq)

| Archivo | Propósito | Schedule |
|---------|-----------|----------|
| `pulse/model_refiner.txt` | Normalizar modelos de OpenRouter | Domingos 2am |

**Flujo**: OpenRouter API → Groq Refiner → Upsert ai_models

---

### Módulo 3: FEED (Gemini)

| Archivo | Propósito | Schedule |
|---------|-----------|----------|
| `feed/news_processor.txt` | Resumir y deduplicar noticias | Cada hora 7am-11pm |

**Flujo**: RSS Feeds → Gemini Flash → Anti-dedup → DB + Push

---

### Módulo 4: SHOWCASE (Groq)

| Archivo | Propósito | Trigger |
|---------|-----------|---------|
| `showcase/comment_moderator.txt` | Moderar comentarios UGC | Real-time |

**Flujo**: Comentario → Groq → Aprobado/Rechazado → DB

---

## 📦 Próximos Pasos

### Fase 1: Fundaciones (Actual)
- [x] Estructura de carpetas
- [x] System Prompts
- [x] Migraciones SQL
- [x] Tipos TypeScript
- [x] Configuración Turborepo
- [ ] Crear apps/mobile con Expo
- [ ] Crear apps/admin con Vite

### Fase 2: Engine + Feed
- [ ] UI Wizard de 4 pasos
- [ ] Integración Groq completa
- [ ] Pipeline de noticias
- [ ] Push notifications

### Fase 3: Pulse
- [ ] Rankings con podio
- [ ] Sistema de reseñas
- [ ] Comparador 2 modelos

### Fase 4: Showcase
- [ ] Grid de proyectos
- [ ] Upload imágenes WebP
- [ ] Moderación Groq

---

## 📊 Comandos Útiles

```bash
# Lint todos los packages
npm run lint

# Type check
npm run type-check

# Tests
npm run test

# Build producción
npm run build

# Limpiar node_modules
npm run clean

# Ejecutar migración específica
npx supabase db push --file packages/db/migrations/001_profiles.sql
```

---

## 🔐 API Keys — Dónde Obtenerlas

| Servicio | URL | Usado en |
|----------|-----|----------|
| **Supabase** | [app.supabase.com](https://app.supabase.com) | Todo |
| **Groq** | [console.groq.com/keys](https://console.groq.com/keys) | Engine, Pulse, Showcase |
| **Gemini** | [aistudio.google.com](https://aistudio.google.com/app/apikey) | Feed |
| **OpenRouter** | [openrouter.ai/keys](https://openrouter.ai/keys) | Pulse (sync) |
| **Expo** | [expo.dev](https://expo.dev/accounts) | Mobile builds |

---

## 📱 Crear App Móvil (Siguiente paso)

```bash
cd apps

# Crear app Expo con TypeScript
npx create-expo-app@latest mobile --template blank-typescript

# Agregar NativeWind
cd mobile
npm install nativewind tailwindcss
npx tailwindcss init

# Agregar TanStack Query
npm install @tanstack/react-query

# Agregar Supabase
npm install @supabase/supabase-js
```

---

## 🖥️ Crear Panel Admin (Siguiente paso)

```bash
cd apps

# Crear app Vite con React + TypeScript
npm create vite@latest admin -- --template react-ts

cd admin

# Agregar Tailwind
npm install -D tailwindcss postcss autoprefixer
npx tailwindcss init -p

# Agregar Shadcn/UI
npx shadcn-ui@latest init

# Agregar Supabase
npm install @supabase/supabase-js
```

---

*Documento generado automáticamente — SYNAPSE_AI Monorepo Setup*
*Última actualización: 2025-12-19*
