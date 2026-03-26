import { useNavigate, useLocation } from 'react-router-dom'
import './AppNavbar.css'

function AppNavbar() {
    const navigate = useNavigate()
    const location = useLocation()

    // Determine active nav link
    const isTrackOrder = location.pathname.includes('/track')
    const isAllShops = location.pathname.startsWith('/all-shops') && !isTrackOrder

    return (
        <header className="app-navbar">
            <div className="app-navbar-inner">
                <div className="logo" onClick={() => navigate('/')} style={{ cursor: 'pointer' }}>
                    <span className="logo-text">
                        Laundry<span>Go</span>
                    </span>
                    <span className="logo-bubbles">
                        <span className="bubble bubble-lg" />
                        <span className="bubble bubble-md" />
                        <span className="bubble bubble-sm" />
                    </span>
                </div>

                <nav className="app-nav">
                    <button
                        className={`app-nav-link ${isAllShops ? 'app-nav-link-active' : ''}`}
                        onClick={() => navigate('/all-shops')}
                    >
                        All Shops
                    </button>
                    <button
                        className={`app-nav-link ${isTrackOrder ? 'app-nav-link-active' : ''}`}
                        onClick={() => navigate('/all-shops/AS-001/track')}
                    >
                        Track Order
                    </button>
                </nav>

                <div
                    className="app-navbar-user"
                    role="button"
                    tabIndex={0}
                    onClick={() => navigate('/information')}
                    onKeyDown={(event) => {
                        if (event.key === 'Enter' || event.key === ' ') {
                            navigate('/information')
                        }
                    }}
                >
                    <div className="app-navbar-user-icon">👤</div>
                    <span className="app-navbar-user-name">EXE101</span>
                </div>
            </div>
        </header>
    )
}

export default AppNavbar
