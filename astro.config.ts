import { defineConfig } from 'astro/config';

import sitemap from '@astrojs/sitemap';
import mdx from '@astrojs/mdx';
import expressiveCode from 'astro-expressive-code';
import playformCompress from '@playform/compress';

import remarkPangu from './src/plugins/remark-pangu-satteri';
import remarkRemoveCjkBreaks from './src/plugins/remark-remove-cjk-breaks-satteri';

import { browserslistToTargets } from 'lightningcss';

import { satteri } from '@astrojs/markdown-satteri';

// https://astro.build/config
export default defineConfig({
  site: 'https://static.lolifamily.js.org',
  base: '/', // 可以改为 '/files/' 等非根路径
  trailingSlash: 'always',
  output: 'static',
  cacheDir: '.cache',
  integrations: [expressiveCode(), mdx(), playformCompress({
    CSS: false,
    HTML: {
      'html-minifier-terser': {
        minifyCSS: { targets: browserslistToTargets(['chrome 99', 'edge 99', 'firefox 97', 'safari 15']) },
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
      reportCompressedSize: !process.env.CI, // CI 不需要 gzip 大小估算
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
    processor: satteri({
      features: {
        frontmatter: true,
        gfm: {
          footnotes: {
            label: '脚注',
            // satteri 的 referenceNumber 已是 1-based（remark-rehype 的 idx 是 0-based 需 +1）
            backLabel: (referenceNumber: number, rerunIndex: number) =>
              `返回引用 ${referenceNumber}${rerunIndex > 1 ? `-${rerunIndex}` : ''}`,
          },
        },
      },
      mdastPlugins: [
        remarkPangu,
        remarkRemoveCjkBreaks({ includeEmoji: true }),
      ],
    }),
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
    contentIntellisense: true,
  },
});
