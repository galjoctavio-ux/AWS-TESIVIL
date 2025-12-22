# TESIVIL App Hub

Catálogo centralizado de aplicaciones del ecosistema TESIVIL.

## 🚀 Inicio Rápido

### 1. Configurar Supabase

Edita `js/config.js` con tus credenciales de Supabase:

```javascript
const CONFIG = {
    SUPABASE_URL: 'https://tu-proyecto.supabase.co',
    SUPABASE_ANON_KEY: 'tu-anon-key-aqui',
    // ...
};
```

### 2. Crear Tabla en Supabase

Ejecuta este SQL en el SQL Editor de Supabase:

```sql
CREATE TABLE apps (
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

-- Índices
CREATE INDEX idx_apps_categoria ON apps(categoria);
CREATE INDEX idx_apps_slug ON apps(slug);

-- RLS para acceso público de lectura
ALTER TABLE apps ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Apps are viewable by everyone" 
ON apps FOR SELECT 
TO anon 
USING (true);
```

### 3. Agregar una App de Prueba

```sql
INSERT INTO apps (nombre, slug, categoria, descripcion_corta, features, url_web)
VALUES (
  'QR Clima',
  'qrclima',
  'Web App',
  'Genera códigos QR con información meteorológica en tiempo real.',
  '["Generación de QR", "Datos meteorológicos", "Compartir fácilmente"]',
  'https://qrclima.tesivil.com'
);
```

### 4. Servir el Sitio

**Opción A - Servidor local (desarrollo):**
```bash
# Con Python 3
python -m http.server 8080

# Con Node.js (npx)
npx serve .
```

**Opción B - Nginx (producción):**
Copia los archivos a `/var/www/apps.tesivil.com/` y configura Nginx.

---

## 📁 Estructura del Proyecto

```
10_APP_HUB/
├── index.html          # Página principal (catálogo)
├── app.html            # Página de detalle
├── css/
│   └── main.css        # Estilos principales
├── js/
│   ├── config.js       # Configuración
│   ├── supabase-client.js
│   ├── components.js   # Componentes UI
│   ├── home.js         # Lógica del home
│   └── detail.js       # Lógica del detalle
├── assets/
│   ├── favicon.svg
│   └── placeholder.svg
└── README.md
```

---

## 🎨 Personalización

### Colores
Edita las variables CSS en `css/main.css`:

```css
:root {
    --color-primary: #3b82f6;     /* Azul principal */
    --color-background: #0f172a;  /* Fondo oscuro */
    --color-surface: #1e293b;     /* Superficies */
    /* ... */
}
```

### Categorías
Edita `CONFIG.CATEGORIES` en `js/config.js` y actualiza los botones en `index.html`.

---

## 📥 Descargas APK

Para las apps Android, obtén el **ID del archivo de Google Drive**:

1. Sube el APK a Google Drive
2. Copia el enlace de compartir: `https://drive.google.com/file/d/XXXXX/view`
3. El ID es la parte `XXXXX`
4. Guárdalo en el campo `drive_id` de la tabla

El sistema generará automáticamente el enlace de descarga directa.

---

## 🔧 Tecnologías

- **HTML5** + **Vanilla JavaScript**
- **CSS3** con variables y Grid/Flexbox
- **Supabase** (PostgreSQL + Storage)
- **Google Fonts** (Inter)

---

## 📄 Licencia

© 2025 TESIVIL. Todos los derechos reservados.
