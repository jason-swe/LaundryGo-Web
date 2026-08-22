import { createElement, useMemo, useState } from 'react'
import {
    AlertTriangle,
    Archive,
    CheckCircle,
    Clock,
    Download,
    Eye,
    File,
    FileCheck,
    FileSpreadsheet,
    FileText,
    FileType,
    RefreshCw,
    Search,
    ShieldCheck,
    Trash2,
    Upload,
    X,
} from 'lucide-react'
import './ShopDocuments.css'
import { documents as documentsData } from '../../data'
import ConfirmDialog from '../../components/ConfirmDialog/ConfirmDialog'
import toast from '../../utils/toast'
import { useTranslation } from '../../shared/lib/i18n'

const TODAY = new Date('2026-06-02T00:00:00')
const DOCUMENT_VALID_MONTHS = 24

const TYPE_OPTIONS = ['manual', 'procedure', 'price-list', 'policy', 'report', 'certificate', 'contract', 'catalog']
const FORMAT_OPTIONS = ['PDF', 'DOCX', 'XLSX', 'PNG', 'JPG']
const LOCAL_PREVIEW_MESSAGE = 'Shop documents API is not available yet. Changes are local presentation data only.'

function addMonths(dateString, months) {
    const date = new Date(dateString)
    date.setMonth(date.getMonth() + months)
    return date
}

function daysBetween(from, to) {
    return Math.ceil((to.getTime() - from.getTime()) / 86400000)
}

function formatDate(value) {
    if (!value) return ''
    return new Intl.DateTimeFormat('vi-VN', { year: 'numeric', month: '2-digit', day: '2-digit' }).format(new Date(value))
}

function getFormatIcon(format) {
    switch ((format || '').toUpperCase()) {
        case 'PDF':
            return FileType
        case 'DOC':
        case 'DOCX':
            return FileText
        case 'XLS':
        case 'XLSX':
            return FileSpreadsheet
        default:
            return File
    }
}

function getCategoryKey(category) {
    return String(category || 'other').toLowerCase().replace(/[^a-z0-9]+/g, '')
}

function getDocumentStatus(doc) {
    if (doc.status === 'archived') {
        return { key: 'archived', Icon: Archive, daysLeft: null, dueDate: addMonths(doc.lastModified, DOCUMENT_VALID_MONTHS) }
    }

    const dueDate = addMonths(doc.lastModified, DOCUMENT_VALID_MONTHS)
    const daysLeft = daysBetween(TODAY, dueDate)

    if (daysLeft < 0) return { key: 'expired', Icon: AlertTriangle, daysLeft, dueDate }
    if (daysLeft <= 60) return { key: 'expiring', Icon: Clock, daysLeft, dueDate }
    return { key: 'verified', Icon: CheckCircle, daysLeft, dueDate }
}

const initialForm = {
    title: '',
    category: 'Operations',
    type: 'procedure',
    author: '',
    description: '',
    format: 'PDF',
    fileSize: '',
}

function ShopDocuments() {
    const { t } = useTranslation()
    const [documents, setDocuments] = useState(documentsData)
    const [selectedDocId, setSelectedDocId] = useState(documentsData[0]?.id || null)
    const [searchQuery, setSearchQuery] = useState('')
    const [categoryFilter, setCategoryFilter] = useState('all')
    const [statusFilter, setStatusFilter] = useState('all')
    const [showUpload, setShowUpload] = useState(false)
    const [renewDoc, setRenewDoc] = useState(null)
    const [deleteDoc, setDeleteDoc] = useState(null)
    const [uploadForm, setUploadForm] = useState(initialForm)
    const [formErrors, setFormErrors] = useState({})

    const enrichedDocs = useMemo(() => documents.map(doc => ({
        ...doc,
        compliance: getDocumentStatus(doc),
    })), [documents])

    const categories = useMemo(() => ['all', ...Array.from(new Set(documents.map(doc => doc.category)))], [documents])

    const filteredDocs = enrichedDocs.filter(doc => {
        const query = searchQuery.trim().toLowerCase()
        const matchesSearch = !query ||
            doc.title.toLowerCase().includes(query) ||
            doc.description.toLowerCase().includes(query) ||
            doc.author.toLowerCase().includes(query) ||
            doc.id.toLowerCase().includes(query)
        const matchesCategory = categoryFilter === 'all' || doc.category === categoryFilter
        const matchesStatus = statusFilter === 'all' || doc.compliance.key === statusFilter
        return matchesSearch && matchesCategory && matchesStatus
    })

    const selectedDoc = enrichedDocs.find(doc => doc.id === selectedDocId) || filteredDocs[0] || null

    const metrics = [
        {
            label: t('shopDocuments.totalDocuments'),
            value: enrichedDocs.length,
            meta: t('shopDocuments.inLibrary'),
            Icon: FileCheck,
            tone: 'navy',
        },
        {
            label: t('shopDocuments.verified'),
            value: enrichedDocs.filter(doc => doc.compliance.key === 'verified').length,
            meta: t('shopDocuments.readyForAudit'),
            Icon: ShieldCheck,
            tone: 'teal',
        },
        {
            label: t('shopDocuments.expiring'),
            value: enrichedDocs.filter(doc => doc.compliance.key === 'expiring').length,
            meta: t('shopDocuments.actionSoon'),
            Icon: Clock,
            tone: 'amber',
        },
        {
            label: t('shopDocuments.expired'),
            value: enrichedDocs.filter(doc => doc.compliance.key === 'expired').length,
            meta: t('shopDocuments.needsUpdate'),
            Icon: AlertTriangle,
            tone: 'red',
        },
    ]

    const updateForm = (field, value) => {
        setUploadForm(prev => ({ ...prev, [field]: value }))
        setFormErrors(prev => ({ ...prev, [field]: '' }))
    }

    const validateForm = () => {
        const nextErrors = {}
        if (!uploadForm.title.trim()) nextErrors.title = t('shopDocuments.titleRequired')
        if (!uploadForm.author.trim()) nextErrors.author = t('shopDocuments.authorRequired')
        if (!uploadForm.description.trim()) nextErrors.description = t('shopDocuments.descriptionRequired')
        setFormErrors(nextErrors)
        return Object.keys(nextErrors).length === 0
    }

    const resetUpload = () => {
        setUploadForm(initialForm)
        setFormErrors({})
        setShowUpload(false)
    }

    const handleUpload = () => {
        if (!validateForm()) return
        const today = TODAY.toISOString().split('T')[0]
        const newDocument = {
            id: `DOC-${String(documents.length + 1).padStart(3, '0')}`,
            ...uploadForm,
            uploadDate: today,
            lastModified: today,
            status: 'active',
            tags: [uploadForm.category.toLowerCase(), uploadForm.type],
            downloadCount: 0,
            fileSize: uploadForm.fileSize || t('shopDocuments.notSet'),
        }
        setDocuments(prev => [newDocument, ...prev])
        setSelectedDocId(newDocument.id)
        resetUpload()
        toast.info(`${t('shopDocuments.uploaded')} ${LOCAL_PREVIEW_MESSAGE}`)
    }

    const handleDownload = (doc) => {
        toast.info(`${t('shopDocuments.downloaded')}: ${doc.title}. No backend file storage is available yet.`)
    }

    const handleRenew = () => {
        if (!renewDoc) return
        const today = TODAY.toISOString().split('T')[0]
        setDocuments(prev => prev.map(doc => (
            doc.id === renewDoc.id ? { ...doc, lastModified: today, status: 'active' } : doc
        )))
        setRenewDoc(null)
        toast.info(`${t('shopDocuments.renewed')} ${LOCAL_PREVIEW_MESSAGE}`)
    }

    const handleDelete = () => {
        if (!deleteDoc) return
        setDocuments(prev => prev.filter(doc => doc.id !== deleteDoc.id))
        if (selectedDocId === deleteDoc.id) setSelectedDocId(documents.find(doc => doc.id !== deleteDoc.id)?.id || null)
        setDeleteDoc(null)
        toast.info(`${t('shopDocuments.deleted')} ${LOCAL_PREVIEW_MESSAGE}`)
    }

    const statusLabel = (statusKey) => t(`shopDocuments.status${statusKey.charAt(0).toUpperCase()}${statusKey.slice(1)}`)
    const categoryLabel = (category) => t(`shopDocuments.category${getCategoryKey(category)}`) === `shopDocuments.category${getCategoryKey(category)}` ? category : t(`shopDocuments.category${getCategoryKey(category)}`)

    return (
        <div className="shop-documents-page">
            <header className="shop-documents-header">
                <div>
                    <span className="shop-documents-eyebrow">{t('shopDocuments.eyebrow')}</span>
                    <h1>{t('shopDocuments.title')}</h1>
                    <p>{t('shopDocuments.subtitle')}</p>
                </div>
                <button type="button" className="shop-documents-primary-btn" onClick={() => setShowUpload(true)}>
                    <Upload size={16} strokeWidth={1.9} />
                    {t('shopDocuments.uploadDocument')}
                </button>
            </header>

            <section className="shop-documents-api-notice">
                <AlertTriangle size={18} strokeWidth={1.9} />
                <span>{LOCAL_PREVIEW_MESSAGE}</span>
            </section>

            <section className="shop-documents-kpis">
                {metrics.map(({ label, value, meta, Icon, tone }) => (
                    <article className={`shop-documents-kpi ${tone}`} key={label}>
                        <span>{createElement(Icon, { size: 18, strokeWidth: 1.9 })}</span>
                        <small>{label}</small>
                        <strong>{value}</strong>
                        <p>{meta}</p>
                    </article>
                ))}
            </section>

            <section className="shop-documents-toolbar">
                <label className="shop-documents-search">
                    <Search size={17} strokeWidth={1.9} />
                    <input
                        type="search"
                        value={searchQuery}
                        onChange={(event) => setSearchQuery(event.target.value)}
                        placeholder={t('shopDocuments.searchPlaceholder')}
                    />
                </label>
                <select value={categoryFilter} onChange={(event) => setCategoryFilter(event.target.value)} aria-label={t('shopDocuments.category')}>
                    {categories.map(category => (
                        <option value={category} key={category}>{category === 'all' ? t('shopDocuments.allCategories') : categoryLabel(category)}</option>
                    ))}
                </select>
                <select value={statusFilter} onChange={(event) => setStatusFilter(event.target.value)} aria-label={t('shopDocuments.status')}>
                    {['all', 'verified', 'expiring', 'expired', 'archived'].map(status => (
                        <option value={status} key={status}>{status === 'all' ? t('shopDocuments.allStatuses') : statusLabel(status)}</option>
                    ))}
                </select>
                <button type="button" className="shop-documents-secondary-btn" onClick={() => { setSearchQuery(''); setCategoryFilter('all'); setStatusFilter('all') }}>
                    {t('shopDocuments.clearFilters')}
                </button>
            </section>

            <section className="shop-documents-workspace">
                <div className="shop-documents-list-card">
                    <div className="shop-documents-list-head">
                        <div>
                            <span className="shop-documents-eyebrow">{t('shopDocuments.library')}</span>
                            <h2>{filteredDocs.length} {t('shopDocuments.results')}</h2>
                        </div>
                    </div>

                    <div className="shop-documents-list">
                        {filteredDocs.length === 0 && (
                            <div className="shop-documents-empty">
                                <FileText size={30} strokeWidth={1.8} />
                                <strong>{t('shopDocuments.emptyTitle')}</strong>
                                <p>{t('shopDocuments.emptyHint')}</p>
                            </div>
                        )}

                        {filteredDocs.map(doc => {
                            const FormatIcon = getFormatIcon(doc.format)
                            return (
                                <article
                                    className={`shop-documents-row ${selectedDoc?.id === doc.id ? 'active' : ''}`}
                                    key={doc.id}
                                    onClick={() => setSelectedDocId(doc.id)}
                                >
                                    <div className="shop-documents-format">
                                        <FormatIcon size={20} strokeWidth={1.8} />
                                        <span>{doc.format}</span>
                                    </div>
                                    <div className="shop-documents-row-main">
                                        <div className="shop-documents-row-title">
                                            <strong>{doc.title}</strong>
                                            <span className={`shop-documents-status ${doc.compliance.key}`}>
                                                {createElement(doc.compliance.Icon, { size: 13, strokeWidth: 2 })}
                                                {statusLabel(doc.compliance.key)}
                                            </span>
                                        </div>
                                        <p>{doc.description}</p>
                                        <div className="shop-documents-row-meta">
                                            <span>{doc.id}</span>
                                            <span>{categoryLabel(doc.category)}</span>
                                            <span>{t('shopDocuments.modified')}: {formatDate(doc.lastModified)}</span>
                                            <span>{doc.downloadCount || 0} {t('shopDocuments.downloads')}</span>
                                        </div>
                                    </div>
                                    <button type="button" className="shop-documents-view-btn" onClick={(event) => { event.stopPropagation(); setSelectedDocId(doc.id) }}>
                                        <Eye size={15} strokeWidth={1.9} />
                                        {t('shopDocuments.view')}
                                    </button>
                                </article>
                            )
                        })}
                    </div>
                </div>

                <aside className="shop-documents-detail-card">
                    {selectedDoc ? (
                        <>
                            <div className="shop-documents-detail-head">
                                <div>
                                    <span className="shop-documents-eyebrow">{t('shopDocuments.documentProfile')}</span>
                                    <h2>{selectedDoc.title}</h2>
                                </div>
                                <span className={`shop-documents-status ${selectedDoc.compliance.key}`}>
                                    {createElement(selectedDoc.compliance.Icon, { size: 13, strokeWidth: 2 })}
                                    {statusLabel(selectedDoc.compliance.key)}
                                </span>
                            </div>

                            <dl className="shop-documents-detail-grid">
                                <div><dt>{t('shopDocuments.documentId')}</dt><dd>{selectedDoc.id}</dd></div>
                                <div><dt>{t('shopDocuments.category')}</dt><dd>{categoryLabel(selectedDoc.category)}</dd></div>
                                <div><dt>{t('shopDocuments.type')}</dt><dd>{selectedDoc.type}</dd></div>
                                <div><dt>{t('shopDocuments.format')}</dt><dd>{selectedDoc.format}</dd></div>
                                <div><dt>{t('shopDocuments.author')}</dt><dd>{selectedDoc.author}</dd></div>
                                <div><dt>{t('shopDocuments.fileSize')}</dt><dd>{selectedDoc.fileSize}</dd></div>
                                <div><dt>{t('shopDocuments.uploadDate')}</dt><dd>{formatDate(selectedDoc.uploadDate)}</dd></div>
                                <div><dt>{t('shopDocuments.reviewDue')}</dt><dd>{formatDate(selectedDoc.compliance.dueDate)}</dd></div>
                            </dl>

                            <div className="shop-documents-note">
                                <strong>{t('shopDocuments.complianceNote')}</strong>
                                <p>{selectedDoc.compliance.daysLeft === null ? t('shopDocuments.archivedNote') : selectedDoc.compliance.daysLeft < 0 ? t('shopDocuments.expiredNote') : `${selectedDoc.compliance.daysLeft} ${t('shopDocuments.daysLeft')}`}</p>
                            </div>

                            <div className="shop-documents-tags">
                                {(selectedDoc.tags || []).map(tag => <span key={tag}>#{tag}</span>)}
                            </div>

                            <div className="shop-documents-detail-actions">
                                <button type="button" onClick={() => handleDownload(selectedDoc)}>
                                    <Download size={15} strokeWidth={1.9} />
                                    {t('shopDocuments.download')}
                                </button>
                                <button type="button" onClick={() => setRenewDoc(selectedDoc)}>
                                    <RefreshCw size={15} strokeWidth={1.9} />
                                    {t('shopDocuments.renew')}
                                </button>
                                <button type="button" className="danger" onClick={() => setDeleteDoc(selectedDoc)}>
                                    <Trash2 size={15} strokeWidth={1.9} />
                                    {t('shopDocuments.delete')}
                                </button>
                            </div>
                        </>
                    ) : (
                        <div className="shop-documents-empty detail">
                            <FileText size={30} strokeWidth={1.8} />
                            <strong>{t('shopDocuments.selectTitle')}</strong>
                            <p>{t('shopDocuments.selectHint')}</p>
                        </div>
                    )}
                </aside>
            </section>

            {showUpload && (
                <div className="shop-documents-modal-backdrop" onClick={resetUpload}>
                    <section className="shop-documents-modal" onClick={(event) => event.stopPropagation()}>
                        <div className="shop-documents-modal-head">
                            <div>
                                <span className="shop-documents-eyebrow">{t('shopDocuments.newDocument')}</span>
                                <h2>{t('shopDocuments.uploadDocument')}</h2>
                            </div>
                            <button type="button" aria-label={t('shopDocuments.close')} onClick={resetUpload}>
                                <X size={18} strokeWidth={1.9} />
                            </button>
                        </div>

                        <div className="shop-documents-form">
                            <label>
                                <span>{t('shopDocuments.documentTitle')} *</span>
                                <input value={uploadForm.title} onChange={(event) => updateForm('title', event.target.value)} placeholder={t('shopDocuments.documentTitlePlaceholder')} />
                                {formErrors.title && <small>{formErrors.title}</small>}
                            </label>
                            <label>
                                <span>{t('shopDocuments.author')} *</span>
                                <input value={uploadForm.author} onChange={(event) => updateForm('author', event.target.value)} placeholder={t('shopDocuments.authorPlaceholder')} />
                                {formErrors.author && <small>{formErrors.author}</small>}
                            </label>
                            <label>
                                <span>{t('shopDocuments.category')}</span>
                                <select value={uploadForm.category} onChange={(event) => updateForm('category', event.target.value)}>
                                    {categories.filter(category => category !== 'all').map(category => <option value={category} key={category}>{categoryLabel(category)}</option>)}
                                </select>
                            </label>
                            <label>
                                <span>{t('shopDocuments.type')}</span>
                                <select value={uploadForm.type} onChange={(event) => updateForm('type', event.target.value)}>
                                    {TYPE_OPTIONS.map(type => <option value={type} key={type}>{type}</option>)}
                                </select>
                            </label>
                            <label>
                                <span>{t('shopDocuments.format')}</span>
                                <select value={uploadForm.format} onChange={(event) => updateForm('format', event.target.value)}>
                                    {FORMAT_OPTIONS.map(format => <option value={format} key={format}>{format}</option>)}
                                </select>
                            </label>
                            <label>
                                <span>{t('shopDocuments.fileSize')}</span>
                                <input value={uploadForm.fileSize} onChange={(event) => updateForm('fileSize', event.target.value)} placeholder="2.5 MB" />
                            </label>
                            <label className="wide">
                                <span>{t('shopDocuments.description')} *</span>
                                <textarea value={uploadForm.description} onChange={(event) => updateForm('description', event.target.value)} placeholder={t('shopDocuments.descriptionPlaceholder')} rows={3} />
                                {formErrors.description && <small>{formErrors.description}</small>}
                            </label>
                            <div className="shop-documents-upload-zone wide">
                                <Upload size={28} strokeWidth={1.8} />
                                <strong>{t('shopDocuments.dropzoneTitle')}</strong>
                                <p>{t('shopDocuments.dropzoneHint')}</p>
                            </div>
                        </div>

                        <div className="shop-documents-modal-actions">
                            <button type="button" className="shop-documents-secondary-btn" onClick={resetUpload}>{t('shopDocuments.cancel')}</button>
                            <button type="button" className="shop-documents-primary-btn" onClick={handleUpload}>{t('shopDocuments.upload')}</button>
                        </div>
                    </section>
                </div>
            )}

            {renewDoc && (
                <ConfirmDialog
                    title={t('shopDocuments.renewTitle')}
                    message={`${t('shopDocuments.renewMessage')} "${renewDoc.title}"?`}
                    type="warning"
                    confirmText={t('shopDocuments.renew')}
                    cancelText={t('shopDocuments.cancel')}
                    onConfirm={handleRenew}
                    onCancel={() => setRenewDoc(null)}
                />
            )}

            {deleteDoc && (
                <ConfirmDialog
                    title={t('shopDocuments.deleteTitle')}
                    message={`${t('shopDocuments.deleteMessage')} "${deleteDoc.title}"?`}
                    type="danger"
                    confirmText={t('shopDocuments.delete')}
                    cancelText={t('shopDocuments.cancel')}
                    onConfirm={handleDelete}
                    onCancel={() => setDeleteDoc(null)}
                />
            )}
        </div>
    )
}

export default ShopDocuments
