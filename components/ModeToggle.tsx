import { Mode } from '@/types'

interface Props {
  mode: Mode
  onChange: (mode: Mode) => void
}

interface ModeConfig {
  value: Mode
  name: string
  isAI: boolean
  eyebrow: string
  headline: string
  description: string
  goodFor: string[]
  notFor: string
  warning?: string
  downloadNote?: string
  icon: React.ReactNode
}

const MODES: ModeConfig[] = [
  {
    value: 'graphic',
    name: 'Graphic',
    isAI: false,
    eyebrow: 'Design files & flat backgrounds',
    headline: 'Made in a design tool, not a camera',
    description:
      'Choose this when your image was created digitally — a logo, banner, flyer, poster, or any graphic with a plain white, solid color, or simple background.',
    goodFor: ['Logos', 'Icons', 'Banners', 'Posters', 'Stickers', 'Flyers'],
    notFor: 'Real photos',
    icon: (
      <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={1.5}>
        <path strokeLinecap="round" strokeLinejoin="round"
          d="m2.25 15.75 5.159-5.159a2.25 2.25 0 0 1 3.182 0l5.159 5.159m-1.5-1.5 1.409-1.409a2.25 2.25 0 0 1 3.182 0l2.909 2.909m-18 3.75h16.5a1.5 1.5 0 0 0 1.5-1.5V6a1.5 1.5 0 0 0-1.5-1.5H3.75A1.5 1.5 0 0 0 2.25 6v12a1.5 1.5 0 0 0 1.5 1.5Zm10.5-11.25h.008v.008h-.008V8.25Zm.375 0a.375.375 0 1 1-.75 0 .375.375 0 0 1 .75 0Z" />
      </svg>
    ),
  },
  {
    value: 'photo',
    name: 'Photo',
    isAI: true,
    eyebrow: 'Real camera or phone photos only',
    headline: 'Shot in the real world with a camera',
    description:
      'Choose this when your image was taken with a camera or phone — a person, product, animal, or scene with a real-world background like a room, outdoors, or a studio.',
    goodFor: ['Portraits', 'Products', 'Animals', 'Nature', 'Studio shots'],
    notFor: 'Logos, banners, or graphic designs',
    warning: 'Using this on graphic designs will erase stars, dots, and decorative elements',
    downloadNote: '~175 MB AI model · downloads once, then cached in your browser',
    icon: (
      <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={1.5}>
        <path strokeLinecap="round" strokeLinejoin="round"
          d="M6.827 6.175A2.31 2.31 0 0 1 5.186 7.23c-.38.054-.757.112-1.134.175C2.999 7.58 2.25 8.507 2.25 9.574V18a2.25 2.25 0 0 0 2.25 2.25h15A2.25 2.25 0 0 0 21.75 18V9.574c0-1.067-.75-1.994-1.802-2.169a47.865 47.865 0 0 0-1.134-.175 2.31 2.31 0 0 1-1.64-1.055l-.822-1.316a2.192 2.192 0 0 0-1.736-1.039 48.774 48.774 0 0 0-5.232 0 2.192 2.192 0 0 0-1.736 1.039l-.821 1.316z" />
        <path strokeLinecap="round" strokeLinejoin="round"
          d="M16.5 12.75a4.5 4.5 0 1 1-9 0 4.5 4.5 0 0 1 9 0ZM18.75 10.5h.008v.008h-.008V10.5z" />
      </svg>
    ),
  },
]

export default function ModeToggle({ mode, onChange }: Props) {
  return (
    <div className="flex flex-col gap-3">
      <div className="flex items-center gap-2">
        <p className="text-xs font-semibold text-slate-500 uppercase tracking-widest">
          Step 1 — What type of image is this?
        </p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
        {MODES.map((m) => {
          const selected = mode === m.value
          return (
            <button
              key={m.value}
              onClick={() => onChange(m.value)}
              className={[
                'relative flex flex-col gap-3 p-4 rounded-2xl border text-left transition-all duration-200',
                selected
                  ? 'border-indigo-500/50 bg-indigo-500/8 shadow-lg shadow-indigo-500/10'
                  : 'border-white/8 bg-white/3 hover:border-white/15 hover:bg-white/5',
              ].join(' ')}
            >
              {/* Selected checkmark */}
              {selected && (
                <div className="absolute top-3 right-3 w-5 h-5 rounded-full bg-linear-to-br from-indigo-500 to-violet-600 flex items-center justify-center shadow-md shadow-indigo-500/30">
                  <svg className="w-3 h-3 text-white" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" clipRule="evenodd"
                      d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" />
                  </svg>
                </div>
              )}

              {/* Icon */}
              <div className={[
                'w-10 h-10 rounded-xl flex items-center justify-center transition-colors',
                selected ? 'bg-indigo-500/20 text-indigo-400' : 'bg-white/6 text-slate-500',
              ].join(' ')}>
                {m.icon}
              </div>

              {/* Eyebrow + name + AI badge */}
              <div>
                <p className={[
                  'text-[10px] font-semibold uppercase tracking-widest mb-1',
                  selected ? 'text-indigo-500' : 'text-slate-600',
                ].join(' ')}>
                  {m.eyebrow}
                </p>
                <div className="flex items-center gap-2">
                  <span className={[
                    'text-sm font-bold',
                    selected ? 'text-white' : 'text-slate-400',
                  ].join(' ')}>
                    {m.name}
                  </span>
                  {m.isAI && (
                    <span className="text-[10px] font-bold px-1.5 py-0.5 rounded-md bg-violet-500/20 text-violet-400 border border-violet-500/20 leading-none tracking-wide">
                      AI
                    </span>
                  )}
                </div>
                <p className={[
                  'text-xs font-medium mt-0.5',
                  selected ? 'text-indigo-300' : 'text-slate-500',
                ].join(' ')}>
                  {m.headline}
                </p>
              </div>

              {/* Plain English description */}
              <p className={[
                'text-xs leading-relaxed',
                selected ? 'text-slate-400' : 'text-slate-600',
              ].join(' ')}>
                {m.description}
              </p>

              {/* Good for */}
              <div className="flex flex-col gap-1.5">
                <p className={[
                  'text-[10px] font-semibold uppercase tracking-wide',
                  selected ? 'text-emerald-500' : 'text-slate-700',
                ].join(' ')}>
                  ✓ Good for
                </p>
                <div className="flex flex-wrap gap-1">
                  {m.goodFor.map((uc) => (
                    <span
                      key={uc}
                      className={[
                        'text-[10px] font-semibold px-2 py-0.5 rounded-full border leading-none',
                        selected
                          ? 'border-indigo-500/25 text-indigo-400 bg-indigo-500/10'
                          : 'border-white/8 text-slate-600 bg-white/4',
                      ].join(' ')}
                    >
                      {uc}
                    </span>
                  ))}
                </div>
              </div>

              {/* Not for */}
              <div className={[
                'flex items-start gap-1.5 px-2.5 py-2 rounded-xl border',
                selected
                  ? 'border-red-500/20 bg-red-500/8'
                  : 'border-white/6 bg-white/3',
              ].join(' ')}>
                <span className="text-red-400 text-[11px] shrink-0 mt-px">✗</span>
                <p className={[
                  'text-[10px] leading-snug font-medium',
                  selected ? 'text-red-400' : 'text-slate-700',
                ].join(' ')}>
                  Not for {m.notFor}
                </p>
              </div>

              {/* Warning — only on photo mode when selected */}
              {m.warning && selected && (
                <div className="flex items-start gap-1.5 px-2.5 py-2 rounded-xl border border-amber-500/25 bg-amber-500/8">
                  <svg className="w-3 h-3 mt-0.5 shrink-0 text-amber-400" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" clipRule="evenodd"
                      d="M8.485 2.495c.673-1.167 2.357-1.167 3.03 0l6.28 10.875c.673 1.167-.17 2.625-1.516 2.625H3.72c-1.347 0-2.189-1.458-1.515-2.625L8.485 2.495zM10 5a.75.75 0 01.75.75v3.5a.75.75 0 01-1.5 0v-3.5A.75.75 0 0110 5zm0 9a1 1 0 100-2 1 1 0 000 2z" />
                  </svg>
                  <p className="text-[10px] text-amber-400 leading-snug">{m.warning}</p>
                </div>
              )}

              {/* AI download note — only shown when Photo is selected */}
              {m.downloadNote && selected && (
                <div className="flex items-start gap-1.5 pt-1 border-t border-white/6">
                  <svg className="w-3 h-3 mt-0.5 shrink-0 text-slate-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                      d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                  <p className="text-[10px] text-slate-700 leading-snug">{m.downloadNote}</p>
                </div>
              )}
            </button>
          )
        })}
      </div>

      {/* Bottom hint */}
      <p className="text-[11px] text-slate-700 text-center leading-snug">
        Not sure? If your image was created in Canva, Photoshop, Illustrator, or downloaded from a stock site — pick <span className="text-slate-500 font-semibold">Graphic</span>.
        If you took it with your phone or camera — pick <span className="text-slate-500 font-semibold">Photo</span>.
      </p>
    </div>
  )
}
