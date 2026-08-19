# LaundryGo Unconnected APIs Guide

This document tracks Backend API integration in the Frontend repository. The customer booking, shop processing, bank-transfer payment, and customer tracking flow was re-audited against the current backend contract on 2026-08-13.

> Temporary operating mode: `logistics.shipper.enabled=false`. The shop receives the laundry directly, processes it, confirms that the customer received it, then verifies the customer's bank transfer before completing the order. No shipper account is required for this flow.
>
> Payment contract: customer booking exposes `BANK_TRANSFER` only. VNPay/card/wallet create-url and callback endpoints are not present, so VNPay sandbox card/OTP data must not be hardcoded into the frontend.

---

## 1. Admin Features (Missing `src/services/adminApi.js`)

Currently, there is no `adminApi.js` file. You should create one to handle these administrative endpoints:

### Vouchers (Admin)
- `GET /api/v1/admin/vouchers` - List vouchers
- `GET /api/v1/admin/vouchers/{id}` - Get voucher details
- `POST /api/v1/admin/vouchers` - Create voucher
- `PUT /api/v1/admin/vouchers/{id}` - Update voucher
- `DELETE /api/v1/admin/vouchers/{id}` - Delete voucher
- `PATCH /api/v1/admin/vouchers/{id}/toggle` - Toggle voucher status

### Accounts & Finance (Admin)
- `DELETE /api/v1/admin/accounts/{accountId}` - Delete account
- `POST /api/v1/admin/accounts/{accountId}/reactivate` - Reactivate account
- `GET /api/v1/admin/finance/payment-audit-logs` - Payment logs
- `POST /api/v1/admin/commission-configs/{id}/activate` - Activate commission config

### Statements (Admin)
- `POST /api/v1/admin/statements/regenerate` - Regenerate statements
- `POST /api/v1/admin/statements/{statementId}/settlement/confirm` - Confirm settlement
- `POST /api/v1/admin/statements/{statementId}/settlement/reject` - Reject settlement

### Incidents & Tasks (Admin)
- `GET /api/v1/admin/incidents` - List incidents
- `PUT /api/v1/admin/incidents/{id}/resolve` - Resolve incident
- `PUT /api/v1/admin/tasks/{taskId}/assign` - Assign task
- `PUT /api/v1/admin/tasks/{taskId}/reassign` - Reassign task

**Implementation Example (`src/services/adminApi.js`):**
```javascript
import { authenticatedApiRequest } from '../utils/api';

export const adminApi = {
  getVouchers: (params) => authenticatedApiRequest(`/api/v1/admin/vouchers?${new URLSearchParams(params)}`),
  createVoucher: (data) => authenticatedApiRequest('/api/v1/admin/vouchers', { method: 'POST', body: JSON.stringify(data) }),
  toggleVoucher: (id) => authenticatedApiRequest(`/api/v1/admin/vouchers/${id}/toggle`, { method: 'PATCH' }),
  // ... implement other methods similarly
};
```

---

## 2. Shop Owner Booking Flow (Connected)

These calls are connected through `src/services/shopOwnerOrderApi.js` and their live screens.

### Orders & Inspections
- `GET /api/v1/shop-owner/orders/{id}` - Get order details
- `GET /api/v1/shop-owner/orders/{id}/inspection` - Get inspection details
- `PUT /api/v1/shop-owner/orders/{id}/inspection/draft` - Save inspection draft
- `POST /api/v1/shop-owner/orders/{id}/inspection/submit` - Submit inspection
- `PUT /api/v1/shop-owner/orders/{id}/status` - Update order status

Frontend keeps `PENDING`, `CONFIRMED`, `PICKING_UP`, and `AT_STORE` separate. With shipper logistics disabled, the shop moves a confirmed order directly to `AT_STORE` after physically receiving the laundry. Inspection remains enabled only for `AT_STORE`.

### Payments & Statements
- `POST /api/v1/shop-owners/payments/{paymentId}/confirm`
- `POST /api/v1/shop-owners/payments/{paymentId}/reject`
- `POST /api/v1/shop-owners/statements/{statementId}/settlements`

### Incidents
- `GET /api/v1/shop-owner/incidents` - List shop incidents

---

## 3. Customer Booking, Payment, and Tracking (Connected)

### Vouchers (Customer)
Connected through `src/services/voucherApi.js`:
- `GET /api/v1/vouchers/shops/{shopId}` - Get active promos for a shop (can be unauthenticated)
- `POST /api/v1/vouchers/validate` - Validate code & preview discount (requires auth)

**Implementation Example (`src/services/voucherApi.js`):**
```javascript
import { authenticatedApiRequest, apiRequest } from '../utils/api';

export const voucherApi = {
  getShopVouchers: (shopId) => apiRequest(`/api/v1/vouchers/shops/${shopId}`), // public
  validateVoucher: (data) => authenticatedApiRequest('/api/v1/vouchers/validate', { method: 'POST', body: JSON.stringify(data) }),
};
```

### Orders & Booking
- `GET /api/v1/orders/{orderId}` - Get customer order details
- `GET /api/v1/orders` - List the signed-in customer's orders
- `POST /api/v1/orders/{orderId}/cancel` - Cancel order
- `PUT /api/v1/orders/{id}/inspection/approve` - Approve shop inspection
- `PUT /api/v1/orders/{id}/inspection/reject` - Reject shop inspection

### Payments (Customer)
- `GET /api/v1/payments/{orderId}` - Get payment info
- `POST /api/v1/payments/preview` - Preview final amount and voucher
- `POST /api/v1/payments/{orderId}/bank-transfer` - Create/reopen manual bank transfer
- `POST /api/v1/payments/{paymentId}/evidence` - Upload transfer evidence
- `POST /api/v1/payments/{paymentId}/report-paid`

`POST /api/v1/payments/{orderId}/confirm-cash` is not used by the temporary no-shipper flow. It remains a legacy shipper endpoint in the backend.

There is intentionally no frontend call to a VNPay create-url/callback endpoint because those endpoints are not exposed by the current backend.

### General Auth & Users
Add to `src/services/userApi.js` or `authApi.js`:
- `GET /api/v1/auth/me` - Get current session info
- `POST /api/v1/auth/shippers/register` - Register a shipper account
- `POST /api/v1/auth/reactivation-requests` - Request account reactivation
- `POST /api/v1/incidents` - Report an incident (customer)

---

## Remaining Integration Work

The admin endpoints in section 1 and any endpoints explicitly marked as unavailable in their screens remain outside the completed booking lifecycle. Do not add mock mutations for them; connect each screen only when its backend contract is available.

Shipper registration, task assignment, and driver-task APIs remain in the repository for a future logistics phase, but they are intentionally outside the active customer/shop flow while `logistics.shipper.enabled=false`.
