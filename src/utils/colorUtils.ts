// Shared color utilities for exports
import type { ColorScheme } from '../export/types';
import { transformHtmlClass } from './latexParser';

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
 * Inject colors into LaTeX while preserving \htmlClass for interactivity
 */
export function injectColorsIntoLatex(
  latex: string,
  termOrder: string[],
  colorScheme: ColorScheme
): string {
  return transformHtmlClass(latex, (className, content) => {
    try {
      const color = getTermColor(className, termOrder, colorScheme);
      return `\\htmlClass{term-${className}}{\\textcolor{${color}}{${content}}}`;
    } catch {
      return null; // Keep original if term not found
    }
  });
}
