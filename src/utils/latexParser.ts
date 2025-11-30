import { findMatchingBrace } from '../latexUtils';

// Transform \htmlClass{term-X}{content} patterns
export function transformHtmlClass(
  latex: string,
  transform: (className: string, content: string, index: number) => string | null
): string {
  let result = '';
  let i = 0;
  let matchIndex = 0;

  while (i < latex.length) {
    if (latex.substring(i, i + 11) === '\\htmlClass{') {
      const classStart = i + 11;
      const classEnd = latex.indexOf('}', classStart);

      if (classEnd === -1 || latex[classEnd + 1] !== '{') {
        result += latex[i];
        i++;
        continue;
      }

      const fullClassName = latex.substring(classStart, classEnd);
      if (!fullClassName.startsWith('term-')) {
        result += latex.substring(i, classEnd + 1);
        i = classEnd + 1;
        continue;
      }

      const contentStart = classEnd + 2;
      const contentEnd = findMatchingBrace(latex, contentStart);
      if (contentEnd === -1) {
        result += latex.substring(i, contentStart);
        i = contentStart;
        continue;
      }

      const className = fullClassName.substring(5); // Remove 'term-' prefix
      const content = latex.substring(contentStart, contentEnd - 1);

      const transformed = transform(className, content, matchIndex++);
      result += transformed !== null ? transformed : latex.substring(i, contentEnd);
      i = contentEnd;
    } else {
      result += latex[i];
      i++;
    }
  }

  return result;
}
