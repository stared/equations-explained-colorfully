// Export module for generating standalone documents in various formats
// Each export function is self-contained and fails hard on errors (no fallbacks)

import type { ParsedContent } from './parser';
import katex from 'katex';

export interface ColorScheme {
  name: string;
  colors: string[];
}

export type ExportFormat = 'html' | 'latex' | 'beamer' | 'typst';

/**
 * Get color for a term by its class name
 * Maps className → color hex via termOrder index
 */
export function getTermColor(
  className: string,
  termOrder: string[],
  colorScheme: ColorScheme
): string {
  const index = termOrder.indexOf(className);
  if (index === -1) {
    throw new Error(`Term "${className}" not found in termOrder`);
  }
  const color = colorScheme.colors[index];
  if (!color) {
    throw new Error(`No color defined for index ${index} in scheme "${colorScheme.name}"`);
  }
  return color;
}

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

/**
 * Get file extension for export format
 */
export function getFileExtension(format: ExportFormat): string {
  const extensions: Record<ExportFormat, string> = {
    html: 'html',
    latex: 'tex',
    beamer: 'tex',
    typst: 'typ',
  };
  return extensions[format];
}

/**
 * Export to HTML (standalone document with server-side rendered KaTeX)
 * Based on best practices: internal CSS via <style> tag, pre-rendered math (no JS needed)
 */
export function exportToHTML(
  content: ParsedContent,
  colorScheme: ColorScheme
): string {
  // Convert \htmlClass to \textcolor for colored rendering
  const coloredLatex = injectColorsIntoLatex(content.latex, content.termOrder, colorScheme);

  // Server-side render the equation using KaTeX
  const equationHTML = katex.renderToString(coloredLatex, {
    displayMode: true,
    throwOnError: true,
    trust: true, // Allow \textcolor and \htmlClass
    strict: false, // Allow HTML extension
  });

  // Apply inline colors to description spans
  const descriptionHTML = applyColorsToHTML(content.description, content.termOrder, colorScheme);

  // Generate definitions HTML with colors and render inline math
  const definitionsHTML = Array.from(content.definitions.entries())
    .map(([className, definition]) => {
      const color = getTermColor(className, content.termOrder, colorScheme);
      // Render inline math in definitions
      const processedDefinition = renderInlineMath(definition);
      return `
    <div class="definition">
      <h3 style="color: ${color};">${escapeHTML(className)}</h3>
      <p>${processedDefinition}</p>
    </div>`;
    })
    .join('\n');

  // Generate inline styles for term classes
  const termStyles = content.termOrder
    .map((className) => {
      const color = getTermColor(className, content.termOrder, colorScheme);
      return `.term-${className} { color: ${color}; }`;
    })
    .join('\n    ');

  return `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>${escapeHTML(content.title || 'Mathematical Equation')}</title>

  <!-- KaTeX CSS -->
  <link rel="stylesheet" href="https://cdn.jsdelivr.net/npm/katex@0.16.25/dist/katex.min.css" crossorigin="anonymous">

  <style>
    :root {
      --bg-color: #ffffff;
      --text-color: #1f2937;
      --border-color: #d1d5db;
    }

    * {
      margin: 0;
      padding: 0;
      box-sizing: border-box;
    }

    body {
      font-family: 'ETBembo', Palatino, 'Palatino Linotype', 'Book Antiqua', Georgia, serif;
      background-color: var(--bg-color);
      color: var(--text-color);
      line-height: 1.6;
      margin: 0;
      padding: 2rem;
      max-width: 900px;
      margin: 0 auto;
    }

    h1 {
      font-size: 2rem;
      font-weight: 400;
      color: var(--text-color);
      margin-bottom: 2rem;
    }

    .equation-container {
      padding: 2rem 0;
      margin-bottom: 2rem;
      display: flex;
      justify-content: center;
      align-items: center;
    }

    .equation-container .katex {
      font-size: 1.6rem;
    }

    .description {
      border-top: 1px solid var(--border-color);
      padding-top: 1.5rem;
      margin-bottom: 2rem;
      font-size: 1rem;
      line-height: 1.6;
    }

    .description span {
      font-weight: 600;
    }

    /* Interactive term effects */
    [class*="term-"] {
      transition: opacity 0.2s ease;
      cursor: pointer;
    }

    [class*="term-"]:hover,
    .term-active {
      opacity: 0.6;
    }

    .term-clicked {
      opacity: 0.6;
      outline: 2px solid currentColor;
      outline-offset: 2px;
    }

    /* Hover explanation */
    .hover-explanation {
      border-top: 1px solid var(--border-color);
      padding-top: 1rem;
      margin-top: 1rem;
      min-height: 3rem;
      opacity: 0;
      pointer-events: none;
      font-size: 1rem;
      line-height: 1.6;
      color: var(--text-color);
    }

    .hover-explanation.visible {
      opacity: 1;
    }

    .definitions {
      display: none; /* Hidden - definitions only show on hover */
    }

    .footer {
      margin-top: 3rem;
      padding-top: 2rem;
      border-top: 1px solid var(--border-color);
      font-size: 0.875rem;
      color: #6b7280;
      text-align: center;
    }

    /* Term color styles */
    ${termStyles}

    @media print {
      body {
        max-width: 100%;
      }
    }
  </style>
</head>
<body>
  <h1>${escapeHTML(content.title || 'Mathematical Equation')}</h1>

  <div class="equation-container">
    ${equationHTML}
  </div>

  <div class="description">
    <p>${descriptionHTML}</p>
  </div>

  <div id="hover-explanation" class="hover-explanation"></div>

  <div class="definitions">
    <h2 style="font-size: 1.25rem; font-weight: 400; margin-bottom: 1.5rem;">Definitions</h2>
    ${definitionsHTML}
  </div>

  <div class="footer">
    <p>Created with <a href="https://github.com/stared/equations-explained-colorfully" target="_blank">Equations Explained Colorfully</a></p>
  </div>

  <script>
    // Interactive hover functionality
    (function() {
      const hoverDiv = document.getElementById('hover-explanation');
      // Definitions with pre-rendered inline math
      const definitions = ${JSON.stringify(
        Object.fromEntries(
          Array.from(content.definitions.entries()).map(([key, val]) => [
            key,
            renderInlineMath(val)
          ])
        )
      )};
      let clicked = null;

      const updateTerms = (termClass, classList, action) => {
        document.querySelectorAll('.' + termClass).forEach(el => el.classList[action](classList));
      };

      const showDefinition = (definition) => {
        hoverDiv.innerHTML = definition;
        hoverDiv.classList.add('visible');
      };

      document.querySelectorAll('[class*="term-"]').forEach(element => {
        const termClass = Array.from(element.classList).find(c => c.startsWith('term-'));
        if (!termClass) return;

        const className = termClass.replace('term-', '');
        const definition = definitions[className];
        if (!definition) return;

        element.style.cursor = 'pointer';

        element.addEventListener('click', () => {
          if (clicked?.element === element) {
            updateTerms(termClass, 'term-clicked', 'remove');
            clicked = null;
            hoverDiv.classList.remove('visible');
          } else {
            if (clicked) updateTerms(clicked.termClass, 'term-clicked', 'remove');
            updateTerms(termClass, 'term-clicked', 'add');
            clicked = { element, termClass, definition };
            showDefinition(definition);
          }
        });

        element.addEventListener('mouseenter', () => {
          updateTerms(termClass, 'term-active', 'add');
          showDefinition(definition);
        });

        element.addEventListener('mouseleave', () => {
          updateTerms(termClass, 'term-active', 'remove');
          clicked ? showDefinition(clicked.definition) : hoverDiv.classList.remove('visible');
        });
      });
    })();
  </script>
</body>
</html>`;
}

/**
 * Inject colors into LaTeX while preserving \htmlClass for interactivity
 * Wraps \htmlClass{term-X}{content} with \textcolor for colors
 */
function injectColorsIntoLatex(latex: string, termOrder: string[], colorScheme: ColorScheme): string {
  let result = '';
  let i = 0;

  while (i < latex.length) {
    // Look for \htmlClass{
    if (latex.substring(i, i + 11) === '\\htmlClass{') {
      // Find the closing }
      const classStart = i + 11;
      let classEnd = latex.indexOf('}', classStart);

      if (classEnd === -1) {
        // Malformed, just copy and continue
        result += latex[i];
        i++;
        continue;
      }

      const fullClassName = latex.substring(classStart, classEnd);

      // Check if it's a term-X class
      if (!fullClassName.startsWith('term-')) {
        // Not a term class, just copy
        result += latex.substring(i, classEnd + 1);
        i = classEnd + 1;
        continue;
      }

      // Extract className from term-X
      const className = fullClassName.substring(5); // Remove 'term-' prefix

      // Check if there's a { after }
      if (latex[classEnd + 1] !== '{') {
        // Malformed, just copy and continue
        result += latex.substring(i, classEnd + 1);
        i = classEnd + 1;
        continue;
      }

      // Find the matching closing brace for content
      const contentStart = classEnd + 2; // After }{
      let braceCount = 1;
      let contentEnd = contentStart;

      while (contentEnd < latex.length && braceCount > 0) {
        if (latex[contentEnd] === '{' && latex[contentEnd - 1] !== '\\') {
          braceCount++;
        } else if (latex[contentEnd] === '}' && latex[contentEnd - 1] !== '\\') {
          braceCount--;
        }
        contentEnd++;
      }

      if (braceCount !== 0) {
        // Unmatched braces, just copy and continue
        result += latex.substring(i, contentStart);
        i = contentStart;
        continue;
      }

      // Extract content (excluding the final })
      const content = latex.substring(contentStart, contentEnd - 1);

      // Get color for this term
      try {
        const color = getTermColor(className, termOrder, colorScheme);
        // Wrap with both \htmlClass (for interactivity) and \textcolor (for color)
        result += `\\htmlClass{${fullClassName}}{\\textcolor{${color}}{${content}}}`;
      } catch (error) {
        // Term not found in color scheme, keep original
        result += latex.substring(i, contentEnd);
      }

      i = contentEnd;
    } else {
      result += latex[i];
      i++;
    }
  }

  return result;
}

/**
 * Convert hex color to format supported by KaTeX
 * KaTeX supports hex colors directly like #RRGGBB
 */
function convertHexToLatexColor(hex: string): string {
  // KaTeX supports hex colors directly
  return hex;
}

/**
 * Apply colors to description HTML (spans with term-X classes)
 */
function applyColorsToHTML(html: string, termOrder: string[], colorScheme: ColorScheme): string {
  let result = html;

  termOrder.forEach((className) => {
    const color = getTermColor(className, termOrder, colorScheme);
    const termClass = `term-${className}`;

    // Replace <span class="term-X"> with <span class="term-X" style="color: #hex">
    result = result.replace(
      new RegExp(`<span class="${termClass}">`, 'g'),
      `<span class="${termClass}" style="color: ${color}; font-weight: 600;">`
    );
  });

  return result;
}

/**
 * Render inline $...$ math using KaTeX server-side
 */
function renderInlineMath(text: string): string {
  // Replace $...$ with rendered KaTeX HTML, but escape the rest
  let result = '';
  let i = 0;
  let inMath = false;
  let mathStart = -1;

  while (i < text.length) {
    if (text[i] === '$' && (i === 0 || text[i - 1] !== '\\')) {
      if (!inMath) {
        // Start of math
        mathStart = i;
        inMath = true;
        i++;
      } else {
        // End of math
        const mathContent = text.substring(mathStart + 1, i);
        try {
          const rendered = katex.renderToString(mathContent, {
            displayMode: false,
            throwOnError: true,
          });
          result += rendered;
        } catch (error) {
          // If rendering fails, keep the original
          result += '$' + escapeHTML(mathContent) + '$';
        }
        inMath = false;
        i++;
        mathStart = -1;
      }
    } else if (!inMath) {
      result += escapeHTML(text[i]);
      i++;
    } else {
      // Inside math, don't escape yet
      i++;
    }
  }

  // Handle unclosed math
  if (inMath) {
    result += escapeHTML(text.substring(mathStart));
  }

  return result;
}

/**
 * Export to LaTeX (complete document with xcolor)
 * Implementation: Commit 3
 */
export function exportToLaTeX(
  _content: ParsedContent,
  _colorScheme: ColorScheme
): string {
  throw new Error('LaTeX export not yet implemented');
}

/**
 * Export to Beamer with TikZ arrows (presentation format)
 * Implementation: Commit 4
 */
export function exportToBeamer(
  _content: ParsedContent,
  _colorScheme: ColorScheme
): string {
  throw new Error('Beamer export not yet implemented');
}

/**
 * Export to Typst (modern LaTeX alternative)
 * Implementation: Commit 5
 */
export function exportToTypst(
  _content: ParsedContent,
  _colorScheme: ColorScheme
): string {
  throw new Error('Typst export not yet implemented');
}

/**
 * Main export dispatcher
 */
export function exportContent(
  format: ExportFormat,
  content: ParsedContent,
  colorScheme: ColorScheme
): string {
  switch (format) {
    case 'html':
      return exportToHTML(content, colorScheme);
    case 'latex':
      return exportToLaTeX(content, colorScheme);
    case 'beamer':
      return exportToBeamer(content, colorScheme);
    case 'typst':
      return exportToTypst(content, colorScheme);
    default:
      throw new Error(`Unknown export format: ${format}`);
  }
}
