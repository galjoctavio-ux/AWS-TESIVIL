# Guía Técnica: Modo Diagnóstico ("Modo TEST")

> [!IMPORTANT]
> **Fuente Oficial:** Basado en el *Boletín Técnico: Función Modo "TEST" Inverter 2021*.
> **Modelos Aplicables:**
> - MAGNUM 17, 19, 21, 30, 32
> - PLATINUM 19
> - FLEX INVERTER
> - INVERTER X

## 1. procedimiento de Ingreso

1.  **Apuntar:** Dirija el control remoto hacia la unidad evaporadora.
2.  **Display x3:** Presione el botón **DISPLAY** 3 veces consecutivas.
3.  **Direct x3:** Inmediatamente después, presione el botón **DIRECT** (o SWING/GEN) 3 veces consecutivas.
4.  **Confirmación:** La unidad emitirá un sonido y mostrará un código de consulta (ej. `T1` o `00`) en el panel.
5.  **Navegación:** Use el botón **DIRECT** para desplazarse por el menú de códigos.

---

## 2. Tabla de Códigos de Consulta (Display)

El display mostrará primero el **Código** (izquierda) y luego su **Valor / Lectura** (derecha).

| Display | Descripción | Notas / Rango |
| :--- | :--- | :--- |
| **T1** (Γ1) | Temp. ambiente interior | -25°C ~ 70°C |
| **T2** (Γ2) | Temp. evaporador | -25°C ~ 70°C |
| **T3** (Γ3) | Temp. condensador | -25°C ~ 70°C |
| **T4** (Γ4) | Temp. ambiente exterior | -25°C ~ 70°C |
| **Tb** (Γb) | Temp. tubería líquido | -25°C ~ 70°C |
| **TP** (ΓP) | Temp. descarga compresor | 20°C ~ 130°C |
| **TH** (ΓH) | Temp. módulo IPM | -25°C ~ 70°C |
| **FT** (FΓ) | Frecuencia de tarjeta | 0 ~ 159 Hz |
| **Fr** (Fr) | Frecuencia actual compresor | 0 ~ 159 Hz |
| **IF** (1F) | Velocidad ventilador interior | 0 (Off), 1-4 (Low/Med/High/Turbo) |
| **OF** (0F) | Velocidad ventilador exterior | 0-FF (Hex). Ver nota de conversión. |
| **LA** (LA) | Ángulo apertura válvula EXV | 0-FF (Hex). Ver nota de conversión. |
| **CT** (CΓ) | Tiempo trabajo continuo compresor | 0-255 minutos |
| **ST** (5Γ) | **Causa de paro del compresor** | **Ver Tabla de Códigos ST (1-51)** |

### Notas de Conversión y Lectura
*   **Temperaturas:** Muestran el valor real en °C.
*   **OF (Fan Exterior):**
    *   *Motores AC grandes*: Muestra 0-FF (Hex). Convertir a Decimal y multiplicar x10. Rango: 200-2550 RPM.
*   **LA (Válvula EXV):**
    *   Muestra 0-FF (Hex). Convertir a Decimal y multiplicar x2.
*   **Reservados:** A0, A1, b0-b6, dL, AC, Uo, rd (En algunos modelos pueden mostrar valores, pero el boletín los marca como reservados).

---

## 3. Tabla ST: Causas de Paro del Compresor

Si el código **ST** muestra un valor, consulte esta tabla para saber por qué se detuvo el equipo.

| Código | Descripción de la Causa |
| :--- | :--- |
| **1** | Limitación de frecuencia por corriente |
| **2** | Limitación de frecuencia por T2 en enfriamiento |
| **3** | Limitación de frecuencia por T2 en calefacción |
| **4** | Se alcanzó la temperatura establecida |
| **5** | Limitación de frecuencia por T4 |
| **6** | Descongelamiento |
| **7** | Cambio de modo de operación |
| **9** | Protección por alta temp. en descarga (TP) |
| **10** | Protección por T2 (Alta temp. evaporador) |
| **11** | Protección por T2 (Baja temp. evaporador) |
| **12** | Protección por T3 (Alta temp. condensador) |
| **13** | Protección por temp. ambiente interior baja (Seco) |
| **14** | Protección por baja temp. ambiente |
| **15** | Detección de fuga de refrigerante |
| **16** | Falla comunicación unidades (E1) |
| **17** | Falla de comunicación con driver compresor |
| **18** | Protección en voltaje de entrada CA |
| **19** | Protección por temp. descarga en compresor (P2) |
| **20** | Falla en memoria EEPROM (F4) |
| **21** | Mal funcionamiento vel. ventilador interior |
| **22** | Sensor temperatura abierto/corto (E4/E5/F1/F2/F3) |
| **23** | Protección por sobrecorriente |
| **24** | Protección sobrecorriente módulo IPM (P0) |
| **25** | Pérdida de fase en compresor (P43) |
| **26** | Mal funcionamiento en compresor |
| **27** | Protección bajo voltaje driver compresor |
| **28** | Protección corriente Fan DC (F5) |
| **29** | Pérdida de fase Fan DC (F5) |
| **30** | Protección velocidad cero Fan DC |
| **31** | Protección en módulo PFC |
| **32** | Protección alto voltaje driver compresor |
| **33** | Protección velocidad cero compresor (P44) |
| **34** | Falla módulo PWM driver compresor (P45) |
| **35** | Falla módulo MCE driver compresor (P12) |
| **36** | Protección sobrecorriente compresor (P49) |
| **37** | Falla EEPROM tarjeta condensador |
| **38** | Falla en arranque del compresor (P42) |
| **39** | Velocidad compresor fuera de control (P46) |
| **40** | Protección por baja presión |
| **41** | Protección por alta presión |
| **42** | Falla en módulo PFC |
| **49** | Paro por apagado de la unidad |
| **50** | Desconexión eléctrica |
| **51** | Paro DR |

> [!TIP]
> **¿Qué hacer con el código ST?**
> El código ST es historial valioso. Si el cliente reporta que el equipo "se apaga solo", revise este valor inmediatamente después de que ocurra para saber la causa exacta (ej. Código 4 es normal por temperatura, Código 15 es fuga).
