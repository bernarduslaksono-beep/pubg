import { useEffect, useState } from 'react'

// Nota: la konfia de'it iha localStorage['theme'] — tanba versaun kódigu tuan
// automátikamente guarda "light" ba kada vizitante (efeitu la intensaun, la'os
// eskolla konsiente user nian). Ida ne'e halo user "tuan" hotu-hotu hein iha
// light mode maski Dark ona sai default agora. Tenki verifika mos flag
// 'theme_user_set' — de'it kuandu ida ne'e '1' ita konfia ba estadu ne'ebe guarda.
function getInitialTheme() {
  const userSet = localStorage.getItem('theme_user_set') === '1'
  const saved = localStorage.getItem('theme')
  if (userSet && (saved === 'light' || saved === 'dark')) return saved
  return 'dark'
}

export default function ThemeToggle() {
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
        aria-label="Light mode"
        title="Light mode"
      >
        ☀️
      </button>
      <button
        className={theme === 'dark' ? 'active' : ''}
        onClick={() => choose('dark')}
        aria-label="Dark mode"
        title="Dark mode"
      >
        🌙
      </button>
    </div>
  )
}
