import { createElement, useEffect, useState } from 'react'
import {
    AlertTriangle,
    Boxes,
    CheckCircle,
    Clock,
    Eye,
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
import { services as servicesData, machines as machinesData, supplies as suppliesData } from '../../data'
import { loadMachines, loadServices, loadSupplies, saveMachines, saveServices, saveSupplies } from '../../utils/dataManager'
import toast from '../../utils/toast'
import ConfirmDialog from '../../components/ConfirmDialog/ConfirmDialog'
import { useTranslation } from '../../shared/lib/i18n'

const emptyService = {
    name: '',
    category: 'Giặt',
    pricingType: 'kg',
    price: '',
    minOrder: '',
    estimatedTime: '',
    description: '',
    available: true,
}

const emptyMachine = {
    name: '',
    type: 'Washer',
    status: 'empty',
    location: '',
    capacity: '',
    model: '',
    purchaseDate: '',
}

const emptySupply = {
    name: '',
    current: '',
    max: '',
    unit: 'L',
    reorderPoint: '',
    supplier: '',
    lastReorder: '',
}

function nextId(items, prefix) {
    const max = items.reduce((current, item) => {
        const numeric = Number(String(item.id).replace(/\D/g, ''))
        return Number.isFinite(numeric) ? Math.max(current, numeric) : current
    }, 0)
    return `${prefix}-${String(max + 1).padStart(2, '0')}`
}

function ShopOperations() {
    const { t } = useTranslation()
    const [activeTab, setActiveTab] = useState('services')
    const [query, setQuery] = useState('')
    const [selectedItem, setSelectedItem] = useState(null)
    const [editingType, setEditingType] = useState(null)
    const [editingId, setEditingId] = useState(null)
    const [serviceForm, setServiceForm] = useState(emptyService)
    const [machineForm, setMachineForm] = useState(emptyMachine)
    const [supplyForm, setSupplyForm] = useState(emptySupply)
    const [confirmDialog, setConfirmDialog] = useState({
        show: false,
        title: '',
        message: '',
        onConfirm: null,
        type: 'warning',
    })

    const [services, setServices] = useState(() => loadServices(servicesData))
    const [machines, setMachines] = useState(() => loadMachines(machinesData))
    const [supplies, setSupplies] = useState(() => loadSupplies(suppliesData))

    useEffect(() => { saveServices(services) }, [services])
    useEffect(() => { saveMachines(machines) }, [machines])
    useEffect(() => { saveSupplies(supplies) }, [supplies])

    const closeConfirm = () => setConfirmDialog(prev => ({ ...prev, show: false }))

    const statusLabel = (status) => {
        const map = {
            empty: t('shopOperations.readyEmpty'),
            washing: t('shopOperations.running'),
            drying: t('shopOperations.running'),
            ironing: t('shopOperations.running'),
            maintenance: t('shopOperations.maintenance'),
        }
        return map[status] || t('shopOperations.unknown')
    }

    const statusTone = (status) => {
        if (status === 'empty') return 'teal'
        if (status === 'maintenance') return 'red'
        return 'blue'
    }

    const stockPercent = (supply) => Math.min(100, Math.round((Number(supply.current) / Math.max(Number(supply.max), 1)) * 100))
    const isLowStock = (supply) => Number(supply.current) <= Number(supply.reorderPoint)

    const availableServices = services.filter(service => service.available).length
    const runningMachines = machines.filter(machine => ['washing', 'drying', 'ironing'].includes(machine.status)).length
    const maintenanceMachines = machines.filter(machine => machine.status === 'maintenance').length
    const lowSupplies = supplies.filter(isLowStock)

    const kpis = [
        { label: t('shopOperations.availableServices'), value: `${availableServices}/${services.length}`, Icon: Shirt, tone: 'navy' },
        { label: t('shopOperations.runningMachines'), value: String(runningMachines), Icon: Wrench, tone: 'blue' },
        { label: t('shopOperations.lowStock'), value: String(lowSupplies.length), Icon: AlertTriangle, tone: lowSupplies.length ? 'amber' : 'teal' },
        { label: t('shopOperations.maintenanceDue'), value: String(maintenanceMachines), Icon: Clock, tone: maintenanceMachines ? 'red' : 'teal' },
    ]

    const tabs = [
        { key: 'services', label: t('shopOperations.services'), count: services.length, Icon: Shirt },
        { key: 'machines', label: t('shopOperations.machines'), count: machines.length, Icon: Wrench },
        { key: 'supplies', label: t('shopOperations.supplies'), count: supplies.length, Icon: Boxes },
    ]

    const normalizedQuery = query.trim().toLowerCase()
    const visibleServices = services.filter(service =>
        !normalizedQuery ||
        service.name.toLowerCase().includes(normalizedQuery) ||
        service.category.toLowerCase().includes(normalizedQuery) ||
        service.description.toLowerCase().includes(normalizedQuery)
    )
    const visibleMachines = machines.filter(machine =>
        !normalizedQuery ||
        machine.name.toLowerCase().includes(normalizedQuery) ||
        machine.id.toLowerCase().includes(normalizedQuery) ||
        machine.location.toLowerCase().includes(normalizedQuery) ||
        machine.status.toLowerCase().includes(normalizedQuery)
    )
    const visibleSupplies = supplies.filter(supply =>
        !normalizedQuery ||
        supply.name.toLowerCase().includes(normalizedQuery) ||
        supply.id.toLowerCase().includes(normalizedQuery) ||
        supply.supplier.toLowerCase().includes(normalizedQuery) ||
        supply.category?.toLowerCase().includes(normalizedQuery)
    )

    const openCreate = (type) => {
        setEditingType(type)
        setEditingId(null)
        if (type === 'service') setServiceForm(emptyService)
        if (type === 'machine') setMachineForm(emptyMachine)
        if (type === 'supply') setSupplyForm(emptySupply)
    }

    const openEdit = (type, item) => {
        setEditingType(type)
        setEditingId(item.id)
        if (type === 'service') setServiceForm({ ...emptyService, ...item })
        if (type === 'machine') setMachineForm({ ...emptyMachine, ...item })
        if (type === 'supply') setSupplyForm({ ...emptySupply, ...item })
    }

    const saveService = () => {
        if (!serviceForm.name || !serviceForm.price || !serviceForm.minOrder) {
            toast.warning(t('shopOperations.requiredFields'))
            return
        }
        const payload = {
            ...serviceForm,
            price: Number(serviceForm.price),
            minOrder: Number(serviceForm.minOrder),
        }
        if (editingId) {
            setServices(services.map(service => service.id === editingId ? { ...service, ...payload } : service))
            toast.success(t('shopOperations.updated').replace('{item}', editingId))
        } else {
            const newService = { id: nextId(services, 'S'), ...payload }
            setServices([...services, newService])
            toast.success(t('shopOperations.created').replace('{item}', newService.id))
        }
        setEditingType(null)
    }

    const saveMachine = () => {
        if (!machineForm.name || !machineForm.location) {
            toast.warning(t('shopOperations.requiredFields'))
            return
        }
        if (editingId) {
            setMachines(machines.map(machine => machine.id === editingId ? { ...machine, ...machineForm } : machine))
            toast.success(t('shopOperations.updated').replace('{item}', editingId))
        } else {
            const newMachine = { id: nextId(machines, 'M'), ...machineForm }
            setMachines([...machines, newMachine])
            toast.success(t('shopOperations.created').replace('{item}', newMachine.id))
        }
        setEditingType(null)
    }

    const saveSupply = () => {
        if (!supplyForm.name || !supplyForm.current || !supplyForm.max || !supplyForm.reorderPoint) {
            toast.warning(t('shopOperations.requiredFields'))
            return
        }
        const payload = {
            ...supplyForm,
            current: Number(supplyForm.current),
            max: Number(supplyForm.max),
            reorderPoint: Number(supplyForm.reorderPoint),
        }
        if (editingId) {
            setSupplies(supplies.map(supply => supply.id === editingId ? { ...supply, ...payload } : supply))
            toast.success(t('shopOperations.updated').replace('{item}', editingId))
        } else {
            const newSupply = { id: nextId(supplies, 'SUP'), ...payload }
            setSupplies([...supplies, newSupply])
            toast.success(t('shopOperations.created').replace('{item}', newSupply.id))
        }
        setEditingType(null)
    }

    const deleteItem = (type, item) => {
        setConfirmDialog({
            show: true,
            title: t('shopOperations.deleteTitle'),
            message: t('shopOperations.deleteMessage').replace('{item}', item.id),
            type: 'danger',
            onConfirm: () => {
                if (type === 'service') setServices(services.filter(service => service.id !== item.id))
                if (type === 'machine') setMachines(machines.filter(machine => machine.id !== item.id))
                if (type === 'supply') setSupplies(supplies.filter(supply => supply.id !== item.id))
                setSelectedItem(null)
                toast.success(t('shopOperations.deleted').replace('{item}', item.id))
                closeConfirm()
            },
        })
    }

    const toggleServiceAvailability = (service) => {
        setServices(services.map(item => item.id === service.id ? { ...item, available: !item.available } : item))
    }

    const renderServiceList = () => (
        <div className="shop-operations-list">
            {visibleServices.map(service => (
                <article className={`shop-ops-row ${!service.available ? 'muted' : ''}`} key={service.id}>
                    <div className="shop-ops-row-main">
                        <span className="shop-ops-id">{service.id}</span>
                        <div>
                            <h3>{service.name}</h3>
                            <p>{service.category} · {service.estimatedTime}</p>
                        </div>
                    </div>
                    <div className="shop-ops-row-metric">
                        <strong>{service.price.toLocaleString()}đ</strong>
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
                        <span>{machine.type}</span>
                        <span>{machine.capacity || t('shopOperations.notSet')}</span>
                        <span>{machine.totalCycles?.toLocaleString() || 0} {t('shopOperations.cycles')}</span>
                    </div>
                    {machine.currentOrder && (
                        <div className="shop-ops-inline-alert">
                            <Clock size={14} />
                            {machine.currentOrder} · {machine.timeLeft}
                        </div>
                    )}
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

    const currentListLength = activeTab === 'services' ? visibleServices.length : activeTab === 'machines' ? visibleMachines.length : visibleSupplies.length
    const primaryCreateType = activeTab === 'services' ? 'service' : activeTab === 'machines' ? 'machine' : 'supply'

    const detail = selectedItem?.data

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
                            <input value={query} onChange={(event) => setQuery(event.target.value)} placeholder={t('shopOperations.searchPlaceholder')} />
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
                                    <h2>{detail.name}</h2>
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
                                        [t('shopOperations.category'), detail.category],
                                        [t('shopOperations.price'), `${detail.price.toLocaleString()}đ / ${detail.pricingType}`],
                                        [t('shopOperations.minOrder'), `${detail.minOrder} ${detail.pricingType}`],
                                        [t('shopOperations.estimatedTime'), detail.estimatedTime],
                                        [t('shopOperations.description'), detail.description],
                                    ]} />
                                </>
                            )}
                            {selectedItem.type === 'machine' && (
                                <>
                                    <div className="shop-ops-detail-status">
                                        <span className={`shop-ops-badge ${statusTone(detail.status)}`}>{statusLabel(detail.status)}</span>
                                    </div>
                                    <DetailGrid rows={[
                                        [t('shopOperations.machineId'), detail.id],
                                        [t('shopOperations.type'), detail.type],
                                        [t('shopOperations.location'), detail.location],
                                        [t('shopOperations.capacity'), detail.capacity],
                                        [t('shopOperations.model'), detail.model],
                                        [t('shopOperations.currentOrder'), detail.currentOrder || t('shopOperations.notSet')],
                                        [t('shopOperations.timeLeft'), detail.timeLeft || t('shopOperations.notSet')],
                                        [t('shopOperations.nextMaintenance'), detail.nextMaintenance || t('shopOperations.notSet')],
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
                                        [t('shopOperations.currentStock'), `${detail.current} ${detail.unit}`],
                                        [t('shopOperations.maximumCapacity'), `${detail.max} ${detail.unit}`],
                                        [t('shopOperations.reorderPoint'), `${detail.reorderPoint} ${detail.unit}`],
                                        [t('shopOperations.supplier'), detail.supplier],
                                        [t('shopOperations.storageLocation'), detail.storageLocation || t('shopOperations.notSet')],
                                        [t('shopOperations.lastReorder'), detail.lastReorder || t('shopOperations.notSet')],
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
                    <div className="shop-ops-modal" onClick={(event) => event.stopPropagation()}>
                        <div className="shop-ops-modal-head">
                            <div>
                                <span className="shop-operations-eyebrow">{editingId ? t('shopOperations.edit') : t('shopOperations.create')}</span>
                                <h2>{editingType === 'service' ? t('shopOperations.serviceDetails') : editingType === 'machine' ? t('shopOperations.machineDetails') : t('shopOperations.supplyDetails')}</h2>
                            </div>
                            <button type="button" aria-label={t('common.close')} onClick={() => setEditingType(null)}><X size={18} /></button>
                        </div>
                        <div className="shop-ops-modal-body">
                            {editingType === 'service' && <ServiceForm form={serviceForm} setForm={setServiceForm} t={t} />}
                            {editingType === 'machine' && <MachineForm form={machineForm} setForm={setMachineForm} t={t} statusLabel={statusLabel} />}
                            {editingType === 'supply' && <SupplyForm form={supplyForm} setForm={setSupplyForm} t={t} />}
                        </div>
                        <div className="shop-ops-modal-footer">
                            <button type="button" className="shop-ops-secondary-btn" onClick={() => setEditingType(null)}>{t('common.cancel')}</button>
                            <button type="button" className="shop-ops-primary-btn" onClick={editingType === 'service' ? saveService : editingType === 'machine' ? saveMachine : saveSupply}>
                                {editingId ? t('shopOperations.saveChanges') : t('shopOperations.create')}
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

function ServiceForm({ form, setForm, t }) {
    return (
        <div className="shop-ops-form-grid">
            <Field label={t('shopOperations.serviceName')} value={form.name} onChange={(value) => setForm({ ...form, name: value })} />
            <Field label={t('shopOperations.category')} value={form.category} onChange={(value) => setForm({ ...form, category: value })} />
            <Field label={t('shopOperations.price')} type="number" value={form.price} onChange={(value) => setForm({ ...form, price: value })} />
            <Field label={t('shopOperations.minOrder')} type="number" value={form.minOrder} onChange={(value) => setForm({ ...form, minOrder: value })} />
            <label>
                <span>{t('shopOperations.pricingType')}</span>
                <select value={form.pricingType} onChange={(event) => setForm({ ...form, pricingType: event.target.value })}>
                    <option value="kg">kg</option>
                    <option value="piece">{t('shopOperations.piece')}</option>
                    <option value="meter">{t('shopOperations.meter')}</option>
                </select>
            </label>
            <Field label={t('shopOperations.estimatedTime')} value={form.estimatedTime} onChange={(value) => setForm({ ...form, estimatedTime: value })} />
            <label className="wide">
                <span>{t('shopOperations.description')}</span>
                <textarea rows="3" value={form.description} onChange={(event) => setForm({ ...form, description: event.target.value })} />
            </label>
            <label className="shop-ops-check">
                <input type="checkbox" checked={form.available} onChange={(event) => setForm({ ...form, available: event.target.checked })} />
                <span>{t('shopOperations.available')}</span>
            </label>
        </div>
    )
}

function MachineForm({ form, setForm, t, statusLabel }) {
    return (
        <div className="shop-ops-form-grid">
            <Field label={t('shopOperations.machineName')} value={form.name} onChange={(value) => setForm({ ...form, name: value })} />
            <label>
                <span>{t('shopOperations.type')}</span>
                <select value={form.type} onChange={(event) => setForm({ ...form, type: event.target.value })}>
                    <option>Washer</option>
                    <option>Dryer</option>
                </select>
            </label>
            <label>
                <span>{t('shopOperations.status')}</span>
                <select value={form.status} onChange={(event) => setForm({ ...form, status: event.target.value })}>
                    {['empty', 'washing', 'drying', 'maintenance'].map(status => <option value={status} key={status}>{statusLabel(status)}</option>)}
                </select>
            </label>
            <Field label={t('shopOperations.location')} value={form.location} onChange={(value) => setForm({ ...form, location: value })} />
            <Field label={t('shopOperations.capacity')} value={form.capacity} onChange={(value) => setForm({ ...form, capacity: value })} />
            <Field label={t('shopOperations.model')} value={form.model} onChange={(value) => setForm({ ...form, model: value })} />
            <Field label={t('shopOperations.purchaseDate')} type="date" value={form.purchaseDate} onChange={(value) => setForm({ ...form, purchaseDate: value })} />
        </div>
    )
}

function SupplyForm({ form, setForm, t }) {
    return (
        <div className="shop-ops-form-grid">
            <Field label={t('shopOperations.supplyName')} value={form.name} onChange={(value) => setForm({ ...form, name: value })} />
            <Field label={t('shopOperations.currentStock')} type="number" value={form.current} onChange={(value) => setForm({ ...form, current: value })} />
            <Field label={t('shopOperations.maximumCapacity')} type="number" value={form.max} onChange={(value) => setForm({ ...form, max: value })} />
            <label>
                <span>{t('shopOperations.unit')}</span>
                <select value={form.unit} onChange={(event) => setForm({ ...form, unit: event.target.value })}>
                    <option value="L">L</option>
                    <option value="kg">kg</option>
                    <option value="cái">{t('shopOperations.piece')}</option>
                    <option value="chai">{t('shopOperations.bottle')}</option>
                </select>
            </label>
            <Field label={t('shopOperations.reorderPoint')} type="number" value={form.reorderPoint} onChange={(value) => setForm({ ...form, reorderPoint: value })} />
            <Field label={t('shopOperations.supplier')} value={form.supplier} onChange={(value) => setForm({ ...form, supplier: value })} />
            <Field label={t('shopOperations.lastReorder')} type="date" value={form.lastReorder} onChange={(value) => setForm({ ...form, lastReorder: value })} />
        </div>
    )
}

function Field({ label, value, onChange, type = 'text' }) {
    return (
        <label>
            <span>{label}</span>
            <input type={type} value={value || ''} onChange={(event) => onChange(event.target.value)} />
        </label>
    )
}

export default ShopOperations
