import './AdminOverview.css'
import { useState } from 'react'
import {
    DollarOutlined,
    ShopOutlined,
    UserOutlined,
    CarOutlined,
    RiseOutlined,
    ClockCircleOutlined,
    FileTextOutlined,
    CheckCircleOutlined,
    CloseCircleOutlined,
    CloseOutlined,
    DownloadOutlined,
    EyeOutlined,
    ExclamationCircleOutlined,
    AlertOutlined,
    BarChartOutlined
} from '@ant-design/icons'
import { incidents as incidentsData } from '../../data'
import toast from '../../utils/toast'

function AdminOverview() {
    const [selectedPeriod, setSelectedPeriod] = useState('6months')
    const [showAllIncidents, setShowAllIncidents] = useState(false)
    const [reviewModal, setReviewModal] = useState(null)
    const [pendingApprovals, setPendingApprovals] = useState([
        { id: 1, type: 'new-shop', name: 'Sparkle Laundry', location: 'Quận 1, TP.HCM', date: '2 hours ago' },
        { id: 2, type: 'document', name: 'FPT Laundry Shop', item: 'Business License Renewal', date: '5 hours ago' },
        { id: 3, type: 'new-shop', name: 'Fresh & Clean', location: 'Quận 7, TP.HCM', date: '1 day ago' },
        { id: 4, type: 'document', name: 'Express Wash', item: 'Safety Certificate', date: '1 day ago' },
    ])
    const stats = [
        { label: 'Total Platform Revenue', value: '1,245.8M VND', change: '+18% vs last month', trend: 'up', icon: DollarOutlined, color: '#4d9e84' },
        { label: 'New Customers', value: '342', change: '+24 this week', trend: 'up', icon: UserOutlined, color: '#719FC2' },
        { label: 'Partner Shops', value: '156', change: '+5 this month', trend: 'up', icon: ShopOutlined, color: '#5492b4' },
        { label: 'Active Shippers', value: '89', change: '+3 this week', trend: 'up', icon: CarOutlined, color: '#719FC2' },
        { label: 'Pending Approvals', value: String(pendingApprovals.length), change: 'Awaiting review', trend: 'up', icon: ExclamationCircleOutlined, color: '#c05a50' },
        { label: 'Platform Growth', value: '+35%', change: 'YoY Growth Rate', trend: 'up', icon: RiseOutlined, color: '#5492b4' }
    ]

    const getRevenueData = () => {
        switch (selectedPeriod) {
            case 'week': return [
                { label: 'Mon', revenue: 165 }, { label: 'Tue', revenue: 178 }, { label: 'Wed', revenue: 192 },
                { label: 'Thu', revenue: 185 }, { label: 'Fri', revenue: 205 }, { label: 'Sat', revenue: 220 }, { label: 'Sun', revenue: 198 }
            ]
            case 'month': return [
                { label: 'Week 1', revenue: 680 }, { label: 'Week 2', revenue: 750 },
                { label: 'Week 3', revenue: 820 }, { label: 'Week 4', revenue: 895 }
            ]
            case '6months': return [
                { label: 'Jan', revenue: 850 }, { label: 'Feb', revenue: 920 }, { label: 'Mar', revenue: 1050 },
                { label: 'Apr', revenue: 980 }, { label: 'May', revenue: 1150 }, { label: 'Jun', revenue: 1245 }
            ]
            case 'year': return [
                { label: 'Jan', revenue: 920 }, { label: 'Feb', revenue: 985 }, { label: 'Mar', revenue: 1050 },
                { label: 'Apr', revenue: 1120 }, { label: 'May', revenue: 1085 }, { label: 'Jun', revenue: 1170 },
                { label: 'Jul', revenue: 1245 }, { label: 'Aug', revenue: 1310 }, { label: 'Sep', revenue: 1265 },
                { label: 'Oct', revenue: 1380 }, { label: 'Nov', revenue: 1420 }, { label: 'Dec', revenue: 1485 }
            ]
            default: return []
        }
    }

    const revenueData = getRevenueData()
    const maxRevenue = Math.max(...revenueData.map(d => d.revenue))

    const topShops = [
        { name: 'FPT Laundry Shop', orders: 1245, revenue: '124.5M', rating: 4.9, growth: '+15%' },
        { name: 'Clean & Fresh', orders: 1089, revenue: '108.9M', rating: 4.8, growth: '+12%' },
        { name: 'Express Wash', orders: 967, revenue: '96.7M', rating: 4.7, growth: '+18%' },
        { name: 'LaundryPro', orders: 834, revenue: '83.4M', rating: 4.9, growth: '+10%' },
        { name: 'Quick Clean', orders: 756, revenue: '75.6M', rating: 4.6, growth: '+8%' }
    ]

    // Use real incidents data
    const recentIncidents = incidentsData.slice(0, showAllIncidents ? incidentsData.length : 5)

    const getPriorityColor = (p) => ({ urgent: '#c05a50', high: '#5492b4', medium: '#5492b4', low: '#4d9e84' }[p] || '#6b7280')
    const getStatusColor = (s) => ({ resolved: '#4d9e84', 'in-progress': '#719FC2', pending: '#5492b4' }[s] || '#6b7280')

    const handleApprove = (item) => {
        setPendingApprovals(prev => prev.filter(a => a.id !== item.id))
        setReviewModal(null)
        toast.success(`Approved: ${item.name}`)
    }

    const handleReject = (item) => {
        setPendingApprovals(prev => prev.filter(a => a.id !== item.id))
        setReviewModal(null)
        toast.error(`Rejected: ${item.name}`)
    }

    const handleExportReport = () => {
        const lines = [
            'Admin Overview Report',
            `Generated: ${new Date().toLocaleString('vi-VN')}`,
            '',
            'Platform Revenue,1245.8M VND',
            'New Customers,342',
            'Partner Shops,156',
            'Orders Today,1847',
            'Growth Rate,+35%',
            '',
            'Top Shops:',
            ...topShops.map(s => `${s.name},${s.orders} orders,${s.revenue},Rating ${s.rating},${s.growth}`)
        ]
        const blob = new Blob([lines.join('\n')], { type: 'text/csv' })
        const url = URL.createObjectURL(blob)
        const a = document.createElement('a')
        a.href = url; a.download = `admin-overview-${new Date().toISOString().slice(0, 10)}.csv`; a.click()
        URL.revokeObjectURL(url)
        toast.success('Report exported!')
    }

    return (
        <div className="admin-overview">
            {/* Header */}
            <div className="admin-overview-header">
                <div>
                    <h1 className="admin-overview-title">Admin Dashboard</h1>
                    <p className="admin-overview-subtitle">Platform overview and system metrics</p>
                </div>
                <div className="admin-ov-header-right">
                    <button className="admin-ov-export-btn" onClick={handleExportReport}>
                        <DownloadOutlined /> Export Report
                    </button>
                    <div className="admin-overview-date">
                        <ClockCircleOutlined />
                        {new Date().toLocaleDateString('vi-VN', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}
                    </div>
                </div>
            </div>

            {/* Stats Cards */}
            <div className="admin-overview-stats">
                {stats.map((stat, index) => {
                    const IconComponent = stat.icon
                    return (
                        <div key={index} className="admin-overview-stat-card">
                            <div className="admin-overview-stat-icon" style={{ background: stat.color }}>
                                <IconComponent style={{ fontSize: '24px', color: 'white' }} />
                            </div>
                            <div className="admin-overview-stat-content">
                                <div className="admin-overview-stat-label">{stat.label}</div>
                                <div className="admin-overview-stat-value">{stat.value}</div>
                                <div className={`admin-overview-stat-change ${stat.trend}`}>{stat.change}</div>
                            </div>
                        </div>
                    )
                })}
            </div>

            {/* Main Grid */}
            <div className="admin-overview-grid">
                {/* Revenue Chart */}
                <div className="admin-overview-card admin-overview-revenue">
                    <div className="admin-overview-card-header">
                        <h2 className="admin-overview-card-title"><BarChartOutlined style={{ marginRight: 8 }} />Platform Revenue Trend</h2>
                        <div className="admin-overview-period-selector">
                            {[['week', 'Week'], ['month', 'Month'], ['6months', '6 Months'], ['year', 'Year']].map(([v, l]) => (
                                <button key={v}
                                    className={`admin-overview-period-btn ${selectedPeriod === v ? 'active' : ''}`}
                                    onClick={() => setSelectedPeriod(v)}>
                                    {l}
                                </button>
                            ))}
                        </div>
                    </div>
                    <div className="admin-overview-chart">
                        <div className="admin-overview-chart-bars">
                            {revenueData.map((data, index) => (
                                <div key={index} className="admin-overview-chart-bar-wrapper">
                                    <div
                                        className="admin-overview-chart-bar"
                                        style={{ height: `${(data.revenue / maxRevenue) * 100}%` }}
                                        title={`${data.label}: ${data.revenue}M VND`}
                                    />
                                    <div className="admin-overview-chart-value">{data.revenue}M</div>
                                    <div className="admin-overview-chart-label">{data.label}</div>
                                </div>
                            ))}
                        </div>
                    </div>
                </div>

                {/* Top Partner Shops */}
                <div className="admin-overview-card admin-overview-top-shops">
                    <div className="admin-overview-card-header">
                        <h2 className="admin-overview-card-title">Top Partner Shops</h2>
                        <button className="admin-overview-view-all" onClick={() => toast.info('Navigate to Shop Management for full list')}>
                            View All
                        </button>
                    </div>
                    <div className="admin-overview-shops-list">
                        {topShops.map((shop, index) => (
                            <div key={index} className="admin-overview-shop-item">
                                <div className="admin-overview-shop-rank"
                                    style={{ background: index === 0 ? 'linear-gradient(135deg,#5492b4,#4a7fa5)' : index === 1 ? 'linear-gradient(135deg,#9ca3af,#d1d5db)' : index === 2 ? 'linear-gradient(135deg,#9a7020,#5492b4)' : 'linear-gradient(135deg,#1e5078,#719fc2)' }}>
                                    {index + 1}
                                </div>
                                <div className="admin-overview-shop-details">
                                    <div className="admin-overview-shop-name">{shop.name}</div>
                                    <div className="admin-overview-shop-stats">
                                        {shop.orders} orders · {shop.revenue} · ⭐ {shop.rating}
                                    </div>
                                </div>
                                <div className="admin-overview-shop-growth">{shop.growth}</div>
                            </div>
                        ))}
                    </div>
                </div>

                {/* Pending Approvals */}
                <div className="admin-overview-card admin-overview-approvals">
                    <div className="admin-overview-card-header">
                        <h2 className="admin-overview-card-title">Pending Approvals</h2>
                        {pendingApprovals.length > 0
                            ? <span className="admin-overview-count-badge">{pendingApprovals.length}</span>
                            : <span className="admin-ov-all-clear">All clear ✓</span>}
                    </div>
                    {pendingApprovals.length === 0 ? (
                        <div className="admin-ov-empty"><CheckCircleOutlined style={{ fontSize: 32, color: '#4d9e84' }} /><p>No pending approvals</p></div>
                    ) : (
                        <div className="admin-overview-approvals-list">
                            {pendingApprovals.map((item) => (
                                <div key={item.id} className="admin-overview-approval-item">
                                    <div className="admin-overview-approval-icon">
                                        {item.type === 'new-shop' ? <ShopOutlined /> : <FileTextOutlined />}
                                    </div>
                                    <div className="admin-overview-approval-details">
                                        <div className="admin-overview-approval-name">{item.name}</div>
                                        <div className="admin-overview-approval-meta">
                                            {item.location || item.item} · {item.date}
                                        </div>
                                    </div>
                                    <button className="admin-overview-approve-btn" onClick={() => setReviewModal(item)}>
                                        <EyeOutlined /> Review
                                    </button>
                                </div>
                            ))}
                        </div>
                    )}
                </div>

                {/* Recent Incidents */}
                <div className="admin-overview-card admin-overview-incidents">
                    <div className="admin-overview-card-header">
                        <h2 className="admin-overview-card-title"><AlertOutlined style={{ marginRight: 8, color: '#c05a50' }} />Recent Incidents</h2>
                        <button className="admin-overview-view-all" onClick={() => setShowAllIncidents(p => !p)}>
                            {showAllIncidents ? 'Show Less' : `View All (${incidentsData.length})`}
                        </button>
                    </div>
                    <div className="admin-overview-incidents-table">
                        <table>
                            <thead>
                                <tr>
                                    <th>ID</th>
                                    <th>Title</th>
                                    <th>Reported By</th>
                                    <th>Priority</th>
                                    <th>Status</th>
                                    <th>Date</th>
                                </tr>
                            </thead>
                            <tbody>
                                {recentIncidents.map((incident) => (
                                    <tr key={incident.id}>
                                        <td className="incident-id">{incident.id}</td>
                                        <td>{incident.title}</td>
                                        <td>{incident.reportedBy}</td>
                                        <td>
                                            <span className="priority-badge" style={{ background: `${getPriorityColor(incident.priority)}20`, color: getPriorityColor(incident.priority) }}>
                                                {incident.priority}
                                            </span>
                                        </td>
                                        <td>
                                            <span className="status-badge" style={{ background: `${getStatusColor(incident.status)}20`, color: getStatusColor(incident.status) }}>
                                                {incident.status}
                                            </span>
                                        </td>
                                        <td className="incident-time">{incident.reportedDate?.split(' ')[0]}</td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                </div>
            </div>

            {/* Review Modal */}
            {reviewModal && (
                <div className="admin-ov-modal-overlay" onClick={() => setReviewModal(null)}>
                    <div className="admin-ov-modal" onClick={e => e.stopPropagation()}>
                        <div className="admin-ov-modal-header">
                            <h2>{reviewModal.type === 'new-shop' ? <ShopOutlined /> : <FileTextOutlined />} Review Request</h2>
                            <button className="admin-ov-modal-close" onClick={() => setReviewModal(null)}><CloseOutlined /></button>
                        </div>
                        <div className="admin-ov-modal-body">
                            <div className="admin-ov-review-grid">
                                <div className="admin-ov-review-item">
                                    <span className="admin-ov-review-label">Type</span>
                                    <span className="admin-ov-review-value">{reviewModal.type === 'new-shop' ? 'New Shop Registration' : 'Document Renewal'}</span>
                                </div>
                                <div className="admin-ov-review-item">
                                    <span className="admin-ov-review-label">Name</span>
                                    <span className="admin-ov-review-value">{reviewModal.name}</span>
                                </div>
                                <div className="admin-ov-review-item">
                                    <span className="admin-ov-review-label">{reviewModal.type === 'new-shop' ? 'Location' : 'Document'}</span>
                                    <span className="admin-ov-review-value">{reviewModal.location || reviewModal.item}</span>
                                </div>
                                <div className="admin-ov-review-item">
                                    <span className="admin-ov-review-label">Submitted</span>
                                    <span className="admin-ov-review-value">{reviewModal.date}</span>
                                </div>
                            </div>
                            <div className="admin-ov-review-note">
                                <ExclamationCircleOutlined style={{ color: '#5492b4', marginRight: 8 }} />
                                Please verify all submitted documents before approving.
                            </div>
                        </div>
                        <div className="admin-ov-modal-footer">
                            <button className="admin-ov-reject-btn" onClick={() => handleReject(reviewModal)}>
                                <CloseCircleOutlined /> Reject
                            </button>
                            <button className="admin-ov-approve-btn" onClick={() => handleApprove(reviewModal)}>
                                <CheckCircleOutlined /> Approve
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    )
}

export default AdminOverview
