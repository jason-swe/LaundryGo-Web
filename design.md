# Design System: LaundryGo

## 1. Visual Theme & Atmosphere
LaundryGo is a clean, service-first platform for laundry pickup, shop comparison, order tracking, and operations across User, Shop Partner, Shipper, and Admin roles. The interface should feel trustworthy, practical, bright, and fast to scan.

Use a white-first layout with blue operational accents. The design language is calm and transparent: users must immediately understand price, distance, time slot, order state, and next action. Dashboards should feel dense enough for daily work, while customer booking pages should stay airy and approachable.

Atmosphere targets:
- Density: Daily App Balanced, 6/10.
- Variance: Predictable with light asymmetry, 4/10.
- Motion: Restrained and fluid, 4/10.

## 2. Color Palette & Roles
These colors are taken from the current `all-shops` page and its navbar styles.

- **LaundryGo Deep Blue** (`#0b416a`) — Primary brand color. Use for active chips, primary CTAs, selected pagination, price emphasis, logo text, and important navigation states.
- **LaundryGo Soft Blue** (`#719fc2`) — Secondary brand color. Use for the fixed navbar, hover borders, soft active filters, secondary CTAs, and calm section accents.
- **LaundryGo White** (`#ffffff`) — Main surface color. Use for cards, dropdowns, pagination buttons, nav active indicators, and high-contrast text on blue backgrounds.

Supporting colors may be used only for readability and states:
- **Page Mist** (`#f4f6fb`) — App background behind white surfaces.
- **Ink Navy** (`#0f172a`) — Primary heading text.
- **Slate Text** (`#64748b`) — Secondary copy, descriptions, and metadata.
- **Soft Border** (`#d1dce8`) — Form controls, filter chips, pagination borders.
- **Card Border** (`#e2eaf3`) — Shop cards and contained modules.
- **Pale Blue Hover** (`#f0f7ff`) — Hover background for filters and dropdown rows.
- **Pale Blue Active** (`#e8f2fb`) — Active soft filter background.

Never introduce purple, neon blue, beige, or heavy gradients. The product identity must stay blue-white, clean, and operational.

## 3. Typography Rules
- Use a modern sans-serif for all screens. Recommended: **Geist** or **Satoshi**.
- Dashboards and operational pages must use sans-serif only; no serif display type.
- Body text should be readable at 14-16px with relaxed line height.
- Dashboard labels may use 11-12px uppercase text with moderate letter spacing, matching the current filter labels.
- Headings should be compact and clear: page titles around 24-28px on desktop, 20-22px on mobile.
- Numbers, prices, order IDs, timestamps, and revenue figures should align cleanly; use **Geist Mono** or tabular numerals where available.

## 4. Component Styling
**Navigation**
Use `#719fc2` as the navbar background. Active and hover links use `#ffffff`; inactive links use a pale blue-white tone. Keep the nav compact, sticky/fixed, and task-focused.

**User Navbar**
User-facing pages should use `src/components/UserNavbar.jsx` unless a page has a specific reason not to. It includes the LaundryGo logo, Services, All Shops, Track Order, EN/VI toggle, Login, and Sign Up. Keep it glassy, compact, and pill-shaped over light/blue surfaces. Do not duplicate nav/auth controls inside the page body.

**Language Toggle**
The EN/VI control is a segmented toggle, not two separate buttons. It must animate the active thumb, preserve `location.search` and `location.hash`, and use locale files for all visible copy.

**Primary Buttons**
Use `#0b416a` fill with `#ffffff` text. Hover may deepen slightly but must remain within the same blue family. Active state should feel tactile with a tiny vertical press, not a glow.

**Secondary Buttons**
Use `#719fc2` fill with `#ffffff` text or white fill with `#0b416a` text depending on hierarchy. Avoid more than one strong CTA per section.

**Filter Chips**
Default chips use `#ffffff` background, `#d1dce8` border, and slate text. Active chips use `#0b416a` background and `#ffffff` text. Soft active filters may use `#e8f2fb` with `#0b416a` text.

**Cards**
Cards use `#ffffff` background, `#e2eaf3` border, 16px radius, and a light blue-tinted shadow. Hover states may lift by 2-4px and increase shadow softly. Cards should display real product data: shop name, rating, distance, delivery time, and starting price.

**Inputs & Dropdowns**
Use white surfaces, `#d1dce8` borders, 8-10px radius, and a `#719fc2` focus border. Labels sit above inputs. Errors are inline and specific.

**Status & Alerts**
Use restrained state colors only when needed. Keep red/yellow/green secondary to the LaundryGo blues. Do not let alert colors dominate the page.

## 5. Layout Principles
- Customer pages prioritize quick comparison: title, filters, result count, shop grid, pagination.
- Operational dashboards prioritize scannability: sidebar/header, compact cards, tables, status badges, and clear action placement.
- Use max-width containment around 1280px for customer listing pages.
- Use CSS Grid for shop cards and data summaries. Avoid fragile percentage math.
- Desktop shop grid may use 3 columns; tablet 2 columns; mobile 1 column.
- Every interactive item must have at least a 44px touch target on mobile.
- No overlapping content. Text, images, badges, and controls must each occupy a stable space.
- Landing page starts with an optional fullscreen intro video using `/outputmp_.mp4`, shown once per session via sessionStorage. Skip appears after 3 seconds. While video is visible, lock page scroll and hide the scrollbar. The hero after intro uses `/framecuoi.png` as the visual theme.
- The All Shops page is a shop-discovery surface: small hero, search input, sticky filter/sort panel, results count, responsive shop cards, and composed empty state.
- The Shop Detail page is a service-selection surface: compact visual hero, shop meta cards, category-based service list, clear quantity stepper, desktop sticky order summary, and disabled schedule CTA until the cart has at least one service.
- The Shop Detail page now receives real backend shop/service data. It must gracefully handle API id values such as `2` while local fallback data may use ids like `AS-002`. Keep the fallback matcher and cached selected shop behavior intact until backend detail APIs are stable.
- Service details must be visible for users, not only admin/shop. When a user selects a service, show estimated washing/processing time, minimum order, pricing type, price, availability, and useful tags/description.
- Pending cart is part of the booking UX. If a user adds services but has not confirmed/paid, show a compact Shopee-like floating cart on the right side of user pages. Prototype storage uses `localStorage` with a 7-day expiry and clears after order confirmation.
- Pending cart entries should preserve backend fields when available: `serviceId`, `serviceName`, `serviceUnit`, `price`, `pricingType`, and `count`. This is required for creating backend orders later.
- The Schedule page must separate address, pickup window, delivery window, payment method, special instructions, and sticky order summary. Confirmation is disabled until the cart has services, an address is selected, and pickup/delivery slots are available.
- The Confirm page is a success and handoff screen: show order ID, pickup/delivery windows, address, payment method, order summary, next steps, and clear primary/secondary CTAs for tracking or booking another order.
- The Track page must clearly separate empty state, live order hero, readable vertical timeline, compact mock route map, driver/support actions, pickup/address facts, and cart-based order summary.
- The Information page is a customer profile dashboard: show account hero, personal info form, default address, recent order shortcut, quick booking action, inline validation, and visible save/reset state.

## 6. Motion & Interaction
- Use short transitions, 150-220ms, for hover color, border, opacity, and transform.
- Use transform and opacity for animation. Do not animate layout dimensions.
- Cards can lift on hover and images can scale subtly, matching the current `all-shops` behavior.
- Dropdowns should open quickly and feel anchored to their trigger.
- Loading states should be skeleton blocks shaped like the real content, not circular spinners.
- API fallback states should be inline and quiet. Do not block the booking flow if mock fallback can still render a useful MVP page.

## 7. Product Rules
- Always make price, distance, pickup/delivery time, and order status visible where relevant.
- Booking flow must stay short: choose shop, choose service, schedule pickup/delivery, confirm order, track order.
- Admin views must make partner approval, order disputes, finance, promotions, and compliance easy to find.
- Shop views must make order intake, operations, revenue, staff, documents, incidents, and settings easy to scan.
- Shipper views must prioritize tasks, route/status updates, history, earnings, notifications, and profile.
- Always design and implement user-facing text in both English and Vietnamese. Do not hardcode visible UI copy in React components. New UI copy, CTA labels, intro/hero text, form labels, empty states, errors, and meaningful image alt text must have matching keys in `src/locales/en.json` and `src/locales/vi.json`, and language switching must work through the EN/VI toggle.
- Before finishing any user-facing redesign, test both English and Vietnamese routes or toggled states for newly added text.

## 8. Anti-Patterns
- No authentication gate during prototype/test mode unless explicitly requested.
- No purple/neon gradients.
- No pure black for core UI surfaces.
- No decorative clutter that hides real shop or order data.
- No oversized marketing hero on operational dashboards.
- No generic placeholder names like John Doe or Acme.
- No vague CTA copy. Use direct verbs such as Book, Track, Confirm, Approve, Assign, Resolve.
- No hidden fees or unclear totals in booking UI.
- No overlapping text, images, cards, or floating controls.
- No circular loading spinners for data-heavy screens.
- No hardcoded English-only user-facing text in UI components.
- No removing API fallback paths during MVP. Backend Swagger examples currently contain placeholder values and some endpoints may fail during local testing; pages should remain usable with saved/mock data.
