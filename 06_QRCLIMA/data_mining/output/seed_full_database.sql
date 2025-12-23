-- SEEDER MAESTRO: MIRAGE + CARRIER + YORK --
-- Generado automáticamente --

BEGIN;
INSERT INTO air_conditioner_models (id, name, reference_id, image_url, logo_url, type, created_at) VALUES (1, 'ABSOLUTV', 'absolutv', '/images/equipos/absolutv.png', '/images/logos/absolutv.png', '', NOW()) ON CONFLICT (id) DO NOTHING;
INSERT INTO error_codes (model_id, code, description, solution, created_at) VALUES (1, 'E2', '• Corto o circuito abierto en sensor de aire', '• Medir el sensor de aire del evaporador
• Revisar falso contacto', NOW());
INSERT INTO error_codes (model_id, code, description, solution, created_at) VALUES (1, 'E3', '• Corto o circuito abierto en sensor de tubería (pozo) del evaporador', '• Medir sensor de tubería del evaporador.
• Revisar falso contacto', NOW());
INSERT INTO error_codes (model_id, code, description, solution, created_at) VALUES (1, 'E4', '• Anormalidad en el condensador', '• Verificar corriente del compresor y estado del capacitor
• Verificar presiones de alta y baja, aspa, motor
• Verificar obstrucciones en el serpentín', NOW());
INSERT INTO error_codes (model_id, code, description, solution, created_at) VALUES (1, 'E5', '• Velocidad del motor evaporador menor a 200 RPM por más de 5 segundos', '"• Motor o turbina obstruida
• Capacitor en mal estado
• Sensor de velocidad dañado o desconectado.', NOW());
INSERT INTO error_codes (model_id, code, description, solution, created_at) VALUES (1, 'E6', '• Falla en tarjeta principal', '• Reemplace la tarjeta', NOW());
INSERT INTO error_codes (model_id, code, description, solution, created_at) VALUES (1, 'E7', '• Falla de comunicación', '• Verificar cable de interconexión
• Bobinado del compresor
• Consumo de corriente anormal en el condensador', NOW());
INSERT INTO error_codes (model_id, code, description, solution, created_at) VALUES (1, 'E8', '• Temperatura anormal en el serpentín evaporador. Si esta en modo COOL puede ser congelamiento, si esta en modo HEAT sobrecalentamiento', '• Revisar espacio entre retorno y techo debe de haber 12 cm mínimo
• Evaporador o turbina sucia
• Termistor de aire o pozo fuera de rango
• Baja RPM en el motor del evaporador
• Exceso refrigerante', NOW());
INSERT INTO error_codes (model_id, code, description, solution, created_at) VALUES (1, 'dF', '• El equipo se encuentra en modo de descongelamiento o se ejecuta la función “Anti Cool Wave”.', '• Espere a que termine el ciclo de descongelamiento', NOW());
INSERT INTO air_conditioner_models (id, name, reference_id, image_url, logo_url, type, created_at) VALUES (2, 'ABTX', 'abtx', '/images/equipos/abtx.png', '/images/logos/abtx.png', '', NOW()) ON CONFLICT (id) DO NOTHING;
INSERT INTO error_codes (model_id, code, description, solution, created_at) VALUES (2, 'C5', '• Ausencia o daño del “jumper” o puente de configuración.', '• Coloque el JUMPER correspondiente en la tarjeta de control:
28*    12K    115V
30*    12K    220V
09*    18K
13*    24K', NOW());
INSERT INTO error_codes (model_id, code, description, solution, created_at) VALUES (2, 'E1', '• Protección de alta presión en el sistema', '• Baja velocidad del ventilador en la unidad exterior
• Bajo retorno de aire en la unidad interior o exterior
• Suciedad en serpentín en la unidad interior o la exterior
• El sistema de gas presenta un bloqueo por dobles o contaminación
• La tapa del condensador esta suelta y no circula el aire correctamente
• Verificar el correcto funcionamiento del sensor de alta presión', NOW());
INSERT INTO error_codes (model_id, code, description, solution, created_at) VALUES (2, 'E3', '• Protección de baja presión en el sistema', '• Revisar perdidas de gas en el sistema
• El sistema de gas presenta un bloqueo por dobles o contaminación
• La tapa del condensador esta suelta y no funciona el aire correctamente
• Verificar el correcto funcionamiento del sensor de baja presión', NOW());
INSERT INTO error_codes (model_id, code, description, solution, created_at) VALUES (2, 'E5', '• Corriente excesiva en el compresor ocurrida más de 4 veces continúas', '• Mida el capacitor del compresor
• Utilice kit de arranque de ser necesario
• Medir voltaje de línea', NOW());
INSERT INTO error_codes (model_id, code, description, solution, created_at) VALUES (2, 'E6', '• Falla de comunicación', '• Revisar voltaje de alimentación
• Comprobar el correcto cableado
• Falla en tarjeta de unidad interior
• Falla en tarjeta en unidad exterior', NOW());
INSERT INTO error_codes (model_id, code, description, solution, created_at) VALUES (2, 'E8', '• Alta temperatura en sensor de tubo de la unidad exterior', '• Baja velocidad del ventilador en la unidad interior o exterior
• Bajo retorno de aire en la unidad interior o la exterior
• Suciedad en serpentín en la unidad interior o la exterior
• La tapa del condensador esta suelta y no circula el aire correctamente
• Verificar el correcto funcionamiento del sensor de temperatura de tubo en unidad exterior', NOW());
INSERT INTO error_codes (model_id, code, description, solution, created_at) VALUES (2, 'F1', '• Corto o circuito abierto en sensor de aire', '• Medir el sensor de aire del evaporador
• Revisar falso contacto', NOW());
INSERT INTO error_codes (model_id, code, description, solution, created_at) VALUES (2, 'F2', '• Corto o circuito abierto en sensor de tubería (pozo) del evaporador', '• Medir sensor de temperatura ambiente del evaporador (pozo)
• Revisar falso contacto', NOW());
INSERT INTO error_codes (model_id, code, description, solution, created_at) VALUES (2, 'F3', '• Corto o circuito abierto en sensor de temperatura ambiente del condensador', '• Medir sensor de temperatura ambiente del condensador
• Revisar falso contacto', NOW());
INSERT INTO error_codes (model_id, code, description, solution, created_at) VALUES (2, 'F4', '• Corto o circuito abierto en sensor de tubería (pozo) del condensador', '• Medir el sensor de temperatura de tubería del condensador (pozo)
• Revisar falso contacto', NOW());
INSERT INTO error_codes (model_id, code, description, solution, created_at) VALUES (2, 'H1', '• El equipo se encuentra en modo de descongelamiento inteligente es un comportamiento normal de los equipos con calefacción', '• El equipo realiza el proceso de deshielo automático asegurando que este listo para operar calefacción.', NOW());
INSERT INTO error_codes (model_id, code, description, solution, created_at) VALUES (2, 'H3', '• Protección de alta temperatura en compresor', '• Baja velocidad del ventilador en la unidad interior o exterior
• Bajo retorno de aire en la unidad interior o la exterior
• Suciedad en serpentín en la unidad interior o la exterior
• Compruebe carga de refrigerante y válvula de expansión
• Compruebe el voltaje de alimentación
• Verificar el correcto funcionamiento del compresor', NOW());
INSERT INTO error_codes (model_id, code, description, solution, created_at) VALUES (2, 'H6', '• Velocidad del motor evaporador menor a 200 RPM por más de 5 segundos', '• Motor o turbina obstruida
• Capacitor en mal estado
• Sensor de velocidad dañado o desconectado', NOW());
INSERT INTO error_codes (model_id, code, description, solution, created_at) VALUES (2, 'U7', '• Protección por falla en válvula de 4 vías', '• Compruebe voltaje de alimentación
• Falla en salida de tarjeta electrónica
• Falla en válvula de 4 vías
• Comprobar cableado de válvula', NOW());
INSERT INTO air_conditioner_models (id, name, reference_id, image_url, logo_url, type, created_at) VALUES (3, 'ABTX36', 'abtx36', '/images/equipos/abtx36.png', '/images/logos/abtx36.png', '', NOW()) ON CONFLICT (id) DO NOTHING;
INSERT INTO error_codes (model_id, code, description, solution, created_at) VALUES (3, 'C5', '• Ausencia o daño del “jumper” o puente de configuración.', '• Coloque el JUMPER correspondiente en la tarjeta de control:
28*    12K    115V
30*    12K    220V
09*    18K
13*    24K', NOW());
INSERT INTO error_codes (model_id, code, description, solution, created_at) VALUES (3, 'E1', '• Protección de alta presión en el sistema', '• Baja velocidad del ventilador en la unidad exterior
• Bajo retorno de aire en la unidad interior o exterior
• Suciedad en serpentín en la unidad interior o la exterior
• El sistema de gas presenta un bloqueo por dobles o contaminación
• La tapa del condensador esta suelta y no circula el aire correctamente
• Verificar el correcto funcionamiento del sensor de alta presión', NOW());
INSERT INTO error_codes (model_id, code, description, solution, created_at) VALUES (3, 'E3', '• Protección de baja presión en el sistema', '• Revisar perdidas de gas en el sistema
• El sistema de gas presenta un bloqueo por dobles o contaminación
• La tapa del condensador esta suelta y no funciona el aire correctamente
• Verificar el correcto funcionamiento del sensor de baja presión', NOW());
INSERT INTO error_codes (model_id, code, description, solution, created_at) VALUES (3, 'E5', '• Corriente excesiva en el compresor ocurrida más de 4 veces continúas', '• Mida el capacitor del compresor
• Utilice kit de arranque de ser necesario
• Medir voltaje de línea', NOW());
INSERT INTO error_codes (model_id, code, description, solution, created_at) VALUES (3, 'E6', '• Falla de comunicación', '• Revisar voltaje de alimentación
• Comprobar el correcto cableado
• Falla en tarjeta de unidad interior
• Falla en tarjeta en unidad exterior', NOW());
INSERT INTO error_codes (model_id, code, description, solution, created_at) VALUES (3, 'E8', '• Alta temperatura en sensor de tubo de la unidad exterior', '• Baja velocidad del ventilador en la unidad interior o exterior
• Bajo retorno de aire en la unidad interior o la exterior
• Suciedad en serpentín en la unidad interior o la exterior
• La tapa del condensador esta suelta y no circula el aire correctamente
• Verificar el correcto funcionamiento del sensor de temperatura de tubo en unidad exterior', NOW());
INSERT INTO error_codes (model_id, code, description, solution, created_at) VALUES (3, 'F1', '• Corto o circuito abierto en sensor de aire', '• Medir el sensor de aire del evaporador
• Revisar falso contacto', NOW());
INSERT INTO error_codes (model_id, code, description, solution, created_at) VALUES (3, 'F2', '• Corto o circuito abierto en sensor de tubería (pozo) del evaporador', '• Medir sensor de temperatura ambiente del evaporador (pozo)
• Revisar falso contacto', NOW());
INSERT INTO error_codes (model_id, code, description, solution, created_at) VALUES (3, 'F3', '• Corto o circuito abierto en sensor de temperatura ambiente del condensador', '• Medir sensor de temperatura ambiente del condensador
• Revisar falso contacto', NOW());
INSERT INTO error_codes (model_id, code, description, solution, created_at) VALUES (3, 'F4', '• Corto o circuito abierto en sensor de tubería (pozo) del condensador', '• Medir el sensor de temperatura de tubería del condensador (pozo)
• Revisar falso contacto', NOW());
INSERT INTO error_codes (model_id, code, description, solution, created_at) VALUES (3, 'H1', '• El equipo se encuentra en modo de descongelamiento inteligente es un comportamiento normal de los equipos con calefacción', '• El equipo realiza el proceso de deshielo automático asegurando que este listo para operar calefacción.', NOW());
INSERT INTO error_codes (model_id, code, description, solution, created_at) VALUES (3, 'H3', '• Protección de alta temperatura en compresor', '• Baja velocidad del ventilador en la unidad interior o exterior
• Bajo retorno de aire en la unidad interior o la exterior
• Suciedad en serpentín en la unidad interior o la exterior
• Compruebe carga de refrigerante y válvula de expansión
• Compruebe el voltaje de alimentación
• Verificar el correcto funcionamiento del compresor', NOW());
INSERT INTO error_codes (model_id, code, description, solution, created_at) VALUES (3, 'H6', '• Velocidad del motor evaporador menor a 200 RPM por más de 5 segundos', '• Motor o turbina obstruida
• Capacitor en mal estado
• Sensor de velocidad dañado o desconectado', NOW());
INSERT INTO error_codes (model_id, code, description, solution, created_at) VALUES (3, 'U7', '• Protección por falla en válvula de 4 vías', '• Compruebe voltaje de alimentación
• Falla en salida de tarjeta electrónica
• Falla en válvula de 4 vías
• Comprobar cableado de válvula', NOW());
INSERT INTO air_conditioner_models (id, name, reference_id, image_url, logo_url, type, created_at) VALUES (4, 'BLUPLUS', 'bluplus', '/images/equipos/bluplus.png', '/images/logos/bluplus.png', '', NOW()) ON CONFLICT (id) DO NOTHING;
INSERT INTO error_codes (model_id, code, description, solution, created_at) VALUES (4, 'AS', 'Error en el sensor de temperatura de ambiente', '• Medir sensor de temperatura ambiente del condensador 
• Checar falso contacto', NOW());
INSERT INTO error_codes (model_id, code, description, solution, created_at) VALUES (4, 'ES', 'Corto o circuito abierto en sensor de tubería (pozo) del evaporador.', '• Medir sensor de temperatura ambiente del evaporador
• Verificar falso contacto', NOW());
INSERT INTO error_codes (model_id, code, description, solution, created_at) VALUES (4, 'En', 'Error en el sensor de temperatura del evaporador', '• Medir sensor de temperatura ambiente del evaporador
• Revisar falso contacto', NOW());
INSERT INTO error_codes (model_id, code, description, solution, created_at) VALUES (4, 'Eo', 'Error en el sensor de temperatura del condensador.', '• Medir sensor de temperatura ambiente del condensador.
• Revisar falso contacto.', NOW());
INSERT INTO error_codes (model_id, code, description, solution, created_at) VALUES (4, 'Er', 'Error en el sensor de temperatura de ambiente', '• Medir sensor de temperatura ambiente del condensador 
• Verificar falso contacto', NOW());
INSERT INTO error_codes (model_id, code, description, solution, created_at) VALUES (4, 'HI', 'Corto circuito en sensor de temperatura', '• Medir sensor de temperatura ambiente del condensador 
• Checar falso contacto', NOW());
INSERT INTO error_codes (model_id, code, description, solution, created_at) VALUES (4, 'HS', 'Error en el sensor de calefacción eléctrica', '• Medir sensor de calefacción eléctrica
• Revisar falso contacto', NOW());
INSERT INTO error_codes (model_id, code, description, solution, created_at) VALUES (4, 'LO', 'Circuito abierto en sensor de temperatura', '• Medir sensor de temperatura ambiente del condensador 
• Verificar falso contacto', NOW());
INSERT INTO air_conditioner_models (id, name, reference_id, image_url, logo_url, type, created_at) VALUES (5, 'CI SERIES', 'ci_series', '/images/equipos/ciseries.png', '/images/logos/ciseries.png', '', NOW()) ON CONFLICT (id) DO NOTHING;
INSERT INTO error_codes (model_id, code, description, solution, created_at) VALUES (5, 'E0', 'Error en memoria EEPROM en tarjeta de evaporador.', '• En esta situación se requiere el cambio de la tarjeta del evaporador', NOW());
INSERT INTO error_codes (model_id, code, description, solution, created_at) VALUES (5, 'E1', 'Error de comunicación entre tarjeta evaporador / condensador.', '• Revisar voltaje de alimentación.
• Comprobar el correcto cableado.
• Falla en tarjeta de unidad interior.
• Falla en tarjeta en unidad exterior.', NOW());
INSERT INTO error_codes (model_id, code, description, solution, created_at) VALUES (5, 'E3', 'Velocidad anormal en motor evaporador', '• Motor o turbina obstruida.
• Capacitor en mal estado.
• Sensor de velocidad dañado o desconectado.', NOW());
INSERT INTO error_codes (model_id, code, description, solution, created_at) VALUES (5, 'E4', 'Corto circuito o circuito abierto en sensor de ambiente en evaporador', '• Medir el sensor del evaporador
• Verificar falso contacto', NOW());
INSERT INTO error_codes (model_id, code, description, solution, created_at) VALUES (5, 'E5', 'Corto circuito o circuito abierto en sensor de pozo de evaporador.', '• Medir sensor de temperatura de tubería del evaporador.
• Revisar falso contacto.', NOW());
INSERT INTO error_codes (model_id, code, description, solution, created_at) VALUES (5, 'EC', 'Fuga o Corto circuito o circuito abierto en sensor de tubería de evaporador. escasez de refrigerante', '• Verificar presiones de refrigerante.
• Válvulas de servicio cerradas o abiertas parcialmente.
• Switch de baja presión dañado.
• Presenta perdida de refrigerante.', NOW());
INSERT INTO error_codes (model_id, code, description, solution, created_at) VALUES (5, 'EE', 'Error en nivel de agua en bomba de condensado', '• Verificar la correcta conexion del cable del nivel a la tarjeta.
• Revisar si no existe suciedad en el flotador.
• Revisar la alimentacion de voltaje a la bomba de condensdado.
• Limpiar charola y bomba de condensado.', NOW());
INSERT INTO error_codes (model_id, code, description, solution, created_at) VALUES (5, 'F0', 'Protección contra sobre corriente activada', '• Verificar parámetros eléctricos de la instalación.
• Revisar uniones y conexiones del cableado eléctrico.
• Pobre condensación.
• Presiones de refrigerante elevadas o fuera de rango.
• Carga térmica excesiva o equipo sobre forzado.', NOW());
INSERT INTO error_codes (model_id, code, description, solution, created_at) VALUES (5, 'F1', '• Corto circuito o circuito abierto en sensor de ambiente en condensador', '• Medir el sensor de temperatura ambiental del condensador
• Revisar falso contacto', NOW());
INSERT INTO error_codes (model_id, code, description, solution, created_at) VALUES (5, 'F2', '• Corto circuito o circuito abierto en sensor de tubería en condensador.', '• Medir sensor de temperatura de tubería del condensador.
• Revisar falso contacto.', NOW());
INSERT INTO error_codes (model_id, code, description, solution, created_at) VALUES (5, 'F3', 'Corto circuito o circuito abierto en sensor de la descarga del compresor.', '• Medir sensor de temperatura en descarga de compresor.
• Revisar falso contacto.', NOW());
INSERT INTO error_codes (model_id, code, description, solution, created_at) VALUES (5, 'F4', 'Error en memoria EEPROM en tarjeta de condensador.', 'En esta situación se requiere el cambio de la tarjeta del condensador', NOW());
INSERT INTO error_codes (model_id, code, description, solution, created_at) VALUES (5, 'F5', 'Velocidad Anormal en motor condensador.', '• Verificar terminales y conexiones eléctricas.
• Bobinas internas del motor, baleros o rodamientos, aspa obstruida.', NOW());
INSERT INTO error_codes (model_id, code, description, solution, created_at) VALUES (5, 'F6', '• Corto circuito o circuito abierto en sensor de tubería, en válvula de baja presión del condensador.', '• Medir sensor de temperatura de tubería del condensador.
• Revisar falso contacto.', NOW());
INSERT INTO error_codes (model_id, code, description, solution, created_at) VALUES (5, 'F7', 'Falla de comunicación entre tarjeta principal y panel decorativo (CASSETE)', '• Compruebe que el arnes del motor oscilador, en el panel decorativo, este conectado correctamente al conector CN14 de la tarjeta principal.
• Compruebe que no este rojo los cables del arnes del motor oscilador.', NOW());
INSERT INTO error_codes (model_id, code, description, solution, created_at) VALUES (5, 'P0', 'Error en modulo IPM o IGBT en tarjeta de condensador.', '• Reemplazar modulo inversor en el condensador.', NOW());
INSERT INTO error_codes (model_id, code, description, solution, created_at) VALUES (5, 'P1', 'Protección contra voltaje anormal. (bajo o muy alto voltaje)', '• Comprobar que el voltaje de suministro este dentro del rango aceptable, de lo contrario, contacte a su proveedor para solicitar que realice un ajuste.', NOW());
INSERT INTO error_codes (model_id, code, description, solution, created_at) VALUES (5, 'P2', 'Alta temperatura en modulo IPM', '• Baja velocidad del ven􀆟lador en la unidad interior o exterior
• Bajo retorno de aire en la unidad interior o la exterior
• Suciedad en serpen􀆡n en la unidad interior o la exterior
• Compruebe carga de refrigerante y válvula de expansión
• Compruebe el voltaje de alimentación
• Verificar el correcto funcionamiento del compresor', NOW());
INSERT INTO error_codes (model_id, code, description, solution, created_at) VALUES (5, 'P3', 'Protección por baja temperatura ambiente en modo calefacción.', '• Ocurre cuando la temperatura exterior es inferior a los -15°C.', NOW());
INSERT INTO error_codes (model_id, code, description, solution, created_at) VALUES (5, 'P4', 'Falla en "Driver" de tarjeta del compresor', '• Reemplazar tarjeta del condensador.', NOW());
INSERT INTO error_codes (model_id, code, description, solution, created_at) VALUES (5, 'P5', 'Conflicto en modo de operación', '• Ocurre cuando el evaporador NO es compa􀆟ble con el condensador.', NOW());
INSERT INTO error_codes (model_id, code, description, solution, created_at) VALUES (5, 'P6', '• Protección de baja presión de refrigerante (3 ton solamente)', '• Verifique el estado del switch de presión en el lado de baja.', NOW());
INSERT INTO error_codes (model_id, code, description, solution, created_at) VALUES (5, 'P7', '• Corto circuito o circuito abierto en sensor de temperatura en modulo IPM.', '• Medir valor del sensor te temperatura
• Revisar falso contacto.', NOW());
INSERT INTO air_conditioner_models (id, name, reference_id, image_url, logo_url, type, created_at) VALUES (6, 'FLEX', 'flex', '/images/equipos/flex.png', '/images/logos/flex.png', '', NOW()) ON CONFLICT (id) DO NOTHING;
INSERT INTO error_codes (model_id, code, description, solution, created_at) VALUES (6, 'AP', 'Modo AP activado.
El modulo Wifi se encuentra activado para iniciar la configuracion.', '', NOW());
INSERT INTO error_codes (model_id, code, description, solution, created_at) VALUES (6, 'CL', 'Limpieza de filtros', '• Limpie los filtros de aire
• Quite la energía por 2 minutos y conéctela nuevamente para quitar el código.', NOW());
INSERT INTO error_codes (model_id, code, description, solution, created_at) VALUES (6, 'E0', '• Error en memoria EEPROM en tarjeta de evaporador.', '•Reemplace tarjeta del evaporador', NOW());
INSERT INTO error_codes (model_id, code, description, solution, created_at) VALUES (6, 'E1', '• Error de comunicación entre tarjeta evaporador / condensador.', '• Revisar voltaje de alimentación
• Comprobar el correcto cableado
• Falla en tarjeta de unidad interior
• Falla en tarjeta en unidad exterior', NOW());
INSERT INTO error_codes (model_id, code, description, solution, created_at) VALUES (6, 'E2', '• Error de detección de cruce por cero en tarjeta evaporador', '•  Reemplazar tarjeta principal del evaporador', NOW());
INSERT INTO error_codes (model_id, code, description, solution, created_at) VALUES (6, 'E3', '• Velocidad anormal en motor evaporador', '• Motor o turbina obstruida
• Capacitor en mal estado
• Sensor de velocidad dañado o desconectado', NOW());
INSERT INTO error_codes (model_id, code, description, solution, created_at) VALUES (6, 'E4', '• Corto circuito o circuito abierto en sensor de temperatura ambiental de evaporador', '• Medir el sensor del evaporador 
• Revisar falso contacto', NOW());
INSERT INTO error_codes (model_id, code, description, solution, created_at) VALUES (6, 'E5', '• Corto circuito o circuito abierto en sensor de tubería de evaporador', '• Medir sensor de temperatura de tubería del evaporador
• Revisar falso contacto', NOW());
INSERT INTO error_codes (model_id, code, description, solution, created_at) VALUES (6, 'EC', '• Fuga o escasez de refrigerante', '• Verificar presiones de refrigerante
• Válvulas de servicio cerradas o abiertas parcialmente
• Switch de baja presión dañado
• Presenta perdida de refrigerante', NOW());
INSERT INTO error_codes (model_id, code, description, solution, created_at) VALUES (6, 'EC53', '• Corto circuito o circuito abierto en sensor de temperatura ambiente de condensador', '• Medir sensor de temperatura ambiente de condensador
• Revisar falso contacto', NOW());
INSERT INTO error_codes (model_id, code, description, solution, created_at) VALUES (6, 'EC54', '• Corto circuito o circuito abierto en sensor de tubería de descarga de compresor', '• Medir sensor de temperatura de tubería del condensador
• Revisar falso contacto', NOW());
INSERT INTO error_codes (model_id, code, description, solution, created_at) VALUES (6, 'EH00', 'Error en memoria EEPROM en tarjeta de evaporador.', '•Reemplace tarjeta del evaporador', NOW());
INSERT INTO error_codes (model_id, code, description, solution, created_at) VALUES (6, 'EH02', 'Error de detección de cruce por cero en tarjeta evaporador', '• Reemplazar tarjeta principal del evaporador', NOW());
INSERT INTO error_codes (model_id, code, description, solution, created_at) VALUES (6, 'EH03', '• Velocidad anormal en motor evaporador', '• Motor o turbina obstruida
• Capacitor en mal estado
• Sensor de velocidad dañado o desconectado', NOW());
INSERT INTO error_codes (model_id, code, description, solution, created_at) VALUES (6, 'EH0b', 'Falla de comunicación entre tarjeta del evaporador y tarjeta display.', '• Verificar cable de interconexión.
• Falla en tarjeta de unidad interior
• Falla en tarjeta display.', NOW());
INSERT INTO error_codes (model_id, code, description, solution, created_at) VALUES (6, 'EH60', 'Corto circuito o circuito abierto en sensor de temperatura ambiente de evaporador.', '• Medir sensor de temperatura ambiente de evaporador.
• Revisar falso contacto.', NOW());
INSERT INTO error_codes (model_id, code, description, solution, created_at) VALUES (6, 'EH61', '• Corto circuito o circuito abierto en sensor de tubería de evaporador', '• Medir el sensor de tubería de evaporador
• Revisar falso contacto', NOW());
INSERT INTO error_codes (model_id, code, description, solution, created_at) VALUES (6, 'EL01', '• Error de comunicación entre tarjeta evaporador / condensador.', '• Revisar voltaje de alimentación.
• Comprobar el correcto cableado.
• Falla en tarjeta de unidad interior.
• Falla en tarjeta en unidad exterior.', NOW());
INSERT INTO error_codes (model_id, code, description, solution, created_at) VALUES (6, 'EL0C', '• Fuga o escasez de refrigerante', '• Verificar presiones de refrigerante
• Válvulas de servicio cerradas o abiertas parcialmente
• Falla sensor pozo en evaporador
• Capacitor de compresor/ventilador dañado
• Falla en ventilador externo
• Presenta perdida de refrigerante', NOW());
INSERT INTO error_codes (model_id, code, description, solution, created_at) VALUES (6, 'F0', '• Protección contra sobre corriente activada', '• Verificar parámetros eléctricos de la instalación
• Revisar uniones y conexiones del cableado eléctrico
• Pobre condensación
• Presiones de refrigerante elevadas o fuera de rango
• Carga térmica excesiva o equipo sobre forzado', NOW());
INSERT INTO error_codes (model_id, code, description, solution, created_at) VALUES (6, 'F1', '• Corto circuito o circuito abierto en sensor de temperatura ambiental de condensador', '• Medir el sensor de temperatura ambiental del condensador
• Revisar falso contacto', NOW());
INSERT INTO error_codes (model_id, code, description, solution, created_at) VALUES (6, 'F2', '• Corto circuito o circuito abierto en sensor de tubería de condensador', '• Medir sensor de temperatura de tubería del condensador
• Revisar falso contacto', NOW());
INSERT INTO error_codes (model_id, code, description, solution, created_at) VALUES (6, 'F3', '• Corto circuito o circuito abierto en sensor de tubería de descarga de compresor', '• Medir sensor de temperatura de tubería de descarga de compresor
• Revisar falso contacto', NOW());
INSERT INTO error_codes (model_id, code, description, solution, created_at) VALUES (6, 'F4', '• Error en memoria EEPROM en tarjeta de condensador', '• Reemplace tarjeta del condensador', NOW());
INSERT INTO error_codes (model_id, code, description, solution, created_at) VALUES (6, 'F5', '• Velocidad Anormal en motor condensador', '• Verificar terminales y conexiones eléctricas
• Bobinas internas del motor, baleros o rodamientos, aspa obstruida', NOW());
INSERT INTO error_codes (model_id, code, description, solution, created_at) VALUES (6, 'FC', 'Función de enfriamiento forzado.', 'Esta función se activa cuando se enciende el equipo por medio de el botón de emergencia en la unidad evaporador.', NOW());
INSERT INTO error_codes (model_id, code, description, solution, created_at) VALUES (6, 'P0', '• Error en modulo IPM o IGBT en tarjeta de condensador', '• Reemplace tarjeta del condensador', NOW());
INSERT INTO error_codes (model_id, code, description, solution, created_at) VALUES (6, 'P1', '• Protección contra voltaje anormal (bajo o muy alto voltaje)', '• Comprobar que el voltaje de suministro este dentro del rango aceptable, de lo contrario, contacte a su proveedor para solicitar que realice un ajuste.', NOW());
INSERT INTO error_codes (model_id, code, description, solution, created_at) VALUES (6, 'P2', '• Alta temperatura en superficie de compresor', '• Baja velocidad del ventilador en la unidad interior o exterior
• Bajo retorno de aire en la unidad interior o la exterior
• Suciedad en serpentín en la unidad interior o la exterior
• Compruebe carga de refrigerante y válvula de expansión
• Compruebe el voltaje de alimentación
• Verificar el correcto funcionamiento del compresor', NOW());
INSERT INTO error_codes (model_id, code, description, solution, created_at) VALUES (6, 'P4', '• Falla en "Driver" del compresor', '• Reemplace tarjeta del condensador', NOW());
INSERT INTO error_codes (model_id, code, description, solution, created_at) VALUES (6, 'P5', '• Conflicto de operación', '• El evaporador NO es compatible con el condensador', NOW());
INSERT INTO error_codes (model_id, code, description, solution, created_at) VALUES (6, 'P6', '• Protección por alta o baja presión de refrigerante', '• Verifique el estado del switch de presión en el lado de baja o alta presión.
• Verifique el la condensadora cuente con los espacios correctos.', NOW());
INSERT INTO error_codes (model_id, code, description, solution, created_at) VALUES (6, 'PC00', '• Error en modulo IPM o IGBT en tarjeta de condensador', '• Reemplace tarjeta del condensador', NOW());
INSERT INTO error_codes (model_id, code, description, solution, created_at) VALUES (6, 'PC01', '• Protección contra voltaje anormal (bajo o muy alto voltaje)', '• Comprobar que el voltaje de suministro este dentro del rango aceptable, de lo contrario, contacte a su proveedor para solicitar que realice un ajuste.
• Revise el reactor', NOW());
INSERT INTO error_codes (model_id, code, description, solution, created_at) VALUES (6, 'PC02', '• Alta temperatura en superficie de compresor', '• Baja velocidad del ventilador en la unidad interior o exterior
• Bajo retorno de aire en la unidad interior o la exterior
• Suciedad en serpentín en la unidad interior o la exterior
• Compruebe carga de refrigerante y válvula de expansión
• Compruebe el voltaje de alimentación
• Verificar el correcto funcionamiento del compresor', NOW());
INSERT INTO error_codes (model_id, code, description, solution, created_at) VALUES (6, 'PC03', '• Protección por baja presión de refrigerante', '• Verifique el estado del switch de presión en el lado de baja.', NOW());
INSERT INTO error_codes (model_id, code, description, solution, created_at) VALUES (6, 'PC04', '• Falla en "Driver" del compresor', '• Compruebe la correcta conexión en la tarjeta del condensador al compresor
• Revise el funcionamiento del ventilador exterior e interior
• Compruebe los valores de resistencia del compresor
• Reemplace tarjeta del condensador', NOW());
INSERT INTO error_codes (model_id, code, description, solution, created_at) VALUES (6, 'PC08', 'Se detecto un aumento excesivo en la corriente de trabajo del equipo.', '• Se presento un fallo en el suministo de energia (Desconecte de la alimentacion por 1 minuto para reiniciar la falla)
• Compruebe que el voltaje de alimentacion este dento del rango de trabajo
• Asegurese que tenga una buena ventilacion el condensador
• Revise que el ventilador del condensador funciona correctamente
• Compruebe que no hay objetos o suciedad en serpentin de condensador
• Si la presion de gas es muy alta, libere el exceso de refrigerante
• Reemplace la tarjeta del condensador', NOW());
INSERT INTO error_codes (model_id, code, description, solution, created_at) VALUES (6, 'SC', 'Función de Auto Limpieza', 'No es una falla. El código SC se muestra en el display cuando la función de auto limpieza esta activada.', NOW());
INSERT INTO error_codes (model_id, code, description, solution, created_at) VALUES (6, 'cF', '• El equipo se encuentra en etapa de pre-calentamiento justo antes de iniciar el modo calefacción', '• Esperar 5 minutos para iniciar modo de calefacción normalmente', NOW());
INSERT INTO error_codes (model_id, code, description, solution, created_at) VALUES (6, 'dF', '• El equipo se encuentra en modo de des-congelamiento.', '• Espere a que termine el ciclo de des-congelamiento.', NOW());
INSERT INTO air_conditioner_models (id, name, reference_id, image_url, logo_url, type, created_at) VALUES (7, 'FLUX', 'flux', '/images/equipos/flux.png', '/images/logos/flux.png', '', NOW()) ON CONFLICT (id) DO NOTHING;
INSERT INTO error_codes (model_id, code, description, solution, created_at) VALUES (7, 'E2', '• Tensión de la batería baja y sin símbolos', '• Reemplazar las baterías
• Revisar  falso contacto', NOW());
INSERT INTO error_codes (model_id, code, description, solution, created_at) VALUES (7, 'EE', '• Protección por alta temperatura', '•Temperatura > 90°C
•Termostato dañado', NOW());
INSERT INTO air_conditioner_models (id, name, reference_id, image_url, logo_url, type, created_at) VALUES (8, 'FLUX ELECTRIC', 'flux_electric', '/images/equipos/flux_electric.png', '/images/logos/flux_electric.png', '', NOW()) ON CONFLICT (id) DO NOTHING;
INSERT INTO error_codes (model_id, code, description, solution, created_at) VALUES (8, 'E1', '• Protección por alta temperatura', '• Reducir la temperatura configurada
• Aumentar el flujo de agua', NOW());
INSERT INTO error_codes (model_id, code, description, solution, created_at) VALUES (8, 'E3', 'Falla en sensor de temperatura', '• Reemplace sensor de temperatura', NOW());
INSERT INTO air_conditioner_models (id, name, reference_id, image_url, logo_url, type, created_at) VALUES (9, 'INVERTER X32', 'inverter x32', '/images/equipos/inverter_x32.png', '/images/logos/inverter_x32.png', '', NOW()) ON CONFLICT (id) DO NOTHING;
INSERT INTO error_codes (model_id, code, description, solution, created_at) VALUES (9, '5E', 'Error de comunicación entre evaporador y condensador', '• Error de conexión (cable de comunicación mal conectado)  aparece justo recién instalado
• Corrosión en tarjeta exterior, ocasionando corto circuito', NOW());
INSERT INTO error_codes (model_id, code, description, solution, created_at) VALUES (9, 'E1', '• Corto circuito o circuito abierto en sensor de temperatura ambiental de evaporador', '• Medir el sensor del evaporador
• Revisar falso contacto', NOW());
INSERT INTO error_codes (model_id, code, description, solution, created_at) VALUES (9, 'E2', '• Corto circuito o circuito abierto en sensor de tubería de condensador', '• Medir sensor de temperatura de tubería del condensador
• Revisar falso contacto', NOW());
INSERT INTO error_codes (model_id, code, description, solution, created_at) VALUES (9, 'E3', '• Corto circuito o circuito abierto en sensor de tubería de evaporador', '• Medir sensor de temperatura de tubería del evaporador
• Revisar falso contacto', NOW());
INSERT INTO error_codes (model_id, code, description, solution, created_at) VALUES (9, 'E4', '• Velocidad anormal en motor evaporador', '• Motor o turbina obstruida
• Capacitor en mal estado
• Sensor de velocidad dañado o desconectado', NOW());
INSERT INTO error_codes (model_id, code, description, solution, created_at) VALUES (9, 'E5', '• Error de comunicación entre tarjeta evaporador / condensador', '• Revisar voltaje de alimentación
• Comprobar el correcto cableado
• Falla en tarjeta de unidad interior
• Falla en tarjeta en unidad exterior', NOW());
INSERT INTO error_codes (model_id, code, description, solution, created_at) VALUES (9, 'F0', '• Velocidad Anormal en motor condensador', '• Verificar terminales y conexiones eléctricas
• Bobinas internas del motor, baleros o rodamientos, aspa obstruida', NOW());
INSERT INTO error_codes (model_id, code, description, solution, created_at) VALUES (9, 'F1', '• Error en modulo IPM en tarjeta de condensador', '•  Reemplazar la tarjeta del condensador', NOW());
INSERT INTO error_codes (model_id, code, description, solution, created_at) VALUES (9, 'F2', '• Falla en el modulo PFC', '•  Reemplazar la tarjeta del condensador', NOW());
INSERT INTO error_codes (model_id, code, description, solution, created_at) VALUES (9, 'F3', '• Falla en la operación del compresor', '•  Revisar funcionamiento de compresor
•  Compresor bloqueado
•  Fases invertidas en compresor', NOW());
INSERT INTO error_codes (model_id, code, description, solution, created_at) VALUES (9, 'F4', '• Corto circuito o circuito abierto en sensor de tubería de descarga de compresor', '• Medir sensor de temperatura de tubería de descarga de compresor
• Revisar falso contacto', NOW());
INSERT INTO error_codes (model_id, code, description, solution, created_at) VALUES (9, 'F5', '• Alta temperatura en superficie de compresor', '• Baja velocidad del ventilador en la unidad interior o exterior
• Bajo retorno de aire en la unidad interior o la exterior
• Suciedad en serpentín en la unidad interior o la exterior
• Compruebe carga de refrigerante y válvula de expansión
• Compruebe el voltaje de alimentación
• Verificar el correcto funcionamiento del compresor', NOW());
INSERT INTO error_codes (model_id, code, description, solution, created_at) VALUES (9, 'F6', '• Corto circuito o circuito abierto en sensor de temperatura ambiental de condensador', '• Medir el sensor de temperatura de tubería del condensador
• Revisar falso contacto', NOW());
INSERT INTO error_codes (model_id, code, description, solution, created_at) VALUES (9, 'F7', '• Protección contra voltaje anormal (bajo o muy alto voltaje)', '• Comprobar que el voltaje de suministro este dentro del rango aceptable, de lo contrario, contacte a su proveedor para solicitar que realice un ajuste.', NOW());
INSERT INTO error_codes (model_id, code, description, solution, created_at) VALUES (9, 'F8', '• Error de comunicación entre tarjeta evaporador / condensador', '• Revisar voltaje de alimentación
• Comprobar el correcto cableado
• Falla en tarjeta de unidad interior
• Falla en tarjeta en unidad exterior', NOW());
INSERT INTO error_codes (model_id, code, description, solution, created_at) VALUES (9, 'F9', '• Error en memoria EEPROM en tarjeta de condensador', '• Reemplace la tarjeta del condensador', NOW());
INSERT INTO error_codes (model_id, code, description, solution, created_at) VALUES (9, 'FA', '• Fallo del sensor de temperatura de succión', '• Medir sensor de temperatura de succión
• Revisar falso contacto', NOW());
INSERT INTO error_codes (model_id, code, description, solution, created_at) VALUES (9, 'H3', 'Modo de operación forzada activada.

Durante este modo, el equipo realiza ciclos de trabajo del compresor de 40 minutos encendido y 20 minutos apagado.

Nota: Durante este modo de operación, se deshabilitan las funciones básicas del equipo.', 'Para desactivar el modo de operación forzada siga los siguientes pasos:

1.- Presione el botón "MENU/OK" y seleccione la función "Display".
2.- Presione el botón "MENU/OK" para enviar el comando display al equipo.
3.- Mande la función display 6 veces al equipo en intervalos de 1 segundo (El display del equipo se apaga y enciende 3 veces).
4.- La función queda desactivada cuando el código H3 desaparece.', NOW());
INSERT INTO error_codes (model_id, code, description, solution, created_at) VALUES (9, 'L0', 'Protección por algo o bajo voltaje en bus DC', '• Comprobar que el voltaje de suministro este dentro del rango aceptable, de lo contrario, contacte a su proveedor para solicitar que realice un ajuste.
• Compruebe que no hay perdida una perdida de fase en las lineas de alimentación.
• Revise el reactor
• Verifique si se presenta un daño visible en la tarjeta de condensador.', NOW());
INSERT INTO error_codes (model_id, code, description, solution, created_at) VALUES (9, 'L1', 'Protección por sobrecorriente en compresor', '• Se presento un fallo en el suministo de energia (Desconecte de la alimentacion por 1 minuto para reiniciar la falla).
• Compruebe que el voltaje de alimentacion este dento del rango de trabajo.
• Asegurese que tenga una buena ventilacion el condensador.
• Revise que el ventilador del condensador funciona correctamente.
• Verifique que las terminales del compresor este conectado correctamente o que el compresor no esta bloqueado.
• Si la presion de gas es muy alta, libere el exceso de refrigerante.
• Reemplace la tarjeta del condensador.', NOW());
INSERT INTO error_codes (model_id, code, description, solution, created_at) VALUES (9, 'L2', 'Protección por perdida de fase en compresor', '• Se presento un fallo en el suministo de energia (Desconecte de la alimentacion por 1 minuto para reiniciar la falla).
• Compruebe que el voltaje de alimentacion este dento del rango de trabajo.
• Asegurese que tenga una buena ventilacion el condensador.
• Revise que el ventilador del condensador funciona correctamente.
• Verifique que las terminales del compresor este conectado correctamente o que el compresor no esta bloqueado.
• Si la presion de gas es muy alta, libere el exceso de refrigerante.
• Reemplace la tarjeta del condensador.', NOW());
INSERT INTO error_codes (model_id, code, description, solution, created_at) VALUES (9, 'L3', 'Falla en la secuencia de fase del compresor', '• Verifique que los cable de conexión del compresor esten conectados en el orden correcto.
• Verifique que los cables de conexión del compresor no estén rotos o desconectados.
• Reemplace la tarjeta del condensador.', NOW());
INSERT INTO error_codes (model_id, code, description, solution, created_at) VALUES (9, 'L4', 'Falla en el modulo IPM del compresor', '• Verifique que los cable de conexión del compresor esten conectados en el orden correcto.
• Verifique que los cables de conexión del compresor no esten rotos o desconectados.
• Verifique la resistencia entre terminales de conexión y prueba a tierra para verificar si hay algún daño en el compresor.
• Reemplace la tarjeta del condensador.', NOW());
INSERT INTO error_codes (model_id, code, description, solution, created_at) VALUES (9, 'L5', 'Protección de hardware por sobre corriente en módulo PFC', '• Comprobar que el voltaje de suministro este dentro del rango aceptable, de lo contrario, contacte a su proveedor para solicitar que realice un ajuste.
• Se presento un fallo en el suministo de energia (Desconecte de la alimentacion por 1 minuto para reiniciar la falla).
• Verifique si se presenta un daño visible en la tarjeta de condensador.
• Reemplace la tarjeta del condensador.', NOW());
INSERT INTO error_codes (model_id, code, description, solution, created_at) VALUES (9, 'L6', 'Protección de software por sobrecorriente en modulo PFC', '• Comprobar que el voltaje de suministro este dentro del rango aceptable, de lo contrario, contacte a su proveedor para solicitar que realice un ajuste.
• Se presento un fallo en el suministo de energia (Desconecte de la alimentacion por 1 minuto para reiniciar la falla).
• Verifique si se presenta un daño visible en la tarjeta de condensador.
• Reemplace la tarjeta del condensador.', NOW());
INSERT INTO error_codes (model_id, code, description, solution, created_at) VALUES (9, 'L7', 'Protección por detección anormal de corriente', '• Comprobar que el voltaje de suministro este dentro del rango aceptable, de lo contrario, contacte a su proveedor para solicitar que realice un ajuste.
• Se presento un fallo en el suministo de energia (Desconecte de la alimentacion por 1 minuto para reiniciar la falla).
• Verifique si se presenta un daño visible en la tarjeta de condensador.
• Reemplace la tarjeta del condensador.', NOW());
INSERT INTO error_codes (model_id, code, description, solution, created_at) VALUES (9, 'L8', 'Protección por desequilibrio en resistencia de compresor', '• Verifique si se presenta un daño visible en la tarjeta de condensador.
• Verifique si el cable de conexión esta roto o no esta bien conectado.
• Verifique la resistencia entre terminales de conexión y prueba a tierra para verificar si hay algún daño en el compresor.
• Reemplace la tarjeta del condensador.', NOW());
INSERT INTO error_codes (model_id, code, description, solution, created_at) VALUES (9, 'L9', 'Falla en sensor de temperatura de modulo IPM', '• Verifique si se presenta un daño visible en la tarjeta de condensador.
• Verifique si la velocidad del ventilador en el condensador es anormal.
• Verifique si la presión de gas en el sistema es demasiado alta.
• Reemplace la tarjeta del condensador.', NOW());
INSERT INTO error_codes (model_id, code, description, solution, created_at) VALUES (9, 'LA', 'Falla en el arranque del compresor', '• Verifique si se presenta un daño visible en la tarjeta de condensador.
• Verifique si el cable de conexión esta roto o no esta bien conectado.
• Verifique la resistencia entre terminales de conexion y prueba a tierra para verificar si hay algun daño en el compresor.
• Reemplace la tarjeta del condensador.', NOW());
INSERT INTO error_codes (model_id, code, description, solution, created_at) VALUES (9, 'LC', 'Protección por detección anormal de corriente en modulo PFC', '• Comprobar que el voltaje de suministro este dentro del rango aceptable, de lo contrario, contacte a su proveedor para solicitar que realice un ajuste.
• Se presento un fallo en el suministo de energia (Desconecte de la alimentacion por 1 minuto para reiniciar la falla).
• Verifique si se presenta un daño visible en la tarjeta de condensador.
• Reemplace la tarjeta del condensador.', NOW());
INSERT INTO error_codes (model_id, code, description, solution, created_at) VALUES (9, 'LE', 'Falla en secuencia de fase del motor condensador', '• Verifique si se presenta un daño visible en la tarjeta de condensador.
• Verifique si la velocidad del ventilador en el condensador es anormal.
• Verifique si el cable de conexión esta roto o no esta bien conectado.
• Reemplace la tarjeta del condensador.', NOW());
INSERT INTO error_codes (model_id, code, description, solution, created_at) VALUES (9, 'LF', 'Falla por pérdida de fase del motor condensador', '• Verifique si se presenta un daño visible en la tarjeta de condensador.
• Verifique si la velocidad del ventilador en el condensador es anormal.
• Verifique si el cable de conexión esta roto o no esta bien conectado.
• Reemplace la tarjeta del condensador.', NOW());
INSERT INTO error_codes (model_id, code, description, solution, created_at) VALUES (9, 'LH', 'Falla en funcionamiento del motor condensador', '• Verifique que el conector del motor este correctamente ensamblado en la tarjeta y que no tenga los cables dañados.
• Compruebe que el motor no este dañado
• Revise que el condensador no este bloqueado y que tenga una buena circulación de aire.
• Verifique que la tarjeta de condensador no presente algún daño.', NOW());
INSERT INTO error_codes (model_id, code, description, solution, created_at) VALUES (9, 'Ld', 'Protección por detección anormal de corriente en motor condensador', '• Comprobar que el voltaje de suministro este dentro del rango aceptable, de lo contrario, contacte a su proveedor para solicitar que realice un ajuste.
• Se presento un fallo en el suministo de energia (Desconecte de la alimentacion por 1 minuto para reiniciar la falla).
• Verifique si se presenta un daño visible en la tarjeta de condensador.
• Reemplace la tarjeta del condensador.', NOW());
INSERT INTO error_codes (model_id, code, description, solution, created_at) VALUES (9, 'P2', 'Protección por Alta presión de refrigerante', '• Verifique el estado del switch de presión en el lado de Alta presión, el contacto de este sensor es Normalmente abierto.
• Si la presión es normal y el interruptor de alta presión se mantiene abierto, es seguro que el voltaje de presión falla.
• Si la presión es normal y el interruptor de alta presión se mantiene abierto, es seguro que el voltaje de presión falla;
• Si el interruptor de presión es normal y la línea de conexión está intacta y aún se informa la falla, reemplace la PCB principal correspondiente.', NOW());
INSERT INTO error_codes (model_id, code, description, solution, created_at) VALUES (9, 'P3', 'Fuga o escases de refrigerante', '• Verifique que las válvulas de la unidad exterior están abiertas.
• Verifique si el evaporador, el condensador ó kit de conexión están dañados o agrietados.
• Compruebe que el sensor de temperatura ambiente y el sensor de temperatura de pozo están dañados o descalibrados.', NOW());
INSERT INTO error_codes (model_id, code, description, solution, created_at) VALUES (9, 'P4', 'Protección por sobrecarga', '• La temperatura ambiente es demasiado alta o demasiado baja (Revisar sensores de temperatura)
• Intercambiador de calor sucio (limpiar el intercambiador de calor)
• La velocidad del motor exterior es baja (verifique el cableado del motor)
• Capilar obstruido', NOW());
INSERT INTO error_codes (model_id, code, description, solution, created_at) VALUES (9, 'P5', 'Protección por alta temperatura en descarga de compresor', '• Verifique que la presión del sistema.
• Verifique si la entrada de aire interior/exterior tiene alguna obstrucción, por ejemplo, si el evaporador o el condensador están sucios o si el filtro está sucio o bloqueado. si la entrada está afectada, retire el obstrucción.
• Compruebe el valor de resistencia del sensor de descarga de condensador.', NOW());
INSERT INTO error_codes (model_id, code, description, solution, created_at) VALUES (9, 'P6', 'Protección por alta temperatura del serpentín de la unidad interior en modo calefacción', '• Verifique que la entrada de aire en el evaporador no  tenga obstrucciones.
• Compruebe si el filtro está sucio. Si es así, limpie el filtro con agua fría.
• Verifique si el volumen de aire de inyección es demasiado pequeño y si el ventilador de la unidad interior está sucio, si es así, limpie la turbina.
• Compruebe que el sensor de temperatura ambiente y el sensor de temperatura de pozo están dañados o descalibrados.', NOW());
INSERT INTO error_codes (model_id, code, description, solution, created_at) VALUES (9, 'P7', 'Protección por congelamiento en unidad interior', '• Verifique que la entrada de aire en el evaporador no  tenga obstrucciones.
• Compruebe si el filtro está sucio. Si es así, limpie el filtro con agua fría.
• Verifique si el volumen de aire de inyección es demasiado pequeño y si el ventilador de la unidad interior está sucio, si es así, limpie la turbina.
• Compruebe que el sensor de temperatura ambiente y el sensor de temperatura de pozo están dañados o descalibrados.', NOW());
INSERT INTO error_codes (model_id, code, description, solution, created_at) VALUES (9, 'P8', 'Protección por sobre corriente', '1. Use un multímetro para detectar y verificar si el voltaje de AC es demasiado bajo.
2. Use un manómetro para verificar si la presión del sistema excede el estándar. Si la presión supera el estándar, puede provocar un bloqueo del sistema.
3. Reemplace el controlador de la unidad exterior.', NOW());
INSERT INTO air_conditioner_models (id, name, reference_id, image_url, logo_url, type, created_at) VALUES (10, 'INVERTER 17', 'inverter_17', '/images/equipos/i17.png', '/images/logos/i17.png', '', NOW()) ON CONFLICT (id) DO NOTHING;
INSERT INTO error_codes (model_id, code, description, solution, created_at) VALUES (10, '5E', 'Error de comunicación entre evaporador y condensador', '• Error de conexión (cable de comunicación mal conectado)  aparece justo recién instalado
• Corrosión en tarjeta exterior, ocasionando corto circuito', NOW());
INSERT INTO error_codes (model_id, code, description, solution, created_at) VALUES (10, 'E1', '• Corto circuito o circuito abierto en sensor de temperatura ambiental de evaporador', '• Medir el sensor del evaporador
• Revisar falso contacto', NOW());
INSERT INTO error_codes (model_id, code, description, solution, created_at) VALUES (10, 'E2', '• Corto circuito o circuito abierto en sensor de tubería de condensador', '• Medir sensor de temperatura de tubería del condensador
• Revisar falso contacto', NOW());
INSERT INTO error_codes (model_id, code, description, solution, created_at) VALUES (10, 'E3', '• Corto circuito o circuito abierto en sensor de tubería de evaporador', '• Medir sensor de temperatura de tubería del evaporador
• Revisar falso contacto', NOW());
INSERT INTO error_codes (model_id, code, description, solution, created_at) VALUES (10, 'E4', '• Velocidad anormal en motor evaporador', '• Motor o turbina obstruida
• Capacitor en mal estado
• Sensor de velocidad dañado o desconectado', NOW());
INSERT INTO error_codes (model_id, code, description, solution, created_at) VALUES (10, 'E5', '• Error de comunicación entre tarjeta evaporador / condensador', '• Revisar voltaje de alimentación
• Comprobar el correcto cableado
• Falla en tarjeta de unidad interior
• Falla en tarjeta en unidad exterior', NOW());
INSERT INTO error_codes (model_id, code, description, solution, created_at) VALUES (10, 'F0', '• Velocidad Anormal en motor condensador', '• Verificar terminales y conexiones eléctricas
• Bobinas internas del motor, baleros o rodamientos, aspa obstruida', NOW());
INSERT INTO error_codes (model_id, code, description, solution, created_at) VALUES (10, 'F1', '• Error en modulo IPM en tarjeta de condensador', '•  Reemplazar la tarjeta del condensador', NOW());
INSERT INTO error_codes (model_id, code, description, solution, created_at) VALUES (10, 'F2', '• Falla en el modulo PFC', '•  Reemplazar la tarjeta del condensador', NOW());
INSERT INTO error_codes (model_id, code, description, solution, created_at) VALUES (10, 'F3', '• Falla en la operación del compresor', '•  Revisar funcionamiento de compresor
•  Compresor bloqueado
•  Fases invertidas en compresor', NOW());
INSERT INTO error_codes (model_id, code, description, solution, created_at) VALUES (10, 'F4', '• Corto circuito o circuito abierto en sensor de tubería de descarga de compresor', '• Medir sensor de temperatura de tubería de descarga de compresor
• Revisar falso contacto', NOW());
INSERT INTO error_codes (model_id, code, description, solution, created_at) VALUES (10, 'F5', '• Alta temperatura en superficie de compresor', '• Baja velocidad del ventilador en la unidad interior o exterior
• Bajo retorno de aire en la unidad interior o la exterior
• Suciedad en serpentín en la unidad interior o la exterior
• Compruebe carga de refrigerante y válvula de expansión
• Compruebe el voltaje de alimentación
• Verificar el correcto funcionamiento del compresor', NOW());
INSERT INTO error_codes (model_id, code, description, solution, created_at) VALUES (10, 'F6', '• Corto circuito o circuito abierto en sensor de temperatura ambiental de condensador', '• Medir el sensor de temperatura de tubería del condensador
• Revisar falso contacto', NOW());
INSERT INTO error_codes (model_id, code, description, solution, created_at) VALUES (10, 'F7', '• Protección contra voltaje anormal (bajo o muy alto voltaje)', '• Comprobar que el voltaje de suministro este dentro del rango aceptable, de lo contrario, contacte a su proveedor para solicitar que realice un ajuste.', NOW());
INSERT INTO error_codes (model_id, code, description, solution, created_at) VALUES (10, 'F8', '• Error de comunicación entre tarjeta evaporador / condensador', '• Revisar voltaje de alimentación
• Comprobar el correcto cableado
• Falla en tarjeta de unidad interior
• Falla en tarjeta en unidad exterior', NOW());
INSERT INTO error_codes (model_id, code, description, solution, created_at) VALUES (10, 'F9', '• Error en memoria EEPROM en tarjeta de condensador', '• Reemplace la tarjeta del condensador', NOW());
INSERT INTO error_codes (model_id, code, description, solution, created_at) VALUES (10, 'FA', '• Fallo del sensor de temperatura de succión', '• Medir sensor de temperatura de succión
• Revisar falso contacto', NOW());
INSERT INTO error_codes (model_id, code, description, solution, created_at) VALUES (10, 'L0', 'Protección por algo o bajo voltaje en bus DC', '• Comprobar que el voltaje de suministro este dentro del rango aceptable, de lo contrario, contacte a su proveedor para solicitar que realice un ajuste.
• Compruebe que no hay perdida una perdida de fase en las lineas de alimentación.
• Revise el reactor
• Verifique si se presenta un daño visible en la tarjeta de condensador.', NOW());
INSERT INTO error_codes (model_id, code, description, solution, created_at) VALUES (10, 'L1', 'Protección por sobrecorriente en compresor', '• Se presento un fallo en el suministo de energia (Desconecte de la alimentacion por 1 minuto para reiniciar la falla).
• Compruebe que el voltaje de alimentacion este dento del rango de trabajo.
• Asegurese que tenga una buena ventilacion el condensador.
• Revise que el ventilador del condensador funciona correctamente.
• Verifique que las terminales del compresor este conectado correctamente o que el compresor no esta bloqueado.
• Si la presion de gas es muy alta, libere el exceso de refrigerante.
• Reemplace la tarjeta del condensador.', NOW());
INSERT INTO error_codes (model_id, code, description, solution, created_at) VALUES (10, 'L2', 'Protección por perdida de fase en compresor', '• Se presento un fallo en el suministo de energia (Desconecte de la alimentacion por 1 minuto para reiniciar la falla).
• Compruebe que el voltaje de alimentacion este dento del rango de trabajo.
• Asegurese que tenga una buena ventilacion el condensador.
• Revise que el ventilador del condensador funciona correctamente.
• Verifique que las terminales del compresor este conectado correctamente o que el compresor no esta bloqueado.
• Si la presion de gas es muy alta, libere el exceso de refrigerante.
• Reemplace la tarjeta del condensador.', NOW());
INSERT INTO error_codes (model_id, code, description, solution, created_at) VALUES (10, 'L3', 'Falla en la secuencia de fase del compresor', '• Verifique que los cable de conexión del compresor esten conectados en el orden correcto.
• Verifique que los cables de conexión del compresor no estén rotos o desconectados.
• Reemplace la tarjeta del condensador.', NOW());
INSERT INTO error_codes (model_id, code, description, solution, created_at) VALUES (10, 'L4', 'Falla en el modulo IPM del compresor', '• Verifique que los cable de conexión del compresor esten conectados en el orden correcto.
• Verifique que los cables de conexión del compresor no esten rotos o desconectados.
• Verifique la resistencia entre terminales de conexión y prueba a tierra para verificar si hay algún daño en el compresor.
• Reemplace la tarjeta del condensador.', NOW());
INSERT INTO error_codes (model_id, code, description, solution, created_at) VALUES (10, 'L5', 'Protección de hardware por sobre corriente en módulo PFC', '• Comprobar que el voltaje de suministro este dentro del rango aceptable, de lo contrario, contacte a su proveedor para solicitar que realice un ajuste.
• Se presento un fallo en el suministo de energia (Desconecte de la alimentacion por 1 minuto para reiniciar la falla).
• Verifique si se presenta un daño visible en la tarjeta de condensador.
• Reemplace la tarjeta del condensador.', NOW());
INSERT INTO error_codes (model_id, code, description, solution, created_at) VALUES (10, 'L6', 'Protección de software por sobrecorriente en modulo PFC', '• Comprobar que el voltaje de suministro este dentro del rango aceptable, de lo contrario, contacte a su proveedor para solicitar que realice un ajuste.
• Se presento un fallo en el suministo de energia (Desconecte de la alimentacion por 1 minuto para reiniciar la falla).
• Verifique si se presenta un daño visible en la tarjeta de condensador.
• Reemplace la tarjeta del condensador.', NOW());
INSERT INTO error_codes (model_id, code, description, solution, created_at) VALUES (10, 'L7', 'Protección por detección anormal de corriente', '• Comprobar que el voltaje de suministro este dentro del rango aceptable, de lo contrario, contacte a su proveedor para solicitar que realice un ajuste.
• Se presento un fallo en el suministo de energia (Desconecte de la alimentacion por 1 minuto para reiniciar la falla).
• Verifique si se presenta un daño visible en la tarjeta de condensador.
• Reemplace la tarjeta del condensador.', NOW());
INSERT INTO error_codes (model_id, code, description, solution, created_at) VALUES (10, 'L8', 'Protección por desequilibrio en resistencia de compresor', '• Verifique si se presenta un daño visible en la tarjeta de condensador.
• Verifique si el cable de conexión esta roto o no esta bien conectado.
• Verifique la resistencia entre terminales de conexión y prueba a tierra para verificar si hay algún daño en el compresor.
• Reemplace la tarjeta del condensador.', NOW());
INSERT INTO error_codes (model_id, code, description, solution, created_at) VALUES (10, 'L9', 'Falla en sensor de temperatura de modulo IPM', '• Verifique si se presenta un daño visible en la tarjeta de condensador.
• Verifique si la velocidad del ventilador en el condensador es anormal.
• Verifique si la presión de gas en el sistema es demasiado alta.
• Reemplace la tarjeta del condensador.', NOW());
INSERT INTO error_codes (model_id, code, description, solution, created_at) VALUES (10, 'LA', 'Falla en el arranque del compresor', '• Verifique si se presenta un daño visible en la tarjeta de condensador.
• Verifique si el cable de conexión esta roto o no esta bien conectado.
• Verifique la resistencia entre terminales de conexion y prueba a tierra para verificar si hay algun daño en el compresor.
• Reemplace la tarjeta del condensador.', NOW());
INSERT INTO error_codes (model_id, code, description, solution, created_at) VALUES (10, 'LC', 'Protección por detección anormal de corriente en modulo PFC', '• Comprobar que el voltaje de suministro este dentro del rango aceptable, de lo contrario, contacte a su proveedor para solicitar que realice un ajuste.
• Se presento un fallo en el suministo de energia (Desconecte de la alimentacion por 1 minuto para reiniciar la falla).
• Verifique si se presenta un daño visible en la tarjeta de condensador.
• Reemplace la tarjeta del condensador.', NOW());
INSERT INTO error_codes (model_id, code, description, solution, created_at) VALUES (10, 'LE', 'Falla en secuencia de fase del motor condensador', '• Verifique si se presenta un daño visible en la tarjeta de condensador.
• Verifique si la velocidad del ventilador en el condensador es anormal.
• Verifique si el cable de conexión esta roto o no esta bien conectado.
• Reemplace la tarjeta del condensador.', NOW());
INSERT INTO error_codes (model_id, code, description, solution, created_at) VALUES (10, 'LF', 'Falla por pérdida de fase del motor condensador', '• Verifique si se presenta un daño visible en la tarjeta de condensador.
• Verifique si la velocidad del ventilador en el condensador es anormal.
• Verifique si el cable de conexión esta roto o no esta bien conectado.
• Reemplace la tarjeta del condensador.', NOW());
INSERT INTO error_codes (model_id, code, description, solution, created_at) VALUES (10, 'LH', 'Falla en funcionamiento del motor condensador', '• Verifique que el conector del motor este correctamente ensamblado en la tarjeta y que no tenga los cables dañados.
• Compruebe que el motor no este dañado
• Revise que el condensador no este bloqueado y que tenga una buena circulación de aire.
• Verifique que la tarjeta de condensador no presente algún daño.', NOW());
INSERT INTO error_codes (model_id, code, description, solution, created_at) VALUES (10, 'Ld', 'Protección por detección anormal de corriente en motor condensador', '• Comprobar que el voltaje de suministro este dentro del rango aceptable, de lo contrario, contacte a su proveedor para solicitar que realice un ajuste.
• Se presento un fallo en el suministo de energia (Desconecte de la alimentacion por 1 minuto para reiniciar la falla).
• Verifique si se presenta un daño visible en la tarjeta de condensador.
• Reemplace la tarjeta del condensador.', NOW());
INSERT INTO error_codes (model_id, code, description, solution, created_at) VALUES (10, 'P2', 'Protección por Alta presión de refrigerante', '• Verifique el estado del switch de presión en el lado de Alta presión, el contacto de este sensor es Normalmente abierto.
• Si la presión es normal y el interruptor de alta presión se mantiene abierto, es seguro que el voltaje de presión falla.
• Si la presión es normal y el interruptor de alta presión se mantiene abierto, es seguro que el voltaje de presión falla;
• Si el interruptor de presión es normal y la línea de conexión está intacta y aún se informa la falla, reemplace la PCB principal correspondiente.', NOW());
INSERT INTO error_codes (model_id, code, description, solution, created_at) VALUES (10, 'P3', 'Fuga o escases de refrigerante', '• Verifique que las válvulas de la unidad exterior están abiertas.
• Verifique si el evaporador, el condensador ó kit de conexión están dañados o agrietados.
• Compruebe que el sensor de temperatura ambiente y el sensor de temperatura de pozo están dañados o descalibrados.', NOW());
INSERT INTO error_codes (model_id, code, description, solution, created_at) VALUES (10, 'P4', 'Protección por sobrecarga', '• La temperatura ambiente es demasiado alta o demasiado baja (Revisar sensores de temperatura)
• Intercambiador de calor sucio (limpiar el intercambiador de calor)
• La velocidad del motor exterior es baja (verifique el cableado del motor)
• Capilar obstruido', NOW());
INSERT INTO error_codes (model_id, code, description, solution, created_at) VALUES (10, 'P5', 'Protección por alta temperatura en descarga de compresor', '• Verifique que la presión del sistema.
• Verifique si la entrada de aire interior/exterior tiene alguna obstrucción, por ejemplo, si el evaporador o el condensador están sucios o si el filtro está sucio o bloqueado. si la entrada está afectada, retire el obstrucción.
• Compruebe el valor de resistencia del sensor de descarga de condensador.', NOW());
INSERT INTO error_codes (model_id, code, description, solution, created_at) VALUES (10, 'P6', 'Protección por alta temperatura del serpentín de la unidad interior en modo calefacción', '• Verifique que la entrada de aire en el evaporador no  tenga obstrucciones.
• Compruebe si el filtro está sucio. Si es así, limpie el filtro con agua fría.
• Verifique si el volumen de aire de inyección es demasiado pequeño y si el ventilador de la unidad interior está sucio, si es así, limpie la turbina.
• Compruebe que el sensor de temperatura ambiente y el sensor de temperatura de pozo están dañados o descalibrados.', NOW());
INSERT INTO error_codes (model_id, code, description, solution, created_at) VALUES (10, 'P7', 'Protección por congelamiento en unidad interior', '• Verifique que la entrada de aire en el evaporador no  tenga obstrucciones.
• Compruebe si el filtro está sucio. Si es así, limpie el filtro con agua fría.
• Verifique si el volumen de aire de inyección es demasiado pequeño y si el ventilador de la unidad interior está sucio, si es así, limpie la turbina.
• Compruebe que el sensor de temperatura ambiente y el sensor de temperatura de pozo están dañados o descalibrados.', NOW());
INSERT INTO error_codes (model_id, code, description, solution, created_at) VALUES (10, 'P8', 'Protección por sobre corriente', '1. Use un multímetro para detectar y verificar si el voltaje de AC es demasiado bajo.
2. Use un manómetro para verificar si la presión del sistema excede el estándar. Si la presión supera el estándar, puede provocar un bloqueo del sistema.
3. Reemplace el controlador de la unidad exterior.', NOW());
INSERT INTO air_conditioner_models (id, name, reference_id, image_url, logo_url, type, created_at) VALUES (11, 'INVERTER Q17', 'inverter_q17', '/images/equipos/inverterq17.png', '/images/logos/inverterq17.png', '', NOW()) ON CONFLICT (id) DO NOTHING;
INSERT INTO error_codes (model_id, code, description, solution, created_at) VALUES (11, 'E0', '• Alta temperatura en superficie de compresor', '• Baja velocidad del ventilador en la unidad interior o exterior
• Bajo retorno de aire en la unidad interior o la exterior
• Suciedad en serpentín en la unidad interior o la exterior
• Compruebe carga de refrigerante y válvula de expansión
• Compruebe el voltaje de alimentación
• Verificar el correcto funcionamiento del compresor', NOW());
INSERT INTO error_codes (model_id, code, description, solution, created_at) VALUES (11, 'E3', '• Protección por sobre corriente en modulo IPM en tarjeta de condensador', '• Reemplazar la tarjeta del condensador', NOW());
INSERT INTO error_codes (model_id, code, description, solution, created_at) VALUES (11, 'E4', 'Arranque anormal del compresor', '• Rotación invertida:
Verificar el orden de conexión terminales UVW.
• Perdida de Fase:
Verificar terminales UVW que salen del modulo y llegan al compresor estén conectadas firmemente.
• Modulo de control:
La tarjeta en la unidad condensadora no esta generando la señal de potencia para el compresor.
• Compresor:
Revisar la resistencia entre las terminales del compresor. Si las 3 mediciones mediciones deben ser casi iguales, de lo contrario, el compresor presenta daño interno.', NOW());
INSERT INTO error_codes (model_id, code, description, solution, created_at) VALUES (11, 'E7', '• Velocidad Anormal en motor condensador', '• Verificar terminales y conexiones eléctricas
• Bobinas internas del motor, baleros o rodamientos, aspa obstruida', NOW());
INSERT INTO error_codes (model_id, code, description, solution, created_at) VALUES (11, 'E8', '• Falla en compresor', '• Verificar terminales y conexiones eléctricas
• Revisar la resistencia de los embobinados del compresor.', NOW());
INSERT INTO error_codes (model_id, code, description, solution, created_at) VALUES (11, 'EF', '• Falla en memoria EEPROM en tarjeta de condensador', '• Reemplace tarjeta del condensador', NOW());
INSERT INTO error_codes (model_id, code, description, solution, created_at) VALUES (11, 'F0', '• Velocidad anormal en motor evaporador', '• Motor o turbina obstruida
• Sensor de velocidad dañado o desconectado
• Capacitor en mal estado', NOW());
INSERT INTO error_codes (model_id, code, description, solution, created_at) VALUES (11, 'F1', '• Corto circuito o circuito abierto en sensor de temperatura ambiente en evaporador', '• Medir el sensor de temperatura ambiente del evaporador
• Revisar falso contacto', NOW());
INSERT INTO error_codes (model_id, code, description, solution, created_at) VALUES (11, 'F2', '• Corto circuito o circuito abierto en sensor de temperatura ambiente en condensador', '• Medir el sensor de temperatura ambiente del condensador
• Revisar falso contacto', NOW());
INSERT INTO error_codes (model_id, code, description, solution, created_at) VALUES (11, 'F3', '• Corto circuito o circuito abierto en sensor de pozo en evaporador', '• Medir el sensor de pozo del evaporador
• Revisar falso contacto', NOW());
INSERT INTO error_codes (model_id, code, description, solution, created_at) VALUES (11, 'F4', '• Corto circuito o circuito abierto en sensor de pozo en condensador', '• Medir el sensor de pozo del condensador
• Revisar falso contacto', NOW());
INSERT INTO error_codes (model_id, code, description, solution, created_at) VALUES (11, 'F5', '• El sensor de temperatura de descarga del compresor está abierto o presenta corto circuito', '• El sensor de temperatura de descarga del compresor no ha sido conectado correctamente o está dañado. Revíselo contra la tabla de resistencias vs temperatura del sensor
• El sensor de temperatura de descarga del compresor no ha sido insertado a la tubería en la linea de descarga', NOW());
INSERT INTO error_codes (model_id, code, description, solution, created_at) VALUES (11, 'F6', '• Error de comunicación entre tarjeta evaporador / condensador.', '• Revisar voltaje de alimentación
• Comprobar el correcto cableado
• Falla en tarjeta de unidad interior
• Falla en tarjeta en unidad exterior', NOW());
INSERT INTO error_codes (model_id, code, description, solution, created_at) VALUES (11, 'F8', '• Error de comunicación entre tarjeta evaporador / condensador.', '• Revisar voltaje de alimentación
• Comprobar el correcto cableado
• Falla en tarjeta de unidad interior
• Falla en tarjeta en unidad exterior', NOW());
INSERT INTO error_codes (model_id, code, description, solution, created_at) VALUES (11, 'F9', '• Protección en modulo IPM', '• Reemplace tarjeta de condensador', NOW());
INSERT INTO error_codes (model_id, code, description, solution, created_at) VALUES (11, 'Fd', '• Falla en memoria EEPROM en tarjeta de evaporador', '• Reemplace tarjeta del evaporador', NOW());
INSERT INTO error_codes (model_id, code, description, solution, created_at) VALUES (11, 'P1', '• Alta temperatura en descarga de compresor', '• Baja velocidad del ventilador en la unidad interior o exterior
• Bajo retorno de aire en la unidad interior o la exterior
• Suciedad en serpentín en la unidad interior o la exterior
• La tapa del condensador esta suelta y no circula el aire correctamente
• Verificar el correcto funcionamiento del sensor de temperatura de tubo en unidad exterior', NOW());
INSERT INTO air_conditioner_models (id, name, reference_id, image_url, logo_url, type, created_at) VALUES (12, 'INVERTER V32', 'inverter_v32', '/images/equipos/inverter_v32.png', '/images/logos/inverter_v32.png', '', NOW()) ON CONFLICT (id) DO NOTHING;
INSERT INTO error_codes (model_id, code, description, solution, created_at) VALUES (12, 'E0', '• Alta temperatura en superficie de compresor', '• Baja velocidad del ventilador en la unidad interior o exterior
• Bajo retorno de aire en la unidad interior o la exterior
• Suciedad en serpentín en la unidad interior o la exterior
• Compruebe carga de refrigerante y válvula de expansión
• Compruebe el voltaje de alimentación
• Verificar el correcto funcionamiento del compresor', NOW());
INSERT INTO error_codes (model_id, code, description, solution, created_at) VALUES (12, 'E3', '• Protección por sobre corriente en modulo IPM en tarjeta de condensador', '• Reemplazar la tarjeta del condensador', NOW());
INSERT INTO error_codes (model_id, code, description, solution, created_at) VALUES (12, 'E4', 'Arranque anormal del compresor', '• Rotación invertida:
Verificar el orden de conexión terminales UVW.
• Perdida de Fase:
Verificar terminales UVW que salen del modulo y llegan al compresor estén conectadas firmemente.
• Modulo de control:
La tarjeta en la unidad condensadora no esta generando la señal de potencia para el compresor.
• Compresor:
Revisar la resistencia entre las terminales del compresor. Si las 3 mediciones mediciones deben ser casi iguales, de lo contrario, el compresor presenta daño interno.', NOW());
INSERT INTO error_codes (model_id, code, description, solution, created_at) VALUES (12, 'E7', '• Velocidad Anormal en motor condensador', '• Verificar terminales y conexiones eléctricas
• Bobinas internas del motor, baleros o rodamientos, aspa obstruida', NOW());
INSERT INTO error_codes (model_id, code, description, solution, created_at) VALUES (12, 'E8', '• Falla en compresor', '• Verificar terminales y conexiones eléctricas
• Revisar la resistencia de los embobinados del compresor.', NOW());
INSERT INTO error_codes (model_id, code, description, solution, created_at) VALUES (12, 'EE', '• Error en memoria EEPROM en tarjeta de evaporador.', '•Reemplace tarjeta del evaporador', NOW());
INSERT INTO error_codes (model_id, code, description, solution, created_at) VALUES (12, 'EF', '• Falla en memoria EEPROM en tarjeta de condensador', '• Reemplace tarjeta del condensador', NOW());
INSERT INTO error_codes (model_id, code, description, solution, created_at) VALUES (12, 'F0', '• Velocidad anormal en motor evaporador', '• Motor o turbina obstruida
• Sensor de velocidad dañado o desconectado
• Capacitor en mal estado', NOW());
INSERT INTO error_codes (model_id, code, description, solution, created_at) VALUES (12, 'F1', '• Corto circuito o circuito abierto en sensor de temperatura ambiente en evaporador', '• Medir el sensor de temperatura ambiente del evaporador
• Revisar falso contacto', NOW());
INSERT INTO error_codes (model_id, code, description, solution, created_at) VALUES (12, 'F2', '• Corto circuito o circuito abierto en sensor de temperatura ambiente en condensador', '• Medir el sensor de temperatura ambiente del condensador
• Revisar falso contacto', NOW());
INSERT INTO error_codes (model_id, code, description, solution, created_at) VALUES (12, 'F3', '• Corto circuito o circuito abierto en sensor de pozo en evaporador', '• Medir el sensor de pozo del evaporador
• Revisar falso contacto', NOW());
INSERT INTO error_codes (model_id, code, description, solution, created_at) VALUES (12, 'F4', '• Corto circuito o circuito abierto en sensor de pozo en condensador', '• Medir el sensor de pozo del condensador
• Revisar falso contacto', NOW());
INSERT INTO error_codes (model_id, code, description, solution, created_at) VALUES (12, 'F5', '• El sensor de temperatura de descarga del compresor está abierto o presenta corto circuito', '• El sensor de temperatura de descarga del compresor no ha sido conectado correctamente o está dañado. Revíselo contra la tabla de resistencias vs temperatura del sensor
• El sensor de temperatura de descarga del compresor no ha sido insertado a la tubería en la linea de descarga', NOW());
INSERT INTO error_codes (model_id, code, description, solution, created_at) VALUES (12, 'F6', '• Error de comunicación entre tarjeta evaporador / condensador.', '• Revisar voltaje de alimentación
• Comprobar el correcto cableado
• Falla en tarjeta de unidad interior
• Falla en tarjeta en unidad exterior', NOW());
INSERT INTO error_codes (model_id, code, description, solution, created_at) VALUES (12, 'F8', '• Error de comunicación entre tarjeta evaporador / condensador.', '• Revisar voltaje de alimentación
• Comprobar el correcto cableado
• Falla en tarjeta de unidad interior
• Falla en tarjeta en unidad exterior', NOW());
INSERT INTO error_codes (model_id, code, description, solution, created_at) VALUES (12, 'F9', '• Protección en modulo IPM', '• Reemplace tarjeta de condensador', NOW());
INSERT INTO error_codes (model_id, code, description, solution, created_at) VALUES (12, 'Fd', '• Falla en memoria EEPROM en tarjeta de evaporador', '• Reemplace tarjeta del evaporador', NOW());
INSERT INTO error_codes (model_id, code, description, solution, created_at) VALUES (12, 'P1', '• Alta temperatura en descarga de compresor', '• Baja velocidad del ventilador en la unidad interior o exterior
• Bajo retorno de aire en la unidad interior o la exterior
• Suciedad en serpentín en la unidad interior o la exterior
• La tapa del condensador esta suelta y no circula el aire correctamente
• Verificar el correcto funcionamiento del sensor de temperatura de tubo en unidad exterior', NOW());
INSERT INTO air_conditioner_models (id, name, reference_id, image_url, logo_url, type, created_at) VALUES (13, 'INVERTER X', 'inverter_x', '/images/equipos/inverterx.png', '/images/logos/inverterx.png', '', NOW()) ON CONFLICT (id) DO NOTHING;
INSERT INTO error_codes (model_id, code, description, solution, created_at) VALUES (13, 'AP', 'Modo AP activado.
El modulo Wifi se encuentra activado para iniciar la configuracion.', '', NOW());
INSERT INTO error_codes (model_id, code, description, solution, created_at) VALUES (13, 'CL', 'Limpieza de filtros', '• Limpie los filtros de aire
• Quite la energía por 2 minutos y conéctela nuevamente para quitar el código.', NOW());
INSERT INTO error_codes (model_id, code, description, solution, created_at) VALUES (13, 'E0', '• Error en memoria EEPROM en tarjeta de evaporador.', '•Reemplace tarjeta del evaporador', NOW());
INSERT INTO error_codes (model_id, code, description, solution, created_at) VALUES (13, 'E1', '• Error de comunicación entre tarjeta evaporador / condensador.', '• Revisar voltaje de alimentación
• Comprobar el correcto cableado
• Falla en tarjeta de unidad interior
• Falla en tarjeta en unidad exterior', NOW());
INSERT INTO error_codes (model_id, code, description, solution, created_at) VALUES (13, 'E2', '• Error de detección de cruce por cero en tarjeta evaporador', '•  Reemplazar tarjeta principal del evaporador', NOW());
INSERT INTO error_codes (model_id, code, description, solution, created_at) VALUES (13, 'E3', '• Velocidad anormal en motor evaporador', '• Motor o turbina obstruida
• Capacitor en mal estado
• Sensor de velocidad dañado o desconectado', NOW());
INSERT INTO error_codes (model_id, code, description, solution, created_at) VALUES (13, 'E4', '• Corto circuito o circuito abierto en sensor de temperatura ambiental de evaporador', '• Medir el sensor del evaporador 
• Revisar falso contacto', NOW());
INSERT INTO error_codes (model_id, code, description, solution, created_at) VALUES (13, 'E5', '• Corto circuito o circuito abierto en sensor de tubería de evaporador', '• Medir sensor de temperatura de tubería del evaporador
• Revisar falso contacto', NOW());
INSERT INTO error_codes (model_id, code, description, solution, created_at) VALUES (13, 'EC', '• Fuga o escasez de refrigerante', '• Verificar presiones de refrigerante
• Válvulas de servicio cerradas o abiertas parcialmente
• Switch de baja presión dañado
• Presenta perdida de refrigerante', NOW());
INSERT INTO error_codes (model_id, code, description, solution, created_at) VALUES (13, 'EC07', 'Velocidad anormal en motor condensador.', '• Motor obstruido
• Capacitor en mal estado.
• Sensor de velocidad dañado o desconectado.', NOW());
INSERT INTO error_codes (model_id, code, description, solution, created_at) VALUES (13, 'EC52', '• Corto circuito o circuito abierto en sensor de tubería de condensador.', '• Medir sensor de temperatura de tubería del condensador.
• Verificar falso contacto.', NOW());
INSERT INTO error_codes (model_id, code, description, solution, created_at) VALUES (13, 'EC53', '• Corto circuito o circuito abierto en sensor de temperatura ambiente de condensador', '• Medir sensor de temperatura ambiente de condensador
• Revisar falso contacto', NOW());
INSERT INTO error_codes (model_id, code, description, solution, created_at) VALUES (13, 'EC54', '• Corto circuito o circuito abierto en sensor de tubería de descarga de compresor', '• Medir sensor de temperatura de tubería del condensador
• Revisar falso contacto', NOW());
INSERT INTO error_codes (model_id, code, description, solution, created_at) VALUES (13, 'EH00', 'Error en memoria EEPROM en tarjeta de evaporador.', '•Reemplace tarjeta del evaporador', NOW());
INSERT INTO error_codes (model_id, code, description, solution, created_at) VALUES (13, 'EH02', 'Error de detección de cruce por cero en tarjeta evaporador', '• Reemplazar tarjeta principal del evaporador', NOW());
INSERT INTO error_codes (model_id, code, description, solution, created_at) VALUES (13, 'EH03', '• Velocidad anormal en motor evaporador', '• Motor o turbina obstruida
• Capacitor en mal estado
• Sensor de velocidad dañado o desconectado', NOW());
INSERT INTO error_codes (model_id, code, description, solution, created_at) VALUES (13, 'EH0b', 'Falla de comunicación entre tarjeta del evaporador y tarjeta display.', '• Verificar cable de interconexión.
• Falla en tarjeta de unidad interior
• Falla en tarjeta display.', NOW());
INSERT INTO error_codes (model_id, code, description, solution, created_at) VALUES (13, 'EH60', 'Corto circuito o circuito abierto en sensor de temperatura ambiente de evaporador.', '• Medir sensor de temperatura ambiente de evaporador.
• Revisar falso contacto.', NOW());
INSERT INTO error_codes (model_id, code, description, solution, created_at) VALUES (13, 'EH61', '• Corto circuito o circuito abierto en sensor de tubería de evaporador', '• Medir el sensor de tubería de evaporador
• Revisar falso contacto', NOW());
INSERT INTO error_codes (model_id, code, description, solution, created_at) VALUES (13, 'EL01', '• Error de comunicación entre tarjeta evaporador / condensador.', '• Revisar voltaje de alimentación.
• Comprobar el correcto cableado.
• Falla en tarjeta de unidad interior.
• Falla en tarjeta en unidad exterior.', NOW());
INSERT INTO error_codes (model_id, code, description, solution, created_at) VALUES (13, 'EL0C', '• Fuga o escasez de refrigerante', '• Verificar presiones de refrigerante
• Válvulas de servicio cerradas o abiertas parcialmente
• Falla sensor pozo en evaporador
• Capacitor de compresor/ventilador dañado
• Falla en ventilador externo
• Presenta perdida de refrigerante', NOW());
INSERT INTO error_codes (model_id, code, description, solution, created_at) VALUES (13, 'F0', '• Protección contra sobre corriente activada', '• Verificar parámetros eléctricos de la instalación
• Revisar uniones y conexiones del cableado eléctrico
• Pobre condensación
• Presiones de refrigerante elevadas o fuera de rango
• Carga térmica excesiva o equipo sobre forzado', NOW());
INSERT INTO error_codes (model_id, code, description, solution, created_at) VALUES (13, 'F1', '• Corto circuito o circuito abierto en sensor de temperatura ambiental de condensador', '• Medir el sensor de temperatura ambiental del condensador
• Revisar falso contacto', NOW());
INSERT INTO error_codes (model_id, code, description, solution, created_at) VALUES (13, 'F2', '• Corto circuito o circuito abierto en sensor de tubería de condensador', '• Medir sensor de temperatura de tubería del condensador
• Revisar falso contacto', NOW());
INSERT INTO error_codes (model_id, code, description, solution, created_at) VALUES (13, 'F3', '• Corto circuito o circuito abierto en sensor de tubería de descarga de compresor', '• Medir sensor de temperatura de tubería de descarga de compresor
• Revisar falso contacto', NOW());
INSERT INTO error_codes (model_id, code, description, solution, created_at) VALUES (13, 'F4', '• Error en memoria EEPROM en tarjeta de condensador', '• Reemplace tarjeta del condensador', NOW());
INSERT INTO error_codes (model_id, code, description, solution, created_at) VALUES (13, 'F5', '• Velocidad Anormal en motor condensador', '• Verificar terminales y conexiones eléctricas
• Bobinas internas del motor, baleros o rodamientos, aspa obstruida', NOW());
INSERT INTO error_codes (model_id, code, description, solution, created_at) VALUES (13, 'FC', 'Función de enfriamiento forzado.', 'Esta función se activa cuando se enciende el equipo por medio de el botón de emergencia en la unidad evaporador.', NOW());
INSERT INTO error_codes (model_id, code, description, solution, created_at) VALUES (13, 'P0', '• Error en modulo IPM o IGBT en tarjeta de condensador', '• Reemplace tarjeta del condensador', NOW());
INSERT INTO error_codes (model_id, code, description, solution, created_at) VALUES (13, 'P1', '• Protección contra voltaje anormal (bajo o muy alto voltaje)', '• Comprobar que el voltaje de suministro este dentro del rango aceptable, de lo contrario, contacte a su proveedor para solicitar que realice un ajuste.', NOW());
INSERT INTO error_codes (model_id, code, description, solution, created_at) VALUES (13, 'P2', '• Alta temperatura en superficie de compresor', '• Baja velocidad del ventilador en la unidad interior o exterior
• Bajo retorno de aire en la unidad interior o la exterior
• Suciedad en serpentín en la unidad interior o la exterior
• Compruebe carga de refrigerante y válvula de expansión
• Compruebe el voltaje de alimentación
• Verificar el correcto funcionamiento del compresor', NOW());
INSERT INTO error_codes (model_id, code, description, solution, created_at) VALUES (13, 'P3', '• Temperatura exterior menor a -25°C. (Calefacción)', '• Esperar a que temperatura exterior se estabilice.', NOW());
INSERT INTO error_codes (model_id, code, description, solution, created_at) VALUES (13, 'P4', '• Falla en "Driver" del compresor', '• Reemplace tarjeta del condensador', NOW());
INSERT INTO error_codes (model_id, code, description, solution, created_at) VALUES (13, 'P5', '• Conflicto de operación', '• El evaporador NO es compatible con el condensador', NOW());
INSERT INTO error_codes (model_id, code, description, solution, created_at) VALUES (13, 'P6', '• Protección por alta o baja presión de refrigerante', '• Verifique el estado del switch de presión en el lado de baja o alta presión.
• Verifique el la condensadora cuente con los espacios correctos.', NOW());
INSERT INTO error_codes (model_id, code, description, solution, created_at) VALUES (13, 'PC00', '• Error en modulo IPM o IGBT en tarjeta de condensador', '• Reemplace tarjeta del condensador', NOW());
INSERT INTO error_codes (model_id, code, description, solution, created_at) VALUES (13, 'PC01', '• Protección contra voltaje anormal (bajo o muy alto voltaje)', '• Comprobar que el voltaje de suministro este dentro del rango aceptable, de lo contrario, contacte a su proveedor para solicitar que realice un ajuste.
• Revise el reactor', NOW());
INSERT INTO error_codes (model_id, code, description, solution, created_at) VALUES (13, 'PC02', '• Alta temperatura en superficie de compresor', '• Baja velocidad del ventilador en la unidad interior o exterior
• Bajo retorno de aire en la unidad interior o la exterior
• Suciedad en serpentín en la unidad interior o la exterior
• Compruebe carga de refrigerante y válvula de expansión
• Compruebe el voltaje de alimentación
• Verificar el correcto funcionamiento del compresor', NOW());
INSERT INTO error_codes (model_id, code, description, solution, created_at) VALUES (13, 'PC03', '• Protección por baja presión de refrigerante', '• Verifique el estado del switch de presión en el lado de baja.', NOW());
INSERT INTO error_codes (model_id, code, description, solution, created_at) VALUES (13, 'PC04', '• Falla en "Driver" del compresor', '• Compruebe la correcta conexión en la tarjeta del condensador al compresor
• Revise el funcionamiento del ventilador exterior e interior
• Compruebe los valores de resistencia del compresor
• Reemplace tarjeta del condensador', NOW());
INSERT INTO error_codes (model_id, code, description, solution, created_at) VALUES (13, 'PC08', 'Se detecto un aumento excesivo en la corriente de trabajo del equipo.', '• Se presento un fallo en el suministo de energia (Desconecte de la alimentacion por 1 minuto para reiniciar la falla)
• Compruebe que el voltaje de alimentacion este dento del rango de trabajo
• Asegurese que tenga una buena ventilacion el condensador
• Revise que el ventilador del condensador funciona correctamente
• Compruebe que no hay objetos o suciedad en serpentin de condensador
• Si la presion de gas es muy alta, libere el exceso de refrigerante
• Reemplace la tarjeta del condensador', NOW());
INSERT INTO error_codes (model_id, code, description, solution, created_at) VALUES (13, 'SC', 'Función de Auto Limpieza', 'No es una falla. El código SC se muestra en el display cuando la función de auto limpieza esta activada.', NOW());
INSERT INTO error_codes (model_id, code, description, solution, created_at) VALUES (13, 'cF', '• El equipo se encuentra en etapa de pre-calentamiento justo antes de iniciar el modo calefacción', '• Esperar 5 minutos para iniciar modo de calefacción normalmente', NOW());
INSERT INTO error_codes (model_id, code, description, solution, created_at) VALUES (13, 'dF', '• El equipo se encuentra en modo de des-congelamiento.', '• Espere a que termine el ciclo de des-congelamiento.', NOW());
INSERT INTO air_conditioner_models (id, name, reference_id, image_url, logo_url, type, created_at) VALUES (14, 'LIFE+', 'life+', '/images/equipos/lifeplus.png', '/images/logos/lifeplus.png', '', NOW()) ON CONFLICT (id) DO NOTHING;
INSERT INTO error_codes (model_id, code, description, solution, created_at) VALUES (14, 'E2', 'Error de detección de cruce por cero en tarjeta evaporador', '•  Reemplazar tarjeta principal del evaporador.', NOW());
INSERT INTO error_codes (model_id, code, description, solution, created_at) VALUES (14, 'E3', 'Velocidad anormal en motor evaporador.', '• Motor o turbina obstruida.
• Capacitor en mal estado.
• Sensor de velocidad dañado o desconectado.', NOW());
INSERT INTO error_codes (model_id, code, description, solution, created_at) VALUES (14, 'E5', 'Corto circuito o circuito abierto en sensor de tubería de evaporador.', '• Medir sensor de temperatura de tubería del evaporador.
• Revisar  falso contacto.', NOW());
INSERT INTO error_codes (model_id, code, description, solution, created_at) VALUES (14, 'E7', 'Falla de comunicación entre tarjeta del evaporador y tarjeta display.', '• Verificar cable de interconexión.
• Falla en tarjeta de unidad interior.
• Falla en tarjeta display.', NOW());
INSERT INTO error_codes (model_id, code, description, solution, created_at) VALUES (14, 'EC', '• Fuga o escasez de refrigerante.', '• Verificar presiones de refrigerante.
• Válvulas de servicio cerradas o abiertas parcialmente.
• Switch de baja presión dañado.
• Presenta perdida de refrigerante.', NOW());
INSERT INTO error_codes (model_id, code, description, solution, created_at) VALUES (14, 'EC07', 'Velocidad anormal en motor condensador.', '• Motor obstruido
• Capacitor en mal estado.
• Sensor de velocidad dañado o desconectado.', NOW());
INSERT INTO error_codes (model_id, code, description, solution, created_at) VALUES (14, 'EH00', 'Error en memoria EEPROM en tarjeta de evaporador.', '•Reemplace tarjeta del evaporador', NOW());
INSERT INTO error_codes (model_id, code, description, solution, created_at) VALUES (14, 'EH02', 'Error de detección de cruce por cero en tarjeta evaporador', '• Reemplazar tarjeta principal del evaporador.', NOW());
INSERT INTO error_codes (model_id, code, description, solution, created_at) VALUES (14, 'EH03', 'Velocidad anormal en motor evaporador.', '"• Motor o turbina obstruida.
• Capacitor en mal estado.
• Sensor de velocidad dañado o desconectado."', NOW());
INSERT INTO error_codes (model_id, code, description, solution, created_at) VALUES (14, 'EH60', 'Corto circuito o circuito abierto en sensor de temperatura ambiente de evaporador.', '• Medir sensor de temperatura ambiente de evaporador.
• Revisar falso contacto.', NOW());
INSERT INTO error_codes (model_id, code, description, solution, created_at) VALUES (14, 'EH61', 'Corto circuito o circuito abierto en sensor de tubería de evaporador.', '• Medir sensor de temperatura de tubería del evaporador.
• Revisar falso contacto.', NOW());
INSERT INTO error_codes (model_id, code, description, solution, created_at) VALUES (14, 'EL01', 'Error de comunicación entre tarjeta evaporador / condensador. (Modelo 2 Ton)', '• Revisar voltaje de alimentación.
• Comprobar el correcto cableado.
• Falla en tarjeta de unidad interior.
• Falla en tarjeta en unidad exterior.', NOW());
INSERT INTO error_codes (model_id, code, description, solution, created_at) VALUES (14, 'EL0C', '• Fuga o escasez de refrigerante.', '• Verificar presiones de refrigerante.
• Válvulas de servicio cerradas o abiertas parcialmente.
• Switch de baja presión dañado.
• Presenta perdida de refrigerante.', NOW());
INSERT INTO error_codes (model_id, code, description, solution, created_at) VALUES (14, 'PC03', 'Protección por alta presión', '• Sensor de alta presión
• Tarjeta de condensador
• Protección por alta presión
• Falta de refrigerante', NOW());
INSERT INTO error_codes (model_id, code, description, solution, created_at) VALUES (14, 'cF', '• El equipo se encuentra en etapa de pre-calentamiento justo antes de iniciar el modo calefacción', '• Esperar 5 minutos para iniciar modo de calefacción normalmente', NOW());
INSERT INTO air_conditioner_models (id, name, reference_id, image_url, logo_url, type, created_at) VALUES (15, 'LIFE12', 'life12', '/images/equipos/life12.png', '/images/logos/life12.png', '', NOW()) ON CONFLICT (id) DO NOTHING;
INSERT INTO error_codes (model_id, code, description, solution, created_at) VALUES (15, 'E0', 'Error en memoria EEPROM en tarjeta de evaporador.', '•Reemplace tarjeta del evaporador', NOW());
INSERT INTO error_codes (model_id, code, description, solution, created_at) VALUES (15, 'E1', 'Error de comunicación entre tarjeta evaporador / condensador. (Modelo 2 Ton)', '• Revisar voltaje de alimentación.
• Comprobar el correcto cableado.
• Falla en tarjeta de unidad interior.
• Falla en tarjeta en unidad exterior.', NOW());
INSERT INTO error_codes (model_id, code, description, solution, created_at) VALUES (15, 'E2', 'Error de detección de cruce por cero en tarjeta evaporador', '•  Reemplazar tarjeta principal del evaporador.', NOW());
INSERT INTO error_codes (model_id, code, description, solution, created_at) VALUES (15, 'E3', 'Velocidad anormal en motor evaporador.', '• Motor o turbina obstruida.
• Capacitor en mal estado.
• Sensor de velocidad dañado o desconectado.', NOW());
INSERT INTO error_codes (model_id, code, description, solution, created_at) VALUES (15, 'E5', 'Corto circuito o circuito abierto en sensor de tubería de evaporador.', '• Medir sensor de temperatura de tubería del evaporador.
• Revisar  falso contacto.', NOW());
INSERT INTO error_codes (model_id, code, description, solution, created_at) VALUES (15, 'E6', 'Corto circuito o circuito abierto en sensor de temperatura ambiental de evaporador.', '• Medir el sensor del evaporador.
• Revisar falso contacto.', NOW());
INSERT INTO error_codes (model_id, code, description, solution, created_at) VALUES (15, 'E7', 'Falla de comunicación entre tarjeta del evaporador y tarjeta display.', '• Verificar cable de interconexión.
• Falla en tarjeta de unidad interior.
• Falla en tarjeta display.', NOW());
INSERT INTO error_codes (model_id, code, description, solution, created_at) VALUES (15, 'E8', 'Velocidad anormal en motor condensador.', '• Motor o turbina obstruida.
• Capacitor en mal estado.
• Conecte los cables de alimentación correctamente.
• Reemplace tarjeta de condensador.', NOW());
INSERT INTO error_codes (model_id, code, description, solution, created_at) VALUES (15, 'E9', '• Error de comunicación entre tarjeta evaporador / condensador. (modelos 2 tons)', '• Revisar voltaje de alimentación
• Comprobar el correcto cableado
• Falla en tarjeta de unidad interior
• Falla en tarjeta en unidad exterior', NOW());
INSERT INTO error_codes (model_id, code, description, solution, created_at) VALUES (15, 'EC', '• Fuga o escasez de refrigerante.', '• Verificar presiones de refrigerante.
• Válvulas de servicio cerradas o abiertas parcialmente.
• Switch de baja presión dañado.
• Presenta perdida de refrigerante.', NOW());
INSERT INTO error_codes (model_id, code, description, solution, created_at) VALUES (15, 'EC07', 'Velocidad anormal en motor condensador.', '• Motor obstruido
• Capacitor en mal estado.
• Sensor de velocidad dañado o desconectado.', NOW());
INSERT INTO error_codes (model_id, code, description, solution, created_at) VALUES (15, 'EC52', '• Corto circuito o circuito abierto en sensor de tubería de condensador.', '• Medir sensor de temperatura de tubería del condensador.
• Verificar falso contacto.', NOW());
INSERT INTO error_codes (model_id, code, description, solution, created_at) VALUES (15, 'EH00', 'Error en memoria EEPROM en tarjeta de evaporador.', '•Reemplace tarjeta del evaporador', NOW());
INSERT INTO error_codes (model_id, code, description, solution, created_at) VALUES (15, 'EH02', 'Error de detección de cruce por cero en tarjeta evaporador', '• Reemplazar tarjeta principal del evaporador.', NOW());
INSERT INTO error_codes (model_id, code, description, solution, created_at) VALUES (15, 'EH03', 'Velocidad anormal en motor evaporador.', '"• Motor o turbina obstruida.
• Capacitor en mal estado.
• Sensor de velocidad dañado o desconectado."', NOW());
INSERT INTO error_codes (model_id, code, description, solution, created_at) VALUES (15, 'EH0b', 'Falla de comunicación entre tarjeta del evaporador y tarjeta display.', '• Verificar cable de interconexión.
• Falla en tarjeta de unidad interior
• Falla en tarjeta display.', NOW());
INSERT INTO error_codes (model_id, code, description, solution, created_at) VALUES (15, 'EH60', 'Corto circuito o circuito abierto en sensor de temperatura ambiente de evaporador.', '• Medir sensor de temperatura ambiente de evaporador.
• Revisar falso contacto.', NOW());
INSERT INTO error_codes (model_id, code, description, solution, created_at) VALUES (15, 'EH61', 'Corto circuito o circuito abierto en sensor de tubería de evaporador.', '• Medir sensor de temperatura de tubería del evaporador.
• Revisar falso contacto.', NOW());
INSERT INTO error_codes (model_id, code, description, solution, created_at) VALUES (15, 'EL01', 'Error de comunicación entre tarjeta evaporador / condensador. (Modelo 2 Ton)', '• Revisar voltaje de alimentación.
• Comprobar el correcto cableado.
• Falla en tarjeta de unidad interior.
• Falla en tarjeta en unidad exterior.', NOW());
INSERT INTO error_codes (model_id, code, description, solution, created_at) VALUES (15, 'EL0C', '• Fuga o escasez de refrigerante.', '• Verificar presiones de refrigerante.
• Válvulas de servicio cerradas o abiertas parcialmente.
• Switch de baja presión dañado.
• Presenta perdida de refrigerante.', NOW());
INSERT INTO error_codes (model_id, code, description, solution, created_at) VALUES (15, 'F2', '• Corto circuito o circuito abierto en sensor de tubería de condensador.', '• Medir sensor de temperatura de tubería del condensador.
• Verificar falso contacto.', NOW());
INSERT INTO error_codes (model_id, code, description, solution, created_at) VALUES (15, 'PC03', 'Protección por alta presión', '• Sensor de alta presión
• Tarjeta de condensador
• Protección por alta presión
• Falta de refrigerante', NOW());
INSERT INTO error_codes (model_id, code, description, solution, created_at) VALUES (15, 'cF', '• El equipo se encuentra en etapa de pre-calentamiento justo antes de iniciar el modo calefacción', '• Esperar 5 minutos para iniciar modo de calefacción normalmente', NOW());
INSERT INTO error_codes (model_id, code, description, solution, created_at) VALUES (15, 'dF', '• El equipo se encuentra en modo de des-congelamiento.', '• Espere a que termine el ciclo de des-congelamiento.', NOW());
INSERT INTO air_conditioner_models (id, name, reference_id, image_url, logo_url, type, created_at) VALUES (16, 'LIFE12 PLUS', 'life12_plus', '/images/equipos/life12_plus.png', '/images/logos/life12_plus.png', '', NOW()) ON CONFLICT (id) DO NOTHING;
INSERT INTO error_codes (model_id, code, description, solution, created_at) VALUES (16, 'EC07', 'Velocidad anormal en motor condensador.', '• Motor obstruido
• Capacitor en mal estado.
• Sensor de velocidad dañado o desconectado.', NOW());
INSERT INTO error_codes (model_id, code, description, solution, created_at) VALUES (16, 'EC52', '• Corto circuito o circuito abierto en sensor de tubería de condensador.', '• Medir sensor de temperatura de tubería del condensador.
• Verificar falso contacto.', NOW());
INSERT INTO error_codes (model_id, code, description, solution, created_at) VALUES (16, 'EH00', 'Error en memoria EEPROM en tarjeta de evaporador.', '•Reemplace tarjeta del evaporador', NOW());
INSERT INTO error_codes (model_id, code, description, solution, created_at) VALUES (16, 'EH02', 'Error de detección de cruce por cero en tarjeta evaporador', '• Reemplazar tarjeta principal del evaporador.', NOW());
INSERT INTO error_codes (model_id, code, description, solution, created_at) VALUES (16, 'EH03', 'Velocidad anormal en motor evaporador.', '"• Motor o turbina obstruida.
• Capacitor en mal estado.
• Sensor de velocidad dañado o desconectado."', NOW());
INSERT INTO error_codes (model_id, code, description, solution, created_at) VALUES (16, 'EH0b', 'Falla de comunicación entre tarjeta del evaporador y tarjeta display.', '• Verificar cable de interconexión.
• Falla en tarjeta de unidad interior
• Falla en tarjeta display.', NOW());
INSERT INTO error_codes (model_id, code, description, solution, created_at) VALUES (16, 'EH60', 'Corto circuito o circuito abierto en sensor de temperatura ambiente de evaporador.', '• Medir sensor de temperatura ambiente de evaporador.
• Revisar falso contacto.', NOW());
INSERT INTO error_codes (model_id, code, description, solution, created_at) VALUES (16, 'EH61', 'Corto circuito o circuito abierto en sensor de tubería de evaporador.', '• Medir sensor de temperatura de tubería del evaporador.
• Revisar falso contacto.', NOW());
INSERT INTO error_codes (model_id, code, description, solution, created_at) VALUES (16, 'EL01', 'Error de comunicación entre tarjeta evaporador / condensador. (Modelo 2 Ton)', '• Revisar voltaje de alimentación.
• Comprobar el correcto cableado.
• Falla en tarjeta de unidad interior.
• Falla en tarjeta en unidad exterior.', NOW());
INSERT INTO error_codes (model_id, code, description, solution, created_at) VALUES (16, 'EL0C', '• Fuga o escasez de refrigerante.', '• Verificar presiones de refrigerante.
• Válvulas de servicio cerradas o abiertas parcialmente.
• Switch de baja presión dañado.
• Presenta perdida de refrigerante.', NOW());
INSERT INTO error_codes (model_id, code, description, solution, created_at) VALUES (16, 'PC03', 'Protección por alta presión', '• Sensor de alta presión
• Tarjeta de condensador
• Protección por alta presión
• Falta de refrigerante', NOW());
INSERT INTO error_codes (model_id, code, description, solution, created_at) VALUES (16, 'cF', '• El equipo se encuentra en etapa de pre-calentamiento justo antes de iniciar el modo calefacción', '• Esperar 5 minutos para iniciar modo de calefacción normalmente', NOW());
INSERT INTO error_codes (model_id, code, description, solution, created_at) VALUES (16, 'dF', '• El equipo se encuentra en modo de des-congelamiento.', '• Espere a que termine el ciclo de des-congelamiento.', NOW());
INSERT INTO air_conditioner_models (id, name, reference_id, image_url, logo_url, type, created_at) VALUES (17, 'LIVE', 'live', '/images/equipos/live.png', '/images/logos/live.png', '', NOW()) ON CONFLICT (id) DO NOTHING;
INSERT INTO air_conditioner_models (id, name, reference_id, image_url, logo_url, type, created_at) VALUES (18, 'M19 PLATINUM', 'm19_platinum', '/images/equipos/m19_platinum.png', '/images/logos/m19_platinum.png', '', NOW()) ON CONFLICT (id) DO NOTHING;
INSERT INTO error_codes (model_id, code, description, solution, created_at) VALUES (18, 'AP', 'Modo AP activado.
El modulo Wifi se encuentra activado para iniciar la configuracion.', '', NOW());
INSERT INTO error_codes (model_id, code, description, solution, created_at) VALUES (18, 'E0', '• Error en memoria EEPROM en tarjeta de evaporador.', '•Reemplace tarjeta del evaporador', NOW());
INSERT INTO error_codes (model_id, code, description, solution, created_at) VALUES (18, 'E1', '• Error de comunicación entre tarjeta evaporador / condensador.', '• Revisar voltaje de alimentación
• Comprobar el correcto cableado
• Falla en tarjeta de unidad interior
• Falla en tarjeta en unidad exterior', NOW());
INSERT INTO error_codes (model_id, code, description, solution, created_at) VALUES (18, 'E2', '• Error de detección de cruce por cero en tarjeta evaporador', '•  Reemplazar tarjeta principal del evaporador', NOW());
INSERT INTO error_codes (model_id, code, description, solution, created_at) VALUES (18, 'E3', '• Velocidad anormal en motor evaporador', '• Motor o turbina obstruida
• Capacitor en mal estado
• Sensor de velocidad dañado o desconectado', NOW());
INSERT INTO error_codes (model_id, code, description, solution, created_at) VALUES (18, 'E4', '• Corto circuito o circuito abierto en sensor de temperatura ambiental de evaporador', '• Medir el sensor del evaporador 
• Revisar falso contacto', NOW());
INSERT INTO error_codes (model_id, code, description, solution, created_at) VALUES (18, 'E5', '• Corto circuito o circuito abierto en sensor de tubería de evaporador', '• Medir sensor de temperatura de tubería del evaporador
• Revisar falso contacto', NOW());
INSERT INTO error_codes (model_id, code, description, solution, created_at) VALUES (18, 'EC', '• Fuga o escasez de refrigerante', '• Verificar presiones de refrigerante
• Válvulas de servicio cerradas o abiertas parcialmente
• Switch de baja presión dañado
• Presenta perdida de refrigerante', NOW());
INSERT INTO error_codes (model_id, code, description, solution, created_at) VALUES (18, 'EC07', 'Velocidad anormal en motor condensador.', '• Motor obstruido
• Capacitor en mal estado.
• Sensor de velocidad dañado o desconectado.', NOW());
INSERT INTO error_codes (model_id, code, description, solution, created_at) VALUES (18, 'EC53', '• Corto circuito o circuito abierto en sensor de temperatura ambiente de condensador', '• Medir sensor de temperatura ambiente de condensador
• Revisar falso contacto', NOW());
INSERT INTO error_codes (model_id, code, description, solution, created_at) VALUES (18, 'EC54', '• Corto circuito o circuito abierto en sensor de tubería de descarga de compresor', '• Medir sensor de temperatura de tubería del condensador
• Revisar falso contacto', NOW());
INSERT INTO error_codes (model_id, code, description, solution, created_at) VALUES (18, 'EH00', 'Error en memoria EEPROM en tarjeta de evaporador.', '•Reemplace tarjeta del evaporador', NOW());
INSERT INTO error_codes (model_id, code, description, solution, created_at) VALUES (18, 'EH02', 'Error de detección de cruce por cero en tarjeta evaporador', '• Reemplazar tarjeta principal del evaporador', NOW());
INSERT INTO error_codes (model_id, code, description, solution, created_at) VALUES (18, 'EH03', '• Velocidad anormal en motor evaporador', '• Motor o turbina obstruida
• Capacitor en mal estado
• Sensor de velocidad dañado o desconectado', NOW());
INSERT INTO error_codes (model_id, code, description, solution, created_at) VALUES (18, 'EH0b', 'Falla de comunicación entre tarjeta del evaporador y tarjeta display.', '• Verificar cable de interconexión.
• Falla en tarjeta de unidad interior
• Falla en tarjeta display.', NOW());
INSERT INTO error_codes (model_id, code, description, solution, created_at) VALUES (18, 'EH60', 'Corto circuito o circuito abierto en sensor de temperatura ambiente de evaporador.', '• Medir sensor de temperatura ambiente de evaporador.
• Revisar falso contacto.', NOW());
INSERT INTO error_codes (model_id, code, description, solution, created_at) VALUES (18, 'EH61', '• Corto circuito o circuito abierto en sensor de tubería de evaporador', '• Medir el sensor de tubería de evaporador
• Revisar falso contacto', NOW());
INSERT INTO error_codes (model_id, code, description, solution, created_at) VALUES (18, 'EL01', '• Error de comunicación entre tarjeta evaporador / condensador.', '• Revisar voltaje de alimentación.
• Comprobar el correcto cableado.
• Falla en tarjeta de unidad interior.
• Falla en tarjeta en unidad exterior.', NOW());
INSERT INTO error_codes (model_id, code, description, solution, created_at) VALUES (18, 'EL0C', '• Fuga o escasez de refrigerante', '• Verificar presiones de refrigerante
• Válvulas de servicio cerradas o abiertas parcialmente
• Falla sensor pozo en evaporador
• Capacitor de compresor/ventilador dañado
• Falla en ventilador externo
• Presenta perdida de refrigerante', NOW());
INSERT INTO error_codes (model_id, code, description, solution, created_at) VALUES (18, 'F0', '• Protección contra sobre corriente activada', '• Verificar parámetros eléctricos de la instalación
• Revisar uniones y conexiones del cableado eléctrico
• Pobre condensación
• Presiones de refrigerante elevadas o fuera de rango
• Carga térmica excesiva o equipo sobre forzado', NOW());
INSERT INTO error_codes (model_id, code, description, solution, created_at) VALUES (18, 'F1', '• Corto circuito o circuito abierto en sensor de temperatura ambiental de condensador', '• Medir el sensor de temperatura ambiental del condensador
• Revisar falso contacto', NOW());
INSERT INTO error_codes (model_id, code, description, solution, created_at) VALUES (18, 'F2', '• Corto circuito o circuito abierto en sensor de tubería de condensador', '• Medir sensor de temperatura de tubería del condensador
• Revisar falso contacto', NOW());
INSERT INTO error_codes (model_id, code, description, solution, created_at) VALUES (18, 'F3', '• Corto circuito o circuito abierto en sensor de tubería de descarga de compresor', '• Medir sensor de temperatura de tubería de descarga de compresor
• Revisar falso contacto', NOW());
INSERT INTO error_codes (model_id, code, description, solution, created_at) VALUES (18, 'F4', '• Error en memoria EEPROM en tarjeta de condensador', '• Reemplace tarjeta del condensador', NOW());
INSERT INTO error_codes (model_id, code, description, solution, created_at) VALUES (18, 'F5', '• Velocidad Anormal en motor condensador', '• Verificar terminales y conexiones eléctricas
• Bobinas internas del motor, baleros o rodamientos, aspa obstruida', NOW());
INSERT INTO error_codes (model_id, code, description, solution, created_at) VALUES (18, 'FC', 'Función de enfriamiento forzado.', 'Esta función se activa cuando se enciende el equipo por medio de el botón de emergencia en la unidad evaporador.', NOW());
INSERT INTO error_codes (model_id, code, description, solution, created_at) VALUES (18, 'P0', '• Error en modulo IPM o IGBT en tarjeta de condensador', '• Reemplace tarjeta del condensador', NOW());
INSERT INTO error_codes (model_id, code, description, solution, created_at) VALUES (18, 'P1', '• Protección contra voltaje anormal (bajo o muy alto voltaje)', '• Comprobar que el voltaje de suministro este dentro del rango aceptable, de lo contrario, contacte a su proveedor para solicitar que realice un ajuste.', NOW());
INSERT INTO error_codes (model_id, code, description, solution, created_at) VALUES (18, 'P2', '• Alta temperatura en superficie de compresor', '• Baja velocidad del ventilador en la unidad interior o exterior
• Bajo retorno de aire en la unidad interior o la exterior
• Suciedad en serpentín en la unidad interior o la exterior
• Compruebe carga de refrigerante y válvula de expansión
• Compruebe el voltaje de alimentación
• Verificar el correcto funcionamiento del compresor', NOW());
INSERT INTO error_codes (model_id, code, description, solution, created_at) VALUES (18, 'P3', '• Temperatura exterior menor a -25°C. (Calefacción)', '• Esperar a que temperatura exterior se estabilice.', NOW());
INSERT INTO error_codes (model_id, code, description, solution, created_at) VALUES (18, 'P4', '• Falla en "Driver" del compresor', '• Reemplace tarjeta del condensador', NOW());
INSERT INTO error_codes (model_id, code, description, solution, created_at) VALUES (18, 'P5', '• Conflicto de operación', '• El evaporador NO es compatible con el condensador', NOW());
INSERT INTO error_codes (model_id, code, description, solution, created_at) VALUES (18, 'P6', '• Protección por alta o baja presión de refrigerante', '• Verifique el estado del switch de presión en el lado de baja o alta presión.
• Verifique el la condensadora cuente con los espacios correctos.', NOW());
INSERT INTO error_codes (model_id, code, description, solution, created_at) VALUES (18, 'PC00', '• Error en modulo IPM o IGBT en tarjeta de condensador', '• Reemplace tarjeta del condensador', NOW());
INSERT INTO error_codes (model_id, code, description, solution, created_at) VALUES (18, 'PC01', '• Protección contra voltaje anormal (bajo o muy alto voltaje)', '• Comprobar que el voltaje de suministro este dentro del rango aceptable, de lo contrario, contacte a su proveedor para solicitar que realice un ajuste.
• Revise el reactor', NOW());
INSERT INTO error_codes (model_id, code, description, solution, created_at) VALUES (18, 'PC02', '• Alta temperatura en superficie de compresor', '• Baja velocidad del ventilador en la unidad interior o exterior
• Bajo retorno de aire en la unidad interior o la exterior
• Suciedad en serpentín en la unidad interior o la exterior
• Compruebe carga de refrigerante y válvula de expansión
• Compruebe el voltaje de alimentación
• Verificar el correcto funcionamiento del compresor', NOW());
INSERT INTO error_codes (model_id, code, description, solution, created_at) VALUES (18, 'PC03', '• Protección por baja presión de refrigerante', '• Verifique el estado del switch de presión en el lado de baja.', NOW());
INSERT INTO error_codes (model_id, code, description, solution, created_at) VALUES (18, 'PC04', '• Falla en "Driver" del compresor', '• Compruebe la correcta conexión en la tarjeta del condensador al compresor
• Revise el funcionamiento del ventilador exterior e interior
• Compruebe los valores de resistencia del compresor
• Reemplace tarjeta del condensador', NOW());
INSERT INTO error_codes (model_id, code, description, solution, created_at) VALUES (18, 'PC08', 'Se detecto un aumento excesivo en la corriente de trabajo del equipo.', '• Se presento un fallo en el suministo de energia (Desconecte de la alimentacion por 1 minuto para reiniciar la falla)
• Compruebe que el voltaje de alimentacion este dento del rango de trabajo
• Asegurese que tenga una buena ventilacion el condensador
• Revise que el ventilador del condensador funciona correctamente
• Compruebe que no hay objetos o suciedad en serpentin de condensador
• Si la presion de gas es muy alta, libere el exceso de refrigerante
• Reemplace la tarjeta del condensador', NOW());
INSERT INTO error_codes (model_id, code, description, solution, created_at) VALUES (18, 'SC', 'Función de Auto Limpieza', 'No es una falla. El código SC se muestra en el display cuando la función de auto limpieza esta activada.', NOW());
INSERT INTO error_codes (model_id, code, description, solution, created_at) VALUES (18, 'cF', '• El equipo se encuentra en etapa de pre-calentamiento justo antes de iniciar el modo calefacción', '• Esperar 5 minutos para iniciar modo de calefacción normalmente', NOW());
INSERT INTO error_codes (model_id, code, description, solution, created_at) VALUES (18, 'dF', '• El equipo se encuentra en modo de des-congelamiento.', '• Espere a que termine el ciclo de des-congelamiento.', NOW());
INSERT INTO air_conditioner_models (id, name, reference_id, image_url, logo_url, type, created_at) VALUES (19, 'M900XERIES', 'm900xeries', '/images/equipos/m900xeries.png', '/images/logos/m900xeries.png', '', NOW()) ON CONFLICT (id) DO NOTHING;
INSERT INTO error_codes (model_id, code, description, solution, created_at) VALUES (19, 'E1', '• Corto o circuito abierto en sensor de aire', '• Medir sensor de pozo del evaporador
• Revisar falso contacto', NOW());
INSERT INTO error_codes (model_id, code, description, solution, created_at) VALUES (19, 'E2', '• Corto o circuito abierto en sensor de tubería (pozo) del evaporador', '• Medir sensor de tubería del evaporador.
• Revisar falso contacto', NOW());
INSERT INTO error_codes (model_id, code, description, solution, created_at) VALUES (19, 'E6', '• Velocidad del motor evaporador menor a 200 RPM por más de 5 segundos', '• Motor o turbina obstruida
• Capacitor en mal estado
• Sensor de velocidad dañado o desconectado', NOW());
INSERT INTO air_conditioner_models (id, name, reference_id, image_url, logo_url, type, created_at) VALUES (20, 'MAGNUM13', 'magnum13', '/images/equipos/magnum13.png', '/images/logos/magnum13.png', '', NOW()) ON CONFLICT (id) DO NOTHING;
INSERT INTO error_codes (model_id, code, description, solution, created_at) VALUES (20, 'E1', '• Corto o circuito abierto en sensor de tubería (pozo) del condensador.', '• Medir sensor de pozo del condensador
• Revisar falso contacto', NOW());
INSERT INTO error_codes (model_id, code, description, solution, created_at) VALUES (20, 'E2', '• Corto o circuito abierto en sensor de aire', '• Medir el sensor de aire del evaporador
• Revisar falso contacto', NOW());
INSERT INTO error_codes (model_id, code, description, solution, created_at) VALUES (20, 'E3', '• Corto o circuito abierto en sensor de tubería (pozo) del evaporador', '• Medir sensor de tubería del evaporador.
• Revisar falso contacto', NOW());
INSERT INTO error_codes (model_id, code, description, solution, created_at) VALUES (20, 'E4', '• Anormalidad en el condensador', '• Verificar corriente del compresor y estado del capacitor
• Verificar presiones de alta y baja, aspa, motor
• Verificar obstrucciones en el serpentín', NOW());
INSERT INTO error_codes (model_id, code, description, solution, created_at) VALUES (20, 'E5', '• Velocidad del motor evaporador menor a 200 RPM por más de 5 segundos', '"• Motor o turbina obstruida
• Capacitor en mal estado
• Sensor de velocidad dañado o desconectado.', NOW());
INSERT INTO error_codes (model_id, code, description, solution, created_at) VALUES (20, 'E6', '• Falla en tarjeta principal', '• Reemplace la tarjeta', NOW());
INSERT INTO error_codes (model_id, code, description, solution, created_at) VALUES (20, 'E7', '• Falla de comunicación', '• Verificar cable de interconexión
• Bobinado del compresor
• Consumo de corriente anormal en el condensador', NOW());
INSERT INTO error_codes (model_id, code, description, solution, created_at) VALUES (20, 'E8', '• Temperatura anormal en el serpentín evaporador. Si esta en modo COOL puede ser congelamiento, si esta en modo HEAT sobrecalentamiento', '• Revisar espacio entre retorno y techo debe de haber 12 cm mínimo
• Evaporador o turbina sucia
• Termistor de aire o pozo fuera de rango
• Baja RPM en el motor del evaporador
• Exceso refrigerante', NOW());
INSERT INTO error_codes (model_id, code, description, solution, created_at) VALUES (20, 'dF', '• El equipo se encuentra en modo de descongelamiento o se ejecuta la función “Anti Cool Wave”.', '• Espere a que termine el ciclo de descongelamiento', NOW());
INSERT INTO air_conditioner_models (id, name, reference_id, image_url, logo_url, type, created_at) VALUES (21, 'MAGNUM15', 'magnum15', '/images/equipos/magnum15.png', '/images/logos/magnum15.png', '', NOW()) ON CONFLICT (id) DO NOTHING;
INSERT INTO error_codes (model_id, code, description, solution, created_at) VALUES (21, 'C5', '• Falla de protección del jumper', '• Coloque el JUMPER correspondiente en la tarjeta de control', NOW());
INSERT INTO error_codes (model_id, code, description, solution, created_at) VALUES (21, 'E1', '• Protección por alta presión de refrigerante', '• Sobre carga de refrigerante
• Poco intercambio de calor (puede estar muy sucio el serpentín o muy cerca de un muro)
• La temperatura ambiente podría ser muy alta', NOW());
INSERT INTO error_codes (model_id, code, description, solution, created_at) VALUES (21, 'E6', '• Falla de comunicación entre evaporador y condensador', '• Revisar las conexiones eléctricas entre evaporador y condensador', NOW());
INSERT INTO error_codes (model_id, code, description, solution, created_at) VALUES (21, 'E8', '• Protección por alta temperatura', '• Revisar espacio entre retorno y techo debe de haber 12 cm mínimo
• Evaporador o turbina sucia
• Termistor de aire o pozo fuera de rango
• Baja RPM en el motor del evaporador
• Exceso de refrigerante', NOW());
INSERT INTO error_codes (model_id, code, description, solution, created_at) VALUES (21, 'F0', 'Protección por bloqueo en circuito de gas refrigerante', '• Revisar perdida de gas en el sistema.
• El circuito de gas presenta un bloqueo por dobles o contaminación.
• Verificar el funcionamiento de los sensores.
• Verificar la correcta apertura de las válvulas.', NOW());
INSERT INTO error_codes (model_id, code, description, solution, created_at) VALUES (21, 'F1', '• El sensor de temperatura ambiente de la unidad interior está abierto o tiene corto circuito', '• Sensor de temperatura ambiente flojo o suelto, sin hacer contacto fijo con la tarjeta principal
• Componentes en tablero principal caídos causan corto circuito
• Sensor de temperatura ambiente dañado', NOW());
INSERT INTO error_codes (model_id, code, description, solution, created_at) VALUES (21, 'F2', '• EL sensor de tubería del evaporador está abierto o tiene corto circuito', '• Sensor de temperatura de tubería del evaporador esta flojo o suelto, sin hacer contacto fijo con la terminal de la tarjeta principal.
• Componentes de la tarjeta principal caídos causan corto circuito
• Sensor de temperatura de tubería dañado (verificar con tabla de valores de resistencia vs temperatura)
• Tarjeta principal dañada', NOW());
INSERT INTO error_codes (model_id, code, description, solution, created_at) VALUES (21, 'F3', '• El sensor de temperatura ambiente externo está abierto o tiene corto circuito', '• El sensor de temperatura externo no está bien conectado o está dañado. Revíselo contra la tabla de resistencias – temperatura del sensor', NOW());
INSERT INTO error_codes (model_id, code, description, solution, created_at) VALUES (21, 'F4', '• El sensor de pozo del condensador está abierto o tiene corto circuito', '• El sensor de temperatura de pozo no está bien conectado o ha sido dañado. Revíselo contra la tabla de resistencias vs temperaturas del sensor', NOW());
INSERT INTO error_codes (model_id, code, description, solution, created_at) VALUES (21, 'F5', '• El sensor de temperatura de descarga del condensador está abierto o tiene corto circuito', '• El sensor de temperatura de descarta no ha sido conectado correctamente o está dañado. Revíselo contra la tabla de resistencias vs temperatura del sensor
• La cabeza de sensor de temperatura no ha sido insertado a la tubería en la linea de descarga', NOW());
INSERT INTO error_codes (model_id, code, description, solution, created_at) VALUES (21, 'H1', '• El equipo se encuentra en modo descongelamiento inteligente en un comportamiento normal de los equipos con calefacción', '• El equipo realiza el proceso de deshielo automáticamente, asegurando que este listo para operar la calefacción', NOW());
INSERT INTO error_codes (model_id, code, description, solution, created_at) VALUES (21, 'H5', '• Protección del modulo inversor', '• Revise las conexiones de los bornes del compresor. • Revise las boninas del compresor. • Revise los voltajes de entrada y salida del modulo inversor.', NOW());
INSERT INTO error_codes (model_id, code, description, solution, created_at) VALUES (21, 'H6', '• Velocidad del motor evaporador menor a 200 RPM por mas de 5 segundos', '• Motor o turbina obstruida
• Capacitor en mal estado
• Sensor de velocidad dañado o desconectado', NOW());
INSERT INTO error_codes (model_id, code, description, solution, created_at) VALUES (21, 'L3', '• Falla en la corriente directa del motor del abanico externo', '• Falla en el motor del abanico de corriente directa o sistema bloqueado o conector flojo (sin hacer contacto).', NOW());
INSERT INTO air_conditioner_models (id, name, reference_id, image_url, logo_url, type, created_at) VALUES (22, 'MAGNUM16', 'magnum16', '/images/equipos/magnum16.png', '/images/logos/magnum16.png', '', NOW()) ON CONFLICT (id) DO NOTHING;
INSERT INTO error_codes (model_id, code, description, solution, created_at) VALUES (22, 'E0', '• Error en memoria EEPROM en tarjeta de evaporador', '• En esta situación se requiere el cambio de la tarjeta del evaporador', NOW());
INSERT INTO error_codes (model_id, code, description, solution, created_at) VALUES (22, 'E1', '• Error de comunicación entre tarjeta evaporador / condensador', '• Revisar voltaje de alimentación
• Comprobar el correcto cableado
• Falla en tarjeta de unidad interior
• Falla en tarjeta en unidad exterior', NOW());
INSERT INTO error_codes (model_id, code, description, solution, created_at) VALUES (22, 'E2', '• Error de detección de cruce por cero en tarjeta evaporador', '• Reemplace la tarjeta de evaporador', NOW());
INSERT INTO error_codes (model_id, code, description, solution, created_at) VALUES (22, 'E3', '• Velocidad anormal en motor evaporador', '• Motor o turbina obstruida
• Capacitor en mal estado
• Sensor de velocidad dañado o desconectado', NOW());
INSERT INTO error_codes (model_id, code, description, solution, created_at) VALUES (22, 'E4', '• Corto circuito o circuito abierto en sensor de temperatura de evaporador', '• Medir el sensor del evaporador 
• Revisar falso contacto', NOW());
INSERT INTO error_codes (model_id, code, description, solution, created_at) VALUES (22, 'E5', '• Corto circuito o circuito abierto en sensor de temperatura de tubería de evaporador', '• Medir sensor de temperatura de tubería del evaporador
• Revisar falso contacto', NOW());
INSERT INTO error_codes (model_id, code, description, solution, created_at) VALUES (22, 'E6', '• Corto circuito o circuito abierto en sensor de tubería en evaporador.', '• Medir sensor de tubería del evaporador
• Revisar falso contacto', NOW());
INSERT INTO error_codes (model_id, code, description, solution, created_at) VALUES (22, 'EC', '• Fuga o escasez de refrigerante', '• Verificar presiones de refrigerante
• Válvulas de servicio cerradas o abiertas parcialmente
• Switch de baja presión dañado
• Presenta perdida de refrigerante', NOW());
INSERT INTO error_codes (model_id, code, description, solution, created_at) VALUES (22, 'F1', '• Corto circuito o circuito abierto en sensor de temperatura ambiental de condensador', '• Medir el sensor de temperatura de tubería del condensador (pozo)
• Revisar falso contacto', NOW());
INSERT INTO error_codes (model_id, code, description, solution, created_at) VALUES (22, 'F2', '• Corto circuito o circuito abierto en sensor de temperatura de tubería de condensador', '• Medir sensor de temperatura de tubería del condensador.
• Revisar falso contacto', NOW());
INSERT INTO error_codes (model_id, code, description, solution, created_at) VALUES (22, 'F3', '• Corto circuito o circuito abierto en sensor de temperatura de tubería de descarga de compresor', '• Medir sensor de temperatura de tubería de descarga de compresor
• Revisar falso contacto', NOW());
INSERT INTO error_codes (model_id, code, description, solution, created_at) VALUES (22, 'F4', '• Error en memoria EEPROM en tarjeta de condensador', '• Reemplace la tarjeta del condensador', NOW());
INSERT INTO error_codes (model_id, code, description, solution, created_at) VALUES (22, 'P0', '• Error en modulo IPM o IGBT en tarjeta de condensador', '• Reemplace la tarjeta del condensador', NOW());
INSERT INTO error_codes (model_id, code, description, solution, created_at) VALUES (22, 'P1', '• Protección contra voltaje anormal. (bajo o muy alto voltaje)', '• Comprobar que el voltaje de suministro este dentro del rango aceptable, si no, contacte a su proveedor para solicitar que realice un ajuste', NOW());
INSERT INTO error_codes (model_id, code, description, solution, created_at) VALUES (22, 'P2', '• Alta temperatura en superficie de compresor. (Solo equipo 2 Ton)', '• Baja velocidad del ventilador en la unidad interior o exterior
• Bajo retorno de aire en la unidad interior o la exterior 
• Suciedad en serpentín en la unidad interior o la exterior
• Compruebe carga de refrigerante y válvula de expansión
• Compruebe el voltaje de alimentación
• Verificar el correcto funcionamiento del compresor', NOW());
INSERT INTO error_codes (model_id, code, description, solution, created_at) VALUES (22, 'P4', '• Falla en "Driver" del compresor inverter', '• Reemplace tarjeta del condensador', NOW());
INSERT INTO air_conditioner_models (id, name, reference_id, image_url, logo_url, type, created_at) VALUES (23, 'MAGNUM17', 'magnum17', '/images/equipos/magnum17.png', '/images/logos/magnum17.png', '', NOW()) ON CONFLICT (id) DO NOTHING;
INSERT INTO error_codes (model_id, code, description, solution, created_at) VALUES (23, 'AP', 'Modo AP activado.
El modulo Wifi se encuentra activado para iniciar la configuracion.', '', NOW());
INSERT INTO error_codes (model_id, code, description, solution, created_at) VALUES (23, 'E0', '• Error en memoria EEPROM en tarjeta de evaporador.', '•Reemplace tarjeta del evaporador', NOW());
INSERT INTO error_codes (model_id, code, description, solution, created_at) VALUES (23, 'E1', '• Error de comunicación entre tarjeta evaporador / condensador.', '• Revisar voltaje de alimentación
• Comprobar el correcto cableado
• Falla en tarjeta de unidad interior
• Falla en tarjeta en unidad exterior', NOW());
INSERT INTO error_codes (model_id, code, description, solution, created_at) VALUES (23, 'E2', '• Error de detección de cruce por cero en tarjeta evaporador', '•  Reemplazar tarjeta principal del evaporador', NOW());
INSERT INTO error_codes (model_id, code, description, solution, created_at) VALUES (23, 'E3', '• Velocidad anormal en motor evaporador', '• Motor o turbina obstruida
• Capacitor en mal estado
• Sensor de velocidad dañado o desconectado', NOW());
INSERT INTO error_codes (model_id, code, description, solution, created_at) VALUES (23, 'E4', '• Corto circuito o circuito abierto en sensor de temperatura ambiental de evaporador', '• Medir el sensor del evaporador 
• Revisar falso contacto', NOW());
INSERT INTO error_codes (model_id, code, description, solution, created_at) VALUES (23, 'E5', '• Corto circuito o circuito abierto en sensor de tubería de evaporador', '• Medir sensor de temperatura de tubería del evaporador
• Revisar falso contacto', NOW());
INSERT INTO error_codes (model_id, code, description, solution, created_at) VALUES (23, 'EC', '• Fuga o escasez de refrigerante', '• Verificar presiones de refrigerante
• Válvulas de servicio cerradas o abiertas parcialmente
• Switch de baja presión dañado
• Presenta perdida de refrigerante', NOW());
INSERT INTO error_codes (model_id, code, description, solution, created_at) VALUES (23, 'F0', '• Protección contra sobre corriente activada', '• Verificar parámetros eléctricos de la instalación
• Revisar uniones y conexiones del cableado eléctrico
• Pobre condensación
• Presiones de refrigerante elevadas o fuera de rango
• Carga térmica excesiva o equipo sobre forzado', NOW());
INSERT INTO error_codes (model_id, code, description, solution, created_at) VALUES (23, 'F1', '• Corto circuito o circuito abierto en sensor de temperatura ambiental de condensador', '• Medir el sensor de temperatura ambiental del condensador
• Revisar falso contacto', NOW());
INSERT INTO error_codes (model_id, code, description, solution, created_at) VALUES (23, 'F2', '• Corto circuito o circuito abierto en sensor de tubería de condensador', '• Medir sensor de temperatura de tubería del condensador
• Revisar falso contacto', NOW());
INSERT INTO error_codes (model_id, code, description, solution, created_at) VALUES (23, 'F3', '• Corto circuito o circuito abierto en sensor de tubería de descarga de compresor', '• Medir sensor de temperatura de tubería de descarga de compresor
• Revisar falso contacto', NOW());
INSERT INTO error_codes (model_id, code, description, solution, created_at) VALUES (23, 'F4', '• Error en memoria EEPROM en tarjeta de condensador', '• Reemplace tarjeta del condensador', NOW());
INSERT INTO error_codes (model_id, code, description, solution, created_at) VALUES (23, 'F5', '• Velocidad Anormal en motor condensador', '• Verificar terminales y conexiones eléctricas
• Bobinas internas del motor, baleros o rodamientos, aspa obstruida', NOW());
INSERT INTO error_codes (model_id, code, description, solution, created_at) VALUES (23, 'P0', '• Error en modulo IPM o IGBT en tarjeta de condensador', '• Reemplace tarjeta del condensador', NOW());
INSERT INTO error_codes (model_id, code, description, solution, created_at) VALUES (23, 'P1', '• Protección contra voltaje anormal (bajo o muy alto voltaje)', '• Comprobar que el voltaje de suministro este dentro del rango aceptable, de lo contrario, contacte a su proveedor para solicitar que realice un ajuste.', NOW());
INSERT INTO error_codes (model_id, code, description, solution, created_at) VALUES (23, 'P2', '• Alta temperatura en superficie de compresor', '• Baja velocidad del ventilador en la unidad interior o exterior
• Bajo retorno de aire en la unidad interior o la exterior
• Suciedad en serpentín en la unidad interior o la exterior
• Compruebe carga de refrigerante y válvula de expansión
• Compruebe el voltaje de alimentación
• Verificar el correcto funcionamiento del compresor', NOW());
INSERT INTO error_codes (model_id, code, description, solution, created_at) VALUES (23, 'P3', '• Temperatura exterior menor a -25°C. (Calefacción)', '• Esperar a que temperatura exterior se estabilice.', NOW());
INSERT INTO error_codes (model_id, code, description, solution, created_at) VALUES (23, 'P4', '• Falla en "Driver" del compresor', '• Reemplace tarjeta del condensador', NOW());
INSERT INTO error_codes (model_id, code, description, solution, created_at) VALUES (23, 'P5', '• Conflicto de operación', '• El evaporador NO es compatible con el condensador', NOW());
INSERT INTO error_codes (model_id, code, description, solution, created_at) VALUES (23, 'P6', '• Protección por alta o baja presión de refrigerante', '• Verifique el estado del switch de presión en el lado de baja o alta presión.
• Verifique el la condensadora cuente con los espacios correctos.', NOW());
INSERT INTO error_codes (model_id, code, description, solution, created_at) VALUES (23, 'cF', '• El equipo se encuentra en etapa de pre-calentamiento justo antes de iniciar el modo calefacción', '• Esperar 5 minutos para iniciar modo de calefacción normalmente', NOW());
INSERT INTO error_codes (model_id, code, description, solution, created_at) VALUES (23, 'dF', '• El equipo se encuentra en modo de des-congelamiento.', '• Espere a que termine el ciclo de des-congelamiento.', NOW());
INSERT INTO air_conditioner_models (id, name, reference_id, image_url, logo_url, type, created_at) VALUES (24, 'MAGNUM18', 'magnum18', '/images/equipos/magnum18.png', '/images/logos/magnum18.png', '', NOW()) ON CONFLICT (id) DO NOTHING;
INSERT INTO error_codes (model_id, code, description, solution, created_at) VALUES (24, 'C5', '• Falla de protección del jumper', '• Coloque el JUMPER correspondiente en la tarjeta de control', NOW());
INSERT INTO error_codes (model_id, code, description, solution, created_at) VALUES (24, 'E1', '• Protección por alta presión de refrigerante', '• Sobre carga de refrigerante
• Poco intercambio de calor (puede estar muy sucio el serpentín o muy cerca de un muro)
• La temperatura ambiente podría ser muy alta', NOW());
INSERT INTO error_codes (model_id, code, description, solution, created_at) VALUES (24, 'E6', '• Falla de comunicación entre evaporador y condensador', '• Revisar las conexiones eléctricas entre evaporador y condensador', NOW());
INSERT INTO error_codes (model_id, code, description, solution, created_at) VALUES (24, 'E8', '• Protección por alta temperatura', '• Revisar espacio entre retorno y techo debe de haber 12 cm mínimo
• Evaporador o turbina sucia
• Termistor de aire o pozo fuera de rango
• Baja RPM en el motor del evaporador
• Exceso de refrigerante', NOW());
INSERT INTO error_codes (model_id, code, description, solution, created_at) VALUES (24, 'F1', '• El sensor de temperatura ambiente de la unidad interior está abierto o tiene corto circuito', '• Sensor de temperatura ambiente flojo o suelto, sin hacer contacto fijo con la tarjeta principal
• Componentes en tablero principal caídos causan corto circuito
• Sensor de temperatura ambiente dañado', NOW());
INSERT INTO error_codes (model_id, code, description, solution, created_at) VALUES (24, 'F2', '• EL sensor de tubería del evaporador está abierto o tiene corto circuito', '• Sensor de temperatura de tubería del evaporador esta flojo o suelto, sin hacer contacto fijo con la terminal de la tarjeta principal.
• Componentes de la tarjeta principal caídos causan corto circuito
• Sensor de temperatura de tubería dañado (verificar con tabla de valores de resistencia vs temperatura)
• Tarjeta principal dañada', NOW());
INSERT INTO error_codes (model_id, code, description, solution, created_at) VALUES (24, 'F3', '• El sensor de temperatura ambiente externo está abierto o tiene corto circuito', '• El sensor de temperatura externo no está bien conectado o está dañado. Revíselo contra la tabla de resistencias – temperatura del sensor', NOW());
INSERT INTO error_codes (model_id, code, description, solution, created_at) VALUES (24, 'F4', '• El sensor de pozo del condensador está abierto o tiene corto circuito', '• El sensor de temperatura de pozo no está bien conectado o ha sido dañado. Revíselo contra la tabla de resistencias vs temperaturas del sensor', NOW());
INSERT INTO error_codes (model_id, code, description, solution, created_at) VALUES (24, 'F5', '• El sensor de temperatura de descarga del condensador está abierto o tiene corto circuito', '• El sensor de temperatura de descarta no ha sido conectado correctamente o está dañado. Revíselo contra la tabla de resistencias vs temperatura del sensor
• La cabeza de sensor de temperatura no ha sido insertado a la tubería en la linea de descarga', NOW());
INSERT INTO error_codes (model_id, code, description, solution, created_at) VALUES (24, 'H1', '• El equipo se encuentra en modo descongelamiento inteligente en un comportamiento normal de los equipos con calefacción', '• El equipo realiza el proceso de deshielo automáticamente, asegurando que este listo para operar la calefacción', NOW());
INSERT INTO error_codes (model_id, code, description, solution, created_at) VALUES (24, 'H5', '• Protección del modulo inversor', '• Revise las conexiones de los bornes del compresor. • Revise las boninas del compresor. • Revise los voltajes de entrada y salida del modulo inversor.', NOW());
INSERT INTO error_codes (model_id, code, description, solution, created_at) VALUES (24, 'H6', '• Velocidad del motor evaporador menor a 200 RPM por mas de 5 segundos', '• Motor o turbina obstruida
• Capacitor en mal estado
• Sensor de velocidad dañado o desconectado', NOW());
INSERT INTO error_codes (model_id, code, description, solution, created_at) VALUES (24, 'L3', '• Falla en la corriente directa del motor del abanico externo', '• Falla en el motor del abanico de corriente directa o sistema bloqueado o conector flojo (sin hacer contacto).', NOW());
INSERT INTO air_conditioner_models (id, name, reference_id, image_url, logo_url, type, created_at) VALUES (25, 'MAGNUM19', 'magnum19', '/images/equipos/magnum19.png', '/images/logos/magnum19.png', '', NOW()) ON CONFLICT (id) DO NOTHING;
INSERT INTO error_codes (model_id, code, description, solution, created_at) VALUES (25, 'AP', 'Modo AP activado.
El modulo Wifi se encuentra activado para iniciar la configuracion.', '', NOW());
INSERT INTO error_codes (model_id, code, description, solution, created_at) VALUES (25, 'E0', '• Error en memoria EEPROM en tarjeta de evaporador.', '•Reemplace tarjeta del evaporador', NOW());
INSERT INTO error_codes (model_id, code, description, solution, created_at) VALUES (25, 'E1', '• Error de comunicación entre tarjeta evaporador / condensador.', '• Revisar voltaje de alimentación
• Comprobar el correcto cableado
• Falla en tarjeta de unidad interior
• Falla en tarjeta en unidad exterior', NOW());
INSERT INTO error_codes (model_id, code, description, solution, created_at) VALUES (25, 'E2', '• Error de detección de cruce por cero en tarjeta evaporador', '•  Reemplazar tarjeta principal del evaporador', NOW());
INSERT INTO error_codes (model_id, code, description, solution, created_at) VALUES (25, 'E3', '• Velocidad anormal en motor evaporador', '• Motor o turbina obstruida
• Capacitor en mal estado
• Sensor de velocidad dañado o desconectado', NOW());
INSERT INTO error_codes (model_id, code, description, solution, created_at) VALUES (25, 'E4', '• Corto circuito o circuito abierto en sensor de temperatura ambiental de evaporador', '• Medir el sensor del evaporador 
• Revisar falso contacto', NOW());
INSERT INTO error_codes (model_id, code, description, solution, created_at) VALUES (25, 'E5', '• Corto circuito o circuito abierto en sensor de tubería de evaporador', '• Medir sensor de temperatura de tubería del evaporador
• Revisar falso contacto', NOW());
INSERT INTO error_codes (model_id, code, description, solution, created_at) VALUES (25, 'EC', '• Fuga o escasez de refrigerante', '• Verificar presiones de refrigerante
• Válvulas de servicio cerradas o abiertas parcialmente
• Switch de baja presión dañado
• Presenta perdida de refrigerante', NOW());
INSERT INTO error_codes (model_id, code, description, solution, created_at) VALUES (25, 'EC07', 'Velocidad anormal en motor condensador.', '• Motor obstruido
• Capacitor en mal estado.
• Sensor de velocidad dañado o desconectado.', NOW());
INSERT INTO error_codes (model_id, code, description, solution, created_at) VALUES (25, 'EC53', '• Corto circuito o circuito abierto en sensor de temperatura ambiente de condensador', '• Medir sensor de temperatura ambiente de condensador
• Revisar falso contacto', NOW());
INSERT INTO error_codes (model_id, code, description, solution, created_at) VALUES (25, 'EC54', '• Corto circuito o circuito abierto en sensor de tubería de descarga de compresor', '• Medir sensor de temperatura de tubería del condensador
• Revisar falso contacto', NOW());
INSERT INTO error_codes (model_id, code, description, solution, created_at) VALUES (25, 'EH00', 'Error en memoria EEPROM en tarjeta de evaporador.', '•Reemplace tarjeta del evaporador', NOW());
INSERT INTO error_codes (model_id, code, description, solution, created_at) VALUES (25, 'EH02', 'Error de detección de cruce por cero en tarjeta evaporador', '• Reemplazar tarjeta principal del evaporador', NOW());
INSERT INTO error_codes (model_id, code, description, solution, created_at) VALUES (25, 'EH03', '• Velocidad anormal en motor evaporador', '• Motor o turbina obstruida
• Capacitor en mal estado
• Sensor de velocidad dañado o desconectado', NOW());
INSERT INTO error_codes (model_id, code, description, solution, created_at) VALUES (25, 'EH0b', 'Falla de comunicación entre tarjeta del evaporador y tarjeta display.', '• Verificar cable de interconexión.
• Falla en tarjeta de unidad interior
• Falla en tarjeta display.', NOW());
INSERT INTO error_codes (model_id, code, description, solution, created_at) VALUES (25, 'EH60', 'Corto circuito o circuito abierto en sensor de temperatura ambiente de evaporador.', '• Medir sensor de temperatura ambiente de evaporador.
• Revisar falso contacto.', NOW());
INSERT INTO error_codes (model_id, code, description, solution, created_at) VALUES (25, 'EH61', '• Corto circuito o circuito abierto en sensor de tubería de evaporador', '• Medir el sensor de tubería de evaporador
• Revisar falso contacto', NOW());
INSERT INTO error_codes (model_id, code, description, solution, created_at) VALUES (25, 'EL01', '• Error de comunicación entre tarjeta evaporador / condensador.', '• Revisar voltaje de alimentación.
• Comprobar el correcto cableado.
• Falla en tarjeta de unidad interior.
• Falla en tarjeta en unidad exterior.', NOW());
INSERT INTO error_codes (model_id, code, description, solution, created_at) VALUES (25, 'EL0C', '• Fuga o escasez de refrigerante', '• Verificar presiones de refrigerante
• Válvulas de servicio cerradas o abiertas parcialmente
• Falla sensor pozo en evaporador
• Capacitor de compresor/ventilador dañado
• Falla en ventilador externo
• Presenta perdida de refrigerante', NOW());
INSERT INTO error_codes (model_id, code, description, solution, created_at) VALUES (25, 'F0', '• Protección contra sobre corriente activada', '• Verificar parámetros eléctricos de la instalación
• Revisar uniones y conexiones del cableado eléctrico
• Pobre condensación
• Presiones de refrigerante elevadas o fuera de rango
• Carga térmica excesiva o equipo sobre forzado', NOW());
INSERT INTO error_codes (model_id, code, description, solution, created_at) VALUES (25, 'F1', '• Corto circuito o circuito abierto en sensor de temperatura ambiental de condensador', '• Medir el sensor de temperatura ambiental del condensador
• Revisar falso contacto', NOW());
INSERT INTO error_codes (model_id, code, description, solution, created_at) VALUES (25, 'F2', '• Corto circuito o circuito abierto en sensor de tubería de condensador', '• Medir sensor de temperatura de tubería del condensador
• Revisar falso contacto', NOW());
INSERT INTO error_codes (model_id, code, description, solution, created_at) VALUES (25, 'F3', '• Corto circuito o circuito abierto en sensor de tubería de descarga de compresor', '• Medir sensor de temperatura de tubería de descarga de compresor
• Revisar falso contacto', NOW());
INSERT INTO error_codes (model_id, code, description, solution, created_at) VALUES (25, 'F4', '• Error en memoria EEPROM en tarjeta de condensador', '• Reemplace tarjeta del condensador', NOW());
INSERT INTO error_codes (model_id, code, description, solution, created_at) VALUES (25, 'F5', '• Velocidad Anormal en motor condensador', '• Verificar terminales y conexiones eléctricas
• Bobinas internas del motor, baleros o rodamientos, aspa obstruida', NOW());
INSERT INTO error_codes (model_id, code, description, solution, created_at) VALUES (25, 'FC', 'Función de enfriamiento forzado.', 'Esta función se activa cuando se enciende el equipo por medio de el botón de emergencia en la unidad evaporador.', NOW());
INSERT INTO error_codes (model_id, code, description, solution, created_at) VALUES (25, 'P0', '• Error en modulo IPM o IGBT en tarjeta de condensador', '• Reemplace tarjeta del condensador', NOW());
INSERT INTO error_codes (model_id, code, description, solution, created_at) VALUES (25, 'P1', '• Protección contra voltaje anormal (bajo o muy alto voltaje)', '• Comprobar que el voltaje de suministro este dentro del rango aceptable, de lo contrario, contacte a su proveedor para solicitar que realice un ajuste.', NOW());
INSERT INTO error_codes (model_id, code, description, solution, created_at) VALUES (25, 'P2', '• Alta temperatura en superficie de compresor', '• Baja velocidad del ventilador en la unidad interior o exterior
• Bajo retorno de aire en la unidad interior o la exterior
• Suciedad en serpentín en la unidad interior o la exterior
• Compruebe carga de refrigerante y válvula de expansión
• Compruebe el voltaje de alimentación
• Verificar el correcto funcionamiento del compresor', NOW());
INSERT INTO error_codes (model_id, code, description, solution, created_at) VALUES (25, 'P3', '• Temperatura exterior menor a -25°C. (Calefacción)', '• Esperar a que temperatura exterior se estabilice.', NOW());
INSERT INTO error_codes (model_id, code, description, solution, created_at) VALUES (25, 'P4', '• Falla en "Driver" del compresor', '• Reemplace tarjeta del condensador', NOW());
INSERT INTO error_codes (model_id, code, description, solution, created_at) VALUES (25, 'P5', '• Conflicto de operación', '• El evaporador NO es compatible con el condensador', NOW());
INSERT INTO error_codes (model_id, code, description, solution, created_at) VALUES (25, 'P6', '• Protección por alta o baja presión de refrigerante', '• Verifique el estado del switch de presión en el lado de baja o alta presión.
• Verifique el la condensadora cuente con los espacios correctos.', NOW());
INSERT INTO error_codes (model_id, code, description, solution, created_at) VALUES (25, 'PC00', '• Error en modulo IPM o IGBT en tarjeta de condensador', '• Reemplace tarjeta del condensador', NOW());
INSERT INTO error_codes (model_id, code, description, solution, created_at) VALUES (25, 'PC01', '• Protección contra voltaje anormal (bajo o muy alto voltaje)', '• Comprobar que el voltaje de suministro este dentro del rango aceptable, de lo contrario, contacte a su proveedor para solicitar que realice un ajuste.
• Revise el reactor', NOW());
INSERT INTO error_codes (model_id, code, description, solution, created_at) VALUES (25, 'PC02', '• Alta temperatura en superficie de compresor', '• Baja velocidad del ventilador en la unidad interior o exterior
• Bajo retorno de aire en la unidad interior o la exterior
• Suciedad en serpentín en la unidad interior o la exterior
• Compruebe carga de refrigerante y válvula de expansión
• Compruebe el voltaje de alimentación
• Verificar el correcto funcionamiento del compresor', NOW());
INSERT INTO error_codes (model_id, code, description, solution, created_at) VALUES (25, 'PC03', '• Protección por baja presión de refrigerante', '• Verifique el estado del switch de presión en el lado de baja.', NOW());
INSERT INTO error_codes (model_id, code, description, solution, created_at) VALUES (25, 'PC04', '• Falla en "Driver" del compresor', '• Compruebe la correcta conexión en la tarjeta del condensador al compresor
• Revise el funcionamiento del ventilador exterior e interior
• Compruebe los valores de resistencia del compresor
• Reemplace tarjeta del condensador', NOW());
INSERT INTO error_codes (model_id, code, description, solution, created_at) VALUES (25, 'PC08', 'Se detecto un aumento excesivo en la corriente de trabajo del equipo.', '• Se presento un fallo en el suministo de energia (Desconecte de la alimentacion por 1 minuto para reiniciar la falla)
• Compruebe que el voltaje de alimentacion este dento del rango de trabajo
• Asegurese que tenga una buena ventilacion el condensador
• Revise que el ventilador del condensador funciona correctamente
• Compruebe que no hay objetos o suciedad en serpentin de condensador
• Si la presion de gas es muy alta, libere el exceso de refrigerante
• Reemplace la tarjeta del condensador', NOW());
INSERT INTO error_codes (model_id, code, description, solution, created_at) VALUES (25, 'SC', 'Función de Auto Limpieza', 'No es una falla. El código SC se muestra en el display cuando la función de auto limpieza esta activada.', NOW());
INSERT INTO error_codes (model_id, code, description, solution, created_at) VALUES (25, 'cF', '• El equipo se encuentra en etapa de pre-calentamiento justo antes de iniciar el modo calefacción', '• Esperar 5 minutos para iniciar modo de calefacción normalmente', NOW());
INSERT INTO error_codes (model_id, code, description, solution, created_at) VALUES (25, 'dF', '• El equipo se encuentra en modo de des-congelamiento.', '• Espere a que termine el ciclo de des-congelamiento.', NOW());
INSERT INTO air_conditioner_models (id, name, reference_id, image_url, logo_url, type, created_at) VALUES (26, 'MAGNUM20', 'magnum20', '/images/equipos/magnum20.png', '/images/logos/magnum20.png', '', NOW()) ON CONFLICT (id) DO NOTHING;
INSERT INTO error_codes (model_id, code, description, solution, created_at) VALUES (26, 'C5', '• Falla de protección del jumper', '• Coloque el JUMPER correspondiente en la tarjeta de control', NOW());
INSERT INTO error_codes (model_id, code, description, solution, created_at) VALUES (26, 'E1', '• Protección por alta presión de refrigerante', '• Sobre carga de refrigerante
• Poco intercambio de calor (puede estar muy sucio el serpentín o muy cerca de un muro)
• La temperatura ambiente podría ser muy alta', NOW());
INSERT INTO error_codes (model_id, code, description, solution, created_at) VALUES (26, 'E6', '• Falla de comunicación entre evaporador y condensador', '• Revisar las conexiones eléctricas entre evaporador y condensador', NOW());
INSERT INTO error_codes (model_id, code, description, solution, created_at) VALUES (26, 'E8', '• Protección por alta temperatura', '• Revisar espacio entre retorno y techo debe de haber 12 cm mínimo
• Evaporador o turbina sucia
• Termistor de aire o pozo fuera de rango
• Baja RPM en el motor del evaporador
• Exceso de refrigerante', NOW());
INSERT INTO error_codes (model_id, code, description, solution, created_at) VALUES (26, 'F1', '• El sensor de temperatura ambiente de la unidad interior está abierto o tiene corto circuito', '• Sensor de temperatura ambiente flojo o suelto, sin hacer contacto fijo con la tarjeta principal
• Componentes en tablero principal caídos causan corto circuito
• Sensor de temperatura ambiente dañado', NOW());
INSERT INTO error_codes (model_id, code, description, solution, created_at) VALUES (26, 'F2', '• EL sensor de tubería del evaporador está abierto o tiene corto circuito', '• Sensor de temperatura de tubería del evaporador esta flojo o suelto, sin hacer contacto fijo con la terminal de la tarjeta principal.
• Componentes de la tarjeta principal caídos causan corto circuito
• Sensor de temperatura de tubería dañado (verificar con tabla de valores de resistencia vs temperatura)
• Tarjeta principal dañada', NOW());
INSERT INTO error_codes (model_id, code, description, solution, created_at) VALUES (26, 'F3', '• El sensor de temperatura ambiente externo está abierto o tiene corto circuito', '• El sensor de temperatura externo no está bien conectado o está dañado. Revíselo contra la tabla de resistencias – temperatura del sensor', NOW());
INSERT INTO error_codes (model_id, code, description, solution, created_at) VALUES (26, 'F4', '• El sensor de pozo del condensador está abierto o tiene corto circuito', '• El sensor de temperatura de pozo no está bien conectado o ha sido dañado. Revíselo contra la tabla de resistencias vs temperaturas del sensor', NOW());
INSERT INTO error_codes (model_id, code, description, solution, created_at) VALUES (26, 'F5', '• El sensor de temperatura de descarga del condensador está abierto o tiene corto circuito', '• El sensor de temperatura de descarta no ha sido conectado correctamente o está dañado. Revíselo contra la tabla de resistencias vs temperatura del sensor
• La cabeza de sensor de temperatura no ha sido insertado a la tubería en la linea de descarga', NOW());
INSERT INTO error_codes (model_id, code, description, solution, created_at) VALUES (26, 'H1', '• El equipo se encuentra en modo descongelamiento inteligente en un comportamiento normal de los equipos con calefacción', '• El equipo realiza el proceso de deshielo automáticamente, asegurando que este listo para operar la calefacción', NOW());
INSERT INTO error_codes (model_id, code, description, solution, created_at) VALUES (26, 'H5', '• Protección del modulo inversor', '• Revise las conexiones de los bornes del compresor. • Revise las boninas del compresor. • Revise los voltajes de entrada y salida del modulo inversor.', NOW());
INSERT INTO error_codes (model_id, code, description, solution, created_at) VALUES (26, 'H6', '• Velocidad del motor evaporador menor a 200 RPM por mas de 5 segundos', '• Motor o turbina obstruida
• Capacitor en mal estado
• Sensor de velocidad dañado o desconectado', NOW());
INSERT INTO error_codes (model_id, code, description, solution, created_at) VALUES (26, 'L3', '• Falla en la corriente directa del motor del abanico externo', '• Falla en el motor del abanico de corriente directa o sistema bloqueado o conector flojo (sin hacer contacto).', NOW());
INSERT INTO air_conditioner_models (id, name, reference_id, image_url, logo_url, type, created_at) VALUES (27, 'MAGNUM21', 'magnum21', '/images/equipos/magnum21.png', '/images/logos/magnum21.png', '', NOW()) ON CONFLICT (id) DO NOTHING;
INSERT INTO error_codes (model_id, code, description, solution, created_at) VALUES (27, 'AP', 'Modo AP activado.
El modulo Wifi se encuentra activado para iniciar la configuracion.', '', NOW());
INSERT INTO error_codes (model_id, code, description, solution, created_at) VALUES (27, 'E0', '• Error en memoria EEPROM en tarjeta de evaporador.', '•Reemplace tarjeta del evaporador', NOW());
INSERT INTO error_codes (model_id, code, description, solution, created_at) VALUES (27, 'E1', '• Error de comunicación entre tarjeta evaporador / condensador.', '• Revisar voltaje de alimentación
• Comprobar el correcto cableado
• Falla en tarjeta de unidad interior
• Falla en tarjeta en unidad exterior', NOW());
INSERT INTO error_codes (model_id, code, description, solution, created_at) VALUES (27, 'E2', '• Error de detección de cruce por cero en tarjeta evaporador', '•  Reemplazar tarjeta principal del evaporador', NOW());
INSERT INTO error_codes (model_id, code, description, solution, created_at) VALUES (27, 'E3', '• Velocidad anormal en motor evaporador', '• Motor o turbina obstruida
• Capacitor en mal estado
• Sensor de velocidad dañado o desconectado', NOW());
INSERT INTO error_codes (model_id, code, description, solution, created_at) VALUES (27, 'E4', '• Corto circuito o circuito abierto en sensor de temperatura ambiental de evaporador', '• Medir el sensor del evaporador 
• Revisar falso contacto', NOW());
INSERT INTO error_codes (model_id, code, description, solution, created_at) VALUES (27, 'E5', '• Corto circuito o circuito abierto en sensor de tubería de evaporador', '• Medir sensor de temperatura de tubería del evaporador
• Revisar falso contacto', NOW());
INSERT INTO error_codes (model_id, code, description, solution, created_at) VALUES (27, 'EC', '• Fuga o escasez de refrigerante', '• Verificar presiones de refrigerante
• Válvulas de servicio cerradas o abiertas parcialmente
• Switch de baja presión dañado
• Presenta perdida de refrigerante', NOW());
INSERT INTO error_codes (model_id, code, description, solution, created_at) VALUES (27, 'EC07', 'Velocidad anormal en motor condensador.', '• Motor obstruido
• Capacitor en mal estado.
• Sensor de velocidad dañado o desconectado.', NOW());
INSERT INTO error_codes (model_id, code, description, solution, created_at) VALUES (27, 'EC53', '• Corto circuito o circuito abierto en sensor de temperatura ambiente de condensador', '• Medir sensor de temperatura ambiente de condensador
• Revisar falso contacto', NOW());
INSERT INTO error_codes (model_id, code, description, solution, created_at) VALUES (27, 'EC54', '• Corto circuito o circuito abierto en sensor de tubería de descarga de compresor', '• Medir sensor de temperatura de tubería del condensador
• Revisar falso contacto', NOW());
INSERT INTO error_codes (model_id, code, description, solution, created_at) VALUES (27, 'EH00', 'Error en memoria EEPROM en tarjeta de evaporador.', '•Reemplace tarjeta del evaporador', NOW());
INSERT INTO error_codes (model_id, code, description, solution, created_at) VALUES (27, 'EH02', 'Error de detección de cruce por cero en tarjeta evaporador', '• Reemplazar tarjeta principal del evaporador', NOW());
INSERT INTO error_codes (model_id, code, description, solution, created_at) VALUES (27, 'EH03', '• Velocidad anormal en motor evaporador', '• Motor o turbina obstruida
• Capacitor en mal estado
• Sensor de velocidad dañado o desconectado', NOW());
INSERT INTO error_codes (model_id, code, description, solution, created_at) VALUES (27, 'EH0b', 'Falla de comunicación entre tarjeta del evaporador y tarjeta display.', '• Verificar cable de interconexión.
• Falla en tarjeta de unidad interior
• Falla en tarjeta display.', NOW());
INSERT INTO error_codes (model_id, code, description, solution, created_at) VALUES (27, 'EH60', 'Corto circuito o circuito abierto en sensor de temperatura ambiente de evaporador.', '• Medir sensor de temperatura ambiente de evaporador.
• Revisar falso contacto.', NOW());
INSERT INTO error_codes (model_id, code, description, solution, created_at) VALUES (27, 'EH61', '• Corto circuito o circuito abierto en sensor de tubería de evaporador', '• Medir el sensor de tubería de evaporador
• Revisar falso contacto', NOW());
INSERT INTO error_codes (model_id, code, description, solution, created_at) VALUES (27, 'EL01', '• Error de comunicación entre tarjeta evaporador / condensador.', '• Revisar voltaje de alimentación.
• Comprobar el correcto cableado.
• Falla en tarjeta de unidad interior.
• Falla en tarjeta en unidad exterior.', NOW());
INSERT INTO error_codes (model_id, code, description, solution, created_at) VALUES (27, 'EL0C', '• Fuga o escasez de refrigerante', '• Verificar presiones de refrigerante
• Válvulas de servicio cerradas o abiertas parcialmente
• Falla sensor pozo en evaporador
• Capacitor de compresor/ventilador dañado
• Falla en ventilador externo
• Presenta perdida de refrigerante', NOW());
INSERT INTO error_codes (model_id, code, description, solution, created_at) VALUES (27, 'F0', '• Protección contra sobre corriente activada', '• Verificar parámetros eléctricos de la instalación
• Revisar uniones y conexiones del cableado eléctrico
• Pobre condensación
• Presiones de refrigerante elevadas o fuera de rango
• Carga térmica excesiva o equipo sobre forzado', NOW());
INSERT INTO error_codes (model_id, code, description, solution, created_at) VALUES (27, 'F1', '• Corto circuito o circuito abierto en sensor de temperatura ambiental de condensador', '• Medir el sensor de temperatura ambiental del condensador
• Revisar falso contacto', NOW());
INSERT INTO error_codes (model_id, code, description, solution, created_at) VALUES (27, 'F2', '• Corto circuito o circuito abierto en sensor de tubería de condensador', '• Medir sensor de temperatura de tubería del condensador
• Revisar falso contacto', NOW());
INSERT INTO error_codes (model_id, code, description, solution, created_at) VALUES (27, 'F3', '• Corto circuito o circuito abierto en sensor de tubería de descarga de compresor', '• Medir sensor de temperatura de tubería de descarga de compresor
• Revisar falso contacto', NOW());
INSERT INTO error_codes (model_id, code, description, solution, created_at) VALUES (27, 'F4', '• Error en memoria EEPROM en tarjeta de condensador', '• Reemplace tarjeta del condensador', NOW());
INSERT INTO error_codes (model_id, code, description, solution, created_at) VALUES (27, 'F5', '• Velocidad Anormal en motor condensador', '• Verificar terminales y conexiones eléctricas
• Bobinas internas del motor, baleros o rodamientos, aspa obstruida', NOW());
INSERT INTO error_codes (model_id, code, description, solution, created_at) VALUES (27, 'FC', 'Función de enfriamiento forzado.', 'Esta función se activa cuando se enciende el equipo por medio de el botón de emergencia en la unidad evaporador.', NOW());
INSERT INTO error_codes (model_id, code, description, solution, created_at) VALUES (27, 'P0', '• Error en modulo IPM o IGBT en tarjeta de condensador', '• Reemplace tarjeta del condensador', NOW());
INSERT INTO error_codes (model_id, code, description, solution, created_at) VALUES (27, 'P1', '• Protección contra voltaje anormal (bajo o muy alto voltaje)', '• Comprobar que el voltaje de suministro este dentro del rango aceptable, de lo contrario, contacte a su proveedor para solicitar que realice un ajuste.', NOW());
INSERT INTO error_codes (model_id, code, description, solution, created_at) VALUES (27, 'P2', '• Alta temperatura en superficie de compresor', '• Baja velocidad del ventilador en la unidad interior o exterior
• Bajo retorno de aire en la unidad interior o la exterior
• Suciedad en serpentín en la unidad interior o la exterior
• Compruebe carga de refrigerante y válvula de expansión
• Compruebe el voltaje de alimentación
• Verificar el correcto funcionamiento del compresor', NOW());
INSERT INTO error_codes (model_id, code, description, solution, created_at) VALUES (27, 'P3', '• Temperatura exterior menor a -25°C. (Calefacción)', '• Esperar a que temperatura exterior se estabilice.', NOW());
INSERT INTO error_codes (model_id, code, description, solution, created_at) VALUES (27, 'P4', '• Falla en "Driver" del compresor', '• Reemplace tarjeta del condensador', NOW());
INSERT INTO error_codes (model_id, code, description, solution, created_at) VALUES (27, 'P5', '• Conflicto de operación', '• El evaporador NO es compatible con el condensador', NOW());
INSERT INTO error_codes (model_id, code, description, solution, created_at) VALUES (27, 'P6', '• Protección por alta o baja presión de refrigerante', '• Verifique el estado del switch de presión en el lado de baja o alta presión.
• Verifique el la condensadora cuente con los espacios correctos.', NOW());
INSERT INTO error_codes (model_id, code, description, solution, created_at) VALUES (27, 'PC00', '• Error en modulo IPM o IGBT en tarjeta de condensador', '• Reemplace tarjeta del condensador', NOW());
INSERT INTO error_codes (model_id, code, description, solution, created_at) VALUES (27, 'PC01', '• Protección contra voltaje anormal (bajo o muy alto voltaje)', '• Comprobar que el voltaje de suministro este dentro del rango aceptable, de lo contrario, contacte a su proveedor para solicitar que realice un ajuste.
• Revise el reactor', NOW());
INSERT INTO error_codes (model_id, code, description, solution, created_at) VALUES (27, 'PC02', '• Alta temperatura en superficie de compresor', '• Baja velocidad del ventilador en la unidad interior o exterior
• Bajo retorno de aire en la unidad interior o la exterior
• Suciedad en serpentín en la unidad interior o la exterior
• Compruebe carga de refrigerante y válvula de expansión
• Compruebe el voltaje de alimentación
• Verificar el correcto funcionamiento del compresor', NOW());
INSERT INTO error_codes (model_id, code, description, solution, created_at) VALUES (27, 'PC03', '• Protección por baja presión de refrigerante', '• Verifique el estado del switch de presión en el lado de baja.', NOW());
INSERT INTO error_codes (model_id, code, description, solution, created_at) VALUES (27, 'PC04', '• Falla en "Driver" del compresor', '• Compruebe la correcta conexión en la tarjeta del condensador al compresor
• Revise el funcionamiento del ventilador exterior e interior
• Compruebe los valores de resistencia del compresor
• Reemplace tarjeta del condensador', NOW());
INSERT INTO error_codes (model_id, code, description, solution, created_at) VALUES (27, 'PC08', 'Se detecto un aumento excesivo en la corriente de trabajo del equipo.', '• Se presento un fallo en el suministo de energia (Desconecte de la alimentacion por 1 minuto para reiniciar la falla)
• Compruebe que el voltaje de alimentacion este dento del rango de trabajo
• Asegurese que tenga una buena ventilacion el condensador
• Revise que el ventilador del condensador funciona correctamente
• Compruebe que no hay objetos o suciedad en serpentin de condensador
• Si la presion de gas es muy alta, libere el exceso de refrigerante
• Reemplace la tarjeta del condensador', NOW());
INSERT INTO error_codes (model_id, code, description, solution, created_at) VALUES (27, 'SC', 'Función de Auto Limpieza', 'No es una falla. El código SC se muestra en el display cuando la función de auto limpieza esta activada.', NOW());
INSERT INTO error_codes (model_id, code, description, solution, created_at) VALUES (27, 'cF', '• El equipo se encuentra en etapa de pre-calentamiento justo antes de iniciar el modo calefacción', '• Esperar 5 minutos para iniciar modo de calefacción normalmente', NOW());
INSERT INTO error_codes (model_id, code, description, solution, created_at) VALUES (27, 'dF', '• El equipo se encuentra en modo de des-congelamiento.', '• Espere a que termine el ciclo de des-congelamiento.', NOW());
INSERT INTO air_conditioner_models (id, name, reference_id, image_url, logo_url, type, created_at) VALUES (28, 'MAGNUM21 PLATINUM', 'magnum21_platinum', '/images/equipos/magnum21_platinum.png', '/images/logos/magnum21_platinum.png', '', NOW()) ON CONFLICT (id) DO NOTHING;
INSERT INTO error_codes (model_id, code, description, solution, created_at) VALUES (28, 'AP', 'Modo AP activado.
El modulo Wifi se encuentra activado para iniciar la configuracion.', '', NOW());
INSERT INTO error_codes (model_id, code, description, solution, created_at) VALUES (28, 'EC07', 'Velocidad anormal en motor condensador.', '• Motor obstruido
• Capacitor en mal estado.
• Sensor de velocidad dañado o desconectado.', NOW());
INSERT INTO error_codes (model_id, code, description, solution, created_at) VALUES (28, 'EC53', '• Corto circuito o circuito abierto en sensor de temperatura ambiente de condensador', '• Medir sensor de temperatura ambiente de condensador
• Revisar falso contacto', NOW());
INSERT INTO error_codes (model_id, code, description, solution, created_at) VALUES (28, 'EC54', '• Corto circuito o circuito abierto en sensor de tubería de descarga de compresor', '• Medir sensor de temperatura de tubería del condensador
• Revisar falso contacto', NOW());
INSERT INTO error_codes (model_id, code, description, solution, created_at) VALUES (28, 'EH00', 'Error en memoria EEPROM en tarjeta de evaporador.', '•Reemplace tarjeta del evaporador', NOW());
INSERT INTO error_codes (model_id, code, description, solution, created_at) VALUES (28, 'EH02', 'Error de detección de cruce por cero en tarjeta evaporador', '• Reemplazar tarjeta principal del evaporador', NOW());
INSERT INTO error_codes (model_id, code, description, solution, created_at) VALUES (28, 'EH03', '• Velocidad anormal en motor evaporador', '• Motor o turbina obstruida
• Capacitor en mal estado
• Sensor de velocidad dañado o desconectado', NOW());
INSERT INTO error_codes (model_id, code, description, solution, created_at) VALUES (28, 'EH0b', 'Falla de comunicación entre tarjeta del evaporador y tarjeta display.', '• Verificar cable de interconexión.
• Falla en tarjeta de unidad interior
• Falla en tarjeta display.', NOW());
INSERT INTO error_codes (model_id, code, description, solution, created_at) VALUES (28, 'EH60', 'Corto circuito o circuito abierto en sensor de temperatura ambiente de evaporador.', '• Medir sensor de temperatura ambiente de evaporador.
• Revisar falso contacto.', NOW());
INSERT INTO error_codes (model_id, code, description, solution, created_at) VALUES (28, 'EH61', '• Corto circuito o circuito abierto en sensor de tubería de evaporador', '• Medir el sensor de tubería de evaporador
• Revisar falso contacto', NOW());
INSERT INTO error_codes (model_id, code, description, solution, created_at) VALUES (28, 'EL01', '• Error de comunicación entre tarjeta evaporador / condensador.', '• Revisar voltaje de alimentación.
• Comprobar el correcto cableado.
• Falla en tarjeta de unidad interior.
• Falla en tarjeta en unidad exterior.', NOW());
INSERT INTO error_codes (model_id, code, description, solution, created_at) VALUES (28, 'EL0C', '• Fuga o escasez de refrigerante', '• Verificar presiones de refrigerante
• Válvulas de servicio cerradas o abiertas parcialmente
• Falla sensor pozo en evaporador
• Capacitor de compresor/ventilador dañado
• Falla en ventilador externo
• Presenta perdida de refrigerante', NOW());
INSERT INTO error_codes (model_id, code, description, solution, created_at) VALUES (28, 'FC', 'Función de enfriamiento forzado.', 'Esta función se activa cuando se enciende el equipo por medio de el botón de emergencia en la unidad evaporador.', NOW());
INSERT INTO error_codes (model_id, code, description, solution, created_at) VALUES (28, 'PC00', '• Error en modulo IPM o IGBT en tarjeta de condensador', '• Reemplace tarjeta del condensador', NOW());
INSERT INTO error_codes (model_id, code, description, solution, created_at) VALUES (28, 'PC01', '• Protección contra voltaje anormal (bajo o muy alto voltaje)', '• Comprobar que el voltaje de suministro este dentro del rango aceptable, de lo contrario, contacte a su proveedor para solicitar que realice un ajuste.
• Revise el reactor', NOW());
INSERT INTO error_codes (model_id, code, description, solution, created_at) VALUES (28, 'PC02', '• Alta temperatura en superficie de compresor', '• Baja velocidad del ventilador en la unidad interior o exterior
• Bajo retorno de aire en la unidad interior o la exterior
• Suciedad en serpentín en la unidad interior o la exterior
• Compruebe carga de refrigerante y válvula de expansión
• Compruebe el voltaje de alimentación
• Verificar el correcto funcionamiento del compresor', NOW());
INSERT INTO error_codes (model_id, code, description, solution, created_at) VALUES (28, 'PC03', '• Protección por baja presión de refrigerante', '• Verifique el estado del switch de presión en el lado de baja.', NOW());
INSERT INTO error_codes (model_id, code, description, solution, created_at) VALUES (28, 'PC04', '• Falla en "Driver" del compresor', '• Compruebe la correcta conexión en la tarjeta del condensador al compresor
• Revise el funcionamiento del ventilador exterior e interior
• Compruebe los valores de resistencia del compresor
• Reemplace tarjeta del condensador', NOW());
INSERT INTO error_codes (model_id, code, description, solution, created_at) VALUES (28, 'PC08', 'Se detecto un aumento excesivo en la corriente de trabajo del equipo.', '• Se presento un fallo en el suministo de energia (Desconecte de la alimentacion por 1 minuto para reiniciar la falla)
• Compruebe que el voltaje de alimentacion este dento del rango de trabajo
• Asegurese que tenga una buena ventilacion el condensador
• Revise que el ventilador del condensador funciona correctamente
• Compruebe que no hay objetos o suciedad en serpentin de condensador
• Si la presion de gas es muy alta, libere el exceso de refrigerante
• Reemplace la tarjeta del condensador', NOW());
INSERT INTO error_codes (model_id, code, description, solution, created_at) VALUES (28, 'SC', 'Función de Auto Limpieza', 'No es una falla. El código SC se muestra en el display cuando la función de auto limpieza esta activada.', NOW());
INSERT INTO air_conditioner_models (id, name, reference_id, image_url, logo_url, type, created_at) VALUES (29, 'MAGNUM22', 'magnum22', '/images/equipos/magnum22.png', '/images/logos/magnum22.png', '', NOW()) ON CONFLICT (id) DO NOTHING;
INSERT INTO error_codes (model_id, code, description, solution, created_at) VALUES (29, 'AP', 'Modo AP activado.
El modulo Wifi se encuentra activado para iniciar la configuracion.', '', NOW());
INSERT INTO error_codes (model_id, code, description, solution, created_at) VALUES (29, 'EC07', 'Velocidad anormal en motor condensador.', '• Motor obstruido
• Capacitor en mal estado.
• Sensor de velocidad dañado o desconectado.', NOW());
INSERT INTO error_codes (model_id, code, description, solution, created_at) VALUES (29, 'EC52', '• Corto circuito o circuito abierto en sensor de tubería de condensador.', '• Medir sensor de temperatura de tubería del condensador.
• Verificar falso contacto.', NOW());
INSERT INTO error_codes (model_id, code, description, solution, created_at) VALUES (29, 'EC53', '• Corto circuito o circuito abierto en sensor de temperatura ambiente de condensador', '• Medir sensor de temperatura ambiente de condensador
• Revisar falso contacto', NOW());
INSERT INTO error_codes (model_id, code, description, solution, created_at) VALUES (29, 'EC54', '• Corto circuito o circuito abierto en sensor de tubería de descarga de compresor', '• Medir sensor de temperatura de tubería del condensador
• Revisar falso contacto', NOW());
INSERT INTO error_codes (model_id, code, description, solution, created_at) VALUES (29, 'EH00', 'Error en memoria EEPROM en tarjeta de evaporador.', '•Reemplace tarjeta del evaporador', NOW());
INSERT INTO error_codes (model_id, code, description, solution, created_at) VALUES (29, 'EH02', 'Error de detección de cruce por cero en tarjeta evaporador', '• Reemplazar tarjeta principal del evaporador', NOW());
INSERT INTO error_codes (model_id, code, description, solution, created_at) VALUES (29, 'EH03', '• Velocidad anormal en motor evaporador', '• Motor o turbina obstruida
• Capacitor en mal estado
• Sensor de velocidad dañado o desconectado', NOW());
INSERT INTO error_codes (model_id, code, description, solution, created_at) VALUES (29, 'EH0b', 'Falla de comunicación entre tarjeta del evaporador y tarjeta display.', '• Verificar cable de interconexión.
• Falla en tarjeta de unidad interior
• Falla en tarjeta display.', NOW());
INSERT INTO error_codes (model_id, code, description, solution, created_at) VALUES (29, 'EH60', 'Corto circuito o circuito abierto en sensor de temperatura ambiente de evaporador.', '• Medir sensor de temperatura ambiente de evaporador.
• Revisar falso contacto.', NOW());
INSERT INTO error_codes (model_id, code, description, solution, created_at) VALUES (29, 'EH61', '• Corto circuito o circuito abierto en sensor de tubería de evaporador', '• Medir el sensor de tubería de evaporador
• Revisar falso contacto', NOW());
INSERT INTO error_codes (model_id, code, description, solution, created_at) VALUES (29, 'EL01', '• Error de comunicación entre tarjeta evaporador / condensador.', '• Revisar voltaje de alimentación.
• Comprobar el correcto cableado.
• Falla en tarjeta de unidad interior.
• Falla en tarjeta en unidad exterior.', NOW());
INSERT INTO error_codes (model_id, code, description, solution, created_at) VALUES (29, 'EL0C', '• Fuga o escasez de refrigerante', '• Verificar presiones de refrigerante
• Válvulas de servicio cerradas o abiertas parcialmente
• Falla sensor pozo en evaporador
• Capacitor de compresor/ventilador dañado
• Falla en ventilador externo
• Presenta perdida de refrigerante', NOW());
INSERT INTO error_codes (model_id, code, description, solution, created_at) VALUES (29, 'FC', 'Función de enfriamiento forzado.', 'Esta función se activa cuando se enciende el equipo por medio de el botón de emergencia en la unidad evaporador.', NOW());
INSERT INTO error_codes (model_id, code, description, solution, created_at) VALUES (29, 'PC00', '• Error en modulo IPM o IGBT en tarjeta de condensador', '• Reemplace tarjeta del condensador', NOW());
INSERT INTO error_codes (model_id, code, description, solution, created_at) VALUES (29, 'PC01', '• Protección contra voltaje anormal (bajo o muy alto voltaje)', '• Comprobar que el voltaje de suministro este dentro del rango aceptable, de lo contrario, contacte a su proveedor para solicitar que realice un ajuste.
• Revise el reactor', NOW());
INSERT INTO error_codes (model_id, code, description, solution, created_at) VALUES (29, 'PC02', '• Alta temperatura en superficie de compresor', '• Baja velocidad del ventilador en la unidad interior o exterior
• Bajo retorno de aire en la unidad interior o la exterior
• Suciedad en serpentín en la unidad interior o la exterior
• Compruebe carga de refrigerante y válvula de expansión
• Compruebe el voltaje de alimentación
• Verificar el correcto funcionamiento del compresor', NOW());
INSERT INTO error_codes (model_id, code, description, solution, created_at) VALUES (29, 'PC03', '• Protección por baja presión de refrigerante', '• Verifique el estado del switch de presión en el lado de baja.', NOW());
INSERT INTO error_codes (model_id, code, description, solution, created_at) VALUES (29, 'PC04', '• Falla en "Driver" del compresor', '• Compruebe la correcta conexión en la tarjeta del condensador al compresor
• Revise el funcionamiento del ventilador exterior e interior
• Compruebe los valores de resistencia del compresor
• Reemplace tarjeta del condensador', NOW());
INSERT INTO error_codes (model_id, code, description, solution, created_at) VALUES (29, 'PC08', 'Se detecto un aumento excesivo en la corriente de trabajo del equipo.', '• Se presento un fallo en el suministo de energia (Desconecte de la alimentacion por 1 minuto para reiniciar la falla)
• Compruebe que el voltaje de alimentacion este dento del rango de trabajo
• Asegurese que tenga una buena ventilacion el condensador
• Revise que el ventilador del condensador funciona correctamente
• Compruebe que no hay objetos o suciedad en serpentin de condensador
• Si la presion de gas es muy alta, libere el exceso de refrigerante
• Reemplace la tarjeta del condensador', NOW());
INSERT INTO error_codes (model_id, code, description, solution, created_at) VALUES (29, 'SC', 'Función de Auto Limpieza', 'No es una falla. El código SC se muestra en el display cuando la función de auto limpieza esta activada.', NOW());
INSERT INTO error_codes (model_id, code, description, solution, created_at) VALUES (29, 'dF', '• El equipo se encuentra en modo de des-congelamiento.', '• Espere a que termine el ciclo de des-congelamiento.', NOW());
INSERT INTO air_conditioner_models (id, name, reference_id, image_url, logo_url, type, created_at) VALUES (30, 'MAGNUM30', 'magnum30', '/images/equipos/magnum30.png', '/images/logos/magnum30.png', '', NOW()) ON CONFLICT (id) DO NOTHING;
INSERT INTO error_codes (model_id, code, description, solution, created_at) VALUES (30, 'AP', 'Modo AP activado.
El modulo Wifi se encuentra activado para iniciar la configuracion.', '', NOW());
INSERT INTO error_codes (model_id, code, description, solution, created_at) VALUES (30, 'E0', '• Error en memoria EEPROM en tarjeta de evaporador.', '•Reemplace tarjeta del evaporador', NOW());
INSERT INTO error_codes (model_id, code, description, solution, created_at) VALUES (30, 'E1', '• Error de comunicación entre tarjeta evaporador / condensador.', '• Revisar voltaje de alimentación
• Comprobar el correcto cableado
• Falla en tarjeta de unidad interior
• Falla en tarjeta en unidad exterior', NOW());
INSERT INTO error_codes (model_id, code, description, solution, created_at) VALUES (30, 'E2', '• Error de detección de cruce por cero en tarjeta evaporador', '•  Reemplazar tarjeta principal del evaporador', NOW());
INSERT INTO error_codes (model_id, code, description, solution, created_at) VALUES (30, 'E3', '• Velocidad anormal en motor evaporador', '• Motor o turbina obstruida
• Capacitor en mal estado
• Sensor de velocidad dañado o desconectado', NOW());
INSERT INTO error_codes (model_id, code, description, solution, created_at) VALUES (30, 'E4', '• Corto circuito o circuito abierto en sensor de temperatura ambiental de evaporador', '• Medir el sensor del evaporador 
• Revisar falso contacto', NOW());
INSERT INTO error_codes (model_id, code, description, solution, created_at) VALUES (30, 'E5', '• Corto circuito o circuito abierto en sensor de tubería de evaporador', '• Medir sensor de temperatura de tubería del evaporador
• Revisar falso contacto', NOW());
INSERT INTO error_codes (model_id, code, description, solution, created_at) VALUES (30, 'EC', '• Fuga o escasez de refrigerante', '• Verificar presiones de refrigerante
• Válvulas de servicio cerradas o abiertas parcialmente
• Switch de baja presión dañado
• Presenta perdida de refrigerante', NOW());
INSERT INTO error_codes (model_id, code, description, solution, created_at) VALUES (30, 'F0', '• Protección contra sobre corriente activada', '• Verificar parámetros eléctricos de la instalación
• Revisar uniones y conexiones del cableado eléctrico
• Pobre condensación
• Presiones de refrigerante elevadas o fuera de rango
• Carga térmica excesiva o equipo sobre forzado', NOW());
INSERT INTO error_codes (model_id, code, description, solution, created_at) VALUES (30, 'F1', '• Corto circuito o circuito abierto en sensor de temperatura ambiental de condensador', '• Medir el sensor de temperatura ambiental del condensador
• Revisar falso contacto', NOW());
INSERT INTO error_codes (model_id, code, description, solution, created_at) VALUES (30, 'F2', '• Corto circuito o circuito abierto en sensor de tubería de condensador', '• Medir sensor de temperatura de tubería del condensador
• Revisar falso contacto', NOW());
INSERT INTO error_codes (model_id, code, description, solution, created_at) VALUES (30, 'F3', '• Corto circuito o circuito abierto en sensor de tubería de descarga de compresor', '• Medir sensor de temperatura de tubería de descarga de compresor
• Revisar falso contacto', NOW());
INSERT INTO error_codes (model_id, code, description, solution, created_at) VALUES (30, 'F5', '• Velocidad Anormal en motor condensador', '• Verificar terminales y conexiones eléctricas
• Bobinas internas del motor, baleros o rodamientos, aspa obstruida', NOW());
INSERT INTO error_codes (model_id, code, description, solution, created_at) VALUES (30, 'P0', '• Error en modulo IPM o IGBT en tarjeta de condensador', '• Reemplace tarjeta del condensador', NOW());
INSERT INTO error_codes (model_id, code, description, solution, created_at) VALUES (30, 'P1', '• Protección contra voltaje anormal (bajo o muy alto voltaje)', '• Comprobar que el voltaje de suministro este dentro del rango aceptable, de lo contrario, contacte a su proveedor para solicitar que realice un ajuste.', NOW());
INSERT INTO error_codes (model_id, code, description, solution, created_at) VALUES (30, 'P2', '• Alta temperatura en superficie de compresor', '• Baja velocidad del ventilador en la unidad interior o exterior
• Bajo retorno de aire en la unidad interior o la exterior
• Suciedad en serpentín en la unidad interior o la exterior
• Compruebe carga de refrigerante y válvula de expansión
• Compruebe el voltaje de alimentación
• Verificar el correcto funcionamiento del compresor', NOW());
INSERT INTO error_codes (model_id, code, description, solution, created_at) VALUES (30, 'P3', '• Temperatura exterior menor a -25°C. (Calefacción)', '• Esperar a que temperatura exterior se estabilice.', NOW());
INSERT INTO error_codes (model_id, code, description, solution, created_at) VALUES (30, 'P4', '• Falla en "Driver" del compresor', '• Reemplace tarjeta del condensador', NOW());
INSERT INTO error_codes (model_id, code, description, solution, created_at) VALUES (30, 'P5', '• Conflicto de operación', '• El evaporador NO es compatible con el condensador', NOW());
INSERT INTO error_codes (model_id, code, description, solution, created_at) VALUES (30, 'P6', '• Protección por alta o baja presión de refrigerante', '• Verifique el estado del switch de presión en el lado de baja o alta presión.
• Verifique el la condensadora cuente con los espacios correctos.', NOW());
INSERT INTO error_codes (model_id, code, description, solution, created_at) VALUES (30, 'cF', '• El equipo se encuentra en etapa de pre-calentamiento justo antes de iniciar el modo calefacción', '• Esperar 5 minutos para iniciar modo de calefacción normalmente', NOW());
INSERT INTO air_conditioner_models (id, name, reference_id, image_url, logo_url, type, created_at) VALUES (31, 'MAGNUM32', 'magnum32', '/images/equipos/magnum32.png', '/images/logos/magnum32.png', '', NOW()) ON CONFLICT (id) DO NOTHING;
INSERT INTO error_codes (model_id, code, description, solution, created_at) VALUES (31, 'AP', 'Modo AP activado.
El modulo Wifi se encuentra activado para iniciar la configuracion.', '', NOW());
INSERT INTO error_codes (model_id, code, description, solution, created_at) VALUES (31, 'E0', '• Error en memoria EEPROM en tarjeta de evaporador.', '•Reemplace tarjeta del evaporador', NOW());
INSERT INTO error_codes (model_id, code, description, solution, created_at) VALUES (31, 'E1', '• Error de comunicación entre tarjeta evaporador / condensador.', '• Revisar voltaje de alimentación
• Comprobar el correcto cableado
• Falla en tarjeta de unidad interior
• Falla en tarjeta en unidad exterior', NOW());
INSERT INTO error_codes (model_id, code, description, solution, created_at) VALUES (31, 'E3', '• Velocidad anormal en motor evaporador', '• Motor o turbina obstruida
• Capacitor en mal estado
• Sensor de velocidad dañado o desconectado', NOW());
INSERT INTO error_codes (model_id, code, description, solution, created_at) VALUES (31, 'E4', '• Corto circuito o circuito abierto en sensor de temperatura ambiental de evaporador', '• Medir el sensor del evaporador 
• Revisar falso contacto', NOW());
INSERT INTO error_codes (model_id, code, description, solution, created_at) VALUES (31, 'E5', '• Corto circuito o circuito abierto en sensor de tubería de evaporador', '• Medir sensor de temperatura de tubería del evaporador
• Revisar falso contacto', NOW());
INSERT INTO error_codes (model_id, code, description, solution, created_at) VALUES (31, 'E8', '• Error de comunicación entre tarjeta evaporador / tarjeta del display', '• Verificar cable de conexión entre tarjeta evaporador  y tarjeta display
• Reemplazar tarjeta display (1ro)
• Reemplazar tarjeta display (2do)', NOW());
INSERT INTO error_codes (model_id, code, description, solution, created_at) VALUES (31, 'EA', '• Error en memoria EEPROM en tarjeta de evaporador', '•Reemplace tarjeta del evaporador', NOW());
INSERT INTO error_codes (model_id, code, description, solution, created_at) VALUES (31, 'EF', '• Error en el Sensor Inteligente', '• Verificar cable de conexión en la tarjeta del evaporador
• Reemplazar el sensor inteligente', NOW());
INSERT INTO error_codes (model_id, code, description, solution, created_at) VALUES (31, 'F0', '• Protección contra sobre corriente activada', '• Verificar parámetros eléctricos de la instalación
• Revisar uniones y conexiones del cableado eléctrico
• Pobre condensación
• Presiones de refrigerante elevadas o fuera de rango
• Carga térmica excesiva o equipo sobre forzado', NOW());
INSERT INTO error_codes (model_id, code, description, solution, created_at) VALUES (31, 'F1', '• Corto circuito o circuito abierto en sensor de temperatura ambiental de condensador', '• Medir el sensor de temperatura ambiental del condensador
• Revisar falso contacto', NOW());
INSERT INTO error_codes (model_id, code, description, solution, created_at) VALUES (31, 'F2', '• Corto circuito o circuito abierto en sensor de tubería de condensador', '• Medir sensor de temperatura de tubería del condensador
• Revisar falso contacto', NOW());
INSERT INTO error_codes (model_id, code, description, solution, created_at) VALUES (31, 'F3', '• Corto circuito o circuito abierto en sensor de tubería de descarga de compresor', '• Medir sensor de temperatura de tubería de descarga de compresor
• Revisar falso contacto', NOW());
INSERT INTO error_codes (model_id, code, description, solution, created_at) VALUES (31, 'F4', '• Error en memoria EEPROM en tarjeta de condensador', '• Reemplace tarjeta del condensador', NOW());
INSERT INTO error_codes (model_id, code, description, solution, created_at) VALUES (31, 'F5', '• Velocidad Anormal en motor condensador', '• Verificar terminales y conexiones eléctricas
• Bobinas internas del motor, baleros o rodamientos, aspa obstruida', NOW());
INSERT INTO error_codes (model_id, code, description, solution, created_at) VALUES (31, 'P0', '• Error en modulo IPM o IGBT en tarjeta de condensador', '• Reemplace tarjeta del condensador', NOW());
INSERT INTO error_codes (model_id, code, description, solution, created_at) VALUES (31, 'P1', '• Protección contra voltaje anormal (bajo o muy alto voltaje)', '• Comprobar que el voltaje de suministro este dentro del rango aceptable, de lo contrario, contacte a su proveedor para solicitar que realice un ajuste.', NOW());
INSERT INTO error_codes (model_id, code, description, solution, created_at) VALUES (31, 'P2', '• Alta temperatura en superficie de compresor', '• Baja velocidad del ventilador en la unidad interior o exterior
• Bajo retorno de aire en la unidad interior o la exterior
• Suciedad en serpentín en la unidad interior o la exterior
• Compruebe carga de refrigerante y válvula de expansión
• Compruebe el voltaje de alimentación
• Verificar el correcto funcionamiento del compresor', NOW());
INSERT INTO error_codes (model_id, code, description, solution, created_at) VALUES (31, 'P4', '• Falla en "Driver" del compresor', '• Reemplace tarjeta del condensador', NOW());
INSERT INTO error_codes (model_id, code, description, solution, created_at) VALUES (31, 'cF', '• El equipo se encuentra en etapa de pre-calentamiento justo antes de iniciar el modo calefacción', '• Esperar 5 minutos para iniciar modo de calefacción normalmente', NOW());
INSERT INTO air_conditioner_models (id, name, reference_id, image_url, logo_url, type, created_at) VALUES (32, 'MATT17', 'matt17', '/images/equipos/matt17.png', '/images/logos/matt17.png', '', NOW()) ON CONFLICT (id) DO NOTHING;
INSERT INTO error_codes (model_id, code, description, solution, created_at) VALUES (32, '5E', 'Error de comunicación entre evaporador y condensador', '• Error de conexión (cable de comunicación mal conectado)  aparece justo recién instalado
• Corrosión en tarjeta exterior, ocasionando corto circuito', NOW());
INSERT INTO error_codes (model_id, code, description, solution, created_at) VALUES (32, 'E1', '• Corto circuito o circuito abierto en sensor de temperatura ambiental de evaporador', '• Medir el sensor del evaporador
• Revisar falso contacto', NOW());
INSERT INTO error_codes (model_id, code, description, solution, created_at) VALUES (32, 'E2', '• Corto circuito o circuito abierto en sensor de tubería de condensador', '• Medir sensor de temperatura de tubería del condensador
• Revisar falso contacto', NOW());
INSERT INTO error_codes (model_id, code, description, solution, created_at) VALUES (32, 'E3', '• Corto circuito o circuito abierto en sensor de tubería de evaporador', '• Medir sensor de temperatura de tubería del evaporador
• Revisar falso contacto', NOW());
INSERT INTO error_codes (model_id, code, description, solution, created_at) VALUES (32, 'E4', '• Velocidad anormal en motor evaporador', '• Motor o turbina obstruida
• Capacitor en mal estado
• Sensor de velocidad dañado o desconectado', NOW());
INSERT INTO error_codes (model_id, code, description, solution, created_at) VALUES (32, 'E5', '• Error de comunicación entre tarjeta evaporador / condensador', '• Revisar voltaje de alimentación
• Comprobar el correcto cableado
• Falla en tarjeta de unidad interior
• Falla en tarjeta en unidad exterior', NOW());
INSERT INTO error_codes (model_id, code, description, solution, created_at) VALUES (32, 'F0', '• Velocidad Anormal en motor condensador', '• Verificar terminales y conexiones eléctricas
• Bobinas internas del motor, baleros o rodamientos, aspa obstruida', NOW());
INSERT INTO error_codes (model_id, code, description, solution, created_at) VALUES (32, 'F1', '• Error en modulo IPM en tarjeta de condensador', '•  Reemplazar la tarjeta del condensador', NOW());
INSERT INTO error_codes (model_id, code, description, solution, created_at) VALUES (32, 'F2', '• Falla en el modulo PFC', '•  Reemplazar la tarjeta del condensador', NOW());
INSERT INTO error_codes (model_id, code, description, solution, created_at) VALUES (32, 'F3', '• Falla en la operación del compresor', '•  Revisar funcionamiento de compresor
•  Compresor bloqueado
•  Fases invertidas en compresor', NOW());
INSERT INTO error_codes (model_id, code, description, solution, created_at) VALUES (32, 'F4', '• Corto circuito o circuito abierto en sensor de tubería de descarga de compresor', '• Medir sensor de temperatura de tubería de descarga de compresor
• Revisar falso contacto', NOW());
INSERT INTO error_codes (model_id, code, description, solution, created_at) VALUES (32, 'F5', '• Alta temperatura en superficie de compresor', '• Baja velocidad del ventilador en la unidad interior o exterior
• Bajo retorno de aire en la unidad interior o la exterior
• Suciedad en serpentín en la unidad interior o la exterior
• Compruebe carga de refrigerante y válvula de expansión
• Compruebe el voltaje de alimentación
• Verificar el correcto funcionamiento del compresor', NOW());
INSERT INTO error_codes (model_id, code, description, solution, created_at) VALUES (32, 'F6', '• Corto circuito o circuito abierto en sensor de temperatura ambiental de condensador', '• Medir el sensor de temperatura de tubería del condensador
• Revisar falso contacto', NOW());
INSERT INTO error_codes (model_id, code, description, solution, created_at) VALUES (32, 'F7', '• Protección contra voltaje anormal (bajo o muy alto voltaje)', '• Comprobar que el voltaje de suministro este dentro del rango aceptable, de lo contrario, contacte a su proveedor para solicitar que realice un ajuste.', NOW());
INSERT INTO error_codes (model_id, code, description, solution, created_at) VALUES (32, 'F8', '• Error de comunicación entre tarjeta evaporador / condensador', '• Revisar voltaje de alimentación
• Comprobar el correcto cableado
• Falla en tarjeta de unidad interior
• Falla en tarjeta en unidad exterior', NOW());
INSERT INTO error_codes (model_id, code, description, solution, created_at) VALUES (32, 'F9', '• Error en memoria EEPROM en tarjeta de condensador', '• Reemplace la tarjeta del condensador', NOW());
INSERT INTO error_codes (model_id, code, description, solution, created_at) VALUES (32, 'FA', '• Fallo del sensor de temperatura de succión', '• Medir sensor de temperatura de succión
• Revisar falso contacto', NOW());
INSERT INTO error_codes (model_id, code, description, solution, created_at) VALUES (32, 'LH', 'Falla en funcionamiento del motor condensador', '• Verifique que el conector del motor este correctamente ensamblado en la tarjeta y que no tenga los cables dañados.
• Compruebe que el motor no este dañado
• Revise que el condensador no este bloqueado y que tenga una buena circulación de aire.
• Verifique que la tarjeta de condensador no presente algún daño.', NOW());
INSERT INTO error_codes (model_id, code, description, solution, created_at) VALUES (32, 'P4', 'Protección por sobrecarga', '• La temperatura ambiente es demasiado alta o demasiado baja (Revisar sensores de temperatura)
• Intercambiador de calor sucio (limpiar el intercambiador de calor)
• La velocidad del motor exterior es baja (verifique el cableado del motor)
• Capilar obstruido', NOW());
INSERT INTO error_codes (model_id, code, description, solution, created_at) VALUES (32, 'P6', 'Protección por alta temperatura', '• Limpie el intercambiador de calor
• Compruebe el correcto funcionamiento de motor condensador
• Revisar falso contacto en sensor
• Revisar estado de sensor de descarga
• Reemplazar el sensor', NOW());
INSERT INTO air_conditioner_models (id, name, reference_id, image_url, logo_url, type, created_at) VALUES (33, 'MAX053', 'max053', '/images/equipos/max053.png', '/images/logos/max053.png', '', NOW()) ON CONFLICT (id) DO NOTHING;
INSERT INTO error_codes (model_id, code, description, solution, created_at) VALUES (33, 'E2', '• Corto o circuito abierto en sensor de aire', '• Medir el sensor de aire del evaporador
• Revisar falso contacto', NOW());
INSERT INTO error_codes (model_id, code, description, solution, created_at) VALUES (33, 'E3', '• Corto o circuito abierto en sensor de tubería (pozo) del evaporador', '• Medir sensor de tubería del evaporador.
• Revisar falso contacto', NOW());
INSERT INTO error_codes (model_id, code, description, solution, created_at) VALUES (33, 'E4', '• Anormalidad en el condensador', '• Verificar corriente del compresor y estado del capacitor
• Verificar presiones de alta y baja, aspa, motor
• Verificar obstrucciones en el serpentín', NOW());
INSERT INTO error_codes (model_id, code, description, solution, created_at) VALUES (33, 'E5', '• Velocidad del motor evaporador menor a 200 RPM por más de 5 segundos', '"• Motor o turbina obstruida
• Capacitor en mal estado
• Sensor de velocidad dañado o desconectado.', NOW());
INSERT INTO error_codes (model_id, code, description, solution, created_at) VALUES (33, 'E6', '• Falla en tarjeta principal', '• Reemplace la tarjeta', NOW());
INSERT INTO error_codes (model_id, code, description, solution, created_at) VALUES (33, 'E7', '• Falla de comunicación', '• Verificar cable de interconexión
• Bobinado del compresor
• Consumo de corriente anormal en el condensador', NOW());
INSERT INTO error_codes (model_id, code, description, solution, created_at) VALUES (33, 'E8', '• Temperatura anormal en el serpentín evaporador. Si esta en modo COOL puede ser congelamiento, si esta en modo HEAT sobrecalentamiento', '• Revisar espacio entre retorno y techo debe de haber 12 cm mínimo
• Evaporador o turbina sucia
• Termistor de aire o pozo fuera de rango
• Baja RPM en el motor del evaporador
• Exceso refrigerante', NOW());
INSERT INTO error_codes (model_id, code, description, solution, created_at) VALUES (33, 'dF', '• El equipo se encuentra en modo de descongelamiento o se ejecuta la función “Anti Cool Wave”.', '• Espere a que termine el ciclo de descongelamiento', NOW());
INSERT INTO air_conditioner_models (id, name, reference_id, image_url, logo_url, type, created_at) VALUES (34, 'MPT INDOOR', 'mpt_indoor', '/images/equipos/mpt-indoor.png', '/images/logos/mpt-indoor.png', '', NOW()) ON CONFLICT (id) DO NOTHING;
INSERT INTO error_codes (model_id, code, description, solution, created_at) VALUES (34, 'F_1', '• Corto o circuito abierto en sensor de aire', '• Medir  el sensor de aire del evaporador
• Revisar falso contacto', NOW());
INSERT INTO error_codes (model_id, code, description, solution, created_at) VALUES (34, 'F_2', '• Corto o circuito abierto en sensor de tubería (pozo) del evaporador', '• Medir el sensor de pozo del evaporador 
• Revisar falso contacto', NOW());
INSERT INTO error_codes (model_id, code, description, solution, created_at) VALUES (34, 'F_3', '• Alto o bajo voltaje en suministro eléctrico', '• Comprobar que el voltaje de suministro este dentro del rango aceptable, Si no, contacte a su proveedor para solicitar realce un ajuste', NOW());
INSERT INTO error_codes (model_id, code, description, solution, created_at) VALUES (34, 'F_4', '• Funcionamiento anormal en unidad exterior', '• Revise la unidad exterior', NOW());
INSERT INTO error_codes (model_id, code, description, solution, created_at) VALUES (34, 'F_5', '• Falla en memoria EEPROM', '• En esta situación se requiere el cambio de la tarjeta del evaporador', NOW());
INSERT INTO error_codes (model_id, code, description, solution, created_at) VALUES (34, 'F_10', '• Switch flotador en charola de evaporador, abierto por más de diez minutos.', '• Comprobar que la salida de drenado no esta dañada.
• Verificar que el switch del flotador no este roto o bloqueado .
• Comprobar que la bomba este operando correctamente.', NOW());
INSERT INTO air_conditioner_models (id, name, reference_id, image_url, logo_url, type, created_at) VALUES (35, 'MPT OUTDOOR', 'mpt_outdoor', '/images/equipos/mpt-outdoor.png', '/images/logos/mpt-outdoor.png', '', NOW()) ON CONFLICT (id) DO NOTHING;
INSERT INTO error_codes (model_id, code, description, solution, created_at) VALUES (35, 'F_1', '• Corto o circuito abierto en sensor de aire', '• Medir  el sensor de aire del evaporador
• Revisar falso contacto', NOW());
INSERT INTO error_codes (model_id, code, description, solution, created_at) VALUES (35, 'F_2', '• Corto o circuito abierto en sensor de tubería (pozo) del condensador.', '• Medir sensor de pozo del condensador.
• Revisar falso contacto.', NOW());
INSERT INTO error_codes (model_id, code, description, solution, created_at) VALUES (35, 'F_3', '• Corto o circuito abierto en sensor de descarga del compresor.', '• Medir sensor de descarga del compresor.
• Revisar falso contacto.', NOW());
INSERT INTO error_codes (model_id, code, description, solution, created_at) VALUES (35, 'F_4', '• Protección por alta temperatura en la descarga del compresor de 120°C por 10 segundos.', '• Compruebe que el serpentín este limpio y que fluya libre el aire de succión y descarga.
• Mida el sensor y compare su valor en la tabla.
• Mida el capacitor del ventilador de la condensadora y compruebe su correcto funcionamiento.', NOW());
INSERT INTO error_codes (model_id, code, description, solution, created_at) VALUES (35, 'F_5', '• Alto o bajo voltaje en suministro eléctrico.', '• Comprobar que el voltaje de suministro este dentro del rango aceptable, si no, contacte a su proveedor para solicitar que realice un ajuste.', NOW());
INSERT INTO error_codes (model_id, code, description, solution, created_at) VALUES (35, 'F_6', '• Funcionamiento anormal del sensor de baja presión.', '• Comprobar que la salida no este rota o dañada.
• Verificar que el switch no se quede activado cuando el compresor este apagado.
• Comprobar que el sensor se activa cuando el compresor esta encendido.', NOW());
INSERT INTO error_codes (model_id, code, description, solution, created_at) VALUES (35, 'F_7', '• Falla en memoria EEPROM.', '• En esta situación se requiere el cambio de la tarjeta del condensador.', NOW());
INSERT INTO error_codes (model_id, code, description, solution, created_at) VALUES (35, 'F_8', '• Protección por sobre-corriente activada 3 veces en el periodo de una hora.', '• Mida el capacitor del compresor y del ventilador de la condensadora.
• Utilice el kit de arranque de ser necesario.
• Mida el voltaje de suministro y compruebe que este dentro del rango.
• Compruebe que el serpentín este limpio y que fluya libre el aire de succión y descarga.', NOW());
INSERT INTO error_codes (model_id, code, description, solution, created_at) VALUES (35, 'F_9', '• Protección por alta presión activado tres veces en el periodo de una hora.', '• Comprobar que la salida del sensor no este rota o dañada.
• Verificar que el switch no este en circuito abierto.
• Compruebe que el serpentín este limpio y que fluya libre el aire de succión y descarga.', NOW());
INSERT INTO air_conditioner_models (id, name, reference_id, image_url, logo_url, type, created_at) VALUES (36, 'NEO', 'neo', '/images/equipos/neo.png', '/images/logos/neo.png', '', NOW()) ON CONFLICT (id) DO NOTHING;
INSERT INTO error_codes (model_id, code, description, solution, created_at) VALUES (36, 'E0', '• Error en memoria EEPROM en tarjeta de evaporador.', '•Reemplace tarjeta del evaporador', NOW());
INSERT INTO error_codes (model_id, code, description, solution, created_at) VALUES (36, 'E1', '• Error de comunicación entre tarjeta evaporador / condensador.', '• Revisar voltaje de alimentación
• Comprobar el correcto cableado
• Falla en tarjeta de unidad interior
• Falla en tarjeta en unidad exterior', NOW());
INSERT INTO error_codes (model_id, code, description, solution, created_at) VALUES (36, 'E2', '• Error de detección de cruce por cero en tarjeta evaporador', '•  Reemplazar tarjeta principal del evaporador', NOW());
INSERT INTO error_codes (model_id, code, description, solution, created_at) VALUES (36, 'E3', '• Velocidad anormal en motor evaporador', '• Motor o turbina obstruida
• Capacitor en mal estado
• Sensor de velocidad dañado o desconectado', NOW());
INSERT INTO error_codes (model_id, code, description, solution, created_at) VALUES (36, 'E4', '• Corto circuito o circuito abierto en sensor de temperatura ambiental de evaporador', '• Medir el sensor del evaporador 
• Revisar falso contacto', NOW());
INSERT INTO error_codes (model_id, code, description, solution, created_at) VALUES (36, 'E5', '• Corto circuito o circuito abierto en sensor de tubería de evaporador', '• Medir sensor de temperatura de tubería del evaporador
• Revisar falso contacto', NOW());
INSERT INTO error_codes (model_id, code, description, solution, created_at) VALUES (36, 'EC', '• Fuga o escasez de refrigerante', '• Verificar presiones de refrigerante
• Válvulas de servicio cerradas o abiertas parcialmente
• Switch de baja presión dañado
• Presenta perdida de refrigerante', NOW());
INSERT INTO error_codes (model_id, code, description, solution, created_at) VALUES (36, 'F0', '• Protección contra sobre corriente activada', '• Verificar parámetros eléctricos de la instalación
• Revisar uniones y conexiones del cableado eléctrico
• Pobre condensación
• Presiones de refrigerante elevadas o fuera de rango
• Carga térmica excesiva o equipo sobre forzado', NOW());
INSERT INTO error_codes (model_id, code, description, solution, created_at) VALUES (36, 'F1', '• Corto circuito o circuito abierto en sensor de temperatura ambiental de condensador', '• Medir el sensor de temperatura ambiental del condensador
• Revisar falso contacto', NOW());
INSERT INTO error_codes (model_id, code, description, solution, created_at) VALUES (36, 'F2', '• Corto circuito o circuito abierto en sensor de tubería de condensador', '• Medir sensor de temperatura de tubería del condensador
• Revisar falso contacto', NOW());
INSERT INTO error_codes (model_id, code, description, solution, created_at) VALUES (36, 'F3', '• Corto circuito o circuito abierto en sensor de tubería de descarga de compresor', '• Medir sensor de temperatura de tubería de descarga de compresor
• Revisar falso contacto', NOW());
INSERT INTO error_codes (model_id, code, description, solution, created_at) VALUES (36, 'F4', '• Error en memoria EEPROM en tarjeta de condensador', '• Reemplace tarjeta del condensador', NOW());
INSERT INTO error_codes (model_id, code, description, solution, created_at) VALUES (36, 'F5', '• Velocidad Anormal en motor condensador', '• Verificar terminales y conexiones eléctricas
• Bobinas internas del motor, baleros o rodamientos, aspa obstruida', NOW());
INSERT INTO error_codes (model_id, code, description, solution, created_at) VALUES (36, 'P0', '• Error en modulo IPM o IGBT en tarjeta de condensador', '• Reemplace tarjeta del condensador', NOW());
INSERT INTO error_codes (model_id, code, description, solution, created_at) VALUES (36, 'P1', '• Protección contra voltaje anormal (bajo o muy alto voltaje)', '• Comprobar que el voltaje de suministro este dentro del rango aceptable, de lo contrario, contacte a su proveedor para solicitar que realice un ajuste.', NOW());
INSERT INTO error_codes (model_id, code, description, solution, created_at) VALUES (36, 'P2', '• Alta temperatura en superficie de compresor', '• Baja velocidad del ventilador en la unidad interior o exterior
• Bajo retorno de aire en la unidad interior o la exterior
• Suciedad en serpentín en la unidad interior o la exterior
• Compruebe carga de refrigerante y válvula de expansión
• Compruebe el voltaje de alimentación
• Verificar el correcto funcionamiento del compresor', NOW());
INSERT INTO error_codes (model_id, code, description, solution, created_at) VALUES (36, 'P3', '• Temperatura exterior menor a -25°C. (Calefacción)', '• Esperar a que temperatura exterior se estabilice.', NOW());
INSERT INTO error_codes (model_id, code, description, solution, created_at) VALUES (36, 'P4', '• Falla en "Driver" del compresor', '• Reemplace tarjeta del condensador', NOW());
INSERT INTO error_codes (model_id, code, description, solution, created_at) VALUES (36, 'P5', '• Conflicto de operación', '• El evaporador NO es compatible con el condensador', NOW());
INSERT INTO error_codes (model_id, code, description, solution, created_at) VALUES (36, 'cF', '• El equipo se encuentra en etapa de pre-calentamiento justo antes de iniciar el modo calefacción', '• Esperar 5 minutos para iniciar modo de calefacción normalmente', NOW());
INSERT INTO air_conditioner_models (id, name, reference_id, image_url, logo_url, type, created_at) VALUES (37, 'NEX', 'nex', '/images/equipos/nex.png', '/images/logos/nex.png', '', NOW()) ON CONFLICT (id) DO NOTHING;
INSERT INTO error_codes (model_id, code, description, solution, created_at) VALUES (37, 'F1', '• Corto o circuito abierto en sensor de aire', '• Medir el sensor de aire del evaporador
• Revisar falso contacto', NOW());
INSERT INTO error_codes (model_id, code, description, solution, created_at) VALUES (37, 'F2', '• Corto o circuito abierto en sensor de tubería (pozo) del evaporador', '• Medir sensor de temperatura ambiente del condensador (pozo)
• Revisar falso contacto', NOW());
INSERT INTO error_codes (model_id, code, description, solution, created_at) VALUES (37, 'F4', '• Velocidad del motor evaporador menor a 200 RPM por más de 5 segundos', '• Motor o turbina obstruida
• Capacitor en mal estado
• Sensor de velocidad dañado o desconectado', NOW());
INSERT INTO error_codes (model_id, code, description, solution, created_at) VALUES (37, 'P2', '• Alta temperatura en evaporador durante modo calefacción', '• Revisar espacio entre retorno y techo, debe de haber 12 cm mínimo
• Evaporador o turbina sucia
• Termistor de aire o pozo fuera de rango
• Baja RPM en el motor del evaporador
• Exceso refrigerante', NOW());
INSERT INTO error_codes (model_id, code, description, solution, created_at) VALUES (37, 'P3', '• Protección contra congelamiento en modo de enfriamiento', '• Revisar espacio entre retorno y techo debe de haber 12 cm mínimo
• Evaporador o turbina sucia
• Termistor de aire o pozo fuera de rango
• Baja RPM en el motor del evaporador
• Falta de refrigerante', NOW());
INSERT INTO air_conditioner_models (id, name, reference_id, image_url, logo_url, type, created_at) VALUES (38, 'SMART', 'smart', '/images/equipos/smart.png', '/images/logos/smart.png', '', NOW()) ON CONFLICT (id) DO NOTHING;
INSERT INTO error_codes (model_id, code, description, solution, created_at) VALUES (38, 'C5', 'Ausencia o daño del “jumper” o puente de configuración.', '• Coloque el JUMPER correspondiente en la tarjeta de control:
                0110  12K 
                0001  18k
                0010  26k', NOW());
INSERT INTO error_codes (model_id, code, description, solution, created_at) VALUES (38, 'E5', 'Corriente excesiva en el compresor ocurrida más de 4 veces continúas.', '• Mida el capacitor del compresor.
• Utilice kit de arranque de ser necesario.
• Medir voltaje de línea', NOW());
INSERT INTO error_codes (model_id, code, description, solution, created_at) VALUES (38, 'F1', 'Corto o circuito abierto en sensor de aire.', '• Medir el sensor de aire del evaporador.
• Verificar falso contacto.', NOW());
INSERT INTO error_codes (model_id, code, description, solution, created_at) VALUES (38, 'F2', 'Corto o circuito abierto en sensor de tubería (pozo) del evaporador', '• Medir sensor de temperatura ambiente del evaporador  (pozo)
• Verificar falso contacto', NOW());
INSERT INTO error_codes (model_id, code, description, solution, created_at) VALUES (38, 'H1', 'El equipo se encuentra en modo de descongelamiento inteligente es un comportamiento normal de los equipos con calefacción.', '• El equipo realiza el proceso de deshielo automático asegurando que este listo para operar calefacción.', NOW());
INSERT INTO error_codes (model_id, code, description, solution, created_at) VALUES (38, 'H6', 'Velocidad del motor evaporador menor a 200 RPM por más de 5 segundos.', '• Motor o turbina obstruida.
• Capacitor en mal estado.
• Sensor de velocidad dañado o desconectado.', NOW());
INSERT INTO air_conditioner_models (id, name, reference_id, image_url, logo_url, type, created_at) VALUES (39, 'TITANIUM2', 'titanium2', '/images/equipos/titanium2.png', '/images/logos/titanium2.png', '', NOW()) ON CONFLICT (id) DO NOTHING;
INSERT INTO error_codes (model_id, code, description, solution, created_at) VALUES (39, 'F6', '• Velocidad del motor evaporador menor a 200 RPM por más de 5 segundos', '• Motor o turbina obstruida
• Capacitor en mal estado
• Sensor de velocidad dañado o desconectado', NOW());
INSERT INTO error_codes (model_id, code, description, solution, created_at) VALUES (39, 'F7', '• Corto o circuito abierto en sensor de aire', '• Medir el sensor de aire del evaporador
• Revisar falso contacto', NOW());
INSERT INTO error_codes (model_id, code, description, solution, created_at) VALUES (39, 'F8', '• Corto o circuito abierto en sensor de tubería (pozo) del evaporador', '• Medir sensor de tubería del evaporador
• Revisar falso contacto', NOW());
INSERT INTO error_codes (model_id, code, description, solution, created_at) VALUES (39, 'F9', '• Corto o circuito abierto en sensor de tubería (pozo) del condensador', '• Medir sensor de tubería del condensador
• Revisar falso contacto', NOW());
INSERT INTO air_conditioner_models (id, name, reference_id, image_url, logo_url, type, created_at) VALUES (40, 'TITANIUM5', 'titanium5', '/images/equipos/titanium5.png', '/images/logos/titanium5.png', '', NOW()) ON CONFLICT (id) DO NOTHING;
INSERT INTO error_codes (model_id, code, description, solution, created_at) VALUES (40, 'CF', '• Aviso de limpieza de filtros. Se activa al acumular 250 hrs de operación', '• Se desactiva al bajar y subir térmico.', NOW());
INSERT INTO error_codes (model_id, code, description, solution, created_at) VALUES (40, 'F6', '• Velocidad del motor evaporador menor a 200 RPM por más de 5 segundos', '• Motor o turbina obstruida
• Capacitor en mal estado
• Sensor de velocidad dañado o desconectado', NOW());
INSERT INTO error_codes (model_id, code, description, solution, created_at) VALUES (40, 'F7', '• Corto o circuito abierto en sensor de aire', '• Medir el sensor de aire del evaporador
• Revisar falso contacto', NOW());
INSERT INTO error_codes (model_id, code, description, solution, created_at) VALUES (40, 'F8', '• Corto o circuito abierto en sensor de tubería (pozo) del evaporador', '• Medir sensor de tubería del evaporador
• Revisar falso contacto', NOW());
INSERT INTO error_codes (model_id, code, description, solution, created_at) VALUES (40, 'F9', '• Corto o circuito abierto en sensor de tubería (pozo) del condensador', '• Medir sensor de tubería del condensador
• Revisar falso contacto', NOW());
INSERT INTO air_conditioner_models (id, name, reference_id, image_url, logo_url, type, created_at) VALUES (41, 'TITANIUM7', 'titanium7', '/images/equipos/titanium7.png', '/images/logos/titanium7.png', '', NOW()) ON CONFLICT (id) DO NOTHING;
INSERT INTO error_codes (model_id, code, description, solution, created_at) VALUES (41, 'CF', '• Aviso de limpieza de filtros. Se activa al acumular 250 hrs de operación', '• Se desactiva al bajar y subir térmico.', NOW());
INSERT INTO error_codes (model_id, code, description, solution, created_at) VALUES (41, 'F6', '• Velocidad del motor evaporador menor a 200 RPM por más de 5 segundos', '• Motor o turbina obstruida
• Capacitor en mal estado
• Sensor de velocidad dañado o desconectado', NOW());
INSERT INTO error_codes (model_id, code, description, solution, created_at) VALUES (41, 'F7', '• Corto o circuito abierto en sensor de aire', '• Medir el sensor de aire del evaporador
• Revisar falso contacto', NOW());
INSERT INTO error_codes (model_id, code, description, solution, created_at) VALUES (41, 'F8', '• Corto o circuito abierto en sensor de tubería (pozo) del evaporador', '• Medir sensor de tubería del evaporador
• Revisar falso contacto', NOW());
INSERT INTO error_codes (model_id, code, description, solution, created_at) VALUES (41, 'F9', '• Corto o circuito abierto en sensor de tubería (pozo) del condensador', '• Medir sensor de tubería del condensador
• Revisar falso contacto', NOW());
INSERT INTO air_conditioner_models (id, name, reference_id, image_url, logo_url, type, created_at) VALUES (42, 'TITANIUM8', 'titanium8', '/images/equipos/titanium8.png', '/images/logos/titanium8.png', '', NOW()) ON CONFLICT (id) DO NOTHING;
INSERT INTO error_codes (model_id, code, description, solution, created_at) VALUES (42, 'CF', '• Aviso de limpieza de filtros. Se activa al acumular 250 hrs de operación', '• Se desactiva al bajar y subir térmico.', NOW());
INSERT INTO error_codes (model_id, code, description, solution, created_at) VALUES (42, 'F6', '• Velocidad del motor evaporador menor a 200 RPM por más de 5 segundos', '• Motor o turbina obstruida
• Capacitor en mal estado
• Sensor de velocidad dañado o desconectado', NOW());
INSERT INTO error_codes (model_id, code, description, solution, created_at) VALUES (42, 'F7', '• Corto o circuito abierto en sensor de aire', '• Medir el sensor de aire del evaporador
• Revisar falso contacto', NOW());
INSERT INTO error_codes (model_id, code, description, solution, created_at) VALUES (42, 'F8', '• Corto o circuito abierto en sensor de tubería (pozo) del evaporador', '• Medir sensor de tubería del evaporador
• Revisar falso contacto', NOW());
INSERT INTO error_codes (model_id, code, description, solution, created_at) VALUES (42, 'F9', '• Corto o circuito abierto en sensor de tubería (pozo) del condensador', '• Medir sensor de tubería del condensador
• Revisar falso contacto', NOW());
INSERT INTO air_conditioner_models (id, name, reference_id, image_url, logo_url, type, created_at) VALUES (43, 'TITANIUM9', 'titanium9', '/images/equipos/titanium9.png', '/images/logos/titanium9.png', '', NOW()) ON CONFLICT (id) DO NOTHING;
INSERT INTO error_codes (model_id, code, description, solution, created_at) VALUES (43, 'CF', '• Aviso de limpieza de filtros. Se activa al acumular 250 hrs de operación', '• Se desactiva al bajar y subir térmico.', NOW());
INSERT INTO error_codes (model_id, code, description, solution, created_at) VALUES (43, 'F6', '• Velocidad del motor evaporador menor a 200 RPM por más de 5 segundos', '• Motor o turbina obstruida
• Capacitor en mal estado
• Sensor de velocidad dañado o desconectado', NOW());
INSERT INTO error_codes (model_id, code, description, solution, created_at) VALUES (43, 'F7', '• Corto o circuito abierto en sensor de aire', '• Medir el sensor de aire del evaporador
• Revisar falso contacto', NOW());
INSERT INTO error_codes (model_id, code, description, solution, created_at) VALUES (43, 'F8', '• Corto o circuito abierto en sensor de tubería (pozo) del evaporador', '• Medir sensor de tubería del evaporador
• Revisar falso contacto', NOW());
INSERT INTO error_codes (model_id, code, description, solution, created_at) VALUES (43, 'F9', '• Corto o circuito abierto en sensor de tubería (pozo) del condensador', '• Medir sensor de tubería del condensador
• Revisar falso contacto', NOW());
INSERT INTO air_conditioner_models (id, name, reference_id, image_url, logo_url, type, created_at) VALUES (44, 'TURBOFLUX', 'turboflux', '/images/equipos/turboflux.png', '/images/logos/turboflux.png', '', NOW()) ON CONFLICT (id) DO NOTHING;
INSERT INTO error_codes (model_id, code, description, solution, created_at) VALUES (44, 'E0', '• Fallo en sensor de salida de agua', '• Comprobar su correcta conexión
• Revisar continuidad o reemplazarlo', NOW());
INSERT INTO error_codes (model_id, code, description, solution, created_at) VALUES (44, 'E1', '• Fallo en circuito eléctrico del sensor de flama', '• Limpiar residuos de combustión
• Verificar correcta ubicación o reemplazarlo', NOW());
INSERT INTO error_codes (model_id, code, description, solution, created_at) VALUES (44, 'E2', '• Protección de fugas en cámara de combustión', '• Ajustar líneas de gas
• Revisar fugas en cámara de combustión
• Reemplazar sellos y asientos en válvula solenoide.', NOW());
INSERT INTO error_codes (model_id, code, description, solution, created_at) VALUES (44, 'E3', '• El encendido falló o se apago accidentalmente', '• Revisar suministro de gas
• Evitar instalarlo en lugares con fuertes corrientes de aire
• Verificar voltaje en válvula selenoide de gas.', NOW());
INSERT INTO error_codes (model_id, code, description, solution, created_at) VALUES (44, 'E4', '• Fallo en sensor de entrada de agua', '• Comprobar su correcta conexión
• Revisar continuidad o reemplazarlo', NOW());
INSERT INTO error_codes (model_id, code, description, solution, created_at) VALUES (44, 'E5', '• Protección por sobre calentamiento
(Temperatura >75°C)', '• Revisar suministro de agua
• Descarga de gases obstruida
• Válvula de agua cerrada
• Cedazo en entrada de agua tapado', NOW());
INSERT INTO error_codes (model_id, code, description, solution, created_at) VALUES (44, 'E6', '• Turbo extractor dañado o cámara de extracción de gases obstruida', '• Verificar motor de turbina
• Comprobar capacitor de motor
• Retirar basura en descarga de gases
• Revisar sensor de vacío', NOW());
INSERT INTO error_codes (model_id, code, description, solution, created_at) VALUES (44, 'E7', '• Falla por válvula abierta o desconectada', '• Comprobar funcionamiento de motor PNG en válvula de entrada de agua, limpiar y retirar obstrucciones', NOW());
INSERT INTO error_codes (model_id, code, description, solution, created_at) VALUES (44, 'nE', '• Protección por tiempo de uso máximo de 20 minutos', '• Cerrar y abrir la llave de agua para reiniciar el temporizador', NOW());
INSERT INTO air_conditioner_models (id, name, reference_id, image_url, logo_url, type, created_at) VALUES (45, 'UVC', 'uvc', '/images/equipos/uvc.png', '/images/logos/uvc.png', '', NOW()) ON CONFLICT (id) DO NOTHING;
INSERT INTO error_codes (model_id, code, description, solution, created_at) VALUES (45, 'E0', '• Alta temperatura en superficie de compresor', '• Baja velocidad del ventilador en la unidad interior o exterior
• Bajo retorno de aire en la unidad interior o la exterior
• Suciedad en serpentín en la unidad interior o la exterior
• Compruebe carga de refrigerante y válvula de expansión
• Compruebe el voltaje de alimentación
• Verificar el correcto funcionamiento del compresor', NOW());
INSERT INTO error_codes (model_id, code, description, solution, created_at) VALUES (45, 'E3', '• Protección por sobre corriente en modulo IPM en tarjeta de condensador', '• Reemplazar la tarjeta del condensador', NOW());
INSERT INTO error_codes (model_id, code, description, solution, created_at) VALUES (45, 'E4', 'Arranque anormal del compresor', '• Rotación invertida:
Verificar el orden de conexión terminales UVW.
• Perdida de Fase:
Verificar terminales UVW que salen del modulo y llegan al compresor estén conectadas firmemente.
• Modulo de control:
La tarjeta en la unidad condensadora no esta generando la señal de potencia para el compresor.
• Compresor:
Revisar la resistencia entre las terminales del compresor. Si las 3 mediciones mediciones deben ser casi iguales, de lo contrario, el compresor presenta daño interno.', NOW());
INSERT INTO error_codes (model_id, code, description, solution, created_at) VALUES (45, 'E7', '• Velocidad Anormal en motor condensador', '• Verificar terminales y conexiones eléctricas
• Bobinas internas del motor, baleros o rodamientos, aspa obstruida', NOW());
INSERT INTO error_codes (model_id, code, description, solution, created_at) VALUES (45, 'E8', '• Falla en compresor', '• Verificar terminales y conexiones eléctricas
• Revisar la resistencia de los embobinados del compresor.', NOW());
INSERT INTO error_codes (model_id, code, description, solution, created_at) VALUES (45, 'EE', '• Error en memoria EEPROM en tarjeta de evaporador.', '•Reemplace tarjeta del evaporador', NOW());
INSERT INTO error_codes (model_id, code, description, solution, created_at) VALUES (45, 'EF', '• Falla en memoria EEPROM en tarjeta de condensador', '• Reemplace tarjeta del condensador', NOW());
INSERT INTO error_codes (model_id, code, description, solution, created_at) VALUES (45, 'F0', '• Velocidad anormal en motor evaporador', '• Motor o turbina obstruida
• Sensor de velocidad dañado o desconectado
• Capacitor en mal estado', NOW());
INSERT INTO error_codes (model_id, code, description, solution, created_at) VALUES (45, 'F1', '• Corto circuito o circuito abierto en sensor de temperatura ambiente en evaporador', '• Medir el sensor de temperatura ambiente del evaporador
• Revisar falso contacto', NOW());
INSERT INTO error_codes (model_id, code, description, solution, created_at) VALUES (45, 'F2', '• Corto circuito o circuito abierto en sensor de temperatura ambiente en condensador', '• Medir el sensor de temperatura ambiente del condensador
• Revisar falso contacto', NOW());
INSERT INTO error_codes (model_id, code, description, solution, created_at) VALUES (45, 'F3', '• Corto circuito o circuito abierto en sensor de pozo en evaporador', '• Medir el sensor de pozo del evaporador
• Revisar falso contacto', NOW());
INSERT INTO error_codes (model_id, code, description, solution, created_at) VALUES (45, 'F4', '• Corto circuito o circuito abierto en sensor de pozo en condensador', '• Medir el sensor de pozo del condensador
• Revisar falso contacto', NOW());
INSERT INTO error_codes (model_id, code, description, solution, created_at) VALUES (45, 'F5', '• El sensor de temperatura de descarga del compresor está abierto o presenta corto circuito', '• El sensor de temperatura de descarga del compresor no ha sido conectado correctamente o está dañado. Revíselo contra la tabla de resistencias vs temperatura del sensor
• El sensor de temperatura de descarga del compresor no ha sido insertado a la tubería en la linea de descarga', NOW());
INSERT INTO error_codes (model_id, code, description, solution, created_at) VALUES (45, 'F6', '• Error de comunicación entre tarjeta evaporador / condensador.', '• Revisar voltaje de alimentación
• Comprobar el correcto cableado
• Falla en tarjeta de unidad interior
• Falla en tarjeta en unidad exterior', NOW());
INSERT INTO error_codes (model_id, code, description, solution, created_at) VALUES (45, 'F8', '• Error de comunicación entre tarjeta evaporador / condensador.', '• Revisar voltaje de alimentación
• Comprobar el correcto cableado
• Falla en tarjeta de unidad interior
• Falla en tarjeta en unidad exterior', NOW());
INSERT INTO error_codes (model_id, code, description, solution, created_at) VALUES (45, 'F9', '• Protección en modulo IPM', '• Reemplace tarjeta de condensador', NOW());
INSERT INTO error_codes (model_id, code, description, solution, created_at) VALUES (45, 'Fd', '• Falla en memoria EEPROM en tarjeta de evaporador', '• Reemplace tarjeta del evaporador', NOW());
INSERT INTO error_codes (model_id, code, description, solution, created_at) VALUES (45, 'P1', '• Alta temperatura en descarga de compresor', '• Baja velocidad del ventilador en la unidad interior o exterior
• Bajo retorno de aire en la unidad interior o la exterior
• Suciedad en serpentín en la unidad interior o la exterior
• La tapa del condensador esta suelta y no circula el aire correctamente
• Verificar el correcto funcionamiento del sensor de temperatura de tubo en unidad exterior', NOW());
INSERT INTO air_conditioner_models (id, name, reference_id, image_url, logo_url, type, created_at) VALUES (46, 'VLUSERIES', 'vluseries', '/images/equipos/vluseries.png', '/images/logos/vluseries.png', '', NOW()) ON CONFLICT (id) DO NOTHING;
INSERT INTO error_codes (model_id, code, description, solution, created_at) VALUES (46, 'F1', '• Corto o circuito abierto en sensor de aire', '• Medir el sensor de aire del evaporador
• Revisar falso contacto', NOW());
INSERT INTO error_codes (model_id, code, description, solution, created_at) VALUES (46, 'F2', '• Corto o circuito abierto en sensor de tubería (pozo) del evaporador', '• Medir sensor de temperatura ambiente del condensador (pozo)
• Revisar falso contacto', NOW());
INSERT INTO error_codes (model_id, code, description, solution, created_at) VALUES (46, 'F3', '• Corto o circuito abierto en sensor de temperatura ambiente del condensador', '• Medir sensor de temperatura ambiente del condensador
• Revisar falso contacto', NOW());
INSERT INTO error_codes (model_id, code, description, solution, created_at) VALUES (46, 'F4', '• Velocidad del motor evaporador menor a 200 RPM por más de 5 segundos', '• Motor o turbina obstruida
• Capacitor en mal estado
• Sensor de velocidad dañado o desconectado', NOW());
INSERT INTO error_codes (model_id, code, description, solution, created_at) VALUES (46, 'P2', '• Alta temperatura en evaporador durante modo calefacción', '• Revisar espacio entre retorno y techo, debe de haber 12 cm mínimo
• Evaporador o turbina sucia
• Termistor de aire o pozo fuera de rango
• Baja RPM en el motor del evaporador
• Exceso refrigerante', NOW());
INSERT INTO error_codes (model_id, code, description, solution, created_at) VALUES (46, 'P3', '• Protección contra congelamiento en modo de enfriamiento', '• Revisar espacio entre retorno y techo debe de haber 12 cm mínimo
• Evaporador o turbina sucia
• Termistor de aire o pozo fuera de rango
• Baja RPM en el motor del evaporador
• Falta de refrigerante', NOW());
INSERT INTO air_conditioner_models (id, name, reference_id, image_url, logo_url, type, created_at) VALUES (47, 'VOX', 'vox', '/images/equipos/vox.png', '/images/logos/vox.png', '', NOW()) ON CONFLICT (id) DO NOTHING;
INSERT INTO error_codes (model_id, code, description, solution, created_at) VALUES (47, 'E0', '• Alta temperatura en superficie de compresor', '• Baja velocidad del ventilador en la unidad interior o exterior
• Bajo retorno de aire en la unidad interior o la exterior
• Suciedad en serpentín en la unidad interior o la exterior
• Compruebe carga de refrigerante y válvula de expansión
• Compruebe el voltaje de alimentación
• Verificar el correcto funcionamiento del compresor', NOW());
INSERT INTO error_codes (model_id, code, description, solution, created_at) VALUES (47, 'E3', '• Protección por sobre corriente en modulo IPM en tarjeta de condensador', '• Reemplazar la tarjeta del condensador', NOW());
INSERT INTO error_codes (model_id, code, description, solution, created_at) VALUES (47, 'E7', '• Velocidad Anormal en motor condensador', '• Verificar terminales y conexiones eléctricas
• Bobinas internas del motor, baleros o rodamientos, aspa obstruida', NOW());
INSERT INTO error_codes (model_id, code, description, solution, created_at) VALUES (47, 'E8', '• Falla en compresor', '• Verificar terminales y conexiones eléctricas
• Revisar la resistencia de los embobinados del compresor.', NOW());
INSERT INTO error_codes (model_id, code, description, solution, created_at) VALUES (47, 'EE', '• Error en memoria EEPROM en tarjeta de evaporador.', '•Reemplace tarjeta del evaporador', NOW());
INSERT INTO error_codes (model_id, code, description, solution, created_at) VALUES (47, 'EF', '• Falla en memoria EEPROM en tarjeta de condensador', '• Reemplace tarjeta del condensador', NOW());
INSERT INTO error_codes (model_id, code, description, solution, created_at) VALUES (47, 'F0', '• Velocidad anormal en motor evaporador', '• Motor o turbina obstruida
• Sensor de velocidad dañado o desconectado
• Capacitor en mal estado', NOW());
INSERT INTO error_codes (model_id, code, description, solution, created_at) VALUES (47, 'F1', '• Corto circuito o circuito abierto en sensor de temperatura ambiente en evaporador', '• Medir el sensor de temperatura ambiente del evaporador
• Revisar falso contacto', NOW());
INSERT INTO error_codes (model_id, code, description, solution, created_at) VALUES (47, 'F2', '• Corto circuito o circuito abierto en sensor de temperatura ambiente en condensador', '• Medir el sensor de temperatura ambiente del condensador
• Revisar falso contacto', NOW());
INSERT INTO error_codes (model_id, code, description, solution, created_at) VALUES (47, 'F3', '• Corto circuito o circuito abierto en sensor de pozo en evaporador', '• Medir el sensor de pozo del evaporador
• Revisar falso contacto', NOW());
INSERT INTO error_codes (model_id, code, description, solution, created_at) VALUES (47, 'F4', '• Corto circuito o circuito abierto en sensor de pozo en condensador', '• Medir el sensor de pozo del condensador
• Revisar falso contacto', NOW());
INSERT INTO error_codes (model_id, code, description, solution, created_at) VALUES (47, 'F5', '• El sensor de temperatura de descarga del compresor está abierto o presenta corto circuito', '• El sensor de temperatura de descarga del compresor no ha sido conectado correctamente o está dañado. Revíselo contra la tabla de resistencias vs temperatura del sensor
• El sensor de temperatura de descarga del compresor no ha sido insertado a la tubería en la linea de descarga', NOW());
INSERT INTO error_codes (model_id, code, description, solution, created_at) VALUES (47, 'F6', '• Error de comunicación entre tarjeta evaporador / condensador.', '• Revisar voltaje de alimentación
• Comprobar el correcto cableado
• Falla en tarjeta de unidad interior
• Falla en tarjeta en unidad exterior', NOW());
INSERT INTO error_codes (model_id, code, description, solution, created_at) VALUES (47, 'F8', '• Error de comunicación entre tarjeta evaporador / condensador.', '• Revisar voltaje de alimentación
• Comprobar el correcto cableado
• Falla en tarjeta de unidad interior
• Falla en tarjeta en unidad exterior', NOW());
INSERT INTO error_codes (model_id, code, description, solution, created_at) VALUES (47, 'F9', '• Protección en modulo IPM', '• Reemplace tarjeta de condensador', NOW());
INSERT INTO error_codes (model_id, code, description, solution, created_at) VALUES (47, 'Fd', '• Falla en memoria EEPROM en tarjeta de evaporador', '• Reemplace tarjeta del evaporador', NOW());
INSERT INTO error_codes (model_id, code, description, solution, created_at) VALUES (47, 'P1', '• Alta temperatura en descarga de compresor', '• Baja velocidad del ventilador en la unidad interior o exterior
• Bajo retorno de aire en la unidad interior o la exterior
• Suciedad en serpentín en la unidad interior o la exterior
• La tapa del condensador esta suelta y no circula el aire correctamente
• Verificar el correcto funcionamiento del sensor de temperatura de tubo en unidad exterior', NOW());
INSERT INTO air_conditioner_models (id, name, reference_id, image_url, logo_url, type, created_at) VALUES (48, 'X-ONE', 'x-one', '/images/equipos/xone.png', '/images/logos/xone.png', '', NOW()) ON CONFLICT (id) DO NOTHING;
INSERT INTO error_codes (model_id, code, description, solution, created_at) VALUES (48, 'E1', '• Corto circuito o circuito abierto en sensor de temperatura ambiental de evaporador', '• Medir la resistencia en el sensor de temperatura ambiente del evaporador
• Revisar falso contacto', NOW());
INSERT INTO error_codes (model_id, code, description, solution, created_at) VALUES (48, 'E2', '• Corto circuito o circuito abierto en sensor de pozo en evaporador', '• Medir la resistencia en el sensor de pozo del evaporador
• Revisar falso contacto', NOW());
INSERT INTO error_codes (model_id, code, description, solution, created_at) VALUES (48, 'E3', '• Corto circuito o circuito abierto en sensor temperatura en condensador', '• Medir la resistencia en el sensor de temperatura del condensador
• Revisar falso contacto', NOW());
INSERT INTO error_codes (model_id, code, description, solution, created_at) VALUES (48, 'E4', '• Fuga o escasez de refrigerante', '• Verificar presiones de refrigerante
• Switch de baja presión dañado
• Presenta perdida de refrigerante', NOW());
INSERT INTO error_codes (model_id, code, description, solution, created_at) VALUES (48, 'P1', '• Protección de bandeja de agua lleno', '• Mueva con cuidado la unidad a una ubicación con drenaje, retire el tapón de drenaje inferior hasta retirar todo el excedente de agua.
• Instale nuevamente el tapón de drenaje y reinicie su equipo portátil para restablecer la protección.', NOW());
INSERT INTO air_conditioner_models (id, name, reference_id, image_url, logo_url, type, created_at) VALUES (49, 'X2', 'x2', '/images/equipos/x2.png', '/images/logos/x2.png', '', NOW()) ON CONFLICT (id) DO NOTHING;
INSERT INTO error_codes (model_id, code, description, solution, created_at) VALUES (49, 'E1', '• Error en memoria EEPROM en tarjeta de evaporador', '• En esta situación se requiere el cambio de la tarjeta del evaporador', NOW());
INSERT INTO error_codes (model_id, code, description, solution, created_at) VALUES (49, 'E2', '• Señal interna de tarjeta de control, fuera de sincronía', '', NOW());
INSERT INTO error_codes (model_id, code, description, solution, created_at) VALUES (49, 'E3', '• Velocidad anormal en motor evaporador', '• Motor o turbina obstruida
• Capacitor en mal estado
• Sensor de velocidad dañado o desconectado', NOW());
INSERT INTO error_codes (model_id, code, description, solution, created_at) VALUES (49, 'E5', '• Corto circuito o circuito abierto en sensor de temperatura ambiental del evaporador', '• Medir el sensor de temperatura ambiental del evaporador 
• Revisar falso contacto', NOW());
INSERT INTO error_codes (model_id, code, description, solution, created_at) VALUES (49, 'E6', '• Corto circuito o circuito abierto en sensor de tubería en evaporador', '• Medir sensor de temperatura de tubería del evaporador
• Revisar falso contacto', NOW());
INSERT INTO error_codes (model_id, code, description, solution, created_at) VALUES (49, 'E7', '• Corto circuito o circuito abierto en sensor de tubería de Condensador. (modelos 2 tons)', '• Medir sensor de tubería del condensador
• Revisar falso contacto', NOW());
INSERT INTO error_codes (model_id, code, description, solution, created_at) VALUES (49, 'E9', '• Error de comunicación entre tarjeta evaporador / condensador. (modelos 2 tons)', '• Revisar voltaje de alimentación
• Comprobar el correcto cableado
• Falla en tarjeta de unidad interior
• Falla en tarjeta en unidad exterior', NOW());
INSERT INTO error_codes (model_id, code, description, solution, created_at) VALUES (49, 'EC', '• Fuga o escasez de refrigerante', '• Verificar presiones de refrigerante
• Válvulas de servicio cerradas o abiertas parcialmente
• Switch de baja presión dañado
• Presenta perdida de refrigerante', NOW());
INSERT INTO error_codes (model_id, code, description, solution, created_at) VALUES (49, 'cF', '• El equipo se encuentra en etapa de pre-calentamiento justo antes de iniciar el modo calefacción', '• Esperar 5 minutos para iniciar modo de calefacción normalmente', NOW());
INSERT INTO air_conditioner_models (id, name, reference_id, image_url, logo_url, type, created_at) VALUES (50, 'X3', 'x3', '/images/equipos/x3.png', '/images/logos/x3.png', '', NOW()) ON CONFLICT (id) DO NOTHING;
INSERT INTO error_codes (model_id, code, description, solution, created_at) VALUES (50, 'C5', '• Ausencia o daño del “jumper” o puente de configuración.', '• Coloque el JUMPER correspondiente en la tarjeta de control:
28*    12K    115V
30*    12K    220V
09*    18K
13*    24K', NOW());
INSERT INTO error_codes (model_id, code, description, solution, created_at) VALUES (50, 'E1', '• Protección de alta presión en el sistema', '• Baja velocidad del ventilador en la unidad exterior
• Bajo retorno de aire en la unidad interior o exterior
• Suciedad en serpentín en la unidad interior o la exterior
• El sistema de gas presenta un bloqueo por dobles o contaminación
• La tapa del condensador esta suelta y no circula el aire correctamente
• Verificar el correcto funcionamiento del sensor de alta presión', NOW());
INSERT INTO error_codes (model_id, code, description, solution, created_at) VALUES (50, 'E3', '• Protección de baja presión en el sistema', '• Revisar perdidas de gas en el sistema
• El sistema de gas presenta un bloqueo por dobles o contaminación
• La tapa del condensador esta suelta y no funciona el aire correctamente
• Verificar el correcto funcionamiento del sensor de baja presión', NOW());
INSERT INTO error_codes (model_id, code, description, solution, created_at) VALUES (50, 'E5', '• Corriente excesiva en el compresor ocurrida más de 4 veces continúas', '• Mida el capacitor del compresor
• Utilice kit de arranque de ser necesario
• Medir voltaje de línea', NOW());
INSERT INTO error_codes (model_id, code, description, solution, created_at) VALUES (50, 'E6', '• Falla de comunicación', '• Revisar voltaje de alimentación
• Comprobar el correcto cableado
• Falla en tarjeta de unidad interior
• Falla en tarjeta en unidad exterior', NOW());
INSERT INTO error_codes (model_id, code, description, solution, created_at) VALUES (50, 'E8', '• Alta temperatura en sensor de tubo de la unidad exterior', '• Baja velocidad del ventilador en la unidad interior o exterior
• Bajo retorno de aire en la unidad interior o la exterior
• Suciedad en serpentín en la unidad interior o la exterior
• La tapa del condensador esta suelta y no circula el aire correctamente
• Verificar el correcto funcionamiento del sensor de temperatura de tubo en unidad exterior', NOW());
INSERT INTO error_codes (model_id, code, description, solution, created_at) VALUES (50, 'F0', 'Protección por bloqueo en circuito de gas refrigerante', '• Revisar perdida de gas en el sistema.
• El circuito de gas presenta un bloqueo por dobles o contaminación.
• Verificar el funcionamiento de los sensores.
• Verificar la correcta apertura de las válvulas.', NOW());
INSERT INTO error_codes (model_id, code, description, solution, created_at) VALUES (50, 'F1', '• Corto o circuito abierto en sensor de aire', '• Medir el sensor de aire del evaporador
• Revisar falso contacto', NOW());
INSERT INTO error_codes (model_id, code, description, solution, created_at) VALUES (50, 'F2', '• Corto o circuito abierto en sensor de tubería (pozo) del evaporador', '• Medir sensor de temperatura ambiente del evaporador (pozo)
• Revisar falso contacto', NOW());
INSERT INTO error_codes (model_id, code, description, solution, created_at) VALUES (50, 'F3', '• Corto o circuito abierto en sensor de temperatura ambiente del condensador', '• Medir sensor de temperatura ambiente del condensador
• Revisar falso contacto', NOW());
INSERT INTO error_codes (model_id, code, description, solution, created_at) VALUES (50, 'F4', '• Corto o circuito abierto en sensor de tubería (pozo) del condensador', '• Medir el sensor de temperatura de tubería del condensador (pozo)
• Revisar falso contacto', NOW());
INSERT INTO error_codes (model_id, code, description, solution, created_at) VALUES (50, 'H1', '• El equipo se encuentra en modo de descongelamiento inteligente es un comportamiento normal de los equipos con calefacción', '• El equipo realiza el proceso de deshielo automático asegurando que este listo para operar calefacción.', NOW());
INSERT INTO error_codes (model_id, code, description, solution, created_at) VALUES (50, 'H3', '• Protección de alta temperatura en compresor', '• Baja velocidad del ventilador en la unidad interior o exterior
• Bajo retorno de aire en la unidad interior o la exterior
• Suciedad en serpentín en la unidad interior o la exterior
• Compruebe carga de refrigerante y válvula de expansión
• Compruebe el voltaje de alimentación
• Verificar el correcto funcionamiento del compresor', NOW());
INSERT INTO error_codes (model_id, code, description, solution, created_at) VALUES (50, 'H6', '• Velocidad del motor evaporador menor a 200 RPM por más de 5 segundos', '• Motor o turbina obstruida
• Capacitor en mal estado
• Sensor de velocidad dañado o desconectado', NOW());
INSERT INTO error_codes (model_id, code, description, solution, created_at) VALUES (50, 'U7', '• Protección por falla en válvula de 4 vías', '• Compruebe voltaje de alimentación
• Falla en salida de tarjeta electrónica
• Falla en válvula de 4 vías
• Comprobar cableado de válvula', NOW());
INSERT INTO error_codes (model_id, code, description, solution, created_at) VALUES (50, 'U8', '• Error de detección de cruce por cero en tarjeta evaporador', '•  Reemplazar tarjeta principal del evaporador', NOW());
INSERT INTO air_conditioner_models (id, name, reference_id, image_url, logo_url, type, created_at) VALUES (51, 'XLIFE', 'xlife', '/images/equipos/xlife.png', '/images/logos/xlife.png', '', NOW()) ON CONFLICT (id) DO NOTHING;
INSERT INTO error_codes (model_id, code, description, solution, created_at) VALUES (51, 'E0', 'Protección por sobre-corriente', '• Verificar capacitor de compresor
• Medir resistencias entre terminales de compresor
• Revisar transformador de corriente
• Revisar motor evaporador
• Medir voltaje de línea', NOW());
INSERT INTO error_codes (model_id, code, description, solution, created_at) VALUES (51, 'E1', '• Corto circuito o circuito abierto en sensor de temperatura ambiental de evaporador', '• Medir el sensor del evaporador
• Revisar falso contacto', NOW());
INSERT INTO error_codes (model_id, code, description, solution, created_at) VALUES (51, 'E2', '• Corto circuito o circuito abierto en sensor de tubería de condensador', '• Medir sensor de temperatura de tubería del condensador
• Revisar falso contacto', NOW());
INSERT INTO error_codes (model_id, code, description, solution, created_at) VALUES (51, 'E3', '• Corto circuito o circuito abierto en sensor de tubería de evaporador', '• Medir sensor de temperatura de tubería del evaporador
• Revisar falso contacto', NOW());
INSERT INTO error_codes (model_id, code, description, solution, created_at) VALUES (51, 'E4', '• Velocidad anormal en motor evaporador', '• Motor o turbina obstruida
• Capacitor en mal estado
• Sensor de velocidad dañado o desconectado', NOW());
INSERT INTO air_conditioner_models (id, name, reference_id, image_url, logo_url, type, created_at) VALUES (52, 'XMART', 'xmart', '/images/equipos/xmart.png', '/images/logos/xmart.png', '', NOW()) ON CONFLICT (id) DO NOTHING;
INSERT INTO error_codes (model_id, code, description, solution, created_at) VALUES (52, 'C5', 'Ausencia o daño del “jumper” o puente de configuración.', '• Coloque el JUMPER correspondiente en la tarjeta de control:
                0110  12K 
                0001  18k
                0010  26k', NOW());
INSERT INTO error_codes (model_id, code, description, solution, created_at) VALUES (52, 'E5', 'Corriente excesiva en el compresor ocurrida más de 4 veces continúas.', '• Mida el capacitor del compresor.
• Utilice kit de arranque de ser necesario.
• Medir voltaje de línea', NOW());
INSERT INTO error_codes (model_id, code, description, solution, created_at) VALUES (52, 'ES', '• Corto o circuito abierto en sensor de tubería (pozo) del evaporador', '• Medir sensor de temperatura ambiente del evaporador
• Verificar falso contacto', NOW());
INSERT INTO error_codes (model_id, code, description, solution, created_at) VALUES (52, 'Eo', 'Error en el sensor de temperatura del condensador', '• Medir sensor de temperatura ambiente del condensador
• Checar falso contacto', NOW());
INSERT INTO error_codes (model_id, code, description, solution, created_at) VALUES (52, 'F1', 'Corto o circuito abierto en sensor de aire.', '• Medir el sensor de aire del evaporador.
• Verificar falso contacto.', NOW());
INSERT INTO error_codes (model_id, code, description, solution, created_at) VALUES (52, 'F2', 'Corto o circuito abierto en sensor de tubería (pozo) del evaporador', '• Medir sensor de temperatura ambiente del evaporador  (pozo)
• Verificar falso contacto', NOW());
INSERT INTO error_codes (model_id, code, description, solution, created_at) VALUES (52, 'H1', 'El equipo se encuentra en modo de descongelamiento inteligente es un comportamiento normal de los equipos con calefacción.', '• El equipo realiza el proceso de deshielo automático asegurando que este listo para operar calefacción.', NOW());
INSERT INTO error_codes (model_id, code, description, solution, created_at) VALUES (52, 'H6', 'Velocidad del motor evaporador menor a 200 RPM por más de 5 segundos.', '• Motor o turbina obstruida.
• Capacitor en mal estado.
• Sensor de velocidad dañado o desconectado.', NOW());
INSERT INTO air_conditioner_models (id, name, reference_id, image_url, logo_url, type, created_at) VALUES (53, 'XMAX', 'xmax', '/images/equipos/xmax.png', '/images/logos/xmax.png', '', NOW()) ON CONFLICT (id) DO NOTHING;
INSERT INTO error_codes (model_id, code, description, solution, created_at) VALUES (53, 'E1', '• Error en memoria EEPROM en tarjeta de evaporador', '• En esta situación se requiere el cambio de la tarjeta del evaporador', NOW());
INSERT INTO error_codes (model_id, code, description, solution, created_at) VALUES (53, 'E2', '• Señal interna de tarjeta de control, fuera de sincronía', '', NOW());
INSERT INTO error_codes (model_id, code, description, solution, created_at) VALUES (53, 'E3', '• Velocidad anormal en motor evaporador', '• Motor o turbina obstruida
• Capacitor en mal estado
• Sensor de velocidad dañado o desconectado', NOW());
INSERT INTO error_codes (model_id, code, description, solution, created_at) VALUES (53, 'E5', '• Corto circuito o circuito abierto en sensor de temperatura ambiental del evaporador', '• Medir el sensor de temperatura ambiental del evaporador 
• Revisar falso contacto', NOW());
INSERT INTO error_codes (model_id, code, description, solution, created_at) VALUES (53, 'E6', '• Corto circuito o circuito abierto en sensor de tubería en evaporador', '• Medir sensor de temperatura de tubería del evaporador
• Revisar falso contacto', NOW());
INSERT INTO error_codes (model_id, code, description, solution, created_at) VALUES (53, 'E7', '• Corto circuito o circuito abierto en sensor de tubería de Condensador. (modelos 2 tons)', '• Medir sensor de tubería del condensador
• Revisar falso contacto', NOW());
INSERT INTO error_codes (model_id, code, description, solution, created_at) VALUES (53, 'E9', '• Error de comunicación entre tarjeta evaporador / condensador. (modelos 2 tons)', '• Revisar voltaje de alimentación
• Comprobar el correcto cableado
• Falla en tarjeta de unidad interior
• Falla en tarjeta en unidad exterior', NOW());
INSERT INTO error_codes (model_id, code, description, solution, created_at) VALUES (53, 'EC', '• Fuga o escasez de refrigerante', '• Verificar presiones de refrigerante
• Válvulas de servicio cerradas o abiertas parcialmente
• Switch de baja presión dañado
• Presenta perdida de refrigerante', NOW());
INSERT INTO air_conditioner_models (id, name, reference_id, image_url, logo_url, type, created_at) VALUES (54, 'XPLUS', 'xplus', '/images/equipos/xplus.png', '/images/logos/xplus.png', '', NOW()) ON CONFLICT (id) DO NOTHING;
INSERT INTO error_codes (model_id, code, description, solution, created_at) VALUES (54, 'E1', 'Error de comunicación entre tarjeta evaporador / condensador. (Modelo 2 Ton)', '• Revisar voltaje de alimentación.
• Comprobar el correcto cableado.
• Falla en tarjeta de unidad interior.
• Falla en tarjeta en unidad exterior.', NOW());
INSERT INTO error_codes (model_id, code, description, solution, created_at) VALUES (54, 'E2', 'Error de detección de cruce por cero en tarjeta evaporador', '•  Reemplazar tarjeta principal del evaporador.', NOW());
INSERT INTO error_codes (model_id, code, description, solution, created_at) VALUES (54, 'E3', 'Velocidad anormal en motor evaporador.', '• Motor o turbina obstruida.
• Capacitor en mal estado.
• Sensor de velocidad dañado o desconectado.', NOW());
INSERT INTO error_codes (model_id, code, description, solution, created_at) VALUES (54, 'E5', 'Corto circuito o circuito abierto en sensor de tubería de evaporador.', '• Medir sensor de temperatura de tubería del evaporador.
• Revisar  falso contacto.', NOW());
INSERT INTO error_codes (model_id, code, description, solution, created_at) VALUES (54, 'E6', 'Corto circuito o circuito abierto en sensor de temperatura ambiental de evaporador.', '• Medir el sensor del evaporador.
• Revisar falso contacto.', NOW());
INSERT INTO error_codes (model_id, code, description, solution, created_at) VALUES (54, 'E7', 'Falla de comunicación entre tarjeta del evaporador y tarjeta display.', '• Verificar cable de interconexión.
• Falla en tarjeta de unidad interior.
• Falla en tarjeta display.', NOW());
INSERT INTO error_codes (model_id, code, description, solution, created_at) VALUES (54, 'E8', 'Velocidad anormal en motor condensador.', '• Motor o turbina obstruida.
• Capacitor en mal estado.
• Conecte los cables de alimentación correctamente.
• Reemplace tarjeta de condensador.', NOW());
INSERT INTO error_codes (model_id, code, description, solution, created_at) VALUES (54, 'E9', '• Error de comunicación entre tarjeta evaporador / condensador. (modelos 2 tons)', '• Revisar voltaje de alimentación
• Comprobar el correcto cableado
• Falla en tarjeta de unidad interior
• Falla en tarjeta en unidad exterior', NOW());
INSERT INTO error_codes (model_id, code, description, solution, created_at) VALUES (54, 'EC', '• Fuga o escasez de refrigerante.', '• Verificar presiones de refrigerante.
• Válvulas de servicio cerradas o abiertas parcialmente.
• Switch de baja presión dañado.
• Presenta perdida de refrigerante.', NOW());
INSERT INTO error_codes (model_id, code, description, solution, created_at) VALUES (54, 'EC07', 'Velocidad anormal en motor condensador.', '• Motor obstruido
• Capacitor en mal estado.
• Sensor de velocidad dañado o desconectado.', NOW());
INSERT INTO error_codes (model_id, code, description, solution, created_at) VALUES (54, 'EC52', '• Corto circuito o circuito abierto en sensor de tubería de condensador.', '• Medir sensor de temperatura de tubería del condensador.
• Verificar falso contacto.', NOW());
INSERT INTO error_codes (model_id, code, description, solution, created_at) VALUES (54, 'EH00', 'Error en memoria EEPROM en tarjeta de evaporador.', '•Reemplace tarjeta del evaporador', NOW());
INSERT INTO error_codes (model_id, code, description, solution, created_at) VALUES (54, 'EH02', 'Error de detección de cruce por cero en tarjeta evaporador', '• Reemplazar tarjeta principal del evaporador.', NOW());
INSERT INTO error_codes (model_id, code, description, solution, created_at) VALUES (54, 'EH03', 'Velocidad anormal en motor evaporador.', '"• Motor o turbina obstruida.
• Capacitor en mal estado.
• Sensor de velocidad dañado o desconectado."', NOW());
INSERT INTO error_codes (model_id, code, description, solution, created_at) VALUES (54, 'EH0b', 'Falla de comunicación entre tarjeta del evaporador y tarjeta display.', '• Verificar cable de interconexión.
• Falla en tarjeta de unidad interior
• Falla en tarjeta display.', NOW());
INSERT INTO error_codes (model_id, code, description, solution, created_at) VALUES (54, 'EH60', 'Corto circuito o circuito abierto en sensor de temperatura ambiente de evaporador.', '• Medir sensor de temperatura ambiente de evaporador.
• Revisar falso contacto.', NOW());
INSERT INTO error_codes (model_id, code, description, solution, created_at) VALUES (54, 'EH61', 'Corto circuito o circuito abierto en sensor de tubería de evaporador.', '• Medir sensor de temperatura de tubería del evaporador.
• Revisar falso contacto.', NOW());
INSERT INTO error_codes (model_id, code, description, solution, created_at) VALUES (54, 'EL01', 'Error de comunicación entre tarjeta evaporador / condensador. (Modelo 2 Ton)', '• Revisar voltaje de alimentación.
• Comprobar el correcto cableado.
• Falla en tarjeta de unidad interior.
• Falla en tarjeta en unidad exterior.', NOW());
INSERT INTO error_codes (model_id, code, description, solution, created_at) VALUES (54, 'EL0C', '• Fuga o escasez de refrigerante.', '• Verificar presiones de refrigerante.
• Válvulas de servicio cerradas o abiertas parcialmente.
• Switch de baja presión dañado.
• Presenta perdida de refrigerante.', NOW());
INSERT INTO error_codes (model_id, code, description, solution, created_at) VALUES (54, 'F2', '• Corto circuito o circuito abierto en sensor de tubería de condensador.', '• Medir sensor de temperatura de tubería del condensador.
• Verificar falso contacto.', NOW());
INSERT INTO error_codes (model_id, code, description, solution, created_at) VALUES (54, 'PC03', 'Protección por alta presión', '• Sensor de alta presión
• Tarjeta de condensador
• Protección por alta presión
• Falta de refrigerante', NOW());
INSERT INTO air_conditioner_models (id, name, reference_id, image_url, logo_url, type, created_at) VALUES (55, 'XR', 'xr', '/images/equipos/xr.png', '/images/logos/xr.png', '', NOW()) ON CONFLICT (id) DO NOTHING;
INSERT INTO error_codes (model_id, code, description, solution, created_at) VALUES (55, 'C5', '• Ausencia o daño del “jumper” o puente de configuración.', '• Coloque el JUMPER correspondiente en la tarjeta de control:
28*    12K    115V
30*    12K    220V
09*    18K
13*    24K', NOW());
INSERT INTO error_codes (model_id, code, description, solution, created_at) VALUES (55, 'E1', '• Protección de alta presión en el sistema', '• Baja velocidad del ventilador en la unidad exterior
• Bajo retorno de aire en la unidad interior o exterior
• Suciedad en serpentín en la unidad interior o la exterior
• El sistema de gas presenta un bloqueo por dobles o contaminación
• La tapa del condensador esta suelta y no circula el aire correctamente
• Verificar el correcto funcionamiento del sensor de alta presión', NOW());
INSERT INTO error_codes (model_id, code, description, solution, created_at) VALUES (55, 'E3', '• Protección de baja presión en el sistema', '• Revisar perdidas de gas en el sistema
• El sistema de gas presenta un bloqueo por dobles o contaminación
• La tapa del condensador esta suelta y no funciona el aire correctamente
• Verificar el correcto funcionamiento del sensor de baja presión', NOW());
INSERT INTO error_codes (model_id, code, description, solution, created_at) VALUES (55, 'E5', '• Corriente excesiva en el compresor ocurrida más de 4 veces continúas', '• Mida el capacitor del compresor
• Utilice kit de arranque de ser necesario
• Medir voltaje de línea', NOW());
INSERT INTO error_codes (model_id, code, description, solution, created_at) VALUES (55, 'E6', '• Falla de comunicación', '• Revisar voltaje de alimentación
• Comprobar el correcto cableado
• Falla en tarjeta de unidad interior
• Falla en tarjeta en unidad exterior', NOW());
INSERT INTO error_codes (model_id, code, description, solution, created_at) VALUES (55, 'E8', '• Alta temperatura en sensor de tubo de la unidad exterior', '• Baja velocidad del ventilador en la unidad interior o exterior
• Bajo retorno de aire en la unidad interior o la exterior
• Suciedad en serpentín en la unidad interior o la exterior
• La tapa del condensador esta suelta y no circula el aire correctamente
• Verificar el correcto funcionamiento del sensor de temperatura de tubo en unidad exterior', NOW());
INSERT INTO error_codes (model_id, code, description, solution, created_at) VALUES (55, 'F0', 'Protección por bloqueo en circuito de gas refrigerante', '• Revisar perdida de gas en el sistema.
• El circuito de gas presenta un bloqueo por dobles o contaminación.
• Verificar el funcionamiento de los sensores.
• Verificar la correcta apertura de las válvulas.', NOW());
INSERT INTO error_codes (model_id, code, description, solution, created_at) VALUES (55, 'F1', '• Corto o circuito abierto en sensor de aire', '• Medir el sensor de aire del evaporador
• Revisar falso contacto', NOW());
INSERT INTO error_codes (model_id, code, description, solution, created_at) VALUES (55, 'F2', '• Corto o circuito abierto en sensor de tubería (pozo) del evaporador', '• Medir sensor de temperatura ambiente del evaporador (pozo)
• Revisar falso contacto', NOW());
INSERT INTO error_codes (model_id, code, description, solution, created_at) VALUES (55, 'F3', '• Corto o circuito abierto en sensor de temperatura ambiente del condensador', '• Medir sensor de temperatura ambiente del condensador
• Revisar falso contacto', NOW());
INSERT INTO error_codes (model_id, code, description, solution, created_at) VALUES (55, 'F4', '• Corto o circuito abierto en sensor de tubería (pozo) del condensador', '• Medir el sensor de temperatura de tubería del condensador (pozo)
• Revisar falso contacto', NOW());
INSERT INTO error_codes (model_id, code, description, solution, created_at) VALUES (55, 'H1', '• El equipo se encuentra en modo de descongelamiento inteligente es un comportamiento normal de los equipos con calefacción', '• El equipo realiza el proceso de deshielo automático asegurando que este listo para operar calefacción.', NOW());
INSERT INTO error_codes (model_id, code, description, solution, created_at) VALUES (55, 'H3', '• Protección de alta temperatura en compresor', '• Baja velocidad del ventilador en la unidad interior o exterior
• Bajo retorno de aire en la unidad interior o la exterior
• Suciedad en serpentín en la unidad interior o la exterior
• Compruebe carga de refrigerante y válvula de expansión
• Compruebe el voltaje de alimentación
• Verificar el correcto funcionamiento del compresor', NOW());
INSERT INTO error_codes (model_id, code, description, solution, created_at) VALUES (55, 'H6', '• Velocidad del motor evaporador menor a 200 RPM por más de 5 segundos', '• Motor o turbina obstruida
• Capacitor en mal estado
• Sensor de velocidad dañado o desconectado', NOW());
INSERT INTO error_codes (model_id, code, description, solution, created_at) VALUES (55, 'U7', '• Protección por falla en válvula de 4 vías', '• Compruebe voltaje de alimentación
• Falla en salida de tarjeta electrónica
• Falla en válvula de 4 vías
• Comprobar cableado de válvula', NOW());
INSERT INTO error_codes (model_id, code, description, solution, created_at) VALUES (55, 'U8', '• Error de detección de cruce por cero en tarjeta evaporador', '•  Reemplazar tarjeta principal del evaporador', NOW());
INSERT INTO air_conditioner_models (id, name, reference_id, image_url, logo_url, type, created_at) VALUES (56, 'XTRA MULTINVERTER', 'xtra_multinverter', '/images/equipos/xtra_multinverter.png', '/images/logos/xtra_multinverter.png', '', NOW()) ON CONFLICT (id) DO NOTHING;
INSERT INTO error_codes (model_id, code, description, solution, created_at) VALUES (56, 'E0', '• Error en memoria EEPROM en tarjeta de evaporador.', '•Reemplace tarjeta del evaporador', NOW());
INSERT INTO error_codes (model_id, code, description, solution, created_at) VALUES (56, 'E1', '• Error de comunicación entre tarjeta evaporador / condensador.', '• Revisar voltaje de alimentación
• Comprobar el correcto cableado
• Falla en tarjeta de unidad interior
• Falla en tarjeta en unidad exterior', NOW());
INSERT INTO error_codes (model_id, code, description, solution, created_at) VALUES (56, 'E2', '• Error de detección de cruce por cero en tarjeta evaporador', '•  Reemplazar tarjeta principal del evaporador', NOW());
INSERT INTO error_codes (model_id, code, description, solution, created_at) VALUES (56, 'E3', '• Velocidad anormal en motor evaporador', '• Motor o turbina obstruida
• Capacitor en mal estado
• Sensor de velocidad dañado o desconectado', NOW());
INSERT INTO error_codes (model_id, code, description, solution, created_at) VALUES (56, 'E4', '• Corto circuito o circuito abierto en sensor de temperatura ambiental de evaporador', '• Medir el sensor del evaporador 
• Revisar falso contacto', NOW());
INSERT INTO error_codes (model_id, code, description, solution, created_at) VALUES (56, 'E5', '• Corto circuito o circuito abierto en sensor de tubería de evaporador', '• Medir sensor de temperatura de tubería del evaporador
• Revisar falso contacto', NOW());
INSERT INTO error_codes (model_id, code, description, solution, created_at) VALUES (56, 'EC', '• Fuga o escasez de refrigerante', '• Verificar presiones de refrigerante
• Válvulas de servicio cerradas o abiertas parcialmente
• Switch de baja presión dañado
• Presenta perdida de refrigerante', NOW());
INSERT INTO error_codes (model_id, code, description, solution, created_at) VALUES (56, 'F0', '• Protección contra sobre corriente activada', '• Verificar parámetros eléctricos de la instalación
• Revisar uniones y conexiones del cableado eléctrico
• Pobre condensación
• Presiones de refrigerante elevadas o fuera de rango
• Carga térmica excesiva o equipo sobre forzado', NOW());
INSERT INTO error_codes (model_id, code, description, solution, created_at) VALUES (56, 'F1', '• Corto circuito o circuito abierto en sensor de temperatura ambiental de condensador', '• Medir el sensor de temperatura ambiental del condensador
• Revisar falso contacto', NOW());
INSERT INTO error_codes (model_id, code, description, solution, created_at) VALUES (56, 'F2', '• Corto circuito o circuito abierto en sensor de tubería de condensador', '• Medir sensor de temperatura de tubería del condensador
• Revisar falso contacto', NOW());
INSERT INTO error_codes (model_id, code, description, solution, created_at) VALUES (56, 'F3', '• Corto circuito o circuito abierto en sensor de tubería de descarga de compresor', '• Medir sensor de temperatura de tubería de descarga de compresor
• Revisar falso contacto', NOW());
INSERT INTO error_codes (model_id, code, description, solution, created_at) VALUES (56, 'F4', '• Error en memoria EEPROM en tarjeta de condensador', '• Reemplace tarjeta del condensador', NOW());
INSERT INTO error_codes (model_id, code, description, solution, created_at) VALUES (56, 'F5', '• Velocidad Anormal en motor condensador', '• Verificar terminales y conexiones eléctricas
• Bobinas internas del motor, baleros o rodamientos, aspa obstruida', NOW());
INSERT INTO error_codes (model_id, code, description, solution, created_at) VALUES (56, 'P0', '• Error en modulo IPM o IGBT en tarjeta de condensador', '• Reemplace tarjeta del condensador', NOW());
INSERT INTO error_codes (model_id, code, description, solution, created_at) VALUES (56, 'P1', '• Protección contra voltaje anormal (bajo o muy alto voltaje)', '• Comprobar que el voltaje de suministro este dentro del rango aceptable, de lo contrario, contacte a su proveedor para solicitar que realice un ajuste.', NOW());
INSERT INTO error_codes (model_id, code, description, solution, created_at) VALUES (56, 'P2', '• Alta temperatura en superficie de compresor', '• Baja velocidad del ventilador en la unidad interior o exterior
• Bajo retorno de aire en la unidad interior o la exterior
• Suciedad en serpentín en la unidad interior o la exterior
• Compruebe carga de refrigerante y válvula de expansión
• Compruebe el voltaje de alimentación
• Verificar el correcto funcionamiento del compresor', NOW());
INSERT INTO error_codes (model_id, code, description, solution, created_at) VALUES (56, 'P3', '• Temperatura exterior menor a -25°C. (Calefacción)', '• Esperar a que temperatura exterior se estabilice.', NOW());
INSERT INTO error_codes (model_id, code, description, solution, created_at) VALUES (56, 'P4', '• Falla en "Driver" del compresor', '• Reemplace tarjeta del condensador', NOW());
INSERT INTO error_codes (model_id, code, description, solution, created_at) VALUES (56, 'P5', '• Conflicto de operación', '• El evaporador NO es compatible con el condensador', NOW());
INSERT INTO error_codes (model_id, code, description, solution, created_at) VALUES (56, 'P6', '• Protección por alta o baja presión de refrigerante', '• Verifique el estado del switch de presión en el lado de baja o alta presión.
• Verifique el la condensadora cuente con los espacios correctos.', NOW());
INSERT INTO error_codes (model_id, code, description, solution, created_at) VALUES (56, 'cF', '• El equipo se encuentra en etapa de pre-calentamiento justo antes de iniciar el modo calefacción', '• Esperar 5 minutos para iniciar modo de calefacción normalmente', NOW());
INSERT INTO error_codes (model_id, code, description, solution, created_at) VALUES (56, 'dF', '• El equipo se encuentra en modo de des-congelamiento.', '• Espere a que termine el ciclo de des-congelamiento.', NOW());

-- Fin de DB_MASTER_MR_FRIO.json --

INSERT INTO air_conditioner_models (id, name, reference_id, image_url, logo_url, type, created_at) VALUES (57, 'CARRIER ONE', 'carrier_one', '/images/equipos/carrier_default.png', '/images/logos/carrier_one.png', 'Aire Residencial', NOW()) ON CONFLICT (id) DO NOTHING;
INSERT INTO error_codes (model_id, code, description, solution, created_at) VALUES (57, 'E1', 'Falla de sensor de temperatura aire interior', 'Verifique la conexión y resistencia del sensor de ambiente.', NOW());
INSERT INTO error_codes (model_id, code, description, solution, created_at) VALUES (57, 'E2', 'Falla de sensor de temperatura circuito interno', 'Verifique el sensor de temperatura del serpentín (pozo).', NOW());
INSERT INTO error_codes (model_id, code, description, solution, created_at) VALUES (57, 'E6', 'Falla en el motor de ventilación interior', 'Revise el motor de la turbina, el capacitor o posibles obstrucciones.', NOW());
INSERT INTO air_conditioner_models (id, name, reference_id, image_url, logo_url, type, created_at) VALUES (58, 'CARRIER ONE +', 'carrier_one_plus', '/images/equipos/carrier_default.png', '/images/logos/carrier_one_plus.png', 'Aire Residencial', NOW()) ON CONFLICT (id) DO NOTHING;
INSERT INTO error_codes (model_id, code, description, solution, created_at) VALUES (58, 'E1', 'Error EEPROM', 'Falla de memoria en la tarjeta principal. Reinicie la energía.', NOW());
INSERT INTO error_codes (model_id, code, description, solution, created_at) VALUES (58, 'E2', 'Error de detección de señal de cruce por cero', 'Verifique la estabilidad del voltaje de entrada y la tarjeta electrónica.', NOW());
INSERT INTO error_codes (model_id, code, description, solution, created_at) VALUES (58, 'E3', 'Velocidad del ventilador interior fuera de control', 'El motor de la turbina opera a velocidad anormal. Revise capacitor o motor.', NOW());
INSERT INTO error_codes (model_id, code, description, solution, created_at) VALUES (58, 'E5', 'Sensor de temperatura ambiente interior (T1) abierto o corto', 'Revise la conexión del sensor de ambiente en la tarjeta.', NOW());
INSERT INTO error_codes (model_id, code, description, solution, created_at) VALUES (58, 'E6', 'Sensor de temperatura de coil evaporador (T2) abierto o corto', 'Revise la conexión del sensor de pozo en la tarjeta.', NOW());
INSERT INTO error_codes (model_id, code, description, solution, created_at) VALUES (58, 'EC', 'Detección de fugas en refrigerante', 'El sistema detecta pérdida de eficiencia. Busque fugas de gas.', NOW());
INSERT INTO error_codes (model_id, code, description, solution, created_at) VALUES (58, 'E9', 'Error de comunicación en unidad interior y exterior', '(Solo modelo 2 TR) Revise el cable de señal entre unidades.', NOW());
INSERT INTO air_conditioner_models (id, name, reference_id, image_url, logo_url, type, created_at) VALUES (59, 'CARRIER UP', 'carrier_up', '/images/equipos/carrier_default.png', '/images/logos/carrier_up.png', 'Aire Residencial', NOW()) ON CONFLICT (id) DO NOTHING;
INSERT INTO error_codes (model_id, code, description, solution, created_at) VALUES (59, 'E1', 'Error EEPROM', 'Falla interna de la tarjeta. Reinicie el equipo.', NOW());
INSERT INTO error_codes (model_id, code, description, solution, created_at) VALUES (59, 'E2', 'Error de detección de señal de cruce por cero', 'Problema de voltaje o frecuencia eléctrica.', NOW());
INSERT INTO error_codes (model_id, code, description, solution, created_at) VALUES (59, 'E3', 'Velocidad del ventilador interior fuera de control', 'Falla en motor de turbina o tarjeta de control.', NOW());
INSERT INTO error_codes (model_id, code, description, solution, created_at) VALUES (59, 'E5', 'Sensor de temperatura ambiente interior (T1) abierto o corto', 'Sustituya el sensor de ambiente.', NOW());
INSERT INTO error_codes (model_id, code, description, solution, created_at) VALUES (59, 'E6', 'Sensor de temperatura de coil evaporador (T2) abierto o corto', 'Sustituya el sensor de pozo.', NOW());
INSERT INTO error_codes (model_id, code, description, solution, created_at) VALUES (59, 'EC', 'Detección de fugas en refrigerante', 'Verifique presiones y carga de gas.', NOW());
INSERT INTO error_codes (model_id, code, description, solution, created_at) VALUES (59, 'E9', 'Error de comunicación en unidad interior y exterior', '(Solo modelo 2 TR) Verifique cableado de interconexión.', NOW());
INSERT INTO air_conditioner_models (id, name, reference_id, image_url, logo_url, type, created_at) VALUES (60, 'CARRIER CYGNUS', 'carrier_cygnus', '/images/equipos/carrier_default.png', '/images/logos/carrier_cygnus.png', 'Aire Residencial', NOW()) ON CONFLICT (id) DO NOTHING;
INSERT INTO error_codes (model_id, code, description, solution, created_at) VALUES (60, 'E0', 'Error EEPROM evaporador', 'Falla en tarjeta de unidad interior.', NOW());
INSERT INTO error_codes (model_id, code, description, solution, created_at) VALUES (60, 'E1', 'Error de comunicación en unidad interior y exterior', 'Revise cables de señal S o 3.', NOW());
INSERT INTO error_codes (model_id, code, description, solution, created_at) VALUES (60, 'E2', 'Error de detección de señal cruce por cero', 'Falla de circuito de detección en tarjeta.', NOW());
INSERT INTO error_codes (model_id, code, description, solution, created_at) VALUES (60, 'E3', 'Velocidad del ventilador interior fuera de control', 'Motor de turbina, sensor Hall o tarjeta.', NOW());
INSERT INTO error_codes (model_id, code, description, solution, created_at) VALUES (60, 'E5', 'Sensor de temperatura exterior abierto/corto o error EEPROM', 'Revise sensor de unidad exterior o parámetros de memoria.', NOW());
INSERT INTO error_codes (model_id, code, description, solution, created_at) VALUES (60, 'E6', 'Sensor de habitación o serpentín evaporador abierto/corto', 'Revise sensores de la unidad interior.', NOW());
INSERT INTO error_codes (model_id, code, description, solution, created_at) VALUES (60, 'P0', 'Mal funcionamiento del IPM o IGBT', 'Falla en módulo de potencia inversor (Tarjeta Condensador).', NOW());
INSERT INTO error_codes (model_id, code, description, solution, created_at) VALUES (60, 'P1', 'Sobrevoltaje o sobreprotección de baja tensión', 'Voltaje de alimentación fuera de rango.', NOW());
INSERT INTO error_codes (model_id, code, description, solution, created_at) VALUES (60, 'P2', 'Protección de alta temperatura del compresor', 'Compresor sobrecalentado. Revise carga de gas y ventilación.', NOW());
INSERT INTO error_codes (model_id, code, description, solution, created_at) VALUES (60, 'P4', 'Compresor inverter error drive', 'Falla de arranque o sincronización del compresor.', NOW());
INSERT INTO air_conditioner_models (id, name, reference_id, image_url, logo_url, type, created_at) VALUES (61, 'CARRIER XP II INVERTER', 'carrier_xpii', '/images/equipos/carrier_default.png', '/images/logos/carrier_xpii.png', 'Inverter', NOW()) ON CONFLICT (id) DO NOTHING;
INSERT INTO error_codes (model_id, code, description, solution, created_at) VALUES (61, 'E0', 'Error EEPROM evaporador', 'Falla en tarjeta interior.', NOW());
INSERT INTO error_codes (model_id, code, description, solution, created_at) VALUES (61, 'E1', 'Error de comunicación en unidad interior y exterior', 'Revise conexiones eléctricas entre unidades.', NOW());
INSERT INTO error_codes (model_id, code, description, solution, created_at) VALUES (61, 'E3', 'Velocidad del ventilador interior fuera de control', 'Motor de turbina dañado o bloqueado.', NOW());
INSERT INTO error_codes (model_id, code, description, solution, created_at) VALUES (61, 'E4', 'Sensor ambiente interior (T1) abierto o corto', 'Reemplace sensor T1.', NOW());
INSERT INTO error_codes (model_id, code, description, solution, created_at) VALUES (61, 'E5', 'Sensor coil evaporador (T2) abierto o corto', 'Reemplace sensor T2.', NOW());
INSERT INTO error_codes (model_id, code, description, solution, created_at) VALUES (61, 'EC', 'Detección de fugas en refrigerante', 'Sistema sin gas o sensores descalibrados.', NOW());
INSERT INTO error_codes (model_id, code, description, solution, created_at) VALUES (61, 'F1', 'Sensor ambiente exterior (T4) abierto o corto', 'Revise sensor T4 en condensadora.', NOW());
INSERT INTO error_codes (model_id, code, description, solution, created_at) VALUES (61, 'F2', 'Sensor coil condensador (T3) abierto o corto', 'Revise sensor T3 en condensadora.', NOW());
INSERT INTO error_codes (model_id, code, description, solution, created_at) VALUES (61, 'F3', 'Sensor descarga compresor (T5) abierto o corto', 'Revise sensor T5 en tubería de descarga.', NOW());
INSERT INTO error_codes (model_id, code, description, solution, created_at) VALUES (61, 'F4', 'Error EEPROM condensador', 'Falla en tarjeta exterior.', NOW());
INSERT INTO error_codes (model_id, code, description, solution, created_at) VALUES (61, 'F5', 'Velocidad del ventilador exterior fuera de control', 'Revise motor del condensador o aspa bloqueada.', NOW());
INSERT INTO error_codes (model_id, code, description, solution, created_at) VALUES (61, 'P0', 'Mal funcionamiento del IPM o IGBT', 'Falla en módulo inversor inteligente.', NOW());
INSERT INTO error_codes (model_id, code, description, solution, created_at) VALUES (61, 'P1', 'Sobrevoltaje o protección de baja tensión', 'Voltaje de suministro inestable.', NOW());
INSERT INTO error_codes (model_id, code, description, solution, created_at) VALUES (61, 'P2', 'Protección de alta temperatura del compresor', 'Falta de gas, exceso de gas o condensador sucio.', NOW());
INSERT INTO error_codes (model_id, code, description, solution, created_at) VALUES (61, 'P4', 'Compresor inverter error drive', 'Falla electrónica en el manejo del compresor.', NOW());
INSERT INTO air_conditioner_models (id, name, reference_id, image_url, logo_url, type, created_at) VALUES (62, 'CARRIER XPOWER ULTRA', 'carrier_xpower_ultra', '/images/equipos/carrier_default.png', '/images/logos/carrier_xpower_ultra.png', 'Inverter', NOW()) ON CONFLICT (id) DO NOTHING;
INSERT INTO error_codes (model_id, code, description, solution, created_at) VALUES (62, 'E0', 'Error EEPROM evaporador', 'Falla en tarjeta interior.', NOW());
INSERT INTO error_codes (model_id, code, description, solution, created_at) VALUES (62, 'E1', 'Error de comunicación en unidad interior y exterior', 'Revise conexiones eléctricas entre unidades.', NOW());
INSERT INTO error_codes (model_id, code, description, solution, created_at) VALUES (62, 'E3', 'Velocidad del ventilador interior fuera de control', 'Motor de turbina dañado o bloqueado.', NOW());
INSERT INTO error_codes (model_id, code, description, solution, created_at) VALUES (62, 'E4', 'Sensor ambiente interior (T1) abierto o corto', 'Reemplace sensor T1.', NOW());
INSERT INTO error_codes (model_id, code, description, solution, created_at) VALUES (62, 'E5', 'Sensor coil evaporador (T2) abierto o corto', 'Reemplace sensor T2.', NOW());
INSERT INTO error_codes (model_id, code, description, solution, created_at) VALUES (62, 'EC', 'Detección de fugas en refrigerante', 'Sistema sin gas o sensores descalibrados.', NOW());
INSERT INTO error_codes (model_id, code, description, solution, created_at) VALUES (62, 'F1', 'Sensor ambiente exterior (T4) abierto o corto', 'Revise sensor T4 en condensadora.', NOW());
INSERT INTO error_codes (model_id, code, description, solution, created_at) VALUES (62, 'F2', 'Sensor coil condensador (T3) abierto o corto', 'Revise sensor T3 en condensadora.', NOW());
INSERT INTO error_codes (model_id, code, description, solution, created_at) VALUES (62, 'F3', 'Sensor descarga compresor (T5) abierto o corto', 'Revise sensor T5 en tubería de descarga.', NOW());
INSERT INTO error_codes (model_id, code, description, solution, created_at) VALUES (62, 'F4', 'Error EEPROM condensador', 'Falla en tarjeta exterior.', NOW());
INSERT INTO error_codes (model_id, code, description, solution, created_at) VALUES (62, 'F5', 'Velocidad del ventilador exterior fuera de control', 'Revise motor del condensador o aspa bloqueada.', NOW());
INSERT INTO error_codes (model_id, code, description, solution, created_at) VALUES (62, 'P0', 'Mal funcionamiento del IPM o IGBT', 'Falla en módulo inversor inteligente.', NOW());
INSERT INTO error_codes (model_id, code, description, solution, created_at) VALUES (62, 'P1', 'Sobrevoltaje o protección de baja tensión', 'Voltaje de suministro inestable.', NOW());
INSERT INTO error_codes (model_id, code, description, solution, created_at) VALUES (62, 'P2', 'Protección de alta temperatura del compresor', 'Falta de gas, exceso de gas o condensador sucio.', NOW());
INSERT INTO error_codes (model_id, code, description, solution, created_at) VALUES (62, 'P4', 'Compresor inverter error drive', 'Falla electrónica en el manejo del compresor.', NOW());
INSERT INTO air_conditioner_models (id, name, reference_id, image_url, logo_url, type, created_at) VALUES (63, 'CARRIER INVERTER 16 SEER', 'carrier_inv_16seer', '/images/equipos/carrier_default.png', '/images/logos/carrier_inv_16seer.png', 'Inverter', NOW()) ON CONFLICT (id) DO NOTHING;
INSERT INTO error_codes (model_id, code, description, solution, created_at) VALUES (63, 'E0', 'Error EEPROM evaporador', 'Falla de memoria interna.', NOW());
INSERT INTO error_codes (model_id, code, description, solution, created_at) VALUES (63, 'E1', 'Error de comunicación', 'Falla de comunicación entre unidades.', NOW());
INSERT INTO error_codes (model_id, code, description, solution, created_at) VALUES (63, 'E2', 'Error de señal cruce por cero', 'Revise voltaje de entrada.', NOW());
INSERT INTO error_codes (model_id, code, description, solution, created_at) VALUES (63, 'E3', 'Velocidad ventilador interior fuera de control', 'Motor de turbina dañado.', NOW());
INSERT INTO error_codes (model_id, code, description, solution, created_at) VALUES (63, 'E4', 'Sensor ambiente interior (T1) abierto/corto', 'Revise sensor T1.', NOW());
INSERT INTO error_codes (model_id, code, description, solution, created_at) VALUES (63, 'E5', 'Sensor coil evaporador (T2) abierto/corto', 'Revise sensor T2.', NOW());
INSERT INTO error_codes (model_id, code, description, solution, created_at) VALUES (63, 'EC', 'Detección de fugas', 'Falta de gas refrigerante.', NOW());
INSERT INTO error_codes (model_id, code, description, solution, created_at) VALUES (63, 'F0', 'Protección de sobrecarga en corriente', 'Consumo eléctrico excesivo. Revise compresor.', NOW());
INSERT INTO error_codes (model_id, code, description, solution, created_at) VALUES (63, 'F1', 'Sensor ambiente exterior (T4) abierto/corto', 'Revise sensor T4.', NOW());
INSERT INTO error_codes (model_id, code, description, solution, created_at) VALUES (63, 'F2', 'Sensor coil condensador (T3) abierto/corto', 'Revise sensor T3.', NOW());
INSERT INTO error_codes (model_id, code, description, solution, created_at) VALUES (63, 'F3', 'Sensor descarga compresor (T5) abierto/corto', 'Revise sensor T5.', NOW());
INSERT INTO error_codes (model_id, code, description, solution, created_at) VALUES (63, 'F4', 'Error EEPROM condensador', 'Falla tarjeta exterior.', NOW());
INSERT INTO error_codes (model_id, code, description, solution, created_at) VALUES (63, 'F5', 'Velocidad ventilador exterior fuera de control', 'Falla motor exterior.', NOW());
INSERT INTO error_codes (model_id, code, description, solution, created_at) VALUES (63, 'P0', 'Mal funcionamiento IPM/IGBT', 'Falla módulo de potencia.', NOW());
INSERT INTO error_codes (model_id, code, description, solution, created_at) VALUES (63, 'P1', 'Sobrevoltaje / Bajo voltaje', 'Protección eléctrica activada.', NOW());
INSERT INTO error_codes (model_id, code, description, solution, created_at) VALUES (63, 'P2', 'Protección alta temperatura compresor', 'Compresor muy caliente.', NOW());
INSERT INTO error_codes (model_id, code, description, solution, created_at) VALUES (63, 'P3', 'Temperatura de condensador muy baja', 'Protección por baja temperatura exterior.', NOW());
INSERT INTO error_codes (model_id, code, description, solution, created_at) VALUES (63, 'P4', 'Compresor inverter error drive', 'Falla arranque compresor.', NOW());
INSERT INTO error_codes (model_id, code, description, solution, created_at) VALUES (63, 'P6', 'Presión de compresor muy bajo', 'Protección de baja presión.', NOW());

-- Fin de data_carrier.json --

INSERT INTO air_conditioner_models (id, name, reference_id, image_url, logo_url, type, created_at) VALUES (64, 'YORK RESIDENCIAL (INVERTER/MURO)', 'york_residencial_inverter', '/images/equipos/york_default.png', '/images/logos/york_logo.png', 'Aire Residencial', NOW()) ON CONFLICT (id) DO NOTHING;
INSERT INTO error_codes (model_id, code, description, solution, created_at) VALUES (64, 'E1', 'Falla en sensor de temperatura ambiente', 'Verifique conexión del sensor de aire o reemplace.', NOW());
INSERT INTO error_codes (model_id, code, description, solution, created_at) VALUES (64, 'E2', 'Falla en sensor del evaporador (unidad interna)', 'Verifique el sensor de pozo en la unidad interior.', NOW());
INSERT INTO error_codes (model_id, code, description, solution, created_at) VALUES (64, 'E3', 'Mal funcionamiento de velocidad del ventilador interior', 'Revise motor de turbina, capacitor o sensor Hall.', NOW());
INSERT INTO error_codes (model_id, code, description, solution, created_at) VALUES (64, 'E4', 'Error de EEPROM interior', 'Falla de memoria en tarjeta. Reinicie el equipo.', NOW());
INSERT INTO error_codes (model_id, code, description, solution, created_at) VALUES (64, 'E6', 'Protección por alta o baja presión del refrigerante', 'Revise carga de gas y presiones de trabajo.', NOW());
INSERT INTO error_codes (model_id, code, description, solution, created_at) VALUES (64, 'E7', 'Error de comunicación entre unidades', 'Revise cableado de señal entre evaporador y condensador.', NOW());
INSERT INTO error_codes (model_id, code, description, solution, created_at) VALUES (64, 'F1', 'Protección del Módulo IPM', 'Sobrecorriente o falla en tarjeta inverter exterior.', NOW());
INSERT INTO error_codes (model_id, code, description, solution, created_at) VALUES (64, 'F2', 'Sobrecorriente del compresor', 'Compresor forzado, bobinas en corto o exceso de gas.', NOW());
INSERT INTO error_codes (model_id, code, description, solution, created_at) VALUES (64, 'F3', 'Falla de comunicación tarjeta IPM y PCB exterior', 'Revise conexiones internas en la condensadora.', NOW());
INSERT INTO error_codes (model_id, code, description, solution, created_at) VALUES (64, 'F4', 'Protección por sobrecalentamiento (Descarga)', 'Falta de refrigerante o condensador sucio.', NOW());
INSERT INTO error_codes (model_id, code, description, solution, created_at) VALUES (64, 'F6', 'Falla en sensor de temperatura ambiente exterior', 'Revise sensor de aire en condensadora.', NOW());
INSERT INTO error_codes (model_id, code, description, solution, created_at) VALUES (64, 'F7', 'Falla en sensor de temperatura de succión', 'Revise sensor en tubería de succión.', NOW());
INSERT INTO error_codes (model_id, code, description, solution, created_at) VALUES (64, 'F8', 'Falla en motor ventilador exterior (DC)', 'Motor de condensador dañado o bloqueado.', NOW());
INSERT INTO error_codes (model_id, code, description, solution, created_at) VALUES (64, 'F19', 'Protección por alto y bajo voltaje', 'Voltaje de alimentación fuera de rango.', NOW());
INSERT INTO error_codes (model_id, code, description, solution, created_at) VALUES (64, 'F21', 'Falla en sensor de deshielo (Escarcha)', 'Revise sensor de tubería exterior.', NOW());
INSERT INTO error_codes (model_id, code, description, solution, created_at) VALUES (64, 'F25', 'Falla en sensor de temperatura de descarga', 'Revise sensor en salida del compresor.', NOW());
INSERT INTO air_conditioner_models (id, name, reference_id, image_url, logo_url, type, created_at) VALUES (65, 'YORK CENTRAL / PAQUETE', 'york_central_comercial', '/images/equipos/york_default.png', '/images/logos/york_logo.png', 'Comercial Ligero', NOW()) ON CONFLICT (id) DO NOTHING;
INSERT INTO error_codes (model_id, code, description, solution, created_at) VALUES (65, 'E0', 'Error de secuencia de fases', 'Invierta dos fases de la alimentación eléctrica.', NOW());
INSERT INTO error_codes (model_id, code, description, solution, created_at) VALUES (65, 'E1', 'Mal funcionamiento de comunicación', 'Error de comunicación entre termostato/placa y unidad.', NOW());
INSERT INTO error_codes (model_id, code, description, solution, created_at) VALUES (65, 'E2', 'Mal funcionamiento del sensor T1', 'Sensor de temperatura de retorno/ambiente dañado.', NOW());
INSERT INTO error_codes (model_id, code, description, solution, created_at) VALUES (65, 'E3', 'Mal funcionamiento del sensor T2A / T3', 'Sensor de temperatura de tubería o condensador.', NOW());
INSERT INTO error_codes (model_id, code, description, solution, created_at) VALUES (65, 'E4', 'Mal funcionamiento del sensor T2B / T4', 'Sensor de temperatura exterior o descarga.', NOW());
INSERT INTO error_codes (model_id, code, description, solution, created_at) VALUES (65, 'E5', 'Protección de alta presión de descarga', 'Condensador sucio, ventilador detenido o exceso de gas.', NOW());
INSERT INTO error_codes (model_id, code, description, solution, created_at) VALUES (65, 'E6', 'Protección de baja presión de descarga', 'Fuga de refrigerante o filtro obstruido.', NOW());
INSERT INTO error_codes (model_id, code, description, solution, created_at) VALUES (65, 'P0', 'Protección de temperatura del evaporador', 'Evaporador sucio o congelado.', NOW());
INSERT INTO error_codes (model_id, code, description, solution, created_at) VALUES (65, 'P1', 'Protección anti-enfriamiento o descongelación', 'Operación normal de protección.', NOW());
INSERT INTO error_codes (model_id, code, description, solution, created_at) VALUES (65, 'P2', 'Protección de alta temperatura del condensador', 'Limpie el serpentín condensador.', NOW());
INSERT INTO error_codes (model_id, code, description, solution, created_at) VALUES (65, 'P3', 'Protección de temperatura del compresor', 'Compresor sobrecalentado. Verifique carga.', NOW());

-- Fin de data_york.json --

INSERT INTO air_conditioner_models (id, name, reference_id, image_url, logo_url, type, created_at) VALUES (66, 'LG RESIDENCIAL (INVERTER V / ART COOL)', 'lg_residencial_inverter', '/images/equipos/lg_default.png', '/images/logos/lg_logo.png', 'Aire Residencial', NOW()) ON CONFLICT (id) DO NOTHING;
INSERT INTO error_codes (model_id, code, description, solution, created_at) VALUES (66, 'CH01', 'Falla en sensor de temperatura de aire interior', 'Sensor abierto o en corto. Mida resistencia (10kΩ a 25°C) o revise conexión en PCB.', NOW());
INSERT INTO error_codes (model_id, code, description, solution, created_at) VALUES (66, 'CH02', 'Falla en sensor de tubería de entrada (Evaporador)', 'Sensor de pozo abierto/corto. Verifique conexión CN-TH1 en la tarjeta.', NOW());
INSERT INTO error_codes (model_id, code, description, solution, created_at) VALUES (66, 'CH05', 'Error de comunicación entre unidad interior y exterior', 'Revise cable de señal (Term 3). Verifique voltaje DC oscilante. Revise fusibles y reactores en condensadora.', NOW());
INSERT INTO error_codes (model_id, code, description, solution, created_at) VALUES (66, 'CH06', 'Falla en sensor de tubería de salida (Evaporador)', 'Sensor de salida abierto/corto. Revise su resistencia y conexión.', NOW());
INSERT INTO error_codes (model_id, code, description, solution, created_at) VALUES (66, 'CH09', 'Error de EEPROM (Unidad Interior)', 'Falla de memoria en tarjeta interior. Intente reprogramar o reemplace la PCB.', NOW());
INSERT INTO error_codes (model_id, code, description, solution, created_at) VALUES (66, 'CH10', 'Motor ventilador interior bloqueado (BLDC)', 'Motor trabado, conector suelto o falla en sensor Hall. Revise voltaje de motor (300V DC).', NOW());
INSERT INTO error_codes (model_id, code, description, solution, created_at) VALUES (66, 'CH12', 'Falla en sensor de tubería media (Evaporador)', 'Sensor intermedio abierto/corto. Común en equipos Multi-Split.', NOW());
INSERT INTO error_codes (model_id, code, description, solution, created_at) VALUES (66, 'CH21', 'Error de IPM (Sobrecorriente en Compresor)', 'Compresor trabado, exceso de refrigerante o disipador de calor sucio en tarjeta inverter.', NOW());
INSERT INTO error_codes (model_id, code, description, solution, created_at) VALUES (66, 'CH23', 'Bajo voltaje en DC Link', 'Voltaje de entrada muy bajo o falla en capacitores de la tarjeta exterior.', NOW());
INSERT INTO error_codes (model_id, code, description, solution, created_at) VALUES (66, 'CH26', 'Falla de posición del compresor DC', 'Compresor no arranca. Revise terminales U,V,W o daño mecánico en compresor.', NOW());
INSERT INTO error_codes (model_id, code, description, solution, created_at) VALUES (66, 'CH29', 'Sobrecorriente en compresor (Software)', 'Compresor forzado, obstrucción en tubería o válvula de expansión cerrada.', NOW());
INSERT INTO error_codes (model_id, code, description, solution, created_at) VALUES (66, 'CH32', 'Alta temperatura en descarga del compresor', 'Falta de refrigerante (fuga) o válvula de servicio semi-cerrada.', NOW());
INSERT INTO error_codes (model_id, code, description, solution, created_at) VALUES (66, 'CH41', 'Falla en sensor de descarga (Compresor)', 'Sensor de descarga abierto/corto. Resistencia alta (200kΩ a 25°C usualmente).', NOW());
INSERT INTO error_codes (model_id, code, description, solution, created_at) VALUES (66, 'CH44', 'Falla en sensor de aire exterior', 'Sensor de ambiente en condensadora dañado o desconectado.', NOW());
INSERT INTO error_codes (model_id, code, description, solution, created_at) VALUES (66, 'CH45', 'Falla en sensor de tubería condensador', 'Sensor de coil exterior dañado.', NOW());
INSERT INTO error_codes (model_id, code, description, solution, created_at) VALUES (66, 'CH53', 'Falla de comunicación (Interior a Exterior)', 'Similar a CH05. Pérdida de señal por más de 3 minutos.', NOW());
INSERT INTO error_codes (model_id, code, description, solution, created_at) VALUES (66, 'CH60', 'Error de EEPROM (Unidad Exterior)', 'Falla de memoria en tarjeta condensadora. Reemplace la PCB.', NOW());
INSERT INTO error_codes (model_id, code, description, solution, created_at) VALUES (66, 'CH61', 'Alta temperatura en tubería de condensador', 'Condensador sucio, motor ventilador exterior lento o exceso de gas.', NOW());
INSERT INTO error_codes (model_id, code, description, solution, created_at) VALUES (66, 'CH67', 'Motor ventilador exterior bloqueado (BLDC)', 'Aspa atorada por objeto, conector suelto o motor dañado.', NOW());
INSERT INTO air_conditioner_models (id, name, reference_id, image_url, logo_url, type, created_at) VALUES (67, 'LG COMERCIAL (MULTI V / VRF)', 'lg_comercial_multi_v', '/images/equipos/lg_default.png', '/images/logos/lg_logo.png', 'Comercial / VRF', NOW()) ON CONFLICT (id) DO NOTHING;
INSERT INTO error_codes (model_id, code, description, solution, created_at) VALUES (67, 'CH03', 'Error de comunicación (Control Remoto)', 'Falla entre control cableado y unidad interior.', NOW());
INSERT INTO error_codes (model_id, code, description, solution, created_at) VALUES (67, 'CH04', 'Error de bomba de drenaje / Flotador', 'Bomba de condensados averiada o switch de nivel activado (Bandeja llena).', NOW());
INSERT INTO error_codes (model_id, code, description, solution, created_at) VALUES (67, 'CH24', 'Switch de alta/baja presión abierto', 'Presión anormal en el sistema o switch dañado.', NOW());
INSERT INTO error_codes (model_id, code, description, solution, created_at) VALUES (67, 'CH51', 'Error de sobre-capacidad', 'La suma de unidades interiores excede la capacidad de la condensadora.', NOW());
INSERT INTO error_codes (model_id, code, description, solution, created_at) VALUES (67, 'CH52', 'Error de comunicación (Inverter a Principal)', 'Falla de comunicación interna entre tarjetas de la condensadora.', NOW());
INSERT INTO error_codes (model_id, code, description, solution, created_at) VALUES (67, 'CH54', 'Fase invertida o faltante (L1, L2, L3)', 'Revise la alimentación trifásica. Invierta dos fases.', NOW());
INSERT INTO error_codes (model_id, code, description, solution, created_at) VALUES (67, 'CH150', 'Falla de sensores múltiples', 'Múltiples sensores abiertos/corto. Revise arnés general.', NOW());
INSERT INTO error_codes (model_id, code, description, solution, created_at) VALUES (67, 'CH200', 'Falla de auto-detección de tubería', 'Error durante la puesta en marcha automática.', NOW());

-- Fin de data_lg.json --

COMMIT;
