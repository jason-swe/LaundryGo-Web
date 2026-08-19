import { useEffect, useState } from 'react'
import { CheckCircle2, CircleAlert, Clock3, FileImage, Landmark, RefreshCw, Send, Upload, WalletCards, XCircle } from 'lucide-react'
import ConfirmDialog from '../../components/ConfirmDialog/ConfirmDialog'
import { useTranslation } from '../../shared/lib/i18n'
import { getShopStatement, getShopStatements, submitSettlement, uploadSettlementEvidence } from '../../services/settlementApi'
import './ShopSettlement.css'

const MAX_EVIDENCE_BYTES = 5 * 1024 * 1024

const asNumber = (value) => Number(value || 0)

function ShopSettlement() {
    const { language, t } = useTranslation()
    const [statements, setStatements] = useState([])
    const [selectedStatementId, setSelectedStatementId] = useState(null)
    const [selectedStatement, setSelectedStatement] = useState(null)
    const [isLoading, setIsLoading] = useState(true)
    const [isDetailLoading, setIsDetailLoading] = useState(false)
    const [loadError, setLoadError] = useState('')
    const [detailError, setDetailError] = useState('')
    const [reloadKey, setReloadKey] = useState(0)
    const [detailReloadKey, setDetailReloadKey] = useState(0)
    const [evidenceFile, setEvidenceFile] = useState(null)
    const [transactionReference, setTransactionReference] = useState('')
    const [payerBankName, setPayerBankName] = useState('')
    const [feedback, setFeedback] = useState('')
    const [isSubmitting, setIsSubmitting] = useState(false)
    const [confirmSubmit, setConfirmSubmit] = useState(false)

    useEffect(() => {
        let active = true
        setIsLoading(true)
        setLoadError('')

        getShopStatements()
            .then((items) => {
                if (!active) return
                setStatements(items)
                setSelectedStatementId((current) => (
                    items.some((item) => item.statementId === current) ? current : items[0]?.statementId || null
                ))
            })
            .catch((error) => {
                if (active) setLoadError(error?.message || t('shopSettlement.loadFailed'))
            })
            .finally(() => {
                if (active) setIsLoading(false)
            })

        return () => {
            active = false
        }
    }, [reloadKey, t])

    useEffect(() => {
        if (!selectedStatementId) {
            setSelectedStatement(null)
            setDetailError('')
            setIsDetailLoading(false)
            return
        }

        let active = true
        setIsDetailLoading(true)
        setDetailError('')
        setEvidenceFile(null)
        setTransactionReference('')
        setPayerBankName('')

        getShopStatement(selectedStatementId)
            .then((statement) => {
                if (active) setSelectedStatement(statement)
            })
            .catch((error) => {
                if (active) setDetailError(error?.message || t('shopSettlement.detailLoadFailed'))
            })
            .finally(() => {
                if (active) setIsDetailLoading(false)
            })

        return () => {
            active = false
        }
    }, [detailReloadKey, selectedStatementId, t])

    const formatMoney = (value) => new Intl.NumberFormat(language === 'vi' ? 'vi-VN' : 'en-US').format(asNumber(value))
    const formatDate = (value) => {
        if (!value) return t('shopSettlement.notAvailable')
        const date = new Date(value)
        if (Number.isNaN(date.getTime())) return value
        return new Intl.DateTimeFormat(language === 'vi' ? 'vi-VN' : 'en-US', { dateStyle: 'medium' }).format(date)
    }

    const selectedSettlement = selectedStatement?.latestSettlement
    const statementStatus = String(selectedStatement?.status || '').toUpperCase()
    const settlementStatus = String(selectedSettlement?.status || '').toUpperCase()
    const canSubmit = statementStatus === 'UNPAID' && (!settlementStatus || settlementStatus === 'REJECTED')
    const statusLabel = (status) => {
        const translated = t(`shopSettlement.status.${status}`)
        return translated.startsWith('shopSettlement.status.') ? status : translated
    }
    const selectEvidence = (file) => {
        if (!file) {
            setEvidenceFile(null)
            return
        }
        if (!file.type.startsWith('image/') || file.size > MAX_EVIDENCE_BYTES) {
            setEvidenceFile(null)
            setFeedback(t('shopSettlement.invalidEvidence'))
            return
        }
        setEvidenceFile(file)
        setFeedback('')
    }

    const handleSubmit = async () => {
        if (!selectedStatement || !evidenceFile || isSubmitting) return

        setConfirmSubmit(false)
        setIsSubmitting(true)
        setFeedback('')
        try {
            const proofImageUrl = await uploadSettlementEvidence(selectedStatement.statementId, evidenceFile)
            await submitSettlement(selectedStatement.statementId, {
                amount: selectedStatement.netCommissionAmount,
                transactionReference,
                payerBankName,
                proofImageUrl,
            })
            setEvidenceFile(null)
            setTransactionReference('')
            setPayerBankName('')
            setFeedback(t('shopSettlement.submitSuccess'))
            setReloadKey((value) => value + 1)
            setDetailReloadKey((value) => value + 1)
        } catch (error) {
            setFeedback(error?.message || t('shopSettlement.submitFailed'))
        } finally {
            setIsSubmitting(false)
        }
    }

    return (
        <div className="shop-settlement-page">
            <header className="shop-settlement-header">
                <div>
                    <span className="shop-settlement-eyebrow">{t('shopSettlement.eyebrow')}</span>
                    <h1>{t('shopSettlement.title')}</h1>
                    <p>{t('shopSettlement.subtitle')}</p>
                </div>
                <button className="shop-settlement-secondary-btn" type="button" onClick={() => setReloadKey((value) => value + 1)} disabled={isLoading}>
                    <RefreshCw size={16} strokeWidth={1.9} />
                    {t('shopSettlement.refresh')}
                </button>
            </header>

            {loadError && (
                <section className="shop-settlement-state error">
                    <CircleAlert size={19} />
                    <span>{loadError}</span>
                    <button type="button" onClick={() => setReloadKey((value) => value + 1)}>{t('shopSettlement.retry')}</button>
                </section>
            )}

            {!loadError && isLoading && (
                <section className="shop-settlement-state"><Clock3 size={19} />{t('shopSettlement.loading')}</section>
            )}

            {!loadError && !isLoading && statements.length === 0 && (
                <section className="shop-settlement-empty">
                    <WalletCards size={32} strokeWidth={1.7} />
                    <strong>{t('shopSettlement.emptyTitle')}</strong>
                    <p>{t('shopSettlement.emptyHint')}</p>
                </section>
            )}

            {!loadError && !isLoading && statements.length > 0 && (
                <section className="shop-settlement-workspace">
                    <div className="shop-settlement-list-card">
                        <div className="shop-settlement-list-head">
                            <div>
                                <h2>{t('shopSettlement.statements')}</h2>
                                <p>{t('shopSettlement.statementCount').replace('{count}', statements.length)}</p>
                            </div>
                        </div>
                        <div className="shop-settlement-list">
                            {statements.map((statement) => {
                                const isSelected = statement.statementId === selectedStatementId
                                return (
                                    <button
                                        className={`shop-settlement-row${isSelected ? ' active' : ''}`}
                                        type="button"
                                        key={statement.statementId}
                                        onClick={() => {
                                            setFeedback('')
                                            setSelectedStatementId(statement.statementId)
                                        }}
                                    >
                                        <span className="shop-settlement-row-icon"><Landmark size={18} strokeWidth={1.8} /></span>
                                        <span className="shop-settlement-row-main">
                                            <strong>{statement.statementCode || `#${statement.statementId}`}</strong>
                                            <small>{formatDate(statement.periodStart)} — {formatDate(statement.periodEnd)}</small>
                                        </span>
                                        <span className="shop-settlement-row-amount">
                                            {formatMoney(statement.netCommissionAmount)} VND
                                            <em className={`shop-settlement-status ${String(statement.status || '').toLowerCase()}`}>{statusLabel(statement.status)}</em>
                                        </span>
                                    </button>
                                )
                            })}
                        </div>
                    </div>

                    <aside className="shop-settlement-detail-card">
                        {isDetailLoading && <div className="shop-settlement-detail-state"><Clock3 size={19} />{t('shopSettlement.loadingDetail')}</div>}
                        {!isDetailLoading && detailError && (
                            <div className="shop-settlement-detail-state error">
                                <CircleAlert size={19} />
                                <span>{detailError}</span>
                                <button type="button" onClick={() => setDetailReloadKey((value) => value + 1)}>{t('shopSettlement.retry')}</button>
                            </div>
                        )}
                        {!isDetailLoading && !detailError && selectedStatement && (
                            <>
                                <div className="shop-settlement-detail-head">
                                    <div>
                                        <span className="shop-settlement-eyebrow">{t('shopSettlement.statementDetail')}</span>
                                        <h2>{selectedStatement.statementCode || `#${selectedStatement.statementId}`}</h2>
                                        <p>{formatDate(selectedStatement.periodStart)} — {formatDate(selectedStatement.periodEnd)}</p>
                                    </div>
                                    <span className={`shop-settlement-status ${statementStatus.toLowerCase()}`}>{statusLabel(statementStatus)}</span>
                                </div>

                                <dl className="shop-settlement-breakdown">
                                    <div><dt>{t('shopSettlement.totalOrders')}</dt><dd>{selectedStatement.totalOrders ?? 0}</dd></div>
                                    <div><dt>{t('shopSettlement.grossAmount')}</dt><dd>{formatMoney(selectedStatement.grossAmount)} VND</dd></div>
                                    <div><dt>{t('shopSettlement.commissionAmount')}</dt><dd>{formatMoney(selectedStatement.commissionAmount)} VND</dd></div>
                                    <div><dt>{t('shopSettlement.platformSubsidy')}</dt><dd>{formatMoney(selectedStatement.platformSubsidyAmount)} VND</dd></div>
                                    <div className="net"><dt>{t('shopSettlement.netCommission')}</dt><dd>{formatMoney(selectedStatement.netCommissionAmount)} VND</dd></div>
                                    <div><dt>{t('shopSettlement.dueDate')}</dt><dd>{formatDate(selectedStatement.dueDate)}</dd></div>
                                </dl>

                                {selectedSettlement && (
                                    <section className="shop-settlement-submission">
                                        <div className="shop-settlement-submission-head">
                                            {settlementStatus === 'CONFIRMED' ? <CheckCircle2 size={17} /> : settlementStatus === 'REJECTED' ? <XCircle size={17} /> : <Clock3 size={17} />}
                                            <div>
                                                <strong>{t('shopSettlement.latestSubmission')}</strong>
                                                <span>{statusLabel(settlementStatus)}</span>
                                            </div>
                                        </div>
                                        <dl>
                                            <div><dt>{t('shopSettlement.amount')}</dt><dd>{formatMoney(selectedSettlement.amount)} VND</dd></div>
                                            {selectedSettlement.transactionReference && <div><dt>{t('shopSettlement.transactionReference')}</dt><dd>{selectedSettlement.transactionReference}</dd></div>}
                                            {selectedSettlement.payerBankName && <div><dt>{t('shopSettlement.payerBank')}</dt><dd>{selectedSettlement.payerBankName}</dd></div>}
                                            {selectedSettlement.submittedAt && <div><dt>{t('shopSettlement.submittedAt')}</dt><dd>{formatDate(selectedSettlement.submittedAt)}</dd></div>}
                                        </dl>
                                        {selectedSettlement.proofImageUrl && <a href={selectedSettlement.proofImageUrl} target="_blank" rel="noreferrer">{t('shopSettlement.openEvidence')}</a>}
                                    </section>
                                )}

                                {canSubmit && (
                                    <section className="shop-settlement-form">
                                        <div className="shop-settlement-form-intro">
                                            <Upload size={18} strokeWidth={1.8} />
                                            <div><strong>{t('shopSettlement.submitTitle')}</strong><p>{t('shopSettlement.submitHint')}</p></div>
                                        </div>
                                        <label><span>{t('shopSettlement.amount')}</span><input value={`${formatMoney(selectedStatement.netCommissionAmount)} VND`} readOnly /></label>
                                        <label><span>{t('shopSettlement.transactionReferenceOptional')}</span><input value={transactionReference} onChange={(event) => setTransactionReference(event.target.value)} disabled={isSubmitting} /></label>
                                        <label><span>{t('shopSettlement.payerBankOptional')}</span><input value={payerBankName} onChange={(event) => setPayerBankName(event.target.value)} disabled={isSubmitting} /></label>
                                        <label className="shop-settlement-evidence-picker"><span>{t('shopSettlement.evidence')} *</span><input type="file" accept="image/*" onChange={(event) => selectEvidence(event.target.files?.[0])} disabled={isSubmitting} /><b><FileImage size={16} />{evidenceFile?.name || t('shopSettlement.chooseEvidence')}</b></label>
                                        {feedback && <p className="shop-settlement-feedback">{feedback}</p>}
                                        <button className="shop-settlement-primary-btn" type="button" onClick={() => setConfirmSubmit(true)} disabled={!evidenceFile || isSubmitting}>
                                            <Send size={16} strokeWidth={1.9} />{isSubmitting ? t('shopSettlement.submitting') : t('shopSettlement.submit')}
                                        </button>
                                    </section>
                                )}
                                {!canSubmit && feedback && <p className="shop-settlement-feedback">{feedback}</p>}
                            </>
                        )}
                    </aside>
                </section>
            )}

            {confirmSubmit && (
                <ConfirmDialog
                    title={t('shopSettlement.confirmTitle')}
                    message={t('shopSettlement.confirmMessage').replace('{amount}', `${formatMoney(selectedStatement?.netCommissionAmount)} VND`)}
                    confirmText={t('shopSettlement.submit')}
                    cancelText={t('common.cancel')}
                    type="info"
                    onConfirm={handleSubmit}
                    onCancel={() => setConfirmSubmit(false)}
                />
            )}
        </div>
    )
}

export default ShopSettlement
