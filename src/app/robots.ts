import type { MetadataRoute } from 'next';

export default function robots(): MetadataRoute.Robots {
  return {
    rules: [
      {
        userAgent: '*',
        allow: '/',
        disallow: ['/favoriler', '/profil', '/stok', '/plan', '/alisveris', '/oneriler', '/hane', '/hosgeldin'],
      },
    ],
    sitemap: 'https://chefmate-web-five.vercel.app/sitemap.xml',
  };
}
