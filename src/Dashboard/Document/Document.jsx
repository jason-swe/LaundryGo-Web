import './Document.css'

function Document() {
    const documents = [
        {
            name: 'Giấy phép kinh doanh',
            number: 'GPKD-2024-001',
            issueDate: '15/01/2024',
            expiryDate: '15/01/2029',
            status: 'valid',
            authority: 'Sở Kế hoạch và Đầu tư TP.HCM'
        },
        {
            name: 'Giấy cam kết vệ sinh môi trường',
            number: 'VSMТ-2024-045',
            issueDate: '20/01/2024',
            expiryDate: '20/01/2025',
            status: 'expiring',
            authority: 'Sở Tài nguyên và Môi trường TP.HCM'
        },
        {
            name: 'Giấy phép xử lý nước thải',
            number: 'XLNT-2024-089',
            issueDate: '25/01/2024',
            expiryDate: '25/01/2025',
            status: 'valid',
            authority: 'Sở Tài nguyên và Môi trường TP.HCM'
        },
        {
            name: 'Giấy cam kết phòng cháy chữa cháy',
            number: 'PCCC-2024-156',
            issueDate: '10/02/2024',
            expiryDate: '10/02/2025',
            status: 'valid',
            authority: 'Cảnh sát PCCC TP.HCM'
        }
    ]

    return (
        <div className="document-page">
            <div className="page-header">
                <h1 className="page-title">Quản lý giấy tờ</h1>
                <button className="btn-primary">
                    <svg width="20" height="20" viewBox="0 0 24 24" fill="none">
                        <path d="M19 13h-6v6h-2v-6H5v-2h6V5h2v6h6v2z" fill="currentColor" />
                    </svg>
                    Thêm giấy tờ
                </button>
            </div>

            <div className="document-alert">
                <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
                    <path d="M1 21h22L12 2 1 21zm12-3h-2v-2h2v2zm0-4h-2v-4h2v4z" fill="#5492b4" />
                </svg>
                <div className="alert-content">
                    <strong>Cảnh báo:</strong> Có 1 giấy tờ sắp hết hạn trong 30 ngày tới. Vui lòng gia hạn để tránh gián đoạn hoạt động.
                </div>
            </div>

            <div className="documents-grid">
                {documents.map((doc, index) => (
                    <div key={index} className={`document-card ${doc.status === 'expiring' ? 'expiring' : ''}`}>
                        <div className="document-icon">
                            <svg width="48" height="48" viewBox="0 0 24 24" fill="none">
                                <path d="M14 2H6c-1.1 0-1.99.9-1.99 2L4 20c0 1.1.89 2 1.99 2H18c1.1 0 2-.9 2-2V8l-6-6zm2 16H8v-2h8v2zm0-4H8v-2h8v2zm-3-5V3.5L18.5 9H13z" fill="currentColor" opacity="0.6" />
                            </svg>
                        </div>

                        <div className="document-info">
                            <h3 className="document-name">{doc.name}</h3>
                            <div className="document-number">Số: {doc.number}</div>
                        </div>

                        <div className="document-details">
                            <div className="detail-row">
                                <span className="detail-label">Ngày cấp:</span>
                                <span className="detail-value">{doc.issueDate}</span>
                            </div>
                            <div className="detail-row">
                                <span className="detail-label">Ngày hết hạn:</span>
                                <span className="detail-value">{doc.expiryDate}</span>
                            </div>
                            <div className="detail-row">
                                <span className="detail-label">Cơ quan cấp:</span>
                                <span className="detail-value">{doc.authority}</span>
                            </div>
                        </div>

                        <div className="document-footer">
                            <span className={`doc-status-badge ${doc.status === 'valid' ? 'status-valid' : 'status-expiring'}`}>
                                {doc.status === 'valid' ? 'Còn hiệu lực' : 'Sắp hết hạn'}
                            </span>
                            <div className="document-actions">
                                <button className="btn-icon" title="Xem">
                                    <svg width="18" height="18" viewBox="0 0 24 24" fill="none">
                                        <path d="M12 4.5C7 4.5 2.73 7.61 1 12c1.73 4.39 6 7.5 11 7.5s9.27-3.11 11-7.5c-1.73-4.39-6-7.5-11-7.5zM12 17c-2.76 0-5-2.24-5-5s2.24-5 5-5 5 2.24 5 5-2.24 5-5 5zm0-8c-1.66 0-3 1.34-3 3s1.34 3 3 3 3-1.34 3-3-1.34-3-3-3z" fill="currentColor" />
                                    </svg>
                                </button>
                                <button className="btn-icon" title="Tải xuống">
                                    <svg width="18" height="18" viewBox="0 0 24 24" fill="none">
                                        <path d="M19 9h-4V3H9v6H5l7 7 7-7zM5 18v2h14v-2H5z" fill="currentColor" />
                                    </svg>
                                </button>
                                <button className="btn-icon" title="Cập nhật">
                                    <svg width="18" height="18" viewBox="0 0 24 24" fill="none">
                                        <path d="M3 17.25V21h3.75L17.81 9.94l-3.75-3.75L3 17.25zM20.71 7.04c.39-.39.39-1.02 0-1.41l-2.34-2.34c-.39-.39-1.02-.39-1.41 0l-1.83 1.83 3.75 3.75 1.83-1.83z" fill="currentColor" />
                                    </svg>
                                </button>
                            </div>
                        </div>
                    </div>
                ))}
            </div>

            <div className="document-tips">
                <h2 className="section-title">Lưu ý quan trọng</h2>
                <ul className="tips-list">
                    <li>Kiểm tra và gia hạn giấy tờ trước ít nhất 30 ngày so với ngày hết hạn</li>
                    <li>Lưu trữ bản sao số hóa và bản giấy ở nơi an toàn</li>
                    <li>Thông báo ngay cho quản lý khi có thay đổi về giấy phép</li>
                    <li>Liên hệ cơ quan có thẩm quyền để được hướng dẫn chi tiết về thủ tục gia hạn</li>
                </ul>
            </div>
        </div>
    )
}

export default Document
