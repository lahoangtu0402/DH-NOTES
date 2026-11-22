import { defineCollection } from 'astro:content';
import { glob } from 'astro/loaders';
import { z } from 'astro/zod';

/**
 * Hai collection:
 *  - courses: thông tin của từng môn học / mục dùng chung (một file .md cho mỗi môn),
 *             kèm danh sách chương.
 *  - notes:   các bài viết (bài giảng, bài tập cuối chương, đọc hiểu tài liệu, hướng dẫn).
 *
 * Thêm môn mới = thêm một file vào src/content/courses/
 * và một thư mục cùng tên trong src/content/notes/.
 */

const courses = defineCollection({
  loader: glob({ pattern: '*.md', base: './src/content/courses' }),
  schema: z.object({
    title: z.string(),
    short: z.string(), // tên ngắn hiển thị trong sidebar
    description: z.string(),
    // course = môn học, library = mục dùng chung (kỹ năng học, tra cứu...)
    kind: z.enum(['course', 'library']).default('course'),
    icon: z.enum(['strategy', 'briefcase', 'concept', 'research', 'data', 'book']),
    semester: z.string().optional(), // ví dụ "Học kỳ 1 · năm 2"
    order: z.number().default(100),
    // Các chương của môn, theo thứ tự. Mỗi bài trỏ tới một `id` chương.
    chapters: z
      .array(
        z.object({
          id: z.string(),
          title: z.string(),
          summary: z.string().optional(),
        }),
      )
      .default([]),
  }),
});

export const NOTE_TYPES = ['lesson', 'exercises', 'reading', 'guide'] as const;

const notes = defineCollection({
  loader: glob({ pattern: '**/*.{md,mdx}', base: './src/content/notes' }),
  schema: z.object({
    title: z.string(),
    summary: z.string(), // 1–2 câu, hiển thị trên thẻ và trong kết quả tìm kiếm
    course: z.string(), // trùng với id của file trong src/content/courses
    chapter: z.string().optional(), // trùng với một `id` trong danh sách chương của môn
    // lesson = bài giảng, exercises = bài tập cuối chương (bắt buộc lời giải + trắc nghiệm),
    // reading = hướng dẫn đọc một tài liệu cụ thể, guide = hướng dẫn kỹ năng
    type: z.enum(NOTE_TYPES),
    tags: z.array(z.string()).default([]),
    level: z.enum(['beginner', 'intermediate', 'advanced']).default('beginner'),
    status: z.enum(['draft', 'reviewed']).default('draft'),
    // private: chỉ xem được khi chạy `npm run dev`, không đưa vào bản build
    visibility: z.enum(['public', 'private']).default('public'),
    duration: z.number().int().positive().optional(), // thời gian học dự kiến (phút)
    // Thuật ngữ chính của bài, hiện ở đầu bài cho người mới
    keywords: z
      .array(z.object({ term: z.string(), meaning: z.string() }))
      .default([]),
    // Truy vết về tài liệu gốc (nằm trong _sources/, không công khai)
    source: z.string().optional(),
    sourceTitle: z.string().optional(),
    lecturer: z.string().optional(),
    // Quan hệ giữa các bài (dùng id dạng "course/ten-bai")
    prerequisites: z.array(z.string()).default([]),
    related: z.array(z.string()).default([]),
    order: z.number().default(100), // thứ tự trong cùng một chương
    // Nếu không phải repo Git hoặc muốn ghi đè ngày cập nhật (YYYY-MM-DD)
    updated: z.coerce.date().optional(),
  }),
});

export const collections = { courses, notes };
