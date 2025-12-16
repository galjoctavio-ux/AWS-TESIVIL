# DOCUMENTO MAESTRO FINAL — APP “BITÁCORA AIRE ACONDICIONADO SMART” (Bitácora AC)

**Versión:** 1.0 (INICIAL)
**Fecha:** 14 de Diciembre de 2025
**Propósito:** Especificación técnica completa para desarrollo MVP. Incluye arquitectura, reglas de negocio, esquema de datos, marco legal y roadmap.

---

## CAPÍTULO 1: VISIÓN Y ALCANCE

### 1.1 Resumen Ejecutivo
“Bitácora de Aires Acondicionados Smart” es una aplicación móvil (CRM + Herramientas) para técnicos de aire acondicionado que resuelve la gestión diaria, profesionaliza el servicio y crea un ecosistema de confianza mediante QRs.
**Pilares:**
1.  **Gestión**: Registro de servicios ultrarápido (<30s) con evidencia técnica.
2.  **Viralidad Dual**: Etiquetas QR que funcionan como Historial de Garantía para el cliente (sin app) y como Canal de Adquisición para nuevos técnicos (invitación directa en la web).
3.  **Monetización**: Modelo Freemium (Ads vs Suscripción PRO) + Venta de Insumos (Etiquetas).
4.  **Crecimiento**: Perfil Profesional Privado con gamificación interna y capacitación continua.

### 1.2 Objetivos del Producto
- **Operativo**: Digitalizar la bitácora del técnico (adiós libreta), llevar el control de clientes, buscador de errores mediante listado de códigos y comunidad de técnicos y herramientas de utilidad para el técnico.
- **Comercial**: Convertir técnicos a usuarios PRO mediante herramientas de valor.
- **Profesional**: Construir una reputación técnica interna basada en evidencia y capacitación (preparación para futuro directorio).

---

## CAPÍTULO 2: ARQUITECTURA Y TECNOLOGÍA

### 2.1 Stack Técnico
- **Frontend**: Flutter (Dart) - iOS + Android (Código único).
- **Backend / BaaS**: Firebase (Auth, Firestore, Cloud Functions, Storage, FCM).
- **Web (Admin/Landing)**: React / Next.js hosting en Firebase/Vercel.
- **IA**: Groq API (Llama 3) para moderación de contenido.
- **Scraper**: Python/Node (Cloud Run/Lambda) para precios de insumos.
- **Pagos**:
    - **Stripe**: Suscripciones Recurrentes (PRO).
    - **MercadoPago**: Pagos Únicos (Paquetes de Etiquetas Físicas).

### 2.2 Principios de Diseño
- **Offline-First**: La app debe ser funcional sin internet (SQLite local para caché crítico).
- **Privacidad por Diseño**: Hashes para datos sensibles (teléfonos), Alias únicos.
- **Identidad del Activo**: Un QR = Un Equipo (Inmutable).

---

## CAPÍTULO 3: MÓDULOS FUNCIONALES (CORE)

### 3.0 Módulo 0: Onboarding y Registro
**Objetivo**: Captura segura y configuración de privacidad.
1.  **Pantalla de Bienvenida**:
    -   Principal: "Continuar con Celular" (Firebase Phone Auth - Anti-fraude).
    -   Secundario: Google (requiere validar celular después).
2.  **Identidad**:
    -   **Nombre Real (Privado)**: Facturación/Interno. 
    -   **Nombre de Empresa (Opcional y privado)**: Facturación/Interno.
    -   **Alias Público (Único)**: Visible en bitacoras digitales y Comunidad (ej. "FrioTec2024").
    -   **Ciudad Base**: Para calibrar clima default en BTU y precios.
    -   *Campo Interno*: `profile_completeness_score` (0-100). Influye directamente en el acceso a funciones PRO y en la elegibilidad para el futuro Directorio. (Privado en V1).
3.  **Wizard Inicial**: "¿Años de experiencia?" -> Asigna Rango inicial (**Novato** < 2 años, **Técnico** > 2 años).
4.  **Permisos**: Cámara (QR), Ubicación (Geofencing), Notificaciones.
5.  **Aceptación Legal (Regla UI)**:
    -   Botón "Crear Cuenta" **deshabilitado** por defecto.
    -   Usuario debe marcar: [x] Acepto T&C y Aviso Privacidad | [x] Acepto Disclaimer de Responsabilidad.
    -   Links abren en Modal/WebView (no sacar de la app).

### 3.1 Módulo 1: Gestión de Servicios (CRM)
**UX Goal**: Captura < 30 seg.
**Flujo Nuevo Servicio**:
1.  **Tipo de Servicio (UI Visual)**: 3 Botones Grandes [🛠️ Instalación] [🧽 Mantenimiento] [🔧 Reparación].
2.  **Identificación del Cliente**:
    -   **Regla de Oro (Aislamiento de Datos)**:
        -   **Gestión de Contactos (Privacidad Centralizada)**: Existirá una base de datos maestra central. Cada registro tiene un `linked_technician_id`.
        -   **Autocompletado**: La app solo muestra contactos vinculados al ID del técnico. El técnico ve y administra únicamente su propia cartera.
        -   **Recordatorios (PRO)**: La función de recordatorios automáticos basados en "Próximo Servicio" es exclusiva para suscripción PRO.

3.  **Datos del Equipo**:
    -   **Marca**: Grid de Logotipos (3 columnas).
        -   **Visual**: Identificación rápida (logotipos).
        -   **Lista**: Mirage, Midea, York, Trane, Carrier, LG, Samsung, Daikin, Hisense + Genérica.
    -   **Vinculación QR**: Ver Módulo 3.4.
4.  **Trabajo Realizado**:
    -   **Chips Multi-select** (Selección rápida):
        -   [Limpieza Evap/Cond]
        -   [Carga de Gas]
        -   [Cambio Capacitor]
        -   [Cambio Contactor]
        -   [Reparación Tarjeta]
        -   [Búsqueda Fugas]
        -   [Soldadura]
        -   [Cambio Sensor]
        -   [Desinstalación]
        -   [Diagnóstico]
        -   [Otro]
    -   *Auto-select*: Si Tipo="Instalación", pre-marcar chip [Instalación].
    -   **Listas de Verificación (Checklists)**:
        -   *Instalación*: [Vacío realizado], [Torque aplicado], [Protección eléctrica verificada], [Prueba de operación].
        -   *Objetivo*: Generar evidencia técnica estructurada y ganar tokens adicionales.
5.  **Cierre**: Fotos (Opcionales, comprimidas), Notas, Próximo Servicio (auto +1 año si Instalación).

### 3.2 Módulo Perfil Profesional (Privado)
**Ubicación UX**: Sección "Mi Carrera" en el menú principal.
**Objetivo**: Agregador de métricas de crecimiento profesional. NO es público en V1.
**Elementos Visibles**:
-   **Identidad**: Alias, Rango Actual (Novato/Técnico/Pro), Ciudad.
-   **Estadísticas de Carrera**:
    -   Años de experiencia.
    -   Total de Servicios Registrados.
    -   Equipos Activos (QRs).
    -   Casos SOS Resueltos (Soluciones aceptadas).
-   **Nivel de Perfil**: Barra de progreso (`profile_completeness_score`). Motiva a completar datos y capacitación.
-   **Insignias**: Visualización de logros (ej. "Primer QR", "Experto en Inverter", "Buen Samaritano").
**Disclaimer UI**: "Este perfil es privado. En futuras versiones podrás decidir si hacerlo público para aparecer en el Directorio Certificado."
*Nota: Las estadísticas de este perfil se alimentan y visualizan desde el nuevo dashboard "Mi Taller".*

### 3.3 Módulo 2: Cotizador Pro (Premium)  

1.  **Configuración Inicial (Wizard)**:
    -   **Identidad**: Carga de Logotipo y selección de colores para el PDF.
    -   **Config (Wizard de Calibración)**:
    -   Pregunta 1: "¿Cuál es tu costo de Mano de Obra para una instalación básica de 1 ton?". (Default: $2,000)
    -   Pregunta 2 (Referencia Exacta): "¿A cuánto compras hoy **1 rollo de tubo flexible de cobre de 1/2" de 15.2m**?".
    -   Pregunta 3 (Referencia Exacta): "¿A cuánto compras hoy un minisplit **Inverter marca Mirage 1 ton solo frío 110v**?".
    -   *Lógica*: El sistema compara estos valores contra su base de datos (Scraper) para hallar el "Factor de Realidad Local" del técnico y ajustar todos los precios automáticamente.
    -   **Mano de Obra (Defaults Sugeridos)**:
        -   1 Ton: $2,000
        -   1.5 Ton: $2,200
        -   2 Ton: $2,400
        -   3 Ton: $3,000
        -   *Nota*: El técnico puede sobrescribir estos valores.
    -   **Configuración de Precios (Estratégica)**:
        -   **Modo Manual (Default)**: El técnico ingresa sus costos; la app aplica margen.
        -   **Modo Asistido (Beta/Pro)**: Sistema sugiere precios de mercado (Web Scraping). Incluye disclaimer: *"Los precios mostrados son referencias. Usted es responsable de verificar el precio final."*
2.  **Nueva Cotización**:
    -   **Selección de Equipo**:
        -   Manual: Marca, Modelo, Tonelaje (1, 1.5, 2, 3), Voltaje.
        -   *Base de Datos*: Precios referenciales cargados (foco inicial en equipos **Mirage**).
        -   *Integración*: Opción "Cargar desde Calculadora BTU" para sugerir tonelaje.
    -   **Tipo de Instalación**:
        -   **Básica**: Incluye Kit de instalación estándar (3-4m tubería, armaflex, cinta, cable señal).
        -   **Personalizada / Extras**:
            -   Tubería de cobre extra.
            -   Bomba de condensado.
            -   Soldadura de plata.
            -   Carga de Gas (R22, R32, R410A).
            -   Canaletas, bases de piso/pared.
    -   **Materiales Adicionales**:
        -   Catálogo de insumos sueltos (tramos de cable uso rudo, pastillas, ménsulas).
        -   *Alcance*: Solo insumos básicos de AA. Para proyectos eléctricos complejos, usar herramienta especializada.
3.  **Cálculo Automático**:
    -   `Precio_Insumo = (Precio_Base_Scraper * Factor_Realidad) * (1 + Margen_Ganancia)`
    -   `Total = Suma_Insumos + Mano_Obra`
4.  **Salida**: PDF profesional y estéticamente agradable (diseño limpio, colores corporativos), con desglose y validez 7 días. Opción "Guardar y Asociar a Servicio".

### 3.4 Módulo 3: Ecosistema QR
**Concepto**: "La Llave Física". El QR da acceso al historial del equipo.

#### A. Escaneo con Cámara Nativa (Vista Web / Cliente)
**Acceso**: URL pública con token único (ej. `bitacora.smart/qr/xyz123`). No requiere login ni descargar app.
1.  **Encabezado de Estado**:
    -   Marca/Modelo del Equipo.
    -   Estado actual: "✅ Al corriente" o "⚠️ Mantenimiento Sugerido" (basado en fecha del último servicio).
2.  **Bitácora Transparente (Read-Only)**:
    -   Lista cronológica de servicios.
    -   **Datos visibles**: Fecha | Tipo (Mantenimiento/Reparación) | Detalle "Sanitizado" (ej. "Limpieza profunda y carga de gas") | Nombre del Técnico (o Alias) | Nivel Público.
3.  **Contacto del Último Técnico (Dinámico)**:
    -   Botón grande: `[ 💬 Contactar por WhatsApp ]`.
    -   **Regla**: Enlaza SIEMPRE al último técnico que registró un servicio en este equipo.
    -   *Incentivo*: "El último en actualizar se adueña del canal de comunicación".
4.  **Sección "Gancho para Técnicos" (Banner Inferior)**:
    -   Diseño diferenciado (Fondo oscuro/llamativo).
    -   Texto: "¿Eres Técnico? ¿Quieres llevar el control de todos tus equipos, recordatorios automáticos y unirte a la comunidad?"
    -   CTA: `[ Descargar Bitácora de Aires Acondicionados Smart para Técnicos ]`.

#### B. Escaneo desde la App (Técnico)
**Modos**:
1.  **Crear Caso**: Al escanear en proceso de servicio -> Abre formulario de nuevo servicio vinculado.
2.  **Ver Historial**: Al escanear en consulta -> Muestra timeline completo (incluyendo notas privadas propias).

#### C. Traducción de Reputación (Manejo de Percepción)
Para proteger la imagen del técnico, se usan etiquetas comerciales en la Vista Web mientras se mantiene la gamificación interna.

| Nivel Interno (App) | Vista Web (Cliente) | Significado para el Cliente |
| :--- | :--- | :--- |
| **Nivel 1 (Novato)** | ✅ Miembro Verificado | Garantía de que el técnico está registrado y validado. |
| **Nivel 2 (Técnico)** | 🛡️ Técnico Profesional | Confianza y experiencia comprobada. |
| **Nivel 3 (Pro)** | 🥇 Especialista | Autoridad máxima en el servicio. |

#### D. Lógica de la Vista Web Pública (Seguridad)
-   **Acceso "Bearer Token"**: La seguridad radica en el acceso físico al QR. Quien escanea, tiene permiso de "Solo Lectura".
-   **Sanitización de Datos**: La API filtra notas privadas o comentarios sensibles.
-   **Campos Whitelist**: Solo se muestran `service_type`, `public_description`, `date`, `tech_public_alias`.

**Reglas de Integridad**:
1.  **Escaneo QR Virgen**: Permite registrar Marca/Modelo -> Se "casa" con el ID.
2.  **Inmutabilidad**: Prohibido reciclar etiquetas. Un QR = Un Activo físico.
**Privacidad**:
-   **NUNCA** muestra: Teléfono o Empresa del técnico anterior (salvo el botón de contacto del *último* técnico).
-   **Métricas Internas**: Se contabilizan QRs activos y equipos con historial recurrente para el Perfil Profesional.

### 3.5 Módulo 4: Mi Taller (Dashboard Unificado)
**Objetivo**: Centro de control diario del técnico. Reemplaza la pantalla de inicio tradicional para maximizar retención.
**Componentes Clave**:
1.  **Recordatorios/Calendario**:
    -   Vista central de equipos que requieren servicio próximo.
    -   Acciones rápidas: [Llamar], [WhatsApp], [Registrar Servicio].
2.  **Grid de Acceso Rápido**:
    -   Accesos directos a Herramientas: [Nuevo Servicio], [Calculadora BTU], [Guía Cables], [Códigos Error].
3.  **Historial Avanzado (Logbook)**:
    -   Buscador y filtros potentes (Fecha, Cliente, Marca, Tipo).
    -   *Feature PRO*: Exportar reporte en PDF. Opción de "Repetir Servicio" (clonar datos).
4.  **Estadísticas y Progreso**:
    -   KPIs rápidos: Servicios semana, Tokens ganados.
    -   Visualización del `profile_completeness_score`.

#### 3.5.1 Submódulo: Herramientas Técnicas (Free)
-   **Guía de Cables y Protecciones (Wizard Paso a Paso)**:
    -   **Input**:
        -   **Tonelaje**: 1, 1.5, 2, 3 Ton.
        -   **Voltaje**: 110v / 220v.
        -   **Distancia**: <20m (Estándar) / <25m (Inverter) o Mayor (hasta 50m).
        -   **Tipo de Aire Acondicionado**: Inverter / Estándar.
    -   **Output (Lógica NOM-001)**:
        -   **1 Ton / 110V / Estándar**:
            -   Corto: 12 AWG + Pastilla 15A.
            -   Largo: 12 AWG + Pastilla 15A.
        -   **1 Ton / 220V / Estándar**:
            -   Corto: 14 AWG + Pastilla 10A.
            -   Largo: 12 AWG + Pastilla 10A.
        -   **1.5 - 2 Ton / 220V / Estándar**:
            -   Corto: 12 AWG + Pastilla 15A.
            -   Largo: 12 AWG + Pastilla 15A.
        -   **3 Ton / 220V / Estándar**:
            -   Corto: 12 AWG + Pastilla 20A.
            -   Largo: 10 AWG + Pastilla 20A.

        -   **1 Ton / 110V / Inverter**:
            -   Corto: 14 AWG + Pastilla 15A.
            -   Largo: 12 AWG + Pastilla 15A.
        -   **1 Ton / 220V / Inverter**:
            -   Corto: 14 AWG + Pastilla 10A.
            -   Largo: 12 AWG + Pastilla 10A.
        -   **1.5 - 2 Ton / 220V / Inverter**:
            -   Corto: 14 AWG + Pastilla 15A.
            -   Largo: 12 AWG + Pastilla 15A.
        -   **3 Ton / 220V / Inverter**:
            -   Corto: 12 AWG + Pastilla 20A.
            -   Largo: 10 AWG + Pastilla 20A.

-   **Tabla P-T (Presión-Temperatura)**:
    -   **Selector**: R410A, R22, R32.
    -   **Interfaz**: Slider o Input de temperatura ambiente.
    -   **Output**: Presión de succión ideal (PSI).
        -   **R-410A (Orientativo)**:
            -   25 °C: ~105 – 125 psig (≈ 7.2 – 8.6 bar)
            -   30 °C: ~110 – 130 psig (≈ 7.6 – 9.0 bar)
            -   35 °C: ~115 – 135 psig (≈ 7.9 – 9.3 bar)
            -   40 °C: ~120 – 145 psig (≈ 8.3 – 10.0 bar)
            -   *Fuentes: FSW, Refrigerants Center Inc, Royal Refrigerants*
        -   **R-32 (Orientativo - Similar a R-410A)**:
            -   25 °C: ~105 – 130 psig (≈ 7.2 – 9.0 bar)
            -   30 °C: ~110 – 135 psig (≈ 7.6 – 9.3 bar)
            -   35 °C: ~115 – 140 psig (≈ 7.9 – 9.6 bar)
            -   40 °C: ~120 – 150 psig (≈ 8.3 – 10.3 bar)
            -   *Fuente: Ace Services (Confirmado que opera en rangos similares)*
        -   **R-22 (Orientativo - Presiones menores)**:
            -   25 °C: ~50 – 70 psig (≈ 3.4 – 4.8 bar)
            -   30 °C: ~55 – 75 psig (≈ 3.8 – 5.2 bar)
            -   35 °C: ~60 – 80 psig (≈ 4.1 – 5.5 bar)
            -   40 °C: ~65 – 90 psig (≈ 4.5 – 6.2 bar)
-   **Biblioteca de Errores**: Buscador offline (Marca + Código = Diagnóstico). Módulo independiente con valores y códigos en directorio dedicado.

#### 3.5.2 Submódulo: Capacitación Ligera
**Objetivo**: Formación técnica continua "In-App". Accesible desde Mi Taller.
-   **Contenido**: Cápsulas de "Buenas Prácticas" (Instalación, Normativa, Errores Comunes).
-   **Formato**: Micro-contenidos (Texto + Imagen/Video corto).
-   **Recompensa**: Tokens por completar módulos y desbloqueo de Insignias.
-   *Disclaimer*: "Capacitación interna para mejora profesional. No es una certificación oficial."

### 3.6 Módulo 5: Comunidad SOS
**Objetivo**: Resolución de problemas, Gamificación y construcción de Reputación Técnica Interna.
**Flujo**:
1.  **Crear Hilo (SOS)**:
    -   Requiere: Marca, Modelo y Descripción del problema. (Foto del error/equipo es opcional).
    -   Costo: Gratis (o pequeña quema de tokens si hay abuso).
    -   **Filtro IA (Calidad)**: Groq analiza texto para:
        1.  Bloquear contenido ofensivo.
        2.  **Filtrar respuestas sin valor**: Se rechazan comentarios tipo "ok", "gracias", "yo también" que no aporten solución técnica.
2.  **Respuestas**:
    -   Técnicos responden. El autor marca una como "Solución".
    -   **Recompensa**: Autor gana puntos por cerrar el caso. Respondedor (Solución) gana **X Tokens**.
3.  **Moderación**:
    -   Sistema de Reportes (Flag). Si un usuario acumula reportes -> Ban temporal automático.
    -   **Gamificación y Calidad**:
        -   **Calificación**: Las respuestas tendrán botones de Like/Dislike.
        -   **Recompensas**: Se generan tokens por responder (validado por IA/Groq para asegurar utilidad y evitar insultos).
        -   **Límites de Spam**:
            -   Max 2 respuestas premiadas con tokens por hora.
            -   Max 5 comentarios totales por hora por técnico.

        -   **Distintivos**: El nombre del técnico mostrará su alias y una insignia de rango: **Novato**, **Técnico** o **Pro** (Suscripción).
    -   **Base de Datos de Fallas Comunitaria (Nuevo)**:
        -   **Input**: Al finalizar una reparación, se ofrece reportar "Caso Común" por tokens.
        -   **Consenso**: Un reporte solo se hace público cuando 3 técnicos diferentes reporten la misma falla/solución para el mismo modelo.
        -   **Objetivo**: Crear base de conocimiento confiable vs spam.

### 3.7 Módulo 6: Calculadora BTU
-   **Versión Free**:
    -   Fórmula: `Área * Factor Zona`.
    -   **Factores**: Templada (600 BTU/m²), Cálida (700 BTU/m²), Muy Cálida (800 BTU/m²).
    -   Limitación: No guarda, marca de agua.
-   **Versión Pro (Análisis Térmico Completo)**:

    -   **A. Geometría**: Largo x Ancho x Altura (Volumen m³).
    -   **B. Ganancia Solar (Ventanas)**: Cantidad, Orientación (N/S/E/O) y Protección (Persiana/Película).
    -   **C. Ocupación**: N° Personas (Actividad ligera/pesada).
    -   **D. Carga Interna**: Equipos (TVs, Computadoras, Hornos - Watts estimados).
    -   **E. Aislamiento**: Paredes (Ladrillo/Tabla/Cristal) y Techo (Losa/Aislado).
    -   *Resultado*: BTU Exactos + Sugerencia Comercial (ej. "Requiere 14,500 BTU → Instalar 1.5 Ton").
    -   **Persistencia**: Guarda análisis en Firestore.
    -   **PDF**: Exportable con footer legal.
    -   **Regla UI**: Toast de Disclaimer al abrir por primera vez.

### 3.8 Módulo 7: Economía de Tokens
-   **Historial de Movimientos**: Se incluirá un módulo dedicado "Mi Billetera" donde el usuario podrá consultar el detalle de ganancias y consumo de tokens.
**Definición Legal**: "Los Tokens NO son dinero, son instransferibles y revocables."
**Daily Caps (Anti-Granja)**:
> *Nota: Todos los valores y límites son editables desde el Panel de Administrador.*
| Acción | Ganancia | Límite Diario |
| :--- | :--- | :--- |
| Registrar Servicio | 10 | 6 |
| SOS | 20 | 1 |
| Respuesta Validada | 50 | ∞ |

**Protección Anti-Fraude**:
-   **Límites Diarios**: Los topes (caps) de tokens son **POR DÍA** (reset 00:00 local) para evitar granjas humanas.
-   **Bloqueo de Velocidad**: Si un usuario intenta registrar > 6 servicios en tiempos imposibles (ej. 1 hora) -> Flag de revisión.
-   **Geofencing**: Servicios idénticos (mismo GPS) en corto tiempo no generan tokens.

### 3.9 Módulo 8: Tienda y Recompensas
**Objetivo**: Monetizar insumos y premiar lealtad.
**Estrategia Dual de Etiquetas QR**:
1.  **QR Gratis (Viral)**: Todo técnico puede generar e imprimir sus propias etiquetas desde la app (PDF). Fomenta adopción masiva.
2.  **Etiquetas Profesionales (Monetización)**: Venta de paquetes físicos (material duradero, adhesivo industrial, diseño premium).

**Secciones de la Tienda**:
1.  **Tienda de Dinero Real (Insumos)**:
    -   **Producto Exclusivo**: Paquetes de Etiquetas QR Profesionales (20, 50, 100 piezas).
    -   **Pagos**: MercadoPago / Stripe.
    -   **Administración**: El precio de los paquetes es editable desde el Panel Admin.
    -   **Logística**: Envío a domicilio.

2.  **Tienda de Tokens (Canje Digital)**:
    -   **Objetivo**: Canjear tokens acumulados por servicios o herramientas premium.
    -   **Catálogo Diverso "Quemadores"**:
        -   *Nota*: Todo el catálogo y sus costos en tokens es 100% editable desde el Panel de Administración.
        1.  **Launch Booster (Admin Toggle)**: "7 Días Premium" a costo reducido de tokens. (Objetivo: Impulsar adopción inicial).
        2.  **Artículos Físicos**: De bajo costo (cinta momia, herramientas básicas).
        3.  **Features PRO**: Acceso temporal estándar (ej. "1 semana de Cotizador Pro").
        4.  **Promociones Digitales**: Destacar preguntas/respuestas en la comunidad.
        5.  **Descuentos**: En la compra de paquetes de Etiquetas QR Profesionales.
3.  **Logística**:
    -   Panel Admin para marcar "Enviado" y subir guía de rastreo.

### 3.10 Módulo 9 (Admin): Panel de Gestión
-   **Dashboard**: KPIs de conversión, uso de tokens.
-   **Flags de Usuario**: `eligible_for_public_directory` (false default), `trust_score_internal`, `profile_completeness_score`.
-   **Reglas Dinámicas**: Editar JSON de `token_earn_rules`, `btu_factors`, costos de catálogo y reglas de consenso.
-   **Catálogo**: Gestión de Productos (Precio, Stock, Imagen) para ambas tiendas.
-   **Moderación**: Cola de reportes con Score de IA.
-   **Logs**: Auditoría inmutable de acciones administrativas.
---

## CAPÍTULO 4: ESQUEMA DE DATOS (FIRESTORE)

### Colecciones Clave

**`users`**
*Perfil del Técnico*
- `uid`: String (Unique)
- `alias`: String (Public)
- `phone_hash`: String (Private/Auth)
- `rank`: String ("Novato", "Técnico", "Pro")
- `token_balance`: Number (Ledger sum)
- `is_premium`: Boolean (Stripe status / Trial 7-days)
- `subscription_end_date`: Timestamp
- `profile_completeness_score`: Number (0-100)
- `stats`: Map { `services_count`, `qrs_active`, `sos_solved`, `training_completed` }
- `pricing_config`: Map { `mode` ("manual"/"assisted"), `labor_base`, `material_factors` }
- `eligible_for_directory`: Boolean (Admin flag)

**`services`**
*Bitácora de Eventos*
- `id`: String (UUID)
- `user_id`: String (Ref: users)
- `equipment_id`: String (Ref: equipments - QR Hash)
- `client_id`: String (Ref: contacts)
- `type`: String ("Instalación", "Mantenimiento", "Reparación")
- `status`: String ("Borrador", "Finalizado")
- `technical_details`: Map { `refrigerant`, `pressure`, `amperage`, `voltage` ... }
- `checklists`: List<Map> [ { `item`: "Vacío", `checked`: true }, ... ]
- `photos`: List<String> (Storage URLs)
- `notes_private`: String
- `service_author_rank_at_time`: String
- `created_at`: Timestamp

**`equipments`**
*Identidad Digital del Activo (QR)*
- `qr_hash`: String (ID Inmutable)
- `brand`: String
- `model`: String
- `capacity`: String ("1 Ton", "1.5 Ton"...)
- `voltage`: String ("110v", "220v")
- `type`: String ("Minisplit", "Inverter", "Window")
- `install_date`: Timestamp
- `last_service_date`: Timestamp
- `last_service_tech_id`: String (Para Regla de Contacto Dinámico)
- `timeline`: Subcollection (Denormalized summary of services for read-only view)

**`contacts`**
*Agenda Privada (Aislamiento de Datos)*
- `id`: String (UUID)
- `linked_technician_id`: String (Ref: users - CRITICAL SECURITY RULE)
- `name`: String
- `phone`: String
- `address`: String
- `notes`: String
- `source`: String ("Manual", "Importado")

**`quotes`**
*Cotizaciones (Cotizador Pro)*
- `id`: String (UUID)
- `user_id`: String (Ref: users)
- `client_name`: String
- `items`: List<Map> [ { `desc`, `qty`, `unit_price`, `total` } ]
- `total_amount`: Number
- `status`: String ("Borrador", "Enviada", "Aceptada")
- `analysis_ref`: String (Opcional - Ref: thermal_analysis)
- `valid_until`: Timestamp

**`sos_threads`**
*Comunidad y Diagnóstico*
- `id`: String
- `author_id`: String
- `title`: String
- `content`: String
- `status`: String ("Abierto", "Resuelto")
- `solution_accepted_id`: String (Ref: sos_comments)
- `ai_analysis`: Map { `is_offensive`, `quality_score` }

**`community_fault_reports`**
*Base de Datos de Consenso*
- `id`: String
- `brand`: String
- `model`: String
- `error_code`: String
- `symptoms`: String
- `fix_description`: String
- `confirmations`: Number (Count of unique techs confirming)
- `confirmed_by`: List<String> (User IDs)
- `is_public`: Boolean (True if confirmations >= 3)

**`store_products`**
*Catálogo Dual (Tokens y Real)*
- `id`: String
- `type`: String ("Physical_Money", "Digital_Token", "Booster")
- `name`: String
- `cost_tokens`: Number
- `price_mxn`: Number
- `stock`: Number
- `is_active`: Boolean

**`admin_rules`**
*Configuración Dinámica (Remote Config)*
- `token_earn_rules`: JSON map
- `btu_factors`: JSON map
- `consensus_threshold`: Number (Default: 3)
- `launch_boosters_enabled`: Boolean

---

## CAPÍTULO 5: LÓGICA BACKEND

1.  **Cloud Functions (Lógica de Negocio)**:
    -   `onServiceCreate`:
        -   **Trigger**: Nuevo documento en `services`.
        -   **Acciones**:
            1.  Copia resumen a `equipments/{id}/timeline` (Read-Optimized).
            2.  **Regla de Contacto**: Actualiza `equipments.last_service_tech_id` con el `uid` del técnico.
            3.  Calcula y asigna Tokens.
            4.  Incrementa contadores en `users.stats` (Servicios, QRs).
    -   `onUserCreate`: Crea perfil base y asigna balance inicial (0 tokens).
    -   `checkSosContent` (AI Guardrail):
        -   **Trigger**: Nuevo `sos_threads` o `sos_comments`.
        -   **Lógica**: Llama a Groq API.
        -   **Output**: Si `is_offensive` || `quality_score < 0.2` -> Rechaza/Flag. Si OK -> Publica.
    -   `onFaultReportCreate` (Motor de Consenso):
        -   **Trigger**: Nuevo reporte en `community_fault_reports`.
        -   **Lógica**: Busca coincidencias (Marca/Modelo/Error).
        -   **Consenso**: Si `confirmations >= 3` (de UIDs distintos) -> Marca `is_public = true` y libera reward grande a los 3 autores.
    -   `generatePdf`:
        -   **Input**: ID Servicio o ID Cotización.
        -   **Proceso**: Render server-side (Puppeteer), adjunta Branding del técnico.
        -   **Output**: URL firmada de Storage.
    -   `scraperUpdate`:
        -   **Cron**: Semanal (Domingos 3 AM).
        -   **Acción**: Scrapea sitios definidos, limpia outliers, actualiza `admin_rules.market_prices`.
    -   `processStoreTransaction`:
        -   **Input**: Compra de producto (Token o Real).
        -   **Lógica**:
            -   Si es "Boost": Activa `is_premium` = true y `subscription_end_date` = now + 7 days.
            -   Si es "Físico": Crea orden en `logistics_orders`.
            -   Descuenta tokens de `users.token_balance` (Atomic transaction).
2.  **Sincronización Offline (Estrategia Detallada)**:
    -   **Persistencia Local**: SQLite para búsquedas rápidas (Autocomplete).
    -   **Cola de Subida**: Background Job. Prioridad: Texto JSON > Imágenes.
    -   **Compresión**: Imágenes < 200KB antes de subir.
    -   **Conflict Resolution**:
        -   *Services*: Last-write-wins basado en timestamp cliente. Si conflicto ID, priorizar el que tenga más evidencia (fotos).
        -   *Tokens*: Siempre operaciones delta (+/-) idempotentes.

---

## CAPÍTULO 6: MARCO LEGAL Y BLINDAJE

### 6.1 Naturaleza
Bitácora de Aires Acondicionados Smart es una herramienta de referencia. **No certifica** ni garantiza instalaciones.

### 6.2 Responsabilidad
"El uso de cálculos y datos es responsabilidad exclusiva del usuario." (Aplica a todas las tools).

### 6.3 Protección de Datos (LFPDPPP)
-   **Minimización**: No nombres en Nube.
-   **Hashing**: Teléfonos ilegibles.
-   **ARCO**: Canal de soporte explícito.

### 6.4 Safe Harbor
Moderación AI + Reportes para contenido de usuarios (Foros).

---

## CAPÍTULO 7: EJECUCIÓN, ROADMAP Y RECURSOS

### 7.1 Fases de Lanzamiento
-   **Fase 0 (Preparación - 2 sem)**: Setup Firebase, Legal, Cuentas Store/Pagos.
-   **Fase 1 (MVP - 8-12 sem)**:
    -   CRM, QR Básico, Radar, Tools Free.
    -   **Seed Data**: Importación y Hashing de cartera de clientes existente "Bitácora de Aires Acondicionados Smart".
    -   Meta: Piloto 500 técnicos.
-   **Fase 2 (Monetización - 6-8 sem)**:
    -   Suscripción PRO (Stripe), Cotizador Pro (Wizard), PDF Pro, Tienda Etiquetas (MercadoPago).
-   **Fase 3 (Escalamiento)**: Refinamiento Scraper, Reporting.

### 7.2 Equipo Recomendado (MVP)
-   1 Tech Lead (Fullstack/Mobile).
-   2 Flutter Devs.
-   1 Backend Dev (Node/Python).
-   0.5 UX/UI Designer.
-   0.5 QA Engineer.

### 7.3 Estimación de Costos (Referencial)
-   **Desarrollo**: USD 35k - 70k (Variable según región).
-   **Infraestructura (Mensual)**: USD 200 - 2,000+ (Escala con uso de Storage/Functions).
-   **Marketing Inicial**: USD 3k - 10k.

---

## CAPÍTULO 8: CALIDAD Y OPERACIONES

-   **Métricas**: DAU/MAU, Conversión PRO, Tokens Burn Rate.
-   **SLA**: 99.9% Uptime.
-   **Testing**: Unitario (Cálculos), Integration (Auth/Pagos), E2E (Flujos críticos).

---

## CAPÍTULO 9: APÉNDICES

### APÉNDICE A: Reglas de Tokens (Default)
*(Ver detalle en Admin Rules)*

### APÉNDICE B: Cambios DB Históricos
*(Log de migraciones)*

### APÉNDICE C: TEXTOS LEGALES Y DISCLAIMERS (COMPLETO)

#### 1. TÉRMINOS Y CONDICIONES DE USO

**Aplicación BITÁCORA DE AIRES ACONDICIONADOS SMART**
*Última actualización: [Fecha]*

El presente documento establece los Términos y Condiciones de Uso que regulan el acceso y utilización de la aplicación móvil BITÁCORA DE AIRES ACONDICIONADOS SMART. Al registrarse, el usuario acepta expresamente estos Términos.

**1. Naturaleza de la Plataforma**
BITÁCORA DE AIRES ACONDICIONADOS SMART es una plataforma tecnológica de apoyo.
BITÁCORA DE AIRES ACONDICIONADOS SMART NO:
- Presta servicios de instalación o reparación.
- Emite certificaciones técnicas.
- Sustituye normas oficiales.
El usuario actúa bajo su exclusiva responsabilidad profesional.

**2. Comunidad**
El contenido es responsabilidad de quien lo genera. BITÁCORA DE AIRES ACONDICIONADOS SMART actúa como intermediario con mecanismos de moderación.

**3. Tokens**
- No son dinero.
- Son intransferibles y revocables.
- BITÁCORA DE AIRES ACONDICIONADOS SMART puede modificar reglas sin compensación.

**4. Limitación de Responsabilidad**
BITÁCORA DE AIRES ACONDICIONADOS SMART no será responsable por daños, pérdidas o fallas derivadas del uso de la App.

#### 2. AVISO DE PRIVACIDAD

**Responsable**: BITÁCORA DE AIRES ACONDICIONADOS SMART
**Datos Recabados**: Teléfono (Auth), Alias, Datos Técnicos.
**Tratamiento**:
- Autenticación.
- No se recaban nombres reales de clientes finales en texto plano en la nube.
**Derechos ARCO**: Solicitar al correo de contacto arco@tesivil.com.

#### 3. DISCLAIMER TÉCNICO (IN-APP)

**IMPORTANTE – LEA ANTES DE USAR**
Las herramientas (Calculadoras, Guías, Historial QR) son de referencia orientativa.

**Alcance**:
- Son estimaciones.
- No sustituyen criterio profesional ni normas.
- El usuario es responsable de validar condiciones reales.

**Historial QR**:
Refleja registros de terceros. No constituye certificación ni garantía por parte de Bitácora de Aires Acondicionados Smart.
