# LaundryGo - Product & Requirement Brief (for implementation)

## 1. Muc tieu tai lieu
Tai lieu nay tong hop lai:
- Gia tri bai toan va ly do ton tai nen tang LaundryGo.
- Requirement chuc nang cho User.
- Khung phap ly can co de van hanh hop le tai Viet Nam.
- De xuat MVP, phase implementation va checklist code.

Ghi chu: Day la tai lieu dinh huong san pham va ky thuat, KHONG phai tu van phap ly chinh thuc.

---

## 2. Tong quan bai toan
LaundryGo la nen tang cung cap dich vu giat ui va giao nhan tan noi, ket noi 3 ben:
- Nguoi dung (User)
- Cua hang/doi tac giat ui (Shop Partner)
- Don vi giao nhan (Shipper)

## 3. Vi sao can nen tang nay
1. Nhu cau thuc te:
- Nguoi dung ban ron, khong co thoi gian giat ui thu cong.
- Can dat dich vu nhanh, khong can den tiem.

2. Tien loi va nhanh chong:
- Dat lich pickup/delivery moi luc moi noi.
- Quy trinh ngan: chon dich vu -> chon lich -> thanh toan.

3. Minh bach gia va dia diem:
- Bang gia cong khai, han che phi an.
- Hien thi cua hang gan nhat, de so sanh.

4. Uu dai va ca nhan hoa:
- Voucher khach moi, khach than thiet, combo dinh ky.

5. Da dang dich vu + theo doi don:
- Giat thuong, giat kho, do cao cap, chan men, rem cua...
- Trang thai don real-time: Da nhan -> Dang giat -> Dang giao -> Hoan tat.

6. Dam bao chat luong:
- Co co che phan hoi, danh gia, boi thuong neu su co.
- Doanh nghiep toi uu van hanh, de mo rong quy mo.

---

## 4. Gia tri mang lai
### 4.1 Cho cua hang
- Tu dong hoa tiep nhan don, giam sai sot thu cong.
- Quan ly trang thai don, khach hang, lich su giao dich.
- Tang doanh thu nho kenh online va chuong trinh khuyen mai.
- Minh bach tai chinh theo ngay/thang.
- Mo rong tap khach nho ket noi shipper.

### 4.2 Cho khach hang
- Dat don nhanh, thao tac don gian.
- Pickup/delivery tan noi, tiet kiem cong suc.
- Chu dong chon khung gio.
- Gia ro rang, de so sanh.
- Nhieu uu dai va tich diem.
- An tam hon nho tracking va danh gia cong dong.

---

## 5. Yeu cau phap ly (Viet Nam) - muc can nghien cuu va trien khai
## 5.1 Tu cach phap nhan va dang ky kinh doanh
Bat buoc uu tien:
- Dang ky doanh nghiep/ho kinh doanh hop le.
- Co Ma so thue (MST) do co quan nha nuoc cap.
- Nganh nghe dang ky phu hop mo hinh (thuong mai dien tu, dich vu ho tro, van tai/giao nhan neu co tham gia truc tiep).

Canh bao quan trong:
- Neu platform thu tien, chia doanh thu, dieu phoi don cho doi tac can ra soat cau truc hop dong va nghia vu thue.

## 5.2 Dieu kien van hanh website/app thuong mai dien tu
Can kiem tra va dap ung:
- Co chinh sach bao mat thong tin va dieu khoan su dung cong khai.
- Co quy che hoat dong nen tang (vai tro cac ben, quyen va nghia vu).
- Co co che giai quyet khieu nai/hoan tien/boi thuong.
- Co co che luu vet giao dich va doi soat.
- Co kenh lien he CSKH ro rang.

## 5.3 Bao ve du lieu ca nhan
Can trien khai toi thieu:
- Chinh sach thu thap va xu ly du lieu ro rang.
- Xin su dong y cua nguoi dung cho muc dich xu ly du lieu.
- Co co che xoa/sua thong tin theo yeu cau hop le.
- Han che quyen truy cap noi bo theo vai tro.

## 5.4 Thanh toan
Neu co thanh toan online:
- Su dung cong thanh toan hop le.
- Co doi soat giao dich, trang thai thanh toan, xu ly hoan tien.
- Luu lich su thanh toan day du de kiem toan/noi bo.

## 5.5 Hop dong voi doi tac
Can co bo hop dong/chinh sach:
- Hop dong hop tac voi cua hang.
- Quy che/chat luong dich vu va SLA.
- Chinh sach boi thuong khi hu hong/that lac.
- Quy dinh doanh thu, phi nen tang, doi soat va thanh toan.

---

## 6. Functional Requirements (FOR USER)
### 6.1 Trang chu
- Gioi thieu nen tang.
- Danh sach cua hang doi tac noi bat.
- Goi uu dai/khuyen mai hien hanh.
- Blog/meo cham soc quan ao.

### 6.2 Tai khoan thanh vien & thanh toan
- Dang ky/dang nhap/dang xuat.
- Quan ly thong tin ca nhan.
- Thanh toan online hoac COD sau dich vu.

### 6.3 Dat dich vu (Booking)
- Chon loai dich vu (giat say, giat kho, giat giay...).
- Hien thi gia minh bach theo loai do/so luong.
- Ghi chu tinh trang do (vet ban, de hu hong, uu tien...).

### 6.4 Lap lich giao nhan
- Chon dia diem pickup/delivery.
- Chon thoi gian pickup/delivery.
- Goi y cua hang gan nhat.
- Ho tro toi uu lo trinh giao nhan.

### 6.5 Theo doi don hang & thong ke
- Tracking real-time theo cac moc:
  - Shipper dang den lay
  - Cua hang da nhan & kiem tra
  - Dang giat
  - Dang giao tra
  - Hoan tat
- Lich su don hang.
- Thong ke chi tieu va tong kg da giat.

### 6.6 Thong bao dinh ky
- Thong bao trang thai don qua app/email.
- Thong bao khuyen mai ca nhan hoa.

### 6.7 Tich diem
- Cong diem theo so lan dung hoac gia tri don.
- Vi du quy doi (tam tham chieu): 100d = 1 diem; 1 diem co gia tri uu dai theo rule.

### 6.8 Danh gia & nhan xet
- Rating cua hang sau moi don.
- Feedback cho shipper.
- Hien thi danh gia de cong dong tham khao.

### 6.9 Ho tro truc tuyen
- Chat voi cua hang hoac CSKH.
- Xu ly su co: that lac, hu hong, giao tre, sai don...

---

## 7. Non-functional Requirements
- Hieu nang: thao tac dat don va cap nhat trang thai phan hoi nhanh.
- On dinh: he thong khong mat trang thai don khi refresh/reconnect.
- Bao mat: du lieu nguoi dung duoc bao ve, phan quyen theo vai tro.
- Minh bach: lich su don va lich su thanh toan co the doi soat.
- Kha nang mo rong: de them cua hang, them shipper, them khu vuc.

---

## 8. Role matrix (ban dau)
1. User:
- Dat don, theo doi don, thanh toan, danh gia, chat ho tro.

2. Shop:
- Nhan don, cap nhat trang thai xu ly, quan ly bang gia, quan ly su co.

3. Shipper:
- Nhan lenh pickup/delivery, cap nhat vi tri/trang thai, xac nhan giao nhan.

4. Admin:
- Duyet doi tac, quan ly don toan he thong, cau hinh phi/chiet khau, giai quyet tranh chap.

---

## 9. MVP de xuat (uu tien code)
Phase 1 - Core flow:
- Auth co ban (signup/login/logout).
- Danh sach cua hang + chi tiet cua hang.
- Booking + schedule pickup/delivery.
- Tracking trang thai don hang co ban.
- Lich su don hang co ban.

Phase 2 - Business value:
- Thanh toan online + COD.
- Khuyen mai/voucher.
- Danh gia va feedback.
- Thong bao trong app.

Phase 3 - Scale & optimization:
- Tich diem/loyalty.
- Dashboard thong ke nang cao.
- Chat realtime + SLA support.
- Toi uu route giao nhan.

---

## 10. Mapping voi code hien tai (frontend)
Da co san trong project:
- Routing da tach theo 3 dashboard + luong user.
- Trang customer flow co ban: landing, all shops, detail, confirm, track.
- Mock data JSON phong phu cho shop/admin/driver.
- Co utility auth localStorage va dataManager localStorage.
- Auth guard dang duoc tam bo qua trong giai doan prototype/test de truy cap truc tiep shop/admin/driver/user pages.
- Landing page da co intro video fullscreen `/outputmp_.mp4`, chi chay 1 lan moi session, nut skip hien sau 3 giay, fade ve hero dung `/framecuoi.png`.
- Da co navbar user chung `src/components/UserNavbar.jsx` cho cac trang user-facing, gom Services, All Shops, Track Order, EN/VI toggle, Login, Sign Up.
- Language switcher da la EN/VI segmented toggle co animation; tat ca copy user-facing moi phai co key song ngu trong `src/locales/en.json` va `src/locales/vi.json`.
- Trang `/all-shops` da duoc redesign thanh shop discovery page: hero nho, search, sticky filter/sort panel, responsive shop cards, empty state, copy song ngu.
- Trang `/all-shops/:id` da duoc redesign thanh shop detail + service selection flow: hero shop, meta cards, service inspector hien thoi gian giat/thoi gian xu ly/min order/pricing type/availability khi bam tung dich vu, quantity stepper, sticky order summary, promo/reviews, CTA schedule disabled khi chua chon dich vu, copy UI song ngu.
- User flow co pending cart prototype nhu Shopee: khi user add service nhung chua thanh toan/confirm thi cart duoc luu `localStorage` key `laundrygo_pending_cart`, hien widget noi goc phai qua `UserNavbar`, co nut tiep tuc schedule va tu het han sau 7 ngay; clear khi confirm order.
- Trang `/all-shops/:id/schedule` da duoc redesign thanh schedule/payment flow: dung `UserNavbar`, hero stepper, address selection + add address validation, pickup/delivery time slot voi empty state, payment method cards, sticky order summary lay tu cart/pending cart, confirm disabled khi thieu cart/address/time slot, copy UI song ngu.
- Trang `/all-shops/:id/confirm` da duoc redesign thanh success page: dung `UserNavbar`, hero success, order ID, pickup/delivery, address, payment method, order summary, next steps, CTA Track Order va Book another order, copy UI song ngu.
- Trang `/all-shops/:id/track` da duoc redesign thanh order tracking page: dung `UserNavbar`, empty state khi khong co order state, hero live tracking, timeline doc de doc, map mock gon, driver/support cards, pickup/address cards, order summary lay tu cart state, copy UI song ngu.
- Trang `/information` da duoc redesign thanh profile dashboard: dung `UserNavbar`, hero account, stats, personal info form, inline validation, save/reset disabled state, save status, default address card, recent order shortcut, quick action booking, copy UI song ngu.
- Shop redesign Phase 1 da bat dau: shop shell/foundation da duoc nang cap theo `shopdesign.md`, gom `ShopDashboard`, `ShopSidebar`, `ShopHeader`, token mau partner console, sidebar rieng, top command bar rieng, avatar initials thay emoji, copy shell song ngu.
- Shop redesign Phase 2 da hoan thanh cho `/shop/overview`: operations overview moi gom KPI chinh, recent orders table, peak hours chart, operational alerts, machine status, top services, supplies inventory, all-orders modal, copy UI song ngu.
- Shop redesign Phase 3 da hoan thanh cho `/shop/orders`: order operations workspace moi gom KPI queue, search/payment filter, bang don hang day du, drawer chi tiet sticky, timeline, check-in flow, create/edit/reset/export actions, status next action va copy UI song ngu.
- Shop redesign Phase 4 da hoan thanh cho `/shop/operations`: operations control workspace moi gom KPI service/machine/supply, segmented tabs, search, service list, machine cards, supply inventory cards, detail drawer, create/edit modal, delete confirm, toggle availability va copy UI song ngu. Loi lint cu `getStatusColor is not defined` da duoc loai bo.
- Shop redesign Phase 5 da hoan thanh cho `/shop/staff`: staff operations workspace moi gom KPI nhan su, attendance overview, shift plan, search/filter team directory, staff detail drawer, attendance toggle, notes achievement/violation, add/edit/delete staff modal va copy UI song ngu.
- Shop redesign Phase 6 da hoan thanh cho `/shop/revenue`: finance operations workspace moi gom KPI doanh thu/phi/thuc nhan/don hang, revenue trend chart theo ky, payout summary, breakdown theo service/payment, bang doi soat don hang, export CSV va copy UI song ngu.
- Shop redesign Phase 7 da hoan thanh cho `/shop/documents`: compliance library workspace moi gom KPI tai lieu/xac minh/sap den han/qua han, search/category/status filters, document list, detail drawer, upload form co inline validation, renew/delete confirm va copy UI song ngu.
- Shop shell profile drawer da hoan thanh: nut `View Profile` trong header mo drawer ho so doi tac gom shop identity, contact, operating hours, capacity, tax code, audit note, CTA den settings va copy UI song ngu.
- Admin redesign standard da duoc tao trong `admindesign.md`: admin se dung theme rieng kieu Executive Command Center voi dark premium shell, light dense data surfaces, day du so lieu, risk/action queues, finance transparency va copy UI song ngu EN/VI.
- Admin redesign Phase 1 da hoan thanh: admin shell foundation moi gom `AdminDashboard`, `AdminSidebar`, `AdminHeader`, token mau Executive Command Center, dark premium sidebar, top command bar, language toggle, localized admin nav, initials avatar thay emoji va spacing shell/canvas duoc can chinh.
- Admin redesign Phase 2 da hoan thanh cho `/admin/overview`: executive overview moi gom KPI GMV/commission/active shops/shippers/customers/risk queue, revenue trend chart, action review queue, top partner shops, risk/SLA panel, top districts, export report, review modal va copy UI song ngu.
- Admin redesign Phase 3 da hoan thanh cho `/admin/shops`: partner marketplace workspace moi gom KPI shop/approval/premium/suspended/revenue, tabs all shops/approvals/documents, dense shop table, sticky partner profile drawer, approval cards, document review table va copy UI song ngu.
- Admin theme correction da thuc hien sau feedback: bo dark sidebar doi voi light canvas, chuyen admin sang light premium utilitarian/minimalist system, giam mau KPI/chart, chi dung Primary Blue `#245b9e` cho accent chinh va green/amber/red rat tiet che cho status. `admindesign.md` da cap nhat de khong lap lai loi tron dark shell voi nen trang va qua nhieu accent mau.
- Admin redesign Phase 4 da hoan thanh cho `/admin/shippers`: fleet operations workspace moi gom KPI doi giao nhan, tabs all/approvals/top/payments, bang shipper co cot fixed de tranh chen chu, detail drawer sticky, approval cards, payout queue va copy UI song ngu EN/VI theo theme admin light minimalist.
- Admin redesign Phase 5 da hoan thanh cho `/admin/customers`: customer intelligence workspace moi gom KPI khach hang/VIP/don hang/doanh thu/khieu nai, tabs all/VIP/inactive/complaints, bang customer co cot fixed, detail drawer sticky, complaint cards, create/edit/delete modal va copy UI song ngu EN/VI theo theme admin light minimalist.
- Admin redesign Phase 6 da duoc lam lai cho `/admin/finance`: finance command workspace moi gom KPI GMV/commission/pending payable/shop earnings/shipper cost, chart doi soat 2 series, payout risk panel, tabs shop revenue/payout queue/transactions/audit trail, shop statement detail sticky, payout confirm modal, finance config modal co inline validation, khong dung `Date.now()` trong render va copy UI song ngu EN/VI theo theme admin light minimalist.
- Admin redesign Phase 7 da hoan thanh cho `/admin/promotions`: marketing control workspace moi gom KPI campaign/usage/discount/reward, budget burn panel, insight card, tabs campaigns/achievements/rules, search/status filter, campaign table co cot fixed, detail panel sticky, create/edit/delete modal co validation inline va copy UI song ngu EN/VI theo theme admin light minimalist.
- Admin redesign Phase 8 da hoan thanh cho `/admin/analytics`: platform intelligence workspace moi gom KPI tang truong, segmented period/metric controls, trend chart, insight rail co recommended actions, service demand, top districts, partner ranking table, export report toast va copy UI song ngu EN/VI theo theme admin light minimalist.
- Admin redesign Phase 9 da hoan thanh cho `/admin/settings`: system control workspace moi gom platform profile, notifications, operating policy, security/approval, integrations, summary strip, dirty/saved state, sticky save bar, inline validation, confirm modal cho thay doi nhay cam va copy UI song ngu EN/VI theo theme admin light minimalist.
- Admin settings da duoc polish lai sau feedback UI/margin: doi sang workspace co rail trai sticky, section nav, summary compact, card mot cot de form canh deu hon, save bar can theo workspace, fix label option bi hardcode/mojibake va bo sung i18n key cho region/language/interval/gateway labels.
- Admin finance da duoc redesign lai theo huong table-first sau feedback: them ledger control strip, search/status filter cho bang doi soat, selected row co rail nhan dien ro, sticky table header, payout queue va transaction ledger doi sang dang table, statement detail co action review/export va copy song ngu EN/VI.
- Admin redesign Phase 10 QA da hoan thanh cho admin scope: `npx eslint src/AdminDashboard` pass, `npm run build` pass, 16 route admin EN/VI (`/admin/*` va `/vn/admin/*`) deu tra 200, khong con conflict marker/`Date.now()`/native alert-confirm trong `src/AdminDashboard`. Full `npm run lint` van fail do loi ngoai admin scope o `src/Dashboard/Overview`, `src/DriverDashboard/Settings`, `src/SignUp`, `src/components/OrderStatusBadge`, `src/shared/lib/i18n/TranslationContext`.

Can nang cap de dat requirement day du:
- Dong bo auth that (backend + token/session an toan).
- Real-time tracking that (websocket/SSE/polling).
- Payment gateway that + doi soat.
- Loyalty engine + voucher rules.
- Review moderation + complaint workflow.
- Legal pages va consent flow (privacy/terms).
- User flow redesign da hoan tat cac trang duoc yeu cau: landing, all-shops, detail, schedule, confirm, track, information. Auth/login/register duoc user yeu cau bo qua trong buoc nay.
- Auth backend integration da hoan thanh cho Phase 1/2: login/logout/register/verify/resend-otp/me, token luu `localStorage` key `laundrygo_auth`, navbar user hien account khi login, route guard co ban da bat lai cho user flow phu hop.
- Booking API integration Phase 1 da bat dau va da hoan thanh phan shop discovery/detail/services:
  - Tao `src/utils/bookingApi.js` de goi booking/shop APIs va normalize response envelope.
  - `/all-shops` da goi `GET /api/v1/shops` voi query `page,size,sort,topStar,nearby,express,budget`; co skeleton loading va fallback mock khi API loi.
  - `/all-shops/:id` da goi `GET /api/v1/shops/{shopId}` va `GET /api/v1/shops/{shopId}/service-categories`; service categories tu BE duoc render dynamic, mock chi con fallback.
  - Pending cart tren detail shop da luu them `serviceId`, `serviceName`, `serviceUnit` de Phase 2/3 tao order.
  - Da fix bug detail shop voi id BE dang so (`/all-shops/2`) trong khi mock local dang la `AS-002`: detail page match duoc ca exact id, trailing number va cached selected shop tu `sessionStorage`.
  - Cac note fallback API moi da co key song ngu trong `src/locales/en.json` va `src/locales/vi.json`.
- File tong hop API booking/auth da tao tai `api.md`.
- File handoff cho session tiep theo da tao tai `SESSION_HANDOFF.md`.

---

## 11. Data entities toi thieu can co
- User
- Address
- Shop
- Service
- PriceRule
- Order
- OrderItem
- PickupDeliverySchedule
- Payment
- Promotion
- LoyaltyPointLedger
- Notification
- RatingReview
- ChatThread/ChatMessage
- IncidentClaim

---

## 12. Acceptance Criteria (mau)
1. User dat don thanh cong:
- Chon duoc shop + service + khung gio pickup.
- He thong tao order id.
- User nhan thong bao xac nhan.

2. User theo doi don:
- Moi thay doi trang thai duoc cap nhat tren timeline.
- Co timestamp ro rang cho tung moc.

3. Minh bach gia:
- Tong tien hien truoc khi xac nhan.
- Hien ro phi phu thu (neu co).

4. Danh gia sau don:
- Chi danh gia khi don hoan tat.
- Luu rating + comment thanh cong.

---

## 13. Checklist implementation gan code (ngan han)
- Chot role va pham vi MVP trong sprint hien tai.
- Chuan hoa state order status dung 1 enum chung.
- Chuan hoa data contracts giua User-Shop-Shipper-Admin.
- Tach mock data va service layer de de doi backend.
- Bo sung trang Privacy Policy, Terms, Refund/Compensation.
- Bo sung module legal/compliance trong admin settings.
- Khi them UI/copy moi, khong hardcode text hien thi trong component; them key vao ca `en.json` va `vi.json`.
- User pages nen dung navbar chung `UserNavbar` de EN/VI toggle va dieu huong nhat quan.
- Booking cart pending phai co TTL 7 ngay trong prototype; khi len backend can mapping sang cart/order-draft server-side va xoa khi order da confirm/thanh toan.
- Khi tiep tuc booking MVP, uu tien Phase 2: noi schedule page voi delivery-address APIs, schedule APIs va payment-method APIs; sau do Phase 3 tao order bang `POST /api/v1/orders`.
- Do contract `POST /api/v1/orders` tren Swagger dang hien single service (`serviceId`, `quantity`) nhung UI co the chon nhieu service, implementation tiep theo can co fallback: neu BE chua ho tro `items[]` thi gui service dau tien truoc de MVP chay duoc.

---

## 14. Open questions can chot truoc khi code tiep
- Mo hinh phap ly cuoi cung: san TMDT, dich vu trung gian, hay don vi van hanh truc tiep?
- Nen tang co thu tien ho tuyen? Co chia doanh thu voi shop khong?
- Don vi nao chiu trach nhiem boi thuong khi hu hong/that lac?
- Co yeu cau GPS realtime den muc nao (phut/giay)?
- Rule loyalty/chiet khau cuoi cung la gi?

---

## 15. Tom tat 1 cau
LaundryGo huong den nen tang giat ui giao nhan tan noi minh bach, tien loi, co kha nang mo rong; buoc tiep theo la chot legal model + MVP core flow + contract du lieu de trien khai backend va real-time theo dung requirement.
