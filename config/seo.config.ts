// config/seo.config.ts - Complete SEO Configuration

export const seoConfig = {
  siteName: 'A2Z',
  siteDescription: "شركة متخصصة في جميع أنواع الكيماويات",
  defaultLanguage: 'ar',
  
  // Social Media Links
  socialLinks: {
    facebook: 'https://facebook.com/a2ztrading',
    twitter: 'https://twitter.com/a2ztrading',
    instagram: 'https://instagram.com/a2ztrading',
    linkedin: 'https://linkedin.com/company/a2z-trading',
    youtube: 'https://youtube.com/@a2ztrading',
  },
  
  // Contact Information
  contact: {
    email: 'info@a2z-trading.com',
    phone: '+201002866565',
    address: 'كوبرى القبة - القاهرة مصر',
  },
  
  // Default Images for Social Sharing
  images: {
    ogImage: '/og-image.jpg',
    twitterImage: '/twitter-image.jpg',
    logo: '/logo.png',
    favicon: '/favicon.ico',
  },
  
  // Default Keywords
  defaultKeywords: [
    'A2Z',
    'كيماويات',
    'كيماويات البناء',
    'دهانات',
    'كيماويات الصباغة',
    'مستحضرات التجميل',
    'منظفات',
    'تجارة كيماويات',
    'مواد بناء',
    'القاهرة',
  ],
  
  // Robots Configuration
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      'max-video-preview': -1,
      'max-image-preview': 'large',
      'max-snippet': -1,
    },
  },
  
  // OpenGraph Defaults
  openGraph: {
    type: 'website' as const,
    locale: 'ar_EG',
    siteName: 'A2Z Trading',
  },
  
  // Twitter Card Defaults
  twitter: {
    card: 'summary_large_image' as const,
    site: '@a2ztrading',
    creator: '@a2ztrading',
  },
  
  // Verification Codes (Add your own when you have them)
  verification: {
    google: '', // Add when you verify with Google Search Console
    yandex: '',
    bing: '',
  },
};

// ============================================
// HELPER FUNCTION: Generate SEO Metadata
// ============================================
export const generateSEO = ({
  title,
  description,
  keywords = [],
  image,
  url,
  type = 'website',
  noIndex = false,
}: {
  title: string;
  description?: string;
  keywords?: string[];
  image?: string;
  url?: string;
  type?: 'website' | 'article' | 'product';
  noIndex?: boolean;
}) => {
  const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || 'http://localhost:3000';
  const fullUrl = url ? `${baseUrl}${url}` : baseUrl;
  const ogImage = image || `${baseUrl}${seoConfig.images.ogImage}`;
  
  return {
    title: `${title} `,
    description: description || seoConfig.siteDescription,
    keywords: [...seoConfig.defaultKeywords, ...keywords],
    robots: noIndex ? { index: false, follow: false } : seoConfig.robots,
    openGraph: {
      ...seoConfig.openGraph,
      title: `${title} | ${seoConfig.siteName}`,
      description: description || seoConfig.siteDescription,
      url: fullUrl,
      type,
      images: [
        {
          url: ogImage,
          width: 1200,
          height: 630,
          alt: title,
        },
      ],
    },
    twitter: {
      ...seoConfig.twitter,
      title: `${title} | ${seoConfig.siteName}`,
      description: description || seoConfig.siteDescription,
      images: [image || `${baseUrl}${seoConfig.images.twitterImage}`],
    },
    alternates: {
      canonical: fullUrl,
      languages: {
        'ar': fullUrl,
        'en': `${baseUrl}/en${url || ''}`,
      },
    },
  };
};

// ============================================
// Organization Schema
// ============================================
export const organizationSchema = {
  '@context': 'https://schema.org',
  '@type': 'Organization',
  'name': seoConfig.siteName,
  'description': seoConfig.siteDescription,
  'url': process.env.NEXT_PUBLIC_BASE_URL || 'http://localhost:3000',
  'logo': `${process.env.NEXT_PUBLIC_BASE_URL || 'http://localhost:3000'}${seoConfig.images.logo}`,
  'contactPoint': {
    '@type': 'ContactPoint',
    'telephone': seoConfig.contact.phone,
    'contactType': 'Customer Service',
    'email': seoConfig.contact.email,
    'availableLanguage': ['Arabic', 'English'],
    'areaServed': 'EG',
  },
  'address': {
    '@type': 'PostalAddress',
    'addressCountry': 'EG',
    'addressLocality': 'Cairo',
    'streetAddress': seoConfig.contact.address,
  },
  'sameAs': Object.values(seoConfig.socialLinks),
};

// ============================================
// Website Schema
// ============================================
export const websiteSchema = {
  '@context': 'https://schema.org',
  '@type': 'WebSite',
  'name': seoConfig.siteName,
  'description': seoConfig.siteDescription,
  'url': process.env.NEXT_PUBLIC_BASE_URL || 'http://localhost:3000',
  'potentialAction': {
    '@type': 'SearchAction',
    'target': {
      '@type': 'EntryPoint',
      'urlTemplate': `${process.env.NEXT_PUBLIC_BASE_URL || 'http://localhost:3000'}/search?q={search_term_string}`,
    },
    'query-input': 'required name=search_term_string',
  },
  'inLanguage': 'ar',
};

// ============================================
// Breadcrumb Helper
// ============================================
export const generateBreadcrumb = (items: Array<{ name: string; url: string }>) => {
  const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || 'http://localhost:3000';
  
  return {
    '@context': 'https://schema.org',
    '@type': 'BreadcrumbList',
    'itemListElement': items.map((item, index) => ({
      '@type': 'ListItem',
      'position': index + 1,
      'name': item.name,
      'item': `${baseUrl}${item.url}`,
    })),
  };
};