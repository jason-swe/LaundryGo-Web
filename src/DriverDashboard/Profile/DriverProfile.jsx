import { useCallback, useEffect, useState } from 'react'
import {
    Calendar,
    CreditCard,
    Mail,
    MapPin,
    Phone,
    PhoneCall,
    ShieldCheck,
    Truck,
    User,
} from 'lucide-react'
import { getDriverProfile } from '../../services/driverApi'
import './DriverProfile.css'

function formatDate(value) {
    if (!value) return '—'
    const date = new Date(value)
    return Number.isNaN(date.getTime())
        ? String(value)
        : date.toLocaleDateString('en-US', { day: '2-digit', month: 'short', year: 'numeric' })
}

function displayValue(value) {
    return value || '—'
}

function maskAccountNumber(value) {
    if (!value) return '—'
    return `${'•'.repeat(Math.max(String(value).length - 4, 0))}${String(value).slice(-4)}`
}

function InfoRow({ Icon, label, value, className = '' }) {
    return (
        <div className="dp-info-row">
            <span className="dp-info-label">{Icon && <Icon size={13} />}{label}</span>
            <span className={`dp-info-value ${className}`}>{displayValue(value)}</span>
        </div>
    )
}

export default function DriverProfile() {
    const [profile, setProfile] = useState(null)
    const [loading, setLoading] = useState(true)
    const [error, setError] = useState('')

    const loadProfile = useCallback(async () => {
        setLoading(true)
        try {
            const data = await getDriverProfile()
            setProfile(data)
            setError('')
        } catch (requestError) {
            setProfile(null)
            setError(requestError?.message || 'Could not load your profile')
        } finally {
            setLoading(false)
        }
    }, [])

    useEffect(() => {
        loadProfile()
    }, [loadProfile])

    if (loading) {
        return <div className="dp-page"><div className="dp-card"><p>Loading profile…</p></div></div>
    }

    if (error) {
        return (
            <div className="dp-page">
                <div className="dp-card">
                    <div className="dp-card-head"><User size={16} /><span>Profile unavailable</span></div>
                    <p>{error}</p>
                    <button type="button" className="dp-area-chip" onClick={loadProfile}>Try again</button>
                </div>
            </div>
        )
    }

    if (!profile) {
        return <div className="dp-page"><div className="dp-card"><p>No profile is available for this account.</p></div></div>
    }

    const information = profile.shipperInformation || {}
    const bankAccount = profile.bankAccount || {}
    const isActive = String(profile.status || '').toUpperCase() === 'ACTIVE'

    return (
        <div className="dp-page">
            <div className="dp-hero">
                <div className="dp-hero-bg" />
                <div className="dp-hero-content">
                    <div className="dp-avatar"><User size={44} /></div>
                    <div className="dp-hero-info">
                        <h1 className="dp-hero-name">{displayValue(profile.fullName)}</h1>
                        <div className="dp-hero-badges">
                            <span className="dp-badge dp-badge-status">
                                <span className="dp-online-dot" />
                                {isActive ? 'Active' : displayValue(profile.status)}
                            </span>
                            <span className="dp-badge dp-badge-award">Shipper</span>
                        </div>
                    </div>
                </div>
            </div>

            <div className="dp-grid">
                <div className="dp-col">
                    <section className="dp-card">
                        <div className="dp-card-head"><User size={16} /><span>Personal Information</span></div>
                        <div className="dp-info-list">
                            <InfoRow Icon={Phone} label="Phone" value={profile.phone} />
                            <InfoRow Icon={Mail} label="Email" value={profile.email} />
                            <InfoRow Icon={MapPin} label="Address" value={information.address} />
                            <InfoRow Icon={Calendar} label="Birth Date" value={formatDate(information.dateOfBirth)} />
                            <InfoRow Icon={ShieldCheck} label="ID Card" value={information.identityCardNumber} className="dp-mono" />
                        </div>
                    </section>

                    <section className="dp-card">
                        <div className="dp-card-head"><Truck size={16} /><span>Driver Licence</span></div>
                        <div className="dp-info-list">
                            <InfoRow Icon={CreditCard} label="Licence Number" value={information.licenseNumber} className="dp-mono" />
                            <InfoRow label="Gender" value={information.gender} />
                        </div>
                    </section>
                </div>

                <div className="dp-col">
                    <section className="dp-card">
                        <div className="dp-card-head"><CreditCard size={16} /><span>Bank Account</span></div>
                        <div className="dp-info-list">
                            <InfoRow label="Bank" value={bankAccount.bank} />
                            <InfoRow label="Account No." value={maskAccountNumber(bankAccount.account)} className="dp-mono" />
                            <InfoRow label="Name" value={bankAccount.name} />
                        </div>
                    </section>

                    <section className="dp-card">
                        <div className="dp-card-head"><PhoneCall size={16} /><span>Emergency Contact</span></div>
                        <div className="dp-info-list">
                            <InfoRow label="Name" value={information.emergencyName} />
                            <InfoRow Icon={Phone} label="Phone" value={information.emergencyPhone} />
                        </div>
                    </section>
                </div>
            </div>
        </div>
    )
}
