import { useState } from 'react'
import './ShopIncidentReport.css'

function ShopIncidentReport() {
    const [reportForm, setReportForm] = useState({
        title: '',
        category: '',
        priority: '',
        description: ''
    })

    const recentReports = [
        {
            id: 'INC-001',
            title: 'Machine A2 not draining',
            category: 'Equipment',
            priority: 'high',
            status: 'pending',
            date: '2026-02-25'
        },
        {
            id: 'INC-002',
            title: 'Water supply issue',
            category: 'Facility',
            priority: 'medium',
            status: 'in-progress',
            date: '2026-02-24'
        },
        {
            id: 'INC-003',
            title: 'Customer complaint - stain not removed',
            category: 'Quality',
            priority: 'low',
            status: 'resolved',
            date: '2026-02-23'
        }
    ]

    const handleSubmit = (e) => {
        e.preventDefault()
        console.log('Report submitted:', reportForm)
        // Will integrate with API
    }

    return (
        <div className="shop-incidents">
            <div className="shop-incidents-header">
                <h1 className="shop-incidents-title">Incident Reports</h1>
                <p className="shop-incidents-subtitle">Report issues to admin</p>
            </div>

            <div className="shop-incidents-content">
                {/* Report Form */}
                <div className="shop-incidents-form-section">
                    <h2 className="shop-incidents-section-title">New Incident Report</h2>
                    <form className="shop-incidents-form" onSubmit={handleSubmit}>
                        <div className="shop-incidents-field">
                            <label className="shop-incidents-label">Title</label>
                            <input
                                type="text"
                                className="shop-incidents-input"
                                placeholder="Brief description of the issue"
                                value={reportForm.title}
                                onChange={(e) => setReportForm({ ...reportForm, title: e.target.value })}
                                required
                            />
                        </div>

                        <div className="shop-incidents-field-row">
                            <div className="shop-incidents-field">
                                <label className="shop-incidents-label">Category</label>
                                <select
                                    className="shop-incidents-select"
                                    value={reportForm.category}
                                    onChange={(e) => setReportForm({ ...reportForm, category: e.target.value })}
                                    required
                                >
                                    <option value="">Select category</option>
                                    <option value="equipment">Equipment</option>
                                    <option value="facility">Facility</option>
                                    <option value="quality">Quality</option>
                                    <option value="safety">Safety</option>
                                    <option value="other">Other</option>
                                </select>
                            </div>

                            <div className="shop-incidents-field">
                                <label className="shop-incidents-label">Priority</label>
                                <select
                                    className="shop-incidents-select"
                                    value={reportForm.priority}
                                    onChange={(e) => setReportForm({ ...reportForm, priority: e.target.value })}
                                    required
                                >
                                    <option value="">Select priority</option>
                                    <option value="low">Low</option>
                                    <option value="medium">Medium</option>
                                    <option value="high">High</option>
                                    <option value="urgent">Urgent</option>
                                </select>
                            </div>
                        </div>

                        <div className="shop-incidents-field">
                            <label className="shop-incidents-label">Description</label>
                            <textarea
                                className="shop-incidents-textarea"
                                placeholder="Detailed description of the incident..."
                                rows={5}
                                value={reportForm.description}
                                onChange={(e) => setReportForm({ ...reportForm, description: e.target.value })}
                                required
                            />
                        </div>

                        <button type="submit" className="shop-incidents-submit-btn">
                            Submit Report
                        </button>
                    </form>
                </div>

                {/* Recent Reports */}
                <div className="shop-incidents-list-section">
                    <h2 className="shop-incidents-section-title">Recent Reports</h2>
                    <div className="shop-incidents-list">
                        {recentReports.map((report) => (
                            <div key={report.id} className="shop-incidents-report-card">
                                <div className="shop-incidents-report-header">
                                    <span className="shop-incidents-report-id">{report.id}</span>
                                    <span className={`shop-incidents-priority shop-incidents-priority-${report.priority}`}>
                                        {report.priority}
                                    </span>
                                </div>
                                <h3 className="shop-incidents-report-title">{report.title}</h3>
                                <div className="shop-incidents-report-meta">
                                    <span className="shop-incidents-report-category">{report.category}</span>
                                    <span className="shop-incidents-report-date">{report.date}</span>
                                </div>
                                <div className="shop-incidents-report-footer">
                                    <span className={`shop-incidents-status shop-incidents-status-${report.status}`}>
                                        {report.status}
                                    </span>
                                    <button className="shop-incidents-view-btn">View Details</button>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            </div>
        </div>
    )
}

export default ShopIncidentReport
