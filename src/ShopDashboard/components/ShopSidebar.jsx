import { NavLink } from 'react-router-dom'
import './ShopSidebar.css'
import { useTranslation, localizePath } from '../../shared/lib/i18n'
import {
    LayoutDashboard,
    ShoppingBag,
    Users,
    FileText,
    Settings,
    AlertTriangle,
    Wrench,
    DollarSign
} from 'lucide-react'

function ShopSidebar({ isOpen, onClose }) {
    const { language, t } = useTranslation()
    const menuItems = [
        {
            id: 'overview',
            labelKey: 'dashboard.overview',
            icon: LayoutDashboard,
            section: 'main'
        },
        {
            id: 'orders',
            labelKey: 'dashboard.orders',
            icon: ShoppingBag,
            section: 'management'
        },
        {
            id: 'operations',
            labelKey: 'dashboard.operation',
            icon: Wrench,
            section: 'management'
        },
        {
            id: 'staff',
            labelKey: 'dashboard.staff',
            icon: Users,
            section: 'management'
        },
        {
            id: 'revenue',
            labelKey: 'dashboard.revenue',
            icon: DollarSign,
            section: 'management'
        },
        {
            id: 'documents',
            labelKey: 'dashboard.document',
            icon: FileText,
            section: 'management'
        },
        {
            id: 'incidents',
            labelKey: 'dashboard.incidentReport',
            icon: AlertTriangle,
            section: 'support'
        },
        {
            id: 'settings',
            labelKey: 'dashboard.settings',
            icon: Settings,
            section: 'settings'
        }
    ]

    const renderSection = (sectionName, displayName) => {
        const items = menuItems.filter(item => item.section === sectionName)
        if (items.length === 0) return null

        return (
            <div className="shop-sidebar-section">
                {displayName && (
                    <div className="shop-sidebar-section-title">{displayName}</div>
                )}
                {items.map(item => {
                    const IconComponent = item.icon
                    return (
                        <NavLink
                            key={item.id}
                            to={localizePath(`/shop/${item.id}`, language)}
                            onClick={onClose}
                            className={({ isActive }) =>
                                `shop-sidebar-item ${isActive ? 'shop-sidebar-item-active' : ''}`
                            }
                        >
                            <span className="shop-sidebar-item-icon">
                                <IconComponent size={18} />
                            </span>
                            <span className="shop-sidebar-item-label">{t(item.labelKey)}</span>
                        </NavLink>
                    )
                })}
            </div>
        )
    }

    return (
        <aside className={`shop-sidebar${isOpen ? ' shop-sidebar-open' : ''}`}>
            <div className="shop-sidebar-header">
                <NavLink to={localizePath('/shop/overview', language)} className="shop-sidebar-logo" style={{ cursor: 'pointer', textDecoration: 'none' }}>
                    <span className="shop-sidebar-logo-text">
                        Laundry<span>Go</span>
                    </span>
                    <span className="shop-sidebar-logo-bubbles">
                        <span className="bubble bubble-lg" />
                        <span className="bubble bubble-md" />
                        <span className="bubble bubble-sm" />
                    </span>
                </NavLink>

                <div className="shop-sidebar-shop-info">
                    <div className="shop-sidebar-avatar">
                        <span>👤</span>
                    </div>
                    <div className="shop-sidebar-shop-details">
                        <div className="shop-sidebar-shop-name">FPT Laundry Shop</div>
                        <div className="shop-sidebar-shop-role">{t('dashboard.partner')}</div>
                    </div>
                </div>
            </div>

            <nav className="shop-sidebar-nav">
                {renderSection('main', null)}
                {renderSection('management', t('dashboard.management'))}
                {renderSection('support', t('dashboard.support'))}
                {renderSection('settings', t('dashboard.settings').toUpperCase())}
            </nav>
        </aside>
    )
}

export default ShopSidebar
