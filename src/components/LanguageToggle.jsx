import { useLanguage } from '../i18n/LanguageContext.jsx'
import { LANGUAGES } from '../i18n/translations.js'

export default function LanguageToggle() {
  const { language, setLanguage } = useLanguage()

  return (
    <div className="lang-toggle">
      {LANGUAGES.map((l) => (
        <button
          key={l.code}
          className={language === l.code ? 'active' : ''}
          onClick={() => setLanguage(l.code)}
        >
          {l.label}
        </button>
      ))}
    </div>
  )
}
