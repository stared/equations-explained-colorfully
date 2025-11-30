// Beamer export module with TikZ arrows (presentation format)
// Based on texample.net/tikz/examples/beamer-arrows/ pattern

import type { ParsedContent } from '../parser';
import type { ColorScheme } from '.';
import { transformHtmlClass } from '../utils/latex';
import { convertHtmlDescription } from './htmlConverter';
import { escapePreservingMath, escapeLaTeX } from './escape';
import { getTermColor } from '../utils/colorSchemes';

// Escape LaTeX text while preserving inline math ($...$)
const escapeLatexPreservingMath = (text: string) => escapePreservingMath(text, escapeLaTeX);

// Inject TikZ coordinate nodes into LaTeX equation
function injectTikzNodesInLatex(latex: string): { latex: string; nodeCount: number } {
  let nodeCount = 0;
  const result = transformHtmlClass(latex, (className, content, index) => {
    nodeCount++;
    return `\\textcolor{term${className}}{${content}}\\tikz[baseline,remember picture,overlay] \\coordinate (n${index});`;
  });
  return { latex: result, nodeCount };
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
