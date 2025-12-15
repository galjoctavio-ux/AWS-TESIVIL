# DOCUMENTO MAESTRO FINAL — APP “BITÁCORA AIRE ACONDICIONADO SMART” (Bitácora AC)

**Versión:** 1.0 (INICIAL)
**Fecha:** 14 de Diciembre de 2025
**Propósito:** Especificación técnica completa para desarrollo MVP. Incluye arquitectura, reglas de negocio, esquema de datos, marco legal y roadmap.

---

## CAPÍTULO 1: VISIÓN Y ALCANCE

### 1.1 Resumen Ejecutivo
“Mr. Frío” es una aplicación móvil (CRM + Herramientas) para técnicos de aire acondicionado que resuelve la gestión diaria, profesionaliza el servicio y crea un ecosistema de confianza mediante QRs.
**Pilares:**
1.  **Gestión**: Registro de servicios ultrarápido (<30s).
2.  **Viralidad**: Etiquetas QR que vinculan equipos y generan historial.
3.  **Monetización**: Modelo Freemium (Ads vs Suscripción PRO) + Venta de Insumos (Etiquetas).
4.  **Comunidad**: Gamificación con Tokens y soporte técnico validado.

### 1.2 Objetivos del Producto
- **Operativo**: Digitalizar la bitácora del técnico (adiós libreta).
- **Comercial**: Convertir técnicos a usuarios PRO mediante herramientas de valor (Cotizador, PDF, Analítica).
- **Gremial**: Crear un "Radar" de reputación ciega para protección mutua.

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
    -   **Nombre Real (Privado)**: Facturación/Interno. *Opcional: Nombre de Empresa*.
    -   **Alias Público (Único)**: Visible en QRs y Comunidad (ej. "FrioTec2024").
    -   **Ciudad Base**: Para calibrar clima default en BTU y precios.
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
        -   **Autocompletado**: Solo busca en **DB Local** (SQLite) del dispositivo. Si existe, llena nombre. Si no, campos en blanco. **NUNCA** descarga nombres de la nube.

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
5.  **Cierre**: Fotos (Opcionales, comprimidas), Notas, Próximo Servicio (auto +1 año si Instalación).

### 3.2 Módulo Radar de Clientes (Acceso Independiente)
**Ubicación UX**: Botón dedicado "Radar 🛡️" en el Home (además de los accesos contextuales).
**Objetivo**: Reputación colaborativa "Ciega".
**Mecánica**:
-   **Input**: Técnico ingresa teléfono (se aplica Hash SHA-256), Calificación (Estrellas) y Notas (Tags precargados) para alimentar la BD Global.
-   **Output**: Buscador consulta BD Global. Si hay coincidencia (Blind Match), devuelve métricas: Estrellas, Conteo de Reportes y Comentarios/Tags precargados. **Cero PII**.
**Sistema de Etiquetas (UI)**:
-   **Orden Dinámico**:
    -   4-5 Estrellas -> Muestra primero Etiquetas **VERDES**.
    -   1-3 Estrellas -> Muestra primero Etiquetas **ROJAS/AMARILLAS**.
    -   Límite: 3 tags/reporte.
-   **Taxonomía**:
    -   🟢 **Positivas**: [Pago Puntual], [Trato Amable], [Hospitalario], [Buena Propina], [Respeta Tiempos].
    -   🔴 **Negativas**: [Pago Tardío], [Regatea Mucho], [No Pagó Completo], [Actitud Grosera], [Exige Garantías Falsas].
    -   🟡 **Operativas**: [Acceso Complicado], [Supervisa en Exceso], [No Respetó Cita], [Zona de Riesgo].

### 3.3 Módulo 2: Cotizador Pro (Premium)  

1.  **Configuración Inicial (Wizard)**:
    -   **Identidad**: Carga de Logotipo y selección de colores para el PDF.
    -   **Config (Wizard de Calibración)**:
    -   Pregunta 1: "¿Cuál es tu costo de Mano de Obra Base?".
    -   Pregunta 2 (Referencia Exacta): "¿A cuánto compras hoy **1 rollo de tubo flexible de cobre de 1/2" de 15.2m**?".
    -   Pregunta 3 (Referencia Exacta): "¿A cuánto compras hoy un minisplit **Inverter marca Mirage 1 ton solo frío 110v**?".
    -   *Lógica*: El sistema compara estos valores contra su base de datos (Scraper) para hallar el "Factor de Realidad Local" del técnico y ajustar todos los precios automáticamente.
    -   **Mano de Obra (Defaults Sugeridos)**:
        -   1 Ton: $2,000
        -   1.5 Ton: $2,200
        -   2 Ton: $2,400
        -   3 Ton: $3,000
        -   *Nota*: El técnico puede sobrescribir estos valores.
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
**Ubicación y Funcionalidad Dual**:
-   **Acceso**: Botón flotante central "Escanear" o desde Menú Principal.
-   **Modos**:
    1.  **Crear Caso**: Al escanear en proceso de servicio -> Abre formulario de nuevo servicio vinculado.
    2.  **Ver Historial**: Al escanear en consulta -> Muestra timeline de mantenimientos.
**Reglas de Integridad**:
1.  **Escaneo QR Virgen**: Permite registrar Marca/Modelo -> Se "casa" con el ID.
2.  **Escaneo QR Existente**: Autocompleta Marca/Modelo y **BLOQUEA** los campos (Read-Only).
3.  **Error de Identidad**: Si técnico intenta cambiar marca de un QR ya registrado -> Error Bloqueante ("Use etiqueta nueva").
4.  **Inmutabilidad**: Prohibido reciclar etiquetas. Un QR = Un Activo físico.
**Privacidad**:
-   Historial muestra: Fecha, Servicio, Rango del Técnico.
-   **NUNCA** muestra: Nombre, Teléfono o Empresa del técnico anterior.

### 3.5 Módulo 4: Herramientas Técnicas (Free)
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
    -   **Output**: Presión de succión ideal (PSI). $agrega esta info: R-410A (orientativo)

25 °C: ~105 – 125 psig (≈ 7.2 – 8.6 bar). 
FSW
+1

30 °C: ~110 – 130 psig (≈ 7.6 – 9.0 bar). 
FSW

35 °C: ~115 – 135 psig (≈ 7.9 – 9.3 bar). 
Refrigerants Center, inc

40 °C: ~120 – 145 psig (≈ 8.3 – 10.0 bar). 
Royal Refrigerants

R-32 (orientativo — suele comportarse parecido a R-410A)

25 °C: ~105 – 130 psig (≈ 7.2 – 9.0 bar).

30 °C: ~110 – 135 psig (≈ 7.6 – 9.3 bar).

35 °C: ~115 – 140 psig (≈ 7.9 – 9.6 bar).

40 °C: ~120 – 150 psig (≈ 8.3 – 10.3 bar).
(Fuentes técnicas y resúmenes prácticos muestran que R-32 opera en rangos similares a R-410A; confirmar con PT chart). 
Ace Services
+1

R-22 (orientativo — presiones sensiblemente menores)

25 °C: ~50 – 70 psig (≈ 3.4 – 4.8 bar).

30 °C: ~55 – 75 psig (≈ 3.8 – 5.2 bar).

35 °C: ~60 – 80 psig (≈ 4.1 – 5.5 bar).

40 °C: ~65 – 90 psig (≈ 4.5 – 6.2 bar).$
-   **Biblioteca de Errores**: Buscador offline (Marca + Código = Diagnóstico). $este es un modulo independiente con los siguientes valores$

### 3.6 Módulo 5: Comunidad SOS
**Objetivo**: Resolución de problemas en campo y Gamificación.
**Flujo**:
1.  **Crear Hilo (SOS)**:
    -   Requiere: Foto del error/equipo, Marca, Modelo y Descripción del problema.
    -   Costo: Gratis (o pequeña quema de tokens si hay abuso).
    -   **Filtro IA**: Groq analiza texto/imagen para evitar contenido ofensivo o spam antes de publicar.
2.  **Respuestas**:
    -   Técnicos responden. El autor marca una como "Solución".
    -   **Recompensa**: Autor gana puntos por cerrar el caso. Respondedor (Solución) gana **50 Tokens**.
3.  **Moderación**:
    -   Sistema de Reportes (Flag). Si un usuario acumula reportes -> Ban temporal automático.

### 3.7 Módulo 6: Calculadora BTU
-   **Versión Free**:
    -   Fórmula: `Área * Factor Zona`.
    -   **Factores**: Templada (600 BTU/m²), Cálida (700 BTU/m²), Muy Cálida (800 BTU/m²).
    -   Limitación: No guarda, marca de agua.
-   **Versión Pro (Análisis Térmico Completo)**:
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
**Definición Legal**: "Los Tokens NO son dinero, son instransferibles y revocables."
**Daily Caps (Anti-Granja)**:
| Acción | Ganancia | Límite Diario |
| :--- | :--- | :--- |
| Registrar Servicio | 10 | 6 |
| Reportar (Radar) | 15 | 5 |
| SOS | 20 | 1 |
| Respuesta Validada | 50 | ∞ |

**Protección Anti-Fraude**:
-   **Límites Diarios**: Los topes (caps) de tokens son **POR DÍA** (reset 00:00 local) para evitar granjas humanas.
-   **Bloqueo de Velocidad**: Si un usuario intenta registrar > 6 servicios en tiempos imposibles (ej. 1 hora) -> Flag de revisión.
-   **Geofencing**: Servicios idénticos (mismo GPS) en corto tiempo no generan tokens.

### 3.9 Módulo 8: Tienda de Etiquetas y Recompensas
**Objetivo**: Monetizar insumos y premiar lealtad.
1.  **Productos Físicos (Venta)**:
    -   *Paquetes de Etiquetas QR*: 20, 50, 100 piezas.
    -   Pago: MercadoPago/Stripe. Envío a domicilio.
2.  **Productos Digitales (Canje de Tokens)**:
    -   Días PRO, Plantillas PDF Premium, Boletos para Sorteos Mensuales.
3.  **Logística**:
    -   Panel Admin para marcar "Enviado" y subir guía de rastreo.

### 3.10 Módulo 9 (Admin): Panel de Gestión
-   **Dashboard**: KPIs de conversión, uso de tokens.
-   **Reglas Dinámicas**: Editar JSON de `token_earn_rules` y `btu_factors` sin deploy.
-   **Catálogo**: Gestión de Productos (Precio, Stock, Imagen).
-   **Sorteos**: Configuración de rifas (Fecha, Premio, Costo Ticket).
-   **Moderación**: Cola de reportes con Score de IA.
-   **Logs**: Auditoría inmutable de acciones administrativas.
---

## CAPÍTULO 4: ESQUEMA DE DATOS (FIRESTORE)

### Colecciones Clave

**`users`**
- `uid`, `alias`, `phone_hash`, `rank`, `token_balance`, `is_premium`.

**`services`**
- `id`, `user_id`, `client_hash` (blindado), `equipment_id`, `type`, `technical_details`, `tags`, `service_author_rank_at_time`.

**`equipments`**
```json
{
  "qr_hash": "String (ID)",
  "brand": "String",
  "model": "String",
  "install_date": "Timestamp",
  "last_service_date": "Timestamp"
}
```
**Regla de Seguridad (Inmutabilidad)**: `allow update: if false` para `brand`, `model`, `install_date`. Solo Admin puede corregir.

**`reputation_flags`**
```json
{
  "phone_hash": "SHA-256",
  "tags_summary": {
    "positive_payment": 15,
    "negative_attitude": 3,
    "hard_access": 1
  }
}
```

**`thermal_analysis`**, **`tokens_ledger`**, **`store_products`**, **`admin_rules`**, **`admin_logs`**.

---

## CAPÍTULO 5: LÓGICA BACKEND

1.  **Cloud Functions**:
    -   `onServiceCreate`: Actualiza `equipments.timeline`, calcula tokens, actualiza Radar.
    -   `onUserCreate`: Hashear teléfono, Seed Profile.
    -   `generatePdf`: Render server-side (Puppeteer/PDFKit).
    -   `scraperUpdate`: Cron semanal para precios base.
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
Mr. Frío es una herramienta de referencia. **No certifica** ni garantiza instalaciones.

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
    -   **Seed Data**: Importación y Hashing de cartera de clientes existente "Mr. Frío".
    -   Meta: Piloto 500 técnicos.
-   **Fase 2 (Monetización - 6-8 sem)**:
    -   Suscripción PRO (Stripe), Cotizador Pro (Wizard), PDF Pro, Tienda Etiquetas (MercadoPago).
-   **Fase 3 (Escalamiento)**: Refinamiento Scraper, Reporting, Sorteos.

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

**Aplicación MR. FRÍO**
*Última actualización: [Fecha]*

El presente documento establece los Términos y Condiciones de Uso que regulan el acceso y utilización de la aplicación móvil MR. FRÍO. Al registrarse, el usuario acepta expresamente estos Términos.

**1. Naturaleza de la Plataforma**
MR. FRÍO es una plataforma tecnológica de apoyo.
MR. FRÍO NO:
- Presta servicios de instalación o reparación.
- Emite certificaciones técnicas.
- Sustituye normas oficiales.
El usuario actúa bajo su exclusiva responsabilidad profesional.

**2. Radar de Clientes**
Muestra indicadores estadísticos agregados.
- No constituye listas negras.
- No garantiza exactitud.
- MR. FRÍO no asume responsabilidad por decisiones basadas en este Radar.

**3. Comunidad**
El contenido es responsabilidad de quien lo genera. MR. FRÍO actúa como intermediario con mecanismos de moderación.

**4. Tokens**
- No son dinero.
- Son intransferibles y revocables.
- MR. FRÍO puede modificar reglas sin compensación.

**5. Limitación de Responsabilidad**
MR. FRÍO no será responsable por daños, pérdidas o fallas derivadas del uso de la App.

#### 2. AVISO DE PRIVACIDAD

**Responsable**: MR. FRÍO
**Datos Recabados**: Teléfono (Auth), Alias, Datos Técnicos.
**Tratamiento**:
- Autenticación y Radar (Hash irreversible).
- No se recaban nombres reales de clientes finales en texto plano en la nube.
**Derechos ARCO**: Solicitar al correo de contacto.

#### 3. DISCLAIMER TÉCNICO (IN-APP)

**IMPORTANTE – LEA ANTES DE USAR**
Las herramientas (Calculadoras, Guías, Historial QR) son de referencia orientativa.

**Alcance**:
- Son estimaciones.
- No sustituyen criterio profesional ni normas.
- El usuario es responsable de validar condiciones reales.

**Historial QR**:
Refleja registros de terceros. No constituye certificación ni garantía por parte de Mr. Frío.
