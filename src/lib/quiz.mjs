/**
 * Đọc và hiển thị khối trắc nghiệm viết trong Markdown.
 *
 * Cú pháp (đặt trong khối ```quiz; nếu câu hỏi có khối code thì dùng ````quiz, bốn dấu huyền):
 *
 *   Q: Nội dung câu hỏi, có thể viết công thức $x^2$ và `code`
 *   - Phương án sai
 *   + Phương án đúng (đúng MỘT phương án có dấu +)
 *   - Phương án sai
 *   E: Giải thích vì sao đáp án đó đúng, và vì sao các đáp án kia sai.
 *
 *   Q: Câu tiếp theo...
 */
import katex from 'katex';

/** Số câu trắc nghiệm tối thiểu cho bài giảng và bài tập cuối chương. */
export const MIN_QUIZ = 10;

const LETTERS = 'ABCDEF';

const escapeHtml = (s) =>
  s.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');

/* ---------- Đọc cú pháp ---------- */

export function parseQuiz(text, label = 'quiz') {
  const questions = [];
  let cur = null;
  let field = null; // 'q' | 'o' | 'e'
  let inCode = false;

  const add = (line) => {
    if (!cur) return;
    if (field === 'q') cur.q = cur.q === '' ? line : cur.q + '\n' + line;
    else if (field === 'e') cur.explain = cur.explain === '' ? line : cur.explain + '\n' + line;
    else if (field === 'o') {
      const o = cur.options[cur.options.length - 1];
      o.text = o.text === '' ? line : o.text + ' ' + line;
    }
  };

  for (const raw of text.replace(/\r\n/g, '\n').split('\n')) {
    const line = raw.replace(/\s+$/, '');
    const trimmed = line.trim();

    if (trimmed.startsWith('```')) {
      inCode = !inCode;
      if (field === 'q' || field === 'e') add(trimmed);
      continue;
    }
    if (inCode) {
      if (field === 'q' || field === 'e') add(line);
      continue;
    }

    let m;
    if ((m = /^Q:\s*(.*)$/.exec(trimmed))) {
      cur = { q: m[1], options: [], answer: -1, explain: '' };
      questions.push(cur);
      field = 'q';
    } else if ((m = /^E:\s*(.*)$/.exec(trimmed)) && cur) {
      field = 'e';
      cur.explain = m[1];
    } else if ((m = /^([-+])\s+(.*)$/.exec(trimmed)) && cur && field !== 'e') {
      cur.options.push({ text: m[2] });
      if (m[1] === '+') {
        if (cur.answer !== -1) {
          throw new Error(`${label}: câu ${questions.length} có nhiều hơn một đáp án đúng (dấu +).`);
        }
        cur.answer = cur.options.length - 1;
      }
      field = 'o';
    } else if (trimmed === '') {
      if (field === 'q' || field === 'e') add('');
    } else {
      add(trimmed);
    }
  }

  questions.forEach((q, i) => {
    const n = i + 1;
    q.q = q.q.trim();
    q.explain = q.explain.trim();
    if (!q.q) throw new Error(`${label}: câu ${n} chưa có nội dung câu hỏi.`);
    if (q.options.length < 2) throw new Error(`${label}: câu ${n} cần ít nhất 2 phương án.`);
    if (q.options.length > LETTERS.length) throw new Error(`${label}: câu ${n} có quá nhiều phương án (tối đa ${LETTERS.length}).`);
    if (q.answer === -1) throw new Error(`${label}: câu ${n} chưa có đáp án đúng (đặt dấu + trước phương án đúng).`);
    if (!q.explain) throw new Error(`${label}: câu ${n} chưa có phần giải thích (dòng bắt đầu bằng "E:").`);
  });

  return questions;
}

/** Tìm mọi khối ```quiz trong một đoạn Markdown, trả về danh sách câu hỏi của từng khối. */
export function extractQuizzes(markdown, label = 'bài viết') {
  const blocks = [];
  const re = /^(`{3,})quiz[^\n]*\n([\s\S]*?)^\1[ \t]*$/gm;
  let m;
  while ((m = re.exec(markdown))) {
    blocks.push(parseQuiz(m[2], `${label} (khối quiz #${blocks.length + 1})`));
  }
  return blocks;
}

export function countQuiz(markdown, label = 'bài viết') {
  return extractQuizzes(markdown ?? '', label).reduce((sum, b) => sum + b.length, 0);
}

/* ---------- Hiển thị ---------- */

const fmt = (t) => escapeHtml(t).replace(/\*\*([^*]+)\*\*/g, '<strong>$1</strong>');

export function renderInline(s) {
  return s
    .split(/(`[^`\n]+`)/g)
    .map((part) => {
      if (/^`[^`\n]+`$/.test(part)) return `<code>${escapeHtml(part.slice(1, -1))}</code>`;
      let out = '';
      let last = 0;
      for (const m of part.matchAll(/\$([^$\n]+?)\$/g)) {
        out += fmt(part.slice(last, m.index));
        out += katex.renderToString(m[1].trim(), { throwOnError: false });
        last = m.index + m[0].length;
      }
      return out + fmt(part.slice(last));
    })
    .join('');
}

function renderRich(text) {
  if (!text) return '';
  const parts = text.split(/```[^\n]*\n([\s\S]*?)\n?```/g);
  return parts
    .map((part, i) => {
      if (i % 2 === 1) return `<pre class="quiz-code"><code>${escapeHtml(part)}</code></pre>`;
      return part
        .split(/\n{2,}/)
        .map((p) => p.trim())
        .filter(Boolean)
        .map((p) => `<p>${renderInline(p.replace(/\n/g, ' '))}</p>`)
        .join('');
    })
    .join('');
}

/** Băm chuỗi thành số 32 bit (để xáo trộn đáp án ổn định giữa các lần build). */
function hash(str) {
  let h = 2166136261;
  for (let i = 0; i < str.length; i++) {
    h ^= str.charCodeAt(i);
    h = Math.imul(h, 16777619);
  }
  return h >>> 0;
}

/**
 * Xáo trộn thứ tự đáp án một cách xác định (cùng câu hỏi luôn ra cùng thứ tự),
 * để người viết không cần bận tâm đáp án đúng nằm ở vị trí nào.
 */
function shuffled(q) {
  let seed = hash(q.q);
  const rand = () => {
    seed = (Math.imul(seed, 1664525) + 1013904223) >>> 0;
    return seed / 4294967296;
  };
  const order = q.options.map((_, i) => i);
  for (let i = order.length - 1; i > 0; i--) {
    const j = Math.floor(rand() * (i + 1));
    [order[i], order[j]] = [order[j], order[i]];
  }
  return {
    ...q,
    options: order.map((k) => q.options[k]),
    answer: order.indexOf(q.answer),
  };
}

export function renderQuizHtml(questions, id) {
  const items = questions
    .map(shuffled)
    .map((q, i) => {
      const name = `${id}-q${i + 1}`;
      const options = q.options
        .map(
          (o, j) =>
            `<label class="quiz-opt"><input type="radio" name="${name}" value="${j}">` +
            `<span class="quiz-key" aria-hidden="true">${LETTERS[j]}</span>` +
            `<span class="quiz-text">${renderInline(o.text)}</span></label>`,
        )
        .join('');
      return (
        `<li class="quiz-q" id="${name}" data-answer="${q.answer}" data-letter="${LETTERS[q.answer]}">` +
        `<div class="quiz-stem" id="${name}-stem">${renderRich(q.q)}</div>` +
        `<div class="quiz-options" role="radiogroup" aria-labelledby="${name}-stem">${options}</div>` +
        `<div class="quiz-feedback" hidden><p class="quiz-verdict"></p>` +
        `<div class="quiz-explain">${renderRich(q.explain)}</div></div></li>`
      );
    })
    .join('');

  return (
    `<section class="quiz" id="${id}" data-quiz data-pagefind-ignore aria-label="Trắc nghiệm, ${questions.length} câu">` +
    `<div class="quiz-bar"><span class="quiz-progress" data-quiz-progress role="status" aria-live="polite">Chưa làm câu nào · ${questions.length} câu</span>` +
    `<span class="quiz-best" data-quiz-best></span>` +
    `<button type="button" class="btn secondary quiz-reset-top" data-quiz-reset hidden>Làm lại</button></div>` +
    `<ol class="quiz-list">${items}</ol>` +
    `<div class="quiz-result" data-quiz-result role="status" hidden></div>` +
    `<noscript><p>Bài trắc nghiệm cần bật JavaScript để chấm điểm.</p></noscript>` +
    `</section>`
  );
}
