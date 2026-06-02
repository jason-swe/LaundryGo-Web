import { createElement, useEffect, useState } from 'react'
import {
    AlertTriangle,
    CalendarDays,
    CheckCircle,
    Clock,
    Eye,
    FileText,
    Pencil,
    Plus,
    Search,
    Star,
    Trash2,
    UserCheck,
    Users,
    X,
} from 'lucide-react'
import './ShopStaffManagement.css'
import { staff as staffData } from '../../data'
import { loadStaff, saveStaff } from '../../utils/dataManager'
import toast from '../../utils/toast'
import ConfirmDialog from '../../components/ConfirmDialog/ConfirmDialog'
import { useTranslation } from '../../shared/lib/i18n'

const defaultStaffForm = {
    name: '',
    role: 'Operator',
    email: '',
    phone: '',
    shift: 'morning',
    salary: '',
    address: '',
    status: 'active',
}

const roleOptions = ['Manager', 'Operator', 'Technician', 'Customer Service', 'Shipper']
const shiftKeys = ['morning', 'afternoon', 'evening', 'full-time', 'on-call']

function initials(name) {
    return String(name || '')
        .split(' ')
        .filter(Boolean)
        .slice(-2)
        .map(part => part[0])
        .join('')
        .toUpperCase() || 'ST'
}

function normalizeStaff(raw) {
    return raw.map(member => ({
        ...member,
        attendanceStatus: member.attendanceStatus || (member.status === 'active' ? 'present' : 'absent'),
        notes: member.notes || [],
    }))
}

function ShopStaffManagement() {
    const { language, t } = useTranslation()
    const [activeTab, setActiveTab] = useState('all')
    const [query, setQuery] = useState('')
    const [selectedStaff, setSelectedStaff] = useState(null)
    const [isStaffModalOpen, setIsStaffModalOpen] = useState(false)
    const [editingStaff, setEditingStaff] = useState(null)
    const [staffForm, setStaffForm] = useState(defaultStaffForm)
    const [noteType, setNoteType] = useState('achievement')
    const [newNote, setNewNote] = useState('')
    const [today] = useState(() => new Date())
    const [confirmDialog, setConfirmDialog] = useState({
        show: false,
        title: '',
        message: '',
        onConfirm: null,
        type: 'warning',
    })
    const [staff, setStaff] = useState(() => normalizeStaff(loadStaff(staffData)))

    useEffect(() => { saveStaff(staff) }, [staff])

    const shiftMap = {
        morning: { label: t('shopStaff.shiftMorning'), time: '06:00 - 14:00' },
        afternoon: { label: t('shopStaff.shiftAfternoon'), time: '14:00 - 22:00' },
        evening: { label: t('shopStaff.shiftEvening'), time: '18:00 - 22:00' },
        'full-time': { label: t('shopStaff.shiftFullTime'), time: '08:00 - 17:00' },
        'on-call': { label: t('shopStaff.shiftOnCall'), time: t('shopStaff.asNeeded') },
    }

    const presentStaff = staff.filter(member => member.attendanceStatus === 'present')
    const absentStaff = staff.filter(member => member.attendanceStatus === 'absent')
    const totalSalary = staff.reduce((total, member) => total + (Number(member.salary) || 0), 0)
    const averageRating = staff.length
        ? staff.reduce((total, member) => total + (Number(member.performance?.rating) || 0), 0) / staff.length
        : 0

    const normalizedQuery = query.trim().toLowerCase()
    const filteredStaff = staff.filter(member => {
        const matchesTab =
            activeTab === 'all' ||
            member.attendanceStatus === activeTab ||
            member.role.toLowerCase().replace(/\s/g, '-') === activeTab
        const matchesQuery = !normalizedQuery ||
            member.name.toLowerCase().includes(normalizedQuery) ||
            member.phone.includes(normalizedQuery) ||
            member.role.toLowerCase().includes(normalizedQuery) ||
            member.email.toLowerCase().includes(normalizedQuery)
        return matchesTab && matchesQuery
    })

    const todayShifts = shiftKeys.map(key => ({
        key,
        ...shiftMap[key],
        members: staff.filter(member => member.shift === key),
    }))

    const dateLabel = new Intl.DateTimeFormat(language === 'vi' ? 'vi-VN' : 'en-US', {
        weekday: 'long',
        year: 'numeric',
        month: 'long',
        day: 'numeric',
    }).format(today)

    const kpis = [
        { label: t('shopStaff.totalStaff'), value: String(staff.length), Icon: Users, tone: 'navy' },
        { label: t('shopStaff.presentToday'), value: String(presentStaff.length), Icon: UserCheck, tone: 'teal' },
        { label: t('shopStaff.absentToday'), value: String(absentStaff.length), Icon: AlertTriangle, tone: absentStaff.length ? 'amber' : 'teal' },
        { label: t('shopStaff.monthlySalary'), value: `${(totalSalary / 1000000).toFixed(1)}M`, Icon: FileText, tone: 'blue' },
        { label: t('shopStaff.avgRating'), value: averageRating.toFixed(1), Icon: Star, tone: 'amber' },
    ]

    const tabs = [
        { key: 'all', label: t('shopStaff.allStaff'), count: staff.length },
        { key: 'present', label: t('shopStaff.present'), count: presentStaff.length },
        { key: 'absent', label: t('shopStaff.absent'), count: absentStaff.length },
        { key: 'operator', label: 'Operator', count: staff.filter(member => member.role === 'Operator').length },
        { key: 'manager', label: 'Manager', count: staff.filter(member => member.role === 'Manager').length },
    ]

    const closeConfirm = () => setConfirmDialog(prev => ({ ...prev, show: false }))

    const toggleAttendance = (staffId) => {
        const updated = staff.map(member =>
            member.id === staffId
                ? { ...member, attendanceStatus: member.attendanceStatus === 'present' ? 'absent' : 'present' }
                : member
        )
        setStaff(updated)
        if (selectedStaff?.id === staffId) {
            setSelectedStaff(updated.find(member => member.id === staffId))
        }
    }

    const openCreate = () => {
        setEditingStaff(null)
        setStaffForm(defaultStaffForm)
        setIsStaffModalOpen(true)
    }

    const openEdit = (member) => {
        setEditingStaff(member)
        setStaffForm({
            name: member.name || '',
            role: member.role || 'Operator',
            email: member.email || '',
            phone: member.phone || '',
            shift: member.shift || 'morning',
            salary: member.salary || '',
            address: member.address || '',
            status: member.status || 'active',
        })
        setIsStaffModalOpen(true)
    }

    const saveStaffMember = () => {
        if (!staffForm.name || !staffForm.phone) {
            toast.warning(t('shopStaff.requiredFields'))
            return
        }

        if (editingStaff) {
            const updatedMember = { ...editingStaff, ...staffForm, salary: Number(staffForm.salary) || 0 }
            setStaff(staff.map(member => member.id === editingStaff.id ? updatedMember : member))
            setSelectedStaff(updatedMember)
            toast.success(t('shopStaff.updated').replace('{name}', updatedMember.name))
        } else {
            const nextNumber = staff.reduce((max, member) => {
                const numeric = Number(String(member.id).replace(/\D/g, ''))
                return Number.isFinite(numeric) ? Math.max(max, numeric) : max
            }, 0) + 1
            const newMember = {
                id: `STF-${String(nextNumber).padStart(3, '0')}`,
                ...staffForm,
                salary: Number(staffForm.salary) || 0,
                avatar: null,
                joinDate: today.toISOString().split('T')[0],
                performance: { rating: 0, ordersHandled: 0, customerSatisfaction: 0 },
                skills: [],
                attendanceStatus: 'present',
                notes: [],
            }
            setStaff([newMember, ...staff])
            setSelectedStaff(newMember)
            toast.success(t('shopStaff.created').replace('{name}', newMember.name))
        }
        setIsStaffModalOpen(false)
        setEditingStaff(null)
        setStaffForm(defaultStaffForm)
    }

    const deleteStaff = (member) => {
        setConfirmDialog({
            show: true,
            title: t('shopStaff.deleteTitle'),
            message: t('shopStaff.deleteMessage').replace('{name}', member.name),
            type: 'danger',
            onConfirm: () => {
                setStaff(staff.filter(item => item.id !== member.id))
                setSelectedStaff(null)
                toast.success(t('shopStaff.deleted').replace('{name}', member.name))
                closeConfirm()
            },
        })
    }

    const addNote = (staffId) => {
        if (!newNote.trim()) return
        const updated = staff.map(member => {
            if (member.id !== staffId) return member
            const note = {
                id: `${staffId}-${member.notes.length + 1}-${noteType}`,
                type: noteType,
                text: newNote.trim(),
                date: new Intl.DateTimeFormat(language === 'vi' ? 'vi-VN' : 'en-US').format(today),
            }
            return { ...member, notes: [...member.notes, note] }
        })
        setStaff(updated)
        setSelectedStaff(updated.find(member => member.id === staffId))
        setNewNote('')
        toast.success(t('shopStaff.noteAdded'))
    }

    const deleteNote = (staffId, noteId) => {
        const updated = staff.map(member =>
            member.id === staffId ? { ...member, notes: member.notes.filter(note => note.id !== noteId) } : member
        )
        setStaff(updated)
        setSelectedStaff(updated.find(member => member.id === staffId))
    }

    const renderAttendanceList = (items, tone) => (
        <div className="shop-staff-attendance-list">
            {items.length === 0 && <div className="shop-staff-empty-mini">{t('shopStaff.noMembers')}</div>}
            {items.slice(0, 6).map(member => (
                <button type="button" className="shop-staff-attendance-person" key={member.id} onClick={() => setSelectedStaff(member)}>
                    <span className={`shop-staff-avatar ${tone}`}>{initials(member.name)}</span>
                    <span>
                        <strong>{member.name}</strong>
                        <small>{member.role}</small>
                    </span>
                </button>
            ))}
        </div>
    )

    return (
        <div className="shop-staff-page">
            <header className="shop-staff-header">
                <div>
                    <span className="shop-staff-eyebrow">{t('shopStaff.eyebrow')}</span>
                    <h1>{t('shopStaff.title')}</h1>
                    <p>{t('shopStaff.subtitle')}</p>
                </div>
                <button type="button" className="shop-staff-primary-btn" onClick={openCreate}>
                    <Plus size={16} strokeWidth={1.9} />
                    {t('shopStaff.addStaff')}
                </button>
            </header>

            <section className="shop-staff-kpis">
                {kpis.map(({ label, value, Icon, tone }) => (
                    <article className={`shop-staff-kpi ${tone}`} key={label}>
                        <span>{createElement(Icon, { size: 18, strokeWidth: 1.9 })}</span>
                        <small>{label}</small>
                        <strong>{value}</strong>
                    </article>
                ))}
            </section>

            <section className="shop-staff-overview">
                <article className="shop-staff-card attendance-card">
                    <div className="shop-staff-card-head">
                        <div>
                            <span className="shop-staff-eyebrow">{t('shopStaff.today')}</span>
                            <h2>{t('shopStaff.attendance')}</h2>
                        </div>
                        <span className="shop-staff-date"><CalendarDays size={15} />{dateLabel}</span>
                    </div>
                    <div className="shop-staff-attendance-columns">
                        <div>
                            <h3><CheckCircle size={15} />{t('shopStaff.present')} ({presentStaff.length})</h3>
                            {renderAttendanceList(presentStaff, 'teal')}
                        </div>
                        <div>
                            <h3><AlertTriangle size={15} />{t('shopStaff.absent')} ({absentStaff.length})</h3>
                            {renderAttendanceList(absentStaff, 'amber')}
                        </div>
                    </div>
                </article>

                <article className="shop-staff-card shifts-card">
                    <div className="shop-staff-card-head">
                        <div>
                            <span className="shop-staff-eyebrow">{t('shopStaff.today')}</span>
                            <h2>{t('shopStaff.shiftPlan')}</h2>
                        </div>
                    </div>
                    <div className="shop-staff-shift-list">
                        {todayShifts.map(shift => (
                            <div className="shop-staff-shift-row" key={shift.key}>
                                <div>
                                    <strong>{shift.label}</strong>
                                    <span>{shift.time}</span>
                                </div>
                                <div className="shop-staff-shift-members">
                                    {shift.members.length === 0 && <small>{t('shopStaff.noMembers')}</small>}
                                    {shift.members.slice(0, 5).map(member => (
                                        <button type="button" className={member.attendanceStatus} key={member.id} onClick={() => setSelectedStaff(member)}>
                                            {initials(member.name)}
                                        </button>
                                    ))}
                                </div>
                            </div>
                        ))}
                    </div>
                </article>
            </section>

            <section className="shop-staff-workspace">
                <article className="shop-staff-table-card">
                    <div className="shop-staff-toolbar">
                        <div className="shop-staff-tabs">
                            {tabs.map(tab => (
                                <button type="button" className={activeTab === tab.key ? 'active' : ''} key={tab.key} onClick={() => setActiveTab(tab.key)}>
                                    {tab.label}
                                    <span>{tab.count}</span>
                                </button>
                            ))}
                        </div>
                        <label className="shop-staff-search">
                            <Search size={16} strokeWidth={1.9} />
                            <input value={query} onChange={(event) => setQuery(event.target.value)} placeholder={t('shopStaff.searchPlaceholder')} />
                        </label>
                    </div>

                    <div className="shop-staff-table-meta">
                        <div>
                            <span className="shop-staff-eyebrow">{t('shopStaff.teamDirectory')}</span>
                            <h2>{filteredStaff.length} {t('shopStaff.results')}</h2>
                        </div>
                    </div>

                    <div className="shop-staff-table-wrap">
                        <table className="shop-staff-table">
                            <thead>
                                <tr>
                                    <th>{t('shopStaff.name')}</th>
                                    <th>{t('shopStaff.role')}</th>
                                    <th>{t('shopStaff.attendanceStatus')}</th>
                                    <th>{t('shopStaff.shift')}</th>
                                    <th>{t('shopStaff.salary')}</th>
                                    <th>{t('shopStaff.performance')}</th>
                                    <th>{t('shopStaff.actions')}</th>
                                </tr>
                            </thead>
                            <tbody>
                                {filteredStaff.length === 0 && (
                                    <tr>
                                        <td colSpan="7" className="shop-staff-empty-row">
                                            <Users size={26} strokeWidth={1.8} />
                                            <strong>{t('shopStaff.emptyTitle')}</strong>
                                            <span>{t('shopStaff.emptyHint')}</span>
                                        </td>
                                    </tr>
                                )}
                                {filteredStaff.map(member => {
                                    const achievements = member.notes.filter(note => note.type === 'achievement').length
                                    const violations = member.notes.filter(note => note.type === 'violation').length
                                    const shift = shiftMap[member.shift] || { label: member.shift, time: '' }
                                    return (
                                        <tr key={member.id} className={selectedStaff?.id === member.id ? 'selected' : ''}>
                                            <td>
                                                <button type="button" className="shop-staff-name-cell" onClick={() => setSelectedStaff(member)}>
                                                    <span className="shop-staff-avatar navy">{initials(member.name)}</span>
                                                    <span>
                                                        <strong>{member.name}</strong>
                                                        <small>{member.phone}</small>
                                                    </span>
                                                </button>
                                            </td>
                                            <td><span className="shop-staff-role">{member.role}</span></td>
                                            <td>
                                                <button type="button" className={`shop-staff-status ${member.attendanceStatus}`} onClick={() => toggleAttendance(member.id)}>
                                                    {member.attendanceStatus === 'present' ? t('shopStaff.present') : t('shopStaff.absent')}
                                                </button>
                                            </td>
                                            <td>
                                                <span className={`shop-staff-shift ${member.shift}`}>
                                                    {shift.label}
                                                </span>
                                            </td>
                                            <td className="shop-staff-money">{(member.salary || 0).toLocaleString()}đ</td>
                                            <td>
                                                <div className="shop-staff-note-counts">
                                                    <span><Star size={13} />{achievements}</span>
                                                    <span className={violations ? 'warning' : ''}><AlertTriangle size={13} />{violations}</span>
                                                </div>
                                            </td>
                                            <td>
                                                <div className="shop-staff-actions">
                                                    <button type="button" aria-label={t('shopStaff.view')} onClick={() => setSelectedStaff(member)}><Eye size={15} /></button>
                                                    <button type="button" aria-label={t('shopStaff.edit')} onClick={() => openEdit(member)}><Pencil size={15} /></button>
                                                    <button type="button" aria-label={t('shopStaff.delete')} className="danger" onClick={() => deleteStaff(member)}><Trash2 size={15} /></button>
                                                </div>
                                            </td>
                                        </tr>
                                    )
                                })}
                            </tbody>
                        </table>
                    </div>
                </article>

                <aside className="shop-staff-detail">
                    {selectedStaff ? (
                        <>
                            <div className="shop-staff-detail-head">
                                <div>
                                    <span className="shop-staff-eyebrow">{t('shopStaff.staffProfile')}</span>
                                    <h2>{selectedStaff.name}</h2>
                                    <p>{selectedStaff.id} · {selectedStaff.role}</p>
                                </div>
                                <button type="button" aria-label={t('common.close')} onClick={() => setSelectedStaff(null)}><X size={18} /></button>
                            </div>

                            <div className="shop-staff-profile-top">
                                <span className="shop-staff-avatar large navy">{initials(selectedStaff.name)}</span>
                                <button type="button" className={`shop-staff-status ${selectedStaff.attendanceStatus}`} onClick={() => toggleAttendance(selectedStaff.id)}>
                                    {selectedStaff.attendanceStatus === 'present' ? t('shopStaff.present') : t('shopStaff.absent')}
                                </button>
                            </div>

                            <dl className="shop-staff-detail-grid">
                                <div><dt>{t('shopStaff.phone')}</dt><dd>{selectedStaff.phone}</dd></div>
                                <div><dt>{t('shopStaff.email')}</dt><dd>{selectedStaff.email || t('shopStaff.notSet')}</dd></div>
                                <div><dt>{t('shopStaff.joinDate')}</dt><dd>{selectedStaff.joinDate || t('shopStaff.notSet')}</dd></div>
                                <div><dt>{t('shopStaff.shift')}</dt><dd>{shiftMap[selectedStaff.shift]?.label || selectedStaff.shift}</dd></div>
                                <div><dt>{t('shopStaff.salary')}</dt><dd>{(selectedStaff.salary || 0).toLocaleString()}đ</dd></div>
                                <div><dt>{t('shopStaff.address')}</dt><dd>{selectedStaff.address || t('shopStaff.notSet')}</dd></div>
                                <div><dt>{t('shopStaff.ordersHandled')}</dt><dd>{selectedStaff.performance?.ordersHandled?.toLocaleString() || 0}</dd></div>
                                <div><dt>{t('shopStaff.rating')}</dt><dd>{selectedStaff.performance?.rating || 0}</dd></div>
                            </dl>

                            <section className="shop-staff-notes">
                                <div className="shop-staff-note-tabs">
                                    <button type="button" className={noteType === 'achievement' ? 'active' : ''} onClick={() => setNoteType('achievement')}>
                                        <Star size={14} />{t('shopStaff.achievements')}
                                    </button>
                                    <button type="button" className={noteType === 'violation' ? 'active warning' : ''} onClick={() => setNoteType('violation')}>
                                        <AlertTriangle size={14} />{t('shopStaff.violations')}
                                    </button>
                                </div>
                                <div className="shop-staff-note-list">
                                    {selectedStaff.notes.filter(note => note.type === noteType).length === 0 && (
                                        <div className="shop-staff-empty-mini">{t('shopStaff.noNotes')}</div>
                                    )}
                                    {selectedStaff.notes.filter(note => note.type === noteType).map(note => (
                                        <div className={`shop-staff-note ${note.type}`} key={note.id}>
                                            <div>
                                                <p>{note.text}</p>
                                                <span>{note.date}</span>
                                            </div>
                                            <button type="button" aria-label={t('shopStaff.delete')} onClick={() => deleteNote(selectedStaff.id, note.id)}>
                                                <Trash2 size={14} />
                                            </button>
                                        </div>
                                    ))}
                                </div>
                                <label className="shop-staff-note-input">
                                    <span>{noteType === 'achievement' ? t('shopStaff.addAchievement') : t('shopStaff.addViolation')}</span>
                                    <textarea rows="3" value={newNote} onChange={(event) => setNewNote(event.target.value)} />
                                </label>
                                <button type="button" className="shop-staff-secondary-btn" onClick={() => addNote(selectedStaff.id)}>
                                    <Plus size={14} />{t('shopStaff.addNote')}
                                </button>
                            </section>

                            <div className="shop-staff-detail-actions">
                                <button type="button" onClick={() => openEdit(selectedStaff)}><Pencil size={15} />{t('shopStaff.edit')}</button>
                                <button type="button" className="danger" onClick={() => deleteStaff(selectedStaff)}><Trash2 size={15} />{t('shopStaff.delete')}</button>
                            </div>
                        </>
                    ) : (
                        <div className="shop-staff-detail-empty">
                            <Users size={34} strokeWidth={1.7} />
                            <strong>{t('shopStaff.selectTitle')}</strong>
                            <span>{t('shopStaff.selectHint')}</span>
                        </div>
                    )}
                </aside>
            </section>

            {isStaffModalOpen && (
                <div className="shop-staff-modal-overlay" onClick={() => { setIsStaffModalOpen(false); setEditingStaff(null); setStaffForm(defaultStaffForm) }}>
                    <div className="shop-staff-modal" onClick={(event) => event.stopPropagation()}>
                        <div className="shop-staff-modal-head">
                            <div>
                                <span className="shop-staff-eyebrow">{editingStaff ? t('shopStaff.edit') : t('shopStaff.create')}</span>
                                <h2>{editingStaff ? t('shopStaff.editStaff') : t('shopStaff.addStaff')}</h2>
                            </div>
                            <button type="button" aria-label={t('common.close')} onClick={() => { setIsStaffModalOpen(false); setEditingStaff(null); setStaffForm(defaultStaffForm) }}><X size={18} /></button>
                        </div>
                        <div className="shop-staff-modal-body">
                            <StaffForm form={staffForm} setForm={setStaffForm} t={t} shiftMap={shiftMap} />
                        </div>
                        <div className="shop-staff-modal-footer">
                            <button type="button" className="shop-staff-secondary-btn" onClick={() => { setIsStaffModalOpen(false); setEditingStaff(null); setStaffForm(defaultStaffForm) }}>{t('common.cancel')}</button>
                            <button type="button" className="shop-staff-primary-btn" onClick={saveStaffMember}>{t('shopStaff.saveChanges')}</button>
                        </div>
                    </div>
                </div>
            )}

            {confirmDialog.show && (
                <ConfirmDialog
                    title={confirmDialog.title}
                    message={confirmDialog.message}
                    type={confirmDialog.type}
                    onConfirm={confirmDialog.onConfirm}
                    onCancel={closeConfirm}
                    confirmText={t('common.ok')}
                    cancelText={t('common.cancel')}
                />
            )}
        </div>
    )
}

function StaffForm({ form, setForm, t, shiftMap }) {
    return (
        <div className="shop-staff-form-grid">
            <Field label={t('shopStaff.fullName')} value={form.name} onChange={(value) => setForm({ ...form, name: value })} />
            <Field label={t('shopStaff.phone')} value={form.phone} onChange={(value) => setForm({ ...form, phone: value })} />
            <Field label={t('shopStaff.email')} value={form.email} onChange={(value) => setForm({ ...form, email: value })} />
            <label>
                <span>{t('shopStaff.role')}</span>
                <select value={form.role} onChange={(event) => setForm({ ...form, role: event.target.value })}>
                    {roleOptions.map(role => <option value={role} key={role}>{role}</option>)}
                </select>
            </label>
            <label>
                <span>{t('shopStaff.shift')}</span>
                <select value={form.shift} onChange={(event) => setForm({ ...form, shift: event.target.value })}>
                    {shiftKeys.map(key => <option value={key} key={key}>{shiftMap[key].label} ({shiftMap[key].time})</option>)}
                </select>
            </label>
            <Field label={t('shopStaff.salary')} type="number" value={form.salary} onChange={(value) => setForm({ ...form, salary: value })} />
            <label>
                <span>{t('shopStaff.status')}</span>
                <select value={form.status} onChange={(event) => setForm({ ...form, status: event.target.value })}>
                    <option value="active">{t('shopStaff.active')}</option>
                    <option value="on-leave">{t('shopStaff.onLeave')}</option>
                    <option value="inactive">{t('shopStaff.inactive')}</option>
                </select>
            </label>
            <label className="wide">
                <span>{t('shopStaff.address')}</span>
                <input value={form.address || ''} onChange={(event) => setForm({ ...form, address: event.target.value })} />
            </label>
        </div>
    )
}

function Field({ label, value, onChange, type = 'text' }) {
    return (
        <label>
            <span>{label}</span>
            <input type={type} value={value || ''} onChange={(event) => onChange(event.target.value)} />
        </label>
    )
}

export default ShopStaffManagement
