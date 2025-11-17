/**
 * Escape HTML special characters
 */
export function escapeHTML(text: string): string {
  const map: Record<string, string> = {
    '&': '&amp;',
    '<': '&lt;',
    '>': '&gt;',
    '"': '&quot;',
    "'": '&#039;',
  };
  return text.replace(/[&<>"']/g, (char) => map[char]);
}

/**
 * Escape LaTeX special characters
 */
export function escapeLaTeX(text: string): string {
  const map: Record<string, string> = {
    '\\': '\\textbackslash{}',
    '{': '\\{',
    '}': '\\}',
    '$': '\\$',
    '&': '\\&',
    '%': '\\%',
    '#': '\\#',
    '_': '\\_',
    '~': '\\textasciitilde{}',
    '^': '\\textasciicircum{}',
  };
  return text.replace(/[\\{}$&%#_~^]/g, (char) => map[char]);
}

// Escape text while processing $...$ inline math
// The mathFormatter callback controls the complete output format (including delimiters if needed)
export function escapePreservingMath(
  text: string,
  escaper: (char: string) => string,
  mathFormatter?: (math: string) => string
): string {
  let result = '';
  let i = 0;
  let inMath = false;
  let mathStart = -1;

  while (i < text.length) {
    if (text[i] === '$' && (i === 0 || text[i - 1] !== '\\')) {
      if (!inMath) {
        mathStart = i;
        inMath = true;
        i++;
      } else {
        const mathContent = text.substring(mathStart + 1, i);
        if (mathFormatter) {
          try {
            result += mathFormatter(mathContent);
          } catch {
            result += '$' + mathContent + '$'; // On error, preserve as-is
          }
        } else {
          result += '$' + mathContent + '$'; // Default: preserve math delimiters
        }
        inMath = false;
        i++;
        mathStart = -1;
      }
    } else if (!inMath) {
      result += escaper(text[i]);
      i++;
    } else {
      i++;
    }
  }

  // Handle unclosed math
  if (inMath) {
    result += escaper(text.substring(mathStart));
  }

  return result;
}
