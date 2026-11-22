import { getCollection, type CollectionEntry } from 'astro:content';
import { execFileSync } from 'node:child_process';
import { statSync } from 'node:fs';
import { countQuiz, MIN_QUIZ } from './quiz.mjs';

export type Course = CollectionEntry<'courses'>;
export type Note = CollectionEntry<'notes'>;

/* ---------- Nhãn tiếng Việt ---------- */

export const typeLabels: Record<Note['data']['type'], string> = {
  lesson: 'Bài giảng',
  exercises: 'Bài tập cuối chương',
  reading: 'Đọc hiểu tài liệu',
  guide: 'Hướng dẫn',
};

export const levelLabels: Record<Note['data']['level'], string> = {
  beginner: 'Cơ bản',
  intermediate: 'Trung bình',
  advanced: 'Nâng cao',
};

export const statusLabels: Record<Note['data']['status'], string> = {
  draft: 'Bản nháp',
  reviewed: 'Đã rà soát',
};

/* ---------- Đường dẫn ---------- */

const base = import.meta.env.BASE_URL.replace(/\/$/, '');

/** Ghép đường dẫn với base (dùng khi deploy vào thư mục con, ví dụ GitHub Pages). */
export function url(path = '/'): string {
  const p = path.startsWith('/') ? path : `/${path}`;
  return `${base}${p}`;
}

export const noteSlug = (n: Note) => n.id.split('/').pop()!;
export const noteKey = (n: Note) => `${n.data.course}/${noteSlug(n)}`;
export const noteHref = (n: Note) => url(`/${noteKey(n)}/`);
export const courseHref = (c: Course) => url(`/${c.id}/`);
export const tagHref = (tag: string) => url(`/tags/${encodeURIComponent(tag)}/`);

/* ---------- Truy vấn nội dung ---------- */

// Bản build (production) bỏ các bài `visibility: private`; khi dev thì hiện hết.
const showPrivate = !import.meta.env.PROD;

export async function getCourses(): Promise<Course[]> {
  const all = await getCollection('courses');
  return all.sort((a, b) => a.data.order - b.data.order || a.data.title.localeCompare(b.data.title, 'vi'));
}

export async function getNotes(): Promise<Note[]> {
  const all = await getCollection('notes');
  return all.filter((n) => showPrivate || n.data.visibility === 'public');
}

/** Các bài của một môn, xếp theo thứ tự chương rồi theo `order`. */
export async function getNotesOfCourse(course: Course): Promise<Note[]> {
  const all = await getNotes();
  const chapterIndex = (n: Note) => {
    const i = course.data.chapters.findIndex((c) => c.id === n.data.chapter);
    return i === -1 ? 9999 : i;
  };
  return all
    .filter((n) => n.data.course === course.id)
    .sort(
      (a, b) =>
        chapterIndex(a) - chapterIndex(b) ||
        a.data.order - b.data.order ||
        a.data.title.localeCompare(b.data.title, 'vi'),
    );
}

export type ChapterGroup = {
  id: string;
  title: string;
  summary?: string;
  notes: Note[];
};

/** Gom bài theo chương. Bài không thuộc chương nào được xếp vào nhóm "Khác". */
export function groupByChapter(course: Course, notes: Note[]): ChapterGroup[] {
  const groups: ChapterGroup[] = course.data.chapters.map((c) => ({
    id: c.id,
    title: c.title,
    summary: c.summary,
    notes: notes.filter((n) => n.data.chapter === c.id),
  }));
  const known = new Set(course.data.chapters.map((c) => c.id));
  const other = notes.filter((n) => !n.data.chapter || !known.has(n.data.chapter));
  if (other.length) groups.push({ id: 'khac', title: 'Bài khác', notes: other });
  return groups;
}

/** Tạo bảng tra cứu "course/slug" -> bài viết, dùng cho prerequisites / related. */
export async function getNoteIndex(): Promise<Map<string, Note>> {
  const all = await getNotes();
  return new Map(all.map((n) => [noteKey(n), n]));
}

/** Các bài khai báo bài này trong `prerequisites` (gợi ý "học tiếp"). */
export function nextSteps(target: Note, all: Note[]): Note[] {
  const key = noteKey(target);
  return all.filter((n) => n !== target && n.data.prerequisites.includes(key));
}

export async function getTags(): Promise<Map<string, Note[]>> {
  const all = await getNotes();
  const map = new Map<string, Note[]>();
  for (const n of all) {
    for (const t of n.data.tags) {
      map.set(t, [...(map.get(t) ?? []), n]);
    }
  }
  return new Map([...map.entries()].sort((a, b) => b[1].length - a[1].length || a[0].localeCompare(b[0])));
}

/* ---------- Trắc nghiệm và kiểm tra chất lượng bài ---------- */

const quizCache = new Map<string, number>();

/** Số câu trắc nghiệm trong bài. */
export function quizCount(note: Note): number {
  if (!quizCache.has(note.id)) quizCache.set(note.id, countQuiz(note.body ?? '', note.id));
  return quizCache.get(note.id)!;
}

/**
 * Các lỗi vi phạm chuẩn nội dung của bài (danh sách rỗng nghĩa là đạt):
 *  - bài giảng và bài tập cuối chương: ít nhất MIN_QUIZ câu trắc nghiệm;
 *  - bài tập cuối chương: mỗi bài tập phải có lời giải chi tiết.
 */
export function lessonIssues(note: Note): string[] {
  const issues: string[] = [];
  const t = note.data.type;
  const body = note.body ?? '';

  if (t === 'lesson' || t === 'exercises') {
    const n = quizCount(note);
    if (n < MIN_QUIZ) {
      issues.push(`Cần ít nhất ${MIN_QUIZ} câu trắc nghiệm (khối \`\`\`quiz), hiện có ${n}.`);
    }
  }

  if (t === 'exercises') {
    const problems = (body.match(/^#{2,4}\s+Bài\s+\d+/gim) ?? []).length;
    const solutions = (body.match(/<summary>[^<]*lời giải[^<]*<\/summary>/gi) ?? []).length;
    if (problems === 0) {
      issues.push('Chưa có bài tập nào (mỗi bài tập là một tiêu đề dạng "### Bài 1. ...").');
    } else if (solutions < problems) {
      issues.push(
        `Mỗi bài tập phải có lời giải chi tiết: có ${problems} bài tập nhưng chỉ có ${solutions} mục "Xem lời giải".`,
      );
    }
  }
  return issues;
}

/* ---------- Ngày cập nhật (theo lịch sử Git) ---------- */

const dateCache = new Map<string, Date | null>();

/**
 * Ưu tiên: `updated` trong frontmatter → commit gần nhất của file → thời gian sửa file.
 * Khi deploy bằng GitHub Actions, nhớ checkout với `fetch-depth: 0` để có đủ lịch sử.
 */
export function lastUpdated(note: Note): Date | null {
  if (note.data.updated) return note.data.updated;
  const file = note.filePath;
  if (!file) return null;
  if (dateCache.has(file)) return dateCache.get(file)!;

  let result: Date | null = null;
  try {
    const out = execFileSync('git', ['log', '-1', '--format=%cI', '--', file], {
      stdio: ['ignore', 'pipe', 'ignore'],
    })
      .toString()
      .trim();
    if (out) result = new Date(out);
  } catch {
    /* không phải repo Git, bỏ qua */
  }
  if (!result) {
    try {
      result = statSync(file).mtime;
    } catch {
      result = null;
    }
  }
  dateCache.set(file, result);
  return result;
}

export function latestUpdate(notes: Note[]): Date | null {
  const dates = notes.map(lastUpdated).filter((d): d is Date => d !== null);
  if (!dates.length) return null;
  return new Date(Math.max(...dates.map((d) => d.getTime())));
}

export function formatDate(d: Date | null): string {
  if (!d) return '';
  return new Intl.DateTimeFormat('vi-VN', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
    timeZone: 'Asia/Ho_Chi_Minh',
  }).format(d);
}
