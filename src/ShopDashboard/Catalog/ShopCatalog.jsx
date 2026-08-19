import { useEffect, useMemo, useState } from 'react'
import { Edit3, PackageSearch, Plus, RefreshCw, Search, Trash2 } from 'lucide-react'
import ConfirmDialog from '../../components/ConfirmDialog/ConfirmDialog'
import { useTranslation } from '../../shared/lib/i18n'
import {
    createShopService,
    deleteShopService,
    getShopOwnerServices,
    setShopServiceAvailability,
    updateShopService,
} from '../../services/shopOwnerApi'
import toast from '../../utils/toast'
import './ShopCatalog.css'

const emptyForm = {
    name: '',
    categoryId: '',
    pricingType: 'BY_WEIGHT',
    price: '',
    minOrder: '0',
    estimatedTime: '',
    description: '',
    available: true,
}

function ShopCatalog() {
    const { t } = useTranslation()
    const [services, setServices] = useState([])
    const [categories, setCategories] = useState([])
    const [query, setQuery] = useState('')
    const [isLoading, setIsLoading] = useState(true)
    const [loadError, setLoadError] = useState('')
    const [saving, setSaving] = useState(false)
    const [editing, setEditing] = useState(null)
    const [form, setForm] = useState(emptyForm)
    const [deleteTarget, setDeleteTarget] = useState(null)

    const loadCatalog = async () => {
        setIsLoading(true)
        setLoadError('')
        try {
            const data = await getShopOwnerServices()
            setServices(data.services)
            setCategories(data.categories)
        } catch (error) {
            setLoadError(error?.message || t('shopCatalog.loadFailed'))
        } finally {
            setIsLoading(false)
        }
    }

    useEffect(() => {
        void loadCatalog()
    }, [])

    const filteredServices = useMemo(() => {
        const normalizedQuery = query.trim().toLowerCase()
        if (!normalizedQuery) return services
        return services.filter((service) =>
            [service.name, service.category, service.description]
                .some((value) => String(value || '').toLowerCase().includes(normalizedQuery)))
    }, [query, services])

    const openCreate = () => {
        setEditing({ mode: 'create' })
        setForm({ ...emptyForm, categoryId: categories[0]?.id || '' })
    }

    const openEdit = (service) => {
        setEditing(service)
        setForm({
            name: service.name,
            categoryId: service.categoryId || '',
            pricingType: service.pricingType || 'BY_WEIGHT',
            price: String(service.price ?? ''),
            minOrder: String(service.minOrder ?? 0),
            estimatedTime: service.estimatedTime || '',
            description: service.description || '',
            available: service.available !== false,
        })
    }

    const closeForm = () => {
        if (saving) return
        setEditing(null)
        setForm(emptyForm)
    }

    const saveService = async (event) => {
        event.preventDefault()
        if (!form.name.trim() || !form.categoryId || Number(form.price) <= 0 || !form.estimatedTime.trim()) {
            toast.warning(t('shopCatalog.requiredFields'))
            return
        }

        setSaving(true)
        try {
            const saved = editing.mode === 'create'
                ? await createShopService(form)
                : await updateShopService(editing.apiId, form)
            setServices((current) => editing.mode === 'create'
                ? [saved, ...current]
                : current.map((item) => item.apiId === saved.apiId ? saved : item))
            toast.success(editing.mode === 'create' ? t('shopCatalog.created') : t('shopCatalog.updated'))
            setEditing(null)
            setForm(emptyForm)
        } catch (error) {
            toast.error(error?.message || t('shopCatalog.saveFailed'))
        } finally {
            setSaving(false)
        }
    }

    const toggleAvailability = async (service) => {
        try {
            const updated = await setShopServiceAvailability(service.apiId, !service.available)
            setServices((current) => current.map((item) => item.apiId === updated.apiId ? updated : item))
        } catch (error) {
            toast.error(error?.message || t('shopCatalog.availabilityFailed'))
        }
    }

    const confirmDelete = async () => {
        if (!deleteTarget) return
        try {
            await deleteShopService(deleteTarget.apiId)
            setServices((current) => current.filter((item) => item.apiId !== deleteTarget.apiId))
            toast.success(t('shopCatalog.deleted'))
        } catch (error) {
            toast.error(error?.message || t('shopCatalog.deleteFailed'))
        } finally {
            setDeleteTarget(null)
        }
    }

    const unitLabel = (pricingType) => pricingType === 'BY_ITEM'
        ? t('shopCatalog.perItem')
        : t('shopCatalog.perKg')

    return (
        <div className="shop-catalog-page">
            <header className="shop-catalog-header">
                <div>
                    <span className="shop-catalog-eyebrow">{t('shopCatalog.eyebrow')}</span>
                    <h1>{t('shopCatalog.title')}</h1>
                    <p>{t('shopCatalog.subtitle')}</p>
                </div>
                <button type="button" className="shop-catalog-primary" onClick={openCreate} disabled={isLoading || categories.length === 0}>
                    <Plus size={17} /> {t('shopCatalog.addService')}
                </button>
            </header>

            <section className="shop-catalog-toolbar">
                <label>
                    <Search size={17} />
                    <input value={query} onChange={(event) => setQuery(event.target.value)} placeholder={t('shopCatalog.searchPlaceholder')} />
                </label>
                <button type="button" onClick={() => void loadCatalog()} disabled={isLoading}>
                    <RefreshCw size={16} /> {t('shopCatalog.refresh')}
                </button>
            </section>

            {isLoading && <div className="shop-catalog-state">{t('shopCatalog.loading')}</div>}
            {!isLoading && loadError && (
                <div className="shop-catalog-state error">
                    <strong>{loadError}</strong>
                    <button type="button" onClick={() => void loadCatalog()}>{t('shopCatalog.retry')}</button>
                </div>
            )}
            {!isLoading && !loadError && filteredServices.length === 0 && (
                <div className="shop-catalog-state">
                    <PackageSearch size={30} />
                    <strong>{t('shopCatalog.empty')}</strong>
                    <span>{t('shopCatalog.emptyHint')}</span>
                </div>
            )}

            {!isLoading && !loadError && filteredServices.length > 0 && (
                <section className="shop-catalog-grid">
                    {filteredServices.map((service) => (
                        <article className="shop-catalog-card" key={service.apiId}>
                            <div className="shop-catalog-card-head">
                                <div>
                                    <span>{service.category || t('shopCatalog.uncategorized')}</span>
                                    <h2>{service.name}</h2>
                                </div>
                                <button
                                    type="button"
                                    className={`shop-catalog-availability ${service.available ? 'available' : ''}`}
                                    onClick={() => void toggleAvailability(service)}
                                >
                                    {service.available ? t('shopCatalog.available') : t('shopCatalog.unavailable')}
                                </button>
                            </div>
                            <p>{service.description || t('shopCatalog.noDescription')}</p>
                            <dl>
                                <div><dt>{t('shopCatalog.price')}</dt><dd>{Number(service.price || 0).toLocaleString()}đ {unitLabel(service.pricingType)}</dd></div>
                                <div><dt>{t('shopCatalog.minimum')}</dt><dd>{Number(service.minOrder || 0).toLocaleString()}</dd></div>
                                <div><dt>{t('shopCatalog.estimatedTime')}</dt><dd>{service.estimatedTime || '—'}</dd></div>
                            </dl>
                            <div className="shop-catalog-card-actions">
                                <button type="button" onClick={() => openEdit(service)}><Edit3 size={15} />{t('shopCatalog.edit')}</button>
                                <button type="button" className="danger" onClick={() => setDeleteTarget(service)}><Trash2 size={15} />{t('shopCatalog.delete')}</button>
                            </div>
                        </article>
                    ))}
                </section>
            )}

            {editing && (
                <div className="shop-catalog-modal-backdrop" onClick={closeForm}>
                    <form className="shop-catalog-modal" onSubmit={saveService} onClick={(event) => event.stopPropagation()}>
                        <div className="shop-catalog-modal-head">
                            <div>
                                <span className="shop-catalog-eyebrow">{editing.mode === 'create' ? t('shopCatalog.newService') : t('shopCatalog.editService')}</span>
                                <h2>{editing.mode === 'create' ? t('shopCatalog.createTitle') : editing.name}</h2>
                            </div>
                            <button type="button" onClick={closeForm} aria-label={t('common.close')}>×</button>
                        </div>
                        <div className="shop-catalog-form-grid">
                            <label><span>{t('shopCatalog.serviceName')}</span><input value={form.name} onChange={(event) => setForm({ ...form, name: event.target.value })} /></label>
                            <label><span>{t('shopCatalog.category')}</span><select value={form.categoryId} onChange={(event) => setForm({ ...form, categoryId: event.target.value })}>{categories.map((category) => <option value={category.id} key={category.id}>{category.name}</option>)}</select></label>
                            <label><span>{t('shopCatalog.pricingType')}</span><select value={form.pricingType} onChange={(event) => setForm({ ...form, pricingType: event.target.value })}><option value="BY_WEIGHT">{t('shopCatalog.byWeight')}</option><option value="BY_ITEM">{t('shopCatalog.byItem')}</option></select></label>
                            <label><span>{t('shopCatalog.price')}</span><input type="number" min="1" value={form.price} onChange={(event) => setForm({ ...form, price: event.target.value })} /></label>
                            <label><span>{t('shopCatalog.minimum')}</span><input type="number" min="0" value={form.minOrder} onChange={(event) => setForm({ ...form, minOrder: event.target.value })} /></label>
                            <label><span>{t('shopCatalog.estimatedTime')}</span><input value={form.estimatedTime} onChange={(event) => setForm({ ...form, estimatedTime: event.target.value })} placeholder={t('shopCatalog.timePlaceholder')} /></label>
                            <label className="wide"><span>{t('shopCatalog.description')}</span><textarea rows="4" value={form.description} onChange={(event) => setForm({ ...form, description: event.target.value })} /></label>
                        </div>
                        <div className="shop-catalog-modal-actions">
                            <button type="button" onClick={closeForm}>{t('common.cancel')}</button>
                            <button type="submit" className="primary" disabled={saving}>{saving ? t('common.loading') : t('shopCatalog.save')}</button>
                        </div>
                    </form>
                </div>
            )}

            {deleteTarget && (
                <ConfirmDialog
                    title={t('shopCatalog.deleteTitle')}
                    message={t('shopCatalog.deleteConfirm').replace('{name}', deleteTarget.name)}
                    confirmText={t('shopCatalog.delete')}
                    cancelText={t('common.cancel')}
                    type="danger"
                    onConfirm={() => void confirmDelete()}
                    onCancel={() => setDeleteTarget(null)}
                />
            )}
        </div>
    )
}

export default ShopCatalog
