/**
 * Generates a tiny JPEG data-URL for blur-up placeholders (≈16×12px).
 */
export function generateBlurDataUrl(source) {
  return new Promise((resolve) => {
    const img = new Image()
    let objectUrl

    const cleanup = () => {
      if (objectUrl) URL.revokeObjectURL(objectUrl)
    }

    img.onload = () => {
      try {
        const canvas = document.createElement('canvas')
        canvas.width = 16
        canvas.height = 12
        const ctx = canvas.getContext('2d')
        ctx.drawImage(img, 0, 0, 16, 12)
        resolve(canvas.toDataURL('image/jpeg', 0.55))
      } catch {
        resolve(null)
      } finally {
        cleanup()
      }
    }

    img.onerror = () => {
      cleanup()
      resolve(null)
    }

    if (source instanceof File || source instanceof Blob) {
      objectUrl = URL.createObjectURL(source)
      img.src = objectUrl
    } else if (typeof source === 'string') {
      img.crossOrigin = 'anonymous'
      img.src = source
    } else {
      resolve(null)
    }
  })
}
