import { NavLink } from 'react-router-dom'
import {
    BarChart3,
    Car,
    ChartNoAxesCombined,
    CreditCard,
    Gift,
    LayoutDashboard,
    Settings,
    ShieldCheck,
    Store,
    Users,
} from 'lucide-react'
import './AdminSidebar.css'
import { useTranslation, localizePath } from '../../shared/lib/i18n'

function AdminSidebar({ isOpen, onClose }) {
    const { language, t } = useTranslation()
    const menuItems = [
        { id: 'overview', label: t('adminShell.nav.overview'), icon: LayoutDashboard, section: 'command' },
        { id: 'shops', label: t('adminShell.nav.shops'), icon: Store, section: 'marketplace' },
        { id: 'shippers', label: t('adminShell.nav.shippers'), icon: Car, section: 'marketplace' },
        { id: 'customers', label: t('adminShell.nav.customers'), icon: Users, section: 'marketplace' },
        { id: 'finance', label: t('adminShell.nav.finance'), icon: CreditCard, section: 'finance' },
        { id: 'promotions', label: t('adminShell.nav.promotions'), icon: Gift, section: 'intelligence' },
        { id: 'analytics', label: t('adminShell.nav.analytics'), icon: ChartNoAxesCombined, section: 'intelligence' },
        { id: 'settings', label: t('adminShell.nav.settings'), icon: Settings, section: 'system' },
    ]

    const sectionLabels = {
        command: t('adminShell.sections.command'),
        marketplace: t('adminShell.sections.marketplace'),
        finance: t('adminShell.sections.finance'),
        intelligence: t('adminShell.sections.intelligence'),
        system: t('adminShell.sections.system'),
    }

    const renderSection = (sectionName) => {
        const items = menuItems.filter(item => item.section === sectionName)
        if (items.length === 0) return null

        return (
            <div className="admin-sidebar-section" key={sectionName}>
                <div className="admin-sidebar-section-title">{sectionLabels[sectionName]}</div>
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
                                <IconComponent size={18} strokeWidth={1.9} />
                            </span>
                            <span className="admin-sidebar-item-label">{item.label}</span>
                        </NavLink>
                    )
                })}
            </div>
        )
    }

    return (
        <aside className={`admin-sidebar${isOpen ? ' admin-sidebar-open' : ''}`}>
            <div className="admin-sidebar-header">
                <NavLink to={localizePath('/admin/overview', language)} className="admin-sidebar-logo" onClick={onClose}>
                    <span className="admin-sidebar-logo-mark">
                        <BarChart3 size={18} strokeWidth={2} />
                    </span>
                    <span className="admin-sidebar-logo-text">
                        Laundry<span>Go</span>
                    </span>
                </NavLink>

                <div className="admin-sidebar-admin-info">
                    <div className="admin-sidebar-avatar">SA</div>
                    <div className="admin-sidebar-admin-details">
                        <div className="admin-sidebar-admin-name">{t('adminShell.adminName')}</div>
                        <div className="admin-sidebar-admin-role">
                            <ShieldCheck size={12} strokeWidth={2} />
                            {t('adminShell.adminRole')}
                        </div>
                    </div>
                </div>
            </div>

            <nav className="admin-sidebar-nav" aria-label={t('adminShell.adminNavigation')}>
                {['command', 'marketplace', 'finance', 'intelligence', 'system'].map(renderSection)}
            </nav>
        </aside>
    )
}

export default AdminSidebar
