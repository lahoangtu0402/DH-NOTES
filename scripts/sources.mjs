#!/usr/bin/env node
/**
 * Đối chiếu tài liệu gốc trong _sources/ với các bài đã có trên site.
 *
 *   npm run sources                      # mọi môn
 *   npm run sources -- quan-tri-chien-luoc
 *
 * Quy ước thư mục (xem _sources/README.md):
 *   _sources/<mã-môn>/book/      sách, giáo trình của môn (nguồn bổ sung)
 *   _sources/<mã-môn>/chu-de/    mỗi file = một chủ đề = một buổi học, đặt tên ChuongX-CDXY.pdf
 *
 * Một chủ đề được coi là "đã có bài" khi có bài trong src/content/notes/<mã-môn>/
 * với trường `source` trỏ tới đúng file đó.
 */
import { readdirSync, readFileSync, existsSync, statSync } from 'node:fs';
import { join, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';

const root = join(dirname(fileURLToPath(import.meta.url)), '..');
const srcRoot = join(root, '_sources');
const only = process.argv[2];

const list = (dir) =>
  existsSync(dir) ? readdirSync(dir).filter((f) => !f.startsWith('.') && statSync(join(dir, f)).isFile()) : [];

/** "Chuong1-CD11.pdf" -> { chapter: 1, topic: "1.1" } */
function parseTopic(file) {
  const m = /chuong\s*-?(\d+).*?cd\s*-?(\d+)/i.exec(file);
  if (!m) return null;
  const chapter = Number(m[1]);
  const cd = m[2];
  const rest = cd.startsWith(m[1]) && cd.length > m[1].length ? cd.slice(m[1].length) : cd;
  return { chapter, topic: `${chapter}.${Number(rest)}` };
}

function notesSources(course) {
  const dir = join(root, 'src/content/notes', course);
  const out = [];
  for (const f of list(dir)) {
    const text = readFileSync(join(dir, f), 'utf8');
    const fm = /^---\n([\s\S]*?)\n---/.exec(text)?.[1] ?? '';
    const source = /^source:\s*"?([^"\n]+)"?/m.exec(fm)?.[1];
    const chapter = /^chapter:\s*(\S+)/m.exec(fm)?.[1];
    const type = /^type:\s*(\S+)/m.exec(fm)?.[1];
    out.push({ file: f, source, chapter, type });
  }
  return out;
}

if (!existsSync(srcRoot)) {
  console.log('Chưa có thư mục _sources/.');
  process.exit(0);
}
const courses = readdirSync(srcRoot).filter((d) => statSync(join(srcRoot, d)).isDirectory());

for (const course of courses.filter((c) => !only || c === only)) {
  const courseFile = join(root, 'src/content/courses', `${course}.md`);
  const courseText = existsSync(courseFile) ? readFileSync(courseFile, 'utf8') : '';
  const notes = notesSources(course);

  console.log(`\n== ${course} ${courseText ? '' : '(CHƯA có file môn trong src/content/courses)'}`);

  const books = list(join(srcRoot, course, 'book'));
  console.log(`Sách (book/): ${books.length ? books.join(', ') : 'chưa có'}`);

  const topics = list(join(srcRoot, course, 'chu-de'))
    .map((f) => ({ f, ...parseTopic(f) }))
    .sort((a, b) => (a.chapter ?? 999) - (b.chapter ?? 999) || String(a.topic).localeCompare(String(b.topic), 'vi', { numeric: true }));

  if (!topics.length) console.log('Chủ đề (chu-de/): chưa có');
  const todoChapters = new Set();
  for (const t of topics) {
    const note = notes.find((n) => n.source && n.source.endsWith(`/chu-de/${t.f}`));
    const chapterId = t.chapter ? `chuong-${t.chapter}` : '?';
    const hasChapter = courseText.includes(`id: ${chapterId}`);
    if (note) {
      console.log(`  [x] ${t.f}  →  ${note.file}`);
    } else {
      todoChapters.add(chapterId);
      console.log(`  [ ] ${t.f}  (chủ đề ${t.topic ?? '?'}, ${chapterId}${hasChapter ? '' : ', CHƯA khai báo chương trong file môn'})`);
      console.log(
        `      npm run new -- lesson ${course} "Chủ đề ${t.topic}. <tên chủ đề>" --chapter=${chapterId} --source=_sources/${course}/chu-de/${t.f}`,
      );
    }
  }

  // Chương có chủ đề mới thì bài tập cuối chương cần cập nhật.
  const chapters = [...new Set(topics.map((t) => (t.chapter ? `chuong-${t.chapter}` : null)).filter(Boolean))];
  for (const ch of chapters) {
    const ex = notes.find((n) => n.type === 'exercises' && n.chapter === ch);
    if (!ex) console.log(`  [ ] Bài tập cuối ${ch}: chưa có`);
    else if (todoChapters.has(ch)) console.log(`  [!] Bài tập cuối ${ch} (${ex.file}): cần bổ sung cho chủ đề mới`);
    else console.log(`  [x] Bài tập cuối ${ch}: ${ex.file}`);
  }
}
