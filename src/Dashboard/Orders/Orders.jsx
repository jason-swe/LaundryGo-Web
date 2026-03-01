import './Orders.css'
import { useState } from 'react'

function Orders() {
    const [activeTab, setActiveTab] = useState('pending')

    const orderTabs = [
        { id: 'pending', label: 'Chờ xử lý', count: 12 },
        { id: 'washing', label: 'Đang giặt/sấy', count: 8 },
        { id: 'packing', label: 'Đang đóng gói', count: 5 },
        { id: 'ready', label: 'Sẵn sàng giao', count: 15 },
        { id: 'completed', label: 'Hoàn thành', count: 234 }
    ]

    // Sample orders data
    const sampleOrders = [
        { id: 'ORD001', customer: 'Nguyễn Văn A', items: 5, status: 'pending', time: '09:30 AM', date: '26/02/2026' },
        { id: 'ORD002', customer: 'Trần Thị B', items: 3, status: 'pending', time: '10:15 AM', date: '26/02/2026' },
        { id: 'ORD003', customer: 'Lê Văn C', items: 8, status: 'pending', time: '11:00 AM', date: '26/02/2026' }
    ]

    return (
        <div className="orders-page">
            <div className="page-header">
                <h1 className="page-title">Quản lý đơn hàng</h1>
                <div className="page-actions">
                    <button className="btn-secondary">
                        <svg width="20" height="20" viewBox="0 0 24 24" fill="none">
                            <path d="M3 17v2h6v-2H3zM3 5v2h10V5H3zm10 16v-2h8v-2h-8v-2h-2v6h2zM7 9v2H3v2h4v2h2V9H7zm14 4v-2H11v2h10zm-6-4h2V7h4V5h-4V3h-2v6z" fill="currentColor" />
                        </svg>
                        Lọc
                    </button>
                    <button className="btn-primary">
                        <svg width="20" height="20" viewBox="0 0 24 24" fill="none">
                            <path d="M19 13h-6v6h-2v-6H5v-2h6V5h2v6h6v2z" fill="currentColor" />
                        </svg>
                        Tạo đơn mới
                    </button>
                </div>
            </div>

            <div className="order-tabs">
                {orderTabs.map((tab) => (
                    <button
                        key={tab.id}
                        className={`order-tab ${activeTab === tab.id ? 'active' : ''}`}
                        onClick={() => setActiveTab(tab.id)}
                    >
                        <span>{tab.label}</span>
                        <span className="tab-count">{tab.count}</span>
                    </button>
                ))}
            </div>

            <div className="orders-table-container">
                <table className="orders-table">
                    <thead>
                        <tr>
                            <th>Mã đơn</th>
                            <th>Khách hàng</th>
                            <th>Số lượng</th>
                            <th>Thời gian</th>
                            <th>Ngày tạo</th>
                            <th>Trạng thái</th>
                            <th>Hành động</th>
                        </tr>
                    </thead>
                    <tbody>
                        {sampleOrders.map((order) => (
                            <tr key={order.id}>
                                <td className="order-id">{order.id}</td>
                                <td>{order.customer}</td>
                                <td>{order.items} items</td>
                                <td>{order.time}</td>
                                <td>{order.date}</td>
                                <td>
                                    <span className="status-badge status-pending">Chờ xử lý</span>
                                </td>
                                <td>
                                    <div className="action-buttons">
                                        <button className="btn-icon" title="Xem chi tiết">
                                            <svg width="18" height="18" viewBox="0 0 24 24" fill="none">
                                                <path d="M12 4.5C7 4.5 2.73 7.61 1 12c1.73 4.39 6 7.5 11 7.5s9.27-3.11 11-7.5c-1.73-4.39-6-7.5-11-7.5zM12 17c-2.76 0-5-2.24-5-5s2.24-5 5-5 5 2.24 5 5-2.24 5-5 5zm0-8c-1.66 0-3 1.34-3 3s1.34 3 3 3 3-1.34 3-3-1.34-3-3-3z" fill="currentColor" />
                                            </svg>
                                        </button>
                                        <button className="btn-icon" title="Cập nhật">
                                            <svg width="18" height="18" viewBox="0 0 24 24" fill="none">
                                                <path d="M3 17.25V21h3.75L17.81 9.94l-3.75-3.75L3 17.25zM20.71 7.04c.39-.39.39-1.02 0-1.41l-2.34-2.34c-.39-.39-1.02-.39-1.41 0l-1.83 1.83 3.75 3.75 1.83-1.83z" fill="currentColor" />
                                            </svg>
                                        </button>
                                    </div>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>

            <div className="working-hours-section">
                <h2 className="section-title">Thời gian hoạt động</h2>
                <div className="hours-grid">
                    <div className="hours-card">
                        <div className="hours-label">Giờ mở cửa</div>
                        <div className="hours-value">07:00 AM</div>
                    </div>
                    <div className="hours-card">
                        <div className="hours-label">Giờ đóng cửa</div>
                        <div className="hours-value">10:00 PM</div>
                    </div>
                    <div className="hours-card">
                        <div className="hours-label">Tổng giờ hoạt động hôm nay</div>
                        <div className="hours-value">8.5 giờ</div>
                    </div>
                </div>
            </div>
        </div>
    )
}

export default Orders
