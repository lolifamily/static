import type { APIRoute } from 'astro';
import { base } from 'astro:config/server';
import { getSitemapIndexUrl } from '@/utils/format';

export const GET: APIRoute = () => {
  const sitemapUrl = getSitemapIndexUrl();

  return new Response(`User-agent: *
Allow: ${base}

Sitemap: ${sitemapUrl}`, {
    headers: {
      'Content-Type': 'text/plain',
    },
  });
};
