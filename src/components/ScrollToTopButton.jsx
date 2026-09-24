import { useEffect, useState } from 'react'
import { useLanguage } from '../i18n/LanguageContext.jsx'
import { motionSafeScrollBehavior } from '../lib/motion.js'

export default function ScrollToTopButton() {
  const { t } = useLanguage()
  const [visible, setVisible] = useState(false)

  useEffect(() => {
    const handleScroll = () => {
      const nearBottom =
        window.innerHeight + window.scrollY >= document.documentElement.scrollHeight - 60
      setVisible(nearBottom)
    }
    window.addEventListener('scroll', handleScroll, { passive: true })
    handleScroll()
    return () => window.removeEventListener('scroll', handleScroll)
  }, [])

  if (!visible) return null

  const handleClick = () => {
    window.scrollTo({ top: 0, behavior: motionSafeScrollBehavior() })
  }

  return (
    <button
      className="scroll-top-btn"
      onClick={handleClick}
      aria-label={t('scroll_to_top_label')}
      title={t('scroll_to_top_label')}
    >
      <span aria-hidden="true">↑</span>
    </button>
  )
}
