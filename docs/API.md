# LaundryGo API Quick Contract

Source: backend controllers in `LaundryGo_BE/src/main/java/com/fpt/laundrygo_be/controller`. Last compacted: 2026-07-06.

## Common Rules

- Base URL: `http://localhost:8080`.
- FE helpers: `src/utils/api.js`.
- User profile service: `src/services/userApi.js`.
- Public calls: `apiRequest(path, options)`.
- Auth calls: `authenticatedApiRequest(path, options)`; reads JWT from `localStorage.laundrygo_auth`.
- Most responses use `{ success, message, data, errorCode, timestamp }`.
- Some list endpoints return pagination directly or inside `data`: `{ items, totalElements, totalPages, currentPage, pageSize }`.
- Dates must be `YYYY-MM-DD`; time slots must be backend enums such as `SLOT_09_11`.
- Upload images with `FormData`; do not set JSON `Content-Type`.

Important enums:

```txt
PaymentMethod: CASH, CREDIT_CARD, DEBIT_CARD, BANK_TRANSFER, E_WALLET
PaymentStatus: PENDING, COMPLETED, FAILED, REFUNDED
OrderStatus: PENDING, CONFIRMED, WASHING, DRYING, IRONING, PICKING_UP, AT_STORE, READY_FOR_PICKUP, DELIVERING, COMPLETED, CANCELLED
TaskStatus: ASSIGNED, ACCEPTED, IN_PROGRESS, COMPLETED, FAILED
TaskType: PICKUP, DELIVERY
MachineStatus: AVAILABLE, IN_USE, MAINTENANCE, OUT_OF_ORDER
TimeSlot: SLOT_09_11, SLOT_11_13, SLOT_14_16, SLOT_16_18
```

## Customer Timeline Display Rule

Backend order statuses stay as-is. Frontend customer pages should simplify the visible tracking
steps:

```txt
PENDING -> Order placed
CONFIRMED -> Shop confirmed
PICKING_UP -> Pickup in progress
AT_STORE, WASHING, DRYING, IRONING -> Laundrying
READY_FOR_PICKUP -> Ready for delivery
DELIVERING -> Delivery in progress
COMPLETED -> Completed
CANCELLED -> Cancelled
```

Important: `WASHING`, `DRYING`, and `IRONING` are operational shop statuses. Do not show them as
three separate customer timeline steps. If the UI wants detail text, show it as a note inside the
single `Laundrying` step.

## Auth And User

Public:

```txt
POST /api/v1/auth/register
POST /api/v1/auth/shops/register
POST /api/v1/auth/shippers/register
POST /api/v1/auth/login
POST /api/v1/auth/verify-email
POST /api/v1/auth/resend-otp
POST /api/v1/auth/reactivation-requests
```

Bearer:

```txt
GET  /api/v1/auth/me
POST /api/v1/auth/logout
GET  /api/v1/users/profile
GET  /api/v1/users/profile/summary
PUT  /api/v1/users/profile
```

Security note: `SecurityConfig` may whitelist `/api/v1/auth/reactivation-request` singular, while controller uses `/api/v1/auth/reactivation-requests` plural.

## Public Shops, Services, Images

```txt
GET    /api/v1/shops?page=0&size=8&sort=top-rated&topStar=false&nearby=false&express=false&budget=false&userLat=&userLng=
GET    /api/v1/shops/{shopId}?userLat=&userLng=
GET    /api/v1/shops/{shopId}/service-categories
GET    /api/v1/shops/addresses/{shopId}
POST   /api/v1/shops/addresses
PUT    /api/v1/shops/addresses/{shopId}/update
DELETE /api/v1/shops/addresses/{shopId}/delete
GET    /api/v1/services/{serviceId}
POST   /api/v1/images/shops/{shopId}
GET    /api/v1/images/shops/{shopId}
DELETE /api/v1/images/{imageId}
```

## Customer Booking Flow

Delivery addresses:

```txt
GET    /api/v1/delivery-addresses
POST   /api/v1/delivery-addresses
GET    /api/v1/delivery-addresses/{addressId}
PUT    /api/v1/delivery-addresses/{addressId}
DELETE /api/v1/delivery-addresses/{addressId}
```

Address body:

```json
{
  "receiverName": "Nguyen Van A",
  "phone": "0912345678",
  "addressLine": "123 Le Loi",
  "city": "Ho Chi Minh",
  "district": "District 1",
  "isDefault": true
}
```

Schedules:

```txt
GET /api/v1/schedules/pickup-dates
GET /api/v1/schedules/pickup-slots?pickupDate=YYYY-MM-DD
GET /api/v1/schedules/delivery-dates?pickupDate=YYYY-MM-DD&pickupSlot=SLOT_09_11
GET /api/v1/schedules/delivery-slots?pickupDate=YYYY-MM-DD&pickupSlot=SLOT_09_11&deliveryDate=YYYY-MM-DD
```

Cart:

```txt
GET    /api/v1/cart
POST   /api/v1/cart/items                    body: { serviceId, quantity }
PUT    /api/v1/cart/items/{cartItemId}       body: { quantity }
PUT    /api/v1/cart/services                 body: { cartItemId, serviceId }
DELETE /api/v1/cart/items/{cartItemId}
DELETE /api/v1/cart
POST   /api/v1/cart/items/{cartItemId}/orders
POST   /api/v1/cart/orders
```

Orders:

```txt
POST /api/v1/orders
POST /api/v1/orders/summary
GET  /api/v1/orders?page=0&size=20
GET  /api/v1/orders/payment-methods
GET  /api/v1/orders/{orderId}
PUT  /api/v1/orders/{orderId}
PUT  /api/v1/orders/{orderId}/payment-method
POST /api/v1/orders/{orderId}/cancel
```

Create order body:

```json
{
  "items": [{ "serviceId": 1, "quantity": 1 }],
  "pickupAddressId": 10,
  "deliveryAddressId": 10,
  "pickupDate": "2026-07-05",
  "pickupSlot": "SLOT_09_11",
  "deliveryDate": "2026-07-06",
  "deliverySlot": "SLOT_14_16",
  "paymentMethod": "CREDIT_CARD",
  "specialInstruction": "",
  "note": ""
}
```

Payments:

```txt
GET  /api/v1/payments/{orderId}
POST /api/v1/payments/create-url             body: { orderId }
GET  /api/v1/payments/callback?orderId=&transactionId=&status=
POST /api/v1/payments/{orderId}/confirm-cash
```

Local note: `POST /api/v1/payments/create-url` returned `400` in the latest local test, so E2E uses `CASH` for stable happy path.

## Shop Owner

Orders:

```txt
GET /api/v1/shop-owner/orders?statuses=CONFIRMED&statuses=WASHING&keyword=&page=0&size=10
GET /api/v1/shop-owner/orders/{id}
PUT /api/v1/shop-owner/orders/{id}/status    body: { "newStatus": "READY_FOR_PICKUP" }
```

List response is direct pagination, not the standard wrapper.
Current FE rule: only call the existing status endpoint. Do not assume separate `/accept`,
`/reject`, machine assignment, or backend transition-validation endpoints exist.

Services:

```txt
GET    /api/v1/shop-owner/services/categories
GET    /api/v1/shop-owner/services
POST   /api/v1/shop-owner/services
PUT    /api/v1/shop-owner/services/{serviceId}
PATCH  /api/v1/shop-owner/services/{serviceId}/availability
DELETE /api/v1/shop-owner/services/{serviceId}
```

Machines:

```txt
GET    /api/v1/shop-owner/machines
POST   /api/v1/shop-owner/machines
PUT    /api/v1/shop-owner/machines/{machineId}
DELETE /api/v1/shop-owner/machines/{machineId}
```

Inventory:

```txt
GET    /api/v1/shop-owner/inventory
POST   /api/v1/shop-owner/inventory
PUT    /api/v1/shop-owner/inventory/{itemId}
DELETE /api/v1/shop-owner/inventory/{itemId}
```

## Shipper

```txt
GET /api/v1/shippers/profile
GET /api/v1/shippers/tasks/today?status=&keyword=&page=0&size=20
PUT /api/v1/shippers/tasks/{taskId}/accept
PUT /api/v1/shippers/tasks/{taskId}/status   body: { "status": "IN_PROGRESS" }
GET /api/v1/shippers/history?status=&keyword=&page=0&size=20
```

FE must map pagination as:

```js
const page = payload?.data ?? payload ?? {}
const tasks = page.items ?? []
```

## Admin

```txt
DELETE /api/v1/admin/accounts/{accountId}
POST   /api/v1/admin/accounts/{accountId}/reactivate
```

`accountId` is UUID.

## Backend Gaps Still Blocking Real API Work

- Driver earnings/income endpoints.
- Rating/review controller.
- Incident/dispute controllers.
- Admin payouts/finance APIs.
- Admin customer/shop/order dashboards.
- Shop revenue/staff/documents/settings APIs.
- Shop order accept/reject endpoints.
- Machine assign-order endpoint.
