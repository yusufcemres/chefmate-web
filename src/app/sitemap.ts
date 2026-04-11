import type { MetadataRoute } from 'next';

const API_BASE = process.env.NEXT_PUBLIC_API_URL || 'https://chefmate-api-production.up.railway.app/api/v1';
const SITE_URL = 'https://chefmate-web-five.vercel.app';

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const staticRoutes: MetadataRoute.Sitemap = [
    { url: SITE_URL, lastModified: new Date(), changeFrequency: 'daily', priority: 1 },
    { url: `${SITE_URL}/tarif`, lastModified: new Date(), changeFrequency: 'daily', priority: 0.9 },
    { url: `${SITE_URL}/koleksiyon`, lastModified: new Date(), changeFrequency: 'weekly', priority: 0.7 },
    { url: `${SITE_URL}/giris`, changeFrequency: 'monthly', priority: 0.3 },
    { url: `${SITE_URL}/kayit`, changeFrequency: 'monthly', priority: 0.3 },
  ];

  // Dynamic recipe pages
  let recipeRoutes: MetadataRoute.Sitemap = [];
  try {
    const res = await fetch(`${API_BASE}/recipes?limit=100`, { next: { revalidate: 3600 } });
    if (res.ok) {
      const json = await res.json();
      const items = json.data?.items || json.items || [];
      recipeRoutes = items.map((r: any) => ({
        url: `${SITE_URL}/tarif/${r.slug || r.id}`,
        lastModified: r.updatedAt ? new Date(r.updatedAt) : new Date(),
        changeFrequency: 'weekly' as const,
        priority: 0.8,
      }));
    }
  } catch {}

  // Dynamic tag pages
  let tagRoutes: MetadataRoute.Sitemap = [];
  try {
    const res = await fetch(`${API_BASE}/tags`, { next: { revalidate: 3600 } });
    if (res.ok) {
      const json = await res.json();
      const tags = json.data || json || [];
      tagRoutes = (Array.isArray(tags) ? tags : []).map((t: any) => ({
        url: `${SITE_URL}/etiket/${t.slug}`,
        changeFrequency: 'weekly' as const,
        priority: 0.6,
      }));
    }
  } catch {}

  return [...staticRoutes, ...recipeRoutes, ...tagRoutes];
}
