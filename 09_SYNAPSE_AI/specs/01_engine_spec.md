# 01 ENGINE SPEC — Generador de Prompts para Imágenes

> **Módulo**: Engine (Prompts)  
> **Versión**: 2.0 FINAL | **Fecha**: 2025-12-18  
> **Estado**: ✅ Listo para desarrollo

---

## 1. Visión del Módulo

**Posicionamiento**: Especialista en **Text-to-Image**. Ayuda al usuario a "hablar" en términos de fotografía, arte y diseño.

**Propuesta de Valor**: Convertir ideas simples en prompts técnicos profesionales en < 1 segundo.

**Motor IA**: Groq (`llama-3.3-70b-specdec`) — Latencia mínima, costos bajos.

---

## 2. Exclusiones del MVP

| Feature | Razón | Versión |
|---------|-------|---------|
| ❌ Carga de imágenes | Evita storage | v1.1 |
| ❌ Inpainting | UI compleja | v1.2 |
| ❌ Generación interna | El MVP entrega texto | v1.1 |

---

## 3. Flujo de Usuario (UX Path)

**4 pasos progresivos para no saturar en móvil:**

```
┌─────────────────────────────────────────────────────────────┐
│  PASO 1: INPUT TEXT                                   [1/4] │
│  ─────────────────────────────────────────────────────────  │
│  ┌─────────────────────────────────────────────────────┐   │
│  │  "Un perro espacial explorando Marte..."           │   │
│  └─────────────────────────────────────────────────────┘   │
│  [✨ Varita Mágica]                     [Siguiente →]       │
└─────────────────────────────────────────────────────────────┘
                          ↓
┌─────────────────────────────────────────────────────────────┐
│  PASO 2: SELECTOR DE ESTILO                           [2/4] │
│  ─────────────────────────────────────────────────────────  │
│  Grid de 8 tarjetas (2 columnas × 4 filas)                  │
│  ┌──────────────┐  ┌──────────────┐                        │
│  │   [IMG]      │  │   [IMG]      │                        │
│  │ Fotorealismo │  │ 3D Pixar    │  ← 50% width cada una  │
│  │     ✓        │  │              │  ← Check si seleccionado│
│  └──────────────┘  └──────────────┘                        │
│      border-radius: 12px                                    │
│      borde activo: azul eléctrico                          │
└─────────────────────────────────────────────────────────────┘
                          ↓
┌─────────────────────────────────────────────────────────────┐
│  PASO 3: AJUSTES TÉCNICOS (Dinámicos)                 [3/4] │
│  ─────────────────────────────────────────────────────────  │
│  Si Fotorealismo/Arquitectura/Minimalismo:                  │
│    Lente: [Gran Angular] [Macro] [Bokeh] [Drone]           │
│    Luz:   [Natural] [Estudio] [Golden Hour]                │
│                                                             │
│  Si Anime/3D/Óleo/Cyberpunk/Arte Digital:                  │
│    Técnica: [Líneas Finas] [Vibrante] [Pintura]            │
│    Luz:     [Suave] [Alto Contraste] [Neón]                │
│                                                             │
│  Formato: [□ 1:1] [▭ 16:9] [▯ 9:16]                        │
│  Motor:   [Midjourney ▼]                                   │
└─────────────────────────────────────────────────────────────┘
                          ↓
┌─────────────────────────────────────────────────────────────┐
│  PASO 4: RESULTADO FINAL                              [4/4] │
│  ─────────────────────────────────────────────────────────  │
│  ┌─────────────────────────────────────────────────────┐   │
│  │ A space dog in detailed astronaut suit exploring   │   │
│  │ the red Martian desert, photorealistic style,      │   │
│  │ 85mm lens, golden hour lighting, 8k --v 6 --ar 16:9│   │
│  └─────────────────────────────────────────────────────┘   │
│                                                             │
│  [📋 Copiar] ← Toast: "¡Copiado!"                          │
│  [💾 Guardar]  [🔄 Nuevo Prompt]                           │
│                                                             │
│  ─── Historial (últimos 5) ───                             │
│  • "A cyberpunk cat..." (hace 2 min)                       │
│  • "Mountain landscape..." (hace 1 hora)                   │
└─────────────────────────────────────────────────────────────┘
```

---

## 4. Dual-Layer Groq (El Cerebro)

### Configuración General
```typescript
const GROQ_CONFIG = {
  model: "llama-3.3-70b-specdec",
  layer_a_temperature: 0.7,  // Creatividad
  layer_b_temperature: 0.2,  // Estructura técnica
};
```

### Capa A: Enriquecimiento
**Se dispara al presionar "Varita Mágica"**

```
SYSTEM PROMPT:

Actúa como un director de arte. Recibirás una idea simple.
Tu tarea es expandirla en una descripción visual detallada de 20 palabras.
No menciones estilos artísticos, solo describe el objeto, su material y su acción.

Ejemplo:
Input: "Un gato mecánico"
Output: "Un felino de metal con engranajes visibles, ojos de cristal brillante 
y cables de cobre expuestos"

Responde solo con la descripción.
```

**Parámetros:**
```typescript
{
  model: "llama-3.3-70b-specdec",
  temperature: 0.7,
  max_tokens: 100
}
```

---

### Capa B: Ensamblador
**Toma salida de Capa A + selectores → Prompt final optimizado**

```
SYSTEM PROMPT:

Eres un experto en Prompt Engineering para {MOTOR_SELECCIONADO}.
Toma la descripción visual y los parámetros técnicos para crear un prompt profesional.

Usa comas para separar conceptos.
Estructura: [Sujeto detallado], [Estilo], [Iluminación], [Técnica/Lente], [Resolución].

Para Midjourney añade: --v 6 --ar {RATIO}
Para estilos fotográficos, añade parámetros de cámara (85mm, bokeh).

Responde solo con el prompt final.
```

**Parámetros:**
```typescript
{
  model: "llama-3.3-70b-specdec",
  temperature: 0.2,
  max_tokens: 200
}
```

---

## 5. Árbol Lógico Dinámico

### Clasificación de Estilos

| Ruta | Estilos | Parámetros Visibles |
|------|---------|---------------------|
| **A** (Fotográfico) | Fotorealismo, Arquitectura, Minimalismo | Lentes + Iluminación |
| **B** (Artístico) | Anime, 3D Pixar, Cyberpunk, Óleo, Arte Digital | Técnica + Iluminación |

### Configuración de Código

```typescript
const STYLES_CONFIG = {
  // RUTA A: Fotográfico
  fotorealismo: {
    route: 'A',
    lenses: ['wide', 'macro', 'bokeh', 'drone'],
    lighting: ['natural', 'studio', 'golden', 'dramatic'],
    negativePrompt: '--no cartoon, drawing, anime'
  },
  arquitectura: {
    route: 'A',
    lenses: ['wide', 'drone', 'bokeh'],
    lighting: ['natural', 'golden', 'studio'],
    negativePrompt: '--no cartoon, illustration'
  },
  minimalismo: {
    route: 'A',
    lenses: ['wide', 'macro'],
    lighting: ['studio', 'natural'],
    negativePrompt: '--no busy, cluttered, detailed'
  },
  
  // RUTA B: Artístico
  anime: {
    route: 'B',
    technique: ['fine_lines', 'vibrant', 'cel_shading'],
    lighting: ['soft', 'high_contrast', 'neon'],
    negativePrompt: '--no realistic, photo, 3d'
  },
  '3d_pixar': {
    route: 'B',
    technique: ['global_light', 'vibrant', 'soft_texture'],
    lighting: ['soft', 'neon'],
    negativePrompt: '--no 2d, flat, sketch'
  },
  cyberpunk: {
    route: 'B',
    technique: ['vibrant', 'fine_lines', 'glow'],
    lighting: ['neon', 'high_contrast'],
    negativePrompt: '--no daylight, natural, vintage'
  },
  oleo: {
    route: 'B',
    technique: ['paint_effect', 'fine_lines', 'texture'],
    lighting: ['soft', 'dramatic'],
    negativePrompt: '--no photo, digital, sharp'
  },
  arte_digital: {
    route: 'B',
    technique: ['vibrant', 'global_light', 'fine_lines'],
    lighting: ['soft', 'neon', 'high_contrast'],
    negativePrompt: '--no photo, traditional'
  }
};

// Lógica de rama
function getAvailableParams(styleId: string) {
  const config = STYLES_CONFIG[styleId];
  if (config.route === 'A') {
    return { 
      showLenses: true, 
      lenses: config.lenses, 
      lighting: config.lighting 
    };
  } else {
    return { 
      showLenses: false, 
      technique: config.technique, 
      lighting: config.lighting 
    };
  }
}
```

---

## 6. Assets: Guía de Nomenclatura

### Estructura de Carpetas
```
/assets/prompts/
├── styles/
│   ├── style_fotorealismo.jpg
│   ├── style_3d_pixar.jpg
│   ├── style_anime.jpg
│   ├── style_cyberpunk.jpg
│   ├── style_arquitectura.jpg
│   ├── style_arte_digital.jpg
│   ├── style_oleo.jpg
│   └── style_minimalismo.jpg
└── params/
    ├── param_lente_macro.jpg
    ├── param_lente_wide.jpg
    ├── param_lente_bokeh.jpg
    ├── param_drone_view.jpg
    ├── param_iluminacion_neon.jpg
    ├── param_iluminacion_golden.jpg
    ├── param_iluminacion_estudio.jpg
    ├── param_tecnica_lineas.jpg
    ├── param_tecnica_vibrante.jpg
    └── param_tecnica_pintura.jpg
```

### Especificaciones de Imagen
| Tipo | Dimensiones | Formato | Peso Máx |
|------|-------------|---------|----------|
| Estilos (Cards) | 400×300 px | WebP | 50KB |
| Parámetros (Iconos) | 160×160 px | WebP | 20KB |

> **Nota**: Todas las imágenes deben tener el mismo filtro/tono para verse premium.

---

## 7. UI/UX Especificaciones

### Cards de Estilo
```css
.style-card {
  width: 50%;              /* 2 columnas */
  aspect-ratio: 4/3;
  border-radius: 12px;
  border: 2px solid transparent;
  transition: all 0.2s ease;
}

.style-card.selected {
  border-color: #3B82F6;   /* Azul eléctrico */
  box-shadow: 0 0 0 4px rgba(59, 130, 246, 0.2);
}

.style-card .checkmark {
  position: absolute;
  top: 8px;
  right: 8px;
  display: none;
}

.style-card.selected .checkmark {
  display: block;
}
```

### Toast de Copiado
```typescript
// Al presionar "Copiar"
await Clipboard.setStringAsync(finalPrompt);
Toast.show({
  type: 'success',
  text1: '¡Copiado!',
  text2: 'Prompt listo para usar',
  visibilityTime: 2000,
});
```

---

## 8. Base de Datos (Supabase)

```sql
create table prompt_builder_history (
  id uuid primary key default uuid_generate_v4(),
  user_id uuid references profiles(id) on delete cascade,
  
  -- Inputs
  input_raw text not null,        -- Lo que escribió el usuario
  input_enriched text,            -- Salida de Capa A
  
  -- Configuración
  config_json jsonb not null,     -- { style, light, lens/technique, aspect, engine }
  
  -- Output
  prompt_final text not null,     -- String final copiado
  
  -- Metadata
  created_at timestamptz default now()
);

-- Índice para historial del usuario
create index idx_prompt_history_user 
  on prompt_builder_history(user_id, created_at desc);

-- RLS
alter table prompt_builder_history enable row level security;

create policy "Users see own prompts"
  on prompt_builder_history for select
  using (auth.uid() = user_id);

create policy "Users insert own prompts"
  on prompt_builder_history for insert
  with check (auth.uid() = user_id);
```

---

## 9. API Endpoints

```typescript
// POST /api/prompts/refine
// Capa A: Enriquecimiento
interface RefineRequest {
  raw_input: string;
}
interface RefineResponse {
  enriched: string;
  tokens_used: number;
}

// POST /api/prompts/generate
// Capa B: Ensamblador
interface GenerateRequest {
  description: string;
  style: StyleId;
  lighting: LightingId;
  lens_or_technique: string;
  aspect_ratio: '1:1' | '16:9' | '9:16';
  target_engine: 'midjourney' | 'dalle3' | 'stable';
}
interface GenerateResponse {
  prompt: string;
  negative_prompt: string;
}

// POST /api/prompts/save
interface SaveRequest {
  input_raw: string;
  input_enriched?: string;
  config_json: PromptConfig;
  prompt_final: string;
}
interface SaveResponse {
  id: string;
}

// GET /api/prompts/history?limit=5
interface HistoryResponse {
  prompts: PromptHistory[];
  total: number;
}
```

---

## 10. Límites Free vs Premium

| Feature | Free | Premium |
|---------|------|---------|
| Historial guardado | 5 | 100 |
| "Varita Mágica" (Capa A) | 3/día | Ilimitado |
| Estilos disponibles | 4 básicos | 8 todos |
| Negative prompts | Automático | Editable |

---

## 11. Manejo de Errores

| Error | Respuesta UI | Acción |
|-------|--------------|--------|
| Groq timeout | "La IA está ocupada, intenta de nuevo" | Retry con backoff |
| Groq rate limit | "Has alcanzado el límite, espera 1 min" | Mostrar countdown |
| Input vacío | Validación inline "Escribe una idea" | Disable botón |
| Input muy largo (>500 chars) | "Idea muy larga, resume un poco" | Truncar |

---

## 12. Checklist de Implementación

### Assets
- [ ] Generar 8 imágenes de estilos (style_*.jpg)
- [ ] Generar 10 imágenes de parámetros (param_*.jpg)
- [ ] Subir a Supabase Storage o CDN

### Backend
- [ ] Endpoint `/api/prompts/refine` (Capa A)
- [ ] Endpoint `/api/prompts/generate` (Capa B)
- [ ] Endpoint `/api/prompts/save`
- [ ] Endpoint `/api/prompts/history`
- [ ] Integración Groq con manejo de errores
- [ ] Rate limiting por tier

### Frontend
- [ ] Componente `PromptWizard` (4 pasos)
- [ ] Componente `StyleCard` con estados
- [ ] Componente `ParamChip` dinámico
- [ ] Lógica de ramas A/B
- [ ] Historial con lazy loading
- [ ] Toast de copiado

### Base de Datos
- [ ] Crear tabla `prompt_builder_history`
- [ ] Aplicar RLS policies
- [ ] Crear índice de usuario

---

*Módulo 1 (Engine) — Especificación FINAL para MVP.*
*Listo para pasar a desarrollo.*
