'use client'

import { useState, useRef, useCallback } from 'react'
import JSZip from 'jszip'

const MAX_FILES = 10

interface ResizerItem {
  id: string
  file: File
  previewUrl: string
  origW: number
  origH: number
  resultUrl: string | null
  resultSize: number | null
  status: 'idle' | 'resizing' | 'done' | 'error'
  errorMsg?: string
}

function fmtBytes(n: number) {
  if (n < 1024) return `${n} B`
  if (n < 1024 * 1024) return `${(n / 1024).toFixed(1)} KB`
  return `${(n / 1024 / 1024).toFixed(1)} MB`
}

function getOutputSize(
  origW: number,
  origH: number,
  targetW: number | null,
  targetH: number | null,
  locked: boolean
): { w: number; h: number } {
  if (locked) {
    if (targetW && origW > 0) {
      return { w: targetW, h: Math.max(1, Math.round((targetW * origH) / origW)) }
    }
    if (targetH && origH > 0) {
      return { w: Math.max(1, Math.round((targetH * origW) / origH)), h: targetH }
    }
    return { w: origW || 1, h: origH || 1 }
  }
  return {
    w: Math.max(1, Math.round(targetW ?? origW)),
    h: Math.max(1, Math.round(targetH ?? origH)),
  }
}

function getContentBounds(
  data: Uint8ClampedArray,
  sw: number,
  sh: number
): { sx: number; sy: number; tw: number; th: number } {
  let minX = sw, minY = sh, maxX = -1, maxY = -1
  for (let y = 0; y < sh; y++) {
    for (let x = 0; x < sw; x++) {
      if (data[(y * sw + x) * 4 + 3] > 10) {
        if (x < minX) minX = x
        if (x > maxX) maxX = x
        if (y < minY) minY = y
        if (y > maxY) maxY = y
      }
    }
  }
  if (maxX < 0) return { sx: 0, sy: 0, tw: sw, th: sh }
  return { sx: minX, sy: minY, tw: maxX - minX + 1, th: maxY - minY + 1 }
}

async function resizeImage(
  file: File,
  outW: number,
  outH: number
): Promise<{ url: string; size: number }> {
  const w = Math.max(1, Math.round(outW))
  const h = Math.max(1, Math.round(outH))

  const srcUrl = URL.createObjectURL(file)
  const img = await new Promise<HTMLImageElement>((res, rej) => {
    const el = new Image()
    el.onload = () => res(el)
    el.onerror = () => rej(new Error('Cannot load image'))
    el.src = srcUrl
  })
  URL.revokeObjectURL(srcUrl)

  const sw = img.naturalWidth
  const sh = img.naturalHeight
  if (!sw || !sh) throw new Error('Image has zero dimensions')

  // Detect transparent padding and crop to content bounds
  const tmpCanvas = document.createElement('canvas')
  tmpCanvas.width = sw
  tmpCanvas.height = sh
  const tmpCtx = tmpCanvas.getContext('2d')!
  tmpCtx.drawImage(img, 0, 0)
  const { data } = tmpCtx.getImageData(0, 0, sw, sh)
  const { sx, sy, tw, th } = getContentBounds(data, sw, sh)

  const canvas = document.createElement('canvas')
  canvas.width = w
  canvas.height = h
  const ctx = canvas.getContext('2d')!
  ctx.imageSmoothingEnabled = true
  ctx.imageSmoothingQuality = 'high'
  // Source = content bounding box (trims transparent edges); dest = full target canvas
  ctx.drawImage(img, sx, sy, tw, th, 0, 0, w, h)

  const blob = await new Promise<Blob | null>((res) =>
    canvas.toBlob((b) => res(b), 'image/png')
  )
  if (!blob) throw new Error('Failed to create resized image')
  return { url: URL.createObjectURL(blob), size: blob.size }
}

export default function ImageResizer() {
  const [items, setItems] = useState<ResizerItem[]>([])
  const [targetW, setTargetW] = useState<number | ''>('')
  const [targetH, setTargetH] = useState<number | ''>('')
  const [locked, setLocked] = useState(true)
  const [dragging, setDragging] = useState(false)
  const [zipping, setZipping] = useState(false)
  const inputRef = useRef<HTMLInputElement>(null)

  const isFull = items.length >= MAX_FILES
  const remaining = MAX_FILES - items.length

  const tw = typeof targetW === 'number' ? targetW : null
  const th = typeof targetH === 'number' ? targetH : null

  function onWidthChange(val: string) {
    const n = val === '' ? '' : Math.max(1, parseInt(val) || 1)
    setTargetW(n)
    if (locked && n !== '') setTargetH('')
  }

  function onHeightChange(val: string) {
    const n = val === '' ? '' : Math.max(1, parseInt(val) || 1)
    setTargetH(n)
    if (locked && n !== '') setTargetW('')
  }

  function toggleLock() {
    setLocked((l) => {
      if (!l) {
        if (tw) setTargetH('')
        else if (th) setTargetW('')
      }
      return !l
    })
  }

  // Load all files in parallel then batch-add — no dependency on `remaining` closure
  const addFiles = useCallback((files: FileList | File[]) => {
    const arr = Array.from(files).filter((f) => f.type.startsWith('image/'))
    if (!arr.length) return

    Promise.all(
      arr.map((file) => {
        const url = URL.createObjectURL(file)
        return new Promise<ResizerItem | null>((resolve) => {
          const img = new Image()
          img.onload = () => {
            if (!img.naturalWidth || !img.naturalHeight) {
              URL.revokeObjectURL(url)
              resolve(null)
              return
            }
            resolve({
              id: `${Date.now()}-${Math.random()}`,
              file,
              previewUrl: url,
              origW: img.naturalWidth,
              origH: img.naturalHeight,
              resultUrl: null,
              resultSize: null,
              status: 'idle',
            })
          }
          img.onerror = () => {
            URL.revokeObjectURL(url)
            resolve(null)
          }
          img.src = url
        })
      })
    ).then((results) => {
      const newItems = results.filter((i): i is ResizerItem => i !== null)
      if (!newItems.length) return
      setItems((prev) => {
        const slots = MAX_FILES - prev.length
        if (slots <= 0) {
          newItems.forEach((i) => URL.revokeObjectURL(i.previewUrl))
          return prev
        }
        const toAdd = newItems.slice(0, slots)
        newItems.slice(slots).forEach((i) => URL.revokeObjectURL(i.previewUrl))
        return [...prev, ...toAdd]
      })
    })
  }, []) // setItems is stable; MAX_FILES is constant

  const onDrop = useCallback(
    (e: React.DragEvent) => {
      e.preventDefault()
      setDragging(false)
      addFiles(e.dataTransfer.files)
    },
    [addFiles]
  )

  const onDragOver = useCallback((e: React.DragEvent) => {
    e.preventDefault()
    setDragging(true)
  }, [])

  const onDragLeave = useCallback(() => setDragging(false), [])

  async function resizeAll() {
    const pending = items.filter((i) => i.status === 'idle' || i.status === 'error')
    if (!pending.length) return

    for (const item of pending) {
      const { w: outW, h: outH } = getOutputSize(item.origW, item.origH, tw, th, locked)
      setItems((prev) =>
        prev.map((i) => (i.id === item.id ? { ...i, status: 'resizing', resultUrl: null } : i))
      )
      try {
        const { url, size } = await resizeImage(item.file, outW, outH)
        setItems((prev) =>
          prev.map((i) =>
            i.id === item.id ? { ...i, status: 'done', resultUrl: url, resultSize: size } : i
          )
        )
      } catch (err) {
        setItems((prev) =>
          prev.map((i) =>
            i.id === item.id
              ? { ...i, status: 'error', errorMsg: err instanceof Error ? err.message : 'Failed' }
              : i
          )
        )
      }
    }
  }

  function downloadOne(item: ResizerItem) {
    if (!item.resultUrl) return
    const baseName = item.file.name.replace(/\.[^/.]+$/, '')
    const { w, h } = getOutputSize(item.origW, item.origH, tw, th, locked)
    const a = document.createElement('a')
    a.href = item.resultUrl
    a.download = `${baseName}-${w}x${h}.png`
    a.click()
  }

  async function downloadAll() {
    const done = items.filter((i) => i.status === 'done' && i.resultUrl)
    if (!done.length) return
    setZipping(true)
    try {
      const zip = new JSZip()
      await Promise.all(
        done.map(async (item) => {
          const res = await fetch(item.resultUrl!)
          const blob = await res.blob()
          const baseName = item.file.name.replace(/\.[^/.]+$/, '')
          const { w, h } = getOutputSize(item.origW, item.origH, tw, th, locked)
          zip.file(`${baseName}-${w}x${h}.png`, blob)
        })
      )
      const blob = await zip.generateAsync({ type: 'blob' })
      const url = URL.createObjectURL(blob)
      const a = document.createElement('a')
      a.href = url
      a.download = 'resized-images.zip'
      a.click()
      URL.revokeObjectURL(url)
    } finally {
      setZipping(false)
    }
  }

  function removeItem(id: string) {
    setItems((prev) => {
      const item = prev.find((i) => i.id === id)
      if (item?.previewUrl) URL.revokeObjectURL(item.previewUrl)
      if (item?.resultUrl) URL.revokeObjectURL(item.resultUrl)
      return prev.filter((i) => i.id !== id)
    })
  }

  function clearAll() {
    items.forEach((i) => {
      URL.revokeObjectURL(i.previewUrl)
      if (i.resultUrl) URL.revokeObjectURL(i.resultUrl)
    })
    setItems([])
    setTargetW('')
    setTargetH('')
    if (inputRef.current) inputRef.current.value = ''
  }

  const doneCount = items.filter((i) => i.status === 'done').length
  const resizingAny = items.some((i) => i.status === 'resizing')
  const hasPending = items.some((i) => i.status === 'idle' || i.status === 'error')
  const hasTarget = tw !== null || th !== null

  return (
    <div className="flex flex-col gap-5">

      {/* Dimension inputs */}
      <div>
        <p className="text-xs text-slate-500 font-medium mb-3 uppercase tracking-wider">Target Size</p>
        <div className="flex items-center gap-2 sm:gap-3">

          {/* Width */}
          <div className="flex-1">
            <label className="text-[10px] text-slate-600 uppercase tracking-wider block mb-1.5">Width (px)</label>
            <input
              type="number"
              min={1}
              placeholder={locked && th ? 'auto' : 'e.g. 1920'}
              value={targetW}
              onChange={(e) => onWidthChange(e.target.value)}
              disabled={locked && !!th}
              className="w-full px-3 py-2.5 rounded-xl bg-white/5 border border-white/8 text-sm text-slate-200 placeholder-slate-700 focus:outline-none focus:border-indigo-500/50 focus:bg-white/7 disabled:opacity-40 disabled:cursor-not-allowed transition-all"
            />
          </div>

          {/* Lock toggle */}
          <div className="flex flex-col items-center gap-1 mt-5">
            <button
              onClick={toggleLock}
              title={locked ? 'Proportional (no distortion)' : 'Exact dimensions'}
              className={`w-9 h-9 rounded-xl flex items-center justify-center border transition-all ${
                locked
                  ? 'border-indigo-500/50 bg-indigo-500/15 text-indigo-400'
                  : 'border-white/10 bg-white/5 text-slate-500 hover:text-slate-300'
              }`}
            >
              {locked ? (
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                    d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                </svg>
              ) : (
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                    d="M8 11V7a4 4 0 118 0m-4 8v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2z" />
                </svg>
              )}
            </button>
          </div>

          {/* Height */}
          <div className="flex-1">
            <label className="text-[10px] text-slate-600 uppercase tracking-wider block mb-1.5">Height (px)</label>
            <input
              type="number"
              min={1}
              placeholder={locked && tw ? 'auto' : 'e.g. 1080'}
              value={targetH}
              onChange={(e) => onHeightChange(e.target.value)}
              disabled={locked && !!tw}
              className="w-full px-3 py-2.5 rounded-xl bg-white/5 border border-white/8 text-sm text-slate-200 placeholder-slate-700 focus:outline-none focus:border-indigo-500/50 focus:bg-white/7 disabled:opacity-40 disabled:cursor-not-allowed transition-all"
            />
          </div>
        </div>

        {/* Lock hint */}
        <p className="text-[11px] text-slate-700 mt-2">
          {locked
            ? 'Locked — aspect ratio preserved per image, no crop, no distortion'
            : 'Unlocked — exact dimensions, image may stretch but will never be cropped'}
        </p>
      </div>

      {/* Upload zone */}
      <div
        onDrop={isFull ? undefined : onDrop}
        onDragOver={isFull ? undefined : onDragOver}
        onDragLeave={isFull ? undefined : onDragLeave}
        onClick={isFull ? undefined : () => inputRef.current?.click()}
        className={`flex flex-col items-center justify-center gap-3 rounded-xl border-2 border-dashed transition-all p-8 sm:p-12 ${
          isFull
            ? 'border-white/5 bg-white/1 opacity-50 cursor-not-allowed'
            : dragging
            ? 'border-indigo-500/60 bg-indigo-500/10 cursor-pointer'
            : 'border-white/8 bg-white/2 hover:border-white/15 hover:bg-white/4 cursor-pointer'
        }`}
      >
        <input
          ref={inputRef}
          type="file"
          accept="image/*"
          multiple
          className="hidden"
          onChange={(e) => {
            if (e.target.files) addFiles(e.target.files)
            // Reset so the same file can be selected again
            e.target.value = ''
          }}
        />
        <div className="w-10 h-10 rounded-xl bg-indigo-500/15 flex items-center justify-center">
          <svg className="w-5 h-5 text-indigo-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.8}
              d="M4 8V4m0 0h4M4 4l5 5m11-1V4m0 0h-4m4 0l-5 5M4 16v4m0 0h4m-4 0l5-5m11 5l-5-5m5 5v-4m0 4h-4" />
          </svg>
        </div>
        <div className="text-center">
          <p className="text-sm text-slate-300 font-medium">
            {isFull ? 'Limit reached — remove an image to add more' : 'Drop images here or click to browse'}
          </p>
          <p className="text-xs text-slate-600 mt-1">
            {isFull
              ? `${MAX_FILES}/${MAX_FILES} images`
              : `PNG · JPG · WebP and more — up to ${remaining} more`}
          </p>
        </div>
      </div>

      {/* File list */}
      {items.length > 0 && (
        <div className="flex flex-col gap-2">
          <div className="flex items-center justify-between mb-1">
            <p className="text-xs text-slate-500 font-medium uppercase tracking-wider">
              {items.length} / {MAX_FILES} images
            </p>
            <button onClick={clearAll} className="text-xs text-slate-700 hover:text-slate-400 transition-colors">
              Clear all
            </button>
          </div>

          {items.map((item) => {
            const out = getOutputSize(item.origW, item.origH, tw, th, locked)
            return (
              <div
                key={item.id}
                className="flex flex-col sm:flex-row sm:items-center gap-2 sm:gap-3 p-3 rounded-xl border border-white/6 bg-white/2"
              >
                {/* Thumb + info */}
                <div className="flex items-center gap-2 sm:gap-3 min-w-0 sm:flex-1">
                  <div className="w-10 h-10 rounded-lg overflow-hidden border border-white/8 bg-white/5 shrink-0">
                    <img src={item.previewUrl} alt="" className="w-full h-full object-cover" decoding="async" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm text-slate-300 truncate">{item.file.name}</p>
                    <div className="flex items-center gap-1.5 mt-0.5 flex-wrap">
                      {/* Original size */}
                      <span className="text-[10px] font-mono bg-white/5 text-slate-500 px-1.5 py-0.5 rounded">
                        {item.origW} × {item.origH}
                      </span>
                      <svg className="w-3 h-3 text-slate-700 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                      </svg>
                      {/* Output size */}
                      <span className={`text-[10px] font-mono px-1.5 py-0.5 rounded ${
                        hasTarget
                          ? 'bg-indigo-500/15 text-indigo-400'
                          : 'bg-white/5 text-slate-600'
                      }`}>
                        {hasTarget ? `${out.w} × ${out.h}` : 'set size above'}
                      </span>
                      {item.resultSize != null && (
                        <span className="text-[10px] text-slate-600">
                          {fmtBytes(item.file.size)} → {fmtBytes(item.resultSize)}
                        </span>
                      )}
                    </div>
                    {item.status === 'error' && (
                      <p className="text-[10px] text-red-400 mt-0.5">{item.errorMsg}</p>
                    )}
                  </div>
                </div>

                {/* Status + actions */}
                <div className="flex items-center justify-end gap-2 pl-12 sm:pl-0 sm:shrink-0">
                  {item.status === 'resizing' && (
                    <span className="text-xs text-indigo-400 flex items-center gap-1.5">
                      <svg className="w-3.5 h-3.5 animate-spin" viewBox="0 0 24 24" fill="none">
                        <circle cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="3" strokeOpacity="0.25"/>
                        <path d="M12 2a10 10 0 0110 10" stroke="currentColor" strokeWidth="3" strokeLinecap="round"/>
                      </svg>
                      Resizing
                    </span>
                  )}
                  {item.status === 'idle' && (
                    <span className="text-xs text-slate-600">Pending</span>
                  )}
                  {item.status === 'error' && (
                    <span className="text-xs text-red-400">Failed</span>
                  )}
                  {item.status === 'done' && item.resultUrl && (
                    <button
                      onClick={() => downloadOne(item)}
                      className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-indigo-500/15 hover:bg-indigo-500/25 text-indigo-300 text-xs font-medium transition-colors"
                    >
                      <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                          d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
                      </svg>
                      Download
                    </button>
                  )}
                  <button
                    onClick={() => removeItem(item.id)}
                    className="w-6 h-6 flex items-center justify-center rounded-lg text-slate-700 hover:text-slate-400 hover:bg-white/6 transition-colors"
                  >
                    <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                    </svg>
                  </button>
                </div>
              </div>
            )
          })}
        </div>
      )}

      {/* Action buttons */}
      {items.length > 0 && (
        <div className="flex flex-col sm:flex-row gap-3">
          <button
            onClick={resizeAll}
            disabled={resizingAny || !hasPending || !hasTarget}
            className="flex-1 flex items-center justify-center gap-2 px-5 py-3 rounded-xl bg-linear-to-r from-indigo-600 to-violet-600 text-white text-sm font-semibold disabled:opacity-40 disabled:cursor-not-allowed hover:from-indigo-500 hover:to-violet-500 transition-all shadow-lg shadow-indigo-500/20"
          >
            {resizingAny ? (
              <>
                <svg className="w-4 h-4 animate-spin" viewBox="0 0 24 24" fill="none">
                  <circle cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="3" strokeOpacity="0.25"/>
                  <path d="M12 2a10 10 0 0110 10" stroke="currentColor" strokeWidth="3" strokeLinecap="round"/>
                </svg>
                Resizing…
              </>
            ) : (
              <>
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                    d="M4 8V4m0 0h4M4 4l5 5m11-1V4m0 0h-4m4 0l-5 5M4 16v4m0 0h4m-4 0l5-5m11 5l-5-5m5 5v-4m0 4h-4" />
                </svg>
                {!hasTarget ? 'Set a width or height first' : 'Resize All'}
              </>
            )}
          </button>

          {doneCount >= 2 && (
            <button
              onClick={downloadAll}
              disabled={zipping}
              className="flex items-center justify-center gap-2 px-5 py-3 rounded-xl border border-white/10 bg-white/4 hover:bg-white/8 text-slate-300 text-sm font-medium disabled:opacity-40 transition-all"
            >
              {zipping ? (
                <>
                  <svg className="w-4 h-4 animate-spin" viewBox="0 0 24 24" fill="none">
                    <circle cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="3" strokeOpacity="0.25"/>
                    <path d="M12 2a10 10 0 0110 10" stroke="currentColor" strokeWidth="3" strokeLinecap="round"/>
                  </svg>
                  Zipping…
                </>
              ) : (
                <>
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                      d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
                  </svg>
                  Download All ({doneCount}) ZIP
                </>
              )}
            </button>
          )}
        </div>
      )}
    </div>
  )
}
