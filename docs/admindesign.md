# Admin Design System: LaundryGo Executive Command Center

## 1. Muc tieu tai lieu
`admindesign.md` la design standard rieng cho luong Admin trong LaundryGo. Tai lieu nay dung de redesign cac trang admin dashboard theo huong:

- Day du so lieu, ro rang ve van hanh nen tang, doi soat, rui ro va tang truong.
- Hien dai, sang trong, co cam giac executive command center.
- Phuc vu admin/operator quan ly toan he thong, khong phai shop owner hay user dat dich vu.
- Theme mau rieng biet hoan toan voi user/shop, nhung van giu tinh tin cay cua LaundryGo.
- Moi UI/copy moi phai co ca tieng Anh va tieng Viet de toggle EN/VI hoat dong nhat quan.

Khong bien admin thanh landing page. Day la cockpit quan tri co mat do du lieu cao, can scan nhanh, ra quyet dinh nhanh va thao tac co trach nhiem.

## 2. Admin pages hien tai
Routes admin trong `src/App.jsx`:

- `/admin/overview` - tong quan toan nen tang.
- `/admin/shops` - quan ly partner shops, duyet shop, trang thai subscription/hoat dong.
- `/admin/shippers` - quan ly shipper/driver, duyet ho so, trang thai van chuyen.
- `/admin/customers` - quan ly khach hang, hoat dong, complaints, risk profile.
- `/admin/finance` - doanh thu nen tang, payout shop/shipper, commission, fee config.
- `/admin/promotions` - promotions, campaign, marketing rules, achievements.
- `/admin/analytics` - phan tich tang truong, cohort, geography, service demand.
- `/admin/settings` - cau hinh he thong, policy, security, notification, integrations.

Admin components co trong repo nhung chua route rieng:

- `AdminDashboard/OrderManagement` - co the can route sau nay neu admin can xem tat ca orders.
- `AdminDashboard/Notifications` - hien dang la overlay/panel thong bao.

Khong doi URL structure neu user khong yeu cau. Neu them route order management sau nay, can cap nhat `App.jsx` ro rang.

## 3. Design Read
Day la dashboard dieu hanh nen tang cho admin/operator va founder-level reviewer. Ngon ngu thiet ke nen la:

- **Premium utilitarian command desk**, khong phai dark sci-fi dashboard.
- **Light editorial data system**, sang, ro, it mau, tap trung vao so lieu va action.
- **One coherent light shell + light data surfaces**, khong duoc tron dark sidebar voi nen trang neu khong co ly do ro.
- **Density 8/10**, vi admin can nhieu KPI, bang va canh bao cung luc.
- **Variance 3/10**, bo cuc du doan duoc, khong trang tri thua.
- **Motion 2/10**, chi hover/focus/tab/drawer nhe.

## 4. Admin Color Palette
Admin theme moi phai la mot he mau sang, it mau, dong bo:

- **Canvas Mist** (`#f6f8fb`) - nen page/admin canvas.
- **Panel White** (`#ffffff`) - card, table, modal, drawer.
- **Sidebar Surface** (`#fbfcfe`) - sidebar/header surface; khong dung sidebar toi mac dinh.
- **Ink Charcoal** (`#111827`) - title, KPI value, table primary text.
- **Slate Body** (`#475569`) - body text.
- **Muted Silver** (`#8a97a8`) - helper text, meta, disabled state.
- **Line Steel** (`#dde5ef`) - borders, dividers, table grid.
- **Primary Blue** (`#245b9e`) - primary action, selected nav, chart main series.
- **Primary Blue Soft** (`#e8f1fb`) - active/hover/focus subtle background.
- **Success Green** (`#2f7d68`) - success/approved/active only.
- **Warning Amber** (`#a16207`) - pending/review needed only.
- **Risk Red** (`#b42318`) - suspended/critical/rejected only.

Rules:

- Khong dung dark sidebar neu content chinh la light canvas. Neu chon dark mode thi phai dark toan bo admin, khong tron nua voi white page.
- Khong dung nhieu accent mau cho KPI icon. KPI icon/background mac dinh dung cung mot blue soft; chi risk/status moi duoc dung amber/red/green.
- Khong dung cyan/violet/neon/gradient cho admin core.
- Chart toi da 2 series, uu tien `#245b9e` va neutral slate; khong dung mau qua tuoi.
- Status color phai co text label, khong chi dua vao mau.

## 5. Typography
- Font UI chinh: **Geist** hoac **Satoshi**.
- Font mono/tabular: **Geist Mono** hoac **JetBrains Mono** cho money, IDs, timestamps, percentages.
- Sidebar/header: 12-13px, weight 750-850.
- Table body: 13-14px, line-height 1.45.
- Page title: 24-30px desktop, 22-24px mobile.
- KPI value: 26-34px, tabular numbers, khong lam card bi chen.
- Dashboard label: uppercase 11-12px, letter spacing vua phai.

## 6. Layout Foundation
Admin dashboard nen co 3 lop:

1. **Light command sidebar**
   - Logo, role/admin badge, nav grouped: Command, Marketplace, Finance, Intelligence, System.
   - Active route co rail Primary Blue va background `#e8f1fb`.
   - Avatar/icon dung initials hoac lucide/Ant icon thong nhat, khong dung emoji.

2. **Top command bar**
   - Global search, system health, date range, notification, profile.
   - Co quick action neu hop ly: export, create campaign, review queue.
   - Sticky, nho gon, khong che noi dung.

3. **Data canvas**
   - Nen `#f6f8fb`, cards/bang trang.
   - KPI row tren cung, sau do main workspace 2-3 cot tuy trang.
   - Drawer ben phai cho detail/review, modal cho confirm destructive.

## 7. Shared Admin Components nen tao
- `AdminPageHeader` - eyebrow, title, subtitle, date range, primary actions.
- `AdminKpiCard` - label, value, trend, confidence/source.
- `AdminStatusBadge` - status mapping dung chung.
- `AdminRiskBadge` - risk/severity mapping.
- `AdminDataTable` - dense table, sticky header, row hover, selected row.
- `AdminDrawer` - detail/review drawer.
- `AdminFilterBar` - search, status filter, date range, reset.
- `AdminEmptyState` - icon, title, copy, optional CTA.
- `AdminChartPanel` - title, legend, compact chart.
- `AdminAuditTimeline` - action history, actor, timestamp, note.
- `AdminMetricStrip` - nho gon cho so lieu phu trong drawer.

## 8. Page UX Plan
### `/admin/overview`
Can hien:

- GMV, platform commission, active shops, active shippers, active customers, open complaints.
- Realtime operational health: pending approvals, payout risk, delayed deliveries, incident count.
- Growth trend, top districts, top shops, service demand.
- Action queue: shop approvals, shipper approvals, overdue payout, critical complaints.

Design:

- Executive summary tren cung.
- Main grid: KPI + trend chart + action queue + risk panel.
- Co “what needs attention” ro hon decorative chart.

### `/admin/shops`
Can hien:

- Tat ca shops, pending shops, subscription, revenue, rating, order volume, status.
- Drawer chi tiet shop: owner info, documents, payout, performance, incidents.
- Actions: approve/reject pending shop, suspend/reactivate, update subscription, view revenue.

Design:

- Table/list day du cot quan trong.
- Pending approvals la queue rieng co priority.
- Badge subscription basic/premium va operational status ro.

### `/admin/shippers`
Can hien:

- Active/inactive/pending shippers, vehicle, rating, delivery count, earnings, last active.
- Pending shipper document review.
- Drawer chi tiet: identity, vehicle, documents, payout history, performance/risk.
- Actions: approve/reject, suspend/reactivate, assign review.

Design:

- Map/logistics feel nhe: live availability strip, district filter.
- Khong dung card trang tri qua lon; table la core.

### `/admin/customers`
Can hien:

- Customer list, orders, spend, complaints, loyalty/risk profile.
- Complaint queue va customer service state.
- Drawer chi tiet: contact, order history, complaint timeline, refund flags.

Design:

- Customer health badge: normal, high value, complaint risk, blocked.
- Search by phone/email/name.
- Complaint summary phai scan duoc nhanh.

### `/admin/finance`
Can hien:

- Platform GMV, commission revenue, payout payable, shipper cost, tax/config.
- Shop payout table, pending payout queue, overdue badge.
- Config panel: commission, subscription fees, shipper share, delivery fees, tax rate.
- Audit trail cho fee/config changes.

Design:

- So tien dung mono/tabular, doi soat minh bach.
- Risk states cho pending/overdue payout.
- Khong goi `Date.now()` trong render; tinh now bang state/memo an toan.

### `/admin/promotions`
Can hien:

- Campaign list, active/scheduled/expired, discount rules, usage, budget, ROI.
- Achievement/shop rewards neu data co.
- Create/edit promotion modal/drawer.
- Campaign performance chart.

Design:

- Campaign cards + table hybrid.
- Budget burn va conversion phai noi bat.
- Validation ro cho date/rule/budget.

### `/admin/analytics`
Can hien:

- Platform growth, funnel, geography, service demand, cohort-like trends.
- Compare date range.
- Export/report actions.

Design:

- Analytics page co the cao cap hon: chart panels lon, insight rail ben phai.
- Chart phai co labels/legend, khong chi bar mau.
- Insights phai co context: “why it matters / recommended action”.

### `/admin/settings`
Can hien:

- Platform profile, policy/legal, security, notification, integrations, finance defaults.
- Save/reset state, inline validation.
- Admin role/permission neu mock co the them nhe.

Design:

- Sectioned settings, sticky save bar.
- Critical config can confirm dialog.
- Copy professional, khong generic.

## 9. Interaction Principles
- Moi trang tra loi 4 cau: “Nen tang dang the nao?”, “Rui ro o dau?”, “Can duyet/xu ly gi?”, “Tac dong tai chinh la bao nhieu?”
- Admin action co rui ro cao phai co confirm: suspend, reject, payout, delete, config finance.
- Sau moi update co toast va row state cap nhat.
- Filter/search nen giu state trong session neu co the.
- Drawer detail phai co action footer sticky.
- Tables phai co empty state va loading/skeleton neu future data async.

## 10. i18n & Content
- Tat ca text moi cho admin phai co key trong `en.json` va `vi.json`.
- Khong hardcode English-only hoac Vietnamese-only trong component.
- Sidebar/header cung phai song ngu.
- Copy nen ngan, ro, executive:
  - Good: “Review payout”, “Suspend shop”, “Approve shipper”.
  - Avoid: “Awesome”, “Super”, “Elevate”, “Next-gen”.

## 11. Accessibility
- Contrast AA tren dark shell va light cards.
- Icon-only button phai co `aria-label`.
- Focus ring ro bang Electric Cyan/Sapphire.
- Table header ro, inputs co label/aria-label.
- Form error inline, khong chi toast.
- Khong an thong tin quan trong sau hover-only.

## 12. Responsive Rules
- Desktop: sidebar + top command + 2/3 column data workspace.
- Tablet: sidebar collapsible, content 1-2 cot.
- Mobile: single column, filters collapse thanh drawer/stack.
- Tables co the horizontal scroll noi bo trong card neu qua nhieu cot, nhung page khong duoc horizontal scroll.
- Touch target toi thieu 44px.

## 13. Phase Plan
### Phase 1 - Admin shell foundation
- Redesign `AdminDashboard`, `AdminSidebar`, `AdminHeader`.
- Tao admin tokens/theme rieng trong `AdminDashboard.css`.
- Bo emoji avatar, dong bo icons, them EN/VI cho shell.
- Them profile drawer/admin account quick view neu can.

### Phase 2 - `/admin/overview`
- Executive command overview.
- KPI, platform health, risk/action queue, growth snapshot.
- Link nhanh den approvals/finance/incidents.

### Phase 3 - `/admin/shops`
- Partner shop management workspace.
- Pending approval queue, shop table, detail drawer, status/subscription actions.

### Phase 4 - `/admin/shippers`
- Shipper operations workspace.
- Pending document review, active fleet, earnings/performance, detail drawer.

### Phase 5 - `/admin/customers`
- Customer operations workspace.
- Customer table, complaint/risk queue, customer detail drawer.

### Phase 6 - `/admin/finance`
- Finance command center.
- GMV/commission/payout/tax KPIs, payout queue, fee config, audit-safe interactions.
- Sua lint cu trong file finance: unused setter va impure `Date.now()` trong render.

### Phase 7 - `/admin/promotions`
- Campaign and marketing workspace.
- Active/scheduled/expired campaigns, usage, budget, ROI, create/edit validation.
- Sua lint cu: unused `setAchievements`.

### Phase 8 - `/admin/analytics`
- Premium analytics workspace.
- Growth, geography, demand, insight rail, export.

### Phase 9 - `/admin/settings`
- System settings workspace.
- Sections, sticky save bar, validation, critical confirm.

### Phase 10 - QA/i18n/lint
- Route check EN/VI cho tat ca admin pages.
- `npm run build`.
- Targeted lint tung admin page.
- Full lint va ghi nhan/sua loi con lai trong admin scope.

## 14. Acceptance Checklist
Moi admin page sau redesign can dat:

- Co page title, subtitle, primary action/date range neu can.
- Co KPI hoac summary so lieu lien quan.
- Co bang/list hoac workspace thao tac thuc te.
- Co drawer/detail state cho row quan trong.
- Co search/filter/reset.
- Co empty state.
- Co responsive mobile/tablet.
- Co EN/VI copy cho text moi.
- Khong hardcode mixed language.
- Khong dung emoji lam avatar/icon.
- Build pass va lint targeted pass.

## 15. Short Summary
Admin LaundryGo nen tro thanh mot executive command center rieng biet: dark premium shell, light dense data surfaces, so lieu minh bach, action queue ro, risk/finance/admin approval workflows noi bat va toan bo copy song ngu.
