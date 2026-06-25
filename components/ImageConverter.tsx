'use client'

import { useState, useCallback, useRef } from 'react'
import JSZip from 'jszip'

type OutputFormat = 'png' | 'jpg' | 'webp' | 'avif'

interface ConvertItem {
  id: string
  file: File
  previewUrl: string
  resultUrl: string | null
  resultSize: number | null
  status: 'idle' | 'converting' | 'done' | 'error'
  errorMsg?: string
}

const FORMATS: { value: OutputFormat; label: string; desc: string; lossy: boolean }[] = [
  { value: 'png',  label: 'PNG',  desc: 'Lossless · Transparency', lossy: false },
  { value: 'jpg',  label: 'JPG',  desc: 'Lossy · Max compat',      lossy: true  },
  { value: 'webp', label: 'WebP', desc: 'Modern · Great ratio',    lossy: true  },
  { value: 'avif', label: 'AVIF', desc: 'Next-gen · Tiny files',   lossy: true  },
]

const MIME: Record<OutputFormat, string> = {
  png:  'image/png',
  jpg:  'image/jpeg',
  webp: 'image/webp',
  avif: 'image/avif',
}

function fmtBytes(n: number) {
  if (n < 1024) return `${n} B`
  if (n < 1024 * 1024) return `${(n / 1024).toFixed(1)} KB`
  return `${(n / 1024 / 1024).toFixed(1)} MB`
}

function inputExt(file: File) {
  return file.name.split('.').pop()?.toUpperCase() ?? file.type.split('/')[1]?.toUpperCase() ?? '?'
}

async function doConvert(
  file: File,
  format: OutputFormat,
  quality: number
): Promise<{ url: string; size: number }> {
  const srcUrl = URL.createObjectURL(file)
  const img = new Image()
  await new Promise<void>((res, rej) => {
    img.onload = () => res()
    img.onerror = () => rej(new Error('Cannot load image'))
    img.src = srcUrl
  })
  URL.revokeObjectURL(srcUrl)

  const canvas = document.createElement('canvas')
  canvas.width  = img.naturalWidth
  canvas.height = img.naturalHeight
  const ctx = canvas.getContext('2d')!

  if (format === 'jpg') {
    ctx.fillStyle = '#ffffff'
    ctx.fillRect(0, 0, canvas.width, canvas.height)
  }
  ctx.drawImage(img, 0, 0)

  const q = format === 'png' ? undefined : quality / 100
  const blob = await new Promise<Blob | null>((res) =>
    canvas.toBlob((b) => res(b), MIME[format], q)
  )
  if (!blob) throw new Error(`${format.toUpperCase()} encoding not supported in this browser`)
  return { url: URL.createObjectURL(blob), size: blob.size }
}

export default function ImageConverter() {
  const [items, setItems] = useState<ConvertItem[]>([])
  const [format, setFormat] = useState<OutputFormat>('webp')
  const [quality, setQuality] = useState(88)
  const [dragging, setDragging] = useState(false)
  const [zipping, setZipping] = useState(false)
  const inputRef = useRef<HTMLInputElement>(null)

  const isLossy = FORMATS.find((f) => f.value === format)?.lossy ?? false

  function addFiles(files: FileList | File[]) {
    const arr = Array.from(files).filter((f) => f.type.startsWith('image/'))
    if (!arr.length) return
    const newItems: ConvertItem[] = arr.map((file) => ({
      id: `${Date.now()}-${Math.random()}`,
      file,
      previewUrl: URL.createObjectURL(file),
      resultUrl: null,
      resultSize: null,
      status: 'idle',
    }))
    setItems((prev) => [...prev, ...newItems])
  }

  const onDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault()
    setDragging(false)
    addFiles(e.dataTransfer.files)
  }, [])

  const onDragOver = useCallback((e: React.DragEvent) => {
    e.preventDefault()
    setDragging(true)
  }, [])

  const onDragLeave = useCallback(() => setDragging(false), [])

  async function convertAll() {
    const pending = items.filter((i) => i.status === 'idle' || i.status === 'error')
    if (!pending.length) return

    for (const item of pending) {
      setItems((prev) =>
        prev.map((i) => (i.id === item.id ? { ...i, status: 'converting', resultUrl: null, resultSize: null } : i))
      )
      try {
        const { url, size } = await doConvert(item.file, format, quality)
        setItems((prev) =>
          prev.map((i) =>
            i.id === item.id ? { ...i, status: 'done', resultUrl: url, resultSize: size } : i
          )
        )
      } catch (err) {
        setItems((prev) =>
          prev.map((i) =>
            i.id === item.id
              ? { ...i, status: 'error', errorMsg: err instanceof Error ? err.message : 'Conversion failed' }
              : i
          )
        )
      }
    }
  }

  function downloadOne(item: ConvertItem) {
    if (!item.resultUrl) return
    const baseName = item.file.name.replace(/\.[^/.]+$/, '')
    const ext = format === 'jpg' ? 'jpg' : format
    const a = document.createElement('a')
    a.href = item.resultUrl
    a.download = `${baseName}.${ext}`
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
          const ext = format === 'jpg' ? 'jpg' : format
          zip.file(`${baseName}.${ext}`, blob)
        })
      )
      const blob = await zip.generateAsync({ type: 'blob' })
      const url = URL.createObjectURL(blob)
      const a = document.createElement('a')
      a.href = url
      a.download = 'converted-images.zip'
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
  }

  const doneCount = items.filter((i) => i.status === 'done').length
  const convertingAny = items.some((i) => i.status === 'converting')
  const hasPending = items.some((i) => i.status === 'idle' || i.status === 'error')

  return (
    <div className="flex flex-col gap-5">

      {/* Output format selector */}
      <div>
        <p className="text-xs text-slate-500 font-medium mb-2.5 uppercase tracking-wider">Output Format</p>
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
          {FORMATS.map((f) => (
            <button
              key={f.value}
              onClick={() => setFormat(f.value)}
              className={`flex flex-col items-start px-3 py-2.5 rounded-xl border text-left transition-all ${
                format === f.value
                  ? 'border-indigo-500/60 bg-indigo-500/10 text-indigo-300'
                  : 'border-white/6 bg-white/2 text-slate-400 hover:border-white/10 hover:bg-white/4'
              }`}
            >
              <span className="font-bold text-sm">{f.label}</span>
              <span className="text-[11px] text-slate-600 mt-0.5">{f.desc}</span>
            </button>
          ))}
        </div>
      </div>

      {/* Quality slider — only for lossy formats */}
      {isLossy && (
        <div>
          <div className="flex items-center justify-between mb-2">
            <p className="text-xs text-slate-500 font-medium uppercase tracking-wider">Quality</p>
            <span className="text-xs font-mono text-slate-400">{quality}%</span>
          </div>
          <input
            type="range"
            min={10}
            max={100}
            step={1}
            value={quality}
            onChange={(e) => setQuality(Number(e.target.value))}
            className="w-full accent-indigo-500"
          />
          <div className="flex justify-between text-[10px] text-slate-700 mt-1">
            <span>Smaller file</span>
            <span>Higher quality</span>
          </div>
        </div>
      )}

      {/* Upload zone */}
      <div
        onDrop={onDrop}
        onDragOver={onDragOver}
        onDragLeave={onDragLeave}
        onClick={() => inputRef.current?.click()}
        className={`relative flex flex-col items-center justify-center gap-3 rounded-xl border-2 border-dashed cursor-pointer transition-all p-8 sm:p-12 ${
          dragging
            ? 'border-indigo-500/60 bg-indigo-500/10'
            : 'border-white/8 bg-white/2 hover:border-white/15 hover:bg-white/4'
        }`}
      >
        <input
          ref={inputRef}
          type="file"
          accept="image/*"
          multiple
          className="hidden"
          onChange={(e) => e.target.files && addFiles(e.target.files)}
        />
        <div className="w-10 h-10 rounded-xl bg-indigo-500/15 flex items-center justify-center">
          <svg className="w-5 h-5 text-indigo-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.8}
              d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
          </svg>
        </div>
        <div className="text-center">
          <p className="text-sm text-slate-300 font-medium">Drop images here or click to browse</p>
          <p className="text-xs text-slate-600 mt-1">PNG · JPG · WebP · GIF · BMP · AVIF · TIFF and more</p>
        </div>
      </div>

      {/* File list */}
      {items.length > 0 && (
        <div className="flex flex-col gap-2">
          <div className="flex items-center justify-between mb-1">
            <p className="text-xs text-slate-500 font-medium uppercase tracking-wider">
              {items.length} {items.length === 1 ? 'image' : 'images'}
            </p>
            <button onClick={clearAll} className="text-xs text-slate-700 hover:text-slate-400 transition-colors">
              Clear all
            </button>
          </div>

          {items.map((item) => (
            <div
              key={item.id}
              className="flex flex-col sm:flex-row sm:items-center gap-2 sm:gap-3 p-3 rounded-xl border border-white/6 bg-white/2"
            >
              {/* Preview + info */}
              <div className="flex items-center gap-2 sm:gap-3 min-w-0 sm:flex-1">
                <div className="w-10 h-10 rounded-lg overflow-hidden border border-white/8 bg-white/5 shrink-0">
                  <img src={item.previewUrl} alt="" className="w-full h-full object-cover" decoding="async" />
                </div>

                <div className="flex-1 min-w-0">
                  <p className="text-sm text-slate-300 truncate">{item.file.name}</p>
                  <div className="flex items-center gap-1.5 mt-0.5">
                    <span className="text-[10px] font-mono bg-white/5 text-slate-500 px-1.5 py-0.5 rounded">
                      {inputExt(item.file)}
                    </span>
                    <svg className="w-3 h-3 text-slate-700 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                    </svg>
                    <span className="text-[10px] font-mono bg-indigo-500/15 text-indigo-400 px-1.5 py-0.5 rounded">
                      {format.toUpperCase()}
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
                {item.status === 'converting' && (
                  <span className="text-xs text-indigo-400 flex items-center gap-1.5">
                    <svg className="w-3.5 h-3.5 animate-spin" viewBox="0 0 24 24" fill="none">
                      <circle cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="3" strokeOpacity="0.25"/>
                      <path d="M12 2a10 10 0 0110 10" stroke="currentColor" strokeWidth="3" strokeLinecap="round"/>
                    </svg>
                    Converting
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
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
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
          ))}
        </div>
      )}

      {/* Action buttons */}
      {items.length > 0 && (
        <div className="flex flex-col sm:flex-row gap-3">
          <button
            onClick={convertAll}
            disabled={convertingAny || !hasPending}
            className="flex-1 flex items-center justify-center gap-2 px-5 py-3 rounded-xl bg-linear-to-r from-indigo-600 to-violet-600 text-white text-sm font-semibold disabled:opacity-40 disabled:cursor-not-allowed hover:from-indigo-500 hover:to-violet-500 transition-all shadow-lg shadow-indigo-500/20"
          >
            {convertingAny ? (
              <>
                <svg className="w-4 h-4 animate-spin" viewBox="0 0 24 24" fill="none">
                  <circle cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="3" strokeOpacity="0.25"/>
                  <path d="M12 2a10 10 0 0110 10" stroke="currentColor" strokeWidth="3" strokeLinecap="round"/>
                </svg>
                Converting…
              </>
            ) : (
              <>
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                    d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                </svg>
                Convert to {format.toUpperCase()}
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
