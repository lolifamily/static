// @ts-check
import { defineConfig } from 'astro/config';

import sitemap from '@astrojs/sitemap';
import mdx from '@astrojs/mdx';
import playformCompress from '@playform/compress';

import remarkPangu from './src/plugins/remark-pangu';
import remarkRemoveCjkBreaks from './src/plugins/remark-remove-cjk-breaks';

import { browserslistToTargets } from 'lightningcss';

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
  integrations: [mdx({ optimize: true }), playformCompress({
    CSS: false,
    HTML: {
      'html-minifier-terser': {
        minifyCSS: { targets: browserslistToTargets(['chrome 99', 'edge 99', 'firefox 97', 'safari 15']) },
        minifySVG: true,
      },
    },
    JSON: false,
    Image: false,
    JavaScript: false,
    SVG: false,
  }), sitemap({
    filter: page => !page.endsWith('/404') && !page.endsWith('/403'),
    lastmod: new Date(),
  })],
  vite: {
    build: {
      minify: 'terser',
      cssMinify: 'lightningcss',
      target: ['chrome99', 'edge99', 'firefox97', 'safari15'],
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
    remarkPlugins: [remarkPangu, [remarkRemoveCjkBreaks, {
      includeEmoji: true,
      includeMathWithPunctuation: true,
    }]],
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
    clientPrerender: true,
    staticImportMetaEnv: true,
    headingIdCompat: true,
    contentIntellisense: true,
  },
});
