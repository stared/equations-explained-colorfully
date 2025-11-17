// HTML export module with server-side KaTeX rendering
// Exports standalone HTML documents with internal CSS and interactive hover

import type { ParsedContent } from '../parser';
import type { ColorScheme } from './types';
import katex from 'katex';
import { transformHtmlClass } from '../utils/latex-parser';
import { escapePreservingMath, escapeHTML } from '../utils/escape';
import { getTermColor } from '../utils/color-utils';

// Inject colors into LaTeX while preserving \htmlClass for interactivity
function injectColorsIntoLatex(latex: string, termOrder: string[], colorScheme: ColorScheme): string {
  return transformHtmlClass(latex, (className, content) => {
    try {
      const color = getTermColor(className, termOrder, colorScheme);
      return `\\htmlClass{term-${className}}{\\textcolor{${color}}{${content}}}`;
    } catch {
      return null; // Keep original if term not found
    }
  });
}

/**
 * Apply colors to description HTML (spans with term-X classes)
 * Uses CSS custom properties (variables) instead of inline hex colors
 */
function applyColorsToHTML(html: string, termOrder: string[]): string {
  let result = html;

  termOrder.forEach((className) => {
    const termClass = `term-${className}`;
    const cssVarName = `--term-${className}`;

    // Replace <span class="term-X"> with <span class="term-X" style="color: var(--term-X)">
    result = result.replace(
      new RegExp(`<span class="${termClass}">`, 'g'),
      `<span class="${termClass}" style="color: var(${cssVarName}); font-weight: 600;">`
    );
  });

  return result;
}

// Render inline $...$ math using KaTeX server-side
function renderInlineMath(text: string): string {
  return escapePreservingMath(text, escapeHTML, (math) => {
    try {
      return katex.renderToString(math, { displayMode: false, throwOnError: true });
    } catch {
      return '$' + escapeHTML(math) + '$'; // On error, keep original
    }
  });
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

  // Apply CSS variable references to description spans
  const descriptionHTML = applyColorsToHTML(content.description, content.termOrder);

  // Generate definitions HTML with colors and render inline math
  const definitionsHTML = Array.from(content.definitions.entries())
    .map(([className, definition]) => {
      const cssVarName = `--term-${className}`;
      // Render inline math in definitions
      const processedDefinition = renderInlineMath(definition);
      return `
    <div class="definition">
      <h3 style="color: var(${cssVarName});">${escapeHTML(className)}</h3>
      <p>${processedDefinition}</p>
    </div>`;
    })
    .join('\n');

  // Generate CSS custom properties for colors
  const colorVariables = content.termOrder
    .map((className) => {
      const color = getTermColor(className, content.termOrder, colorScheme);
      return `--term-${className}: ${color};`;
    })
    .join('\n      ');

  // Generate inline styles for term classes referencing CSS variables
  const termStyles = content.termOrder
    .map((className) => {
      return `.term-${className} { color: var(--term-${className}); }`;
    })
    .join('\n    ');

  return `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>${escapeHTML(content.title!)}</title>

  <!-- KaTeX CSS -->
  <link rel="stylesheet" href="https://cdn.jsdelivr.net/npm/katex@0.16.25/dist/katex.min.css" crossorigin="anonymous">

  <style>
    :root {
      --bg-color: #ffffff;
      --text-color: #1f2937;
      --border-color: #d1d5db;
      /* Color definitions */
      ${colorVariables}
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
  <h1>${escapeHTML(content.title!)}</h1>

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
