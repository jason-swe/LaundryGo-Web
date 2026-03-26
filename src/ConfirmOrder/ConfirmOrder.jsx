import { useLocation, useNavigate, useParams } from 'react-router-dom'
import { CheckCircle, Clock, Calendar } from 'lucide-react'
import AppNavbar from '../components/AppNavbar'
import '../LandingPage/LandingPage.css'
import './ConfirmOrder.css'

function ConfirmOrder() {
    const navigate = useNavigate()
    const { id } = useParams()
    const { state } = useLocation()

    const pickupDate = state?.pickupDate || 'TODAY, FEB 23'
    const pickupTime = state?.pickupTime || '09:00 AM – 11:00 AM'
    const addressType = state?.addressType || 'HOME'
    const orderId = state?.orderId || '#LG-98234'

    return (
        <div className="confirm-page">
            <AppNavbar />

            <main className="confirm-main">
                <div className="confirm-success-wrap">
                    <div className="confirm-success-ring" />
                    <div className="confirm-success-icon">
                        <CheckCircle size={48} strokeWidth={1.8} />
                    </div>
                </div>

                <h1 className="confirm-title">Order Placed Successfully!</h1>
                <p className="confirm-subtitle">
                    Your laundry pickup has been scheduled. We'll be there on time!
                </p>

                <div className="confirm-order-badge">
                    <span className="confirm-badge-label">Order ID</span>
                    <span className="confirm-badge-value">{orderId}</span>
                </div>

                <section className="confirm-card">
                    <div className="confirm-notice">
                        <div className="confirm-notice-icon">
                            <Clock size={20} strokeWidth={1.8} />
                        </div>
                        <p>
                            Your laundry professional is on the way to pick up your items at the{' '}
                            <strong>scheduled time.</strong>
                        </p>
                    </div>

                    <div className="confirm-details">
                        <div className="confirm-detail-item">
                            <Calendar size={16} className="confirm-detail-icon" />
                            <div>
                                <p className="confirm-detail-label">PICKUP DATE</p>
                                <p className="confirm-detail-value">{pickupDate}</p>
                            </div>
                        </div>
                        <div className="confirm-detail-item">
                            <Clock size={16} className="confirm-detail-icon" />
                            <div>
                                <p className="confirm-detail-label">TIME WINDOW</p>
                                <p className="confirm-detail-value">{pickupTime}</p>
                            </div>
                        </div>
                    </div>

                    <div className="confirm-actions">
                        <button
                            className="confirm-btn-primary"
                            onClick={() =>
                                navigate(`/all-shops/${id}/track`, {
                                    state: { orderId, pickupDate, pickupTime, addressType },
                                })
                            }
                        >
                            TRACK ORDER
                        </button>
                        <button className="outline-btn" onClick={() => navigate('/')}>
                            {addressType}
                        </button>
                    </div>
                </section>
            </main>
        </div>
    )
}

export default ConfirmOrder
