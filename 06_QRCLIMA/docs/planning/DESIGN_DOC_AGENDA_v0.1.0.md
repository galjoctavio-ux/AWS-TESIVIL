# Design Doc: Agenda Module Refactor v0.1.0

**Status:** DRAFT
**Version:** 0.1.0
**Date:** 2024-12-24

## 1. Overview
The goal is to transform the current list-based "Agenda" into a full-featured Calendar-centric module. This module will allow technicians to manage appointments, visualize their schedule, and navigate to service locations efficiently.

## 2. Core Concepts (Confirmed)

### 2.1. Calendar Views (Zoom Semántico)
-   **1 Day View:** Hourly breakdown. High detail. Best for "Execution" mode.
-   **3 Day View:** Compromise between detail and planning. Good for seeing immediate upcoming work.
-   **7 Day View:** High-level overview. Low detail (maybe just colored blocks). Best for "Planning" mode.
-   **Interaction:** Pinch-to-zoom or toggle button to switch views.

### 2.2. Creation Flow: "Client First"
-   **Current Flow:** (To be replaced)
-   **New Flow:**
    1.  Select/Search Client (or Create New).
    2.  Select Service Location (from Client's address).
    3.  Define Appointment Details (Date, Time, Type).
    4.  Create Service Record.

### 2.3. GPS Integration
-   **Requirement:** Direct button to open external navigation apps.
-   **Implementation:** `Linking.openURL()` with schemes for Waze (`waze://`) and Google Maps (`google.navigation:`).
-   **UX:** One-tap action from the Appointment Card.

### 2.4. Interaction: Drag & Drop
-   **Requirement:** Drag an appointment block to a new time slot to reschedule.
-   **Constraint:** Must be intuitive and handle conflicts (see Open Questions).

## 3. Technical Architecture

### 3.1. Libraries & Tools
-   **Calendar UI:** `react-native-calendars` (highly customizable) or `react-native-big-calendar` (better for day/week views).
    -   *Recommendation:* `react-native-big-calendar` for the drag & drop support on time grids.
-   **Gestures:** `react-native-gesture-handler`.
-   **Maps:** `expo-linking` for external apps. `react-native-maps` if we need an inline static preview (optional).
-   **Offline:** `expo-sqlite` (already linked) for local persistence.
-   **State Management:** React Context or specialized hook for Agenda logic.

### 3.2. Data Model Changes
We need to enhance the `Service` entity to support scheduling:
-   `service.scheduledStart`: DateTime
-   `service.scheduledEnd`: DateTime
-   `service.color`: String (Hex code for service type)
-   `service.geo`: { lat: number, lng: number } (for the client's location)

### 3.3. Offline Strategy
-   **Read:** Always read from local SQLite.
-   **Write:** Write to local SQLite immediately. Sync with backend (Firebase) in background when online.
-   **"No Signal" Scenario:** app functions 100% normally for reading/writing. User is warned if they try to use features requiring data (like geocoding a new address).

## 4. UI/UX Considerations

### 4.1. Sunlight Legibility
-   **Contrast:** Use high contrast colors (Black on White, Dark Blue on White).
-   **Color Coding:** Service types should use distinct, vibrant colors that are distinguishable even in bright light. Avoid subtle pastels.
-   **Typography:** Large, bold fonts for times and client names.

### 4.2. Data Capture Speed
-   **Defaults:** Auto-set duration based on service type.
-   **Autocomplete:** Address autocompletion (Google Places) when online.
-   **Smart Inputs:** Keyboard type optimizations (numeric for phone, etc.).

## 5. Implementation Stages
1.  **Setup:** Install calendar libraries and configure basic views.
2.  **Data Layer:** Update SQLite schema and Service types.
3.  **UI - Calendar:** Implement 1, 3, 7 day views.
4.  **UI - Creation:** Build the "Client -> Appointment" wizard.
5.  **Interaction:** Add Drag & Drop functionality.
6.  **Integration:** Add GPS linking and Phone dialing.
7.  **Refinement:** Offline testing and Sunlight UI tweaks.
