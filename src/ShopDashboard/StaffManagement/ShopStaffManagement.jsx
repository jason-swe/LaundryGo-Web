import { useState, useEffect } from 'react'
import {
    UserOutlined,
    ClockCircleOutlined,
    CalendarOutlined,
    DollarOutlined,
    PlusOutlined,
    EditOutlined,
    EyeOutlined,
    DeleteOutlined,
    CloseOutlined,
    CheckCircleOutlined,
    MinusCircleOutlined,
    FileTextOutlined,
    WarningOutlined,
    StarOutlined,
    TeamOutlined
} from '@ant-design/icons'
import './ShopStaffManagement.css'
import { staff as staffData } from '../../data'
import { loadStaff, saveStaff } from '../../utils/dataManager'
import toast from '../../utils/toast'
import ConfirmDialog from '../../components/ConfirmDialog/ConfirmDialog'

function ShopStaffManagement() {
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

    const shiftMap = {
        morning: { label: 'Morning', time: '6:00 – 14:00', color: '#5492b4' },
        afternoon: { label: 'Afternoon', time: '14:00 – 22:00', color: '#719FC2' },
        evening: { label: 'Evening', time: '18:00 – 22:00', color: '#719FC2' },
        'full-time': { label: 'Full-time', time: '8:00 – 17:00', color: '#4d9e84' },
        'on-call': { label: 'On-call', time: 'As needed', color: '#64748b' }
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
            toast.warning('Name and phone are required')
            return
        }
        setStaff(prev => prev.map(s =>
            s.id === editForm.id ? { ...s, ...editForm, salary: Number(editForm.salary) } : s
        ))
        toast.success(`Staff ${editForm.name} updated successfully!`)
        setShowEditModal(false)
    }

    const handleAddStaff = () => {
        if (!addForm.name || !addForm.phone) {
            toast.warning('Name and phone are required')
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
        toast.success(`Staff ${newMember.name} added successfully!`)
        setAddForm(defaultAddForm)
        setShowAddModal(false)
    }

    const handleDeleteStaff = (staffId, name) => {
        setConfirmDialog({
            show: true,
            title: 'Delete Staff',
            message: `Are you sure you want to remove ${name}?`,
            type: 'danger',
            onConfirm: () => {
                setStaff(prev => prev.filter(s => s.id !== staffId))
                toast.success(`${name} removed successfully!`)
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
            date: new Date().toLocaleDateString('vi-VN')
        }
        const updated = staff.map(s =>
            s.id === staffId ? { ...s, notes: [...(s.notes || []), note] } : s
        )
        setStaff(updated)
        const updatedMember = updated.find(s => s.id === staffId)
        setSelectedStaff(updatedMember)
        setNewNote('')
        toast.success('Note added!')
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
                    <button className="modal-close" onClick={onClose}><CloseOutlined /></button>
                </div>
                <div className="modal-body">
                    <div className="detail-grid">
                        <div className="form-group-staff">
                            <label>Full Name *</label>
                            <input className="staff-input" value={form.name}
                                onChange={e => setForm({ ...form, name: e.target.value })} placeholder="Nguyễn Văn A" />
                        </div>
                        <div className="form-group-staff">
                            <label>Phone *</label>
                            <input className="staff-input" value={form.phone}
                                onChange={e => setForm({ ...form, phone: e.target.value })} placeholder="09xxxxxxxx" />
                        </div>
                        <div className="form-group-staff">
                            <label>Email</label>
                            <input className="staff-input" value={form.email}
                                onChange={e => setForm({ ...form, email: e.target.value })} placeholder="email@example.com" />
                        </div>
                        <div className="form-group-staff">
                            <label>Role</label>
                            <select className="staff-input" value={form.role}
                                onChange={e => setForm({ ...form, role: e.target.value })}>
                                <option>Manager</option>
                                <option>Operator</option>
                                <option>Technician</option>
                                <option>Customer Service</option>
                                <option>Shipper</option>
                            </select>
                        </div>
                        <div className="form-group-staff">
                            <label>Shift</label>
                            <select className="staff-input" value={form.shift}
                                onChange={e => setForm({ ...form, shift: e.target.value })}>
                                <option value="morning">Morning (6:00 – 14:00)</option>
                                <option value="afternoon">Afternoon (14:00 – 22:00)</option>
                                <option value="evening">Evening (18:00 – 22:00)</option>
                                <option value="full-time">Full-time (8:00 – 17:00)</option>
                                <option value="on-call">On-call</option>
                            </select>
                        </div>
                        <div className="form-group-staff">
                            <label>Monthly Salary (đ)</label>
                            <input className="staff-input" type="number" value={form.salary}
                                onChange={e => setForm({ ...form, salary: e.target.value })} placeholder="9000000" />
                        </div>
                        <div className="form-group-staff" style={{ gridColumn: '1/-1' }}>
                            <label>Address</label>
                            <input className="staff-input" value={form.address}
                                onChange={e => setForm({ ...form, address: e.target.value })} placeholder="123 Đường ABC, Quận 1, TP.HCM" />
                        </div>
                    </div>
                </div>
                <div className="modal-footer">
                    <button className="btn-cancel" onClick={onClose}>Cancel</button>
                    <button className="btn-confirm" onClick={onSave}>Save</button>
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
                        <TeamOutlined style={{ marginRight: '8px' }} />
                        Staff Management
                    </h1>
                    <p className="shop-staff-subtitle">Manage team, shifts, and today's attendance</p>
                </div>
                <button className="shop-staff-add-btn" onClick={() => setShowAddModal(true)}>
                    <PlusOutlined /> Add Staff
                </button>
            </div>

            {/* Stats */}
            <div className="shop-staff-stats">
                <div className="staff-stat-card">
                    <div className="stat-icon" style={{ background: 'rgba(113,159,194,0.1)' }}>
                        <UserOutlined style={{ fontSize: '24px', color: '#719FC2' }} />
                    </div>
                    <div className="stat-content">
                        <div className="stat-label">Total Staff</div>
                        <div className="stat-value">{staff.length}</div>
                    </div>
                </div>
                <div className="staff-stat-card">
                    <div className="stat-icon" style={{ background: 'rgba(77,158,132,0.1)' }}>
                        <CheckCircleOutlined style={{ fontSize: '24px', color: '#4d9e84' }} />
                    </div>
                    <div className="stat-content">
                        <div className="stat-label">Present Today</div>
                        <div className="stat-value">{presentStaff.length}</div>
                    </div>
                </div>
                <div className="staff-stat-card">
                    <div className="stat-icon" style={{ background: 'rgba(192,90,80,0.1)' }}>
                        <MinusCircleOutlined style={{ fontSize: '24px', color: '#c05a50' }} />
                    </div>
                    <div className="stat-content">
                        <div className="stat-label">Absent Today</div>
                        <div className="stat-value">{absentStaff.length}</div>
                    </div>
                </div>
                <div className="staff-stat-card">
                    <div className="stat-icon" style={{ background: 'rgba(184,137,42,0.1)' }}>
                        <DollarOutlined style={{ fontSize: '24px', color: '#5492b4' }} />
                    </div>
                    <div className="stat-content">
                        <div className="stat-label">Total Salary</div>
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
                        <CalendarOutlined style={{ color: '#719FC2' }} />
                        <h3>Today's Attendance</h3>
                        <span className="today-date">{new Date().toLocaleDateString('vi-VN', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}</span>
                    </div>
                    <div className="attendance-columns">
                        <div className="attendance-col attendance-present-col">
                            <div className="attendance-col-header">
                                <CheckCircleOutlined />
                                <span>Present ({presentStaff.length})</span>
                            </div>
                            {presentStaff.map(s => (
                                <div key={s.id} className="attendance-person">
                                    <div className="attendance-avatar" style={{ background: 'linear-gradient(135deg,#4d9e84,#3d806a)' }}>
                                        {s.name.charAt(0)}
                                    </div>
                                    <div className="attendance-info">
                                        <span className="attendance-name">{s.name}</span>
                                        <span className="attendance-role">{s.role}</span>
                                    </div>
                                    <button className="attendance-toggle-btn present"
                                        onClick={() => handleToggleAttendance(s.id)}
                                        title="Mark as Absent">✓</button>
                                </div>
                            ))}
                            {presentStaff.length === 0 && <div className="attendance-empty">No one present</div>}
                        </div>
                        <div className="attendance-col attendance-absent-col">
                            <div className="attendance-col-header">
                                <MinusCircleOutlined />
                                <span>Absent ({absentStaff.length})</span>
                            </div>
                            {absentStaff.map(s => (
                                <div key={s.id} className="attendance-person">
                                    <div className="attendance-avatar" style={{ background: 'linear-gradient(135deg,#c05a50,#a84848)' }}>
                                        {s.name.charAt(0)}
                                    </div>
                                    <div className="attendance-info">
                                        <span className="attendance-name">{s.name}</span>
                                        <span className="attendance-role">{s.role}</span>
                                    </div>
                                    <button className="attendance-toggle-btn absent"
                                        onClick={() => handleToggleAttendance(s.id)}
                                        title="Mark as Present">✗</button>
                                </div>
                            ))}
                            {absentStaff.length === 0 && <div className="attendance-empty">No one absent</div>}
                        </div>
                    </div>
                </div>

                {/* Today's Shifts */}
                <div className="staff-today-card">
                    <div className="today-card-header">
                        <ClockCircleOutlined style={{ color: '#719FC2' }} />
                        <h3>Today's Shifts</h3>
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
                        {tab === 'all' ? `All Staff (${staff.length})` : tab === 'present' ? `Present (${presentStaff.length})` : `Absent (${absentStaff.length})`}
                    </button>
                ))}
            </div>

            <div className="shop-staff-table-container">
                <table className="shop-staff-table">
                    <thead>
                        <tr>
                            <th>Name</th>
                            <th>Role</th>
                            <th>Status</th>
                            <th>Shift</th>
                            <th>Salary</th>
                            <th>Notes</th>
                            <th>Actions</th>
                        </tr>
                    </thead>
                    <tbody>
                        {filteredStaff.map(member => {
                            const achievements = (member.notes || []).filter(n => n.type === 'achievement').length
                            const violations = (member.notes || []).filter(n => n.type === 'violation').length
                            const shift = shiftMap[member.shift] || { label: member.shift, color: '#64748b' }
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
                                    <td><span className="staff-role">{member.role}</span></td>
                                    <td>
                                        <span className={`staff-status staff-status-${member.attendanceStatus}`}>
                                            {member.attendanceStatus === 'present' ? '● Present' : '○ Absent'}
                                        </span>
                                    </td>
                                    <td>
                                        <span className="staff-shift-badge" style={{ background: shift.color + '18', color: shift.color }}>
                                            {shift.label}
                                        </span>
                                    </td>
                                    <td className="staff-salary">{(member.salary || 0).toLocaleString()}đ</td>
                                    <td>
                                        <div className="staff-notes-summary">
                                            {achievements > 0 && <span className="note-count achievement"><StarOutlined /> {achievements}</span>}
                                            {violations > 0 && <span className="note-count violation"><WarningOutlined /> {violations}</span>}
                                            {achievements === 0 && violations === 0 && <span className="note-empty">—</span>}
                                        </div>
                                    </td>
                                    <td>
                                        <div className="staff-actions">
                                            <button className="staff-action-btn btn-view" onClick={() => handleViewStaff(member)}>
                                                <EyeOutlined /> View
                                            </button>
                                            <button className="staff-action-btn btn-edit" onClick={() => handleOpenEdit(member)}>
                                                <EditOutlined /> Edit
                                            </button>
                                            <button className="staff-action-btn btn-delete" onClick={() => handleDeleteStaff(member.id, member.name)}>
                                                <DeleteOutlined />
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
                            <button className="modal-close" onClick={() => setShowDetailModal(false)}><CloseOutlined /></button>
                        </div>
                        <div className="modal-body">
                            {/* Personal Info */}
                            <div className="staff-detail-section">
                                <h3><UserOutlined /> Personal Information</h3>
                                <div className="detail-grid">
                                    <div><strong>Phone:</strong> {selectedStaff.phone}</div>
                                    <div><strong>Email:</strong> {selectedStaff.email}</div>
                                    <div><strong>Join Date:</strong> {selectedStaff.joinDate}</div>
                                    <div><strong>Shift:</strong> {shiftMap[selectedStaff.shift]?.label || selectedStaff.shift}</div>
                                    <div><strong>Salary:</strong> {(selectedStaff.salary || 0).toLocaleString()}đ/tháng</div>
                                    <div><strong>Address:</strong> {selectedStaff.address}</div>
                                    <div>
                                        <strong>Attendance:</strong>{' '}
                                        <span
                                            className={`staff-status staff-status-${selectedStaff.attendanceStatus}`}
                                            style={{ cursor: 'pointer' }}
                                            onClick={() => {
                                                handleToggleAttendance(selectedStaff.id)
                                                setSelectedStaff(p => ({ ...p, attendanceStatus: p.attendanceStatus === 'present' ? 'absent' : 'present' }))
                                            }}>
                                            {selectedStaff.attendanceStatus === 'present' ? '● Present' : '○ Absent'}
                                        </span>
                                    </div>
                                    <div><strong>Skills:</strong> {(selectedStaff.skills || []).join(', ') || '—'}</div>
                                </div>
                            </div>

                            {/* Notes Section */}
                            <div className="staff-detail-section">
                                <h3><FileTextOutlined /> Notes</h3>
                                <div className="note-type-tabs">
                                    <button
                                        className={`note-type-btn ${noteTab === 'achievement' ? 'active-achievement' : ''}`}
                                        onClick={() => setNoteTab('achievement')}>
                                        <StarOutlined /> Achievements ({(selectedStaff.notes || []).filter(n => n.type === 'achievement').length})
                                    </button>
                                    <button
                                        className={`note-type-btn ${noteTab === 'violation' ? 'active-violation' : ''}`}
                                        onClick={() => setNoteTab('violation')}>
                                        <WarningOutlined /> Violations ({(selectedStaff.notes || []).filter(n => n.type === 'violation').length})
                                    </button>
                                </div>

                                <div className="note-list">
                                    {(selectedStaff.notes || []).filter(n => n.type === noteTab).length === 0 && (
                                        <div className="note-list-empty">No {noteTab}s recorded yet.</div>
                                    )}
                                    {(selectedStaff.notes || []).filter(n => n.type === noteTab).map(note => (
                                        <div key={note.id} className={`note-item note-item-${note.type}`}>
                                            <div className="note-icon">
                                                {note.type === 'achievement' ? <StarOutlined /> : <WarningOutlined />}
                                            </div>
                                            <div className="note-body">
                                                <p className="note-text">{note.text}</p>
                                                <span className="note-date">{note.date}</span>
                                            </div>
                                            <button className="note-delete-btn"
                                                onClick={() => handleDeleteNote(selectedStaff.id, note.id)}>
                                                <DeleteOutlined />
                                            </button>
                                        </div>
                                    ))}
                                </div>

                                <div className="note-add-area">
                                    <textarea
                                        className="note-textarea"
                                        placeholder={noteTab === 'achievement' ? 'Ghi nhận thành tích, khen thưởng...' : 'Ghi nhận vi phạm, lỗi sai phạm...'}
                                        value={newNote}
                                        onChange={e => setNewNote(e.target.value)}
                                        rows={3}
                                    />
                                    <button
                                        className={`note-add-btn ${noteTab}`}
                                        onClick={() => handleAddNote(selectedStaff.id)}>
                                        <PlusOutlined /> Add {noteTab === 'achievement' ? 'Achievement' : 'Violation'}
                                    </button>
                                </div>
                            </div>
                        </div>
                        <div className="modal-footer">
                            <button className="btn-cancel" onClick={() => setShowDetailModal(false)}>Close</button>
                            <button className="btn-confirm" onClick={() => { setShowDetailModal(false); handleOpenEdit(selectedStaff) }}>
                                <EditOutlined /> Edit Staff
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {/* Edit Modal */}
            {showEditModal && editForm && renderStaffForm(
                editForm, setEditForm, handleSaveEdit, () => setShowEditModal(false), 'Edit Staff'
            )}

            {/* Add Modal */}
            {showAddModal && renderStaffForm(
                addForm, setAddForm, handleAddStaff, () => { setShowAddModal(false); setAddForm(defaultAddForm) }, 'Add New Staff'
            )}

            {/* Confirm Dialog */}
            {confirmDialog.show && (
                <ConfirmDialog
                    title={confirmDialog.title}
                    message={confirmDialog.message}
                    type={confirmDialog.type}
                    onConfirm={confirmDialog.onConfirm}
                    onCancel={() => setConfirmDialog(p => ({ ...p, show: false }))}
                />
            )}
        </div>
    )
}

export default ShopStaffManagement

