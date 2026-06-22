'use client'

import { useRef, useState } from 'react'

const MAX_FILES = 10

interface Props {
  onFilesSelect: (files: File[]) => void
  disabled: boolean
  preparing?: boolean
  preparingCount?: number
}

export default function UploadZone({ onFilesSelect, disabled, preparing, preparingCount }: Props) {
  const inputRef = useRef<HTMLInputElement>(null)
  const [dragging, setDragging] = useState(false)

  function filterAndLimit(files: FileList | null): File[] {
    if (!files) return []
    return Array.from(files).filter((f) => f.type.startsWith('image/')).slice(0, MAX_FILES)
  }

  function handleDrop(e: React.DragEvent) {
    e.preventDefault()
    setDragging(false)
    const files = filterAndLimit(e.dataTransfer.files)
    if (files.length > 0) onFilesSelect(files)
  }

  function handleChange(e: React.ChangeEvent<HTMLInputElement>) {
    const files = filterAndLimit(e.target.files)
    e.target.value = ''
    if (files.length > 0) onFilesSelect(files)
  }

  return (
    <div
      onClick={() => !disabled && !preparing && inputRef.current?.click()}
      onDragOver={(e) => { e.preventDefault(); if (!preparing) setDragging(true) }}
      onDragLeave={() => setDragging(false)}
      onDrop={handleDrop}
      className={[
        'relative rounded-2xl border-2 border-dashed p-8 sm:p-16 text-center transition-all duration-300 overflow-hidden',
        preparing
          ? 'border-indigo-500/30 bg-indigo-500/5 cursor-default'
          : dragging
          ? 'border-indigo-500/70 bg-indigo-500/[0.07]'
          : 'border-white/8 hover:border-indigo-500/40 hover:bg-white/2',
        disabled && !preparing ? 'opacity-50 cursor-not-allowed' : !preparing ? 'cursor-pointer' : '',
      ].join(' ')}
    >
      <input
        ref={inputRef}
        type="file"
        accept="image/*"
        multiple
        className="hidden"
        onChange={handleChange}
        disabled={disabled || preparing}
      />

      {preparing ? (
        /* Reading files state */
        <div className="flex flex-col items-center gap-5">
          <div className="w-16 h-16 rounded-2xl bg-indigo-500/15 flex items-center justify-center">
            <svg className="w-8 h-8 text-indigo-400 animate-spin" fill="none" viewBox="0 0 24 24">
              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
              <path className="opacity-75" fill="currentColor"
                d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
            </svg>
          </div>
          <div>
            <p className="text-slate-200 font-semibold text-lg">
              Reading {preparingCount} {preparingCount === 1 ? 'image' : 'images'}…
            </p>
            <p className="text-slate-600 text-sm mt-1.5">Setting things up</p>
          </div>
        </div>
      ) : (
        /* Normal upload state */
        <div className="flex flex-col items-center gap-5">
          <div className={[
            'w-16 h-16 rounded-2xl flex items-center justify-center transition-all duration-300',
            dragging ? 'bg-indigo-500/20' : 'bg-white/5',
          ].join(' ')}>
            <svg
              className={['w-8 h-8 transition-colors duration-300', dragging ? 'text-indigo-400' : 'text-slate-600'].join(' ')}
              fill="none" stroke="currentColor" viewBox="0 0 24 24"
            >
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5}
                d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
            </svg>
          </div>

          <div>
            <p className="text-slate-200 font-semibold text-lg">
              {dragging ? 'Drop to process' : 'Drop images here or click to browse'}
            </p>
            <p className="text-slate-600 text-sm mt-1.5">
              Up to {MAX_FILES} images · PNG, JPG, WEBP · Any size
            </p>
          </div>
        </div>
      )}
    </div>
  )
}
