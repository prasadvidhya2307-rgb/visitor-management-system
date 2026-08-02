# Remaining backend gaps

The core frontend contract is implemented. The following product-level capabilities remain intentionally outstanding:

| Capability | Remaining requirement |
| --- | --- |
| Fully atomic pre-registration check-in | Identity and completion linking are implemented, but new Visitor/Visit creation and the final PreRegistration status update are two consecutive API transactions. A future single backend orchestration endpoint can make the entire cross-service operation atomic. |
| Failed-attempt audit feed | Persist face recognition and workflow failures as audit events and expose a filterable endpoint for the Failed Registers tab. |
| Large-data reporting | Dashboard totals, daily analytics and recent activity are server-side. The full Reports screen still derives extended charts from GET /visit; add a date-filtered reporting endpoint before datasets become large. |
| Profile image removal | Profile image upload/read is supported. Add an explicit DELETE /auth/me/image contract if administrators must remove the stored server image rather than replace it. |
| Automated checkout worker | autoCheckoutHours is stored in settings, but a scheduled worker is required to enforce it automatically. |

No frontend mock visitor, visit, employee, pre-registration, dashboard-stat, profile, or settings data is used as authoritative application data.
