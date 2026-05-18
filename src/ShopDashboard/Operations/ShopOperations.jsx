import { useState, useEffect } from 'react'
import { ShoppingBag, Pencil, Trash2, Plus, Wrench, Inbox, Eye, X, Clock, AlertTriangle } from 'lucide-react'
import './ShopOperations.css'
import { services as servicesData, machines as machinesData, supplies as suppliesData } from '../../data'
import { loadServices, saveServices, loadMachines, saveMachines, loadSupplies, saveSupplies } from '../../utils/dataManager'
import toast from '../../utils/toast'
import ConfirmDialog from '../../components/ConfirmDialog/ConfirmDialog'
import { useTranslation } from '../../shared/lib/i18n'

function ShopOperations() {
    const { t } = useTranslation()
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

    const serviceCategoryOptions = [
        { value: 'Giặt', label: t('shop.operations.serviceCategories.wash') },
        { value: 'Giặt + Sấy', label: t('shop.operations.serviceCategories.washDry') },
        { value: 'Giặt Cao Cấp', label: t('shop.operations.serviceCategories.premiumWash') },
        { value: 'Là/Ủi', label: t('shop.operations.serviceCategories.iron') },
        { value: 'Giặt Đồ Lớn', label: t('shop.operations.serviceCategories.bulky') },
    ]

    const pricingTypeOptions = [
        { value: 'kg', label: t('shop.operations.pricingType.perKg') },
        { value: 'piece', label: t('shop.operations.pricingType.perPiece') },
    ]

    const machineTypeOptions = [
        { value: 'Washer', label: t('shop.operations.machineType.washer') },
        { value: 'Dryer', label: t('shop.operations.machineType.dryer') },
    ]

    const machineStatusOptions = [
        { value: 'empty', label: t('shop.operations.machineStatus.readyEmpty') },
        { value: 'washing', label: t('shop.operations.machineStatus.washingDrying') },
        { value: 'maintenance', label: t('shop.operations.machineStatus.maintenance') },
    ]

    const supplyUnitOptions = [
        { value: 'L', label: t('shop.operations.unit.liter') },
        { value: 'kg', label: t('shop.operations.unit.kilogram') },
        { value: 'bottles', label: t('shop.operations.unit.bottles') },
    ]

    const getServiceCategoryLabel = (category) => {
        const match = serviceCategoryOptions.find(o => o.value === category)
        return match ? match.label : category
    }

    const getPricingUnitLabel = (pricingType) => {
        if (pricingType === 'kg') return t('shop.operations.unit.kg')
        if (pricingType === 'piece') return t('shop.operations.unit.piece')
        return pricingType
    }

    const getMachineTypeLabel = (type) => {
        const match = machineTypeOptions.find(o => o.value === type)
        return match ? match.label : type
    }

    const getSupplyUnitLabel = (unit) => {
        const match = supplyUnitOptions.find(o => o.value === unit)
        return match ? match.label : unit
    }

    const getStatusLabel = (status) => {
        switch (status) {
            case 'empty':
                return t('shop.operations.machineStatus.readyEmpty')
            case 'washing':
                return t('shop.operations.machineStatus.washingDrying')
            case 'maintenance':
                return t('shop.operations.machineStatus.maintenance')
            default:
                return t('shop.operations.machineStatus.unknown')
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
            title: t('shop.operations.confirm.deleteServiceTitle'),
            message: t('shop.operations.confirm.deleteServiceMessage'),
            type: 'danger',
            onConfirm: () => {
                setServices(services.filter(s => s.id !== serviceId))
                toast.success(`${t('shop.operations.service')} ${serviceId} ${t('shop.operations.toast.deletedSuccessSuffix')}`)
                setConfirmDialog({ ...confirmDialog, show: false })
            }
        })
    }

    const handleSaveService = () => {
        if (!serviceForm.name || !serviceForm.price || !serviceForm.minOrder) {
            toast.warning(t('shop.operations.toast.fillRequiredFields'))
            return
        }

        if (editingService) {
            // Update existing service
            setServices(services.map(s =>
                s.id === editingService.id
                    ? { ...s, ...serviceForm, price: Number(serviceForm.price), minOrder: Number(serviceForm.minOrder) }
                    : s
            ))
            toast.success(`${t('shop.operations.service')} ${editingService.id} ${t('shop.operations.toast.updatedSuccessSuffix')}`)
        } else {
            // Add new service
            const newService = {
                id: `S-${String(services.length + 1).padStart(2, '0')}`,
                ...serviceForm,
                price: Number(serviceForm.price),
                minOrder: Number(serviceForm.minOrder)
            }
            setServices([...services, newService])
            toast.success(`${t('shop.operations.service')} ${newService.id} ${t('shop.operations.toast.createdSuccessSuffix')}`)
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
            title: t('shop.operations.confirm.deleteMachineTitle'),
            message: t('shop.operations.confirm.deleteMachineMessage'),
            type: 'danger',
            onConfirm: () => {
                setMachines(machines.filter(m => m.id !== machineId))
                toast.success(`${t('shop.operations.machine')} ${machineId} ${t('shop.operations.toast.deletedSuccessSuffix')}`)
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
            toast.warning(t('shop.operations.toast.fillRequiredFields'))
            return
        }

        if (editingMachine) {
            setMachines(machines.map(m =>
                m.id === editingMachine.id
                    ? { ...m, ...machineForm }
                    : m
            ))
            toast.success(`${t('shop.operations.machine')} ${editingMachine.id} ${t('shop.operations.toast.updatedSuccessSuffix')}`)
        } else {
            const newMachine = {
                id: `M-${String(machines.length + 1).padStart(2, '00')}`,
                ...machineForm
            }
            setMachines([...machines, newMachine])
            toast.success(`${t('shop.operations.machine')} ${newMachine.id} ${t('shop.operations.toast.createdSuccessSuffix')}`)
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
            title: t('shop.operations.confirm.deleteSupplyTitle'),
            message: t('shop.operations.confirm.deleteSupplyMessage'),
            type: 'danger',
            onConfirm: () => {
                setSupplies(supplies.filter(s => s.id !== supplyId))
                toast.success(`${t('shop.operations.supply')} ${supplyId} ${t('shop.operations.toast.deletedSuccessSuffix')}`)
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
            toast.warning(t('shop.operations.toast.fillRequiredFields'))
            return
        }

        if (editingSupply) {
            setSupplies(supplies.map(s =>
                s.id === editingSupply.id
                    ? { ...s, ...supplyForm, current: Number(supplyForm.current), max: Number(supplyForm.max), reorderPoint: Number(supplyForm.reorderPoint) }
                    : s
            ))
            toast.success(`${t('shop.operations.supply')} ${editingSupply.id} ${t('shop.operations.toast.updatedSuccessSuffix')}`)
        } else {
            const newSupply = {
                id: `SUP-${String(supplies.length + 1).padStart(2, '00')}`,
                ...supplyForm,
                current: Number(supplyForm.current),
                max: Number(supplyForm.max),
                reorderPoint: Number(supplyForm.reorderPoint)
            }
            setSupplies([...supplies, newSupply])
            toast.success(`${t('shop.operations.supply')} ${newSupply.id} ${t('shop.operations.toast.createdSuccessSuffix')}`)
        }
        setShowSupplyModal(false)
    }

    return (
        <div className="shop-operations">
            <div className="shop-operations-header">
                <h1 className="shop-operations-title">{t('shop.operations.title')}</h1>
                <p className="shop-operations-subtitle">{t('shop.operations.subtitle')}</p>
            </div>

            {/* Service Menu Management */}
            <div className="shop-operations-section">
                <div className="shop-operations-section-header">
                    <div>
                        <h2 className="shop-operations-section-title">
                            <ShoppingBag size={18} style={{ marginRight: '8px' }} />
                            {t('shop.operations.serviceMenuTitle')}
                        </h2>
                        <p className="shop-operations-section-desc">
                            {t('shop.operations.serviceMenuDesc')}
                        </p>
                    </div>
                    <button
                        className="shop-operations-add-btn"
                        onClick={handleAddService}
                    >
                        <Plus size={16} /> {t('shop.operations.addService')}
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
                                    <div className="service-category">{getServiceCategoryLabel(service.category)}</div>
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
                                        /{getPricingUnitLabel(service.pricingType)}
                                    </span>
                                </div>
                                <div className="service-min-order">
                                    {t('shop.operations.min')}: {service.minOrder} {getPricingUnitLabel(service.pricingType)}
                                </div>
                            </div>

                            <div className="service-time">
                                <span><Clock size={14} style={{ marginRight: 4, verticalAlign: 'middle' }} />{t('shop.operations.estimatedTimeLabel')}: {service.estimatedTime}</span>
                            </div>

                            <div className="service-actions">
                                {showAllServices ? (
                                    <>
                                        <button className="service-edit-btn" onClick={() => handleEditService(service)}>
                                            <Pencil size={14} /> {t('common.edit')}
                                        </button>
                                        <button className="service-delete-btn" onClick={() => handleDeleteService(service.id)}>
                                            <Trash2 size={14} /> {t('common.delete')}
                                        </button>
                                    </>
                                ) : (
                                    <button className="service-edit-btn" onClick={() => handleEditService(service)} style={{ fontSize: '13px', padding: '8px 16px' }}>
                                        <Eye size={14} /> {t('shop.operations.view')}
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
                            <Eye size={16} /> {showAllServices ? t('shop.operations.showLess') : `${t('shop.operations.viewAllServices')} (${services.length})`}
                        </button>
                    </div>
                )}
            </div>

            {/* Machine Status */}
            <div className="shop-operations-section">
                <div className="shop-operations-section-header">
                    <div>
                        <h2 className="shop-operations-section-title">
                            <Wrench size={18} style={{ marginRight: '8px' }} />
                            {t('shop.machineStatus')}
                        </h2>
                        <p className="shop-operations-section-desc">
                            {t('shop.operations.machineStatusDesc')}
                        </p>
                    </div>
                    <button className="shop-operations-add-btn" onClick={handleAddMachine}>
                        <Plus size={16} /> {t('shop.operations.addMachine')}
                    </button>
                </div>
                <div className="shop-operations-machine-grid">
                    {(showAllMachines ? machines : machines.slice(0, 10)).map((machine) => (
                        <div key={machine.id} className="shop-operations-machine-card">
                            <div className="shop-operations-machine-header">
                                <div className="shop-operations-machine-id">{machine.id}</div>
                                <div
                                    className={`shop-operations-machine-status-dot machine-status-${machine.status}`}
                                />
                            </div>
                            <div className="shop-operations-machine-name">{machine.name}</div>
                            <div className="shop-operations-machine-location">{machine.location}</div>
                            <div className="shop-operations-machine-status">
                                {getStatusLabel(machine.status)}
                            </div>
                            {machine.timeLeft && (
                                <div className="shop-operations-machine-time">
                                    <Clock size={14} style={{ marginRight: 4, verticalAlign: 'middle' }} />{machine.timeLeft}
                                </div>
                            )}
                            <div className="service-actions" style={{ marginTop: '12px' }}>
                                {showAllMachines ? (
                                    <>
                                        <button className="service-edit-btn" onClick={() => handleEditMachine(machine)}>
                                            <Pencil size={14} /> {t('common.edit')}
                                        </button>
                                        <button className="service-delete-btn" onClick={() => handleDeleteMachine(machine.id)}>
                                            <Trash2 size={14} /> {t('common.delete')}
                                        </button>
                                    </>
                                ) : (
                                    <button className="service-edit-btn" onClick={() => handleViewMachine(machine)} style={{ fontSize: '13px', padding: '6px 12px' }}>
                                        <Eye size={14} /> {t('shop.operations.view')}
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
                            <Eye size={16} /> {showAllMachines ? t('shop.operations.showLess') : `${t('shop.operations.viewAllMachines')} (${machines.length})`}
                        </button>
                    </div>
                )}
            </div>

            {/* Supplies Inventory */}
            <div className="shop-operations-section">
                <div className="shop-operations-section-header">
                    <div>
                        <h2 className="shop-operations-section-title">
                            <Inbox size={18} style={{ marginRight: '8px' }} />
                            {t('shop.suppliesInventory')}
                        </h2>
                        <p className="shop-operations-section-desc">
                            {t('shop.operations.suppliesInventoryDesc')}
                        </p>
                    </div>
                    <button className="shop-operations-add-btn" onClick={handleAddSupply}>
                        <Plus size={16} /> {t('shop.operations.addSupply')}
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
                                    {isLow && <span className="shop-operations-supply-alert"><AlertTriangle size={14} style={{ marginRight: 3, verticalAlign: 'middle' }} />Low</span>}
                                </div>
                                <div className="shop-operations-supply-amount">
                                    {supply.current} / {supply.max} {getSupplyUnitLabel(supply.unit)}
                                </div>
                                <div className="shop-operations-supply-bar">
                                    <div
                                        className={`shop-operations-supply-fill ${isLow ? 'supply-fill-low' : 'supply-fill-ok'}`}
                                        style={{ width: `${percentage}%` }}
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
                                                <Pencil size={14} /> {t('common.edit')}
                                            </button>
                                            <button className="service-delete-btn" onClick={() => handleDeleteSupply(supply.id)}>
                                                <Trash2 size={14} /> {t('common.delete')}
                                            </button>
                                        </>
                                    ) : (
                                        <button className="service-edit-btn" onClick={() => handleViewSupply(supply)} style={{ fontSize: '13px', padding: '6px 12px' }}>
                                            <Eye size={14} /> {t('shop.operations.view')}
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
                            <Eye size={16} /> {showAllSupplies ? t('shop.operations.showLess') : `${t('shop.operations.viewAllSupplies')} (${supplies.length})`}
                        </button>
                    </div>
                )}
            </div>

            {/* Operating Hours */}
            <div className="shop-operations-section">
                <h2 className="shop-operations-section-title">{t('shop.operations.operatingHoursTitle')}</h2>
                <div className="shop-operations-hours-card">
                    <div className="shop-operations-hours-item">
                        <span className="shop-operations-hours-label">{t('shop.operations.todaysHoursLabel')}:</span>
                        <span className="shop-operations-hours-value">{t('shop.operations.todaysHoursValue')}</span>
                        <span className="shop-operations-hours-status shop-operations-hours-open">
                            ● {t('shop.operations.open')}
                        </span>
                    </div>
                    <button className="shop-operations-hours-btn">{t('shop.operations.updateHours')}</button>
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
                            <h2>{editingService ? t('shop.operations.modals.service.editTitle') : t('shop.operations.modals.service.addTitle')}</h2>
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
                                    <label>{t('shop.operations.fields.serviceName')} *</label>
                                    <input
                                        type="text"
                                        placeholder={t('shop.operations.placeholders.serviceName')}
                                        className="form-input"
                                        value={serviceForm.name}
                                        onChange={(e) => setServiceForm({ ...serviceForm, name: e.target.value })}
                                    />
                                </div>

                                <div className="form-row">
                                    <div className="form-group">
                                        <label>{t('shop.operations.fields.category')} *</label>
                                        <select className="form-input" value={serviceForm.category} onChange={(e) => setServiceForm({ ...serviceForm, category: e.target.value })}>
                                            {serviceCategoryOptions.map(option => (
                                                <option key={option.value} value={option.value}>{option.label}</option>
                                            ))}
                                        </select>
                                    </div>

                                    <div className="form-group">
                                        <label>{t('shop.operations.fields.pricingType')} *</label>
                                        <select className="form-input" value={serviceForm.pricingType} onChange={(e) => setServiceForm({ ...serviceForm, pricingType: e.target.value })}>
                                            {pricingTypeOptions.map(option => (
                                                <option key={option.value} value={option.value}>{option.label}</option>
                                            ))}
                                        </select>
                                    </div>
                                </div>

                                <div className="form-row">
                                    <div className="form-group">
                                        <label>{t('shop.operations.fields.priceVnd')} *</label>
                                        <input
                                            type="number"
                                            placeholder={t('shop.operations.placeholders.price')}
                                            className="form-input"
                                            value={serviceForm.price}
                                            onChange={(e) => setServiceForm({ ...serviceForm, price: e.target.value })}
                                        />
                                    </div>

                                    <div className="form-group">
                                        <label>{t('shop.operations.fields.minimumOrder')} *</label>
                                        <input
                                            type="number"
                                            placeholder={t('shop.operations.placeholders.minimumOrder')}
                                            className="form-input"
                                            value={serviceForm.minOrder}
                                            onChange={(e) => setServiceForm({ ...serviceForm, minOrder: e.target.value })}
                                        />
                                    </div>
                                </div>

                                <div className="form-group">
                                    <label>{t('shop.operations.fields.estimatedTime')} *</label>
                                    <input
                                        type="text"
                                        placeholder={t('shop.operations.placeholders.estimatedTime')}
                                        className="form-input"
                                        value={serviceForm.estimatedTime}
                                        onChange={(e) => setServiceForm({ ...serviceForm, estimatedTime: e.target.value })}
                                    />
                                </div>

                                <div className="form-group">
                                    <label>{t('shop.operations.fields.description')}</label>
                                    <textarea
                                        placeholder={t('shop.operations.placeholders.description')}
                                        className="form-textarea"
                                        rows="3"
                                        value={serviceForm.description}
                                        onChange={(e) => setServiceForm({ ...serviceForm, description: e.target.value })}
                                    ></textarea>
                                </div>

                                <div className="form-group">
                                    <label className="form-checkbox">
                                        <input type="checkbox" checked={serviceForm.available} onChange={(e) => setServiceForm({ ...serviceForm, available: e.target.checked })} />
                                        <span>{t('shop.operations.availableForBooking')}</span>
                                    </label>
                                </div>
                            </div>
                        </div>
                        <div className="modal-footer">
                            <button
                                className="btn-cancel"
                                onClick={() => setShowServiceModal(false)}
                            >
                                {t('common.cancel')}
                            </button>
                            <button className="btn-confirm" onClick={handleSaveService}>
                                {editingService ? t('shop.operations.modals.service.updateAction') : t('shop.operations.modals.service.addAction')}
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
                            <h2>{editingMachine ? t('shop.operations.modals.machine.editTitle') : t('shop.operations.modals.machine.addTitle')}</h2>
                            <button className="modal-close" onClick={() => setShowMachineModal(false)}>×</button>
                        </div>
                        <div className="modal-body">
                            <div className="modal-form">
                                <div className="form-group">
                                    <label>{t('shop.operations.fields.machineName')} *</label>
                                    <input type="text" className="form-input" placeholder={t('shop.operations.placeholders.machineName')} value={machineForm.name} onChange={(e) => setMachineForm({ ...machineForm, name: e.target.value })} />
                                </div>
                                <div className="form-row">
                                    <div className="form-group">
                                        <label>{t('shop.operations.fields.type')} *</label>
                                        <select className="form-input" value={machineForm.type} onChange={(e) => setMachineForm({ ...machineForm, type: e.target.value })}>
                                            {machineTypeOptions.map(option => (
                                                <option key={option.value} value={option.value}>{option.label}</option>
                                            ))}
                                        </select>
                                    </div>
                                    <div className="form-group">
                                        <label>{t('shop.operations.fields.status')} *</label>
                                        <select className="form-input" value={machineForm.status} onChange={(e) => setMachineForm({ ...machineForm, status: e.target.value })}>
                                            {machineStatusOptions.map(option => (
                                                <option key={option.value} value={option.value}>{option.label}</option>
                                            ))}
                                        </select>
                                    </div>
                                </div>
                                <div className="form-row">
                                    <div className="form-group">
                                        <label>{t('shop.operations.fields.location')} *</label>
                                        <input type="text" className="form-input" placeholder={t('shop.operations.placeholders.location')} value={machineForm.location} onChange={(e) => setMachineForm({ ...machineForm, location: e.target.value })} />
                                    </div>
                                    <div className="form-group">
                                        <label>{t('shop.operations.fields.capacity')}</label>
                                        <input type="text" className="form-input" placeholder={t('shop.operations.placeholders.capacity')} value={machineForm.capacity} onChange={(e) => setMachineForm({ ...machineForm, capacity: e.target.value })} />
                                    </div>
                                </div>
                                <div className="form-row">
                                    <div className="form-group">
                                        <label>{t('shop.operations.fields.model')}</label>
                                        <input type="text" className="form-input" placeholder={t('shop.operations.placeholders.model')} value={machineForm.model} onChange={(e) => setMachineForm({ ...machineForm, model: e.target.value })} />
                                    </div>
                                    <div className="form-group">
                                        <label>{t('shop.operations.fields.purchaseDate')}</label>
                                        <input type="date" className="form-input" value={machineForm.purchaseDate} onChange={(e) => setMachineForm({ ...machineForm, purchaseDate: e.target.value })} />
                                    </div>
                                </div>
                            </div>
                        </div>
                        <div className="modal-footer">
                            <button className="btn-cancel" onClick={() => setShowMachineModal(false)}>{t('common.cancel')}</button>
                            <button className="btn-confirm" onClick={handleSaveMachine}>{editingMachine ? t('shop.operations.modals.machine.updateAction') : t('shop.operations.modals.machine.addAction')}</button>
                        </div>
                    </div>
                </div>
            )}

            {/* Machine View Modal */}
            {showMachineViewModal && viewingMachine && (
                <div className="shop-operations-modal-overlay" onClick={() => setShowMachineViewModal(false)}>
                    <div className="shop-operations-modal" onClick={(e) => e.stopPropagation()}>
                        <div className="modal-header">
                            <h2>{t('shop.operations.modals.machine.detailsTitle')}</h2>
                            <button className="modal-close" onClick={() => setShowMachineViewModal(false)}>×</button>
                        </div>
                        <div className="modal-body">
                            <div style={{ display: 'grid', gap: '16px' }}>
                                <div style={{ display: 'flex', justifyContent: 'space-between', padding: '12px', background: '#faf9f2', borderRadius: '8px' }}>
                                    <span style={{ fontWeight: '600', color: '#64748b' }}>{t('shop.operations.fields.machineId')}:</span>
                                    <span style={{ fontWeight: '600', color: '#0f172a' }}>{viewingMachine.id}</span>
                                </div>
                                <div style={{ display: 'flex', justifyContent: 'space-between', padding: '12px', background: '#faf9f2', borderRadius: '8px' }}>
                                    <span style={{ fontWeight: '600', color: '#64748b' }}>{t('shop.operations.fields.name')}:</span>
                                    <span style={{ color: '#0f172a' }}>{viewingMachine.name}</span>
                                </div>
                                <div style={{ display: 'flex', justifyContent: 'space-between', padding: '12px', background: '#faf9f2', borderRadius: '8px' }}>
                                    <span style={{ fontWeight: '600', color: '#64748b' }}>{t('shop.operations.fields.type')}:</span>
                                    <span style={{ color: '#0f172a' }}>{getMachineTypeLabel(viewingMachine.type)}</span>
                                </div>
                                <div style={{ display: 'flex', justifyContent: 'space-between', padding: '12px', background: '#faf9f2', borderRadius: '8px' }}>
                                    <span style={{ fontWeight: '600', color: '#64748b' }}>{t('shop.operations.fields.status')}:</span>
                                    <span style={{ color: getStatusColor(viewingMachine.status), fontWeight: '600' }}>{getStatusLabel(viewingMachine.status)}</span>
                                </div>
                                <div style={{ display: 'flex', justifyContent: 'space-between', padding: '12px', background: '#faf9f2', borderRadius: '8px' }}>
                                    <span style={{ fontWeight: '600', color: '#64748b' }}>{t('shop.operations.fields.location')}:</span>
                                    <span style={{ color: '#0f172a' }}>{viewingMachine.location}</span>
                                </div>
                                <div style={{ display: 'flex', justifyContent: 'space-between', padding: '12px', background: '#faf9f2', borderRadius: '8px' }}>
                                    <span style={{ fontWeight: '600', color: '#64748b' }}>{t('shop.operations.fields.capacity')}:</span>
                                    <span style={{ color: '#0f172a' }}>{viewingMachine.capacity}</span>
                                </div>
                                <div style={{ display: 'flex', justifyContent: 'space-between', padding: '12px', background: '#faf9f2', borderRadius: '8px' }}>
                                    <span style={{ fontWeight: '600', color: '#64748b' }}>{t('shop.operations.fields.model')}:</span>
                                    <span style={{ color: '#0f172a' }}>{viewingMachine.model}</span>
                                </div>
                                <div style={{ display: 'flex', justifyContent: 'space-between', padding: '12px', background: '#faf9f2', borderRadius: '8px' }}>
                                    <span style={{ fontWeight: '600', color: '#64748b' }}>{t('shop.operations.fields.purchaseDate')}:</span>
                                    <span style={{ color: '#0f172a' }}>{viewingMachine.purchaseDate}</span>
                                </div>
                                {viewingMachine.timeLeft && (
                                    <div style={{ display: 'flex', justifyContent: 'space-between', padding: '12px', background: '#faf9f2', borderRadius: '8px' }}>
                                        <span style={{ fontWeight: '600', color: '#64748b' }}>{t('shop.operations.fields.timeLeft')}:</span>
                                        <span style={{ color: '#719FC2', fontWeight: '600' }}>{viewingMachine.timeLeft}</span>
                                    </div>
                                )}
                            </div>
                        </div>
                        <div className="modal-footer">
                            <button className="btn-cancel" onClick={() => setShowMachineViewModal(false)}>{t('common.close')}</button>
                            <button className="btn-confirm" onClick={() => { setShowMachineViewModal(false); handleEditMachine(viewingMachine); }}>{t('shop.operations.modals.machine.editAction')}</button>
                        </div>
                    </div>
                </div>
            )}

            {/* Supply Modal (Add/Edit) */}
            {showSupplyModal && (
                <div className="shop-operations-modal-overlay" onClick={() => setShowSupplyModal(false)}>
                    <div className="shop-operations-modal" onClick={(e) => e.stopPropagation()}>
                        <div className="modal-header">
                            <h2>{editingSupply ? t('shop.operations.modals.supply.editTitle') : t('shop.operations.modals.supply.addTitle')}</h2>
                            <button className="modal-close" onClick={() => setShowSupplyModal(false)}>×</button>
                        </div>
                        <div className="modal-body">
                            <div className="modal-form">
                                <div className="form-group">
                                    <label>{t('shop.operations.fields.supplyName')} *</label>
                                    <input type="text" className="form-input" placeholder={t('shop.operations.placeholders.supplyName')} value={supplyForm.name} onChange={(e) => setSupplyForm({ ...supplyForm, name: e.target.value })} />
                                </div>
                                <div className="form-row">
                                    <div className="form-group">
                                        <label>{t('shop.operations.fields.currentStock')} *</label>
                                        <input type="number" className="form-input" placeholder={t('shop.operations.placeholders.currentStock')} value={supplyForm.current} onChange={(e) => setSupplyForm({ ...supplyForm, current: e.target.value })} />
                                    </div>
                                    <div className="form-group">
                                        <label>{t('shop.operations.fields.maximumCapacity')} *</label>
                                        <input type="number" className="form-input" placeholder={t('shop.operations.placeholders.maximumCapacity')} value={supplyForm.max} onChange={(e) => setSupplyForm({ ...supplyForm, max: e.target.value })} />
                                    </div>
                                </div>
                                <div className="form-row">
                                    <div className="form-group">
                                        <label>{t('shop.operations.fields.unit')} *</label>
                                        <select className="form-input" value={supplyForm.unit} onChange={(e) => setSupplyForm({ ...supplyForm, unit: e.target.value })}>
                                            {supplyUnitOptions.map(option => (
                                                <option key={option.value} value={option.value}>{option.label}</option>
                                            ))}
                                        </select>
                                    </div>
                                    <div className="form-group">
                                        <label>{t('shop.operations.fields.reorderPoint')} *</label>
                                        <input type="number" className="form-input" placeholder={t('shop.operations.placeholders.reorderPoint')} value={supplyForm.reorderPoint} onChange={(e) => setSupplyForm({ ...supplyForm, reorderPoint: e.target.value })} />
                                    </div>
                                </div>
                                <div className="form-group">
                                    <label>{t('shop.operations.fields.supplier')}</label>
                                    <input type="text" className="form-input" placeholder={t('shop.operations.placeholders.supplier')} value={supplyForm.supplier} onChange={(e) => setSupplyForm({ ...supplyForm, supplier: e.target.value })} />
                                </div>
                                <div className="form-group">
                                    <label>{t('shop.operations.fields.lastReorderDate')}</label>
                                    <input type="date" className="form-input" value={supplyForm.lastReorder} onChange={(e) => setSupplyForm({ ...supplyForm, lastReorder: e.target.value })} />
                                </div>
                            </div>
                        </div>
                        <div className="modal-footer">
                            <button className="btn-cancel" onClick={() => setShowSupplyModal(false)}>{t('common.cancel')}</button>
                            <button className="btn-confirm" onClick={handleSaveSupply}>{editingSupply ? t('shop.operations.modals.supply.updateAction') : t('shop.operations.modals.supply.addAction')}</button>
                        </div>
                    </div>
                </div>
            )}

            {/* Supply View Modal */}
            {showSupplyViewModal && viewingSupply && (
                <div className="shop-operations-modal-overlay" onClick={() => setShowSupplyViewModal(false)}>
                    <div className="shop-operations-modal" onClick={(e) => e.stopPropagation()}>
                        <div className="modal-header">
                            <h2>{t('shop.operations.modals.supply.detailsTitle')}</h2>
                            <button className="modal-close" onClick={() => setShowSupplyViewModal(false)}>×</button>
                        </div>
                        <div className="modal-body">
                            <div style={{ display: 'grid', gap: '16px' }}>
                                <div style={{ display: 'flex', justifyContent: 'space-between', padding: '12px', background: '#faf9f2', borderRadius: '8px' }}>
                                    <span style={{ fontWeight: '600', color: '#64748b' }}>{t('shop.operations.fields.supplyId')}:</span>
                                    <span style={{ fontWeight: '600', color: '#0f172a' }}>{viewingSupply.id}</span>
                                </div>
                                <div style={{ display: 'flex', justifyContent: 'space-between', padding: '12px', background: '#faf9f2', borderRadius: '8px' }}>
                                    <span style={{ fontWeight: '600', color: '#64748b' }}>{t('shop.operations.fields.name')}:</span>
                                    <span style={{ color: '#0f172a' }}>{viewingSupply.name}</span>
                                </div>
                                <div style={{ display: 'flex', justifyContent: 'space-between', padding: '12px', background: '#faf9f2', borderRadius: '8px' }}>
                                    <span style={{ fontWeight: '600', color: '#64748b' }}>{t('shop.operations.fields.currentStock')}:</span>
                                    <span style={{ color: '#0f172a', fontWeight: '600' }}>{viewingSupply.current} {getSupplyUnitLabel(viewingSupply.unit)}</span>
                                </div>
                                <div style={{ display: 'flex', justifyContent: 'space-between', padding: '12px', background: '#faf9f2', borderRadius: '8px' }}>
                                    <span style={{ fontWeight: '600', color: '#64748b' }}>{t('shop.operations.fields.maximumCapacity')}:</span>
                                    <span style={{ color: '#0f172a' }}>{viewingSupply.max} {getSupplyUnitLabel(viewingSupply.unit)}</span>
                                </div>
                                <div style={{ display: 'flex', justifyContent: 'space-between', padding: '12px', background: '#faf9f2', borderRadius: '8px' }}>
                                    <span style={{ fontWeight: '600', color: '#64748b' }}>{t('shop.operations.fields.stockLevel')}:</span>
                                    <span style={{ color: viewingSupply.current <= viewingSupply.reorderPoint ? '#c05a50' : '#4d9e84', fontWeight: '600' }}>
                                        {((viewingSupply.current / viewingSupply.max) * 100).toFixed(0)}%
                                        {viewingSupply.current <= viewingSupply.reorderPoint && ` (${t('shop.operations.low')})`}
                                    </span>
                                </div>
                                <div style={{ display: 'flex', justifyContent: 'space-between', padding: '12px', background: '#faf9f2', borderRadius: '8px' }}>
                                    <span style={{ fontWeight: '600', color: '#64748b' }}>{t('shop.operations.fields.reorderPoint')}:</span>
                                    <span style={{ color: '#0f172a' }}>{viewingSupply.reorderPoint} {getSupplyUnitLabel(viewingSupply.unit)}</span>
                                </div>
                                <div style={{ display: 'flex', justifyContent: 'space-between', padding: '12px', background: '#faf9f2', borderRadius: '8px' }}>
                                    <span style={{ fontWeight: '600', color: '#64748b' }}>{t('shop.operations.fields.supplier')}:</span>
                                    <span style={{ color: '#0f172a' }}>{viewingSupply.supplier}</span>
                                </div>
                                <div style={{ display: 'flex', justifyContent: 'space-between', padding: '12px', background: '#faf9f2', borderRadius: '8px' }}>
                                    <span style={{ fontWeight: '600', color: '#64748b' }}>{t('shop.operations.fields.lastReorder')}:</span>
                                    <span style={{ color: '#0f172a' }}>{viewingSupply.lastReorder}</span>
                                </div>
                            </div>
                        </div>
                        <div className="modal-footer">
                            <button className="btn-cancel" onClick={() => setShowSupplyViewModal(false)}>{t('common.close')}</button>
                            <button className="btn-confirm" onClick={() => { setShowSupplyViewModal(false); handleEditSupply(viewingSupply); }}>{t('shop.operations.modals.supply.editAction')}</button>
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
                    confirmText={t('common.ok')}
                    cancelText={t('common.cancel')}
                />
            )}
        </div>
    )
}

export default ShopOperations
