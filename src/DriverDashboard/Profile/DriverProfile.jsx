import {
    User,
    Phone,
    Mail,
    MapPin,
    Calendar,
    CreditCard,
    Star,
    Truck,
    DollarSign,
    ShieldCheck,
    Store,
    TrendingUp,
    Award,
    PhoneCall,
    BarChart2,
    Clock,
} from 'lucide-react'
import { driverProfile, driverPerformance } from '../../data/index'
import { useTranslation } from '../../shared/lib/i18n'
import './DriverProfile.css'

/* ──────────────────────────────────────────────
   Helpers
   ────────────────────────────────────────────── */
function fmt(n) {
    return new Intl.NumberFormat('vi-VN').format(n) + 'đ'
}

function fmtDate(str, language) {
    if (!str) return '—'
    const d = new Date(str)
    return d.toLocaleDateString(language === 'vi' ? 'vi-VN' : 'en-US', { day: '2-digit', month: 'short', year: 'numeric' })
}

function StatBar({ label, value, color }) {
    return (
        <div className="dp-stat-bar-row">
            <div className="dp-stat-bar-top">
                <span className="dp-stat-bar-label">{label}</span>
                <span className="dp-stat-bar-value">{value}%</span>
            </div>
            <div className="dp-stat-bar-track">
                <div className="dp-stat-bar-fill" style={{ width: `${value}%`, background: color }} />
            </div>
        </div>
    )
}

/* ──────────────────────────────────────────────
   Main Component
   ────────────────────────────────────────────── */
export default function DriverProfile() {
    const { language, t } = useTranslation()
    const p = driverProfile
    const perf = driverPerformance

    return (
        <div className="dp-page">

            {/* ══ Hero card ══ */}
            <div className="dp-hero">
                <div className="dp-hero-bg" />
                <div className="dp-hero-content">
                    <div className="dp-avatar">
                        <User size={44} />
                    </div>
                    <div className="dp-hero-info">
                        <h1 className="dp-hero-name">{p.name}</h1>
                        <div className="dp-hero-badges">
                            <span className="dp-badge dp-badge-status">
                                <span className="dp-online-dot" />
                                {t('admin.shopManagement.status.active')}
                            </span>
                            <span className="dp-badge dp-badge-award">
                                <Award size={13} />
                                {p.badge}
                            </span>
                            <span className="dp-badge dp-badge-rank">
                                #{perf.rank} / {perf.totalRank} {t('driver.profile.drivers')}
                            </span>
                        </div>
                    </div>

                    <div className="dp-hero-stats">
                        <div className="dp-hero-stat">
                            <Star size={18} fill="#f59e0b" color="#f59e0b" />
                            <div>
                                <div className="dp-hero-stat-val">{p.rating}</div>
                                <div className="dp-hero-stat-lbl">{t('shops.rating')}</div>
                            </div>
                        </div>
                        <div className="dp-hero-stat">
                            <Truck size={18} />
                            <div>
                                <div className="dp-hero-stat-val">{p.totalDeliveries}</div>
                                <div className="dp-hero-stat-lbl">{t('driver.overview.trips')}</div>
                            </div>
                        </div>
                        <div className="dp-hero-stat">
                            <DollarSign size={18} />
                            <div>
                                <div className="dp-hero-stat-val">{fmt(p.totalEarnings)}</div>
                                <div className="dp-hero-stat-lbl">{t('driver.profile.totalEarned')}</div>
                            </div>
                        </div>
                        <div className="dp-hero-stat">
                            <Clock size={18} />
                            <div>
                                <div className="dp-hero-stat-val">{perf.avgDeliveriesPerDay}</div>
                                <div className="dp-hero-stat-lbl">{t('driver.profile.tripsPerDay')}</div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            {/* ══ Two-column content ══ */}
            <div className="dp-grid">

                {/* ─── Left column ─── */}
                <div className="dp-col">

                    {/* Personal info */}
                    <div className="dp-card">
                        <div className="dp-card-head">
                            <User size={16} />
                            <span>{t('profile.personalInfo')}</span>
                        </div>
                        <div className="dp-info-list">
                            <div className="dp-info-row">
                                <span className="dp-info-label"><Phone size={13} /> {t('shop.phone')}</span>
                                <span className="dp-info-value">{p.phone}</span>
                            </div>
                            <div className="dp-info-row">
                                <span className="dp-info-label"><Mail size={13} /> {t('auth.email')}</span>
                                <span className="dp-info-value">{p.email}</span>
                            </div>
                            <div className="dp-info-row">
                                <span className="dp-info-label"><MapPin size={13} /> {t('profile.address')}</span>
                                <span className="dp-info-value">{p.address}</span>
                            </div>
                            <div className="dp-info-row">
                                <span className="dp-info-label"><Calendar size={13} /> {t('admin.shipperManagement.fields.birthDate')}</span>
                                <span className="dp-info-value">{fmtDate(p.birthDate, language)}</span>
                            </div>
                            <div className="dp-info-row">
                                <span className="dp-info-label"><ShieldCheck size={13} /> {t('admin.shipperManagement.fields.identityCard')}</span>
                                <span className="dp-info-value dp-mono">{p.identityCard}</span>
                            </div>
                            <div className="dp-info-row">
                                <span className="dp-info-label"><Calendar size={13} /> {t('driver.profile.joined')}</span>
                                <span className="dp-info-value">{fmtDate(p.joinDate, language)}</span>
                            </div>
                        </div>
                    </div>

                    {/* Vehicle */}
                    <div className="dp-card">
                        <div className="dp-card-head">
                            <Truck size={16} />
                            <span>{t('admin.shipperManagement.table.vehicle')}</span>
                        </div>
                        <div className="dp-info-list">
                            <div className="dp-info-row">
                                <span className="dp-info-label">{t('shop.documents.detail.type')}</span>
                                <span className="dp-info-value">{t(`admin.shipperManagement.vehicleType.${p.vehicleType}`)}</span>
                            </div>
                            <div className="dp-info-row">
                                <span className="dp-info-label"><CreditCard size={13} /> {t('admin.shipperManagement.fields.licensePlate')}</span>
                                <span className="dp-info-value dp-mono dp-plate">{p.licensePlate}</span>
                            </div>
                        </div>
                    </div>

                    {/* Bank */}
                    <div className="dp-card">
                        <div className="dp-card-head">
                            <CreditCard size={16} />
                            <span>{t('driver.profile.bankAccount')}</span>
                        </div>
                        <div className="dp-info-list">
                            <div className="dp-info-row">
                                <span className="dp-info-label">{t('driver.profile.bank')}</span>
                                <span className="dp-info-value">{p.bankAccount.bank}</span>
                            </div>
                            <div className="dp-info-row">
                                <span className="dp-info-label">{t('driver.profile.accountNo')}</span>
                                <span className="dp-info-value dp-mono">{'•'.repeat(6) + p.bankAccount.accountNumber.slice(-4)}</span>
                            </div>
                            <div className="dp-info-row">
                                <span className="dp-info-label">{t('profile.name')}</span>
                                <span className="dp-info-value">{p.bankAccount.accountName}</span>
                            </div>
                        </div>
                    </div>

                    {/* Emergency contact */}
                    <div className="dp-card">
                        <div className="dp-card-head">
                            <PhoneCall size={16} />
                            <span>{t('driver.profile.emergencyContact')}</span>
                        </div>
                        <div className="dp-info-list">
                            <div className="dp-info-row">
                                <span className="dp-info-label">{t('profile.name')}</span>
                                <span className="dp-info-value">{p.emergencyContact.name}</span>
                            </div>
                            <div className="dp-info-row">
                                <span className="dp-info-label">{t('shop.phone')}</span>
                                <span className="dp-info-value">{p.emergencyContact.phone}</span>
                            </div>
                            <div className="dp-info-row">
                                <span className="dp-info-label">{t('driver.profile.relationship')}</span>
                                <span className="dp-info-value">{p.emergencyContact.relationship}</span>
                            </div>
                        </div>
                    </div>

                </div>

                {/* ─── Right column ─── */}
                <div className="dp-col">

                    {/* Performance */}
                    <div className="dp-card">
                        <div className="dp-card-head">
                            <TrendingUp size={16} />
                            <span>{t('driver.overview.performance')}</span>
                        </div>
                        <div className="dp-perf-body">
                            <StatBar label={t('driver.overview.performanceLabels.completionRate')} value={perf.completionRate} color="#2563eb" />
                            <StatBar label={t('driver.profile.onTimeRate')} value={perf.onTimeRate} color="#2dd4bf" />
                            <StatBar label={t('driver.overview.performanceLabels.customerSatisfaction')} value={perf.satisfactionRate} color="#f59e0b" />
                        </div>
                        <div className="dp-perf-extras">
                            <div className="dp-perf-extra">
                                <BarChart2 size={15} />
                                <span>{t('driver.profile.cancelRate')}: <strong>{perf.cancelRate}%</strong></span>
                            </div>
                            <div className="dp-perf-extra">
                                <Calendar size={15} />
                                <span>{t('driver.profile.bestDay')}: <strong>{perf.bestDay}</strong></span>
                            </div>
                        </div>
                    </div>

                    {/* Assigned shop */}
                    <div className="dp-card">
                        <div className="dp-card-head">
                            <Store size={16} />
                            <span>{t('driver.profile.assignedShop')}</span>
                        </div>
                        <div className="dp-info-list">
                            <div className="dp-info-row">
                                <span className="dp-info-label">{t('dashboard.partner')}</span>
                                <span className="dp-info-value dp-shop-name">{p.assignedShop.name}</span>
                            </div>
                            <div className="dp-info-row">
                                <span className="dp-info-label"><MapPin size={13} /> {t('profile.address')}</span>
                                <span className="dp-info-value">{p.assignedShop.address}</span>
                            </div>
                            <div className="dp-info-row">
                                <span className="dp-info-label"><Phone size={13} /> {t('shop.phone')}</span>
                                <span className="dp-info-value">{p.assignedShop.phone}</span>
                            </div>
                        </div>
                    </div>

                    {/* Working areas */}
                    <div className="dp-card">
                        <div className="dp-card-head">
                            <MapPin size={16} />
                            <span>{t('driver.profile.workingAreas')}</span>
                        </div>
                        <div className="dp-areas">
                            {p.workingArea.map(area => (
                                <span key={area} className="dp-area-chip">{area}</span>
                            ))}
                        </div>
                    </div>

                </div>
            </div>
        </div>
    )
}
