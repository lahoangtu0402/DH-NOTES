/** Chấm điểm và hiển thị phản hồi cho các khối trắc nghiệm trong trang. */

type Saved = { score: number; total: number };

const reduceMotion = () => matchMedia('(prefers-reduced-motion: reduce)').matches;

function load(key: string): Saved | null {
  try {
    const raw = localStorage.getItem(key);
    return raw ? (JSON.parse(raw) as Saved) : null;
  } catch {
    return null;
  }
}

function save(key: string, value: Saved) {
  try {
    localStorage.setItem(key, JSON.stringify(value));
  } catch {
    /* bỏ qua nếu trình duyệt chặn lưu trữ */
  }
}

function init(root: HTMLElement) {
  const questions = [...root.querySelectorAll<HTMLElement>('.quiz-q')];
  const total = questions.length;
  const progress = root.querySelector<HTMLElement>('[data-quiz-progress]')!;
  const best = root.querySelector<HTMLElement>('[data-quiz-best]')!;
  const result = root.querySelector<HTMLElement>('[data-quiz-result]')!;
  const topReset = root.querySelector<HTMLButtonElement>('.quiz-reset-top')!;
  const key = `quiz:${location.pathname}#${root.id}`;

  const showBest = () => {
    const prev = load(key);
    best.textContent = prev ? `Lần làm gần nhất: ${prev.score}/${prev.total}` : '';
  };
  showBest();

  const stats = () => {
    const answered = questions.filter((q) => q.dataset.done === '1');
    const right = answered.filter((q) => q.classList.contains('ok')).length;
    return { answered: answered.length, right };
  };

  const update = () => {
    const { answered, right } = stats();
    progress.textContent =
      answered === 0 ? `Chưa làm câu nào · ${total} câu` : `Đã làm ${answered}/${total} · đúng ${right}`;
    topReset.hidden = answered === 0;
  };

  const finish = () => {
    const { right } = stats();
    const ratio = right / total;
    const message =
      ratio >= 0.9
        ? 'Rất tốt! Bạn nắm vững bài này. Hôm sau hãy làm lại để kiểm tra bạn còn nhớ không.'
        : ratio >= 0.7
          ? 'Khá tốt. Đọc lại phần giải thích của các câu sai rồi làm lại.'
          : 'Chưa vững. Hãy đọc lại bài, đặc biệt các mục liên quan tới câu sai, rồi làm lại.';

    result.replaceChildren();
    const score = document.createElement('p');
    score.className = 'quiz-score';
    score.textContent = `${right}/${total} câu đúng`;
    const msg = document.createElement('p');
    msg.textContent = message;
    result.append(score, msg);

    const wrong = questions.filter((q) => q.classList.contains('bad'));
    if (wrong.length) {
      const p = document.createElement('p');
      p.append('Các câu cần xem lại: ');
      wrong.forEach((q, i) => {
        const a = document.createElement('a');
        a.href = `#${q.id}`;
        a.textContent = `câu ${questions.indexOf(q) + 1}`;
        p.append(a, i < wrong.length - 1 ? ', ' : '.');
      });
      result.append(p);
    }
    const again = document.createElement('button');
    again.type = 'button';
    again.className = 'btn';
    again.textContent = 'Làm lại';
    again.addEventListener('click', reset);
    result.append(again);
    result.hidden = false;
    save(key, { score: right, total });
    showBest();
  };

  const reset = () => {
    for (const q of questions) {
      delete q.dataset.done;
      q.classList.remove('ok', 'bad');
      q.querySelectorAll<HTMLInputElement>('input').forEach((i) => {
        i.checked = false;
        i.disabled = false;
      });
      q.querySelectorAll('.quiz-opt').forEach((l) => l.classList.remove('is-correct', 'is-wrong'));
      q.querySelector<HTMLElement>('.quiz-feedback')!.hidden = true;
    }
    result.hidden = true;
    update();
    root.scrollIntoView({ block: 'start', behavior: reduceMotion() ? 'auto' : 'smooth' });
  };

  root.addEventListener('change', (e) => {
    const input = e.target as HTMLInputElement;
    if (input.type !== 'radio') return;
    const q = input.closest<HTMLElement>('.quiz-q');
    if (!q || q.dataset.done === '1') return;

    q.dataset.done = '1';
    const chosen = Number(input.value);
    const correct = Number(q.dataset.answer);
    const isRight = chosen === correct;
    const labels = [...q.querySelectorAll<HTMLElement>('.quiz-opt')];
    q.querySelectorAll<HTMLInputElement>('input').forEach((i) => (i.disabled = true));
    labels[correct]?.classList.add('is-correct');
    if (!isRight) labels[chosen]?.classList.add('is-wrong');
    q.classList.add(isRight ? 'ok' : 'bad');

    const feedback = q.querySelector<HTMLElement>('.quiz-feedback')!;
    feedback.querySelector<HTMLElement>('.quiz-verdict')!.textContent = isRight
      ? 'Chính xác!'
      : `Chưa đúng. Đáp án đúng là ${q.dataset.letter}.`;
    feedback.hidden = false;

    update();
    if (stats().answered === total) finish();
  });

  topReset.addEventListener('click', reset);
  update();
}

document.querySelectorAll<HTMLElement>('[data-quiz]').forEach(init);
