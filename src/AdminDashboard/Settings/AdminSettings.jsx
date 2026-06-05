import { createElement, useMemo, useState } from 'react'
import {
    Bell,
    Building2,
    CheckCircle,
    Globe2,
    KeyRound,
    Link2,
    Mail,
    RefreshCw,
    Save,
    ShieldCheck,
    SlidersHorizontal,
    X,
} from 'lucide-react'
import './AdminSettings.css'
import toast from '../../utils/toast'
import { useTranslation } from '../../shared/lib/i18n'

const DEFAULT_SETTINGS = {
    platformName: 'LaundryGo',
    supportEmail: 'ops@laundrygo.vn',
    region: 'VN-HCM',
    language: 'vi',
    notifications: true,
    emailDigest: true,
    autoRefresh: true,
    refreshInterval: '60',
    twoFactorRequired: false,
    sessionTimeout: '30',
    payoutApproval: true,
    complaintSla: '24',
    maintenanceMode: false,
    paymentGateway: 'sandbox',
    webhookUrl: 'https://api.laundrygo.vn/webhooks/admin',
}

function AdminSettings() {
    const { t } = useTranslation()
    const [settings, setSettings] = useState(DEFAULT_SETTINGS)
    const [savedSettings, setSavedSettings] = useState(DEFAULT_SETTINGS)
    const [errors, setErrors] = useState({})
    const [confirmSave, setConfirmSave] = useState(false)

    const dirty = useMemo(() => JSON.stringify(settings) !== JSON.stringify(savedSettings), [settings, savedSettings])
    const riskyChange = settings.twoFactorRequired !== savedSettings.twoFactorRequired ||
        settings.maintenanceMode !== savedSettings.maintenanceMode ||
        settings.payoutApproval !== savedSettings.payoutApproval ||
        settings.paymentGateway !== savedSettings.paymentGateway

    const updateSetting = (key, value) => {
        setSettings(prev => ({ ...prev, [key]: value }))
        setErrors(prev => ({ ...prev, [key]: undefined }))
    }

    const validate = () => {
        const nextErrors = {}
        if (!settings.platformName.trim()) nextErrors.platformName = t('adminSettings.required')
        if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(settings.supportEmail)) nextErrors.supportEmail = t('adminSettings.emailInvalid')
        if (!settings.webhookUrl.startsWith('https://')) nextErrors.webhookUrl = t('adminSettings.webhookInvalid')
        if (Number(settings.complaintSla) < 1) nextErrors.complaintSla = t('adminSettings.slaInvalid')
        setErrors(nextErrors)
        return Object.keys(nextErrors).length === 0
    }

    const requestSave = () => {
        if (!validate()) return
        if (riskyChange) {
            setConfirmSave(true)
            return
        }
        commitSave()
    }

    const commitSave = () => {
        setSavedSettings({ ...settings })
        setConfirmSave(false)
        toast.success(t('adminSettings.saved'))
    }

    const resetSettings = () => {
        setSettings({ ...savedSettings })
        setErrors({})
        toast.success(t('adminSettings.resetDone'))
    }

    const sections = [
        {
            key: 'platform',
            Icon: Building2,
            fields: (
                <>
                    <label>{t('adminSettings.platformName')}<input value={settings.platformName} onChange={event => updateSetting('platformName', event.target.value)} />{errors.platformName && <small>{errors.platformName}</small>}</label>
                    <label>{t('adminSettings.supportEmail')}<input value={settings.supportEmail} onChange={event => updateSetting('supportEmail', event.target.value)} />{errors.supportEmail && <small>{errors.supportEmail}</small>}</label>
                    <label>{t('adminSettings.region')}<select value={settings.region} onChange={event => updateSetting('region', event.target.value)}><option value="VN-HCM">{t('adminSettings.regionHcm')}</option><option value="VN-HN">{t('adminSettings.regionHn')}</option><option value="VN-DN">{t('adminSettings.regionDn')}</option></select></label>
                    <label>{t('adminSettings.language')}<select value={settings.language} onChange={event => updateSetting('language', event.target.value)}><option value="vi">{t('adminSettings.languageVi')}</option><option value="en">{t('adminSettings.languageEn')}</option></select></label>
                </>
            ),
        },
        {
            key: 'notifications',
            Icon: Bell,
            fields: (
                <>
                    <SettingToggle label={t('adminSettings.pushNotifications')} description={t('adminSettings.pushCopy')} checked={settings.notifications} onChange={() => updateSetting('notifications', !settings.notifications)} />
                    <SettingToggle label={t('adminSettings.emailDigest')} description={t('adminSettings.emailDigestCopy')} checked={settings.emailDigest} onChange={() => updateSetting('emailDigest', !settings.emailDigest)} />
                    <label>{t('adminSettings.supportMailbox')}<input value={settings.supportEmail} onChange={event => updateSetting('supportEmail', event.target.value)} />{errors.supportEmail && <small>{errors.supportEmail}</small>}</label>
                </>
            ),
        },
        {
            key: 'operations',
            Icon: RefreshCw,
            fields: (
                <>
                    <SettingToggle label={t('adminSettings.autoRefresh')} description={t('adminSettings.autoRefreshCopy')} checked={settings.autoRefresh} onChange={() => updateSetting('autoRefresh', !settings.autoRefresh)} />
                    <label>{t('adminSettings.refreshInterval')}<select value={settings.refreshInterval} onChange={event => updateSetting('refreshInterval', event.target.value)}><option value="30">{t('adminSettings.interval30')}</option><option value="60">{t('adminSettings.interval60')}</option><option value="300">{t('adminSettings.interval300')}</option></select></label>
                    <label>{t('adminSettings.complaintSla')}<input type="number" min="1" value={settings.complaintSla} onChange={event => updateSetting('complaintSla', event.target.value)} />{errors.complaintSla && <small>{errors.complaintSla}</small>}</label>
                </>
            ),
        },
        {
            key: 'security',
            Icon: ShieldCheck,
            fields: (
                <>
                    <SettingToggle label={t('adminSettings.twoFactor')} description={t('adminSettings.twoFactorCopy')} checked={settings.twoFactorRequired} onChange={() => updateSetting('twoFactorRequired', !settings.twoFactorRequired)} />
                    <SettingToggle label={t('adminSettings.payoutApproval')} description={t('adminSettings.payoutApprovalCopy')} checked={settings.payoutApproval} onChange={() => updateSetting('payoutApproval', !settings.payoutApproval)} />
                    <label>{t('adminSettings.sessionTimeout')}<select value={settings.sessionTimeout} onChange={event => updateSetting('sessionTimeout', event.target.value)}><option value="15">{t('adminSettings.timeout15')}</option><option value="30">{t('adminSettings.timeout30')}</option><option value="60">{t('adminSettings.timeout60')}</option></select></label>
                </>
            ),
        },
        {
            key: 'integrations',
            Icon: Link2,
            fields: (
                <>
                    <label>{t('adminSettings.paymentGateway')}<select value={settings.paymentGateway} onChange={event => updateSetting('paymentGateway', event.target.value)}><option value="sandbox">{t('adminSettings.gatewaySandbox')}</option><option value="live">{t('adminSettings.gatewayLive')}</option></select></label>
                    <label className="full">{t('adminSettings.webhookUrl')}<input value={settings.webhookUrl} onChange={event => updateSetting('webhookUrl', event.target.value)} />{errors.webhookUrl && <small>{errors.webhookUrl}</small>}</label>
                    <SettingToggle label={t('adminSettings.maintenanceMode')} description={t('adminSettings.maintenanceCopy')} checked={settings.maintenanceMode} onChange={() => updateSetting('maintenanceMode', !settings.maintenanceMode)} />
                </>
            ),
        },
    ]

    return (
        <div className="admin-settings-page">
            <header className="admin-settings-header">
                <div>
                    <span className="admin-settings-eyebrow">{t('adminSettings.eyebrow')}</span>
                    <h1>{t('adminSettings.title')}</h1>
                    <p>{t('adminSettings.subtitle')}</p>
                </div>
                <span className={`admin-settings-state ${dirty ? 'dirty' : 'saved'}`}>
                    {dirty ? <SlidersHorizontal size={16} /> : <CheckCircle size={16} />}
                    {dirty ? t('adminSettings.unsaved') : t('adminSettings.savedState')}
                </span>
            </header>

            <section className="admin-settings-workspace">
                <aside className="admin-settings-rail">
                    <div className="admin-settings-summary">
                        <article><Globe2 size={18} /><small>{t('adminSettings.region')}</small><strong>{settings.region}</strong></article>
                        <article><Mail size={18} /><small>{t('adminSettings.supportEmail')}</small><strong>{settings.supportEmail}</strong></article>
                        <article><KeyRound size={18} /><small>{t('adminSettings.sessionTimeout')}</small><strong>{settings.sessionTimeout} {t('adminSettings.minutesShort')}</strong></article>
                    </div>
                    <nav className="admin-settings-nav" aria-label={t('adminSettings.sectionNav')}>
                        <span>{t('adminSettings.sectionNav')}</span>
                        {sections.map(({ key, Icon }) => (
                            <a href={`#admin-settings-${key}`} key={key}>
                                {createElement(Icon, { size: 16 })}
                                {t(`adminSettings.section.${key}.title`)}
                            </a>
                        ))}
                    </nav>
                </aside>

                <div className="admin-settings-grid">
                    {sections.map(({ key, Icon, fields }) => (
                        <article className="admin-settings-card" id={`admin-settings-${key}`} key={key}>
                            <div className="admin-settings-card-head">
                                <span>{createElement(Icon, { size: 18 })}</span>
                                <div>
                                    <h2>{t(`adminSettings.section.${key}.title`)}</h2>
                                    <p>{t(`adminSettings.section.${key}.copy`)}</p>
                                </div>
                            </div>
                            <div className="admin-settings-fields">{fields}</div>
                        </article>
                    ))}
                </div>
            </section>

            <div className={`admin-settings-savebar ${dirty ? 'show' : ''}`}>
                <div>
                    <strong>{t('adminSettings.saveTitle')}</strong>
                    <span>{riskyChange ? t('adminSettings.riskySaveCopy') : t('adminSettings.saveCopy')}</span>
                </div>
                <button type="button" onClick={resetSettings}>{t('adminSettings.reset')}</button>
                <button type="button" className="primary" onClick={requestSave}><Save size={16} />{t('adminSettings.save')}</button>
            </div>

            {confirmSave && (
                <div className="admin-settings-modal-backdrop" onClick={() => setConfirmSave(false)}>
                    <div className="admin-settings-modal" onClick={event => event.stopPropagation()}>
                        <div className="admin-settings-modal-head">
                            <h2>{t('adminSettings.confirmTitle')}</h2>
                            <button type="button" onClick={() => setConfirmSave(false)} aria-label={t('common.close')}><X size={18} /></button>
                        </div>
                        <div className="admin-settings-confirm">
                            <ShieldCheck size={30} />
                            <p>{t('adminSettings.confirmCopy')}</p>
                        </div>
                        <div className="admin-settings-modal-actions">
                            <button type="button" onClick={() => setConfirmSave(false)}>{t('common.cancel')}</button>
                            <button type="button" className="primary" onClick={commitSave}>{t('adminSettings.confirmSave')}</button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    )
}

function SettingToggle({ label, description, checked, onChange }) {
    return (
        <div className="admin-settings-toggle-row">
            <div>
                <strong>{label}</strong>
                <span>{description}</span>
            </div>
            <label className="admin-settings-toggle">
                <input type="checkbox" checked={checked} onChange={onChange} />
                <span />
            </label>
        </div>
    )
}

export default AdminSettings
