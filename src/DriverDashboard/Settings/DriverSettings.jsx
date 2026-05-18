import { useState } from 'react'
import { useLocation, useNavigate } from 'react-router-dom'
import {
    Settings,
    User,
    Bike,
    Calendar,
    Bell,
    Lock,
    CreditCard,
    Smartphone,
    ChevronRight,
    Save,
    Edit2,
    CheckCircle2,
    AlertCircle,
} from 'lucide-react'
import { driverSettings } from '../../data/index'
import { useTranslation, localizePath } from '../../shared/lib/i18n'
import './DriverSettings.css'

/* ──────────────────────────────────────────────
   Section definitions (sidebar nav)
   ────────────────────────────────────────────── */
const SECTIONS = [
    { id: 'profile', labelKey: 'profile.myProfile', icon: User },
    { id: 'vehicle', labelKey: 'admin.shipperManagement.table.vehicle', icon: Bike },
    { id: 'schedule', labelKey: 'driver.settings.workSchedule', icon: Calendar },
    { id: 'notifications', labelKey: 'notifications.title', icon: Bell },
    { id: 'privacy', labelKey: 'profile.privacy', icon: Lock },
    { id: 'payment', labelKey: 'payment.paymentMethod', icon: CreditCard },
    { id: 'app', labelKey: 'driver.settings.appPreferences', icon: Smartphone },
]

/* ──────────────────────────────────────────────
   Small reusable primitives
   ────────────────────────────────────────────── */
function FieldRow({ label, children }) {
    return (
        <div className="ds-field-row">
            <label className="ds-field-label">{label}</label>
            <div className="ds-field-value">{children}</div>
        </div>
    )
}

function Toggle({ checked, onChange }) {
    return (
        <button
            type="button"
            role="switch"
            aria-checked={checked}
            className={`ds-toggle${checked ? ' ds-toggle-on' : ''}`}
            onClick={() => onChange(!checked)}
        >
            <span className="ds-toggle-thumb" />
        </button>
    )
}

function SectionCard({ title, icon: Icon, children, onSave, saving }) {
    const { t } = useTranslation()
    return (
        <div className="ds-section-card">
            <div className="ds-section-head">
                <span className="ds-section-icon"><Icon size={17} /></span>
                <h2 className="ds-section-title">{title}</h2>
                {onSave && (
                    <button
                        className={`ds-save-btn${saving ? ' ds-save-saving' : ''}`}
                        onClick={onSave}
                        disabled={saving}
                    >
                        {saving
                            ? <><CheckCircle2 size={14} /> {t('shop.saved')}</>
                            : <><Save size={14} /> {t('common.save')}</>
                        }
                    </button>
                )}
            </div>
            <div className="ds-section-body">{children}</div>
        </div>
    )
}

/* ──────────────────────────────────────────────
   Section: Profile
   ────────────────────────────────────────────── */
function ProfileSection({ data, onSave, saving }) {
    const { t } = useTranslation()
    const [form, setForm] = useState({ ...data })
    const set = (k, v) => setForm(f => ({ ...f, [k]: v }))

    return (
        <SectionCard title={t('profile.myProfile')} icon={User} onSave={() => onSave(form)} saving={saving}>
            <FieldRow label={t('profile.name')}>
                <input
                    className="ds-input"
                    value={form.name}
                    onChange={e => set('name', e.target.value)}
                />
            </FieldRow>
            <FieldRow label={t('profile.phone')}>
                <input
                    className="ds-input"
                    value={form.phone}
                    onChange={e => set('phone', e.target.value)}
                />
            </FieldRow>
            <FieldRow label={t('auth.email')}>
                <input
                    className="ds-input"
                    type="email"
                    value={form.email}
                    onChange={e => set('email', e.target.value)}
                />
            </FieldRow>
            <FieldRow label={t('profile.address')}>
                <input
                    className="ds-input"
                    value={form.address}
                    onChange={e => set('address', e.target.value)}
                />
            </FieldRow>
        </SectionCard>
    )
}

/* ──────────────────────────────────────────────
   Section: Vehicle
   ────────────────────────────────────────────── */
function VehicleSection({ data, onSave, saving }) {
    const { t } = useTranslation()
    const [form, setForm] = useState({ ...data })
    const set = (k, v) => setForm(f => ({ ...f, [k]: v }))

    const regExpiry = new Date(form.registrationExpiry)
    const insExpiry = new Date(form.insuranceExpiry)
    const now = new Date()
    const regWarning = (regExpiry - now) / (1000 * 60 * 60 * 24) < 60
    const insWarning = (insExpiry - now) / (1000 * 60 * 60 * 24) < 60

    return (
        <SectionCard title={t('admin.shipperManagement.table.vehicle')} icon={Bike} onSave={() => onSave(form)} saving={saving}>
            <FieldRow label={t('admin.shipperManagement.fields.vehicleType')}>
                <select className="ds-input ds-select" value={form.type} onChange={e => set('type', e.target.value)}>
                    <option value="Motorbike">{t('admin.shipperManagement.vehicleType.Motorbike')}</option>
                    <option value="Car">{t('admin.shipperManagement.vehicleType.Car')}</option>
                    <option value="Bicycle">{t('driver.settings.vehicleType.Bicycle')}</option>
                </select>
            </FieldRow>
            <FieldRow label={t('driver.settings.brand')}>
                <input className="ds-input" value={form.brand} onChange={e => set('brand', e.target.value)} />
            </FieldRow>
            <FieldRow label={t('driver.settings.model')}>
                <input className="ds-input" value={form.model} onChange={e => set('model', e.target.value)} />
            </FieldRow>
            <FieldRow label={t('driver.settings.year')}>
                <input className="ds-input" type="number" value={form.year} onChange={e => set('year', +e.target.value)} />
            </FieldRow>
            <FieldRow label={t('admin.shipperManagement.fields.licensePlate')}>
                <input className="ds-input ds-monospace" value={form.licensePlate} onChange={e => set('licensePlate', e.target.value)} />
            </FieldRow>
            <FieldRow label={t('driver.settings.registrationExpiry')}>
                <div className="ds-expiry-row">
                    <input className="ds-input" type="date" value={form.registrationExpiry} onChange={e => set('registrationExpiry', e.target.value)} />
                    {regWarning && <span className="ds-expiry-warn"><AlertCircle size={14} /> {t('driver.settings.expiringSoon')}</span>}
                </div>
            </FieldRow>
            <FieldRow label={t('driver.settings.insuranceExpiry')}>
                <div className="ds-expiry-row">
                    <input className="ds-input" type="date" value={form.insuranceExpiry} onChange={e => set('insuranceExpiry', e.target.value)} />
                    {insWarning && <span className="ds-expiry-warn"><AlertCircle size={14} /> {t('driver.settings.expiringSoon')}</span>}
                </div>
            </FieldRow>
        </SectionCard>
    )
}

/* ──────────────────────────────────────────────
   Section: Work Schedule
   ────────────────────────────────────────────── */
const ALL_DAYS = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday']

function ScheduleSection({ data, onSave, saving }) {
    const { t } = useTranslation()
    const [form, setForm] = useState({ ...data, workDays: [...data.workDays] })

    function toggleDay(day) {
        setForm(f => ({
            ...f,
            workDays: f.workDays.includes(day)
                ? f.workDays.filter(d => d !== day)
                : [...f.workDays, day],
        }))
    }

    return (
        <SectionCard title={t('driver.settings.workSchedule')} icon={Calendar} onSave={() => onSave(form)} saving={saving}>
            <FieldRow label={t('driver.settings.workDays')}>
                <div className="ds-day-chips">
                    {ALL_DAYS.map(d => (
                        <button
                            key={d}
                            type="button"
                            className={`ds-day-chip${form.workDays.includes(d) ? ' ds-day-active' : ''}`}
                            onClick={() => toggleDay(d)}
                        >
                            {t(`driver.settings.days.${d}`)}
                        </button>
                    ))}
                </div>
            </FieldRow>
            <FieldRow label={t('driver.settings.startTime')}>
                <input className="ds-input ds-input-sm" type="time" value={form.startTime}
                    onChange={e => setForm(f => ({ ...f, startTime: e.target.value }))} />
            </FieldRow>
            <FieldRow label={t('driver.settings.endTime')}>
                <input className="ds-input ds-input-sm" type="time" value={form.endTime}
                    onChange={e => setForm(f => ({ ...f, endTime: e.target.value }))} />
            </FieldRow>
            <FieldRow label={t('driver.settings.breakTime')}>
                <input className="ds-input ds-input-sm" value={form.breakTime}
                    onChange={e => setForm(f => ({ ...f, breakTime: e.target.value }))} />
            </FieldRow>
            <FieldRow label={t('driver.settings.maxTasksPerDay')}>
                <input className="ds-input ds-input-sm" type="number" min="1" max="30"
                    value={form.maxTasksPerDay}
                    onChange={e => setForm(f => ({ ...f, maxTasksPerDay: +e.target.value }))} />
            </FieldRow>
        </SectionCard>
    )
}

/* ──────────────────────────────────────────────
   Section: Notifications
   ────────────────────────────────────────────── */
function NotifSection({ data, onSave, saving }) {
    const { t } = useTranslation()
    const [form, setForm] = useState({ ...data })
    const toggle = k => setForm(f => ({ ...f, [k]: !f[k] }))

    const channels = [
        { key: 'pushEnabled', label: t('shop.pushNotifications') },
        { key: 'smsEnabled', label: t('driver.settings.smsNotifications') },
        { key: 'emailEnabled', label: t('shop.emailNotifications') },
    ]
    const alerts = [
        { key: 'newTaskAlert', label: t('driver.settings.newTaskAssigned') },
        { key: 'earningsUpdate', label: t('driver.settings.earningsUpdated') },
        { key: 'ratingReceived', label: t('driver.settings.ratingReceived') },
        { key: 'scheduleReminder', label: t('driver.settings.scheduleReminder') },
    ]

    return (
        <SectionCard title={t('notifications.title')} icon={Bell} onSave={() => onSave(form)} saving={saving}>
            <p className="ds-group-label">{t('driver.settings.channels')}</p>
            {channels.map(({ key, label }) => (
                <FieldRow key={key} label={label}>
                    <Toggle checked={form[key]} onChange={() => toggle(key)} />
                </FieldRow>
            ))}

            <p className="ds-group-label" style={{ marginTop: 20 }}>{t('driver.settings.alertTypes')}</p>
            {alerts.map(({ key, label }) => (
                <FieldRow key={key} label={label}>
                    <Toggle checked={form[key]} onChange={() => toggle(key)} />
                </FieldRow>
            ))}

            <FieldRow label={t('driver.settings.reminderMinutesBefore')}>
                <input className="ds-input ds-input-sm" type="number" min="5" max="120"
                    value={form.reminderMinutesBefore}
                    onChange={e => setForm(f => ({ ...f, reminderMinutesBefore: +e.target.value }))} />
            </FieldRow>
        </SectionCard>
    )
}

/* ──────────────────────────────────────────────
   Section: Privacy
   ────────────────────────────────────────────── */
function PrivacySection({ data, onSave, saving }) {
    const { t } = useTranslation()
    const [form, setForm] = useState({ ...data })
    const toggle = k => setForm(f => ({ ...f, [k]: !f[k] }))

    return (
        <SectionCard title={t('profile.privacy')} icon={Lock} onSave={() => onSave(form)} saving={saving}>
            <FieldRow label={t('driver.settings.showPhoneToCustomer')}>
                <Toggle checked={form.showPhoneToCustomer} onChange={() => toggle('showPhoneToCustomer')} />
            </FieldRow>
            <FieldRow label={t('driver.settings.showRatingPublicly')}>
                <Toggle checked={form.showRatingPublicly} onChange={() => toggle('showRatingPublicly')} />
            </FieldRow>
            <FieldRow label={t('driver.settings.allowLocationTracking')}>
                <Toggle checked={form.locationTracking} onChange={() => toggle('locationTracking')} />
            </FieldRow>
        </SectionCard>
    )
}

/* ──────────────────────────────────────────────
   Section: Payment
   ────────────────────────────────────────────── */
function PaymentSection({ data, onSave, saving }) {
    const { t } = useTranslation()
    const [form, setForm] = useState({ ...data })
    const set = (k, v) => setForm(f => ({ ...f, [k]: v }))

    return (
        <SectionCard title={t('payment.paymentMethod')} icon={CreditCard} onSave={() => onSave(form)} saving={saving}>
            <FieldRow label={t('driver.profile.bank')}>
                <input className="ds-input" value={form.bank} onChange={e => set('bank', e.target.value)} />
            </FieldRow>
            <FieldRow label={t('driver.profile.accountNo')}>
                <input className="ds-input ds-monospace" value={form.accountNumber} onChange={e => set('accountNumber', e.target.value)} />
            </FieldRow>
            <FieldRow label={t('driver.settings.accountName')}>
                <input className="ds-input" value={form.accountName} onChange={e => set('accountName', e.target.value)} />
            </FieldRow>
            <FieldRow label={t('driver.settings.payoutCycle')}>
                <select className="ds-input ds-select" value={form.payoutCycle} onChange={e => set('payoutCycle', e.target.value)}>
                    <option value="weekly">{t('driver.settings.payout.weekly')}</option>
                    <option value="bi-weekly">{t('driver.settings.payout.biweekly')}</option>
                    <option value="monthly">{t('driver.settings.payout.monthly')}</option>
                </select>
            </FieldRow>
        </SectionCard>
    )
}

/* ──────────────────────────────────────────────
   Section: App Preferences
   ────────────────────────────────────────────── */
function AppSection({ data, onSave, saving, onLanguageChange }) {
    const { t } = useTranslation()
    const [form, setForm] = useState({ ...data })
    const set = (k, v) => setForm(f => ({ ...f, [k]: v }))

    return (
        <SectionCard title={t('driver.settings.appPreferences')} icon={Smartphone} onSave={() => onSave(form)} saving={saving}>
            <FieldRow label={t('profile.language')}>
                <select
                    className="ds-input ds-select"
                    value={form.language}
                    onChange={e => {
                        set('language', e.target.value)
                        onLanguageChange(e.target.value)
                    }}
                >
                    <option value="en">English</option>
                    <option value="vi">Tiếng Việt</option>
                </select>
            </FieldRow>
            <FieldRow label={t('shop.theme')}>
                <select className="ds-input ds-select" value={form.theme} onChange={e => set('theme', e.target.value)}>
                    <option value="light">{t('shop.light')}</option>
                    <option value="dark">{t('shop.dark')}</option>
                    <option value="system">{t('dashboard.system')}</option>
                </select>
            </FieldRow>
            <FieldRow label={t('driver.settings.mapProvider')}>
                <select className="ds-input ds-select" value={form.mapProvider} onChange={e => set('mapProvider', e.target.value)}>
                    <option value="google">Google Maps</option>
                    <option value="openstreetmap">OpenStreetMap</option>
                </select>
            </FieldRow>
            <FieldRow label={t('driver.settings.navigationApp')}>
                <select className="ds-input ds-select" value={form.navigationApp} onChange={e => set('navigationApp', e.target.value)}>
                    <option value="google_maps">Google Maps</option>
                    <option value="waze">Waze</option>
                    <option value="apple_maps">Apple Maps</option>
                </select>
            </FieldRow>
        </SectionCard>
    )
}

/* ──────────────────────────────────────────────
   Main Component
   ────────────────────────────────────────────── */
export default function DriverSettings() {
    const navigate = useNavigate()
    const location = useLocation()
    const { changeLanguage, t } = useTranslation()
    const [activeSection, setActiveSection] = useState('profile')
    const [savedSection, setSavedSection] = useState(null)

    const s = driverSettings

    function handleSave(section) {
        setSavedSection(section)
        setTimeout(() => setSavedSection(null), 2000)
    }

    function handleLanguageChange(language) {
        changeLanguage(language)
        navigate(`${localizePath(location.pathname, language)}${location.search}${location.hash}`)
    }

    const sectionProps = (id) => ({
        onSave: () => handleSave(id),
        saving: savedSection === id,
    })

    return (
        <div className="ds-page">

            {/* ── Page header ── */}
            <div className="ds-page-header">
                <div className="ds-title-wrap">
                    <Settings size={22} className="ds-title-icon" />
                    <div>
                        <h1 className="ds-page-title">{t('dashboard.accountSettings')}</h1>
                        <p className="ds-page-subtitle">{t('driver.settings.subtitle')}</p>
                    </div>
                </div>
            </div>

            <div className="ds-layout">

                {/* ── Sidebar nav ── */}
                <nav className="ds-nav">
                    {SECTIONS.map(sec => {
                        const Icon = sec.icon
                        return (
                            <button
                                key={sec.id}
                                className={`ds-nav-item${activeSection === sec.id ? ' ds-nav-active' : ''}`}
                                onClick={() => setActiveSection(sec.id)}
                            >
                                <Icon size={16} />
                                <span>{t(sec.labelKey)}</span>
                                <ChevronRight size={14} className="ds-nav-arrow" />
                            </button>
                        )
                    })}
                </nav>

                {/* ── Content panel ── */}
                <div className="ds-content">
                    {activeSection === 'profile' && <ProfileSection data={s.profile}       {...sectionProps('profile')} />}
                    {activeSection === 'vehicle' && <VehicleSection data={s.vehicle}       {...sectionProps('vehicle')} />}
                    {activeSection === 'schedule' && <ScheduleSection data={s.workSchedule}  {...sectionProps('schedule')} />}
                    {activeSection === 'notifications' && <NotifSection data={s.notifications} {...sectionProps('notifications')} />}
                    {activeSection === 'privacy' && <PrivacySection data={s.privacy}       {...sectionProps('privacy')} />}
                    {activeSection === 'payment' && <PaymentSection data={s.payment}       {...sectionProps('payment')} />}
                    {activeSection === 'app' && <AppSection data={s.app} onLanguageChange={handleLanguageChange} {...sectionProps('app')} />}
                </div>

            </div>
        </div>
    )
}
