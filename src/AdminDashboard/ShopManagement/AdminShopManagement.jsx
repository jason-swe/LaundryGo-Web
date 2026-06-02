import { createElement, useState } from 'react'
import {
    AlertTriangle,
    BadgeCheck,
    CheckCircle,
    Clock,
    FileCheck,
    Search,
    ShieldAlert,
    Store,
    UserRound,
    Wallet,
    XCircle,
} from 'lucide-react'
import './AdminShopManagement.css'
import {
    pendingShops as pendingShopsData,
    shopDocumentUpdates as documentUpdatesData,
    shops as shopsData,
} from '../../data'
import toast from '../../utils/toast'
import { useTranslation } from '../../shared/lib/i18n'

function statusKey(status) {
    return status === 'active' ? 'active' : status === 'suspended' ? 'suspended' : status === 'approved' ? 'approved' : status === 'rejected' ? 'rejected' : 'pending'
}

function AdminShopManagement() {
    const { t } = useTranslation()
    const [activeTab, setActiveTab] = useState('all')
    const [shops, setShops] = useState(shopsData)
    const [pendingShops, setPendingShops] = useState(pendingShopsData)
    const [documentUpdates, setDocumentUpdates] = useState(documentUpdatesData)
    const [searchQuery, setSearchQuery] = useState('')
    const [selectedShopId, setSelectedShopId] = useState(shopsData[0]?.id || null)

    const filteredShops = shops.filter(shop => {
        const query = searchQuery.trim().toLowerCase()
        return !query ||
            shop.name.toLowerCase().includes(query) ||
            shop.owner.toLowerCase().includes(query) ||
            shop.location.toLowerCase().includes(query) ||
            shop.id.toLowerCase().includes(query)
    })

    const selectedShop = shops.find(shop => shop.id === selectedShopId) || filteredShops[0] || null
    const activeCount = shops.filter(shop => shop.status === 'active').length
    const suspendedCount = shops.filter(shop => shop.status === 'suspended').length
    const premiumCount = shops.filter(shop => shop.subscription === 'premium').length
    const totalRevenue = shops.reduce((sum, shop) => sum + (shop.revenueValue || 0), 0)

    const kpis = [
        { label: t('adminShops.totalShops'), value: shops.length, meta: `${activeCount} ${t('adminShops.active')}`, Icon: Store, tone: 'sapphire' },
        { label: t('adminShops.pendingApprovals'), value: pendingShops.length, meta: t('adminShops.reviewQueue'), Icon: Clock, tone: 'gold' },
        { label: t('adminShops.premiumPartners'), value: premiumCount, meta: t('adminShops.subscriptionMix'), Icon: BadgeCheck, tone: 'cyan' },
        { label: t('adminShops.suspended'), value: suspendedCount, meta: t('adminShops.riskControl'), Icon: ShieldAlert, tone: 'crimson' },
        { label: t('adminShops.revenue'), value: `${(totalRevenue / 1000000).toFixed(1)}M`, meta: t('adminShops.partnerGmv'), Icon: Wallet, tone: 'emerald' },
    ]

    const approveShop = (shop) => {
        const nextNum = Math.max(...shops.map(item => parseInt(item.id.replace(/\D/g, ''), 10) || 0)) + 1
        const newShop = {
            ...shop,
            id: `SHOP-${String(nextNum).padStart(3, '0')}`,
            rating: 0,
            reviews: 0,
            orders: 0,
            revenue: '0M',
            revenueValue: 0,
            status: 'active',
            joinDate: '2026-06-02',
            staff: 0,
            subscription: 'basic',
            openTime: '07:00',
            closeTime: '21:00',
        }
        setShops(prev => [newShop, ...prev])
        setPendingShops(prev => prev.filter(item => item.id !== shop.id))
        setSelectedShopId(newShop.id)
        toast.success(t('adminShops.shopApproved'))
    }

    const rejectShop = (shop) => {
        setPendingShops(prev => prev.filter(item => item.id !== shop.id))
        toast.success(t('adminShops.shopRejected'))
    }

    const toggleStatus = (shop) => {
        const nextStatus = shop.status === 'active' ? 'suspended' : 'active'
        setShops(prev => prev.map(item => item.id === shop.id ? { ...item, status: nextStatus } : item))
        toast.success(t('adminShops.statusUpdated'))
    }

    const reviewDocument = (doc, nextStatus) => {
        setDocumentUpdates(prev => prev.map(item => item.id === doc.id ? { ...item, status: nextStatus } : item))
        toast.success(nextStatus === 'approved' ? t('adminShops.documentApproved') : t('adminShops.documentRejected'))
    }

    const tabs = [
        { id: 'all', label: t('adminShops.allShops'), count: shops.length },
        { id: 'approvals', label: t('adminShops.pendingApprovals'), count: pendingShops.length },
        { id: 'documents', label: t('adminShops.documentUpdates'), count: documentUpdates.length },
    ]

    return (
        <div className="admin-shops-page">
            <header className="admin-shops-header">
                <div>
                    <span className="admin-shops-eyebrow">{t('adminShops.eyebrow')}</span>
                    <h1>{t('adminShops.title')}</h1>
                    <p>{t('adminShops.subtitle')}</p>
                </div>
            </header>

            <section className="admin-shops-kpis">
                {kpis.map(({ label, value, meta, Icon, tone }) => (
                    <article className={`admin-shops-kpi ${tone}`} key={label}>
                        <span>{createElement(Icon, { size: 18, strokeWidth: 1.9 })}</span>
                        <small>{label}</small>
                        <strong>{value}</strong>
                        <p>{meta}</p>
                    </article>
                ))}
            </section>

            <section className="admin-shops-tabs">
                {tabs.map(tab => (
                    <button type="button" className={activeTab === tab.id ? 'active' : ''} key={tab.id} onClick={() => setActiveTab(tab.id)}>
                        {tab.label}
                        <span>{tab.count}</span>
                    </button>
                ))}
            </section>

            {activeTab === 'all' && (
                <section className="admin-shops-workspace">
                    <article className="admin-shops-card admin-shops-table-card">
                        <div className="admin-shops-card-head">
                            <div>
                                <span className="admin-shops-eyebrow">{t('adminShops.marketplace')}</span>
                                <h2>{filteredShops.length} {t('adminShops.results')}</h2>
                            </div>
                            <label className="admin-shops-search">
                                <Search size={17} strokeWidth={1.9} />
                                <input value={searchQuery} onChange={(event) => setSearchQuery(event.target.value)} placeholder={t('adminShops.searchPlaceholder')} />
                            </label>
                        </div>
                        <div className="admin-shops-table-wrap">
                            <table className="admin-shops-table">
                                <thead>
                                    <tr>
                                        <th>{t('adminShops.shop')}</th>
                                        <th>{t('adminShops.owner')}</th>
                                        <th>{t('adminShops.district')}</th>
                                        <th>{t('adminShops.orders')}</th>
                                        <th>{t('adminShops.revenue')}</th>
                                        <th>{t('adminShops.subscription')}</th>
                                        <th>{t('adminShops.status')}</th>
                                        <th>{t('adminShops.action')}</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {filteredShops.map(shop => (
                                        <tr key={shop.id} className={selectedShop?.id === shop.id ? 'selected' : ''} onClick={() => setSelectedShopId(shop.id)}>
                                            <td>
                                                <strong>{shop.name}</strong>
                                                <small>{shop.id}</small>
                                            </td>
                                            <td>{shop.owner}</td>
                                            <td>{shop.district}</td>
                                            <td>{shop.orders.toLocaleString()}</td>
                                            <td className="money">{shop.revenue}</td>
                                            <td><span className={`admin-shops-badge ${shop.subscription}`}>{shop.subscription}</span></td>
                                            <td><span className={`admin-shops-badge ${statusKey(shop.status)}`}>{t(`adminShops.status${statusKey(shop.status)}`)}</span></td>
                                            <td>
                                                <button type="button" className="admin-shops-row-btn" onClick={(event) => { event.stopPropagation(); toggleStatus(shop) }}>
                                                    {shop.status === 'active' ? t('adminShops.suspend') : t('adminShops.activate')}
                                                </button>
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    </article>

                    <aside className="admin-shops-card admin-shops-detail">
                        {selectedShop ? (
                            <>
                                <div className="admin-shops-detail-head">
                                    <div>
                                        <span className="admin-shops-eyebrow">{t('adminShops.partnerProfile')}</span>
                                        <h2>{selectedShop.name}</h2>
                                    </div>
                                    <span className={`admin-shops-badge ${statusKey(selectedShop.status)}`}>{t(`adminShops.status${statusKey(selectedShop.status)}`)}</span>
                                </div>
                                <dl className="admin-shops-detail-grid">
                                    <div><dt>{t('adminShops.owner')}</dt><dd>{selectedShop.owner}</dd></div>
                                    <div><dt>{t('adminShops.phone')}</dt><dd>{selectedShop.ownerPhone}</dd></div>
                                    <div><dt>{t('adminShops.email')}</dt><dd>{selectedShop.ownerEmail}</dd></div>
                                    <div><dt>{t('adminShops.address')}</dt><dd>{selectedShop.location}</dd></div>
                                    <div><dt>{t('adminShops.hours')}</dt><dd>{selectedShop.openTime} - {selectedShop.closeTime}</dd></div>
                                    <div><dt>{t('adminShops.capacity')}</dt><dd>{selectedShop.machines} {t('adminShops.machines')} · {selectedShop.staff} {t('adminShops.staff')}</dd></div>
                                    <div><dt>{t('adminShops.rating')}</dt><dd>{selectedShop.rating} / 5 · {selectedShop.reviews} {t('adminShops.reviews')}</dd></div>
                                    <div><dt>{t('adminShops.joinDate')}</dt><dd>{selectedShop.joinDate}</dd></div>
                                </dl>
                            </>
                        ) : (
                            <div className="admin-shops-empty"><Store size={28} /><strong>{t('adminShops.noSelection')}</strong></div>
                        )}
                    </aside>
                </section>
            )}

            {activeTab === 'approvals' && (
                <section className="admin-shops-approval-grid">
                    {pendingShops.map(shop => (
                        <article className="admin-shops-card admin-shops-approval" key={shop.id}>
                            <div className="admin-shops-approval-head">
                                <span><Store size={18} /></span>
                                <div>
                                    <strong>{shop.name}</strong>
                                    <small>{shop.location}</small>
                                </div>
                            </div>
                            <dl>
                                <div><dt>{t('adminShops.owner')}</dt><dd>{shop.owner}</dd></div>
                                <div><dt>{t('adminShops.phone')}</dt><dd>{shop.ownerPhone}</dd></div>
                                <div><dt>{t('adminShops.machines')}</dt><dd>{shop.machines}</dd></div>
                                <div><dt>{t('adminShops.submitted')}</dt><dd>{shop.submittedDate}</dd></div>
                            </dl>
                            <div className="admin-shops-docs">
                                {shop.documents.map(doc => <span key={doc}>{doc}</span>)}
                            </div>
                            <div className="admin-shops-card-actions">
                                <button type="button" className="reject" onClick={() => rejectShop(shop)}><XCircle size={15} />{t('adminShops.reject')}</button>
                                <button type="button" className="approve" onClick={() => approveShop(shop)}><CheckCircle size={15} />{t('adminShops.approve')}</button>
                            </div>
                        </article>
                    ))}
                </section>
            )}

            {activeTab === 'documents' && (
                <section className="admin-shops-card admin-shops-table-card">
                    <div className="admin-shops-card-head">
                        <div>
                            <span className="admin-shops-eyebrow">{t('adminShops.compliance')}</span>
                            <h2>{t('adminShops.documentUpdates')}</h2>
                        </div>
                    </div>
                    <div className="admin-shops-table-wrap">
                        <table className="admin-shops-table">
                            <thead>
                                <tr>
                                    <th>{t('adminShops.shop')}</th>
                                    <th>{t('adminShops.documentType')}</th>
                                    <th>{t('adminShops.submitted')}</th>
                                    <th>{t('adminShops.expiryDate')}</th>
                                    <th>{t('adminShops.status')}</th>
                                    <th>{t('adminShops.action')}</th>
                                </tr>
                            </thead>
                            <tbody>
                                {documentUpdates.map(doc => (
                                    <tr key={doc.id}>
                                        <td><strong>{doc.shopName}</strong><small>{doc.shopId}</small></td>
                                        <td>{doc.documentType}</td>
                                        <td>{doc.submittedDate}</td>
                                        <td>{doc.expiryDate}</td>
                                        <td><span className={`admin-shops-badge ${statusKey(doc.status)}`}>{t(`adminShops.status${statusKey(doc.status)}`)}</span></td>
                                        <td>
                                            {doc.status === 'pending' ? (
                                                <div className="admin-shops-inline-actions">
                                                    <button type="button" className="reject" onClick={() => reviewDocument(doc, 'rejected')}>{t('adminShops.reject')}</button>
                                                    <button type="button" className="approve" onClick={() => reviewDocument(doc, 'approved')}>{t('adminShops.approve')}</button>
                                                </div>
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

export default AdminShopManagement
