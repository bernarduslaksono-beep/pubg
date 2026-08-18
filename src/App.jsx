import { Routes, Route, Link, useLocation } from 'react-router-dom'
import OrderPage from './pages/OrderPage.jsx'
import TrackPage from './pages/TrackPage.jsx'
import AdminPage from './pages/AdminPage.jsx'
import logo from './assets/logo.png'

function TopBar() {
  const location = useLocation()
  const isActive = (path) => location.pathname === path

  return (
    <div className="topbar">
      <div className="brand">
        <img className="brand-logo" src={logo} alt="UC-PUBG Timor Leste" />
      </div>
      <nav>
        <Link to="/"><button className={isActive('/') ? 'active' : ''}>Pesan UC</button></Link>
        <Link to="/track"><button className={isActive('/track') ? 'active' : ''}>Cek Status</button></Link>
        <Link to="/admin"><button className={isActive('/admin') ? 'active' : ''}>Admin</button></Link>
      </nav>
    </div>
  )
}

export default function App() {
  return (
    <>
      <TopBar />
      <main>
        <Routes>
          <Route path="/" element={<OrderPage />} />
          <Route path="/track" element={<TrackPage />} />
          <Route path="/admin" element={<AdminPage />} />
        </Routes>
      </main>
      <footer>Top Up UC PUBG · Dili, Timor-Leste</footer>
    </>
  )
}
