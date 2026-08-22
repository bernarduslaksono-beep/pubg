import { supabase } from '../supabase.js'

const ORDER_HISTORY_KEY = 'order_history'
const HISTORY_EVENT = 'order-history-updated'

function readRaw() {
  try {
    const raw = localStorage.getItem(ORDER_HISTORY_KEY)
    return raw ? JSON.parse(raw) : []
  } catch {
    return []
  }
}

function writeRaw(list) {
  try {
    localStorage.setItem(ORDER_HISTORY_KEY, JSON.stringify(list))
  } catch {
    /* ignora se localStorage la disponivel */
  }
  // Hatudu husi sensaun ida ne'e mos (localStorage 'storage' event de'it dispara
  // ba tab seluk) — atu TopBar bele hatudu/hasai marka "foun" hotu-hotu iha kbiit.
  window.dispatchEvent(new Event(HISTORY_EVENT))
}

// Xama bainhira pedidu foun submete ho susesu — marka "unread" (foun/la loke ona).
export function saveNewOrder(entry) {
  const list = readRaw()
  const next = [
    { ...entry, unread: true, lastKnownStatus: 'menunggu_verifikasi' },
    ...list.filter((o) => o.id !== entry.id),
  ].slice(0, 10)
  writeRaw(next)
}

// Foti Order ID sira ba jogu espesifiku, ho estadu "unread"/status ne'ebe ona guarda.
export function loadHistoryIds(gameKey) {
  return readRaw().filter((o) => o.game === gameKey).slice(0, 5)
}

// Hasi entry ne'ebe la iha ona iha database (admin ona apaga), no guarda de'it
// entry ne'ebe seidauk loke (unread)/status atual ne'ebe hatudu iha listajen atual.
export function pruneAndSync(gameKey, survivors) {
  const list = readRaw()
  const others = list.filter((o) => o.game !== gameKey)
  const survivorIds = new Set(survivors.map((s) => s.id))
  const kept = list
    .filter((o) => o.game === gameKey && survivorIds.has(o.id))
    .map((o) => {
      const match = survivors.find((s) => s.id === o.id)
      return match ? { ...o, unread: match.unread, lastKnownStatus: match.lastKnownStatus } : o
    })
  writeRaw([...others, ...kept])
}

// Marka Order ID espesifiku hanesan "ona loke" (la iha ona indikador "foun").
export function markAsRead(orderId) {
  const list = readRaw()
  let changed = false
  const next = list.map((o) => {
    if (o.id === orderId && o.unread) {
      changed = true
      return { ...o, unread: false }
    }
    return o
  })
  if (changed) writeRaw(next)
}

// Verifika se iha pedidu "unread" ba jogu espesifiku — uza ba indikador iha tombu Haree Status.
export function hasUnread(gameKey) {
  return readRaw().some((o) => o.game === gameKey && o.unread)
}

// Buka fila fali status atual (husi database) ba hotu-hotu Order ID iha riwayat
// jogu ne'e. Se status muda husi ne'ebe ita guarda ikus liu (ezemplu admin verifika
// ka kanselamentu), marka entry ne'e "unread" fila fali — maski ita ona loke antes.
// Ida ne'e mos hasi entry ne'ebe admin ona apaga husi database.
export async function refreshHistoryStatuses(gameKey) {
  const entries = loadHistoryIds(gameKey)
  if (entries.length === 0) return []

  const results = await Promise.all(
    entries.map(async (h) => {
      const { data, error } = await supabase.rpc('track_orders', {
        p_order_id: h.id,
        p_whatsapp: null,
        p_game: gameKey,
      })
      if (error || !data || data.length === 0) return null
      const fresh = data[0]
      const statusChanged = h.lastKnownStatus && h.lastKnownStatus !== fresh.status
      return {
        ...fresh,
        unread: statusChanged ? true : Boolean(h.unread),
        lastKnownStatus: fresh.status,
      }
    })
  )

  const survivors = results.filter(Boolean)
  pruneAndSync(
    gameKey,
    survivors.map((o) => ({ id: o.id, unread: o.unread, lastKnownStatus: o.lastKnownStatus }))
  )
  return survivors
}

// Subscribe ba mudansa iha riwayat (mesmo tab ka tab seluk).
export function subscribeHistoryChanges(callback) {
  window.addEventListener(HISTORY_EVENT, callback)
  window.addEventListener('storage', callback)
  return () => {
    window.removeEventListener(HISTORY_EVENT, callback)
    window.removeEventListener('storage', callback)
  }
}
