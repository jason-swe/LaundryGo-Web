# LaundryGo Unconnected APIs Guide

This document outlines the Backend APIs that are currently **NOT** connected in the Frontend repository. For each group, we provide recommendations on which service file to place them in and how to implement them using the existing `authenticatedApiRequest` pattern.

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

## 2. Shop Owner Features

Add these to the existing `src/services/shopOwnerOrderApi.js` and `src/services/shopOwnerApi.js`.

### Orders & Inspections
Add to `shopOwnerOrderApi.js`:
- `GET /api/v1/shop-owner/orders/{id}` - Get order details
- `GET /api/v1/shop-owner/orders/{id}/inspection` - Get inspection details
- `PUT /api/v1/shop-owner/orders/{id}/inspection/draft` - Save inspection draft
- `POST /api/v1/shop-owner/orders/{id}/inspection/submit` - Submit inspection
- `PUT /api/v1/shop-owner/orders/{id}/status` - Update order status

### Payments & Statements
Create a new `shopOwnerFinanceApi.js` or add to `shopOwnerApi.js`:
- `POST /api/v1/shop-owners/payments/{paymentId}/confirm`
- `POST /api/v1/shop-owners/payments/{paymentId}/reject`
- `POST /api/v1/shop-owners/statements/{statementId}/settlements`

### Incidents
- `GET /api/v1/shop-owner/incidents` - List shop incidents

---

## 3. Customer & Public Features

### Vouchers (Customer)
Create a new `src/services/voucherApi.js`:
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
Add to `src/services/bookingApi.js`:
- `GET /api/v1/orders/{orderId}` - Get customer order details
- `PUT /api/v1/orders/{orderId}` - Update order
- `POST /api/v1/orders/{orderId}/cancel` - Cancel order
- `PUT /api/v1/orders/{id}/inspection/approve` - Approve shop inspection
- `PUT /api/v1/orders/{id}/inspection/reject` - Reject shop inspection

### Payments (Customer)
Add to `src/services/paymentApi.js`:
- `GET /api/v1/payments/{orderId}` - Get payment info
- `POST /api/v1/payments/{orderId}/confirm-cash` - Confirm COD
- `POST /api/v1/payments/{orderId}/bank-transfer` - Submit bank transfer proof
- `GET /api/v1/payments/callback` - Payment gateway callback
- `POST /api/v1/payments/{paymentId}/report-paid`
- `POST /api/v1/payments/{paymentId}/shop-confirm`

### General Auth & Users
Add to `src/services/userApi.js` or `authApi.js`:
- `GET /api/v1/auth/me` - Get current session info
- `POST /api/v1/auth/shippers/register` - Register a shipper account
- `POST /api/v1/auth/reactivation-requests` - Request account reactivation
- `POST /api/v1/incidents` - Report an incident (customer)

---

## Next Steps for Frontend Integration
1. **Create the missing service files** (`adminApi.js`, `voucherApi.js`).
2. **Add missing methods** to existing service files (`bookingApi.js`, `shopOwnerOrderApi.js`, etc.).
3. **Use React Query** (or your state management library) to integrate these API calls into the React components, handling loading and error states appropriately.
