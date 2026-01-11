# Scripts de Alertas

Esta carpeta contiene copias de referencia de los scripts Python que manejan las alertas.

## Scripts Requeridos

| Script | Origen | Propósito |
|--------|--------|-----------|
| `alerta_diaria.py` | `legacy_source/` | Alertas diarias de consumo CFE |
| `vigilante_calidad.py` | `legacy_source/` | Detección de anomalías |

## Instrucciones

Los scripts originales se ejecutan en la VM AWS. Estas copias son **solo para referencia** durante el desarrollo.

**NO modificar** — cualquier cambio debe hacerse en el servidor de producción.

## Regla para IA

Crear API puente para consumir estos scripts, NO reescribirlos (CAME M-01).

## Referencia

- Plan Maestro: Secciones 7.8, 7.9
- CAME M-01
