import { useNavigate } from 'react-router-dom'
import { useTranslation, localizePath } from '../shared/lib/i18n'
import LanguageSwitcher from '../shared/ui/LanguageSwitcher/LanguageSwitcher'
import '../LandingPage/LandingPage.css'
import './UserSettings.css'

function UserSettings() {
    const navigate = useNavigate()
    const { language, t } = useTranslation()
    const navigateLocalized = (path) => navigate(localizePath(path, language))

    return (
        <div className="user-settings-page">
            <header className="user-settings-topbar">
                <div className="user-settings-topbar-inner">
                    <div className="logo" onClick={() => navigateLocalized('/')} style={{ cursor: 'pointer' }}>
                        <span className="logo-text">
                            Laundry<span>Go</span>
                        </span>
                        <span className="logo-bubbles">
                            <span className="bubble bubble-lg" />
                            <span className="bubble bubble-md" />
                            <span className="bubble bubble-sm" />
                        </span>
                    </div>

                    <button className="back-allshops-btn" onClick={() => navigateLocalized('/all-shops')}>
                        {t('common.back')} {t('nav.allShops')}
                    </button>
                </div>
            </header>

            <main className="user-settings-main">
                <section className="user-settings-card">
                    <h1>{t('profile.settings')}</h1>

                    <div className="user-settings-row">
                        <div className="user-settings-label">{t('profile.language')}</div>
                        <LanguageSwitcher />
                    </div>
                </section>
            </main>
        </div>
    )
}

export default UserSettings
