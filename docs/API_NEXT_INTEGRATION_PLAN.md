# LaundryGo FE - Next API Integration Plan

Last compacted: 2026-07-06. Scope: frontend only. Continue integration using backend endpoints that already exist; do not edit backend code from this plan and do not add fake API integrations for missing backend controllers.

## Documentation Maintenance Rule

After every completed task, update this handoff before stopping:

- Move completed work into "Done In Latest Phase" with exact files touched.
- Add or update verification commands and results.
- Move unresolved items into "Start Here Next", "Other Next Work", or "Do Not Integrate Until Backend Exists".
- Keep `docs/API.md` as the endpoint contract source, and `docs/API_INTEGRATION_REPORT.md` as the compact handoff summary.
- Do not call a screen fully API-integrated if it still depends on mock data for fields that should come from a missing backend endpoint.

## Added Business Flow Reference

Use this business-flow report when working on order tracking:

```txt
C:\Users\pc\Downloads\bao_cao_vong_doi_don_hang.md
```

Important interpretation:

- Treat the report as the source for order lifecycle behavior and status timeline.
- Treat `docs/API.md` as the source for actual endpoint paths and backend enum names.
- The report mentions old/assumed paths such as `POST /api/v1/orders/from-cart`; current FE/backend cart checkout uses `POST /api/v1/cart/orders`.
- Shipper task endpoints are exposed through `ShipperController` as `/api/v1/shippers/tasks/**`.

Order lifecycle to reflect in customer Track Order:

```txt
Backend enum flow:
PENDING -> CONFIRMED -> PICKING_UP -> AT_STORE -> WASHING -> DRYING -> IRONING -> READY_FOR_PICKUP -> DELIVERING -> COMPLETED

Customer-facing display flow:
Order placed -> Shop confirmed -> Pickup in progress -> Laundrying -> Ready for delivery -> Delivering -> Completed

Display mapping:
AT_STORE, WASHING, DRYING, IRONING => Laundrying
Alternative: PENDING/CONFIRMED -> CANCELLED
Task failure does not currently move the order status; it needs manual/admin handling later.
```

## Done In Latest Phase

```txt
Customer backend cart: DONE
Floating cart widget: DONE
Checkout from backend cart: DONE
Customer Track Order real order detail: DONE
Customer Track Order all-orders list: DONE, using GET /api/v1/orders?page=0&size=50
Customer profile page real profile/summary API: DONE
Payment create-url helper/redirect: DONE, but local backend returns 400
Shop owner order list/detail/status: DONE
Shipper task accept/start/complete: DONE in FE, needs credential for final local UI test
Driver Overview profile/tasks/history: DONE in FE using existing shipper endpoints, with fallback data when API is unavailable
Customer Track Order simplified timeline: DONE in FE; AT_STORE/WASHING/DRYING/IRONING render as one Laundrying customer step
Unsupported-screen honesty pass: PARTIAL DONE in FE for Driver Earnings, Shop Revenue, Shop Incident Report, Shop Staff/Documents/Settings, Admin Finance, Admin Customer, Admin Shipper, Admin Shop, Admin Overview, Admin Analytics, Admin OrderManagement, Admin PromotionManagement, Admin Settings, and Admin Notifications dashboards
```

Changed/important files:

```txt
src/services/cartApi.js
src/services/userApi.js
src/services/paymentApi.js
src/services/shopOwnerOrderApi.js
src/services/driverApi.js
src/AllShops/AllShopsDetail.jsx
src/components/PendingCartWidget.jsx
src/PicanDeli/PicanDeli.jsx
src/ConfirmOrder/ConfirmOrder.jsx
src/Information/UserInformation.jsx
src/TrackOrder/TrackOrder.jsx
src/TrackOrder/TrackOrder.css
src/locales/en.json
src/locales/vi.json
src/DriverDashboard/Tasks/DriverTasks.jsx
src/DriverDashboard/Overview/DriverOverview.jsx
src/DriverDashboard/Earnings/DriverEarnings.jsx
src/DriverDashboard/Earnings/DriverEarnings.css
src/ShopDashboard/OrderManagement/ShopOrderManagement.jsx
src/ShopDashboard/Revenue/ShopRevenue.jsx
src/ShopDashboard/Revenue/ShopRevenue.css
src/ShopDashboard/IncidentReport/ShopIncidentReport.jsx
src/ShopDashboard/IncidentReport/ShopIncidentReport.css
src/ShopDashboard/StaffManagement/ShopStaffManagement.jsx
src/ShopDashboard/StaffManagement/ShopStaffManagement.css
src/ShopDashboard/Documents/ShopDocuments.jsx
src/ShopDashboard/Documents/ShopDocuments.css
src/ShopDashboard/Settings/ShopSettings.jsx
src/ShopDashboard/Settings/ShopSettings.css
src/AdminDashboard/FinanceManagement/AdminFinanceManagement.jsx
src/AdminDashboard/FinanceManagement/AdminFinanceManagement.css
src/AdminDashboard/CustomerManagement/AdminCustomerManagement.jsx
src/AdminDashboard/CustomerManagement/AdminCustomerManagement.css
src/AdminDashboard/ShipperManagement/AdminShipperManagement.jsx
src/AdminDashboard/ShipperManagement/AdminShipperManagement.css
src/AdminDashboard/ShopManagement/AdminShopManagement.jsx
src/AdminDashboard/ShopManagement/AdminShopManagement.css
src/AdminDashboard/Overview/AdminOverview.jsx
src/AdminDashboard/Overview/AdminOverview.css
src/AdminDashboard/Analytics/AdminAnalytics.jsx
src/AdminDashboard/Analytics/AdminAnalytics.css
src/AdminDashboard/OrderManagement/AdminOrderManagement.jsx
src/AdminDashboard/OrderManagement/AdminOrderManagement.css
src/AdminDashboard/PromotionManagement/AdminPromotionManagement.jsx
src/AdminDashboard/PromotionManagement/AdminPromotionManagement.css
src/AdminDashboard/Settings/AdminSettings.jsx
src/AdminDashboard/Settings/AdminSettings.css
src/AdminDashboard/Notifications/AdminNotifications.jsx
src/AdminDashboard/Notifications/AdminNotifications.css
scripts/booking-e2e.mjs
```

## Contract Used

```txt
Cart:
GET/POST/PUT/DELETE /api/v1/cart/**
POST /api/v1/cart/orders

Payment:
GET  /api/v1/payments/{orderId}
POST /api/v1/payments/create-url
POST /api/v1/payments/{orderId}/confirm-cash

Shop owner orders:
GET /api/v1/shop-owner/orders
GET /api/v1/shop-owner/orders/{id}
PUT /api/v1/shop-owner/orders/{id}/status

Shipper:
GET /api/v1/shippers/tasks/today
PUT /api/v1/shippers/tasks/{taskId}/accept
PUT /api/v1/shippers/tasks/{taskId}/status
GET /api/v1/shippers/history
GET /api/v1/shippers/profile

Customer profile:
GET /api/v1/users/profile
GET /api/v1/users/profile/summary
PUT /api/v1/users/profile

Customer orders:
GET /api/v1/orders?page=0&size=20
```

## Verification

Already passed:

```txt
cd D:\EXE\LaundryGo_FE
npx eslint src/services/cartApi.js src/services/paymentApi.js src/services/shopOwnerOrderApi.js src/services/driverApi.js src/AllShops/AllShopsDetail.jsx src/PicanDeli/PicanDeli.jsx src/components/PendingCartWidget.jsx src/ConfirmOrder/ConfirmOrder.jsx src/DriverDashboard/Tasks/DriverTasks.jsx src/DriverDashboard/History/DriverHistory.jsx src/ShopDashboard/OrderManagement/ShopOrderManagement.jsx
npm run build
```

Latest frontend-only update:

```txt
npx eslint src/AdminDashboard/Overview/AdminOverview.jsx src/AdminDashboard/Analytics/AdminAnalytics.jsx src/AdminDashboard/OrderManagement/AdminOrderManagement.jsx src/AdminDashboard/PromotionManagement/AdminPromotionManagement.jsx src/AdminDashboard/Settings/AdminSettings.jsx src/AdminDashboard/Notifications/AdminNotifications.jsx
PASS
npm run build
PASS
Notes: Backend untouched. Admin Overview/Analytics/OrderManagement/PromotionManagement/Settings/Notifications now label presentation/local-only data and avoid fake backend success for unsupported approval, order, promotion, settings, and notification actions.

npx eslint src/ShopDashboard/StaffManagement/ShopStaffManagement.jsx src/ShopDashboard/Documents/ShopDocuments.jsx src/ShopDashboard/Settings/ShopSettings.jsx src/AdminDashboard/CustomerManagement/AdminCustomerManagement.jsx src/AdminDashboard/ShipperManagement/AdminShipperManagement.jsx src/AdminDashboard/ShopManagement/AdminShopManagement.jsx
PASS
Notes: Backend untouched. Shop Staff/Documents/Settings now show browser-only/presentation-data notices. Admin Customer/Shipper/Shop dashboards now label presentation data; complaint resolution, shipper/shop approval, document review, status updates, and payout/payment processing no longer show fake backend success.

npx eslint src/TrackOrder/TrackOrder.jsx src/services/bookingApi.js src/DriverDashboard/Earnings/DriverEarnings.jsx src/ShopDashboard/Revenue/ShopRevenue.jsx src/ShopDashboard/IncidentReport/ShopIncidentReport.jsx src/AdminDashboard/FinanceManagement/AdminFinanceManagement.jsx
PASS

npm run build
PASS

Notes: Backend untouched. Track Order now collapses AT_STORE/WASHING/DRYING/IRONING into one customer-facing Laundrying step with an optional internal status note. Driver Earnings, Shop Revenue, Shop Incident Report, and Admin Finance now clearly label presentation fallback data for missing backend APIs; incident submit and admin payout processing do not show fake backend success.

npx eslint src/DriverDashboard/Overview/DriverOverview.jsx src/services/driverApi.js
PASS
Notes: Driver Overview now calls existing shipper profile/tasks/history APIs. Backend was not changed.

npx eslint src/services/shopOwnerOrderApi.js scripts/booking-e2e.mjs
npx eslint src/TrackOrder/TrackOrder.jsx src/services/bookingApi.js
npm run build
```

Both passed.

Customer profile page real API cleanup:

```txt
npx eslint src/Information/UserInformation.jsx src/services/userApi.js
PASS

npm run build
PASS
Notes: Backend untouched. Profile page now uses existing user profile/profile-summary endpoints through `src/services/userApi.js`, removes the old separate prototype profile cache, validates city/district edits, and routes recent-order tracking with the backend recent order id when present.
```

Latest manual/API results with backend running from IntelliJ:

```txt
Customer CASH E2E: PASS, created LG-000036, track GET /api/v1/orders/36 returned 200.
Shop owner order list: PASS with owner1@laundrygo.com when default statuses are sent.
Shop owner order detail: PASS for /api/v1/shop-owner/orders/000036.
Shop owner UI /shop/orders: PASS, table loaded and detail drawer opened.
Payment create-url: returned 400 locally, so CASH is the stable E2E path.
```

## Start Here Next - Frontend Only

Priority now: finish frontend verification and UI hardening around the real endpoints already wired. Do not add backend endpoints, migrations, controller work, or FE calls to non-existent APIs.

### FE Task 1 - Simplify Customer Tracking Timeline - DONE

Goal: keep backend statuses intact, but show customers a simpler lifecycle. `WASHING`, `DRYING`, and `IRONING` should not be separate customer steps; group them with `AT_STORE` as one `Laundrying` step.

Files to inspect or adjust:

```txt
src/TrackOrder/TrackOrder.jsx
src/TrackOrder/TrackOrder.css
src/services/bookingApi.js
src/locales/en.json
src/locales/vi.json
```

Implementation notes:

```txt
Backend statuses used by this one UI step:
- AT_STORE
- WASHING
- DRYING
- IRONING

Customer label:
- en: Laundrying
- vi: Dang giat ui / Dang xu ly do

Optional note text can mention the internal progress if the backend status is available, but the
timeline should still render one step, not three separate steps.
```

Pass criteria:

```txt
- DONE: Customer Track Order has no separate Washing, Drying, Ironing timeline steps.
- DONE: When backend status is AT_STORE/WASHING/DRYING/IRONING, the active customer step is Laundrying.
- DONE: READY_FOR_PICKUP appears after Laundrying as Ready for delivery.
- DONE: Shop owner internal order management may still show backend statuses if useful for shop operations.
```

### FE Task 2 - Re-verify Customer Order Tracking

Goal: prove the customer path still works after Track Order timeline simplification.

Files to inspect or adjust only if verification exposes a FE issue:

```txt
src/ConfirmOrder/ConfirmOrder.jsx
src/TrackOrder/TrackOrder.jsx
src/TrackOrder/TrackOrder.css
src/services/bookingApi.js
src/services/cartApi.js
src/services/paymentApi.js
scripts/booking-e2e.mjs
```

Manual verification:

1. Run FE with `npm run dev -- --host 127.0.0.1`.
2. With backend already running elsewhere, login customer -> shop detail -> add cart -> schedule -> create CASH order -> confirm -> track.
3. Confirm Track Order displays real order code/id, status, items, total, addresses when returned, and no fake id/time/driver/fee.
4. Refresh Track Order and confirm `readRecentOrder()` only recovers the numeric id; it must not provide display data.
5. Try a missing/invalid order id and confirm the empty/error state is clear and does not render stale previous order content.

Pass criteria:

```txt
- No hardcoded `LG-98234`, fake driver, fake vehicle, fake timeline time, or local cart summary appears.
- Network calls include GET /api/v1/orders/{orderId}.
- `AT_STORE/WASHING/DRYING/IRONING` render as one `Laundrying` step.
- CASH checkout remains the stable happy path while payment create-url returns 400 locally.
```

### FE Task 3 - Verify Shop Owner Status Flow

Goal: verify that shop owner status updates move the customer timeline without adding accept/reject UI that backend does not expose.

Files to inspect or adjust only if needed:

```txt
src/services/shopOwnerOrderApi.js
src/ShopDashboard/OrderManagement/ShopOrderManagement.jsx
```

Manual verification:

1. Login as shop owner.
2. Open `/shop/orders` and load a fresh customer order.
3. Update status using existing backend-supported status endpoint only: `PUT /api/v1/shop-owner/orders/{id}/status`.
4. Move through whatever statuses the current backend allows in your local data.
5. Refresh the customer Track Order page and confirm `WASHING/DRYING/IRONING` still display as `Laundrying`.
6. Confirm UI does not expose accept/reject controls unless backend endpoints are later added.

Pass criteria:

```txt
- List uses GET /api/v1/shop-owner/orders with default statuses.
- Detail uses GET /api/v1/shop-owner/orders/{id}.
- Status update uses PUT /api/v1/shop-owner/orders/{id}/status.
- No FE call is made to /accept, /reject, or machine assign-order endpoints.
```

### FE Task 4 - Verify Shipper Dashboard With Real Credentials

Goal: validate shipper task screens using existing task endpoints once a valid shipper account is available.

Files to inspect or adjust only if needed:

```txt
src/services/driverApi.js
src/DriverDashboard/Tasks/DriverTasks.jsx
src/DriverDashboard/Overview/DriverOverview.jsx
src/DriverDashboard/History/DriverHistory.jsx
```

Manual verification:

1. Login with a valid shipper account.
2. Open `/driver/tasks`; test accept, start, complete, and failed states if tasks exist.
3. Open `/driver/history`; confirm completed/failed task pagination maps from `payload.data.items` or `payload.items`.
4. Open `/driver/overview`; confirm profile, today's tasks, active task, and weekly totals come from profile/tasks/history endpoints.

Pass criteria:

```txt
- Uses GET /api/v1/shippers/profile.
- Uses GET /api/v1/shippers/tasks/today.
- Uses PUT /api/v1/shippers/tasks/{taskId}/accept.
- Uses PUT /api/v1/shippers/tasks/{taskId}/status.
- Uses GET /api/v1/shippers/history.
- Driver earnings UI is not called API-integrated because no earnings endpoint exists.
```

### FE Task 5 - Frontend Cleanup For Missing Backend Areas

Goal: make unsupported screens honest and maintainable without pretending they are integrated.

Allowed FE-only work:

```txt
- Add neutral empty/unavailable states for screens whose backend APIs do not exist.
- Keep mock/demo data clearly isolated as presentation fallback, not API integration.
- Update docs when a screen is intentionally blocked by missing backend.
- Remove or hide controls that call missing endpoints, if any are found.
```

Candidate screens to audit:

```txt
src/DriverDashboard/Earnings/DriverEarnings.jsx - PARTIAL DONE: fallback notice and disabled payout request
src/ShopDashboard/Revenue/ShopRevenue.jsx - PARTIAL DONE: fallback notice
src/ShopDashboard/StaffManagement/ShopStaffManagement.jsx - PARTIAL DONE: browser-only/local preview notice
src/ShopDashboard/Documents/ShopDocuments.jsx - PARTIAL DONE: presentation data notice; download does not pretend backend file storage exists
src/ShopDashboard/Settings/ShopSettings.jsx - PARTIAL DONE: browser-only settings notice; security actions report missing backend endpoints
src/ShopDashboard/IncidentReport/ShopIncidentReport.jsx - PARTIAL DONE: fallback notice; submit does not fake backend success
src/AdminDashboard/FinanceManagement/AdminFinanceManagement.jsx - PARTIAL DONE: fallback notice; payout processing does not fake backend success
src/AdminDashboard/CustomerManagement/AdminCustomerManagement.jsx - PARTIAL DONE: presentation-data notice; complaint resolve does not fake backend success
src/AdminDashboard/ShipperManagement/AdminShipperManagement.jsx - PARTIAL DONE: presentation-data notice; approval/reject/payment processing do not fake backend success
src/AdminDashboard/ShopManagement/AdminShopManagement.jsx - PARTIAL DONE: presentation-data notice; approval/reject/status/document review do not fake backend success
src/AdminDashboard/Overview/AdminOverview.jsx - PARTIAL DONE: presentation-data notice; approval queue no longer shows fake approve/reject success
src/AdminDashboard/Analytics/AdminAnalytics.jsx - PARTIAL DONE: presentation-data notice
src/AdminDashboard/OrderManagement/AdminOrderManagement.jsx - PARTIAL DONE: local preview notice for CRUD changes
src/AdminDashboard/PromotionManagement/AdminPromotionManagement.jsx - PARTIAL DONE: local preview notice for promo CRUD/status changes
src/AdminDashboard/Settings/AdminSettings.jsx - PARTIAL DONE: browser-only notice; security actions report missing backend endpoints
src/AdminDashboard/Notifications/AdminNotifications.jsx - PARTIAL DONE: local preview notice for read/clear actions
```

Do not wire these to real APIs yet:

```txt
Driver earnings/income
Rating/review
Incident/dispute
Admin payouts/finance
Admin dashboards/list management
Shop staff/documents/settings/revenue
Shop owner accept/reject order endpoints
Machine assign-order endpoint
```

### FE Verification Commands

Run after any frontend code changes in the above tasks:

```txt
cd D:\EXE\LaundryGo_FE
npx eslint src/services/cartApi.js src/services/paymentApi.js src/services/shopOwnerOrderApi.js src/services/driverApi.js src/services/bookingApi.js src/ConfirmOrder/ConfirmOrder.jsx src/TrackOrder/TrackOrder.jsx src/DriverDashboard/Tasks/DriverTasks.jsx src/DriverDashboard/Overview/DriverOverview.jsx src/DriverDashboard/History/DriverHistory.jsx src/ShopDashboard/OrderManagement/ShopOrderManagement.jsx
npm run build
```

For manual browser verification, keep backend changes out of scope. If the backend response shape is missing data the UI needs, record it in this document and `docs/API_INTEGRATION_REPORT.md` as a backend gap.

## Recently Completed FE Results

### Remaining Admin Unsupported-Screen Honesty Result

Completed FE-only changes:

```txt
src/AdminDashboard/Overview/AdminOverview.jsx
src/AdminDashboard/Overview/AdminOverview.css
src/AdminDashboard/Analytics/AdminAnalytics.jsx
src/AdminDashboard/Analytics/AdminAnalytics.css
src/AdminDashboard/OrderManagement/AdminOrderManagement.jsx
src/AdminDashboard/OrderManagement/AdminOrderManagement.css
src/AdminDashboard/PromotionManagement/AdminPromotionManagement.jsx
src/AdminDashboard/PromotionManagement/AdminPromotionManagement.css
src/AdminDashboard/Settings/AdminSettings.jsx
src/AdminDashboard/Settings/AdminSettings.css
src/AdminDashboard/Notifications/AdminNotifications.jsx
src/AdminDashboard/Notifications/AdminNotifications.css
docs/API_INTEGRATION_REPORT.md
docs/API_NEXT_INTEGRATION_PLAN.md
```

What changed:

```txt
- Admin Overview and Analytics now label metrics as presentation data because admin dashboard APIs do not exist yet.
- Admin Overview approval/reject actions no longer remove queue items or report fake backend success.
- Admin OrderManagement and PromotionManagement now label CRUD/status changes as local presentation changes.
- Admin Settings now labels preferences as browser-only local state, controls refresh interval through React state, and reports security actions as missing backend endpoints.
- Admin Notifications now labels read/clear changes as local presentation state.
```

Verification:

```txt
cd D:\EXE\LaundryGo_FE
npx eslint src/AdminDashboard/Overview/AdminOverview.jsx src/AdminDashboard/Analytics/AdminAnalytics.jsx src/AdminDashboard/OrderManagement/AdminOrderManagement.jsx src/AdminDashboard/PromotionManagement/AdminPromotionManagement.jsx src/AdminDashboard/Settings/AdminSettings.jsx src/AdminDashboard/Notifications/AdminNotifications.jsx
PASS
npm run build
PASS
```

### Customer Profile API Cleanup Result

Completed FE-only changes:

```txt
src/services/userApi.js
src/Information/UserInformation.jsx
src/locales/en.json
docs/API_INTEGRATION_REPORT.md
docs/API_NEXT_INTEGRATION_PLAN.md
```

What changed:

```txt
- Added a focused user API service for profile get/update and profile summary.
- Removed the separate `exe101-user-information` prototype profile cache from the profile page.
- Kept `localStorage.laundrygo_auth` only as the auth/session display source and sync it after successful profile updates.
- Included city and district in dirty-check, validation, and PUT payload.
- Recent order shortcut now uses the backend summary recent order id/shop id when available instead of a fixed shop route.
```

Verification already run:

```txt
cd D:\EXE\LaundryGo_FE
npx eslint src/Information/UserInformation.jsx src/services/userApi.js
npm run build
```

### Track Order Mock Removal Result

Completed FE-only changes:

```txt
src/TrackOrder/TrackOrder.jsx
src/TrackOrder/TrackOrder.css
src/locales/en.json
src/locales/vi.json
```

What changed:

```txt
- Track Order now loads content from GET /api/v1/orders/{orderId}.
- Removed fake order id #LG-98234, static timeline times, hardcoded currentStep, local cart summary fallback, hardcoded delivery fee, and fake driver/vehicle data.
- readRecentOrder() is only used to recover numeric orderId after refresh; it is not the display data source.
- Timeline maps backend order statuses to the business lifecycle from the order-flow report.
- Driver/route UI only appears when real driver data and route-relevant status exist.
- If backend does not return address or driver fields, UI shows neutral unavailable/unassigned states.
```

Status mapping implemented:

```txt
PENDING: placed only
CONFIRMED: shop confirmed
PICKING_UP: pickup in progress
AT_STORE/WASHING/DRYING/IRONING: laundrying
READY_FOR_PICKUP: ready for delivery
DELIVERING: delivery in progress
COMPLETED: completed
CANCELLED: cancelled terminal state
```

Verification already run:

```txt
cd D:\EXE\LaundryGo_FE
npx eslint src/TrackOrder/TrackOrder.jsx src/services/bookingApi.js
npm run build
```

### Simplified Track Order Timeline And Backend-Gap Notice Result

Completed FE-only changes:

```txt
src/TrackOrder/TrackOrder.jsx
src/TrackOrder/TrackOrder.css
src/locales/en.json
src/locales/vi.json
src/DriverDashboard/Earnings/DriverEarnings.jsx
src/DriverDashboard/Earnings/DriverEarnings.css
src/ShopDashboard/Revenue/ShopRevenue.jsx
src/ShopDashboard/Revenue/ShopRevenue.css
src/ShopDashboard/IncidentReport/ShopIncidentReport.jsx
src/ShopDashboard/IncidentReport/ShopIncidentReport.css
src/AdminDashboard/FinanceManagement/AdminFinanceManagement.jsx
src/AdminDashboard/FinanceManagement/AdminFinanceManagement.css
docs/API_INTEGRATION_REPORT.md
docs/API_NEXT_INTEGRATION_PLAN.md
```

What changed:

```txt
- Customer Track Order timeline now has one Laundrying step for AT_STORE/WASHING/DRYING/IRONING.
- The active Laundrying step can show a small operational-status note from the raw backend status.
- Driver Earnings, Shop Revenue, Shop Incident Report, and Admin Finance clearly label presentation fallback data for missing backend endpoints.
- Shop incident submission no longer creates a local success result that looks backend-persisted.
- Admin payout processing no longer mutates local payout state as if a payout API succeeded.
```

Verification already run:

```txt
cd D:\EXE\LaundryGo_FE
npx eslint src/TrackOrder/TrackOrder.jsx src/services/bookingApi.js src/DriverDashboard/Earnings/DriverEarnings.jsx src/ShopDashboard/Revenue/ShopRevenue.jsx src/ShopDashboard/IncidentReport/ShopIncidentReport.jsx src/AdminDashboard/FinanceManagement/AdminFinanceManagement.jsx
npm run build
```

### Unsupported Shop/Admin Screen Honesty Result

Completed FE-only changes:

```txt
src/ShopDashboard/StaffManagement/ShopStaffManagement.jsx
src/ShopDashboard/StaffManagement/ShopStaffManagement.css
src/ShopDashboard/Documents/ShopDocuments.jsx
src/ShopDashboard/Documents/ShopDocuments.css
src/ShopDashboard/Settings/ShopSettings.jsx
src/ShopDashboard/Settings/ShopSettings.css
src/AdminDashboard/CustomerManagement/AdminCustomerManagement.jsx
src/AdminDashboard/CustomerManagement/AdminCustomerManagement.css
src/AdminDashboard/ShipperManagement/AdminShipperManagement.jsx
src/AdminDashboard/ShipperManagement/AdminShipperManagement.css
src/AdminDashboard/ShopManagement/AdminShopManagement.jsx
src/AdminDashboard/ShopManagement/AdminShopManagement.css
docs/API_INTEGRATION_REPORT.md
docs/API_NEXT_INTEGRATION_PLAN.md
```

What changed:

```txt
- Shop Staff now labels staff CRUD/notes as browser-only local preview data.
- Shop Documents now labels document library data as presentation-only; download no longer increments local state as if backend file storage exists.
- Shop Settings now labels preferences as browser-only and reports security actions as missing backend endpoints.
- Admin Customer now labels dashboard data as presentation-only; complaint resolution no longer shows fake backend success.
- Admin Shipper now labels dashboard/payout data as presentation-only; approve/reject/payment processing no longer mutates state as if backend APIs succeeded.
- Admin Shop now labels dashboard data as presentation-only; shop approval/rejection/status and document review no longer mutate state as if backend APIs succeeded.
```

Verification already run:

```txt
cd D:\EXE\LaundryGo_FE
npx eslint src/ShopDashboard/StaffManagement/ShopStaffManagement.jsx src/ShopDashboard/Documents/ShopDocuments.jsx src/ShopDashboard/Settings/ShopSettings.jsx src/AdminDashboard/CustomerManagement/AdminCustomerManagement.jsx src/AdminDashboard/ShipperManagement/AdminShipperManagement.jsx src/AdminDashboard/ShopManagement/AdminShopManagement.jsx
```
## Do Not Integrate Until Backend Exists

```txt
Driver earnings/income
Rating/review
Incident/dispute
Admin payouts/finance
Admin dashboards/list management
Shop staff/documents/settings/revenue
Shop owner accept/reject order endpoints
Machine assign-order endpoint
```

If a screen needs one of these, record it as backend backlog instead of wiring mock data as if it were real API.
