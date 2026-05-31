import { createContext, useCallback, useEffect, useMemo, useState } from 'react'
import { useLocation } from 'react-router-dom'
import enTranslations from '../../../locales/en.json'
import viTranslations from '../../../locales/vi.json'
import { getLanguageFromPath } from './localePath'

const LANG_STORAGE_KEY = 'laundrygo_language'
const DEFAULT_LANGUAGE = 'en'

const translations = {
  en: enTranslations,
  vi: viTranslations,
}

export const TranslationContext = createContext(null)

export function TranslationProvider({ children }) {
  const location = useLocation()
  const [language, setLanguage] = useState(() => {
    const routeLanguage = typeof window !== 'undefined' ? getLanguageFromPath(window.location.pathname) : DEFAULT_LANGUAGE
    if (routeLanguage === 'vi') return routeLanguage

    try {
      const stored = localStorage.getItem(LANG_STORAGE_KEY)
      return stored === 'vi' ? 'vi' : 'en'
    } catch {
      return DEFAULT_LANGUAGE
    }
  })

  useEffect(() => {
    setLanguage(getLanguageFromPath(location.pathname))
  }, [location.pathname])

  useEffect(() => {
    try {
      localStorage.setItem(LANG_STORAGE_KEY, language)
    } catch (error) {
      console.error('Failed to save language preference:', error)
    }
  }, [language])

  const changeLanguage = useCallback((nextLanguage) => {
    if (nextLanguage === 'en' || nextLanguage === 'vi') {
      setLanguage(nextLanguage)
    }
  }, [])

  const t = useCallback(
    (key) => {
      const lookup = (source) => {
        const parts = key.split('.')
        let value = source

        for (const part of parts) {
          if (value && typeof value === 'object' && part in value) {
            value = value[part]
          } else {
            return undefined
          }
        }

        return value
      }

      return lookup(translations[language]) ?? lookup(translations.en) ?? key
    },
    [language]
  )

  const value = useMemo(
    () => ({
      language,
      changeLanguage,
      t,
      availableLanguages: ['en', 'vi'],
      languageNames: { en: 'English', vi: 'Tiếng Việt' },
    }),
    [changeLanguage, language, t]
  )

  return <TranslationContext.Provider value={value}>{children}</TranslationContext.Provider>
}