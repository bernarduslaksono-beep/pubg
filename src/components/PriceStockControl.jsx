import { useEffect, useState } from 'react'
import { supabase } from '../supabase.js'
import { GAMES } from '../data/games.js'

const GAME_TABS = Object.values(GAMES)

export default function PriceStockControl() {
  const [activeGame, setActiveGame] = useState(GAME_TABS[0]?.key)
  const [disabledAmounts, setDisabledAmounts] = useState(new Set())
  const [overrides, setOverrides] = useState({})
  const [drafts, setDrafts] = useState({})
  const [loading, setLoading] = useState(true)
  const [savingAmount, setSavingAmount] = useState(null)

  const loadAll = async (gameKey) => {
    setLoading(true)
    const [stockRes, priceRes] = await Promise.all([
      supabase.from('disabled_packages').select('amount').eq('game', gameKey),
      supabase.from('package_prices').select('amount, price').eq('game', gameKey),
    ])
    if (!stockRes.error && stockRes.data) setDisabledAmounts(new Set(stockRes.data.map((d) => d.amount)))
    if (!priceRes.error && priceRes.data) {
      const map = {}
      priceRes.data.forEach((row) => { map[row.amount] = Number(row.price) })
      setOverrides(map)
      setDrafts(map)
    } else {
      setOverrides({})
      setDrafts({})
    }
    setLoading(false)
  }

  useEffect(() => {
    loadAll(activeGame)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [activeGame])

  const toggleStock = async (amount, currentlyDisabled) => {
    setSavingAmount(`stock-${amount}`)
    if (currentlyDisabled) {
      const { error } = await supabase.from('disabled_packages').delete().eq('game', activeGame).eq('amount', amount)
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
      const { error } = await supabase.from('disabled_packages').insert({ game: activeGame, amount })
      if (!error) {
        setDisabledAmounts((prev) => new Set(prev).add(amount))
      } else {
        alert('Falha atu troka status stock.')
      }
    }
    setSavingAmount(null)
  }

  const handleDraftChange = (amount, value) => {
    setDrafts((prev) => ({ ...prev, [amount]: value }))
  }

  const handleSavePrice = async (amount, defaultPrice) => {
    const raw = drafts[amount]
    const value = raw === '' || raw === undefined ? null : Number(raw)
    if (value !== null && (Number.isNaN(value) || value <= 0)) {
      alert('Presu tenki numeru pozitivu.')
      return
    }
    setSavingAmount(`price-${amount}`)
    try {
      if (value === null || value === defaultPrice) {
        const { error } = await supabase.from('package_prices').delete().eq('game', activeGame).eq('amount', amount)
        if (error) throw error
      } else {
        const { error } = await supabase
          .from('package_prices')
          .upsert({ game: activeGame, amount, price: value }, { onConflict: 'game,amount' })
        if (error) throw error
      }
      loadAll(activeGame)
    } catch (err) {
      console.error(err)
      alert('Falha atu guarda presu.')
    } finally {
      setSavingAmount(null)
    }
  }

  const handleResetPrice = async (amount) => {
    setSavingAmount(`price-${amount}`)
    try {
      const { error } = await supabase.from('package_prices').delete().eq('game', activeGame).eq('amount', amount)
      if (error) throw error
      loadAll(activeGame)
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
          <button key={g.key} className={activeGame === g.key ? 'active' : ''} onClick={() => setActiveGame(g.key)}>
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
                const isDisabled = disabledAmounts.has(item.amount)
                const isOverridden = overrides[item.amount] !== undefined
                const savingStock = savingAmount === `stock-${item.amount}`
                const savingPrice = savingAmount === `price-${item.amount}`
                const draftValue = drafts[item.amount] ?? ''
                return (
                  <div className="price-item-row" key={item.amount}>
                    <div className="price-item-top">
                      <span className="price-item-label">
                        {item.amount.toLocaleString()} {activeGameConfig.currencyLabel}
                        {isOverridden && <span className="price-override-tag">Muda</span>}
                      </span>
                      <button
                        className={`stock-toggle-btn${isDisabled ? ' disabled' : ' available'}`}
                        onClick={() => toggleStock(item.amount, isDisabled)}
                        disabled={savingStock}
                      >
                        {savingStock ? '...' : isDisabled ? 'Stok Hotu' : 'Tersedia'}
                      </button>
                    </div>
                    <div className="price-item-edit">
                      <span className="price-item-default">Default: ${item.price.toFixed(2)}</span>
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
                        onClick={() => handleSavePrice(item.amount, item.price)}
                        disabled={savingPrice}
                      >
                        {savingPrice ? '...' : 'Guarda'}
                      </button>
                      {isOverridden && (
                        <button className="link-btn danger" onClick={() => handleResetPrice(item.amount)} disabled={savingPrice}>
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
