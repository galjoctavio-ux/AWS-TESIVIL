# 📋 Decisiones Estratégicas Derivadas del CAME

---

## Control de Cambios

| Versión | Fecha       | Descripción                                    |
|---------|-------------|------------------------------------------------|
| 1.0     | 2026-01-03  | Creación inicial con decisiones cerradas       |

---

## Proyecto: MVP de Software
**Fuente única**: Documento "Riesgos y Oportunidades"

---

## 1. Decisiones Estratégicas (Cerradas)

### Decisión 1: Stack tecnológico base del MVP: Firebase + Expo

**Qué se decidió:**
El MVP se construirá sobre Firebase como backend principal, usando Expo (React Native) para frontend móvil.

**Responde a:**
- O21 (sincronización offline nativa de Firebase)
- R09 (riesgos de sincronización offline en Supabase)
- R20 (indefinición tecnológica)

**Tipo CAME:** Explotar (O21) / Corregir (R20)

---

### Decisión 2: Uso de Firebase hospedado (no self-host) en Fase 1

**Qué se decidió:**
El MVP se desplegará usando Firebase hospedado, aun existiendo VM AWS disponible.
La VM se reserva para Fase 2 o escenarios de escalamiento.

**Responde a:**
- R25 (carga DevOps del self-host)
- R03 (limitaciones de tiers gratuitos)
- O02 (VM disponible, pero no prioritaria)

**Tipo CAME:** Afrontar (R25) / Mantener (O02)

---

### Decisión 3: Aceptar vendor lock-in de Firebase como trade-off consciente

**Qué se decidió:**
Se acepta explícitamente el riesgo de lock-in de Firebase como intercambio por velocidad, offline y menor complejidad operativa en MVP.

**Responde a:**
- R10 (dependencia de proveedor)
- O21 (beneficio operativo inmediato)

**Tipo CAME:** Afrontar (R10)

---

### Decisión 4: OCR incluido dentro del alcance del MVP (decisión consciente)

**Qué se decidió:**
OCR automático se incluye en el MVP, aun reconociendo que incrementa complejidad técnica y riesgo.

**Responde a:**
- R18 (riesgo por excluir OCR)
- O12 / O05 (valor percibido alto y diferenciación)

**Tipo CAME:** Afrontar (R18) / Explotar (O05)

---

### Decisión 5: OCR con alcance controlado (no "OCR perfecto")

**Qué se decidió:**
El OCR del MVP tendrá un alcance mínimo viable:
- Apoyo a la captura (prellenado / sugerencias)
- No se exige precisión total ni automatización completa

**Responde a:**
- R08 (complejidad excesiva)
- R12 (riesgo de no adopción si falla)

**Tipo CAME:** Corregir (R08) / Afrontar (R12)

---

### Decisión 6: Prioridad absoluta: Captura Simplificada + Offline First

**Qué se decidió:**
Toda decisión de producto y UX del MVP prioriza:
Capturar tickets rápido, aun sin conexión, con o sin OCR.

**Responde a:**
- O08 (dolor real del usuario)
- O21 (offline Firebase)
- R06 (pérdida de tickets)

**Tipo CAME:** Explotar (O08/O21) / Corregir (R06)

---

### Decisión 7: Recordatorios incluidos, pero en versión reducida

**Qué se decidió:**
El MVP incluirá recordatorios funcionales básicos (no los 4 niveles completos).
Los niveles avanzados quedan para Fase 2.

**Responde a:**
- O12 (recordatorios como diferenciador)
- R08 (sobrecarga de complejidad)

**Tipo CAME:** Explotar (O12) / Afrontar (R08)

---

### Decisión 8: Modelo de usuario único confirmado para MVP

**Qué se decidió:**
El MVP operará bajo usuario único, sin roles ni multiusuario.

**Responde a:**
- O20 (simplicidad operativa)
- R16 (complejidad por múltiples actores)

**Tipo CAME:** Mantener (O20) / Afrontar (R16)

---

### Decisión 9: Wireframes obligatorios antes de desarrollo

**Qué se decidió:**
No se inicia desarrollo sin wireframes low-fi aprobados de los flujos críticos (captura, OCR, recordatorios).

**Responde a:**
- R21 (retrabajo por indefinición UX)

**Tipo CAME:** Corregir (R21)

---

### Decisión 10: Métricas del MVP como criterio de continuidad

**Qué se decidió:**
El éxito del MVP se evaluará con métricas claras:
- % tickets capturados
- % tickets con factura
- Uso real de OCR

Estas métricas definen si se avanza a Fase 2.

**Responde a:**
- O06 / O23 (métricas objetivas)

**Tipo CAME:** Explotar (O06/O23)

---

### Decisión 11: Plan mínimo de respaldo y pruebas de sincronización

**Qué se decidió:**
Antes del go-live se ejecuta una prueba obligatoria de:
- Sincronización offline
- Respaldo de datos

**Responde a:**
- R14 (pérdida de datos)
- R09 (sincronización)

**Tipo CAME:** Corregir (R14/R09)

---

### Decisión 12: Restricciones de hardware y presupuesto asumidas

**Qué se decidió:**
Se acepta operar el MVP bajo:
- Hardware local limitado
- Presupuesto $0

Compensando con servicios gestionados (Firebase).

**Responde a:**
- R01 (hardware)
- R02 (presupuesto)

**Tipo CAME:** Afrontar (R01/R02)

---

## 2. Alcance de estas Decisiones

### Qué SÍ están decidiendo

- Stack tecnológico del MVP
- Inclusión y alcance del OCR
- Modelo de usuario
- Prioridades funcionales reales
- Qué riesgos se aceptan conscientemente
- Qué queda para Fase 2

### Qué NO están decidiendo todavía

- Implementación técnica detallada
- Selección de proveedor OCR específico
- Costos futuros post-MVP
- Diseño visual final
- Plan de monetización

---

## Cierre Ejecutivo

> [!IMPORTANT]
> **Este CAME queda CERRADO.**
> No hay decisiones estratégicas abiertas.

El MVP queda definido como:

**Firebase + Expo, offline-first, con OCR incluido pero controlado, enfocado en captura rápida y recordatorios básicos, sin carga DevOps en Fase 1.**

---

*Documento generado: 2026-01-03*
*Estado: CERRADO - Sin decisiones pendientes*
