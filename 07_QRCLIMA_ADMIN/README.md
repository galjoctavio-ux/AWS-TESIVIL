# Mr. Frío - Panel de Administración

Panel web de administración para la aplicación Mr. Frío según el módulo 9 del master_plan.md.

## Stack Tecnológico

- **Framework**: Next.js 14 (App Router)
- **Estilos**: TailwindCSS
- **Autenticación**: Firebase Admin SDK
- **Base de datos**: Firebase Firestore
- **Charts**: Recharts

## Configuración Inicial

### 1. Instalar dependencias

```bash
cd 07_MRFRIO_ADMIN
npm install
```

### 2. Configurar variables de entorno

Copia el archivo `.env.example` a `.env.local` y configura:

```env
# Firebase Admin SDK
FIREBASE_PROJECT_ID=your-project-id
FIREBASE_CLIENT_EMAIL=your-service-account@project.iam.gserviceaccount.com
FIREBASE_PRIVATE_KEY="-----BEGIN PRIVATE KEY-----\n...\n-----END PRIVATE KEY-----\n"

# NextAuth
NEXTAUTH_SECRET=your-secret-key
NEXTAUTH_URL=http://localhost:3000

# Admin Emails (separados por coma)
ADMIN_EMAILS=admin@tudominio.com,otro@tudominio.com
```

### 3. Iniciar servidor de desarrollo

```bash
npm run dev
```

El panel estará disponible en `http://localhost:3000`

## Estructura de Carpetas

```
07_MRFRIO_ADMIN/
├── app/
│   ├── (auth)/
│   │   └── login/
│   ├── (dashboard)/
│   │   ├── page.tsx          # Dashboard principal (KPIs)
│   │   ├── users/            # Gestión de usuarios
│   │   ├── orders/           # Gestión de pedidos
│   │   ├── moderation/       # Moderación de contenido
│   │   └── settings/         # Configuración remota
│   ├── api/
│   │   ├── auth/
│   │   └── admin/
│   └── layout.tsx
├── components/
│   ├── charts/
│   ├── tables/
│   └── ui/
├── lib/
│   ├── firebase-admin.ts
│   └── auth.ts
└── package.json
```

## Funcionalidades (Según Master Plan)

### Dashboard Ejecutivo
- DAU/MAU (Usuarios activos)
- Ventas totales MXN
- Token Float (circulación)
- Pedidos pendientes

### Gestión de Usuarios
- Búsqueda por alias/email/teléfono
- Flags: `is_banned`, `is_pro`, `eligible_for_directory`
- Regalar tokens manualmente

### Gestión de Pedidos
- Cola de pedidos pagados
- Agregar número de guía
- Marcar como enviado

### Moderación
- Cola de contenido flaggeado por IA
- Acciones: Ignorar/Borrar/Banear

### Remote Config
- Editar reglas de tokens
- Precios de mercado
- Factores BTU

## Despliegue

### Vercel (Recomendado)
```bash
npx vercel
```

### Firebase Hosting
```bash
npm run build
firebase deploy --only hosting:admin
```
