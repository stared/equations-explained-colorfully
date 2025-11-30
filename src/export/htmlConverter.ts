import { escapeLaTeX } from './escape';

// Transform HTML <span class="term-X">content</span> to custom format
export function convertHtmlDescription(
  html: string,
  escaper: (text: string) => string,
  coloredSpanFormatter: (className: string, content: string) => string
): string {
  let result = '';
  let i = 0;

  while (i < html.length) {
    // Look for <span class="term-X">
    if (html.substring(i, i + 18) === '<span class="term-') {
      const tagEnd = html.indexOf('>', i);
      if (tagEnd === -1) {
        result += escaper(html[i]);
        i++;
        continue;
      }

      const tagContent = html.substring(i, tagEnd + 1);
      const classMatch = tagContent.match(/class="term-([^"]+)"/);

      if (!classMatch) {
        result += escaper(html.substring(i, tagEnd + 1));
        i = tagEnd + 1;
        continue;
      }

      const className = classMatch[1];

      const closeTag = '</span>';
      const closeIndex = html.indexOf(closeTag, tagEnd + 1);

      if (closeIndex === -1) {
        result += escaper(html.substring(i, tagEnd + 1));
        i = tagEnd + 1;
        continue;
      }

      const content = html.substring(tagEnd + 1, closeIndex);
      result += coloredSpanFormatter(className, content);

      i = closeIndex + closeTag.length;
    } else if (html.substring(i, i + 3) === '<p>') {
      i += 3;
    } else if (html.substring(i, i + 4) === '</p>') {
      result += '\n\n';
      i += 4;
    } else {
      result += escaper(html[i]);
      i++;
    }
  }

  return result.trim();
}

// Convert HTML description to LaTeX with \textcolor (shared by latexExport and beamerExport)
export function convertDescriptionToLatex(html: string): string {
  return convertHtmlDescription(
    html,
    escapeLaTeX,
    (className, content) => `\\textcolor{term${className}}{${escapeLaTeX(content)}}`
  );
}
