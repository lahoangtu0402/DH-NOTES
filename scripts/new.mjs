#!/usr/bin/env node
/**
 * Tạo nhanh bài viết hoặc môn học mới từ template.
 *
 *   npm run new -- course   marketing-can-ban "Marketing căn bản"
 *   npm run new -- lesson   marketing-can-ban "Bài 1.1. Marketing là gì"
 *   npm run new -- exercises marketing-can-ban "Bài tập cuối Chương 1" --chapter=chuong-1
 *   npm run new -- lesson quan-tri-chien-luoc "Chủ đề 1.2. ..." --chapter=chuong-1 --source=_sources/quan-tri-chien-luoc/chu-de/Chuong1-CD12.pdf
 *
 * Loại bài: lesson | exercises | reading | guide
 * Tùy chọn: --chapter=<mã-chương>  (mặc định chuong-1; phải khớp chapters[].id trong file môn học)
 */
import { readFileSync, writeFileSync, existsSync, mkdirSync } from 'node:fs';
import { join, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';

const root = join(dirname(fileURLToPath(import.meta.url)), '..');
const types = ['lesson', 'exercises', 'reading', 'guide'];

const args = process.argv.slice(2);
const flags = Object.fromEntries(
  args.filter((a) => a.startsWith('--')).map((a) => a.slice(2).split('=')),
);
const [kind, target, ...rest] = args.filter((a) => !a.startsWith('--'));
const title = rest.join(' ').trim();

function fail(msg) {
  console.error(`Lỗi: ${msg}`);
  process.exit(1);
}

function slugify(s) {
  return s
    .toLowerCase()
    .replace(/đ/g, 'd')
    .normalize('NFD')
    .replace(/[̀-ͯ]/g, '')
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '');
}

const usage = `Cách dùng:
  npm run new -- course <mã-môn> "Tên môn học"
  npm run new -- <loại-bài> <mã-môn> "Tiêu đề" [--chapter=chuong-1]

Loại bài: ${types.join(', ')}`;

if (!kind || !target || !title) fail(usage);

if (kind === 'course') {
  const id = slugify(target);
  const file = join(root, 'src/content/courses', `${id}.md`);
  if (existsSync(file)) fail(`Môn "${id}" đã tồn tại: ${file}`);
  writeFileSync(
    file,
    `---
title: ${JSON.stringify(title)}
short: ${JSON.stringify(title.length > 14 ? title.slice(0, 12).trim() + '…' : title)}
description: "Mô tả ngắn về môn học (một đến hai câu)."
kind: course          # course = môn học theo học kỳ, library = kỹ năng/tham khảo dùng chung
icon: briefcase       # strategy | briefcase | concept | research | data | book
semester: Học kỳ 1 · năm 2
order: 100
chapters:
  - id: chuong-1
    title: "Chương 1. Tên chương"
    summary: "Chương này học gì (một câu)."
---

Giới thiệu môn học, ai nên học, và cách học gợi ý.
`,
  );
  mkdirSync(join(root, 'src/content/notes', id), { recursive: true });
  console.log(`Đã tạo môn: src/content/courses/${id}.md`);
  console.log('Nhớ chỉnh mô tả, icon, tên ngắn (short) và danh sách chương (chapters).');
  process.exit(0);
}

if (!types.includes(kind)) fail(`Loại bài "${kind}" không hợp lệ.\n\n${usage}`);

const courseId = slugify(target);
if (!existsSync(join(root, 'src/content/courses', `${courseId}.md`))) {
  fail(`Chưa có môn "${courseId}". Tạo trước bằng: npm run new -- course ${courseId} "Tên môn"`);
}

const slug = slugify(title);
if (!slug) fail('Tiêu đề không hợp lệ.');
const dir = join(root, 'src/content/notes', courseId);
const file = join(dir, `${slug}.md`);
if (existsSync(file)) fail(`Bài đã tồn tại: ${file}`);

let template = readFileSync(join(root, 'templates', `${kind}.md`), 'utf8')
  .replaceAll('{{title}}', title.replaceAll('"', '\\"'))
  .replaceAll('{{course}}', courseId)
  .replaceAll('{{chapter}}', flags.chapter || 'chuong-1')
  .replaceAll('{{slug}}', slug);

// --source=_sources/<môn>/chu-de/ChuongX-CDXY.pdf : ghi đường dẫn file gốc để `npm run sources` đối chiếu.
if (flags.source) {
  template = template.replace(/^(chapter: .*)$/m, `$1\nsource: ${JSON.stringify(flags.source)}`);
}

mkdirSync(dir, { recursive: true });
writeFileSync(file, template);
console.log(`Đã tạo: src/content/notes/${courseId}/${slug}.md`);
console.log('Bài mới có visibility: private (không hiện khi build) cho đến khi bạn viết đủ và đổi thành public.');
