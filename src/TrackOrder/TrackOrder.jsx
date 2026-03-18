import { useLocation, useNavigate, useParams } from 'react-router-dom'
import '../LandingPage/LandingPage.css'
import './TrackOrder.css'

function TrackOrder() {
  const navigate = useNavigate()
  const { id } = useParams()
  const { state } = useLocation()

  const hasOrder = !!state?.orderId
  const orderId = state?.orderId || '#LG-98234'
  const pickupDate = state?.pickupDate || 'Tue, 25 Feb, 2026'
  const pickupTime = state?.pickupTime || '09:00 AM-11:00 AM'
  const currentStep = 2
  const steps = [
    { label: 'Placed Order', icon: '✓' },
    { label: 'Picked Up', icon: '✓' },
    { label: 'In Wash', icon: '⟳' },
    { label: 'Ready', icon: '⌛' },
    { label: 'Delivery', icon: '⇢' },
  ]
  const doneWidth = `${(currentStep / (steps.length - 1)) * 100}%`

  return (
    <div className="track-page">
      <header className="track-topbar">
        <div className="track-topbar-inner">
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

          <div className="track-user">
            <span className="track-user-icon">👤</span>
            <span>EXE101</span>
          </div>
        </div>
      </header>

      <main className="track-main">
        {!hasOrder ? (
          <div className="no-order-container">
            <div className="no-order-box">
              <div className="no-order-icon">📦</div>
              <h2 className="no-order-title">Chưa có đơn hàng</h2>
              <p className="no-order-desc">Bạn chưa đặt đơn hàng nào. Hãy quay lại cửa hàng để đặt đơn hàng.</p>
              <button
                className="no-order-btn"
                onClick={() => navigate('/all-shops')}
              >
                Quay lại cửa hàng
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
            <div className="card track-status-card">
              <div className="status-progress">
                <div className="status-track" />
                <div className="status-track done" style={{ width: doneWidth }} />
                <div className="status-steps">
                  {steps.map((step, index) => (
                    <div className="status-step" key={step.label}>
                      <span
                        className={`status-point ${index <= currentStep ? 'done' : ''} ${index === currentStep ? 'current' : ''}`}
                      >
                        {step.icon}
                      </span>
                      <span className="status-text">{step.label}</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            <div className="card track-fresh-card">
              <div className="fresh-icon">🧺</div>
              <p className="fresh-title">MAKING THEM FRESH</p>
              <p className="fresh-desc">
                Your clothes are being treated with eco-friendly detergents in our high-tech facility.
              </p>
            </div>

            <div className="card map-card">
              <div className="driver-chip">
                <strong>Marco S.</strong>
                <span>Your Delivery Partner</span>
              </div>
              <div className="map-pin">🚚</div>
              <div className="chat-btn">💬</div>
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
              <div className="sum-row"><span>5x Everyday Wear</span><span>35.000VND</span></div>
              <div className="sum-row"><span>1x Two-piece Suit</span><span>35.000VND</span></div>
              <div className="sum-row"><span>Subtotal</span><span>70.000VND</span></div>
              <div className="sum-row"><span>Pickup & Delivery</span><span>15.000VND</span></div>
              <div className="sum-row total"><span>Total</span><span>85.000VND</span></div>
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
