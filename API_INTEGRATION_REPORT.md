# BÁO CÁO BÀN GIAO HIỆN TRẠNG TÍCH HỢP API - LAUNDRYGO

Tài liệu này ghi nhận hiện trạng tích hợp API giữa hệ thống Backend (Spring Boot) và Frontend (React) cho dự án sàn thương mại điện tử giặt ủi LaundryGo tại mốc bàn giao mới nhất.

---

## 1. Nhật ký cập nhật mới nhất (Mốc 29/06/2026)

*   **Luồng Xem Chi tiết Cửa hàng (`/all-shops/:id`):** Đã hoàn tất kết nối dữ liệu thực tế từ Database thông qua API và xử lý triệt để các lỗi crash hệ thống.
*   **Backend (Spring Boot) Bug-fix & Tối ưu:**
    *   **Loại bỏ ClassCastException:** Tách biệt luồng query thực thể `Shop` và địa chỉ `ShopAddress` thay vì sử dụng câu lệnh JPQL JOIN FETCH phức tạp kèm `GROUP BY` đa dòng dễ gây lỗi ép kiểu mảng `Object[]`.
    *   **Khắc phục lỗi Hibernate Double-wrapping:** Chuyển đổi kiểu trả về của câu query aggregate (lấy điểm rating trung bình và thời gian xử lý tối thiểu) từ `Optional<Object[]>` sang `List<Object[]>` để tránh Hibernate tự động bọc thêm một lớp mảng (`Object[][]`), giúp việc unwrap dữ liệu diễn ra an toàn.
    *   **Vá lỗi cú pháp soft-delete:** Sửa đổi câu query tại `ShopAddressRepository` để map chính xác thuộc tính `isDeleted` kế thừa từ `BaseEntity`.
*   **Frontend (React) Adapter:**
    *   Cài đặt hàm adapter `mapBackendShopToFrontend` trong `AllShopsDetail.jsx` để chuyển đổi cấu trúc gói tin của Backend sang đúng cấu trúc Object hiển thị của Frontend.
    *   Tích hợp các cơ chế fallback an toàn (Default Services, Hours, Promo, Reviews) đảm bảo giao diện hiển thị mượt mà ngay cả khi DB local thiếu các trường thông tin hiển thị phụ trợ.

---

## 2. Bảng phân loại danh sách API (API Matrix)

| Phân hệ/Domain | Method | Endpoint BE | Trạng thái | File FE tương ứng | Ghi chú |
| :--- | :--- | :--- | :--- | :--- | :--- |
| **Authentication** | `POST` | `/api/v1/auth/login` | **ĐÃ NỐI** | `src/utils/auth.js` | Tích hợp thành công |
| **Authentication** | `POST` | `/api/v1/auth/register` | **ĐÃ NỐI** | `src/utils/auth.js` | Tích hợp thành công |
| **Authentication** | `POST` | `/api/v1/auth/logout` | **ĐÃ NỐI** | `src/utils/auth.js` | Tích hợp thành công |
| **User Profile** | `GET` | `/api/v1/users/profile` | **ĐÃ NỐI** | `src/Information/UserInformation.jsx` | Lấy thông tin tài khoản |
| **User Profile** | `GET` | `/api/v1/users/profile/summary` | **ĐÃ NỐI** | `src/Information/UserInformation.jsx` | Lấy thống kê đơn hàng/địa chỉ |
| **User Profile** | `PUT` | `/api/v1/users/profile` | **ĐÃ NỐI** | `src/Information/UserInformation.jsx` | Cập nhật thông tin cá nhân |
| **Shop Public** | `GET` | `/api/v1/shops` | **ĐÃ NỐI** | `src/AllShops/AllShops.jsx` | Danh sách cửa hàng công khai |
| **Shop Public** | `GET` | `/api/v1/shops/{shopId}` | **ĐÃ NỐI** | `src/AllShops/AllShopsDetail.jsx` | Xem chi tiết cửa hàng |
| **Shop Owner** | `*` | `/api/v1/shop-owner/*` | **ĐÃ NỐI** | *(Shop Owner Dashboard)* | Luồng quản lý của chủ cửa hàng |
| **Schedule / Booking** | `GET` | `/api/v1/schedules/pickup-dates` | **CHƯA NỐI** | `src/PicanDeli/PicanDeli.jsx` | Đã khảo sát hợp đồng dữ liệu |
| **Schedule / Booking** | `GET` | `/api/v1/schedules/pickup-slots` | **CHƯA NỐI** | `src/PicanDeli/PicanDeli.jsx` | Đã khảo sát hợp đồng dữ liệu |
| **Schedule / Booking** | `GET` | `/api/v1/schedules/delivery-dates` | **CHƯA NỐI** | `src/PicanDeli/PicanDeli.jsx` | Đã khảo sát hợp đồng dữ liệu |
| **Schedule / Booking** | `GET` | `/api/v1/schedules/delivery-slots` | **CHƯA NỐI** | `src/PicanDeli/PicanDeli.jsx` | Đã khảo sát hợp đồng dữ liệu |
| **Delivery Address** | `GET` | `/api/v1/delivery-addresses` | **CHƯA NỐI** | `src/PicanDeli/PicanDeli.jsx` | Đã khảo sát hợp đồng dữ liệu |
| **Delivery Address** | `POST` | `/api/v1/delivery-addresses` | **CHƯA NỐI** | `src/PicanDeli/PicanDeli.jsx` | Đã khảo sát hợp đồng dữ liệu |
| **Order Management** | `POST` | `/api/v1/orders` | **CHƯA NỐI** | `src/PicanDeli/PicanDeli.jsx` | Đã khảo sát hợp đồng dữ liệu |
| **Order Management** | `POST` | `/api/v1/orders/summary` | **CHƯA NỐI** | `src/PicanDeli/PicanDeli.jsx` | Đã khảo sát hợp đồng dữ liệu |

---

## 3. Hướng dẫn bàn giao & Các đầu việc tiếp theo cho Frontend (FE)

Khi mở nhánh làm việc mới để phát triển các tính năng tiếp theo, đội ngũ FE cần tập trung vào 3 đầu việc chính sau tại trang đặt lịch (`PicanDeli.jsx`):

1.  **Đấu nối Sổ địa chỉ thực tế:**
    *   Thay thế mảng dữ liệu tĩnh `ADDRESS_PRESETS` bằng việc gọi API `GET /api/v1/delivery-addresses` qua hàm `authenticatedApiRequest` để hiển thị đúng danh sách địa chỉ nhận/giao hàng của User.
    *   Tích hợp form thêm địa chỉ trực tiếp kết nối tới `POST /api/v1/delivery-addresses`.
2.  **Đồng bộ hóa khung giờ giao nhận động:**
    *   Gọi API `GET /api/v1/schedules/pickup-dates` để kết xuất danh sách ngày nhận hàng thực tế.
    *   Dựa trên ngày được chọn, gọi tiếp `GET /api/v1/schedules/pickup-slots?pickupDate=...` để lấy danh sách khung giờ trống từ Backend thay vì sử dụng mảng cứng `ALL_TIME_SLOTS`.
    *   Thực hiện tương tự cho việc lấy ngày và giờ giao hàng (`delivery-dates` và `delivery-slots`).
3.  **Tạo đơn hàng thực tế lên hệ thống:**
    *   Đấu nối nút xác nhận đơn hàng tới API `POST /api/v1/orders`.
    *   Đảm bảo dữ liệu gửi lên (Payload) khớp hoàn toàn với cấu trúc của DTO [CreateOrderRequest.java](file:///d:/trainingCode/K8/EXE202/Backend/LaundryGo_BE/src/main/java/com/fpt/laundrygo_be/model/dto/request/CreateOrderRequest.java), đặc biệt là việc ánh xạ đúng `pickupSlot` / `deliverySlot` và `paymentMethod` dưới dạng các chuỗi Enum hợp lệ (ví dụ: `SLOT_09_11`, `CARD`, `CASH`).
