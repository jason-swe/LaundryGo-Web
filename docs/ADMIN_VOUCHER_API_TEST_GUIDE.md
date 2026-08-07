# Admin Voucher API Test Guide

## Flow

1. Log in as an admin account.
2. Verify the JWT is stored in `localStorage.laundrygo_auth`.
3. Call the voucher list API.
4. Open one voucher by ID.
5. Create or update a voucher.
6. Toggle voucher status.
7. Delete the voucher if you are cleaning up after the test.

## Service File

- `src/services/adminApi.js`

## Current Repo Status

- The service file exists.
- At the moment, it is not imported by any UI page yet.
- That means the API is available to call from code, but it is not live in the admin screen until you wire it into a component.

## How To Know It Is Connected

You can confirm it in 3 ways:

1. Search for imports or usages of `adminApi` in `src/`.
2. Open the admin voucher screen and check the browser Network tab.
3. Trigger one action, such as list or toggle, and see whether a request to `/api/v1/admin/vouchers` appears.

If you do not see any request in Network, the UI is still using local/static data only.

## How To Know It Is Working

- `GET /api/v1/admin/vouchers` returns a list without 401/403.
- `POST /api/v1/admin/vouchers` creates a voucher and the new record appears in the returned payload.
- `PATCH /api/v1/admin/vouchers/{id}/toggle` changes the active state.
- Refreshing the page shows the same result again, which proves the backend persisted it.

## Endpoints Covered

- `GET /api/v1/admin/vouchers`
- `GET /api/v1/admin/vouchers/{id}`
- `POST /api/v1/admin/vouchers`
- `PUT /api/v1/admin/vouchers/{id}`
- `DELETE /api/v1/admin/vouchers/{id}`
- `PATCH /api/v1/admin/vouchers/{id}/toggle`

## How To Test In Frontend Code

Import the service and call it from any admin page or temporary debug button:

```js
import {
  getAdminVouchers,
  getAdminVoucherById,
  createAdminVoucher,
  updateAdminVoucher,
  deleteAdminVoucher,
  toggleAdminVoucherStatus,
} from '../services/adminApi'
```

Example flow:

```js
const list = await getAdminVouchers({ page: 0, size: 10 })
const firstVoucher = list?.items?.[0]

if (firstVoucher?.id) {
  await getAdminVoucherById(firstVoucher.id)
  await toggleAdminVoucherStatus(firstVoucher.id)
}
```

## How To Test With curl

Replace `YOUR_TOKEN` with the admin access token.

```bash
curl -X GET "http://localhost:8080/api/v1/admin/vouchers" \
  -H "Authorization: Bearer YOUR_TOKEN"
```

```bash
curl -X GET "http://localhost:8080/api/v1/admin/vouchers/1" \
  -H "Authorization: Bearer YOUR_TOKEN"
```

```bash
curl -X POST "http://localhost:8080/api/v1/admin/vouchers" \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "code": "WELCOME10",
    "description": "Welcome Voucher",
    "discountType": "PERCENTAGE",
    "discountValue": 10,
    "minOrderAmount": 100000,
    "maxDiscountAmount": 50000,
    "maxUsageCount": 100,
    "startDate": "2026-08-01",
    "endDate": "2026-12-31",
    "applicableTo": "all",
    "voucherType": "PLATFORM",
    "active": true
  }'
```

```bash
curl -X PUT "http://localhost:8080/api/v1/admin/vouchers/1" \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "description": "Updated Voucher Name"
  }'
```

```bash
curl -X PATCH "http://localhost:8080/api/v1/admin/vouchers/1/toggle" \
  -H "Authorization: Bearer YOUR_TOKEN"
```

```bash
curl -X DELETE "http://localhost:8080/api/v1/admin/vouchers/1" \
  -H "Authorization: Bearer YOUR_TOKEN"
```

## Expected Result

- `GET` list returns a paginated payload or `data.items`.
- `GET` detail returns one voucher object.
- `POST` creates a voucher and returns the created record.
- `PUT` updates the voucher and returns the updated record.
- `PATCH /toggle` flips the active state.
- `DELETE` removes the voucher.

## Notes

- All calls use the shared authenticated request helper, so the admin token must already be present.
- If the backend returns `data`, the service unwraps it automatically.
- Current backend note: `POST /api/v1/admin/vouchers` is still returning `400 VALIDATION_ERROR` even when the payload matches the OpenAPI schema we inspected from `/api-docs`. The list/detail/toggle flow is connected, but create/update likely needs a backend-side DTO or validation fix.