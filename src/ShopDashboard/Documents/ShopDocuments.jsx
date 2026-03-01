import './ShopDocuments.css'

function ShopDocuments() {
    const documents = [
        { name: 'Business License', status: 'valid', expiry: '2027-12-31', file: 'business_license.pdf' },
        { name: 'Environmental Commitment', status: 'valid', expiry: '2026-08-15', file: 'env_cert.pdf' },
        { name: 'Wastewater Treatment Permit', status: 'expiring', expiry: '2026-03-30', file: 'water_permit.pdf' },
        { name: 'Fire Safety Certificate', status: 'valid', expiry: '2027-06-20', file: 'fire_cert.pdf' }
    ]

    return (
        <div className="shop-documents">
            <div className="shop-documents-header">
                <h1 className="shop-documents-title">Document Management</h1>
                <p className="shop-documents-subtitle">Manage licenses and certificates</p>
            </div>

            <div className="shop-documents-grid">
                {documents.map((doc, index) => (
                    <div key={index} className="shop-documents-card">
                        <div className="shop-documents-icon">📄</div>
                        <div className="shop-documents-info">
                            <h3 className="shop-documents-name">{doc.name}</h3>
                            <div className="shop-documents-meta">
                                <span className={`shop-documents-status shop-documents-status-${doc.status}`}>
                                    {doc.status === 'valid' ? '✓ Valid' : '⚠️ Expiring Soon'}
                                </span>
                                <span className="shop-documents-expiry">Expires: {doc.expiry}</span>
                            </div>
                            <div className="shop-documents-actions">
                                <button className="shop-documents-btn shop-documents-btn-view">View</button>
                                <button className="shop-documents-btn shop-documents-btn-download">Download</button>
                                <button className="shop-documents-btn shop-documents-btn-renew">Renew</button>
                            </div>
                        </div>
                    </div>
                ))}
            </div>

            <div className="shop-documents-upload">
                <button className="shop-documents-upload-btn">+ Upload New Document</button>
            </div>
        </div>
    )
}

export default ShopDocuments
