# Theo dõi triển khai Frontend: Shop, Customer Payment và Voucher

> Cập nhật lần cuối: 2026-08-10  
> Phạm vi sở hữu chính: **Frontend**. Backend chỉ được chỉnh tối thiểu khi thiếu contract trực tiếp cho UI, không thay đổi cấu hình hay luồng nghiệp vụ ngoài phạm vi.
> Bàn giao session: xem [SESSION_HANDOVER_SHOP_PAYMENT_VOUCHER.md](SESSION_HANDOVER_SHOP_PAYMENT_VOUCHER.md).
> Kế hoạch loại bỏ mock và nối các module còn lại: xem [REMAINING_LIVE_API_INTEGRATION_PLAN.md](REMAINING_LIVE_API_INTEGRATION_PLAN.md).

## Nguyên tắc thực hiện

- Ưu tiên sửa mã nguồn trong `LaundryGo_FE`. Chỉ sửa `LaundryGo_BE` theo dạng DTO/mapping/service nhỏ, có kiểm thử, khi đó là cách trực tiếp để hoàn thiện contract cho UI.
- Dùng API backend hiện có theo contract đã được kiểm tra; không tự tạo endpoint hoặc giả định payload.
- Nếu API thiếu dữ liệu cần cho UI, ẩn/bỏ component hoặc thao tác không được hỗ trợ; không tạo dữ liệu hay trạng thái thành công giả.
- Giữ React/Vite và pattern service hiện có; không thêm React Query trong phạm vi sprint này.

## Luồng ưu tiên

`Shop inspection -> Customer duyệt giá -> Voucher/payment preview -> Bank transfer/report paid -> Shop confirm/reject -> Settlement`

## Tiến độ

| Bước | Hạng mục | Trạng thái | Ghi chú |
| --- | --- | --- | --- |
| 0 | Rà soát contract FE/BE và baseline dự án | Hoàn thành | Build pass; lint hiện có 9 lỗi, 2 cảnh báo ngoài phạm vi tính năng mới. |
| 1.1 | Customer: lấy voucher đang hoạt động của shop | Hoàn thành | Đã tạo `voucherApi.js` và thay nguồn promo ở trang chi tiết shop. |
| 1.2 | Customer: validate voucher và hiển thị giá dự kiến | Hoàn thành | Đã tích hợp tại flow đặt lịch, chỉ hiển thị estimate khi response đủ dữ liệu. |
| 2 | Shop: inspection draft/submit và incident thật | Hoàn thành | Đã nối FE và bổ sung tối thiểu `orderItemId` vào response chi tiết đơn hàng của Shop. |
| 2.1 | Customer: xem và duyệt kết quả inspection | Hoàn thành | TrackOrder đã nối get/approve/reject, tải lại đơn sau quyết định. |
| 3 | Customer: bank transfer, report-paid và payment status | Hoàn thành | Customer tải ảnh bằng chứng rồi báo đã chuyển khoản theo contract mới. |
| 4 | Shop: confirm/reject payment, settlement | Hoàn thành | Shop xem statement, tải ảnh chứng từ và gửi settlement thật. |
| 5 | UI states, i18n, test và tài liệu bàn giao | Hoàn thành | File liên quan lint pass, production build pass; backend targeted suite 15 tests cho contract mới pass. |

## Bước 0 — Kết quả rà soát contract

### Contract có thể dùng ngay ở Frontend

| Nghiệp vụ | Endpoint | Ghi chú frontend |
| --- | --- | --- |
| Voucher shop công khai | `GET /api/v1/vouchers/shops/{shopId}` | Không yêu cầu token; dùng tại shop detail. |
| Validate voucher | `POST /api/v1/vouchers/validate` | Body: `code`, `shopId`, `orderSubtotal`; yêu cầu đăng nhập. |
| Preview payment cuối | `POST /api/v1/payments/preview` | Kiểm tra lại voucher theo total thật của order trước khi tạo payment. |
| Xem payment Customer | `GET /api/v1/payments/{orderId}` | Customer chỉ xem payment của đơn thuộc mình. |
| Tạo bank transfer | `POST /api/v1/payments/{orderId}/bank-transfer` | Cần `Idempotency-Key`; có thể gửi `voucherCode`. |
| Customer báo đã chuyển | `POST /api/v1/payments/{paymentId}/report-paid` | Gửi `evidenceUrl` thật sau bước upload bằng chứng. |
| Customer upload bằng chứng thanh toán | `POST /api/v1/payments/{paymentId}/evidence` | Multipart `file`, chỉ ảnh tối đa 5 MB; trả `evidenceUrl` thuộc payment của Customer. |
| Customer xem/duyệt inspection | `GET /api/v1/orders/{id}/inspection`, `PUT .../approve`, `PUT .../reject` | Dùng tại TrackOrder khi chờ Customer xác nhận. |
| Shop inspection | `GET/PUT/POST /api/v1/shop-owner/orders/{id}/inspection...` | Dùng trong Order Management. |
| Shop incidents | `GET /api/v1/shop-owner/incidents`, `POST /api/v1/incidents` | Thay dữ liệu mẫu ở Shop Incident Report. |
| Shop đọc payment theo đơn | `GET /api/v1/shop-owner/orders/{id}` | Contract bổ sung cục bộ trả payment mới nhất và `paymentId`. |
| Shop confirm/reject payment | `POST /api/v1/shop-owners/payments/{paymentId}/confirm|reject` | Action chỉ hiện khi Customer đã báo thanh toán. |
| Shop xem statement | `GET /api/v1/shop-owners/statements`, `GET /api/v1/shop-owners/statements/{statementId}` | Chỉ trả statement thuộc Shop Owner hiện tại, gồm statementId và lần settlement gần nhất. |
| Shop upload chứng từ settlement | `POST /api/v1/shop-owners/statements/{statementId}/evidence` | Multipart `file`, chỉ ảnh tối đa 5 MB; trả URL để đưa vào request settlement. |
| Shop gửi settlement | `POST /api/v1/shop-owners/statements/{statementId}/settlements` | `amount` phải đúng `netCommissionAmount`; `proofImageUrl` bắt buộc. |

### Dependency được ghi nhận, không xử lý ở Backend

- `POST /api/v1/payments/create-url`, `GET /api/v1/payments/callback` và `POST /api/v1/payments/{paymentId}/shop-confirm` có trong tài liệu cũ nhưng không có trong controller backend hiện tại. Frontend sẽ không tiếp tục gọi chúng.
- `confirm-cash` là hành động của Shipper theo backend hiện tại, không tạo nút xác nhận cho Customer.
- Chi tiết đơn Shop trước đây thiếu payment id; contract đã được bổ sung cục bộ để hoàn thiện confirm/reject.

## Bước 1.1 — Customer lấy voucher của shop

Mục tiêu: Trang chi tiết shop hiển thị promotion từ API voucher công khai thay vì lấy promotion lẫn trong shop-detail response.

Checklist:

- [x] Tạo service `src/services/voucherApi.js` với hàm `getShopVouchers(shopId)`.
- [x] Gọi API voucher độc lập tại `AllShopsDetail`.
- [x] Hiển thị trạng thái loading ngắn trong khu vực promo và chỉ render promo từ danh sách voucher mới.
- [x] Bổ sung UI chọn giữa nhiều voucher và hiển thị điều kiện đơn tối thiểu.
- [x] Thêm validate voucher tại flow đặt lịch (Bước 1.2).

## Bước 1.2 — Customer validate voucher và giá dự kiến

Đã hoàn thành ở Frontend:

- [x] `PicanDeli` lấy voucher đang hoạt động của shop, có loading/error/retry và vẫn cho nhập mã thủ công (ví dụ voucher platform không nằm trong list shop).
- [x] Gọi `POST /api/v1/vouchers/validate` bằng `code`, `shopId`, `orderSubtotal` khi Customer bấm áp dụng.
- [x] Chỉ hiển thị discount/tổng dự kiến khi response trả đủ `discountAmount` và `finalAmount` hợp lệ.
- [x] Ghi rõ đây là estimate; voucher được kiểm tra lại theo total cuối lúc tạo payment.
- [x] Chỉ cho áp dụng voucher với `BANK_TRANSFER`, vì contract cash hiện không nhận `voucherCode`.
- [x] Giữ mã voucher đã validate qua trang xác nhận và recent-order state để dùng cho payment của đúng order.

## Bước 2 — Shop inspection và incident report

Đã hoàn thành ở Frontend:

- [x] Bổ sung `getShopOwnerOrderInspection`, lưu draft và submit inspection vào `shopOwnerOrderApi.js`.
- [x] Thay check-in cũ (chuyển trạng thái trực tiếp sang `washing`) bằng flow nhập actual weight/note theo từng item, lưu nháp và gửi inspection.
- [x] Hiển thị trạng thái `waiting-customer-confirmation` khi giá thay đổi và không cho Shop tự chuyển tiếp đơn trong lúc chờ Customer.
- [x] Tạo `incidentApi.js`, lấy danh sách incident theo Shop và gửi incident mới lên backend.
- [x] Loại bỏ edit/delete/resolve/status-change cục bộ vì Shop Owner không có API hay quyền cho các thao tác này.
- [x] Có loading, empty, error và retry state cho màn hình Incident.

Contract backend bổ sung tối thiểu cho inspection:

- `GET /api/v1/shop-owner/orders/{id}` nay trả `items[].orderItemId`, để frontend gửi đúng từng item trong payload `POST/PUT inspection`.
- Thay đổi chỉ nằm ở DTO và mapping service của response đơn hàng, kèm controller test; không sửa file cấu hình hoặc thay đổi luồng trạng thái nghiệp vụ.
- `GET inspection` có thể trả `404` khi Shop chưa tạo draft; frontend xử lý đây là trạng thái khởi tạo để vẫn có thể nhập và lưu inspection đầu tiên.

## Bước 3 — Customer bank transfer và payment status

Đã hoàn thành phần contract có thể triển khai:

- [x] `paymentApi.js` dùng `GET /api/v1/payments/{orderId}`, `POST /api/v1/payments/preview` và `POST /api/v1/payments/{orderId}/bank-transfer`.
- [x] Gỡ call cũ `create-url` và `confirm-cash` khỏi frontend Customer.
- [x] Chỉ hiển thị `CASH` và `BANK_TRANSFER`, đúng danh sách backend hiện tại.
- [x] Chỉ cho tạo bank transfer khi order ở `READY_FOR_DELIVERY` hoặc `DELIVERING`, đúng `OrderStatus.isPayable()`.
- [x] Gửi `Idempotency-Key`, preview lại voucher theo giá cuối, và cho Customer bỏ voucher nếu preview không còn hợp lệ.
- [x] Hiển thị payment status thật, số tiền, QR, ngân hàng, chủ/số tài khoản, nội dung chuyển khoản và thời hạn.
- [x] Có loading, soft error và thao tác refresh payment status.
- [x] Customer chọn ảnh bằng chứng (chỉ ảnh, tối đa 5 MB), upload bằng `POST /api/v1/payments/{paymentId}/evidence`, rồi gọi `report-paid` với `evidenceUrl` thật.
- [x] Sau khi báo đã chuyển, UI hiển thị trạng thái backend mới và giữ hành động refresh payment status.

Không có thay đổi backend trong Bước 1.2 hoặc Bước 3.

## Bước 2.1 — Customer duyệt inspection

- [x] Dùng contract Customer đã có sẵn để lấy kết quả inspection theo order.
- [x] Hiển thị giá dự kiến, giá cuối, phần chênh lệch và actual weight/subtotal từng item tại `TrackOrder`.
- [x] Nối approve/reject với confirm dialog và tải lại order detail sau thao tác.
- [x] Bổ sung trạng thái chờ xác nhận và hủy sau xác nhận khối lượng trong locale EN/VI.

## Bước 4 — Shop confirm/reject payment

- [x] Bổ sung `PaymentInfo` vào response chi tiết đơn Shop, lấy payment mới nhất; không đổi endpoint hay business rule.
- [x] Hiển thị amount, voucher, transaction/transfer code, thời điểm báo, ghi chú và bằng chứng thanh toán.
- [x] Nối endpoint confirm/reject thật; reject yêu cầu lý do và cả hai action chỉ hiện ở `CUSTOMER_REPORTED_PAID`.
- [x] Tải lại dữ liệu backend sau thao tác, có loading/toast và locale EN/VI.
- [x] Tạo màn Settlement trong Shop Owner: list/detail statement, loading/empty/error/retry, trạng thái submission mới nhất và form gửi đối soát thật.
- [x] UI chỉ cho submit statement `UNPAID` khi không có settlement `PENDING_VERIFY`; amount readonly lấy trực tiếp từ `netCommissionAmount`.
- [x] Upload chứng từ trước, dùng URL backend trả về để gửi settlement; sau đó làm mới statement và giữ status thực tế.

## Nhật ký thực hiện

### 2026-08-09

- Tạo tài liệu theo dõi này.
- Hoàn thành audit contract ở mức frontend, chỉ đọc source hiện có.
- Bắt đầu Bước 1.1: kết nối danh sách voucher công khai vào trang chi tiết shop.
- Hoàn thành Bước 2: service inspection/incident, UI inspection draft/submit và live incident list/create.
- Bổ sung contract backend tối thiểu cho Shop inspection: trả `orderItemId` trong chi tiết đơn Shop; không thay đổi cấu hình.
- Hoàn thành Bước 1.2: voucher selection/validation, discount và tổng dự kiến tại flow đặt lịch; giữ voucher qua confirmation/recent order.
- Hoàn thành phần khả dụng của Bước 3: payment preview, bank transfer có idempotency, payment status/bank details; bỏ endpoint Customer cũ không tồn tại.
- `report-paid` tiếp tục bị ẩn vì chưa có upload evidence; không sửa backend hoặc config cho dependency này.
- Hoàn thành Customer inspection approval và Shop payment confirm/reject theo contract thật.
- Backend bổ sung response payment tối thiểu và controller/service tests; không sửa config hay migration.
- `npm run build`, ESLint riêng các file đã chỉnh và backend targeted suite 25 tests đều pass.

### 2026-08-10

- Backend bổ sung contract upload payment evidence cho Customer và contract đọc statement/upload chứng từ cho Shop Owner.
- Hoàn thành Customer `report-paid`: chọn ảnh, kiểm tra client-side image/5 MB, upload multipart và gửi URL thật sang `report-paid`.
- Hoàn thành Shop settlement: thêm route/menu, list/detail statement, upload evidence và gửi request settlement với số tiền backend quy định.
- `npm run build`, ESLint các file liên quan, và Maven targeted suite cho `PaymentController`, `PaymentEvidence`, `ShopOwnerStatement`, `CommissionSettlement` đều pass (15 tests).
