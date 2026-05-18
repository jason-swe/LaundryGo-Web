import { useState, useEffect } from 'react'
import { User, Clock, Calendar, DollarSign, Plus, Pencil, Eye, Trash2, X, CheckCircle, MinusCircle, FileText, AlertTriangle, Star, Users } from 'lucide-react'
import './ShopStaffManagement.css'
import { staff as staffData } from '../../data'
import { loadStaff, saveStaff } from '../../utils/dataManager'
import toast from '../../utils/toast'
import ConfirmDialog from '../../components/ConfirmDialog/ConfirmDialog'
import { useTranslation } from '../../shared/lib/i18n'

function ShopStaffManagement() {
    const { t, language } = useTranslation()
    const dateLocale = language === 'vi' ? 'vi-VN' : 'en-US'

    const [activeTab, setActiveTab] = useState('all')
    const [showDetailModal, setShowDetailModal] = useState(false)
    const [showEditModal, setShowEditModal] = useState(false)
    const [showAddModal, setShowAddModal] = useState(false)
    const [selectedStaff, setSelectedStaff] = useState(null)
    const [noteTab, setNoteTab] = useState('achievement')
    const [newNote, setNewNote] = useState('')
    const [confirmDialog, setConfirmDialog] = useState({
        show: false, title: '', message: '', onConfirm: null, type: 'warning'
    })

    const defaultAddForm = {
        name: '', role: 'Operator', email: '', phone: '',
        shift: 'morning', salary: '', address: '', status: 'active'
    }
    const [addForm, setAddForm] = useState(defaultAddForm)
    const [editForm, setEditForm] = useState(null)

    const [staff, setStaff] = useState(() => {
        const raw = loadStaff(staffData)
        return raw.map(p => ({
            ...p,
            attendanceStatus: p.attendanceStatus || (p.status === 'active' ? 'present' : 'absent'),
            notes: p.notes || []
        }))
    })

    useEffect(() => { saveStaff(staff) }, [staff])

    const presentStaff = staff.filter(s => s.attendanceStatus === 'present')
    const absentStaff = staff.filter(s => s.attendanceStatus === 'absent')

    const filteredStaff = activeTab === 'all' ? staff
        : activeTab === 'present' ? presentStaff
            : absentStaff

    const roleOptions = [
        { value: 'Manager', label: t('shop.staffManagement.roles.manager') },
        { value: 'Operator', label: t('shop.staffManagement.roles.operator') },
        { value: 'Technician', label: t('shop.staffManagement.roles.technician') },
        { value: 'Customer Service', label: t('shop.staffManagement.roles.customerService') },
        { value: 'Shipper', label: t('shop.staffManagement.roles.shipper') }
    ]

    const getRoleLabel = (role) => {
        const match = roleOptions.find(r => r.value === role)
        return match ? match.label : role
    }

    const shiftMap = {
        morning: { label: t('shop.staffManagement.shifts.morning'), time: '6:00 – 14:00', color: 'var(--brand-primary-hover)' },
        afternoon: { label: t('shop.staffManagement.shifts.afternoon'), time: '14:00 – 22:00', color: 'var(--brand-primary)' },
        evening: { label: t('shop.staffManagement.shifts.evening'), time: '18:00 – 22:00', color: 'var(--brand-primary)' },
        'full-time': { label: t('shop.staffManagement.shifts.fullTime'), time: '8:00 – 17:00', color: 'var(--status-success)' },
        'on-call': { label: t('shop.staffManagement.shifts.onCall'), time: t('shop.staffManagement.shifts.asNeeded'), color: 'var(--dashboard-text-muted)' }
    }

    const todayShifts = ['morning', 'full-time', 'afternoon', 'evening', 'on-call']
        .map(key => ({
            ...shiftMap[key],
            key,
            members: staff.filter(s => s.shift === key)
        }))
        .filter(s => s.members.length > 0)

    const handleToggleAttendance = (staffId) => {
        setStaff(prev => prev.map(s =>
            s.id === staffId
                ? { ...s, attendanceStatus: s.attendanceStatus === 'present' ? 'absent' : 'present' }
                : s
        ))
    }

    const handleViewStaff = (member) => {
        setSelectedStaff(member)
        setNoteTab('achievement')
        setNewNote('')
        setShowDetailModal(true)
    }

    const handleOpenEdit = (member) => {
        setEditForm({
            id: member.id,
            name: member.name,
            role: member.role,
            email: member.email,
            phone: member.phone,
            shift: member.shift,
            salary: member.salary,
            address: member.address,
            status: member.status
        })
        setShowEditModal(true)
    }

    const handleSaveEdit = () => {
        if (!editForm.name || !editForm.phone) {
            toast.warning(t('shop.staffManagement.toast.namePhoneRequired'))
            return
        }
        setStaff(prev => prev.map(s =>
            s.id === editForm.id ? { ...s, ...editForm, salary: Number(editForm.salary) } : s
        ))
        toast.success(`${t('shop.staffManagement.toast.staffPrefix')} ${editForm.name} ${t('shop.staffManagement.toast.updatedSuffix')}`)
        setShowEditModal(false)
    }

    const handleAddStaff = () => {
        if (!addForm.name || !addForm.phone) {
            toast.warning(t('shop.staffManagement.toast.namePhoneRequired'))
            return
        }
        const newMember = {
            id: `STF-${String(staff.length + 1).padStart(3, '0')}`,
            ...addForm,
            salary: Number(addForm.salary) || 0,
            avatar: null,
            joinDate: new Date().toISOString().split('T')[0],
            performance: { rating: 0, ordersHandled: 0, customerSatisfaction: 0 },
            skills: [],
            attendanceStatus: 'present',
            notes: []
        }
        setStaff(prev => [newMember, ...prev])
        toast.success(`${t('shop.staffManagement.toast.staffPrefix')} ${newMember.name} ${t('shop.staffManagement.toast.addedSuffix')}`)
        setAddForm(defaultAddForm)
        setShowAddModal(false)
    }

    const handleDeleteStaff = (staffId, name) => {
        setConfirmDialog({
            show: true,
            title: t('shop.staffManagement.confirm.deleteTitle'),
            message: `${t('shop.staffManagement.confirm.deleteMessagePrefix')} ${name}${t('shop.staffManagement.confirm.deleteMessageSuffix')}`,
            type: 'danger',
            onConfirm: () => {
                setStaff(prev => prev.filter(s => s.id !== staffId))
                toast.success(`${name} ${t('shop.staffManagement.toast.removedSuffix')}`)
                setConfirmDialog(prev => ({ ...prev, show: false }))
            }
        })
    }

    const handleAddNote = (staffId) => {
        if (!newNote.trim()) return
        const note = {
            id: Date.now(),
            type: noteTab,
            text: newNote.trim(),
            date: new Date().toLocaleDateString(dateLocale)
        }
        const updated = staff.map(s =>
            s.id === staffId ? { ...s, notes: [...(s.notes || []), note] } : s
        )
        setStaff(updated)
        const updatedMember = updated.find(s => s.id === staffId)
        setSelectedStaff(updatedMember)
        setNewNote('')
        toast.success(t('shop.staffManagement.toast.noteAdded'))
    }

    const handleDeleteNote = (staffId, noteId) => {
        const updated = staff.map(s =>
            s.id === staffId
                ? { ...s, notes: (s.notes || []).filter(n => n.id !== noteId) }
                : s
        )
        setStaff(updated)
        setSelectedStaff(updated.find(s => s.id === staffId))
    }

    const renderStaffForm = (form, setForm, onSave, onClose, title) => (
        <div className="staff-modal-overlay" onClick={onClose}>
            <div className="staff-modal" onClick={e => e.stopPropagation()}>
                <div className="modal-header">
                    <h2>{title}</h2>
                    <button className="modal-close" onClick={onClose}><X size={18} /></button>
                </div>
                <div className="modal-body">
                    <div className="detail-grid">
                        <div className="form-group-staff">
                            <label>{t('shop.staffManagement.form.fullName')} *</label>
                            <input className="staff-input" value={form.name}
                                onChange={e => setForm({ ...form, name: e.target.value })} placeholder={t('shop.staffManagement.form.placeholders.fullName')} />
                        </div>
                        <div className="form-group-staff">
                            <label>{t('shop.staffManagement.form.phone')} *</label>
                            <input className="staff-input" value={form.phone}
                                onChange={e => setForm({ ...form, phone: e.target.value })} placeholder={t('shop.staffManagement.form.placeholders.phone')} />
                        </div>
                        <div className="form-group-staff">
                            <label>{t('shop.staffManagement.form.email')}</label>
                            <input className="staff-input" value={form.email}
                                onChange={e => setForm({ ...form, email: e.target.value })} placeholder={t('shop.staffManagement.form.placeholders.email')} />
                        </div>
                        <div className="form-group-staff">
                            <label>{t('shop.staffManagement.form.role')}</label>
                            <select className="staff-input" value={form.role}
                                onChange={e => setForm({ ...form, role: e.target.value })}>
                                {roleOptions.map(role => (
                                    <option key={role.value} value={role.value}>{role.label}</option>
                                ))}
                            </select>
                        </div>
                        <div className="form-group-staff">
                            <label>{t('shop.staffManagement.form.shift')}</label>
                            <select className="staff-input" value={form.shift}
                                onChange={e => setForm({ ...form, shift: e.target.value })}>
                                <option value="morning">{t('shop.staffManagement.shifts.morning')} (6:00 – 14:00)</option>
                                <option value="afternoon">{t('shop.staffManagement.shifts.afternoon')} (14:00 – 22:00)</option>
                                <option value="evening">{t('shop.staffManagement.shifts.evening')} (18:00 – 22:00)</option>
                                <option value="full-time">{t('shop.staffManagement.shifts.fullTime')} (8:00 – 17:00)</option>
                                <option value="on-call">{t('shop.staffManagement.shifts.onCall')}</option>
                            </select>
                        </div>
                        <div className="form-group-staff">
                            <label>{t('shop.staffManagement.form.monthlySalary')}</label>
                            <input className="staff-input" type="number" value={form.salary}
                                onChange={e => setForm({ ...form, salary: e.target.value })} placeholder={t('shop.staffManagement.form.placeholders.monthlySalary')} />
                        </div>
                        <div className="form-group-staff" style={{ gridColumn: '1/-1' }}>
                            <label>{t('shop.staffManagement.form.address')}</label>
                            <input className="staff-input" value={form.address}
                                onChange={e => setForm({ ...form, address: e.target.value })} placeholder={t('shop.staffManagement.form.placeholders.address')} />
                        </div>
                    </div>
                </div>
                <div className="modal-footer">
                    <button className="btn-cancel" onClick={onClose}>{t('common.cancel')}</button>
                    <button className="btn-confirm" onClick={onSave}>{t('common.save')}</button>
                </div>
            </div>
        </div>
    )

    return (
        <div className="shop-staff">
            {/* Header */}
            <div className="shop-staff-header">
                <div>
                    <h1 className="shop-staff-title">
                        <Users size={18} style={{ marginRight: '8px' }} />
                        {t('shop.staffManagement.title')}
                    </h1>
                    <p className="shop-staff-subtitle">{t('shop.staffManagement.subtitle')}</p>
                </div>
                <button className="shop-staff-add-btn" onClick={() => setShowAddModal(true)}>
                    <Plus size={16} /> {t('shop.staffManagement.addStaff')}
                </button>
            </div>

            {/* Stats */}
            <div className="shop-staff-stats">
                <div className="staff-stat-card">
                    <div className="stat-icon stat-icon-primary">
                        <User size={24} />
                    </div>
                    <div className="stat-content">
                        <div className="stat-label">{t('shop.staffManagement.stats.totalStaff')}</div>
                        <div className="stat-value">{staff.length}</div>
                    </div>
                </div>
                <div className="staff-stat-card">
                    <div className="stat-icon stat-icon-success">
                        <CheckCircle size={24} />
                    </div>
                    <div className="stat-content">
                        <div className="stat-label">{t('shop.staffManagement.stats.presentToday')}</div>
                        <div className="stat-value">{presentStaff.length}</div>
                    </div>
                </div>
                <div className="staff-stat-card">
                    <div className="stat-icon stat-icon-danger">
                        <MinusCircle size={24} />
                    </div>
                    <div className="stat-content">
                        <div className="stat-label">{t('shop.staffManagement.stats.absentToday')}</div>
                        <div className="stat-value">{absentStaff.length}</div>
                    </div>
                </div>
                <div className="staff-stat-card">
                    <div className="stat-icon stat-icon-warning">
                        <DollarSign size={24} />
                    </div>
                    <div className="stat-content">
                        <div className="stat-label">{t('shop.staffManagement.stats.totalSalary')}</div>
                        <div className="stat-value">
                            {(staff.reduce((s, m) => s + (m.salary || 0), 0) / 1000000).toFixed(1)}M
                        </div>
                    </div>
                </div>
            </div>

            {/* Today Overview: Attendance + Schedule */}
            <div className="shop-staff-today">
                {/* Attendance */}
                <div className="staff-today-card">
                    <div className="today-card-header">
                        <Calendar size={16} style={{ color: '#719FC2' }} />
                        <h3>{t('shop.staffManagement.today.attendanceTitle')}</h3>
                        <span className="today-date">{new Date().toLocaleDateString(dateLocale, { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}</span>
                    </div>
                    <div className="attendance-columns">
                        <div className="attendance-col attendance-present-col">
                            <div className="attendance-col-header">
                                <CheckCircle size={16} />
                                <span>{t('shop.staffManagement.present')} ({presentStaff.length})</span>
                            </div>
                            {presentStaff.map(s => (
                                <div key={s.id} className="attendance-person">
                                    <div className="attendance-avatar attendance-avatar-present">
                                        {s.name.charAt(0)}
                                    </div>
                                    <div className="attendance-info">
                                        <span className="attendance-name">{s.name}</span>
                                        <span className="attendance-role">{getRoleLabel(s.role)}</span>
                                    </div>
                                    <button className="attendance-toggle-btn present"
                                        onClick={() => handleToggleAttendance(s.id)}
                                        title={t('shop.staffManagement.actions.markAbsent')}>✓</button>
                                </div>
                            ))}
                            {presentStaff.length === 0 && <div className="attendance-empty">{t('shop.staffManagement.empty.noOnePresent')}</div>}
                        </div>
                        <div className="attendance-col attendance-absent-col">
                            <div className="attendance-col-header">
                                <MinusCircle size={16} />
                                <span>{t('shop.staffManagement.absent')} ({absentStaff.length})</span>
                            </div>
                            {absentStaff.map(s => (
                                <div key={s.id} className="attendance-person">
                                    <div className="attendance-avatar attendance-avatar-absent">
                                        {s.name.charAt(0)}
                                    </div>
                                    <div className="attendance-info">
                                        <span className="attendance-name">{s.name}</span>
                                        <span className="attendance-role">{getRoleLabel(s.role)}</span>
                                    </div>
                                    <button className="attendance-toggle-btn absent"
                                        onClick={() => handleToggleAttendance(s.id)}
                                        title={t('shop.staffManagement.actions.markPresent')}>✗</button>
                                </div>
                            ))}
                            {absentStaff.length === 0 && <div className="attendance-empty">{t('shop.staffManagement.empty.noOneAbsent')}</div>}
                        </div>
                    </div>
                </div>

                {/* Today's Shifts */}
                <div className="staff-today-card">
                    <div className="today-card-header">
                        <Clock size={16} style={{ color: '#719FC2' }} />
                        <h3>{t('shop.staffManagement.today.shiftsTitle')}</h3>
                    </div>
                    <div className="shifts-list">
                        {todayShifts.map(shift => (
                            <div key={shift.key} className="shift-row">
                                <div className="shift-label-group">
                                    <span className="shift-dot" style={{ background: shift.color }} />
                                    <div>
                                        <div className="shift-label-name">{shift.label}</div>
                                        <div className="shift-time">{shift.time}</div>
                                    </div>
                                </div>
                                <div className="shift-members">
                                    {shift.members.map(m => (
                                        <span key={m.id} className={`shift-badge ${m.attendanceStatus}`}>
                                            {m.name.split(' ').pop()}
                                        </span>
                                    ))}
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            </div>

            {/* Staff Table */}
            <div className="shop-staff-tabs">
                {['all', 'present', 'absent'].map(tab => (
                    <button key={tab}
                        className={`staff-tab ${activeTab === tab ? 'active' : ''}`}
                        onClick={() => setActiveTab(tab)}>
                        {tab === 'all'
                            ? `${t('shop.staffManagement.tabs.all')} (${staff.length})`
                            : tab === 'present'
                                ? `${t('shop.staffManagement.tabs.present')} (${presentStaff.length})`
                                : `${t('shop.staffManagement.tabs.absent')} (${absentStaff.length})`}
                    </button>
                ))}
            </div>

            <div className="shop-staff-table-container">
                <table className="shop-staff-table">
                    <thead>
                        <tr>
                            <th>{t('shop.staffManagement.table.name')}</th>
                            <th>{t('shop.staffManagement.table.role')}</th>
                            <th>{t('shop.staffManagement.table.status')}</th>
                            <th>{t('shop.staffManagement.table.shift')}</th>
                            <th>{t('shop.staffManagement.table.salary')}</th>
                            <th>{t('shop.staffManagement.table.notes')}</th>
                            <th>{t('shop.staffManagement.table.actions')}</th>
                        </tr>
                    </thead>
                    <tbody>
                        {filteredStaff.map(member => {
                            const achievements = (member.notes || []).filter(n => n.type === 'achievement').length
                            const violations = (member.notes || []).filter(n => n.type === 'violation').length
                            const shift = shiftMap[member.shift] || { label: member.shift, color: 'var(--dashboard-text-muted)' }
                            return (
                                <tr key={member.id}>
                                    <td>
                                        <div className="staff-name-cell">
                                            <div className="staff-avatar">{member.name.charAt(0)}</div>
                                            <div>
                                                <div className="staff-name">{member.name}</div>
                                                <div className="staff-phone">{member.phone}</div>
                                            </div>
                                        </div>
                                    </td>
                                    <td><span className="staff-role">{getRoleLabel(member.role)}</span></td>
                                    <td>
                                        <span className={`staff-status staff-status-${member.attendanceStatus}`}>
                                            {member.attendanceStatus === 'present'
                                                ? `● ${t('shop.staffManagement.present')}`
                                                : `○ ${t('shop.staffManagement.absent')}`}
                                        </span>
                                    </td>
                                    <td>
                                        <span className={`staff-shift-badge shift-${member.shift}`}>
                                            {shift.label}
                                        </span>
                                    </td>
                                    <td className="staff-salary">{(member.salary || 0).toLocaleString()}đ</td>
                                    <td>
                                        <div className="staff-notes-summary">
                                            {achievements > 0 && <span className="note-count achievement"><Star size={14} /> {achievements}</span>}
                                            {violations > 0 && <span className="note-count violation"><AlertTriangle size={14} /> {violations}</span>}
                                            {achievements === 0 && violations === 0 && <span className="note-empty">—</span>}
                                        </div>
                                    </td>
                                    <td>
                                        <div className="staff-actions">
                                            <button className="staff-action-btn btn-view" onClick={() => handleViewStaff(member)}>
                                                <Eye size={14} /> {t('shop.staffManagement.actions.view')}
                                            </button>
                                            <button className="staff-action-btn btn-edit" onClick={() => handleOpenEdit(member)}>
                                                <Pencil size={14} /> {t('common.edit')}
                                            </button>
                                            <button className="staff-action-btn btn-delete" onClick={() => handleDeleteStaff(member.id, member.name)}>
                                                <Trash2 size={14} />
                                            </button>
                                        </div>
                                    </td>
                                </tr>
                            )
                        })}
                    </tbody>
                </table>
            </div>

            {/* View / Notes Modal */}
            {showDetailModal && selectedStaff && (
                <div className="staff-modal-overlay" onClick={() => setShowDetailModal(false)}>
                    <div className="staff-modal staff-modal-wide" onClick={e => e.stopPropagation()}>
                        <div className="modal-header">
                            <div className="modal-header-info">
                                <div className="modal-avatar">{selectedStaff.name.charAt(0)}</div>
                                <div>
                                    <h2>{selectedStaff.name}</h2>
                                    <span className="modal-role-badge">{selectedStaff.role}</span>
                                </div>
                            </div>
                            <button className="modal-close" onClick={() => setShowDetailModal(false)}><X size={18} /></button>
                        </div>
                        <div className="modal-body">
                            {/* Personal Info */}
                            <div className="staff-detail-section">
                                <h3><User size={16} /> {t('shop.staffManagement.detail.personalInfo')}</h3>
                                <div className="detail-grid">
                                    <div><strong>{t('shop.staffManagement.detail.phone')}:</strong> {selectedStaff.phone}</div>
                                    <div><strong>{t('shop.staffManagement.detail.email')}:</strong> {selectedStaff.email}</div>
                                    <div><strong>{t('shop.staffManagement.detail.joinDate')}:</strong> {selectedStaff.joinDate}</div>
                                    <div><strong>{t('shop.staffManagement.detail.shift')}:</strong> {shiftMap[selectedStaff.shift]?.label || selectedStaff.shift}</div>
                                    <div><strong>{t('shop.staffManagement.detail.salary')}:</strong> {(selectedStaff.salary || 0).toLocaleString()}đ/{t('shop.staffManagement.detail.perMonth')}</div>
                                    <div><strong>{t('shop.staffManagement.detail.address')}:</strong> {selectedStaff.address}</div>
                                    <div>
                                        <strong>{t('shop.staffManagement.detail.attendance')}:</strong>{' '}
                                        <span
                                            className={`staff-status staff-status-${selectedStaff.attendanceStatus}`}
                                            style={{ cursor: 'pointer' }}
                                            onClick={() => {
                                                handleToggleAttendance(selectedStaff.id)
                                                setSelectedStaff(p => ({ ...p, attendanceStatus: p.attendanceStatus === 'present' ? 'absent' : 'present' }))
                                            }}>
                                            {selectedStaff.attendanceStatus === 'present'
                                                ? `● ${t('shop.staffManagement.present')}`
                                                : `○ ${t('shop.staffManagement.absent')}`}
                                        </span>
                                    </div>
                                    <div><strong>{t('shop.staffManagement.detail.skills')}:</strong> {(selectedStaff.skills || []).join(', ') || '—'}</div>
                                </div>
                            </div>

                            {/* Notes Section */}
                            <div className="staff-detail-section">
                                <h3><FileText size={16} /> {t('shop.staffManagement.notes.title')}</h3>
                                <div className="note-type-tabs">
                                    <button
                                        className={`note-type-btn ${noteTab === 'achievement' ? 'active-achievement' : ''}`}
                                        onClick={() => setNoteTab('achievement')}>
                                        <Star size={14} /> {t('shop.staffManagement.notes.achievements')} ({(selectedStaff.notes || []).filter(n => n.type === 'achievement').length})
                                    </button>
                                    <button
                                        className={`note-type-btn ${noteTab === 'violation' ? 'active-violation' : ''}`}
                                        onClick={() => setNoteTab('violation')}>
                                        <AlertTriangle size={14} /> {t('shop.staffManagement.notes.violations')} ({(selectedStaff.notes || []).filter(n => n.type === 'violation').length})
                                    </button>
                                </div>

                                <div className="note-list">
                                    {(selectedStaff.notes || []).filter(n => n.type === noteTab).length === 0 && (
                                        <div className="note-list-empty">
                                            {noteTab === 'achievement'
                                                ? t('shop.staffManagement.notes.emptyAchievements')
                                                : t('shop.staffManagement.notes.emptyViolations')}
                                        </div>
                                    )}
                                    {(selectedStaff.notes || []).filter(n => n.type === noteTab).map(note => (
                                        <div key={note.id} className={`note-item note-item-${note.type}`}>
                                            <div className="note-icon">
                                                {note.type === 'achievement' ? <Star size={14} /> : <AlertTriangle size={14} />}
                                            </div>
                                            <div className="note-body">
                                                <p className="note-text">{note.text}</p>
                                                <span className="note-date">{note.date}</span>
                                            </div>
                                            <button className="note-delete-btn"
                                                onClick={() => handleDeleteNote(selectedStaff.id, note.id)}>
                                                <Trash2 size={14} />
                                            </button>
                                        </div>
                                    ))}
                                </div>

                                <div className="note-add-area">
                                    <textarea
                                        className="note-textarea"
                                        placeholder={noteTab === 'achievement'
                                            ? t('shop.staffManagement.notes.placeholders.achievement')
                                            : t('shop.staffManagement.notes.placeholders.violation')}
                                        value={newNote}
                                        onChange={e => setNewNote(e.target.value)}
                                        rows={3}
                                    />
                                    <button
                                        className={`note-add-btn ${noteTab}`}
                                        onClick={() => handleAddNote(selectedStaff.id)}>
                                        <Plus size={14} /> {noteTab === 'achievement'
                                            ? t('shop.staffManagement.notes.addAchievement')
                                            : t('shop.staffManagement.notes.addViolation')}
                                    </button>
                                </div>
                            </div>
                        </div>
                        <div className="modal-footer">
                            <button className="btn-cancel" onClick={() => setShowDetailModal(false)}>{t('common.close')}</button>
                            <button className="btn-confirm" onClick={() => { setShowDetailModal(false); handleOpenEdit(selectedStaff) }}>
                                <Pencil size={14} /> {t('shop.staffManagement.actions.editStaff')}
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {/* Edit Modal */}
            {showEditModal && editForm && renderStaffForm(
                editForm, setEditForm, handleSaveEdit, () => setShowEditModal(false), t('shop.staffManagement.modals.editTitle')
            )}

            {/* Add Modal */}
            {showAddModal && renderStaffForm(
                addForm, setAddForm, handleAddStaff, () => { setShowAddModal(false); setAddForm(defaultAddForm) }, t('shop.staffManagement.modals.addTitle')
            )}

            {/* Confirm Dialog */}
            {confirmDialog.show && (
                <ConfirmDialog
                    title={confirmDialog.title}
                    message={confirmDialog.message}
                    type={confirmDialog.type}
                    onConfirm={confirmDialog.onConfirm}
                    onCancel={() => setConfirmDialog(p => ({ ...p, show: false }))}
                    confirmText={t('common.ok')}
                    cancelText={t('common.cancel')}
                />
            )}
        </div>
    )
}

export default ShopStaffManagement

