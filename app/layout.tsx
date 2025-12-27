// app/layout.tsx - Server Component with SEO Config
import "./globals.css";
import AppShell from "@/components/Layout/AppShell";
import GoogleTranslate from "@/components/Layout/Translator/GoogleTranslator";
import ClientProviders from "@/components/providers/ClientProvider";
import { Metadata } from "next";
import { seoConfig, organizationSchema, websiteSchema } from "@/config/seo.config";

// ============================================
// ROOT METADATA (SEO) - Using Config
// ============================================
export const metadata: Metadata = {
  title: {
    default: `${seoConfig.siteName} | ${seoConfig.siteDescription.substring(0, 60)}...`,
    template: `%s | ${seoConfig.siteName}`
  },
  description: seoConfig.siteDescription,
  keywords: seoConfig.defaultKeywords,
  authors: [{ name: seoConfig.siteName }],
  creator: seoConfig.siteName,
  publisher: seoConfig.siteName,
  formatDetection: {
    email: false,
    address: false,
    telephone: false,
  },
  metadataBase: new URL(process.env.NEXT_PUBLIC_BASE_URL || 'http://localhost:3000'),
  alternates: {
    canonical: '/',
    languages: {
      'ar': '/',
      'en': '/en',
    },
  },
  openGraph: {
    type: 'website',
    locale: 'ar_EG',
    url: '/',
    siteName: seoConfig.siteName,
    title: seoConfig.siteName,
    description: seoConfig.siteDescription,
    images: [
      {
        url: seoConfig.images.ogImage,
        width: 1200,
        height: 630,
        alt: `${seoConfig.siteName} Logo`,
      },
    ],
  },
  twitter: {
    card: 'summary_large_image',
    title: seoConfig.siteName,
    description: seoConfig.siteDescription,
    images: [seoConfig.images.twitterImage],
    site: seoConfig.twitter.site,
    creator: seoConfig.twitter.creator,
  },
  // robots: seoConfig.robots,
  icons: {
    icon: seoConfig.images.favicon,
    shortcut: seoConfig.images.favicon,
    apple: '/apple-touch-icon.png',
  },
  // manifest: '/site.webmanifest',
  verification: seoConfig.verification,
};

// ============================================
// VIEWPORT CONFIGURATION
// ============================================
export const viewport = {
  width: 'device-width',
  initialScale: 1,
  maximumScale: 5,
  userScalable: true,
  themeColor: [
    { media: '(prefers-color-scheme: light)', color: '#ffffff' },
    { media: '(prefers-color-scheme: dark)', color: '#1a202c' },
  ],
};

// ============================================
// ROOT LAYOUT (Server Component)
// ============================================
export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang={seoConfig.defaultLanguage} dir="rtl">
      <head>
        {/* Preconnect to improve performance */}
       <link 
    rel="preload" 
    href="/fonts/beiruti/static/Beiruti-Regular.ttf" 
    as="font" 
    type="font/truetype"
    crossOrigin="anonymous"
  />
  
  {/* Contact Information (for search engines) */}
  <meta name="contact" content={seoConfig.contact.email} />
  <meta name="geo.region" content="EG-C" />
  <meta name="geo.placename" content="Cairo" />
      </head>
      
      <body className="antialiased">
        
        {/* All Client Providers */}
        <ClientProviders>
          <AppShell>
            {children}
          </AppShell>
        </ClientProviders>

        {/* Organization Schema (using config) */}
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{
            __html: JSON.stringify(organizationSchema)
          }}
        />

        {/* Website Schema (using config) */}
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{
            __html: JSON.stringify(websiteSchema)
          }}
        />

        {/* Local Business Schema */}
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{
            __html: JSON.stringify({
              '@context': 'https://schema.org',
              '@type': 'LocalBusiness',
              'name': seoConfig.siteName,
              'description': seoConfig.siteDescription,
              'image': `${process.env.NEXT_PUBLIC_BASE_URL || 'http://localhost:3000'}${seoConfig.images.logo}`,
              'telephone': seoConfig.contact.phone,
              'email': seoConfig.contact.email,
              'address': {
                '@type': 'PostalAddress',
                'streetAddress': seoConfig.contact.address,
                'addressLocality': 'Cairo',
                'addressCountry': 'EG'
              },
              'geo': {
                '@type': 'GeoCoordinates',
                'latitude': 30.0444,
                'longitude': 31.2357
              },
              'url': process.env.NEXT_PUBLIC_BASE_URL || 'http://localhost:3000',
              'sameAs': Object.values(seoConfig.socialLinks),
              'priceRange': '$$',
              'openingHours': 'Mo-Su 09:00-18:00',
            })
          }}
        />
      </body>
    </html>
  );
}