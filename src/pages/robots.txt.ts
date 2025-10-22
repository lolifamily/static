import type { APIRoute } from 'astro';
import { posix as path } from 'node:path';
import { site, base } from 'astro:config/server';

export const GET: APIRoute = () => {
  // Sitemap URL must include base path
  // Example: if base='/files/', sitemap is at /files/sitemap-index.xml
  const sitemapUrl = new URL(path.join(base, 'sitemap-index.xml'), site).toString();

  return new Response(`User-agent: *
Allow: ${base}

Sitemap: ${sitemapUrl}`, {
    headers: {
      'Content-Type': 'text/plain',
    },
  });
};
