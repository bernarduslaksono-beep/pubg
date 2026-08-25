import { useEffect, useState } from 'react'

// Nota: la konfia de'it iha localStorage['theme'] — ida ne'e de'it guarda
// bainhira user beibeik klik tombu (haree flag 'theme_user_set'). Se la iha
// eskolla konsiente, default sai Light.
function getInitialTheme() {
  const userSet = localStorage.getItem('theme_user_set') === '1'
  const saved = localStorage.getItem('theme')
  if (userSet && (saved === 'light' || saved === 'dark')) return saved
  return 'light'
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
