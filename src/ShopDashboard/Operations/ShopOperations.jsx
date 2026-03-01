import { useState } from 'react'
import { ShoppingOutlined, EditOutlined, DeleteOutlined, PlusOutlined } from '@ant-design/icons'
import './ShopOperations.css'

function ShopOperations() {
    const [showServiceModal, setShowServiceModal] = useState(false)
    const [services, setServices] = useState([
        {
            id: 'S-01',
            name: 'Giặt Thường',
            category: 'Giặt',
            pricingType: 'kg',
            price: 15000,
            minOrder: 3,
            description: 'Giặt tiêu chuẩn cho quần áo thường ngày',
            estimatedTime: '24 giờ',
            available: true
        },
        {
            id: 'S-02',
            name: 'Giặt Sấy Khô',
            category: 'Giặt + Sấy',
            pricingType: 'kg',
            price: 25000,
            minOrder: 3,
            description: 'Giặt và sấy khô hoàn toàn',
            estimatedTime: '48 giờ',
            available: true
        },
        {
            id: 'S-03',
            name: 'Giặt Hấp',
            category: 'Giặt Cao Cấp',
            pricingType: 'kg',
            price: 35000,
            minOrder: 2,
            description: 'Giặt hấp cho vải cao cấp, lụa',
            estimatedTime: '48 giờ',
            available: true
        },
        {
            id: 'S-04',
            name: 'Là/Ủi Áo Sơ Mi',
            category: 'Là/Ủi',
            pricingType: 'piece',
            price: 20000,
            minOrder: 1,
            description: 'Dịch vụ là ủi chuyên nghiệp cho áo sơ mi',
            estimatedTime: '24 giờ',
            available: true
        },
        {
            id: 'S-05',
            name: 'Là/Ủi Quần Tây',
            category: 'Là/Ủi',
            pricingType: 'piece',
            price: 25000,
            minOrder: 1,
            description: 'Dịch vụ là ủi quần tây',
            estimatedTime: '24 giờ',
            available: true
        },
        {
            id: 'S-06',
            name: 'Giặt Chăn/Mền',
            category: 'Giặt Đồ Lớn',
            pricingType: 'piece',
            price: 100000,
            minOrder: 1,
            description: 'Giặt chăn, mền, ga trải giường',
            estimatedTime: '72 giờ',
            available: false
        }
    ])

    const machines = [
        { id: 'M-01', name: 'Washer A1', status: 'empty', location: 'Floor 1' },
        { id: 'M-02', name: 'Washer A2', status: 'washing', location: 'Floor 1', timeLeft: '25 min' },
        { id: 'M-03', name: 'Dryer B1', status: 'washing', location: 'Floor 1', timeLeft: '15 min' },
        { id: 'M-04', name: 'Washer A3', status: 'maintenance', location: 'Floor 1' },
        { id: 'M-05', name: 'Dryer B2', status: 'empty', location: 'Floor 2' },
        { id: 'M-06', name: 'Washer A4', status: 'washing', location: 'Floor 2', timeLeft: '30 min' }
    ]

    const supplies = [
        { name: 'Professional Detergent', current: 65, max: 100, unit: 'L', reorderPoint: 20 },
        { name: 'Fabric Softener', current: 8, max: 100, unit: 'L', reorderPoint: 20 },
        { name: 'Bleach', current: 45, max: 100, unit: 'L', reorderPoint: 15 },
        { name: 'Stain Remover', current: 30, max: 50, unit: 'L', reorderPoint: 10 }
    ]

    const getStatusColor = (status) => {
        switch (status) {
            case 'empty':
                return '#10b981'
            case 'washing':
                return '#3b82f6'
            case 'maintenance':
                return '#f59e0b'
            default:
                return '#6b7280'
        }
    }

    const getStatusLabel = (status) => {
        switch (status) {
            case 'empty':
                return 'Ready (Empty)'
            case 'washing':
                return 'Washing/Drying'
            case 'maintenance':
                return 'Maintenance'
            default:
                return 'Unknown'
        }
    }

    const toggleServiceAvailability = (serviceId) => {
        setServices(
            services.map((service) =>
                service.id === serviceId ? { ...service, available: !service.available } : service
            )
        )
    }

    return (
        <div className="shop-operations">
            <div className="shop-operations-header">
                <h1 className="shop-operations-title">Operations Management</h1>
                <p className="shop-operations-subtitle">Manage services, machines, and supplies</p>
            </div>

            {/* Service Menu Management */}
            <div className="shop-operations-section">
                <div className="shop-operations-section-header">
                    <div>
                        <h2 className="shop-operations-section-title">
                            <ShoppingOutlined style={{ marginRight: '8px' }} />
                            Service Menu
                        </h2>
                        <p className="shop-operations-section-desc">
                            Manage your service offerings and pricing
                        </p>
                    </div>
                    <button
                        className="shop-operations-add-btn"
                        onClick={() => setShowServiceModal(true)}
                    >
                        <PlusOutlined /> Add Service
                    </button>
                </div>

                <div className="shop-operations-services-grid">
                    {services.map((service) => (
                        <div
                            key={service.id}
                            className={`shop-operations-service-card ${!service.available ? 'service-unavailable' : ''}`}
                        >
                            <div className="service-card-header">
                                <div>
                                    <div className="service-name">{service.name}</div>
                                    <div className="service-category">{service.category}</div>
                                </div>
                                <div className="service-status">
                                    <label className="service-toggle">
                                        <input
                                            type="checkbox"
                                            checked={service.available}
                                            onChange={() => toggleServiceAvailability(service.id)}
                                        />
                                        <span className="toggle-slider"></span>
                                    </label>
                                </div>
                            </div>

                            <div className="service-description">{service.description}</div>

                            <div className="service-pricing">
                                <div className="service-price">
                                    {service.price.toLocaleString()}đ
                                    <span className="service-unit">
                                        /{service.pricingType === 'kg' ? 'kg' : 'cái'}
                                    </span>
                                </div>
                                <div className="service-min-order">
                                    Min: {service.minOrder} {service.pricingType === 'kg' ? 'kg' : 'cái'}
                                </div>
                            </div>

                            <div className="service-time">
                                <span>⏱️ Estimated time: {service.estimatedTime}</span>
                            </div>

                            <div className="service-actions">
                                <button className="service-edit-btn">
                                    <EditOutlined /> Edit
                                </button>
                                <button className="service-delete-btn">
                                    <DeleteOutlined /> Remove
                                </button>
                            </div>
                        </div>
                    ))}
                </div>
            </div>

            {/* Machine Status */}
            <div className="shop-operations-section">
                <h2 className="shop-operations-section-title">Machine Status</h2>
                <div className="shop-operations-machine-grid">
                    {machines.map((machine) => (
                        <div key={machine.id} className="shop-operations-machine-card">
                            <div className="shop-operations-machine-header">
                                <div className="shop-operations-machine-id">{machine.id}</div>
                                <div
                                    className="shop-operations-machine-status-dot"
                                    style={{ background: getStatusColor(machine.status) }}
                                />
                            </div>
                            <div className="shop-operations-machine-name">{machine.name}</div>
                            <div className="shop-operations-machine-location">{machine.location}</div>
                            <div className="shop-operations-machine-status">
                                {getStatusLabel(machine.status)}
                            </div>
                            {machine.timeLeft && (
                                <div className="shop-operations-machine-time">
                                    ⏱️ {machine.timeLeft}
                                </div>
                            )}
                            <button className="shop-operations-machine-btn">
                                {machine.status === 'maintenance' ? 'Report Fixed' : 'View Details'}
                            </button>
                        </div>
                    ))}
                </div>
            </div>

            {/* Supplies Inventory */}
            <div className="shop-operations-section">
                <div className="shop-operations-section-header">
                    <h2 className="shop-operations-section-title">Supplies Inventory</h2>
                    <button className="shop-operations-add-btn">+ Add Supply Record</button>
                </div>
                <div className="shop-operations-supplies-grid">
                    {supplies.map((supply, index) => {
                        const percentage = (supply.current / supply.max) * 100
                        const isLow = supply.current <= supply.reorderPoint

                        return (
                            <div
                                key={index}
                                className={`shop-operations-supply-card ${isLow ? 'shop-operations-supply-low' : ''}`}
                            >
                                <div className="shop-operations-supply-header">
                                    <div className="shop-operations-supply-name">{supply.name}</div>
                                    {isLow && <span className="shop-operations-supply-alert">⚠️ Low</span>}
                                </div>
                                <div className="shop-operations-supply-amount">
                                    {supply.current} / {supply.max} {supply.unit}
                                </div>
                                <div className="shop-operations-supply-bar">
                                    <div
                                        className="shop-operations-supply-fill"
                                        style={{
                                            width: `${percentage}%`,
                                            background: isLow ? '#ef4444' : '#719fc2'
                                        }}
                                    />
                                </div>
                                <div className="shop-operations-supply-footer">
                                    <span className="shop-operations-supply-percentage">
                                        {percentage.toFixed(0)}%
                                    </span>
                                    <button className="shop-operations-supply-reorder">Reorder</button>
                                </div>
                            </div>
                        )
                    })}
                </div>
            </div>

            {/* Operating Hours */}
            <div className="shop-operations-section">
                <h2 className="shop-operations-section-title">Operating Hours</h2>
                <div className="shop-operations-hours-card">
                    <div className="shop-operations-hours-item">
                        <span className="shop-operations-hours-label">Today's Hours:</span>
                        <span className="shop-operations-hours-value">8:00 AM - 8:00 PM</span>
                        <span className="shop-operations-hours-status shop-operations-hours-open">
                            ● Open
                        </span>
                    </div>
                    <button className="shop-operations-hours-btn">Update Hours</button>
                </div>
            </div>

            {/* Service Modal */}
            {showServiceModal && (
                <div
                    className="shop-operations-modal-overlay"
                    onClick={() => setShowServiceModal(false)}
                >
                    <div
                        className="shop-operations-modal"
                        onClick={(e) => e.stopPropagation()}
                    >
                        <div className="modal-header">
                            <h2>Add New Service</h2>
                            <button
                                className="modal-close"
                                onClick={() => setShowServiceModal(false)}
                            >
                                ×
                            </button>
                        </div>
                        <div className="modal-body">
                            <div className="modal-form">
                                <div className="form-group">
                                    <label>Service Name *</label>
                                    <input
                                        type="text"
                                        placeholder="e.g., Giặt Thường"
                                        className="form-input"
                                    />
                                </div>

                                <div className="form-row">
                                    <div className="form-group">
                                        <label>Category *</label>
                                        <select className="form-input">
                                            <option>Giặt</option>
                                            <option>Giặt + Sấy</option>
                                            <option>Giặt Cao Cấp</option>
                                            <option>Là/Ủi</option>
                                            <option>Giặt Đồ Lớn</option>
                                        </select>
                                    </div>

                                    <div className="form-group">
                                        <label>Pricing Type *</label>
                                        <select className="form-input">
                                            <option value="kg">Per Kilogram (kg)</option>
                                            <option value="piece">Per Piece (cái)</option>
                                        </select>
                                    </div>
                                </div>

                                <div className="form-row">
                                    <div className="form-group">
                                        <label>Price (VND) *</label>
                                        <input
                                            type="number"
                                            placeholder="15000"
                                            className="form-input"
                                        />
                                    </div>

                                    <div className="form-group">
                                        <label>Minimum Order *</label>
                                        <input
                                            type="number"
                                            placeholder="3"
                                            className="form-input"
                                        />
                                    </div>
                                </div>

                                <div className="form-group">
                                    <label>Estimated Time *</label>
                                    <input
                                        type="text"
                                        placeholder="e.g., 24 giờ, 2-3 ngày"
                                        className="form-input"
                                    />
                                </div>

                                <div className="form-group">
                                    <label>Description</label>
                                    <textarea
                                        placeholder="Service description..."
                                        className="form-textarea"
                                        rows="3"
                                    ></textarea>
                                </div>

                                <div className="form-group">
                                    <label className="form-checkbox">
                                        <input type="checkbox" defaultChecked />
                                        <span>Available for booking</span>
                                    </label>
                                </div>
                            </div>
                        </div>
                        <div className="modal-footer">
                            <button
                                className="btn-cancel"
                                onClick={() => setShowServiceModal(false)}
                            >
                                Cancel
                            </button>
                            <button className="btn-confirm">Add Service</button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    )
}

export default ShopOperations
