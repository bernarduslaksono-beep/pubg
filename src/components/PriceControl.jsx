import { useEffect, useState } from 'react'
import { supabase } from '../supabase.js'
import { GAMES } from '../data/games.js'

const GAME_TABS = Object.values(GAMES)

export default function PriceControl() {
  const [activeGame, setActiveGame] = useState(GAME_TABS[0]?.key)
  const [overrides, setOverrides] = useState({})
  const [drafts, setDrafts] = useState({})
  const [loading, setLoading] = useState(true)
  const [savingAmount, setSavingAmount] = useState(null)

  const loadOverrides = async (gameKey) => {
    setLoading(true)
    const { data, error } = await supabase.from('package_prices').select('amount, price').eq('game', gameKey)
    if (!error && data) {
      const map = {}
      data.forEach((row) => { map[row.amount] = Number(row.price) })
      setOverrides(map)
      setDrafts(map)
    }
    setLoading(false)
  }

  useEffect(() => {
    loadOverrides(activeGame)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [activeGame])

  const handleDraftChange = (amount, value) => {
    setDrafts((prev) => ({ ...prev, [amount]: value }))
  }

  const handleSave = async (amount, defaultPrice) => {
    const raw = drafts[amount]
    const value = raw === '' || raw === undefined ? null : Number(raw)
    if (value !== null && (Number.isNaN(value) || value <= 0)) {
      alert('Presu tenki numeru pozitivu.')
      return
    }
    setSavingAmount(amount)
    try {
      if (value === null || value === defaultPrice) {
        // fila fali ba presu default — hasai override
        const { error } = await supabase.from('package_prices').delete().eq('game', activeGame).eq('amount', amount)
        if (error) throw error
      } else {
        const { error } = await supabase
          .from('package_prices')
          .upsert({ game: activeGame, amount, price: value }, { onConflict: 'game,amount' })
        if (error) throw error
      }
      loadOverrides(activeGame)
    } catch (err) {
      console.error(err)
      alert('Falha atu guarda presu.')
    } finally {
      setSavingAmount(null)
    }
  }

  const handleReset = async (amount) => {
    setSavingAmount(amount)
    try {
      const { error } = await supabase.from('package_prices').delete().eq('game', activeGame).eq('amount', amount)
      if (error) throw error
      loadOverrides(activeGame)
    } catch (err) {
      console.error(err)
      alert('Falha atu hasai override.')
    } finally {
      setSavingAmount(null)
    }
  }

  const activeGameConfig = GAMES[activeGame]

  return (
    <div>
      <div className="stock-game-tabs">
        {GAME_TABS.map((g) => (
          <button
            key={g.key}
            className={activeGame === g.key ? 'active' : ''}
            onClick={() => setActiveGame(g.key)}
          >
            {g.name}
          </button>
        ))}
      </div>

      {loading ? (
        <div className="field-hint">Buka...</div>
      ) : (
        activeGameConfig.tiers.map((tier) => (
          <div key={tier.tierKey} className="stock-tier-block">
            <div className="stock-tier-title">{tier.tierKey === 'kiik' ? "Pakote Ki'ik" : tier.tierKey === 'medium' ? 'Pakote Medium' : "Pakote Bo'ot"}</div>
            <div className="price-item-list">
              {tier.items.map((item) => {
                const isOverridden = overrides[item.amount] !== undefined
                const isSaving = savingAmount === item.amount
                const draftValue = drafts[item.amount] ?? ''
                return (
                  <div className="price-item-row" key={item.amount}>
                    <span className="price-item-label">
                      {item.amount.toLocaleString()} {activeGameConfig.currencyLabel}
                      {isOverridden && <span className="price-override-tag">Muda</span>}
                    </span>
                    <span className="price-item-default">Default: ${item.price.toFixed(2)}</span>
                    <div className="price-item-edit">
                      <span className="price-item-dollar">$</span>
                      <input
                        type="number"
                        min="0.01"
                        step="0.01"
                        placeholder={item.price.toFixed(2)}
                        value={draftValue}
                        onChange={(e) => handleDraftChange(item.amount, e.target.value)}
                      />
                      <button
                        className="btn btn-ghost btn-small"
                        onClick={() => handleSave(item.amount, item.price)}
                        disabled={isSaving}
                      >
                        {isSaving ? '...' : 'Guarda'}
                      </button>
                      {isOverridden && (
                        <button className="link-btn danger" onClick={() => handleReset(item.amount)} disabled={isSaving}>
                          Reset
                        </button>
                      )}
                    </div>
                  </div>
                )
              })}
            </div>
          </div>
        ))
      )}
    </div>
  )
}
