// Parser for interactive math markdown format

import { findMatchingBrace } from './latexUtils';

export interface ParsedContent {
  title: string; // Title from # heading
  latex: string; // LaTeX equation with \htmlClass annotations
  description: string; // HTML description with term spans
  definitions: Map<string, string>; // class -> definition HTML
  termOrder: string[]; // Order of first appearance for color indexing
  errors: string[]; // Validation errors (non-fatal)
  warnings: string[]; // Validation warnings
}

// Helper function to convert \mark[class]{content} to \htmlClass{term-class}{content}
// Handles nested braces correctly
function convertMarkToHtmlClass(line: string, equationTerms: Set<string>, termOrder: string[], seenTerms: Set<string>): string {
  let result = '';
  let i = 0;

  while (i < line.length) {
    // Look for \mark[
    if (line.substring(i, i + 6) === '\\mark[') {
      // Find the closing ]
      const classStart = i + 6;
      let classEnd = line.indexOf(']', classStart);

      if (classEnd === -1) {
        // Malformed, just copy and continue
        result += line[i];
        i++;
        continue;
      }

      const className = line.substring(classStart, classEnd);

      // Check if there's a { after ]
      if (line[classEnd + 1] !== '{') {
        // Malformed, just copy and continue
        result += line.substring(i, classEnd + 1);
        i = classEnd + 1;
        continue;
      }

      // Track the term
      const termClass = `term-${className}`;
      equationTerms.add(className);
      if (!seenTerms.has(className)) {
        termOrder.push(className);
        seenTerms.add(className);
      }

      // Find the matching closing brace
      const contentStart = classEnd + 2; // After ]{
      const contentEnd = findMatchingBrace(line, contentStart);

      if (contentEnd === -1) {
        // Unmatched braces, just copy and continue
        result += line.substring(i, contentStart);
        i = contentStart;
        continue;
      }

      // Extract content (excluding the final })
      const content = line.substring(contentStart, contentEnd - 1);

      // Replace with \htmlClass{term-class}{content}
      result += `\\htmlClass{${termClass}}{${content}}`;
      i = contentEnd;
    } else {
      result += line[i];
      i++;
    }
  }

  return result;
}

/**
 * Parse markdown content with interactive math annotations
 *
 * Format:
 * - LaTeX: \mark[classname]{formula}
 * - Text: [text]{.classname}
 * - Definitions: ## .classname
 */
export function parseContent(markdown: string): ParsedContent {
  try {
    const lines = markdown.split('\n');
    let title = 'Untitled';
    let latex = '';
    let description = '';
    const definitions = new Map<string, string>();
    const termOrder: string[] = [];
    const equationTerms = new Set<string>(); // Terms marked in equation with \mark
    const descriptionTerms = new Set<string>(); // Terms used in description with [text]{.class}
    const seenTerms = new Set<string>(); // All terms seen (for color ordering)

    let inEquation = false;
    let inDescription = false;
    let currentDefClass = '';
    let currentDefContent: string[] = [];

    for (let i = 0; i < lines.length; i++) {
      const line = lines[i];

      // Parse title from # heading (only first one)
      if (title === 'Untitled' && line.match(/^#\s+[^#]/)) {
        title = line.substring(2).trim(); // Remove "# "
        continue;
      }

      // Detect equation block
      if (line.trim() === '$$') {
        if (!inEquation) {
          inEquation = true;
          continue;
        } else {
          inEquation = false;
          continue;
        }
      }

      // Parse equation content
      if (inEquation) {
        // Convert \mark[class]{latex} to \htmlClass{term-class}{latex}
        // Use helper function to handle nested braces correctly
        const converted = convertMarkToHtmlClass(line, equationTerms, termOrder, seenTerms);
        latex += converted + '\n';
        continue;
      }

      // Detect description section
      if (line.trim() === '## Description') {
        inDescription = true;
        continue;
      }

      // Detect definition section
      if (line.match(/^## \./)) {
        // Save previous definition if any
        if (currentDefClass) {
          definitions.set(currentDefClass, currentDefContent.join('\n').trim());
        }

        currentDefClass = line.substring(4).trim(); // Remove "## ."
        currentDefContent = [];
        inDescription = false;
        continue;
      }

      // Parse description content
      if (inDescription && line.trim() && !line.startsWith('#')) {
        // Convert [text]{.class} to <span class="term-class">text</span>
        const converted = line.replace(/\[([^\]]+)\]\{\.([^\}]+)\}/g, (_match, text, className) => {
          const termClass = `term-${className}`;
          descriptionTerms.add(className); // Track description terms
          // NOTE: Do NOT add to termOrder here - only equation marks define termOrder
          return `<span class="${termClass}">${text}</span>`;
        });
        description += converted + ' ';
        continue;
      }

      // Collect definition content
      if (currentDefClass && line.trim() && !line.startsWith('#')) {
        currentDefContent.push(line);
      }
    }

    // Save last definition
    if (currentDefClass) {
      definitions.set(currentDefClass, currentDefContent.join('\n').trim());
    }

    // VALIDATION: Build-time checks
    const errors: string[] = [];
    const warnings: string[] = [];

    // Helper to validate term relationships
    const validateTerms = (
      sourceTerms: Iterable<string>,
      targetTerms: Set<string> | Map<string, string>,
      getMessage: (term: string) => string,
      target: string[]
    ) => {
      for (const term of sourceTerms) {
        if (!targetTerms.has(term)) target.push(getMessage(term));
      }
    };

    // Run all validation checks
    validateTerms(descriptionTerms, equationTerms,
      term => `Term "${term}" is used in description [text]{.${term}} but not marked in equation with \\mark[${term}]{...}`, errors);
    validateTerms(equationTerms, definitions,
      term => `Term "${term}" is marked in equation with \\mark[${term}]{...} but has no definition (## .${term})`, errors);
    validateTerms(equationTerms, descriptionTerms,
      term => `Term "${term}" is marked in equation but not used in description`, warnings);
    validateTerms(definitions.keys(), equationTerms,
      term => `Definition "## .${term}" exists but term is never marked in equation`, warnings);

    // Log validation results
    if (errors.length > 0) console.error('Content validation errors:', errors);
    if (warnings.length > 0) console.warn('Content validation warnings:', warnings);

    return {
      title,
      latex: latex.trim(),
      description: description.trim(),
      definitions,
      termOrder,
      errors,
      warnings,
    };
  } catch (e) {
    console.error("Error in parseContent", e);
    throw e;
  }
}

/**
 * Load and parse content from a markdown file or string
 */
export async function loadContent(pathOrMarkdown: string, fromString = false): Promise<ParsedContent> {
  if (fromString) {
    // Parse directly from string
    return parseContent(pathOrMarkdown);
  } else {
    // Fetch from URL and parse
    const response = await fetch(pathOrMarkdown);
    const markdown = await response.text();
    return parseContent(markdown);
  }
}
