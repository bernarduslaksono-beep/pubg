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
// IMPORTANTE: de'it aplika ba entry ne'ebe ita boot loloos VERIFIKA iha "checkedResults"
// — entry seluk (ezemplu pedidu foun ne'ebe cliente submete durante refresh ne'e
// hela halo) NUNCA toka/hasai, atu hases "race condition" ne'ebe bele hamoos
// pedidu foun husi riwayat lokal.
function syncCheckedResults(gameKey, checkedResults) {
  const list = readRaw()
  const resultMap = new Map(checkedResults.map((r) => [r.id, r]))
  const next = list
    .filter((o) => {
      if (o.game !== gameKey) return true
      const r = resultMap.get(o.id)
      if (!r) return true // la verifika iha loop ida ne'e — keep, la toka
      return r.found // apaga de'it se ita boot loloos verifika no la hetan ona
    })
    .map((o) => {
      if (o.game !== gameKey) return o
      const r = resultMap.get(o.id)
      if (!r || !r.found) return o
      return { ...o, unread: r.unread, lastKnownStatus: r.lastKnownStatus }
    })
  writeRaw(next)
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

// Foti lista jogu (game key) sira ne'ebe iha pedidu "unread" — uza ba icon
// lonceng iha Portal, atu hatudu resumu husi hotu-hotu jogu hamutuk.
export function getUnreadGames() {
  const set = new Set(readRaw().filter((o) => o.unread).map((o) => o.game))
  return Array.from(set)
}

// Foti lista jogu (game key) sira ne'ebe iha ona pedidu iha riwayat lokal —
// uza atu sabe jogu sira ne'ebe presiza "refresh" husi database.
export function getGamesWithHistory() {
  const set = new Set(readRaw().map((o) => o.game))
  return Array.from(set)
}

// Buka fila fali status atual (husi database) ba hotu-hotu Order ID iha riwayat
// jogu ne'e. Se status muda husi ne'ebe ita guarda ikus liu (ezemplu admin verifika
// ka kanselamentu), marka entry ne'e "unread" fila fali — maski ita ona loke antes.
// Ida ne'e mos hasi entry ne'ebe admin ona apaga husi database.
export async function refreshHistoryStatuses(gameKey) {
  const entries = loadHistoryIds(gameKey)
  if (entries.length === 0) return []

  const checkedResults = await Promise.all(
    entries.map(async (h) => {
      const { data, error } = await supabase.rpc('track_orders', {
        p_order_id: h.id,
        p_whatsapp: null,
        p_game: gameKey,
      })
      if (error || !data || data.length === 0) return { id: h.id, found: false }
      const fresh = data[0]
      const statusChanged = h.lastKnownStatus && h.lastKnownStatus !== fresh.status
      return {
        id: h.id,
        found: true,
        data: fresh,
        unread: statusChanged ? true : Boolean(h.unread),
        lastKnownStatus: fresh.status,
      }
    })
  )

  // Sinkroniza de'it entry ne'ebe ita boot verifika iha loop ida ne'e (la afeta
  // entry seluk ne'ebe konkorrente hamutuk).
  syncCheckedResults(gameKey, checkedResults)

  return checkedResults
    .filter((r) => r.found)
    .map((r) => ({ ...r.data, unread: r.unread }))
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
