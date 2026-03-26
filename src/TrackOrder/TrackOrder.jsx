import { useLocation, useNavigate, useParams } from 'react-router-dom'
import {
    CheckCircle,
    Truck,
    Droplets,
    Sparkles,
    Package,
    MessageCircle,
    MapPin,
    Clock,
    Store,
    House,
} from 'lucide-react'
import AppNavbar from '../components/AppNavbar'
import '../LandingPage/LandingPage.css'
import './TrackOrder.css'

const STEPS = [
    { label: 'Placed Order', Icon: CheckCircle, time: '08:40' },
    { label: 'Picked Up', Icon: Truck, time: '09:10' },
    { label: 'In Wash', Icon: Droplets, time: '10:05' },
    { label: 'Ready', Icon: Sparkles, time: '12:30' },
    { label: 'Delivery', Icon: Package, time: '13:00' },
]

function TrackOrder() {
    const navigate = useNavigate()
    const { id } = useParams()
    const { state } = useLocation()

    const hasOrder = !!state?.orderId
    const orderId = state?.orderId || '#LG-98234'
    const pickupDate = state?.pickupDate || 'Tue, 25 Feb, 2026'
    const pickupTime = state?.pickupTime || '09:00 AM – 11:00 AM'
    const currentStep = 2

    return (
        <div className="track-page">
            <AppNavbar />

            <main className="track-main">
                {!hasOrder ? (
                    <div className="no-order-container">
                        <div className="no-order-box">
                            <div className="no-order-icon">
                                <Package size={26} strokeWidth={1.8} />
                            </div>
                            <h2 className="no-order-title">No Orders</h2>
                            <p className="no-order-desc">You don't have any active orders yet. Visit our shop to place an order.</p>
                            <button
                                className="no-order-btn"
                                onClick={() => navigate('/all-shops')}
                            >
                                Back to Shop
                            </button>
                        </div>
                    </div>
                ) : (
                    <>
                        <p className="track-order-id">Order ID: {orderId}</p>
                        <h1 className="track-title">
                            In Progress: <span>Washing your clothes.</span>
                        </h1>
                        <p className="track-updated">Last updated: Just now</p>

                        <section className="track-grid">
                            <div className="track-left">
                                {/* Status card */}
                                <div className="card track-status-card">
                                    <div className="status-progress">
                                        <div className="status-track">
                                            <div
                                                className="status-track-done"
                                                style={{ width: `${(currentStep / (STEPS.length - 1)) * 100}%` }}
                                            />
                                        </div>
                                        <div className="status-steps">
                                            {STEPS.map((step, index) => {
                                                const done = index <= currentStep
                                                const active = index === currentStep
                                                const Icon = step.Icon
                                                return (
                                                    <div className="status-step" key={step.label}>
                                                        <span
                                                            className={`status-point ${done ? 'done' : ''} ${active ? 'current' : ''
                                                                }`}
                                                        >
                                                            <Icon size={14} strokeWidth={1.5} />
                                                        </span>
                                                        <span className="status-text">{step.label}</span>
                                                        <span className="status-time">{step.time}</span>
                                                    </div>
                                                )
                                            })}
                                        </div>
                                    </div>
                                </div>

                                {/* Info card */}
                                <div className="card track-fresh-card">
                                    <div className="fresh-icon">
                                        <Droplets size={24} strokeWidth={1.5} />
                                    </div>
                                    <p className="fresh-title">MAKING THEM FRESH</p>
                                    <p className="fresh-desc">
                                        Your clothes are being treated with eco-friendly detergents in our high-tech facility.
                                    </p>
                                </div>

                                {/* Virtual map */}
                                <div className="card map-card">
                                    <div className="virtual-map">
                                        {/* Background layers */}
                                        <svg className="vmap-base-layer" width="100%" height="100%" viewBox="0 0 400 240" preserveAspectRatio="none">
                                            {/* Parks/Green areas */}
                                            <rect x="10" y="10" width="70" height="60" fill="#c8e6d7" opacity="0.6" rx="4" />
                                            <rect x="320" y="140" width="70" height="50" fill="#c8e6d7" opacity="0.6" rx="4" />

                                            {/* Building blocks - Left side */}
                                            <rect x="100" y="15" width="35" height="28" fill="#e8e8e8" stroke="#d0d0d0" strokeWidth="0.5" />
                                            <rect x="145" y="15" width="40" height="22" fill="#f0f0f0" stroke="#d8d8d8" strokeWidth="0.5" />
                                            <rect x="105" y="55" width="32" height="35" fill="#ececec" stroke="#d4d4d4" strokeWidth="0.5" />
                                            <rect x="150" y="60" width="38" height="30" fill="#e8e8e8" stroke="#d0d0d0" strokeWidth="0.5" />

                                            {/* Building blocks - Center */}
                                            <rect x="200" y="25" width="45" height="32" fill="#f5f5f5" stroke="#e0e0e0" strokeWidth="0.5" />
                                            <rect x="260" y="20" width="36" height="40" fill="#e8e8e8" stroke="#d0d0d0" strokeWidth="0.5" />
                                            <rect x="205" y="75" width="42" height="28" fill="#ececec" stroke="#d4d4d4" strokeWidth="0.5" />

                                            {/* Building blocks - Right side */}
                                            <rect x="280" y="75" width="40" height="35" fill="#f0f0f0" stroke="#d8d8d8" strokeWidth="0.5" />
                                            <rect x="330" y="70" width="38" height="32" fill="#e8e8e8" stroke="#d0d0d0" strokeWidth="0.5" />
                                            <rect x="285" y="125" width="45" height="30" fill="#ececec" stroke="#d4d4d4" strokeWidth="0.5" />
                                            <rect x="155" y="120" width="40" height="35" fill="#f5f5f5" stroke="#e0e0e0" strokeWidth="0.5" />
                                            <rect x="220" y="135" width="36" height="32" fill="#e8e8e8" stroke="#d0d0d0" strokeWidth="0.5" />

                                            {/* Primary roads - Thicker and lighter blue */}
                                            <line x1="0" y1="85" x2="400" y2="85" stroke="#b3d9f2" strokeWidth="7" opacity="0.8" />
                                            <line x1="120" y1="0" x2="120" y2="240" stroke="#b3d9f2" strokeWidth="7" opacity="0.8" />
                                            <line x1="270" y1="0" x2="270" y2="240" stroke="#b3d9f2" strokeWidth="7" opacity="0.8" />

                                            {/* Secondary roads - Thinner */}
                                            <line x1="0" y1="48" x2="400" y2="48" stroke="#d4e8f7" strokeWidth="4" opacity="0.6" />
                                            <line x1="0" y1="135" x2="400" y2="135" stroke="#d4e8f7" strokeWidth="4" opacity="0.6" />
                                            <line x1="0" y1="195" x2="400" y2="195" stroke="#d4e8f7" strokeWidth="4" opacity="0.6" />
                                            <line x1="180" y1="0" x2="180" y2="240" stroke="#d4e8f7" strokeWidth="4" opacity="0.6" />
                                            <line x1="320" y1="0" x2="320" y2="240" stroke="#d4e8f7" strokeWidth="4" opacity="0.6" />

                                            {/* Street names */}
                                            <text x="15" y="82" fontSize="9" fontWeight="600" fill="#6b8cba" opacity="0.5">Tran Hung Dao St</text>
                                            <text x="255" y="32" fontSize="8" fontWeight="600" fill="#6b8cba" opacity="0.4" transform="rotate(-90 265 32)">Ly Thuong Kiet</text>
                                        </svg>

                                        {/* Route path with shadow */}
                                        <svg className="vmap-svg vmap-route-svg" width="100%" height="100%" viewBox="0 0 400 240" preserveAspectRatio="none">
                                            {/* Route shadow/background - Following primary roads */}
                                            <path
                                                d="M 60 135 L 120 135 L 120 85 L 270 85 L 270 135 L 340 135"
                                                stroke="#b3d9f2"
                                                strokeWidth="10"
                                                fill="none"
                                                strokeLinecap="round"
                                                strokeLinejoin="round"
                                                opacity="0.6"
                                            />
                                            {/* Main route - Following primary roads */}
                                            <path
                                                className="vmap-route-main"
                                                d="M 60 135 L 120 135 L 120 85 L 270 85 L 270 135 L 340 135"
                                                stroke="#1d78c7"
                                                strokeWidth="4"
                                                strokeDasharray="12 6"
                                                fill="none"
                                                strokeLinecap="round"
                                                strokeLinejoin="round"
                                                filter="drop-shadow(0 2px 4px rgba(29, 120, 199, 0.4))"
                                            />
                                        </svg>

                                        {/* Pickup location marker - START POINT */}
                                        <div className="vmap-marker vmap-pickup-marker" style={{ left: '15%', top: '56.25%', transform: 'translate(-50%, -50%)', zIndex: 10 }}>
                                            <div className="vmap-marker-bg">
                                                <Store size={11} strokeWidth={2} />
                                            </div>
                                            <div className="vmap-marker-label">EXE Shop</div>
                                        </div>

                                        {/* Driver marker with direction - MIDDLE POINT */}
                                        <div className="vmap-driver-container" style={{ left: '45%', top: '35.4%', transform: 'translate(-50%, -50%)', zIndex: 10 }}>
                                            <div className="vmap-pulse-ring" />
                                            <div className="vmap-driver-marker">
                                                <div className="vmap-driver-direction" />
                                                <Truck size={14} strokeWidth={1.8} />
                                            </div>
                                        </div>

                                        {/* Destination marker - END POINT */}
                                        <div className="vmap-dest-marker" style={{ left: '85%', top: '56.25%', transform: 'translate(-50%, -50%)', zIndex: 10 }}>
                                            <div className="vmap-marker-bg vmap-dest-bg">
                                                <MapPin size={13} strokeWidth={2.5} />
                                            </div>
                                            <div className="vmap-marker-label">Your Location</div>
                                        </div>

                                        {/* Route info panel */}
                                        <div className="vmap-route-info">
                                            <div className="vmap-info-item">
                                                <Clock size={12} />
                                                <span>12 min</span>
                                            </div>
                                            <div className="vmap-info-item">
                                                <span className="vmap-distance">3.2 km</span>
                                            </div>
                                        </div>

                                        {/* Driver info card */}
                                        <div className="vmap-driver-card">
                                            <div className="vmap-driver-avatar">
                                                <Truck size={16} strokeWidth={1.8} />
                                            </div>
                                            <div className="vmap-driver-info">
                                                <p className="vmap-driver-name">Marco S.</p>
                                                <p className="vmap-driver-vehicle">Toyota Vios • Blue</p>
                                            </div>
                                        </div>

                                        {/* Action buttons */}
                                        <button className="vmap-action-btn vmap-chat-btn">
                                            <MessageCircle size={15} strokeWidth={1.8} />
                                        </button>
                                        <button className="vmap-action-btn vmap-call-btn">
                                            📞
                                        </button>
                                    </div>
                                </div>
                            </div>

                            <aside className="track-right">
                                <div className="card compact-card">
                                    <p className="compact-title">Estimated Delivery</p>
                                    <p className="compact-value">{pickupDate} - {pickupTime}</p>
                                </div>

                                <div className="card compact-card">
                                    <p className="compact-title">HOME</p>
                                    <p className="compact-value small">S3.03 Vinhomes Grand Park</p>
                                    <p className="compact-sub">Thu Duc City, HCMC</p>
                                </div>

                                <div className="card summary-card">
                                    <h3>ORDER SUMMARY</h3>
                                    <div className="sum-row">
                                        <span>5x Everyday Wear</span><span>35.000VND</span>
                                    </div>
                                    <div className="sum-row">
                                        <span>1x Two-piece Suit</span><span>35.000VND</span>
                                    </div>
                                    <div className="sum-row">
                                        <span>Subtotal</span><span>70.000VND</span>
                                    </div>
                                    <div className="sum-row">
                                        <span>Pickup & Delivery</span><span>15.000VND</span>
                                    </div>
                                    <div className="sum-row total">
                                        <span>Total</span><span>85.000VND</span>
                                    </div>
                                </div>

                                <button className="support-btn filled">Contact Support</button>
                                <button className="support-btn" onClick={() => navigate(`/all-shops/${id}`)}>
                                    Help Center
                                </button>
                            </aside>
                        </section>
                    </>
                )}
            </main>
        </div>
    )
}

export default TrackOrder
