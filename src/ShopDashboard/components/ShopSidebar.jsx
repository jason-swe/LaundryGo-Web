import { NavLink } from 'react-router-dom'
import './ShopSidebar.css'
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
import { useTranslation } from '../../shared/lib/i18n'

function ShopSidebar({ isOpen, onClose }) {
    const { t } = useTranslation()
    const menuItems = [
        {
            id: 'overview',
            label: t('dashboard.sidebar.overview'),
            icon: LayoutDashboard,
            section: 'main'
        },
        {
            id: 'orders',
            label: t('dashboard.sidebar.orders'),
            icon: ShoppingBag,
            section: 'management'
        },
        {
            id: 'operations',
            label: t('dashboard.sidebar.operation'),
            icon: Wrench,
            section: 'management'
        },
        {
            id: 'staff',
            label: t('dashboard.sidebar.staff'),
            icon: Users,
            section: 'management'
        },
        {
            id: 'revenue',
            label: t('dashboard.sidebar.revenue'),
            icon: DollarSign,
            section: 'management'
        },
        {
            id: 'documents',
            label: t('dashboard.sidebar.document'),
            icon: FileText,
            section: 'management'
        },
        {
            id: 'incidents',
            label: t('dashboard.sidebar.incidentReport'),
            icon: AlertTriangle,
            section: 'support'
        },
        {
            id: 'settings',
            label: t('dashboard.sidebar.settingsItem'),
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
                            to={`/shop/${item.id}`}
                            onClick={onClose}
                            className={({ isActive }) =>
                                `shop-sidebar-item ${isActive ? 'shop-sidebar-item-active' : ''}`
                            }
                        >
                            <span className="shop-sidebar-item-icon">
                                <IconComponent size={18} />
                            </span>
                            <span className="shop-sidebar-item-label">{item.label}</span>
                        </NavLink>
                    )
                })}
            </div>
        )
    }

    return (
        <aside className={`shop-sidebar${isOpen ? ' shop-sidebar-open' : ''}`}>
            <div className="shop-sidebar-header">
                <NavLink to="/shop/overview" className="shop-sidebar-logo" style={{ cursor: 'pointer', textDecoration: 'none' }}>
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
                        <span>FP</span>
                    </div>
                    <div className="shop-sidebar-shop-details">
                        <div className="shop-sidebar-shop-name">FPT Laundry Shop</div>
                        <div className="shop-sidebar-shop-role">{t('shopShell.partnerConsole')}</div>
                    </div>
                </div>
            </div>

            <nav className="shop-sidebar-nav">
                {renderSection('main', null)}
                {renderSection('management', t('dashboard.sidebar.management'))}
                {renderSection('support', t('dashboard.sidebar.support'))}
                {renderSection('settings', t('dashboard.sidebar.settings'))}
            </nav>
        </aside>
    )
}

export default ShopSidebar
