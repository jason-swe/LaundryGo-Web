import './IncidentReport.css'
import { useState } from 'react'

function IncidentReport() {
    const [showForm, setShowForm] = useState(false)
    const [formData, setFormData] = useState({
        title: '',
        category: '',
        priority: 'medium',
        description: ''
    })

    const reports = [
        {
            id: 'INC001',
            title: 'Máy giặt M005 không hoạt động',
            category: 'Kỹ thuật',
            priority: 'high',
            status: 'pending',
            date: '26/02/2026',
            time: '09:30 AM',
            reporter: 'Nguyễn Văn A'
        },
        {
            id: 'INC002',
            title: 'Thiếu nước xả vải',
            category: 'Vật tư',
            priority: 'medium',
            status: 'in-progress',
            date: '25/02/2026',
            time: '02:15 PM',
            reporter: 'Trần Thị B'
        },
        {
            id: 'INC003',
            title: 'Khách hàng phản ánh chất lượng',
            category: 'Dịch vụ',
            priority: 'high',
            status: 'resolved',
            date: '24/02/2026',
            time: '11:00 AM',
            reporter: 'Lê Văn C'
        }
    ]

    const handleSubmit = (e) => {
        e.preventDefault()
        console.log('Submit report:', formData)
        setShowForm(false)
        setFormData({ title: '', category: '', priority: 'medium', description: '' })
    }

    return (
        <div className="incident-page">
            <div className="page-header">
                <h1 className="page-title">Báo cáo sự cố</h1>
                <button className="btn-primary" onClick={() => setShowForm(true)}>
                    <svg width="20" height="20" viewBox="0 0 24 24" fill="none">
                        <path d="M19 13h-6v6h-2v-6H5v-2h6V5h2v6h6v2z" fill="currentColor" />
                    </svg>
                    Báo cáo mới
                </button>
            </div>

            <div className="incident-stats">
                <div className="incident-stat">
                    <div className="stat-icon" style={{ background: '#eef5fb' }}>
                        <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
                            <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm1 15h-2v-2h2v2zm0-4h-2V7h2v6z" fill="#5492b4" />
                        </svg>
                    </div>
                    <div className="stat-info">
                        <div className="stat-value">5</div>
                        <div className="stat-label">Chờ xử lý</div>
                    </div>
                </div>

                <div className="incident-stat">
                    <div className="stat-icon" style={{ background: '#dbeafe' }}>
                        <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
                            <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-2 15l-5-5 1.41-1.41L10 14.17l7.59-7.59L19 8l-9 9z" fill="#3b82f6" />
                        </svg>
                    </div>
                    <div className="stat-info">
                        <div className="stat-value">3</div>
                        <div className="stat-label">Đang xử lý</div>
                    </div>
                </div>

                <div className="incident-stat">
                    <div className="stat-icon" style={{ background: '#d1fae5' }}>
                        <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
                            <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-2 15l-5-5 1.41-1.41L10 14.17l7.59-7.59L19 8l-9 9z" fill="#10b981" />
                        </svg>
                    </div>
                    <div className="stat-info">
                        <div className="stat-value">42</div>
                        <div className="stat-label">Đã xử lý</div>
                    </div>
                </div>
            </div>

            <div className="incidents-list">
                {reports.map((report) => (
                    <div key={report.id} className="incident-card">
                        <div className="incident-header">
                            <div className="incident-id">{report.id}</div>
                            <div className="incident-badges">
                                <span className={`priority-badge priority-${report.priority}`}>
                                    {report.priority === 'high' && 'Cao'}
                                    {report.priority === 'medium' && 'Trung bình'}
                                    {report.priority === 'low' && 'Thấp'}
                                </span>
                                <span className={`status-badge status-${report.status}`}>
                                    {report.status === 'pending' && 'Chờ xử lý'}
                                    {report.status === 'in-progress' && 'Đang xử lý'}
                                    {report.status === 'resolved' && 'Đã xử lý'}
                                </span>
                            </div>
                        </div>

                        <h3 className="incident-title">{report.title}</h3>

                        <div className="incident-meta">
                            <div className="meta-item">
                                <svg width="16" height="16" viewBox="0 0 24 24" fill="none">
                                    <path d="M12 12c2.21 0 4-1.79 4-4s-1.79-4-4-4-4 1.79-4 4 1.79 4 4 4zm0 2c-2.67 0-8 1.34-8 4v2h16v-2c0-2.66-5.33-4-8-4z" fill="currentColor" />
                                </svg>
                                {report.reporter}
                            </div>
                            <div className="meta-item">
                                <svg width="16" height="16" viewBox="0 0 24 24" fill="none">
                                    <path d="M9 11H7v2h2v-2zm4 0h-2v2h2v-2zm4 0h-2v2h2v-2zm2-7h-1V2h-2v2H8V2H6v2H5c-1.11 0-1.99.9-1.99 2L3 20c0 1.1.89 2 2 2h14c1.1 0 2-.9 2-2V6c0-1.1-.9-2-2-2zm0 16H5V9h14v11z" fill="currentColor" />
                                </svg>
                                {report.date} - {report.time}
                            </div>
                            <div className="meta-item">
                                <svg width="16" height="16" viewBox="0 0 24 24" fill="none">
                                    <path d="M10 17l5-5-5-5v10z" fill="currentColor" />
                                </svg>
                                {report.category}
                            </div>
                        </div>

                        <div className="incident-actions">
                            <button className="btn-secondary">Xem chi tiết</button>
                            {report.status !== 'resolved' && (
                                <button className="btn-primary">Cập nhật</button>
                            )}
                        </div>
                    </div>
                ))}
            </div>

            {showForm && (
                <div className="modal-overlay" onClick={() => setShowForm(false)}>
                    <div className="modal-content" onClick={(e) => e.stopPropagation()}>
                        <div className="modal-header">
                            <h2>Báo cáo sự cố mới</h2>
                            <button className="close-btn" onClick={() => setShowForm(false)}>
                                <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
                                    <path d="M19 6.41L17.59 5 12 10.59 6.41 5 5 6.41 10.59 12 5 17.59 6.41 19 12 13.41 17.59 19 19 17.59 13.41 12 19 6.41z" fill="currentColor" />
                                </svg>
                            </button>
                        </div>

                        <form onSubmit={handleSubmit} className="incident-form">
                            <div className="form-group">
                                <label htmlFor="title">Tiêu đề sự cố *</label>
                                <input
                                    type="text"
                                    id="title"
                                    value={formData.title}
                                    onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                                    required
                                    placeholder="Mô tả ngắn gọn sự cố"
                                />
                            </div>

                            <div className="form-row">
                                <div className="form-group">
                                    <label htmlFor="category">Loại sự cố *</label>
                                    <select
                                        id="category"
                                        value={formData.category}
                                        onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                                        required
                                    >
                                        <option value="">Chọn loại</option>
                                        <option value="technical">Kỹ thuật</option>
                                        <option value="supply">Vật tư</option>
                                        <option value="service">Dịch vụ</option>
                                        <option value="other">Khác</option>
                                    </select>
                                </div>

                                <div className="form-group">
                                    <label htmlFor="priority">Mức độ ưu tiên *</label>
                                    <select
                                        id="priority"
                                        value={formData.priority}
                                        onChange={(e) => setFormData({ ...formData, priority: e.target.value })}
                                        required
                                    >
                                        <option value="low">Thấp</option>
                                        <option value="medium">Trung bình</option>
                                        <option value="high">Cao</option>
                                    </select>
                                </div>
                            </div>

                            <div className="form-group">
                                <label htmlFor="description">Mô tả chi tiết *</label>
                                <textarea
                                    id="description"
                                    value={formData.description}
                                    onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                                    required
                                    rows="4"
                                    placeholder="Mô tả chi tiết về sự cố..."
                                />
                            </div>

                            <div className="form-actions">
                                <button type="button" className="btn-secondary" onClick={() => setShowForm(false)}>
                                    Hủy
                                </button>
                                <button type="submit" className="btn-primary">
                                    Gửi báo cáo
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </div>
    )
}

export default IncidentReport
