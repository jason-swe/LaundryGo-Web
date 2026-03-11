import { useState, useEffect } from 'react'
import { ShoppingOutlined, EditOutlined, DeleteOutlined, PlusOutlined, ToolOutlined, InboxOutlined, EyeOutlined, CloseOutlined } from '@ant-design/icons'
import './ShopOperations.css'
import { services as servicesData, machines as machinesData, supplies as suppliesData } from '../../data'
import { loadServices, saveServices, loadMachines, saveMachines, loadSupplies, saveSupplies } from '../../utils/dataManager'
import toast from '../../utils/toast'
import ConfirmDialog from '../../components/ConfirmDialog/ConfirmDialog'

function ShopOperations() {
    const [showServiceModal, setShowServiceModal] = useState(false)
    const [showMachineModal, setShowMachineModal] = useState(false)
    const [showMachineViewModal, setShowMachineViewModal] = useState(false)
    const [showSupplyModal, setShowSupplyModal] = useState(false)
    const [showSupplyViewModal, setShowSupplyViewModal] = useState(false)

    // Expanded view states (inline, not modal)
    const [showAllServices, setShowAllServices] = useState(false)
    const [showAllMachines, setShowAllMachines] = useState(false)
    const [showAllSupplies, setShowAllSupplies] = useState(false)

    // Confirm dialog state
    const [confirmDialog, setConfirmDialog] = useState({
        show: false,
        title: '',
        message: '',
        onConfirm: null,
        type: 'warning'
    })

    const [editingService, setEditingService] = useState(null)
    const [editingMachine, setEditingMachine] = useState(null)
    const [editingSupply, setEditingSupply] = useState(null)
    const [viewingMachine, setViewingMachine] = useState(null)
    const [viewingSupply, setViewingSupply] = useState(null)

    const [serviceForm, setServiceForm] = useState({
        name: '',
        category: 'Giặt',
        pricingType: 'kg',
        price: '',
        minOrder: '',
        estimatedTime: '',
        description: '',
        available: true
    })

    const [machineForm, setMachineForm] = useState({
        name: '',
        type: 'Washer',
        status: 'empty',
        location: '',
        capacity: '',
        model: '',
        purchaseDate: ''
    })

    const [supplyForm, setSupplyForm] = useState({
        name: '',
        current: '',
        max: '',
        unit: 'L',
        reorderPoint: '',
        supplier: '',
        lastReorder: ''
    })

    // Initialize data from localStorage or data files
    const [services, setServices] = useState(() => loadServices(servicesData))
    const [machines, setMachines] = useState(() => loadMachines(machinesData))
    const [supplies, setSupplies] = useState(() => loadSupplies(suppliesData))

    // Auto-save to localStorage whenever data changes
    useEffect(() => {
        saveServices(services)
    }, [services])

    useEffect(() => {
        saveMachines(machines)
    }, [machines])

    useEffect(() => {
        saveSupplies(supplies)
    }, [supplies])

    const getStatusColor = (status) => {
        switch (status) {
            case 'empty':
                return '#4d9e84'
            case 'washing':
                return '#719FC2'
            case 'maintenance':
                return '#5492b4'
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

    // Service CRUD functions
    const handleAddService = () => {
        setEditingService(null)
        setServiceForm({
            name: '',
            category: 'Giặt',
            pricingType: 'kg',
            price: '',
            minOrder: '',
            estimatedTime: '',
            description: '',
            available: true
        })
        setShowServiceModal(true)
    }

    const handleEditService = (service) => {
        setEditingService(service)
        setServiceForm({
            name: service.name,
            category: service.category,
            pricingType: service.pricingType,
            price: service.price,
            minOrder: service.minOrder,
            estimatedTime: service.estimatedTime,
            description: service.description,
            available: service.available
        })
        setShowServiceModal(true)
    }

    const handleDeleteService = (serviceId) => {
        setConfirmDialog({
            show: true,
            title: 'Delete Service',
            message: 'Are you sure you want to delete this service? This action cannot be undone.',
            type: 'danger',
            onConfirm: () => {
                setServices(services.filter(s => s.id !== serviceId))
                toast.success(`Service ${serviceId} deleted successfully!`)
                setConfirmDialog({ ...confirmDialog, show: false })
            }
        })
    }

    const handleSaveService = () => {
        if (!serviceForm.name || !serviceForm.price || !serviceForm.minOrder) {
            toast.warning('Please fill in all required fields')
            return
        }

        if (editingService) {
            // Update existing service
            setServices(services.map(s =>
                s.id === editingService.id
                    ? { ...s, ...serviceForm, price: Number(serviceForm.price), minOrder: Number(serviceForm.minOrder) }
                    : s
            ))
            toast.success(`Service ${editingService.id} updated successfully!`)
        } else {
            // Add new service
            const newService = {
                id: `S-${String(services.length + 1).padStart(2, '0')}`,
                ...serviceForm,
                price: Number(serviceForm.price),
                minOrder: Number(serviceForm.minOrder)
            }
            setServices([...services, newService])
            toast.success(`Service ${newService.id} created successfully!`)
        }
        setShowServiceModal(false)
    }

    // Machine CRUD functions
    const handleAddMachine = () => {
        setEditingMachine(null)
        setMachineForm({
            name: '',
            type: 'Washer',
            status: 'empty',
            location: '',
            capacity: '',
            model: '',
            purchaseDate: ''
        })
        setShowMachineModal(true)
    }

    const handleEditMachine = (machine) => {
        setEditingMachine(machine)
        setMachineForm({
            name: machine.name,
            type: machine.type,
            status: machine.status,
            location: machine.location,
            capacity: machine.capacity,
            model: machine.model,
            purchaseDate: machine.purchaseDate
        })
        setShowMachineModal(true)
    }

    const handleDeleteMachine = (machineId) => {
        setConfirmDialog({
            show: true,
            title: 'Delete Machine',
            message: 'Are you sure you want to delete this machine? This action cannot be undone.',
            type: 'danger',
            onConfirm: () => {
                setMachines(machines.filter(m => m.id !== machineId))
                toast.success(`Machine ${machineId} deleted successfully!`)
                setConfirmDialog({ ...confirmDialog, show: false })
            }
        })
    }

    const handleViewMachine = (machine) => {
        setViewingMachine(machine)
        setShowMachineViewModal(true)
    }

    const handleSaveMachine = () => {
        if (!machineForm.name || !machineForm.location) {
            toast.warning('Please fill in all required fields')
            return
        }

        if (editingMachine) {
            setMachines(machines.map(m =>
                m.id === editingMachine.id
                    ? { ...m, ...machineForm }
                    : m
            ))
            toast.success(`Machine ${editingMachine.id} updated successfully!`)
        } else {
            const newMachine = {
                id: `M-${String(machines.length + 1).padStart(2, '00')}`,
                ...machineForm
            }
            setMachines([...machines, newMachine])
            toast.success(`Machine ${newMachine.id} created successfully!`)
        }
        setShowMachineModal(false)
    }

    // Supply CRUD functions
    const handleAddSupply = () => {
        setEditingSupply(null)
        setSupplyForm({
            name: '',
            current: '',
            max: '',
            unit: 'L',
            reorderPoint: '',
            supplier: '',
            lastReorder: ''
        })
        setShowSupplyModal(true)
    }

    const handleEditSupply = (supply) => {
        setEditingSupply(supply)
        setSupplyForm({
            name: supply.name,
            current: supply.current,
            max: supply.max,
            unit: supply.unit,
            reorderPoint: supply.reorderPoint,
            supplier: supply.supplier,
            lastReorder: supply.lastReorder
        })
        setShowSupplyModal(true)
    }

    const handleDeleteSupply = (supplyId) => {
        setConfirmDialog({
            show: true,
            title: 'Delete Supply',
            message: 'Are you sure you want to delete this supply? This action cannot be undone.',
            type: 'danger',
            onConfirm: () => {
                setSupplies(supplies.filter(s => s.id !== supplyId))
                toast.success(`Supply ${supplyId} deleted successfully!`)
                setConfirmDialog({ ...confirmDialog, show: false })
            }
        })
    }

    const handleViewSupply = (supply) => {
        setViewingSupply(supply)
        setShowSupplyViewModal(true)
    }

    const handleSaveSupply = () => {
        if (!supplyForm.name || !supplyForm.current || !supplyForm.max) {
            toast.warning('Please fill in all required fields')
            return
        }

        if (editingSupply) {
            setSupplies(supplies.map(s =>
                s.id === editingSupply.id
                    ? { ...s, ...supplyForm, current: Number(supplyForm.current), max: Number(supplyForm.max), reorderPoint: Number(supplyForm.reorderPoint) }
                    : s
            ))
            toast.success(`Supply ${editingSupply.id} updated successfully!`)
        } else {
            const newSupply = {
                id: `SUP-${String(supplies.length + 1).padStart(2, '00')}`,
                ...supplyForm,
                current: Number(supplyForm.current),
                max: Number(supplyForm.max),
                reorderPoint: Number(supplyForm.reorderPoint)
            }
            setSupplies([...supplies, newSupply])
            toast.success(`Supply ${newSupply.id} created successfully!`)
        }
        setShowSupplyModal(false)
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
                        onClick={handleAddService}
                    >
                        <PlusOutlined /> Add Service
                    </button>
                </div>

                <div className="shop-operations-services-grid">
                    {(showAllServices ? services : services.slice(0, 8)).map((service) => (
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
                                {showAllServices ? (
                                    <>
                                        <button className="service-edit-btn" onClick={() => handleEditService(service)}>
                                            <EditOutlined /> Edit
                                        </button>
                                        <button className="service-delete-btn" onClick={() => handleDeleteService(service.id)}>
                                            <DeleteOutlined /> Delete
                                        </button>
                                    </>
                                ) : (
                                    <button className="service-edit-btn" onClick={() => handleEditService(service)} style={{ fontSize: '13px', padding: '8px 16px' }}>
                                        <EyeOutlined /> View
                                    </button>
                                )}
                            </div>
                        </div>
                    ))}
                </div>
                {services.length > 8 && (
                    <div style={{ textAlign: 'center', marginTop: '20px' }}>
                        <button
                            className="shop-operations-view-all-btn"
                            onClick={() => setShowAllServices(!showAllServices)}
                        >
                            <EyeOutlined /> {showAllServices ? 'Show Less' : `View All Services (${services.length})`}
                        </button>
                    </div>
                )}
            </div>

            {/* Machine Status */}
            <div className="shop-operations-section">
                <div className="shop-operations-section-header">
                    <div>
                        <h2 className="shop-operations-section-title">
                            <ToolOutlined style={{ marginRight: '8px' }} />
                            Machine Status
                        </h2>
                        <p className="shop-operations-section-desc">
                            Monitor and manage your laundry machines
                        </p>
                    </div>
                    <button className="shop-operations-add-btn" onClick={handleAddMachine}>
                        <PlusOutlined /> Add Machine
                    </button>
                </div>
                <div className="shop-operations-machine-grid">
                    {(showAllMachines ? machines : machines.slice(0, 10)).map((machine) => (
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
                            <div className="service-actions" style={{ marginTop: '12px' }}>
                                {showAllMachines ? (
                                    <>
                                        <button className="service-edit-btn" onClick={() => handleEditMachine(machine)}>
                                            <EditOutlined /> Edit
                                        </button>
                                        <button className="service-delete-btn" onClick={() => handleDeleteMachine(machine.id)}>
                                            <DeleteOutlined /> Delete
                                        </button>
                                    </>
                                ) : (
                                    <button className="service-edit-btn" onClick={() => handleViewMachine(machine)} style={{ fontSize: '13px', padding: '6px 12px' }}>
                                        <EyeOutlined /> View
                                    </button>
                                )}
                            </div>
                        </div>
                    ))}
                </div>
                {machines.length > 10 && (
                    <div style={{ textAlign: 'center', marginTop: '20px' }}>
                        <button
                            className="shop-operations-view-all-btn"
                            onClick={() => setShowAllMachines(!showAllMachines)}
                        >
                            <EyeOutlined /> {showAllMachines ? 'Show Less' : `View All Machines (${machines.length})`}
                        </button>
                    </div>
                )}
            </div>

            {/* Supplies Inventory */}
            <div className="shop-operations-section">
                <div className="shop-operations-section-header">
                    <div>
                        <h2 className="shop-operations-section-title">
                            <InboxOutlined style={{ marginRight: '8px' }} />
                            Supplies Inventory
                        </h2>
                        <p className="shop-operations-section-desc">
                            Track and manage your laundry supplies
                        </p>
                    </div>
                    <button className="shop-operations-add-btn" onClick={handleAddSupply}>
                        <PlusOutlined /> Add Supply
                    </button>
                </div>
                <div className="shop-operations-supplies-grid">
                    {(showAllSupplies ? supplies : supplies.slice(0, 8)).map((supply) => {
                        const percentage = (supply.current / supply.max) * 100
                        const isLow = supply.current <= supply.reorderPoint

                        return (
                            <div
                                key={supply.id}
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
                                            background: isLow ? '#c05a50' : '#719fc2'
                                        }}
                                    />
                                </div>
                                <div className="shop-operations-supply-footer">
                                    <span className="shop-operations-supply-percentage">
                                        {percentage.toFixed(0)}%
                                    </span>
                                </div>
                                <div className="service-actions" style={{ marginTop: '12px' }}>
                                    {showAllSupplies ? (
                                        <>
                                            <button className="service-edit-btn" onClick={() => handleEditSupply(supply)}>
                                                <EditOutlined /> Edit
                                            </button>
                                            <button className="service-delete-btn" onClick={() => handleDeleteSupply(supply.id)}>
                                                <DeleteOutlined /> Delete
                                            </button>
                                        </>
                                    ) : (
                                        <button className="service-edit-btn" onClick={() => handleViewSupply(supply)} style={{ fontSize: '13px', padding: '6px 12px' }}>
                                            <EyeOutlined /> View
                                        </button>
                                    )}
                                </div>
                            </div>
                        )
                    })}
                </div>
                {supplies.length > 8 && (
                    <div style={{ textAlign: 'center', marginTop: '20px' }}>
                        <button
                            className="shop-operations-view-all-btn"
                            onClick={() => setShowAllSupplies(!showAllSupplies)}
                        >
                            <EyeOutlined /> {showAllSupplies ? 'Show Less' : `View All Supplies (${supplies.length})`}
                        </button>
                    </div>
                )}
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
                            <h2>{editingService ? 'Edit Service' : 'Add New Service'}</h2>
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
                                        value={serviceForm.name}
                                        onChange={(e) => setServiceForm({ ...serviceForm, name: e.target.value })}
                                    />
                                </div>

                                <div className="form-row">
                                    <div className="form-group">
                                        <label>Category *</label>
                                        <select className="form-input" value={serviceForm.category} onChange={(e) => setServiceForm({ ...serviceForm, category: e.target.value })}>
                                            <option>Giặt</option>
                                            <option>Giặt + Sấy</option>
                                            <option>Giặt Cao Cấp</option>
                                            <option>Là/Ủi</option>
                                            <option>Giặt Đồ Lớn</option>
                                        </select>
                                    </div>

                                    <div className="form-group">
                                        <label>Pricing Type *</label>
                                        <select className="form-input" value={serviceForm.pricingType} onChange={(e) => setServiceForm({ ...serviceForm, pricingType: e.target.value })}>
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
                                            value={serviceForm.price}
                                            onChange={(e) => setServiceForm({ ...serviceForm, price: e.target.value })}
                                        />
                                    </div>

                                    <div className="form-group">
                                        <label>Minimum Order *</label>
                                        <input
                                            type="number"
                                            placeholder="3"
                                            className="form-input"
                                            value={serviceForm.minOrder}
                                            onChange={(e) => setServiceForm({ ...serviceForm, minOrder: e.target.value })}
                                        />
                                    </div>
                                </div>

                                <div className="form-group">
                                    <label>Estimated Time *</label>
                                    <input
                                        type="text"
                                        placeholder="e.g., 24 giờ, 2-3 ngày"
                                        className="form-input"
                                        value={serviceForm.estimatedTime}
                                        onChange={(e) => setServiceForm({ ...serviceForm, estimatedTime: e.target.value })}
                                    />
                                </div>

                                <div className="form-group">
                                    <label>Description</label>
                                    <textarea
                                        placeholder="Service description..."
                                        className="form-textarea"
                                        rows="3"
                                        value={serviceForm.description}
                                        onChange={(e) => setServiceForm({ ...serviceForm, description: e.target.value })}
                                    ></textarea>
                                </div>

                                <div className="form-group">
                                    <label className="form-checkbox">
                                        <input type="checkbox" checked={serviceForm.available} onChange={(e) => setServiceForm({ ...serviceForm, available: e.target.checked })} />
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
                            <button className="btn-confirm" onClick={handleSaveService}>
                                {editingService ? 'Update Service' : 'Add Service'}
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {/* Machine Modal (Add/Edit) */}
            {showMachineModal && (
                <div className="shop-operations-modal-overlay" onClick={() => setShowMachineModal(false)}>
                    <div className="shop-operations-modal" onClick={(e) => e.stopPropagation()}>
                        <div className="modal-header">
                            <h2>{editingMachine ? 'Edit Machine' : 'Add New Machine'}</h2>
                            <button className="modal-close" onClick={() => setShowMachineModal(false)}>×</button>
                        </div>
                        <div className="modal-body">
                            <div className="modal-form">
                                <div className="form-group">
                                    <label>Machine Name *</label>
                                    <input type="text" className="form-input" placeholder="e.g., Washer A5" value={machineForm.name} onChange={(e) => setMachineForm({ ...machineForm, name: e.target.value })} />
                                </div>
                                <div className="form-row">
                                    <div className="form-group">
                                        <label>Type *</label>
                                        <select className="form-input" value={machineForm.type} onChange={(e) => setMachineForm({ ...machineForm, type: e.target.value })}>
                                            <option>Washer</option>
                                            <option>Dryer</option>
                                        </select>
                                    </div>
                                    <div className="form-group">
                                        <label>Status *</label>
                                        <select className="form-input" value={machineForm.status} onChange={(e) => setMachineForm({ ...machineForm, status: e.target.value })}>
                                            <option value="empty">Ready (Empty)</option>
                                            <option value="washing">Washing/Drying</option>
                                            <option value="maintenance">Maintenance</option>
                                        </select>
                                    </div>
                                </div>
                                <div className="form-row">
                                    <div className="form-group">
                                        <label>Location *</label>
                                        <input type="text" className="form-input" placeholder="e.g., Floor 1" value={machineForm.location} onChange={(e) => setMachineForm({ ...machineForm, location: e.target.value })} />
                                    </div>
                                    <div className="form-group">
                                        <label>Capacity</label>
                                        <input type="text" className="form-input" placeholder="e.g., 10kg" value={machineForm.capacity} onChange={(e) => setMachineForm({ ...machineForm, capacity: e.target.value })} />
                                    </div>
                                </div>
                                <div className="form-row">
                                    <div className="form-group">
                                        <label>Model</label>
                                        <input type="text" className="form-input" placeholder="e.g., WX-2000" value={machineForm.model} onChange={(e) => setMachineForm({ ...machineForm, model: e.target.value })} />
                                    </div>
                                    <div className="form-group">
                                        <label>Purchase Date</label>
                                        <input type="date" className="form-input" value={machineForm.purchaseDate} onChange={(e) => setMachineForm({ ...machineForm, purchaseDate: e.target.value })} />
                                    </div>
                                </div>
                            </div>
                        </div>
                        <div className="modal-footer">
                            <button className="btn-cancel" onClick={() => setShowMachineModal(false)}>Cancel</button>
                            <button className="btn-confirm" onClick={handleSaveMachine}>{editingMachine ? 'Update Machine' : 'Add Machine'}</button>
                        </div>
                    </div>
                </div>
            )}

            {/* Machine View Modal */}
            {showMachineViewModal && viewingMachine && (
                <div className="shop-operations-modal-overlay" onClick={() => setShowMachineViewModal(false)}>
                    <div className="shop-operations-modal" onClick={(e) => e.stopPropagation()}>
                        <div className="modal-header">
                            <h2>Machine Details</h2>
                            <button className="modal-close" onClick={() => setShowMachineViewModal(false)}>×</button>
                        </div>
                        <div className="modal-body">
                            <div style={{ display: 'grid', gap: '16px' }}>
                                <div style={{ display: 'flex', justifyContent: 'space-between', padding: '12px', background: '#faf9f2', borderRadius: '8px' }}>
                                    <span style={{ fontWeight: '600', color: '#64748b' }}>Machine ID:</span>
                                    <span style={{ fontWeight: '600', color: '#0f172a' }}>{viewingMachine.id}</span>
                                </div>
                                <div style={{ display: 'flex', justifyContent: 'space-between', padding: '12px', background: '#faf9f2', borderRadius: '8px' }}>
                                    <span style={{ fontWeight: '600', color: '#64748b' }}>Name:</span>
                                    <span style={{ color: '#0f172a' }}>{viewingMachine.name}</span>
                                </div>
                                <div style={{ display: 'flex', justifyContent: 'space-between', padding: '12px', background: '#faf9f2', borderRadius: '8px' }}>
                                    <span style={{ fontWeight: '600', color: '#64748b' }}>Type:</span>
                                    <span style={{ color: '#0f172a' }}>{viewingMachine.type}</span>
                                </div>
                                <div style={{ display: 'flex', justifyContent: 'space-between', padding: '12px', background: '#faf9f2', borderRadius: '8px' }}>
                                    <span style={{ fontWeight: '600', color: '#64748b' }}>Status:</span>
                                    <span style={{ color: getStatusColor(viewingMachine.status), fontWeight: '600' }}>{getStatusLabel(viewingMachine.status)}</span>
                                </div>
                                <div style={{ display: 'flex', justifyContent: 'space-between', padding: '12px', background: '#faf9f2', borderRadius: '8px' }}>
                                    <span style={{ fontWeight: '600', color: '#64748b' }}>Location:</span>
                                    <span style={{ color: '#0f172a' }}>{viewingMachine.location}</span>
                                </div>
                                <div style={{ display: 'flex', justifyContent: 'space-between', padding: '12px', background: '#faf9f2', borderRadius: '8px' }}>
                                    <span style={{ fontWeight: '600', color: '#64748b' }}>Capacity:</span>
                                    <span style={{ color: '#0f172a' }}>{viewingMachine.capacity}</span>
                                </div>
                                <div style={{ display: 'flex', justifyContent: 'space-between', padding: '12px', background: '#faf9f2', borderRadius: '8px' }}>
                                    <span style={{ fontWeight: '600', color: '#64748b' }}>Model:</span>
                                    <span style={{ color: '#0f172a' }}>{viewingMachine.model}</span>
                                </div>
                                <div style={{ display: 'flex', justifyContent: 'space-between', padding: '12px', background: '#faf9f2', borderRadius: '8px' }}>
                                    <span style={{ fontWeight: '600', color: '#64748b' }}>Purchase Date:</span>
                                    <span style={{ color: '#0f172a' }}>{viewingMachine.purchaseDate}</span>
                                </div>
                                {viewingMachine.timeLeft && (
                                    <div style={{ display: 'flex', justifyContent: 'space-between', padding: '12px', background: '#faf9f2', borderRadius: '8px' }}>
                                        <span style={{ fontWeight: '600', color: '#64748b' }}>Time Left:</span>
                                        <span style={{ color: '#719FC2', fontWeight: '600' }}>{viewingMachine.timeLeft}</span>
                                    </div>
                                )}
                            </div>
                        </div>
                        <div className="modal-footer">
                            <button className="btn-cancel" onClick={() => setShowMachineViewModal(false)}>Close</button>
                            <button className="btn-confirm" onClick={() => { setShowMachineViewModal(false); handleEditMachine(viewingMachine); }}>Edit Machine</button>
                        </div>
                    </div>
                </div>
            )}

            {/* Supply Modal (Add/Edit) */}
            {showSupplyModal && (
                <div className="shop-operations-modal-overlay" onClick={() => setShowSupplyModal(false)}>
                    <div className="shop-operations-modal" onClick={(e) => e.stopPropagation()}>
                        <div className="modal-header">
                            <h2>{editingSupply ? 'Edit Supply' : 'Add New Supply'}</h2>
                            <button className="modal-close" onClick={() => setShowSupplyModal(false)}>×</button>
                        </div>
                        <div className="modal-body">
                            <div className="modal-form">
                                <div className="form-group">
                                    <label>Supply Name *</label>
                                    <input type="text" className="form-input" placeholder="e.g., Fabric Softener" value={supplyForm.name} onChange={(e) => setSupplyForm({ ...supplyForm, name: e.target.value })} />
                                </div>
                                <div className="form-row">
                                    <div className="form-group">
                                        <label>Current Stock *</label>
                                        <input type="number" className="form-input" placeholder="65" value={supplyForm.current} onChange={(e) => setSupplyForm({ ...supplyForm, current: e.target.value })} />
                                    </div>
                                    <div className="form-group">
                                        <label>Maximum Capacity *</label>
                                        <input type="number" className="form-input" placeholder="100" value={supplyForm.max} onChange={(e) => setSupplyForm({ ...supplyForm, max: e.target.value })} />
                                    </div>
                                </div>
                                <div className="form-row">
                                    <div className="form-group">
                                        <label>Unit *</label>
                                        <select className="form-input" value={supplyForm.unit} onChange={(e) => setSupplyForm({ ...supplyForm, unit: e.target.value })}>
                                            <option value="L">Liter (L)</option>
                                            <option value="kg">Kilogram (kg)</option>
                                            <option value="bottles">Bottles</option>
                                        </select>
                                    </div>
                                    <div className="form-group">
                                        <label>Reorder Point *</label>
                                        <input type="number" className="form-input" placeholder="20" value={supplyForm.reorderPoint} onChange={(e) => setSupplyForm({ ...supplyForm, reorderPoint: e.target.value })} />
                                    </div>
                                </div>
                                <div className="form-group">
                                    <label>Supplier</label>
                                    <input type="text" className="form-input" placeholder="e.g., CleanPro Vietnam" value={supplyForm.supplier} onChange={(e) => setSupplyForm({ ...supplyForm, supplier: e.target.value })} />
                                </div>
                                <div className="form-group">
                                    <label>Last Reorder Date</label>
                                    <input type="date" className="form-input" value={supplyForm.lastReorder} onChange={(e) => setSupplyForm({ ...supplyForm, lastReorder: e.target.value })} />
                                </div>
                            </div>
                        </div>
                        <div className="modal-footer">
                            <button className="btn-cancel" onClick={() => setShowSupplyModal(false)}>Cancel</button>
                            <button className="btn-confirm" onClick={handleSaveSupply}>{editingSupply ? 'Update Supply' : 'Add Supply'}</button>
                        </div>
                    </div>
                </div>
            )}

            {/* Supply View Modal */}
            {showSupplyViewModal && viewingSupply && (
                <div className="shop-operations-modal-overlay" onClick={() => setShowSupplyViewModal(false)}>
                    <div className="shop-operations-modal" onClick={(e) => e.stopPropagation()}>
                        <div className="modal-header">
                            <h2>Supply Details</h2>
                            <button className="modal-close" onClick={() => setShowSupplyViewModal(false)}>×</button>
                        </div>
                        <div className="modal-body">
                            <div style={{ display: 'grid', gap: '16px' }}>
                                <div style={{ display: 'flex', justifyContent: 'space-between', padding: '12px', background: '#faf9f2', borderRadius: '8px' }}>
                                    <span style={{ fontWeight: '600', color: '#64748b' }}>Supply ID:</span>
                                    <span style={{ fontWeight: '600', color: '#0f172a' }}>{viewingSupply.id}</span>
                                </div>
                                <div style={{ display: 'flex', justifyContent: 'space-between', padding: '12px', background: '#faf9f2', borderRadius: '8px' }}>
                                    <span style={{ fontWeight: '600', color: '#64748b' }}>Name:</span>
                                    <span style={{ color: '#0f172a' }}>{viewingSupply.name}</span>
                                </div>
                                <div style={{ display: 'flex', justifyContent: 'space-between', padding: '12px', background: '#faf9f2', borderRadius: '8px' }}>
                                    <span style={{ fontWeight: '600', color: '#64748b' }}>Current Stock:</span>
                                    <span style={{ color: '#0f172a', fontWeight: '600' }}>{viewingSupply.current} {viewingSupply.unit}</span>
                                </div>
                                <div style={{ display: 'flex', justifyContent: 'space-between', padding: '12px', background: '#faf9f2', borderRadius: '8px' }}>
                                    <span style={{ fontWeight: '600', color: '#64748b' }}>Maximum Capacity:</span>
                                    <span style={{ color: '#0f172a' }}>{viewingSupply.max} {viewingSupply.unit}</span>
                                </div>
                                <div style={{ display: 'flex', justifyContent: 'space-between', padding: '12px', background: '#faf9f2', borderRadius: '8px' }}>
                                    <span style={{ fontWeight: '600', color: '#64748b' }}>Stock Level:</span>
                                    <span style={{ color: viewingSupply.current <= viewingSupply.reorderPoint ? '#c05a50' : '#4d9e84', fontWeight: '600' }}>
                                        {((viewingSupply.current / viewingSupply.max) * 100).toFixed(0)}%
                                        {viewingSupply.current <= viewingSupply.reorderPoint && ' (Low)'}
                                    </span>
                                </div>
                                <div style={{ display: 'flex', justifyContent: 'space-between', padding: '12px', background: '#faf9f2', borderRadius: '8px' }}>
                                    <span style={{ fontWeight: '600', color: '#64748b' }}>Reorder Point:</span>
                                    <span style={{ color: '#0f172a' }}>{viewingSupply.reorderPoint} {viewingSupply.unit}</span>
                                </div>
                                <div style={{ display: 'flex', justifyContent: 'space-between', padding: '12px', background: '#faf9f2', borderRadius: '8px' }}>
                                    <span style={{ fontWeight: '600', color: '#64748b' }}>Supplier:</span>
                                    <span style={{ color: '#0f172a' }}>{viewingSupply.supplier}</span>
                                </div>
                                <div style={{ display: 'flex', justifyContent: 'space-between', padding: '12px', background: '#faf9f2', borderRadius: '8px' }}>
                                    <span style={{ fontWeight: '600', color: '#64748b' }}>Last Reorder:</span>
                                    <span style={{ color: '#0f172a' }}>{viewingSupply.lastReorder}</span>
                                </div>
                            </div>
                        </div>
                        <div className="modal-footer">
                            <button className="btn-cancel" onClick={() => setShowSupplyViewModal(false)}>Close</button>
                            <button className="btn-confirm" onClick={() => { setShowSupplyViewModal(false); handleEditSupply(viewingSupply); }}>Edit Supply</button>
                        </div>
                    </div>
                </div>
            )}

            {/* Confirm Dialog */}
            {confirmDialog.show && (
                <ConfirmDialog
                    title={confirmDialog.title}
                    message={confirmDialog.message}
                    type={confirmDialog.type}
                    onConfirm={confirmDialog.onConfirm}
                    onCancel={() => setConfirmDialog({ ...confirmDialog, show: false })}
                />
            )}
        </div>
    )
}

export default ShopOperations
