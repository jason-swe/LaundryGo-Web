# LaundryGo API Integration Handoff

Last compacted: 2026-07-06. This file is intentionally short for Codex context. Detailed endpoint contract lives in `docs/API.md`.

## Current Integrated Areas

```txt
Customer:
- Auth login/register/logout, verify email, resend OTP.
- User profile page now reads/writes `/api/v1/users/profile` and reads `/api/v1/users/profile/summary`.
- Public shop list/detail/service categories.
- Backend cart as source of truth.
- Booking: delivery address, schedule, order summary, create order.
- Confirm/track using real order response and GET /api/v1/orders/{orderId}.
- Track Order now loads the customer's order list from GET /api/v1/orders?page=0&size=50 and lets the user switch between placed orders.
- Track Order mock data removed; timeline and summary now render from backend order detail.
- Payment helper and redirect attempt for card/wallet.

Shop owner:
- Operations: service categories, services, machines, inventory.
- Orders: list/detail/status update through /api/v1/shop-owner/orders.

Shipper:
- Profile.
- Today tasks and history.
- Accept/start/complete task actions.
- Driver Overview uses real profile/tasks/history APIs with fallback data only when the API is unavailable.

Admin:
- Only account delete/reactivate exists in backend contract.
```

## Key FE Files

```txt
src/utils/api.js
src/utils/auth.js
src/services/userApi.js
src/services/bookingApi.js
src/services/cartApi.js
src/services/paymentApi.js
src/services/shopOwnerApi.js
src/services/shopOwnerOrderApi.js
src/services/driverApi.js
src/components/PendingCartWidget.jsx
src/Information/UserInformation.jsx
src/AllShops/AllShopsDetail.jsx
src/PicanDeli/PicanDeli.jsx
src/ConfirmOrder/ConfirmOrder.jsx
src/TrackOrder/TrackOrder.jsx
src/ShopDashboard/Operations/ShopOperations.jsx
src/ShopDashboard/OrderManagement/ShopOrderManagement.jsx
src/DriverDashboard/Tasks/DriverTasks.jsx
src/DriverDashboard/Overview/DriverOverview.jsx
src/DriverDashboard/History/DriverHistory.jsx
```

## Important Mapping Notes

- Cart item must include real `serviceId`; old local carts without it should be rejected and user asked to reselect service.
- Customer cart flow now uses backend cart, not `localStorage.laundrygo_pending_cart`, though `pendingCart.js` remains for legacy imports.
- Create order from schedule uses `POST /api/v1/cart/orders` when checking out the full backend cart.
- Payment UI mapping: card -> `CREDIT_CARD`, wallet -> `E_WALLET`, cash/COD -> `CASH`.
- Shop owner order list should send backend status enums by default; empty filter can be problematic.
- Shop owner order list response is direct pagination, not `{ success, data }`.
- Shop owner status update uses only the existing `/status` endpoint. Do not assume `/accept`, `/reject`, machine assignment, or backend transition-validation endpoints exist.
- Shipper tasks/history response should be read from `payload.data.items` or fallback `payload.items`.
- Driver Overview should derive live dashboard data from existing shipper profile/tasks/history endpoints; do not assume a driver earnings endpoint until backend exposes one.
- All authenticated endpoints require a real backend JWT; demo token branches were removed.
- Customer profile page no longer stores a separate prototype profile in `localStorage`; `localStorage.laundrygo_auth` is only kept in sync for navbar/session display after profile updates.
- Track Order should not use fake order id, fake timeline time, fake driver, local cart summary, or hardcoded delivery fee. It may use `readRecentOrder()` only to recover numeric `orderId` after refresh.
- Track Order should map backend lifecycle to a simplified customer timeline. `AT_STORE`, `WASHING`, `DRYING`, and `IRONING` all display as one customer-facing step: `Laundrying`. `CANCELLED` is terminal.
- Unsupported finance/incident/earnings/admin/shop-ops screens must clearly say when they are using presentation fallback data. Do not report driver earnings, shop revenue, shop incidents, shop staff/documents/settings, or admin customer/shipper/shop/finance dashboards as API-integrated until backend endpoints exist.

## Latest Verified Results

```txt
Admin remaining unsupported-screen honesty pass:
- PASS targeted ESLint for `src/AdminDashboard/Overview/AdminOverview.jsx`, `src/AdminDashboard/Analytics/AdminAnalytics.jsx`, `src/AdminDashboard/OrderManagement/AdminOrderManagement.jsx`, `src/AdminDashboard/PromotionManagement/AdminPromotionManagement.jsx`, `src/AdminDashboard/Settings/AdminSettings.jsx`, and `src/AdminDashboard/Notifications/AdminNotifications.jsx`
- PASS `npm run build`
- Backend untouched.
- Admin Overview/Analytics now label dashboard metrics as presentation data.
- Admin Overview approval queue no longer removes items or shows fake approve/reject backend success.
- Admin OrderManagement and PromotionManagement label CRUD/status edits as local presentation data.
- Admin Settings labels preferences as browser-only local state; security actions report missing backend endpoints.
- Admin Notifications labels read/clear actions as local presentation state.

Targeted ESLint: PASS
npm run build: PASS

Frontend-only timeline and unsupported-screen cleanup:
- PASS targeted ESLint for `src/TrackOrder/TrackOrder.jsx`, `src/services/bookingApi.js`, `src/DriverDashboard/Earnings/DriverEarnings.jsx`, `src/ShopDashboard/Revenue/ShopRevenue.jsx`, `src/ShopDashboard/IncidentReport/ShopIncidentReport.jsx`, and `src/AdminDashboard/FinanceManagement/AdminFinanceManagement.jsx`
- PASS `npm run build`
- Customer Track Order now renders `AT_STORE/WASHING/DRYING/IRONING` as one `Laundrying` step with an optional operational note.
- Driver Earnings, Shop Revenue, Shop Incident Report, and Admin Finance now show honest fallback/API-unavailable notices. Incident submit and admin payout processing no longer show fake backend success.

Unsupported shop/admin screen honesty pass:
- PASS targeted ESLint for `src/ShopDashboard/StaffManagement/ShopStaffManagement.jsx`, `src/ShopDashboard/Documents/ShopDocuments.jsx`, `src/ShopDashboard/Settings/ShopSettings.jsx`, `src/AdminDashboard/CustomerManagement/AdminCustomerManagement.jsx`, `src/AdminDashboard/ShipperManagement/AdminShipperManagement.jsx`, and `src/AdminDashboard/ShopManagement/AdminShopManagement.jsx`
- Backend untouched.
- Shop Staff/Documents/Settings now label browser-only or presentation-only data.
- Admin Customer/Shipper/Shop dashboards now label presentation data; complaint resolution, shipper/shop approval, document review, status updates, and payout/payment processing no longer show fake backend success.

Driver Overview frontend-only API wiring:
- PASS targeted ESLint for `src/DriverDashboard/Overview/DriverOverview.jsx` and `src/services/driverApi.js`
- PASS `npm run build`
- Backend untouched; overview uses existing `/api/v1/shippers/profile`, `/api/v1/shippers/tasks/today`, and `/api/v1/shippers/history`

Track Order mock removal:
- PASS targeted ESLint for `src/TrackOrder/TrackOrder.jsx` and `src/services/bookingApi.js`
- PASS `npm run build`
- Not yet manually re-tested with backend/browser after this specific Track Order cleanup

Customer profile page real API cleanup:
- PASS targeted ESLint for `src/Information/UserInformation.jsx` and `src/services/userApi.js`
- PASS `npm run build`
- Backend untouched; profile screen uses existing user profile and profile summary endpoints

Customer CASH E2E with backend from IntelliJ:
- PASS
- Created order LG-000036
- Track called GET /api/v1/orders/36 and got 200

Shop owner order API/UI:
- PASS with owner1@laundrygo.com
- List API returned 200 when statuses were sent
- Detail for order 000036 returned 200
- /shop/orders loaded table and opened detail drawer

Payment create-url:
- Returned 400 in current local environment
- Use CASH for stable local E2E unless payment config is fixed
```

Useful verify commands:

```txt
cd D:\EXE\LaundryGo_FE
npx eslint src/services/cartApi.js src/services/paymentApi.js src/services/shopOwnerOrderApi.js src/services/driverApi.js src/AllShops/AllShopsDetail.jsx src/PicanDeli/PicanDeli.jsx src/components/PendingCartWidget.jsx src/ConfirmOrder/ConfirmOrder.jsx src/DriverDashboard/Tasks/DriverTasks.jsx src/DriverDashboard/History/DriverHistory.jsx src/ShopDashboard/OrderManagement/ShopOrderManagement.jsx
npx eslint src/TrackOrder/TrackOrder.jsx src/services/bookingApi.js
npx eslint src/TrackOrder/TrackOrder.jsx src/services/bookingApi.js src/DriverDashboard/Earnings/DriverEarnings.jsx src/ShopDashboard/Revenue/ShopRevenue.jsx src/ShopDashboard/IncidentReport/ShopIncidentReport.jsx src/AdminDashboard/FinanceManagement/AdminFinanceManagement.jsx
npm run build
```

## Known Blockers

- Backend local needs IntelliJ/run config or DB env; plain terminal did not have `DB_USERNAME` and `DB_PASSWORD`.
- Shipper UI/API was not fully verified because no valid local shipper credentials were found. Tried likely seeded accounts such as `ship01@laundrygo.com`, `ship1@laundrygo.com`, `shipper1@laundrygo.com`, `driver1@laundrygo.com`.
- Payment gateway create-url returned `400` locally.
- Backend does not yet expose driver earnings, ratings, incidents, payouts, admin dashboards, shop staff/documents/settings/revenue.

## Next Recommended Work

Frontend-only next pass:

1. Re-run customer CASH E2E with real backend already running: login -> shop detail -> add cart -> schedule -> CASH order -> confirm -> track, and confirm Track Order has no fake order id/time/driver/fee.
2. Re-test shop owner `/shop/orders` status transitions with a fresh order and confirm customer Track Order timeline updates.
3. Get or seed a valid shipper account outside this FE plan, then verify `/driver/tasks`, `/driver/history`, and `/driver/overview` against existing shipper endpoints.
4. Re-run targeted ESLint/build after the latest admin unsupported-screen honesty pass, then visually smoke-test the admin dashboard tabs.
5. Test card/wallet only after payment create-url config no longer returns `400`.
