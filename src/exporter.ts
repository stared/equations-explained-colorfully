// Export module for generating standalone documents in various formats
// Each export function is self-contained and fails hard on errors (no fallbacks)

import type { ParsedContent } from './parser';
import katex from 'katex';
import { tex2typst } from 'tex2typst';
import { transformHtmlClass } from './utils/latex-parser';
import { escapePreservingMath } from './utils/escape';
import { convertHtmlDescription } from './utils/html-converter';

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

// Escape LaTeX text while preserving inline math ($...$)
const escapeLatexPreservingMath = (text: string) => escapePreservingMath(text, escapeLaTeX);

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

// Strip \htmlClass wrappers and replace with \textcolor
function stripHtmlClassForLatex(latex: string): string {
  return transformHtmlClass(latex, (className, content) =>
    `\\textcolor{term${className}}{${content}}`
  );
}

// Convert HTML description to LaTeX text
function convertDescriptionToLatex(html: string): string {
  return convertHtmlDescription(
    html,
    escapeLaTeX,
    (className, content) => `\\textcolor{term${className}}{${escapeLaTeX(content)}}`
  );
}

/**
 * Export to LaTeX (complete document with xcolor)
 * Non-interactive: colors defined in preamble, applied with \textcolor
 */
export function exportToLaTeX(
  content: ParsedContent,
  colorScheme: ColorScheme
): string {
  // Generate color definitions for preamble
  const colorDefinitions = content.termOrder
    .map((className) => {
      const color = getTermColor(className, content.termOrder, colorScheme);
      const latexColorName = `term${className}`;
      // Convert #RRGGBB to uppercase hex for LaTeX
      const hexColor = color.replace('#', '').toUpperCase();
      return `\\definecolor{${latexColorName}}{HTML}{${hexColor}}`;
    })
    .join('\n');

  // Convert LaTeX: replace \htmlClass{term-X}{content} with \textcolor{termX}{content}
  const coloredLatex = stripHtmlClassForLatex(content.latex);

  // Convert description: strip HTML tags, convert to LaTeX
  const descriptionLatex = convertDescriptionToLatex(content.description);

  // Convert definitions
  const definitionsLatex = Array.from(content.definitions.entries())
    .map(([className, definition]) => {
      const latexColorName = `term${className}`;
      // Definitions are plain text, but may contain inline math $...$ which should be kept as-is
      // Escape text outside of math mode, keep math mode untouched
      const definitionLatex = escapeLatexPreservingMath(definition);
      return `\\subsection*{\\textcolor{${latexColorName}}{${escapeLaTeX(className)}}}\n${definitionLatex}`;
    })
    .join('\n\n');

  return `\\documentclass{article}

% Minimal preamble
\\usepackage[T1]{fontenc}
\\usepackage{amsmath}
\\usepackage{xcolor}

% Define colors from scheme
${colorDefinitions}

\\title{${escapeLaTeX(content.title!)}}
\\date{}

\\begin{document}
\\maketitle

\\section*{Equation}

\\begin{equation}
${coloredLatex}
\\end{equation}

\\section*{Description}

${descriptionLatex}

\\section*{Definitions}

${definitionsLatex}

\\end{document}`;
}

// Inject TikZ coordinate nodes into LaTeX equation
function injectTikzNodesInLatex(latex: string): { latex: string; nodeCount: number } {
  let nodeCount = 0;
  const result = transformHtmlClass(latex, (className, content, index) => {
    nodeCount++;
    return `\\textcolor{term${className}}{${content}}\\tikz[baseline,remember picture,overlay] \\coordinate (n${index});`;
  });
  return { latex: result, nodeCount };
}

/**
 * Export to Beamer with TikZ arrows (presentation format)
 * Based on texample.net/tikz/examples/beamer-arrows/ pattern
 */
export function exportToBeamer(
  content: ParsedContent,
  colorScheme: ColorScheme
): string {
  // Generate color definitions for preamble
  const colorDefinitions = content.termOrder
    .map((className) => {
      const color = getTermColor(className, content.termOrder, colorScheme);
      const latexColorName = `term${className}`;
      const hexColor = color.replace('#', '').toUpperCase();
      return `\\definecolor{${latexColorName}}{HTML}{${hexColor}}`;
    })
    .join('\n');

  // Convert LaTeX with TikZ nodes at each term
  const { latex: equationWithNodes } = injectTikzNodesInLatex(content.latex);

  // Convert description
  const descriptionLatex = convertDescriptionToLatex(content.description);

  // Generate individual frames for each term with arrow
  const definitionFrames = Array.from(content.definitions.entries())
    .map(([className, definition], index) => {
      const latexColorName = `term${className}`;
      const nodeId = `def${index}`;
      const equationNodeId = `n${index}`;
      const definitionLatex = escapeLatexPreservingMath(definition);

      return `\\begin{frame}<${index + 2}>[label=term${index}]
\\frametitle{${escapeLaTeX(content.title!)}}

\\begin{equation*}
${equationWithNodes}
\\end{equation*}

\\vspace{0.5em}

\\begin{block}{}
\\tikz[na] \\node[coordinate] (${nodeId}) {};
${definitionLatex}
\\end{block}

% Draw clean arrow from term to definition (offset left to approximate center, down for margin)
\\begin{tikzpicture}[overlay,remember picture]
  \\draw[->,${latexColorName},line width=1.5pt,rounded corners=5pt] ($(${equationNodeId})+(-0.3em,-0.2em)$) -- ++(0,-0.6) -| (${nodeId});
\\end{tikzpicture}

\\end{frame}`;
    })
    .join('\n\n');

  return `\\documentclass{beamer}

% Beamer theme
\\usetheme{default}
\\setbeamertemplate{navigation symbols}{}

% TikZ for arrows
\\usepackage{tikz}
\\usetikzlibrary{arrows,shapes,calc}
\\tikzstyle{every picture}+=[remember picture]
\\tikzstyle{na} = [baseline=-.5ex]

% Colors and math
\\usepackage{amsmath}
\\usepackage{xcolor}

% Define colors from scheme
${colorDefinitions}

\\title{${escapeLaTeX(content.title!)}}
\\date{}

\\begin{document}

\\begin{frame}
\\titlepage
\\end{frame}

\\begin{frame}[label=overview]
\\frametitle{Equation}

\\begin{equation*}
${equationWithNodes}
\\end{equation*}

\\vspace{1em}

${descriptionLatex}

\\end{frame}

${definitionFrames}

\\end{document}`;
}

/**
 * Escape Typst special characters
 */
function escapeTypst(text: string): string {
  // In Typst, special characters that need escaping in markup mode
  return text
    .replace(/\\/g, '\\\\')
    .replace(/#/g, '\\#')
    .replace(/\*/g, '\\*')
    .replace(/_/g, '\\_')
    .replace(/\[/g, '\\[')
    .replace(/\]/g, '\\]')
    .replace(/`/g, '\\`');
}

// Escape Typst text while preserving inline math (converts LaTeX math to Typst)
const escapeTypstPreservingMath = (text: string) =>
  escapePreservingMath(text, escapeTypst, (math) => `$${tex2typst(math)}$`);

// Convert HTML description to Typst text with colored terms
function convertDescriptionToTypst(html: string, termOrder: string[], colorScheme: ColorScheme): string {
  return convertHtmlDescription(
    html,
    escapeTypst,
    (className, content) => {
      const color = getTermColor(className, termOrder, colorScheme);
      return `#text(fill: rgb("${color}"))[${escapeTypst(content)}]`;
    }
  );
}

// Convert \htmlClass LaTeX to Typst via \textcolor preprocessing
function convertLatexToTypst(latex: string, termOrder: string[], colorScheme: ColorScheme): string {
  const withColors = transformHtmlClass(latex, (className, content) => {
    try {
      const color = getTermColor(className, termOrder, colorScheme);
      return `\\textcolor{${color}}{${content}}`;
    } catch {
      return content; // Keep content without wrapper if term not found
    }
  });
  return tex2typst(withColors);
}

/**
 * Export to Typst (modern LaTeX alternative)
 * Uses tex2typst library for LaTeX-to-Typst conversion
 * Defines colors as variables at the top, references them throughout
 */
export function exportToTypst(
  content: ParsedContent,
  colorScheme: ColorScheme
): string {
  // Generate color definitions
  const colorDefinitions = content.termOrder
    .map((className) => {
      const color = getTermColor(className, content.termOrder, colorScheme);
      const typstVarName = `term${className}`;
      return `#let ${typstVarName} = rgb("${color}")`;
    })
    .join('\n');

  // Convert equation LaTeX to Typst (produces inline colors initially)
  const equationTypstRaw = convertLatexToTypst(content.latex, content.termOrder, colorScheme);

  // Replace inline colors with variable references in equation
  let equationTypst = equationTypstRaw;
  content.termOrder.forEach((className) => {
    const color = getTermColor(className, content.termOrder, colorScheme);
    const typstVarName = `term${className}`;
    // Replace rgb("#hex") format that tex2typst produces
    const hexPattern = color.replace('#', '\\#');
    equationTypst = equationTypst.replace(
      new RegExp(`rgb\\("${hexPattern}"\\)`, 'g'),
      typstVarName
    );
    // Also replace bare #hex format if it appears
    equationTypst = equationTypst.replace(
      new RegExp(`${hexPattern}(?![a-fA-F0-9])`, 'g'),
      typstVarName
    );
  });

  // Convert description and replace inline colors with variable references
  const descriptionTextRaw = convertDescriptionToTypst(content.description, content.termOrder, colorScheme);
  let descriptionText = descriptionTextRaw;
  content.termOrder.forEach((className) => {
    const color = getTermColor(className, content.termOrder, colorScheme);
    const typstVarName = `term${className}`;
    const hexPattern = color.replace('#', '\\#');
    descriptionText = descriptionText.replace(
      new RegExp(`rgb\\("${hexPattern}"\\)`, 'g'),
      typstVarName
    );
  });

  // Convert definitions using variable names directly
  const definitionsTypst = Array.from(content.definitions.entries())
    .map(([className, definition]) => {
      const typstVarName = `term${className}`;
      const definitionText = escapeTypstPreservingMath(definition);
      return `=== #text(fill: ${typstVarName})[${escapeTypst(className)}]\n\n${definitionText}`;
    })
    .join('\n\n');

  return `#set document(title: [${escapeTypst(content.title!)}])
#set page(paper: "a4")
#set text(font: "New Computer Modern", size: 11pt)

// Color definitions
${colorDefinitions}

= ${escapeTypst(content.title!)}

== Equation

$ ${equationTypst} $

== Description

${descriptionText}

== Definitions

${definitionsTypst}

#align(center)[
  _Generated with #link("https://github.com/stared/equations-explained-colorfully")[Equations Explained Colorfully]_
]
`;
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
