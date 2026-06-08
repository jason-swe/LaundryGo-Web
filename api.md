# LaundryGo API Notes

This file summarizes the API contracts shared so far for the frontend integration.

Base URL in FE:

```txt
VITE_API_BASE_URL or http://localhost:8080
```

Common response envelope:

```json
{
  "success": true,
  "message": "string",
  "data": {},
  "errorCode": "string",
  "timestamp": "2026-06-08T11:52:55.112Z"
}
```

Protected endpoints require:

```txt
Authorization: Bearer <accessToken>
```

---

## Auth Controller

### POST `/api/v1/auth/login`

Request:

```json
{
  "email": "string",
  "password": "string"
}
```

Response data:

```json
{
  "accessToken": "string",
  "refreshToken": "string",
  "token": "string",
  "account": {
    "accountId": "3fa85f64-5717-4562-b3fc-2c963f66afa6",
    "role": "string",
    "fullName": "string",
    "email": "string",
    "phone": "string",
    "status": "ACTIVE"
  }
}
```

Notes:
- FE currently accepts either token string or object response.
- FE calls `/api/v1/auth/me` after login to normalize account role/profile.

### GET `/api/v1/auth/me`

Response data:

```json
{
  "accountId": "3fa85f64-5717-4562-b3fc-2c963f66afa6",
  "role": "string",
  "fullName": "string",
  "email": "string",
  "phone": "string",
  "status": "ACTIVE"
}
```

### POST `/api/v1/auth/register`

Customer registration.

Request:

```json
{
  "email": "string",
  "password": "string",
  "fullName": "string",
  "phoneNumber": "+84556327261"
}
```

Response data:

```json
{
  "id": "3fa85f64-5717-4562-b3fc-2c963f66afa6",
  "email": "string",
  "fullName": "string",
  "role": "string",
  "status": "ACTIVE",
  "createdAt": "2026-06-08T10:59:04.648Z"
}
```

### POST `/api/v1/auth/shops/register`

Shop registration.

Request:

```json
{
  "fullName": "string",
  "email": "string",
  "password": "string",
  "phoneNumber": "0171741867",
  "shopName": "string",
  "description": "string"
}
```

Response data:

```json
{
  "id": 0,
  "accountId": "3fa85f64-5717-4562-b3fc-2c963f66afa6",
  "name": "string",
  "description": "string",
  "status": "PENDING_APPROVAL"
}
```

### POST `/api/v1/auth/shippers/register`

Shipper registration.

Request includes:

```json
{
  "email": "string",
  "password": "string",
  "fullName": "string",
  "phoneNumber": "+84652660617",
  "dateOfBirth": "2026-06-08",
  "gender": "string",
  "address": "string",
  "identityCardNumber": "string",
  "identityCardFrontUrl": "string",
  "identityCardBackUrl": "string",
  "licenseNumber": "string",
  "licenseUrl": "string",
  "driverUrl": "string",
  "emergencyName": "string",
  "emergencyPhone": "+84442907049",
  "bankAccount": {
    "bank": "string",
    "account": "string",
    "name": "string"
  }
}
```

Notes:
- Not needed for MVP user booking.

### POST `/api/v1/auth/verify-email`

Request:

```json
{
  "email": "string",
  "otp": "348355"
}
```

Response data:

```json
"string"
```

### POST `/api/v1/auth/resend-otp`

Request:

```json
{
  "email": "string"
}
```

Response data:

```json
"string"
```

### POST `/api/v1/auth/logout`

No request body.

Response data:

```json
"string"
```

### POST `/api/v1/auth/reactivation-requests`

Request:

```json
{
  "email": "string",
  "reason": "string"
}
```

Response data:

```json
{
  "id": 0,
  "accountId": "3fa85f64-5717-4562-b3fc-2c963f66afa6",
  "email": "string",
  "description": "string",
  "status": "PENDING",
  "createdAt": "2026-06-08T10:59:15.775Z"
}
```

---

## Shop Controller

### GET `/api/v1/shops`

Query parameters:

```txt
page: integer
size: integer
sort: string
topStar: boolean
nearby: number
express: integer
budget: number
userLat: number
userLng: number
```

Response data:

```json
{
  "items": [
    {
      "id": 0,
      "name": "string",
      "imageUrl": "string",
      "rating": 0.1,
      "startingPrice": 0,
      "distanceKm": 0.1,
      "deliveryHours": 0,
      "deliveryLabel": "string"
    }
  ],
  "totalElements": 0,
  "totalPages": 0,
  "currentPage": 0,
  "pageSize": 0
}
```

### GET `/api/v1/shops/{shopId}`

Path:

```txt
shopId: integer
```

Query parameters:

```txt
userLat: number
userLng: number
```

Response data:

```json
{
  "id": 0,
  "name": "string",
  "rating": 0.1,
  "address": "string",
  "distance": "string",
  "turnaround": "string",
  "hours": {
    "additionalProp1": "string",
    "additionalProp2": "string",
    "additionalProp3": "string"
  },
  "image": "string"
}
```

### GET `/api/v1/shops/{shopId}/service-categories`

Path:

```txt
shopId: integer
```

Response data:

```json
[
  {
    "id": 0,
    "name": "string",
    "services": [
      {
        "id": 0,
        "description": "string",
        "price": 0,
        "serviceName": "string",
        "serviceCategoryId": 0,
        "categoryName": "string",
        "minOrder": 0,
        "pricingType": "string",
        "estimatedTime": "string",
        "available": true,
        "createdAt": "2026-06-08T11:47:03.667Z",
        "updatedAt": "2026-06-08T11:47:03.667Z"
      }
    ]
  }
]
```

### GET `/api/v1/shops/addresses/{shopId}`

Response data:

```json
{
  "id": 0,
  "shopId": 0,
  "street": "string",
  "ward": "string",
  "district": "string",
  "city": "string",
  "postalCode": "string",
  "latitude": 0.1,
  "longitude": 0.1
}
```

### POST `/api/v1/shops/addresses`

Shop address management. Not needed for MVP user booking.

Request:

```json
{
  "street": "string",
  "ward": "string",
  "district": "string",
  "city": "string",
  "postalCode": "string",
  "latitude": "string",
  "longitude": "string",
  "shopID": "string"
}
```

### PUT `/api/v1/shops/addresses/{shopId}/update`

Shop address management. Not needed for MVP user booking.

### DELETE `/api/v1/shops/addresses/{shopId}/delete`

Shop address management. Not needed for MVP user booking.

---

## Service Controller

### GET `/api/v1/services/{serviceId}`

Path:

```txt
serviceId: integer
```

Response data:

```json
{
  "id": 0,
  "description": "string",
  "price": 0,
  "serviceName": "string",
  "serviceCategoryId": 0,
  "categoryName": "string",
  "minOrder": 0,
  "pricingType": "string",
  "estimatedTime": "string",
  "available": true,
  "createdAt": "2026-06-08T11:44:02.263Z",
  "updatedAt": "2026-06-08T11:44:02.263Z"
}
```

---

## Delivery Address Controller

### GET `/api/v1/delivery-addresses`

Response data:

```json
[
  {
    "id": 0,
    "accountId": "3fa85f64-5717-4562-b3fc-2c963f66afa6",
    "receiverName": "string",
    "phone": "string",
    "addressLine": "string",
    "city": "string",
    "district": "string",
    "default": true,
    "isDefault": true
  }
]
```

### GET `/api/v1/delivery-addresses/{addressId}`

Path:

```txt
addressId: integer
```

Response data:

```json
{
  "id": 0,
  "accountId": "3fa85f64-5717-4562-b3fc-2c963f66afa6",
  "receiverName": "string",
  "phone": "string",
  "addressLine": "string",
  "city": "string",
  "district": "string",
  "default": true,
  "isDefault": true
}
```

### POST `/api/v1/delivery-addresses`

Request:

```json
{
  "receiverName": "string",
  "phone": "string",
  "addressLine": "string",
  "city": "string",
  "district": "string",
  "isDefault": true
}
```

Response data:

```json
{
  "id": 0,
  "accountId": "3fa85f64-5717-4562-b3fc-2c963f66afa6",
  "receiverName": "string",
  "phone": "string",
  "addressLine": "string",
  "city": "string",
  "district": "string",
  "default": true,
  "isDefault": true
}
```

### PUT `/api/v1/delivery-addresses/{addressId}`

Request:

```json
{
  "receiverName": "string",
  "phone": "string",
  "addressLine": "string",
  "city": "string",
  "district": "string",
  "isDefault": true
}
```

### DELETE `/api/v1/delivery-addresses/{addressId}`

Response data:

```json
{
  "id": 0,
  "accountId": "3fa85f64-5717-4562-b3fc-2c963f66afa6",
  "receiverName": "string",
  "phone": "string",
  "addressLine": "string",
  "city": "string",
  "district": "string",
  "default": true,
  "isDefault": true
}
```

---

## Schedule Controller

### GET `/api/v1/schedules/pickup-dates`

Response data:

```json
[
  {
    "date": "2026-06-08",
    "displayLabel": "string"
  }
]
```

### GET `/api/v1/schedules/pickup-slots`

Query parameters:

```txt
pickupDate: string(date)
```

Response data:

```json
[
  {
    "slot": "SLOT_09_11",
    "label": "string",
    "startTime": "string",
    "endTime": "string",
    "period": "MORNING"
  }
]
```

### GET `/api/v1/schedules/delivery-dates`

Query parameters:

```txt
pickupDate: string(date)
pickupSlot: string
```

Response data:

```json
[
  {
    "date": "2026-06-08",
    "displayLabel": "string"
  }
]
```

### GET `/api/v1/schedules/delivery-slots`

Query parameters:

```txt
pickupDate: string(date)
pickupSlot: string
deliveryDate: string(date)
```

Response data:

```json
[
  {
    "slot": "SLOT_09_11",
    "label": "string",
    "startTime": "string",
    "endTime": "string",
    "period": "MORNING"
  }
]
```

---

## Order Controller

### POST `/api/v1/orders/summary`

Request:

```json
{
  "items": [
    {
      "serviceId": 0,
      "quantity": 0
    }
  ]
}
```

Response data:

```json
{
  "shopId": 0,
  "shopName": "string",
  "items": [
    {
      "orderItemId": 0,
      "serviceId": 0,
      "serviceName": "string",
      "serviceUnit": "string",
      "quantity": 0,
      "actualWeightKg": 0,
      "unitPrice": 0,
      "subtotal": 0
    }
  ],
  "subtotal": 0,
  "priceNote": "string"
}
```

### GET `/api/v1/orders/payment-methods`

Response data:

```json
[
  {
    "code": "CASH",
    "label": "string"
  }
]
```

### POST `/api/v1/orders`

Current Swagger screenshot shows a single-service body:

```json
{
  "serviceId": 0,
  "quantity": 0,
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

Working assumption for MVP:
- FE may send multiple selected services later if BE confirms the request body supports `items`.
- Until confirmed, implementation should be able to fall back to the first selected service.

Expected multi-service body if supported:

```json
{
  "items": [
    {
      "serviceId": 0,
      "quantity": 0
    }
  ],
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

Response data:

```json
{
  "orderId": 0,
  "orderCode": "string",
  "accountId": "3fa85f64-5717-4562-b3fc-2c963f66afa6",
  "shopId": 0,
  "shopName": "string",
  "status": "PENDING",
  "rating": 0,
  "subtotal": 0,
  "totalAmount": 0,
  "pickupAddressId": 0,
  "pickupAddress": "string",
  "deliveryAddressId": 0,
  "deliveryAddress": "string",
  "pickupDate": "2026-06-08",
  "pickupSlot": "SLOT_09_11",
  "pickupSlotLabel": "string",
  "deliveryDate": "2026-06-08",
  "deliverySlot": "SLOT_09_11",
  "deliverySlotLabel": "string",
  "paymentMethod": "CASH",
  "paymentMethodLabel": "string",
  "specialInstruction": "string",
  "note": "string",
  "items": [
    {
      "orderItemId": 0,
      "serviceId": 0,
      "serviceName": "string",
      "serviceUnit": "string",
      "quantity": 0,
      "actualWeightKg": 0,
      "unitPrice": 0,
      "subtotal": 0
    }
  ]
}
```

### GET `/api/v1/orders/{orderId}`

Path:

```txt
orderId: integer
```

Response data is the same order object shape as `POST /api/v1/orders`.

Notes:
- No timeline/status-history field was shown.
- MVP tracking can derive a static timeline from `status`.

### PUT `/api/v1/orders/{orderId}`

Request:

```json
{
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

Response data is the same order object shape.

### PUT `/api/v1/orders/{orderId}/payment-method`

Request:

```json
{
  "paymentMethod": "CASH"
}
```

Response data is the same order object shape.

### POST `/api/v1/orders/{orderId}/cancel`

Response data is the same order object shape.

---

## User Controller

### GET `/api/v1/users/profile`

Response data:

```json
{
  "accountId": "3fa85f64-5717-4562-b3fc-2c963f66afa6",
  "fullName": "string",
  "email": "string",
  "phone": "string",
  "role": "string",
  "status": "ACTIVE",
  "defaultAddressId": 0,
  "address": "string",
  "city": "string",
  "district": "string",
  "accessToken": "string",
  "refreshToken": "string"
}
```

### PUT `/api/v1/users/profile`

Request:

```json
{
  "fullName": "string",
  "email": "string",
  "phone": "+84869480349",
  "address": "string",
  "city": "string",
  "district": "string"
}
```

Response data is the same profile object shape.

### GET `/api/v1/users/profile/summary`

Response data:

```json
{
  "activeOrderCount": 0,
  "savedAddressCount": 0,
  "totalCleanedKg": 0,
  "recentOrder": {
    "orderId": 0,
    "orderCode": "string",
    "shopName": "string",
    "status": "PENDING",
    "pickupDate": "2026-06-08",
    "deliveryDate": "2026-06-08"
  }
}
```

---

## Shop Owner Controllers

These are not needed for MVP user booking, but are already partly connected in the shop operations page.

### Services

- `GET /api/v1/shop-owner/services`
- `POST /api/v1/shop-owner/services`
- `PUT /api/v1/shop-owner/services/{serviceId}`
- `PATCH /api/v1/shop-owner/services/{serviceId}/availability`
- `DELETE /api/v1/shop-owner/services/{serviceId}`
- `GET /api/v1/shop-owner/services/categories`

### Machines

- `GET /api/v1/shop-owner/machines`
- `POST /api/v1/shop-owner/machines`
- `PUT /api/v1/shop-owner/machines/{machineId}`
- `DELETE /api/v1/shop-owner/machines/{machineId}`

### Inventory

- `GET /api/v1/shop-owner/inventory`
- `POST /api/v1/shop-owner/inventory`
- `PUT /api/v1/shop-owner/inventory/{itemId}`
- `DELETE /api/v1/shop-owner/inventory/{itemId}`

---

## MVP Booking Implementation Plan

Scope: user-facing booking only.

### Current implementation status

Done:

1. Auth flow is connected through `src/utils/auth.js`:
   - `POST /api/v1/auth/login`
   - `POST /api/v1/auth/logout`
   - `POST /api/v1/auth/register`
   - `POST /api/v1/auth/shops/register`
   - `POST /api/v1/auth/verify-email`
   - `POST /api/v1/auth/resend-otp`
   - `GET /api/v1/auth/me`
2. Booking Phase 1 is connected through `src/utils/bookingApi.js`:
   - `GET /api/v1/shops`
   - `GET /api/v1/shops/{shopId}`
   - `GET /api/v1/shops/{shopId}/service-categories`
   - `GET /api/v1/services/{serviceId}` helper exists but is not yet required by the UI.
3. `/all-shops` now uses API data with mock fallback and skeleton loading.
4. `/all-shops/:id` now uses API shop detail/service categories with mock fallback.
5. Detail shop id matching has been fixed for API numeric ids such as `2` vs local mock ids such as `AS-002`.
6. Pending cart now preserves backend service fields: `serviceId`, `serviceName`, `serviceUnit`.

Not done yet:

1. Schedule page still uses local prototype addresses, dates, slots, and payment methods.
2. Confirm page still uses local state/prototype order data.
3. Track page still uses local state/prototype order data.
4. No real order is created yet through `POST /api/v1/orders`.
5. No server summary is calculated yet through `POST /api/v1/orders/summary`.

### Remaining MVP plan

1. Connect schedule page to:
   - `GET /api/v1/delivery-addresses`
   - `POST /api/v1/delivery-addresses`
   - `GET /api/v1/orders/payment-methods`
   - `GET /api/v1/schedules/pickup-dates`
   - `GET /api/v1/schedules/pickup-slots`
   - `GET /api/v1/schedules/delivery-dates`
   - `GET /api/v1/schedules/delivery-slots`
2. Calculate server summary using `POST /api/v1/orders/summary`.
3. Create order using `POST /api/v1/orders`.
4. Store created order in localStorage for confirm/track refresh fallback.
5. Confirm page reads created order response.
6. Track page loads order by `GET /api/v1/orders/{orderId}` and derives timeline from `status`.

Original plan:

1. Replace shop discovery mock data with `GET /api/v1/shops`. Done.
2. Replace shop detail/service mock data with: Done.
   - `GET /api/v1/shops/{shopId}`
   - `GET /api/v1/shops/{shopId}/service-categories`
3. Keep pending cart UX, mapping selected services to summary request items. In progress.
4. In schedule page, load:
   - saved addresses via `GET /api/v1/delivery-addresses`
   - payment methods via `GET /api/v1/orders/payment-methods`
   - pickup dates/slots and delivery dates/slots via schedule APIs
5. Allow adding address via `POST /api/v1/delivery-addresses`.
6. Calculate server summary using `POST /api/v1/orders/summary`.
7. Create order using `POST /api/v1/orders`.
8. Store created order in localStorage for confirm/track refresh fallback.
9. Confirm page reads created order response.
10. Track page loads order by `GET /api/v1/orders/{orderId}` and derives timeline from `status`.

Open contract notes:

- `POST /api/v1/orders` screenshot shows single `serviceId` and `quantity`; user expects multiple services. Implement with a fallback switch if needed.
- No order list/history endpoint has been provided. MVP can rely on last created order in localStorage.
- No order timeline endpoint has been provided. MVP can derive timeline from order status.
