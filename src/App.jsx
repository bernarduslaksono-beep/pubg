import { Routes, Route, Link, useLocation } from 'react-router-dom'
import OrderPage from './pages/OrderPage.jsx'
import TrackPage from './pages/TrackPage.jsx'
import AdminPage from './pages/AdminPage.jsx'
import InstallPrompt from './components/InstallPrompt.jsx'
import logo from './assets/logo.png'

// Rota admin "sekretu" — la aparese iha menu públiku.
// Troka slug ne'e ba naran seluk se hakarak (dala ida de'it, hafoin fahe link ba ita boot rasik).
const ADMIN_PATH = '/painel-admin-x29k7'

function TopBar({ isAdminRoute }) {
  const location = useLocation()
  const isActive = (path) => location.pathname === path

  return (
    <div className="topbar">
      <div className="brand">
        <img className="brand-logo" src={logo} alt="UC-PUBG Timor Leste" />
      </div>
      {!isAdminRoute && (
        <nav>
          <Link to="/"><button className={isActive('/') ? 'active' : ''}>Pesan UC</button></Link>
          <Link to="/track"><button className={isActive('/track') ? 'active' : ''}>Cek Status</button></Link>
        </nav>
      )}
    </div>
  )
}

export default function App() {
  const location = useLocation()
  const isAdminRoute = location.pathname === ADMIN_PATH

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
      {!isAdminRoute && <footer>Top Up UC PUBG · Dili, Timor-Leste</footer>}
      {!isAdminRoute && <InstallPrompt />}
    </>
  )
}
