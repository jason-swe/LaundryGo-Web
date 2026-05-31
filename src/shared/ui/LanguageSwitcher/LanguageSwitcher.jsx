import { useLocation, useNavigate } from 'react-router-dom'
import { useTranslation, localizePath } from '../../lib/i18n'
import './LanguageSwitcher.css'

function LanguageSwitcher() {
  const { language, changeLanguage, languageNames } = useTranslation()
  const location = useLocation()
  const navigate = useNavigate()

  const handleLanguageChange = (nextLanguage) => {
    changeLanguage(nextLanguage)
    navigate(`${localizePath(location.pathname, nextLanguage)}${location.search}${location.hash}`)
  }

  return (
    <div className="language-switcher" aria-label="Language switcher">
      {Object.entries(languageNames).map(([lang, label]) => (
        <button
          key={lang}
          type="button"
          className={`language-switcher-button ${language === lang ? 'language-switcher-button-active' : ''}`}
          onClick={() => handleLanguageChange(lang)}
        >
          {lang.toUpperCase()}
          <span className="language-switcher-label">{label}</span>
        </button>
      ))}
    </div>
  )
}

export default LanguageSwitcher