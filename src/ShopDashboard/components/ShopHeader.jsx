import './ShopHeader.css'
import { Search, Bell, User, Menu, LogOut, Plus, Activity, Building2, Mail, Phone, MapPin, Clock, Gauge, BadgeCheck, Settings2, X } from 'lucide-react'
import { useState, useRef, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { useTranslation, localizePath } from '../../shared/lib/i18n'
import LanguageSwitcher from '../../shared/ui/LanguageSwitcher/LanguageSwitcher'
import { logout } from '../../utils/auth'
import { settings as settingsData } from '../../data'

function ShopHeader({ onNotificationClick, onMenuClick, notificationCount = 0 }) {
    const [showProfileMenu, setShowProfileMenu] = useState(false)
    const [showProfileDrawer, setShowProfileDrawer] = useState(false)
    const dropdownRef = useRef(null)
    const navigate = useNavigate()
    const { language, t } = useTranslation()
    const shop = settingsData.shop

    useEffect(() => {
        const handler = (e) => {
            if (dropdownRef.current && !dropdownRef.current.contains(e.target)) {
                setShowProfileMenu(false)
            }
        }
        document.addEventListener('mousedown', handler)
        return () => document.removeEventListener('mousedown', handler)
    }, [])

    const handleLogout = () => {
        try {
            logout()
        } catch {
            // ignore storage errors
        }
        setShowProfileMenu(false)
        navigate(localizePath('/login', language), { replace: true })
    }

    const handleOpenProfile = () => {
        setShowProfileMenu(false)
        setShowProfileDrawer(true)
    }

    const handleEditSettings = () => {
        setShowProfileDrawer(false)
        navigate(localizePath('/shop/settings', language))
    }

    return (
        <header className="shop-header">
            <div className="shop-header-left">
                <button className="shop-header-menu-btn" onClick={onMenuClick} aria-label={t('dashboard.menu')}>
                    <Menu size={20} />
                </button>

                <div className="shop-header-title-block">
                    <span className="shop-header-kicker">{t('shopShell.commandCenter')}</span>
                    <strong>{t('shopShell.todayOps')}</strong>
                </div>

                <div className="shop-header-search">
                    <Search className="shop-header-search-icon" size={16} />
                    <input
                        type="text"
                        className="shop-header-search-input"
                        placeholder={t('dashboard.searchPlaceholder')}
                    />
                </div>
            </div>

            <div className="shop-header-actions">
                <button className="shop-header-quick-btn" type="button">
                    <Plus size={16} strokeWidth={1.9} />
                    {t('shopShell.newOrder')}
                </button>

                <div className="shop-header-health">
                    <Activity size={15} strokeWidth={1.9} />
                    {t('shopShell.open')}
                </div>

                <LanguageSwitcher />

                <button
                    className="shop-header-notification-btn"
                    onClick={onNotificationClick}
                    aria-label={t('dashboard.notifications')}
                >
                    <Bell className="shop-header-notification-icon" size={20} />
                    {notificationCount > 0 && (
                        <span className="shop-header-notification-badge">
                            {notificationCount > 99 ? '99+' : notificationCount}
                        </span>
                    )}
                </button>

                <div className="shop-header-profile" ref={dropdownRef}>
                    <button
                        className="shop-header-profile-btn"
                        onClick={() => setShowProfileMenu(!showProfileMenu)}
                        aria-label={t('dashboard.profile')}
                    >
                        <User className="shop-header-profile-icon" size={20} />
                    </button>

                    {showProfileMenu && (
                        <div className="shop-header-profile-dropdown">
                            <button className="shop-header-profile-option" onClick={handleOpenProfile}>
                                <User size={16} />
                                <span>{t('dashboard.profile')}</span>
                            </button>
                            <button className="shop-header-profile-option logout" onClick={handleLogout}>
                                <LogOut size={16} />
                                <span>{t('dashboard.logout')}</span>
                            </button>
                        </div>
                    )}
                </div>
            </div>

            {showProfileDrawer && (
                <div className="shop-profile-drawer-backdrop" onClick={() => setShowProfileDrawer(false)}>
                    <aside className="shop-profile-drawer" onClick={(event) => event.stopPropagation()} aria-label={t('shopProfile.title')}>
                        <div className="shop-profile-drawer-head">
                            <div className="shop-profile-avatar" aria-hidden="true">FP</div>
                            <div>
                                <span className="shop-profile-eyebrow">{t('shopProfile.eyebrow')}</span>
                                <h2>{t('shopProfile.title')}</h2>
                                <p>{t('shopProfile.subtitle')}</p>
                            </div>
                            <button type="button" className="shop-profile-close" onClick={() => setShowProfileDrawer(false)} aria-label={t('shopProfile.close')}>
                                <X size={18} strokeWidth={1.9} />
                            </button>
                        </div>

                        <div className="shop-profile-identity">
                            <div>
                                <strong>{shop.name}</strong>
                                <span>{t('shopProfile.partnerConsole')}</span>
                            </div>
                            <span className="shop-profile-status">
                                <BadgeCheck size={14} strokeWidth={2} />
                                {t('shopProfile.active')}
                            </span>
                        </div>

                        <dl className="shop-profile-grid">
                            <div>
                                <dt><Building2 size={15} />{t('shopProfile.shopId')}</dt>
                                <dd>{shop.id}</dd>
                            </div>
                            <div>
                                <dt><Phone size={15} />{t('shopProfile.phone')}</dt>
                                <dd>{shop.phone}</dd>
                            </div>
                            <div>
                                <dt><Mail size={15} />{t('shopProfile.email')}</dt>
                                <dd>{shop.email}</dd>
                            </div>
                            <div>
                                <dt><MapPin size={15} />{t('shopProfile.address')}</dt>
                                <dd>{shop.address}</dd>
                            </div>
                            <div>
                                <dt><Clock size={15} />{t('shopProfile.weekdayHours')}</dt>
                                <dd>{shop.operatingHours.weekday}</dd>
                            </div>
                            <div>
                                <dt><Clock size={15} />{t('shopProfile.weekendHours')}</dt>
                                <dd>{shop.operatingHours.weekend}</dd>
                            </div>
                            <div>
                                <dt><Gauge size={15} />{t('shopProfile.capacity')}</dt>
                                <dd>{shop.capacity.currentUtilization}% / {shop.capacity.maxOrdersPerDay} {t('shopProfile.ordersPerDay')}</dd>
                            </div>
                            <div>
                                <dt><BadgeCheck size={15} />{t('shopProfile.taxCode')}</dt>
                                <dd>{shop.taxCode}</dd>
                            </div>
                        </dl>

                        <div className="shop-profile-audit-note">
                            <strong>{t('shopProfile.auditTitle')}</strong>
                            <p>{t('shopProfile.auditCopy')}</p>
                        </div>

                        <div className="shop-profile-actions">
                            <button type="button" className="shop-profile-secondary" onClick={() => setShowProfileDrawer(false)}>
                                {t('shopProfile.close')}
                            </button>
                            <button type="button" className="shop-profile-primary" onClick={handleEditSettings}>
                                <Settings2 size={15} strokeWidth={1.9} />
                                {t('shopProfile.editSettings')}
                            </button>
                        </div>
                    </aside>
                </div>
            )}
        </header>
    )
}

export default ShopHeader
