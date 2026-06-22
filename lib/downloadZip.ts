import JSZip from 'jszip'
import { BatchItem, ExportFormat } from '@/types'
import { convertToFormat } from '@/lib/convertFormat'

export async function downloadAllAsZip(items: BatchItem[], format: ExportFormat = 'png'): Promise<void> {
  const done = items.filter((i) => i.status === 'done' && i.resultUrl)
  if (done.length === 0) return

  const zip = new JSZip()

  await Promise.all(
    done.map(async (item) => {
      const { url: convertedUrl, ext, revokeAfterUse } = await convertToFormat(item.resultUrl!, format)
      const response = await fetch(convertedUrl)
      const blob = await response.blob()
      if (revokeAfterUse) URL.revokeObjectURL(convertedUrl)
      const baseName = item.file.name.replace(/\.[^/.]+$/, '')
      zip.file(`${baseName}-bg-removed.${ext}`, blob)
    })
  )

  const zipBlob = await zip.generateAsync({ type: 'blob' })
  const url = URL.createObjectURL(zipBlob)
  const link = document.createElement('a')
  link.href = url
  link.download = 'bg-removed-images.zip'
  link.click()
  URL.revokeObjectURL(url)
}
