import { useState } from 'react'
import { FileText, Download, Eye, RefreshCw, Upload, X, File, FileType, FileSpreadsheet, Search, Filter } from 'lucide-react'
import './ShopDocuments.css'
import { documents as documentsData } from '../../data'
import toast from '../../utils/toast'
import ConfirmDialog from '../../components/ConfirmDialog/ConfirmDialog'
import { useTranslation } from '../../shared/lib/i18n'

const formatIcon = (fmt) => {
    switch ((fmt || '').toUpperCase()) {
        case 'PDF': return <FileType className="fmt-pdf" />
        case 'DOCX':
        case 'DOC': return <FileText className="fmt-doc" />
        case 'XLSX':
        case 'XLS': return <FileSpreadsheet className="fmt-xls" />
        default: return <File className="fmt-default" />
    }
}

/** Turn category name into a stable CSS class slug */
const toCatClass = (cat) =>
    'cat-' + (cat || 'default').toLowerCase().replace(/\s+/g, '-').replace(/[^a-z-]/g, '')

function ShopDocuments() {
    const { t } = useTranslation()
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
        toast.success(`${t('shop.documents.toasts.downloadingPrefix')} "${doc.title}" (${doc.fileSize})`)
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
        toast.success(`"${doc.title}" ${t('shop.documents.toasts.renewedSuffix')} ${newDate}`)
    }

    const handleDelete = (doc) => {
        setConfirmDialog({
            show: true,
            title: t('shop.documents.confirm.deleteTitle'),
            message: `${t('shop.documents.confirm.deleteMessagePrefix')} "${doc.title}"? ${t('shop.documents.confirm.deleteMessageSuffix')}`,
            type: 'danger',
            onConfirm: () => {
                setDocuments(prev => prev.filter(d => d.id !== doc.id))
                toast.success(`"${doc.title}" ${t('shop.documents.toasts.deletedSuffix')}`)
                setConfirmDialog({ show: false })
                if (viewDoc?.id === doc.id) setViewDoc(null)
            }
        })
    }

    const handleUpload = () => {
        if (!uploadForm.title.trim() || !uploadForm.author.trim()) {
            toast.warning(t('shop.documents.toasts.titleAuthorRequired'))
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
        toast.success(`"${newDoc.title}" ${t('shop.documents.toasts.uploadedSuffix')}`)
        setShowUpload(false)
        setUploadForm({ title: '', category: 'Operations', type: 'procedure', author: '', description: '', format: 'PDF', fileSize: '' })
    }

    const statusLabel = (doc) => {
        if (doc.status === 'active') return { text: t('shop.documents.status.active'), cls: 'valid' }
        if (doc.status === 'archived') return { text: t('shop.documents.status.archived'), cls: 'archived' }
        return { text: t('shop.documents.status.expiring'), cls: 'expiring' }
    }

    const typeOptions = [
        { value: 'manual', label: t('shop.documents.types.manual') },
        { value: 'procedure', label: t('shop.documents.types.procedure') },
        { value: 'price-list', label: t('shop.documents.types.priceList') },
        { value: 'policy', label: t('shop.documents.types.policy') },
        { value: 'report', label: t('shop.documents.types.report') },
        { value: 'certificate', label: t('shop.documents.types.certificate') },
    ]

    return (
        <div className="shop-documents">
            {/* Header */}
            <div className="shop-documents-header">
                <div>
                    <h1 className="shop-documents-title">
                        <FileText size={20} style={{ marginRight: 8 }} />{t('shop.documents.title')}
                    </h1>
                    <p className="shop-documents-subtitle">{t('shop.documents.subtitle')}</p>
                </div>
                <button className="shop-documents-upload-btn-primary" onClick={() => setShowUpload(true)}>
                    <Upload size={16} /> {t('shop.documents.actions.uploadDocument')}
                </button>
            </div>

            {/* Search + Filter */}
            <div className="doc-toolbar">
                <div className="doc-search-wrap">
                    <Search className="doc-search-icon" size={16} />
                    <input
                        className="doc-search-input"
                        placeholder={t('shop.documents.searchPlaceholder')}
                        value={searchQuery}
                        onChange={e => setSearchQuery(e.target.value)}
                    />
                </div>
                <div className="doc-filter-wrap">
                    <Filter size={16} style={{ color: 'var(--dashboard-text-muted)' }} />
                    <select
                        className="doc-filter-select"
                        value={filterCategory}
                        onChange={e => setFilterCategory(e.target.value)}
                    >
                        {categories.map(c => (
                            <option key={c} value={c}>{c === 'all' ? t('shop.documents.filters.allCategories') : c}</option>
                        ))}
                    </select>
                </div>
                <span className="doc-count">
                    {filtered.length}{' '}
                    {filtered.length === 1 ? t('shop.documents.units.document') : t('shop.documents.units.documents')}
                </span>
            </div>

            {/* Grid */}
            <div className="shop-documents-grid">
                {filtered.length === 0 && (
                    <div className="doc-empty">{t('shop.documents.empty.noDocumentsFound')}</div>
                )}
                {filtered.map((doc) => {
                    const sl = statusLabel(doc)
                    const catClass = toCatClass(doc.category)
                    return (
                        <div key={doc.id} className="shop-documents-card">
                            <div className="doc-card-icon">{formatIcon(doc.format)}</div>
                            <div className="shop-documents-info">
                                <div className="doc-card-top">
                                    <span className={`doc-category-tag ${catClass}`}>
                                        {doc.category}
                                    </span>
                                    <span className="doc-format-tag">{doc.format}</span>
                                </div>
                                <h3 className="shop-documents-name">{doc.title}</h3>
                                <p className="doc-description">{doc.description}</p>
                                <div className="shop-documents-meta">
                                    <span className={`shop-documents-status shop-documents-status-${sl.cls}`}>{sl.text}</span>
                                    <span className="shop-documents-expiry">{t('shop.documents.meta.modifiedPrefix')}: {doc.lastModified}</span>
                                    <span className="doc-meta-extra">{doc.fileSize} · {doc.downloadCount || 0} {t('shop.documents.meta.downloads')}</span>
                                </div>
                                <div className="shop-documents-actions">
                                    <button className="shop-documents-btn shop-documents-btn-view" onClick={() => setViewDoc(doc)}>
                                        <Eye size={14} /> {t('shop.documents.actions.view')}
                                    </button>
                                    <button className="shop-documents-btn shop-documents-btn-download" onClick={() => handleDownload(doc)}>
                                        <Download size={14} /> {t('shop.documents.actions.download')}
                                    </button>
                                    <button className="shop-documents-btn shop-documents-btn-renew" onClick={() => setShowRenew(doc)}>
                                        <RefreshCw size={14} /> {t('shop.documents.actions.renew')}
                                    </button>
                                    <button className="shop-documents-btn shop-documents-btn-delete" onClick={() => handleDelete(doc)}>
                                        {t('common.delete')}
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
                            <button className="doc-modal-close" onClick={() => setViewDoc(null)}><X size={18} /></button>
                        </div>
                        <div className="doc-modal-body">
                            <div className="doc-detail-grid">
                                <div className="doc-detail-item"><span className="ddl">{t('shop.documents.detail.id')}</span><span className="ddv">{viewDoc.id}</span></div>
                                <div className="doc-detail-item"><span className="ddl">{t('shop.documents.detail.category')}</span><span className="ddv">{viewDoc.category}</span></div>
                                <div className="doc-detail-item"><span className="ddl">{t('shop.documents.detail.type')}</span><span className="ddv">{viewDoc.type}</span></div>
                                <div className="doc-detail-item"><span className="ddl">{t('shop.documents.detail.format')}</span><span className="ddv">{viewDoc.format}</span></div>
                                <div className="doc-detail-item"><span className="ddl">{t('shop.documents.detail.author')}</span><span className="ddv">{viewDoc.author}</span></div>
                                <div className="doc-detail-item"><span className="ddl">{t('shop.documents.detail.fileSize')}</span><span className="ddv">{viewDoc.fileSize}</span></div>
                                <div className="doc-detail-item"><span className="ddl">{t('shop.documents.detail.uploadDate')}</span><span className="ddv">{viewDoc.uploadDate}</span></div>
                                <div className="doc-detail-item"><span className="ddl">{t('shop.documents.detail.lastModified')}</span><span className="ddv">{viewDoc.lastModified}</span></div>
                                <div className="doc-detail-item"><span className="ddl">{t('shop.documents.detail.downloads')}</span><span className="ddv">{viewDoc.downloadCount || 0}</span></div>
                                <div className="doc-detail-item"><span className="ddl">{t('shop.documents.detail.status')}</span>
                                    <span className={`shop-documents-status shop-documents-status-${statusLabel(viewDoc).cls}`}>
                                        {statusLabel(viewDoc).text}
                                    </span>
                                </div>
                                <div className="doc-detail-item" style={{ gridColumn: '1/-1' }}>
                                    <span className="ddl">{t('shop.documents.detail.description')}</span>
                                    <span className="ddv">{viewDoc.description}</span>
                                </div>
                                {viewDoc.tags?.length > 0 && (
                                    <div className="doc-detail-item" style={{ gridColumn: '1/-1' }}>
                                        <span className="ddl">{t('shop.documents.detail.tags')}</span>
                                        <div className="doc-tags">
                                            {viewDoc.tags.map(t => <span key={t} className="doc-tag">#{t}</span>)}
                                        </div>
                                    </div>
                                )}
                            </div>
                        </div>
                        <div className="doc-modal-footer">
                            <button className="shop-documents-btn shop-documents-btn-renew" onClick={() => { setViewDoc(null); setShowRenew(viewDoc) }}>
                                <RefreshCw size={14} /> {t('shop.documents.actions.renew')}
                            </button>
                            <button className="shop-documents-btn shop-documents-btn-download" onClick={() => handleDownload(viewDoc)}>
                                <Download size={14} /> {t('shop.documents.actions.download')}
                            </button>
                            <button className="doc-close-btn" onClick={() => setViewDoc(null)}>{t('common.close')}</button>
                        </div>
                    </div>
                </div>
            )}

            {/* Renew Confirm Modal */}
            {showRenew && (
                <div className="doc-modal-overlay" onClick={() => setShowRenew(null)}>
                    <div className="doc-modal doc-modal-sm" onClick={e => e.stopPropagation()}>
                        <div className="doc-modal-header">
                            <h2><RefreshCw size={18} /> {t('shop.documents.renew.title')}</h2>
                            <button className="doc-modal-close" onClick={() => setShowRenew(null)}><X size={18} /></button>
                        </div>
                        <div className="doc-modal-body">
                            <p style={{ color: '#475569', marginBottom: 16 }}>
                                {t('shop.documents.renew.confirmPrefix')} <strong>"{showRenew.title}"</strong>?
                            </p>
                            <p style={{ color: '#64748b', fontSize: 14 }}>
                                {t('shop.documents.renew.description')}
                            </p>
                        </div>
                        <div className="doc-modal-footer">
                            <button className="doc-close-btn" onClick={() => setShowRenew(null)}>{t('common.cancel')}</button>
                            <button className="doc-renew-confirm-btn" onClick={() => handleRenew(showRenew)}>
                                <RefreshCw size={14} /> {t('shop.documents.renew.confirmCta')}
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
                            <h2><Upload size={18} /> {t('shop.documents.upload.title')}</h2>
                            <button className="doc-modal-close" onClick={() => setShowUpload(false)}><X size={18} /></button>
                        </div>
                        <div className="doc-modal-body">
                            <div className="doc-upload-form">
                                <div className="doc-form-group">
                                    <label>{t('shop.documents.upload.fields.title')} *</label>
                                    <input className="doc-input" value={uploadForm.title}
                                        onChange={e => setUploadForm(p => ({ ...p, title: e.target.value }))}
                                        placeholder={t('shop.documents.upload.placeholders.title')} />
                                </div>
                                <div className="doc-form-group">
                                    <label>{t('shop.documents.upload.fields.author')} *</label>
                                    <input className="doc-input" value={uploadForm.author}
                                        onChange={e => setUploadForm(p => ({ ...p, author: e.target.value }))}
                                        placeholder={t('shop.documents.upload.placeholders.author')} />
                                </div>
                                <div className="doc-form-group">
                                    <label>{t('shop.documents.upload.fields.category')}</label>
                                    <select className="doc-input" value={uploadForm.category}
                                        onChange={e => setUploadForm(p => ({ ...p, category: e.target.value }))}>
                                        {categories.filter(c => c !== 'all').map(c => <option key={c}>{c}</option>)}
                                    </select>
                                </div>
                                <div className="doc-form-group">
                                    <label>{t('shop.documents.upload.fields.type')}</label>
                                    <select className="doc-input" value={uploadForm.type}
                                        onChange={e => setUploadForm(p => ({ ...p, type: e.target.value }))}>
                                        {typeOptions.map(opt => (
                                            <option key={opt.value} value={opt.value}>{opt.label}</option>
                                        ))}
                                    </select>
                                </div>
                                <div className="doc-form-group">
                                    <label>{t('shop.documents.upload.fields.format')}</label>
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
                                    <label>{t('shop.documents.upload.fields.fileSize')}</label>
                                    <input className="doc-input" value={uploadForm.fileSize}
                                        onChange={e => setUploadForm(p => ({ ...p, fileSize: e.target.value }))}
                                        placeholder={t('shop.documents.upload.placeholders.fileSize')} />
                                </div>
                                <div className="doc-form-group" style={{ gridColumn: '1/-1' }}>
                                    <label>{t('shop.documents.upload.fields.description')}</label>
                                    <textarea className="doc-input doc-textarea" value={uploadForm.description}
                                        onChange={e => setUploadForm(p => ({ ...p, description: e.target.value }))}
                                        placeholder={t('shop.documents.upload.placeholders.description')} rows={3} />
                                </div>
                                <div className="doc-upload-area" style={{ gridColumn: '1/-1' }}>
                                    <Upload size={28} style={{ color: '#94a3b8' }} />
                                    <p>{t('shop.documents.upload.dropzone.title')}</p>
                                    <span>{t('shop.documents.upload.dropzone.subtitle')}</span>
                                </div>
                            </div>
                        </div>
                        <div className="doc-modal-footer">
                            <button className="doc-close-btn" onClick={() => setShowUpload(false)}>{t('common.cancel')}</button>
                            <button className="doc-upload-confirm-btn" onClick={handleUpload}>
                                <Upload size={14} /> {t('shop.documents.actions.upload')}
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
