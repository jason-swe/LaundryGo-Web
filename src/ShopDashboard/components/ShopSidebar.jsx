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

function ShopSidebar({ isOpen, onClose }) {
    const menuItems = [
        {
            id: 'overview',
            label: 'OVERVIEW',
            icon: LayoutDashboard,
            section: 'main'
        },
        {
            id: 'orders',
            label: 'Orders',
            icon: ShoppingBag,
            section: 'management'
        },
        {
            id: 'operations',
            label: 'Operation',
            icon: Wrench,
            section: 'management'
        },
        {
            id: 'staff',
            label: 'Staff',
            icon: Users,
            section: 'management'
        },
        {
            id: 'revenue',
            label: 'Revenue',
            icon: DollarSign,
            section: 'management'
        },
        {
            id: 'documents',
            label: 'Document',
            icon: FileText,
            section: 'management'
        },
        {
            id: 'incidents',
            label: 'Incident Report',
            icon: AlertTriangle,
            section: 'support'
        },
        {
            id: 'settings',
            label: 'Settings',
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
                        <span>👤</span>
                    </div>
                    <div className="shop-sidebar-shop-details">
                        <div className="shop-sidebar-shop-name">FPT Laundry Shop</div>
                        <div className="shop-sidebar-shop-role">Partner</div>
                    </div>
                </div>
            </div>

            <nav className="shop-sidebar-nav">
                {renderSection('main', null)}
                {renderSection('management', 'MANAGEMENT')}
                {renderSection('support', 'SUPPORT')}
                {renderSection('settings', 'SETTINGS')}
            </nav>
        </aside>
    )
}

export default ShopSidebar
