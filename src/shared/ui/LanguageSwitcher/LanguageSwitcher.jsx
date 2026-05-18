import { useLocation, useNavigate } from 'react-router-dom'
import { useTranslation } from '../../lib/i18n'
import { localizePath } from '../../lib/i18n/localePath'
import './LanguageSwitcher.css'

function LanguageSwitcher() {
    const { language, changeLanguage, languageNames } = useTranslation()
    const location = useLocation()
    const navigate = useNavigate()

    const handleLanguageChange = (lang) => {
        changeLanguage(lang)
        navigate(`${localizePath(location.pathname, lang)}${location.search}${location.hash}`)
    }

    return (
        <div className="language-switcher">
            {Object.entries(languageNames).map(([lang, name]) => (
                <button
                    key={lang}
                    className={`lang-btn ${language === lang ? 'lang-btn-active' : ''}`}
                    onClick={() => handleLanguageChange(lang)}
                    title={language === 'vi' ? `Chuyển sang ${name}` : `Switch to ${name}`}
                >
                    {lang.toUpperCase()}
                </button>
            ))}
        </div>
    )
}

export default LanguageSwitcher
