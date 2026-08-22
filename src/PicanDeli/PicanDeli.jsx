import { createElement, useCallback, useEffect, useMemo, useState } from 'react'
import { useLocation, useNavigate, useParams } from 'react-router-dom'
import {
  AlertCircle,
  CalendarDays,
  Banknote,
  ChevronLeft,
  CheckCircle2,
  Clock,
  Home,
  MapPin,
  Pencil,
  Plus,
  QrCode,
  Shirt,
  Trash2,
} from 'lucide-react'
import UserNavbar from '../components/UserNavbar'
import ConfirmDialog from '../components/ConfirmDialog/ConfirmDialog'
import { localizePath, useTranslation } from '../shared/lib/i18n'
import { translateServiceCopy } from '../shared/lib/i18n/serviceCopy'
import { createOrderFromCart, getCart } from '../services/cartApi'
import {
  createDeliveryAddress,
  deleteDeliveryAddress,
  getDeliveryAddresses,
  getDeliveryDates,
  getDeliverySlots,
  getOrderSummary,
  getPickupDates,
  getPickupSlots,
  updateDeliveryAddress,
} from '../services/bookingApi'
import './PicanDeli.css'

const formatVnd = (value) => String(Math.round(Number(value || 0))).replace(/\B(?=(\d{3})+(?!\d))/g, '.')

const formatDateLabel = (dateValue, language) => {
  if (!dateValue) return ''
  const date = new Date(`${dateValue}T00:00:00`)
  if (Number.isNaN(date.getTime())) return dateValue
  return new Intl.DateTimeFormat(language === 'vi' ? 'vi-VN' : 'en-US', {
    weekday: 'short',
    day: '2-digit',
    month: 'short',
  }).format(date)
}

const getFriendlyError = (error, fallback) => {
  const message = error?.message
  if (!message || message === 'Request failed') return fallback
  return message
}

const isCartMissingError = (error) => String(error?.message || '').toLowerCase().includes('cart item not found')

const mapAddressToView = (address) => ({
  id: address.id,
  type: address.isDefault ? 'DEFAULT' : 'OTHER',
  title: address.receiverName || address.addressLine,
  line: [address.addressLine, address.district, address.city].filter(Boolean).join(', '),
  note: address.phone || '',
  receiverName: address.receiverName || '',
  phone: address.phone || '',
  addressLine: address.addressLine || '',
  city: address.city || '',
  district: address.district || '',
  isDefault: Boolean(address.isDefault),
})

const toOrderItems = (cart) =>
  Object.values(cart || {})
    .map((item) => ({
      serviceId: Number(item.serviceId),
      quantity: Number(item.count || 0),
    }))
    .filter((item) => Number.isInteger(item.serviceId) && item.serviceId > 0 && item.quantity > 0)

function PicanDeli() {
  const navigate = useNavigate()
  const { id } = useParams()
  const location = useLocation()
  const { state } = location
  const { language, t } = useTranslation()

  const [flowCart, setFlowCart] = useState(state?.cart || null)
  const orderItems = useMemo(() => toOrderItems(flowCart), [flowCart])
  const rawCartItemCount = Object.values(flowCart || {}).filter((item) => Number(item.count || 0) > 0).length
  const hasInvalidCartItems = rawCartItemCount > 0 && orderItems.length !== rawCartItemCount

  const [addresses, setAddresses] = useState([])
  const [selectedAddress, setSelectedAddress] = useState('')
  const [showAddAddress, setShowAddAddress] = useState(false)
  const [editingAddressId, setEditingAddressId] = useState(null)
  const [addressError, setAddressError] = useState('')
  const [newAddress, setNewAddress] = useState({
    receiverName: '',
    phone: '',
    addressLine: '',
    city: '',
    district: '',
    isDefault: false,
  })

  const [pickupDates, setPickupDates] = useState([])
  const [unavailablePickupDates, setUnavailablePickupDates] = useState([])
  const [pickupSlots, setPickupSlots] = useState([])
  const [deliveryDates, setDeliveryDates] = useState([])
  const [deliverySlots, setDeliverySlots] = useState([])
  const [selectedPickupDate, setSelectedPickupDate] = useState('')
  const [selectedPickupSlot, setSelectedPickupSlot] = useState('')
  const [selectedDeliveryDate, setSelectedDeliveryDate] = useState('')
  const [selectedDeliverySlot, setSelectedDeliverySlot] = useState('')

  const [paymentMethod, setPaymentMethod] = useState('CASH')
  const [instructions, setInstructions] = useState('')
  const [orderSummary, setOrderSummary] = useState(null)

  const [isLoadingAddresses, setIsLoadingAddresses] = useState(true)
  const [isSavingAddress, setIsSavingAddress] = useState(false)
  const [isLoadingPickupDates, setIsLoadingPickupDates] = useState(true)
  const [isLoadingPickupSlots, setIsLoadingPickupSlots] = useState(false)
  const [isLoadingDeliveryDates, setIsLoadingDeliveryDates] = useState(false)
  const [isLoadingDeliverySlots, setIsLoadingDeliverySlots] = useState(false)
  const [isLoadingSummary, setIsLoadingSummary] = useState(false)
  const [isCreatingOrder, setIsCreatingOrder] = useState(false)
  const [addressActionId, setAddressActionId] = useState(null)
  const [addressLoadError, setAddressLoadError] = useState('')
  const [scheduleError, setScheduleError] = useState('')
  const [summaryError, setSummaryError] = useState('')
  const [submitError, setSubmitError] = useState('')
  const [confirmDialog, setConfirmDialog] = useState(null)

  const findFirstAvailableSchedule = useCallback(async (dates) => {
    const unavailableDates = []

    for (const dateOption of dates || []) {
      const pickupDate = dateOption?.date
      if (!pickupDate) continue

      const slots = await getPickupSlots(pickupDate)
      let hasCompleteSchedule = false
      for (const pickupSlotOption of slots || []) {
        const pickupSlot = pickupSlotOption?.slot
        if (!pickupSlot) continue

        const datesForDelivery = await getDeliveryDates(pickupDate, pickupSlot)
        for (const deliveryDateOption of datesForDelivery || []) {
          const deliveryDate = deliveryDateOption?.date
          if (!deliveryDate) continue

          const slotsForDelivery = await getDeliverySlots(pickupDate, pickupSlot, deliveryDate)
          const deliverySlot = slotsForDelivery?.[0]?.slot
          if (deliverySlot) {
            hasCompleteSchedule = true
            return {
              schedule: {
                pickupDate,
                pickupSlots: slots,
                pickupSlot,
                deliveryDates: datesForDelivery,
                deliveryDate,
                deliverySlots: slotsForDelivery,
                deliverySlot,
              },
              unavailableDates,
            }
          }
        }
      }

      if (!hasCompleteSchedule) unavailableDates.push(pickupDate)
    }

    return { schedule: null, unavailableDates }
  }, [])

  useEffect(() => {
    let active = true

    const loadInitialData = async () => {
      setIsLoadingAddresses(true)
      setIsLoadingPickupDates(true)
      setAddressLoadError('')
      setScheduleError('')

      const [addressResult, pickupDateResult, cartResult] = await Promise.allSettled([
        getDeliveryAddresses(),
        getPickupDates(),
        getCart(),
      ])

      if (!active) return

      if (addressResult.status === 'fulfilled') {
        const mappedAddresses = addressResult.value.map(mapAddressToView)
        setAddresses(mappedAddresses)
        setSelectedAddress(String(mappedAddresses.find((address) => address.isDefault)?.id || mappedAddresses[0]?.id || ''))
      } else {
        setAddressLoadError(getFriendlyError(addressResult.reason, t('schedule.addressLoadFailed')))
      }

      if (pickupDateResult.status === 'fulfilled') {
        const dates = Array.isArray(pickupDateResult.value) ? pickupDateResult.value : []
        setPickupDates(dates)
        try {
          const { schedule: availableSchedule, unavailableDates } = await findFirstAvailableSchedule(dates)
          if (active) setUnavailablePickupDates(unavailableDates)
          if (active && availableSchedule) {
            setPickupSlots(availableSchedule.pickupSlots)
            setSelectedPickupDate(availableSchedule.pickupDate)
            setSelectedPickupSlot(availableSchedule.pickupSlot)
            setDeliveryDates(availableSchedule.deliveryDates)
            setSelectedDeliveryDate(availableSchedule.deliveryDate)
            setDeliverySlots(availableSchedule.deliverySlots)
            setSelectedDeliverySlot(availableSchedule.deliverySlot)
          } else if (active) {
            setSelectedPickupDate('')
            setSelectedPickupSlot('')
            setSelectedDeliveryDate('')
            setSelectedDeliverySlot('')
          }
        } catch (error) {
          if (active) setScheduleError(getFriendlyError(error, t('schedule.scheduleLoadFailed')))
        }
      } else {
        setScheduleError(getFriendlyError(pickupDateResult.reason, t('schedule.scheduleLoadFailed')))
      }

      if (cartResult.status === 'fulfilled') {
        setFlowCart(String(cartResult.value?.shopId) === String(id) ? cartResult.value.cart || {} : null)
      } else {
        setFlowCart(null)
        setSummaryError(getFriendlyError(cartResult.reason, t('schedule.emptyCart')))
      }

      setIsLoadingAddresses(false)
      setIsLoadingPickupDates(false)
    }

    loadInitialData()

    return () => {
      active = false
    }
  }, [findFirstAvailableSchedule, id, t])

  useEffect(() => {
    if (!selectedPickupDate) {
      setPickupSlots([])
      setSelectedPickupSlot('')
      return
    }

    let active = true
    setIsLoadingPickupSlots(true)
    setScheduleError('')

    getPickupSlots(selectedPickupDate)
      .then((slots) => {
        if (!active) return
        setPickupSlots(slots)
        setSelectedPickupSlot((current) => (
          slots.some((slot) => slot.slot === current) ? current : slots[0]?.slot || ''
        ))
      })
      .catch((error) => {
        if (active) setScheduleError(getFriendlyError(error, t('schedule.scheduleLoadFailed')))
      })
      .finally(() => {
        if (active) setIsLoadingPickupSlots(false)
      })

    return () => {
      active = false
    }
  }, [selectedPickupDate, t])

  useEffect(() => {
    if (!selectedPickupDate || !selectedPickupSlot) {
      setDeliveryDates([])
      setSelectedDeliveryDate('')
      return
    }

    let active = true
    setIsLoadingDeliveryDates(true)
    setScheduleError('')

    getDeliveryDates(selectedPickupDate, selectedPickupSlot)
      .then((dates) => {
        if (!active) return
        setDeliveryDates(dates)
        setSelectedDeliveryDate((current) => (
          dates.some((date) => date.date === current) ? current : dates[0]?.date || ''
        ))
      })
      .catch((error) => {
        if (active) setScheduleError(getFriendlyError(error, t('schedule.scheduleLoadFailed')))
      })
      .finally(() => {
        if (active) setIsLoadingDeliveryDates(false)
      })

    return () => {
      active = false
    }
  }, [selectedPickupDate, selectedPickupSlot, t])

  useEffect(() => {
    if (!selectedPickupDate || !selectedPickupSlot || !selectedDeliveryDate) {
      setDeliverySlots([])
      setSelectedDeliverySlot('')
      return
    }

    let active = true
    setIsLoadingDeliverySlots(true)
    setScheduleError('')

    getDeliverySlots(selectedPickupDate, selectedPickupSlot, selectedDeliveryDate)
      .then((slots) => {
        if (!active) return
        setDeliverySlots(slots)
        setSelectedDeliverySlot((current) => (
          slots.some((slot) => slot.slot === current) ? current : slots[0]?.slot || ''
        ))
      })
      .catch((error) => {
        if (active) setScheduleError(getFriendlyError(error, t('schedule.scheduleLoadFailed')))
      })
      .finally(() => {
        if (active) setIsLoadingDeliverySlots(false)
      })

    return () => {
      active = false
    }
  }, [selectedPickupDate, selectedPickupSlot, selectedDeliveryDate, t])

  useEffect(() => {
    if (!orderItems.length || hasInvalidCartItems) {
      setOrderSummary(null)
      return
    }

    let active = true
    setIsLoadingSummary(true)
    setSummaryError('')

    getOrderSummary(orderItems)
      .then((summary) => {
        if (active) setOrderSummary(summary)
      })
      .catch((error) => {
        if (active) setSummaryError(getFriendlyError(error, t('schedule.summaryFailed')))
      })
      .finally(() => {
        if (active) setIsLoadingSummary(false)
      })

    return () => {
      active = false
    }
  }, [orderItems, hasInvalidCartItems, t])

  const selectedAddressData = addresses.find((address) => String(address.id) === String(selectedAddress))
  const selectedPickupSlotData = pickupSlots.find((slot) => slot.slot === selectedPickupSlot)
  const selectedDeliverySlotData = deliverySlots.find((slot) => slot.slot === selectedDeliverySlot)
  const unavailablePickupDateSet = useMemo(() => new Set(unavailablePickupDates), [unavailablePickupDates])
  const hasCart = orderItems.length > 0 && !hasInvalidCartItems
  const hasPickupSlot = Boolean(selectedPickupDate && selectedPickupSlot)
  const hasDeliverySlot = Boolean(selectedDeliveryDate && selectedDeliverySlot)
  const canConfirm =
    hasCart &&
    selectedAddressData &&
    hasPickupSlot &&
    hasDeliverySlot &&
     !summaryError &&
     !isCreatingOrder &&
     !isLoadingSummary &&
    !isLoadingPickupSlots &&
    !isLoadingDeliveryDates &&
    !isLoadingDeliverySlots

  const summaryItems = useMemo(() => {
    if (orderSummary?.items?.length) {
      return orderSummary.items.map((item) => ({
        label: item.serviceName || `Service #${item.serviceId}`,
        count: item.quantity,
        unitPrice: Number(item.unitPrice || 0),
        pricingType: String(item.serviceUnit || '').toLowerCase().includes('kg') ? 'kg' : 'item',
        displayLabel: item.serviceName || `Service #${item.serviceId}`,
      }))
    }

    return flowCart
      ? Object.entries(flowCart).map(([label, data]) => ({
        label,
        count: data.count,
        unitPrice: data.price,
        pricingType: data.pricingType || (label.includes('(per kg)') ? 'kg' : 'item'),
        displayLabel: translateServiceCopy(t, label, 'label', label),
      }))
      : []
  }, [flowCart, orderSummary, t])

  const subtotal =
    Number(orderSummary?.subtotal || 0) ||
    summaryItems.reduce((total, item) => total + item.count * item.unitPrice, 0)

  const updateNewAddress = (field, value) => {
    setAddressError('')
    setNewAddress((prev) => ({
      ...prev,
      [field]: value,
    }))
  }

  const resetAddressForm = () => {
    setEditingAddressId(null)
    setNewAddress({
      receiverName: '',
      phone: '',
      addressLine: '',
      city: '',
      district: '',
      isDefault: false,
    })
    setAddressError('')
  }

  const startAddAddress = () => {
    resetAddressForm()
    setShowAddAddress((prev) => !prev)
  }

  const startEditAddress = (address) => {
    setEditingAddressId(address.id)
    setNewAddress({
      receiverName: address.receiverName || '',
      phone: address.phone || '',
      addressLine: address.addressLine || '',
      city: address.city || '',
      district: address.district || '',
      isDefault: Boolean(address.isDefault),
    })
    setAddressError('')
    setShowAddAddress(true)
  }

  const saveAddress = async () => {
    const payload = {
      receiverName: newAddress.receiverName.trim(),
      phone: newAddress.phone.trim(),
      addressLine: newAddress.addressLine.trim(),
      city: newAddress.city.trim(),
      district: newAddress.district.trim(),
      isDefault: Boolean(newAddress.isDefault),
    }

    if (!payload.receiverName || !payload.phone || !payload.addressLine || !payload.city || !payload.district) {
      setAddressError(t('schedule.addressRequired'))
      return
    }

    setIsSavingAddress(true)
    try {
      const saved = editingAddressId
        ? await updateDeliveryAddress(editingAddressId, payload)
        : await createDeliveryAddress(payload)
      const nextAddress = mapAddressToView(saved)
      setAddresses((prev) => {
        const normalized = payload.isDefault
          ? prev.map((address) => ({ ...address, isDefault: false, type: 'OTHER' }))
          : prev
        const exists = normalized.some((address) => String(address.id) === String(nextAddress.id))
        return exists
          ? normalized.map((address) => String(address.id) === String(nextAddress.id) ? nextAddress : address)
          : [...normalized, nextAddress]
      })
      setSelectedAddress(String(nextAddress.id))
      resetAddressForm()
      setShowAddAddress(false)
    } catch (error) {
      setAddressError(getFriendlyError(error, t('schedule.addressSaveFailed')))
    } finally {
      setIsSavingAddress(false)
    }
  }

  const performDeleteAddress = async (address) => {
    setAddressActionId(address.id)
    setAddressError('')
    try {
      await deleteDeliveryAddress(address.id)
      setAddresses((prev) => {
        const remaining = prev.filter((item) => String(item.id) !== String(address.id))
        if (String(selectedAddress) === String(address.id)) {
          setSelectedAddress(String(remaining.find((item) => item.isDefault)?.id || remaining[0]?.id || ''))
        }
        return remaining
      })
      if (String(editingAddressId) === String(address.id)) {
        resetAddressForm()
        setShowAddAddress(false)
      }
    } catch (error) {
      setAddressError(getFriendlyError(error, t('schedule.addressDeleteFailed')))
    } finally {
      setAddressActionId(null)
    }
  }

  const deleteAddress = (address) => {
    setConfirmDialog({
      title: t('schedule.deleteAddressTitle'),
      message: t('schedule.deleteAddressConfirm'),
      confirmText: t('schedule.deleteAddressAction'),
      cancelText: t('common.cancel'),
      type: 'danger',
      onConfirm: async () => {
        setConfirmDialog(null)
        await performDeleteAddress(address)
      },
    })
  }

  const paymentOptions = [
    { id: 'CASH', label: t('schedule.cash'), Icon: Banknote },
    { id: 'BANK_TRANSFER', label: t('schedule.bankTransfer'), Icon: QrCode },
  ]

  const confirmOrder = async () => {
    if (!canConfirm) return

    setIsCreatingOrder(true)
    setSubmitError('')
    try {
      const orderPayload = {
        pickupAddressId: Number(selectedAddressData.id),
        deliveryAddressId: Number(selectedAddressData.id),
        pickupDate: selectedPickupDate,
        pickupSlot: selectedPickupSlot,
        deliveryDate: selectedDeliveryDate,
        deliverySlot: selectedDeliverySlot,
        paymentMethod,
        specialInstruction: instructions,
        note: '',
      }

      const order = await createOrderFromCart(orderPayload)

      navigate(localizePath(`/all-shops/${id}/confirm`, language), {
        state: {
          order,
          orderId: order?.orderCode || order?.orderId,
          orderNumericId: order?.orderId,
          pickupDate: order?.pickupDate || selectedPickupDate,
          pickupTime: order?.pickupSlotLabel || selectedPickupSlotData?.label || selectedPickupSlot,
          deliveryDate: order?.deliveryDate || selectedDeliveryDate,
          deliveryTime: order?.deliverySlotLabel || selectedDeliverySlotData?.label || selectedDeliverySlot,
          addressType: selectedAddressData.type,
          address: selectedAddressData,
          paymentMethod,
          paymentMethodLabel: order?.paymentMethodLabel,
          instructions,
          cart: flowCart,
          summary: orderSummary,
        },
      })
    } catch (error) {
      if (isCartMissingError(error)) {
        setFlowCart({})
        setOrderSummary(null)
        setSubmitError(t('schedule.cartAlreadyCheckedOut'))
      } else {
        setSubmitError(getFriendlyError(error, t('schedule.confirmFailed')))
      }
    } finally {
      setIsCreatingOrder(false)
    }
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
                  onClick={startAddAddress}
                >
                  <Plus size={15} strokeWidth={1.9} />
                  {t('schedule.addNew')}
                </button>
              </div>

              {showAddAddress && (
                <div className="add-address-form">
                  <div className="add-address-intro">
                    <div>
                      <strong>{t('schedule.addressFormTitle')}</strong>
                      <span>{editingAddressId ? t('schedule.addressEditHint') : t('schedule.addressFormHint')}</span>
                    </div>
                  </div>
                  <div className="add-address-grid">
                    <label>
                      <span>{t('schedule.receiverName')}</span>
                      <input
                        value={newAddress.receiverName}
                        onChange={(event) => updateNewAddress('receiverName', event.target.value)}
                        placeholder={t('schedule.receiverNamePlaceholder')}
                      />
                    </label>
                    <label>
                      <span>{t('schedule.phone')}</span>
                      <input
                        value={newAddress.phone}
                        onChange={(event) => updateNewAddress('phone', event.target.value)}
                        placeholder={t('schedule.phonePlaceholder')}
                      />
                    </label>
                    <label>
                      <span>{t('schedule.addressLine')}</span>
                      <input
                        value={newAddress.addressLine}
                        onChange={(event) => updateNewAddress('addressLine', event.target.value)}
                        placeholder={t('schedule.addressLinePlaceholder')}
                      />
                    </label>
                    <label>
                      <span>{t('schedule.district')}</span>
                      <input
                        value={newAddress.district}
                        onChange={(event) => updateNewAddress('district', event.target.value)}
                        placeholder={t('schedule.districtPlaceholder')}
                      />
                    </label>
                    <label>
                      <span>{t('schedule.city')}</span>
                      <input
                        value={newAddress.city}
                        onChange={(event) => updateNewAddress('city', event.target.value)}
                        placeholder={t('schedule.cityPlaceholder')}
                      />
                    </label>
                    <label className="pican-checkbox-label">
                      <input
                        type="checkbox"
                        checked={newAddress.isDefault}
                        onChange={(event) => updateNewAddress('isDefault', event.target.checked)}
                      />
                      <span>{t('schedule.defaultAddress')}</span>
                    </label>
                  </div>
                  {addressError && <p className="pican-inline-error">{addressError}</p>}
                  <div className="add-address-actions">
                    <button
                      type="button"
                      className="pican-ghost-btn"
                      onClick={() => {
                        resetAddressForm()
                        setShowAddAddress(false)
                      }}
                      disabled={isSavingAddress}
                    >
                      {t('common.cancel')}
                    </button>
                    <button type="button" className="pican-secondary-btn" onClick={saveAddress} disabled={isSavingAddress}>
                      {isSavingAddress ? t('common.loading') : t('schedule.saveAddress')}
                    </button>
                  </div>
                </div>
              )}

              {addressLoadError && (
                <div className="pican-alert" role="alert">
                  <AlertCircle size={16} strokeWidth={1.9} />
                  <span>{addressLoadError}</span>
                </div>
              )}

              {isLoadingAddresses ? (
                <div className="pican-skeleton-list" aria-label={t('schedule.loadingAddresses')}>
                  <span />
                  <span />
                </div>
              ) : addresses.length > 0 ? (
                <div className="address-grid">
                  {addresses.map((address) => (
                    <div
                      key={address.id}
                      role="button"
                      tabIndex={0}
                      className={`address-box ${String(selectedAddress) === String(address.id) ? 'selected' : ''}`}
                      onClick={() => setSelectedAddress(String(address.id))}
                      onKeyDown={(event) => {
                        if (event.key === 'Enter' || event.key === ' ') {
                          event.preventDefault()
                          setSelectedAddress(String(address.id))
                        }
                      }}
                    >
                      {String(selectedAddress) === String(address.id) && (
                        <span className="address-selected-mark">
                          <CheckCircle2 size={15} strokeWidth={2} />
                          {t('schedule.selectedAddress')}
                        </span>
                      )}
                      <span className="address-icon"><Home size={16} strokeWidth={1.8} /></span>
                      <p className="address-type">{address.isDefault ? t('schedule.defaultBadge') : t('schedule.savedBadge')}</p>
                      <p className="address-title">{address.title}</p>
                      <p className="address-line">{address.line}</p>
                      <p className="address-note">{address.note}</p>
                      <span className="address-actions">
                        <span
                          className="address-action-btn"
                          role="button"
                          tabIndex={0}
                          onClick={(event) => {
                            event.stopPropagation()
                            startEditAddress(address)
                          }}
                          onKeyDown={(event) => {
                            if (event.key === 'Enter' || event.key === ' ') {
                              event.preventDefault()
                              event.stopPropagation()
                              startEditAddress(address)
                            }
                          }}
                        >
                          <Pencil size={14} strokeWidth={1.9} />
                          {t('shopOperations.edit')}
                        </span>
                        <span
                          className="address-action-btn danger"
                          role="button"
                          tabIndex={0}
                          aria-disabled={addressActionId === address.id}
                          onClick={(event) => {
                            event.stopPropagation()
                            if (addressActionId !== address.id) deleteAddress(address)
                          }}
                          onKeyDown={(event) => {
                            if ((event.key === 'Enter' || event.key === ' ') && addressActionId !== address.id) {
                              event.preventDefault()
                              event.stopPropagation()
                              deleteAddress(address)
                            }
                          }}
                        >
                          <Trash2 size={14} strokeWidth={1.9} />
                          {t('shopOperations.delete')}
                        </span>
                      </span>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="schedule-empty-cart align-left">
                  <Home size={28} strokeWidth={1.5} />
                  <p>{t('schedule.noSavedAddresses')}</p>
                  <button type="button" className="pican-secondary-btn" onClick={() => setShowAddAddress(true)}>
                    <Plus size={15} strokeWidth={1.9} />
                    {t('schedule.addNew')}
                  </button>
                </div>
              )}
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
                    {pickupDates.map((option) => {
                      const isUnavailable = unavailablePickupDateSet.has(option.date)
                      return (
                        <button
                          key={option.date}
                          type="button"
                          className={`date-pill ${selectedPickupDate === option.date ? 'active' : ''}${isUnavailable ? ' disabled' : ''}`}
                          disabled={isUnavailable}
                          title={isUnavailable ? t('schedule.noPickupSlots') : undefined}
                          onClick={() => setSelectedPickupDate(option.date)}
                        >
                          {option.displayLabel || formatDateLabel(option.date, language)}
                        </button>
                      )
                    })}
                  </div>
                  {isLoadingPickupDates || isLoadingPickupSlots ? (
                    <div className="pican-skeleton-list compact" aria-label={t('schedule.loadingSlots')}>
                      <span />
                      <span />
                    </div>
                  ) : pickupSlots.length > 0 ? (
                    <div className="slot-grid">
                      {pickupSlots.map((slot) => (
                        <button
                          key={slot.slot}
                          type="button"
                          className={`slot-chip ${selectedPickupSlot === slot.slot ? 'active' : ''}`}
                          onClick={() => setSelectedPickupSlot(slot.slot)}
                        >
                          {slot.label || slot.slot}
                        </button>
                      ))}
                    </div>
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
                    {deliveryDates.map((option) => (
                      <button
                        key={option.date}
                        type="button"
                        className={`date-pill ${selectedDeliveryDate === option.date ? 'active' : ''}`}
                        onClick={() => setSelectedDeliveryDate(option.date)}
                      >
                        {option.displayLabel || formatDateLabel(option.date, language)}
                      </button>
                    ))}
                  </div>
                  {isLoadingDeliveryDates || isLoadingDeliverySlots ? (
                    <div className="pican-skeleton-list compact" aria-label={t('schedule.loadingSlots')}>
                      <span />
                      <span />
                    </div>
                  ) : deliverySlots.length > 0 ? (
                    <div className="slot-grid">
                      {deliverySlots.map((slot) => (
                        <button
                          key={slot.slot}
                          type="button"
                          className={`slot-chip ${selectedDeliverySlot === slot.slot ? 'active' : ''}`}
                          onClick={() => setSelectedDeliverySlot(slot.slot)}
                        >
                          {slot.label || slot.slot}
                        </button>
                      ))}
                    </div>
                  ) : (
                    <div className="slot-empty">{t('schedule.noDeliverySlots')}</div>
                  )}
                </div>
              </div>
              {scheduleError && <p className="pican-inline-error">{scheduleError}</p>}
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
              {paymentMethod === 'CASH' ? (
                <div className="wallet-qr-box">
                  <Banknote size={28} strokeWidth={1.8} />
                  <div>
                    <p>{t('schedule.codTitle')}</p>
                    <span>{t('schedule.codHint')}</span>
                  </div>
                </div>
              ) : (
                <div className="wallet-qr-box">
                  <QrCode size={28} strokeWidth={1.8} />
                  <div>
                    <p>{t('schedule.bankTransferTitle')}</p>
                    <span>{t('schedule.bankTransferHint')}</span>
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
                  <p>{hasInvalidCartItems ? t('schedule.missingServiceIds') : t('schedule.emptyCart')}</p>
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
                  {isLoadingSummary && <div className="slot-empty">{t('schedule.loadingSummary')}</div>}
                  <div className="summary-lines">
                    {summaryItems.map((item) => (
                      <div className="summary-line" key={`${item.label}-${item.unitPrice}`}>
                        <span>
                          <b>{item.count}x</b> {item.displayLabel}
                        </span>
                        <span>
                          {formatVnd(item.unitPrice)} VND/{item.pricingType === 'kg' ? t('shopDetail.unitKg') : t('shopDetail.unitItem')}
                        </span>
                      </div>
                    ))}
                  </div>
                  <div className="summary-line total">
                    <span>{t('track.subtotal')}</span>
                    <span>{formatVnd(subtotal)} VND</span>
                  </div>

                </>
              )}

              {summaryError && <p className="pican-inline-error">{summaryError}</p>}

              <div className="schedule-review">
                <div>
                  <MapPin size={15} strokeWidth={1.8} />
                  <span>{selectedAddressData?.title || t('schedule.noAddress')}</span>
                </div>
                <div>
                  <CalendarDays size={15} strokeWidth={1.8} />
                  <span>{formatDateLabel(selectedPickupDate, language) || t('schedule.noTime')} - {selectedPickupSlotData?.label || selectedPickupSlot || t('schedule.noTime')}</span>
                </div>
                <div>
                  <Clock size={15} strokeWidth={1.8} />
                  <span>{formatDateLabel(selectedDeliveryDate, language) || t('schedule.noTime')} - {selectedDeliverySlotData?.label || selectedDeliverySlot || t('schedule.noTime')}</span>
                </div>
              </div>

              <div className="pican-price-note">{orderSummary?.priceNote || t('shopDetail.priceNote')}</div>
              {submitError && <p className="pican-inline-error">{submitError}</p>}

              <button className="confirm-btn" type="button" disabled={!canConfirm} onClick={confirmOrder}>
                {isCreatingOrder ? t('schedule.creatingOrder') : t('schedule.confirmOrder')}
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
      {confirmDialog && (
        <ConfirmDialog
          title={confirmDialog.title}
          message={confirmDialog.message}
          confirmText={confirmDialog.confirmText}
          cancelText={confirmDialog.cancelText}
          type={confirmDialog.type}
          onConfirm={confirmDialog.onConfirm}
          onCancel={() => setConfirmDialog(null)}
        />
      )}
    </div>
  )
}

export default PicanDeli
