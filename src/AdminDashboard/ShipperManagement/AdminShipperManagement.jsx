import { createElement, useState } from 'react'
import {
    BadgeCheck,
    CheckCircle,
    Clock,
    FileCheck,
    Search,
    Star,
    Truck,
    UserRound,
    Wallet,
    XCircle,
} from 'lucide-react'
import './AdminShipperManagement.css'
import {
    pendingShippers as pendingShippersData,
    shipperPayments as shipperPaymentsData,
    shippers as shippersData,
} from '../../data'
import toast from '../../utils/toast'
import { useTranslation } from '../../shared/lib/i18n'

function statusKey(status) {
    return status === 'active' ? 'active' : status === 'inactive' ? 'inactive' : status === 'paid' ? 'paid' : 'pending'
}

function AdminShipperManagement() {
    const { t } = useTranslation()
    const [activeTab, setActiveTab] = useState('all')
    const [shippers, setShippers] = useState(shippersData)
    const [pendingShippers, setPendingShippers] = useState(pendingShippersData)
    const [shipperPayments, setShipperPayments] = useState(shipperPaymentsData)
    const [searchQuery, setSearchQuery] = useState('')
    const [selectedShipperId, setSelectedShipperId] = useState(shippersData[0]?.id || null)

    const filteredShippers = shippers.filter(shipper => {
        const query = searchQuery.trim().toLowerCase()
        return !query ||
            shipper.name.toLowerCase().includes(query) ||
            shipper.id.toLowerCase().includes(query) ||
            shipper.phone.includes(query) ||
            shipper.licensePlate.toLowerCase().includes(query)
    })
    const selectedShipper = shippers.find(shipper => shipper.id === selectedShipperId) || filteredShippers[0] || null
    const activeCount = shippers.filter(shipper => shipper.status === 'active').length
    const avgRating = shippers.length ? (shippers.reduce((sum, shipper) => sum + shipper.rating, 0) / shippers.length).toFixed(1) : '0.0'
    const totalDeliveries = shippers.reduce((sum, shipper) => sum + (shipper.totalDeliveries || 0), 0)
    const pendingPayments = shipperPayments.filter(payment => payment.status === 'pending')
    const topShippers = shippers.filter(shipper => shipper.rating >= 4.7 && shipper.totalDeliveries >= 900)

    const kpis = [
        { label: t('adminShippers.totalShippers'), value: shippers.length, meta: `${activeCount} ${t('adminShippers.active')}`, Icon: Truck, tone: 'sapphire' },
        { label: t('adminShippers.pendingApprovals'), value: pendingShippers.length, meta: t('adminShippers.reviewQueue'), Icon: Clock, tone: 'gold' },
        { label: t('adminShippers.totalDeliveries'), value: totalDeliveries.toLocaleString(), meta: t('adminShippers.platformTrips'), Icon: BadgeCheck, tone: 'sapphire' },
        { label: t('adminShippers.averageRating'), value: avgRating, meta: t('adminShippers.fromReviews'), Icon: Star, tone: 'sapphire' },
        { label: t('adminShippers.pendingPayments'), value: pendingPayments.length, meta: t('adminShippers.payoutQueue'), Icon: Wallet, tone: 'gold' },
    ]

    const tabs = [
        { id: 'all', label: t('adminShippers.allShippers'), count: shippers.length },
        { id: 'approvals', label: t('adminShippers.pendingApprovals'), count: pendingShippers.length },
        { id: 'top', label: t('adminShippers.topPerformers'), count: topShippers.length },
        { id: 'payments', label: t('adminShippers.payments'), count: shipperPayments.length },
    ]

    const approveShipper = (shipper) => {
        const nextNum = Math.max(...shippers.map(item => parseInt(item.id.replace(/\D/g, ''), 10) || 0)) + 1
        const newShipper = {
            ...shipper,
            id: `SHP-${nextNum}`,
            rating: 0,
            totalDeliveries: 0,
            totalEarnings: '0',
            status: 'active',
            joinDate: '2026-06-02',
            lastActive: '2026-06-02 08:30',
        }
        setShippers(prev => [newShipper, ...prev])
        setPendingShippers(prev => prev.filter(item => item.id !== shipper.id))
        setSelectedShipperId(newShipper.id)
        toast.success(t('adminShippers.shipperApproved'))
    }

    const rejectShipper = (shipper) => {
        setPendingShippers(prev => prev.filter(item => item.id !== shipper.id))
        toast.success(t('adminShippers.shipperRejected'))
    }

    const toggleStatus = (shipper) => {
        const nextStatus = shipper.status === 'active' ? 'inactive' : 'active'
        setShippers(prev => prev.map(item => item.id === shipper.id ? { ...item, status: nextStatus } : item))
        toast.success(t('adminShippers.statusUpdated'))
    }

    const processPayment = (payment) => {
        setShipperPayments(prev => prev.map(item => item.id === payment.id ? { ...item, status: 'paid', paidDate: '2026-06-02' } : item))
        toast.success(t('adminShippers.paymentProcessed'))
    }

    const renderTable = (rows) => (
        <div className="admin-shippers-table-wrap">
            <table className="admin-shippers-table">
                <thead>
                    <tr>
                        <th>{t('adminShippers.shipper')}</th>
                        <th>{t('adminShippers.contact')}</th>
                        <th>{t('adminShippers.vehicle')}</th>
                        <th>{t('adminShippers.rating')}</th>
                        <th>{t('adminShippers.deliveries')}</th>
                        <th>{t('adminShippers.earnings')}</th>
                        <th>{t('adminShippers.status')}</th>
                        <th>{t('adminShippers.action')}</th>
                    </tr>
                </thead>
                <tbody>
                    {rows.map(shipper => (
                        <tr key={shipper.id} className={selectedShipper?.id === shipper.id ? 'selected' : ''} onClick={() => setSelectedShipperId(shipper.id)}>
                            <td><strong>{shipper.name}</strong><small>{shipper.id}</small></td>
                            <td>{shipper.phone}</td>
                            <td><strong>{shipper.vehicleType}</strong><small>{shipper.licensePlate}</small></td>
                            <td>{shipper.rating}</td>
                            <td>{shipper.totalDeliveries.toLocaleString()}</td>
                            <td className="money">{shipper.totalEarnings}</td>
                            <td><span className={`admin-shippers-badge ${statusKey(shipper.status)}`}>{t(`adminShippers.status${statusKey(shipper.status)}`)}</span></td>
                            <td>
                                <button type="button" className="admin-shippers-row-btn" onClick={(event) => { event.stopPropagation(); toggleStatus(shipper) }}>
                                    {shipper.status === 'active' ? t('adminShippers.deactivate') : t('adminShippers.activate')}
                                </button>
                            </td>
                        </tr>
                    ))}
                </tbody>
            </table>
        </div>
    )

    return (
        <div className="admin-shippers-page">
            <header className="admin-shippers-header">
                <div>
                    <span className="admin-shippers-eyebrow">{t('adminShippers.eyebrow')}</span>
                    <h1>{t('adminShippers.title')}</h1>
                    <p>{t('adminShippers.subtitle')}</p>
                </div>
            </header>

            <section className="admin-shippers-kpis">
                {kpis.map(({ label, value, meta, Icon, tone }) => (
                    <article className={`admin-shippers-kpi ${tone}`} key={label}>
                        <span>{createElement(Icon, { size: 18, strokeWidth: 1.9 })}</span>
                        <small>{label}</small>
                        <strong>{value}</strong>
                        <p>{meta}</p>
                    </article>
                ))}
            </section>

            <section className="admin-shippers-tabs">
                {tabs.map(tab => (
                    <button type="button" className={activeTab === tab.id ? 'active' : ''} key={tab.id} onClick={() => setActiveTab(tab.id)}>
                        {tab.label}
                        <span>{tab.count}</span>
                    </button>
                ))}
            </section>

            {(activeTab === 'all' || activeTab === 'top') && (
                <section className="admin-shippers-workspace">
                    <article className="admin-shippers-card admin-shippers-table-card">
                        <div className="admin-shippers-card-head">
                            <div>
                                <span className="admin-shippers-eyebrow">{t('adminShippers.fleet')}</span>
                                <h2>{(activeTab === 'all' ? filteredShippers : topShippers).length} {t('adminShippers.results')}</h2>
                            </div>
                            <label className="admin-shippers-search">
                                <Search size={17} strokeWidth={1.9} />
                                <input value={searchQuery} onChange={(event) => setSearchQuery(event.target.value)} placeholder={t('adminShippers.searchPlaceholder')} />
                            </label>
                        </div>
                        {renderTable(activeTab === 'all' ? filteredShippers : topShippers)}
                    </article>

                    <aside className="admin-shippers-card admin-shippers-detail">
                        {selectedShipper ? (
                            <>
                                <div className="admin-shippers-detail-head">
                                    <div>
                                        <span className="admin-shippers-eyebrow">{t('adminShippers.driverProfile')}</span>
                                        <h2>{selectedShipper.name}</h2>
                                    </div>
                                    <span className={`admin-shippers-badge ${statusKey(selectedShipper.status)}`}>{t(`adminShippers.status${statusKey(selectedShipper.status)}`)}</span>
                                </div>
                                <dl className="admin-shippers-detail-grid">
                                    <div><dt>{t('adminShippers.phone')}</dt><dd>{selectedShipper.phone}</dd></div>
                                    <div><dt>{t('adminShippers.email')}</dt><dd>{selectedShipper.email}</dd></div>
                                    <div><dt>{t('adminShippers.vehicle')}</dt><dd>{selectedShipper.vehicleType} · {selectedShipper.licensePlate}</dd></div>
                                    <div><dt>{t('adminShippers.identityCard')}</dt><dd>{selectedShipper.identityCard}</dd></div>
                                    <div><dt>{t('adminShippers.address')}</dt><dd>{selectedShipper.address}</dd></div>
                                    <div><dt>{t('adminShippers.lastActive')}</dt><dd>{selectedShipper.lastActive}</dd></div>
                                    <div><dt>{t('adminShippers.rating')}</dt><dd>{selectedShipper.rating} / 5</dd></div>
                                    <div><dt>{t('adminShippers.totalEarnings')}</dt><dd>{selectedShipper.totalEarnings}</dd></div>
                                </dl>
                            </>
                        ) : (
                            <div className="admin-shippers-empty"><UserRound size={28} /><strong>{t('adminShippers.noSelection')}</strong></div>
                        )}
                    </aside>
                </section>
            )}

            {activeTab === 'approvals' && (
                <section className="admin-shippers-approval-grid">
                    {pendingShippers.map(shipper => (
                        <article className="admin-shippers-card admin-shippers-approval" key={shipper.id}>
                            <div className="admin-shippers-approval-head">
                                <span><Truck size={18} /></span>
                                <div>
                                    <strong>{shipper.name}</strong>
                                    <small>{shipper.vehicleType} · {shipper.licensePlate}</small>
                                </div>
                            </div>
                            <dl>
                                <div><dt>{t('adminShippers.phone')}</dt><dd>{shipper.phone}</dd></div>
                                <div><dt>{t('adminShippers.email')}</dt><dd>{shipper.email}</dd></div>
                                <div><dt>{t('adminShippers.identityCard')}</dt><dd>{shipper.identityCard}</dd></div>
                                <div><dt>{t('adminShippers.appliedDate')}</dt><dd>{shipper.appliedDate}</dd></div>
                            </dl>
                            <div className="admin-shippers-docs">
                                {shipper.documents.map(doc => <span key={doc}>{doc}</span>)}
                            </div>
                            <div className="admin-shippers-card-actions">
                                <button type="button" className="reject" onClick={() => rejectShipper(shipper)}><XCircle size={15} />{t('adminShippers.reject')}</button>
                                <button type="button" className="approve" onClick={() => approveShipper(shipper)}><CheckCircle size={15} />{t('adminShippers.approve')}</button>
                            </div>
                        </article>
                    ))}
                </section>
            )}

            {activeTab === 'payments' && (
                <section className="admin-shippers-card admin-shippers-table-card">
                    <div className="admin-shippers-card-head">
                        <div>
                            <span className="admin-shippers-eyebrow">{t('adminShippers.finance')}</span>
                            <h2>{t('adminShippers.paymentQueue')}</h2>
                        </div>
                    </div>
                    <div className="admin-shippers-table-wrap">
                        <table className="admin-shippers-table">
                            <thead>
                                <tr>
                                    <th>{t('adminShippers.shipper')}</th>
                                    <th>{t('adminShippers.period')}</th>
                                    <th>{t('adminShippers.deliveries')}</th>
                                    <th>{t('adminShippers.earnings')}</th>
                                    <th>{t('adminShippers.bonuses')}</th>
                                    <th>{t('adminShippers.total')}</th>
                                    <th>{t('adminShippers.status')}</th>
                                    <th>{t('adminShippers.action')}</th>
                                </tr>
                            </thead>
                            <tbody>
                                {shipperPayments.map(payment => (
                                    <tr key={payment.id}>
                                        <td><strong>{payment.name}</strong><small>{payment.shipperId}</small></td>
                                        <td>{payment.period}</td>
                                        <td>{payment.deliveries}</td>
                                        <td>{payment.earnings}</td>
                                        <td>{payment.bonuses}</td>
                                        <td className="money">{payment.total}</td>
                                        <td><span className={`admin-shippers-badge ${statusKey(payment.status)}`}>{t(`adminShippers.status${statusKey(payment.status)}`)}</span></td>
                                        <td>
                                            {payment.status === 'pending' ? (
                                                <button type="button" className="admin-shippers-row-btn" onClick={() => processPayment(payment)}>{t('adminShippers.processPayment')}</button>
                                            ) : <FileCheck size={17} />}
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                </section>
            )}
        </div>
    )
}

export default AdminShipperManagement
