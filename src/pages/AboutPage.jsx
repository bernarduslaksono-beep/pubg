import { Link } from 'react-router-dom'
import { useLanguage } from '../i18n/LanguageContext.jsx'
import { WHATSAPP_NUMBER } from '../data/packages.js'

const FACEBOOK_ALBUM_URL = 'https://www.facebook.com/fotosukasukakamu/photos'

export default function AboutPage() {
  const { t } = useLanguage()
  const paragraphs = t('about_paragraphs')

  return (
    <div className="about-page">
      <div className="hero">
        <div className="eyebrow"><span className="dot"></span> {t('portal_desc')}</div>
        <h1>{t('about_title')}</h1>
      </div>

      {/* OUR STORY — the real, existing content that explains what this platform
          is and where it came from. This is the only place that content lives,
          so it stays the primary focus of the page. */}
      <div className="about-content">
        <h2 className="about-section-title">{t('about_story_title')}</h2>
        {Array.isArray(paragraphs) && paragraphs.map((p, i) => (
          <p key={i}>{p}</p>
        ))}

        <a
          className="about-facebook-link"
          href={FACEBOOK_ALBUM_URL}
          target="_blank"
          rel="noopener noreferrer"
        >
          {t('about_facebook_label')}
        </a>
      </div>

      {/* HOW IT WORKS — reuses the exact step1-4 terminology already used on
          the Order page and Portal, so About/Portal/Order feel like one
          product instead of inventing a new process description. */}
      <div className="about-content about-section">
        <h2 className="about-section-title">{t('how_it_works_title')}</h2>
        <ol className="how-it-works">
          <li className="how-step"><span className="how-step-num">01</span><span className="how-step-label">{t('step1')}</span></li>
          <li className="how-step"><span className="how-step-num">02</span><span className="how-step-label">{t('step2')}</span></li>
          <li className="how-step"><span className="how-step-num">03</span><span className="how-step-label">{t('step3')}</span></li>
          <li className="how-step"><span className="how-step-num">04</span><span className="how-step-label">{t('step4')}</span></li>
        </ol>
      </div>

      {/* NEED HELP — the same WhatsApp contact used everywhere else in the app
          (Footer, OrderPage, TrackPage), just given proper context here. */}
      <div className="about-content about-section">
        <div className="about-support-card">
          <h2 className="about-section-title" style={{ marginBottom: 6 }}>{t('about_need_help_title')}</h2>
          <p className="about-support-desc">{t('about_need_help_desc')}</p>
          <a
            className="btn btn-primary about-support-cta"
            href={`https://wa.me/670${WHATSAPP_NUMBER}`}
            target="_blank"
            rel="noopener noreferrer"
          >
            {t('track_contact_whatsapp_btn')}
          </a>
        </div>
      </div>

      {/* RETURN TO THE JOURNEY — the only real entry point into game selection
          is the Portal ("/"); there is no route-less Track Order, so we only
          link to routes that actually exist. */}
      <div className="about-content about-section about-cta-row">
        <Link className="btn btn-primary" to="/">{t('portal_title')}</Link>
      </div>
    </div>
  )
}
