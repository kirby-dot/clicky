import type { Metadata } from 'next'
import './globals.css'

export const metadata: Metadata = {
  title: 'Clicky - Your Links, Beautifully Organized',
  description: 'Create a stunning link-in-bio page in minutes. Share all your important links in one beautiful place.',
  keywords: ['linktree', 'link in bio', 'bio link', 'social links'],
  authors: [{ name: 'Clicky' }],
  openGraph: {
    type: 'website',
    locale: 'en_US',
    url: 'https://clicky.link',
    siteName: 'Clicky',
    title: 'Clicky - Your Links, Beautifully Organized',
    description: 'Create a stunning link-in-bio page in minutes.',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Clicky - Your Links, Beautifully Organized',
    description: 'Create a stunning link-in-bio page in minutes.',
  },
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en">
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&display=swap" rel="stylesheet" />
      </head>
      <body className="font-sans">{children}</body>
    </html>
  )
}
