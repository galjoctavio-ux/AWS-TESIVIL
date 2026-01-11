# DECISIONES ESTRATÉGICAS CAME
## Cuentatron MVP | 2026-01-05

---

## 1. Decisiones Estratégicas Derivadas del CAME

### CORREGIR (Debilidades que deben eliminarse)

| # | Decisión | Responde a | Acción Concreta |
|---|----------|------------|-----------------|
| C-01 | **Seleccionar Opción A (React Native + Supabase)** | R-04 (rol orquestador sin programación directa), R-14 (Dart menor soporte IA), R-13 (Kotlin muy complejo) | Descartar Opciones B y C. Iniciar desarrollo con React Native + Expo + Supabase |
| C-02 | **Establecer monitoreo de límites de free tier** | R-03 (dependencia de tiers gratuitos) | Configurar alertas en Supabase al 70% del límite (350MB de 500MB) |
| C-03 | **Crear cronograma con hitos parciales** | R-15 (timeline sin desglose) | Definir 4 hitos: Setup (S1-2), App básica (S3-4), Panel Admin (S5-6), QA (S7-8) |
| C-04 | **Documentar procedimiento de respaldo de VM** | R-11 (único punto de infraestructura) | Crear script de backup semanal de VM AWS + exportación de InfluxDB |
| C-05 | **Definir mecanismo de diagnóstico fallback** | R-17 (expectativa 7 días fija), R-19 (EWMA único método) | Si a día 5 no hay anomalías claras, notificar al ingeniero para revisión manual anticipada |

---

### AFRONTAR (Amenazas que deben aceptarse con plan de contingencia)

| # | Decisión | Responde a | Plan de Contingencia |
|---|----------|------------|---------------------|
| A-01 | **Aceptar presupuesto $0 sin margen** | R-01 (presupuesto $0) | Si se exceden límites: migrar datos a PostgreSQL en VM AWS (ya disponible) |
| A-02 | **Aceptar limitación de RAM local** | R-02 (8GB RAM) | Ejecutar emulador Android en VM AWS si local es lento; priorizar pruebas en dispositivo físico |
| A-03 | **Aceptar timeline flexible** | R-05 (sin fecha límite) | Revisar progreso cada 2 semanas; ajustar alcance si hay drift significativo |
| A-04 | **Aceptar momento reactivo del dolor** | R-07 (cliente llega cuando ya tiene problema) | No es corregible; es la naturaleza del mercado. Estrategia de marketing post-recibo CFE |
| A-05 | **Aceptar dependencia de canal de referidos** | R-08 (canal único prioritario) | Preparar materiales para segmentos 2 y 3 desde el inicio; no depender 100% de seg. 1 |
| A-06 | **Aceptar intervención manual en PDF** | R-18 (ingeniero revisa y genera) | Es parte del valor agregado del servicio de 7 días; no automatizar en MVP |
| A-07 | **Aceptar frecuencia de 30 minutos** | R-20 (puede perder picos cortos) | Documentar limitación al cliente; para diagnósticos críticos, reducir ventana temporalmente |
| A-08 | **Aceptar necesidad de cliente piloto** | R-16 (requiere 1 cliente para validar) | Usar dispositivo en domicilio propio o de conocido para validación interna |

---

### MANTENER (Fortalezas que deben preservarse)

| # | Decisión | Responde a | Cómo Mantener |
|---|----------|------------|---------------|
| M-01 | **Mantener código legacy Python funcional** | O-04 (scripts funcionando) | No reescribir receptor_mqtt.py; crear API puente ligera entre scripts e interfaz |
| M-02 | **Mantener infraestructura AWS existente** | O-05 (VM sin costo), O-07 (sin bloqueos) | Usar VM actual; no migrar a servicios nuevos innecesariamente |
| M-03 | **Mantener arquitectura simple** | O-08 (escala <100 dispositivos) | Resistir tentación de sobre-ingeniería; rechazar features que agreguen complejidad innecesaria |
| M-04 | **Mantener una sola app** | O-09 (misma app ambos modelos) | No crear apps separadas para servicio 7 días vs suscripción |
| M-05 | **Mantener flujo de servicio documentado** | O-15 (ciclo 7 días claro) | Usar flujo documentado como guía de implementación; no improvisar |
| M-06 | **Mantener control centralizado MQTT** | O-19 (punto único de control) | No distribuir lógica de acceso; receptor_mqtt.py sigue siendo el gatekeeper |
| M-07 | **Mantener rol simplificado del técnico** | O-18 (sin interfaz especial) | El técnico solo ayuda al cliente; no crear módulo de técnico en MVP |

---

### EXPLOTAR (Oportunidades que deben aprovecharse activamente)

| # | Decisión | Responde a | Cómo Explotar |
|---|----------|------------|---------------|
| E-01 | **Explotar ausencia de competencia** | O-01 (ninguna app en México) | Posicionar como "única solución" en comunicación; no apresurar por competidores fantasma |
| E-02 | **Explotar conocimiento de dominio** | O-02 (experiencia avanzada) | Validar todas las reglas de negocio internamente antes de desarrollar; reducir iteraciones |
| E-03 | **Explotar canal de referidos controlado** | O-03 (TESIVIL refiere) | Preparar material de capacitación para electricistas desde el inicio |
| E-04 | **Explotar modelo de upsell** | O-06 (conversión interna) | Diseñar UX que invite a la compra al final del servicio de 7 días (CTA claro en reporte) |
| E-05 | **Explotar OTA updates** | O-10 (actualizaciones sin Play Store) | Planificar releases frecuentes post-lanzamiento; no esperar a versiones "perfectas" |
| E-06 | **Explotar soporte de IA** | O-11 (excelente para JS/TS), O-16 (optimización con IA) | Usar Copilot/ChatGPT activamente durante desarrollo; documentar prompts efectivos |
| E-07 | **Explotar múltiples síntomas** | O-12 (5 puntos de entrada) | Crear variantes de copy de marketing para cada síntoma (robo, paneles, fugas, etc.) |
| E-08 | **Explotar escalabilidad futura iOS** | O-14 (React Native reutilizable) | Escribir código pensando en iOS desde el inicio; evitar dependencias Android-only |
| E-09 | **Explotar panel delegable** | O-17 (ingenieros pueden usar panel) | Diseñar UX del panel para usuarios no técnicos; incluir tooltips y guías |
| E-10 | **Explotar gap del proceso actual** | O-20 (10% sin solución) | Posicionar Cuentatron exactamente en ese 10%; mensaje: "donde el electricista no puede" |

---

## 2. Alcance de las Decisiones

### ✅ Qué AFECTAN estas decisiones

| Área del Plan Maestro | Decisiones que aplican |
|-----------------------|-----------------------|
| **Selección tecnológica (Sección 10)** | C-01 cierra la decisión: React Native + Supabase |
| **Timeline (Sección 8)** | C-03 define hitos; A-03 acepta flexibilidad |
| **Infraestructura** | A-01, A-02, M-02, C-04 definen uso de recursos |
| **Flujo de servicio 7 días** | M-05, M-06, A-06 mantienen diseño actual |
| **Panel Admin** | M-07, E-09 definen alcance y UX |
| **Estrategia de marketing** | E-01, E-07, E-10 orientan posicionamiento |
| **Modelo de negocio** | E-04 refuerza estrategia de upsell |

### ❌ Qué NO están decidiendo todavía

| Elemento | Razón |
|----------|-------|
| **Diseño de UI/UX específico** | Requiere wireframes; no es decisión CAME |
| **Schema de base de datos** | Decisión técnica detallada, post-arquitectura |
| **Precios finales del servicio** | Decisión comercial, no derivada de riesgos |
| **Estrategia de publicación en Play Store** | Operativa, no estratégica |
| **Cronograma detallado día a día** | C-03 define hitos, no microplanning |
| **Contenido específico del PDF** | Diseño, no estrategia |

---

## 3. Resumen Ejecutivo

| Tipo CAME | Cantidad | Enfoque |
|-----------|----------|---------|
| **Corregir** | 5 | Eliminar debilidades críticas que bloquean el MVP |
| **Afrontar** | 8 | Aceptar riesgos inherentes con planes de contingencia |
| **Mantener** | 7 | Preservar fortalezas existentes del proyecto |
| **Explotar** | 10 | Capitalizar oportunidades de mercado y técnicas |

**Decisión más crítica:** `C-01` — Selección de React Native + Supabase como stack tecnológico.

**Próximo paso sugerido:** Iniciar diseño de wireframes y schema de base de datos con la arquitectura ya definida.

---

*Documento generado: 2026-01-05*
*Fuente: 06_RIESGOS_Y_OPORTUNIDADES.md (20 riesgos, 20 oportunidades)*
*Validación del usuario: Arquitectura A confirmada, Timeline flexible confirmado*
