import './Staff.css'

function Staff() {
    const staff = [
        { id: 'NV001', name: 'Nguyễn Văn A', role: 'Quản lý', shift: 'Sáng', status: 'present', checkIn: '07:00', checkOut: '-' },
        { id: 'NV002', name: 'Trần Thị B', role: 'Nhân viên giặt', shift: 'Sáng', status: 'present', checkIn: '07:15', checkOut: '-' },
        { id: 'NV003', name: 'Lê Văn C', role: 'Nhân viên giao hàng', shift: 'Sáng', status: 'present', checkIn: '07:30', checkOut: '-' },
        { id: 'NV004', name: 'Phạm Thị D', role: 'Nhân viên giặt', shift: 'Chiều', status: 'absent', checkIn: '-', checkOut: '-' },
        { id: 'NV005', name: 'Hoàng Văn E', role: 'Kỹ thuật viên', shift: 'Sáng', status: 'present', checkIn: '07:00', checkOut: '-' }
    ]

    const attendanceStats = [
        { label: 'Tổng nhân viên', value: 15, color: '#0b416a' },
        { label: 'Đã chấm công', value: 12, color: '#10b981' },
        { label: 'Vắng mặt', value: 3, color: '#ef4444' }
    ]

    return (
        <div className="staff-page">
            <div className="page-header">
                <h1 className="page-title">Quản lý nhân viên</h1>
                <button className="btn-primary">
                    <svg width="20" height="20" viewBox="0 0 24 24" fill="none">
                        <path d="M19 13h-6v6h-2v-6H5v-2h6V5h2v6h6v2z" fill="currentColor" />
                    </svg>
                    Thêm nhân viên
                </button>
            </div>

            <div className="attendance-stats">
                {attendanceStats.map((stat, index) => (
                    <div key={index} className="stat-card" style={{ borderTopColor: stat.color }}>
                        <div className="stat-label">{stat.label}</div>
                        <div className="stat-value">{stat.value}</div>
                    </div>
                ))}
            </div>

            <div className="staff-section">
                <div className="section-header">
                    <h2 className="section-title">Bảng chấm công hôm nay</h2>
                    <div className="date-display">26/02/2026</div>
                </div>

                <div className="staff-table-container">
                    <table className="staff-table">
                        <thead>
                            <tr>
                                <th>Mã NV</th>
                                <th>Họ tên</th>
                                <th>Chức vụ</th>
                                <th>Ca làm việc</th>
                                <th>Trạng thái</th>
                                <th>Giờ vào</th>
                                <th>Giờ ra</th>
                                <th>Hành động</th>
                            </tr>
                        </thead>
                        <tbody>
                            {staff.map((member) => (
                                <tr key={member.id}>
                                    <td className="staff-id">{member.id}</td>
                                    <td className="staff-name">{member.name}</td>
                                    <td>{member.role}</td>
                                    <td>{member.shift}</td>
                                    <td>
                                        <span className={`status-badge ${member.status === 'present' ? 'status-present' : 'status-absent'}`}>
                                            {member.status === 'present' ? 'Có mặt' : 'Vắng'}
                                        </span>
                                    </td>
                                    <td>{member.checkIn}</td>
                                    <td>{member.checkOut}</td>
                                    <td>
                                        <div className="action-buttons">
                                            <button className="btn-icon" title="Xem chi tiết">
                                                <svg width="18" height="18" viewBox="0 0 24 24" fill="none">
                                                    <path d="M12 4.5C7 4.5 2.73 7.61 1 12c1.73 4.39 6 7.5 11 7.5s9.27-3.11 11-7.5c-1.73-4.39-6-7.5-11-7.5zM12 17c-2.76 0-5-2.24-5-5s2.24-5 5-5 5 2.24 5 5-2.24 5-5 5zm0-8c-1.66 0-3 1.34-3 3s1.34 3 3 3 3-1.34 3-3-1.34-3-3-3z" fill="currentColor" />
                                                </svg>
                                            </button>
                                            <button className="btn-icon" title="Chỉnh sửa">
                                                <svg width="18" height="18" viewBox="0 0 24 24" fill="none">
                                                    <path d="M3 17.25V21h3.75L17.81 9.94l-3.75-3.75L3 17.25zM20.71 7.04c.39-.39.39-1.02 0-1.41l-2.34-2.34c-.39-.39-1.02-.39-1.41 0l-1.83 1.83 3.75 3.75 1.83-1.83z" fill="currentColor" />
                                                </svg>
                                            </button>
                                        </div>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </div>

            <div className="shift-schedule">
                <h2 className="section-title">Lịch làm việc</h2>
                <div className="schedule-grid">
                    <div className="schedule-card">
                        <div className="schedule-header">
                            <h3>Ca sáng</h3>
                            <span className="schedule-time">07:00 - 15:00</span>
                        </div>
                        <div className="schedule-count">8 nhân viên</div>
                    </div>

                    <div className="schedule-card">
                        <div className="schedule-header">
                            <h3>Ca chiều</h3>
                            <span className="schedule-time">15:00 - 23:00</span>
                        </div>
                        <div className="schedule-count">7 nhân viên</div>
                    </div>
                </div>
            </div>
        </div>
    )
}

export default Staff
