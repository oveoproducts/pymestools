import type { Metadata } from 'next'
import './globals.css'
import { Header } from '@/app/components/Header'
import { Footer } from '@/app/components/Footer'
import { SchemaOrgWebsite } from '@/app/components/SchemaOrg'
import { NewsletterBanner } from '@/app/components/NewsletterBanner'
import { GoogleAnalytics } from '@/app/components/GoogleAnalytics'
import brand from '@/data/brand.json'

export const metadata: Metadata = {
  metadataBase: new URL(brand.siteUrl),
  title: {
    default: brand.defaultTitle,
    template: `%s | ${brand.displayName}`,
  },
  description: brand.defaultDescription,
  openGraph: {
    type: 'website',
    locale: brand.locale,
    url: brand.siteUrl,
    siteName: brand.siteName,
  },
  robots: { index: true, follow: true },
  alternates: { canonical: brand.siteUrl },
  verification: {
    google: process.env.NEXT_PUBLIC_GSC_VERIFICATION ?? '',
  },
  twitter: {
    card: 'summary_large_image',
    site: brand.twitterHandle,
    title: brand.defaultTitle,
    description: brand.defaultDescription,
  },
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang={brand.language}>
      <body className="min-h-full flex flex-col antialiased">
        <GoogleAnalytics />
        <SchemaOrgWebsite />
        <Header />
        <main className="flex-1">{children}</main>
        <Footer />
        <NewsletterBanner />
      </body>
    </html>
  )
}
