# Sổ tay Quản trị kinh doanh

Website ghi chú học tập các môn **quản trị kinh doanh** cho sinh viên (môn mẫu đầu tiên: **Quản trị chiến lược**). Mỗi bài giảng được viết như một giảng viên đang giảng trực tiếp cho người chưa biết gì: giải thích thuật ngữ trước, đi qua tình huống doanh nghiệp từng bước, có bài tập cuối chương kèm **lời giải chi tiết**, và có **trắc nghiệm tối thiểu 10 câu** sau mỗi bài hoặc chương để nhớ lâu hơn.

Dự án này cùng họ với AI-NOTES (Astro, giao diện ấm, sáng/tối, tìm kiếm) nhưng đổi nội dung và quy tắc cho phù hợp sinh viên.

## Cấu trúc nội dung

```text
Môn học (course)
 └─ Chương (chapter)
     ├─ Bài giảng (lesson)           ← có trắc nghiệm ≥ 10 câu
     ├─ Bài tập cuối chương (exercises) ← mỗi bài có lời giải + trắc nghiệm ≥ 10 câu
     ├─ Đọc hiểu tài liệu (reading)
     └─ Hướng dẫn (guide)
```

- `src/content/courses/*.md`: mỗi file một môn, khai báo danh sách chương.
- `src/content/notes/<mã-môn>/*.md`: các bài của môn.
- `_sources/`: nơi để file gốc (slide, PDF, đề thi). Thư mục này **không bao giờ được đăng** (đã nằm trong `.gitignore`).

Có sẵn môn mẫu **Quản trị chiến lược** (Chương 1 và 2 đầy đủ, Chương 3 và 4 sắp cập nhật) và 1 mục kỹ năng học. Doanh nghiệp trong ví dụ là giả định để số liệu rõ ràng và dễ tính lại.

## Chuẩn chất lượng được kiểm tra tự động

Khi chạy `npm run build`, bài thuộc loại `lesson` và `exercises` phải đạt:

1. Có ít nhất **10 câu trắc nghiệm**.
2. Với `exercises`: mỗi mục `### Bài N` có một khối **"Xem lời giải chi tiết"**.

Không đạt thì build **báo lỗi và dừng**, nên không thể vô tình đăng bài thiếu. Khi đang viết dở, để `visibility: private` (bài không xuất hiện khi build).

## Chạy thử

```bash
npm install
npm run dev          # xem tại http://localhost:4321
npm run build        # build + tạo chỉ mục tìm kiếm
npm run preview
```

## Thêm nội dung

```bash
npm run new -- course marketing-can-ban "Marketing căn bản"
npm run new -- lesson marketing-can-ban "Bài 1.1. Marketing là gì" --chapter=chuong-1
npm run new -- exercises marketing-can-ban "Bài tập cuối Chương 1"
```

Xem `HUONG-DAN.md` để biết cú pháp trắc nghiệm, lời giải, công thức, và cách đăng lên GitHub Pages. Xem `PROMPTS.md` để nhờ AI soạn bài đúng chuẩn.
