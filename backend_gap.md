# Backend gaps for the frontend

This list was produced while integrating the current frontend with the existing `/api/v1` backend. No backend files were changed.

## Required endpoints that do not exist

| Frontend need | Required endpoint / behaviour |
| --- | --- |
| Restore a soft-deleted visitor | `POST /visitor/:id/restore` (or `PATCH /visitor/:id` with a documented restore action). The UI has a Restore button, but only list and delete endpoints exist. |
| Expected-visitor management | CRUD endpoints such as `/expected-visitors`. This is distinct from pre-registration: the UI needs a date and arrival time for a planned visitor, while `PreRegistration` has no expected time and serves a different workflow. |
| Failed registration/audit log | Read endpoint such as `GET /audit-events?type=FAILED_REGISTRATION`, with server-side recording for face-recognition/check-in failures. The existing Failed Registers tab used browser mock data. |
| System/company settings | `GET/PUT /settings` for company name, photo policy, max visit hours, and automatic checkout. The frontend currently stores only visual/device preferences locally. |
| Admin profile update | `PATCH /auth/me` (name, mobile, designation) and profile-photo upload endpoint. The backend only has `GET /auth/me` and password change. |
| Analytics/reporting | Filterable aggregation endpoint, e.g. `GET /reports?from=&to=`, exposing weekly/monthly totals, departments, purposes, peak hours and recent activity. The frontend derives charts from `GET /visit`; this will not scale and cannot provide an authoritative audit feed. |
| Visitor lookup by identity number | `GET /visitor/search?identityNumber=` or a pre-registration check-in endpoint. The check-in UI needs to locate a pre-registered visitor by identity, but no safe server lookup exists. |
| Pre-registration check-in | A documented endpoint that converts a valid pending pre-registration into a visitor + visit while registering the captured face, or a response field that provides the linked `visitorId`. Without it, a pre-registration without an already-created Visitor cannot use the existing-visitor check-in endpoint. |

## Data required by the current UI but not supplied

| UI field | Current backend status | Needed contract change |
| --- | --- | --- |
| Visitor company/organisation | Not in `Visitor` schema or visitor responses. | Add optional `company` to Visitor and return it. |
| Visitor photo URL | List responses include `registrationImage.filePath`; `VisitorResponseDto` and recognized visitor response do not guarantee a public URL. | Return a documented, browser-accessible `registrationImageUrl`. |
| Visit badge/token | There is no token/badge field. The frontend temporarily displays a shortened visit UUID. | Add a stable `token`/badge number (and printing state if required). |
| Visit badge printed state | Not in backend. | Add `badgePrinted` and, if printing is part of the product, an update/print endpoint. |
| Visit host on all visit responses | `GET /visit` includes `hostEmployee`, but types do not declare it and other responses are inconsistent. | Include `hostEmployee` consistently in a documented Visit response DTO. |
| Visit visitor on all visit responses | `GET /visit` does not include Visitor. | Include a compact visitor object so history/active lists do not need N+1 client requests. |
| Valid expected date/time | Not available in pre-registration. | Add expected arrival date/time if pre-registration is intended to drive the Expected Visitors UI. |
| Recent activity feed | Dashboard repository has this only as commented code. | Return activity entries with type, message, subject and timestamp. |
| Dashboard totals | `/dashboard` returns `totalVisitors` from `getActiveVisitors()` and uses misspelled keys `toatalCheckIns` / `toatalCheckOut`. | Return total non-deleted visitors, active count, `totalCheckIns`, `totalCheckOuts`, and expected/pre-registration totals with stable names. |

## Backend contract issues discovered during integration

- `GET /visitor/active` is registered after `GET /visitor/:id`; therefore `active` is interpreted as an id and the active route is unreachable. Move static routes before parameterized routes.
- `POST /check-in/:visitorId` accepts JSON. The previous frontend incorrectly sent multipart data; it is now sent correctly as JSON.
- `POST /check-in` requires multipart fields `visitor`, `visit`, and `image`; it is now called only for a new visitor.
- `POST /check-out` determines the visitor from the face image and does not accept a selected visit id. The UI now uses this server workflow rather than client-side face comparison.
- Checkout updates `checkOutAt` but does not set `Visit.status` to `CHECKED_OUT`. The frontend treats a non-null `checkOutAt` as checked out so the active-visitor view remains correct; the backend should update both fields.
- `FaceApiResponse.success` emits `messaage` (typo) instead of `message`, so recognition failures cannot display the server message reliably.
- The auth response exposes only id/email/profileImageId. Display name, role, phone and designation used by the profile UI are not supplied.
