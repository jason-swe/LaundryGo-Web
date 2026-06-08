import { createElement, useMemo, useState } from 'react'
import { useLocation, useNavigate, useParams } from 'react-router-dom'
import {
  Banknote,
  CalendarDays,
  ChevronLeft,
  Clock,
  CreditCard,
  Home,
  MapPin,
  Plus,
  QrCode,
  Shirt,
  Wallet,
} from 'lucide-react'
import UserNavbar from '../components/UserNavbar'
import { localizePath, useTranslation } from '../shared/lib/i18n'
import { translateServiceCopy } from '../shared/lib/i18n/serviceCopy'
import { readPendingCart } from '../utils/pendingCart'
import './PicanDeli.css'

const ALL_TIME_SLOTS = [
  '09:00 AM-11:00 AM',
  '11:00 AM-01:00 PM',
  '01:00 PM-03:00 PM',
  '03:00 PM-05:00 PM',
  '05:00 PM-06:00 PM',
]

const ADDRESS_PRESETS = [
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
]

function PicanDeli() {
  const navigate = useNavigate()
  const { id } = useParams()
  const location = useLocation()
  const { state } = location
  const { language, t } = useTranslation()

  const pendingCart = readPendingCart()
  const flowCart = state?.cart || (pendingCart?.shopId === id ? pendingCart.cart : null)
  const today = useMemo(() => new Date(), [])

  const [addresses, setAddresses] = useState(ADDRESS_PRESETS)
  const [selectedAddress, setSelectedAddress] = useState('ADDR-HOME')
  const [showAddAddress, setShowAddAddress] = useState(false)
  const [addressError, setAddressError] = useState('')
  const [newAddress, setNewAddress] = useState({
    type: 'OTHER',
    title: '',
    line: '',
    note: '',
  })
  const [selectedPickupOffset, setSelectedPickupOffset] = useState(0)
  const [selectedDeliveryIndex, setSelectedDeliveryIndex] = useState(0)
  const [pickupTime, setPickupTime] = useState('09:00 AM-11:00 AM')
  const [deliveryTime, setDeliveryTime] = useState('09:00 AM-11:00 AM')
  const [paymentMethod, setPaymentMethod] = useState('card')
  const [instructions, setInstructions] = useState('')

  const parseTimeToMinutes = (timeStr) => {
    const [time, period] = timeStr.split(' ')
    let [hours, minutes] = time.split(':').map(Number)
    if (period === 'PM' && hours !== 12) hours += 12
    if (period === 'AM' && hours === 12) hours = 0
    return hours * 60 + minutes
  }

  const getAvailableTimeSlots = (dateOffset) => {
    if (dateOffset !== 0) return ALL_TIME_SLOTS

    const now = new Date()
    const currentMinutes = now.getHours() * 60 + now.getMinutes()
    return ALL_TIME_SLOTS.filter((slot) => parseTimeToMinutes(slot.split('-')[0]) > currentMinutes)
  }

  const formatDateLabel = (date) =>
    new Intl.DateTimeFormat(language === 'vi' ? 'vi-VN' : 'en-US', {
      weekday: 'short',
      day: '2-digit',
      month: 'short',
    }).format(date)

  const pickupDateOptions = [0, 1, 2].map((offset) => {
    const date = new Date(today)
    date.setDate(today.getDate() + offset)
    return {
      key: offset,
      label: formatDateLabel(date),
    }
  })

  const deliveryDateOptions = [1, 2, 3].map((offset) => {
    const date = new Date(today)
    date.setDate(today.getDate() + selectedPickupOffset + offset)
    return {
      key: `${selectedPickupOffset}-${offset}`,
      label: formatDateLabel(date),
    }
  })

  const pickupTimeSlots = getAvailableTimeSlots(selectedPickupOffset)
  const deliveryTimeSlots = getAvailableTimeSlots(selectedPickupOffset + selectedDeliveryIndex + 1)
  const effectivePickupTime = pickupTimeSlots.includes(pickupTime) ? pickupTime : pickupTimeSlots[0] || ''
  const effectiveDeliveryTime = deliveryTimeSlots.includes(deliveryTime) ? deliveryTime : deliveryTimeSlots[0] || ''

  const summaryItems = useMemo(
    () =>
      flowCart
        ? Object.entries(flowCart).map(([label, data]) => ({
          label,
          serviceId: data.serviceId,
          serviceName: data.serviceName || label,
          serviceUnit: data.serviceUnit,
          count: data.count,
          unitPrice: data.price,
          pricingType: data.pricingType || (label.includes('(per kg)') ? 'kg' : 'item'),
          displayLabel: translateServiceCopy(t, data.serviceName || label, 'label', data.serviceName || label),
        }))
        : [],
    [flowCart, t]
  )

  const selectedAddressData = addresses.find((address) => address.id === selectedAddress)
  const pickupDate = pickupDateOptions[selectedPickupOffset]?.label || pickupDateOptions[0]?.label || ''
  const deliveryDate = deliveryDateOptions[selectedDeliveryIndex]?.label || deliveryDateOptions[0]?.label || ''
  const subtotal = summaryItems.reduce((total, item) => total + item.count * item.unitPrice, 0)
  const orderId = `#LG-${id.replace(/\D/g, '').padStart(3, '0')}${summaryItems.length}${selectedPickupOffset}${selectedDeliveryIndex}`
  const hasCart = summaryItems.length > 0
  const hasPickupSlot = pickupTimeSlots.length > 0 && Boolean(effectivePickupTime)
  const hasDeliverySlot = deliveryTimeSlots.length > 0 && Boolean(effectiveDeliveryTime)
  const canConfirm = hasCart && selectedAddressData && hasPickupSlot && hasDeliverySlot

  const formatVnd = (value) => value.toString().replace(/\B(?=(\d{3})+(?!\d))/g, '.')

  const updateNewAddress = (field, value) => {
    setAddressError('')
    setNewAddress((prev) => ({
      ...prev,
      [field]: value,
    }))
  }

  const addAddress = () => {
    const payload = {
      type: newAddress.type.trim() || 'OTHER',
      title: newAddress.title.trim(),
      line: newAddress.line.trim(),
      note: newAddress.note.trim(),
    }

    if (!payload.title || !payload.line) {
      setAddressError(t('schedule.addressRequired'))
      return
    }

    const nextAddress = {
      id: `ADDR-${String(Date.now()).slice(-6)}`,
      ...payload,
      note: payload.note || t('schedule.customAddress'),
    }

    setAddresses((prev) => [...prev, nextAddress])
    setSelectedAddress(nextAddress.id)
    setNewAddress({
      type: 'OTHER',
      title: '',
      line: '',
      note: '',
    })
    setAddressError('')
    setShowAddAddress(false)
  }

  const paymentOptions = [
    { id: 'card', label: t('schedule.card'), Icon: CreditCard },
    { id: 'wallet', label: t('schedule.wallet'), Icon: Wallet },
    { id: 'cash', label: t('schedule.cash'), Icon: Banknote },
  ]

  const confirmOrder = () => {
    if (!canConfirm) return

    navigate(localizePath(`/all-shops/${id}/confirm`, language), {
      state: {
        pickupDate,
        pickupTime: effectivePickupTime,
        deliveryDate,
        deliveryTime: effectiveDeliveryTime,
        addressType: selectedAddressData.type,
        address: selectedAddressData,
        paymentMethod,
        instructions,
        cart: flowCart,
        orderId,
      },
    })
  }

  return (
    <div className="pican-page">
      <UserNavbar />

      <main className="pican-main">
        <section className="pican-hero">
          <button
            className="pican-back-btn"
            type="button"
            onClick={() => navigate(localizePath(`/all-shops/${id}`, language))}
          >
            <ChevronLeft size={16} strokeWidth={1.9} />
            {t('schedule.backToServices')}
          </button>
          <div>
            <span className="pican-eyebrow">{t('schedule.eyebrow')}</span>
            <h1>{t('schedule.title')}</h1>
            <p>{t('schedule.subtitle')}</p>
          </div>
          <div className="pican-stepper" aria-label={t('schedule.stepsLabel')}>
            <span className="pican-step is-done">1</span>
            <span className="pican-step-line" />
            <span className="pican-step is-current">2</span>
            <span className="pican-step-line" />
            <span className="pican-step">3</span>
          </div>
        </section>

        <div className="pican-layout">
          <section className="pican-left">
            <section className="pican-card">
              <div className="pican-card-head">
                <div>
                  <span className="pican-section-kicker">01</span>
                  <h2>{t('schedule.addressTitle')}</h2>
                </div>
                <button
                  type="button"
                  className="pican-link-btn"
                  onClick={() => setShowAddAddress((prev) => !prev)}
                >
                  <Plus size={15} strokeWidth={1.9} />
                  {t('schedule.addNew')}
                </button>
              </div>

              {showAddAddress && (
                <div className="add-address-form">
                  <div className="add-address-grid">
                    <label>
                      <span>{t('schedule.addressType')}</span>
                      <input
                        value={newAddress.type}
                        onChange={(event) => updateNewAddress('type', event.target.value)}
                        placeholder={t('schedule.addressTypePlaceholder')}
                      />
                    </label>
                    <label>
                      <span>{t('schedule.addressTitleField')}</span>
                      <input
                        value={newAddress.title}
                        onChange={(event) => updateNewAddress('title', event.target.value)}
                        placeholder={t('schedule.addressTitlePlaceholder')}
                      />
                    </label>
                    <label>
                      <span>{t('schedule.addressLine')}</span>
                      <input
                        value={newAddress.line}
                        onChange={(event) => updateNewAddress('line', event.target.value)}
                        placeholder={t('schedule.addressLinePlaceholder')}
                      />
                    </label>
                    <label>
                      <span>{t('schedule.addressNote')}</span>
                      <input
                        value={newAddress.note}
                        onChange={(event) => updateNewAddress('note', event.target.value)}
                        placeholder={t('schedule.addressNotePlaceholder')}
                      />
                    </label>
                  </div>
                  {addressError && <p className="pican-inline-error">{addressError}</p>}
                  <div className="add-address-actions">
                    <button type="button" className="pican-secondary-btn" onClick={addAddress}>
                      {t('schedule.saveAddress')}
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
                    <span className="address-icon"><Home size={16} strokeWidth={1.8} /></span>
                    <p className="address-type">{address.type}</p>
                    <p className="address-title">{address.title}</p>
                    <p className="address-line">{address.line}</p>
                    <p className="address-note">{address.note}</p>
                  </button>
                ))}
              </div>
            </section>

            <section className="pican-card">
              <div className="pican-card-head">
                <div>
                  <span className="pican-section-kicker">02</span>
                  <h2>{t('schedule.timeTitle')}</h2>
                </div>
              </div>

              <div className="schedule-grid">
                <div className="schedule-block">
                  <div className="schedule-block-head">
                    <CalendarDays size={17} strokeWidth={1.8} />
                    <span>{t('schedule.pickup')}</span>
                  </div>
                  <div className="date-row">
                    {pickupDateOptions.map((option) => (
                      <button
                        key={option.key}
                        type="button"
                        className={`date-pill ${selectedPickupOffset === option.key ? 'active' : ''}`}
                        onClick={() => {
                          setSelectedPickupOffset(option.key)
                          setSelectedDeliveryIndex(0)
                          setPickupTime('')
                          setDeliveryTime('')
                        }}
                      >
                        {option.label}
                      </button>
                    ))}
                  </div>
                  {pickupTimeSlots.length > 0 ? (
                    <select
                      className="time-select"
                      value={effectivePickupTime}
                      onChange={(event) => setPickupTime(event.target.value)}
                    >
                      {pickupTimeSlots.map((slot) => (
                        <option key={slot} value={slot}>{slot}</option>
                      ))}
                    </select>
                  ) : (
                    <div className="slot-empty">{t('schedule.noPickupSlots')}</div>
                  )}
                </div>

                <div className="schedule-block">
                  <div className="schedule-block-head">
                    <Clock size={17} strokeWidth={1.8} />
                    <span>{t('schedule.delivery')}</span>
                  </div>
                  <div className="date-row">
                    {deliveryDateOptions.map((option, index) => (
                      <button
                        key={option.key}
                        type="button"
                        className={`date-pill ${selectedDeliveryIndex === index ? 'active' : ''}`}
                        onClick={() => {
                          setSelectedDeliveryIndex(index)
                          setDeliveryTime('')
                        }}
                      >
                        {option.label}
                      </button>
                    ))}
                  </div>
                  {deliveryTimeSlots.length > 0 ? (
                    <select
                      className="time-select"
                      value={effectiveDeliveryTime}
                      onChange={(event) => setDeliveryTime(event.target.value)}
                    >
                      {deliveryTimeSlots.map((slot) => (
                        <option key={slot} value={slot}>{slot}</option>
                      ))}
                    </select>
                  ) : (
                    <div className="slot-empty">{t('schedule.noDeliverySlots')}</div>
                  )}
                </div>
              </div>
            </section>

            <section className="pican-card">
              <div className="pican-card-head">
                <div>
                  <span className="pican-section-kicker">03</span>
                  <h2>{t('schedule.paymentTitle')}</h2>
                </div>
              </div>

              <div className="payment-grid">
                {paymentOptions.map(({ id: methodId, label, Icon }) => (
                  <button
                    key={methodId}
                    type="button"
                    className={`pay-card ${paymentMethod === methodId ? 'active' : ''}`}
                    onClick={() => setPaymentMethod(methodId)}
                  >
                    {createElement(Icon, { size: 20, strokeWidth: 1.8 })}
                    <span>{label}</span>
                  </button>
                ))}
              </div>

              {paymentMethod === 'card' && (
                <div className="payment-note-box">
                  <CreditCard size={18} strokeWidth={1.8} />
                  <div>
                    <p>{t('schedule.savedCard')}</p>
                    <span>{t('schedule.cardHint')}</span>
                  </div>
                </div>
              )}

              {paymentMethod === 'wallet' && (
                <div className="wallet-qr-box">
                  <QrCode size={28} strokeWidth={1.8} />
                  <div>
                    <p>{t('schedule.walletTitle')}</p>
                    <span>{t('schedule.walletHint')}</span>
                  </div>
                </div>
              )}

              {paymentMethod === 'cash' && (
                <div className="payment-note-box">
                  <Banknote size={18} strokeWidth={1.8} />
                  <div>
                    <p>{t('schedule.codTitle')}</p>
                    <span>{t('schedule.codHint')}</span>
                  </div>
                </div>
              )}
            </section>
          </section>

          <aside className="pican-right">
            <section className="pican-card order-card">
              <div className="order-card-head">
                <Shirt size={17} strokeWidth={1.8} />
                <h3>{t('track.orderSummary')}</h3>
              </div>

              {!hasCart ? (
                <div className="schedule-empty-cart">
                  <Shirt size={30} strokeWidth={1.4} />
                  <p>{t('schedule.emptyCart')}</p>
                  <button
                    type="button"
                    className="pican-secondary-btn"
                    onClick={() => navigate(localizePath(`/all-shops/${id}`, language))}
                  >
                    {t('schedule.chooseServices')}
                  </button>
                </div>
              ) : (
                <>
                  <div className="summary-lines">
                    {summaryItems.map((item) => (
                      <div className="summary-line" key={item.label}>
                        <span>
                          <b>{item.count}x</b> {item.displayLabel}
                        </span>
                        <span>
                          {formatVnd(item.unitPrice)} đ/{item.pricingType === 'kg' ? t('shopDetail.unitKg') : t('shopDetail.unitItem')}
                        </span>
                      </div>
                    ))}
                  </div>
                  <div className="summary-line total">
                    <span>{t('track.subtotal')}</span>
                    <span>{formatVnd(subtotal)} đ</span>
                  </div>
                </>
              )}

              <div className="schedule-review">
                <div>
                  <MapPin size={15} strokeWidth={1.8} />
                  <span>{selectedAddressData?.title || t('schedule.noAddress')}</span>
                </div>
                <div>
                  <CalendarDays size={15} strokeWidth={1.8} />
                  <span>{pickupDate} · {effectivePickupTime || t('schedule.noTime')}</span>
                </div>
                <div>
                  <Clock size={15} strokeWidth={1.8} />
                  <span>{deliveryDate} · {effectiveDeliveryTime || t('schedule.noTime')}</span>
                </div>
              </div>

              <div className="pican-price-note">{t('shopDetail.priceNote')}</div>

              <button className="confirm-btn" type="button" disabled={!canConfirm} onClick={confirmOrder}>
                {t('schedule.confirmOrder')}
              </button>
            </section>

            <section className="pican-card instruction-card">
              <h3>{t('schedule.instructions')}</h3>
              <textarea
                className="instruction-input"
                value={instructions}
                onChange={(event) => setInstructions(event.target.value)}
                placeholder={t('schedule.instructionsPlaceholder')}
                rows={4}
              />
            </section>
          </aside>
        </div>
      </main>
    </div>
  )
}

export default PicanDeli
