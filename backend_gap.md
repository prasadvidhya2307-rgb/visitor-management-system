# Backend gaps for the frontend

This list is based on the current frontend screens and the `/api/v1` backend routes. No backend code was changed.

## Response fields the UI needs

- **Visitor-list contact details**: `GET /visitor` returns visitors without their `emails` and `mobiles` relations, although the active/history/deleted lists need them for search and display. The single-visitor and recognition responses include them, so the list response should be made consistent.
- **Visitor company**: the check-in and profile UI collect/display a company, but `Visitor` and visitor responses have no `company` field. New-visitor check-in therefore cannot persist it.
- **Expected arrival time**: expected visitors have an `expectedTime` input/display in the UI, while `PreRegistration` only has `validFrom` and `validTo` dates. The frontend uses the date for the existing pre-registration API, but cannot save or display a time of day.
- **Checkout visit status**: the checkout implementation sets `checkOutAt` but does not set the visit `status` to `CHECKED_OUT`. The frontend derives active versus historical visits from `status`, so its lists become incorrect after a checkout.
- **Badge state**: visitor-history exports and displays whether a badge was printed, but visits expose no `badgePrinted` (or badge identifier/print timestamp) field.
- **Registration/check-in photo**: profiles can benefit from a photo URL, but visitor responses expose only a media ID internally; no browser-accessible image URL is returned.
- **Dashboard correction**: `dashboard.totalVisitors` currently reports active visitors, the same value as `activeVisitors`. The dashboard needs a total, non-deleted visitor count (or the field should be renamed to accurately communicate its meaning).

## Required endpoints not currently available

- **Application settings**: `GET /settings` and `PUT /settings` for company name, maximum visit hours, photo requirement, and automatic check-out hours.
- **Safe data reset**: an explicitly protected admin-only reset/purge endpoint, if the Settings “Reset All Data” action is intended to be supported.
- **Restore deleted visitor**: e.g. `POST /visitor/:id/restore`, used by Deleted Visitors.
- **Pre-registered visitor check-in**: e.g. `POST /pre-registrations/:id/check-in`, which should convert the selected pre-registration into the visitor/visit records, preserve the matched scan/photo as appropriate, and mark the pre-registration as `CHECKED_IN`.
- **Manual expected-visitor arrival**: e.g. `POST /pre-registrations/:id/arrive` (or an equivalent check-in flow accepting a pre-registration ID). The UI should not mark an arrival locally because the backend remains the source of truth.
- **Expected visitor time support**: this can be an extension of the pre-registration endpoints rather than a separate endpoint, but it requires a time/datetime field in their request and response.