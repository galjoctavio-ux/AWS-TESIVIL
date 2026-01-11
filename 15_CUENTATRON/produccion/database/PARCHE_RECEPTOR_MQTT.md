# Parche para receptor_mqtt.py - Migración a Cuentatron MVP

> **Aplicar a:** receptor_mqtt.py en VM AWS  
> **Fecha:** 2026-01-06

---

## Instrucciones

Este archivo contiene los cambios necesarios para que `receptor_mqtt.py` funcione con el nuevo schema de Supabase.

**IMPORTANTE:** Hacer backup del archivo original antes de aplicar cambios.

---

## CAMBIO 1: Query de Estado de Suscripción (línea ~438)

### Buscar:
```python
sql = """
    SELECT c.subscription_status, c.fecha_proximo_pago 
    FROM clientes c
    JOIN dispositivos_lete d ON c.id = d.cliente_id
    WHERE d.device_id = %s
"""
```

### Reemplazar por:
```python
sql = """
    SELECT u.subscription_status, u.fecha_proximo_pago 
    FROM usuarios u
    JOIN dispositivos d ON u.id = d.usuario_id
    WHERE d.device_id = %s
"""
```

---

## CAMBIO 2: Verificación de Resultado (si aplica)

Si hay código que hace referencia a `cliente_id`, cambiar a `usuario_id`.

### Buscar patrones como:
```python
cliente_id
```

### Reemplazar por:
```python
usuario_id
```

---

## CAMBIO 3: Variables de Entorno (.env)

### Actualizar:
```env
# SUPABASE CUENTATRON MVP
DB_HOST=db.odovajnvgbzamkceouyn.supabase.co
DB_PORT=5432
DB_NAME=postgres
DB_USER=postgres
DB_PASS=[OBTENER_DEL_DASHBOARD_SUPABASE]
```

---

## Validación Post-Cambio

1. Reiniciar el servicio:
   ```bash
   sudo systemctl restart receptor_mqtt
   ```
   (o el nombre del servicio que uses)

2. Verificar logs:
   ```bash
   journalctl -u receptor_mqtt -f
   ```

3. Buscar estos mensajes de éxito:
   - "✅ Conexión con PostgreSQL (Supabase) exitosa"
   - "✅ Esquema de PostgreSQL verificado"

---

## Rollback

Si algo falla, restaurar el backup:
```bash
cp receptor_mqtt.py.backup receptor_mqtt.py
sudo systemctl restart receptor_mqtt
```

---

*Parche generado: 2026-01-06*
