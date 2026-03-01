# LaundryGo Web Dashboard

Dự án web frontend cho hệ thống quản lý giặt ủi LaundryGo.

## Cấu trúc dự án

```
src/
├── LandingPage/          # Trang landing page công khai
│   ├── LandingPage.jsx
│   └── LandingPage.css
│
├── Dashboard/            # Giao diện quản lý cho Shop
│   ├── Dashboard.jsx     # Layout chính
│   ├── Sidebar.jsx       # Menu điều hướng
│   │
│   ├── Overview/         # Trang tổng quan
│   │   ├── Overview.jsx
│   │   └── Overview.css
│   │
│   ├── Orders/           # Quản lý đơn hàng
│   │   ├── Orders.jsx
│   │   └── Orders.css
│   │
│   ├── Staff/            # Quản lý nhân viên
│   │   ├── Staff.jsx
│   │   └── Staff.css
│   │
│   ├── Document/         # Quản lý giấy tờ
│   │   ├── Document.jsx
│   │   └── Document.css
│   │
│   ├── Operation/        # Quản lý vận hành
│   │   ├── Operation.jsx
│   │   └── Operation.css
│   │
│   ├── Support/          # Hỗ trợ
│   │   ├── IncidentReport.jsx
│   │   ├── IncidentReport.css
│   │   ├── Notifications.jsx
│   │   └── Notifications.css
│   │
│   └── components/       # Shared components
│       ├── SearchBar.jsx
│       ├── SearchBar.css
│       ├── ChatButton.jsx
│       └── ChatButton.css
│
├── App.jsx              # Router chính
├── main.jsx             # Entry point
└── index.css            # Global styles
```

## Tính năng Dashboard

### 1. Tổng quan (Overview)
- Doanh thu trong ngày/tháng
- Số lượng đơn mới, đang xử lý, đã hoàn thành
- Biểu đồ chi tiêu người dùng
- Tình trạng máy móc
- Mức tồn kho vật tư

### 2. Quản lý đơn hàng (Orders)
- Đơn chờ xử lý
- Đơn đang giặt/sấy
- Đơn đang đóng gói
- Đơn sẵn sàng giao
- Đơn hoàn thành
- Thời gian hoạt động

### 3. Quản lý vận hành (Operation)
- Tình trạng máy: trống, đang giặt, cần bảo trì
- Vật tư: nước giặt, nước xả
- Thời gian hoạt động

### 4. Quản lý nhân viên (Staff)
- Bảng chấm công
- Lịch làm việc

### 5. Quản lý giấy tờ (Document)
- Giấy phép kinh doanh
- Giấy cam kết vệ sinh môi trường
- Giấy phép xử lý nước thải
- Giấy phép phòng cháy chữa cháy
- Cảnh báo giấy tờ sắp hết hạn

### 6. Báo cáo sự cố (Incident Report)
- Tạo báo cáo sự cố
- Theo dõi trạng thái xử lý
- Phân loại theo mức độ ưu tiên

### 7. Thông báo (Notifications)
- Thông báo đơn hàng mới
- Cảnh báo máy cần bảo trì
- Cảnh báo vật tư sắp hết
- Nhắc nhở giấy tờ hết hạn

### 8. Chat Support
- Live chat realtime
- Hỗ trợ trực tuyến

## Cách sử dụng

### Xem Landing Page
Mặc định khi chạy app sẽ hiển thị Landing Page.

### Xem Dashboard
Để test Dashboard, mở Console trong Developer Tools và chạy:
```javascript
switchView('dashboard')
```

Để quay lại Landing Page:
```javascript
switchView('landing')
```

## Chạy dự án

```bash
# Install dependencies
npm install

# Run development server
npm run dev
```

## Design Pattern

- **Font:** Montserrat
- **Primary Colors:** 
  - #0b416a (Dark Blue)
  - #78a6c7 (Medium Blue)
  - #9edfda (Teal)
  - #e0faf8 (Light Teal)
- **Border Radius:** 8-12px cho cards, 999px cho buttons
- **Shadows:** 0 2px 8px rgba(0,0,0,0.08) cho cards
- **Responsive:** Mobile-first design với breakpoints tại 768px và 1024px

## TODO
- [ ] Integrate React Router
- [ ] Add authentication
- [ ] Connect to backend API
- [ ] Add realtime chat functionality
- [ ] Implement data visualization charts
- [ ] Add export/print features
- [ ] Responsive optimization
