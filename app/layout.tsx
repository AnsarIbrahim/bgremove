import type { Metadata } from 'next'
import { Geist, Geist_Mono } from 'next/font/google'
import './globals.css'

const geistSans = Geist({
  variable: '--font-geist-sans',
  subsets: ['latin'],
})

const geistMono = Geist_Mono({
  variable: '--font-geist-mono',
  subsets: ['latin'],
})

// Update NEXT_PUBLIC_SITE_URL in Netlify env vars once you know your production URL
const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL ?? 'https://bgremove.aitechies.in'

export const metadata: Metadata = {
  metadataBase: new URL(SITE_URL),

  title: {
    default: 'Free Background Remover — AiTechies',
    template: '%s | AiTechies Background Remover',
  },

  description:
    'Remove image backgrounds free in seconds. Up to 10 images at once, 100% in-browser — no uploads, no sign-up, complete privacy. Download as PNG, JPG, or WebP.',

  keywords: [
    'background remover',
    'remove background from image',
    'background eraser',
    'transparent background',
    'free background remover',
    'AI background removal',
    'remove background online',
    'image background remover',
    'photo background remover',
    'remove white background',
    'logo background remover',
    'graphic design tool',
    'no upload background remover',
    'privacy background remover',
    'bulk background remover',
  ],

  authors: [
    { name: 'Ansar Ibrahim', url: 'https://ansaribrahim.me' },
    { name: 'AiTechies', url: 'https://aitechies.in' },
  ],
  creator: 'AiTechies',
  publisher: 'AiTechies',
  applicationName: 'AiTechies Background Remover',
  category: 'technology',
  referrer: 'origin-when-cross-origin',

  alternates: {
    canonical: SITE_URL,
  },

  openGraph: {
    type: 'website',
    locale: 'en_US',
    url: SITE_URL,
    siteName: 'AiTechies Background Remover',
    title: 'Free Background Remover — Remove Image Backgrounds Instantly',
    description:
      'Remove image backgrounds free in seconds. Up to 10 images at once, 100% in-browser — no uploads, no sign-up, complete privacy.',
    images: [
      {
        url: '/opengraph-image',
        width: 1200,
        height: 630,
        alt: 'AiTechies Background Remover — Free AI-powered background removal, 100% in-browser',
      },
    ],
  },

  twitter: {
    card: 'summary_large_image',
    title: 'Free Background Remover — Remove Image Backgrounds Instantly',
    description:
      'Remove image backgrounds free in seconds. Up to 10 images at once, 100% in-browser. No uploads, complete privacy.',
    images: ['/opengraph-image'],
    creator: '@aitechies',
    site: '@aitechies',
  },

  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      'max-image-preview': 'large',
      'max-snippet': -1,
      'max-video-preview': -1,
    },
  },
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html
      lang="en"
      className={`${geistSans.variable} ${geistMono.variable} h-full antialiased`}
    >
      <body className="min-h-full flex flex-col">{children}</body>
    </html>
  )
}
