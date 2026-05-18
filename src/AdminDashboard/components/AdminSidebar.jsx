import { NavLink } from 'react-router-dom'
import './AdminSidebar.css'
import { useTranslation, localizePath } from '../../shared/lib/i18n'
import {
    DashboardOutlined,
    ShopOutlined,
    UserOutlined,
    DollarOutlined,
    GiftOutlined,
    BarChartOutlined,
    SettingOutlined,
    CarOutlined
} from '@ant-design/icons'

function AdminSidebar({ isOpen, onClose }) {
    const { language, t } = useTranslation()
    const menuItems = [
        {
            id: 'overview',
            labelKey: 'dashboard.overview',
            icon: DashboardOutlined,
            section: 'main'
        },
        {
            id: 'shops',
            labelKey: 'dashboard.partnerShops',
            icon: ShopOutlined,
            section: 'management'
        },
        {
            id: 'shippers',
            labelKey: 'dashboard.shippers',
            icon: CarOutlined,
            section: 'management'
        },
        {
            id: 'customers',
            labelKey: 'dashboard.customers',
            icon: UserOutlined,
            section: 'management'
        },
        {
            id: 'finance',
            labelKey: 'dashboard.finance',
            icon: DollarOutlined,
            section: 'management'
        },
        {
            id: 'promotions',
            labelKey: 'dashboard.promotionsMarketing',
            icon: GiftOutlined,
            section: 'management'
        },
        {
            id: 'analytics',
            labelKey: 'dashboard.analytics',
            icon: BarChartOutlined,
            section: 'system'
        },
        {
            id: 'settings',
            labelKey: 'dashboard.systemSettings',
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
                            to={localizePath(`/admin/${item.id}`, language)}
                            onClick={onClose}
                            className={({ isActive }) =>
                                `admin-sidebar-item ${isActive ? 'admin-sidebar-item-active' : ''}`
                            }
                        >
                            <span className="admin-sidebar-item-icon">
                                <IconComponent style={{ fontSize: '18px' }} />
                            </span>
                            <span className="admin-sidebar-item-label">{t(item.labelKey)}</span>
                        </NavLink>
                    )
                })}
            </div>
        )
    }

    return (
        <aside className={`admin-sidebar${isOpen ? ' admin-sidebar-open' : ''}`}>
            <div className="admin-sidebar-header">
                <NavLink to={localizePath('/admin/overview', language)} className="admin-sidebar-logo" style={{ cursor: 'pointer', textDecoration: 'none' }}>
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
                        <div className="admin-sidebar-admin-role">{t('dashboard.administrator')}</div>
                    </div>
                </div>
            </div>

            <nav className="admin-sidebar-nav">
                {renderSection('main', null)}
                {renderSection('management', t('dashboard.management'))}
                {renderSection('system', t('dashboard.system'))}
                {renderSection('settings', t('dashboard.settings').toUpperCase())}
            </nav>
        </aside>
    )
}

export default AdminSidebar
