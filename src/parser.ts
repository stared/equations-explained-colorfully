// Parser for interactive math markdown format

export interface ParsedContent {
  title?: string; // Optional title from # heading
  latex: string; // LaTeX equation with \htmlClass annotations
  description: string; // HTML description with term spans
  definitions: Map<string, string>; // class -> definition HTML
  termOrder: string[]; // Order of first appearance for color indexing
  errors: string[]; // Validation errors (non-fatal)
  warnings: string[]; // Validation warnings
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
  const lines = markdown.split('\n');
  let title: string | undefined = undefined;
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
    if (!title && line.match(/^#\s+[^#]/)) {
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
      const converted = line.replace(/\\mark\[([^\]]+)\]\{/g, (_match, className) => {
        const termClass = `term-${className}`;
        equationTerms.add(className); // Track equation terms
        if (!seenTerms.has(className)) {
          termOrder.push(className);
          seenTerms.add(className);
        }
        return `\\htmlClass{${termClass}}{`;
      });
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
        if (!seenTerms.has(className)) {
          termOrder.push(className);
          seenTerms.add(className);
        }
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

  // ERROR: Terms used in description but not marked in equation
  for (const term of descriptionTerms) {
    if (!equationTerms.has(term)) {
      errors.push(
        `Term "${term}" is used in description [text]{.${term}} but not marked in equation with \\mark[${term}]{...}`
      );
    }
  }

  // ERROR: Terms marked in equation but have no definition
  for (const term of equationTerms) {
    if (!definitions.has(term)) {
      errors.push(
        `Term "${term}" is marked in equation with \\mark[${term}]{...} but has no definition (## .${term})`
      );
    }
  }

  // WARNING: Terms marked in equation but not used in description
  for (const term of equationTerms) {
    if (!descriptionTerms.has(term)) {
      warnings.push(
        `Term "${term}" is marked in equation but not used in description`
      );
    }
  }

  // WARNING: Definitions exist but term never marked in equation
  for (const defTerm of definitions.keys()) {
    if (!equationTerms.has(defTerm)) {
      warnings.push(
        `Definition "## .${defTerm}" exists but term is never marked in equation`
      );
    }
  }

  // Return errors and warnings without throwing (allow preview to continue)
  if (errors.length > 0) {
    console.error('Content validation errors:', errors);
  }

  if (warnings.length > 0) {
    console.warn('Content validation warnings:', warnings);
  }

  return {
    title,
    latex: latex.trim(),
    description: description.trim(),
    definitions,
    termOrder,
    errors,
    warnings,
  };
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
