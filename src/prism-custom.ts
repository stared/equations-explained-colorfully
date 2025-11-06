import Prism from 'prismjs';

// Define custom language for interactive equation markdown
Prism.languages.eqmd = {
  // LaTeX \mark[classname]{content}
  'latex-mark': {
    pattern: /\\mark\[[^\]]+\]\{[^}]+\}/g,
    inside: {
      'mark-class': {
        pattern: /\[[^\]]+\]/,
        lookbehind: true,
      },
      'mark-content': {
        pattern: /\{[^}]+\}/,
        lookbehind: true,
      },
      'keyword': /\\mark/,
    }
  },

  // Markdown [text]{.classname}
  'md-ref': {
    pattern: /\[[^\]]+\]\{\.[^\}]+\}/g,
    inside: {
      'ref-text': {
        pattern: /\[[^\]]+\]/,
        lookbehind: true,
      },
      'ref-class': {
        pattern: /\{\.[^\}]+\}/,
        lookbehind: true,
      }
    }
  },

  // Heading with class: ## .classname
  'heading-class': {
    pattern: /^##\s+\.[a-z][a-z0-9-]*/gm,
    inside: {
      'class-name': /\.[a-z][a-z0-9-]*/,
      'punctuation': /^##/,
    }
  },

  // Regular markdown heading
  'heading': {
    pattern: /^##\s+[^.\n][^\n]*/gm,
    inside: {
      'punctuation': /^##/,
    }
  },

  // LaTeX display math $$...$$
  'latex-display': {
    pattern: /\$\$[\s\S]+?\$\$/g,
    inside: {
      'punctuation': /\$\$/,
    }
  },

  // LaTeX inline math $...$
  'latex-inline': {
    pattern: /\$[^\$\n]+\$/g,
    inside: {
      'punctuation': /\$/,
    }
  },

  // Bold **text**
  'bold': {
    pattern: /\*\*[^*]+\*\*/g,
    inside: {
      'punctuation': /\*\*/,
    }
  },

  // Italic *text*
  'italic': {
    pattern: /\*[^*]+\*/g,
    inside: {
      'punctuation': /\*/,
    }
  },
};

// Helper to extract class names from markdown content
// NOTE: This extracts from ALL sources - use extractEquationTerms for equation-only
export function extractClassNames(markdown: string): string[] {
  const classNames = new Set<string>();

  // Extract from \mark[classname]{...}
  const latexMarks = markdown.matchAll(/\\mark\[([^\]]+)\]/g);
  for (const match of latexMarks) {
    classNames.add(match[1]);
  }

  // Extract from [text]{.classname}
  const mdRefs = markdown.matchAll(/\[[^\]]+\]\{\.([^\}]+)\}/g);
  for (const match of mdRefs) {
    classNames.add(match[1]);
  }

  // Extract from ## .classname
  const headings = markdown.matchAll(/^##\s+\.([a-z][a-z0-9-]*)/gm);
  for (const match of headings) {
    classNames.add(match[1]);
  }

  return Array.from(classNames);
}

// Extract ONLY terms from equation section ($$...$$)
export function extractEquationTerms(markdown: string): string[] {
  const terms: string[] = [];
  const seenTerms = new Set<string>();

  // Extract equation block (everything between $$...$$)
  const equationMatch = markdown.match(/\$\$([\s\S]*?)\$\$/);
  if (!equationMatch) return terms;

  const equationContent = equationMatch[1];

  // Extract \mark[classname] in order of appearance
  const markPattern = /\\mark\[([^\]]+)\]/g;
  let match;
  while ((match = markPattern.exec(equationContent)) !== null) {
    const term = match[1];
    if (!seenTerms.has(term)) {
      terms.push(term);
      seenTerms.add(term);
    }
  }

  return terms;
}

// Mark errors in editor with subtle underlines
export function markErrors(
  element: HTMLElement,
  markdown: string,
  errors: string[]
) {
  // Remove any existing error markings
  element.querySelectorAll('.has-error').forEach(el => {
    el.classList.remove('has-error');
  });

  // Get equation terms (source of truth)
  const equationTerms = new Set(extractEquationTerms(markdown));

  // Track terms with errors
  const termsWithoutDefinitions = new Set<string>();
  const termsNotInEquation = new Set<string>();

  errors.forEach(error => {
    const termMatch = error.match(/Term "([^"]+)"/);
    if (!termMatch) return;
    const term = termMatch[1];

    if (error.includes('has no definition')) {
      // \mark[term]{...} exists but no ## .term
      termsWithoutDefinitions.add(term);
    } else if (error.includes('not marked in equation')) {
      // [text]{.term} or ## .term exists but no \mark[term]{...}
      termsNotInEquation.add(term);
    }
  });

  // Mark \mark[term]{...} that have no definitions
  element.querySelectorAll('.token.latex-mark').forEach(el => {
    const text = el.textContent || '';
    const match = text.match(/\\mark\[([^\]]+)\]/);
    if (match && termsWithoutDefinitions.has(match[1])) {
      el.classList.add('has-error');
    }
  });

  // Mark [text]{.term} that are not in equation
  element.querySelectorAll('.token.md-ref').forEach(el => {
    const text = el.textContent || '';
    const match = text.match(/\{\.([^\}]+)\}/);
    if (match && !equationTerms.has(match[1])) {
      el.classList.add('has-error');
    }
  });

  // Mark ## .term that are not in equation
  element.querySelectorAll('.token.heading-class').forEach(el => {
    const text = el.textContent || '';
    const match = text.match(/##\s+\.([a-z][a-z0-9-]*)/);
    if (match && !equationTerms.has(match[1])) {
      el.classList.add('has-error');
    }
  });
}

// Apply term colors to highlighted code based on dynamic markdown content
export function applyTermColors(
  element: HTMLElement,
  markdown: string,
  colors: string[]
) {
  // Extract term order ONLY from equation section
  const termOrder = extractEquationTerms(markdown);

  // First, reset all colors to default
  element.querySelectorAll('.token.latex-mark, .token.md-ref, .token.heading-class').forEach(el => {
    (el as HTMLElement).style.removeProperty('color');
  });

  // Apply colors to entire \mark[classname]{content} elements
  element.querySelectorAll('.token.latex-mark').forEach(el => {
    const text = el.textContent || '';
    const match = text.match(/\\mark\[([^\]]+)\]/);
    if (match) {
      const className = match[1];
      const colorIndex = termOrder.indexOf(className);
      if (colorIndex >= 0 && colors[colorIndex]) {
        (el as HTMLElement).style.setProperty('color', colors[colorIndex], 'important');
      }
    }
  });

  // Apply colors to entire [text]{.classname} elements (only if term exists in equation)
  element.querySelectorAll('.token.md-ref').forEach(el => {
    const text = el.textContent || '';
    const match = text.match(/\{\.([^\}]+)\}/);
    if (match) {
      const className = match[1];
      const colorIndex = termOrder.indexOf(className);
      if (colorIndex >= 0 && colors[colorIndex]) {
        (el as HTMLElement).style.setProperty('color', colors[colorIndex], 'important');
      }
      // If not in termOrder, color stays default (black)
    }
  });

  // Apply colors to entire ## .classname headings (only if term exists in equation)
  element.querySelectorAll('.token.heading-class').forEach(el => {
    const text = el.textContent || '';
    const match = text.match(/##\s+\.([a-z][a-z0-9-]*)/);
    if (match) {
      const className = match[1];
      const colorIndex = termOrder.indexOf(className);
      if (colorIndex >= 0 && colors[colorIndex]) {
        (el as HTMLElement).style.setProperty('color', colors[colorIndex], 'important');
      }
      // If not in termOrder, color stays default (black)
    }
  });
}
