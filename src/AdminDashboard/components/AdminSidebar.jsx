import { NavLink } from 'react-router-dom'
import './AdminSidebar.css'
import {
    DashboardOutlined,
    ShopOutlined,
    UserOutlined,
    DollarOutlined,
    GiftOutlined,
    BarChartOutlined,
    SettingOutlined,
    CarOutlined,
    ShoppingCartOutlined
} from '@ant-design/icons'

function AdminSidebar() {
    const menuItems = [
        {
            id: 'overview',
            label: 'OVERVIEW',
            icon: DashboardOutlined,
            section: 'main'
        },
        {
            id: 'orders',
            label: 'Orders',
            icon: ShoppingCartOutlined,
            section: 'management'
        },
        {
            id: 'shops',
            label: 'Partner Shops',
            icon: ShopOutlined,
            section: 'management'
        },
        {
            id: 'shippers',
            label: 'Shippers',
            icon: CarOutlined,
            section: 'management'
        },
        {
            id: 'customers',
            label: 'Customers',
            icon: UserOutlined,
            section: 'management'
        },
        {
            id: 'finance',
            label: 'Finance',
            icon: DollarOutlined,
            section: 'management'
        },
        {
            id: 'promotions',
            label: 'Promotions & Marketing',
            icon: GiftOutlined,
            section: 'management'
        },
        {
            id: 'analytics',
            label: 'Analytics',
            icon: BarChartOutlined,
            section: 'system'
        },
        {
            id: 'settings',
            label: 'System Settings',
            icon: SettingOutlined,
            section: 'settings'
        }
    ]

    const renderSection = (sectionName, displayName) => {
        const items = menuItems.filter(item => item.section === sectionName)
        if (items.length === 0) return null

        return (
            <div className="admin-sidebar-section">
                {displayName && (
                    <div className="admin-sidebar-section-title">{displayName}</div>
                )}
                {items.map(item => {
                    const IconComponent = item.icon
                    return (
                        <NavLink
                            key={item.id}
                            to={`/admin/${item.id}`}
                            className={({ isActive }) =>
                                `admin-sidebar-item ${isActive ? 'admin-sidebar-item-active' : ''}`
                            }
                        >
                            <span className="admin-sidebar-item-icon">
                                <IconComponent style={{ fontSize: '18px' }} />
                            </span>
                            <span className="admin-sidebar-item-label">{item.label}</span>
                        </NavLink>
                    )
                })}
            </div>
        )
    }

    return (
        <aside className="admin-sidebar">
            <div className="admin-sidebar-header">
                <NavLink to="/admin/overview" className="admin-sidebar-logo" style={{ cursor: 'pointer', textDecoration: 'none' }}>
                    <span className="admin-sidebar-logo-text">
                        Laundry<span>Go</span>
                    </span>
                    <span className="admin-sidebar-logo-bubbles">
                        <span className="bubble bubble-lg" />
                        <span className="bubble bubble-md" />
                        <span className="bubble bubble-sm" />
                    </span>
                </NavLink>

                <div className="admin-sidebar-admin-info">
                    <div className="admin-sidebar-avatar">
                        <span>👤</span>
                    </div>
                    <div className="admin-sidebar-admin-details">
                        <div className="admin-sidebar-admin-name">System Admin</div>
                        <div className="admin-sidebar-admin-role">Administrator</div>
                    </div>
                </div>
            </div>

            <nav className="admin-sidebar-nav">
                {renderSection('main', null)}
                {renderSection('management', 'MANAGEMENT')}
                {renderSection('system', 'SYSTEM')}
                {renderSection('settings', 'SETTINGS')}
            </nav>
        </aside>
    )
}

export default AdminSidebar
