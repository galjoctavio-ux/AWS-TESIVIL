# Design Doc: Agenda Module Refactor v0.4.0

**Status:** DRAFT
**Version:** 0.4.0
**Date:** 2024-12-24
**Previous Version:** 0.3.0

## 1. Overview
Version 0.4.0 expands the scope to include **"Customer Relationship Management"** (Mini-CRM) and **"Warranty Management"**. The Agenda is no longer just for scheduling; it becomes the central hub for validating entitlements (Warranties) and accessing client history.

## 2. Core Concepts (New in v0.4.0)

### 2.1. Service Type: "Garantía" & Validation Logic
-   **New Type:** "Garantía" is added to the service type catalog.
-   **Validation (PRO Feature):** When "Garantía" is selected for a specific Equipment (Unit ID), the system checks:
    -   `LastInstallationDate` + `WarrantyPeriod` >= `Today`.
    -   **Result:** Visual "Active" (Green) or "Expired" (Red/Yellow) badge.
-   **Data Capture:** The warranty date/input must be captured **BEFORE** the client signs the service report.

### 2.2. Mini-CRM Card
-   **Location:** Inside the "Appointment Detail" view.
-   **Content:** A summary card showing:
    -   List of registered Equipment.
    -   Last 3 visits (History).
    -   Total Spend (optional/PRO).

### 2.3. Global Search & List View
-   **Interaction:** Tapping "Search" inside the Calendar view smooth-transitions the UI to a **List View**.
-   **Scope:** Search across Client Name, Address, and Equipment Serial Number.

### 2.4. Linear Distance Disclaimer
-   **UX:** A one-time or persistent banner explaining that all distances shown are "Linear" (Straight line) to manage expectations vs. real road travel.

## 3. Data Model Enhancements
-   **Equipment:** `warrantyExpirationDate` (Date), `installationDate` (Date).
-   **Service:** `isWarrantyClaim` (Boolean), `warrantyValidationStatus` (Enum: Valid, Expired, Override).

## 4. UI Structure Modifications
-   **Appointment Detail:** Now includes a collapsible "Client History" section (Mini-CRM).
-   **Closing Flow:** "Warranty Input" step inserted *before* "Signature".

## 5. Critical Technical Constraints
-   **Search Indexing:** If a technician has 5,000+ historical records, the search must be instant. We may need a local FTS (Full Text Search) table in SQLite.
-   **Data Integrity:** Warranty dates must be immutable after signature to prevent fraud.

## 6. Implementation Stages (Updated)
1.  **Data:** Add Warranty fields to Equipment table.
2.  **Search:** Implement FTS5 table in SQLite for high-performance searching.
3.  **UI:** "Mini-CRM" Component.
4.  **Logic:** "Warranty Validator" Service (PRO logic).
5.  **Flow:** Refactor `ServiceClosingScreen` to inject the Warranty step.
