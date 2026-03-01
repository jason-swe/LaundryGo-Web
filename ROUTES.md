# Route Structure - LaundryGo Web Application

## Overview
This document outlines the routing structure for the LaundryGo web application, designed to support three user roles: Customers (User), Shop Owners (Shop), and System Administrators (Admin).

## Technology
- **Router**: React Router DOM v6+
- **Implementation**: [src/App.jsx](src/App.jsx)
- **Base URL**: http://localhost:5174/ (dev) / https://laundrogo.com/ (production)

---

## Current Routes

### Public Routes
| Path | Component | Description | Status |
|------|-----------|-------------|--------|
| `/` | `LandingPage` | Marketing landing page, registration, login | ✅ Active |

### Shop Owner Routes
| Path | Component | Description | Status |
|------|-----------|-------------|--------|
| `/shop/dashboard` | `ShopDashboard` | Main shop owner dashboard | ✅ Active |

**Shop Dashboard Sub-Views** (internal navigation via `activeView` state):
- `overview` - Stats, analytics, machine status (default)
- `orders` - Order management and tracking
- `operations` - Machine monitoring, supplies inventory
- `staff` - Staff attendance and management
- `documents` - Business licenses and certificates
- `incidents` - Incident reporting to admin

---

## Planned Routes (Future Implementation)

### Admin Routes
| Path | Component | Description | Planned Version |
|------|-----------|-------------|-----------------|
| `/admin/dashboard` | `AdminDashboard` | Admin overview dashboard | v2.0 |
| `/admin/shops` | `AdminShopManagement` | Manage all shops | v2.0 |
| `/admin/users` | `AdminUserManagement` | Manage all users | v2.0 |
| `/admin/incidents` | `AdminIncidentManagement` | Handle shop incident reports | v2.0 |
| `/admin/analytics` | `AdminAnalytics` | System-wide analytics | v2.0 |
| `/admin/settings` | `AdminSettings` | System configuration | v2.0 |

### User Routes
| Path | Component | Description | Planned Version |
|------|-----------|-------------|-----------------|
| `/user/dashboard` | `UserDashboard` | User overview | v2.0 |
| `/user/orders` | `UserOrders` | Order history and tracking | v2.0 |
| `/user/favorites` | `UserFavorites` | Favorite shops | v2.0 |
| `/user/profile` | `UserProfile` | Account settings | v2.0 |
| `/user/wallet` | `UserWallet` | Payment methods and history | v2.0 |

### Shared Routes
| Path | Component | Description | Planned Version |
|------|-----------|-------------|-----------------|
| `/login` | `Login` | Authentication page | v1.5 |
| `/register` | `Register` | User registration | v1.5 |
| `/forgot-password` | `ForgotPassword` | Password recovery | v1.5 |
| `/about` | `About` | About page | v1.5 |
| `/contact` | `Contact` | Contact form | v1.5 |
| `/terms` | `Terms` | Terms of service | v1.5 |
| `/privacy` | `Privacy` | Privacy policy | v1.5 |
| `*` | `NotFound` | 404 error page | v1.5 |

---

## Route Naming Convention

### Pattern Structure
```
/{role}/{feature}/{sub-feature}
```

### Examples
- Shop routes: `/shop/dashboard`, `/shop/settings`, `/shop/profile`
- Admin routes: `/admin/dashboard`, `/admin/shops`, `/admin/users`
- User routes: `/user/dashboard`, `/user/orders`, `/user/profile`

### Best Practices
1. **Role Prefix**: Always start with role (shop/admin/user) for private routes
2. **Kebab-case**: Use lowercase with hyphens (e.g., `/forgot-password`, `/admin/shop-details`)
3. **Hierarchical**: Structure reflects navigation hierarchy
4. **RESTful**: Follow REST conventions for CRUD routes when applicable
5. **Consistent**: Match component naming (ShopDashboard → /shop/dashboard)

---

## Implementation Example

### Adding a New Route
```jsx
// In src/App.jsx
import NewComponent from './path/to/NewComponent'

<Routes>
  {/* Existing routes */}
  <Route path="/new/route" element={<NewComponent />} />
</Routes>
```

### Protected Routes (Future)
```jsx
// To be implemented with authentication
<Route path="/shop/dashboard" element={
  <ProtectedRoute role="shop">
    <ShopDashboard />
  </ProtectedRoute>
} />
```

### Dynamic Routes (Future)
```jsx
// For routes with parameters
<Route path="/shop/:shopId/details" element={<ShopDetails />} />
<Route path="/user/order/:orderId" element={<OrderDetails />} />
```

---

## Navigation Methods

### Link Component (Recommended)
```jsx
import { Link } from 'react-router-dom'

<Link to="/shop/dashboard">Go to Dashboard</Link>
```

### Navigate Hook
```jsx
import { useNavigate } from 'react-router-dom'

const navigate = useNavigate()
navigate('/shop/dashboard')
```

### Programmatic Navigation with State
```jsx
navigate('/shop/dashboard', { state: { from: 'login' } })
```

---

## Route Parameters Access

### URL Parameters
```jsx
import { useParams } from 'react-router-dom'

const { shopId } = useParams()
```

### Query Parameters
```jsx
import { useSearchParams } from 'react-router-dom'

const [searchParams] = useSearchParams()
const filter = searchParams.get('filter')
```

---

## Testing Routes

### Development URLs
- Landing Page: http://localhost:5174/
- Shop Dashboard: http://localhost:5174/shop/dashboard

### Browser Navigation
1. Start dev server: `npm run dev`
2. Open browser to http://localhost:5174/
3. Navigate directly via URL bar or use links

### Testing Checklist
- [ ] All current routes load without errors
- [ ] Navigation between routes works
- [ ] Browser back/forward buttons work
- [ ] Direct URL access works (after page refresh)
- [ ] 404 handling for invalid routes (to be implemented)
- [ ] Protected routes redirect to login (to be implemented)

---

## Migration Notes

### From App.jsx View Switcher to React Router
- **Before**: Used `useState` with `window.switchView()` function
- **After**: React Router DOM with proper URL-based navigation
- **Benefit**: Better UX, browser history support, URL sharing, SEO-friendly

### Old Code (Removed)
```jsx
// Old temporary switching mechanism
const [currentView, setCurrentView] = useState('landing')
window.switchView = (view) => setCurrentView(view)
```

### New Code (Current)
```jsx
// Proper routing with React Router
<BrowserRouter>
  <Routes>
    <Route path="/" element={<LandingPage />} />
    <Route path="/shop/dashboard" element={<ShopDashboard />} />
  </Routes>
</BrowserRouter>
```

---

## Future Enhancements

### v1.5 - Authentication & Public Pages
- Login/Register pages
- Password recovery flow
- Public information pages (About, Contact, Terms, Privacy)
- 404 Not Found page
- Protected route wrapper component

### v2.0 - Multi-Role Dashboards
- Full Admin Dashboard implementation
- Full User Dashboard implementation
- Role-based route protection middleware
- Dashboard role switching for super admins

### v2.5 - Advanced Features
- Nested routing for complex dashboards
- Route-based code splitting (lazy loading)
- Route transitions and animations
- Breadcrumb navigation component
- Dynamic sitemap generation

---

## Related Documentation
- [NAMING_CONVENTION.md](NAMING_CONVENTION.md) - Component and file naming standards
- [README.md](README.md) - Project overview and setup
- [src/App.jsx](src/App.jsx) - Router implementation
- [src/ShopDashboard/ShopDashboard.jsx](src/ShopDashboard/ShopDashboard.jsx) - Shop dashboard container

---

**Last Updated**: January 2025  
**Version**: 1.0  
**Maintainer**: Development Team
