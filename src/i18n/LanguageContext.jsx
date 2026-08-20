import { createContext, useContext, useEffect, useState } from 'react'
import { TRANSLATIONS, DEFAULT_LANGUAGE } from './translations.js'

const LanguageContext = createContext(null)

function getInitialLanguage() {
  const saved = localStorage.getItem('language')
  if (saved && TRANSLATIONS[saved]) return saved
  return DEFAULT_LANGUAGE
}

export function LanguageProvider({ children }) {
  const [language, setLanguage] = useState(getInitialLanguage)

  useEffect(() => {
    localStorage.setItem('language', language)
  }, [language])

  const t = (key, ...args) => {
    const dict = TRANSLATIONS[language] || TRANSLATIONS[DEFAULT_LANGUAGE]
    const value = dict[key] ?? TRANSLATIONS[DEFAULT_LANGUAGE][key] ?? key
    return typeof value === 'function' ? value(...args) : value
  }

  const statusLabel = (statusKey) => {
    const dict = TRANSLATIONS[language] || TRANSLATIONS[DEFAULT_LANGUAGE]
    return dict.status?.[statusKey] ?? TRANSLATIONS[DEFAULT_LANGUAGE].status[statusKey] ?? statusKey
  }

  return (
    <LanguageContext.Provider value={{ language, setLanguage, t, statusLabel }}>
      {children}
    </LanguageContext.Provider>
  )
}

export function useLanguage() {
  const ctx = useContext(LanguageContext)
  if (!ctx) throw new Error('useLanguage must be used within a LanguageProvider')
  return ctx
}
