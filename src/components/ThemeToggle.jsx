import { useEffect, useState } from 'react'
import { useLanguage } from '../i18n/LanguageContext.jsx'

// Nota: la konfia de'it iha localStorage['theme'] — ida ne'e de'it guarda
// bainhira user beibeik klik tombu (haree flag 'theme_user_set'). Se la iha
// eskolla konsiente, default sai Dark.
function getInitialTheme() {
  const userSet = localStorage.getItem('theme_user_set') === '1'
  const saved = localStorage.getItem('theme')
  if (userSet && (saved === 'light' || saved === 'dark')) return saved
  return 'dark'
}

export default function ThemeToggle() {
  const { t } = useLanguage()
  const [theme, setTheme] = useState(getInitialTheme)

  useEffect(() => {
    document.documentElement.setAttribute('data-theme', theme)
  }, [theme])

  const choose = (value) => {
    setTheme(value)
    try {
      localStorage.setItem('theme', value)
      localStorage.setItem('theme_user_set', '1')
    } catch {
      /* ignora se localStorage la disponivel */
    }
  }

  return (
    <div className="theme-toggle">
      <button
        className={theme === 'light' ? 'active' : ''}
        onClick={() => choose('light')}
        aria-label={t('theme_light_label')}
        aria-pressed={theme === 'light'}
        title={t('theme_light_label')}
      >
        <span aria-hidden="true">☀️</span>
      </button>
      <button
        className={theme === 'dark' ? 'active' : ''}
        onClick={() => choose('dark')}
        aria-label={t('theme_dark_label')}
        aria-pressed={theme === 'dark'}
        title={t('theme_dark_label')}
      >
        <span aria-hidden="true">🌙</span>
      </button>
    </div>
  )
}
