# Control de Cambios
| Fecha | Versión Contexto | Autor | Descripción |
|---|---|---|---|
| 2025-12-24 | v1.1 | Antigravity | Creación inicial del Master Plan con alcance y tecnología sugerida. |
| 2025-12-24 | v1.2 | Antigravity | Actualización de alcances: UI visual, State Machine, Licensing y modelo de negocio. |
| 2025-12-24 | v1.3 | Antigravity | Definición de los 8 Nodos Críticos y el flujo Entrada-Proceso-Salida. |
| 2025-12-24 | v1.4 | Antigravity | Reestructuración basada en Fases (Ideación-Mejora) y rol de Orquestador. |
| 2025-12-24 | v1.5 | Antigravity | Integración de Flujo Pedagógico y Exclusiones de Alcance. |
| 2026-01-01 | v1.6 | Implementación de Flujo MD como fuente de verdad y Prompt 0. |
| 2026-01-01 | v1.7 | Definición de Roles Duales y Gates de Prompt 0/1. |
| 2026-01-01 | v1.8 | Inclusión de Fase Estratégica (Prompt 2) y Análisis de Bloques. |

# 02. Master Plan

## Vision del Proyecto
Software orquestador que garantiza que *antes* de ejecutar, se haya pensado profundamente. Implementa un pipeline donde cada fase (Ideación -> Planeación -> Análisis Estratégico -> Ejecución) requiere aprobación humana explícita y se apoya en prompts especializados de largo contexto.

## Alcance del MVP: "El Estratega Profundo"

### Objetivos Clave
1.  **Profundidad Analítica**: Integrar el PROMPT 2 que fuerza a la IA a leer todo el contexto y generar un FODA/CAME detallado (por bloques).
2.  **Soberanía Humana**: El usuario tiene el botón de "Siguiente Fase". Nada avanza sin su clic.
3.  **Integridad Secuencial**: Ideación (P0) -> Planeación (P1) -> Estrategia (P2) -> Ejecución.

## Tecnología Sugerida (v1.8)
*   **Orquestador**: Windows Desktop (WPF).
*   **Pipeline de Prompts**:
    *   **Prompt 0 (Ideación)**: Definición del "Qué". Output: `01_IDEAS.md`.
    *   **Prompt 1 (Planeación)**: Definición del "Cómo". Output: `02_MASTER_PLAN.md`.
    *   **Prompt 2 (Estrategia)**: Análisis de Viabilidad/Riesgo (FODA+CAME). Output: `03_ANALISIS_ESTRATEGICO.md`. [NUEVO]
*   **Validación**: Integración opcional de APIs de terceros (o copy-paste manual) para Second Opinion.

## Fases de Ejecución del Flujo (Pipeline v1.8)

### Fase A: Ideación (Prompt 0)
*   *Salida*: Concepto depurado.

### Fase B: Planeación (Prompt 1)
*   *Salida*: Plan Maestro (Architecture & Roadmap).

### Fase C: Análisis Estratégico (Prompt 2)
*   *Input*: Lee `01_IDEAS` + `02_MASTER_PLAN`.
*   *Actividad*: AntiGravity analiza en bloques de 100 líneas. Genera Matriz FODA y Estrategia CAME.
*   *Gate*: El usuario revisa el análisis. Si detecta riesgos fatales, se regresa a Fase A o B.
*   *Salida*: `03_ANALISIS_ESTRATEGICO.md`.

### Fase D: Ejecución
*   *Input*: Plan Maestro + Estrategia de Riesgos Mitigada.
*   *Actividad*: Codificación / Producción.

## Próximos Pasos
*   Redactar el "Prompt 2" maestro que instruya el análisis por bloques.
*   Diseñar la UI para visualizar el FODA/CAME de forma atractiva.
