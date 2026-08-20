import { useEffect, useState } from 'react'

function getInitialTheme() {
  const saved = localStorage.getItem('theme')
  if (saved === 'light' || saved === 'dark') return saved
  return 'light'
}

export default function ThemeToggle() {
  const [theme, setTheme] = useState(getInitialTheme)

  useEffect(() => {
    document.documentElement.setAttribute('data-theme', theme)
    localStorage.setItem('theme', theme)
  }, [theme])

  return (
    <div className="theme-toggle">
      <button
        className={theme === 'light' ? 'active' : ''}
        onClick={() => setTheme('light')}
        aria-label="Light mode"
        title="Light mode"
      >
        ☀️
      </button>
      <button
        className={theme === 'dark' ? 'active' : ''}
        onClick={() => setTheme('dark')}
        aria-label="Dark mode"
        title="Dark mode"
      >
        🌙
      </button>
    </div>
  )
}
