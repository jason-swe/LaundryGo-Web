import { useState, useEffect } from 'react'
import './ShopSettings.css'
import { Bell, Globe, Palette, RefreshCw, Lock, Save, ImagePlus, Trash2 } from 'lucide-react'
import { settings as settingsData } from '../../data'
import { loadData, saveData } from '../../utils/dataManager'
import toast from '../../utils/toast'

const LOCAL_PREVIEW_MESSAGE = 'Shop settings API is not available yet. Preferences are saved only in this browser.'

const DEFAULT_SETTINGS = {
    notifications: settingsData.notifications.pushNotifications,
    emailNotifications: settingsData.notifications.emailNotifications,
    autoRefresh: true,
    refreshInterval: '60',
    language: settingsData.appearance.language,
    theme: settingsData.appearance.theme,
    shopImage: ''
}

function ShopSettings() {
    const [settings, setSettings] = useState(
        () => loadData('SETTINGS', DEFAULT_SETTINGS)
    )
    const [saved, setSaved] = useState(false)

    useEffect(() => {
        saveData('SETTINGS', settings)
    }, [settings])

    const handleToggle = (key) => {
        setSettings(prev => ({ ...prev, [key]: !prev[key] }))
        setSaved(false)
    }

    const handleSelect = (key, value) => {
        setSettings(prev => ({ ...prev, [key]: value }))
        setSaved(false)
    }

    const handleShopImageUpload = (event) => {
        const file = event.target.files?.[0]
        if (!file) return

        if (!file.type.startsWith('image/')) {
            toast.error('Please select an image file')
            return
        }

        const reader = new FileReader()
        reader.onload = () => {
            setSettings(prev => ({ ...prev, shopImage: reader.result }))
            setSaved(false)
        }
        reader.readAsDataURL(file)
    }

    const handleRemoveShopImage = () => {
        setSettings(prev => ({ ...prev, shopImage: '' }))
        setSaved(false)
    }

    const handleSaveAll = () => {
        saveData('SETTINGS', settings)
        setSaved(true)
        toast.info(LOCAL_PREVIEW_MESSAGE)
        setTimeout(() => setSaved(false), 2000)
    }

    const handleReset = () => {
        setSettings(DEFAULT_SETTINGS)
        toast.info(`Settings reset locally. ${LOCAL_PREVIEW_MESSAGE}`)
    }

    const showUnavailable = () => {
        toast.info('This security action is not connected to a backend endpoint yet.')
    }

    return (
        <div className="shop-settings">
            <div className="shop-settings-header">
                <div>
                    <h1 className="shop-settings-title">Settings</h1>
                    <p className="shop-settings-subtitle">Manage your preferences and configurations</p>
                </div>
                <div className="shop-settings-header-actions">
                    <button className="shop-settings-reset-btn" onClick={handleReset}>Reset defaults</button>
                    <button className={`shop-settings-save-btn${saved ? ' saved' : ''}`} onClick={handleSaveAll}>
                        <Save size={16} /> {saved ? 'Saved!' : 'Save changes'}
                    </button>
                </div>
            </div>

            <div className="shop-settings-api-notice">
                {LOCAL_PREVIEW_MESSAGE}
            </div>

            <div className="shop-settings-content">
                {/* Shop Profile Section */}
                <div className="shop-settings-section">
                    <div className="shop-settings-section-header">
                        <ImagePlus className="shop-settings-section-icon" size={20} />
                        <div>
                            <h3 className="shop-settings-section-title">Shop Profile</h3>
                            <p className="shop-settings-section-description">Upload an image for your shop profile or cover</p>
                        </div>
                    </div>

                    <div className="shop-settings-image-grid">
                        <div className="shop-settings-image-preview">
                            {settings.shopImage ? (
                                <img src={settings.shopImage} alt="Shop preview" className="shop-settings-preview-img" />
                            ) : (
                                <div className="shop-settings-preview-placeholder">
                                    <ImagePlus size={28} />
                                    <span>No image uploaded yet</span>
                                </div>
                            )}
                        </div>

                        <div className="shop-settings-image-actions">
                            <label className="shop-settings-upload-btn">
                                <input type="file" accept="image/*" onChange={handleShopImageUpload} />
                                <ImagePlus size={16} /> Upload image
                            </label>
                            <p className="shop-settings-image-note">Recommended: JPG or PNG, landscape ratio for a clean shop banner.</p>
                            {settings.shopImage && (
                                <button className="shop-settings-remove-btn" onClick={handleRemoveShopImage}>
                                    <Trash2 size={16} /> Remove image
                                </button>
                            )}
                        </div>
                    </div>
                </div>

                {/* Notifications Section */}
                <div className="shop-settings-section">
                    <div className="shop-settings-section-header">
                        <Bell className="shop-settings-section-icon" size={20} />
                        <div>
                            <h3 className="shop-settings-section-title">Notifications</h3>
                            <p className="shop-settings-section-description">Control how you receive notifications</p>
                        </div>
                    </div>

                    <div className="shop-settings-item">
                        <div className="shop-settings-item-info">
                            <div className="shop-settings-item-label">Push Notifications</div>
                            <div className="shop-settings-item-description">Receive alerts for new orders and updates</div>
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
                            <div className="shop-settings-item-label">Email Notifications</div>
                            <div className="shop-settings-item-description">Get updates via email</div>
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
                            <h3 className="shop-settings-section-title">Appearance</h3>
                            <p className="shop-settings-section-description">Customize the look and feel</p>
                        </div>
                    </div>

                    <div className="shop-settings-item">
                        <div className="shop-settings-item-info">
                            <div className="shop-settings-item-label">Theme</div>
                            <div className="shop-settings-item-description">Choose your preferred theme</div>
                        </div>
                        <select
                            className="shop-settings-select"
                            value={settings.theme}
                            onChange={(e) => handleSelect('theme', e.target.value)}
                        >
                            <option value="light">Light</option>
                            <option value="dark">Dark</option>
                            <option value="auto">Auto</option>
                        </select>
                    </div>
                </div>

                {/* Language Section */}
                <div className="shop-settings-section">
                    <div className="shop-settings-section-header">
                        <Globe className="shop-settings-section-icon" size={20} />
                        <div>
                            <h3 className="shop-settings-section-title">Language & Region</h3>
                            <p className="shop-settings-section-description">Set your language preference</p>
                        </div>
                    </div>

                    <div className="shop-settings-item">
                        <div className="shop-settings-item-info">
                            <div className="shop-settings-item-label">Display Language</div>
                            <div className="shop-settings-item-description">Change the interface language</div>
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
                            <h3 className="shop-settings-section-title">Data & Sync</h3>
                            <p className="shop-settings-section-description">Manage data synchronization</p>
                        </div>
                    </div>

                    <div className="shop-settings-item">
                        <div className="shop-settings-item-info">
                            <div className="shop-settings-item-label">Auto Refresh</div>
                            <div className="shop-settings-item-description">Automatically refresh dashboard data</div>
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
                            <div className="shop-settings-item-label">Refresh Interval</div>
                            <div className="shop-settings-item-description">How often to refresh data</div>
                        </div>
                        <select
                            className="shop-settings-select"
                            value={settings.refreshInterval}
                            onChange={(e) => handleSelect('refreshInterval', e.target.value)}
                        >
                            <option value="30">30 seconds</option>
                            <option value="60">1 minute</option>
                            <option value="300">5 minutes</option>
                        </select>
                    </div>
                </div>

                {/* Security Section */}
                <div className="shop-settings-section">
                    <div className="shop-settings-section-header">
                        <Lock className="shop-settings-section-icon" size={20} />
                        <div>
                            <h3 className="shop-settings-section-title">Security</h3>
                            <p className="shop-settings-section-description">Manage your account security</p>
                        </div>
                    </div>

                    <div className="shop-settings-item">
                        <div className="shop-settings-item-info">
                            <div className="shop-settings-item-label">Two-Factor Authentication</div>
                            <div className="shop-settings-item-description">Add an extra layer of security</div>
                        </div>
                        <button className="shop-settings-button" onClick={showUnavailable}>Enable</button>
                    </div>

                    <div className="shop-settings-item">
                        <div className="shop-settings-item-info">
                            <div className="shop-settings-item-label">Change Password</div>
                            <div className="shop-settings-item-description">Update your account password</div>
                        </div>
                        <button className="shop-settings-button" onClick={showUnavailable}>Change</button>
                    </div>
                </div>
            </div>
        </div>
    )
}

export default ShopSettings
