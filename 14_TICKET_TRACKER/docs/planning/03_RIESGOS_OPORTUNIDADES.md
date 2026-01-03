# 📊 ANÁLISIS DE RIESGOS Y OPORTUNIDADES – ISO 9001:2015 (6.1)

---

## Control de Cambios

| Versión | Fecha       | Descripción                                    |
|---------|-------------|------------------------------------------------|
| 1.0     | 2026-01-03  | Análisis inicial de riesgos y oportunidades    |

---

## 1. Referencia al Plan Maestro

### Documento Analizado

| Atributo | Valor |
|----------|-------|
| **Nombre del documento** | 02_MASTER_PLAN.md |
| **Versión del documento** | 1.16 |
| **Fecha del documento** | 2026-01-03 |
| **Ubicación** | `14_TICKET_TRACKER/docs/planning/02_MASTER_PLAN.md` |

### Alcance del Análisis

| Aspecto | Descripción |
|---------|-------------|
| **Cubre** | Identificación de riesgos y oportunidades derivados del contenido técnico, funcional, operativo y contextual del Plan Maestro |
| **No cubre** | Propuestas de acciones correctivas, preventivas o estratégicas; priorización por impacto o probabilidad; decisiones de implementación |

---

## 2. Lista de Riesgos Identificados

### R01 – Limitación de recursos de hardware local

| Atributo | Descripción |
|----------|-------------|
| **Qué es el riesgo** | La infraestructura de desarrollo cuenta con 8 GB de RAM, lo cual podría limitar la capacidad de ejecutar herramientas de desarrollo, emuladores y servicios simultáneamente |
| **Origen en el Plan Maestro** | Sección "Contexto Técnico del Usuario" > "Recursos Técnicos Disponibles" (línea 49): "Infraestructura local: PC Windows 8 GB RAM" |

---

### R02 – Ausencia de presupuesto para servicios de pago

| Atributo | Descripción |
|----------|-------------|
| **Qué es el riesgo** | El presupuesto definido como $0 MXN restringe el acceso a servicios premium, APIs de pago, o herramientas comerciales que podrían ser necesarias durante el desarrollo o escalamiento |
| **Origen en el Plan Maestro** | Sección "Contexto Técnico del Usuario" > "Recursos Técnicos Disponibles" (línea 48): "Presupuesto: $0 MXN" |

---

### R03 – Dependencia de tiers gratuitos con límites restrictivos

| Atributo | Descripción |
|----------|-------------|
| **Qué es el riesgo** | Los servicios cloud con tier gratuito tienen límites de almacenamiento, lecturas/escrituras y funciones que podrían agotarse conforme crezca el uso del MVP |
| **Origen en el Plan Maestro** | Sección "Contexto Técnico del Usuario" (línea 47): "Tipo de servicios: Gratuitos"; Sección "Selección Tecnológica" (líneas 668, 677): límites de 500 MB DB / 1 GB storage en Supabase |

---

### R04 – Nivel técnico intermedio del usuario desarrollador

| Atributo | Descripción |
|----------|-------------|
| **Qué es el riesgo** | El nivel técnico intermedio puede dificultar la resolución de problemas complejos de debugging, configuración de infraestructura o manejo de errores no documentados |
| **Origen en el Plan Maestro** | Sección "Perfil del Usuario Desarrollador" (línea 38): "Nivel técnico: Intermedio" |

---

### R05 – Rol de orquestador sin programación directa

| Atributo | Descripción |
|----------|-------------|
| **Qué es el riesgo** | El usuario dirige el desarrollo mediante IA sin programar directamente, lo que introduce una dependencia de herramientas de IA y posibles limitaciones cuando se requiera intervención manual en el código |
| **Origen en el Plan Maestro** | Sección "Perfil del Usuario Desarrollador" (línea 39): "Rol en el desarrollo: Orquestador de IA" |

---

### R06 – Punto de ruptura en captura de información

| Atributo | Descripción |
|----------|-------------|
| **Qué es el riesgo** | El diagnóstico del problema identifica que la información se pierde cuando no se captura; si el sistema no logra que la captura sea suficientemente simple, el riesgo de pérdida persiste |
| **Origen en el Plan Maestro** | Sección "Iteración 2" > "Preguntas Socráticas" (línea 132): "¿En qué punto exacto se pierde el control? Cuando la información no se captura y se pierde" |

---

### R07 – Umbral de tiempo crítico para cierre fiscal

| Atributo | Descripción |
|----------|-------------|
| **Qué es el riesgo** | El umbral de 2 días antes del cierre de mes define el punto de no retorno fiscal; cualquier falla del sistema o falta de uso en este período crítico genera pérdidas irrecuperables |
| **Origen en el Plan Maestro** | Sección "Iteración 4" > "Punto de No Retorno Fiscal" (líneas 249-253): "2 días antes del cierre de mes... información no capturada se considera irrecuperable fiscalmente" |

---

### R08 – Complejidad del sistema de recordatorios progresivos

| Atributo | Descripción |
|----------|-------------|
| **Qué es el riesgo** | El sistema de recordatorios con cuatro niveles de intensidad (suave, medio, urgente, imperativo) requiere implementación de lógica temporal compleja y sistema de notificaciones push funcional |
| **Origen en el Plan Maestro** | Sección "Iteración 6" > "Sistema de Recordatorios Progresivos" (líneas 371-376): escala de notificaciones por fase del mes |

---

### R09 – Sincronización offline limitada en ciertas opciones tecnológicas

| Atributo | Descripción |
|----------|-------------|
| **Qué es el riesgo** | La opción Supabase presenta sincronización offline limitada que requiere implementación manual; la captura en campo sin conectividad podría comprometer el pilar de "Captura Simplificada" |
| **Origen en el Plan Maestro** | Sección "Selección Tecnológica" > "Opción B: Supabase" (línea 674): "Sincronización offline limitada: Requiere implementación manual o librería adicional" |

---

### R10 – Vendor lock-in en opción Firebase

| Atributo | Descripción |
|----------|-------------|
| **Qué es el riesgo** | La selección de Firebase como backend genera dependencia del ecosistema Google Cloud, dificultando migraciones futuras si cambian términos, precios o disponibilidad del servicio |
| **Origen en el Plan Maestro** | Sección "Selección Tecnológica" > "Opción A: Firebase" (línea 639): "Vendor lock-in: Dependencia de Google Cloud" |

---

### R11 – Carga de desarrollo elevada en opción SQLite local

| Atributo | Descripción |
|----------|-------------|
| **Qué es el riesgo** | La opción de SQLite local requiere desarrollo de sincronización manual, manejo de conflictos de datos y mantenimiento de servidor propio, incrementando significativamente el esfuerzo técnico |
| **Origen en el Plan Maestro** | Sección "Selección Tecnológica" > "Opción C: SQLite" (líneas 708-712): sincronización manual compleja, más código propio, mantenimiento de VM, sin backup automático |

---

### R12 – Falta de adopción del hábito de captura

| Atributo | Descripción |
|----------|-------------|
| **Qué es el riesgo** | El éxito del MVP depende de que los usuarios adopten el hábito de capturar tickets inmediatamente; si la UX no es lo suficientemente simple, el sistema no resolverá el problema raíz |
| **Origen en el Plan Maestro** | Sección "Riesgos Identificados" (línea 774): "Falta de adopción de hábito de captura: Probabilidad Alta, Impacto Alto" |

---

### R13 – Calidad de imágenes fotográficas deficiente

| Atributo | Descripción |
|----------|-------------|
| **Qué es el riesgo** | Las fotografías de tickets podrían resultar ilegibles o de baja calidad, comprometiendo la utilidad del registro y la trazabilidad documental |
| **Origen en el Plan Maestro** | Sección "Riesgos Identificados" (línea 775): "Calidad de fotos deficiente: Probabilidad Media, Impacto Medio" |

---

### R14 – Pérdida de datos en operación offline

| Atributo | Descripción |
|----------|-------------|
| **Qué es el riesgo** | La operación offline puede resultar en pérdida de datos si no se implementa correctamente la sincronización y los mecanismos de backup |
| **Origen en el Plan Maestro** | Sección "Riesgos Identificados" (línea 776): "Pérdida de datos offline: Probabilidad Baja, Impacto Alto" |

---

### R15 – Scope creep durante desarrollo

| Atributo | Descripción |
|----------|-------------|
| **Qué es el riesgo** | La expansión no controlada del alcance puede retrasar el MVP o causar su fracaso; el documento lista múltiples funcionalidades postponidas que podrían intentar incluirse prematuramente |
| **Origen en el Plan Maestro** | Sección "Riesgos Identificados" (línea 777): "Scope creep: Probabilidad Media, Impacto Alto"; Sección "Alcance MVP" (líneas 439-445): lista de exclusiones |

---

### R16 – Múltiples actores generadores de desorden

| Atributo | Descripción |
|----------|-------------|
| **Qué es el riesgo** | Los "operadores del desorden" (empleados y colaboradores que manejan dinero) generan información de forma distribuida, lo que dificulta la captura centralizada y completa |
| **Origen en el Plan Maestro** | Sección "Iteración 2" > "Actores Reales Consolidados" (línea 123): "Operadores del desorden: Generadores de información - Todas las personas que manejan dinero" |

---

### R17 – Flujo opaco del efectivo

| Atributo | Descripción |
|----------|-------------|
| **Qué es el riesgo** | El efectivo se identifica como flujo opaco que requiere control específico; la Responsabilidad por persona está postponida a Fase 2, dejando un vacío de control en el MVP |
| **Origen en el Plan Maestro** | Sección "Visión del Proyecto" (líneas 73-74): "Flujo Crítico: El efectivo es un flujo opaco que requiere control específico"; Sección "Módulo de Efectivo" (línea 437): "Responsabilidad: Evaluar Fase 2" |

---

### R18 – Exclusión de OCR automático en MVP

| Atributo | Descripción |
|----------|-------------|
| **Qué es el riesgo** | La exclusión del OCR automático significa que todos los datos de tickets deben capturarse manualmente, aumentando la fricción del proceso y la posibilidad de errores de transcripción |
| **Origen en el Plan Maestro** | Sección "Excluido del MVP" (línea 441): "OCR automático de tickets" |

---

### R19 – Cronograma ajustado para Fase 1

| Atributo | Descripción |
|----------|-------------|
| **Qué es el riesgo** | La Fase 1 (MVP Básico) está estimada en 3-4 semanas con múltiples entregables de backend, mobile e integración; imprevistos técnicos podrían comprometer el cumplimiento del cronograma |
| **Origen en el Plan Maestro** | Sección "Fase 1: MVP Básico" (líneas 490-515): gantt chart y tabla de actividades semanales |

---

### R20 – Decisión de stack tecnológico pendiente

| Atributo | Descripción |
|----------|-------------|
| **Qué es el riesgo** | La decisión del stack tecnológico final permanece pendiente, lo cual retrasa el inicio del desarrollo y puede generar decisiones apresuradas bajo presión de tiempo |
| **Origen en el Plan Maestro** | Sección "Próximos Pasos" (línea 783): "Definir stack tecnológico final" marcado como pendiente; Sección "Fase 0" (línea 480): "Stack tecnológico definido: Pendiente" |

---

### R21 – Ausencia de diseño de wireframes

| Atributo | Descripción |
|----------|-------------|
| **Qué es el riesgo** | Los wireframes de UI están pendientes; iniciar desarrollo sin diseño previo puede resultar en re-trabajos, inconsistencias de UX o desalineación con los pilares de "Captura Simplificada" |
| **Origen en el Plan Maestro** | Sección "Próximos Pasos" (línea 785): "Diseñar wireframes de UI" marcado como pendiente |

---

### R22 – Menor documentación de Supabase con Expo

| Atributo | Descripción |
|----------|-------------|
| **Qué es el riesgo** | La opción Supabase presenta menor cantidad de ejemplos y documentación en integración con Expo comparada con Firebase, lo que dificulta la resolución de problemas para un usuario con nivel técnico intermedio |
| **Origen en el Plan Maestro** | Sección "Selección Tecnológica" > "Opción B: Supabase" (línea 675): "Menor documentación con Expo: Menos ejemplos que Firebase" |

---

### R23 – Complejidad de reglas de seguridad en Firestore

| Atributo | Descripción |
|----------|-------------|
| **Qué es el riesgo** | Las reglas de seguridad de Firestore pueden resultar confusas de implementar correctamente, exponiendo potencialmente datos sensibles fiscales si se configuran incorrectamente |
| **Origen en el Plan Maestro** | Sección "Selección Tecnológica" > "Opción A: Firebase" (línea 640): "Curva de reglas de seguridad: Las reglas de Firestore pueden ser confusas" |

---

### R24 – Múltiples entidades con estados complejos

| Atributo | Descripción |
|----------|-------------|
| **Qué es el riesgo** | El sistema define 10 entidades administrativas con múltiples estados y transiciones; la implementación incorrecta de la máquina de estados puede generar inconsistencias de datos |
| **Origen en el Plan Maestro** | Sección "Iteración 5" > "Catálogo de Entidades Administrativas" (líneas 297-309) y "Estados Críticos del Gasto" (líneas 312-330) |

---

### R25 – Self-hosting en VM requiere conocimientos DevOps

| Atributo | Descripción |
|----------|-------------|
| **Qué es el riesgo** | Migrar Supabase a la VM AWS propia o implementar la opción SQLite local requiere conocimientos de administración de servidores que podrían exceder el nivel técnico intermedio del usuario |
| **Origen en el Plan Maestro** | Sección "Selección Tecnológica" > "Opción B: Supabase" (línea 676): "Self-hosting complejo: Migrar a VM requiere conocimientos DevOps" |

---

## 3. Lista de Oportunidades Identificadas

### O01 – Experiencia avanzada del usuario en el dominio del problema

| Atributo | Descripción |
|----------|-------------|
| **Qué es la oportunidad** | El usuario posee conocimiento profundo del problema fiscal y operativo a resolver, lo que facilita la validación rápida de requisitos y reduce ciclos de iteración innecesarios |
| **Origen en el Plan Maestro** | Sección "Perfil del Usuario Desarrollador" (línea 40): "Experiencia en el dominio: Avanzado" |

---

### O02 – Disponibilidad de VM AWS Ubuntu

| Atributo | Descripción |
|----------|-------------|
| **Qué es la oportunidad** | Existe infraestructura de hosting disponible (VM AWS Ubuntu) que puede aprovecharse para despliegue sin costos adicionales de infraestructura |
| **Origen en el Plan Maestro** | Sección "Recursos Técnicos Disponibles" (línea 46): "Máquina virtual: Sí - AWS Ubuntu disponible para despliegue" |

---

### O03 – Experiencia previa del usuario en React Native/Expo

| Atributo | Descripción |
|----------|-------------|
| **Qué es la oportunidad** | Proyectos anteriores en el workspace utilizan React Native/Expo, lo que reduce la curva de aprendizaje y permite reutilizar patrones y código existente |
| **Origen en el Plan Maestro** | Sección "Selección Tecnológica" > "Supuestos Considerados" (línea 594): "Experiencia previa en React Native/Expo (proyectos anteriores en workspace)"; (línea 731): "Experiencia previa usuario: Sí" |

---

### O04 – Experiencia previa del usuario con Supabase

| Atributo | Descripción |
|----------|-------------|
| **Qué es la oportunidad** | El usuario ha trabajado previamente con Supabase en otros proyectos, lo que reduce la curva de aprendizaje si se selecciona esta opción tecnológica |
| **Origen en el Plan Maestro** | Sección "Selección Tecnológica" > "Opción B: Supabase" (línea 670): "Experiencia previa del usuario: Proyectos anteriores usan Supabase" |

---

### O05 – Definición clara del dolor principal

| Atributo | Descripción |
|----------|-------------|
| **Qué es la oportunidad** | El dolor principal está formalmente definido, validado y congelado, proporcionando un norte claro para todas las decisiones de desarrollo y evitando ambigüedades |
| **Origen en el Plan Maestro** | Sección "Definición del Dolor Principal" (línea 81): "Estado: ✅ Definición del dolor VALIDADA y CONGELADA" |

---

### O06 – Resultado mínimo aceptable claramente definido

| Atributo | Descripción |
|----------|-------------|
| **Qué es la oportunidad** | El criterio de éxito del MVP está explícitamente definido ("ningún gasto sin facturar" + "visibilidad exacta del monto a facturar"), lo que permite medir objetivamente el logro del objetivo |
| **Origen en el Plan Maestro** | Sección "Iteración 3" > "Resultado Mínimo Aceptable" (líneas 180-183) |

---

### O07 – Límites duros del MVP establecidos

| Atributo | Descripción |
|----------|-------------|
| **Qué es la oportunidad** | Las exclusiones del MVP están explícitamente documentadas (SAT, bancos, automatizaciones), lo que proporciona protección formal contra scope creep |
| **Origen en el Plan Maestro** | Sección "Iteración 3" > "Límites Duros del MVP" (líneas 194-201): lista de exclusiones con justificación |

---

### O08 – Pilares fundamentales justificados

| Atributo | Descripción |
|----------|-------------|
| **Qué es la oportunidad** | Los pilares de "Captura Simplificada" y "Repositorio Confiable" derivan directamente del análisis del problema, proporcionando principios de diseño fundamentados |
| **Origen en el Plan Maestro** | Sección "Iteración 2" > "Pilares Justificados del Sistema" (líneas 143-146) |

---

### O09 – Flujos de información documentados

| Atributo | Descripción |
|----------|-------------|
| **Qué es la oportunidad** | Los flujos administrativos están documentados (nacimiento de información, punto de no retorno, flujo de facturación), facilitando el diseño técnico alineado con la realidad operativa |
| **Origen en el Plan Maestro** | Sección "Iteración 4: Flujos de Información Administrativos" (líneas 216-270) |

---

### O10 – Entidades y estados formalmente modelados

| Atributo | Descripción |
|----------|-------------|
| **Qué es la oportunidad** | El catálogo de entidades y la máquina de estados del gasto están documentados como diagramas mermaid, facilitando la traducción directa a modelo de datos y lógica de negocio |
| **Origen en el Plan Maestro** | Sección "Iteración 5" > "Catálogo de Entidades Administrativas" y "Estados Críticos del Gasto" (líneas 295-330) |

---

### O11 – Reglas de negocio formalizadas como MUST/MUST NOT

| Atributo | Descripción |
|----------|-------------|
| **Qué es la oportunidad** | Las reglas de negocio están formalizadas con estados obligatorios, prohibidos y excepciones controladas, lo que permite implementar validaciones y constraints claros |
| **Origen en el Plan Maestro** | Sección "Iteración 6: Reglas de Negocio y Excepciones" (líneas 343-398) |

---

### O12 – Sistema de recordatorios como diferenciador

| Atributo | Descripción |
|----------|-------------|
| **Qué es la oportunidad** | El sistema de recordatorios progresivos con cuatro niveles de intensidad aborda directamente el problema de "olvidar facturar", constituyendo un diferenciador frente a soluciones genéricas |
| **Origen en el Plan Maestro** | Sección "Iteración 6" > "Sistema de Recordatorios Progresivos" (líneas 366-376) |

---

### O13 – Múltiples opciones tecnológicas documentadas

| Atributo | Descripción |
|----------|-------------|
| **Qué es la oportunidad** | El Plan Maestro presenta tres opciones de arquitectura con ventajas, riesgos y tabla comparativa, permitiendo una decisión informada basada en criterios objetivos |
| **Origen en el Plan Maestro** | Sección "Selección Tecnológica – Arquitectura Base" (líneas 577-767): tres opciones detalladas con comparativa |

---

### O14 – Control de cambios sistemático

| Atributo | Descripción |
|----------|-------------|
| **Qué es la oportunidad** | El documento mantiene un control de cambios versionado (16 versiones documentadas), lo que proporciona trazabilidad histórica de decisiones y facilita auditorías |
| **Origen en el Plan Maestro** | Sección "Control de Cambios" (líneas 5-25): tabla con 16 versiones documentadas |

---

### O15 – Iteraciones de planeación validadas y congeladas

| Atributo | Descripción |
|----------|-------------|
| **Qué es la oportunidad** | Las seis iteraciones de planeación están marcadas como validadas y congeladas, proporcionando una base estable sobre la cual construir sin renegociar requisitos |
| **Origen en el Plan Maestro** | Múltiples secciones con estado "✅ CERRADA" (líneas 81, 111, 161, 219, 276, 346) |

---

### O16 – Cronograma por fases definido

| Atributo | Descripción |
|----------|-------------|
| **Qué es la oportunidad** | Las fases de ejecución están documentadas con duraciones estimadas y entregables por semana, facilitando el seguimiento y control del proyecto |
| **Origen en el Plan Maestro** | Sección "Fases de Ejecución" (líneas 468-539): Fase 0, 1, 2 y 3 con gantt chart |

---

### O17 – Módulos funcionales claramente delimitados

| Atributo | Descripción |
|----------|-------------|
| **Qué es la oportunidad** | El alcance del MVP está organizado en módulos diferenciados (Captura, Ingresos, Conciliación, Efectivo) con criterios de aceptación específicos por funcionalidad |
| **Origen en el Plan Maestro** | Sección "Alcance del MVP" (líneas 401-445): tablas por módulo con criterios de aceptación |

---

### O18 – Exclusión de integraciones complejas simplifica seguridad

| Atributo | Descripción |
|----------|-------------|
| **Qué es la oportunidad** | La exclusión de integraciones SAT y bancarias en el MVP reduce significativamente los requisitos de seguridad, certificaciones y cumplimiento regulatorio en la primera fase |
| **Origen en el Plan Maestro** | Sección "Selección Tecnológica" (línea 595): "Exclusión de integraciones SAT/bancos: Simplifica requisitos de seguridad en MVP" |

---

### O19 – Tecnologías con buena documentación y soporte de IA

| Atributo | Descripción |
|----------|-------------|
| **Qué es la oportunidad** | Las opciones tecnológicas consideradas (Firebase, Supabase) cuentan con documentación abundante y soporte de herramientas de IA, alineándose con el rol de orquestador del usuario |
| **Origen en el Plan Maestro** | Sección "Selección Tecnológica" > "Tabla Comparativa" (línea 725): "Documentación + IA: Abundante/Buena" para opciones A y B |

---

### O20 – Usuario único simplifica autenticación inicial

| Atributo | Descripción |
|----------|-------------|
| **Qué es la oportunidad** | El MVP está diseñado para usuario único, lo que simplifica significativamente los requisitos de autenticación, autorización y control de acceso en la primera fase |
| **Origen en el Plan Maestro** | Sección "Selección Tecnológica" > "Limitaciones Técnicas" (línea 606): "Usuario único inicial: Simplifica autenticación y control de acceso en MVP" |

---

### O21 – Sincronización offline automática en opciones tecnológicas

| Atributo | Descripción |
|----------|-------------|
| **Qué es la oportunidad** | La opción Firebase ofrece sincronización offline nativa automática, lo que facilita la implementación del pilar de captura en campo sin conectividad |
| **Origen en el Plan Maestro** | Sección "Selección Tecnológica" > "Opción A: Firebase" (línea 633): "Sincronización offline nativa: Firestore maneja offline automáticamente" |

---

### O22 – Portabilidad con opción open source

| Atributo | Descripción |
|----------|-------------|
| **Qué es la oportunidad** | La opción Supabase es open source y permite migración futura a infraestructura propia (VM AWS), eliminando dependencia de proveedores si es necesario |
| **Origen en el Plan Maestro** | Sección "Selección Tecnológica" > "Opción B: Supabase" (línea 667): "Portabilidad: Open source, puede migrarse a VM propia si es necesario" |

---

### O23 – Métricas de éxito objetivas

| Atributo | Descripción |
|----------|-------------|
| **Qué es la oportunidad** | Los objetivos específicos del MVP incluyen métricas cuantificables (100% tickets capturados, <30 segundos búsqueda, 0 tickets perdidos), facilitando la evaluación objetiva del éxito |
| **Origen en el Plan Maestro** | Sección "Objetivos del MVP" (líneas 456-464): tabla con métricas de éxito y plazos |

---

### O24 – Diagnóstico del problema como sistémico

| Atributo | Descripción |
|----------|-------------|
| **Qué es la oportunidad** | El diagnóstico identifica el problema como sistémico y no de mala intención, lo que orienta la solución hacia herramientas y procesos en lugar de medidas punitivas o de control excesivo |
| **Origen en el Plan Maestro** | Sección "Iteración 2" > "Diagnóstico del Problema" (líneas 136-137): "El problema es sistémico, no de mala intención" |

---

### O25 – Excepción controlada para facturas irrecuperables

| Atributo | Descripción |
|----------|-------------|
| **Qué es la oportunidad** | El sistema contempla un flujo de excepción para tickets sin factura por problemas del proveedor, evitando que el usuario se bloquee y proporcionando visibilidad del impacto fiscal |
| **Origen en el Plan Maestro** | Sección "Iteración 6" > "Excepción Controlada: Factura Irrecuperable por Proveedor" (líneas 378-386) |

---

*Documento generado el 2026-01-03 bajo el enfoque ISO 9001:2015 punto 6.1*
*Solo contiene identificación y descripción de riesgos/oportunidades, sin propuestas de acción*
