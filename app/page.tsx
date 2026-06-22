import BgRemover from '@/components/BgRemover'

const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL ?? 'https://bgremove.aitechies.in'

const jsonLd = {
  '@context': 'https://schema.org',
  '@graph': [
    // ── WebApplication ─────────────────────────────────────────────────────────
    // GEO: tells AI engines exactly what this tool is, who made it, and what it costs
    {
      '@type': 'WebApplication',
      '@id': `${SITE_URL}/#app`,
      name: 'AiTechies Background Remover',
      url: SITE_URL,
      applicationCategory: 'MultimediaApplication',
      operatingSystem: 'Any',
      browserRequirements: 'Requires a modern browser with WebAssembly support',
      description:
        'Free AI-powered background removal tool. Process up to 10 images in one batch, 100% client-side — no server uploads, no API keys, complete privacy.',
      featureList: [
        'AI photo background removal (RMBG-1.4)',
        'Graphic mode flood-fill algorithm for logos and designs',
        'Batch processing up to 10 images',
        'Download as PNG, JPG, or WebP',
        '100% client-side — images never leave your device',
        'No sign-up or account required',
        'Completely free',
      ],
      offers: {
        '@type': 'Offer',
        price: '0',
        priceCurrency: 'USD',
        availability: 'https://schema.org/InStock',
      },
      creator: {
        '@type': 'Organization',
        '@id': 'https://aitechies.in/#org',
        name: 'AiTechies',
        url: 'https://aitechies.in',
        founder: {
          '@type': 'Person',
          name: 'Ansar Ibrahim',
          url: 'https://ansaribrahim.me',
        },
      },
    },

    // ── Organization ───────────────────────────────────────────────────────────
    // GEO: entity definition so AI models correctly associate the brand
    {
      '@type': 'Organization',
      '@id': 'https://aitechies.in/#org',
      name: 'AiTechies',
      url: 'https://aitechies.in',
      description: 'AI tools and software built for everyone — fast, free, and private.',
      founder: {
        '@type': 'Person',
        name: 'Ansar Ibrahim',
        url: 'https://ansaribrahim.me',
      },
    },

    // ── FAQPage ────────────────────────────────────────────────────────────────
    // AEO: direct Q&A markup for Google AI Overviews, Perplexity, ChatGPT citations
    {
      '@type': 'FAQPage',
      mainEntity: [
        {
          '@type': 'Question',
          name: 'Is this background remover completely free?',
          acceptedAnswer: {
            '@type': 'Answer',
            text: 'Yes. AiTechies Background Remover is 100% free with no sign-up, no account, and no usage limits.',
          },
        },
        {
          '@type': 'Question',
          name: 'Does it upload my images to a server?',
          acceptedAnswer: {
            '@type': 'Answer',
            text: 'No. All processing happens entirely inside your browser using WebAssembly. Your images never leave your device, making it completely private.',
          },
        },
        {
          '@type': 'Question',
          name: 'What image formats are supported for upload and download?',
          acceptedAnswer: {
            '@type': 'Answer',
            text: 'You can upload PNG, JPG, and WebP images. Results can be downloaded as PNG (with transparency), JPG (transparent areas become white), or WebP.',
          },
        },
        {
          '@type': 'Question',
          name: 'What is the difference between Graphic mode and Photo mode?',
          acceptedAnswer: {
            '@type': 'Answer',
            text: 'Graphic mode uses a flood-fill algorithm — best for logos, banners, posters, and any digitally-created image with a flat background. Photo mode uses the RMBG-1.4 AI model — best for real photographs of people, products, or scenes taken with a camera or phone. Using Photo mode on graphic designs can erase small decorative elements like stars and dots.',
          },
        },
        {
          '@type': 'Question',
          name: 'Can I remove backgrounds from multiple images at once?',
          acceptedAnswer: {
            '@type': 'Answer',
            text: 'Yes. You can upload and process up to 10 images in a single batch. Results appear as each image is completed.',
          },
        },
        {
          '@type': 'Question',
          name: 'Why are small details like stars or dots disappearing from my graphic?',
          acceptedAnswer: {
            '@type': 'Answer',
            text: 'This happens when Photo mode is used on graphic designs. Photo mode AI treats scattered decorative elements as background noise. Switch to Graphic mode for logos, banners, posters, or any image created in Canva, Illustrator, or Photoshop.',
          },
        },
      ],
    },

    // ── HowTo ──────────────────────────────────────────────────────────────────
    // AEO: step-by-step schema for voice search and "how to" queries
    {
      '@type': 'HowTo',
      name: 'How to Remove a Background from an Image',
      description:
        'Remove the background from any image in seconds — free, instant, and 100% in-browser with AiTechies Background Remover.',
      totalTime: 'PT30S',
      tool: {
        '@type': 'HowToTool',
        name: 'AiTechies Background Remover',
        url: SITE_URL,
      },
      step: [
        {
          '@type': 'HowToStep',
          position: 1,
          name: 'Choose the right mode',
          text: 'Select Graphic mode for logos, banners, posters, and any digitally-created image. Select Photo mode for real photographs taken with a camera or phone.',
        },
        {
          '@type': 'HowToStep',
          position: 2,
          name: 'Upload your images',
          text: 'Drop up to 10 images onto the upload zone, or click to browse your files. PNG, JPG, and WebP are all supported.',
        },
        {
          '@type': 'HowToStep',
          position: 3,
          name: 'Wait for processing',
          text: 'The background is removed instantly inside your browser — no upload required. Results appear as each image is processed.',
        },
        {
          '@type': 'HowToStep',
          position: 4,
          name: 'Download your result',
          text: 'Choose your output format — PNG (transparent), JPG (white background), or WebP — then download individually or all at once as a ZIP file.',
        },
      ],
    },
  ],
}

export default function Home() {
  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />

      <main className="min-h-screen bg-[#030712] relative overflow-hidden">

        {/* Background glow orbs */}
        <div className="absolute -top-60 -left-40 w-175 h-175 bg-blue-600/10 rounded-full blur-[130px] pointer-events-none" />
        <div className="absolute -top-40 -right-40 w-150 h-150 bg-violet-600/10 rounded-full blur-[120px] pointer-events-none" />
        <div className="absolute bottom-0 left-1/2 -translate-x-1/2 w-200 h-75 bg-indigo-600/5 rounded-full blur-[100px] pointer-events-none" />

        <div className="relative z-10 flex flex-col items-center px-4 py-8 sm:py-16 min-h-screen">

          {/* Brand */}
          <div className="flex items-center gap-2.5 mb-8 sm:mb-14">
            <div className="w-9 h-9 rounded-xl bg-linear-to-br from-blue-500 to-violet-600 flex items-center justify-center shadow-lg shadow-violet-500/25">
              <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
              </svg>
            </div>
            <span className="text-white font-bold text-xl tracking-tight">AiTechies</span>
          </div>

          {/* Live badge */}
          <div className="flex items-center gap-2 px-4 py-1.5 rounded-full border border-indigo-500/25 bg-indigo-500/10 mb-5 sm:mb-8">
            <div className="w-1.5 h-1.5 rounded-full bg-indigo-400 animate-pulse" />
            <span className="text-indigo-300 text-xs font-medium tracking-wide">
              AI-Powered · 100% In-Browser · Free & Open Source
            </span>
          </div>

          {/* Hero */}
          <h1 className="text-4xl sm:text-5xl lg:text-6xl font-bold text-center leading-tight mb-4 sm:mb-5">
            <span className="text-white">Remove Backgrounds</span>
            <br />
            <span className="bg-linear-to-r from-blue-400 via-indigo-400 to-violet-400 bg-clip-text text-transparent">
              Instantly
            </span>
          </h1>
          <p className="text-slate-400 text-base sm:text-lg text-center max-w-lg mb-8 sm:mb-14 leading-relaxed">
            Upload up to 10 images and let AI handle the rest.
            <br />
            <span className="text-slate-600 text-sm">No server uploads. No API keys. Everything runs in your browser.</span>
          </p>

          {/* Main card */}
          <div className="w-full max-w-3xl">
            <div className="rounded-2xl border border-white/[0.07] bg-white/2.5 backdrop-blur-2xl p-4 sm:p-8 shadow-2xl shadow-black/50">
              <BgRemover />
            </div>
          </div>

          {/* Footer */}
          <p className="text-slate-700 text-xs mt-10 text-center">
            Built by{' '}
            <a href="https://aitechies.in/" target="_blank" rel="noopener noreferrer"
              className="text-slate-500 hover:text-slate-300 transition-colors">
              AiTechies
            </a>
            {' · '}
            <a href="https://ansaribrahim.me/" target="_blank" rel="noopener noreferrer"
              className="text-slate-500 hover:text-slate-300 transition-colors">
              Ansar Ibrahim
            </a>
          </p>

        </div>
      </main>
    </>
  )
}
