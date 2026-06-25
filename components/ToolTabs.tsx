'use client'

import { useState } from 'react'
import BgRemover from '@/components/BgRemover'
import ImageConverter from '@/components/ImageConverter'

type Tab = 'bg' | 'convert'

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
    label: 'Convert Format',
    icon: (
      <svg className="w-4 h-4 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
          d="M8 7h12m0 0l-4-4m4 4l-4 4m0 6H4m0 0l4 4m-4-4l4-4" />
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

      {/* Tab bar */}
      <div className="flex p-1 rounded-2xl bg-white/[0.04] border border-white/[0.06] mb-6 w-full max-w-xs sm:max-w-sm">
        {TABS.map((t) => (
          <button
            key={t.id}
            onClick={() => setTab(t.id)}
            className={`flex-1 flex items-center justify-center gap-2 py-2.5 px-3 sm:px-5 rounded-xl text-sm font-semibold transition-all duration-200 ${
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
        </div>
      </div>
    </>
  )
}
