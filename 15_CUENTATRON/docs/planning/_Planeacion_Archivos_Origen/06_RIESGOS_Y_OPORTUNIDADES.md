# ANÁLISIS DE RIESGOS Y OPORTUNIDADES
## ISO 9001:2015 – Punto 6.1 | Cuentatron MVP

---

## 1. Referencia al Plan Maestro

| Elemento | Descripción |
|----------|-------------|
| **Documento analizado** | `05_PLAN_MAESTRO_CONSOLIDADO.md` |
| **Versión del documento** | 2.2 (2026-01-05) |
| **Fecha del análisis** | 2026-01-05 |
| **Enfoque normativo** | ISO 9001:2015 – Punto 6.1 |

### Alcance del Análisis

**Cubre:**
- Contexto técnico del usuario
- Definición del problema y dolor
- Segmentos de usuario priorizados
- Modelo de negocio dual
- Actores y responsabilidades
- Flujos críticos del servicio
- Arquitectura de la aplicación
- Límites del MVP
- Dependencias y restricciones
- Definición de "Hecho"
- Opciones de arquitectura tecnológica preliminar
- Próximos pasos planificados

**No cubre:**
- Código fuente existente de módulos legacy
- Documentos auxiliares referenciados (01_IDEAS_CONSOLIDADO.md, 02_MASTER_PLAN.md, etc.)
- Aspectos operativos post-lanzamiento no documentados
- Factores externos no mencionados en el documento

---

## 2. Lista de Riesgos Identificados

### R-01: Presupuesto de $0 MXN sin margen de contingencia

- **Descripción del riesgo:** El Plan Maestro establece un presupuesto de $0 MXN para el MVP. No existe margen para costos imprevistos, servicios de emergencia o excesos de límites en tiers gratuitos.
- **Origen:** Sección "Recursos Técnicos Disponibles" – Presupuesto disponible: $0 MXN.

---

### R-02: Limitación de RAM en hardware local

- **Descripción del riesgo:** La PC local con 8 GB de RAM podría ser insuficiente para ejecutar emuladores Android, procesos de compilación intensivos, o múltiples herramientas de desarrollo simultáneamente.
- **Origen:** Sección "Recursos Técnicos Disponibles" – Infraestructura local: PC Windows 8 GB de RAM.

---

### R-03: Dependencia de tiers gratuitos de servicios externos

- **Descripción del riesgo:** Las opciones de arquitectura A (Supabase) y B (Firebase) dependen de tiers gratuitos con límites específicos (500MB Supabase, 1GB Firestore). El exceder estos límites generaría costos no contemplados en el presupuesto.
- **Origen:** Sección 10.2 "Opciones de Arquitectura Base" – Costos indicados como "Gratuito hasta X" y Sección 10.3 "Tabla Comparativa" – Costo potencial: "Risk de exceder free tier".

---

### R-04: Rol de orquestador sin experiencia directa en programación

- **Descripción del riesgo:** El usuario actúa como orquestador de IA, no programa directamente. Esto podría generar dificultades en la resolución de problemas técnicos complejos, debugging avanzado, o situaciones donde las herramientas de IA no puedan proporcionar soluciones adecuadas.
- **Origen:** Sección "Perfil del Desarrollador" – Rol en el desarrollo: ORQUESTADOR DE IA; Sección "Limitaciones Técnicas Identificadas" – Sin experiencia directa en programación.

---

### R-05: Ausencia de fecha límite dura definida

- **Descripción del riesgo:** El Plan Maestro indica que no existe una fecha límite dura para el MVP. Esto podría resultar en extensión indefinida del desarrollo, pérdida de enfoque, o drift del alcance.
- **Origen:** Sección "Timeline" – Fecha límite dura: No definida.

---

### R-06: Integración con código legacy en Python

- **Descripción del riesgo:** Los scripts existentes (receptor_mqtt.py) están en Python. Las opciones de arquitectura A y B requieren crear una API puente adicional para integrar este código, añadiendo complejidad al sistema.
- **Origen:** Sección "Limitaciones Técnicas Identificadas" – Código legacy en Python: La integración con scripts existentes podría requerir API intermedia; Sección 10.3 "Tabla Comparativa" – Integración con legacy: Requiere API puente.

---

### R-07: Momento reactivo del dolor del usuario

- **Descripción del riesgo:** El usuario objetivo experimenta el problema cuando ya recibió el recibo alto (momento reactivo). Esto implica un ciclo de adquisición de clientes dependiente de eventos externos negativos, lo cual podría limitar la predictibilidad de la demanda.
- **Origen:** Sección "El Problema Central" – Momento del dolor: REACTIVO — Cuando ya llegó el recibo alto (demasiado tarde).

---

### R-08: Dependencia de un solo canal de adquisición prioritario

- **Descripción del riesgo:** El segmento de mayor volumen esperado (prioridad 1) depende exclusivamente de referidos por electricistas de TESIVIL/Luz en tu Espacio. Si este canal no genera el volumen proyectado, los otros segmentos tienen menor expectativa de volumen.
- **Origen:** Sección "Segmentos de Usuario" – Prioridad 1: Referido por electricista con modelo de servicio temporal y volumen esperado ALTO (nosotros lo referimos).

---

### R-09: Ausencia de rol técnico dedicado para soporte

- **Descripción del riesgo:** El documento no menciona disponibilidad de soporte técnico externo. El usuario opera como orquestador único, lo que podría generar cuellos de botella ante problemas técnicos críticos.
- **Origen:** Sección 10.4 "Información Adicional Requerida para Decisión Final" – punto 3: Disponibilidad de soporte técnico externo si se requiere.

---

### R-10: Control de suscripción a nivel de receptor MQTT

- **Descripción del riesgo:** El mecanismo de control de acceso bloquea datos a nivel de receptor MQTT. Una falla en este componente crítico (receptor_mqtt.py) afectaría tanto a usuarios activos como inactivos, sin mecanismo de respaldo documentado.
- **Origen:** Sección "Arquitectura de Control de Acceso" – El control se hace a nivel de receptor MQTT. Si no hay suscripción activa, el flujo de datos hacia InfluxDB se bloquea/congela.

---

### R-11: Único punto de infraestructura de producción

- **Descripción del riesgo:** La VM AWS Ubuntu es la única infraestructura de producción disponible. No se menciona redundancia, backups automatizados, ni plan de recuperación ante desastres.
- **Origen:** Sección "Recursos Técnicos Disponibles" – Máquina virtual: AWS Ubuntu; Sección "Implicaciones de Escala para Arquitectura" – AWS VM actual es suficiente.

---

### R-12: Exclusión de iOS en MVP sin plan de migración documentado

- **Descripción del riesgo:** iOS está explícitamente excluido del MVP y pospuesto para V2. No se documenta una estrategia o consideraciones para esta futura expansión, lo que podría generar decisiones arquitectónicas actuales incompatibles.
- **Origen:** Sección "Alcance Confirmado" – iOS: ❌ Excluido de MVP, Pospuesto para V2; Sección "Qué NO es el MVP" – ❌ Soporte iOS.

---

### R-13: Complejidad técnica de Opción C (Kotlin + Python)

- **Descripción del riesgo:** La Opción C de arquitectura presenta nivel de complejidad "Muy Alto" (5/5) con múltiples riesgos de probabilidad "Alta". Seleccionar esta opción podría exceder las capacidades del rol de orquestador.
- **Origen:** Sección 10.2 "Opción C: Kotlin Nativo + Backend Python" – Nivel de Complejidad para el Usuario: ⚡⚡⚡⚡⚡ (5/5 - Muy Alto); Riesgos con probabilidad Alta: Kotlin requiere alto conocimiento de Android, Desarrollo más lento, Requiere Android Studio y configuración manual, Mayor carga de mantenimiento de infraestructura, Sin hot reload/fast refresh.

---

### R-14: Dart como lenguaje menos común en Opción B

- **Descripción del riesgo:** La Opción B (Flutter + Firebase) utiliza Dart, un lenguaje con menor soporte de herramientas de IA en comparación con JavaScript/TypeScript. Esto podría afectar la eficiencia del rol de orquestador de IA.
- **Origen:** Sección 10.2 "Opción B: Flutter + Firebase" – Riesgo: Dart es un lenguaje menos común (menor soporte IA), Probabilidad Media, Impacto Medio.

---

### R-15: Timeline base de 6-8 semanas sin desglose detallado

- **Descripción del riesgo:** El Plan Maestro indica un timeline base de 6-8 semanas pero no incluye un cronograma detallado con hitos específicos, entregables parciales, o puntos de control.
- **Origen:** Sección "Timeline" – Timeline base: 6-8 semanas.

---

### R-16: Dependencia de validación con al menos 1 cliente para éxito

- **Descripción del riesgo:** El criterio de éxito para "Servicio 7 días operativo" requiere "Al menos 1 cliente atendido". Sin un cliente disponible para validación, el criterio de éxito del MVP no podría cumplirse.
- **Origen:** Sección "Criterios de Éxito del MVP" – Servicio 7 días operativo: ✅ Al menos 1 cliente atendido.

---

### R-17: Expectativa de resultado en 7 días de monitoreo

- **Descripción del riesgo:** El usuario espera identificar la causa del consumo excesivo en exactamente 7 días de monitoreo. Si el problema requiere más tiempo para manifestarse, el diagnóstico podría ser incompleto.
- **Origen:** Sección "Resultado Esperado por el Usuario" – Identificar la causa del consumo excesivo: 7 días de monitoreo.

---

### R-18: Proceso de generación de PDF con intervención manual

- **Descripción del riesgo:** El flujo de generación del PDF requiere que un ingeniero revise datos, agregue observaciones y genere el documento manualmente. Esto crea una dependencia de disponibilidad humana que podría afectar tiempos de entrega.
- **Origen:** Sección "Flujo del Panel Admin (Generación de Reporte)" – Ingeniero revisa y agrega observaciones, Ingeniero presiona [Generar PDF].

---

### R-19: Algoritmo EWMA como único método de detección de anomalías

- **Descripción del riesgo:** La detección de anomalías se basa únicamente en EWMA (Exponential Weighted Moving Average). Este método podría no detectar todos los tipos de anomalías relevantes en el contexto de consumo eléctrico.
- **Origen:** Sección "Flujo del Panel Admin" – Detección de anomalías (EWMA) pre-calculadas; Sección "Glosario" – EWMA: Exponential Weighted Moving Average, algoritmo de detección de anomalías.

---

### R-20: Frecuencia de actualización de datos cada ~30 minutos

- **Descripción del riesgo:** La actualización de datos cada ~30 minutos podría no capturar eventos de consumo de corta duración o picos transitorios relevantes para el diagnóstico.
- **Origen:** Sección "Decisiones Clave Confirmadas" – Actualización de datos: Cada ~30 minutos (ventana configurable para optimizar recursos).

---

## 3. Lista de Oportunidades Identificadas

### O-01: Ausencia de competencia directa en el mercado mexicano

- **Descripción de la oportunidad:** El Plan Maestro indica que no existe ninguna app competidora directa en el mercado mexicano para el problema de consumo eléctrico que atiende Cuentatron.
- **Origen:** Sección "El Problema Central" – Competencia directa: NINGUNA app en el mercado mexicano.

---

### O-02: Experiencia avanzada del usuario en el dominio del problema

- **Descripción de la oportunidad:** El usuario posee conocimiento profundo del problema de consumo eléctrico, CFE, y el contexto mexicano. Esto facilita la validación de requisitos funcionales y reglas de negocio.
- **Origen:** Sección "Perfil del Desarrollador" – Experiencia en el dominio del problema: AVANZADO; Sección "Implicaciones para el Proyecto" – La experiencia avanzada en el dominio facilita la validación de requisitos funcionales y reglas de negocio.

---

### O-03: Canal de adquisición controlado internamente

- **Descripción de la oportunidad:** El segmento prioritario (referidos por electricista) es manejado directamente por TESIVIL/Luz en tu Espacio, lo que permite control sobre la calidad y volumen de leads sin depender de terceros.
- **Origen:** Sección "Segmentos de Usuario" – Prioridad 1: Referido por electricista, Origen: Cliente de Luz en tu Espacio, Volumen Esperado: ALTO (nosotros lo referimos).

---

### O-04: Código y scripts funcionales existentes

- **Descripción de la oportunidad:** El proyecto cuenta con código avanzado y scripts funcionando (receptor_mqtt.py, InfluxDB, Mosquitto MQTT). Esto reduce el desarrollo desde cero para componentes críticos del backend.
- **Origen:** Sección "Alcance Confirmado" – Justificación: Ya hay código avanzado, scripts funcionando; Sección "Supuestos Considerados" – Componentes existentes: InfluxDB, Mosquitto MQTT, Scripts Python.

---

### O-05: Infraestructura de producción disponible sin costo adicional

- **Descripción de la oportunidad:** La VM AWS Ubuntu existente puede servir como entorno de producción sin incurrir en costos adicionales, cumpliendo con el requerimiento de presupuesto $0.
- **Origen:** Sección "Implicaciones de Escala para Arquitectura" – AWS VM actual es suficiente, Sin costo adicional; Sección "Recursos Técnicos Disponibles" – Máquina virtual: SÍ, AWS Ubuntu.

---

### O-06: Modelo de negocio dual con conversión interna

- **Descripción de la oportunidad:** El modelo de negocio permite conversión de clientes del servicio de 7 días hacia compra + suscripción (upsell interno), maximizando el valor por cliente adquirido.
- **Origen:** Sección "Modelo de Negocio Dual" – ¿Le gustó el servicio? [SÍ → Upsell]; Sección "Características del Segmento Primario" – UPSELL: Si le gustó el servicio → Compra dispositivo + suscripción.

---

### O-07: Sin bloqueos externos para iniciar desarrollo

- **Descripción de la oportunidad:** El usuario controla todos los recursos necesarios para el desarrollo. No existen dependencias externas bloqueantes.
- **Origen:** Sección "Dependencias Externas" – Todas las dependencias marcadas como "Sin bloqueo", Responsable: Usuario (interno); Nota: Sin bloqueos externos. El usuario controla todos los recursos necesarios.

---

### O-08: Escala limitada simplifica arquitectura

- **Descripción de la oportunidad:** La proyección de menos de 100 dispositivos en el primer año y nunca miles de dispositivos permite evitar sobre-ingeniería y utilizar soluciones simples (sin autoescalado, sharding, o optimización agresiva).
- **Origen:** Sección "Proyección de Escala" – Año 1: ~5 dispositivos, Nunca se esperan MILES de dispositivos; Sección "Implicaciones de Escala para Arquitectura" – No necesita autoescalado, No necesita sharding, Complejidad: Baja, Evitar sobre-ingeniería.

---

### O-09: Una sola app para ambos modelos de negocio

- **Descripción de la oportunidad:** La decisión de utilizar una única aplicación para el servicio de 7 días y la suscripción permanente reduce el esfuerzo de desarrollo y mantenimiento al no requerir múltiples aplicaciones.
- **Origen:** Sección "Decisiones Clave Confirmadas" – Una sola app: Misma app para servicio 7 días y suscripción permanente.

---

### O-10: OTA updates disponibles en Opción A

- **Descripción de la oportunidad:** La arquitectura basada en React Native + Expo (Opción A) permite actualizaciones Over-the-Air sin pasar por Play Store, acelerando la corrección de bugs y despliegue de mejoras.
- **Origen:** Sección 10.2 "Opción A: React Native + Supabase" – Ventajas: OTA updates permiten actualizar sin pasar por Play Store.

---

### O-11: Excelente soporte de herramientas de IA en Opción A

- **Descripción de la oportunidad:** React Native con JavaScript/TypeScript cuenta con soporte excelente de herramientas de IA (Copilot, ChatGPT), alineándose con el rol de orquestador del usuario.
- **Origen:** Sección 10.2 "Opción A" – Excelente documentación y amplio soporte de herramientas de IA (Copilot, ChatGPT); Sección 10.3 "Tabla Comparativa" – Soporte herramientas IA: Excelente para Opción A.

---

### O-12: Múltiples síntomas percibidos como puntos de entrada

- **Descripción de la oportunidad:** Los usuarios potenciales presentan múltiples síntomas (sospecha de robo, fugas, electrodomésticos defectuosos, paneles solares) que pueden servir como diferentes puntos de entrada de marketing y captación.
- **Origen:** Sección "Síntomas Percibidos por el Usuario" – 5 síntomas documentados: robo de luz, fugas eléctricas, electrodomésticos defectuosos, paneles solares que no rinden, técnicos instaladores desaparecidos.

---

### O-13: Segmento de usuarios con paneles solares

- **Descripción de la oportunidad:** Existe un segmento específico de usuarios con paneles solares que necesitan validar rendimiento y detectar degradación, especialmente aquellos cuyos técnicos instaladores desaparecieron.
- **Origen:** Sección "Segmentos de Usuario" – Prioridad 3: Usuario con paneles solares, Descripción: Validar si generan bien, detectar degradación, técnicos desaparecieron.

---

### O-14: Escalabilidad futura a iOS con Opciones A y B

- **Descripción de la oportunidad:** Las opciones de arquitectura A (React Native) y B (Flutter) permiten reutilizar el mismo código base para una futura expansión a iOS en V2.
- **Origen:** Sección 10.3 "Tabla Comparativa" – Escalabilidad futura a iOS: Sí (mismo código) para Opciones A y B.

---

### O-15: Flujo de servicio estructurado y documentado

- **Descripción de la oportunidad:** El ciclo de vida del servicio de 7 días está claramente documentado con pasos definidos, facilitando la implementación y capacitación de técnicos instaladores.
- **Origen:** Sección "Ciclo de Vida del Servicio de 7 Días" – Flujo documentado desde instalación hasta congelado de MQTT.

---

### O-16: Optimización esperada con asistencia de IA

- **Descripción de la oportunidad:** El Plan Maestro contempla que la asistencia de IA puede reducir significativamente el timeline base de desarrollo.
- **Origen:** Sección "Timeline" – Optimización con IA: Se espera reducción significativa.

---

### O-17: Panel Admin delegable a otros usuarios

- **Descripción de la oportunidad:** El panel de administración está diseñado para ser amigable y delegable a otros usuarios (ingenieros), distribuyendo la carga operativa del análisis y generación de reportes.
- **Origen:** Sección "Alcance Confirmado" – Panel Admin: Interfaz funcional completa, Justificación: Se delegará a otros usuarios, debe ser amigable.

---

### O-18: Rol del técnico instalador simplificado

- **Descripción de la oportunidad:** El técnico instalador no requiere interfaz especial ni acceso al sistema; solo asiste al cliente a registrarse en la app y escanear QR. Esto simplifica el flujo y reduce requerimientos de desarrollo.
- **Origen:** Sección "Aclaración sobre el Técnico Instalador" – Rol separado: NO necesario, Interfaz especial: NO necesaria, Función real: Ayuda al cliente a darse de alta en la app y escanear QR, Acceso al sistema: Ninguno especial.

---

### O-19: Control de acceso centralizado y simple

- **Descripción de la oportunidad:** El mecanismo de control de acceso por suscripción está centralizado en un único punto (receptor MQTT), simplificando la lógica de negocio para activar/desactivar servicios.
- **Origen:** Sección "Arquitectura de Control de Acceso" – El control se hace a nivel de receptor MQTT; Sección "Funciones del Panel Admin" – Control MQTT: Activar/congelar flujo de datos por dispositivo.

---

### O-20: Proceso actual del usuario claramente identificado

- **Descripción de la oportunidad:** El flujo actual del usuario sin Cuentatron está documentado, incluyendo los puntos de falla (90% resuelto por electricista, 10% sin solución). Esto permite posicionar la propuesta de valor precisamente en el gap existente.
- **Origen:** Sección "Lo que el Usuario Hace HOY (Sin Cuentatron)" – Proceso documentado con flujo desde reclamo a CFE hasta "queda sin respuesta" para el 10% de casos no resueltos; Nota: AQUÍ ENTRA CUENTATRON.

---

*Documento generado bajo enfoque ISO 9001:2015 – Punto 6.1*
*Fecha de generación: 2026-01-05*
*Fuente única: 05_PLAN_MAESTRO_CONSOLIDADO.md v2.2*
