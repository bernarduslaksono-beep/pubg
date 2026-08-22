import { useEffect, useState } from 'react'
import { supabase } from '../supabase.js'

export default function StoreHoursControl() {
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [isOpen, setIsOpen] = useState(true)
  const [openTime, setOpenTime] = useState('08:00')
  const [closeTime, setCloseTime] = useState('23:00')
  const [override, setOverride] = useState(null) // null | 'open' | 'closed'
  const [collapsed, setCollapsed] = useState(true)

  const loadStatus = async () => {
    const { data, error } = await supabase.rpc('get_store_status')
    if (!error && data && data.length > 0) {
      setIsOpen(data[0].is_open)
      setOpenTime((data[0].open_time || '08:00').slice(0, 5))
      setCloseTime((data[0].close_time || '23:00').slice(0, 5))
      setOverride(data[0].manual_override)
    }
    setLoading(false)
  }

  useEffect(() => {
    loadStatus()
  }, [])

  const saveSchedule = async () => {
    setSaving(true)
    const { error } = await supabase
      .from('store_settings')
      .update({ open_time: openTime, close_time: closeTime })
      .eq('id', 1)
    setSaving(false)
    if (error) {
      alert('Falha atu guarda horáriu.')
      return
    }
    loadStatus()
  }

  const setOverrideValue = async (value) => {
    setSaving(true)
    const { error } = await supabase
      .from('store_settings')
      .update({ manual_override: value })
      .eq('id', 1)
    setSaving(false)
    if (error) {
      alert('Falha atu troka estadu loja.')
      return
    }
    loadStatus()
  }

  if (loading) return null

  return (
    <div className="store-hours-card">
      <div className="store-hours-head store-hours-head-toggle" onClick={() => setCollapsed((c) => !c)}>
        <div>
          <div className="store-hours-title">Oras Operasaun Loja</div>
          <div className={`store-status-pill${isOpen ? ' open' : ' closed'}`}>
            <span className="dot"></span>{isOpen ? 'Aberta' : 'Taka'}
          </div>
        </div>
        <span className={`store-hours-chevron${collapsed ? '' : ' open'}`}>▾</span>
      </div>

      {!collapsed && (
        <>
          <div className="store-hours-fields">
            <div className="field">
              <label>Oras Loke</label>
              <input type="time" value={openTime} onChange={(e) => setOpenTime(e.target.value)} />
            </div>
            <div className="field">
              <label>Oras Taka</label>
              <input type="time" value={closeTime} onChange={(e) => setCloseTime(e.target.value)} />
            </div>
            <button className="btn btn-ghost btn-small" onClick={saveSchedule} disabled={saving}>
              {saving ? 'Haruka...' : 'Guarda Horáriu'}
            </button>
          </div>

          <div className="store-hours-override">
            <div className="field-hint" style={{ marginBottom: 8 }}>
              Override manual (la tuir horáriu automátiku to'o ita boot troka fila fali):
            </div>
            <div className="store-override-buttons">
              <button
                className={`override-btn${override === null ? ' active' : ''}`}
                onClick={() => setOverrideValue(null)}
                disabled={saving}
              >
                Automátiku
              </button>
              <button
                className={`override-btn success${override === 'open' ? ' active' : ''}`}
                onClick={() => setOverrideValue('open')}
                disabled={saving}
              >
                Loke Agora
              </button>
              <button
                className={`override-btn danger${override === 'closed' ? ' active' : ''}`}
                onClick={() => setOverrideValue('closed')}
                disabled={saving}
              >
                Taka Agora
              </button>
            </div>
          </div>
        </>
      )}
    </div>
  )
}
