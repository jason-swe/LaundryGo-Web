import { useEffect, useState } from 'react'
import { useLocation, useNavigate } from 'react-router-dom'
import './AdminSettings.css'
import { BellOutlined, GlobalOutlined, BgColorsOutlined, SyncOutlined, LockOutlined } from '@ant-design/icons'
import { useTranslation, localizePath } from '../../shared/lib/i18n'

function AdminSettings() {
    const navigate = useNavigate()
    const location = useLocation()
    const { language, changeLanguage, t } = useTranslation()
    const [settings, setSettings] = useState({
        notifications: true,
        autoRefresh: true,
        language: 'vi',
        theme: 'light'
    })

    const handleToggle = (key) => {
        setSettings(prev => ({
            ...prev,
            [key]: !prev[key]
        }))
    }

    const handleSelect = (key, value) => {
        setSettings(prev => ({
            ...prev,
            [key]: value
        }))
        if (key === 'language') {
            changeLanguage(value)
            navigate(`${localizePath(location.pathname, value)}${location.search}${location.hash}`)
        }
    }

    useEffect(() => {
        setSettings(prev => prev.language === language ? prev : { ...prev, language })
    }, [language])

    return (
        <div className="admin-settings">
            <div className="admin-settings-header">
                <h1 className="admin-settings-title">{t('shop.settingsTitle')}</h1>
                <p className="admin-settings-subtitle">{t('shop.settingsSubtitle')}</p>
            </div>

            <div className="admin-settings-content">
                {/* Notifications Section */}
                <div className="admin-settings-section">
                    <div className="admin-settings-section-header">
                        <BellOutlined className="admin-settings-section-icon" />
                        <div>
                            <h3 className="admin-settings-section-title">{t('shop.notificationsTitle')}</h3>
                            <p className="admin-settings-section-description">{t('shop.notificationsDesc')}</p>
                        </div>
                    </div>

                    <div className="admin-settings-item">
                        <div className="admin-settings-item-info">
                            <div className="admin-settings-item-label">{t('shop.pushNotifications')}</div>
                            <div className="admin-settings-item-description">{t('shop.pushNotificationsDesc')}</div>
                        </div>
                        <label className="admin-settings-toggle">
                            <input 
                                type="checkbox" 
                                checked={settings.notifications}
                                onChange={() => handleToggle('notifications')}
                            />
                            <span className="admin-settings-toggle-slider"></span>
                        </label>
                    </div>

                    <div className="admin-settings-item">
                        <div className="admin-settings-item-info">
                            <div className="admin-settings-item-label">{t('shop.emailNotifications')}</div>
                            <div className="admin-settings-item-description">{t('shop.emailNotificationsDesc')}</div>
                        </div>
                        <label className="admin-settings-toggle">
                            <input type="checkbox" defaultChecked />
                            <span className="admin-settings-toggle-slider"></span>
                        </label>
                    </div>
                </div>

                {/* Appearance Section */}
                <div className="admin-settings-section">
                    <div className="admin-settings-section-header">
                        <BgColorsOutlined className="admin-settings-section-icon" />
                        <div>
                            <h3 className="admin-settings-section-title">{t('shop.appearance')}</h3>
                            <p className="admin-settings-section-description">{t('shop.appearanceDesc')}</p>
                        </div>
                    </div>

                    <div className="admin-settings-item">
                        <div className="admin-settings-item-info">
                            <div className="admin-settings-item-label">{t('shop.theme')}</div>
                            <div className="admin-settings-item-description">{t('shop.themeDesc')}</div>
                        </div>
                        <select 
                            className="admin-settings-select"
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
                <div className="admin-settings-section">
                    <div className="admin-settings-section-header">
                        <GlobalOutlined className="admin-settings-section-icon" />
                        <div>
                            <h3 className="admin-settings-section-title">{t('shop.languageRegion')}</h3>
                            <p className="admin-settings-section-description">{t('shop.languageRegionDesc')}</p>
                        </div>
                    </div>

                    <div className="admin-settings-item">
                        <div className="admin-settings-item-info">
                            <div className="admin-settings-item-label">{t('shop.displayLanguage')}</div>
                            <div className="admin-settings-item-description">{t('shop.displayLanguageDesc')}</div>
                        </div>
                        <select 
                            className="admin-settings-select"
                            value={settings.language}
                            onChange={(e) => handleSelect('language', e.target.value)}
                        >
                            <option value="vi">Tiếng Việt</option>
                            <option value="en">English</option>
                        </select>
                    </div>
                </div>

                {/* Data & Sync Section */}
                <div className="admin-settings-section">
                    <div className="admin-settings-section-header">
                        <SyncOutlined className="admin-settings-section-icon" />
                        <div>
                            <h3 className="admin-settings-section-title">{t('shop.dataSync')}</h3>
                            <p className="admin-settings-section-description">{t('shop.dataSyncDesc')}</p>
                        </div>
                    </div>

                    <div className="admin-settings-item">
                        <div className="admin-settings-item-info">
                            <div className="admin-settings-item-label">{t('shop.autoRefresh')}</div>
                            <div className="admin-settings-item-description">{t('shop.autoRefreshDesc')}</div>
                        </div>
                        <label className="admin-settings-toggle">
                            <input 
                                type="checkbox" 
                                checked={settings.autoRefresh}
                                onChange={() => handleToggle('autoRefresh')}
                            />
                            <span className="admin-settings-toggle-slider"></span>
                        </label>
                    </div>

                    <div className="admin-settings-item">
                        <div className="admin-settings-item-info">
                            <div className="admin-settings-item-label">{t('shop.refreshInterval')}</div>
                            <div className="admin-settings-item-description">{t('shop.refreshIntervalDesc')}</div>
                        </div>
                        <select className="admin-settings-select">
                            <option value="30">{t('shop.seconds30')}</option>
                            <option value="60">{t('shop.minute1')}</option>
                            <option value="300">{t('shop.minutes5')}</option>
                        </select>
                    </div>
                </div>

                {/* Security Section */}
                <div className="admin-settings-section">
                    <div className="admin-settings-section-header">
                        <LockOutlined className="admin-settings-section-icon" />
                        <div>
                            <h3 className="admin-settings-section-title">{t('shop.security')}</h3>
                            <p className="admin-settings-section-description">{t('shop.securityDesc')}</p>
                        </div>
                    </div>

                    <div className="admin-settings-item">
                        <div className="admin-settings-item-info">
                            <div className="admin-settings-item-label">{t('shop.twoFactor')}</div>
                            <div className="admin-settings-item-description">{t('shop.twoFactorDesc')}</div>
                        </div>
                        <button className="admin-settings-button">{t('shop.enable')}</button>
                    </div>

                    <div className="admin-settings-item">
                        <div className="admin-settings-item-info">
                            <div className="admin-settings-item-label">{t('shop.changePassword')}</div>
                            <div className="admin-settings-item-description">{t('shop.changePasswordDesc')}</div>
                        </div>
                        <button className="admin-settings-button">{t('common.change')}</button>
                    </div>
                </div>
            </div>
        </div>
    )
}

export default AdminSettings
