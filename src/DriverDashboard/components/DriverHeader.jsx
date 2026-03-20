import { Search, Menu } from 'lucide-react'
import './DriverHeader.css'

function DriverHeader({ onMenuClick }) {
    return (
        <header className="driver-header">
            <button
                className="driver-header-menu-btn"
                onClick={onMenuClick}
                aria-label="Toggle menu"
            >
                <Menu size={20} />
            </button>

            <div className="driver-header-search">
                <Search className="driver-header-search-icon" size={16} />
                <input
                    type="text"
                    className="driver-header-search-input"
                    placeholder="Search (orders, areas, customers...)"
                />
            </div>
        </header>
    )
}

export default DriverHeader
