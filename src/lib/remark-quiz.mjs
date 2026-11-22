import { parseQuiz, renderQuizHtml } from './quiz.mjs';

/** Remark plugin: thay mỗi khối ```quiz bằng HTML của bài trắc nghiệm. */
export default function remarkQuiz() {
  return (tree, file) => {
    let n = 0;
    const walk = (node) => {
      if (!node.children) return;
      node.children = node.children.map((child) => {
        if (child.type === 'code' && child.lang === 'quiz') {
          n += 1;
          const label = `${file?.path ?? 'bài viết'} (khối quiz #${n})`;
          return { type: 'html', value: renderQuizHtml(parseQuiz(child.value, label), `quiz${n}`) };
        }
        walk(child);
        return child;
      });
    };
    walk(tree);
  };
}
