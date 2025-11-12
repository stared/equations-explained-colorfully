// Export module for generating standalone documents in various formats
// Each export function is self-contained and fails hard on errors (no fallbacks)

import type { ParsedContent } from './parser';

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
 * Export to HTML (standalone document with embedded KaTeX)
 * Implementation: Commit 2
 */
export function exportToHTML(
  _content: ParsedContent,
  _colorScheme: ColorScheme
): string {
  throw new Error('HTML export not yet implemented');
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
