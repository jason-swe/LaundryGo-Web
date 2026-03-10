# Data Persistence Guide - LaundryGo Shop Dashboard

## 📋 Overview

Hệ thống quản lý dữ liệu của LaundryGo Shop Dashboard hiện đã được tích hợp **localStorage persistence** để lưu trữ các thay đổi một cách tự động. Điều này có nghĩa là:

- ✅ **Tất cả thay đổi được lưu tự động** vào localStorage của browser
- ✅ **Dữ liệu không mất** khi refresh trang hoặc đóng browser
- ✅ **Export dữ liệu** về file JSON để backup hoặc chia sẻ
- ✅ **Reset về dữ liệu gốc** bất cứ lúc nào

## 🔧 Cách Hoạt Động

### 1. LocalStorage Persistence

Khi bạn thực hiện các thay đổi trên Orders:
- **Tạo đơn hàng mới** → Tự động lưu vào localStorage
- **Chỉnh sửa đơn hàng** → Tự động lưu vào localStorage
- **Xóa đơn hàng** → Tự động lưu vào localStorage
- **Check-in đơn hàng** → Tự động lưu vào localStorage
- **Cập nhật trạng thái** → Tự động lưu vào localStorage

### 2. Component Flow

```javascript
// 1. Khởi tạo state với data từ localStorage hoặc file JSON mặc định
const [orders, setOrders] = useState(() => loadOrders(ordersData))

// 2. Tự động lưu mỗi khi orders thay đổi
useEffect(() => {
    saveOrders(orders)
}, [orders])

// 3. Mọi thay đổi đều update state và kích hoạt auto-save
const handleCreateOrder = () => {
    const updatedOrders = [newOrder, ...orders]
    setOrders(updatedOrders)  // Triggers useEffect → saves to localStorage
    saveOrders(updatedOrders) // Explicit save for confirmation
}
```

## 📦 Các Tính Năng Chính

### 1. ✨ Auto-Save (Lưu Tự Động)

Tất cả các thay đổi được lưu tự động vào `localStorage` với key:
```javascript
laundrygo_orders
```

**Ưu điểm:**
- Không cần click "Save" button
- Không lo mất dữ liệu khi đóng browser
- Hoạt động offline

**Lưu ý:**
- Dữ liệu được lưu trong browser (không sync giữa các máy khác nhau)
- Nếu clear browser data → dữ liệu sẽ mất

### 2. 📥 Export Data (Xuất Dữ Liệu)

**Nút "Export Data"** trên header cho phép tải về file `orders.json` với toàn bộ dữ liệu hiện tại.

**Cách sử dụng:**
1. Click nút **"Export Data"** (màu xanh lá)
2. File `orders.json` sẽ được tải xuống thư mục Downloads
3. Sử dụng file này để:
   - Backup dữ liệu
   - Thay thế file trong `/src/data/orders.json` (nếu muốn làm data mặc định)
   - Chia sẻ với team members

**Code:**
```javascript
const handleExportOrders = () => {
    if (exportOrders(orders)) {
        alert('✅ Orders exported successfully!')
    }
}
```

### 3. 🔄 Reset Data (Đặt Lại Dữ Liệu)

**Nút "Reset"** cho phép khôi phục về dữ liệu gốc từ file JSON ban đầu.

**Cách sử dụng:**
1. Click nút **"Reset"** (màu vàng)
2. Xác nhận dialog
3. Tất cả thay đổi trong localStorage sẽ bị xóa
4. Dữ liệu trở về như file `/src/data/orders.json` ban đầu

**Code:**
```javascript
const handleResetOrders = () => {
    if (confirm('Reset to default?')) {
        clearData('ORDERS')
        setOrders(ordersData)
        saveOrders(ordersData)
    }
}
```

## 🎯 Các Chức Năng CRUD

### Create (Tạo Đơn Mới)

**Button:** "New Order" (màu xanh dương)

**Flow:**
1. Click "New Order"
2. Điền form:
   - Customer Name *
   - Phone Number *
   - Service Type
   - Estimated Weight *
   - Estimated Price
   - Shipper
   - Notes
3. Click "Create Order"
4. ✅ Đơn hàng được tạo và lưu tự động

**Code:**
```javascript
const handleCreateOrder = () => {
    const newOrder = {
        id: `#ORD-${10235 + orders.length}`,
        ...newOrderForm,
        status: 'pending-checkin',
        pickupTime: new Date().toLocaleString()
    }
    const updatedOrders = [newOrder, ...orders]
    setOrders(updatedOrders)
    saveOrders(updatedOrders)
    alert('✅ Order created and saved!')
}
```

### Read (Xem Chi Tiết)

**Button:** "View" (icon mắt)

**Flow:**
1. Click "View" trên bất kỳ đơn hàng nào
2. Modal hiển thị:
   - Thông tin khách hàng
   - Thông tin dịch vụ
   - Cân nặng & giá
   - Danh sách items
   - Timeline
   - Quick actions (Cancel, Edit, Update Status)

### Update (Chỉnh Sửa)

**Button:** "Edit" (icon bút)

**Flow:**
1. Click "Edit" trên đơn hàng
2. Modal cho phép chỉnh sửa:
   - Customer info
   - Service type
   - Status
   - Weight (estimated & actual)
   - Price (estimated & actual)
   - Shipper info
   - Notes
3. Click "Save Changes"
4. ✅ Thay đổi được lưu tự động

**Code:**
```javascript
const handleSaveEdit = () => {
    const updatedOrders = orders.map(o => 
        o.id === editingOrder.id ? editingOrder : o
    )
    setOrders(updatedOrders)
    saveOrders(updatedOrders)
    alert('✅ Order updated and saved!')
}
```

### Delete (Xóa)

**Button:** Delete icon (màu đỏ)

**Flow:**
1. Click "Delete" trên đơn hàng
2. Xác nhận dialog
3. ✅ Đơn hàng bị xóa và lưu tự động

**Code:**
```javascript
const handleDeleteOrder = (orderId) => {
    if (confirm('Delete this order?')) {
        const updatedOrders = orders.filter(o => o.id !== orderId)
        setOrders(updatedOrders)
        saveOrders(updatedOrders)
        alert('✅ Order deleted and saved!')
    }
}
```

## 🏷️ Check-in Process

**Button:** "Check-in" (chỉ hiện với đơn `pending-checkin`)

**Purpose:** Xác nhận đơn hàng đã được nhận từ shipper

**Flow:**
1. Click "Check-in" trên đơn `pending-checkin`
2. Modal hiển thị form:
   - **Customer Info** - Xác nhận thông tin
   - **Weight Verification** - Nhập cân nặng thực tế *
   - **Item Inspection** - Kiểm tra tình trạng từng món
   - **Additional Notes** - Ghi chú đặc biệt
   - **Price Adjustment** - Xác nhận giá cuối cùng *
   - **Photo Documentation** - Upload ảnh (optional)
3. Click "Confirm Check-in"
4. ✅ Order status → `washing`, lưu tự động

**Code:**
```javascript
const handleConfirmCheckin = () => {
    const updatedOrder = {
        ...selectedOrder,
        actualWeight: `${checkinForm.actualWeight}kg`,
        actualPrice: `${checkinForm.finalPrice}đ`,
        status: 'washing',
        checkinTime: new Date().toLocaleString()
    }
    const updatedOrders = orders.map(o => 
        o.id === selectedOrder.id ? updatedOrder : o
    )
    setOrders(updatedOrders)
    saveOrders(updatedOrders)
    alert('✅ Order checked in and saved!')
}
```

## 🔄 Status Update Flow

Các đơn hàng có thể được cập nhật theo flow:

```
pending-checkin → washing → drying → ironing → ready → delivering → completed
```

**Buttons trong View modal:**
- "Update to Drying" (khi status = washing)
- "Update to Ironing" (khi status = drying)
- "Mark as Ready" (khi status = ironing)
- "Start Delivery" (khi status = ready)

**Code:**
```javascript
const handleStatusChange = (orderId, newStatus) => {
    const updates = { ...order, status: newStatus }
    const updatedOrders = orders.map(o => 
        o.id === orderId ? updates : o
    )
    setOrders(updatedOrders)
    saveOrders(updatedOrders)
    alert(`✅ Status updated to ${newStatus} and saved!`)
}
```

## 📊 Data Manager Utility

File: `/src/utils/dataManager.js`

### Available Functions:

```javascript
// Load data from localStorage or use default
loadOrders(defaultOrders)

// Save data to localStorage
saveOrders(orders)

// Export data as JSON file
exportOrders(orders)

// Clear specific data
clearData('ORDERS')

// Clear all data
clearAllData()
```

### Storage Keys:

```javascript
const STORAGE_KEYS = {
    ORDERS: 'laundrygo_orders',
    SERVICES: 'laundrygo_services',
    MACHINES: 'laundrygo_machines',
    // ... other keys
}
```

## 🚀 Mở Rộng Cho Các Module Khác

Để áp dụng data persistence cho các module khác (Services, Machines, Staff, etc.):

### 1. Import dataManager:

```javascript
import { loadServices, saveServices, exportServices } from '../../utils/dataManager'
```

### 2. Update state initialization:

```javascript
const [services, setServices] = useState(() => loadServices(servicesData))
```

### 3. Add useEffect for auto-save:

```javascript
useEffect(() => {
    saveServices(services)
}, [services])
```

### 4. Update CRUD handlers:

```javascript
const handleCreateService = () => {
    const updatedServices = [newService, ...services]
    setServices(updatedServices)
    saveServices(updatedServices)
}
```

### 5. Add Export/Reset buttons:

```javascript
<button onClick={() => exportServices(services)}>
    Export Services
</button>
<button onClick={() => {
    clearData('SERVICES')
    setServices(servicesData)
}}>
    Reset Services
</button>
```

## ⚠️ Lưu Ý Quan Trọng

### Browser Compatibility
- ✅ Hoạt động trên tất cả browsers hiện đại
- ✅ Chrome, Firefox, Safari, Edge
- ⚠️ Private/Incognito mode: dữ liệu bị xóa khi đóng browser

### Data Limits
- localStorage có giới hạn ~5-10MB tùy browser
- Với số lượng orders bình thường (~1000 orders): không vấn đề
- Nếu có hàng chục nghìn orders: cần backend API

### Sync Across Devices
- ❌ localStorage không sync giữa các máy
- Nếu cần sync: phải dùng backend API + database
- Export/Import JSON có thể dùng để "manual sync"

### Production Deployment
Để deploy lên production với data persistence thực sự:

1. **Backend API** cần có endpoints:
   ```
   GET    /api/orders       - Lấy danh sách
   POST   /api/orders       - Tạo mới
   PUT    /api/orders/:id   - Cập nhật
   DELETE /api/orders/:id   - Xóa
   ```

2. **Database** (PostgreSQL, MongoDB, etc.)

3. **Replace dataManager** calls với API calls:
   ```javascript
   // Instead of
   saveOrders(orders)
   
   // Use
   await fetch('/api/orders', {
       method: 'POST',
       body: JSON.stringify(orders)
   })
   ```

## 🎓 Demo & Testing

### Test Case 1: Create & Persistence
1. Tạo đơn hàng mới
2. Refresh trang (F5)
3. ✅ Đơn hàng vẫn còn

### Test Case 2: Edit & Persistence
1. Chỉnh sửa đơn hàng
2. Refresh trang
3. ✅ Thay đổi vẫn được giữ

### Test Case 3: Check-in & Persistence
1. Check-in một đơn pending
2. Refresh trang
3. ✅ Status đã chuyển sang washing

### Test Case 4: Export
1. Tạo/sửa vài đơn hàng
2. Click "Export Data"
3. ✅ File orders.json tải xuống với dữ liệu mới nhất

### Test Case 5: Reset
1. Tạo vài đơn hàng mới
2. Click "Reset"
3. ✅ Dữ liệu trở về như ban đầu

## 📞 Support

Nếu có vấn đề hoặc câu hỏi:
1. Check browser console for errors
2. Verify localStorage:
   ```javascript
   // In browser console
   localStorage.getItem('laundrygo_orders')
   ```
3. Clear localStorage manually nếu bị corrupt:
   ```javascript
   // In browser console
   localStorage.removeItem('laundrygo_orders')
   ```

## 🎉 Summary

Bây giờ trang Order Management đã có đầy đủ:
- ✅ **Auto-save** với localStorage
- ✅ **CRUD operations** đầy đủ (Create, Read, Update, Delete)
- ✅ **Check-in process** với form validation
- ✅ **Status management** theo workflow
- ✅ **Export** dữ liệu ra JSON
- ✅ **Reset** về dữ liệu gốc
- ✅ **Persistence** giữa các session

Tất cả thay đổi đều được lưu tự động và không bị mất khi refresh trang! 🚀
