import { Search, Menu } from 'lucide-react'
import './DriverHeader.css'
import { useTranslation } from '../../shared/lib/i18n'

function DriverHeader({ onMenuClick }) {
    const { t } = useTranslation()
    return (
        <header className="driver-header">
            <button
                className="driver-header-menu-btn"
                onClick={onMenuClick}
                aria-label={t('dashboard.toggleMenu')}
            >
                <Menu size={20} />
            </button>

            <div className="driver-header-search">
                <Search className="driver-header-search-icon" size={16} />
                <input
                    type="text"
                    className="driver-header-search-input"
                    placeholder={t('dashboard.searchDriver')}
                />
            </div>
        </header>
    )
}

export default DriverHeader
