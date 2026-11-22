import { defineConfig } from 'astro/config';
import { unified } from '@astrojs/markdown-remark';
import remarkMath from 'remark-math';
import rehypeKatex from 'rehype-katex';
import remarkQuiz from './src/lib/remark-quiz.mjs';

// Khi deploy lên GitHub Pages tại https://<user>.github.io/<repo>/
// hãy đặt `site` và `base` (xem HUONG-DAN.md, mục "Triển khai").
const site = process.env.SITE_URL || 'http://localhost:4321';
const base = process.env.BASE_PATH || '/';

export default defineConfig({
  site,
  base,
  trailingSlash: 'always',
  markdown: {
    // remark-math + rehype-katex: công thức bằng $...$ và $$...$$
    // remarkQuiz: biến khối ```quiz thành bài trắc nghiệm tương tác
    processor: unified({
      remarkPlugins: [remarkMath, remarkQuiz],
      rehypePlugins: [rehypeKatex],
    }),
    shikiConfig: {
      themes: { light: 'github-light', dark: 'github-dark-dimmed' },
      wrap: true,
    },
  },
});
