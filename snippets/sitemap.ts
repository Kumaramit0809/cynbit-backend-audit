// R4: app/sitemap.ts, content-driven lastmod, cached, single canonical host
import type { MetadataRoute } from 'next';
import { prisma } from '@/lib/prisma';

const BASE = 'https://www.cynbit.in';
export const revalidate = 3600; // cache for 1 hour instead of rebuilding per request

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const [posts, jobs] = await Promise.all([
    prisma.post.findMany({ select: { slug: true, updatedAt: true } }),
    prisma.job.findMany({ select: { slug: true, updatedAt: true } }),
  ]);
  return [
    { url: BASE, lastModified: new Date('2026-05-20') }, // static pages: build-time constant
    ...posts.map((p) => ({ url: `${BASE}/blog/${p.slug}`, lastModified: p.updatedAt })),
    ...jobs.map((j) => ({ url: `${BASE}/careers/${j.slug}`, lastModified: j.updatedAt })),
  ];
}
