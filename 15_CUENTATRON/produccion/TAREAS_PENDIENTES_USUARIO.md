# TAREAS PENDIENTES DEL USUARIO - Cuentatron MVP

> **Módulo activo:** modulo_08_backend_api  
> **Última actualización:** 2026-01-06  
> **Proyecto Supabase:** odovajnvgbzamkceouyn

---

## Resumen

Este documento contiene TODAS las tareas que requieren acción manual del usuario.
La IA continuará trabajando en tareas autónomas mientras completas estas.

---

## ✅ COMPLETADAS

| # | Tarea | Fecha |
|---|-------|-------|
| 1 | Crear proyecto Supabase | 2026-01-06 |
| 2 | Ejecutar schema SQL (7 tablas) | 2026-01-06 |

---

## 🔄 PENDIENTES

---

### TAREA 1: Configurar Google OAuth

**Tiempo estimado:** 10-15 min

#### Paso 1: Google Cloud Console

1. Ve a [console.cloud.google.com](https://console.cloud.google.com)
2. Crea proyecto o selecciona existente
3. Menú lateral → **APIs & Services** → **Credentials**
4. Click **+ CREATE CREDENTIALS** → **OAuth client ID**
5. Si pide configurar pantalla de consentimiento:
   - User Type: **External**
   - App name: `Cuentatron`
   - Email: tu email
   - Guardar y continuar (campos opcionales pueden quedar vacíos)
6. Volver a Credentials → **+ CREATE CREDENTIALS** → **OAuth client ID**
7. Application type: **Web application**
8. Name: `Cuentatron MVP`
9. En **Authorized redirect URIs**, agregar:
   ```
   https://odovajnvgbzamkceouyn.supabase.co/auth/v1/callback
   ```
10. Click **CREATE**
11. **COPIAR** el Client ID y Client Secret que aparecen

#### Paso 2: Supabase Dashboard

1. Ve a [Auth Providers](https://supabase.com/dashboard/project/odovajnvgbzamkceouyn/auth/providers)
2. Busca **Google** en la lista
3. Click para expandir
4. Activa el toggle "Enable Sign in with Google"
5. Pega:
   - **Client ID** (de Google)
   - **Client Secret** (de Google)
6. Click **Save**

#### Verificación
- En Supabase Dashboard → Authentication → debería aparecer Google como "Enabled"

---

### TAREA 2: Configurar Email con Código OTP

**Tiempo estimado:** 5 min

El módulo de Auth usa código de 6 dígitos (no Magic Link).

#### Pasos:

1. Ve a [Auth Settings](https://supabase.com/dashboard/project/odovajnvgbzamkceouyn/auth/providers)
2. Email debería estar habilitado por defecto ✓
3. Ve a **Email Templates** (en la sección Auth)
4. Selecciona template **Confirm signup**
5. En el cuerpo del email, asegúrate de que incluya `{{ .Token }}` para mostrar el código

**Nota:** Supabase genera automáticamente códigos OTP. El template debe mostrar `{{ .Token }}` al usuario.

---

### TAREA 3: Configurar Firebase Cloud Messaging (FCM)

**Tiempo estimado:** 15-20 min

#### Paso 1: Crear proyecto Firebase

1. Ve a [console.firebase.google.com](https://console.firebase.google.com)
2. Click **Add project**
3. Nombre: `cuentatron-mvp`
4. Google Analytics: opcional (puedes desactivar)
5. **Create project**

#### Paso 2: Agregar app Android

1. En el proyecto, click icono Android
2. Package name: `com.tesivil.cuentatron` (o el que uses)
3. App nickname: `Cuentatron`
4. Click **Register app**
5. **Descarga** `google-services.json`
6. Guarda el archivo en:
   ```
   15_CUENTATRON/produccion/config/google-services.json
   ```

#### Paso 3: Obtener Server Key (para backend)

1. En Firebase Console → Project Settings (engranaje)
2. Tab **Service accounts**
3. Click **Generate new private key**
4. Descarga el archivo JSON
5. Guarda de forma segura (este archivo es sensible)

#### Verificación
- `google-services.json` existe en `produccion/config/`
- Service account key guardada

---

### TAREA 4: Documentar Credenciales de VM AWS

**Tiempo estimado:** 10 min

Necesito las credenciales de los servicios existentes en tu VM.

#### Acción requerida:

Conecta a tu VM AWS y busca el archivo `.env` del proyecto actual.
Proporciona los siguientes valores (o indica la ruta donde puedo leerlos):

```
# INFLUXDB
INFLUX_URL=
INFLUX_TOKEN=
INFLUX_ORG=
INFLUX_BUCKET_NEW=

# MQTT (Mosquitto)
MQTT_BROKER_HOST=
MQTT_PORT=
MQTT_USERNAME=
MQTT_PASSWORD=
```

**Alternativa:** Si estos valores están en un archivo en la VM, dime la ruta y los leeré.

---

### TAREA 5: Obtener service_role Key de Supabase

**Tiempo estimado:** 2 min

El script `receptor_mqtt.py` necesita acceso completo a la BD.

#### Pasos:

1. Ve a [API Settings](https://supabase.com/dashboard/project/odovajnvgbzamkceouyn/settings/api)
2. En la sección **Project API keys**:
   - Copia **service_role** key (la que dice "This key has the ability to bypass RLS")
3. En **Database Settings** → Connection string:
   - Copia el **password** de la base de datos (o resetea si no lo recuerdas)

#### Guardar en VM:

Actualiza el `.env` de `receptor_mqtt.py` con:
```env
DB_HOST=db.odovajnvgbzamkceouyn.supabase.co
DB_PORT=5432
DB_NAME=postgres
DB_USER=postgres
DB_PASS=[password que copiaste]
```

---

## 📋 Checklist Final

Marca cada tarea cuando la completes:

- [ ] TAREA 1: Google OAuth configurado
- [ ] TAREA 2: Email OTP verificado
- [ ] TAREA 3: Firebase/FCM configurado
- [ ] TAREA 4: Credenciales InfluxDB/MQTT proporcionadas
- [ ] TAREA 5: service_role key guardada

---

## ¿Qué sigue después?

Una vez completes estas tareas:

1. Dime **"tareas completadas"** o indica cuáles terminaste
2. Continuaré con:
   - Verificación de conexiones
   - Tests de autenticación
   - Cierre de módulo_08
   - Inicio de módulo_01 (App móvil)

---

*Documento generado: 2026-01-06*
*Versión: 2.0 - Instructivo completo*
