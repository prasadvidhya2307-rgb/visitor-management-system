# Backend changes and frontend contract

## Database changes

- Visitor now has optional `company`.
- Visit now has `checkInImageId` and `checkOutImageId`, each linked to Media.
- Added singleton `SystemSetting` storage for company name, visit-hour limits, photo policy and auto-checkout hours.
- Added migration `20260803120000_add_frontend_contract_fields`. Deploy it with the normal Prisma migration command before starting the updated backend.

## Check-in and checkout contract

- New visitor: `POST /api/v1/check-in`, multipart fields `visitor` (JSON), `visit` (JSON), and `image`. The captured image becomes the visitor registration image and that visit's check-in image.
- Existing visitor with captured image: `POST /api/v1/check-in/with-image/:visitorId`, multipart fields `visit` (JSON) and `image`. This preserves the original JSON `POST /check-in/:visitorId` endpoint for compatibility.
- Checkout: `POST /api/v1/check-out`, multipart field `image`. A successful match stores the image on the checked-out Visit, sets `checkOutAt`, sets status to `CHECKED_OUT`, and deactivates the visitor.
- Successful check-in responses are `{ visitor, visit }`. The UI displays `visit.id`, `visit.status`, and `visitor.visitorCode`.

## Visitor and visit contract

- Visitor create/update accepts optional `company`.
- Visit list/detail responses include host, visitor, check-in media and checkout media metadata.
- The frontend uses `visitor.visitorCode` as the badge/token; Visit UUIDs are not presented as tokens.
- Visitor History shows one row per visitor. Opening it shows complete visitor data and visit count. Opening a visit shows visit fields plus protected check-in/check-out images.
- Visitor lists exclude soft-deleted visitors. History refreshes when tabs change, so delete/restore operations are reflected without stale visitor rows.

## Protected media

- `GET /api/v1/media/:id` returns the authenticated media binary with its stored MIME type.
- The frontend requests media with the bearer token and creates temporary browser object URLs. Files are not exposed as a public static directory.
- `GET /api/v1/media` returns the complete read-only inventory with visitor, admin profile, check-in Visit and checkout Visit relations. Media deletion is intentionally not exposed.
- Media `fileSize` values are serialized as strings so Prisma BigInt values are safe in JSON responses.

## Printable visitor token

- Visit now persists `badgePrinted` and `badgePrintedAt`.
- `POST /api/v1/visit/:visitId/mark-printed` records token printing.
- `GET /api/v1/visit/public/:visitId` is the QR target and returns the visit, visitor, host and media metadata without requiring the receptionist session.
- The successful check-in screen builds a printable token containing the captured image, visitorCode, visitor identity/company, visit ID/status, host, purpose, check-in time and QR code.

## Admin profile

- `GET /api/v1/auth/me` returns id, email, fullName, designation, mobile and profileImageId.
- `PATCH /api/v1/auth/me` updates fullName, designation and mobile.
- `PUT /api/v1/auth/me/image` accepts multipart `image`, stores it as Media and updates profileImageId.
- `PUT /api/v1/auth/change-password` retains the existing password-change contract.

## Settings

- `GET /api/v1/settings` returns the singleton settings record.
- `PUT /api/v1/settings` requires `companyName`, `maxVisitHours`, `requirePhoto`, and `autoCheckoutHours`.
- Settings are now server-managed; theme remains a device preference.

## Dashboard and analytics

- `GET /api/v1/dashboard` now returns stable `stats` keys: totalVisitors, todayCheckIns, checkedOutToday, activeVisitors and expectedToday.
- It also returns seven-day daily check-in/out series and recent activity with visitor, host, type and timestamp.
- Aggregations execute on the backend instead of requiring the dashboard to infer authoritative totals from browser mock data.

## Other fixes

- Static visitor routes are registered before `/:id`.
- Existing visitor check-in reactivates the visitor and updates lastVisitedAt.
- Checkout updates both timestamp and enum status.
- Visitor list responses include email/mobile data.
- Added visitor restore endpoint `POST /api/v1/visitor/:id/restore`.
- Fixed face API success response key from `messaage` to `message`.
- Frontend validation errors now show field-specific backend messages in user-friendly toasts.
- Fixed existing-visitor multipart validation by validating the parsed `visit` object rather than its wrapper.
- Pre-registration now stores optional identity type/number and successful pre-registered check-in links the Visitor and changes status to `CHECKED_IN` with `checkedInAt`.
- Employee profile images are optional and upload through `PUT /api/v1/employee/:employeeId/image`.
- Media Library is grouped into visitor, visit, admin and employee media; cards navigate to the linked visitor or visit and never expose deletion.
