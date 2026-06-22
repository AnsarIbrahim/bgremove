import { ExportFormat } from '@/types'

export async function convertToFormat(
  srcUrl: string,
  format: ExportFormat,
  quality = 0.92
): Promise<{ url: string; ext: string; revokeAfterUse: boolean }> {
  if (format === 'png') {
    return { url: srcUrl, ext: 'png', revokeAfterUse: false }
  }

  const img = new Image()
  await new Promise<void>((resolve, reject) => {
    img.onload = () => resolve()
    img.onerror = reject
    img.src = srcUrl
  })

  const canvas = document.createElement('canvas')
  canvas.width = img.naturalWidth
  canvas.height = img.naturalHeight
  const ctx = canvas.getContext('2d')!

  if (format === 'jpg') {
    ctx.fillStyle = '#ffffff'
    ctx.fillRect(0, 0, canvas.width, canvas.height)
  }

  ctx.drawImage(img, 0, 0)

  const mime = format === 'jpg' ? 'image/jpeg' : 'image/webp'
  const ext = format === 'jpg' ? 'jpg' : 'webp'

  const url = await new Promise<string>((resolve) => {
    canvas.toBlob((blob) => resolve(URL.createObjectURL(blob!)), mime, quality)
  })

  return { url, ext, revokeAfterUse: true }
}
