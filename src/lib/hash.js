// Utilitariu ba hash SHA-256 husi ArrayBuffer (uza ba fingerprint imajen bukti transfer).

export async function sha256HexFromBuffer(buffer) {
  const hashBuffer = await crypto.subtle.digest('SHA-256', buffer)
  return Array.from(new Uint8Array(hashBuffer))
    .map((b) => b.toString(16).padStart(2, '0'))
    .join('')
}
