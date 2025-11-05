// Parser for interactive math markdown format

export interface ParsedContent {
  latex: string; // LaTeX equation with \htmlClass annotations
  description: string; // HTML description with term spans
  definitions: Map<string, string>; // class -> definition HTML
  termOrder: string[]; // Order of first appearance for color indexing
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
  let latex = '';
  let description = '';
  const definitions = new Map<string, string>();
  const termOrder: string[] = [];
  const seenTerms = new Set<string>();

  let inEquation = false;
  let inDescription = false;
  let currentDefClass = '';
  let currentDefContent: string[] = [];

  for (let i = 0; i < lines.length; i++) {
    const line = lines[i];

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

  // Validate that all terms have definitions
  const missingDefinitions: string[] = [];
  for (const term of termOrder) {
    if (!definitions.has(term)) {
      missingDefinitions.push(term);
    }
  }

  if (missingDefinitions.length > 0) {
    console.warn(
      'Warning: The following terms are referenced but have no definitions:',
      missingDefinitions
    );
  }

  // Optionally warn about unused definitions
  const unusedDefinitions: string[] = [];
  for (const defTerm of definitions.keys()) {
    if (!seenTerms.has(defTerm)) {
      unusedDefinitions.push(defTerm);
    }
  }

  if (unusedDefinitions.length > 0) {
    console.warn(
      'Warning: The following definitions are not referenced in equation or description:',
      unusedDefinitions
    );
  }

  return {
    latex: latex.trim(),
    description: description.trim(),
    definitions,
    termOrder,
  };
}

/**
 * Load and parse content from a markdown file
 */
export async function loadContent(path: string): Promise<ParsedContent> {
  const response = await fetch(path);
  const markdown = await response.text();
  return parseContent(markdown);
}
