# Módulo 01: Auth & Onboarding

> **Fase:** 2 - AUTH Y VINCULACIÓN
> **Dependencias:** Ninguna (módulo inicial)
> **Estado:** ⬜ Pendiente

---

## 1. Propósito del Módulo

Implementar el sistema de autenticación de usuarios y el flujo de primer uso (onboarding) que incluye la captura de datos CFE necesarios para el funcionamiento del sistema.

---

## 2. Qué SÍ Hace

- ✅ Google Auth como método primario de autenticación
- ✅ Login tradicional (email + código de 6 dígitos) como alternativa
- ✅ Pantalla de Splash (2 segundos, sin interacción)
- ✅ Verificación de sesión activa
- ✅ Flujo de onboarding con captura de datos CFE
- ✅ Modales de ayuda visual con imágenes de recibo CFE
- ✅ Validación en tiempo real de campos

---

## 3. Qué NO Hace

- ❌ Autenticación por WhatsApp
- ❌ Registro por teléfono
- ❌ Solicitar nombre si el usuario usa Google Auth (se obtiene automáticamente)
- ❌ Campo de teléfono WhatsApp (UXUI-018)

---

## 4. Dependencias Previas

| Dependencia | Tipo | Estado |
|-------------|------|--------|
| Ninguna | — | — |

Este es el módulo inicial, no requiere otros módulos completados.

---

## 5. Entradas Esperadas

| Entrada | Origen | Descripción |
|---------|--------|-------------|
| Ninguna | — | Módulo de entrada del sistema |

---

## 6. Salidas Esperadas

| Salida | Destino | Descripción |
|--------|---------|-------------|
| Usuario autenticado | Supabase Auth | Usuario con sesión activa |
| Datos CFE capturados | Supabase DB | Tarifa, fecha corte, lecturas |
| Token de sesión | App | Para peticiones autenticadas |

---

## 7. Criterios de "Módulo Terminado"

- [ ] Usuario puede registrarse con Google Auth
- [ ] Usuario puede registrarse con email + código 6 dígitos
- [ ] Splash screen muestra por 2 segundos
- [ ] Si hay sesión activa, redirige a Dashboard
- [ ] Si no hay sesión, muestra pantalla de Auth
- [ ] Onboarding captura 4 campos CFE obligatorios:
  - [ ] Tipo de Tarifa (dropdown: 01, 01A, 01B, PDBT, DAC)
  - [ ] Última Fecha de Corte (DatePicker)
  - [ ] Lectura Actual del Medidor (NumberInput)
  - [ ] Consumo Último Recibo (NumberInput)
  - [ ] Lectura Cierre Periodo Anterior (NumberInput)
- [ ] Cada campo tiene modal de ayuda visual con imagen
- [ ] Sesión expira después de 7 días sin actividad (UXUI-063)

---

## 8. Restricciones Explícitas para IA

| Restricción | Referencia |
|-------------|------------|
| NO implementar campo teléfono WhatsApp | UXUI-018 |
| NO solicitar nombre si es Google Auth | UXUI-017 |
| NO implementar registro con contraseña tradicional | UXUI-017b usa código 6 dígitos |
| Expiración de sesión = 7 días exactos | UXUI-063 |
| Idioma = Español MX únicamente | UXUI-065 |

---

## Campos del Formulario de Onboarding

| Campo | Tipo | Obligatorio | Ayuda Visual | Validación |
|-------|------|-------------|--------------|------------|
| Tipo de Tarifa CFE | Select | ✅ | Modal con imagen | Opciones: 01, 01A, 01B, PDBT, DAC |
| Última Fecha de Corte | DatePicker | ✅ | Modal con imagen | Fecha válida |
| Lectura Actual del Medidor | NumberInput | ✅ | Modal con imagen medidor | Número positivo |
| Consumo Último Recibo | NumberInput | ✅ | Modal con imagen | Número positivo |
| Lectura Cierre Periodo Anterior | NumberInput | ✅ | Modal con imagen | Número positivo |

---

## Flujo de Autenticación

```
SPLASH (2s)
    │
    ▼
¿Sesión activa?
    │
┌───┴───┐
▼       ▼
SÍ      NO
│       │
▼       ▼
DASH    AUTH
        │
   ┌────┴────┐
   ▼         ▼
Google    Email
Auth      Login
   │         │
   └────┬────┘
        ▼
   ONBOARDING
   (Datos CFE)
        │
        ▼
   VINCULACIÓN
   (Módulo 06)
```

---

## Referencia

- **Plan Maestro:** Secciones 13.2.1, 14.4 (UXUI-014 a UXUI-028)
- **Imágenes de ayuda:** `../produccion/assets/imagenes_guia_cfe/`

---

*Última actualización: 2026-01-06*
