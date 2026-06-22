'use client'

import { useState } from 'react'
import { processImage } from '@/lib/removeBackground'
import { removeBackgroundFloodFill } from '@/lib/floodFillRemove'
import { BatchItem, Mode } from '@/types'
import UploadZone from '@/components/UploadZone'
import ImageQueue from '@/components/ImageQueue'
import ModeToggle from '@/components/ModeToggle'
import ToleranceSlider from '@/components/ToleranceSlider'

export default function BgRemover() {
  const [items, setItems] = useState<BatchItem[]>([])
  const [running, setRunning] = useState(false)
  const [preparingCount, setPreparingCount] = useState(0)
  const [mode, setMode] = useState<Mode>('graphic')
  const [tolerance, setTolerance] = useState(30)

  function updateItem(id: string, patch: Partial<BatchItem>) {
    setItems((prev) => prev.map((i) => (i.id === id ? { ...i, ...patch } : i)))
  }

  async function handleFilesSelect(files: File[]) {
    // Show "Reading X images…" immediately, then yield so React can render it
    setPreparingCount(files.length)
    await new Promise((r) => setTimeout(r, 0))

    const batch: BatchItem[] = files.map((file) => ({
      id: crypto.randomUUID(),
      file,
      originalUrl: URL.createObjectURL(file),
      resultUrl: null,
      status: 'pending',
      width: 0,
      height: 0,
    }))

    setItems(batch)
    setPreparingCount(0)
    setRunning(true)

    for (const item of batch) {
      updateItem(item.id, { status: 'processing', phase: 'inferring' })

      const img = new Image()
      img.src = item.originalUrl
      await new Promise<void>((resolve) => { img.onload = () => resolve() })

      try {
        let resultUrl: string

        if (mode === 'graphic') {
          resultUrl = await removeBackgroundFloodFill(item.file, tolerance)
        } else {
          resultUrl = await processImage(item.file, (progress) => {
            if (progress < 100) {
              updateItem(item.id, { phase: 'downloading', downloadProgress: progress })
            } else {
              updateItem(item.id, { phase: 'inferring', downloadProgress: undefined })
            }
          })
        }

        updateItem(item.id, {
          status: 'done',
          resultUrl,
          width: img.naturalWidth,
          height: img.naturalHeight,
        })
      } catch {
        updateItem(item.id, { status: 'error' })
      }
    }

    setRunning(false)
  }

  function handleReset() {
    setItems([])
    setRunning(false)
    setPreparingCount(0)
  }

  const hasItems = items.length > 0

  return (
    <div className="flex flex-col gap-6">
      {!hasItems && (
        <>
          <ModeToggle mode={mode} onChange={setMode} />
          {mode === 'graphic' && (
            <ToleranceSlider value={tolerance} onChange={setTolerance} />
          )}
          <UploadZone
            onFilesSelect={handleFilesSelect}
            disabled={running}
            preparing={preparingCount > 0}
            preparingCount={preparingCount}
          />
        </>
      )}

      {hasItems && (
        <ImageQueue items={items} onReset={handleReset} />
      )}
    </div>
  )
}
