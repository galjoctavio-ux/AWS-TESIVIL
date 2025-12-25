# Design Doc: Agenda Module Refactor v0.2.0

**Status:** DRAFT
**Version:** 0.2.0
**Date:** 2024-12-24
**Previous Version:** 0.1.0

## 1. Overview
Evolution of the Agenda module to include "Route Optimization" and "Thumb-friendly UX". The core value proposition is now **Schedule + Logistics**.

## 2. Core Concepts (Updated)

### 2.1. Dynamic Views & Semantic Zoom
-   **1 Day View:** Detailed execution mode.
-   **3 Day View:** Rolling window of upcoming work.
-   **7 Day View:** "Tetris" block view for high-level planning.
-   **Action:** Switching views changes the level of detail (text vs. just colors).

### 2.2. Intelligent "Quick Add"
-   **Integration:** Reuse existing Google Places API logic.
-   **Flow:** Search Client/Address -> Auto-fill Geo -> Select Service -> Save.

### 2.3. The "Thumb Zone" (UX)
-   **Philosophy:** Primary actions must be reachable with one hand (bottom 30% of screen).
-   **Implementation:** Floating Action Button (FAB) or Bottom Sheet for "New Appointment".
-   **Contextual Actions:** Tapping an appointment opens a bottom sheet, not a full screen or top modal.

### 2.4. Smart Drag & Drop (Logistics)
-   **Interaction:** Long press -> Drag appointment to new slot.
-   **Reaction:** App automatically recalculates the "Route Pill" (Travel time/efficiency) for that day.
-   **Feedback:** Visual indicators if the new slot causes massive travel time (Red Pill).

## 3. Technical Architecture

### 3.1. Route Logic & Cost Management (NEW)
-   **Challenge:** Recalculating routes on every Drag & Drop is expensive (Google Routes API).
-   **Strategy:**
    1.  **Geo-hashing/Caching:** Cache distances between common clusters (Cities/Zones).
    2.  **Haversine First:** Use simple math ("As the crow flies") for immediate UI feedback (Green/Red).
    3.  **API Verification:** Only call Google Routes when the schedule is "Settled" (user stops dragging for 2s) or upon "Save".
-   **Offline:** Fallback to Haversine formula (Linear distance) when offline.

### 3.2. Data Model Additions
-   **Tech Profile:** `baseLocation` (Lat/Lng) - The "Home" starting point.
-   **Appointment:** `travelTimeFromPrevious` (Minutes), `distanceFromPrevious` (km), `routeStatus` (Green/Yellow/Red).

## 4. Open Definitions (To Discuss)

### 4.1. Hierarchy: Address vs. Equipment
-   Does an appointment link to a **House** (Address) or a specific **A/C Unit** (Equipment)?
-   *Implication:* If Equipment is mandatory, the "Quick Add" flow becomes longer.

### 4.2. "Continuity Threshold"
-   How many minutes of travel make a route "Discontinuous"?
-   *Proposal:* > 45 mins travel = "Yellow/Red" efficiency.

### 4.3. The "Route Pill" UI
-   Visual component showing travel efficiency between jobs.
-   **Green:** < 15 mins.
-   **Yellow:** 15-45 mins.
-   **Red:** > 45 mins.

## 5. Implementation Stages (Updated)
1.  **Setup:** Calendar Libraries + "Thumb Zone" Layout Skeleton.
2.  **Data:** SQLite Schema Update (add Geodata & Route fields).
3.  **UI:** Implement Dynamic Views (1/3/7).
4.  **Logic:** "Haversine" Calculator for offline/fast distance checks.
5.  **Integration:** Google Routes API (with Debounce/Caching protection).
6.  **UX:** Drag & Drop with Real-time "Route Pill" updates.
