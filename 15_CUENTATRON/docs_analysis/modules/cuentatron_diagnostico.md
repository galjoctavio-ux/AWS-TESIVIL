# cuentatron-diagnostico (App Next.js - Portal de Diagnóstico)

## Propósito
Aplicación web para solicitar diagnósticos eléctricos y agendar citas con técnicos de "Luz en tu Espacio". Incluye formulario de diagnóstico, inventario eléctrico, y checkout de suscripción.

## Core Logic

### Estructura Principal
```
src/
├── app/
│   ├── page.js                    # Página principal
│   ├── layout.js                  # Layout base
│   └── gracias-por-tu-compra/     # Página post-checkout
├── components/
│   ├── FormularioDiagnostico.js   # Formulario de captura
│   ├── ItemInventario.js          # Componente de electrodoméstico
│   └── FaqItem.js                 # Sección FAQ
└── emails/
    └── ConfirmacionCita.js        # Template de email
```

### Funcionalidades
- Formulario de diagnóstico eléctrico
- Captura de inventario de electrodomésticos
- Confirmación de cita por email
- Integración con Stripe (checkout)

## Dependencias/Inputs
| Tipo | Recurso |
|------|---------|
| Framework | Next.js (JavaScript) |
| Email | React Email (templates) |
| Pagos | Stripe |

## Estado
**✅ FUNCIONAL - Portal de servicio local**

Aplicación para el modelo de servicio profesional (7 días de diagnóstico). Componentes reutilizables para MVP.
