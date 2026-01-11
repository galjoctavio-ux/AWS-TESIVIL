# Inventario de Legacy Técnico

## Scripts Python (Reutilizables)

| Script | Ubicación | Estado | Acción |
|--------|-----------|--------|--------|
| `receptor_mqtt.py` | VM AWS | ✅ Funcional | Mantener, NO reescribir |
| `vigilante_calidad.py` | VM AWS | ✅ Funcional | Mantener, crear API puente |
| `alerta_diaria.py` | VM AWS | ✅ Funcional | Mantener, crear API puente |

## Scripts Python (Obsoletos)

| Script | Estado | Razón |
|--------|--------|-------|
| `servidor.py` | ❌ Obsoleto | Reemplazado por Supabase |

## Firmware ESP32

| Archivo | Estado | Notas |
|---------|--------|-------|
| `sketch_esp32_lete.ino` | ✅ Funcional | NO modificar sin revisión |

## Deuda Técnica

### Crítica (Resolver antes de producción)

| Elemento | Impacto |
|----------|---------|
| Columnas de calibración | Hardcoded en firmware |

### Tolerable (Resolver post-MVP)

| Elemento | Impacto |
|----------|---------|
| Logs no estructurados | Dificulta debugging |

### Asumida (No resolver)

| Elemento | Razón |
|----------|-------|
| Código Python legacy | Funciona, no tocar |

---

*Fuente: Plan Maestro Definitivo, Secciones 7.8, 7.9, 7.10*
