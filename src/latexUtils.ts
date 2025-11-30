// Find matching closing brace, returns index after closing brace or -1 if unmatched
export function findMatchingBrace(text: string, startIndex: number): number {
  let braceCount = 1;
  let i = startIndex;
  while (i < text.length && braceCount > 0) {
    if (text[i] === '{' && text[i - 1] !== '\\') braceCount++;
    else if (text[i] === '}' && text[i - 1] !== '\\') braceCount--;
    i++;
  }
  return braceCount === 0 ? i : -1;
}
