// Kompriminí imajen (resize + kualidade JPEG reduzidu) direta iha browser
// antes upload — atu hases storage Supabase enxi lalais tanba imajen bukti
// transferénsia (screenshot HP) normalmente 2-5MB, maibe seidauk lee klaru
// husi versaun ne'ebe hanoin liu ki'ik.

export async function resizeImageToBlob(file, maxDimension = 1280, quality = 0.78) {
  return new Promise((resolve, reject) => {
    const img = new Image()
    const objectUrl = URL.createObjectURL(file)

    img.onload = () => {
      URL.revokeObjectURL(objectUrl)
      let { width, height } = img

      if (width > maxDimension || height > maxDimension) {
        if (width > height) {
          height = Math.round((height * maxDimension) / width)
          width = maxDimension
        } else {
          width = Math.round((width * maxDimension) / height)
          height = maxDimension
        }
      }

      const canvas = document.createElement('canvas')
      canvas.width = width
      canvas.height = height
      const ctx = canvas.getContext('2d')
      ctx.drawImage(img, 0, 0, width, height)

      canvas.toBlob(
        (blob) => {
          if (blob) resolve(blob)
          else reject(new Error('Falha atu comprimir imajen'))
        },
        'image/jpeg',
        quality
      )
    }

    img.onerror = () => {
      URL.revokeObjectURL(objectUrl)
      reject(new Error('Falha atu lee imajen'))
    }

    img.src = objectUrl
  })
}
