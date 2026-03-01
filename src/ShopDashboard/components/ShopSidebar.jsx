import './ShopSidebar.css'
import {
    HomeOutlined,
    ShoppingOutlined,
    TeamOutlined,
    FileTextOutlined,
    SettingOutlined,
    WarningOutlined,
    ToolOutlined,
    DollarOutlined
} from '@ant-design/icons'

function ShopSidebar({ activeView, onViewChange }) {
    const menuItems = [
        {
            id: 'overview',
            label: 'OVERVIEW',
            icon: HomeOutlined,
            section: 'main'
        },
        {
            id: 'orders',
            label: 'Orders',
            icon: ShoppingOutlined,
            section: 'management'
        },
        {
            id: 'operations',
            label: 'Operation',
            icon: ToolOutlined,
            section: 'management'
        },
        {
            id: 'staff',
            label: 'Staff',
            icon: TeamOutlined,
            section: 'management'
        },
        {
            id: 'revenue',
            label: 'Revenue',
            icon: DollarOutlined,
            section: 'management'
        },
        {
            id: 'documents',
            label: 'Document',
            icon: FileTextOutlined,
            section: 'management'
        },
        {
            id: 'incidents',
            label: 'Incident Report',
            icon: WarningOutlined,
            section: 'support'
        },
        {
            id: 'settings',
            label: 'Settings',
            icon: SettingOutlined,
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
                        <button
                            key={item.id}
                            className={`shop-sidebar-item ${activeView === item.id ? 'shop-sidebar-item-active' : ''}`}
                            onClick={() => onViewChange(item.id)}
                        >
                            <span className="shop-sidebar-item-icon">
                                <IconComponent style={{ fontSize: '18px' }} />
                            </span>
                            <span className="shop-sidebar-item-label">{item.label}</span>
                        </button>
                    )
                })}
            </div>
        )
    }

    return (
        <aside className="shop-sidebar">
            <div className="shop-sidebar-header">
                <div className="shop-sidebar-logo" onClick={() => onViewChange('overview')} style={{ cursor: 'pointer' }}>
                    <span className="shop-sidebar-logo-text">
                        Laundry<span>Go</span>
                    </span>
                    <span className="shop-sidebar-logo-bubbles">
                        <span className="bubble bubble-lg" />
                        <span className="bubble bubble-md" />
                        <span className="bubble bubble-sm" />
                    </span>
                </div>

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
