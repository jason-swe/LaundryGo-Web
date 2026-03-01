import './Sidebar.css'

function Sidebar({ currentPage, onNavigate }) {
    const menuItems = [
        {
            id: 'overview',
            label: 'OVERVIEW',
            icon: (
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none">
                    <path d="M3 13h8V3H3v10zm0 8h8v-6H3v6zm10 0h8V11h-8v10zm0-18v6h8V3h-8z" fill="currentColor" />
                </svg>
            ),
            section: null
        },
        {
            section: 'MANAGEMENT',
            items: [
                {
                    id: 'orders',
                    label: 'Orders',
                    icon: (
                        <svg width="20" height="20" viewBox="0 0 24 24" fill="none">
                            <path d="M9 11H3v10h6V11zm12-8h-6v8h6V3zm0 10h-6v10h6V13zM9 3H3v6h6V3z" fill="currentColor" />
                        </svg>
                    )
                },
                {
                    id: 'staff',
                    label: 'Staff',
                    icon: (
                        <svg width="20" height="20" viewBox="0 0 24 24" fill="none">
                            <path d="M16 11c1.66 0 2.99-1.34 2.99-3S17.66 5 16 5s-3 1.34-3 3 1.34 3 3 3zm-8 0c1.66 0 2.99-1.34 2.99-3S9.66 5 8 5 5 6.34 5 8s1.34 3 3 3zm0 2c-2.33 0-7 1.17-7 3.5V19h14v-2.5c0-2.33-4.67-3.5-7-3.5zm8 0c-.29 0-.62.02-.97.05 1.16.84 1.97 1.97 1.97 3.45V19h6v-2.5c0-2.33-4.67-3.5-7-3.5z" fill="currentColor" />
                        </svg>
                    )
                },
                {
                    id: 'document',
                    label: 'Document',
                    icon: (
                        <svg width="20" height="20" viewBox="0 0 24 24" fill="none">
                            <path d="M14 2H6c-1.1 0-1.99.9-1.99 2L4 20c0 1.1.89 2 1.99 2H18c1.1 0 2-.9 2-2V8l-6-6zM6 20V4h7v5h5v11H6z" fill="currentColor" />
                        </svg>
                    )
                },
                {
                    id: 'operation',
                    label: 'Operation',
                    icon: (
                        <svg width="20" height="20" viewBox="0 0 24 24" fill="none">
                            <path d="M12.09 2.91C10.08 0.9 7.07 0.49 4.65 1.67L8.28 5.3c.39.39.39 1.02 0 1.41L6.69 8.3c-.39.39-1.02.39-1.41 0L1.65 4.67C.48 7.1.89 10.09 2.9 12.1c1.86 1.86 4.58 2.35 6.89 1.48l7.96 7.96a2.613 2.613 0 1 0 3.69-3.69l-7.96-7.96c.87-2.31.38-5.03-1.49-6.89z" fill="currentColor" />
                        </svg>
                    )
                }
            ]
        },
        {
            section: 'SUPPORT',
            items: [
                {
                    id: 'incident',
                    label: 'Incident Report',
                    icon: (
                        <svg width="20" height="20" viewBox="0 0 24 24" fill="none">
                            <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm1 15h-2v-2h2v2zm0-4h-2V7h2v6z" fill="currentColor" />
                        </svg>
                    )
                }
            ]
        },
        {
            section: 'SETTINGS',
            items: [
                {
                    id: 'settings',
                    label: 'Settings',
                    icon: (
                        <svg width="20" height="20" viewBox="0 0 24 24" fill="none">
                            <circle cx="12" cy="12" r="3" stroke="currentColor" strokeWidth="2" />
                            <path d="M12 1v6m0 6v6M23 12h-6m-6 0H1" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
                        </svg>
                    )
                }
            ]
        }
    ]

    return (
        <aside className="sidebar">
            <div className="sidebar-header">
                <div className="sidebar-logo" onClick={() => onNavigate('overview')} style={{ cursor: 'pointer' }}>
                    <span className="logo-text">
                        Laundry<span>Go</span>
                    </span>
                    <span className="logo-bubbles">
                        <span className="bubble bubble-lg" />
                        <span className="bubble bubble-md" />
                        <span className="bubble bubble-sm" />
                    </span>
                </div>

                <div className="shop-profile">
                    <div className="profile-avatar">
                        <svg width="32" height="32" viewBox="0 0 24 24" fill="none">
                            <path d="M12 12c2.21 0 4-1.79 4-4s-1.79-4-4-4-4 1.79-4 4 1.79 4 4 4zm0 2c-2.67 0-8 1.34-8 4v2h16v-2c0-2.66-5.33-4-8-4z" fill="currentColor" />
                        </svg>
                    </div>
                    <div className="profile-info">
                        <div className="profile-name">FPT Laundry Shop</div>
                        <div className="profile-role">Partner</div>
                    </div>
                </div>
            </div>

            <nav className="sidebar-nav">
                {menuItems.map((item, index) => {
                    if (item.section && item.items) {
                        return (
                            <div key={index} className="nav-section">
                                <div className="nav-section-title">{item.section}</div>
                                {item.items.map((subItem) => (
                                    <button
                                        key={subItem.id}
                                        className={`nav-item ${currentPage === subItem.id ? 'active' : ''}`}
                                        onClick={() => onNavigate(subItem.id)}
                                    >
                                        <span className="nav-icon">{subItem.icon}</span>
                                        <span className="nav-label">{subItem.label}</span>
                                    </button>
                                ))}
                            </div>
                        )
                    }

                    // Individual items without section
                    if (item.section === null) {
                        return (
                            <button
                                key={item.id}
                                className={`nav-item ${currentPage === item.id ? 'active' : ''}`}
                                onClick={() => onNavigate(item.id)}
                            >
                                <span className="nav-icon">{item.icon}</span>
                                <span className="nav-label">{item.label}</span>
                            </button>
                        )
                    }

                    return null
                })}
            </nav>
        </aside>
    )
}

export default Sidebar
