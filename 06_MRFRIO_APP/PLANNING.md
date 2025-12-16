# PLANNING.md - Estrategia de Implementación "Mr. Frío"

## 1. Arquitectura & Stack Tecnológico

**Core Principal:**
- **Frontend:** React Native (Expo SDK 50+)
- **Estilos:** NativeWind (TailwindCSS para RN)
- **Backend Dinámico:** Firebase (Firestore, Auth, Functions)
- **Backend Estático (Offline):** SQLite Local (`expo-sqlite`)

**Justificación de Arquitectura Híbrida:**
Mantendremos un enfoque **"Offline-First Parcial"**.
- **Datos de Usuario (Clientes, Servicios, Cotizaciones):** Viven en Firestore con caché habilitado. Requieren sincronización para respaldo en nube.
- **Datos Maestros (Errores, Modelos, Precios Base):** Viven en SQLite Local. No consumen lecturas de Firebase. Garantizan velocidad instantánea en diagnósticos.

---

## 2. El Desafío SQL (Estrategia Fase 1)

Para el Módulo 3.5.3 (Biblioteca de Errores), he analizado las opciones y la estrategia ganadora es la **Opción B: SQLite Nativo**.

### Análisis de Decisión:
| Característica | Opción A (Firebase JSON) | Opción B (SQLite Local) |
| :--- | :--- | :--- |
| **Costo Operativo** | Alto (Lecturas por cada búsqueda) | **Cero** (Local) |
| **Rendimiento Offline** | Depende de caché previo | **Nativo (Instantáneo)** |
| **Integridad Relacional** | Pobre (NoSQL denormalizado) | **Total** (SQL Relacional) |
| **Complejidad Inicial** | Baja | Media (Requiere script de conversión) |

### Estrategia de Implementación (SQLite):
Dado que `seed_full_database.sql` es un dump SQL estándar (PostgreSQL syntax), ejecutaremos el siguiente pipeline de "Hidratación":

1.  **Conversión ETL (Extract-Transform-Load):**
    -   Crearemos un script en Node.js (`scripts/generate-sqlite-db.js`) que lea el archivo SQL.
    -   Limpiará sintaxis no compatible (ej. `NOW()` -> `datetime('now')`, `ON CONFLICT` -> `INSERT OR IGNORE`).
    -   Generará un archivo binario `mrfrio_master.db`.
2.  **Bundling:**
    -   El archivo `mrfrio_master.db` se incluirá en la carpeta `assets/` de la app.
3.  **Hidratación en Runtime:**
    -   Al iniciar la app por primera vez, un servicio de sistema (`DatabaseService`) copiará el archivo desde los assets nativos al `FileSystem.documentDirectory` del dispositivo.
    -   Las consultas futuras se harán directamente a este archivo local.

---

## 3. Plan de Fases Detallado

### Fase 0: Setup & Cimientos (Semana 1)
*Objetivo: Tener el "esqueleto" de la app corriendo con navegación y configuración base.*

- [ ] **Inicialización**: `npx create-expo-app` con Template Blank (TypeScript recomendado).
- [ ] **Estilos**: Configuración de `NativeWind` v4 + `TailwindCSS`.
- [ ] **Navegación**: Setup de `expo-router` (File-based routing).
    -   Estructura: `(auth)`, `(app)`, `(aux)`.
- [ ] **Firebase Config**:
    -   Setup de proyecto en Firebase Console.
    -   Integración de `react-native-firebase` o `firebase` JS SDK (según compatibilidad Expo Go).
- [ ] **Assets**: Carga de fuentes (Inter/Roboto) y configuración de `app.json`.

### Fase 1: Ingesta de Datos & Motor Offline (Semana 1-2)
*Objetivo: Resolver el "Desafío SQL" y tener la Biblioteca de Errores funcional.*

- [ ] **ETL Script**: Crear script para convertir `seed_full_database.sql` a SQLite.
- [ ] **Database Service**:
    -   Implementar `FileSystem` copy logic.
    -   Inicializar conexión `SQLite.openDatabase`.
- [ ] **UI Biblioteca Errores**:
    -   **Brand Grid**: Pantalla de selección de marcas (Query: `SELECT DISTINCT logo_url...`).
    -   **Model Carousel**: Selección visual de equipos.
    -   **The Solver**: Buscador predictivo de códigos de error.
- [ ] **Validación**: Verificar funcionamiento 100% Offline (Modo Avión).

### Fase 2: Auth & Onboarding (Semana 2-3)
*Objetivo: Gestión de usuarios y perfiles.*

- [ ] **Firebase Auth**:
    -   Implementar Auth Provider (Context).
    -   Login Screen (Phone Auth simulado o Email/Pass para MVP inicial).
- [ ] **User Profile Exists?**: Lógica para detectar si es usuario nuevo.
- [ ] **Onboarding Wizard**:
    -   Pantallas de bienvenida.
    -   Formulario de perfil base (Alias, Experiencia, Ciudad).
- [ ] **Firestore User Document**: Creación del registro inicial en colección `users`.

### Fase 3: Core Operativo (Semana 3-5)
*Objetivo: El corazón de la app (CRM y Servicios).*

- [ ] **Firestore Schema**: Definición de reglas y tipos para `clients` y `services`.
- [ ] **Módulo Clientes (CRM)**:
    -   Lista de Clientes (Firestore Query con filtro `technician_id`).
    -   Crear/Editar Cliente.
- [ ] **Módulo Servicios**:
    -   Flujo "Nuevo Servicio" (Wizard de 3 pasos).
    -   Integración de Biblioteca de Errores en el reporte (si es Reparación).
- [ ] **Dashboard "Mi Taller"**:
    -   Widgets de accesos rápidos.
    -   Resumen de actividad reciente.

### Fase 4: Utilerías & Refinamiento (Semana 6)
*Objetivo: Herramientas satélite y pulido visual.*

- [ ] **Generador PDF**: Implementación básica de `expo-print` para reportes de servicio.
- [ ] **Calculadora BTU**: Lógica de cálculo térmico simple.
- [ ] **Modo Oscuro/Claro**: Ajustes finales de NativeWind.
- [ ] **Deploy**: Build de APK de prueba (EAS Build).
