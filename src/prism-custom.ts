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

// Apply term colors to highlighted code
export function applyTermColors(
  element: HTMLElement,
  termOrder: string[],
  colors: string[]
) {
  // Apply colors to \mark[classname] elements
  element.querySelectorAll('.latex-mark').forEach(el => {
    const text = el.textContent || '';
    const match = text.match(/\[([^\]]+)\]/);
    if (match) {
      const className = match[1];
      const colorIndex = termOrder.indexOf(className);
      if (colorIndex >= 0 && colors[colorIndex]) {
        (el as HTMLElement).style.color = colors[colorIndex];
      }
    }
  });

  // Apply colors to [text]{.classname} elements
  element.querySelectorAll('.md-ref').forEach(el => {
    const text = el.textContent || '';
    const match = text.match(/\{\.([^\}]+)\}/);
    if (match) {
      const className = match[1];
      const colorIndex = termOrder.indexOf(className);
      if (colorIndex >= 0 && colors[colorIndex]) {
        (el as HTMLElement).style.color = colors[colorIndex];
      }
    }
  });

  // Apply colors to ## .classname headings
  element.querySelectorAll('.heading-class .class-name').forEach(el => {
    const className = (el.textContent || '').replace('.', '');
    const colorIndex = termOrder.indexOf(className);
    if (colorIndex >= 0 && colors[colorIndex]) {
      (el as HTMLElement).style.color = colors[colorIndex];
    }
  });
}
