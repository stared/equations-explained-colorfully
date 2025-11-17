// Typst export module (modern LaTeX alternative)
// Uses tex2typst library for LaTeX-to-Typst conversion
// Defines colors as variables at the top, references them throughout

import type { ParsedContent } from '../parser';
import type { ColorScheme } from './types';
import { tex2typst } from 'tex2typst';
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

// Replace inline rgb("#hex") colors with Typst variable references
function replaceTypstInlineColors(
  text: string,
  termOrder: string[],
  colorScheme: ColorScheme,
  replaceBareHex: boolean = false
): string {
  let result = text;
  termOrder.forEach((className) => {
    const color = getTermColor(className, termOrder, colorScheme);
    const typstVarName = `term${className}`;
    const hexPattern = color.replace('#', '\\#');
    result = result.replace(new RegExp(`rgb\\("${hexPattern}"\\)`, 'g'), typstVarName);
    if (replaceBareHex) {
      result = result.replace(new RegExp(`${hexPattern}(?![a-fA-F0-9])`, 'g'), typstVarName);
    }
  });
  return result;
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

  // Convert equation LaTeX to Typst and replace inline colors with variable references
  const equationTypst = replaceTypstInlineColors(
    convertLatexToTypst(content.latex, content.termOrder, colorScheme),
    content.termOrder,
    colorScheme,
    true // also replace bare #hex format
  );

  // Convert description and replace inline colors with variable references
  const descriptionText = replaceTypstInlineColors(
    convertDescriptionToTypst(content.description, content.termOrder, colorScheme),
    content.termOrder,
    colorScheme
  );

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
