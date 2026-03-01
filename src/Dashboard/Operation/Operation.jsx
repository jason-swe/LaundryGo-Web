import './Operation.css'

function Operation() {
    const machines = [
        { id: 'M001', type: 'Máy giặt', status: 'empty', lastMaintenance: '20/02/2026' },
        { id: 'M002', type: 'Máy giặt', status: 'washing', progress: 65, timeLeft: '15 phút' },
        { id: 'M003', type: 'Máy sấy', status: 'empty', lastMaintenance: '18/02/2026' },
        { id: 'M004', type: 'Máy giặt', status: 'washing', progress: 30, timeLeft: '25 phút' },
        { id: 'M005', type: 'Máy sấy', status: 'maintenance', issue: 'Cần kiểm tra hệ thống sấy' }
    ]

    const supplies = [
        { name: 'Nước giặt chuyên dụng', quantity: 65, unit: 'lít', minStock: 30, status: 'ok' },
        { name: 'Nước xả vải', quantity: 8, unit: 'lít', minStock: 20, status: 'low' },
        { name: 'Túi đóng gói', quantity: 150, unit: 'cái', minStock: 50, status: 'ok' },
        { name: 'Móc treo quần áo', quantity: 45, unit: 'cái', minStock: 30, status: 'ok' }
    ]

    return (
        <div className="operation-page">
            <div className="page-header">
                <h1 className="page-title">Quản lý vận hành</h1>
                <button className="btn-primary">
                    <svg width="20" height="20" viewBox="0 0 24 24" fill="none">
                        <path d="M19 13h-6v6h-2v-6H5v-2h6V5h2v6h6v2z" fill="currentColor" />
                    </svg>
                    Báo cáo bảo trì
                </button>
            </div>

            <div className="operation-grid">
                <div className="machines-section">
                    <h2 className="section-title">Tình trạng máy móc</h2>

                    <div className="machine-summary">
                        <div className="summary-item">
                            <div className="summary-icon" style={{ background: '#d1fae5' }}>
                                <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
                                    <path d="M9 16.17L4.83 12l-1.42 1.41L9 19 21 7l-1.41-1.41L9 16.17z" fill="#059669" />
                                </svg>
                            </div>
                            <div className="summary-info">
                                <div className="summary-label">Máy trống</div>
                                <div className="summary-value">8</div>
                            </div>
                        </div>

                        <div className="summary-item">
                            <div className="summary-icon" style={{ background: '#dbeafe' }}>
                                <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
                                    <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-2 15l-5-5 1.41-1.41L10 14.17l7.59-7.59L19 8l-9 9z" fill="#2563eb" />
                                </svg>
                            </div>
                            <div className="summary-info">
                                <div className="summary-label">Đang hoạt động</div>
                                <div className="summary-value">12</div>
                            </div>
                        </div>

                        <div className="summary-item">
                            <div className="summary-icon" style={{ background: '#fed7aa' }}>
                                <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
                                    <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm1 15h-2v-2h2v2zm0-4h-2V7h2v6z" fill="#ea580c" />
                                </svg>
                            </div>
                            <div className="summary-info">
                                <div className="summary-label">Cần bảo trì</div>
                                <div className="summary-value">2</div>
                            </div>
                        </div>
                    </div>

                    <div className="machines-list">
                        {machines.map((machine) => (
                            <div key={machine.id} className={`machine-card machine-${machine.status}`}>
                                <div className="machine-header">
                                    <div className="machine-id">{machine.id}</div>
                                    <span className={`machine-status-badge status-${machine.status}`}>
                                        {machine.status === 'empty' && 'Trống'}
                                        {machine.status === 'washing' && 'Đang hoạt động'}
                                        {machine.status === 'maintenance' && 'Bảo trì'}
                                    </span>
                                </div>
                                <div className="machine-type">{machine.type}</div>

                                {machine.status === 'washing' && (
                                    <div className="machine-progress">
                                        <div className="progress-bar">
                                            <div
                                                className="progress-fill"
                                                style={{ width: `${machine.progress}%` }}
                                            />
                                        </div>
                                        <div className="progress-info">
                                            <span>{machine.progress}%</span>
                                            <span>Còn {machine.timeLeft}</span>
                                        </div>
                                    </div>
                                )}

                                {machine.status === 'empty' && (
                                    <div className="machine-info">
                                        Bảo trì lần cuối: {machine.lastMaintenance}
                                    </div>
                                )}

                                {machine.status === 'maintenance' && (
                                    <div className="machine-issue">
                                        <svg width="16" height="16" viewBox="0 0 24 24" fill="none">
                                            <path d="M1 21h22L12 2 1 21zm12-3h-2v-2h2v2zm0-4h-2v-4h2v4z" fill="#ea580c" />
                                        </svg>
                                        {machine.issue}
                                    </div>
                                )}
                            </div>
                        ))}
                    </div>
                </div>

                <div className="supplies-section">
                    <h2 className="section-title">Vật tư</h2>
                    <div className="supplies-list">
                        {supplies.map((supply, index) => (
                            <div key={index} className={`supply-card ${supply.status === 'low' ? 'low-stock' : ''}`}>
                                <div className="supply-header">
                                    <div className="supply-name">{supply.name}</div>
                                    {supply.status === 'low' && (
                                        <span className="low-badge">Sắp hết</span>
                                    )}
                                </div>
                                <div className="supply-quantity">
                                    <span className="quantity-value">{supply.quantity}</span>
                                    <span className="quantity-unit">{supply.unit}</span>
                                </div>
                                <div className="supply-progress">
                                    <div className="supply-bar">
                                        <div
                                            className="supply-fill"
                                            style={{
                                                width: `${(supply.quantity / (supply.minStock * 2)) * 100}%`,
                                                background: supply.status === 'low' ? '#ef4444' : '#719fc2'
                                            }}
                                        />
                                    </div>
                                    <div className="supply-min">Tồn kho tối thiểu: {supply.minStock} {supply.unit}</div>
                                </div>
                            </div>
                        ))}
                    </div>

                    <div className="operation-hours">
                        <h3 className="subsection-title">Thời gian hoạt động hôm nay</h3>
                        <div className="hours-display">
                            <div className="hours-number">8.5</div>
                            <div className="hours-label">giờ</div>
                        </div>
                        <div className="hours-details">
                            <div className="hours-item">
                                <span>Giờ mở cửa:</span>
                                <strong>07:00 AM</strong>
                            </div>
                            <div className="hours-item">
                                <span>Hiện tại:</span>
                                <strong>03:30 PM</strong>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    )
}

export default Operation
