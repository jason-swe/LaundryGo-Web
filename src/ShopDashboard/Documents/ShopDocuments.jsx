import { useState } from 'react'
import {
    FileTextOutlined,
    DownloadOutlined,
    EyeOutlined,
    ReloadOutlined,
    UploadOutlined,
    CloseOutlined,
    FileOutlined,
    FilePdfOutlined,
    FileWordOutlined,
    FileExcelOutlined,
    SearchOutlined,
    FilterOutlined
} from '@ant-design/icons'
import './ShopDocuments.css'
import { documents as documentsData } from '../../data'
import toast from '../../utils/toast'
import ConfirmDialog from '../../components/ConfirmDialog/ConfirmDialog'

const formatIcon = (fmt) => {
    switch ((fmt || '').toUpperCase()) {
        case 'PDF': return <FilePdfOutlined style={{ color: '#ef4444' }} />
        case 'DOCX':
        case 'DOC': return <FileWordOutlined style={{ color: '#3b82f6' }} />
        case 'XLSX':
        case 'XLS': return <FileExcelOutlined style={{ color: '#10b981' }} />
        default: return <FileOutlined style={{ color: '#64748b' }} />
    }
}

const categoryColors = {
    'Machine Operation': '#3b82f6',
    'Operations': '#10b981',
    'Service': '#f59e0b',
    'Human Resources': '#8b5cf6',
    'Quality Control': '#ef4444',
    'Customer Service': '#06b6d4',
}

function ShopDocuments() {
    const [documents, setDocuments] = useState(documentsData)
    const [viewDoc, setViewDoc] = useState(null)
    const [showUpload, setShowUpload] = useState(false)
    const [showRenew, setShowRenew] = useState(null)
    const [searchQuery, setSearchQuery] = useState('')
    const [filterCategory, setFilterCategory] = useState('all')
    const [confirmDialog, setConfirmDialog] = useState({ show: false })
    const [uploadForm, setUploadForm] = useState({
        title: '', category: 'Operations', type: 'procedure',
        author: '', description: '', format: 'PDF', fileSize: ''
    })

    const categories = ['all', ...Array.from(new Set(documentsData.map(d => d.category)))]

    const filtered = documents.filter(doc => {
        const matchSearch = doc.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
            doc.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
            doc.author.toLowerCase().includes(searchQuery.toLowerCase())
        const matchCat = filterCategory === 'all' || doc.category === filterCategory
        return matchSearch && matchCat
    })

    const handleDownload = (doc) => {
        // Simulate download with toast
        toast.success(`Downloading "${doc.title}" (${doc.fileSize})`)
        setDocuments(prev => prev.map(d =>
            d.id === doc.id ? { ...d, downloadCount: (d.downloadCount || 0) + 1 } : d
        ))
    }

    const handleRenew = (doc) => {
        setShowRenew(null)
        const today = new Date()
        const newDate = new Date(today.setFullYear(today.getFullYear() + 1))
            .toISOString().split('T')[0]
        setDocuments(prev => prev.map(d =>
            d.id === doc.id ? { ...d, lastModified: newDate, status: 'active' } : d
        ))
        toast.success(`"${doc.title}" renewed successfully! Valid until ${newDate}`)
    }

    const handleDelete = (doc) => {
        setConfirmDialog({
            show: true,
            title: 'Delete Document',
            message: `Are you sure you want to delete "${doc.title}"? This cannot be undone.`,
            type: 'danger',
            onConfirm: () => {
                setDocuments(prev => prev.filter(d => d.id !== doc.id))
                toast.success(`"${doc.title}" deleted.`)
                setConfirmDialog({ show: false })
                if (viewDoc?.id === doc.id) setViewDoc(null)
            }
        })
    }

    const handleUpload = () => {
        if (!uploadForm.title.trim() || !uploadForm.author.trim()) {
            toast.warning('Title and author are required')
            return
        }
        const newDoc = {
            id: `DOC-${String(documents.length + 1).padStart(3, '0')}`,
            ...uploadForm,
            uploadDate: new Date().toISOString().split('T')[0],
            lastModified: new Date().toISOString().split('T')[0],
            status: 'active',
            tags: [],
            downloadCount: 0,
            fileSize: uploadForm.fileSize || '—'
        }
        setDocuments(prev => [newDoc, ...prev])
        toast.success(`"${newDoc.title}" uploaded successfully!`)
        setShowUpload(false)
        setUploadForm({ title: '', category: 'Operations', type: 'procedure', author: '', description: '', format: 'PDF', fileSize: '' })
    }

    const statusLabel = (doc) => {
        if (doc.status === 'active') return { text: '✓ Active', cls: 'valid' }
        if (doc.status === 'archived') return { text: '⊘ Archived', cls: 'archived' }
        return { text: '⚠ Expiring', cls: 'expiring' }
    }

    return (
        <div className="shop-documents">
            {/* Header */}
            <div className="shop-documents-header">
                <div>
                    <h1 className="shop-documents-title">
                        <FileTextOutlined style={{ marginRight: 8 }} />Document Management
                    </h1>
                    <p className="shop-documents-subtitle">Manage operational documents, manuals and certificates</p>
                </div>
                <button className="shop-documents-upload-btn-primary" onClick={() => setShowUpload(true)}>
                    <UploadOutlined /> Upload Document
                </button>
            </div>

            {/* Search + Filter */}
            <div className="doc-toolbar">
                <div className="doc-search-wrap">
                    <SearchOutlined className="doc-search-icon" />
                    <input
                        className="doc-search-input"
                        placeholder="Search documents..."
                        value={searchQuery}
                        onChange={e => setSearchQuery(e.target.value)}
                    />
                </div>
                <div className="doc-filter-wrap">
                    <FilterOutlined style={{ color: '#64748b' }} />
                    <select
                        className="doc-filter-select"
                        value={filterCategory}
                        onChange={e => setFilterCategory(e.target.value)}
                    >
                        {categories.map(c => (
                            <option key={c} value={c}>{c === 'all' ? 'All Categories' : c}</option>
                        ))}
                    </select>
                </div>
                <span className="doc-count">{filtered.length} document{filtered.length !== 1 ? 's' : ''}</span>
            </div>

            {/* Grid */}
            <div className="shop-documents-grid">
                {filtered.length === 0 && (
                    <div className="doc-empty">No documents found.</div>
                )}
                {filtered.map((doc) => {
                    const sl = statusLabel(doc)
                    const catColor = categoryColors[doc.category] || '#64748b'
                    return (
                        <div key={doc.id} className="shop-documents-card">
                            <div className="doc-card-icon">{formatIcon(doc.format)}</div>
                            <div className="shop-documents-info">
                                <div className="doc-card-top">
                                    <span className="doc-category-tag" style={{ background: catColor + '18', color: catColor }}>
                                        {doc.category}
                                    </span>
                                    <span className="doc-format-tag">{doc.format}</span>
                                </div>
                                <h3 className="shop-documents-name">{doc.title}</h3>
                                <p className="doc-description">{doc.description}</p>
                                <div className="shop-documents-meta">
                                    <span className={`shop-documents-status shop-documents-status-${sl.cls}`}>{sl.text}</span>
                                    <span className="shop-documents-expiry">Modified: {doc.lastModified}</span>
                                    <span className="doc-meta-extra">{doc.fileSize} · {doc.downloadCount || 0} downloads</span>
                                </div>
                                <div className="shop-documents-actions">
                                    <button className="shop-documents-btn shop-documents-btn-view" onClick={() => setViewDoc(doc)}>
                                        <EyeOutlined /> View
                                    </button>
                                    <button className="shop-documents-btn shop-documents-btn-download" onClick={() => handleDownload(doc)}>
                                        <DownloadOutlined /> Download
                                    </button>
                                    <button className="shop-documents-btn shop-documents-btn-renew" onClick={() => setShowRenew(doc)}>
                                        <ReloadOutlined /> Renew
                                    </button>
                                    <button className="shop-documents-btn shop-documents-btn-delete" onClick={() => handleDelete(doc)}>
                                        Delete
                                    </button>
                                </div>
                            </div>
                        </div>
                    )
                })}
            </div>

            {/* View Modal */}
            {viewDoc && (
                <div className="doc-modal-overlay" onClick={() => setViewDoc(null)}>
                    <div className="doc-modal" onClick={e => e.stopPropagation()}>
                        <div className="doc-modal-header">
                            <div className="doc-modal-title-row">
                                <span style={{ fontSize: 28 }}>{formatIcon(viewDoc.format)}</span>
                                <h2>{viewDoc.title}</h2>
                            </div>
                            <button className="doc-modal-close" onClick={() => setViewDoc(null)}><CloseOutlined /></button>
                        </div>
                        <div className="doc-modal-body">
                            <div className="doc-detail-grid">
                                <div className="doc-detail-item"><span className="ddl">ID</span><span className="ddv">{viewDoc.id}</span></div>
                                <div className="doc-detail-item"><span className="ddl">Category</span><span className="ddv">{viewDoc.category}</span></div>
                                <div className="doc-detail-item"><span className="ddl">Type</span><span className="ddv">{viewDoc.type}</span></div>
                                <div className="doc-detail-item"><span className="ddl">Format</span><span className="ddv">{viewDoc.format}</span></div>
                                <div className="doc-detail-item"><span className="ddl">Author</span><span className="ddv">{viewDoc.author}</span></div>
                                <div className="doc-detail-item"><span className="ddl">File Size</span><span className="ddv">{viewDoc.fileSize}</span></div>
                                <div className="doc-detail-item"><span className="ddl">Upload Date</span><span className="ddv">{viewDoc.uploadDate}</span></div>
                                <div className="doc-detail-item"><span className="ddl">Last Modified</span><span className="ddv">{viewDoc.lastModified}</span></div>
                                <div className="doc-detail-item"><span className="ddl">Downloads</span><span className="ddv">{viewDoc.downloadCount || 0}</span></div>
                                <div className="doc-detail-item"><span className="ddl">Status</span>
                                    <span className={`shop-documents-status shop-documents-status-${statusLabel(viewDoc).cls}`}>
                                        {statusLabel(viewDoc).text}
                                    </span>
                                </div>
                                <div className="doc-detail-item" style={{ gridColumn: '1/-1' }}>
                                    <span className="ddl">Description</span>
                                    <span className="ddv">{viewDoc.description}</span>
                                </div>
                                {viewDoc.tags?.length > 0 && (
                                    <div className="doc-detail-item" style={{ gridColumn: '1/-1' }}>
                                        <span className="ddl">Tags</span>
                                        <div className="doc-tags">
                                            {viewDoc.tags.map(t => <span key={t} className="doc-tag">#{t}</span>)}
                                        </div>
                                    </div>
                                )}
                            </div>
                        </div>
                        <div className="doc-modal-footer">
                            <button className="shop-documents-btn shop-documents-btn-renew" onClick={() => { setViewDoc(null); setShowRenew(viewDoc) }}>
                                <ReloadOutlined /> Renew
                            </button>
                            <button className="shop-documents-btn shop-documents-btn-download" onClick={() => handleDownload(viewDoc)}>
                                <DownloadOutlined /> Download
                            </button>
                            <button className="doc-close-btn" onClick={() => setViewDoc(null)}>Close</button>
                        </div>
                    </div>
                </div>
            )}

            {/* Renew Confirm Modal */}
            {showRenew && (
                <div className="doc-modal-overlay" onClick={() => setShowRenew(null)}>
                    <div className="doc-modal doc-modal-sm" onClick={e => e.stopPropagation()}>
                        <div className="doc-modal-header">
                            <h2><ReloadOutlined /> Renew Document</h2>
                            <button className="doc-modal-close" onClick={() => setShowRenew(null)}><CloseOutlined /></button>
                        </div>
                        <div className="doc-modal-body">
                            <p style={{ color: '#475569', marginBottom: 16 }}>
                                Renew <strong>"{showRenew.title}"</strong>?
                            </p>
                            <p style={{ color: '#64748b', fontSize: 14 }}>
                                The document status will be set to Active and the modified date extended by 1 year.
                            </p>
                        </div>
                        <div className="doc-modal-footer">
                            <button className="doc-close-btn" onClick={() => setShowRenew(null)}>Cancel</button>
                            <button className="doc-renew-confirm-btn" onClick={() => handleRenew(showRenew)}>
                                <ReloadOutlined /> Confirm Renew
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {/* Upload Modal */}
            {showUpload && (
                <div className="doc-modal-overlay" onClick={() => setShowUpload(false)}>
                    <div className="doc-modal" onClick={e => e.stopPropagation()}>
                        <div className="doc-modal-header">
                            <h2><UploadOutlined /> Upload New Document</h2>
                            <button className="doc-modal-close" onClick={() => setShowUpload(false)}><CloseOutlined /></button>
                        </div>
                        <div className="doc-modal-body">
                            <div className="doc-upload-form">
                                <div className="doc-form-group">
                                    <label>Title *</label>
                                    <input className="doc-input" value={uploadForm.title}
                                        onChange={e => setUploadForm(p => ({ ...p, title: e.target.value }))}
                                        placeholder="Document title" />
                                </div>
                                <div className="doc-form-group">
                                    <label>Author *</label>
                                    <input className="doc-input" value={uploadForm.author}
                                        onChange={e => setUploadForm(p => ({ ...p, author: e.target.value }))}
                                        placeholder="Author name" />
                                </div>
                                <div className="doc-form-group">
                                    <label>Category</label>
                                    <select className="doc-input" value={uploadForm.category}
                                        onChange={e => setUploadForm(p => ({ ...p, category: e.target.value }))}>
                                        {categories.filter(c => c !== 'all').map(c => <option key={c}>{c}</option>)}
                                    </select>
                                </div>
                                <div className="doc-form-group">
                                    <label>Type</label>
                                    <select className="doc-input" value={uploadForm.type}
                                        onChange={e => setUploadForm(p => ({ ...p, type: e.target.value }))}>
                                        <option value="manual">Manual</option>
                                        <option value="procedure">Procedure</option>
                                        <option value="price-list">Price List</option>
                                        <option value="policy">Policy</option>
                                        <option value="report">Report</option>
                                        <option value="certificate">Certificate</option>
                                    </select>
                                </div>
                                <div className="doc-form-group">
                                    <label>Format</label>
                                    <select className="doc-input" value={uploadForm.format}
                                        onChange={e => setUploadForm(p => ({ ...p, format: e.target.value }))}>
                                        <option>PDF</option>
                                        <option>DOCX</option>
                                        <option>XLSX</option>
                                        <option>PNG</option>
                                        <option>JPG</option>
                                    </select>
                                </div>
                                <div className="doc-form-group">
                                    <label>File Size</label>
                                    <input className="doc-input" value={uploadForm.fileSize}
                                        onChange={e => setUploadForm(p => ({ ...p, fileSize: e.target.value }))}
                                        placeholder="e.g. 2.5 MB" />
                                </div>
                                <div className="doc-form-group" style={{ gridColumn: '1/-1' }}>
                                    <label>Description</label>
                                    <textarea className="doc-input doc-textarea" value={uploadForm.description}
                                        onChange={e => setUploadForm(p => ({ ...p, description: e.target.value }))}
                                        placeholder="Brief description of this document" rows={3} />
                                </div>
                                <div className="doc-upload-area" style={{ gridColumn: '1/-1' }}>
                                    <UploadOutlined style={{ fontSize: 28, color: '#94a3b8' }} />
                                    <p>Click or drag file here to upload</p>
                                    <span>(Simulation only — actual file upload not connected)</span>
                                </div>
                            </div>
                        </div>
                        <div className="doc-modal-footer">
                            <button className="doc-close-btn" onClick={() => setShowUpload(false)}>Cancel</button>
                            <button className="doc-upload-confirm-btn" onClick={handleUpload}>
                                <UploadOutlined /> Upload
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {/* Confirm Dialog */}
            {confirmDialog.show && (
                <ConfirmDialog
                    title={confirmDialog.title}
                    message={confirmDialog.message}
                    type={confirmDialog.type}
                    onConfirm={confirmDialog.onConfirm}
                    onCancel={() => setConfirmDialog({ show: false })}
                />
            )}
        </div>
    )
}

export default ShopDocuments
