import { useEffect } from 'react'
import { Routes, Route, Link, useLocation, useParams } from 'react-router-dom'
import PortalPage from './pages/PortalPage.jsx'
import OrderPage from './pages/OrderPage.jsx'
import TrackPage from './pages/TrackPage.jsx'
import AdminPage from './pages/AdminPage.jsx'
import InstallPrompt from './components/InstallPrompt.jsx'
import Footer from './components/Footer.jsx'
import ThemeToggle from './components/ThemeToggle.jsx'
import TimorLesteFlag from './components/TimorLesteFlag.jsx'
import ScrollToTopButton from './components/ScrollToTopButton.jsx'
import { useLanguage } from './i18n/LanguageContext.jsx'
import { GAMES } from './data/games.js'
import logo from './assets/logo-lojagame.png'

// Rota admin "sekretu" — la aparese iha menu públiku.
// Troka slug ne'e ba naran seluk se hakarak (dala ida de'it, hafoin fahe link ba ita boot rasik).
const ADMIN_PATH = '/painel-admin-x29k7'

function TopBar({ gameKey, showAdminTheme }) {
  const location = useLocation()
  const { t } = useLanguage()
  const isActive = (path) => location.pathname === path

  return (
    <div className="topbar">
      <Link to="/" className="topbar-brand-row">
        <img className="brand-logo" src={logo} alt="Loja-Game Timor Leste" />
        <TimorLesteFlag />
        <span className="topbar-tagline">{t('portal_desc')}</span>
      </Link>
      {gameKey && (
        <nav className="topbar-nav-right">
          <Link to={`/${gameKey}`}><button className={isActive(`/${gameKey}`) ? 'active' : ''}>{t('nav_order')}</button></Link>
          <Link to={`/${gameKey}/track`}><button className={isActive(`/${gameKey}/track`) ? 'active' : ''}>{t('nav_track')}</button></Link>
        </nav>
      )}
      {showAdminTheme && (
        <div className="topbar-controls">
          <ThemeToggle />
        </div>
      )}
    </div>
  )
}

function GameRouteShell({ children }) {
  const { gameKey } = useParams()
  const validGame = Boolean(GAMES[gameKey])
  return (
    <>
      <TopBar gameKey={validGame ? gameKey : null} />
      <main>{children}</main>
      <Footer />
      <InstallPrompt />
      <ScrollToTopButton />
    </>
  )
}

export default function App() {
  const location = useLocation()
  const isAdminRoute = location.pathname === ADMIN_PATH
  const isPortalRoute = location.pathname === '/'

  // Troka manifest PWA (no titulu) tuir pajina ne'ebe ita boot iha —
  // atu install ba HP husi pajina admin loke direta ba admin, la'os ba pajina cliente.
  useEffect(() => {
    const manifestLink = document.querySelector('link[rel="manifest"]')
    const appleTitle = document.querySelector('meta[name="apple-mobile-web-app-title"]')

    if (isAdminRoute) {
      if (manifestLink) manifestLink.setAttribute('href', '/manifest-admin.webmanifest')
      if (appleTitle) appleTitle.setAttribute('content', 'Loja-Game Admin')
      document.title = 'Loja-Game Admin'
    } else {
      if (manifestLink) manifestLink.setAttribute('href', '/manifest.webmanifest')
      if (appleTitle) appleTitle.setAttribute('content', 'Loja-Game TL')
      document.title = 'Loja-Game Timor Leste'
    }
  }, [isAdminRoute])

  if (isAdminRoute) {
    return (
      <>
        <TopBar gameKey={null} showAdminTheme />
        <main>
          <AdminPage />
        </main>
        <ScrollToTopButton />
      </>
    )
  }

  if (isPortalRoute) {
    return (
      <>
        <TopBar gameKey={null} />
        <main>
          <PortalPage />
        </main>
        <Footer />
        <InstallPrompt />
        <ScrollToTopButton />
      </>
    )
  }

  return (
    <Routes>
      <Route path="/:gameKey" element={<GameRouteShell><OrderPage /></GameRouteShell>} />
      <Route path="/:gameKey/track" element={<GameRouteShell><TrackPage /></GameRouteShell>} />
    </Routes>
  )
}
