import { useState } from 'react'
import './AdminSettings.css'
import { BellOutlined, GlobalOutlined, BgColorsOutlined, SyncOutlined, LockOutlined } from '@ant-design/icons'

function AdminSettings() {
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
    }

    return (
        <div className="admin-settings">
            <div className="admin-settings-header">
                <h1 className="admin-settings-title">Settings</h1>
                <p className="admin-settings-subtitle">Manage your preferences and configurations</p>
            </div>

            <div className="admin-settings-content">
                {/* Notifications Section */}
                <div className="admin-settings-section">
                    <div className="admin-settings-section-header">
                        <BellOutlined className="admin-settings-section-icon" />
                        <div>
                            <h3 className="admin-settings-section-title">Notifications</h3>
                            <p className="admin-settings-section-description">Control how you receive notifications</p>
                        </div>
                    </div>

                    <div className="admin-settings-item">
                        <div className="admin-settings-item-info">
                            <div className="admin-settings-item-label">Push Notifications</div>
                            <div className="admin-settings-item-description">Receive alerts for new orders and updates</div>
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
                            <div className="admin-settings-item-label">Email Notifications</div>
                            <div className="admin-settings-item-description">Get updates via email</div>
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
                            <h3 className="admin-settings-section-title">Appearance</h3>
                            <p className="admin-settings-section-description">Customize the look and feel</p>
                        </div>
                    </div>

                    <div className="admin-settings-item">
                        <div className="admin-settings-item-info">
                            <div className="admin-settings-item-label">Theme</div>
                            <div className="admin-settings-item-description">Choose your preferred theme</div>
                        </div>
                        <select 
                            className="admin-settings-select"
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
                <div className="admin-settings-section">
                    <div className="admin-settings-section-header">
                        <GlobalOutlined className="admin-settings-section-icon" />
                        <div>
                            <h3 className="admin-settings-section-title">Language & Region</h3>
                            <p className="admin-settings-section-description">Set your language preference</p>
                        </div>
                    </div>

                    <div className="admin-settings-item">
                        <div className="admin-settings-item-info">
                            <div className="admin-settings-item-label">Display Language</div>
                            <div className="admin-settings-item-description">Change the interface language</div>
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
                            <h3 className="admin-settings-section-title">Data & Sync</h3>
                            <p className="admin-settings-section-description">Manage data synchronization</p>
                        </div>
                    </div>

                    <div className="admin-settings-item">
                        <div className="admin-settings-item-info">
                            <div className="admin-settings-item-label">Auto Refresh</div>
                            <div className="admin-settings-item-description">Automatically refresh dashboard data</div>
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
                            <div className="admin-settings-item-label">Refresh Interval</div>
                            <div className="admin-settings-item-description">How often to refresh data</div>
                        </div>
                        <select className="admin-settings-select">
                            <option value="30">30 seconds</option>
                            <option value="60" selected>1 minute</option>
                            <option value="300">5 minutes</option>
                        </select>
                    </div>
                </div>

                {/* Security Section */}
                <div className="admin-settings-section">
                    <div className="admin-settings-section-header">
                        <LockOutlined className="admin-settings-section-icon" />
                        <div>
                            <h3 className="admin-settings-section-title">Security</h3>
                            <p className="admin-settings-section-description">Manage your account security</p>
                        </div>
                    </div>

                    <div className="admin-settings-item">
                        <div className="admin-settings-item-info">
                            <div className="admin-settings-item-label">Two-Factor Authentication</div>
                            <div className="admin-settings-item-description">Add an extra layer of security</div>
                        </div>
                        <button className="admin-settings-button">Enable</button>
                    </div>

                    <div className="admin-settings-item">
                        <div className="admin-settings-item-info">
                            <div className="admin-settings-item-label">Change Password</div>
                            <div className="admin-settings-item-description">Update your account password</div>
                        </div>
                        <button className="admin-settings-button">Change</button>
                    </div>
                </div>
            </div>
        </div>
    )
}

export default AdminSettings
