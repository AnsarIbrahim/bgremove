import { ImageResponse } from 'next/og'

export const alt = 'AiTechies Background Remover — Free AI-powered background removal, 100% in-browser'
export const size = { width: 1200, height: 630 }
export const contentType = 'image/png'

export default function Image() {
  return new ImageResponse(
    (
      <div
        style={{
          background: '#030712',
          width: '100%',
          height: '100%',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          fontFamily: 'sans-serif',
          position: 'relative',
          overflow: 'hidden',
        }}
      >
        {/* Purple glow top-left */}
        <div style={{
          position: 'absolute', top: -120, left: -80,
          width: 700, height: 700,
          background: 'radial-gradient(circle, rgba(59,130,246,0.18) 0%, transparent 65%)',
          borderRadius: '50%',
        }} />
        {/* Violet glow top-right */}
        <div style={{
          position: 'absolute', top: -80, right: -80,
          width: 600, height: 600,
          background: 'radial-gradient(circle, rgba(124,58,237,0.15) 0%, transparent 65%)',
          borderRadius: '50%',
        }} />

        {/* Brand row */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 18, marginBottom: 44 }}>
          <div style={{
            width: 72, height: 72, borderRadius: 20,
            background: 'linear-gradient(135deg, #3b82f6 0%, #7c3aed 100%)',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            boxShadow: '0 8px 32px rgba(124,58,237,0.4)',
          }}>
            {/* Lightning bolt SVG */}
            <svg width="40" height="40" fill="none" stroke="white" strokeWidth="2"
              strokeLinecap="round" strokeLinejoin="round" viewBox="0 0 24 24">
              <path d="M13 10V3L4 14h7v7l9-11h-7z" />
            </svg>
          </div>
          <span style={{ color: 'white', fontSize: 38, fontWeight: 800, letterSpacing: '-0.5px' }}>
            AiTechies
          </span>
        </div>

        {/* Hero text */}
        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 12 }}>
          <div style={{
            color: 'white',
            fontSize: 82,
            fontWeight: 800,
            lineHeight: 1.05,
            letterSpacing: '-2px',
            textAlign: 'center',
          }}>
            Remove Backgrounds
          </div>
          <div style={{
            color: '#818cf8',
            fontSize: 56,
            fontWeight: 800,
            letterSpacing: '-1px',
          }}>
            Instantly
          </div>
        </div>

        {/* Subtitle */}
        <div style={{
          color: '#94a3b8',
          fontSize: 26,
          marginTop: 28,
          letterSpacing: '0.3px',
        }}>
          Free · AI-Powered · 100% In-Browser · No Uploads
        </div>

        {/* Tag row */}
        <div style={{ display: 'flex', gap: 14, marginTop: 44 }}>
          {['Up to 10 Images', 'No Sign-up', 'PNG · JPG · WebP'].map((tag) => (
            <div
              key={tag}
              style={{
                padding: '10px 24px',
                borderRadius: 999,
                border: '1px solid rgba(99,102,241,0.5)',
                background: 'rgba(99,102,241,0.12)',
                color: '#a5b4fc',
                fontSize: 20,
                fontWeight: 600,
              }}
            >
              {tag}
            </div>
          ))}
        </div>
      </div>
    ),
    { ...size }
  )
}
