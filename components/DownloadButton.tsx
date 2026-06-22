'use client'

import { useState } from 'react'
import { ExportFormat } from '@/types'
import { convertToFormat } from '@/lib/convertFormat'

interface Props {
  url: string
  fileName: string
  format: ExportFormat
}

export default function DownloadButton({ url, fileName, format }: Props) {
  const [converting, setConverting] = useState(false)

  async function handleDownload() {
    if (converting) return
    setConverting(true)
    try {
      const baseName = fileName.replace(/\.[^/.]+$/, '')
      const { url: outUrl, ext, revokeAfterUse } = await convertToFormat(url, format)
      const link = document.createElement('a')
      link.href = outUrl
      link.download = `${baseName}-bg-removed.${ext}`
      link.click()
      if (revokeAfterUse) setTimeout(() => URL.revokeObjectURL(outUrl), 1000)
    } finally {
      setConverting(false)
    }
  }

  return (
    <button
      onClick={handleDownload}
      disabled={converting}
      className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-white/6 border border-white/8 text-slate-300 text-xs font-medium hover:bg-indigo-500/15 hover:border-indigo-500/30 hover:text-indigo-300 transition-all disabled:opacity-50 disabled:cursor-wait"
    >
      {converting ? (
        <div className="w-3.5 h-3.5 border-2 border-indigo-500 border-t-transparent rounded-full animate-spin" />
      ) : (
        <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
            d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
        </svg>
      )}
      {converting ? 'Converting…' : 'Download'}
    </button>
  )
}
