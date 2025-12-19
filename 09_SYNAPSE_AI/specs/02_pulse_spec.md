# 02 PULSE SPEC — Rankings de IA (Benchmarks + Comunidad)

> **Módulo**: The Pulse (Rankings)  
> **Versión**: 3.0 FINAL | **Fecha**: 2025-12-18  
> **Estado**: ✅ COMPLETO - Listo para desarrollo

---

## 1. Propósito y Valor

**Objetivo**: Ser la autoridad en tiempo real sobre qué IA usar.

**Problema que resuelve**: Fatiga de decisión al comparar modelos.

**Solución**: Datos técnicos objetivos + Experiencia de usuario real.

---

## 2. Modelos MVP (Dic 2024)

| Marca | Pro (Pesados) | Flash (Rápidos) |
|-------|---------------|-----------------|
| OpenAI | o1, GPT-4o | o1-mini, GPT-4o-mini |
| Anthropic | Claude 3.5 Sonnet | Claude 3.5 Haiku |
| Google | Gemini 2.0 Pro | Gemini 2.0 Flash |
| Meta | Llama 3.3 70B | Llama 3.1 8B |
| DeepSeek | DeepSeek-V3 | DeepSeek-V2.5 |

---

## 3. Arquitectura de Robustez: Triple Verificación

```
┌─────────────────────────────────────────────────────────────┐
│  CAPA 1: EXTRACCIÓN (Raw Data)                              │
│  ─────────────────────────────────────────────────────────  │
│  • OpenRouter API → Nombres, Precios, Contexto              │
│  • LMSYS Dataset → Benchmarks, Rankings                     │
└─────────────────────────────────────────────────────────────┘
                          ↓
┌─────────────────────────────────────────────────────────────┐
│  CAPA 2: INTELIGENCIA (Groq Refiner)                        │
│  ─────────────────────────────────────────────────────────  │
│  • Normaliza nombres: "GPT-4o-2024-08-06" → "GPT-4o"        │
│  • Categoriza: Pro vs Flash                                 │
│  • Asigna marca automáticamente: "Llama-4-Preview" → Meta  │
│  • Filtra top 15 modelos relevantes                         │
└─────────────────────────────────────────────────────────────┘
                          ↓
┌─────────────────────────────────────────────────────────────┐
│  CAPA 3: CACHÉ DE SEGURIDAD (Fallback)                      │
│  ─────────────────────────────────────────────────────────  │
│  • Si APIs fallan → Mantener última versión buena           │
│  • Enviar webhook/email de alerta                           │
│  • App sigue funcional siempre                              │
└─────────────────────────────────────────────────────────────┘
```

---

## 4. Sync Engine (Cron Job)

```typescript
// Domingos 2:00 AM
const CRON_SCHEDULE = '0 2 * * 0';

async function syncEngine() {
  try {
    // CAPA 1: Extracción
    const openRouterData = await fetch('https://openrouter.ai/api/v1/models');
    const lmsysData = await fetchLMSYS();
    
    // CAPA 2: Inteligencia (Groq)
    const cleanedModels = await groq.chat({
      model: 'llama-3.3-70b-specdec',
      temperature: 0.2,
      messages: [{
        role: 'system',
        content: `Limpia y normaliza esta lista de modelos:
          1. Simplifica nombres (GPT-4o-2024-08-06 → GPT-4o)
          2. Asigna marca (OpenAI, Anthropic, Google, Meta, etc)
          3. Categoriza: "pro" o "flash"
          4. Selecciona solo los 15 más relevantes
          Responde en JSON.`
      }, {
        role: 'user',
        content: JSON.stringify(openRouterData)
      }]
    });
    
    // CAPA 3: Upsert con fallback
    for (const model of cleanedModels) {
      await supabase.from('ai_models').upsert({
        id: model.id,
        name: model.name,
        brand: model.brand,
        category: model.category,
        pricing_input_1m: model.pricing_input,
        pricing_output_1m: model.pricing_output,
        context_window: model.context_window,
        updated_at: new Date()
      }, { onConflict: 'id' });
      
      // Si es nuevo (created_at = updated_at), marcar badge NEW
      if (isNewModel(model)) {
        notifyNewModel(model);
      }
    }
    
    // Actualizar stats agregados
    await updateAggregateStats();
    
  } catch (error) {
    // Fallback: mantener datos actuales, notificar
    await sendWebhook('sync_failed', { error: error.message });
    console.error('Sync failed, keeping current data');
  }
}
```

---

## 5. Base de Datos Completa

### ai_models
```sql
create table ai_models (
  id text primary key,
  name text not null,
  brand text not null,
  version text,
  category text check (category in ('pro', 'flash')),
  pricing_type text[],
  pricing_input_1m decimal,
  pricing_output_1m decimal,
  context_window int,
  logo_url text,
  is_active boolean default true,
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);
```

### ai_stats (Agregados)
```sql
create table ai_stats (
  model_id text primary key references ai_models(id),
  benchmark_score decimal,        -- Promedio de benchmarks
  community_score decimal,        -- Promedio de reviews
  avg_speed decimal,              -- Promedio estrellas velocidad
  avg_precision decimal,          -- Promedio estrellas precisión
  avg_hallucination decimal,      -- Promedio estrellas alucinación
  reviews_count int default 0,
  tokens_per_second int,          -- Velocidad real (Groq benchmark)
  updated_at timestamptz default now()
);
```

### ai_benchmarks
```sql
create table ai_benchmarks (
  id uuid primary key default uuid_generate_v4(),
  model_id text references ai_models(id),
  category text,              -- 'coding', 'logic', 'creative', 'vision'
  source text,                -- 'LMSYS', 'HumanEval', etc
  score decimal,
  ranking_position int,
  updated_at timestamptz default now(),
  unique(model_id, category, source)
);
```

### ai_reviews
```sql
create table ai_reviews (
  id uuid primary key default uuid_generate_v4(),
  model_id text references ai_models(id),
  user_id uuid references profiles(id),
  stars_speed int check (stars_speed between 1 and 5),
  stars_precision int check (stars_precision between 1 and 5),
  stars_hallucination int check (stars_hallucination between 1 and 5),
  comment text,
  use_case_tag text,          -- '#Código', '#Resumen', '#Análisis'
  is_helpful_count int default 0,
  created_at timestamptz default now(),
  unique(model_id, user_id)
);
```

### ai_ranking_history (Tendencias)
```sql
create table ai_ranking_history (
  id uuid primary key default uuid_generate_v4(),
  model_id text references ai_models(id),
  week_number int,
  ranking_position int,
  created_at timestamptz default now()
);
```

---

## 6. Interfaz de Usuario

### Pantalla Home: The Ranking
```
┌─────────────────────────────────────────────────────────────┐
│  THE PULSE                                            🔍    │
│  [General] [Código] [Escritura] [Imágenes]  ← Tabs         │
│                                                             │
│  ━━━ TOP 3 (PODIO) ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━    │
│  ┌───────────┐ ┌───────────┐ ┌───────────┐                 │
│  │👑 Claude  │ │🥈 GPT-4o  │ │🥉 DeepSeek│                 │
│  │   [9.8]   │ │   [9.4]   │ │   [9.2]   │                 │
│  │ Anthropic │ │  OpenAI   │ │  DeepSeek │                 │
│  └───────────┘ └───────────┘ └───────────┘                 │
│                                                             │
│  ━━━ LISTA COMPLETA ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━    │
│  #4 Gemini 2.0 Flash    [$$]    ↑  [8.9]  NEW             │
│  #5 Llama 3.3 70B       [$]     −  [8.7]                   │
│  #6 o1-mini             [$$$]   ↓  [8.5]                   │
│  ... (infinite scroll)                                      │
└─────────────────────────────────────────────────────────────┘
```

### Ficha del Modelo (Detail View)
```
┌─────────────────────────────────────────────────────────────┐
│  ← Claude 3.5 Sonnet                                        │
│  by Anthropic          [🔗 Probar] [🎨 Crear Prompt]       │
│                                                             │
│  ━━━ RADAR CHART ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━    │
│           Velocidad ⭐⭐⭐⭐☆                                │
│            ╱        ╲                                       │
│  Alucinación ── ● ── Precisión                             │
│     ⭐⭐⭐⭐⭐      ⭐⭐⭐⭐⭐                                │
│                                                             │
│  ━━━ PRECIOS ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━    │
│  🌐 Gratis en Web   💳 Suscripción $20   🔧 API $3/1M     │
│                                                             │
│  ━━━ CALIFICA ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━    │
│  Velocidad: ⭐⭐⭐⭐☆   Precisión: ⭐⭐⭐⭐⭐               │
│  Sin alucinaciones: ⭐⭐⭐⭐⭐                               │
│  Lo usé para: [#Código ▼]                                  │
│  [Publicar Reseña]                                         │
│                                                             │
│  ━━━ REVIEWS ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━    │
│  @dev · #Código · "Increíble para Python"    👍 45        │
└─────────────────────────────────────────────────────────────┘
```

---

## 7. Flujo de Navegación UX

```
[Entrada]        [Interés]         [Validación]      [Acción]
    │                │                  │                │
    ▼                ▼                  ▼                ▼
 Ve ranking    Tap Claude 3.5    Lee radar +      "Probar" →
 Filtra:Código                   reseña Python    Link externo
                                                  "Crear Prompt" →
                                                  Módulo 1
```

---

## 8. API Endpoints

```typescript
GET  /api/models                    // Lista con filtros
GET  /api/models/top                // Top 3 podio
GET  /api/models/:id                // Ficha completa
GET  /api/models/:id/stats          // Stats agregados
GET  /api/models/:id/reviews        // Reviews paginadas
POST /api/models/:id/reviews        // Crear review
POST /api/reviews/:id/vote          // Votar helpful
GET  /api/models/compare?a=X&b=Y    // Comparador
POST /api/admin/sync-models         // Trigger manual sync
```

---

## 9. Checklist de Implementación

### Automatización
- [ ] Cron job semanal (domingos 2am)
- [ ] Integración OpenRouter API
- [ ] Integración LMSYS dataset
- [ ] Groq Refiner prompt
- [ ] Fallback + webhook notificación

### Base de Datos
- [ ] Tabla ai_models
- [ ] Tabla ai_stats
- [ ] Tabla ai_benchmarks
- [ ] Tabla ai_reviews
- [ ] Tabla ai_ranking_history
- [ ] Triggers para stats

### Frontend
- [ ] Home con podio + lista infinite
- [ ] Filtros por categoría
- [ ] Cards con tendencia ↑↓
- [ ] Badge NEW
- [ ] Ficha con radar chart
- [ ] Formulario review con tags
- [ ] Comparador 2 modelos

### Integraciones
- [ ] Link "Probar" → sitio externo
- [ ] Link "Crear Prompt" → Módulo 1

---

*Módulo 2 (Pulse) — ESPECIFICACIÓN FINAL v3.0*
*5 partes integradas | Listo para desarrollo*
