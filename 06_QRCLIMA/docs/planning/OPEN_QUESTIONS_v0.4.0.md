# Open Questions: Agenda Module Refactor (v0.4.0)

## 1. Warranty "Warning" Behavior
If a PRO user selects "Garantía" but the system calculates it is **Expired**:
- [ ] **Blocking:** Prevent creating the appointment?
- [ ] **Warning:** Show a pop-up "Warranty Expired" but allow override (maybe require a reason)? -> *Recommended*.
- [ ] **Silent:** Just mark it Red in the backend?

## 2. Notification Strategy
How should we notify the technician/client about upcoming appointments?
- **Push:** Standard App Notifications (Free, but requires internet/permission).
- **WhatsApp:** Direct link to open WhatsApp with a pre-filled message? (High conversion, manual trigger).

## 3. Search Filters
Beyond text search, do you need specific filters?
- [ ] "Show only Warranties"
- [ ] "Show only Pending Payment"
- [ ] "Filter by Date Range" (e.g., Last Month)

## 4. Appointment vs. Equipment (Revisited)
With Warranty validation, linking an Appointment to a specific **Equipment ID** becomes critical.
- Should we force "Select Equipment" during the appointment creation? Or can it be generic ("Visit") and linked later?
