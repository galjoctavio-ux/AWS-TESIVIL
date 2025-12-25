# Open Questions: Agenda Module Refactor (v0.3.0)

## 1. Appointment vs. Equipment Model
How do you want to handle multiple units in one visit?
- **Option A (One-to-One):** One Appointment = One Unit. (Need to duplicate appointments for multi-unit jobs).
- **Option B (One-to-Many):** One Appointment = List of Units. (Complex UI, but better analytics).

## 2. Time Selector UI Feedback
Where exactly should the "Distance Feedback" appear?
- [ ] Inside the Time Picker Modal?
- [ ] As a floating badge next to the "Start Time" input field?
- [ ] A dedicated "Efficiency Bar" at the bottom of the screen?

## 3. Cancelled Appointments
If job B is cancelled in a sequence A -> B -> C:
- The distance is recalculated as A -> C.
- **Question:** Do we notify the user if A -> C becomes "Red" (Too far)? or just silently update the indicator?
