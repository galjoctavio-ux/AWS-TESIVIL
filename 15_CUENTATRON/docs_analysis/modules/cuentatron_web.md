# cuentatron_web (Landing Page Next.js)

## Propósito
Página de aterrizaje (landing page) para venta del dispositivo Cuentatrón. Construida con Next.js y TypeScript. Diseño orientado a conversión con secciones de problema, solución, beneficios, y pricing.

## Core Logic

### Estructura de Componentes
```
app/
├── page.tsx              # Landing principal
├── layout.tsx            # Layout con metadata
├── garantia/             # Página de garantía
├── terminos-venta/       # Términos de venta
├── privacidad-ecommerce/ # Política de privacidad
└── compra/cancelada/     # Página de cancelación

components/
├── HeroSection.tsx       # Banner principal con CTA
├── ProblemSection.tsx    # Identifica el dolor del cliente
├── SolutionSection.tsx   # Presenta Cuentatrón
├── BenefitsSection.tsx   # Lista de beneficios
├── HowItWorksSection.tsx # Pasos de funcionamiento
├── PricingSection.tsx    # Tabla de precios (8KB - más complejo)
├── FAQSection.tsx        # Preguntas frecuentes
├── TargetAudienceSection.tsx # Público objetivo
├── TrustSection.tsx      # Elementos de confianza
├── Header.tsx / Footer.tsx
```

### Páginas Legales
- Garantía del producto
- Términos de venta
- Política de privacidad (ecommerce)

## Dependencias/Inputs
| Tipo | Recurso |
|------|---------|
| Framework | Next.js 14+ (TypeScript) |
| Styling | Tailwind CSS (probablemente) |
| Build | npm/node |

## Estado
**✅ FUNCIONAL - Landing de ventas**

Página lista para producción. Componentes bien separados. El `PricingSection.tsx` (8KB) contiene lógica de precios que podría reusarse.
