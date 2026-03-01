import './Overview.css'

function Overview() {
    // Sample data - sẽ thay bằng API data sau
    const stats = [
        { label: 'MONTHLY REVENUE', value: 'XX.X M', color: '#0b416a' },
        { label: 'NEW ORDER', value: 'XXX', color: '#719fc2' },
        { label: 'PROCESSING ORDER', value: 'XXX', color: '#88a2b6' },
        { label: 'PROCESSED ORDER', value: 'XXX', color: '#9edfda' },
        { label: 'ACTUAL REVENUE', value: 'XX.X M', color: '#355c79' }
    ]

    const machineStatus = [
        { status: 'Ready (Empty)', count: 8, color: '#4ade80' },
        { status: 'Washing/Drying', count: 12, color: '#3b82f6' },
        { status: 'Maintenance', count: 2, color: '#f97316' }
    ]

    const supplies = [
        { name: 'Professional Detergent', percentage: 65, color: '#719fc2' },
        { name: 'Fabric Softener', percentage: 8, color: '#ef4444', low: true }
    ]

    // Sample chart data
    const chartData = Array.from({ length: 20 }, (_, i) => ({
        value: Math.floor(Math.random() * 40) + 10
    }))

    return (
        <div className="overview-page">
            <div className="overview-header">
                <h1 className="overview-title">System Overview</h1>
                <p className="overview-subtitle">Welcome back! Here is today&apos;s performance</p>
            </div>

            <div className="stats-grid">
                {stats.map((stat, index) => (
                    <div key={index} className="stat-card" style={{ borderTopColor: stat.color }}>
                        <div className="stat-label">{stat.label}</div>
                        <div className="stat-value">{stat.value}</div>
                    </div>
                ))}
            </div>

            <div className="overview-grid">
                <div className="chart-section">
                    <div className="section-header">
                        <h2 className="section-title">Top User Spending</h2>
                        <span className="section-badge">This Month</span>
                    </div>
                    <div className="chart-container">
                        <div className="bar-chart">
                            {chartData.map((data, index) => (
                                <div key={index} className="bar-wrapper">
                                    <div
                                        className="bar"
                                        style={{ height: `${data.value * 2}%` }}
                                    />
                                </div>
                            ))}
                        </div>
                        <div className="chart-axis">
                            <span>0</span>
                            <span>10</span>
                            <span>20</span>
                            <span>30</span>
                            <span>40</span>
                            <span>50</span>
                        </div>
                    </div>
                </div>

                <div className="status-section">
                    <div className="machine-status-card">
                        <h2 className="section-title">Machine Status</h2>
                        <div className="status-list">
                            {machineStatus.map((item, index) => (
                                <div key={index} className="status-item">
                                    <div className="status-info">
                                        <span
                                            className="status-dot"
                                            style={{ backgroundColor: item.color }}
                                        />
                                        <span className="status-name">{item.status}</span>
                                    </div>
                                    <span className="status-count">{item.count.toString().padStart(2, '0')}</span>
                                </div>
                            ))}
                        </div>
                    </div>

                    <div className="supplies-card">
                        <h2 className="section-title">Supplies</h2>
                        <div className="supplies-list">
                            {supplies.map((item, index) => (
                                <div key={index} className="supply-item">
                                    <div className="supply-header">
                                        <span className="supply-name">{item.name}</span>
                                        <span
                                            className="supply-percentage"
                                            style={{ color: item.low ? '#ef4444' : '#0f172a' }}
                                        >
                                            {item.percentage}%{item.low ? ' (Low)' : ''}
                                        </span>
                                    </div>
                                    <div className="supply-bar">
                                        <div
                                            className="supply-fill"
                                            style={{
                                                width: `${item.percentage}%`,
                                                backgroundColor: item.color
                                            }}
                                        />
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                </div>
            </div>
        </div>
    )
}

export default Overview
