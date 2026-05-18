import { useState, useEffect } from 'react'
import { useLocation, useNavigate } from 'react-router-dom'
import './ShopSettings.css'
import { Bell, Globe, Palette, RefreshCw, Lock, Save } from 'lucide-react'
import { settings as settingsData } from '../../data'
import { loadData, saveData } from '../../utils/dataManager'
import toast from '../../utils/toast'
import { useTranslation, localizePath } from '../../shared/lib/i18n'

const DEFAULT_SETTINGS = {
    notifications: settingsData.notifications.pushNotifications,
    emailNotifications: settingsData.notifications.emailNotifications,
    autoRefresh: true,
    refreshInterval: '60',
    language: settingsData.appearance.language,
    theme: settingsData.appearance.theme
}

function ShopSettings() {
    const navigate = useNavigate()
    const location = useLocation()
    const { language, changeLanguage, t } = useTranslation()
    const [settings, setSettings] = useState(
        () => loadData('SETTINGS', DEFAULT_SETTINGS)
    )
    const [saved, setSaved] = useState(false)

    useEffect(() => {
        saveData('SETTINGS', settings)
    }, [settings])

    useEffect(() => {
        setSettings(prev => prev.language === language ? prev : { ...prev, language })
    }, [language])

    const handleToggle = (key) => {
        setSettings(prev => ({ ...prev, [key]: !prev[key] }))
        setSaved(false)
    }

    const handleSelect = (key, value) => {
        setSettings(prev => ({ ...prev, [key]: value }))
        if (key === 'language') {
            changeLanguage(value)
            navigate(`${localizePath(location.pathname, value)}${location.search}${location.hash}`)
        }
        setSaved(false)
    }

    const handleSaveAll = () => {
        saveData('SETTINGS', settings)
        setSaved(true)
        toast.success(t('shop.settingsSaved'))
        setTimeout(() => setSaved(false), 2000)
    }

    const handleReset = () => {
        setSettings(DEFAULT_SETTINGS)
        toast.info(t('shop.settingsReset'))
    }

    return (
        <div className="shop-settings">
            <div className="shop-settings-header">
                <div>
                    <h1 className="shop-settings-title">{t('shop.settingsTitle')}</h1>
                    <p className="shop-settings-subtitle">{t('shop.settingsSubtitle')}</p>
                </div>
                <div className="shop-settings-header-actions">
                    <button className="shop-settings-reset-btn" onClick={handleReset}>{t('shop.resetDefaults')}</button>
                    <button className={`shop-settings-save-btn${saved ? ' saved' : ''}`} onClick={handleSaveAll}>
                        <Save size={16} /> {saved ? t('shop.saved') : t('shop.saveChanges')}
                    </button>
                </div>
            </div>

            <div className="shop-settings-content">
                {/* Notifications Section */}
                <div className="shop-settings-section">
                    <div className="shop-settings-section-header">
                        <Bell className="shop-settings-section-icon" size={20} />
                        <div>
                            <h3 className="shop-settings-section-title">{t('shop.notificationsTitle')}</h3>
                            <p className="shop-settings-section-description">{t('shop.notificationsDesc')}</p>
                        </div>
                    </div>

                    <div className="shop-settings-item">
                        <div className="shop-settings-item-info">
                            <div className="shop-settings-item-label">{t('shop.pushNotifications')}</div>
                            <div className="shop-settings-item-description">{t('shop.pushNotificationsDesc')}</div>
                        </div>
                        <label className="shop-settings-toggle">
                            <input
                                type="checkbox"
                                checked={settings.notifications}
                                onChange={() => handleToggle('notifications')}
                            />
                            <span className="shop-settings-toggle-slider"></span>
                        </label>
                    </div>

                    <div className="shop-settings-item">
                        <div className="shop-settings-item-info">
                            <div className="shop-settings-item-label">{t('shop.emailNotifications')}</div>
                            <div className="shop-settings-item-description">{t('shop.emailNotificationsDesc')}</div>
                        </div>
                        <label className="shop-settings-toggle">
                            <input
                                type="checkbox"
                                checked={settings.emailNotifications}
                                onChange={() => handleToggle('emailNotifications')}
                            />
                            <span className="shop-settings-toggle-slider"></span>
                        </label>
                    </div>
                </div>

                {/* Appearance Section */}
                <div className="shop-settings-section">
                    <div className="shop-settings-section-header">
                        <Palette className="shop-settings-section-icon" size={20} />
                        <div>
                            <h3 className="shop-settings-section-title">{t('shop.appearance')}</h3>
                            <p className="shop-settings-section-description">{t('shop.appearanceDesc')}</p>
                        </div>
                    </div>

                    <div className="shop-settings-item">
                        <div className="shop-settings-item-info">
                            <div className="shop-settings-item-label">{t('shop.theme')}</div>
                            <div className="shop-settings-item-description">{t('shop.themeDesc')}</div>
                        </div>
                        <select
                            className="shop-settings-select"
                            value={settings.theme}
                            onChange={(e) => handleSelect('theme', e.target.value)}
                        >
                            <option value="light">{t('shop.light')}</option>
                            <option value="dark">{t('shop.dark')}</option>
                            <option value="auto">{t('shop.auto')}</option>
                        </select>
                    </div>
                </div>

                {/* Language Section */}
                <div className="shop-settings-section">
                    <div className="shop-settings-section-header">
                        <Globe className="shop-settings-section-icon" size={20} />
                        <div>
                            <h3 className="shop-settings-section-title">{t('shop.languageRegion')}</h3>
                            <p className="shop-settings-section-description">{t('shop.languageRegionDesc')}</p>
                        </div>
                    </div>

                    <div className="shop-settings-item">
                        <div className="shop-settings-item-info">
                            <div className="shop-settings-item-label">{t('shop.displayLanguage')}</div>
                            <div className="shop-settings-item-description">{t('shop.displayLanguageDesc')}</div>
                        </div>
                        <select
                            className="shop-settings-select"
                            value={settings.language}
                            onChange={(e) => handleSelect('language', e.target.value)}
                        >
                            <option value="vi">Tiếng Việt</option>
                            <option value="en">English</option>
                        </select>
                    </div>
                </div>

                {/* Data & Sync Section */}
                <div className="shop-settings-section">
                    <div className="shop-settings-section-header">
                        <RefreshCw className="shop-settings-section-icon" size={20} />
                        <div>
                            <h3 className="shop-settings-section-title">{t('shop.dataSync')}</h3>
                            <p className="shop-settings-section-description">{t('shop.dataSyncDesc')}</p>
                        </div>
                    </div>

                    <div className="shop-settings-item">
                        <div className="shop-settings-item-info">
                            <div className="shop-settings-item-label">{t('shop.autoRefresh')}</div>
                            <div className="shop-settings-item-description">{t('shop.autoRefreshDesc')}</div>
                        </div>
                        <label className="shop-settings-toggle">
                            <input
                                type="checkbox"
                                checked={settings.autoRefresh}
                                onChange={() => handleToggle('autoRefresh')}
                            />
                            <span className="shop-settings-toggle-slider"></span>
                        </label>
                    </div>

                    <div className="shop-settings-item">
                        <div className="shop-settings-item-info">
                            <div className="shop-settings-item-label">{t('shop.refreshInterval')}</div>
                            <div className="shop-settings-item-description">{t('shop.refreshIntervalDesc')}</div>
                        </div>
                        <select
                            className="shop-settings-select"
                            value={settings.refreshInterval}
                            onChange={(e) => handleSelect('refreshInterval', e.target.value)}
                        >
                            <option value="30">{t('shop.seconds30')}</option>
                            <option value="60">{t('shop.minute1')}</option>
                            <option value="300">{t('shop.minutes5')}</option>
                        </select>
                    </div>
                </div>

                {/* Security Section */}
                <div className="shop-settings-section">
                    <div className="shop-settings-section-header">
                        <Lock className="shop-settings-section-icon" size={20} />
                        <div>
                            <h3 className="shop-settings-section-title">{t('shop.security')}</h3>
                            <p className="shop-settings-section-description">{t('shop.securityDesc')}</p>
                        </div>
                    </div>

                    <div className="shop-settings-item">
                        <div className="shop-settings-item-info">
                            <div className="shop-settings-item-label">{t('shop.twoFactor')}</div>
                            <div className="shop-settings-item-description">{t('shop.twoFactorDesc')}</div>
                        </div>
                        <button className="shop-settings-button">{t('shop.enable')}</button>
                    </div>

                    <div className="shop-settings-item">
                        <div className="shop-settings-item-info">
                            <div className="shop-settings-item-label">{t('shop.changePassword')}</div>
                            <div className="shop-settings-item-description">{t('shop.changePasswordDesc')}</div>
                        </div>
                        <button className="shop-settings-button">{t('common.change')}</button>
                    </div>
                </div>
            </div>
        </div>
    )
}

export default ShopSettings
