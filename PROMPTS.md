# Prompt nhờ AI soạn bài đúng chuẩn

Cách dùng: sao chép **Prompt chung** vào AI, thay phần `[...]`, rồi đính kèm tài liệu gốc (slide, giáo trình). Dán kết quả vào file tạo bởi `npm run new`. Luôn **đọc và kiểm tra lại**, nhất là công thức, số liệu và code, rồi mới đổi sang `public`.

## Quy trình sinh trang từ _sources (làm đúng thứ tự)

Mỗi môn: `_sources/<mã-môn>/book/` là sách, `_sources/<mã-môn>/chu-de/` là các chủ đề. **Một chủ đề = một buổi học = một bài giảng** (`type: lesson`). Mỗi chương có một **bài tập cuối chương**, được bổ sung mỗi khi chương có thêm chủ đề.

**Bước 0. Kiểm tra đầu vào.** Chạy `npm run sources -- <mã-môn>`. Mở file chủ đề và sách, xác nhận sách đúng là sách của môn (đọc bìa, mục lục). Nếu chương mới chưa có trong `chapters` của `src/content/courses/<mã-môn>.md` thì thêm vào.

**Bước 1. Bài giảng cho chủ đề mới.** Tạo file bằng lệnh mà `npm run sources` gợi ý (có `--chapter` và `--source`). Đặt tiêu đề `Chủ đề X.Y. <tên chủ đề>`, `order` = XY (ví dụ 1.2 → 12). Gửi cho AI, theo thứ tự:

1. **Prompt chung** (chọn BÀI GIẢNG, tên bài = tên chủ đề),
2. **Quy tắc định dạng**,
3. **Bổ sung theo loại bài → Bài giảng**,
4. **Bổ sung riêng cho môn quản trị kinh doanh**,

kèm file chủ đề (nguồn chính) và phần sách tương ứng (nguồn bổ sung). Nội dung bài phải bám chủ đề của buổi học; định nghĩa, tác giả, ví dụ thực tế lấy từ file chủ đề.

**Bước 2. Kiểm tra lại bài giảng.** Gửi prompt **Kiểm tra lại bản nháp của AI**, sửa theo góp ý, tự tính lại mọi con số và đáp án trắc nghiệm.

**Bước 3. Bài tập cuối chương.** Nếu chương chưa có bài tập: `npm run new -- exercises <mã-môn> "Bài tập cuối Chương X" --chapter=chuong-X`. Gửi theo thứ tự: **Prompt chung** (chọn BÀI TẬP CUỐI CHƯƠNG) → **Quy tắc định dạng** → **Bổ sung → Bài tập cuối chương** → **Bổ sung môn kinh doanh**, kèm bài tập hiện có và các bài giảng của chương. Yêu cầu giữ bài cũ, thêm bài cho chủ đề mới, ghi ở mục "Cách làm bài tập này" các chủ đề đang được bao quát, cập nhật `sourceTitle`.

**Bước 4. Kiểm tra lại bài tập** bằng prompt **Kiểm tra lại bản nháp của AI**.

**Bước 5. Build.** `npm run sources -- <mã-môn>` phải hiện `[x]` cho mọi chủ đề, rồi `npm run build` phải qua (đủ 10 câu trắc nghiệm, đủ lời giải). Đối chiếu với tài liệu gốc xong thì đổi `status: reviewed`.

## Prompt chung

```text
Bạn là một giảng viên đại học, và người hướng dẫn, có kinh nghiệm giảng dạy cho người mới bắt đầu học đại học.
Tôi là người chưa có kiến thức chuyên sâu về lĩnh vực [TÊN MÔN / LĨNH VỰC], chưa quen với cách đọc tài liệu học thuật và có thể chưa hiểu các thuật ngữ chuyên ngành.
Nhiệm vụ của bạn là hướng dẫn tôi đọc hiểu từ con số 0, giống như một giảng viên đang trực tiếp giảng bài cho sinh viên chưa biết gì.

Hãy soạn [BÀI GIẢNG / BÀI TẬP CUỐI CHƯƠNG] về chủ đề "[TÊN BÀI]" dựa trên tài liệu tôi đính kèm.
Các phần bài giảng phải chi tiết, rõ ràng, dễ hiểu. Bài tập cuối chương phải có lời giải chi tiết. Có mục trắc nghiệm tối thiểu 10 câu.

Yêu cầu nội dung:
- Giải thích mỗi thuật ngữ ngay lần đầu xuất hiện, bằng ngôn ngữ đời thường, có ví dụ so sánh.
- Đi từ ví dụ cụ thể đến định nghĩa tổng quát. Ví dụ phải được làm từng bước, nói rõ vì sao làm vậy.
- Có mục "Những lỗi thường gặp" và "Tóm tắt bài".
- Mọi số liệu, kết quả tính, đoạn code phải chính xác. Nếu không chắc, ghi rõ "cần kiểm tra lại" thay vì đoán.
- Không chép nguyên văn tài liệu gốc, diễn đạt lại bằng lời của bạn.

Định dạng đầu ra: một file Markdown theo đúng quy tắc dưới đây, không thêm lời dẫn bên ngoài.

[DÁN QUY TẮC ĐỊNH DẠNG BÊN DƯỚI]
```

## Quy tắc định dạng (dán kèm prompt chung)

```text
1. Bắt đầu bằng frontmatter YAML (giá trị chứa dấu ":" phải đặt trong ngoặc kép):
---
title: "..."
summary: "một đến hai câu"
course: [mã-môn]
chapter: [mã-chương]
type: lesson            # hoặc exercises
level: beginner
status: draft
duration: 45            # số phút
tags: [..., ...]
keywords:               # thuật ngữ trong bài
  - term: Tên thuật ngữ
    meaning: Giải thích một câu
order: 10
---
2. Dùng tiêu đề ## và ###. KHÔNG đặt công thức toán trong tiêu đề.
3. Công thức: $...$ trong dòng, $$...$$ riêng dòng. Code đặt trong khối ```.
4. Bài giảng có các mục: Mục tiêu bài học, Bạn cần biết trước, Mở đầu, các mục nội dung đánh số, Những lỗi thường gặp, Tóm tắt bài, Trắc nghiệm ôn tập.
5. Mỗi bài tập là một mục "### Bài N. Tên", theo sau là đề, rồi hai khối:
<details>
<summary>Xem gợi ý</summary>

(chừa dòng trống) gợi ý, không nói đáp án

</details>

<details>
<summary>Xem lời giải chi tiết</summary>

(chừa dòng trống) lời giải từng bước, kết thúc bằng "Đáp án" và "Bài học"

</details>
6. Trắc nghiệm TỐI THIỂU 10 câu trong khối bốn dấu backtick có tên quiz:
   - Q: câu hỏi
   - dòng "- " là đáp án sai, dòng "+ " là đáp án đúng (đúng MỘT đáp án), mỗi câu 3 đến 4 đáp án
   - E: giải thích vì sao đúng
   - Không dùng đáp án "Cả A và B" hay "Không đáp án nào".
   - Câu hỏi nên bao quát cả bài: khái niệm, tính toán, nhận ra lỗi sai.
   - Nếu câu hỏi có khối code nhiều dòng, khối code dùng ba backtick, còn khối quiz bao ngoài dùng bốn.
```

## Bổ sung theo loại bài

**Bài giảng**: "Mở đầu bằng một tình huống đời thường. Chia nội dung thành các mục nhỏ, mỗi mục một ý. Cuối mỗi mục khó có một ví dụ có lời giải."

**Bài tập cuối chương**: "Soạn 5 bài từ dễ đến khó, bao quát các dạng chính của chương. Lời giải trình bày từng bước như viết lên bảng, có kiểm tra lại đáp án. Thêm 10 đến 12 câu trắc nghiệm tổng kết cả chương."

**Đọc hiểu tài liệu / bài báo**: "Tóm tắt bài báo cho người chưa biết gì, giải thích từng phần theo thứ tự nên đọc, liệt kê thuật ngữ cần biết trước khi đọc, và nêu câu hỏi tự kiểm tra."

**Kiểm tra lại bản nháp của AI** (dùng sau khi có bài): "Hãy đóng vai sinh viên năm nhất đọc bài này. Chỉ ra mọi chỗ khó hiểu, thuật ngữ chưa được giải thích, bước giải bị nhảy cóc, và kiểm tra từng đáp án trắc nghiệm xem có đúng không."

## Bổ sung riêng cho môn quản trị kinh doanh

Thêm đoạn sau vào prompt chung khi soạn các môn quản trị, marketing, tài chính, nhân sự...:

```text
Lưu ý riêng cho môn kinh doanh:
- Mỗi mô hình hoặc công cụ (ví dụ PESTEL, 5 lực lượng Porter, SWOT, ma trận BCG, EFE) phải có: định nghĩa, các bước dùng, MỘT ví dụ làm hoàn chỉnh từng bước, và lỗi thường gặp.
- Ví dụ dùng doanh nghiệp GIẢ ĐỊNH với số liệu nhỏ, dễ tự tính lại (ví dụ quán cà phê, tiệm bánh). Nếu dùng doanh nghiệp thật, chỉ dùng thông tin công khai, nêu rõ nguồn và năm, tuyệt đối không bịa số liệu.
- Ghi tên gốc tiếng Anh của thuật ngữ trong ngoặc ở lần đầu, ví dụ "lợi thế cạnh tranh (competitive advantage)", và ghi rõ tác giả hoặc năm của mô hình nếu bạn chắc chắn.
- Bài tập gồm cả dạng tính toán (thị phần, tăng trưởng, điểm trọng số) và dạng tình huống (phân tích, đưa ra nhận định). Với bài tình huống, lời giải ghi rõ "đây là một cách làm tốt, không phải đáp án duy nhất" và nêu tiêu chí đánh giá.
- Tất cả phép tính phải đúng, ghi rõ đơn vị (tỷ đồng, %, điểm phần trăm).
```
