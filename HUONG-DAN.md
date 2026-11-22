# Hướng dẫn sử dụng

Tài liệu này có hai quy trình chạy từng bước:

- **Phần A. Thêm chủ đề mới** cho một môn đã có (việc làm hằng tuần).
- **Phần B. Thêm môn học mới.**

Phần C là danh sách kiểm tra trước khi đăng. Phần D là tra cứu cú pháp (frontmatter, trắc nghiệm, lời giải, công thức, đăng web, xử lý sự cố).

Quy ước dùng trong cả tài liệu:

| Khái niệm | Trên đĩa | Trên web |
| --- | --- | --- |
| Môn học | `_sources/<mã-môn>/` và `src/content/courses/<mã-môn>.md` | trang `/<mã-môn>/` |
| Sách của môn | `_sources/<mã-môn>/book/*.pdf` | không đăng, chỉ dùng làm nguồn bổ sung |
| Chủ đề = buổi học | `_sources/<mã-môn>/chu-de/...ChuongX-CDXY.pdf` | một **bài giảng** `chu-de-X-Y-....md` |
| Chương | `chapters:` trong file môn | một nhóm bài trên trang môn |
| Bài tập cuối chương | `bai-tap-chuong-X.md` | một bài, bổ sung dần theo chủ đề |

`<mã-môn>` viết thường, không dấu, nối bằng gạch ngang, ví dụ `quan-tri-chien-luoc`.

---

## Phần A. Thêm chủ đề mới (hằng tuần)

### Bước A1. Bỏ file vào `_sources`

```text
_sources/<mã-môn>/chu-de/Chuong2-CD21.pdf      ← chủ đề mới
_sources/<mã-môn>/book/<sách>.pdf              ← chỉ khi có sách mới
```

Tên file chủ đề phải chứa `Chuong<số chương>` và `CD<số chương><số chủ đề>`. Có tiền tố cũng được, ví dụ `MHO-QTCL-Chuong2-CD21.pdf` là Chủ đề 2.1.

### Bước A2. Xem chủ đề nào chưa có bài

```bash
npm run sources -- <mã-môn>
```

Kết quả mẫu:

```text
  [x] Chuong1-CD11.pdf  →  chu-de-1-1-khai-niem-chien-luoc.md
  [ ] MHO-QTCL-Chuong2-CD21.pdf  (chủ đề 2.1, chuong-2, CHƯA khai báo chương trong file môn)
      npm run new -- lesson <mã-môn> "Chủ đề 2.1. <tên chủ đề>" --chapter=chuong-2 --source=...
  [!] Bài tập cuối chuong-1 (bai-tap-chuong-1.md): cần bổ sung cho chủ đề mới
```

- `[x]`: đã có bài. `[ ]`: cần tạo bài. `[!]`: bài tập cuối chương cần bổ sung.
- Dòng `npm run new ...` là lệnh tạo bài gợi ý, dùng ở bước A4.

### Bước A3. Kiểm tra đầu vào

1. Mở file chủ đề, ghi lại **tên chủ đề** (dòng "Chủ đề X.Y: ...").
2. Mở sách trong `book/`, xem **bìa và mục lục** để chắc đúng là sách của môn này, và tìm chương tương ứng với chủ đề.
3. Nếu `npm run sources` báo "CHƯA khai báo chương", mở `src/content/courses/<mã-môn>.md` và thêm chương vào `chapters`:

```yaml
chapters:
  - id: chuong-2
    title: "Chương 2. <Tên chương lấy từ file chủ đề>"
    summary: "<Một câu: chương này học gì>"
```

### Bước A4. Tạo file bài giảng

Chạy lệnh mà bước A2 gợi ý, thay `<tên chủ đề>`:

```bash
npm run new -- lesson <mã-môn> "Chủ đề 2.1. Tên chủ đề" --chapter=chuong-2 --source=_sources/<mã-môn>/chu-de/<file>.pdf
```

Sau đó mở file vừa tạo, chỉnh:

- `order`: số chủ đề viết liền, ví dụ 2.1 → `21`, 1.5 → `15` (bài tập cuối chương luôn là `90`).
- `prerequisites`: bài chủ đề ngay trước, ví dụ `[<mã-môn>/chu-de-2-0-...]` hoặc bài cuối của chương trước.

### Bước A5. Soạn bài giảng theo đúng thứ tự prompt

Có hai cách. Cả hai đều phải đi đúng thứ tự trong `PROMPTS.md`.

**Cách 1: nhờ Claude Code trong thư mục dự án.** Gõ:

```text
Tôi vừa thêm file vào _sources/<mã-môn>/chu-de/. Hãy cập nhật môn <mã-môn>
theo PROMPTS.md → "Quy trình sinh trang từ _sources", tài liệu tham khảo lấy từ book/.
```

Claude sẽ làm hết các bước A2 đến A8.

**Cách 2: tự dùng AI chat.** Gửi cho AI, theo thứ tự, trong **cùng một tin nhắn**:

1. **Prompt chung** (chọn BÀI GIẢNG, tên bài = tên chủ đề),
2. **Quy tắc định dạng**,
3. **Bổ sung theo loại bài → Bài giảng**,
4. **Bổ sung riêng cho môn quản trị kinh doanh** (với môn kinh doanh),

kèm file chủ đề (nguồn chính) và chương sách tương ứng (nguồn bổ sung). Dán kết quả vào file ở bước A4, **giữ nguyên** các dòng `source`, `chapter`, `order` đã chỉnh.

Yêu cầu nội dung cần nhớ khi đọc lại bản AI trả về:

- Bám đúng chủ đề của buổi học; định nghĩa, tác giả, ví dụ doanh nghiệp thật lấy từ file chủ đề.
- Có đủ các mục: Mục tiêu bài học, Bạn cần biết trước, Mở đầu, các mục nội dung đánh số, Những lỗi thường gặp, Tóm tắt bài, Trắc nghiệm ôn tập (≥ 10 câu).
- Mỗi mục khó có **một ví dụ có lời giải từng bước**, dùng doanh nghiệp giả định, số nhỏ, dễ tính lại.

### Bước A6. Kiểm tra lại bài giảng

Gửi prompt **"Kiểm tra lại bản nháp của AI"** trong `PROMPTS.md` kèm bài vừa soạn, rồi sửa theo góp ý. Tự làm thêm:

- Bấm máy tính lại **mọi phép tính** và **mọi đáp án trắc nghiệm**.
- Số liệu doanh nghiệp giả định giữa các bài phải **ăn khớp** (ví dụ cùng một tiệm thì doanh thu chi nhánh không thể lớn hơn doanh thu cả tiệm).
- Số liệu doanh nghiệp thật: chỉ dùng số có trong tài liệu gốc; số tự suy ra phải ghi "xấp xỉ, cần kiểm tra lại".
- Giá trị trong frontmatter có dấu `:` phải đặt trong ngoặc kép.

### Bước A7. Cập nhật bài tập cuối chương

- Chương **chưa có** bài tập: `npm run new -- exercises <mã-môn> "Bài tập cuối Chương X" --chapter=chuong-X`, đặt `order: 90`.
- Chương **đã có** bài tập: mở `bai-tap-chuong-X.md`.

Gửi cho AI theo thứ tự: **Prompt chung** (chọn BÀI TẬP CUỐI CHƯƠNG) → **Quy tắc định dạng** → **Bổ sung → Bài tập cuối chương** → **Bổ sung môn kinh doanh**, kèm file bài tập hiện có và các bài giảng của chương. Yêu cầu:

- **Giữ** các bài cũ, **thêm** bài cho chủ đề mới (đánh số tiếp), thêm câu trắc nghiệm tổng kết cho chủ đề mới.
- Cập nhật bảng "bài nào thuộc chủ đề nào" ở mục "Cách làm bài tập này".
- Cập nhật `summary`, `sourceTitle` (danh sách chủ đề đã bao quát) và `prerequisites` (bài chủ đề mới nhất).

Sau đó chạy lại bước A6 cho file bài tập.

### Bước A8. Kiểm tra, xem thử, đăng

```bash
npm run sources -- <mã-môn>   # mọi dòng phải là [x]
npm run build                 # phải chạy xong, không báo "chưa đạt chuẩn nội dung"
npm run dev                   # mở http://localhost:4321 xem bài, làm thử trắc nghiệm
```

Đối chiếu xong với tài liệu gốc thì đổi `status: draft` thành `status: reviewed`. Cuối cùng commit và đẩy lên GitHub (Phần D, mục 7).

---

## Phần B. Thêm môn học mới

### Bước B1. Tạo thư mục nguồn

```text
_sources/<mã-môn>/book/      ← sách, giáo trình
_sources/<mã-môn>/chu-de/    ← các file chủ đề
```

### Bước B2. Tạo file môn

```bash
npm run new -- course <mã-môn> "Tên môn học"
```

Lệnh tạo `src/content/courses/<mã-môn>.md` và thư mục `src/content/notes/<mã-môn>/`. Mã môn trong lệnh phải **trùng** tên thư mục trong `_sources/`.

### Bước B3. Điền thông tin môn

Mở `src/content/courses/<mã-môn>.md`:

| Trường | Điền gì |
| --- | --- |
| `title` | Tên đầy đủ của môn |
| `short` | Tên ngắn hiện ở thanh bên (≤ 14 ký tự) |
| `description` | Một đến hai câu: môn học gì, cho ai |
| `kind` | `course` (môn học) hoặc `library` (kỹ năng, tham khảo dùng chung) |
| `icon` | Một trong `strategy`, `briefcase`, `concept`, `research`, `data`, `book` |
| `semester` | Ví dụ `Học kỳ 2 · năm 3` |
| `order` | Thứ tự môn trên trang chủ (nhỏ lên trước) |
| `chapters` | Chỉ khai báo các chương **đã có chủ đề** trong `chu-de/`; chương sau thêm dần ở bước A3 |

Phần thân file (dưới dấu `---` thứ hai) là đoạn giới thiệu môn và cách học gợi ý.

### Bước B4. Sinh các bài

Làm **Phần A từ bước A2** cho từng chủ đề, theo thứ tự chương, chủ đề. Nếu nhờ Claude Code, gõ:

```text
Tôi vừa thêm môn mới vào _sources/<mã-môn>/. Hãy tạo môn <mã-môn> theo HUONG-DAN.md Phần B,
sinh bài theo PROMPTS.md → "Quy trình sinh trang từ _sources".
```

Môn không thuộc khối kinh doanh thì bỏ phần "Bổ sung riêng cho môn quản trị kinh doanh" trong prompt.

### Bước B5. Kiểm tra và đăng

Như bước A8. Trang môn mới tự xuất hiện trên trang chủ.

---

## Phần C. Danh sách kiểm tra trước khi đăng

- [ ] `npm run sources` hiện `[x]` cho mọi chủ đề và mọi bài tập cuối chương.
- [ ] Mỗi bài giảng có `source` trỏ đúng file chủ đề, `chapter` khớp `chapters[].id`, `order` đúng số chủ đề.
- [ ] Mỗi bài giảng và bài tập có **ít nhất 10 câu** trắc nghiệm, mỗi câu có đúng một đáp án `+` và dòng `E:`.
- [ ] Mỗi `### Bài N` trong bài tập có khối "Xem gợi ý" và "Xem lời giải chi tiết".
- [ ] Mọi phép tính đã bấm lại; số liệu giả định giữa các bài không mâu thuẫn.
- [ ] Không có đoạn chép nguyên văn dài từ tài liệu gốc.
- [ ] `npm run build` chạy xong.

---

## Phần D. Tra cứu

### 1. Các trường ở đầu file bài (frontmatter)

| Trường | Ý nghĩa |
| --- | --- |
| `title`, `summary` | Tiêu đề (bài giảng: `Chủ đề X.Y. Tên`), tóm tắt 1 đến 2 câu |
| `course` | Mã môn (trùng tên file trong `courses/`) |
| `chapter` | Mã chương, phải khớp `chapters[].id` trong file môn |
| `type` | `lesson`, `exercises`, `reading`, `guide` |
| `level` | `beginner`, `intermediate`, `advanced` |
| `status` | `draft` (bản nháp, có hiện cảnh báo) hoặc `reviewed` |
| `visibility` | `public` hoặc `private` (private không build) |
| `duration` | Số phút học ước tính |
| `source`, `sourceTitle` | Đường dẫn file gốc trong `_sources/` và tên mô tả; `npm run sources` dựa vào `source` để đối chiếu |
| `keywords` | Danh sách thuật ngữ: `term` và `meaning`, hiện thành hộp "Thuật ngữ trong bài" |
| `prerequisites`, `related` | Liên kết tới bài khác, dạng `ma-mon/ten-bai` |
| `order` | Thứ tự trong chương: chủ đề X.Y → `XY`, bài tập cuối chương → `90` |

Giá trị có dấu hai chấm `:` phải đặt trong ngoặc kép.

### 2. Viết trắc nghiệm

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

### 3. Bài tập và lời giải

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

### 4. Công thức toán

Viết trong dấu `$...$` (trong dòng) hoặc `$$...$$` (riêng dòng). Ví dụ `$\text{Thị phần} = \frac{DT_{DN}}{DT_{TT}} \times 100\%$`. **Không đặt công thức trong tiêu đề** (`##`, `###`), vì mục lục bên phải sẽ hiện chữ lộn xộn. Số thập phân kiểu Việt Nam viết `0{,}3` trong công thức để không bị thêm khoảng trắng sau dấu phẩy.

### 5. File gốc và quyền riêng tư

Toàn bộ `_sources/` bị Git bỏ qua, không lên GitHub, không lên web. Chỉ đăng bản do mình viết lại. Nếu tài liệu có bản quyền của thầy cô hoặc nhà xuất bản, chỉ trích dẫn ngắn và ghi nguồn ở trường `source`. Muốn sao lưu `_sources/`, dùng repo **private** riêng hoặc ổ đĩa đám mây.

### 6. Các lệnh

| Lệnh | Làm gì |
| --- | --- |
| `npm run sources [-- <mã-môn>]` | Đối chiếu `_sources/` với các bài đã có, gợi ý lệnh tạo bài |
| `npm run new -- course <mã-môn> "Tên"` | Tạo môn mới |
| `npm run new -- lesson <mã-môn> "Chủ đề X.Y. Tên" --chapter=chuong-X --source=<file>` | Tạo bài giảng cho một chủ đề |
| `npm run new -- exercises <mã-môn> "Bài tập cuối Chương X" --chapter=chuong-X` | Tạo bài tập cuối chương |
| `npm run dev` | Xem thử tại http://localhost:4321 (hiện cả bài `private`) |
| `npm run build` | Build và kiểm tra chuẩn nội dung |

### 7. Đăng lên GitHub Pages

1. Tạo repo trên GitHub, đẩy toàn bộ thư mục này lên nhánh `main`.
2. Vào **Settings → Pages**, mục **Source** chọn **GitHub Actions** (không chọn "Deploy from a branch").
3. Mỗi lần đẩy lên `main`, workflow trong `.github/workflows/deploy.yml` tự build và đăng. Địa chỉ dạng `https://<tài-khoản>.github.io/<tên-repo>/`.
4. Để trống ô **Custom domain** nếu bạn không dùng tên miền riêng.

### 8. Xử lý sự cố

- **Build báo "chưa đạt chuẩn nội dung"**: đọc thông báo, nó nói rõ thiếu bao nhiêu câu trắc nghiệm hoặc bài nào chưa có lời giải. Hoặc để bài `private` khi đang viết.
- **Build báo `Nested mappings are not allowed`**: một giá trị trong frontmatter có dấu `:` mà chưa đặt trong ngoặc kép. Thông báo chỉ rõ file và dòng.
- **Build in nhiều dòng `LaTeX-incompatible input ... Unrecognized Unicode character`**: chỉ là cảnh báo khi có chữ tiếng Việt trong `\text{...}`; trang vẫn hiển thị được, không cần xử lý.
- **`npm run sources` không nhận ra file chủ đề**: tên file phải chứa `Chuong<số>` và `CD<số>`.
- **Sửa code của plugin trắc nghiệm mà không thấy đổi**: xóa thư mục `.astro` và `dist` rồi build lại.
- **Công thức hiện nguyên chữ `$...$`**: kiểm tra có đóng đủ dấu `$`, và công thức không nằm trong tiêu đề.
- **Trắc nghiệm không hiện**: kiểm tra khối đang dùng đúng chữ `quiz` ngay sau ba dấu backtick, và mỗi câu có đủ `Q:`, đáp án `+`, `E:`.
