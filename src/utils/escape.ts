// Escape text while preserving $...$ inline math
export function escapePreservingMath(
  text: string,
  escaper: (char: string) => string,
  mathConverter?: (math: string) => string
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
        result += '$';
        i++;
      } else {
        const mathContent = text.substring(mathStart + 1, i);
        if (mathConverter) {
          try {
            result += mathConverter(mathContent) + '$';
          } catch {
            result += mathContent + '$';
          }
        } else {
          result += mathContent + '$';
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
