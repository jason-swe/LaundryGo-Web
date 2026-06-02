import { useLocation, useNavigate } from 'react-router-dom'
import { useTranslation, localizePath } from '../../lib/i18n'
import './LanguageSwitcher.css'

function LanguageSwitcher() {
  const { language, changeLanguage, languageNames } = useTranslation()
  const location = useLocation()
  const navigate = useNavigate()
  const languages = Object.entries(languageNames)
  const activeIndex = Math.max(0, languages.findIndex(([lang]) => lang === language))

  const handleLanguageChange = (nextLanguage) => {
    if (nextLanguage === language) return
    changeLanguage(nextLanguage)
    navigate(`${localizePath(location.pathname, nextLanguage)}${location.search}${location.hash}`)
  }

  return (
    <div
      className="language-switcher"
      aria-label="Language switcher"
      style={{
        '--language-active-index': activeIndex,
        '--language-count': languages.length,
      }}
    >
      <span className="language-switcher-thumb" aria-hidden="true" />
      {languages.map(([lang, label]) => (
        <button
          key={lang}
          type="button"
          className={`language-switcher-button ${language === lang ? 'language-switcher-button-active' : ''}`}
          onClick={() => handleLanguageChange(lang)}
          aria-pressed={language === lang}
          title={label}
        >
          {lang.toUpperCase()}
          <span className="language-switcher-label">{label}</span>
        </button>
      ))}
    </div>
  )
}

export default LanguageSwitcher
