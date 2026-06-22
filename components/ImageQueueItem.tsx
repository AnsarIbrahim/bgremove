import { BatchItem, ExportFormat, ItemPhase } from '@/types'
import DownloadButton from '@/components/DownloadButton'

interface Props {
  item: BatchItem
  index: number
  format: ExportFormat
}

const checkerboard = {
  backgroundImage:
    'linear-gradient(45deg,#2a2a3e 25%,transparent 25%),linear-gradient(-45deg,#2a2a3e 25%,transparent 25%),linear-gradient(45deg,transparent 75%,#2a2a3e 75%),linear-gradient(-45deg,transparent 75%,#2a2a3e 75%)',
  backgroundSize: '10px 10px',
  backgroundPosition: '0 0,0 5px,5px -5px,-5px 0',
  backgroundColor: '#1a1a2e',
}

function StatusBadge({
  status,
  phase,
  downloadProgress,
}: {
  status: BatchItem['status']
  phase?: ItemPhase
  downloadProgress?: number
}) {
  if (status === 'pending') return (
    <span className="text-xs text-slate-700 font-medium">Waiting</span>
  )

  if (status === 'processing') {
    if (phase === 'downloading' && downloadProgress != null) {
      return (
        <div className="flex flex-col gap-1.5 min-w-20 sm:min-w-24">
          <div className="flex items-center justify-between gap-2">
            <span className="text-xs text-indigo-400 font-medium">AI Model</span>
            <span className="text-xs text-indigo-400 font-medium tabular-nums">{downloadProgress}%</span>
          </div>
          <div className="w-full h-0.5 bg-white/8 rounded-full overflow-hidden">
            <div
              className="h-full bg-linear-to-r from-indigo-500 to-violet-500 rounded-full transition-all duration-300"
              style={{ width: `${downloadProgress}%` }}
            />
          </div>
          <span className="text-[10px] text-slate-700 leading-none">First run · cached after</span>
        </div>
      )
    }
    return (
      <div className="flex items-center gap-1.5">
        <div className="w-3 h-3 border-2 border-indigo-500 border-t-transparent rounded-full animate-spin" />
        <span className="text-xs text-indigo-400 font-medium">Removing…</span>
      </div>
    )
  }

  if (status === 'error') return (
    <span className="text-xs text-red-400 font-medium">Failed</span>
  )

  return (
    <div className="flex items-center gap-1">
      <svg className="w-3.5 h-3.5 text-emerald-400" fill="currentColor" viewBox="0 0 20 20">
        <path fillRule="evenodd" clipRule="evenodd"
          d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" />
      </svg>
      <span className="text-xs text-emerald-400 font-medium">Done</span>
    </div>
  )
}

export default function ImageQueueItem({ item, index, format }: Props) {
  return (
    <div className="flex flex-col sm:flex-row sm:items-center gap-2 sm:gap-3 p-3 rounded-xl border border-white/6 bg-white/2 hover:bg-white/4 transition-colors">

      {/* Thumbnails + file info */}
      <div className="flex items-center gap-2 sm:gap-3 min-w-0 sm:flex-1">
        <span className="text-xs text-slate-700 w-5 text-center font-mono shrink-0">
          {String(index + 1).padStart(2, '0')}
        </span>

        {/* Original thumb */}
        <div className="w-10 h-10 sm:w-12 sm:h-12 rounded-lg overflow-hidden border border-white/8 bg-white/5 shrink-0">
          <img src={item.originalUrl} alt="" className="w-full h-full object-cover" decoding="async" />
        </div>

        {/* Arrow */}
        <svg className="w-3.5 h-3.5 text-slate-700 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
        </svg>

        {/* Result thumb */}
        <div
          className="w-10 h-10 sm:w-12 sm:h-12 rounded-lg overflow-hidden border border-white/8 shrink-0 flex items-center justify-center"
          style={item.status === 'done' ? checkerboard : { background: 'rgba(255,255,255,0.03)' }}
        >
          {item.resultUrl ? (
            <img src={item.resultUrl} alt="" className="w-full h-full object-cover" decoding="async" />
          ) : item.status === 'processing' ? (
            <div className="w-4 h-4 border-2 border-indigo-500 border-t-transparent rounded-full animate-spin" />
          ) : null}
        </div>

        {/* File info */}
        <div className="flex-1 min-w-0">
          <p className="text-sm text-slate-300 truncate">{item.file.name}</p>
          {item.width > 0 && (
            <p className="text-xs text-slate-700 mt-0.5">{item.width} × {item.height}px</p>
          )}
        </div>
      </div>

      {/* Status + download — own row on mobile, inline on desktop */}
      {/* pl-7 aligns under thumbnails (skips the w-5 index + gap-2) */}
      <div className="flex items-center justify-end gap-2 sm:gap-3 sm:shrink-0 pl-7 sm:pl-0">
        <StatusBadge
          status={item.status}
          phase={item.phase}
          downloadProgress={item.downloadProgress}
        />
        {item.status === 'done' && item.resultUrl && (
          <DownloadButton url={item.resultUrl} fileName={item.file.name} format={format} />
        )}
      </div>

    </div>
  )
}
