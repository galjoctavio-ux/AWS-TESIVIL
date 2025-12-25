# Open Questions: Agenda Module Refactor

Please provide input on the following items to finalize the implementation plan.

## 1. Client Registration Data
When registering a *new* client during the appointment flow, what fields are **strictly mandatory**?
- [ ] Name
- [ ] Phone Number
- [ ] Address / GPS Location
- [ ] Email?
- [ ] RFC/Tax ID?
*Tip: Fewer mandatory fields = faster capture.*

## 2. Schedule Conflicts
If a user drags an appointment to a time slot that is already occupied:
- **Option A (Overlap):** Allow them to sit side-by-side (visually squeezed).
- **Option B (Prevent):** Snap back and show "Slot Taken" error.
- **Option C (Push):** Automatically push the existing appointment down? (Complex).
*Recommendation: Option A for flexibility.*

## 3. Service Types & Colors
We need a catalog of service types to assign colors. Example:
- **Maintenance:** Blue
- **Repair:** Red
- **Installation:** Green
- **Quote/Visit:** Yellow
*Question: Are these the correct categories? Do you have specific hex codes or brand colors in mind?*

## 4. Offline "Roof" Scenario
If a technician is on a roof with NO signal:
- They can create an appointment locally.
- **Question:** How do we handle address entry without Google Maps/Geocoding?
    - Allow manual text entry?
    - Allow "Pin current location" (requires GPS lock, not data)?

## 5. Work Hours
- What are the default start/end hours for the calendar view (e.g., 8 AM - 6 PM)?
- Should it hide non-working hours?
