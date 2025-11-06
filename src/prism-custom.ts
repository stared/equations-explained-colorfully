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

// Mark errors in editor with subtle underlines
export function markErrors(
  element: HTMLElement,
  errors: string[]
) {
  if (errors.length === 0) return;

  // Only mark terms that are missing definitions (critical errors)
  // Don't mark terms that are just unused in description (warnings)
  const termsWithoutDefinitions = new Set<string>();

  errors.forEach(error => {
    // Only mark "marked in equation but has no definition" errors
    if (error.includes('has no definition')) {
      const termMatch = error.match(/Term "([^"]+)"/);
      if (termMatch) {
        termsWithoutDefinitions.add(termMatch[1]);
      }
    }
  });

  if (termsWithoutDefinitions.size === 0) return;

  // Mark only the \mark[term] in equations and ## .term headings
  // Don't mark references in description (those are fine)
  element.querySelectorAll('.token.latex-mark').forEach(el => {
    const text = el.textContent || '';
    termsWithoutDefinitions.forEach(term => {
      if (text.includes(`[${term}]`)) {
        el.classList.add('has-error');
      }
    });
  });
}

// Apply term colors to highlighted code based on dynamic markdown content
export function applyTermColors(
  element: HTMLElement,
  markdown: string,
  colors: string[]
) {
  // Re-extract term order from current markdown content
  const termOrder = extractClassNames(markdown);

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

  // Apply colors to entire [text]{.classname} elements
  element.querySelectorAll('.token.md-ref').forEach(el => {
    const text = el.textContent || '';
    const match = text.match(/\{\.([^\}]+)\}/);
    if (match) {
      const className = match[1];
      const colorIndex = termOrder.indexOf(className);
      if (colorIndex >= 0 && colors[colorIndex]) {
        (el as HTMLElement).style.setProperty('color', colors[colorIndex], 'important');
      }
    }
  });

  // Apply colors to entire ## .classname headings
  element.querySelectorAll('.token.heading-class').forEach(el => {
    const text = el.textContent || '';
    const match = text.match(/##\s+\.([a-z][a-z0-9-]*)/);
    if (match) {
      const className = match[1];
      const colorIndex = termOrder.indexOf(className);
      if (colorIndex >= 0 && colors[colorIndex]) {
        (el as HTMLElement).style.setProperty('color', colors[colorIndex], 'important');
      }
    }
  });
}
