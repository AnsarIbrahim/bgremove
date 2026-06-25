'use client'

import { useState } from 'react'
import BgRemover from '@/components/BgRemover'
import ImageConverter from '@/components/ImageConverter'
import ImageResizer from '@/components/ImageResizer'

type Tab = 'bg' | 'convert' | 'resize'

const TABS: { id: Tab; label: string; icon: React.ReactNode }[] = [
  {
    id: 'bg',
    label: 'Remove BG',
    icon: (
      <svg className="w-4 h-4 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
          d="M9.75 17L9 20l-1 1h8l-1-1-.75-3M3 13h18M5 17h14a2 2 0 002-2V5a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
      </svg>
    ),
  },
  {
    id: 'convert',
    label: 'Convert',
    icon: (
      <svg className="w-4 h-4 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
          d="M8 7h12m0 0l-4-4m4 4l-4 4m0 6H4m0 0l4 4m-4-4l4-4" />
      </svg>
    ),
  },
  {
    id: 'resize',
    label: 'Resize',
    icon: (
      <svg className="w-4 h-4 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
          d="M4 8V4m0 0h4M4 4l5 5m11-1V4m0 0h-4m4 0l-5 5M4 16v4m0 0h4m-4 0l5-5m11 5l-5-5m5 5v-4m0 4h-4" />
      </svg>
    ),
  },
]

const HERO: Record<Tab, { heading: string; accent: string; sub: string }> = {
  bg: {
    heading: 'Remove Backgrounds',
    accent: 'Instantly',
    sub: 'Upload up to 10 images and let AI handle the rest. No server uploads. No API keys.',
  },
  convert: {
    heading: 'Convert Any Image',
    accent: 'In Seconds',
    sub: 'PNG, JPG, WebP, AVIF — pick your format and convert in bulk. Everything stays in your browser.',
  },
  resize: {
    heading: 'Resize Without',
    accent: 'Cropping',
    sub: 'Set a width or height — the other adjusts automatically to keep your image proportional. Up to 10 images at once.',
  },
}

export default function ToolTabs() {
  const [tab, setTab] = useState<Tab>('bg')
  const hero = HERO[tab]

  return (
    <>
      {/* Hero — updates per tab */}
      <h1 className="text-4xl sm:text-5xl lg:text-6xl font-bold text-center leading-tight mb-4 sm:mb-5">
        <span className="text-white">{hero.heading}</span>
        <br />
        <span className="bg-linear-to-r from-blue-400 via-indigo-400 to-violet-400 bg-clip-text text-transparent">
          {hero.accent}
        </span>
      </h1>
      <p className="text-slate-400 text-base sm:text-lg text-center max-w-lg mb-8 sm:mb-10 leading-relaxed">
        {hero.sub}
      </p>

      {/* Tab bar — 3 tabs */}
      <div className="flex p-1 rounded-2xl bg-white/4 border border-white/6 mb-6 w-full max-w-sm sm:max-w-md">
        {TABS.map((t) => (
          <button
            key={t.id}
            onClick={() => setTab(t.id)}
            className={`flex-1 flex items-center justify-center gap-1.5 sm:gap-2 py-2.5 px-2 sm:px-4 rounded-xl text-xs sm:text-sm font-semibold transition-all duration-200 ${
              tab === t.id
                ? 'bg-white/10 text-white shadow-sm'
                : 'text-slate-500 hover:text-slate-300'
            }`}
          >
            {t.icon}
            {t.label}
          </button>
        ))}
      </div>

      {/* Tool card */}
      <div className="w-full max-w-3xl">
        <div className="rounded-2xl border border-white/[0.07] bg-white/2.5 backdrop-blur-2xl p-4 sm:p-8 shadow-2xl shadow-black/50">
          {tab === 'bg'      && <BgRemover />}
          {tab === 'convert' && <ImageConverter />}
          {tab === 'resize'  && <ImageResizer />}
        </div>
      </div>
    </>
  )
}
