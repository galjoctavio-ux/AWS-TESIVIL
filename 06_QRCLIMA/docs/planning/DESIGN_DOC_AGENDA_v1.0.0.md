# Design Doc: Agenda Inteligente HVAC v1.0.0 (FINAL)

**Status:** APPROVED FOR EXECUTION
**Version:** 1.0.0_FINAL_CONCEPT
**Date:** 2024-12-24

## 1. Overview
The **Agenda Inteligente HVAC** is a comprehensive module designed to optimize the technician's daily workflow using "Cost-Effective Intelligence". It combines distinct Calendar views, offline-first routing logic, and deep integration with client history (Mini-CRM) and warranty entitlements.

## 2. Core Features

### 2.1. Dynamic Visualization (Semantic Zoom)
-   **Views:** 1 Day (Detailed), 3 Days (Rolling), 7 Days (Planning).
-   **Transition:** Pinch-to-zoom or toggle buttons to switch levels of detail.

### 2.2. Creation Flow: "Quick Add"
-   **Step 1:** Search/Select Client.
-   **Step 2:** Select Address (Google Places integration for new coords).
-   **Step 3:** Select Time & Date.
    -   *Feature:* Real-time feedback: "📍 5.2 km from previous job". (Uses Haversine).
-   **Step 4:** Select Service Type & Equipments.

### 2.3. Route Optimization (Haversine First)
-   **Logic:** Calculates "Linear Distance" from the *previous appointment* or the Technician's *Base Location* (if first job).
-   **Offline:** Uses pure math (Haversine Formula), requiring no API calls.
-   **Disclaimer:** UI persistently notes "Distances are linear estimates".

### 2.4. Smart Actions (Thumb Zone)
-   **Location:** Bottom of the screen (Action Sheet / FAB).
-   **Actions:** "Navigate (Waze/Maps)", "Call Client", "Start Job".
-   **Interaction:** Tapping a calendar block opens this Action Sheet (Mini-CRM view).

### 2.5. Warranty & PRO Logic
-   **Service Type:** "Garantía".
-   **Validation:**
    -   **Free:** Label only.
    -   **PRO:** Validates `InstallationDate` + `WarrantyPeriod` vs Today. Shows "Expired" warning if invalid.
-   **Critical Flow Change:** The input for defining a warranty period (e.g., "1 Year") happens in the **Closing Flow**, *before* the client signs.

### 2.6. Global Search
-   **UI:** Loupe Icon -> Transitions to List View.
-   **Filters:** Name, Address, Phone.

## 3. Data Model

### 3.1. Entity Hierarchy
`Appointment` -> `Client` (Address) -> `[0..N] Equipment`

### 3.2. New Schema Fields
-   **User:** `base_lat`, `base_lng` (Home Base).
-   **Equipment:** `warranty_expiration_date`, `installation_date`.
-   **Service (Appointment):** `is_warranty_claim`, `route_efficiency_color`.

## 4. Technical Architecture

### 4.1. Libraries
-   **Calendar:** `react-native-big-calendar`.
-   **Search:** SQLite FTS5 (Full Text Search).
-   **Maps:** `expo-linking` for deep links.

### 4.2. Constraints
-   **Offline:** All routing and search must work without data.
-   **Performance:** Search must be <100ms for 5,000+ records.

## 5. Implementation Stages
1.  **Database Upgrade:** Schema migration for Base Location, Geo-coords, and Warranty fields.
2.  **Logic Core:** `HaversineCalculator` and `WarrantyValidator` services.
3.  **UI Components:** `CalendarView`, `MiniCRMCard`, `DistanceIndicator`.
4.  **Flows:**
    -   "Quick Add" Wizard.
    -   "Search" List View.
    -   "Service Closing" (Warranty Step injection).
