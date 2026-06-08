# LaundryGo Session Handoff

Last updated: 2026-06-08

## Current Goal

Complete the MVP user booking flow for LaundryGo.

The user wants the booking flow only for normal users, not shop-owner/admin/shipper scope:

1. Browse shops.
2. Open shop detail.
3. Select laundry services.
4. Choose pickup/delivery addresses and schedule slots.
5. Choose payment method.
6. Create order.
7. Show confirmation and tracking.

## Important Project Docs

Read these first in a new session:

1. `claude.md` - product requirements and current implementation map.
2. `design.md` - visual/UI rules for user booking pages.
3. `api.md` - API contracts provided by the user.
4. `SESSION_HANDOFF.md` - this file.

## What Has Been Implemented

### Auth Flow

Auth backend integration is already connected.

Main file:

- `src/utils/auth.js`

Connected endpoints:

- `POST /api/v1/auth/login`
- `POST /api/v1/auth/logout`
- `POST /api/v1/auth/register`
- `POST /api/v1/auth/shops/register`
- `POST /api/v1/auth/verify-email`
- `POST /api/v1/auth/resend-otp`
- `GET /api/v1/auth/me`

Storage:

- Auth token/account is stored in `localStorage` key `laundrygo_auth`.

### Booking Phase 1

Booking Phase 1 is implemented.

New API client:

- `src/utils/bookingApi.js`

Connected endpoints:

- `GET /api/v1/shops`
- `GET /api/v1/shops/{shopId}`
- `GET /api/v1/shops/{shopId}/service-categories`
- `GET /api/v1/services/{serviceId}` helper exists but is not actively required by UI yet.

Updated pages:

- `src/AllShops/AllShops.jsx`
- `src/AllShops/AllShops.css`
- `src/AllShops/AllShopsDetail.jsx`
- `src/AllShops/AllShopsDetail.css`
- `src/PicanDeli/PicanDeli.jsx`
- `src/locales/en.json`
- `src/locales/vi.json`

Behavior:

- `/all-shops` fetches real shop list from backend.
- It sends `page`, `size`, `sort`, `topStar`, `nearby`, `express`, and `budget` query params.
- It keeps local mock fallback if the API is down or returns unusable data.
- It has skeleton loading.
- `/all-shops/:id` fetches real shop detail and real service categories.
- Service categories render dynamically from backend response.
- If detail/service API fails, mock fallback still keeps the page usable.
- Fallback note is localized through `shops.apiFallback` and `shopDetail.apiFallback`.

Important bug already fixed:

- API list can route to `/all-shops/2`, but old mock data uses ids like `AS-002`.
- Detail page now matches by exact id or trailing numeric id.
- Clicking a shop also stores the selected shop in `sessionStorage` key `laundrygo_selected_shop`.

Pending cart:

- Prototype cart remains in `localStorage` key `laundrygo_pending_cart`.
- Cart entries now preserve backend fields when available:
  - `serviceId`
  - `serviceName`
  - `serviceUnit`
  - `price`
  - `pricingType`
  - `count`

This is needed for creating backend orders later.

## What Is Not Implemented Yet

Booking Phase 2 and Phase 3 are not done.

Schedule page still uses local prototype data for:

- Addresses
- Pickup dates
- Pickup slots
- Delivery dates
- Delivery slots
- Payment methods

Confirm and track pages still use local route state/prototype data.

No real backend order is created yet.

## Next Phase To Implement

### Phase 2: Connect Schedule Data

Update `src/PicanDeli/PicanDeli.jsx` to use real APIs while preserving prototype fallback.

Endpoints to connect:

- `GET /api/v1/delivery-addresses`
- `POST /api/v1/delivery-addresses`
- `GET /api/v1/orders/payment-methods`
- `GET /api/v1/schedules/pickup-dates`
- `GET /api/v1/schedules/pickup-slots?pickupDate=YYYY-MM-DD`
- `GET /api/v1/schedules/delivery-dates?pickupDate=YYYY-MM-DD&pickupSlot=SLOT_09_11`
- `GET /api/v1/schedules/delivery-slots?pickupDate=YYYY-MM-DD&pickupSlot=SLOT_09_11&deliveryDate=YYYY-MM-DD`

Expected UI behavior:

- Load saved delivery addresses after login.
- If no address exists, allow adding one through `POST /api/v1/delivery-addresses`.
- Show pickup dates from backend.
- When pickup date changes, reload pickup slots.
- When pickup date/slot changes, reload delivery dates.
- When delivery date changes, reload delivery slots.
- Load payment methods from backend.
- Keep fallback data if API fails.
- Keep confirm button disabled until cart, address, pickup slot, and delivery slot are all valid.

### Phase 3: Create Order

After Phase 2, connect:

- `POST /api/v1/orders/summary`
- `POST /api/v1/orders`
- `GET /api/v1/orders/{orderId}`

Important contract issue:

- Swagger screenshot for `POST /api/v1/orders` currently shows only single service fields:
  - `serviceId`
  - `quantity`
- UI supports multiple selected services.
- User said to temporarily leave this and fix later.

Recommended MVP behavior:

1. Try multi-service shape only if backend confirms it supports `items[]`.
2. Otherwise, send the first selected service as:

```json
{
  "serviceId": 0,
  "quantity": 1,
  "pickupAddressId": 0,
  "deliveryAddressId": 0,
  "pickupDate": "2026-06-08",
  "pickupSlot": "SLOT_09_11",
  "deliveryDate": "2026-06-08",
  "deliverySlot": "SLOT_09_11",
  "paymentMethod": "CASH",
  "specialInstruction": "string",
  "note": "string"
}
```

Store created order in localStorage so confirm/track can survive refresh.

Suggested key:

- `laundrygo_last_order`

## Verification Already Run

After Booking Phase 1:

```txt
npx eslint src\utils\bookingApi.js src\AllShops\AllShops.jsx src\AllShops\AllShopsDetail.jsx src\PicanDeli\PicanDeli.jsx
npm run build
```

Both passed.

After fixing `/all-shops/2` not found:

```txt
npx eslint src\AllShops\AllShops.jsx src\AllShops\AllShopsDetail.jsx
npm run build
```

Both passed.

Known build note:

- Vite warns that some chunks are larger than 500 kB. This is not a functional failure.

Known full lint note:

- Full `npm run lint` may still fail due unrelated older lint issues outside the current booking scope. Prefer scoped lint for files changed unless the user asks for full-project cleanup.

## Local Dev Server

Dev server was started at:

```txt
http://127.0.0.1:5173
```

User also accesses:

```txt
http://localhost:5173
```

## Design Rules To Preserve

- Use `UserNavbar` on user-facing pages.
- Keep EN/VI i18n. Do not hardcode visible UI text.
- Use skeleton loaders, not circular spinners.
- Keep API fallback paths during MVP.
- Do not remove mock fallback until backend data is stable.
- Use the existing blue-white LaundryGo visual language from `design.md`.
- Avoid landing-page style hero sections on booking task pages.

## Current Best Next Step

Implement Phase 2 in `src/PicanDeli/PicanDeli.jsx`:

1. Extend `src/utils/bookingApi.js` with address, schedule, and payment methods APIs.
2. Normalize API dates/slots/addresses/payment methods.
3. Replace hardcoded `ADDRESS_PRESETS` and `ALL_TIME_SLOTS` with API data plus fallback.
4. Keep the current UI layout, only connect data and add loading/error states.
5. Run scoped lint and build.
