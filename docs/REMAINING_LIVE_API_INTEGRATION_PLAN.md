# Kế hoạch loại bỏ dữ liệu mock và hoàn thiện các API còn lại

> Ngày lập: 2026-08-19  
> Phạm vi: Rating, Auth, Shop profile/address/image, Shop Revenue/Staff/Documents/Settings/Notifications/Order CRUD, Driver Profile/Earnings/Settings/Notifications và việc loại bỏ toàn bộ fallback mock trong các màn hình đã có API.  
> Tài liệu liên quan: [SHOP_PAYMENT_VOUCHER_IMPLEMENTATION_PLAN.md](SHOP_PAYMENT_VOUCHER_IMPLEMENTATION_PLAN.md).

## 1. Mục tiêu và nguyên tắc bắt buộc

Mục tiêu cuối là các màn hình trong phạm vi chỉ hiển thị dữ liệu từ backend hoặc trạng thái `loading / empty / error / retry`; không lấy dữ liệu nghiệp vụ từ `src/data`, `localStorage` hoặc tự cập nhật thành công trong React state khi backend chưa xác nhận.

- Không giữ “fallback presentation data” khi API lỗi. API lỗi phải hiện error state và nút thử lại.
- Không gọi endpoint bằng `shopId`, `accountId` hoặc `shipperId` do frontend tự chọn cho các mutation thuộc tài khoản hiện tại. Backend phải suy ra resource owner từ JWT.
- Không hard-delete order nghiệp vụ. Thao tác “xóa” trên UI phải đổi thành cancel/archive theo rule backend.
- Chỉ giữ `localStorage` cho preference thuần client như ngôn ngữ, theme và lựa chọn giao diện; không dùng cho order, doanh thu, nhân viên, tài liệu, notification hoặc profile.
- Upload phải dùng multipart thật, validate MIME/size ở cả frontend lẫn backend và chỉ lưu URL backend trả về.
- Mỗi phase chỉ được đánh dấu hoàn thành khi contract test backend, lint file liên quan, production build và smoke test theo role đều pass.
- Không mở lại payout/VNPay legacy. Shop tiếp tục dùng commission statement/settlement hiện tại; Driver payout chỉ triển khai sau khi chốt riêng business rule.

## 2. Kết quả audit contract hiện tại

| Hạng mục | Trạng thái backend | Trạng thái frontend | Kết luận |
| --- | --- | --- | --- |
| Customer rating | Có `POST /api/v1/ratings` | Chưa có form | Nối được sau khi bổ sung API đọc trạng thái rating |
| Rating summary | Có endpoint nhưng path dùng `{id}`, method lại bind `shopId`/`shipperId` | Chưa gọi trực tiếp | Sửa binding trước khi nối |
| Shop address | Có create/get/update/delete | Settings chưa dùng | Phải sửa authorization/ownership trước |
| Shop image | Có upload/list/delete | Settings đang dùng base64 local | Phải sửa authorization/ownership và validation trước |
| Auth `/me` | Có | Route guard chỉ tin session trong localStorage | Nối được ngay |
| Reactivation | Controller dùng `/reactivation-requests` | Chưa có UI | SecurityConfig đang allow sai path số ít; phải sửa |
| Shipper registration | Có JSON contract | Chưa có route/form | Thiếu contract upload giấy tờ thật |
| Driver profile | Có `GET /api/v1/shippers/profile` | Overview gọi API, Profile page vẫn mock | Nối ngay cho chế độ read-only |
| Driver tasks/history | Có và đã gọi | Khi lỗi quay về mock | Bỏ fallback, thêm error/empty/retry |
| Shop operations | Service/machine/inventory CRUD đã có và đã gọi | Khi lỗi quay về local data | Bỏ fallback và mutation local |
| Shop revenue | Statement API chỉ đủ dữ liệu đối soát theo kỳ | Màn hình dùng mock chart/order | Cần read-model revenue mới |
| Shop staff/documents/notifications | Chưa có REST contract/persistence đầy đủ | Mock/local | Cần backend mới |
| Shop settings | Chỉ có address/image rời rạc | LocalStorage | Tách server-owned và client-only preference |
| Shop order create/edit/delete/export | Chỉ có Customer create/update/cancel và Shop status/inspection | UI còn handler local hoặc nút unavailable | Cần contract Shop Owner riêng; không tái dùng Customer endpoint |
| Driver earnings/payout/settings/notifications | Có DTO/mapper rời rạc; payout service đang chủ động throw `UnsupportedOperationException` | Mock | Cần chốt nghiệp vụ và hoàn thiện backend |

## 3. Phase 0 — Khóa contract và sửa lỗi bảo mật

Phase này bắt buộc hoàn thành trước khi nối Shop Settings hoặc shipper onboarding.

### 3.1 Rating contract

Backend:

- Sửa path thành `GET /api/v1/ratings/shops/{shopId}/summary` và `GET /api/v1/ratings/shippers/{shipperId}/summary`, hoặc khai báo rõ `@PathVariable("id")`; ưu tiên đổi template để tên biến nhất quán.
- Thêm `GET /api/v1/ratings/orders/{orderId}` cho Customer, trả:
  - `orderId`, `eligible`, `shopRated`, `shipperRated`.
  - Rating đã gửi nếu có: score/comment/createdAt theo từng target.
  - `shipperRatingAvailable=false` khi no-shipper mode hoặc không có delivery task hoàn thành.
- Thay lỗi dùng chung `ORDER_NOT_FOUND` cho duplicate/not-eligible bằng error code riêng: `RATING_NOT_ELIGIBLE`, `RATING_ALREADY_SUBMITTED`, `RATING_TARGET_UNAVAILABLE`.
- Validate phải có ít nhất một trong `shopScore` hoặc `shipperScore`; giới hạn độ dài comment.

### 3.2 Shop ownership và upload safety

Không nối trực tiếp các mutation hiện tại theo `shopId` cho tới khi hoàn tất các việc sau:

- Tạo owner-scoped contract:
  - `GET /api/v1/shop-owner/profile`
  - `PUT /api/v1/shop-owner/profile`
  - `GET /api/v1/shop-owner/address`
  - `PUT /api/v1/shop-owner/address` — upsert, không cần create/delete riêng cho màn Settings.
  - `GET /api/v1/shop-owner/images`
  - `POST /api/v1/shop-owner/images` — multipart `file`, `altText`, `displayOrder`.
  - `DELETE /api/v1/shop-owner/images/{imageId}`.
- Backend lấy Shop bằng owner của JWT và kiểm tra image thuộc đúng Shop trước khi xóa.
- Giữ public read-only `GET /api/v1/images/shops/{shopId}` cho trang shop detail; không public upload/delete.
- Giới hạn ảnh JPG/PNG/WebP, tối đa 5 MB; giới hạn số ảnh và bảo đảm `displayOrder` hợp lệ.
- Không cho `POST /api/v1/shops/addresses` nhận `shopId` tùy ý từ public request. Deprecate endpoint này sau khi owner-scoped API hoạt động.

### 3.3 Auth security

- Sửa public matcher từ `/api/v1/auth/reactivation-request` thành `/api/v1/auth/reactivation-requests`.
- Kiểm tra `/auth/me` trả account status mới nhất. Nếu role là Shop Owner, thêm `shopId`; nếu role là Shipper, thêm identifier cần cho UI hoặc để client lấy qua role profile API.
- Chuẩn hóa response 401/403 để frontend phân biệt token hết hạn, account inactive và role không hợp lệ.
- Thêm upload contract cho giấy tờ shipper. Phương án ưu tiên: `POST /api/v1/auth/shippers/register` nhận multipart gồm JSON `data` và các file giấy tờ; backend upload và tự gắn URL. Không cho form public nhập URL tùy ý.

### Tiêu chí hoàn thành Phase 0

- Controller/service tests chứng minh Customer không rating order người khác.
- Shop Owner không thể sửa address hoặc xóa image của shop khác.
- User chưa đăng nhập chỉ được đọc shop/image public, không mutation.
- Tài khoản inactive có thể gửi reactivation request mà không cần token.

## 4. Phase 1 — Auth session, reactivation và shipper signup

### Frontend service

Tạo/mở rộng `src/services/authApi.js` hoặc gom nhất quán vào `src/utils/auth.js`:

- `getCurrentSession()` → `GET /api/v1/auth/me`.
- `requestAccountReactivation({ email, reason })`.
- `registerShipper(formData)` theo multipart contract mới.

### UI flow

- `RequireAuth`:
  - Vẫn đọc token ban đầu để tránh flash, sau đó verify `/auth/me`.
  - Nếu 401: xóa session và điều hướng login.
  - Nếu account inactive: xóa session, điều hướng màn reactivation.
  - Đồng bộ lại role/name/status từ backend; không coi localStorage là nguồn sự thật cuối cùng.
- Login:
  - Khi backend trả account inactive/deleted, hiện CTA “Yêu cầu mở lại tài khoản”.
  - Form reactivation có email, lý do, loading/success/error và chống submit lặp.
- Thêm route `/shipper-signup` và `/vn/shipper-signup`:
  - Chia form thành account, identity, vehicle/license, emergency contact, bank account, uploads.
  - Validate cùng rule backend; hiển thị tiến trình upload/submit.
  - Chỉ bật route khi business cho phép tuyển shipper; nếu `logistics.shipper.enabled=false`, UI phải hiển thị trạng thái tạm ngừng đăng ký thay vì submit giả.

## 5. Phase 2 — Driver profile và bỏ fallback ở Tasks/History/Overview

### Có thể làm ngay

- `DriverProfile.jsx` gọi `getDriverProfile()` thay cho `driverProfile`/`driverPerformance` trong `src/data`.
- Chỉ render field backend thực sự trả: account, shipper information, bank account. Field performance chưa có contract phải ẩn, không lấy mock.
- `DriverTasks.jsx`, `DriverHistory.jsx`, `DriverOverview.jsx`:
  - Xóa import dữ liệu driver từ `src/data`.
  - Không set fallback khi request fail.
  - Có loading skeleton, empty, error message, retry.
  - Mọi accept/status/cash-confirm phải reload dữ liệu server sau thành công.

### Contract bổ sung cho Driver Settings

- `PUT /api/v1/shippers/profile` — thông tin cá nhân được phép sửa.
- `PUT /api/v1/shippers/vehicle` — vehicle/license data.
- `PUT /api/v1/shippers/emergency-contact`.
- `PUT /api/v1/shippers/bank-account`.
- `PUT /api/v1/shippers/preferences` — notification/work preferences nếu các preference này phải đồng bộ đa thiết bị.
- Ngôn ngữ/theme/navigation app có thể giữ local vì là preference thuần client, nhưng không dùng dữ liệu mẫu để khởi tạo profile.

## 6. Phase 3 — Customer rating sau khi hoàn thành order

### Frontend

Tạo `src/services/ratingApi.js`:

- `getOrderRating(orderId)`.
- `submitRating({ orderId, shopScore, shopComment, shipperScore, shipperComment })`.
- `getShopRatingSummary(shopId)` để shop detail không phụ thuộc vào field tổng hợp không rõ nguồn.

Tích hợp tại `TrackOrder.jsx`:

- Chỉ tải rating state khi order `COMPLETED`.
- Hiện form shop rating 1–5 sao và comment.
- Chỉ hiện shipper rating khi backend trả `shipperRatingAvailable=true`.
- Sau submit, reload rating từ backend và chuyển form sang read-only; không tự đánh dấu thành công cục bộ.
- Duplicate submit phải hiển thị trạng thái đã đánh giá, không hiện lỗi chung.

Shop detail:

- Summary lấy từ rating summary API.
- Không dựng review list giả. Backend hiện chưa có API review list; hoặc chỉ hiển thị average/count, hoặc bổ sung `GET /api/v1/ratings/shops/{shopId}?page&size` trước khi hiển thị comment list.

## 7. Phase 4 — Shop profile, address, image và Settings

Tạo `src/services/shopSettingsApi.js` dùng owner-scoped API từ Phase 0.

- Khi mở Settings, tải song song profile, address, images và server preferences nếu có.
- Address form dùng upsert thật; validate latitude/longitude là số và hỗ trợ trạng thái chưa có address.
- Image picker upload multipart; preview dùng URL backend; delete chỉ xóa sau khi API thành công.
- Không chuyển ảnh sang base64 và không lưu ảnh vào localStorage.
- Notification preference chỉ render khi có API. Security actions như đổi password/2FA phải ẩn cho tới khi có contract.
- Theme/language/refresh interval được tách thành “Thiết lập trên thiết bị này” và có thể lưu localStorage.
- `ShopHeader` lấy tên/avatar từ shop profile response, không từ `src/data`.

## 8. Phase 5 — Shop Operations: xóa fallback mock

API service/machine/inventory hiện đã có. Phần việc chủ yếu ở frontend:

- Xóa import `servicesData`, `machinesData`, `suppliesData` và các hàm `load*/save*` khỏi `ShopOperations.jsx`.
- `getShopOwnerOperations()` thất bại phải giữ danh sách rỗng và hiển thị error/retry; không chuyển `liveOperations=false` rồi cho phép CRUD local.
- Create/update/delete chỉ áp dụng response backend. Nếu API fail, giữ dữ liệu server cũ và báo lỗi.
- Tách request để lỗi một resource không làm ẩn ba resource còn lại, hoặc dùng `Promise.allSettled` với error state theo từng tab.
- `ShopOverview` chỉ dùng data live từ orders/operations; không tính KPI từ fallback.

## 9. Phase 6 — Shop Revenue bằng read-model thật

Không khôi phục payout legacy. Revenue screen đọc dữ liệu từ completed orders, confirmed payments, commission entries và statements.

### Backend contract mới

- `GET /api/v1/shop-owner/revenue/summary?from&to`
  - `grossRevenue`, `discountAmount`, `netCollected`, `commissionAmount`, `netAfterCommission`, `paidOrderCount`, `pendingPaymentCount`, `averageOrderValue`.
- `GET /api/v1/shop-owner/revenue/trend?from&to&interval=DAY|WEEK|MONTH`
  - Danh sách bucket có gross/net/commission/orderCount.
- `GET /api/v1/shop-owner/revenue/breakdown?from&to`
  - Theo service và payment method.
- `GET /api/v1/shop-owner/revenue/orders?from&to&paymentStatus&page&size`
  - Transaction/order table có pagination.
- `GET /api/v1/shop-owner/revenue/export?from&to&format=csv`
  - Export cùng filter; response file thật. Nếu không làm backend export, frontend chỉ được export toàn bộ data sau khi có API không phân trang dành riêng cho export.

### Frontend

- Tạo `shopRevenueApi.js`; xóa `ordersData`, `revenueData` và commission rate hardcode.
- Filter thời gian phải gửi lên API, không chỉ lọc array trên client.
- Chart/table có loading/empty/error/retry độc lập.
- Link từ Revenue sang Settlement để xem statement theo kỳ.
- Không hiển thị subscription/payout data nếu contract commission hiện tại không có khái niệm đó.

## 10. Phase 7 — Shop Staff, Documents và Notifications

Ba module này cần backend mới và nên triển khai độc lập.

### Staff

Đề xuất contract:

- `GET /api/v1/shop-owner/staff?page&size&status&keyword`
- `POST /api/v1/shop-owner/staff`
- `GET /api/v1/shop-owner/staff/{staffId}`
- `PUT /api/v1/shop-owner/staff/{staffId}`
- `PATCH /api/v1/shop-owner/staff/{staffId}/status`
- `DELETE /api/v1/shop-owner/staff/{staffId}` chỉ khi chưa có reference; nếu đã có thì deactivate.

Backend cần entity/migration, unique email/phone trong shop, ownership, role/permission tối thiểu và audit timestamps. Frontend xóa `staffData`, `loadStaff`, `saveStaff`; mọi CRUD reload từ API.

### Documents

Đề xuất contract:

- `GET /api/v1/shop-owner/documents?page&size&category&status`
- `POST /api/v1/shop-owner/documents` multipart gồm file và metadata.
- `GET /api/v1/shop-owner/documents/{documentId}`.
- `PUT /api/v1/shop-owner/documents/{documentId}/metadata`.
- `POST /api/v1/shop-owner/documents/{documentId}/renew` multipart.
- `DELETE /api/v1/shop-owner/documents/{documentId}`.

Backend validate loại file/size, ownership, expiry và storage cleanup. Frontend không tự tạo fileSize/downloadCount/status.

### Notifications

WebSocket event hiện tại không thay thế notification inbox vì không có persistence/read state. Đề xuất:

- `GET /api/v1/notifications?page&size&unreadOnly` dùng cho mọi role.
- `GET /api/v1/notifications/unread-count`.
- `PUT /api/v1/notifications/{id}/read`.
- `PUT /api/v1/notifications/read-all`.
- `DELETE /api/v1/notifications/{id}` nếu nghiệp vụ cho phép.

Persist notification từ order/payment/settlement/incident/task events. Shop và Driver notification panel phải lấy list/count thật; không thay đổi `read` chỉ ở local state.

## 11. Phase 8 — Shop Owner order create/edit/cancel/export

Đây là thay đổi nghiệp vụ, không được nối nhầm vào Customer `POST/PUT /api/v1/orders`.

### Quyết định contract cần chốt

- Shop có được tạo đơn thay Customer không? Nếu có, định danh Customer bằng account ID hoặc số điện thoại đã xác minh; không nhận tên tự do rồi tạo order mồ côi.
- Shop được sửa field nào và đến status nào? Khuyến nghị chỉ cho sửa schedule/address/note/items khi `PENDING` hoặc `CONFIRMED`, trước inspection.
- “Delete” đổi thành `POST /api/v1/shop-owner/orders/{id}/cancel` với reason; không hard delete.

### Endpoint đề xuất sau khi chốt rule

- `POST /api/v1/shop-owner/orders`
- `PUT /api/v1/shop-owner/orders/{id}`
- `POST /api/v1/shop-owner/orders/{id}/cancel`
- `GET /api/v1/shop-owner/orders/export?...`

Frontend:

- Xóa `handleCreateOrder`/`handleSaveEdit` cập nhật local.
- Chỉ mở modal khi contract tương ứng đã sẵn sàng; trong thời gian chờ phải ẩn action, không để nút báo “API unavailable”.
- Sau mutation reload list/detail backend; không tự sinh order ID/timestamp/price.

## 12. Phase 9 — Driver Earnings, payout, Settings và Notifications

Phase này đứng cuối vì logistics đang tắt mặc định và payout service hiện bị disable.

### Earnings read-only trước

- Hoàn thiện service dựa trên completed shipper tasks và fee rule đã chốt.
- `GET /api/v1/shippers/earnings/summary?from&to`.
- `GET /api/v1/shippers/earnings/trend?from&to&interval=DAY|WEEK|MONTH`.
- `GET /api/v1/shippers/earnings/history?page&size&from&to`.
- Xóa toàn bộ `driverWeeklyEarnings`, `driverEarnings` và payout history mock khỏi frontend.

### Payout chỉ sau quyết định nghiệp vụ

Trước khi implement phải quyết định platform có giữ tiền trả shipper hay không, nguồn số dư, minimum payout, bank account snapshot, trạng thái, idempotency và admin approval. Không được chỉ bỏ `UnsupportedOperationException` mà chưa có transaction/ledger test.

Sau khi chốt mới triển khai:

- `GET /api/v1/shippers/payouts`
- `POST /api/v1/shippers/payouts`
- Admin approve/complete/fail contract tương ứng.
- UI request payout chỉ bật khi backend trả `availableBalance` và `canRequest=true`.

Driver Notifications dùng notification API chung ở Phase 7. Driver Settings dùng các profile/vehicle/bank/preference API ở Phase 2; phần client preference vẫn giữ local.

## 13. Thứ tự triển khai khuyến nghị

| Ưu tiên | Phase | Lý do |
| --- | --- | --- |
| P0 | Phase 0 | Chặn lỗ hổng ownership và sửa contract sai trước khi UI gọi mutation |
| P1 | Phase 1–3 | Tận dụng API gần hoàn chỉnh: auth, driver profile, rating; giá trị cao, phạm vi nhỏ |
| P1 | Phase 4–5 | Thay Shop Settings/Operations mock bằng API đã có sau khi harden security |
| P2 | Phase 6 | Revenue cần query/read-model mới nhưng gắn trực tiếp với payment/settlement đã hoàn thành |
| P2 | Phase 7 | Staff/Documents/Notifications cần entity và API mới |
| P3 | Phase 8 | Manual Shop order CRUD cần quyết định nghiệp vụ và quyền rõ ràng |
| P3 | Phase 9 | Driver earnings/payout phụ thuộc logistics và business model chưa bật |

## 14. Chiến lược xóa mock

Không xóa toàn bộ `src/data` trong một commit. Thực hiện theo từng màn hình:

1. Thêm service và mapper response.
2. Nối loading/empty/error/retry.
3. Nối mutation và reload server state.
4. Thêm test/smoke test.
5. Xóa import mock/local persistence của màn đó.
6. Dùng `rg` kiểm tra không còn import hoặc thông báo fallback.
7. Chỉ sau khi không còn consumer mới xóa field/file mock tương ứng trong `src/data` và `dataManager`.

Các chuỗi phải biến mất khi hoàn tất toàn bộ plan:

- `Showing fallback data`
- `presentation data only`
- `API is not available yet`
- `Changes are saved only in this browser preview`
- Các handler tạo/sửa/xóa nghiệp vụ chỉ bằng `setState` hoặc `localStorage`.

## 15. Kiểm thử và Definition of Done

### Backend

- Controller tests: auth/role/status, validation, response envelope.
- Service tests: ownership, duplicate, state transition, transaction rollback.
- Repository tests cho revenue aggregation, notification pagination và payout ledger nếu triển khai.
- Upload tests: sai MIME, quá 5 MB, resource khác owner, cleanup khi DB save fail.

### Frontend

- Service tests cho request path/method/body/multipart và unwrap response.
- Component tests cho loading/empty/error/retry và action success/failure.
- E2E tối thiểu:
  - Customer completed order → rating → reload vẫn thấy rating.
  - Inactive user → reactivation request.
  - Shop Owner → sửa address → upload/xóa image → reload vẫn đúng.
  - API operations lỗi → không xuất hiện dữ liệu mock và không cho mutation local.
  - Driver profile/tasks/history lỗi → error/retry, không fallback.
  - Revenue filter/export khớp dữ liệu backend.

### Lệnh kiểm tra

```powershell
Set-Location D:\EXE\LaundryGo_FE
npm run lint
npm run build

Set-Location D:\EXE\LaundryGo_BE
mvn test
```

Definition of Done cho mỗi màn hình:

- Không import business data từ `src/data`.
- Không lưu business data vào localStorage.
- Không có success toast trước khi API thành công.
- Có loading, empty, error, retry và disabled/submitting state.
- Reload trang vẫn giữ đúng state từ backend.
- Role khác hoặc resource khác owner bị backend từ chối.
- Không phát sinh lint error/warning mới; build và targeted tests pass.

## 16. Trạng thái thực thi và các bước tiếp theo

Các bước dưới đây là thứ tự triển khai bắt buộc. Một bước chỉ chuyển sang `DONE` khi contract tương ứng đã có test; không thay bằng dữ liệu trình diễn để mở UI sớm.

| Bước | Phạm vi | Trạng thái | Kết quả / điều kiện chuyển bước |
| --- | --- | --- | --- |
| 0.1 | Security reactivation | DONE | Public matcher đã khớp `/api/v1/auth/reactivation-requests`. |
| 0.2 | Rating contract | DONE | Summary dùng named path variable; có `GET /api/v1/ratings/orders/{orderId}`, validation score/comment và error code nghiệp vụ riêng. |
| 0.3 | Shop owner profile/address/images | BLOCKED | Chưa có owner-scoped controller/service và upload multipart an toàn. Không nối Shop Settings trước bước này. |
| 1 | Auth session/reactivation/shipper signup | IN PROGRESS | Cần hoàn tất verify `/auth/me`, UI reactivation và upload multipart cho shipper signup. |
| 2.1 | Driver Profile | DONE | Profile chỉ hiển thị field backend trả về; có loading/error/retry, không còn dùng `src/data`. |
| 2.2 | Driver Tasks/History/Overview | DONE | Không còn fallback task/history/dashboard; mutation task reload server. Overview ẩn earnings/performance vì chưa có read-model. |
| 3 | Customer rating | DONE | `ratingApi`, UI rating tại order COMPLETED, reload state sau submit và chế độ read-only cho rating đã gửi. |
| 4 | Shop Settings | BLOCKED | Phụ thuộc bước 0.3. Chỉ giữ preference thuần client; không được giữ ảnh/profile business trong localStorage. |
| 5 | Shop Operations | DONE | Services/machines/inventory không dùng mock/localStorage; create/update/delete/toggle chỉ thành công sau API và reload state server. |
| 6 | Revenue read model | BLOCKED | Cần bốn query revenue và export từ backend trước khi thay màn Revenue. |
| 7 | Staff/Documents/Notifications | BLOCKED | Cần persistence + REST contract mới. |
| 8 | Shop Owner order create/edit/cancel/export | BLOCKED | Cần quyết định business rule và owner-scoped contract; không tái sử dụng Customer order API. |
| 9 | Driver earnings/payout/settings/notifications | BLOCKED | Chờ logistics, fee rule và payout ledger/approval contract. |

### Checklist cho mỗi pull request còn lại

1. Chốt request/response/error code và ownership ở backend, sau đó thêm controller/service test.
2. Thêm frontend service + response mapper, không thêm fallback.
3. Triển khai loading, empty, error, retry và trạng thái submitting/disabled.
4. Sau mọi mutation, reload resource từ backend trước khi hiển thị state thành công.
5. Xóa import mock/localStorage của màn hình vừa hoàn tất; chạy `rg` với các chuỗi fallback ở phần 14.
6. Chạy targeted backend test, `npm run build`, và E2E/smoke theo role trước khi chuyển bước tiếp theo.
