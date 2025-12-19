# SYNAPSE_AI - Mobile App Assets

Este directorio contiene los assets de la aplicación móvil.

## Estructura de Archivos

```
assets/
├── icon.png           ← App icon (1024x1024 px) - REQUERIDO
├── adaptive-icon.png  ← Android adaptive icon (1024x1024 px)
├── splash.png         ← Splash screen (1284x2778 px)
├── favicon.png        ← Web favicon (48x48 px)
│
├── images/            ← Imágenes generales de la app
│
└── prompts/           ← Assets del módulo Engine
    ├── styles/        ← Imágenes de estilos (8)
    └── params/        ← Imágenes de parámetros (10)
```

## Especificaciones

### icon.png
- **Tamaño**: 1024 × 1024 px
- **Formato**: PNG (sin transparencia para iOS)
- **Uso**: Ícono principal en iOS y Android

### adaptive-icon.png
- **Tamaño**: 1024 × 1024 px
- **Formato**: PNG con transparencia
- **Uso**: Android adaptive icons (el sistema recorta)

### splash.png
- **Tamaño**: 1284 × 2778 px (o similar ratio)
- **Formato**: PNG
- **Uso**: Pantalla de carga al abrir la app

## Guarda tu logo aquí
Coloca tu logo como `icon.png` en esta carpeta.
