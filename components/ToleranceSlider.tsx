interface Props {
  value: number
  onChange: (value: number) => void
}

const PRESETS = [
  {
    label: 'Tight',
    value: 15,
    description: 'Only removes pixels that exactly match the background color. Best for sharp, high-contrast edges.',
  },
  {
    label: 'Balanced',
    value: 30,
    description: 'Also removes pixels that are close in color to the background. Works well for most designs.',
  },
  {
    label: 'Wide',
    value: 60,
    description: 'Removes a wider range of similar colors. Good for soft, blended, or gradient-edge backgrounds.',
  },
]

function activePreset(value: number) {
  if (value <= 22) return 'Tight'
  if (value <= 45) return 'Balanced'
  return 'Wide'
}

function description(value: number) {
  if (value <= 22) return PRESETS[0].description
  if (value <= 45) return PRESETS[1].description
  return PRESETS[2].description
}

export default function ToleranceSlider({ value, onChange }: Props) {
  const active = activePreset(value)

  return (
    <div className="flex flex-col gap-4 p-4 rounded-2xl bg-white/3 border border-white/8">
      {/* Header */}
      <div>
        <p className="text-xs font-semibold text-slate-400 uppercase tracking-widest mb-0.5">
          How strict?
        </p>
        <p className="text-xs text-slate-700">
          Controls how aggressively the background is detected and removed
        </p>
      </div>

      {/* Preset chips */}
      <div className="grid grid-cols-3 gap-2">
        {PRESETS.map((preset) => {
          const isActive = active === preset.label
          return (
            <button
              key={preset.label}
              onClick={() => onChange(preset.value)}
              className={[
                'py-2.5 rounded-xl text-xs font-semibold transition-all duration-200',
                isActive
                  ? 'bg-linear-to-r from-indigo-600 to-violet-600 text-white shadow-lg shadow-indigo-500/20'
                  : 'bg-white/5 text-slate-500 border border-white/8 hover:text-slate-300 hover:bg-white/8',
              ].join(' ')}
            >
              {preset.label}
            </button>
          )
        })}
      </div>

      {/* Fine-tune slider */}
      <div className="flex flex-col gap-1.5">
        <input
          type="range"
          min={5}
          max={100}
          value={value}
          onChange={(e) => onChange(Number(e.target.value))}
        />
        <div className="flex justify-between text-[10px] text-slate-700">
          <span>More precise</span>
          <span>More aggressive</span>
        </div>
      </div>

      {/* Plain English explanation */}
      <p className="text-xs text-slate-500 leading-relaxed border-t border-white/6 pt-3">
        {description(value)}
      </p>
    </div>
  )
}
