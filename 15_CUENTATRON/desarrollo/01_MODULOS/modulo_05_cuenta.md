# Módulo 05: Cuenta

> **Fase:** 3 - CORE APP
> **Dependencias:** modulo_01
> **Estado:** ⬜ Pendiente

---

## 1. Propósito del Módulo

Implementar la sección de gestión de perfil de usuario, suscripción, dispositivos vinculados y acceso a reportes (solo servicio 7 días).

---

## 2. Qué SÍ Hace

- ✅ Mostrar perfil de usuario (foto, nombre, email de Google)
- ✅ Configuración de notificaciones
- ✅ Ver estado de suscripción (plan actual, próximo cobro)
- ✅ Cancelar suscripción
- ✅ Listar dispositivos vinculados
- ✅ Desvincular dispositivo
- ✅ Acceso a "Mis Reportes" (solo servicio 7 días)
- ✅ Cerrar sesión

---

## 3. Qué NO Hace

- ❌ Cambiar plan de suscripción (ligado al dispositivo físico - AMB-04)
- ❌ Mostrar "Mis Reportes" a usuarios con suscripción permanente
- ❌ Editar foto de perfil (viene de Google Auth)

---

## 4. Dependencias Previas

| Dependencia | Tipo | Descripción |
|-------------|------|-------------|
| modulo_01 | Obligatoria | Usuario autenticado |

---

## 5. Entradas Esperadas

| Entrada | Origen | Descripción |
|---------|--------|-------------|
| Datos de usuario | Supabase Auth | Perfil de Google |
| Estado de suscripción | Supabase DB | Plan, estado, próximo cobro |
| Lista de dispositivos | Supabase DB | Dispositivos vinculados |
| Reportes PDF | Supabase Storage | PDFs de diagnóstico |

---

## 6. Salidas Esperadas

| Salida | Destino | Descripción |
|--------|---------|-------------|
| Cambios de perfil | Supabase | Config notificaciones |
| Cancelación | Stripe vía API | Cancelar suscripción |
| Desvinculación | Supabase DB | Quitar dispositivo |
| Logout | Sistema | Cerrar sesión |

---

## 7. Criterios de "Módulo Terminado"

- [ ] Perfil muestra foto, nombre y email de Google
- [ ] Configuración de notificaciones funciona
- [ ] Suscripción muestra: plan, precio, estado, próximo cobro
- [ ] Botón "Cancelar Suscripción" funciona con confirmación
- [ ] Lista de dispositivos muestra: nombre, plan, estado, última lectura
- [ ] Botón "Desvincular" funciona con confirmación
- [ ] "Mis Reportes" solo visible para servicio 7 días
- [ ] PDFs son descargables
- [ ] Cerrar sesión funciona correctamente

---

## 8. Restricciones Explícitas para IA

| Restricción | Referencia |
|-------------|------------|
| NO implementar "Cambiar plan" | AMB-04 (inconsistencia) |
| "Mis Reportes" solo para servicio 7 días | UXUI-054 |
| Config notificaciones = contenido no especificado | AMB-03 |

---

## Subsecciones de Cuenta

| Subsección | Contenido | Visible para |
|------------|-----------|--------------|
| **Perfil** | Foto, nombre, email, config notificaciones | Todos |
| **Mi Suscripción** | Estado, plan actual, opción de cancelar | Suscripción permanente |
| **Mis Dispositivos** | Lista, estado, desvincular | Todos |
| **Mis Reportes** | PDFs descargables | Solo servicio 7 días |
| **Cerrar Sesión** | Botón de logout | Todos |

---

## Estructura Visual

```
┌─────────────────────────────────────────────────────────────────────────┐
│                        📱 SECCIÓN CUENTA                                 │
├─────────────────────────────────────────────────────────────────────────┤
│                                                                          │
│  ┌─────────────────────────────────────────────────────────────────┐    │
│  │  📷 [Foto de Google]                                            │    │
│  │  Juan Pérez                                                      │    │
│  │  juan.perez@gmail.com                                           │    │
│  └─────────────────────────────────────────────────────────────────┘    │
│                                                                          │
│  ┌─────────────────────────────────────────────────────────────────┐    │
│  │ 🔔 Configuración de Notificaciones                          >  │    │
│  └─────────────────────────────────────────────────────────────────┘    │
│                                                                          │
│  ┌─────────────────────────────────────────────────────────────────┐    │
│  │ 💳 Mi Suscripción                                            >  │    │
│  │    Plan: Bifásico sin paneles | Estado: Activa                  │    │
│  └─────────────────────────────────────────────────────────────────┘    │
│                                                                          │
│  ┌─────────────────────────────────────────────────────────────────┐    │
│  │ 📡 Mis Dispositivos (2)                                      >  │    │
│  └─────────────────────────────────────────────────────────────────┘    │
│                                                                          │
│  ┌─────────────────────────────────────────────────────────────────┐    │
│  │ 📄 Mis Reportes (Solo servicio 7 días)                       >  │    │
│  └─────────────────────────────────────────────────────────────────┘    │
│                                                                          │
│  ┌─────────────────────────────────────────────────────────────────┐    │
│  │ 🚪 Cerrar Sesión                                                │    │
│  └─────────────────────────────────────────────────────────────────┘    │
└─────────────────────────────────────────────────────────────────────────┘
```

---

## Referencia

- **Plan Maestro:** Sección 14.8 (UXUI-051 a UXUI-054)

---

*Última actualización: 2026-01-06*
