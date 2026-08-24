import { useLanguage } from '../i18n/LanguageContext.jsx'

const FACEBOOK_ALBUM_URL = 'https://www.facebook.com/fotosukasukakamu/photos'

export default function AboutPage() {
  const { t } = useLanguage()
  const paragraphs = t('about_paragraphs')

  return (
    <div className="about-page">
      <div className="hero">
        <div className="eyebrow"><span className="dot"></span> {t('about_title')}</div>
        <h1>{t('about_title')}</h1>
      </div>

      <div className="about-content">
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
    </div>
  )
}
