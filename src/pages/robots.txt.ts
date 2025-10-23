import type { APIRoute } from 'astro';
import { site, base } from 'astro:config/server';
import { getSitemapIndexUrl } from '@/utils/format';

export const GET: APIRoute = () => {
  const sitemapUrl = new URL(getSitemapIndexUrl(), site).toString();

  return new Response(`User-agent: *
Allow: ${base}

Sitemap: ${sitemapUrl}`, {
    headers: {
      'Content-Type': 'text/plain',
    },
  });
};
