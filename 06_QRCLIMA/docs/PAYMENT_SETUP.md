# Configuración de Pagos - Mr. Frío App

## Proveedores Soportados
- **Stripe** - Internacional
- **MercadoPago** - Recomendado para México

---

## Paso 1: Obtener Claves

### Stripe
1. Ir a https://dashboard.stripe.com/apikeys
2. Copiar `Publishable key` (pk_live_... o pk_test_...)
3. Copiar `Secret key` para Cloud Functions

### MercadoPago
1. Ir a https://www.mercadopago.com.mx/developers/panel/app
2. Crear aplicación → "Mr. Frío App"
3. Copiar `Public Key` y `Access Token`

---

## Paso 2: Configurar Variables de Entorno

### Expo (app.json)
```json
{
  "expo": {
    "extra": {
      "stripePublishableKey": "pk_live_...",
      "mpPublicKey": "APP_USR-..."
    }
  }
}
```

### O usando .env (requiere expo-constants)
```
EXPO_PUBLIC_STRIPE_KEY=pk_live_...
EXPO_PUBLIC_MP_PUBLIC_KEY=APP_USR-...
```

---

## Paso 3: Cloud Functions (Backend)

Las claves secretas NUNCA deben estar en el cliente.

```typescript
// functions/src/payments.ts
import * as functions from 'firebase-functions';
import Stripe from 'stripe';

const stripe = new Stripe(functions.config().stripe.secret_key);

export const createPaymentIntent = functions.https.onCall(async (data, context) => {
    const { amount, currency = 'mxn' } = data;
    
    const paymentIntent = await stripe.paymentIntents.create({
        amount: amount * 100, // Centavos
        currency,
    });
    
    return { clientSecret: paymentIntent.client_secret };
});
```

---

## Paso 4: Instalar SDK en App

```bash
# Stripe
npx expo install @stripe/stripe-react-native

# MercadoPago (React Native)
npm install mercadopago-react-native
```

---

## Paso 5: Testing

### Tarjetas de Prueba (Stripe)
- Éxito: `4242 4242 4242 4242`
- Rechazada: `4000 0000 0000 0002`
- 3D Secure: `4000 0027 6000 3184`

### Tarjetas de Prueba (MercadoPago)
- Éxito: `5474 9254 3267 0366` CVV: 123 Exp: 11/25
- Rechazada: `4000 0000 0000 0036`

---

## Arquitectura de Seguridad

```
┌─────────────────┐         ┌─────────────────┐
│   App (Expo)    │         │ Cloud Functions │
│                 │         │                 │
│  Public Key     │◄───────►│  Secret Key     │
│  UI de Pago     │         │  Stripe/MP API  │
│  Token Método   │         │  Webhooks       │
└─────────────────┘         └─────────────────┘
        │                           │
        └───────────┬───────────────┘
                    │
            ┌───────▼───────┐
            │   Firestore   │
            │               │
            │ payment_intents│
            │ orders        │
            └───────────────┘
```

---

## Checklist de Lanzamiento

- [ ] Crear cuentas Stripe/MercadoPago en modo producción
- [ ] Configurar claves en variables de entorno
- [ ] Desplegar Cloud Functions
- [ ] Configurar webhooks para confirmación
- [ ] Probar flujo completo con tarjeta de prueba
- [ ] Verificar que órdenes se crean correctamente
