import Prism from 'prismjs';

// Define custom language for interactive equation markdown
Prism.languages.eqmd = {
  // LaTeX \mark[classname]{content}
  // Handles nested braces up to 2 levels deep (sufficient for \frac{\partial\psi}{\partial t})
  'latex-mark': {
    pattern: /\\mark\[[^\]]+\]\{(?:[^{}]|\{(?:[^{}]|\{[^}]*\})*\})*\}/g,
    inside: {
      'mark-class': {
        pattern: /\[[^\]]+\]/,
        lookbehind: true,
      },
      'mark-content': {
        pattern: /\{(?:[^{}]|\{(?:[^{}]|\{[^}]*\})*\})*\}/,
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

// Helper to mark tokens with errors based on a condition
function markTokensWithError(
  element: HTMLElement,
  selector: string,
  pattern: RegExp,
  shouldMarkError: (term: string) => boolean
) {
  element.querySelectorAll(selector).forEach(el => {
    const text = el.textContent || '';
    const match = text.match(pattern);
    if (match && shouldMarkError(match[1])) {
      el.classList.add('has-error');
    }
  });
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

  errors.forEach(error => {
    const termMatch = error.match(/Term "([^"]+)"/);
    if (!termMatch) return;
    const term = termMatch[1];

    if (error.includes('has no definition')) {
      termsWithoutDefinitions.add(term);
    }
  });

  // Mark each token type with appropriate error condition
  markTokensWithError(element, '.token.latex-mark', /\\mark\[([^\]]+)\]/, term => termsWithoutDefinitions.has(term));
  markTokensWithError(element, '.token.md-ref', /\{\.([^\}]+)\}/, term => !equationTerms.has(term));
  markTokensWithError(element, '.token.heading-class', /##\s+\.([a-z][a-z0-9-]*)/, term => !equationTerms.has(term));
}

// Helper to apply colors to tokens matching a pattern
function applyColorToTokens(
  element: HTMLElement,
  selector: string,
  pattern: RegExp,
  termOrder: string[],
  colors: string[]
) {
  element.querySelectorAll(selector).forEach(el => {
    const text = el.textContent || '';
    const match = text.match(pattern);
    if (match) {
      const className = match[1];
      const colorIndex = termOrder.indexOf(className);
      if (colorIndex >= 0 && colors[colorIndex]) {
        (el as HTMLElement).style.setProperty('color', colors[colorIndex], 'important');
      }
    }
  });
}

// Apply term colors to highlighted code based on dynamic markdown content
export function applyTermColors(
  element: HTMLElement,
  markdown: string,
  colors: string[]
) {
  const termOrder = extractEquationTerms(markdown);

  // Reset all colors to default
  element.querySelectorAll('.token.latex-mark, .token.md-ref, .token.heading-class').forEach(el => {
    (el as HTMLElement).style.removeProperty('color');
  });

  // Apply colors to each token type
  applyColorToTokens(element, '.token.latex-mark', /\\mark\[([^\]]+)\]/, termOrder, colors);
  applyColorToTokens(element, '.token.md-ref', /\{\.([^\}]+)\}/, termOrder, colors);
  applyColorToTokens(element, '.token.heading-class', /##\s+\.([a-z][a-z0-9-]*)/, termOrder, colors);
}
