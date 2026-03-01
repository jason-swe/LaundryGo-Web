# Naming Convention - LaundryGo Web

## Folder Structure

```
src/
├── LandingPage/          # Public landing page
├── ShopDashboard/        # Shop owner/manager pages
├── AdminDashboard/       # Admin portal (future)
├── UserDashboard/        # Customer pages (future)
├── components/           # Shared components
├── utils/               # Utility functions
└── assets/              # Shared images, icons
```

## Component Naming

### Role-Based Components
- **Shop:** `Shop{FeatureName}.jsx`
  - Examples: `ShopDashboard.jsx`, `ShopOverview.jsx`, `ShopOrderManagement.jsx`
  
- **Admin:** `Admin{FeatureName}.jsx` _(future)_
  - Examples: `AdminDashboard.jsx`, `AdminUserManagement.jsx`, `AdminShopApproval.jsx`
  
- **User:** `User{FeatureName}.jsx` _(future)_
  - Examples: `UserDashboard.jsx`, `UserProfile.jsx`, `UserOrderHistory.jsx`

### Shared Components
- Generic names without prefix: `Button.jsx`, `Card.jsx`, `Sidebar.jsx`
- Sub-components: `{Parent}{Child}.jsx` - Example: `SidebarItem.jsx`, `CardHeader.jsx`

## File Naming

- **Components:** PascalCase - `ShopDashboard.jsx`
- **Styles:** Match component - `ShopDashboard.css`
- **Utils/Helpers:** camelCase - `formatCurrency.js`, `dateHelpers.js`, `apiClient.js`
- **Constants:** camelCase - `constants.js`, `config.js`

## Variable & Function Naming

```javascript
// Variables & Functions: camelCase
const orderCount = 10
const userName = "John"
function handleSubmit() {}
const isLoading = true

// Constants: UPPER_SNAKE_CASE
const MAX_ORDERS = 100
const API_BASE_URL = "https://api.example.com"
const DEFAULT_TIMEOUT = 5000

// React Components: PascalCase
function ShopDashboard() {}
const OrderCard = () => {}
```

## CSS Class Naming

Use **kebab-case** with role prefix:

```css
/* Shop */
.shop-dashboard { }
.shop-overview-card { }
.shop-order-list { }
.shop-sidebar { }

/* Admin (future) */
.admin-dashboard { }
.admin-user-list { }
.admin-approval-panel { }

/* User (future) */
.user-profile { }
.user-order-history { }
.user-dashboard { }

/* Shared components */
.btn { }
.btn-primary { }
.card { }
.card-header { }
.sidebar { }
.sidebar-item { }
```

## Props Naming

```javascript
// Boolean props: is/has/should prefix
<Button isDisabled />
<Card hasHeader />
<Modal shouldCloseOnOverlayClick />

// Event handlers: on{Action}
<Button onClick={handleClick} />
<Form onSubmit={handleSubmit} />
<Input onChange={handleInputChange} />

// Data props: descriptive names
<UserCard userData={user} />
<OrderList orders={orders} />
<Chart chartData={data} />
```

## Route Naming

```
/                          - Landing page
/shop/dashboard           - Shop overview
/shop/orders              - Shop order management
/shop/operations          - Shop operations
/shop/staff               - Shop staff management
/shop/documents           - Shop documents
/shop/incidents           - Shop incident reports

/admin/dashboard          - Admin overview (future)
/admin/shops              - Admin shop management (future)
/admin/users              - Admin user management (future)

/user/dashboard           - User dashboard (future)
/user/orders              - User orders (future)
/user/profile             - User profile (future)
```

## Import Organization

```javascript
// 1. React & External libraries
import { useState, useEffect } from 'react'
import { BrowserRouter, Routes, Route } from 'react-router-dom'

// 2. Shared components
import Button from '../components/Button'
import Card from '../components/Card'

// 3. Local components
import ShopSidebar from './ShopSidebar'
import ShopOverview from './ShopOverview'

// 4. Utils & Helpers
import { formatCurrency } from '../utils/formatCurrency'
import { API_BASE_URL } from '../utils/constants'

// 5. Styles
import './ShopDashboard.css'
```

## Best Practices

1. **Consistency:** Stick to the convention across the entire project
2. **Clarity:** Names should be descriptive and self-explanatory
3. **Avoid abbreviations:** Use `orderManagement` not `ordMgmt`
4. **Keep it simple:** Don't over-engineer naming
5. **Document deviations:** If you must deviate, document why

## Examples

### Good ✅
```
ShopDashboard.jsx
ShopOrderManagement.jsx
AdminUserList.jsx
UserProfile.jsx
formatCurrency.js
.shop-overview-card
```

### Bad ❌
```
shop-dashboard.jsx       (wrong case)
OrderMgmt.jsx           (abbreviation)
Admin_Dashboard.jsx      (snake_case)
user_profile.jsx        (wrong case)
format-currency.js      (kebab-case for JS)
.ShopOverviewCard       (PascalCase in CSS)
```
