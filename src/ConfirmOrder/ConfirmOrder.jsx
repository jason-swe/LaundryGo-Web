import { useLocation, useNavigate, useParams } from 'react-router-dom'
import '../LandingPage/LandingPage.css'
import './ConfirmOrder.css'

function ConfirmOrder() {
  const navigate = useNavigate()
  const { id } = useParams()
  const { state } = useLocation()

  const pickupDate = state?.pickupDate || 'TODAY, FEB 23'
  const pickupTime = state?.pickupTime || '09:00 AM-11:00 AM'
  const addressType = state?.addressType || 'HOME'
  const orderId = state?.orderId || '#LG-98234'

  return (
    <div className="confirm-page">
      <header className="confirm-topbar">
        <div className="confirm-topbar-inner">
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

          <div className="confirm-user">
            <span className="confirm-user-icon">👤</span>
            <span>EXE101</span>
          </div>
        </div>
      </header>

      <main className="confirm-main">
        <div className="success-icon">✓</div>
        <h1 className="success-title">Order Placed Successfully!</h1>
        <div className="confirm-order-id">Order ID: {orderId}</div>

        <section className="confirm-card">
          <div className="confirm-message">
            <div className="clock-icon">🕒</div>
            <p>
              Your laundry professional is on the way to pick up your items at the
              <br />
              <strong>scheduled time.</strong>
            </p>
          </div>

          <div className="confirm-details">
            <div>
              <p className="label">PICKUPDATE</p>
              <p className="value">{pickupDate}</p>
            </div>
            <div>
              <p className="label">TIME WINDOW</p>
              <p className="value">{pickupTime}</p>
            </div>
          </div>

          <div className="confirm-actions">
            <button
              className="outline-btn"
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
