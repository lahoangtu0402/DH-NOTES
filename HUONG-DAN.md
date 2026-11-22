# Hướng dẫn sử dụng

## 1. Quy trình viết một bài

1. Tạo môn (một lần): `npm run new -- course <mã-môn> "Tên môn"`, rồi mở `src/content/courses/<mã-môn>.md` chỉnh mô tả, icon và danh sách `chapters`.
2. Tạo bài: `npm run new -- lesson <mã-môn> "Tiêu đề" --chapter=chuong-1`. Bài mới có `visibility: private`.
3. Viết nội dung, chạy `npm run dev` để xem ngay.
4. Khi đủ chuẩn, đổi `visibility: private` thành `public` (hoặc xóa dòng đó) và `status` thành `reviewed` sau khi bạn đã đối chiếu với tài liệu gốc.
5. `npm run build`, đẩy lên GitHub.

## 2. Các trường ở đầu file bài (frontmatter)

| Trường | Ý nghĩa |
| --- | --- |
| `title`, `summary` | Tiêu đề, tóm tắt 1 đến 2 câu |
| `course` | Mã môn (trùng tên file trong `courses/`) |
| `chapter` | Mã chương, phải khớp `chapters[].id` trong file môn |
| `type` | `lesson`, `exercises`, `reading`, `guide` |
| `level` | `beginner`, `intermediate`, `advanced` |
| `status` | `draft` (bản nháp, có hiện cảnh báo) hoặc `reviewed` |
| `visibility` | `public` hoặc `private` (private không build) |
| `duration` | Số phút học ước tính |
| `keywords` | Danh sách thuật ngữ: `term` và `meaning`, hiện thành hộp "Thuật ngữ trong bài" |
| `prerequisites`, `related` | Liên kết tới bài khác, dạng `ma-mon/ten-bai` |
| `order` | Thứ tự trong chương (nhỏ lên trước) |

Giá trị có dấu hai chấm `:` phải đặt trong ngoặc kép.

## 3. Viết trắc nghiệm

Dùng khối code có tên `quiz`:

````text
```quiz
Q: Doanh thu tăng từ 40 lên 50 tỷ đồng. Tốc độ tăng trưởng là bao nhiêu?
- 10%
+ 25%
- 20%
- 80%
E: $\frac{50-40}{40} \times 100\% = 25\%$, chia cho giá trị năm trước.
```
````

- `Q:` câu hỏi, `- ` đáp án sai, `+ ` đáp án đúng (**đúng một**), `E:` giải thích (**bắt buộc**).
- Không cần sắp đáp án đúng vào vị trí nào: thứ tự được xáo trộn tự động.
- Trong câu hỏi và đáp án dùng được công thức `$x^2$`, chữ đậm `**...**`, code `` `x` ``.
- Nếu câu hỏi chứa **bảng số liệu hoặc khối code nhiều dòng** gồm dòng bắt đầu bằng `-`/`+`, bao khối quiz bằng **bốn** dấu backtick (và khối code bên trong dùng ba). Nên dùng bốn backtick cho mọi khối quiz cho chắc.
- Đừng viết đáp án kiểu "Cả A và B" hoặc "Không đáp án nào", vì thứ tự bị xáo trộn.
- Có thể chia nhiều khối `quiz` trong một bài; mỗi khối chấm điểm riêng, điểm lần làm gần nhất được lưu trong trình duyệt.

## 4. Bài tập và lời giải

```markdown
### Bài 1. Đề ngắn

Nội dung đề.

<details>
<summary>Xem gợi ý</summary>

Gợi ý.

</details>

<details>
<summary>Xem lời giải chi tiết</summary>

Từng bước, kèm đáp án.

</details>
```

Lưu ý quan trọng: **chừa dòng trống** ngay sau thẻ `<summary>` và ngay trước `</details>`, nếu không công thức và định dạng bên trong sẽ không hiển thị. Gợi ý nên có tiêu đề khác "lời giải" (ví dụ "Xem gợi ý").

## 5. Công thức toán

Viết trong dấu `$...$` (trong dòng) hoặc `$$...$$` (riêng dòng). Ví dụ `$\text{Thị phần} = \frac{DT_{DN}}{DT_{TT}} \times 100\%$`. **Không đặt công thức trong tiêu đề** (`##`, `###`), vì mục lục bên phải sẽ hiện chữ lộn xộn. Viết tiêu đề bằng chữ thường.

## 6. File gốc và quyền riêng tư

Đặt slide, PDF, đề thi gốc vào `_sources/`. Thư mục này không được đăng. Chỉ đăng bản tóm tắt do bạn viết lại. Nếu tài liệu có bản quyền của thầy cô hoặc nhà xuất bản, chỉ trích dẫn ngắn và ghi nguồn ở trường `source`.

## 7. Đăng lên GitHub Pages

1. Tạo repo trên GitHub, đẩy toàn bộ thư mục này lên nhánh `main`.
2. Vào **Settings → Pages**, mục **Source** chọn **GitHub Actions** (không chọn "Deploy from a branch").
3. Mỗi lần đẩy lên `main`, workflow trong `.github/workflows/deploy.yml` tự build và đăng. Địa chỉ dạng `https://<tài-khoản>.github.io/<tên-repo>/`.
4. Để trống ô **Custom domain** nếu bạn không dùng tên miền riêng.

## 8. Xử lý sự cố

- **Build báo "chưa đạt chuẩn nội dung"**: đọc thông báo, nó nói rõ thiếu bao nhiêu câu trắc nghiệm hoặc bài nào chưa có lời giải. Hoặc để bài `private` khi đang viết.
- **Sửa code của plugin trắc nghiệm mà không thấy đổi**: xóa thư mục `.astro` và `dist` rồi build lại.
- **Công thức hiện nguyên chữ `$...$`**: kiểm tra có đóng đủ dấu `$`, và công thức không nằm trong tiêu đề.
- **Trắc nghiệm không hiện**: kiểm tra khối đang dùng đúng chữ `quiz` ngay sau ba dấu backtick, và mỗi câu có đủ `Q:`, đáp án `+`, `E:`.
