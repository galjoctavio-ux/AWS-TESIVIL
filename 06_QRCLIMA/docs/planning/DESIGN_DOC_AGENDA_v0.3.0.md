# Design Doc: Agenda Module Refactor v0.3.0

**Status:** DRAFT
**Version:** 0.3.0
**Date:** 2024-12-24
**Previous Version:** 0.2.0

## 1. Overview
Version 0.3.0 pivots to a **"Cost-Effective Logistics"** approach. We prioritize **Linear Distance (Haversine)** over expensive API calls to provide real-time feedback during appointment creation without incurring massive costs.

## 2. Core Concepts (Confirmed)

### 2.1. Haversine First Strategy
-   **Logic:** All real-time calculations (Drag & Drop, Time Selection) use the **Haversine Formula** (Linear Distance / "As the crow flies").
-   **UX:** The UI must explicitly label this as "Linear Dist." or "Approx." to manage user expectations.
-   **Cost:** $0.00. API calls are eliminated for the drafting phase.

### 2.2. Real-Time Optimization Feedback
-   **Feature:** When creating an appointment, as the user selects a time, the UI displays a "Distance Indicator" relative to the *previous* and *next* appointment.
-   **Visual:** A small pill near the time selector: "📍 5km from last job" (Green) vs "📍 45km from last job" (Red).

### 2.3. Base Location (Mandatory)
-   **Configuration:** Technicians MUST set a "Base Location" (Home/Office) in their profile.
-   **Usage:** This is the starting point (at 8:00 AM) and ending point for the daily route calculation.

## 3. Data Model & Logic

### 3.1. Entity Relationships (Open Question)
-   **Current:** Appointment -> Client.
-   **Proposed:** Appointment -> Client -> [1..N] Equipment?
    -   *Decision Needed:* Does one appointment cover multiple units?

### 3.2. Appointment Cancellation
-   **Logic:** Cancelled/Rescheduled appointments are **ignored** by the route calculator.
-   **Chain Reaction:** Canceling an appointment automatically "bridges" the gap between the previous and next jobs, instantly updating their Haversine distance.

## 4. UI/UX Specifications

### 4.1. The "Thumb Zone"
-   **Action:** Bottom-sheet based "Wizard" for creating appointments.
-   **Inputs:** Large, easy-to-tap inputs for Date/Time.

### 4.2. Time Selector Feedback
-   **Interaction:** Scrolling the time wheel updates the distance pill.
-   **States:**
    -   **Green:** < 10km (Linear)
    -   **Yellow:** 10-30km (Linear)
    -   **Red:** > 30km (Linear)

## 5. Critical Risks
1.  **Coordinate Accuracy:** "Garbage In, Garbage Out". If the client's saved address has bad lat/lng, the calculation fails.
    -   *Mitigation:* Validate coordinates upon Client Creation.
2.  **User Perception:** Users might complain "The app says 5km but Waze says 25 mins".
    -   *Mitigation:* Clear copy: "Distancia en Línea Recta".

## 6. Implementation Stages (Updated)
1.  **Data:** Add `base_lat`, `base_lng` to User Profile.
2.  **Logic:** Implement `HaversineCalculator` (standalone utility).
3.  **UI:** Build "Appointment Wizard" with real-time listeners on the DatePicker.
4.  **Backend:** Ensure Client creation always geocodes addresses (Google Places).
