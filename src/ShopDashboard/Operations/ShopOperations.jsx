import { createElement, useCallback, useEffect, useState } from 'react'
import {
    AlertTriangle,
    Boxes,
    CheckCircle,
    Clock,
    Eye,
    Loader2,
    Pencil,
    Plus,
    Search,
    Shirt,
    ToggleLeft,
    ToggleRight,
    Trash2,
    Wrench,
    X,
} from 'lucide-react'
import './ShopOperations.css'
import { serviceApi, machineApi, inventoryApi, categoryApi } from '../../utils/shopOwnerApi'
import toast from '../../utils/toast'
import ConfirmDialog from '../../components/ConfirmDialog/ConfirmDialog'
import { useTranslation } from '../../shared/lib/i18n'

// ── Empty form templates ──────────────────────────────────────────────────────

const emptyService = {
    serviceName: '',
    serviceCategoryId: '',
    pricingType: 'kg',
    price: '',
    minOrder: '',
    estimatedTime: '',
    description: '',
    available: true,
}

const emptyMachine = {
    name: '',
    machineType: 'Washer',
    status: 'AVAILABLE',
    location: '',
    capacity: '',
    model: '',
    purchaseDate: '',
    nextMaintenance: '',
}

const emptySupply = {
    name: '',
    quantity: '',
    maxQuantity: '',
    unit: 'L',
    reorderPoint: '',
    supplier: '',
    category: '',
    storageLocation: '',
    lastReorder: '',
}

// ── Main component ─────────────────────────────────────────────────────────────

function ShopOperations() {
    const { t } = useTranslation()

    // ── Data state ────────────────────────────────────────────────────────────
    const [services, setServices]   = useState([])
    const [machines, setMachines]   = useState([])
    const [supplies, setSupplies]   = useState([])
    const [categories, setCategories] = useState([])  // [{ id, name }]
    const [loading, setLoading]     = useState(true)
    const [saving, setSaving]       = useState(false)

    // ── UI state ──────────────────────────────────────────────────────────────
    const [activeTab, setActiveTab]     = useState('services')
    const [query, setQuery]             = useState('')
    const [selectedItem, setSelectedItem] = useState(null)
    const [editingType, setEditingType] = useState(null)
    const [editingId, setEditingId]     = useState(null)
    const [serviceForm, setServiceForm] = useState(emptyService)
    const [machineForm, setMachineForm] = useState(emptyMachine)
    const [supplyForm, setSupplyForm]   = useState(emptySupply)
    const [confirmDialog, setConfirmDialog] = useState({
        show: false, title: '', message: '', onConfirm: null, type: 'warning',
    })

    // ── Load all data on mount ────────────────────────────────────────────────
    const fetchAll = useCallback(async () => {
        setLoading(true)
        const [svcRes, machRes, invRes, catRes] = await Promise.all([
            serviceApi.list(),
            machineApi.list(),
            inventoryApi.list(),
            categoryApi.listMine(),
        ])
        if (!svcRes.error)  setServices(svcRes.data  || [])
        if (!machRes.error) setMachines(machRes.data  || [])
        if (!invRes.error)  setSupplies(invRes.data   || [])
        if (!catRes.error)  setCategories(catRes.data || [])
        if (svcRes.error)   toast.error(`Services: ${svcRes.error}`)
        if (machRes.error)  toast.error(`Machines: ${machRes.error}`)
        if (invRes.error)   toast.error(`Inventory: ${invRes.error}`)
        setLoading(false)
    }, [])

    useEffect(() => { fetchAll() }, [fetchAll])

    const closeConfirm = () => setConfirmDialog(prev => ({ ...prev, show: false }))

    // ── Display helpers ───────────────────────────────────────────────────────
    const statusLabel = (status) => {
        const map = {
            AVAILABLE:    t('shopOperations.readyEmpty'),
            IN_USE:       t('shopOperations.running'),
            MAINTENANCE:  t('shopOperations.maintenance'),
            OUT_OF_ORDER: t('shopOperations.unknown'),
        }
        return map[status] || t('shopOperations.unknown')
    }

    const statusTone = (status) => {
        if (status === 'AVAILABLE') return 'teal'
        if (status === 'MAINTENANCE' || status === 'OUT_OF_ORDER') return 'red'
        return 'blue'
    }

    const stockPercent = (supply) =>
        Math.min(100, Math.round((Number(supply.current) / Math.max(Number(supply.max), 1)) * 100))
    const isLowStock = (supply) =>
        Number(supply.current) <= Number(supply.reorderPoint)

    /** Resolves the display name for a service — serviceName takes priority, falls back to name */
    const displayName = (service) => service?.serviceName || service?.name || '—'

    // ── KPIs & tabs ───────────────────────────────────────────────────────────
    const availableServices     = services.filter(s => s.available).length
    const runningMachines       = machines.filter(m => m.status === 'IN_USE').length
    const maintenanceMachines   = machines.filter(m => m.status === 'MAINTENANCE' || m.status === 'OUT_OF_ORDER').length
    const lowSupplies           = supplies.filter(isLowStock)

    const kpis = [
        { label: t('shopOperations.availableServices'), value: `${availableServices}/${services.length}`, Icon: Shirt, tone: 'navy' },
        { label: t('shopOperations.runningMachines'),   value: String(runningMachines),                  Icon: Wrench, tone: 'blue' },
        { label: t('shopOperations.lowStock'),          value: String(lowSupplies.length),                Icon: AlertTriangle, tone: lowSupplies.length ? 'amber' : 'teal' },
        { label: t('shopOperations.maintenanceDue'),    value: String(maintenanceMachines),               Icon: Clock,  tone: maintenanceMachines ? 'red' : 'teal' },
    ]

    const tabs = [
        { key: 'services', label: t('shopOperations.services'), count: services.length, Icon: Shirt  },
        { key: 'machines', label: t('shopOperations.machines'), count: machines.length, Icon: Wrench },
        { key: 'supplies', label: t('shopOperations.supplies'), count: supplies.length, Icon: Boxes  },
    ]

    // ── Search filtering ──────────────────────────────────────────────────────
    const q = query.trim().toLowerCase()
    const visibleServices = services.filter(s =>
        !q || displayName(s).toLowerCase().includes(q) ||
              s.categoryName?.toLowerCase().includes(q) ||
              s.description?.toLowerCase().includes(q)
    )
    const visibleMachines = machines.filter(m =>
        !q || m.name?.toLowerCase().includes(q) ||
              String(m.id).toLowerCase().includes(q) ||
              m.location?.toLowerCase().includes(q) ||
              m.status?.toLowerCase().includes(q)
    )
    const visibleSupplies = supplies.filter(s =>
        !q || s.name?.toLowerCase().includes(q) ||
              String(s.id).toLowerCase().includes(q) ||
              s.supplier?.toLowerCase().includes(q) ||
              s.category?.toLowerCase().includes(q)
    )

    // ── Open create / edit modals ─────────────────────────────────────────────
    const openCreate = (type) => {
        setEditingType(type)
        setEditingId(null)
        if (type === 'service') setServiceForm(emptyService)
        if (type === 'machine') setMachineForm(emptyMachine)
        if (type === 'supply')  setSupplyForm(emptySupply)
    }

    const openEdit = (type, item) => {
        setEditingType(type)
        setEditingId(item.id)
        if (type === 'service') {
            setServiceForm({
                serviceName:        displayName(item),   // pre-populate with whichever name field is set
                serviceCategoryId:  item.serviceCategoryId  || '',
                pricingType:        item.pricingType         || 'kg',
                price:              item.price               ?? '',
                minOrder:           item.minOrder            ?? '',
                estimatedTime:      item.estimatedTime       || '',
                description:        item.description         || '',
                available:          item.available           ?? true,
            })
        }
        if (type === 'machine') {
            setMachineForm({
                name:             item.name             || '',
                machineType:      item.machineType      || 'Washer',
                status:           item.status           || 'AVAILABLE',
                location:         item.location         || '',
                capacity:         item.capacity         || '',
                model:            item.model            || '',
                purchaseDate:     item.purchaseDate     || '',
                nextMaintenance:  item.nextMaintenance  || '',
            })
        }
        if (type === 'supply') {
            setSupplyForm({
                name:             item.name             || '',
                quantity:         item.current          ?? '',   // BE sends "current"
                maxQuantity:      item.max              ?? '',   // BE sends "max"
                unit:             item.unit             || 'L',
                reorderPoint:     item.reorderPoint     ?? '',
                supplier:         item.supplier         || '',
                category:         item.category         || '',
                storageLocation:  item.storageLocation  || '',
                lastReorder:      item.lastReorder      || '',
            })
        }
    }

    // ── Save handlers (API calls) ─────────────────────────────────────────────

    const saveService = async () => {
        if (!serviceForm.serviceName || !serviceForm.price || !serviceForm.minOrder) {
            toast.warning(t('shopOperations.requiredFields'))
            return
        }
        setSaving(true)
        const payload = {
            ...serviceForm,
            price:    Number(serviceForm.price),
            minOrder: Number(serviceForm.minOrder),
        }
        let res
        if (editingId) {
            res = await serviceApi.update(editingId, payload)
            if (!res.error) {
                setServices(services.map(s => s.id === editingId ? res.data : s))
                toast.success(t('shopOperations.updated').replace('{item}', editingId))
            }
        } else {
            res = await serviceApi.create(payload)
            if (!res.error) {
                setServices([...services, res.data])
                toast.success(t('shopOperations.created').replace('{item}', res.data.id))
            }
        }
        if (res.error) toast.error(res.error)
        setSaving(false)
        if (!res.error) setEditingType(null)
    }

    const saveMachine = async () => {
        if (!machineForm.name || !machineForm.location) {
            toast.warning(t('shopOperations.requiredFields'))
            return
        }
        setSaving(true)
        let res
        if (editingId) {
            res = await machineApi.update(editingId, machineForm)
            if (!res.error) {
                setMachines(machines.map(m => m.id === editingId ? res.data : m))
                toast.success(t('shopOperations.updated').replace('{item}', editingId))
            }
        } else {
            res = await machineApi.create(machineForm)
            if (!res.error) {
                setMachines([...machines, res.data])
                toast.success(t('shopOperations.created').replace('{item}', res.data.id))
            }
        }
        if (res.error) toast.error(res.error)
        setSaving(false)
        if (!res.error) setEditingType(null)
    }

    const saveSupply = async () => {
        if (!supplyForm.name || supplyForm.quantity === '' || !supplyForm.maxQuantity || supplyForm.reorderPoint === '') {
            toast.warning(t('shopOperations.requiredFields'))
            return
        }
        setSaving(true)
        const payload = {
            ...supplyForm,
            quantity:     Number(supplyForm.quantity),
            maxQuantity:  Number(supplyForm.maxQuantity),
            reorderPoint: Number(supplyForm.reorderPoint),
        }
        let res
        if (editingId) {
            res = await inventoryApi.update(editingId, payload)
            if (!res.error) {
                setSupplies(supplies.map(s => s.id === editingId ? res.data : s))
                toast.success(t('shopOperations.updated').replace('{item}', editingId))
            }
        } else {
            res = await inventoryApi.create(payload)
            if (!res.error) {
                setSupplies([...supplies, res.data])
                toast.success(t('shopOperations.created').replace('{item}', res.data.id))
            }
        }
        if (res.error) toast.error(res.error)
        setSaving(false)
        if (!res.error) setEditingType(null)
    }

    // ── Delete ────────────────────────────────────────────────────────────────

    const deleteItem = (type, item) => {
        setConfirmDialog({
            show: true,
            title:   t('shopOperations.deleteTitle'),
            message: t('shopOperations.deleteMessage').replace('{item}', item.id),
            type:    'danger',
            onConfirm: async () => {
                let res
                if (type === 'service') res = await serviceApi.remove(item.id)
                if (type === 'machine') res = await machineApi.remove(item.id)
                if (type === 'supply')  res = await inventoryApi.remove(item.id)

                if (res?.error) {
                    toast.error(res.error)
                    closeConfirm()
                    return
                }
                if (type === 'service') setServices(services.filter(s => s.id !== item.id))
                if (type === 'machine') setMachines(machines.filter(m => m.id !== item.id))
                if (type === 'supply')  setSupplies(supplies.filter(s => s.id !== item.id))
                setSelectedItem(null)
                toast.success(t('shopOperations.deleted').replace('{item}', item.id))
                closeConfirm()
            },
        })
    }

    // ── Toggle service availability ────────────────────────────────────────────

    const toggleServiceAvailability = async (service) => {
        const newValue = !service.available
        const res = await serviceApi.toggleAvailability(service.id, newValue)
        if (res.error) {
            toast.error(res.error)
            return
        }
        setServices(services.map(s => s.id === service.id ? { ...s, available: newValue } : s))
        // Keep detail panel in sync
        if (selectedItem?.data?.id === service.id) {
            setSelectedItem(prev => ({ ...prev, data: { ...prev.data, available: newValue } }))
        }
    }

    // ── Render lists ──────────────────────────────────────────────────────────

    const renderServiceList = () => (
        <div className="shop-operations-list">
            {visibleServices.map(service => (
                <article className={`shop-ops-row ${!service.available ? 'muted' : ''}`} key={service.id}>
                    <div className="shop-ops-row-main">
                        <span className="shop-ops-id">{service.id}</span>
                        <div>
                            <h3>{displayName(service)}</h3>
                            <p>{service.categoryName} · {service.estimatedTime}</p>
                        </div>
                    </div>
                    <div className="shop-ops-row-metric">
                        <strong>{Number(service.price).toLocaleString()}đ</strong>
                        <span>{t('shopOperations.per')} {service.pricingType}</span>
                    </div>
                    <div className="shop-ops-row-metric">
                        <strong>{service.minOrder}</strong>
                        <span>{t('shopOperations.minOrder')}</span>
                    </div>
                    <span className={`shop-ops-badge ${service.available ? 'teal' : 'muted'}`}>
                        {service.available ? t('shopOperations.available') : t('shopOperations.unavailable')}
                    </span>
                    <div className="shop-ops-row-actions">
                        <button type="button" aria-label={t('shopOperations.view')} onClick={() => setSelectedItem({ type: 'service', data: service })}><Eye size={15} /></button>
                        <button type="button" aria-label={t('shopOperations.edit')} onClick={() => openEdit('service', service)}><Pencil size={15} /></button>
                    </div>
                </article>
            ))}
        </div>
    )

    const renderMachineList = () => (
        <div className="shop-operations-machine-grid">
            {visibleMachines.map(machine => (
                <article className={`shop-ops-machine tone-${statusTone(machine.status)}`} key={machine.id}>
                    <div className="shop-ops-machine-head">
                        <span className="shop-ops-id">{machine.id}</span>
                        <span className={`shop-ops-badge ${statusTone(machine.status)}`}>{statusLabel(machine.status)}</span>
                    </div>
                    <h3>{machine.name}</h3>
                    <p>{machine.location}</p>
                    <div className="shop-ops-machine-specs">
                        <span>{machine.machineType}</span>
                        <span>{machine.capacity || t('shopOperations.notSet')}</span>
                        <span>{machine.totalCycles?.toLocaleString() || 0} {t('shopOperations.cycles')}</span>
                    </div>
                    <div className="shop-ops-card-actions">
                        <button type="button" onClick={() => setSelectedItem({ type: 'machine', data: machine })}>{t('shopOperations.view')}</button>
                        <button type="button" onClick={() => openEdit('machine', machine)}>{t('shopOperations.edit')}</button>
                    </div>
                </article>
            ))}
        </div>
    )

    const renderSupplyList = () => (
        <div className="shop-operations-supply-grid">
            {visibleSupplies.map(supply => {
                const percent = stockPercent(supply)
                const low = isLowStock(supply)
                return (
                    <article className={`shop-ops-supply ${low ? 'low' : ''}`} key={supply.id}>
                        <div className="shop-ops-machine-head">
                            <span className="shop-ops-id">{supply.id}</span>
                            <span className={`shop-ops-badge ${low ? 'amber' : 'teal'}`}>
                                {low ? t('shopOperations.reorderNow') : t('shopOperations.stockOk')}
                            </span>
                        </div>
                        <h3>{supply.name}</h3>
                        <p>{supply.category || t('shopOperations.inventory')}</p>
                        <div className="shop-ops-stock-line">
                            <strong>{supply.current} {supply.unit}</strong>
                            <span>{percent}%</span>
                        </div>
                        <div className="shop-ops-stock-track">
                            <span className={low ? 'low' : ''} style={{ width: `${percent}%` }} />
                        </div>
                        <div className="shop-ops-supply-meta">
                            <span>{t('shopOperations.reorderPoint')}: {supply.reorderPoint} {supply.unit}</span>
                            <span>{supply.supplier}</span>
                        </div>
                        <div className="shop-ops-card-actions">
                            <button type="button" onClick={() => setSelectedItem({ type: 'supply', data: supply })}>{t('shopOperations.view')}</button>
                            <button type="button" onClick={() => openEdit('supply', supply)}>{t('shopOperations.edit')}</button>
                        </div>
                    </article>
                )
            })}
        </div>
    )

    const currentListLength = activeTab === 'services' ? visibleServices.length
        : activeTab === 'machines' ? visibleMachines.length
        : visibleSupplies.length

    const primaryCreateType = activeTab === 'services' ? 'service'
        : activeTab === 'machines' ? 'machine'
        : 'supply'

    const detail = selectedItem?.data

    // ── Loading skeleton ──────────────────────────────────────────────────────
    if (loading) {
        return (
            <div className="shop-operations">
                <div className="shop-ops-loading">
                    <Loader2 size={32} className="spin" strokeWidth={1.8} />
                    <p>Loading operations data…</p>
                </div>
            </div>
        )
    }

    return (
        <div className="shop-operations">
            <header className="shop-operations-header">
                <div>
                    <span className="shop-operations-eyebrow">{t('shopOperations.eyebrow')}</span>
                    <h1>{t('shopOperations.title')}</h1>
                    <p>{t('shopOperations.subtitle')}</p>
                </div>
                <button type="button" className="shop-ops-primary-btn" onClick={() => openCreate(primaryCreateType)}>
                    <Plus size={16} strokeWidth={1.9} />
                    {activeTab === 'services' ? t('shopOperations.addService') : activeTab === 'machines' ? t('shopOperations.addMachine') : t('shopOperations.addSupply')}
                </button>
            </header>

            <section className="shop-operations-kpis">
                {kpis.map(({ label, value, Icon, tone }) => (
                    <article className={`shop-ops-kpi ${tone}`} key={label}>
                        <span>{createElement(Icon, { size: 18, strokeWidth: 1.9 })}</span>
                        <small>{label}</small>
                        <strong>{value}</strong>
                    </article>
                ))}
            </section>

            <section className="shop-operations-workspace">
                <article className="shop-ops-main-panel">
                    <div className="shop-ops-toolbar">
                        <div className="shop-ops-tabs">
                            {tabs.map(({ key, label, count, Icon }) => (
                                <button type="button" className={activeTab === key ? 'active' : ''} key={key} onClick={() => setActiveTab(key)}>
                                    {createElement(Icon, { size: 16, strokeWidth: 1.9 })}
                                    {label}
                                    <span>{count}</span>
                                </button>
                            ))}
                        </div>
                        <label className="shop-ops-search">
                            <Search size={16} strokeWidth={1.9} />
                            <input value={query} onChange={(e) => setQuery(e.target.value)} placeholder={t('shopOperations.searchPlaceholder')} />
                        </label>
                    </div>

                    <div className="shop-ops-panel-head">
                        <div>
                            <span className="shop-operations-eyebrow">{t('shopOperations.workspace')}</span>
                            <h2>{currentListLength} {t('shopOperations.results')}</h2>
                        </div>
                    </div>

                    {currentListLength === 0 ? (
                        <div className="shop-ops-empty">
                            <Boxes size={30} strokeWidth={1.7} />
                            <strong>{t('shopOperations.emptyTitle')}</strong>
                            <span>{t('shopOperations.emptyHint')}</span>
                        </div>
                    ) : (
                        <>
                            {activeTab === 'services' && renderServiceList()}
                            {activeTab === 'machines' && renderMachineList()}
                            {activeTab === 'supplies' && renderSupplyList()}
                        </>
                    )}
                </article>

                <aside className="shop-ops-detail">
                    {detail ? (
                        <>
                            <div className="shop-ops-detail-head">
                                <div>
                                    <span className="shop-operations-eyebrow">{t('shopOperations.details')}</span>
                                    <h2>{selectedItem.type === 'service' ? displayName(detail) : detail.name}</h2>
                                </div>
                                <button type="button" aria-label={t('common.close')} onClick={() => setSelectedItem(null)}><X size={18} /></button>
                            </div>
                            {selectedItem.type === 'service' && (
                                <>
                                    <div className="shop-ops-detail-status">
                                        <span className={`shop-ops-badge ${detail.available ? 'teal' : 'muted'}`}>
                                            {detail.available ? t('shopOperations.available') : t('shopOperations.unavailable')}
                                        </span>
                                        <button type="button" onClick={() => toggleServiceAvailability(detail)}>
                                            {detail.available ? <ToggleRight size={16} /> : <ToggleLeft size={16} />}
                                            {t('shopOperations.toggleAvailability')}
                                        </button>
                                    </div>
                                    <DetailGrid rows={[
                                        [t('shopOperations.category'),      detail.categoryName],
                                        [t('shopOperations.price'),         `${Number(detail.price).toLocaleString()}đ / ${detail.pricingType}`],
                                        [t('shopOperations.minOrder'),      `${detail.minOrder} ${detail.pricingType}`],
                                        [t('shopOperations.estimatedTime'), detail.estimatedTime],
                                        [t('shopOperations.description'),   detail.description],
                                    ]} />
                                </>
                            )}
                            {selectedItem.type === 'machine' && (
                                <>
                                    <div className="shop-ops-detail-status">
                                        <span className={`shop-ops-badge ${statusTone(detail.status)}`}>{statusLabel(detail.status)}</span>
                                    </div>
                                    <DetailGrid rows={[
                                        [t('shopOperations.machineId'),        detail.id],
                                        [t('shopOperations.type'),             detail.machineType],
                                        [t('shopOperations.location'),         detail.location],
                                        [t('shopOperations.capacity'),         detail.capacity],
                                        [t('shopOperations.model'),            detail.model],
                                        [t('shopOperations.nextMaintenance'),  detail.nextMaintenance || t('shopOperations.notSet')],
                                        ['Total Cycles',                       detail.totalCycles?.toLocaleString() || '0'],
                                    ]} />
                                </>
                            )}
                            {selectedItem.type === 'supply' && (
                                <>
                                    <div className="shop-ops-detail-status">
                                        <span className={`shop-ops-badge ${isLowStock(detail) ? 'amber' : 'teal'}`}>
                                            {isLowStock(detail) ? t('shopOperations.reorderNow') : t('shopOperations.stockOk')}
                                        </span>
                                    </div>
                                    <DetailGrid rows={[
                                        [t('shopOperations.currentStock'),    `${detail.current} ${detail.unit}`],
                                        [t('shopOperations.maximumCapacity'), `${detail.max} ${detail.unit}`],
                                        [t('shopOperations.reorderPoint'),    `${detail.reorderPoint} ${detail.unit}`],
                                        [t('shopOperations.supplier'),        detail.supplier],
                                        [t('shopOperations.storageLocation'), detail.storageLocation || t('shopOperations.notSet')],
                                        [t('shopOperations.lastReorder'),     detail.lastReorder     || t('shopOperations.notSet')],
                                    ]} />
                                </>
                            )}
                            <div className="shop-ops-detail-actions">
                                <button type="button" onClick={() => openEdit(selectedItem.type, detail)}><Pencil size={15} />{t('shopOperations.edit')}</button>
                                <button type="button" className="danger" onClick={() => deleteItem(selectedItem.type, detail)}><Trash2 size={15} />{t('shopOperations.delete')}</button>
                            </div>
                        </>
                    ) : (
                        <div className="shop-ops-detail-empty">
                            <CheckCircle size={34} strokeWidth={1.7} />
                            <strong>{t('shopOperations.selectTitle')}</strong>
                            <span>{t('shopOperations.selectHint')}</span>
                        </div>
                    )}
                </aside>
            </section>

            {editingType && (
                <div className="shop-ops-modal-overlay" onClick={() => setEditingType(null)}>
                    <div className="shop-ops-modal" onClick={(e) => e.stopPropagation()}>
                        <div className="shop-ops-modal-head">
                            <div>
                                <span className="shop-operations-eyebrow">{editingId ? t('shopOperations.edit') : t('shopOperations.create')}</span>
                                <h2>
                                    {editingType === 'service' ? t('shopOperations.serviceDetails')
                                        : editingType === 'machine' ? t('shopOperations.machineDetails')
                                        : t('shopOperations.supplyDetails')}
                                </h2>
                            </div>
                            <button type="button" aria-label={t('common.close')} onClick={() => setEditingType(null)}><X size={18} /></button>
                        </div>
                        <div className="shop-ops-modal-body">
                            {editingType === 'service' && <ServiceForm form={serviceForm} setForm={setServiceForm} t={t} categories={categories} />}
                            {editingType === 'machine' && <MachineForm form={machineForm} setForm={setMachineForm} t={t} statusLabel={statusLabel} />}
                            {editingType === 'supply'  && <SupplyForm  form={supplyForm}  setForm={setSupplyForm}  t={t} />}
                        </div>
                        <div className="shop-ops-modal-footer">
                            <button type="button" className="shop-ops-secondary-btn" onClick={() => setEditingType(null)} disabled={saving}>{t('common.cancel')}</button>
                            <button
                                type="button"
                                className="shop-ops-primary-btn"
                                disabled={saving}
                                onClick={editingType === 'service' ? saveService : editingType === 'machine' ? saveMachine : saveSupply}
                            >
                                {saving
                                    ? <><Loader2 size={14} className="spin" /> {t('auth.loading')}</>
                                    : editingId ? t('shopOperations.saveChanges') : t('shopOperations.create')
                                }
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {confirmDialog.show && (
                <ConfirmDialog
                    title={confirmDialog.title}
                    message={confirmDialog.message}
                    type={confirmDialog.type}
                    onConfirm={confirmDialog.onConfirm}
                    onCancel={closeConfirm}
                    confirmText={t('common.ok')}
                    cancelText={t('common.cancel')}
                />
            )}
        </div>
    )
}

// ── Sub-components (unchanged visual structure) ───────────────────────────────

function DetailGrid({ rows }) {
    return (
        <dl className="shop-ops-detail-grid">
            {rows.map(([label, value]) => (
                <div key={label}>
                    <dt>{label}</dt>
                    <dd>{value}</dd>
                </div>
            ))}
        </dl>
    )
}

function ServiceForm({ form, setForm, t, categories }) {
    return (
        <div className="shop-ops-form-grid">
            <Field label={t('shopOperations.serviceName')} value={form.serviceName}  onChange={(v) => setForm({ ...form, serviceName: v })} />
            <label>
                <span>{t('shopOperations.category')}</span>
                <select
                    value={form.serviceCategoryId}
                    onChange={(e) => setForm({ ...form, serviceCategoryId: Number(e.target.value) })}
                >
                    <option value="">— chọn danh mục —</option>
                    {categories.map(cat => (
                        <option value={cat.id} key={cat.id}>{cat.name}</option>
                    ))}
                </select>
            </label>
            <Field label={t('shopOperations.price')}      value={form.price}              onChange={(v) => setForm({ ...form, price: v })} type="number" />
            <Field label={t('shopOperations.minOrder')}   value={form.minOrder}           onChange={(v) => setForm({ ...form, minOrder: v })} type="number" />
            <label>
                <span>{t('shopOperations.pricingType')}</span>
                <select value={form.pricingType} onChange={(e) => setForm({ ...form, pricingType: e.target.value })}>
                    <option value="kg">kg</option>
                    <option value="piece">{t('shopOperations.piece')}</option>
                    <option value="meter">{t('shopOperations.meter')}</option>
                </select>
            </label>
            <Field label={t('shopOperations.estimatedTime')} value={form.estimatedTime} onChange={(v) => setForm({ ...form, estimatedTime: v })} />
            <label className="wide">
                <span>{t('shopOperations.description')}</span>
                <textarea rows="3" value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} />
            </label>
            <label className="shop-ops-check">
                <input type="checkbox" checked={form.available} onChange={(e) => setForm({ ...form, available: e.target.checked })} />
                <span>{t('shopOperations.available')}</span>
            </label>
        </div>
    )
}

function MachineForm({ form, setForm, t, statusLabel }) {
    return (
        <div className="shop-ops-form-grid">
            <Field label={t('shopOperations.machineName')} value={form.name}     onChange={(v) => setForm({ ...form, name: v })} />
            <label>
                <span>{t('shopOperations.type')}</span>
                <select value={form.machineType} onChange={(e) => setForm({ ...form, machineType: e.target.value })}>
                    <option>Washer</option>
                    <option>Dryer</option>
                </select>
            </label>
            <label>
                <span>{t('shopOperations.status')}</span>
                <select value={form.status} onChange={(e) => setForm({ ...form, status: e.target.value })}>
                    {['AVAILABLE', 'IN_USE', 'MAINTENANCE', 'OUT_OF_ORDER'].map(s => (
                        <option value={s} key={s}>{statusLabel(s)}</option>
                    ))}
                </select>
            </label>
            <Field label={t('shopOperations.location')}       value={form.location}        onChange={(v) => setForm({ ...form, location: v })} />
            <Field label={t('shopOperations.capacity')}       value={form.capacity}        onChange={(v) => setForm({ ...form, capacity: v })} />
            <Field label={t('shopOperations.model')}          value={form.model}           onChange={(v) => setForm({ ...form, model: v })} />
            <Field label={t('shopOperations.purchaseDate')}   value={form.purchaseDate}    onChange={(v) => setForm({ ...form, purchaseDate: v })} type="date" />
            <Field label={t('shopOperations.nextMaintenance')} value={form.nextMaintenance} onChange={(v) => setForm({ ...form, nextMaintenance: v })} type="date" />
        </div>
    )
}

function SupplyForm({ form, setForm, t }) {
    return (
        <div className="shop-ops-form-grid">
            <Field label={t('shopOperations.supplyName')}      value={form.name}            onChange={(v) => setForm({ ...form, name: v })} />
            <Field label={t('shopOperations.currentStock')}    value={form.quantity}        onChange={(v) => setForm({ ...form, quantity: v })}    type="number" />
            <Field label={t('shopOperations.maximumCapacity')} value={form.maxQuantity}     onChange={(v) => setForm({ ...form, maxQuantity: v })}  type="number" />
            <label>
                <span>{t('shopOperations.unit')}</span>
                <select value={form.unit} onChange={(e) => setForm({ ...form, unit: e.target.value })}>
                    <option value="L">L</option>
                    <option value="kg">kg</option>
                    <option value="cái">{t('shopOperations.piece')}</option>
                    <option value="chai">{t('shopOperations.bottle')}</option>
                </select>
            </label>
            <Field label={t('shopOperations.reorderPoint')} value={form.reorderPoint}  onChange={(v) => setForm({ ...form, reorderPoint: v })}  type="number" />
            <Field label={t('shopOperations.supplier')}     value={form.supplier}      onChange={(v) => setForm({ ...form, supplier: v })} />
            <Field label="Category"                         value={form.category}      onChange={(v) => setForm({ ...form, category: v })} />
            <Field label="Storage Location"                 value={form.storageLocation} onChange={(v) => setForm({ ...form, storageLocation: v })} />
            <Field label={t('shopOperations.lastReorder')}  value={form.lastReorder}   onChange={(v) => setForm({ ...form, lastReorder: v })} type="date" />
        </div>
    )
}

function Field({ label, value, onChange, type = 'text' }) {
    return (
        <label>
            <span>{label}</span>
            <input type={type} value={value || ''} onChange={(e) => onChange(e.target.value)} />
        </label>
    )
}

export default ShopOperations
