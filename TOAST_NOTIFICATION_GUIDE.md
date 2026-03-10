# 🎉 Custom Toast Notification System

## 📋 Tổng Quan

Hệ thống thông báo custom (Toast) đã được tích hợp để thay thế `alert()` mặc định của browser. Toast notifications đẹp mắt, hiện đại và không làm gián đoạn user experience.

## ✨ Tính Năng

- ✅ **4 loại thông báo**: Success, Error, Warning, Info
- ✅ **Auto-dismiss**: Tự động biến mất sau 3-4 giây
- ✅ **Manual dismiss**: Có nút đóng để tắt sớm
- ✅ **Smooth animations**: Slide in/out mượt mà
- ✅ **Multiple toasts**: Có thể hiển thị nhiều toast cùng lúc
- ✅ **Responsive**: Hoạt động tốt trên mobile

## 🎨 Các Loại Toast

### 1. Success (Màu Xanh Lá)
```javascript
toast.success('Order created successfully!')
```
- Dùng khi: Thao tác thành công
- Màu: Xanh lá gradient (#10b981 → #059669)
- Icon: CheckCircleOutlined

### 2. Error (Màu Đỏ)
```javascript
toast.error('Failed to save data!')
```
- Dùng khi: Có lỗi xảy ra
- Màu: Đỏ gradient (#ef4444 → #dc2626)
- Icon: CloseCircleOutlined

### 3. Warning (Màu Vàng)
```javascript
toast.warning('Please fill in required fields')
```
- Dùng khi: Cần cảnh báo user
- Màu: Vàng gradient (#f59e0b → #d97706)
- Icon: ExclamationCircleOutlined

### 4. Info (Màu Xanh Dương)
```javascript
toast.info('Data reset to default')
```
- Dùng khi: Thông báo thông tin
- Màu: Xanh dương gradient (#3b82f6 → #2563eb)
- Icon: InfoCircleOutlined

## 📖 Cách Sử Dụng

### Import Toast
```javascript
import toast from '../../utils/toast'
```

### Sử dụng trong Code
```javascript
// Success
toast.success('Order created successfully!')

// Error
toast.error('Failed to export orders')

// Warning
toast.warning('Please enter actual weight')

// Info
toast.info('Orders reset to default data')

// Custom duration (mặc định: 3000ms)
toast.success('Message', 5000)  // Hiển thị 5 giây
```

## 📁 Cấu Trúc File

```
src/
├── components/
│   └── Toast/
│       ├── Toast.jsx           # Toast component chính
│       ├── ToastContainer.jsx  # Container quản lý nhiều toasts
│       └── Toast.css          # Styles cho toast
├── utils/
│   └── toast.js               # Utility functions để gọi toast
└── App.jsx                     # ToastContainer được thêm vào đây
```

## 🔧 Các Component

### 1. Toast.jsx
Component hiển thị một toast notification đơn lẻ.

**Props:**
- `message` (string): Nội dung thông báo
- `type` (string): 'success' | 'error' | 'warning' | 'info'
- `duration` (number): Thời gian hiển thị (ms), mặc định 3000
- `onClose` (function): Callback khi đóng toast

### 2. ToastContainer.jsx
Component quản lý và hiển thị nhiều toasts. Được mount trong `App.jsx`.

### 3. toast.js
Utility functions để dễ dàng gọi toast từ bất kỳ đâu.

## 🎯 Đã Thay Thế trong ShopOrderManagement

### Trước:
```javascript
alert('✅ Order created successfully and saved!')
alert('⚠️ Please fill in required fields')
```

### Sau:
```javascript
toast.success('Order created successfully!')
toast.warning('Please fill in required fields')
```

### Các Thao Tác Đã Tích Hợp Toast:

| Thao Tác | Loại Toast | Message |
|----------|-----------|---------|
| Tạo đơn mới | Success | "Order #ORD-xxx created successfully!" |
| Chỉnh sửa đơn | Success | "Order #ORD-xxx updated successfully!" |
| Xóa đơn | Success | "Order #ORD-xxx deleted successfully!" |
| Check-in | Success | "Order #ORD-xxx checked in successfully!" |
| Cập nhật status | Success | "Order #ORD-xxx status updated to ..." |
| Hủy đơn | Warning | "Order #ORD-xxx has been cancelled" |
| Export data | Success | "Exported 15 orders to orders.json successfully!" |
| Reset data | Info | "Orders reset to default data successfully!" |
| Validation lỗi | Warning | "Please fill in required fields: ..." |

## 💡 Ví Dụ Thực Tế

### 1. Create Order với Validation
```javascript
const handleCreateOrder = () => {
    // Validation
    if (!newOrderForm.customer) {
        toast.warning('Customer name is required')
        return
    }
    
    // Success
    const newOrder = { ... }
    setOrders([newOrder, ...orders])
    toast.success(`Order ${newOrder.id} created successfully!`)
}
```

### 2. Delete với Confirmation
```javascript
const handleDeleteOrder = (orderId) => {
    if (confirm('Delete this order?')) {
        setOrders(orders.filter(o => o.id !== orderId))
        toast.success(`Order ${orderId} deleted successfully!`)
    }
}
```

### 3. Export với Error Handling
```javascript
const handleExportOrders = () => {
    if (exportOrders(orders)) {
        toast.success(`Exported ${orders.length} orders successfully!`)
    } else {
        toast.error('Failed to export orders. Please try again.')
    }
}
```

## 🎨 Customization

### Thay Đổi Duration
```javascript
// Default durations trong toast.js
success: 3000ms (3s)
error: 4000ms (4s)
warning: 3500ms (3.5s)
info: 3000ms (3s)

// Custom duration
toast.success('Message', 5000)  // 5 giây
toast.error('Message', 0)       // Không tự động đóng
```

### Thay Đổi Position
Trong `Toast.css`:
```css
.toast {
    position: fixed;
    top: 24px;     /* Thay đổi vị trí dọc */
    right: 24px;   /* Thay đổi vị trí ngang */
}

/* Có thể đổi sang góc khác */
/* Bottom right: bottom: 24px; right: 24px; */
/* Top left: top: 24px; left: 24px; */
```

### Thay Đổi Màu Sắc
Trong `Toast.css`:
```css
.toast-success {
    background: linear-gradient(135deg, #10b981 0%, #059669 100%);
}

.toast-error {
    background: linear-gradient(135deg, #ef4444 0%, #dc2626 100%);
}

/* Thay đổi theo ý muốn */
```

## 📱 Responsive Design

Toast tự động responsive:
- **Desktop**: Hiển thị ở góc trên bên phải
- **Mobile**: Full width với animation từ trên xuống

## ⚠️ Lưu Ý

### Window Confirm vẫn được giữ
Các thao tác nguy hiểm (Delete, Reset, Cancel) vẫn dùng `confirm()` để xác nhận:
```javascript
if (window.confirm('Are you sure?')) {
    // Thực hiện thao tác
    toast.success('Done!')
}
```

### Multiple Toasts
Có thể hiển thị nhiều toasts cùng lúc:
```javascript
toast.success('Order 1 created!')
toast.success('Order 2 created!')
toast.success('Order 3 created!')
// Cả 3 sẽ hiện cùng lúc, xếp chồng lên nhau
```

## 🚀 Mở Rộng cho Module Khác

Để sử dụng Toast trong các module khác (Staff, Operations, etc.):

### 1. Import toast utility
```javascript
import toast from '../../utils/toast'
```

### 2. Thay thế alert()
```javascript
// Trước
alert('Success!')

// Sau
toast.success('Success!')
```

### 3. Không cần setup gì thêm
ToastContainer đã được mount trong `App.jsx` nên hoạt động ở mọi nơi!

## 🎓 Best Practices

### 1. Sử dụng đúng loại toast
```javascript
✅ toast.success()  - Khi thao tác thành công
✅ toast.error()    - Khi có lỗi
✅ toast.warning()  - Khi validation fail hoặc cảnh báo
✅ toast.info()     - Khi thông báo thông tin chung
```

### 2. Message rõ ràng, cụ thể
```javascript
❌ toast.success('Success!')
✅ toast.success('Order #ORD-10234 created successfully!')

❌ toast.error('Error!')
✅ toast.error('Failed to save order. Please try again.')
```

### 3. Không spam toasts
```javascript
❌ Hiển thị quá nhiều toasts cùng lúc
✅ Chỉ hiển thị toast cho action quan trọng
```

### 4. Error handling
```javascript
try {
    // Thao tác
    toast.success('Success!')
} catch (error) {
    toast.error(`Error: ${error.message}`)
}
```

## 📊 So Sánh: Before vs After

### Before (alert)
```javascript
alert('✅ Order created successfully!')
```
- ❌ Gián đoạn user experience
- ❌ Phải click OK mới tiếp tục
- ❌ Giao diện xấu, không phù hợp design
- ❌ Không thể customize

### After (toast)
```javascript
toast.success('Order created successfully!')
```
- ✅ Không gián đoạn, tự biến mất
- ✅ User có thể tiếp tục thao tác ngay
- ✅ Đẹp, hiện đại, phù hợp design
- ✅ Có thể customize màu, vị trí, duration

## 🎉 Kết Luận

Toast notification system đã sẵn sàng sử dụng! Tất cả các thông báo trong ShopOrderManagement đã được chuyển sang dùng toast. Hệ thống hoạt động mượt mà, đẹp mắt và không làm gián đoạn user experience.

### Quick Start:
```javascript
// Import
import toast from '../../utils/toast'

// Use
toast.success('Message')
toast.error('Message')
toast.warning('Message')
toast.info('Message')
```

Enjoy! 🚀
