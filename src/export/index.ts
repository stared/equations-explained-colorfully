// Export module dispatcher and re-exports
// Main entry point for all export functionality

import type { ParsedContent } from '../parser';
import type { ColorScheme, ExportFormat } from './types';
import { exportToHTML } from './htmlExport';
import { exportToLaTeX } from './latexExport';
import { exportToBeamer } from './beamerExport';
import { exportToTypst } from './typstExport';

// Re-export types
export type { ColorScheme, ExportFormat } from './types';

// Re-export individual export functions
export { exportToHTML } from './htmlExport';
export { exportToLaTeX } from './latexExport';
export { exportToBeamer } from './beamerExport';
export { exportToTypst } from './typstExport';

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
 * Main export dispatcher
 * Routes to the appropriate export function based on format
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
