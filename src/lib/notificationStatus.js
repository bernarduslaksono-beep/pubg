export async function isNotificationActive() {
  if (!('Notification' in window) || !('serviceWorker' in navigator) || !('PushManager' in window)) {
    return false
  }
  try {
    const reg = await navigator.serviceWorker.ready
    const sub = await reg.pushManager.getSubscription()
    return Boolean(sub) && Notification.permission === 'granted'
  } catch {
    return false
  }
}
