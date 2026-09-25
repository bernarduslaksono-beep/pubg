import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { supabase } from '../supabase.js'
import { WHATSAPP_NUMBER } from '../data/packages.js'
import ThemeToggle from './ThemeToggle.jsx'
import LanguageToggle from './LanguageToggle.jsx'
import { useLanguage } from '../i18n/LanguageContext.jsx'

export default function Footer() {
  const { t } = useLanguage()
  const [visitorCount, setVisitorCount] = useState(null)

  useEffect(() => {
    let cancelled = false
    supabase.rpc('get_visitor_count').then(({ data, error }) => {
      if (!error && !cancelled) setVisitorCount(data)
    })
    return () => { cancelled = true }
  }, [])

  return (
    <footer className="site-footer">
      <div className="footer-grid">
        <div className="footer-col">
          <div className="footer-brand-text">{t('footer_text')}</div>
          <nav className="footer-nav-links" aria-label={t('footer_nav_label')}>
            <Link className="footer-about-link footer-nav-home" to="/">{t('nav_home')}</Link>
            <Link className="footer-about-link" to="/kona-ba-ami">{t('footer_about_label')}</Link>
          </nav>
        </div>

        <div className="footer-col">
          <div className="footer-col-title">{t('footer_contact_label')}</div>
          <a
            className="footer-whatsapp-text"
            href={`https://wa.me/670${WHATSAPP_NUMBER}`}
            target="_blank"
            rel="noopener noreferrer"
          >
            <span className="footer-whatsapp-prefix">{t('footer_whatsapp_prefix')}: </span><b>+670{WHATSAPP_NUMBER}</b>
          </a>
        </div>

        <div className="footer-col footer-col-end">
          <div className="footer-col-title">{t('footer_settings_label')}</div>
          <div className="footer-toggles">
            <LanguageToggle />
            <ThemeToggle />
          </div>
          {visitorCount !== null && (
            <div className="visitor-badge footer-visitor-badge">
              👁 {t('visitor_label')}: <b>{visitorCount.toLocaleString()}</b>
            </div>
          )}
        </div>
      </div>

      <div className="footer-copyright">Copyright © 2026 LojaGame, Timor-Leste</div>
    </footer>
  )
}
