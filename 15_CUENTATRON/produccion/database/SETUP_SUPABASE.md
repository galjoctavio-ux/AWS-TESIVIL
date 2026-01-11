# Configuración Supabase - Cuentatron MVP

> **Módulo:** 08 - Backend/API  
> **Estado:** ⬜ Pendiente configuración

---

## Credenciales Requeridas

Después de crear el proyecto Supabase, actualiza este archivo:

```env
# SUPABASE
SUPABASE_URL=https://[PROJECT_ID].supabase.co
SUPABASE_ANON_KEY=[anon_key]
SUPABASE_SERVICE_ROLE_KEY=[service_role_key]

# POSTGRESQL (para receptor_mqtt.py)
DB_HOST=db.[PROJECT_ID].supabase.co
DB_PORT=5432
DB_NAME=postgres
DB_USER=postgres
DB_PASS=[database_password]
```

---

## Pasos de Configuración

### 1. Crear Proyecto Supabase

1. Ir a [supabase.com](https://supabase.com)
2. Crear nuevo proyecto
3. **Nombre:** `cuentatron-mvp`
4. **Región:** Más cercana (ej. `us-east-1`)
5. **Contraseña BD:** Generar y guardar

### 2. Ejecutar Schema

1. Ir a **SQL Editor** en Supabase Dashboard
2. Copiar contenido de `schema_cuentatron_mvp.sql`
3. Ejecutar

### 3. Configurar Auth

#### Google OAuth
1. Ir a **Authentication > Providers**
2. Habilitar **Google**
3. Configurar credenciales de Google Cloud Console

#### Email Magic Link
1. Ir a **Authentication > Providers**
2. Verificar que **Email** esté habilitado
3. En **Email Templates**, configurar código de 6 dígitos

### 4. Verificar RLS

1. Ir a **Database > Tables**
2. Verificar que cada tabla tenga el ícono de candado (RLS habilitado)

---

## Verificación

- [ ] Proyecto Supabase creado
- [ ] Schema ejecutado sin errores
- [ ] Google OAuth configurado
- [ ] Email Magic Link funcionando
- [ ] RLS habilitado en todas las tablas
- [ ] Credenciales guardadas en `.env`

---

*Última actualización: 2026-01-06*
