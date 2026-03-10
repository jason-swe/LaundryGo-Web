# LaundryGo Shop Data

Mock data cho LaundryGo Shop Dashboard. Folder này chứa tất cả dữ liệu mẫu để phát triển và test giao diện.

## 📁 Cấu trúc Data Files

### 1. **orders.json**
Dữ liệu đơn hàng
- `id`: Mã đơn hàng (e.g., #ORD-10234)
- `customer`: Tên khách hàng
- `phone`, `email`, `address`: Thông tin liên hệ
- `service`: Loại dịch vụ
- `estimatedWeight`, `actualWeight`: Trọng lượng ước tính và thực tế
- `estimatedPrice`, `actualPrice`: Giá ước tính và thực tế
- `status`: pending-checkin | washing | drying | ironing | ready | delivering | completed | cancelled
- `items`: Danh sách vật phẩm trong đơn hàng
- `priority`: normal | high | express
- `paymentStatus`, `paymentMethod`: Trạng thái và phương thức thanh toán

### 2. **services.json**
Danh sách dịch vụ giặt ủi
- `id`: Mã dịch vụ (S-01, S-02, ...)
- `name`: Tên dịch vụ
- `category`: Phân loại (Giặt, Giặt + Sấy, etc.)
- `pricingType`: kg | piece
- `price`: Giá dịch vụ
- `minOrder`: Đơn tối thiểu
- `estimatedTime`: Thời gian hoàn thành
- `available`: true/false
- `tags`: Array các tag mô tả

### 3. **machines.json**
Thông tin máy giặt/sấy
- `id`: Mã máy (M-01, M-02, ...)
- `name`: Tên máy
- `type`: Washer | Dryer
- `status`: empty | washing | drying | maintenance
- `location`: Vị trí đặt máy
- `capacity`: Sức chứa (kg)
- `model`, `brand`: Model và thương hiệu
- `purchaseDate`: Ngày mua
- `lastMaintenance`, `nextMaintenance`: Lịch bảo trì
- `totalCycles`: Tổng số lần chạy
- `timeLeft`: Thời gian còn lại (nếu đang chạy)
- `currentOrder`: Đơn hàng đang xử lý

### 4. **supplies.json**
Vật tư tiêu hao
- `id`: Mã vật tư (SUP-01, SUP-02, ...)
- `name`: Tên vật tư
- `current`: Số lượng hiện tại
- `max`: Sức chứa tối đa
- `unit`: Đơn vị (kg, L, cái, chai)
- `reorderPoint`: Mức cảnh báo cần đặt hàng
- `supplier`: Nhà cung cấp
- `lastReorder`: Ngày đặt hàng cuối
- `costPerUnit`: Giá mỗi đơn vị
- `category`: Loại vật tư
- `storageLocation`: Vị trí lưu kho

### 5. **staff.json**
Thông tin nhân viên
- `id`: Mã nhân viên (STF-001, ...)
- `name`: Họ tên
- `role`: Manager | Operator | Customer Service | Technician
- `email`, `phone`: Liên hệ
- `joinDate`: Ngày vào làm
- `status`: active | on-leave | resigned
- `shift`: full-time | morning | afternoon | evening | on-call
- `salary`: Lương
- `performance`: Object chứa rating, ordersHandled, customerSatisfaction
- `skills`: Array kỹ năng
- `address`: Địa chỉ

### 6. **customers.json**
Thông tin khách hàng
- `id`: Mã khách hàng (CUS-1001, ...)
- `name`: Họ tên
- `phone`, `email`, `address`: Liên hệ
- `joinDate`: Ngày đăng ký
- `status`: active | inactive
- `loyaltyTier`: bronze | silver | gold | platinum
- `totalOrders`: Tổng số đơn hàng
- `totalSpent`: Tổng chi tiêu
- `averageOrderValue`: Giá trị đơn hàng trung bình
- `lastOrderDate`: Ngày đặt hàng gần nhất
- `preferredServices`: Array dịch vụ yêu thích
- `notes`: Ghi chú
- `rating`: Đánh giá trung bình

### 7. **revenue.json**
Dữ liệu doanh thu
- `daily`: Array doanh thu theo ngày
- `weekly`: Array doanh thu theo tuần
- `monthly`: Array doanh thu theo tháng
- `byService`: Doanh thu phân loại theo dịch vụ
- `byPaymentMethod`: Doanh thu phân loại theo phương thức thanh toán
- `expenses`: Chi phí (supplies, utilities, salaries, etc.)
- `summary`: Tổng kết (totalRevenue, totalProfit, profitMargin, etc.)

### 8. **statistics.json**
Thống kê tổng quan
- `overview`: Các chỉ số tổng quan (revenue, orders, customers, rating, etc.)
- `ordersByStatus`: Số lượng đơn hàng theo trạng thái
- `machineStatus`: Trạng thái máy móc
- `suppliesStatus`: Trạng thái vật tư
- `staffStatus`: Trạng thái nhân viên
- `peakHours`: Số đơn hàng theo giờ trong ngày
- `topServices`: Dịch vụ phổ biến nhất
- `topCustomers`: Khách hàng VIP
- `recentActivity`: Hoạt động gần đây

### 9. **documents.json**
Tài liệu
- `id`: Mã tài liệu (DOC-001, ...)
- `title`: Tiêu đề
- `type`: manual | procedure | price-list | contract | report | policy | catalog
- `category`: Phân loại
- `uploadDate`, `lastModified`: Ngày tải lên và chỉnh sửa
- `author`: Người tạo
- `fileSize`, `format`: Kích thước và định dạng file
- `status`: active | archived
- `tags`: Array tag
- `description`: Mô tả
- `downloadCount`: Số lần tải xuống

### 10. **incidents.json**
Sự cố
- `id`: Mã sự cố (INC-001, ...)
- `title`: Tiêu đề
- `type`: machine-failure | power-outage | quality-issue | supply-shortage | delivery-delay
- `severity`: low | medium | high | critical
- `status`: reported | in-progress | resolved
- `reportedBy`, `reportedDate`: Người báo cáo và thời gian
- `resolvedDate`: Thời gian giải quyết
- `assignedTo`: Người xử lý
- `description`: Mô tả sự cố
- `resolution`: Cách giải quyết
- `affectedOrders`: Các đơn hàng bị ảnh hưởng
- `downtime`: Thời gian ngưng hoạt động
- `cost`: Chi phí khắc phục
- `priority`: urgent | high | medium | low

### 11. **notifications.json**
Thông báo
- `id`: Mã thông báo (NOTIF-001, ...)
- `type`: order | machine | supply | customer | incident | staff | revenue | system | promotion
- `title`: Tiêu đề
- `message`: Nội dung
- `timestamp`: Thời gian
- `read`: true/false
- `priority`: low | normal | medium | high
- `actionUrl`: Link đích
- `icon`: Icon hiển thị
- `category`: Phân loại

### 12. **settings.json**
Cài đặt shop
- `shop`: Thông tin shop (name, address, phone, operatingHours, etc.)
- `business`: Cài đặt kinh doanh (currency, taxRate, deliveryFee, loyaltyProgram, etc.)
- `notifications`: Cài đặt thông báo (email, sms, push, alerts)
- `integrations`: Tích hợp (paymentGateways, shippingPartners, etc.)
- `staff`: Cài đặt nhân sự
- `machines`: Thông tin máy móc
- `customer`: Chính sách khách hàng
- `appearance`: Giao diện (theme, colors, language)

## 🔧 Cách sử dụng

### Import toàn bộ data:
```javascript
import shopData from './data'

// Sử dụng
const orders = shopData.orders
const services = shopData.services
```

### Import riêng từng loại:
```javascript
import { orders, services, machines } from './data'
```

### Sử dụng helper functions:
```javascript
import { getOrderById, getLowStockSupplies, getUnreadNotifications } from './data'

const order = getOrderById('#ORD-10234')
const lowStock = getLowStockSupplies()
const unread = getUnreadNotifications()
```

## 📝 Notes

- Tất cả data đều là MOCK DATA để phát triển frontend
- Khi tích hợp với backend API, thay thế các import này bằng API calls
- Cấu trúc data được thiết kế để dễ dàng mapping với API responses
- Các ID được format nhất quán để dễ truy vết và debug

## 🚀 Next Steps

1. Tích hợp data vào các components
2. Tạo custom hooks để fetch và manage data
3. Implement caching strategies
4. Add data validation
5. Migrate to API calls khi backend ready
