# Bàn giao session — Shop, Customer Payment và Voucher

> Cập nhật: 2026-08-10  
> Đọc cùng [kế hoạch triển khai](SHOP_PAYMENT_VOUCHER_IMPLEMENTATION_PLAN.md).

## Mục tiêu và phạm vi

Hoàn thiện các luồng **Shop**, **Customer Payment** và **Voucher** trong LaundryGo theo API backend thực tế, đồng thời giữ nhất quán với giao diện hiện có.

Phạm vi ưu tiên là frontend trong `LaundryGo_FE`. Backend trong `LaundryGo_BE` chỉ được phép chỉnh khi thỏa **đồng thời** các điều kiện sau:

- Là thiếu contract trực tiếp khiến UI không thể hoạt động.
- Thay đổi nhỏ, cục bộ (DTO, mapping, service hoặc test).
- Không thay đổi file cấu hình, quyền, migration, dependency hay luồng nghiệp vụ ngoài phạm vi.
- Có kiểm thử phù hợp sau khi sửa.

## Rule bắt buộc

1. Bám giao diện hiện có; không redesign hoặc đổi framework khi chưa có yêu cầu mới.
2. Chỉ hiển thị/nối các thao tác có API và quyền hợp lệ. Không có API tương ứng thì **ẩn hoặc bỏ UI component/thao tác đó**, không làm mock hay giả lập thành công.
3. Không tự suy diễn endpoint, payload, trạng thái hoặc role. Kiểm tra controller/service/backend source trước khi gọi API.
4. Giữ pattern đang dùng: service gọi `apiRequest`/`authenticatedApiRequest`, component dùng `useEffect`/`useState`; không thêm React Query.
5. Có loading, empty, error và retry state cho dữ liệu async quan trọng.
6. Dùng i18n cho chuỗi mới khi màn hình đã dùng locale; không trộn thêm dữ liệu mẫu vào luồng API thật.
7. Không sửa/revert các thay đổi có sẵn của người dùng trong worktree, đặc biệt:
   - `LaundryGo_BE/src/main/resources/application-dev.properties`
   - `LaundryGo_BE/src/main/resources/application-prod.properties`
8. Mọi thay đổi backend phải được ghi vào kế hoạch và nêu rõ là không đổi config.

## Trạng thái đã hoàn thành

### Bước 0 — Audit contract

- Đã đối chiếu `UNCONNECTED_APIS.md`, frontend và backend hiện tại.
- `UNCONNECTED_APIS.md` có một số endpoint payment cũ không còn trong controller backend, nên không được tiếp tục gọi.

### Bước 1.1 — Voucher công khai tại shop detail

- Đã thêm `src/services/voucherApi.js` với `getShopVouchers(shopId)` và `validateVoucher(...)`.
- `src/AllShops/AllShopsDetail.jsx` lấy promo bằng `GET /api/v1/vouchers/shops/{shopId}`.
- UI promo có loading ngắn; không còn phụ thuộc vào dữ liệu promo lẫn trong shop detail response.

### Bước 1.2 — Validate voucher và giá dự kiến

- `src/PicanDeli/PicanDeli.jsx` hiển thị các voucher thật của shop, điều kiện đơn tối thiểu và cho nhập mã thủ công.
- Dùng `POST /api/v1/vouchers/validate` với `code`, `shopId`, `orderSubtotal`; có loading/error/retry.
- Chỉ hiển thị `discountAmount` và `finalAmount` khi backend trả đủ dữ liệu hợp lệ.
- Voucher chỉ khả dụng cho `BANK_TRANSFER`, vì luồng cash hiện không có contract nhận `voucherCode`.
- Mã đã validate được giữ qua confirmation/recent-order state; UI ghi rõ estimate sẽ được validate lại theo giá cuối.

### Bước 2 — Shop inspection và incident

- Đã thêm API inspection vào `src/services/shopOwnerOrderApi.js`:
  - `GET /api/v1/shop-owner/orders/{id}/inspection`
  - `PUT /api/v1/shop-owner/orders/{id}/inspection/draft`
  - `POST /api/v1/shop-owner/orders/{id}/inspection/submit`
- `src/ShopDashboard/OrderManagement/ShopOrderManagement.jsx` đã dùng flow nhập actual weight/note từng item, lưu nháp và gửi inspection; không còn tự đổi đơn sang `washing`.
- Đã thêm trạng thái `waiting-customer-confirmation` trong `OrderStatusBadge` và locale EN/VI.
- Đã thêm `src/services/incidentApi.js`:
  - `GET /api/v1/shop-owner/incidents`
  - `POST /api/v1/incidents`
- `src/ShopDashboard/IncidentReport/ShopIncidentReport.jsx` dùng list/create thật, có loading/empty/error/retry.
- Đã bỏ edit, delete, resolve và đổi status incident cục bộ vì Shop Owner chưa có API/quyền cho các thao tác này.

### Bước 2.1 — Customer duyệt kết quả inspection

- Backend đã có sẵn contract Customer nhưng tài liệu bàn giao trước bỏ sót:
  - `GET /api/v1/orders/{id}/inspection`
  - `PUT /api/v1/orders/{id}/inspection/approve`
  - `PUT /api/v1/orders/{id}/inspection/reject`
- `TrackOrder` tải chi tiết inspection khi đơn ở `WAITING_CUSTOMER_CONFIRMATION`, hiển thị giá dự kiến, giá cuối, chênh lệch và từng item.
- Customer có confirm dialog trước khi đồng ý hoặc từ chối. Sau thao tác, chi tiết đơn được tải lại để phản ánh trạng thái mới.
- Đã bổ sung trạng thái `CANCELLED_AFTER_WEIGHT_CONFIRMATION` và locale EN/VI.

### Bước 3 — Customer bank transfer và payment status

- `src/services/paymentApi.js` hiện dùng:
  - `GET /api/v1/payments/{orderId}`
  - `POST /api/v1/payments/preview`
  - `POST /api/v1/payments/{orderId}/bank-transfer`
- Đã gỡ call Customer cũ tới `create-url` và `confirm-cash`.
- `PicanDeli` và `TrackOrder` chỉ hiển thị `CASH`/`BANK_TRANSFER` theo payment-method contract thật.
- Bank transfer chỉ được tạo khi order ở `READY_FOR_DELIVERY`/`DELIVERING`, có `Idempotency-Key`.
- `TrackOrder` preview lại voucher theo total cuối; Customer có thể bỏ voucher nếu mã không còn hợp lệ.
- UI hiển thị payment status, amount, QR, ngân hàng, chủ/số tài khoản, nội dung chuyển khoản, hạn dùng và refresh state.
- Customer có thể chọn ảnh bằng chứng (chỉ ảnh, tối đa 5 MB), upload qua `POST /api/v1/payments/{paymentId}/evidence` rồi gọi `report-paid` với `evidenceUrl` thật.
- Sau khi báo đã chuyển, UI hiển thị payment status thực tế và vẫn cho refresh.

### Bước 4 — Shop confirm/reject payment

- Backend đã có sẵn endpoint ghi đúng quyền Shop Owner:
  - `POST /api/v1/shop-owners/payments/{paymentId}/confirm`
  - `POST /api/v1/shop-owners/payments/{paymentId}/reject`
- Đã bổ sung contract đọc tối thiểu vào chi tiết đơn Shop: payment mới nhất gồm `paymentId`, status, method, amount, voucher, transaction/transfer code, proof URL, ghi chú và thời gian Customer báo thanh toán.
- `ShopOrderManagement` hiển thị giao dịch và bằng chứng thật. Nút confirm/reject chỉ xuất hiện khi status là `CUSTOMER_REPORTED_PAID`; reject bắt buộc lý do.
- Sau thao tác, frontend tải lại chi tiết đơn và danh sách đơn; không cập nhật trạng thái giả ở local.
- Đã thêm trang Settlement cho Shop Owner: list/detail statement, loading/empty/error/retry, trạng thái settlement mới nhất và form upload chứng từ/gửi settlement.
- Nút submit chỉ có ở statement `UNPAID` khi không có settlement `PENDING_VERIFY`; amount readonly lấy từ `netCommissionAmount` để luôn đúng contract backend.

### Backend tối thiểu đã thực hiện

Thiếu `orderItemId` làm frontend không thể gửi payload inspection đúng từng item. Đã chỉnh cục bộ:

- `LaundryGo_BE/.../ShopOwnerOrderDetailResponse.java`: thêm `orderItemId` trong `OrderItemResponse`.
- `ShopOwnerOrderDetailResponse.java`: thêm `PaymentInfo` cho payment mới nhất của đơn.
- `ShopOwnerOrderServiceImpl.java`: lấy order item thật, lấy payment mới nhất và map vào order detail response.
- `OrderControllerTest.java`: thêm coverage cho Customer get/approve/reject inspection.
- `ShopOwnerOrderControllerTest.java` và `ShopOwnerOrderServiceImplTest.java`: kiểm tra `orderItemId` và dữ liệu payment review.
- `PaymentEvidenceService` và endpoint `/api/v1/payments/{paymentId}/evidence`: Customer upload evidence chỉ cho chính payment BANK_TRANSFER ở `PENDING`/`SHOP_REJECTED`; kiểm tra ảnh/tối đa 5 MB.
- `ShopOwnerStatementController` và `CommissionSettlementService`: contract đọc statement thuộc Shop Owner, upload evidence và map latest settlement cho UI.

Không thay đổi config hoặc business flow. Lệnh đã pass:

```powershell
Set-Location D:\EXE\LaundryGo_BE
mvn '-Dtest=OrderControllerTest,ShopOwnerOrderControllerTest,ShopOwnerOrderServiceImplTest,ShopOwnerPaymentServiceTest' test
```

Kết quả bổ sung cho contract mới: 15 tests pass, 0 failure/error (`PaymentControllerTest`, `PaymentEvidenceServiceTest`, `ShopOwnerStatementControllerTest`, `CommissionSettlementServiceTest`).

## Kế hoạch còn lại / dependency

| Ưu tiên | Hạng mục | Trạng thái | Điều kiện / lưu ý |
| --- | --- | --- | --- |
| 1 | Customer report-paid | Hoàn thành | Upload evidence thật rồi gửi `report-paid`; chỉ nhận ảnh tối đa 5 MB. |
| 2 | Shop settlement | Hoàn thành | Shop đọc statement, upload chứng từ và gửi settlement bằng `statementId` thật. |

## Contract và giới hạn cần nhớ

### Có thể dùng ngay

| Nghiệp vụ | Endpoint | Ghi chú |
| --- | --- | --- |
| Voucher công khai của shop | `GET /api/v1/vouchers/shops/{shopId}` | Không cần token. |
| Validate voucher | `POST /api/v1/vouchers/validate` | Cần token. |
| Preview payment cuối | `POST /api/v1/payments/preview` | Read-only; dùng total thật của order để kiểm tra lại voucher. |
| Customer xem payment | `GET /api/v1/payments/{orderId}` | Chỉ payment của đơn thuộc Customer. |
| Customer tạo bank transfer | `POST /api/v1/payments/{orderId}/bank-transfer` | Cần `Idempotency-Key`; có thể gửi `voucherCode`. |
| Customer báo đã chuyển khoản | `POST /api/v1/payments/{paymentId}/report-paid` | Cần `evidenceUrl`. |
| Customer upload bằng chứng | `POST /api/v1/payments/{paymentId}/evidence` | Multipart `file`, chỉ ảnh tối đa 5 MB. |
| Customer xem/duyệt inspection | `GET`, `PUT .../approve`, `PUT .../reject` dưới `/api/v1/orders/{id}/inspection` | Controller và service đã có sẵn; frontend đã nối tại TrackOrder. |
| Shop inspection | `GET/PUT/POST /api/v1/shop-owner/orders/{id}/inspection...` | `GET` có thể 404 khi chưa tồn tại draft; coi đó là trạng thái khởi tạo. |
| Shop incidents | `GET /api/v1/shop-owner/incidents`, `POST /api/v1/incidents` | Chỉ list/create hiện có. |
| Shop đọc payment theo đơn | `GET /api/v1/shop-owner/orders/{id}` | Response chi tiết nay có payment mới nhất và `paymentId`. |
| Shop confirm/reject payment | `POST /api/v1/shop-owners/payments/{paymentId}/confirm|reject` | Chỉ hợp lệ khi payment đang `CUSTOMER_REPORTED_PAID`. |
| Shop xem statement | `GET /api/v1/shop-owners/statements`, `GET /api/v1/shop-owners/statements/{statementId}` | Chỉ trả statement thuộc Shop Owner, có `statementId` và latest settlement. |
| Shop upload chứng từ settlement | `POST /api/v1/shop-owners/statements/{statementId}/evidence` | Multipart `file`, chỉ ảnh tối đa 5 MB. |
| Shop gửi settlement | `POST /api/v1/shop-owners/statements/{statementId}/settlements` | Amount phải bằng `netCommissionAmount`, `proofImageUrl` bắt buộc. |

### Không được gọi/dựng UI lúc này

- `POST /api/v1/payments/create-url` và `GET /api/v1/payments/callback`: chỉ có trong tài liệu cũ, không có controller hiện tại.
- `confirm-cash`: action của Shipper, không phải Customer.

## Kiểm tra trước khi bàn giao tiếp

```powershell
Set-Location D:\EXE\LaundryGo_FE
npm run build
```

Production build pass sau Bước 4. ESLint riêng các file `PicanDeli`, `ConfirmOrder`, `TrackOrder`, `ShopOrderManagement`, `voucherApi.js`, `bookingApi.js`, `paymentApi.js` và `shopOwnerOrderApi.js` pass.

Lint toàn repo vẫn có baseline 9 lỗi và 2 cảnh báo ở các file ngoài luồng mới (gồm Dashboard Overview, Driver Settings, `OrderStatusBadge`, `adminApi.js` và TranslationContext). Không phát sinh lỗi mới từ voucher/payment; ESLint riêng các file đã chỉnh pass.

## Điểm bắt đầu cho session tiếp theo

Phạm vi Shop, Customer Payment và Voucher trong kế hoạch hiện đã hoàn thành theo contract backend. Khi mở rộng sau này, chỉ tiếp tục khi có yêu cầu nghiệp vụ/contract mới; vẫn giữ thay đổi backend cục bộ, có test và không sửa config.
