import { MetadataRoute } from 'next'

export default function robots(): MetadataRoute.Robots {
  return {
    rules: {
      userAgent: '*',
      allow: '/',
      disallow: ['/admin/', '/api/', '/dashboard/settings/'],
    },
    sitemap: 'https://smartlearn-edu.org/sitemap.xml',
  }
}
