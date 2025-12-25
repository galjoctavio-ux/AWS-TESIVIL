# QRclima Cloud Functions

## Descripción

Cloud Functions para automatización de tareas en QRclima:

- **expireSubscriptions**: Ejecuta todos los días a las 3:00 AM (CST) para limpiar suscripciones expiradas
- **forceExpireSubscription**: Endpoint HTTP para expirar manualmente una suscripción
- **onUserRead**: Trigger que expira suscripción cuando se actualiza el documento de usuario

## Deployment

### Requisitos
- Node.js 18+
- Firebase CLI: `npm install -g firebase-tools`
- Proyecto Firebase configurado

### Instalación

```bash
cd functions
npm install
```

### Configuración Firebase
```bash
firebase login
firebase use --add  # Selecciona tu proyecto
```

### Deploy
```bash
npm run deploy
# O directamente:
firebase deploy --only functions
```

### Testing local
```bash
npm run serve  # Inicia emuladores de Firebase
```

## Logs

Para ver logs de las funciones:
```bash
firebase functions:log
```

## Arquitectura de Expiración

QRclima implementa **triple capa** de protección para suscripciones:

1. **Cliente (App)**: `isUserPro()` verifica fecha de expiración cada vez que se checa acceso PRO
2. **Cliente (Login)**: `checkAndExpireSubscription()` se ejecuta al iniciar la app
3. **Servidor (Scheduled)**: Cloud Function limpia todas las suscripciones expiradas diariamente

Esto garantiza que NINGÚN usuario tendrá acceso PRO después de su fecha de expiración.
