import { useState } from 'react'
import './Settings.css'

function Settings() {
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
        <div className="settings-page">
            <div className="settings-header">
                <h1 className="settings-title">Cài đặt</h1>
                <p className="settings-subtitle">Quản lý tùy chọn và cấu hình của bạn</p>
            </div>

            <div className="settings-content">
                {/* Notifications Section */}
                <div className="settings-section">
                    <div className="settings-section-header">
                        <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
                            <path d="M12 22c1.1 0 2-.9 2-2h-4c0 1.1.89 2 2 2zm6-6v-5c0-3.07-1.64-5.64-4.5-6.32V4c0-.83-.67-1.5-1.5-1.5s-1.5.67-1.5 1.5v.68C7.63 5.36 6 7.92 6 11v5l-2 2v1h16v-1l-2-2z" fill="currentColor" />
                        </svg>
                        <div>
                            <h3 className="settings-section-title">Thông báo</h3>
                            <p className="settings-section-description">Kiểm soát cách bạn nhận thông báo</p>
                        </div>
                    </div>

                    <div className="settings-item">
                        <div className="settings-item-info">
                            <div className="settings-item-label">Thông báo đẩy</div>
                            <div className="settings-item-description">Nhận cảnh báo về đơn hàng mới và cập nhật</div>
                        </div>
                        <label className="settings-toggle">
                            <input
                                type="checkbox"
                                checked={settings.notifications}
                                onChange={() => handleToggle('notifications')}
                            />
                            <span className="settings-toggle-slider"></span>
                        </label>
                    </div>

                    <div className="settings-item">
                        <div className="settings-item-info">
                            <div className="settings-item-label">Thông báo qua Email</div>
                            <div className="settings-item-description">Nhận cập nhật qua email</div>
                        </div>
                        <label className="settings-toggle">
                            <input type="checkbox" defaultChecked />
                            <span className="settings-toggle-slider"></span>
                        </label>
                    </div>
                </div>

                {/* Appearance Section */}
                <div className="settings-section">
                    <div className="settings-section-header">
                        <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
                            <path d="M12 3c-4.97 0-9 4.03-9 9s4.03 9 9 9c.83 0 1.5-.67 1.5-1.5 0-.39-.15-.74-.39-1.01-.23-.26-.38-.61-.38-.99 0-.83.67-1.5 1.5-1.5H16c2.76 0 5-2.24 5-5 0-4.42-4.03-8-9-8zm-5.5 9c-.83 0-1.5-.67-1.5-1.5S5.67 9 6.5 9 8 9.67 8 10.5 7.33 12 6.5 12zm3-4C8.67 8 8 7.33 8 6.5S8.67 5 9.5 5s1.5.67 1.5 1.5S10.33 8 9.5 8zm5 0c-.83 0-1.5-.67-1.5-1.5S13.67 5 14.5 5s1.5.67 1.5 1.5S15.33 8 14.5 8zm3 4c-.83 0-1.5-.67-1.5-1.5S16.67 9 17.5 9s1.5.67 1.5 1.5-.67 1.5-1.5 1.5z" fill="currentColor" />
                        </svg>
                        <div>
                            <h3 className="settings-section-title">Giao diện</h3>
                            <p className="settings-section-description">Tùy chỉnh giao diện hiển thị</p>
                        </div>
                    </div>

                    <div className="settings-item">
                        <div className="settings-item-info">
                            <div className="settings-item-label">Chủ đề</div>
                            <div className="settings-item-description">Chọn chủ đề hiển thị</div>
                        </div>
                        <select
                            className="settings-select"
                            value={settings.theme}
                            onChange={(e) => handleSelect('theme', e.target.value)}
                        >
                            <option value="light">Sáng</option>
                            <option value="dark">Tối</option>
                            <option value="auto">Tự động</option>
                        </select>
                    </div>
                </div>

                {/* Language Section */}
                <div className="settings-section">
                    <div className="settings-section-header">
                        <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
                            <path d="M11.99 2C6.47 2 2 6.48 2 12s4.47 10 9.99 10C17.52 22 22 17.52 22 12S17.52 2 11.99 2zm6.93 6h-2.95a15.65 15.65 0 0 0-1.38-3.56A8.03 8.03 0 0 1 18.92 8zM12 4.04c.83 1.2 1.48 2.53 1.91 3.96h-3.82c.43-1.43 1.08-2.76 1.91-3.96zM4.26 14C4.1 13.36 4 12.69 4 12s.1-1.36.26-2h3.38c-.08.66-.14 1.32-.14 2 0 .68.06 1.34.14 2H4.26zm.82 2h2.95c.32 1.25.78 2.45 1.38 3.56A7.987 7.987 0 0 1 5.08 16zm2.95-8H5.08a7.987 7.987 0 0 1 4.33-3.56A15.65 15.65 0 0 0 8.03 8zM12 19.96c-.83-1.2-1.48-2.53-1.91-3.96h3.82c-.43 1.43-1.08 2.76-1.91 3.96zM14.34 14H9.66c-.09-.66-.16-1.32-.16-2 0-.68.07-1.35.16-2h4.68c.09.65.16 1.32.16 2 0 .68-.07 1.34-.16 2zm.25 5.56c.6-1.11 1.06-2.31 1.38-3.56h2.95a8.03 8.03 0 0 1-4.33 3.56zM16.36 14c.08-.66.14-1.32.14-2 0-.68-.06-1.34-.14-2h3.38c.16.64.26 1.31.26 2s-.1 1.36-.26 2h-3.38z" fill="currentColor" />
                        </svg>
                        <div>
                            <h3 className="settings-section-title">Ngôn ngữ</h3>
                            <p className="settings-section-description">Đặt ngôn ngữ hiển thị</p>
                        </div>
                    </div>

                    <div className="settings-item">
                        <div className="settings-item-info">
                            <div className="settings-item-label">Ngôn ngữ hiển thị</div>
                            <div className="settings-item-description">Thay đổi ngôn ngữ giao diện</div>
                        </div>
                        <select
                            className="settings-select"
                            value={settings.language}
                            onChange={(e) => handleSelect('language', e.target.value)}
                        >
                            <option value="vi">Tiếng Việt</option>
                            <option value="en">English</option>
                        </select>
                    </div>
                </div>

                {/* Data & Sync Section */}
                <div className="settings-section">
                    <div className="settings-section-header">
                        <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
                            <path d="M12 4V1L8 5l4 4V6c3.31 0 6 2.69 6 6 0 1.01-.25 1.97-.7 2.8l1.46 1.46A7.93 7.93 0 0 0 20 12c0-4.42-3.58-8-8-8zm0 14c-3.31 0-6-2.69-6-6 0-1.01.25-1.97.7-2.8L5.24 7.74A7.93 7.93 0 0 0 4 12c0 4.42 3.58 8 8 8v3l4-4-4-4v3z" fill="currentColor" />
                        </svg>
                        <div>
                            <h3 className="settings-section-title">Dữ liệu & Đồng bộ</h3>
                            <p className="settings-section-description">Quản lý đồng bộ dữ liệu</p>
                        </div>
                    </div>

                    <div className="settings-item">
                        <div className="settings-item-info">
                            <div className="settings-item-label">Tự động làm mới</div>
                            <div className="settings-item-description">Tự động làm mới dữ liệu dashboard</div>
                        </div>
                        <label className="settings-toggle">
                            <input
                                type="checkbox"
                                checked={settings.autoRefresh}
                                onChange={() => handleToggle('autoRefresh')}
                            />
                            <span className="settings-toggle-slider"></span>
                        </label>
                    </div>

                    <div className="settings-item">
                        <div className="settings-item-info">
                            <div className="settings-item-label">Khoảng thời gian làm mới</div>
                            <div className="settings-item-description">Tần suất làm mới dữ liệu</div>
                        </div>
                        <select className="settings-select">
                            <option value="30">30 giây</option>
                            <option value="60" selected>1 phút</option>
                            <option value="300">5 phút</option>
                        </select>
                    </div>
                </div>
            </div>
        </div>
    )
}

export default Settings
