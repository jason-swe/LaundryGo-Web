import { useState } from 'react'
import {
    UserOutlined,
    ClockCircleOutlined,
    CalendarOutlined,
    DollarOutlined,
    TrophyOutlined,
    PlusOutlined,
    EditOutlined,
    EyeOutlined
} from '@ant-design/icons'
import './ShopStaffManagement.css'

function ShopStaffManagement() {
    const [activeTab, setActiveTab] = useState('all')
    const [showStaffModal, setShowStaffModal] = useState(false)
    const [selectedStaff, setSelectedStaff] = useState(null)

    const staff = [
        {
            id: 1,
            name: 'Nguyễn Văn A',
            role: 'Manager',
            status: 'present',
            hoursToday: '8/8h',
            phone: '0901234567',
            email: 'nguyenvana@email.com',
            joinDate: '2023-01-15',
            salary: 8000000,
            shiftType: 'full-time',
            performance: {
                ordersHandled: 156,
                customerRating: 4.8,
                attendanceRate: 98
            },
            shifts: [
                { day: 'Mon', start: '08:00', end: '17:00' },
                { day: 'Tue', start: '08:00', end: '17:00' },
                { day: 'Wed', start: '08:00', end: '17:00' },
                { day: 'Thu', start: '08:00', end: '17:00' },
                { day: 'Fri', start: '08:00', end: '17:00' }
            ]
        },
        {
            id: 2,
            name: 'Trần Thị B',
            role: 'Operator',
            status: 'present',
            hoursToday: '6/8h',
            phone: '0902345678',
            email: 'tranthib@email.com',
            joinDate: '2023-03-20',
            salary: 6000000,
            shiftType: 'full-time',
            performance: {
                ordersHandled: 142,
                customerRating: 4.6,
                attendanceRate: 95
            },
            shifts: [
                { day: 'Mon', start: '08:00', end: '17:00' },
                { day: 'Tue', start: '08:00', end: '17:00' },
                { day: 'Wed', start: '08:00', end: '17:00' },
                { day: 'Thu', start: '08:00', end: '17:00' },
                { day: 'Fri', start: '08:00', end: '17:00' }
            ]
        },
        {
            id: 3,
            name: 'Lê Văn C',
            role: 'Operator',
            status: 'absent',
            hoursToday: '0/8h',
            phone: '0903456789',
            email: 'levanc@email.com',
            joinDate: '2023-05-10',
            salary: 5500000,
            shiftType: 'part-time',
            performance: {
                ordersHandled: 89,
                customerRating: 4.3,
                attendanceRate: 85
            },
            shifts: [
                { day: 'Mon', start: '13:00', end: '18:00' },
                { day: 'Wed', start: '13:00', end: '18:00' },
                { day: 'Fri', start: '13:00', end: '18:00' }
            ]
        },
        {
            id: 4,
            name: 'Phạm Thị D',
            role: 'Cleaner',
            status: 'present',
            hoursToday: '7/8h',
            phone: '0904567890',
            email: 'phamthid@email.com',
            joinDate: '2023-07-01',
            salary: 5000000,
            shiftType: 'full-time',
            performance: {
                ordersHandled: 178,
                customerRating: 4.9,
                attendanceRate: 99
            },
            shifts: [
                { day: 'Mon', start: '08:00', end: '17:00' },
                { day: 'Tue', start: '08:00', end: '17:00' },
                { day: 'Wed', start: '08:00', end: '17:00' },
                { day: 'Thu', start: '08:00', end: '17:00' },
                { day: 'Fri', start: '08:00', end: '17:00' },
                { day: 'Sat', start: '08:00', end: '12:00' }
            ]
        }
    ]

    const filteredStaff =
        activeTab === 'all'
            ? staff
            : activeTab === 'present'
                ? staff.filter((s) => s.status === 'present')
                : staff.filter((s) => s.status === 'absent')

    const handleViewStaff = (member) => {
        setSelectedStaff(member)
        setShowStaffModal(true)
    }

    return (
        <div className="shop-staff">
            <div className="shop-staff-header">
                <div>
                    <h1 className="shop-staff-title">
                        <UserOutlined style={{ marginRight: '8px' }} />
                        Staff Management
                    </h1>
                    <p className="shop-staff-subtitle">Manage team, shifts, and performance</p>
                </div>
                <button className="shop-staff-add-btn">
                    <PlusOutlined /> Add Staff
                </button>
            </div>

            {/* Stats */}
            <div className="shop-staff-stats">
                <div className="staff-stat-card">
                    <div className="stat-icon" style={{ background: 'rgba(59, 130, 246, 0.1)' }}>
                        <UserOutlined style={{ fontSize: '24px', color: '#3b82f6' }} />
                    </div>
                    <div className="stat-content">
                        <div className="stat-label">Total Staff</div>
                        <div className="stat-value">{staff.length}</div>
                    </div>
                </div>

                <div className="staff-stat-card">
                    <div className="stat-icon" style={{ background: 'rgba(16, 185, 129, 0.1)' }}>
                        <ClockCircleOutlined style={{ fontSize: '24px', color: '#10b981' }} />
                    </div>
                    <div className="stat-content">
                        <div className="stat-label">Present Today</div>
                        <div className="stat-value">
                            {staff.filter((s) => s.status === 'present').length}
                        </div>
                    </div>
                </div>

                <div className="staff-stat-card">
                    <div className="stat-icon" style={{ background: 'rgba(239, 68, 68, 0.1)' }}>
                        <CalendarOutlined style={{ fontSize: '24px', color: '#ef4444' }} />
                    </div>
                    <div className="stat-content">
                        <div className="stat-label">Absent Today</div>
                        <div className="stat-value">
                            {staff.filter((s) => s.status === 'absent').length}
                        </div>
                    </div>
                </div>

                <div className="staff-stat-card">
                    <div className="stat-icon" style={{ background: 'rgba(245, 158, 11, 0.1)' }}>
                        <DollarOutlined style={{ fontSize: '24px', color: '#f59e0b' }} />
                    </div>
                    <div className="stat-content">
                        <div className="stat-label">Total Salary</div>
                        <div className="stat-value">
                            {(
                                staff.reduce((sum, s) => sum + s.salary, 0) / 1000000
                            ).toFixed(1)}
                            M
                        </div>
                    </div>
                </div>
            </div>

            {/* Tabs */}
            <div className="shop-staff-tabs">
                <button
                    className={`staff-tab ${activeTab === 'all' ? 'active' : ''}`}
                    onClick={() => setActiveTab('all')}
                >
                    All Staff
                </button>
                <button
                    className={`staff-tab ${activeTab === 'present' ? 'active' : ''}`}
                    onClick={() => setActiveTab('present')}
                >
                    Present
                </button>
                <button
                    className={`staff-tab ${activeTab === 'absent' ? 'active' : ''}`}
                    onClick={() => setActiveTab('absent')}
                >
                    Absent
                </button>
            </div>

            {/* Staff Table */}
            <div className="shop-staff-table-container">
                <table className="shop-staff-table">
                    <thead>
                        <tr>
                            <th>Name</th>
                            <th>Role</th>
                            <th>Status</th>
                            <th>Hours Today</th>
                            <th>Shift Type</th>
                            <th>Salary</th>
                            <th>Performance</th>
                            <th>Actions</th>
                        </tr>
                    </thead>
                    <tbody>
                        {filteredStaff.map((member) => (
                            <tr key={member.id}>
                                <td>
                                    <div className="staff-name-cell">
                                        <div className="staff-avatar">
                                            {member.name.charAt(0)}
                                        </div>
                                        <div>
                                            <div className="staff-name">{member.name}</div>
                                            <div className="staff-phone">{member.phone}</div>
                                        </div>
                                    </div>
                                </td>
                                <td>
                                    <span className="staff-role">{member.role}</span>
                                </td>
                                <td>
                                    <span
                                        className={`staff-status staff-status-${member.status}`}
                                    >
                                        {member.status === 'present' ? '● Present' : '○ Absent'}
                                    </span>
                                </td>
                                <td className="staff-hours">{member.hoursToday}</td>
                                <td>
                                    <span className="staff-shift-type">{member.shiftType}</span>
                                </td>
                                <td className="staff-salary">
                                    {member.salary.toLocaleString()}đ
                                </td>
                                <td>
                                    <div className="staff-performance">
                                        <TrophyOutlined style={{ color: '#f59e0b' }} />
                                        <span>{member.performance.customerRating}/5.0</span>
                                    </div>
                                </td>
                                <td>
                                    <div className="staff-actions">
                                        <button
                                            className="staff-action-btn btn-view"
                                            onClick={() => handleViewStaff(member)}
                                        >
                                            <EyeOutlined /> View
                                        </button>
                                        <button className="staff-action-btn btn-edit">
                                            <EditOutlined /> Edit
                                        </button>
                                    </div>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>

            {/* Staff Detail Modal */}
            {showStaffModal && selectedStaff && (
                <div
                    className="staff-modal-overlay"
                    onClick={() => setShowStaffModal(false)}
                >
                    <div className="staff-modal" onClick={(e) => e.stopPropagation()}>
                        <div className="modal-header">
                            <h2>Staff Details</h2>
                            <button
                                className="modal-close"
                                onClick={() => setShowStaffModal(false)}
                            >
                                ×
                            </button>
                        </div>
                        <div className="modal-body">
                            <div className="staff-detail-section">
                                <h3>Personal Information</h3>
                                <div className="detail-grid">
                                    <div>
                                        <strong>Name:</strong> {selectedStaff.name}
                                    </div>
                                    <div>
                                        <strong>Role:</strong> {selectedStaff.role}
                                    </div>
                                    <div>
                                        <strong>Phone:</strong> {selectedStaff.phone}
                                    </div>
                                    <div>
                                        <strong>Email:</strong> {selectedStaff.email}
                                    </div>
                                    <div>
                                        <strong>Join Date:</strong> {selectedStaff.joinDate}
                                    </div>
                                    <div>
                                        <strong>Shift Type:</strong> {selectedStaff.shiftType}
                                    </div>
                                </div>
                            </div>

                            <div className="staff-detail-section">
                                <h3>Performance Metrics</h3>
                                <div className="performance-grid">
                                    <div className="performance-card">
                                        <div className="performance-label">Orders Handled</div>
                                        <div className="performance-value">
                                            {selectedStaff.performance.ordersHandled}
                                        </div>
                                    </div>
                                    <div className="performance-card">
                                        <div className="performance-label">Customer Rating</div>
                                        <div className="performance-value">
                                            {selectedStaff.performance.customerRating}/5.0
                                        </div>
                                    </div>
                                    <div className="performance-card">
                                        <div className="performance-label">Attendance Rate</div>
                                        <div className="performance-value">
                                            {selectedStaff.performance.attendanceRate}%
                                        </div>
                                    </div>
                                </div>
                            </div>

                            <div className="staff-detail-section">
                                <h3>Weekly Schedule</h3>
                                <div className="schedule-list">
                                    {selectedStaff.shifts.map((shift, index) => (
                                        <div key={index} className="schedule-item">
                                            <div className="schedule-day">{shift.day}</div>
                                            <div className="schedule-time">
                                                {shift.start} - {shift.end}
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            </div>

                            <div className="staff-detail-section">
                                <h3>Salary Information</h3>
                                <div className="salary-info">
                                    <div className="salary-card">
                                        <div className="salary-label">Monthly Salary</div>
                                        <div className="salary-amount">
                                            {selectedStaff.salary.toLocaleString()}đ
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                        <div className="modal-footer">
                            <button
                                className="btn-cancel"
                                onClick={() => setShowStaffModal(false)}
                            >
                                Close
                            </button>
                            <button className="btn-edit-staff">Edit Information</button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    )
}

export default ShopStaffManagement
