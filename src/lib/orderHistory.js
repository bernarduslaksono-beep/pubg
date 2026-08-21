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
  const next = [{ ...entry, unread: true }, ...list.filter((o) => o.id !== entry.id)].slice(0, 10)
  writeRaw(next)
}

// Foti Order ID sira ba jogu espesifiku, ho estadu "unread" ne'ebe ona guarda.
export function loadHistoryIds(gameKey) {
  return readRaw().filter((o) => o.game === gameKey).slice(0, 5)
}

// Hasi entry ne'ebe la iha ona iha database (admin ona apaga), no guarda de'it
// entry ne'ebe seidauk loke (unread) ka ne'ebe hatudu iha listajen atual.
export function pruneAndSync(gameKey, survivors) {
  const list = readRaw()
  const others = list.filter((o) => o.game !== gameKey)
  const survivorIds = new Set(survivors.map((s) => s.id))
  const kept = list
    .filter((o) => o.game === gameKey && survivorIds.has(o.id))
    .map((o) => {
      const match = survivors.find((s) => s.id === o.id)
      return match ? { ...o, unread: match.unread } : o
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

// Subscribe ba mudansa iha riwayat (mesmo tab ka tab seluk).
export function subscribeHistoryChanges(callback) {
  window.addEventListener(HISTORY_EVENT, callback)
  window.addEventListener('storage', callback)
  return () => {
    window.removeEventListener(HISTORY_EVENT, callback)
    window.removeEventListener('storage', callback)
  }
}
