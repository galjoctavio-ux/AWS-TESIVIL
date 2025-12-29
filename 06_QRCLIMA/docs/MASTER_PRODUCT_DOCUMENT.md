# 📋 DOCUMENTO MAESTRO DE PRODUCTO — QRclima

**Versión:** 2.0  
**Fecha de Análisis:** 28 de Diciembre de 2025  
**Propósito:** Disección anatómica completa para Marketing, Copywriting y Ventas

---

## 📌 RESUMEN EJECUTIVO

**QRclima** es una aplicación móvil CRM + Herramientas diseñada para técnicos de aire acondicionado en México y LATAM. La app resuelve la gestión diaria del técnico, profesionaliza su servicio, y crea un ecosistema de confianza mediante códigos QR físicos.

### Pilares Fundamentales:
1. **Gestión Ultrarápida**: Registro de servicios en <30 segundos
2. **Viralidad Dual**: QRs que funcionan como historial para el cliente + canal de adquisición para nuevos técnicos
3. **Monetización Freemium**: Ads vs Suscripción PRO + Venta de Insumos
4. **Profesionalización**: Perfil profesional con gamificación y capacitación continua

---

## 📊 ANÁLISIS FUNCIONAL Y DE VALOR

### 🏠 MÓDULO 1: CORE (Supervivencia del Técnico)

| Función | Descripción Técnica | Beneficio de Marketing (Copy) | Free/Pro | Dolor que Resuelve |
|:--------|:--------------------|:------------------------------|:---------|:-------------------|
| **Dashboard Inteligente** | Centro de control con próximos servicios, accesos rápidos personalizables, y estadísticas en tiempo real | "Tu taller en la palma de tu mano. Abre la app y en 2 segundos sabes qué tienes pendiente" | FREE | Desorganización, no saber qué hacer primero, perder tiempo buscando información |
| **Registro de Servicios** | Alta de servicios en 30 segundos con tipos (Instalación/Mantenimiento/Reparación/Reinstalación), checklists, fotos, y notas | "Olvídate de la libreta. Un tap y tu trabajo queda registrado con evidencia" | FREE | No tener comprobantes, olvidar qué se hizo en cada trabajo, discusiones con clientes |
| **CRM de Clientes** | Base de datos privada de clientes con historial de servicios por cliente, búsqueda inteligente | "Tu Rolodex digital. Sabe exactamente cuándo fue la última vez que visitaste a Doña María" | FREE | No recordar datos de clientes, perder contactos, no tener historial accesible |
| **Scanner QR** | Escaneo de códigos QR para identificar equipos, crear nuevos, o iniciar servicio rápido | "Escanea, trabaja, cobra. Sin escribir nada. La app ya sabe de qué equipo se trata" | FREE | Confundir equipos de un mismo cliente, no tener historial del equipo específico |
| **Ecosistema QR (Bitácora Viva)** | Tokens únicos de 6 caracteres por equipo. URL pública (qrclima.mx/a/[TOKEN]) accesible sin app para el cliente | "Tu QR es tu tarjeta de presentación pegada en el equipo. El cliente escanea y te llama a TI" | FREE (QR digital) | Perder clientes ante competencia, no poder demostrar historial de servicio |
| **Regla "King of the Hill"** | El botón de contacto en la web pública siempre muestra al ÚLTIMO técnico que registró servicio | "Si otro técnico da servicio, su teléfono aparece. Registra tu servicio y el cliente te encuentra a TI" | FREE | Robo de clientes por competencia oportunista |

---

### 🧰 MÓDULO 2: HERRAMIENTAS TÉCNICAS (Utility Belt)

| Función | Descripción Técnica | Beneficio de Marketing (Copy) | Free/Pro | Dolor que Resuelve |
|:--------|:--------------------|:------------------------------|:---------|:-------------------|
| **Biblioteca de Errores (Offline)** | Base de datos SQLite local con 67+ modelos y cientos de códigos de error. Búsqueda por marca/modelo/código | "En la azotea sin internet? No importa. Busca el error E6 y la solución aparece en 3 segundos" | FREE (Básico) | Tener que buscar en Google, no tener manuales a la mano, depender de internet |
| **Códigos Premium (VRF/Industrial)** | Acceso a códigos de error de marcas comerciales (LG VRF, York Paquete, Carrier Industrial) | "Los manuales industriales que nadie tiene. Exclusivo para técnicos PRO" | **PRO** | No saber diagnosticar equipos comerciales de alta gama |
| **Calculadora BTU Free** | Estimación rápida de carga térmica con: Largo x Ancho x Zona Climática | "Calcula en 10 segundos qué tonelaje necesita el cliente. Dale seguridad de que sabes lo que haces" | FREE (Con marca de agua) | No saber qué equipo recomendarle al cliente, perder ventas por inseguridad |
| **Calculadora BTU PRO** | Cálculo profesional con: paredes, ventanas, orientación, cargas internas, techo, infiltración + PDF exportable | "Genera un análisis térmico profesional que justifica por qué el cliente necesita 2 toneladas, no 1.5" | **PRO** | No poder justificar un equipo más caro, perder la venta o dar el equipo equivocado |
| **Guía de Cables Eléctricos** | Matriz de decisión: Voltaje + Tonelaje + Distancia → Cable AWG + Pastilla recomendada según NOM-001 | "Nunca más 'creo que es el 12'. La guía te dice exacto qué poner sin arriesgar el equipo" | FREE | Usar el cable incorrecto, viajes de pastilla, reclamaciones de garantía, riesgo eléctrico |
| **Tabla P-T (Presión-Temperatura)** | Slider dinámico con rangos PSI por temperatura ambiente para gases R410A, R32, R22 | "Cargar gas ya no es adivinanza. Ajusta la temperatura y ves exactamente qué presión debes tener" | FREE | Sobrecarga o subcarga de gas, equipos que no enfrían, desgaste prematuro del compresor |
| **Modo Diagnóstico Mirage** | Guía paso a paso del modo TEST para equipos Mirage Inverter (control tipo B) con visualización de parámetros | "El secreto que solo los mejores técnicos conocen. Entra al modo TEST de Mirage como un experto" | **PRO** | No saber usar el modo diagnóstico, depender de otro técnico para fallas complejas |
| **Radar de Precios (Supabase)** | Dashboard de inteligencia de mercado: Tendencias, búsqueda de productos, gangas detectadas, conectado a Supabase en tiempo real | "Sabe cuánto cuesta el R410A HOY antes de cotizar. Nunca más pierdas dinero por precios desactualizados" | **PRO** | Cotizar con precios viejos, perder margen de ganancia, no saber dónde comprar más barato |
| **Generador de Etiquetas QR** | Genera PDF con etiquetas QR para imprimir. QR gratuito (papel) vs QR profesional (resistente UV/agua) | "Imprime tus etiquetas y pégalas en cada equipo. El cliente te encuentra cuando te necesita" | FREE (PDF) / PRO (Físico) | No tener etiquetas, perder la oportunidad de ser contactado para futuros servicios |

---

### 💰 MÓDULO 3: MONETIZACIÓN (Cotizador y PRO Features)

| Función | Descripción Técnica | Beneficio de Marketing (Copy) | Free/Pro | Dolor que Resuelve |
|:--------|:--------------------|:------------------------------|:---------|:-------------------|
| **Cotizador Free** | Sistema de conceptos personalizados MO/MT con códigos únicos ([UID]-MO-001), guardado de cotizaciones | "Crea cotizaciones con TUS propios precios. Agrega conceptos y úsalos una y otra vez" | FREE (Con marca de agua QRclima) | Hacer cotizaciones en papel o WhatsApp, verse poco profesional, perder tiempo rehaciendo |
| **Cotizador PRO** | 3 rutas (Instalación/Preventivo/Correctivo), base de 174+ insumos con precios de mercado, adicionales drill-down | "El cotizador que piensa como tú. Sabe que si vendes 3 metros de tubo, el rollo sigue siendo tuyo" | **PRO** | No incluir todos los conceptos, olvidar materiales, perder dinero por mala cotización |
| **Factor de Stock** | Aplica markup automático a materiales fraccionables (tubería/cable) vendidos por metro vs rollo completo | "El secreto del margen: si compras rollo de 15m y vendes 3m, el precio por metro sube 20%" | **PRO** | Capital parado en inventario, no recuperar la inversión, margen insuficiente |
| **Sugerencias Inteligentes** | El sistema sugiere conceptos basados en el tipo de servicio y tonelaje | "Elige Instalación 2 Ton y aparecen automáticamente los materiales que necesitas agregar" | **PRO** | Olvidar conceptos importantes, cotizaciones incompletas |
| **PDF de Cotización Profesional** | Exportación con logo personalizado, colores de marca, desglose detallado, vigencia dinámica | "Tu cotización se ve como la de una empresa grande. El cliente confía más y paga sin regatear" | **PRO** (Logo personalizado) | PDFs genéricos que no generan confianza, cotizaciones que no cierran |
| **PDF de Reporte de Servicio** | Documento formal con datos del equipo, trabajo realizado, checklist, fotos, firma del cliente | "Entrega un reporte que el cliente puede enseñar a su jefe. Profesionalismo = más referidos" | FREE (Con marca QRclima) / **PRO** (Sin marca + logo) | No tener comprobantes formales, discusiones sobre qué se hizo |
| **Créditos PDF Premium** | Sistema de desbloqueo por unidad: compra créditos para generar PDFs sin marca de agua | "No quieres suscripción? Compra 10 PDFs premium por $X y úsalos cuando los necesites" | **PAGO ÚNICO** | No querer pagar suscripción mensual pero necesitar PDFs profesionales ocasionalmente |

---

### 📅 MÓDULO 4: AGENDA Y LOGÍSTICA

| Función | Descripción Técnica | Beneficio de Marketing (Copy) | Free/Pro | Dolor que Resuelve |
|:--------|:--------------------|:------------------------------|:---------|:-------------------|
| **Calendario Visual** | Vista de día/3 días/semana con eventos codificados por color según tipo de servicio | "Tu agenda como la de un doctor. De un vistazo sabes qué tienes toda la semana" | FREE | Olvidar citas, no planificar bien el día, llegar tarde por desorganización |
| **Acciones Rápidas en Citas** | Desde la tarjeta del evento: Llamar, WhatsApp, Navegar, Iniciar Trabajo | "Un tap y estás llamando al cliente. Otro tap y Waze te lleva. Cero fricción" | FREE | Perder tiempo buscando teléfonos y direcciones |
| **Distancia entre Agendas (Haversine)** | Calcula distancia lineal entre ubicación base → cliente o entre citas consecutivas | "Sabe que la siguiente cita está a 8km. Planifica mejor tu ruta y ahorra gasolina" | FREE (Distancia lineal) | No saber cuánto hay que manejar, mala planeación de rutas |
| **Distancia con Tráfico (Google Directions)** | API de Google que muestra tiempo estimado de llegada considerando tráfico en tiempo real | "No solo distancia: sabe que hay embotellamiento y te dice que salgas 20 min antes" | **PRO** | Llegar tarde por tráfico inesperado, perder citas por mala estimación |
| **Recordatorios PRO** | Sistema de notificaciones push para mantenimientos programados (basado en fecha de último servicio + 6 meses) | "La app le recuerda al cliente que ya toca mantenimiento. Tú solo recibes la llamada" | **PRO** | Perder clientes recurrentes por no darles seguimiento, depender de que el cliente recuerde |
| **Silencio Nocturno** | Las notificaciones se pausan de 10pm a 8am automáticamente | "Descansa tranquilo. La app no te despierta a las 3am por un recordatorio" | FREE | Notificaciones molestas en la noche |
| **Wizard de Alta de Cita** | Flujo guiado: Cliente → Tipo → Fecha/Hora → Ubicación con mapa → Confirmar | "Agendar una cita en menos de 30 segundos. Sin formularios complicados" | FREE | Formularios largos que nadie llena, citas sin información completa |

---

### 👥 MÓDULO 5: COMUNIDAD Y APRENDIZAJE

| Función | Descripción Técnica | Beneficio de Marketing (Copy) | Free/Pro | Dolor que Resuelve |
|:--------|:--------------------|:------------------------------|:---------|:-------------------|
| **Comunidad SOS** | Foro técnico con hilos, comentarios, moderación IA (Groq), sistema de "Solución Aceptada" | "Un grupo de técnicos que SÍ ayudan. Pregunta sobre ese error raro y alguien que ya lo resolvió te contesta" | FREE | Estar solo frente a fallas difíciles, no tener a quién preguntar, perder horas en Google |
| **Moderación IA (Groq)** | Filtro automático que bloquea spam, groserías, contenido sin valor técnico | "Sin memes, sin política, sin spam. Solo preguntas técnicas y respuestas útiles" | FREE | Foros llenos de ruido donde nadie ayuda |
| **Regla de Calidad** | Si el texto es "Ayuda no sirve", la IA rechaza y pide: "Por favor detalla qué pruebas has hecho" | "Enseña a preguntar bien. Mejor pregunta = Mejor respuesta" | FREE | Preguntas tan vagas que nadie puede responder |
| **"Pin" de Caso SOS** | Paga 50 tokens para fijar tu pregunta al inicio del feed por 24 horas | "Necesitas respuesta urgente? Paga con tokens para que todos vean tu caso primero" | **PRO** (50 tokens) | Tu pregunta se pierde entre otras, nadie la ve |
| **Capacitación LMS** | 40 cursos organizados en 8 bloques con contenido técnico, quizzes de 5 preguntas, tokens por aprobar | "Aprende cosas que no te enseñaron en la escuela y gana tokens por hacerlo" | FREE | Estancamiento profesional, no saber temas nuevos como Inverter o VRF |
| **Quizzes con Cooldown** | Debes scrollear al final del contenido antes de poder tomar el quiz. 1 hora de espera si repruebas | "No puedes hacer trampa. Lee el contenido y demuestra que aprendiste" | FREE | Gente que solo quiere los tokens sin aprender |
| **Tokens por Capacitación** | Gana 20-100 tokens por aprobar un quiz dependiendo de la dificultad | "Estudia hoy, canjea mañana. Convierte tu conocimiento en recompensas" | FREE | No hay incentivo para seguir aprendiendo |

---

### 🪙 MÓDULO 6: GAMIFICACIÓN (Economía de Tokens)

| Función | Descripción Técnica | Beneficio de Marketing (Copy) | Free/Pro | Dolor que Resuelve |
|:--------|:--------------------|:------------------------------|:---------|:-------------------|
| **Billetera de Tokens** | Dashboard con saldo actual, historial de transacciones tipo banco, nivel del usuario | "Tu cuenta de puntos. Gana por trabajar, gasta en lo que necesitas" | FREE | No tener sistema de recompensas, solo trabajar sin beneficios extras |
| **Reglas de Emisión** | +10 por servicio (máx 6/día), +20 por crear SOS (máx 1/día), +50 por solución aceptada (ilimitado), +100 por perfil completo (única vez), +15 por vincular QR (máx 10/día) | "Entre más usas la app, más ganas. Registra servicios, ayuda a otros, completa tu perfil" | FREE | No saber cómo ganar puntos, sistema confuso |
| **Anti-Fraude "El Sheriff"** | Bloqueo de tokens si: 2 servicios en <15 min, misma ubicación para clientes diferentes, texto basura ("asdasd") | "No se puede hacer trampa. El sistema detecta comportamiento sospechoso" | N/A (Backend) | Usuarios abusando del sistema, inflación de tokens |
| **Tienda de Canje** | Productos digitales (Semana PRO, PDFs Premium) y próximamente físicos (QRs, herramientas) canjeables con tokens | "Convierte tus tokens en días PRO gratis o PDFs sin marca de agua" | FREE (Canjear) | Tokens sin uso, sistema de puntos que no sirve para nada |
| **Boost "Semana PRO"** | Canjea 500 tokens por 7 días de suscripción PRO | "No tienes para la suscripción? Gana tokens y canjéalos por una semana completa de PRO" | **TOKENS** | No poder pagar suscripción mensual |
| **PDF Unlock** | Canjea 100 tokens por 1 PDF sin marca de agua | "Genera un PDF profesional sin pagar suscripción. Solo cuando lo necesites" | **TOKENS** | Necesitar PDF profesional ocasionalmente sin suscripción |

---

### 👤 MÓDULO 7: PERFIL Y PROFESIONALIZACIÓN

| Función | Descripción Técnica | Beneficio de Marketing (Copy) | Free/Pro | Dolor que Resuelve |
|:--------|:--------------------|:------------------------------|:---------|:-------------------|
| **Perfil Profesional** | Tarjeta con foto, alias, rango (Novato/Técnico/Experto), stats de carrera (servicios, QRs, tokens) | "Tu tarjeta de presentación digital. Muestra tu experiencia con números reales" | FREE | No tener forma de demostrar experiencia, solo palabra |
| **Guía de Completitud** | 17 criterios organizados en: Datos (30%), Configuración (20%), Logros (50%). Barra de progreso visual | "Sigue los pasos y llega al 100%. Es como un tutorial pero para tu carrera" | FREE | Perfiles incompletos, usuarios que no saben qué configurar |
| **Recompensa 100%** | Al llegar al 100% de completitud, se activan 3 días PRO gratis automáticamente | "Completa tu perfil y gana 3 días de PRO gratis. Sin pagar nada" | FREE → **PRO** (3 días) | No hay incentivo para completar el perfil |
| **Firma Digital** | Canvas para dibujar firma táctil que aparece en reportes y cotizaciones | "Tu firma como si fuera en papel. Cierra el servicio con tu rúbrica digital" | FREE | PDFs sin firma, menos formalidad |
| **Branding Personalizado** | Sube logo, elige colores primario/secundario, agrega texto de pie de página para tus PDFs | "Tus cotizaciones y reportes con TU marca. El cliente ve 'Juan's AC', no 'Técnico genérico'" | FREE (Básico) / **PRO** (Sin watermark QRclima) | PDFs que no representan tu negocio, marca invisible |
| **Ubicación Base** | Configura tu punto de partida (casa/taller) para cálculo de distancias | "Dile a la app desde dónde sales y calcula rutas más inteligentes" | FREE | Distancias calculadas desde punto incorrecto |
| **App de Navegación Preferida** | Elige entre Google Maps, Waze o Apple Maps para abrir direcciones | "Abre direcciones en Waze si es tu favorita. Sin preguntar cada vez" | FREE | Abrir la app incorrecta, perder tiempo eligiendo |
| **Sistema de Rangos** | Novato (<2 años), Técnico (2-5 años), Experto (>5 años) basado en experiencia declarada | "Tu nivel se ve en la comunidad. Los expertos son más respetados y sus respuestas destacan" | FREE | Todos se ven igual, los novatos no saben a quién hacerle caso |
| **Insignias/Badges** | Logros visuales: Primer QR, Primer Cliente, Primera Agenda, Caso SOS Resuelto, Curso Completado | "Colecciona insignias por usar la app. Muéstralas con orgullo" | FREE | Usar la app se siente monótono, sin logros visibles |
| **Academia con IA (Lista de Espera)** | Componente de lead capture para curso intensivo de 50 horas con IA. Email + WhatsApp | "Aprende HVAC en 50 horas laborales con ayuda de Inteligencia Artificial" | **PRÓXIMAMENTE** | No hay cursos intensivos accesibles, formación costosa y lenta |

---

### 🏪 MÓDULO 8: TIENDA Y SUSCRIPCIÓN

| Función | Descripción Técnica | Beneficio de Marketing (Copy) | Free/Pro | Dolor que Resuelve |
|:--------|:--------------------|:------------------------------|:---------|:-------------------|
| **Suscripción PRO** | $99 MXN/mes. Acceso completo a todas las funciones PRO | "Todo por menos del precio de una hamburguesa a la semana. Tu trabajo vale más" | **PRO** | Limitaciones en versión gratuita que frenan el crecimiento |
| **Trial 7 Días** | Prueba gratis automática para nuevos registros | "Prueba todo durante 7 días. Si no te sirve, no pagas nada" | **TRIAL** | Miedo a pagar sin saber si vale la pena |
| **Verificación de Expiración** | Doble validación: tipo de suscripción + fecha de expiración para acceso PRO | "Cuando expira, se desactiva automáticamente. Sin cargos sorpresa" | N/A (Backend) | Acceso que no expira, pérdida de ingresos |
| **Tienda de Tokens** | Catálogo de productos digitales canjeables: Semana PRO (500 tokens), PDF Unlock (100 tokens) | "Tu esfuerzo vale. Canjea lo que ganaste por herramientas PRO" | **TOKENS** | Tokens acumulados sin uso |
| **Tienda MXN (Próximamente)** | Productos físicos pagados en pesos: Packs de QRs profesionales (20/50/100 unidades) | "Etiquetas que no se despegan, no se despintan, y duran años. Profesionalismo en cada equipo" | **PRÓXIMAMENTE** | Etiquetas impresas en casa que se borran con el sol |

---

## 🎯 ANÁLISIS DE MONETIZACIÓN Y CONVERSIÓN

### Barreras de Pago (Paywalls) Identificadas:

| Punto de Paywall | Trigger de Conversión | Fricción |
|:-----------------|:----------------------|:---------|
| **Calculadora BTU PRO** | Al intentar generar PDF con análisis detallado | Baja - El usuario ya invirtió tiempo llenando datos |
| **Cotizador PRO** | Al querer agregar conceptos de la base de datos inteligente | Media - Puede usar Cotizador Free pero es menos potente |
| **PDF sin marca de agua** | Al compartir cotización/reporte con cliente | **ALTA** - El cliente ve "QRclima" y se ve menos profesional |
| **Radar de Precios** | Al buscar precios de mercado antes de cotizar | Media - Puede consultar precios manualmente |
| **Distancia con Tráfico** | Al ver el action sheet de una cita | Baja - Funciona sin eso, pero es muy útil |
| **Recordatorios Automáticos** | Al querer programar notificación de mantenimiento | Media - Puede anotar manualmente pero se olvida |
| **Códigos Error Premium** | Al buscar código de error de marca industrial | Baja - Solo afecta a técnicos de equipos comerciales |
| **Modo Diagnóstico Mirage** | Al querer acceder a guía de modo TEST | Baja - Solo afecta a técnicos de Mirage |

### Evaluación de Propuesta de Valor PRO:

✅ **$99 MXN/mes JUSTIFICADO** porque:
- Un solo PDF profesional puede cerrar una cotización de $50,000+ MXN
- El radar de precios evita perder margen en una sola venta (ahorro potencial: $500-2000/mes)
- Los recordatorios automáticos recuperan clientes recurrentes (valor: $5,000-15,000/año por cliente)
- El ahorro de tiempo con el cotizador inteligente = 2-3 horas/semana

---

## 🚀 UNIQUE SELLING PROPOSITIONS (USPs)

### Los 5 Diferenciadores Clave vs Excel/Competencia:

1. **🔗 Ecosistema QR "Bitácora Viva"**
   > "El QR que pegas en el equipo es tu activo más valioso. El cliente escanea, ve el historial, y te llama a TI (no a Google)."
   - **Competencia no tiene**: Ningún CRM genérico conecta físico + digital con QR
   - **Excel no puede**: No genera QRs ni tiene vista web pública

2. **📡 Biblioteca de Errores OFFLINE**
   > "En la azotea sin señal, esta app sigue funcionando. Busca el código de error y la solución está ahí."
   - **Competencia no tiene**: Dependen de internet
   - **Excel no puede**: No tiene base de datos de errores

3. **💰 Cotizador que Entiende el Negocio**
   > "Sabe que el rollo de cobre tiene 15.2 metros y que si vendes 3, los otros 12 están parados. El factor de stock lo calcula solo."
   - **Competencia no tiene**: Precios estáticos sin lógica de inventario
   - **Excel puede pero**: Requiere fórmulas complejas que nadie hace

4. **👥 Comunidad Curada con IA**
   > "Un foro donde solo hay técnicos que quieren ayudar. La IA bloquea el ruido. Las respuestas útiles ganan tokens."
   - **Competencia no tiene**: Foros genéricos llenos de spam
   - **Excel no puede**: No es social

5. **🎮 Gamificación que Paga**
   > "Registra un servicio: +10 tokens. Ayuda a otro técnico: +50 tokens. Canjea 500 tokens por una semana PRO. Tu trabajo vale."
   - **Competencia no tiene**: Sin sistema de recompensas
   - **Excel no puede**: No gamifica nada

---

## 📈 RECOMENDACIONES ESTRATÉGICAS

### Para Marketing:
1. **Copy principal**: "La app que los técnicos SÍ usan porque SÍ funciona"
2. **Hook de adquisición**: "Escanea el QR de cualquier aire y descarga la app. Es gratis"
3. **Trigger viral**: Los QRs físicos son el caballo de Troya. Cada equipo etiquetado es un anuncio permanente

### Para Ventas:
1. **Objeción "Es muy caro"**: "Con UN solo PDF profesional que cierre una venta, ya pagaste el año"
2. **Objeción "Ya uso Excel"**: "¿Tu Excel te recuerda cuándo llamar al cliente? ¿Te muestra cuánto cuesta el R410A hoy?"
3. **Trial extendido**: Ofrecer 14 días a leads calificados de la lista de espera

### Para Producto:
1. **Quick Win**: Mover "Recordatorios" a FREE con límite de 5/mes para enganchar
2. **Upsell natural**: Al 100% de perfil, mostrar popup: "Ganaste 3 días PRO. Activa la suscripción y no los pierdas"
3. **Viralidad**: Cada QR debe tener botón "¿Eres técnico? Descarga la app" visible en vista pública

---

## 🔢 RESUMEN NUMÉRICO

| Métrica | Cantidad |
|:--------|:---------|
| **Funciones FREE** | 32 |
| **Funciones PRO** | 13 |
| **Módulos principales** | 8 |
| **Servicios backend** | 17 |
| **Cursos de capacitación** | 40 |
| **Modelos en biblioteca de errores** | 67+ |
| **Insumos en cotizador** | 174 |
| **Precio suscripción PRO** | $99 MXN/mes |

---

*Documento generado por análisis de código fuente de QRclima v1.0.0*
