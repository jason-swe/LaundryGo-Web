import { useEffect, useMemo, useState } from 'react'
import { useLocation, useNavigate, useParams } from 'react-router-dom'
import './PicanDeli.css'

function PicanDeli() {
  const navigate = useNavigate()
  const { id } = useParams()
  const { state } = useLocation()

  const today = useMemo(() => new Date(), [])

  const allTimeSlots = ['09:00 AM-11:00 AM', '11:00 AM-01:00 PM', '01:00 PM-03:00 PM']

  const parseTimeToMinutes = (timeStr) => {
    const [time, period] = timeStr.split(' ')
    let [hours, minutes] = time.split(':').map(Number)
    if (period === 'PM' && hours !== 12) hours += 12
    if (period === 'AM' && hours === 12) hours = 0
    return hours * 60 + minutes
  }

  const getAvailableTimeSlots = (dateOffset) => {
    const isToday = dateOffset === 0
    if (!isToday) return allTimeSlots

    const now = new Date()
    const currentMinutes = now.getHours() * 60 + now.getMinutes()
    return allTimeSlots.filter((slot) => {
      const slotStartMinutes = parseTimeToMinutes(slot.split('-')[0])
      return slotStartMinutes > currentMinutes
    })
  }

  const formatDateLabel = (date) => {
    const weekdays = ['SUN', 'MON', 'TUE', 'WED', 'THU', 'FRI', 'SAT']
    const months = ['JAN', 'FEB', 'MAR', 'APR', 'MAY', 'JUN', 'JUL', 'AUG', 'SEP', 'OCT', 'NOV', 'DEC']
    return `${weekdays[date.getDay()]} ${date.getDate()} ${months[date.getMonth()]}`
  }

  const pickupDateOptions = useMemo(
    () =>
      [0, 1, 2].map((offset) => {
        const date = new Date(today)
        date.setDate(today.getDate() + offset)
        return {
          key: offset,
          label: formatDateLabel(date),
        }
      }),
    [today]
  )

  const [selectedPickupOffset, setSelectedPickupOffset] = useState(0)
  const [selectedDeliveryIndex, setSelectedDeliveryIndex] = useState(0)

  const deliveryDateOptions = useMemo(
    () =>
      [1, 2, 3].map((offset) => {
        const date = new Date(today)
        date.setDate(today.getDate() + selectedPickupOffset + offset)
        return {
          key: `${selectedPickupOffset}-${offset}`,
          label: formatDateLabel(date),
        }
      }),
    [today, selectedPickupOffset]
  )

  const pickupTimeSlots = useMemo(
    () => getAvailableTimeSlots(selectedPickupOffset),
    [selectedPickupOffset]
  )

  const deliveryTimeSlots = useMemo(
    () =>
      getAvailableTimeSlots(selectedPickupOffset + selectedDeliveryIndex + 1),
    [selectedPickupOffset, selectedDeliveryIndex]
  )

  useEffect(() => {
    setSelectedDeliveryIndex(0)
  }, [selectedPickupOffset])

  useEffect(() => {
    if (!pickupTimeSlots.includes(pickupTime)) {
      setPickupTime(pickupTimeSlots[0] || '09:00 AM-11:00 AM')
    }
  }, [pickupTimeSlots])

  useEffect(() => {
    if (!deliveryTimeSlots.includes(deliveryTime)) {
      setDeliveryTime(deliveryTimeSlots[0] || '09:00 AM-11:00 AM')
    }
  }, [deliveryTimeSlots])

  const [addresses, setAddresses] = useState([
    {
      id: 'ADDR-HOME',
      type: 'HOME',
      title: 'S3.03 Vinhomes Grand Park',
      line: 'Thu Duc city, HCMC',
      note: 'Primary Address',
    },
    {
      id: 'ADDR-WORK',
      type: 'WORK',
      title: 'Gate 1, FPT University',
      line: 'E2a-7 D1 St, High-tech park, HCMC',
      note: 'Default Work Location',
    },
  ])
  const [selectedAddress, setSelectedAddress] = useState('ADDR-HOME')
  const [showAddAddress, setShowAddAddress] = useState(false)
  const [newAddress, setNewAddress] = useState({
    type: 'OTHER',
    title: '',
    line: '',
    note: '',
  })

  const [pickupTime, setPickupTime] = useState('09:00 AM-11:00 AM')
  const [deliveryTime, setDeliveryTime] = useState('09:00 AM-11:00 AM')
  const [paymentMethod, setPaymentMethod] = useState('card')
  const [voucherCode, setVoucherCode] = useState('')
  const [appliedVoucher, setAppliedVoucher] = useState(null)

  const formatVnd = (value) =>
    value.toString().replace(/\B(?=(\d{3})+(?!\d))/g, '.')

  const defaultSummary = [
    { label: 'Everyday Wear', count: 5, total: 35000 },
    { label: 'Two-piece Suit', count: 1, total: 35000 },
  ]

  const itemsFromCart = state?.cart
    ? Object.entries(state.cart).map(([label, data]) => ({
        label,
        count: data.count,
        total: data.count * data.price,
      }))
    : []

  const summaryItems = itemsFromCart.length > 0 ? itemsFromCart : defaultSummary
  const subtotal =
    state?.subtotal ?? summaryItems.reduce((sum, item) => sum + item.total, 0)
  const pickupFee = state?.pickupFee ?? (subtotal > 0 ? 15000 : 0)
  const voucherConfigs = {
    SAVE10: { type: 'percent', value: 10, label: '10% OFF' },
    SAVE20: { type: 'percent', value: 20, label: '20% OFF' },
    FLAT15000: { type: 'fixed', value: 15000, label: '15,000 VND OFF' },
    FREESHIP: { type: 'shipping', value: pickupFee, label: 'FREE PICKUP & DELIVERY' },
  }

  const calculateDiscount = () => {
    if (!appliedVoucher) return 0
    if (appliedVoucher.type === 'percent') {
      return Math.round((subtotal * appliedVoucher.value) / 100)
    }
    if (appliedVoucher.type === 'shipping') {
      return pickupFee
    }
    return Math.min(appliedVoucher.value, subtotal + pickupFee)
  }

  const discountValue = calculateDiscount()
  const estimated = Math.max((state?.estimated ?? subtotal + pickupFee) - discountValue, 0)

  const applyVoucher = () => {
    const normalized = voucherCode.trim().toUpperCase()
    setAppliedVoucher(voucherConfigs[normalized] || null)
  }

  const updateNewAddress = (field, value) => {
    setNewAddress((prev) => ({
      ...prev,
      [field]: value,
    }))
  }

  const addAddress = () => {
    const payload = {
      type: newAddress.type.trim(),
      title: newAddress.title.trim(),
      line: newAddress.line.trim(),
      note: newAddress.note.trim(),
    }

    if (!payload.type || !payload.title || !payload.line || !payload.note) {
      return
    }

    const idSuffix = String(Date.now()).slice(-6)
    const nextAddress = {
      id: `ADDR-${idSuffix}`,
      ...payload,
    }

    setAddresses((prev) => [...prev, nextAddress])
    setSelectedAddress(nextAddress.id)
    setNewAddress({
      type: 'OTHER',
      title: '',
      line: '',
      note: '',
    })
    setShowAddAddress(false)
  }

  const selectedAddressData = addresses.find((address) => address.id === selectedAddress)
  const pickupDate = pickupDateOptions[selectedPickupOffset]?.label || pickupDateOptions[0].label
  const deliveryDate =
    deliveryDateOptions[selectedDeliveryIndex]?.label || deliveryDateOptions[0].label

  return (
    <div className="pican-page">
      <header className="pican-topbar">
        <div className="pican-topbar-inner">
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

          <div className="pican-steps">
            <span className="step is-active">1</span>
            <span className="step-label">Details</span>
            <span className="step is-active is-current">2</span>
            <span className="step-label">Schedule</span>
            <span className="step">3</span>
            <span className="step-label">Payment</span>
          </div>

          <div className="pican-user" onClick={() => navigate(`/all-shops/${id}`)}>
            <span className="pican-user-icon">👤</span>
            <span>EXE101</span>
          </div>
        </div>
      </header>

      <main className="pican-main">
        <section className="pican-left">
          <div className="pican-card">
            <div className="card-head">
              <h2>Pickup & Delivery Address</h2>
              <button
                type="button"
                className="link-btn"
                onClick={() => setShowAddAddress((prev) => !prev)}
              >
                + ADD NEW
              </button>
            </div>

            {showAddAddress && (
              <div className="add-address-form">
                <div className="add-address-grid">
                  <input
                    value={newAddress.type}
                    onChange={(event) => updateNewAddress('type', event.target.value)}
                    placeholder="Type (HOME/WORK/OTHER)"
                  />
                  <input
                    value={newAddress.title}
                    onChange={(event) => updateNewAddress('title', event.target.value)}
                    placeholder="Address Title"
                  />
                  <input
                    value={newAddress.line}
                    onChange={(event) => updateNewAddress('line', event.target.value)}
                    placeholder="Address Line"
                  />
                  <input
                    value={newAddress.note}
                    onChange={(event) => updateNewAddress('note', event.target.value)}
                    placeholder="Address Note"
                  />
                </div>
                <div className="add-address-actions">
                  <button type="button" className="small-outline-btn" onClick={addAddress}>
                    Save Address
                  </button>
                </div>
              </div>
            )}

            <div className="address-grid">
              {addresses.map((address) => (
                <button
                  key={address.id}
                  type="button"
                  className={`address-box ${selectedAddress === address.id ? 'selected' : ''}`}
                  onClick={() => setSelectedAddress(address.id)}
                >
                  <p className="address-type">{address.type}</p>
                  <p className="address-title">{address.title}</p>
                  <p className="address-line">{address.line}</p>
                  <p className="address-note">{address.note}</p>
                </button>
              ))}
            </div>
          </div>

          <div className="pican-card">
            <h2>Schedule Your Service</h2>
            <div className="schedule-grid">
              <div>
                <p className="schedule-label">PICKUP</p>
                <div className="date-row">
                  {pickupDateOptions.map((option) => (
                    <button
                      key={option.key}
                      type="button"
                      className={`date-pill ${selectedPickupOffset === option.key ? 'active' : ''}`}
                      onClick={() => setSelectedPickupOffset(option.key)}
                    >
                      {option.label.split(' ').map((part) => (
                        <span key={`${option.label}-${part}`}>{part}<br /></span>
                      ))}
                    </button>
                  ))}
                </div>
                <select
                  className="time-select"
                  value={pickupTime}
                  onChange={(e) => setPickupTime(e.target.value)}
                >
                  {pickupTimeSlots.map((slot) => (
                    <option key={slot} value={slot}>
                      {slot}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <p className="schedule-label">DELIVERY</p>
                <div className="date-row">
                  {deliveryDateOptions.map((option, index) => (
                    <button
                      key={option.key}
                      type="button"
                      className={`date-pill ${selectedDeliveryIndex === index ? 'active' : ''}`}
                      onClick={() => setSelectedDeliveryIndex(index)}
                    >
                      {option.label.split(' ').map((part) => (
                        <span key={`${option.label}-${part}`}>{part}<br /></span>
                      ))}
                    </button>
                  ))}
                </div>
                <select
                  className="time-select"
                  value={deliveryTime}
                  onChange={(e) => setDeliveryTime(e.target.value)}
                >
                  {deliveryTimeSlots.map((slot) => (
                    <option key={slot} value={slot}>
                      {slot}
                    </option>
                  ))}
                </select>
              </div>
            </div>
          </div>

          <div className="pican-card">
            <h2>Payment Method</h2>
            <div className="payment-grid">
              <button
                type="button"
                className={`pay-card ${paymentMethod === 'card' ? 'active' : ''}`}
                onClick={() => setPaymentMethod('card')}
              >
                <span>Debit/Credit Card</span>
              </button>
              <button
                type="button"
                className={`pay-card ${paymentMethod === 'wallet' ? 'active' : ''}`}
                onClick={() => setPaymentMethod('wallet')}
              >
                <span>E-Wallet</span>
              </button>
              <button
                type="button"
                className={`pay-card ${paymentMethod === 'cash' ? 'active' : ''}`}
                onClick={() => setPaymentMethod('cash')}
              >
                <span>Cash (COD)</span>
              </button>
            </div>

            {paymentMethod === 'card' && (
              <div className="saved-card">
                <div>
                  <p className="saved-name">Visa Card ****5423</p>
                  <p className="saved-exp">Expires 12/28</p>
                </div>
                <button className="link-btn" type="button">Change</button>
              </div>
            )}

            {paymentMethod === 'wallet' && (
              <div className="wallet-qr-box">
                <p className="wallet-qr-title">Scan QR to pay (mock)</p>
                <img
                  src="https://api.qrserver.com/v1/create-qr-code/?size=180x180&data=EXE101-MOCK-EWALLET-PAYMENT"
                  alt="Mock E-wallet QR"
                />
                <p className="wallet-qr-note">VNPay API will be integrated later.</p>
              </div>
            )}

            {paymentMethod === 'cash' && (
              <div className="cod-note-box">
                This order will be paid when you receive your laundry.
              </div>
            )}
          </div>
        </section>

        <aside className="pican-right">
          <div className="pican-card order-card">
            <h3>ORDER SUMMARY</h3>
            {summaryItems.map((item) => (
              <div className="summary-line" key={item.label}>
                <span>
                  <b>{item.count}x</b> {item.label}
                </span>
                <span>{formatVnd(item.total)}VND</span>
              </div>
            ))}
            <div className="summary-line">
              <span>Subtotal</span>
              <span>{formatVnd(subtotal)}VND</span>
            </div>
            <div className="summary-line">
              <span>Pickup & Delivery</span>
              <span>{formatVnd(pickupFee)}VND</span>
            </div>
            <div className="voucher-row">
              <input
                className="voucher-input"
                value={voucherCode}
                onChange={(event) => setVoucherCode(event.target.value)}
                placeholder="Add voucher code (SAVE10, SAVE20, FLAT15000, FREESHIP)"
              />
              <button type="button" className="voucher-apply-btn" onClick={applyVoucher}>
                Apply
              </button>
            </div>

            {appliedVoucher ? (
              <div className="summary-line discount-line">
                <span>Discount ({appliedVoucher.label})</span>
                <span>-{formatVnd(discountValue)}VND</span>
              </div>
            ) : (
              voucherCode.trim() !== '' && (
                <p className="voucher-error">Voucher is invalid. Try another code.</p>
              )
            )}
            <div className="summary-line total">
              <span>Estimated Total</span>
              <span>{formatVnd(estimated)}VND</span>
            </div>
            <button
              className="confirm-btn"
              onClick={() =>
                navigate(`/all-shops/${id}/confirm`, {
                  state: {
                    pickupDate,
                    pickupTime,
                    deliveryDate,
                    deliveryTime,
                    addressType: selectedAddressData?.type || 'HOME',
                    paymentMethod,
                    voucherCode: appliedVoucher?.label || null,
                    estimated,
                  },
                })
              }
            >
              Confirm Order
            </button>
          </div>

          <div className="pican-card">
            <h3>SPECIAL INSTRUCTIONS</h3>
            <input
              className="instruction-input"
              placeholder="e.g: Ring doorbell, cold wash only..."
            />
          </div>
        </aside>
      </main>
    </div>
  )
}

export default PicanDeli
