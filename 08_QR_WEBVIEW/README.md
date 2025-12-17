# Mr. Frío - QR Web View

Vista pública web para el historial de equipos escaneados por QR.

## Descripción

Cuando un cliente escanea el QR pegado en su equipo de aire acondicionado, esta página muestra:
- Estado del equipo (Semáforo: Verde/Amarillo/Rojo)
- Historial de servicios (sanitizado, sin precios)
- Botón de WhatsApp al último técnico

## Stack

- **Framework**: Next.js 14 (App Router)
- **Estilos**: TailwindCSS
- **Firebase**: Firestore (read-only queries)

## Configuración

```bash
cd 08_QR_WEBVIEW
npm install
npm run dev
```

## Variables de Entorno

Crea `.env.local`:

```env
# Firebase (solo lectura pública)
NEXT_PUBLIC_FIREBASE_API_KEY=your-api-key
NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN=your-project.firebaseapp.com
NEXT_PUBLIC_FIREBASE_PROJECT_ID=your-project-id

# URL de la App Store/Play Store
NEXT_PUBLIC_IOS_APP_URL=https://apps.apple.com/app/mrfrio
NEXT_PUBLIC_ANDROID_APP_URL=https://play.google.com/store/apps/details?id=com.mrfrio
```

## Rutas

- `/qr/[hash]` - Vista del historial del equipo
- `/` - Redirect a landing principal

## Despliegue

Recomendado: Firebase Hosting o Vercel

```bash
npm run build
vercel --prod
```
