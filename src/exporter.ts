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
 * Escape LaTeX text while preserving inline math ($...$)
 */
function escapeLatexPreservingMath(text: string): string {
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
        result += '$'; // Keep the $ for math mode
        i++;
      } else {
        // End of math - keep everything in math mode as-is
        result += text.substring(mathStart + 1, i) + '$';
        inMath = false;
        i++;
        mathStart = -1;
      }
    } else if (!inMath) {
      // Outside math - escape special characters
      result += escapeLaTeX(text[i]);
      i++;
    } else {
      // Inside math - don't process yet, will be added when we hit closing $
      i++;
    }
  }

  // Handle unclosed math
  if (inMath) {
    result += escapeLaTeX(text.substring(mathStart));
  }

  return result;
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
  <title>${escapeHTML(content.title || 'Mathematical Equation')}</title>

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
 * Strip \htmlClass wrappers from LaTeX and replace with \textcolor
 * Converts \htmlClass{term-X}{content} → \textcolor{termX}{content}
 */
function stripHtmlClassForLatex(latex: string): string {
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
      const latexColorName = `term${className}`;

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

      // Replace with \textcolor{termX}{content}
      result += `\\textcolor{${latexColorName}}{${content}}`;

      i = contentEnd;
    } else {
      result += latex[i];
      i++;
    }
  }

  return result;
}

/**
 * Convert HTML description to LaTeX text
 * Strips <span> tags and converts content to LaTeX
 */
function convertDescriptionToLatex(html: string): string {
  let result = '';
  let i = 0;

  while (i < html.length) {
    // Look for <span class="term-X">
    if (html.substring(i, i + 18) === '<span class="term-') {
      // Find the closing >
      const tagEnd = html.indexOf('>', i);
      if (tagEnd === -1) {
        result += escapeLaTeX(html[i]);
        i++;
        continue;
      }

      // Extract class name
      const tagContent = html.substring(i, tagEnd + 1);
      const classMatch = tagContent.match(/class="term-([^"]+)"/);

      if (!classMatch) {
        result += escapeLaTeX(html.substring(i, tagEnd + 1));
        i = tagEnd + 1;
        continue;
      }

      const className = classMatch[1];
      const latexColorName = `term${className}`;

      // Find the closing </span>
      const closeTag = '</span>';
      const closeIndex = html.indexOf(closeTag, tagEnd + 1);

      if (closeIndex === -1) {
        result += escapeLaTeX(html.substring(i, tagEnd + 1));
        i = tagEnd + 1;
        continue;
      }

      // Extract content between tags
      const content = html.substring(tagEnd + 1, closeIndex);

      // Output colored text in LaTeX
      result += `\\textcolor{${latexColorName}}{${escapeLaTeX(content)}}`;

      i = closeIndex + closeTag.length;
    } else if (html.substring(i, i + 3) === '<p>') {
      // Skip <p> tags
      i += 3;
    } else if (html.substring(i, i + 4) === '</p>') {
      // Replace </p> with paragraph break
      result += '\n\n';
      i += 4;
    } else {
      // Regular text - escape for LaTeX
      result += escapeLaTeX(html[i]);
      i++;
    }
  }

  return result.trim();
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

\\title{${escapeLaTeX(content.title || 'Mathematical Equation')}}
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

/**
 * Inject TikZ coordinate nodes into LaTeX equation
 * Converts \htmlClass{term-X}{content} → \tikz[na] \node[coordinate] (nN) {};\textcolor{termX}{content}
 * Returns the modified LaTeX and the count of nodes added
 */
function injectTikzNodesInLatex(latex: string): { latex: string; nodeCount: number } {
  let result = '';
  let i = 0;
  let nodeIndex = 0;

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
      const latexColorName = `term${className}`;
      const nodeId = `n${nodeIndex}`;
      nodeIndex++;

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

      // Place colored content with coordinate node at right edge (for arrow connection)
      result += `\\textcolor{${latexColorName}}{${content}}\\tikz[baseline,remember picture,overlay] \\coordinate (${nodeId});`;

      i = contentEnd;
    } else {
      result += latex[i];
      i++;
    }
  }

  return { latex: result, nodeCount: nodeIndex };
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
\\frametitle{${escapeLaTeX(content.title || 'Equation')}}

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

\\title{${escapeLaTeX(content.title || 'Mathematical Equation')}}
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
