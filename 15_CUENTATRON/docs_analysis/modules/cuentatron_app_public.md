# cuentatron_app/public (Dashboard Cliente HTML)

## Propósito
Interfaces HTML estáticas servidas por el backend Node.js. Incluye dashboard de usuario, panel de administración, registro de cliente, y gestión de cuenta.

## Core Logic

### Páginas Disponibles
| Archivo | Función | Tamaño |
|---------|---------|--------|
| `dashboard.html` | Vista principal de consumo | 6KB |
| `admin.html` | Panel de administración | 9KB |
| `mi-cuenta.html` | Gestión de cuenta/suscripción | 12KB |
| `registro.html` | Formulario de alta | 13KB |
| `bienvenido.html` | Landing post-registro | 1.4KB |
| `style.css` | Estilos compartidos | 4.7KB |

### Assets
- `logo_LETE.png` - Logo del producto
- `Instrucciones.pdf` - Manual de instalación
- `recibo-*.png` - Imágenes de ayuda para capturar datos CFE

### Características del Dashboard
- Visualización de consumo en tiempo real
- Gráficas de consumo histórico
- Estado de suscripción
- Alertas activas

### Panel Admin
- Gestión de dispositivos
- Lista de clientes
- Estado de suscripciones

## Dependencias/Inputs
| Tipo | Recurso |
|------|---------|
| Auth | Supabase Auth (vía proxy) |
| API | server.js (endpoints REST) |
| Styling | CSS vanilla |

## Estado
**✅ FUNCIONAL - Producción**

Interfaces listas. El código HTML está autocontenido con JavaScript inline. Podría beneficiarse de migración a framework (React/Vue) para mantenibilidad futura.
