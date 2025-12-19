# 04 SHOWCASE SPEC — Launchpad & Social Feed

> **Módulo**: Showcase (Galería de Proyectos)  
> **Versión**: 2.0 FINAL | **Fecha**: 2025-12-19  
> **Estado**: ✅ Listo para desarrollo

---

## 1. Propósito

**Objetivo**: Directorio de "Prueba Social" + Red social de proyectos IA.

**Valor**: Devs obtienen visibilidad → App obtiene UGC.

**Foco MVP**: Solo proyectos de **programación**.

---

## 2. Campos de Publicación

| Campo | Tipo | Descripción |
|-------|------|-------------|
| **Título** | text | Nombre del proyecto |
| **Pitch** | text (200 chars) | Descripción corta |
| **Link de Acción** | URL + tipo | Visitar / Descargar / Solo Presumir |
| **Stack IA** | chips[] | Herramientas usadas |
| **Capturas** | images[] | 3 máximo, WebP comprimidas |

### Tipos de Link de Acción
| Tipo | Botón | Destino |
|------|-------|---------|
| `visit` | 🔗 Visitar | Web, portafolio, demo |
| `download` | 📥 Descargar | App Store, Play Store, repo |
| `inspiration` | 👁️ Ver más | Sin link externo (solo inspiración) |

---

## 3. Gamificación (Ego-Metrics)

| Métrica | Icono | Descripción |
|---------|-------|-------------|
| **Vistas** | 👁️ | Contador de aperturas del detalle |
| **Útil** | 👍 | Upvotes de utilidad |
| **Trending** | 🔥 | Badge si > 100 vistas en 24h |

### Lógica Trending Badge
```typescript
async function checkTrending(projectId: string) {
  const views24h = await supabase
    .from('project_views')
    .select('*', { count: 'exact' })
    .eq('project_id', projectId)
    .gte('created_at', new Date(Date.now() - 24 * 60 * 60 * 1000));
  
  if (views24h.count >= 100) {
    await supabase
      .from('projects')
      .update({ is_trending: true })
      .eq('id', projectId);
  }
}
```

---

## 4. Moderación IA con Groq

### Flujo de Comentarios
```
[Usuario escribe] → [Groq valida] → [Aprobado: Publica]
                                  → [Rechazado: Mensaje error]
```

### Prompt de Moderación
```
SYSTEM:
Eres un moderador de comunidad tech. Analiza este comentario:

TAREAS:
1. Detectar toxicidad (insultos, ataques)
2. Filtrar spam (links repetitivos, promoción)
3. Clasificar tipo: "pregunta_tecnica" | "felicitacion" | "feedback" | "spam" | "toxico"

RESPONDE JSON:
{
  "approved": true/false,
  "type": "pregunta_tecnica",
  "reason": "Comentario constructivo"
}
```

### Implementación
```typescript
async function moderateComment(content: string): Promise<ModerationResult> {
  const response = await groq.chat({
    model: 'llama-3.3-70b-specdec',
    temperature: 0.1,
    messages: [{
      role: 'system',
      content: MODERATION_PROMPT
    }, {
      role: 'user',
      content
    }]
  });
  
  const result = JSON.parse(response.content);
  
  if (!result.approved) {
    throw new Error('Tu comentario no cumple con las normas de la comunidad');
  }
  
  return result;
}
```

---

## 5. Evolución de UI

### Fase 1: Pinterest Grid (V1 - Lanzamiento)
```
┌────────────┐ ┌────────────┐
│   [IMG]    │ │   [IMG]    │
│  Proyecto  │ │  Proyecto  │
│    A       │ │    B       │
│ 👁️45 👍12 │ │ 👁️89 👍34 │
└────────────┘ └────────────┘
┌────────────┐ ┌────────────┐
│   [IMG]    │ │   [IMG]    │
│  Proyecto  │ │  Proyecto  │
│    C       │ │    D       │
└────────────┘ └────────────┘
```
**Por qué**: Más eficiente con pocos proyectos. Muestra 4-6 en pantalla.

### Fase 2: Reels (V2 - Con 50+ proyectos)
```
┌─────────────────────────────┐
│                             │
│      [IMAGEN GRANDE]        │
│                             │
├─────────────────────────────┤
│ Proyecto A           🔥    │
│ [Antigravity] [Cursor]      │
│ 👁️ 234  👍 45  💬 12      │
│                             │
│ [🔗 Visitar Proyecto]       │
└─────────────────────────────┘
     ↑ Swipe para siguiente
```
**Por qué**: Experiencia "adictiva" de descubrimiento.

---

## 6. Stack de Herramientas (Chips)

| Tag | Herramienta |
|-----|-------------|
| `antigravity` | Google AI Assistant |
| `cursor` | AI Code Editor |
| `bolt` | Bolt.new |
| `v0` | v0.dev |
| `chatgpt` | ChatGPT-only |
| `claude` | Claude Artifacts |
| `windsurf` | Windsurf IDE |
| `replit` | Replit Agent |
| `devin` | Devin AI |

---

## 7. Base de Datos

```sql
create table projects (
  id uuid primary key default uuid_generate_v4(),
  user_id uuid references profiles(id) on delete cascade,
  
  title text not null,
  description text not null check (char_length(description) <= 200),
  
  -- Link dinámico
  action_type text check (action_type in ('visit', 'download', 'inspiration')),
  project_url text,
  
  tools_array text[] not null,
  image_urls text[],
  
  -- Métricas
  upvotes_count int default 0,
  views_count int default 0,
  
  -- Moderación
  is_hidden boolean default false,
  is_trending boolean default false,
  report_count int default 0,
  
  created_at timestamptz default now()
);

create table project_views (
  id uuid primary key default uuid_generate_v4(),
  project_id uuid references projects(id) on delete cascade,
  viewer_id uuid,
  created_at timestamptz default now()
);

create table project_votes (
  id uuid primary key default uuid_generate_v4(),
  project_id uuid references projects(id) on delete cascade,
  user_id uuid references profiles(id),
  created_at timestamptz default now(),
  unique(project_id, user_id)
);

create table project_comments (
  id uuid primary key default uuid_generate_v4(),
  project_id uuid references projects(id) on delete cascade,
  user_id uuid references profiles(id),
  content text not null,
  comment_type text,  -- 'pregunta_tecnica', 'felicitacion', etc.
  is_moderated boolean default true,
  created_at timestamptz default now()
);

-- Índices
create index idx_projects_trending on projects(is_trending) where is_trending = true;
create index idx_projects_upvotes on projects(upvotes_count desc);
create index idx_views_24h on project_views(project_id, created_at);
```

---

## 8. Tabs con "Coming Soon"

| Tab | Estado |
|-----|--------|
| **Programación** | ✅ Activo |
| **Arte IA** | 🔒 Coming Soon |
| **Video IA** | 🔒 Coming Soon |
| **Agentes** | 🔒 Coming Soon |

---

## 9. API Endpoints

```typescript
GET  /api/projects              // Feed (grid o infinite)
GET  /api/projects/:id          // Detalle
POST /api/projects              // Crear
POST /api/projects/:id/vote     // Upvote
POST /api/projects/:id/view     // Registrar vista
GET  /api/projects/:id/comments // Comentarios
POST /api/projects/:id/comments // Comentar (con moderación Groq)
POST /api/projects/:id/report   // Reportar
```

---

## 10. Flujo UX

```
[Feed Grid] → [Tap proyecto] → [Detalle + Vista++]
                              → [Upvote]
                              → [Comentar → Groq modera → Publica]
                              → [Visitar/Descargar]
```

---

## 11. Checklist

### Backend
- [ ] CRUD proyectos con action_type
- [ ] Sistema upvotes + vistas
- [ ] Groq moderation para comentarios
- [ ] Auto-trending (100 vistas/24h)
- [ ] Auto-hide (3 reportes)

### Frontend
- [ ] Form publicación (1 pantalla)
- [ ] Grid Masonry (Fase 1)
- [ ] Detalle con carrusel
- [ ] Tabs Coming Soon
- [ ] Contador vistas en tiempo real

### Storage
- [ ] Compresión WebP cliente
- [ ] Bucket "project-images"
- [ ] Límite 3 imágenes

---

*Módulo 4 (Showcase) — FINAL v2.0*
