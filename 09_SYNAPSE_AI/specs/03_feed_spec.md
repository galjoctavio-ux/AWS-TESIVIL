# 03 FEED SPEC — Noticias y Alertas

> **Módulo**: News Feed  
> **Versión**: 2.0 FINAL | **Fecha**: 2025-12-19  
> **Estado**: ✅ Listo para desarrollo

---

## 1. Propósito

**Objetivo**: Motor de retención — Que el usuario abra la app cada mañana.

**Valor**: Noticias resumidas por IA, contenido original, notificaciones inteligentes.

---

## 2. Fuentes RSS

| Fuente | Tipo | URL |
|--------|------|-----|
| TechCrunch | Negocio | techcrunch.com/ai/feed |
| The Verge | Lanzamientos | theverge.com/ai/rss |
| ArXiv | Científico | arxiv.org/rss/cs.AI |
| Hacker News | Tendencias | hnrss.org/newest?q=AI |
| OpenAI Blog | Oficial | openai.com/blog/rss |
| Anthropic | Oficial | anthropic.com/news/rss |
| Google DeepMind | Oficial | deepmind.google/blog/rss |

---

## 3. Pipeline de Procesamiento

```
[RSS Fetch] → [Gemini Flash] → [Anti-Duplicados] → [DB + Push]
```

### Gemini Flash Prompt
```
Actúa como periodista tecnológico. Crea contenido original:
1. Título impactante (60 chars)
2. 3 bullet points (20 palabras c/u)
3. "¿Por qué te importa?" (utilidad práctica)
4. topic_id único (LAUNCH_GEMINI_3)
5. Calificación importancia 1-10
Responde en JSON.
```

---

## 4. Anti-Duplicados (3 Capas)

| Capa | Método |
|------|--------|
| 1 | URL única → si existe, ignorar |
| 2 | topic_id semántico de Gemini |
| 3 | topic_id en últimas 24h → ignorar |

---

## 5. Base de Datos

```sql
create table news_articles (
  id uuid primary key default uuid_generate_v4(),
  title text not null,
  summary_json jsonb not null,
  topic_id text not null,
  source_name text not null,
  url_original text unique,
  importance int check (importance between 1 and 10),
  image_url text,
  published_at timestamptz,
  created_at timestamptz default now()
);

create table news_comments (
  id uuid primary key default uuid_generate_v4(),
  article_id uuid references news_articles(id) on delete cascade,
  user_id uuid references profiles(id),
  content text not null,
  created_at timestamptz default now()
);
```

---

## 6. UI: Feed + Detalle

### Feed (Cards verticales)
```
┌────────────────────────────────────────┐
│ [IMG] o1-preview en API         🔥    │
│       OpenAI · Hace 2h                 │
│       [📖 Leer resumen]                │
└────────────────────────────────────────┘
```

### Detalle (Bottom Sheet)
- 3 bullet points
- "¿Por qué te importa?"
- [🔗 Leer en fuente original]
- Comentarios

---

## 7. Push Notifications

```typescript
if (article.importance >= 9) {
  sendPush({ title: `🚀 ${article.title}`, body: bullets[0] });
}
```

---

## 8. Cron Schedule

```typescript
// Cada hora 7am-11pm
const CRON = '0 7-23 * * *';
```

---

## 9. API Endpoints

```typescript
GET  /api/news              // Feed paginado
GET  /api/news/:id          // Artículo
POST /api/news/:id/comments // Comentar
```

---

## 10. Checklist

- [ ] Cron job cada hora
- [ ] Parser RSS (7 fuentes)
- [ ] Gemini Flash integration
- [ ] Anti-duplicados 3 capas
- [ ] Push notifications (importance >= 9)
- [ ] UI: Feed + Bottom sheet
- [ ] Comentarios

---

*Módulo 3 (Feed) — FINAL*
