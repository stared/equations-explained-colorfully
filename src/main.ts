import katex from 'katex';
import './style.css';
import { loadContent, type ParsedContent } from './parser';
import { CodeJar } from 'codejar';
import Prism from 'prismjs';
import './prism-custom';
import { applyTermColors, markErrors } from './prism-custom';
import { exportContent, getFileExtension, type ExportFormat, type ColorScheme } from './exporter';

// Equation metadata
interface EquationInfo {
  id: string;
  title: string;
  category: string;
  file: string;
}

let equations: EquationInfo[] = [];
let currentEquationId = 'schrodinger';

// Render LaTeX in text (handles $...$ inline math)
function renderLatexInText(text: string): string {
  return text.replace(/\$([^\$]+)\$/g, (_match, latex) => {
    try {
      return katex.renderToString(latex, { displayMode: false, throwOnError: false, strict: false });
    } catch (e) {
      return `$${latex}$`;
    }
  });
}

// Color schemes - arrays indexed by order of appearance
const colorSchemes: Record<string, ColorScheme> = {
  vibrant: {
    name: 'Vibrant',
    colors: [
      '#8b5cf6', '#10b981', '#ec4899', '#3b82f6', '#06b6d4', '#f59e0b', '#ef4444',
      '#a855f7', '#14b8a6', '#84cc16', '#6366f1', '#f97316'
    ],
  },
  accessible: {
    name: 'Accessible',
    colors: [
      '#0072B2', '#E69F00', '#009E73', '#56B4E9', '#CC79A7', '#F0E442', '#D55E00',
      '#000000', '#999999', '#4B0082', '#8B4513', '#2F4F4F'
    ],
  },
  contrast: {
    name: 'High Contrast',
    colors: [
      '#0066CC', '#FF6600', '#9933CC', '#00AA88', '#CC0066', '#CCAA00', '#CC3300',
      '#006600', '#660099', '#996633', '#336699', '#663366'
    ],
  },
  nocolor: {
    name: 'No color',
    colors: [
      '#000000', '#000000', '#000000', '#000000', '#000000', '#000000', '#000000',
      '#000000', '#000000', '#000000', '#000000', '#000000'
    ],
  },
};

// Current color scheme and loaded content
let currentScheme = 'vibrant';
let parsedContent: ParsedContent | null = null;

// Editor state
let editor: CodeJar | null = null;
let currentMarkdown = '';
let previewTimeout: number | null = null;
let isExportMode = false;

function applyColorScheme(schemeName: string) {
  const scheme = colorSchemes[schemeName];
  if (!scheme || !parsedContent) return;

  // First, reset all term colors to default
  document.querySelectorAll('[class*="term-"]').forEach((el) => {
    (el as HTMLElement).style.color = '';
  });

  // Apply colors ONLY to terms that exist in equation (termOrder)
  parsedContent.termOrder.forEach((className, index) => {
    const color = scheme.colors[index] || '#000000';
    const elements = document.querySelectorAll(`.term-${className}`);
    elements.forEach((el) => {
      (el as HTMLElement).style.color = color;
    });
  });

  currentScheme = schemeName;
}

function renderEquation() {
  const equationContainer = document.getElementById('equation-container');
  if (!equationContainer || !parsedContent) return;

  katex.render(parsedContent.latex, equationContainer, {
    displayMode: true,
    trust: true, // Enable \htmlClass
    throwOnError: false,
  });

  // Set pointer-events: none on KaTeX structural elements so they don't block term hover
  // But keep term elements interactive
  equationContainer.querySelectorAll('.katex *').forEach((el) => {
    const classList = (el as HTMLElement).classList;
    const hasTermClass = Array.from(classList).some(c => c.startsWith('term-'));
    if (hasTermClass) {
      (el as HTMLElement).style.pointerEvents = 'auto';
    } else {
      (el as HTMLElement).style.pointerEvents = 'none';
    }
  });
}

function renderDescription() {
  const staticDescDiv = document.getElementById('static-description');
  if (!staticDescDiv || !parsedContent) return;

  staticDescDiv.innerHTML = `<p>${parsedContent.description}</p>`;
}

function setupHoverEffects() {
  const hoverDiv = document.getElementById('hover-explanation');
  if (!hoverDiv || !parsedContent) return;

  let clicked: { element: HTMLElement; termClass: string; definition: string } | null = null;

  const updateTerms = (termClass: string, classList: string, action: 'add' | 'remove') => {
    document.querySelectorAll(`.${termClass}`).forEach((el) => el.classList[action](classList));
  };

  const showDefinition = (definition: string) => {
    hoverDiv.innerHTML = renderLatexInText(definition);
    hoverDiv.classList.add('visible');
  };

  document.querySelectorAll('[class*="term-"]').forEach((element) => {
    const termClass = Array.from(element.classList).find((c) => c.startsWith('term-'));
    if (!termClass) return;

    const definition = parsedContent?.definitions.get(termClass.replace('term-', ''));
    if (!definition) return;

    (element as HTMLElement).style.cursor = 'pointer';

    element.addEventListener('click', () => {
      if (clicked?.element === element) {
        updateTerms(termClass, 'term-clicked', 'remove');
        clicked = null;
        hoverDiv.classList.remove('visible');
      } else {
        if (clicked) updateTerms(clicked.termClass, 'term-clicked', 'remove');
        updateTerms(termClass, 'term-clicked', 'add');
        clicked = { element: element as HTMLElement, termClass, definition };
        showDefinition(definition);
      }
    });

    element.addEventListener('mouseenter', () => {
      updateTerms(termClass, 'term-active', 'add');
      showDefinition(definition);
    });

    element.addEventListener('mouseleave', () => {
      updateTerms(termClass, 'term-active', 'remove');
      clicked ? showDefinition(clicked.definition) : hoverDiv.classList.remove('visible');
    });
  });
}

function createColorSchemeSwitcher() {
  const switcherDiv = document.getElementById('color-scheme-switcher');
  if (!switcherDiv) return;

  Object.keys(colorSchemes).forEach((schemeKey) => {
    const button = document.createElement('button');
    button.textContent = colorSchemes[schemeKey].name;
    button.className = schemeKey === currentScheme ? 'active' : '';
    button.addEventListener('click', () => {
      // Update active button
      switcherDiv.querySelectorAll('button').forEach((btn) => {
        btn.classList.remove('active');
      });
      button.classList.add('active');
      // Re-render
      renderEquation();
      renderDescription();
      // Apply colors AFTER rendering
      applyColorScheme(schemeKey);
      // Re-setup hover effects after re-rendering
      setupHoverEffects();
      // Update editor highlighting with new color scheme
      const codeElement = document.querySelector('#editor-container code') as HTMLElement;
      if (codeElement) {
        highlightEditor(codeElement);
      }
    });
    switcherDiv.appendChild(button);
  });
}

// Load equations list
async function loadEquationsList(): Promise<EquationInfo[]> {
  const response = await fetch('./examples/equations.json');
  return response.json();
}

// Load and render a specific equation
async function loadEquation(equationId: string, updateHash = true) {
  const equation = equations.find(eq => eq.id === equationId);
  if (!equation) return;

  currentEquationId = equationId;

  // Update URL hash
  if (updateHash) {
    window.location.hash = equationId;
  }

  // Load the markdown content
  parsedContent = await loadContent(`./examples/${equation.file}`);

  // Update title (prefer title from markdown, fallback to equations.json)
  const titleElement = document.getElementById('equation-title');
  if (titleElement) {
    titleElement.textContent = parsedContent.title || equation.title;
  }

  // Update source link
  const sourceLink = document.getElementById('source-link') as HTMLAnchorElement;
  if (sourceLink) {
    sourceLink.href = `https://github.com/stared/equations-explained-colorfully/blob/main/public/examples/${equation.file}`;
  }

  // Clear and re-render
  const equationContainer = document.getElementById('equation-container');
  const descriptionContainer = document.getElementById('static-description');
  const hoverContainer = document.getElementById('hover-explanation');

  if (equationContainer) equationContainer.innerHTML = '';
  if (descriptionContainer) descriptionContainer.innerHTML = '';
  if (hoverContainer) {
    hoverContainer.innerHTML = '';
    hoverContainer.classList.remove('visible');
  }

  // Render content
  renderEquation();
  renderDescription();

  // Apply colors AFTER rendering
  applyColorScheme(currentScheme);

  // Setup hover effects
  setupHoverEffects();

  // Update active button
  const selectorDiv = document.getElementById('equation-selector');
  if (selectorDiv) {
    selectorDiv.querySelectorAll('button').forEach(btn => {
      if (btn.dataset.equationId === equationId) {
        btn.classList.add('active');
      } else {
        btn.classList.remove('active');
      }
    });
  }

  // Load markdown into editor
  await loadMarkdownIntoEditor(`./examples/${equation.file}`);
}

// Create equation selector buttons
function createEquationSelector() {
  const selectorDiv = document.getElementById('equation-selector');
  if (!selectorDiv) return;

  equations.forEach(equation => {
    const button = document.createElement('button');
    button.textContent = equation.title;
    button.dataset.equationId = equation.id;
    button.className = equation.id === currentEquationId ? 'active' : '';

    button.addEventListener('click', async () => {
      await loadEquation(equation.id);
    });

    selectorDiv.appendChild(button);
  });
}

// Get equation ID from URL hash
function getEquationFromHash(): string {
  const hash = window.location.hash.slice(1); // Remove #
  return hash || currentEquationId;
}

// Handle browser back/forward
window.addEventListener('hashchange', async () => {
  const equationId = getEquationFromHash();
  await loadEquation(equationId, false); // Don't update hash again
});

// Editor functions
function highlightEditor(editorElement: HTMLElement) {
  const markdown = editorElement.textContent || '';

  // Use Prism to highlight
  editorElement.innerHTML = Prism.highlight(
    markdown,
    Prism.languages.eqmd,
    'eqmd'
  );

  // Apply term colors dynamically based on current markdown
  applyTermColors(editorElement, markdown, colorSchemes[currentScheme].colors);

  // Mark errors with red underlines if parsed content has errors
  if (parsedContent && parsedContent.errors.length > 0) {
    markErrors(editorElement, markdown, parsedContent.errors);
  }
}

function initializeEditor() {
  const editorContainer = document.getElementById('editor-container');
  if (!editorContainer) return;

  // Create code element for CodeJar
  const codeElement = document.createElement('code');
  codeElement.className = 'language-eqmd';
  editorContainer.appendChild(codeElement);

  // Initialize CodeJar with Prism highlighting
  editor = CodeJar(codeElement, highlightEditor, {
    tab: '  ', // 2 spaces for tab
    indentOn: /[({[]$/,
  });

  // Update preview on change (debounced)
  editor.onUpdate((code: string) => {
    // Don't update preview when in export mode
    if (isExportMode) {
      return;
    }

    currentMarkdown = code;

    // Clear previous timeout
    if (previewTimeout !== null) {
      clearTimeout(previewTimeout);
    }

    // Debounce: update after 500ms of inactivity
    previewTimeout = window.setTimeout(async () => {
      await updatePreview();
    }, 500);
  });
}

async function updatePreview() {
  if (!currentMarkdown.trim()) return;

  try {
    // Parse markdown content
    parsedContent = await loadContent(currentMarkdown, true); // true = from string

    // Update title if present in markdown
    if (parsedContent.title) {
      const titleElement = document.getElementById('equation-title');
      if (titleElement) {
        titleElement.textContent = parsedContent.title;
      }
    }

    // Clear and re-render
    const equationContainer = document.getElementById('equation-container');
    const descriptionContainer = document.getElementById('static-description');
    const hoverContainer = document.getElementById('hover-explanation');

    if (equationContainer) equationContainer.innerHTML = '';
    if (descriptionContainer) descriptionContainer.innerHTML = '';
    if (hoverContainer) {
      hoverContainer.innerHTML = '';
      hoverContainer.classList.remove('visible');
    }

    // Render content
    renderEquation();
    renderDescription();

    // Apply colors
    applyColorScheme(currentScheme);

    // Setup hover effects
    setupHoverEffects();

    // Update editor highlighting with new colors
    const codeElement = document.querySelector('#editor-container code') as HTMLElement;
    if (codeElement) {
      highlightEditor(codeElement);
    }
  } catch (error) {
    console.error('Failed to parse markdown:', error);
    // Could show error message to user
  }
}

async function loadMarkdownIntoEditor(url: string) {
  try {
    const response = await fetch(url);
    const markdown = await response.text();
    currentMarkdown = markdown;

    if (editor) {
      editor.updateCode(markdown);
    }
  } catch (error) {
    console.error('Failed to load markdown:', error);
  }
}

function setupEditorControls() {
  // Toggle editor collapse/expand
  const toggleBtn = document.getElementById('toggle-editor-btn');
  const editorSidebar = document.getElementById('editor-sidebar');

  if (toggleBtn && editorSidebar) {
    toggleBtn.addEventListener('click', () => {
      editorSidebar.classList.toggle('collapsed');
    });
  }
}

function setupExportUI() {
  const exportBtn = document.getElementById('export-btn');
  const exportMenu = document.getElementById('export-menu');
  const copyBtn = document.getElementById('copy-btn');
  const downloadBtn = document.getElementById('download-btn');
  const editorContainer = document.getElementById('editor-container');

  let currentExport = '';
  let currentFormat: ExportFormat = 'html';

  // Toggle export menu
  if (exportBtn && exportMenu) {
    exportBtn.addEventListener('click', (e) => {
      e.stopPropagation();

      if (isExportMode) {
        // Back to edit mode
        isExportMode = false;
        if (editor) {
          editor.updateCode(currentMarkdown);
          editorContainer?.classList.remove('export-mode');
          // Make editor editable again
          const codeElement = editorContainer?.querySelector('code');
          if (codeElement) {
            (codeElement as HTMLElement).contentEditable = 'true';
          }
        }
        exportBtn.textContent = 'Export as...';
        exportMenu.style.display = 'none';
      } else {
        // Toggle menu
        const isVisible = exportMenu.style.display === 'block';
        exportMenu.style.display = isVisible ? 'none' : 'block';
      }
    });

    // Close menu when clicking outside
    document.addEventListener('click', () => {
      if (!isExportMode) {
        exportMenu.style.display = 'none';
      }
    });

    // Handle format selection
    exportMenu.querySelectorAll('.export-option').forEach((option) => {
      option.addEventListener('click', (e) => {
        e.stopPropagation();
        const format = (option as HTMLElement).dataset.format as ExportFormat;

        try {
          // Generate export
          currentFormat = format;
          currentExport = generateExport(format);

          // Show export in editor (read-only)
          if (editor) {
            isExportMode = true;
            editor.updateCode(currentExport);
            editorContainer?.classList.add('export-mode');
            // Make editor read-only
            const codeElement = editorContainer?.querySelector('code');
            if (codeElement) {
              (codeElement as HTMLElement).contentEditable = 'false';
            }
            exportBtn.textContent = 'Back to Edit';
            exportMenu.style.display = 'none';
          }
        } catch (error) {
          console.error('Export failed:', error);
          alert(`Export failed: ${error instanceof Error ? error.message : String(error)}`);
        }
      });
    });
  }

  if (copyBtn) {
    copyBtn.addEventListener('click', async () => {
      try {
        const contentToCopy = isExportMode ? currentExport : currentMarkdown;
        await navigator.clipboard.writeText(contentToCopy);

        const originalText = copyBtn.textContent;
        copyBtn.textContent = 'Copied!';
        setTimeout(() => {
          copyBtn.textContent = originalText;
        }, 2000);
      } catch (error) {
        console.error('Copy failed:', error);
        alert('Failed to copy to clipboard');
      }
    });
  }

  if (downloadBtn) {
    downloadBtn.addEventListener('click', () => {
      try {
        const content = isExportMode ? currentExport : currentMarkdown;
        const extension = isExportMode ? getFileExtension(currentFormat) : 'md';
        const mimeType = isExportMode ? 'text/html' : 'text/markdown';

        const blob = new Blob([content], { type: mimeType });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `${parsedContent?.title || 'equation'}.${extension}`.toLowerCase().replace(/[^a-z0-9.]+/g, '-');
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        URL.revokeObjectURL(url);
      } catch (error) {
        console.error('Download failed:', error);
        alert('Failed to download file');
      }
    });
  }
}

/**
 * Generate export for current content
 * UI will be added in Commit 6
 */
function generateExport(format: ExportFormat): string {
  if (!parsedContent) {
    throw new Error('No content loaded');
  }

  return exportContent(format, parsedContent, colorSchemes[currentScheme]);
}

// Initialize - load content and render
document.addEventListener('DOMContentLoaded', async () => {
  try {
    // Load equations list
    equations = await loadEquationsList();

    // Create equation selector
    createEquationSelector();

    // Create color scheme switcher
    createColorSchemeSwitcher();

    // Initialize editor
    initializeEditor();
    setupEditorControls();
    setupExportUI();

    // Load equation from URL hash or default
    const initialEquation = getEquationFromHash();
    await loadEquation(initialEquation);

    // Expose test helpers for automated testing
    (window as any).__testHelpers = {
      editor,
      updatePreview,
      parsedContent: () => parsedContent,
      generateExport,
    };
  } catch (error) {
    console.error('Failed to load content:', error);
    // Re-throw to fail the build
    throw error;
  }
});
