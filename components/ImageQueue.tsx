'use client'

import { useState } from 'react'
import { BatchItem, ExportFormat } from '@/types'
import { downloadAllAsZip } from '@/lib/downloadZip'
import ImageQueueItem from '@/components/ImageQueueItem'

interface Props {
  items: BatchItem[]
  onReset: () => void
}

const FORMAT_OPTIONS: { value: ExportFormat; label: string; note?: string }[] = [
  { value: 'png', label: 'PNG' },
  { value: 'jpg', label: 'JPG', note: 'background becomes white' },
  { value: 'webp', label: 'WebP' },
]

export default function ImageQueue({ items, onReset }: Props) {
  const [zipping, setZipping] = useState(false)
  const [format, setFormat] = useState<ExportFormat>('png')

  const doneCount = items.filter((i) => i.status === 'done').length
  const totalCount = items.length
  const allFinished = items.every((i) => i.status === 'done' || i.status === 'error')

  async function handleDownloadAll() {
    setZipping(true)
    await downloadAllAsZip(items, format)
    setZipping(false)
  }

  const activeNote = FORMAT_OPTIONS.find((f) => f.value === format)?.note

  return (
    <div className="flex flex-col gap-5">
      {/* Header */}
      <div className="flex items-start justify-between">
        <div>
          <p className="text-sm font-semibold text-slate-200">
            {doneCount} of {totalCount} processed
          </p>
          <p className="text-xs text-slate-600 mt-0.5">
            {allFinished ? 'All done' : 'Processing one by one…'}
          </p>
        </div>
        {allFinished && (
          <button
            onClick={onReset}
            className="text-xs text-slate-600 hover:text-slate-400 transition-colors"
          >
            Start over
          </button>
        )}
      </div>

      {/* Progress bar */}
      <div className="h-px bg-white/6 rounded-full overflow-hidden">
        <div
          className="h-full bg-linear-to-r from-indigo-500 to-violet-500 rounded-full transition-all duration-500"
          style={{ width: `${(doneCount / totalCount) * 100}%` }}
        />
      </div>

      {/* Items */}
      <div className="flex flex-col gap-2">
        {items.map((item, index) => (
          <ImageQueueItem key={item.id} item={item} index={index} format={format} />
        ))}
      </div>

      {/* Format picker + Download All */}
      {allFinished && doneCount > 0 && (
        <div className="flex flex-col gap-3 pt-1">
          {/* Format selector */}
          <div className="flex items-center gap-3 flex-wrap">
            <span className="text-xs text-slate-500 font-medium shrink-0">Save as</span>
            <div className="flex gap-1.5">
              {FORMAT_OPTIONS.map(({ value, label }) => (
                <button
                  key={value}
                  onClick={() => setFormat(value)}
                  className={[
                    'px-3 py-1.5 rounded-lg text-xs font-bold uppercase tracking-wide transition-all',
                    format === value
                      ? 'bg-linear-to-r from-indigo-600 to-violet-600 text-white shadow-md shadow-indigo-500/20'
                      : 'bg-white/5 text-slate-500 border border-white/8 hover:text-slate-300 hover:bg-white/8',
                  ].join(' ')}
                >
                  {label}
                </button>
              ))}
            </div>
            {activeNote && (
              <span className="text-[10px] text-slate-700">· {activeNote}</span>
            )}
          </div>

          {/* Download All */}
          <button
            onClick={handleDownloadAll}
            disabled={zipping}
            className="flex items-center justify-center gap-2 w-full py-3.5 rounded-xl bg-linear-to-r from-indigo-600 to-violet-600 text-white font-semibold hover:from-indigo-500 hover:to-violet-500 active:scale-[0.99] transition-all shadow-lg shadow-indigo-500/20 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
            </svg>
            {zipping ? 'Preparing ZIP…' : `Download All (${doneCount}) as ZIP`}
          </button>
        </div>
      )}
    </div>
  )
}
