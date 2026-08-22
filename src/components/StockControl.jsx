import { useEffect, useState } from 'react'
import { supabase } from '../supabase.js'
import { GAMES } from '../data/games.js'

const GAME_TABS = Object.values(GAMES)

export default function StockControl() {
  const [collapsed, setCollapsed] = useState(true)
  const [activeGame, setActiveGame] = useState(GAME_TABS[0]?.key)
  const [disabledAmounts, setDisabledAmounts] = useState(new Set())
  const [loading, setLoading] = useState(true)
  const [savingAmount, setSavingAmount] = useState(null)

  const loadDisabled = async (gameKey) => {
    setLoading(true)
    const { data, error } = await supabase.from('disabled_packages').select('amount').eq('game', gameKey)
    if (!error && data) setDisabledAmounts(new Set(data.map((d) => d.amount)))
    setLoading(false)
  }

  useEffect(() => {
    if (!collapsed) loadDisabled(activeGame)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [activeGame, collapsed])

  const toggleStock = async (amount, currentlyDisabled) => {
    setSavingAmount(amount)
    if (currentlyDisabled) {
      const { error } = await supabase
        .from('disabled_packages')
        .delete()
        .eq('game', activeGame)
        .eq('amount', amount)
      if (!error) {
        setDisabledAmounts((prev) => {
          const next = new Set(prev)
          next.delete(amount)
          return next
        })
      } else {
        alert('Falha atu troka status stock.')
      }
    } else {
      const { error } = await supabase
        .from('disabled_packages')
        .insert({ game: activeGame, amount })
      if (!error) {
        setDisabledAmounts((prev) => new Set(prev).add(amount))
      } else {
        alert('Falha atu troka status stock.')
      }
    }
    setSavingAmount(null)
  }

  const activeGameConfig = GAMES[activeGame]

  return (
    <div className="store-hours-card">
      <div className="store-hours-head store-hours-head-toggle" onClick={() => setCollapsed((c) => !c)}>
        <div>
          <div className="store-hours-title">Kontrola Stock (Denom)</div>
          <div className="field-hint" style={{ marginTop: 2 }}>Marka denom "Stok Hotu" bainhira seidauk iha stock</div>
        </div>
        <span className={`store-hours-chevron${collapsed ? '' : ' open'}`}>▾</span>
      </div>

      {!collapsed && (
        <>
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
                <div className="stock-item-list">
                  {tier.items.map((item) => {
                    const isDisabled = disabledAmounts.has(item.amount)
                    const isSaving = savingAmount === item.amount
                    return (
                      <div className="stock-item-row" key={item.amount}>
                        <span className="stock-item-label">
                          {item.amount.toLocaleString()} {activeGameConfig.currencyLabel} — ${item.price.toFixed(2)}
                        </span>
                        <button
                          className={`stock-toggle-btn${isDisabled ? ' disabled' : ' available'}`}
                          onClick={() => toggleStock(item.amount, isDisabled)}
                          disabled={isSaving}
                        >
                          {isSaving ? '...' : isDisabled ? 'Stok Hotu' : 'Tersedia'}
                        </button>
                      </div>
                    )
                  })}
                </div>
              </div>
            ))
          )}
        </>
      )}
    </div>
  )
}
