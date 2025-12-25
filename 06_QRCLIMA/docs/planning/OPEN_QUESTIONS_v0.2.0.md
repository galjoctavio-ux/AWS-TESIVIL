# Open Questions: Agenda Module Refactor (v0.2.0)

## 1. Hierarchy: Address vs. Equipment
When booking a service, do you prioritize the **Location** or the **Unit**?
- **Option A (Location First):** "Visit Mrs. Smith at 123 Main St". (Equipment selected later or on-site). -> *Faster Booking.*
- **Option B (Equipment First):** "Service the Samsung Inverter #999". (Implies location). -> *Better for Maintenance tracking.*

## 2. Base Location (Punto de Partida)
Where does the route calculation start?
- [ ] Fixed Office/Home Address?
- [ ] The Technician's current live location at 8:00 AM?
- [ ] User customizable per day?

## 3. Route Calculation Budget (Google API)
Google Routes API costs money per request. Drag & Drop could trigger hundreds of requests.
- **Strict:** Only calculate when user clicks "Optimize Route"?
- **Hybrid:** Use Linear Distance (free) for UI feedback, and only real API for the final "Navigate" button?
- **All-in:** Pay for real-time traffic accuracy (Higher cost).

## 4. Offline "Route Pill"
If the tech is offline, we can't query Google Maps.
- Is "Linear Distance" (Lineal/Haversine) acceptable for the "Route Pill" status (Green/Red) when offline?

## 5. Continuity Threshold
What travel time is considered "Bad" (Red) for your business?
- Example: "If travel > 60 mins, mark as Red".
