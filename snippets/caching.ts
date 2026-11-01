// R6: ISR for database-driven pages (app/blog/page.tsx and app/blog/[slug]/page.tsx)
export const revalidate = 3600; // serve static HTML, refresh hourly

// Public GET route handler: cache at the CDN
import { NextResponse } from 'next/server';

export function cachedJson(data: unknown) {
  return NextResponse.json(data, {
    headers: { 'Cache-Control': 'public, s-maxage=3600, stale-while-revalidate=86400' },
  });
}
