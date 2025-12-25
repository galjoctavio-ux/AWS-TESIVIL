# Estrategia de Anuncios - QRClima

## Objetivo
Monetizar usuarios FREE mientras se mantiene una experiencia premium para suscriptores PRO.

---

## Tipos de Anuncios

| Tipo | Cuándo Usar | Frecuencia |
|------|-------------|------------|
| **Banner** | Pantallas con scroll (Home, Tools) | Siempre visible |
| **Interstitial** | Después de generar PDF/resultado | Cada generación |
| **Rewarded** | Desbloqueo temporal de features | Opcional por usuario |

---

## Pantallas con Anuncios

### Alta Prioridad
1. **Home** → Banner inferior
2. **Calculadora BTU Free** → Banner + Interstitial al calcular
3. **Cotizador Free** → Interstitial al generar PDF
4. **Herramientas** → Banner inferior

### Media Prioridad
5. **Training** → Rewarded para duplicar tokens
6. **Biblioteca Errores** → Interstitial después de buscar
7. **Dashboard** → Banner inferior

### Sin Anuncios (Nunca)
- Scanner QR (flujo crítico)
- Formulario nuevo servicio
- Perfil y configuración
- Proceso de pago/checkout

---

## Interstitiales: Triggers

```
✅ Después de generar PDF de cotización
✅ Después de generar reporte de servicio  
✅ Después de cálculo BTU completado
✅ Después de búsqueda exitosa en biblioteca
❌ NUNCA durante formularios o procesos
```

**Cooldown**: 3 minutos entre interstitiales

---

## Rewarded: Uso

| Acción | Recompensa |
|--------|------------|
| Ver video en Training | 2x tokens de la lección |
| Desbloquear BTU Pro temporal | 24h acceso PRO |
| Quitar marca de agua PDF | 1 PDF sin watermark |

---

## Lógica PRO

```typescript
// Usuarios PRO = Sin anuncios
if (isUserPro(profile)) {
    return null; // No mostrar ad
}
```

Los usuarios con suscripción `Pro` o `Pro+` **nunca** ven anuncios.

---

## Activación (V2)

1. Obtener IDs de AdMob production
2. Actualizar `config/ads-config.ts`:
   ```typescript
   ENABLED: true,
   ANDROID: { BANNER: 'ca-app-pub-XXX/YYY', ... }
   ```
3. Instalar dependencia:
   ```bash
   npx expo install react-native-google-mobile-ads
   ```
4. Rebuild con EAS
