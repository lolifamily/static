// @ts-check
import { defineConfig } from 'astro/config';

import sitemap from '@astrojs/sitemap';
import mdx from '@astrojs/mdx';
import playformCompress from '@playform/compress';

// https://astro.build/config
export default defineConfig({
  site: 'https://static.lolifamily.js.org',
  base: '/', // 可以改为 '/files/' 等非根路径
  trailingSlash: 'always',
  output: 'static',
  cacheDir: '.cache',
  prefetch: {
    prefetchAll: true,
  },
  integrations: [mdx(), playformCompress({
    CSS: false,
    HTML: true,
    JSON: false,
    Image: false,
    JavaScript: false,
  }), sitemap({
    filter: page => !page.endsWith('/404') && !page.endsWith('/403'),
    lastmod: new Date(),
  })],
  vite: {
    build: {
      minify: 'terser',
      cssMinify: 'lightningcss',
      sourcemap: true, // 开源项目，随便看！
    },
    css: {
      transformer: 'lightningcss',
    },
  },
  build: {
    format: 'directory',
  },
  markdown: {
    remarkRehype: {
      footnoteBackLabel: (idx, reIdx) => `返回引用 ${idx + 1}${reIdx > 1 ? `-${reIdx}` : ''}`,
      footnoteLabel: '脚注',
    },
  },
  image: {
    layout: 'constrained',
    responsiveStyles: true,
  },
  server: ({ command }) => ({
    port: command === 'preview' ? 4321 : 3000,
  }),
  devToolbar: {
    enabled: false,
  },
  experimental: {
    staticImportMetaEnv: true,
    headingIdCompat: true,
    contentIntellisense: true,
  },
});
