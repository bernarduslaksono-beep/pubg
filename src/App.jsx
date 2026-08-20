import { useEffect } from 'react'
import { Routes, Route, Link, useLocation } from 'react-router-dom'
import OrderPage from './pages/OrderPage.jsx'
import TrackPage from './pages/TrackPage.jsx'
import AdminPage from './pages/AdminPage.jsx'
import InstallPrompt from './components/InstallPrompt.jsx'
import ThemeToggle from './components/ThemeToggle.jsx'
import LanguageToggle from './components/LanguageToggle.jsx'
import { useLanguage } from './i18n/LanguageContext.jsx'
import logo from './assets/logo.png'

// Rota admin "sekretu" — la aparese iha menu públiku.
// Troka slug ne'e ba naran seluk se hakarak (dala ida de'it, hafoin fahe link ba ita boot rasik).
const ADMIN_PATH = '/painel-admin-x29k7'

function TopBar({ isAdminRoute }) {
  const location = useLocation()
  const { t } = useLanguage()
  const isActive = (path) => location.pathname === path

  return (
    <div className="topbar">
      <div className="brand">
        <img className="brand-logo" src={logo} alt="UC-PUBG Timor Leste" />
      </div>
      {!isAdminRoute && (
        <nav>
          <Link to="/"><button className={isActive('/') ? 'active' : ''}>{t('nav_order')}</button></Link>
          <Link to="/track"><button className={isActive('/track') ? 'active' : ''}>{t('nav_track')}</button></Link>
        </nav>
      )}
      <div className="topbar-controls">
        {!isAdminRoute && <LanguageToggle />}
        <ThemeToggle />
      </div>
    </div>
  )
}

export default function App() {
  const location = useLocation()
  const { t } = useLanguage()
  const isAdminRoute = location.pathname === ADMIN_PATH

  // Troka manifest PWA (no titulu) tuir pajina ne'ebe ita boot iha —
  // atu install ba HP husi pajina admin loke direta ba admin, la'os ba pajina cliente.
  useEffect(() => {
    const manifestLink = document.querySelector('link[rel="manifest"]')
    const appleTitle = document.querySelector('meta[name="apple-mobile-web-app-title"]')

    if (isAdminRoute) {
      if (manifestLink) manifestLink.setAttribute('href', '/manifest-admin.webmanifest')
      if (appleTitle) appleTitle.setAttribute('content', 'UC-PUBG Admin')
      document.title = 'UC-PUBG Admin'
    } else {
      if (manifestLink) manifestLink.setAttribute('href', '/manifest.webmanifest')
      if (appleTitle) appleTitle.setAttribute('content', 'UC-PUBG TL')
      document.title = 'UC-PUBG Timor Leste'
    }
  }, [isAdminRoute])

  return (
    <>
      <TopBar isAdminRoute={isAdminRoute} />
      <main>
        <Routes>
          <Route path="/" element={<OrderPage />} />
          <Route path="/track" element={<TrackPage />} />
          <Route path={ADMIN_PATH} element={<AdminPage />} />
        </Routes>
      </main>
      {!isAdminRoute && <footer>{t('footer_text')}</footer>}
      {!isAdminRoute && <InstallPrompt />}
    </>
  )
}
