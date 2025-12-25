# Reporte de Verificación: Agenda Inteligente v1.0.0

Este documento analiza la viabilidad, redundancia y lógica del `DESIGN_DOC_AGENDA_v1.0.0.md` frente a la base de código actual (`app/(app)/services/new.tsx`, `database-service.ts`, `services-service.ts`, etc.).

## 1. Viabilidad Técnica (Viability)

### 1.1 Cálculo de Distancia (Haversine)
- **Estado Actual**: No existe cálculo de rutas. La entidad `Client` tiene `address` pero no `lat`/`lng` explícitos en la interfaz, aunque el objeto `ClientData` es flexible.
- **Análisis v1.0.0**: 
    - La estrategia "Haversine First" ($0 cost) es **altamente viable**.
    - Requiere agregar campos `geo_lat` y `geo_lng` a `ClientData` (Firestore) y a la tabla local `clients` (SQLite) para que funcione offline.
    - Se debe implementar un pequeño servicio de geocodificación (Google Places) solo al *guardar* la dirección del cliente, para no consumir API en cada cálculo de ruta.

### 1.2 Flujo de Garantía (PRO)
- **Estado Actual**: 
    - En `app/(app)/services/[id].tsx` (Vista Detalle/PDF), existe una sección de garantía "post-creación". Se puede editar *después* de que el servicio existe.
    - En `app/(app)/services/new.tsx` (Creación), el flujo termina directamente con `SignatureModal` al dar click en "Terminar".
- **Análisis v1.0.0**: 
    - El requerimiento de "Validar Garantía **antes** de Firma" es **técnicamente sólido** y mejora la integridad legal.
    - **Cambio Requerido**: Interceptar `handleFinishService()` en `new.tsx`. En lugar de abrir `SignatureModal`, debe abrir primero un `WarrantyInput` (si es PRO y aplica garantía), y solo al confirmar este, pasar a la firma.
    - Esto elimina la ambigüedad legal de definir garantías después de firmado.

### 1.3 Búsqueda Global (FTS5)
- **Estado Actual**: `database-service.ts` ya maneja `expo-sqlite` y crea tablas locales.
- **Análisis v1.0.0**: 
    - SQLite FTS5 es la solución estándar para búsquedas rápidas offline.
    - **Viable**. Requiere sincronizar los clientes de Firebase a SQLite al inicio (`clients-service.ts` -> `database-service.ts`).

## 2. Redundancia (Redundancy Check)

### 2.1 Inputs de Garantía
- **Conflicto**: Actualmente `[id].tsx` permite seleccionar garantía para el PDF.
- **Resolución**: Si implementamos v1.0.0, la selección de garantía en `[id].tsx` se vuelve redundante o debe ser de "solo lectura" (mostrar la garantía que se firmó).
- **Acción**: Refactorizar `[id].tsx` para que lea `service.warranty` en lugar de permitir editarlo, a menos que sea un "Admin Override".

### 2.2 Gestión de Equipo
- **Conflicto**: `ServiceData` tiene un objeto `equipment` embebido. `EquipmentData` existe como entidad separada.
- **Resolución**: El diseño v1.0.0 refuerza el uso de Equipos registrados. `new.tsx` ya tiene lógica para "Equipo Pre-cargado" o "Registro Inline". Esto está alineado.
- **Nota**: Asegurar que `service.equipmentId` se guarde siempre para vincular historial.

## 3. Lógica y Consistencia (Logic)

### 3.1 "Ubicación Base"
- **Brecha**: El cálculo de rutas asume una "Ubicación Base" del técnico.
- **Hallazgo**: `UserProfile` (`user-service.ts`) no parece tener este campo explícito actualmente.
- **Acción**: Es lógico y necesario agregar `base_lat`/`base_lng` al perfil del usuario.

### 3.2 Offline First
- La arquitectura híbrida (Firebase para la nube, SQLite para caché local) propuesta en v1.0.0 es la correcta para una app "Offline First".
- **Riesgo**: La sincronización bidireccional (si se edita offline) es compleja. v1.0.0 se enfoca en "Lectura Offline" y "Creación Offline con Sync posterior", lo cual simplifica el problema y es lógico.

## Conclusión

El `DESIGN_DOC_AGENDA_v1.0.0.md` es **100% Viable y Lógico**. 

**Próximos Pasos Recomendados**:
1.  Modificar `new.tsx` para inyectar el paso de Garantía antes de la Firma.
2.  Implementar `haversine-calculator.ts`.
3.  Desactivar la edición de garantía en `[id].tsx` para servicios nuevos firmados bajo el nuevo esquema.
