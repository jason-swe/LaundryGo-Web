# Shop Owner Design System: LaundryGo Partner Console

## 1. Muc tieu tai lieu
`shopdesign.md` la design standard rieng cho luong Shop Owner trong LaundryGo. Tai lieu nay dung de redesign va kiem tra cac trang shop dashboard sao cho giao dien:

- Chuyen nghiep, lich su, dang tin cay.
- Ro rang ve don hang, thoi gian, trang thai, doanh thu va viec can lam tiep theo.
- Ho tro nguoi dung la chu cua hang/quan ly van hanh, khong phai khach dat dich vu.
- Giu duoc nhan dien LaundryGo nhung co cam giac operational console hon user flow.

Khong ap dung phong cach landing page/marketing cho shop owner. Day la san pham lam viec hang ngay, can tinh gon, de scan, de thao tac lap lai.

## 2. Pham vi trang shop
Shop owner routes hien tai trong app:

- `/shop/overview` - tong quan van hanh, KPI, don gan day, dich vu noi bat.
- `/shop/orders` - quan ly don hang, loc, xem chi tiet, cap nhat trang thai.
- `/shop/operations` - quan ly menu dich vu, may moc, vat tu, ton kho.
- `/shop/staff` - nhan su, ca lam, hieu suat.
- `/shop/revenue` - doanh thu, thanh toan, doi soat.
- `/shop/documents` - tai lieu, giay to, hop dong, ho so doi tac.
- `/shop/incidents` - su co, khieu nai, bao cao, xu ly.
- `/shop/settings` - cau hinh shop, thong bao, chinh sach, tai khoan.

Khong doi URL structure khi redesign. Uu tien JSX/CSS va shared components, khong thay doi data contract lon neu chua can.

## 3. Design Read
Day la dashboard van hanh cho shop owner, doi tuong la nguoi can quan ly don, nhan su, dich vu va doanh thu trong ngay. Ngon ngu thiet ke nen la:

- **Professional operations console**, khong phai landing page.
- **Calm, precise, accountable**, moi module noi ro viec dang xay ra va viec can lam.
- **Blue-white brand base**, them mot sac teal/green rat tiet che cho operational health.
- **Density 7/10**, vi shop owner can nhieu thong tin tren mot man hinh.
- **Variance 3/10**, layout du doan duoc, khong qua nghe thuat.
- **Motion 3/10**, chi animation nhe cho hover, state change va loading.

## 4. Color Palette & Roles
Shop owner co the bien che tu theme user, nhung phai giu nhan dien LaundryGo.

- **Partner Navy** (`#0b416a`) - primary brand, sidebar active, primary CTA, important status, selected tabs.
- **Operational Blue** (`#2f6f9f`) - secondary action, links, chart series chinh, focus border.
- **Soft Blue Mist** (`#eef5fb`) - page background, quiet section background, table header tint.
- **Surface White** (`#ffffff`) - card, table, modal, drawer, form surface.
- **Ink Slate** (`#0f172a`) - title, important values, table primary text.
- **Body Slate** (`#475569`) - body text, labels, row metadata.
- **Muted Slate** (`#64748b`) - helper text, secondary metadata.
- **Border Blue Grey** (`#d8e4ee`) - card border, table line, input border.
- **Hover Blue** (`#f0f7ff`) - table row hover, filter hover, soft active background.
- **Operational Teal** (`#2f7d68`) - success, healthy machine, paid, completed. Use only for state.
- **Attention Amber** (`#b7791f`) - warning, low supplies, pending review. Use only for state.
- **Incident Red** (`#b42318`) - overdue, incident, failed payment, critical validation.

Rules:
- Khong dung purple, neon, gradient manh, glow bong bay.
- Khong dung pure black `#000000`.
- Trang shop nen co nhieu nen trang va duong vien hon nen mau dac.
- Mau trang thai phai co label text, khong chi dua vao mau.

## 5. Typography
- Use **Geist** hoac **Satoshi** cho UI chinh.
- Use **Geist Mono** hoac **JetBrains Mono** cho order ID, timestamps, revenue, phone, document ID.
- Dashboard labels: 11-12px uppercase, font-weight 750-850, letter spacing vua phai.
- Table body: 13-14px, line-height 1.45.
- Page title: 24-30px desktop, 21-24px mobile.
- Card title: 15-18px, khong dung hero-scale type trong dashboard cards.
- Number values can dung 22-30px trong KPI cards, nhung khong lam layout bi chen.

## 6. Layout Foundation
Shop dashboard nen co 3 lop co dinh:

1. **Sidebar navigation**
   - Ben trai, compact, ro nhom: Overview, Management, Support, Settings.
   - Active item dung `#0b416a` hoac soft active `#e8f2fb`.
   - Icon stroke weight dong nhat, uu tien `lucide-react`.

2. **Top command bar**
   - Search, notification, profile, quick actions.
   - Khong qua cao; giu focus cho noi dung.
   - Co the sticky neu table/page dai.

3. **Content canvas**
   - Max width linh hoat theo dashboard, khong can can giua qua chat.
   - KPI row + action row + main working surface.
   - Grid phai collapse sach tren mobile/tablet.

Spacing:
- Page padding desktop: 24-32px.
- Card padding: 16-20px.
- Table cell padding: 12-16px.
- Section gap: 18-24px.
- Touch target toi thieu 44px tren mobile.

## 7. Shared Components
### KPI Cards
- Hien label, value, trend, thoi gian ap dung.
- Trend khong chi dung mau, phai co text nhu "vs last week".
- Neu value dang loading, dung skeleton cung kich thuoc.

### Tables
- Table la core component cua shop dashboard.
- Header nen co sort/filter ro rang.
- Row hover dung `#f0f7ff`.
- Sticky header neu table dai.
- Bulk actions chi hien khi co selected rows.
- Empty state phai co CTA tao/sua data neu phu hop.

### Status Badges
- Dung badge nho, radius 999px, text 12px, weight 750.
- Status order nen gom: New, Accepted, Picked up, In wash, Quality check, Ready, Out for delivery, Completed, Cancelled, Incident.
- Badge mau phai mapping on dinh tren tat ca trang.

### Buttons
- Primary: `#0b416a` fill, white text.
- Secondary: white fill, border `#d8e4ee`, text `#0b416a`.
- Destructive: chi dung cho delete/cancel/incident critical, text ro rang.
- Buttons phai co loading/disabled state neu thao tac cap nhat data.

### Forms
- Label nam tren input.
- Helper text va error text nam duoi input.
- Required fields co dau ro rang bang text, khong chi mau.
- Form dai nen chia thanh sections hoac drawer.

### Drawers & Modals
- Dung drawer ben phai cho order detail, service edit, incident detail.
- Modal chi dung cho confirm destructive action hoac quick small form.
- Drawer phai co title, metadata, action footer sticky.

### Timeline
- Dung cho order status va incident resolution.
- Moi moc co status, actor, timestamp, note neu co.
- Timeline can doc duoc khi khong co realtime backend.

### Charts
- Bieu do doanh thu/analytics phai don gian, co legend va tooltip.
- Dung toi da 3 series tren mot chart.
- Number format phai nhat quan VND, order count, percentage.

## 8. Page UX Requirements
### `/shop/overview`
Can hien:
- Today orders, pending pickup, active washing, ready for delivery, revenue today.
- Recent orders table voi action nhanh.
- Operational alerts: low supplies, machine issue, overdue orders.
- Top services va peak hours.

Design:
- KPI row tren cung.
- Main grid: recent orders lon, alerts/top services nho.
- Khong dung hero marketing.

### `/shop/orders`
Can hien:
- Search by order ID/customer/phone.
- Filters: status, payment, pickup date, delivery date.
- Table/list don hang.
- Drawer chi tiet don: customer, services, pickup/delivery, payment, notes, timeline.
- Actions: accept, update status, assign staff/driver, mark incident.

Design:
- Trang nay uu tien density va scannability.
- Status badge va next action phai ro hon decorative UI.

### `/shop/operations`
Can hien:
- Service menu management.
- Machine status.
- Supplies/inventory.
- Low stock warning.

Design:
- Tabs hoac segmented controls: Services, Machines, Supplies.
- Service cards/table phai hien price, pricing type, estimated time, min order, availability.
- Edit form dung drawer.

### `/shop/staff`
Can hien:
- Staff list, role, shift, workload, performance.
- Add/edit staff.
- Schedule/shift blocks.

Design:
- Staff table + schedule panel.
- Avatar dung initials/icon, khong dung emoji.

### `/shop/revenue`
Can hien:
- Revenue KPI, payout status, unpaid/paid, fee breakdown.
- Transaction table.
- Date range controls.

Design:
- So tien dung mono/tabular numbers.
- Doi soat phai minh bach: gross, platform fee, refund, net payout.

### `/shop/documents`
Can hien:
- Document status: verified, pending, expired, missing.
- Upload/update document.
- Contract/compliance notes.

Design:
- Document cards/table, clear expiry date.
- Warning state cho document sap het han.

### `/shop/incidents`
Can hien:
- Incident queue, severity, owner, SLA, status.
- Detail drawer with timeline and resolution notes.

Design:
- Critical information first: severity, due time, customer/order, required action.
- Khong de mau do chiem toan page; chi dung cho severity.

### `/shop/settings`
Can hien:
- Shop profile, business hours, pickup area, notifications, payment info, service policies.
- Save state va inline validation.

Design:
- Settings chia section, khong gom tat ca vao mot form dai.
- Save bar sticky bottom neu form dai.

## 9. Shop Owner Interaction Principles
- Moi trang phai tra loi 3 cau hoi: "Dang co gi?", "Can lam gi tiep?", "Neu co loi thi xu ly o dau?"
- Table row action phai gan voi row, bulk action phai ro khi selected.
- Khong an thao tac quan trong trong menu 3 cham neu do la action chinh.
- Dung confirmation cho destructive/cancel/refund.
- Sau khi update status, UI phai co toast/inline success va timeline cap nhat.
- Search/filter phai giu state khi quay lai trang trong cung session neu co the.

## 10. Content & i18n
- Tat ca text moi cho shop dashboard phai co tieng Anh va tieng Viet.
- Khong hardcode visible copy trong React component neu dang redesign.
- Copy phai ngan, ro, professional.
- Tranh cac cum marketing nhu "Elevate", "Next-gen", "Unleash".
- Dung command verbs ro rang: Accept, Assign, Update status, Resolve, Export, Save.

## 11. Accessibility
- Contrast phai dat WCAG AA cho text.
- Keyboard focus visible tren button, input, table row action.
- Icon-only button phai co `aria-label`.
- Form error phai gan voi field, khong chi hien toast.
- Data table phai co header ro rang.
- Khong dung hover-only de lo thong tin quan trong.

## 12. Responsive Rules
- Desktop: sidebar + content grid.
- Tablet: sidebar co the collapse, content 1-2 columns.
- Mobile: single column, sticky bottom action neu can.
- No horizontal scroll.
- Table tren mobile co the chuyen sang row cards neu qua nhieu cot.
- Text trong button/card khong duoc overflow.

## 13. Motion
- Transition 150-220ms cho hover, focus, drawer open, tab switch.
- Animate transform/opacity only.
- Khong dung animation lien tuc tren dashboard tru khi la subtle live indicator.
- Loading state dung skeleton, khong dung spinner tron chung chung cho table.

## 14. Anti-patterns
- Khong dung landing hero trong dashboard shop.
- Khong dung card long nhau nhieu lop.
- Khong dung gradient/neon/purple.
- Khong dung emoji lam avatar/icon.
- Khong hardcode English-only copy.
- Khong dung placeholder generic nhu John Doe, Acme.
- Khong de table/action bi roi rac khong co next action.
- Khong chi dung mau de truyen dat status.
- Khong them UI decorative lam giam kha nang scan don hang.

## 15. Implementation Notes
- Giu route trong `src/App.jsx`.
- Uu tien shared shop components neu bat dau redesign: `ShopPageHeader`, `ShopKpiCard`, `ShopStatusBadge`, `ShopDataTable`, `ShopDrawer`, `ShopEmptyState`, `ShopActionBar`.
- Dung CSS variables/token trong global hoac shop-specific stylesheet neu co the.
- Neu dung mock data, giu contract hien tai tru khi co ly do ro.
- Sau moi buoc redesign shop, chay `npm run build` va lint cac file lien quan.

## 16. Acceptance Checklist
Moi shop page sau redesign can dat:

- Co page title va context ro.
- Co primary action neu page can thao tac.
- Co empty/loading/error state.
- Co responsive mobile khong horizontal scroll.
- Co EN/VI copy cho text moi.
- Co keyboard/focus state cho controls.
- Co status badge nhat quan.
- Co du thong tin de shop owner ra quyet dinh ma khong phai doan.
