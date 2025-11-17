// LaTeX export module for complete documents with xcolor
// Non-interactive: colors defined in preamble, applied with \textcolor

import type { ParsedContent } from '../parser';
import type { ColorScheme } from './types';
import { transformHtmlClass } from '../utils/latex-parser';
import { convertHtmlDescription } from '../utils/html-converter';
import { escapePreservingMath } from '../utils/escape';

/**
 * Get color for a term by its class name
 * Maps className ’ color hex via termOrder index
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
