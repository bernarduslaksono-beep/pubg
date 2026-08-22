// Fingerprint dispositivu — baseia iha karakterístika hardware (screen, CPU, GPU,
// timezone) ne'ebe used tama hanesan maski troka browser iha dispositivu hanesan.
//
// IMPORTANTE: ida ne'e "best-effort" — la iha garantia 100% tanba browser sira
// hakotu limita fingerprinting atu proteje privacidade. Maibe ida ne'e uza padraun
// industria (hanesan FingerprintJS) ne'ebe fiar ba maioria kazu.

let cachedFingerprint = null

async function sha256Hex(text) {
  const encoder = new TextEncoder()
  const data = encoder.encode(text)
  const hashBuffer = await crypto.subtle.digest('SHA-256', data)
  return Array.from(new Uint8Array(hashBuffer))
    .map((b) => b.toString(16).padStart(2, '0'))
    .join('')
}

function getWebglInfo() {
  try {
    const canvas = document.createElement('canvas')
    const gl = canvas.getContext('webgl') || canvas.getContext('experimental-webgl')
    if (!gl) return 'no-webgl'
    const ext = gl.getExtension('WEBGL_debug_renderer_info')
    if (!ext) return 'no-debug-info'
    const renderer = gl.getParameter(ext.UNMASKED_RENDERER_WEBGL)
    const vendor = gl.getParameter(ext.UNMASKED_VENDOR_WEBGL)
    return `${vendor}::${renderer}`
  } catch {
    return 'webgl-error'
  }
}

export async function getDeviceFingerprint() {
  if (cachedFingerprint) return cachedFingerprint

  try {
    const saved = localStorage.getItem('device_fp_cache')
    if (saved) {
      cachedFingerprint = saved
      return saved
    }
  } catch {
    /* ignora se localStorage la disponivel */
  }

  const parts = [
    `${screen.width}x${screen.height}`,
    screen.colorDepth,
    navigator.hardwareConcurrency || '',
    navigator.deviceMemory || '',
    Intl.DateTimeFormat().resolvedOptions().timeZone || '',
    navigator.platform || '',
    getWebglInfo(),
  ]

  const fingerprint = await sha256Hex(parts.join('|'))
  cachedFingerprint = fingerprint

  try {
    localStorage.setItem('device_fp_cache', fingerprint)
  } catch {
    /* ignora se localStorage la disponivel */
  }

  return fingerprint
}
