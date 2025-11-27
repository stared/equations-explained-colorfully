import '../style.css';
import { type ParsedContent } from '../parser';
import { renderEquation, renderDescription, refreshDisplay } from './equation-renderer';
import { setupHoverEffects } from './hover-effects';
import { colorSchemes, applyColorScheme, createColorSchemeSwitcher } from '../utils/color-schemes';
import {
  loadEquationsList,
  createEquationSelector,
  loadEquation,
  getEquationFromHash,
  type EquationInfo,
} from './equation-selector';
import {
  createEditorState,
  initializeEditor,
  updatePreview,
  setupEditorControls,
  updateEditorHighlighting,
  type EditorState,
} from './editor';
import { setupExportUI } from './export-controls';

// Application state
let equations: EquationInfo[] = [];
let currentEquationId = 'schrodinger';
let currentScheme = 'vibrant';
let parsedContent: ParsedContent | null = null;
let editorState: EditorState = createEditorState();

// Helper to refresh the display with current content
function doRefreshDisplay() {
  if (!parsedContent) return;
  refreshDisplay(
    parsedContent,
    currentScheme,
    (scheme) => {
      if (parsedContent) {
        applyColorScheme(scheme, parsedContent);
      }
    },
    () => {
      if (parsedContent) {
        setupHoverEffects(parsedContent);
      }
    }
  );
}

// Handle color scheme change
function handleSchemeChange(schemeName: string) {
  currentScheme = schemeName;
  if (!parsedContent) return;

  // Re-render
  renderEquation(parsedContent);
  renderDescription(parsedContent);

  // Apply colors AFTER rendering
  applyColorScheme(schemeName, parsedContent);

  // Re-setup hover effects after re-rendering
  setupHoverEffects(parsedContent);

  // Update editor highlighting with new color scheme
  const codeElement = document.querySelector('#editor-container code') as HTMLElement;
  if (codeElement && editorState.currentMarkdown) {
    updateEditorHighlighting(
      codeElement,
      editorState.currentMarkdown,
      colorSchemes[schemeName].colors,
      parsedContent
    );
  }
}

// Handle equation selection
async function handleEquationSelected(equationId: string) {
  const content = await loadEquation(
    equationId,
    equations,
    true,
    async (parsed, _equation, markdown) => {
      parsedContent = parsed;
      currentEquationId = equationId;

      // Clear and re-render
      doRefreshDisplay();

      // Load markdown into editor
      editorState.currentMarkdown = markdown;
      if (editorState.editor) {
        editorState.editor.updateCode(markdown);
      }
    }
  );

  if (content) {
    parsedContent = content;
  }
}

// Handle preview update from editor
async function handlePreviewUpdate(code: string) {
  const content = await updatePreview(code, async (parsed) => {
    parsedContent = parsed;
    doRefreshDisplay();

    // Update editor highlighting
    if (editorState.editor) {
        // Only update if the content hasn't changed since we started parsing
        // This prevents reverting user typing that happened during the async parse
        const currentCode = editorState.editor.toString();
        if (currentCode === code) {
             const pos = editorState.editor.save();
             editorState.editor.updateCode(code);
             editorState.editor.restore(pos);
        }
    }
  });

  if (content) {
    parsedContent = content;
  }
}

// Handle browser back/forward
function setupHashChangeListener() {
  window.addEventListener('hashchange', async () => {
    const equationId = getEquationFromHash(currentEquationId);
    await handleEquationSelected(equationId);
  });
}

export async function initializeApp() {
  try {
    // Load equations list
    equations = await loadEquationsList();

    // Create equation selector
    createEquationSelector(equations, currentEquationId, handleEquationSelected);

    // Create color scheme switcher
    createColorSchemeSwitcher(currentScheme, handleSchemeChange);

    // Initialize editor
    initializeEditor(
      editorState,
      colorSchemes[currentScheme].colors,
      () => parsedContent,
      handlePreviewUpdate
    );
    setupEditorControls();
    setupExportUI(
      editorState,
      () => parsedContent,
      () => colorSchemes[currentScheme],
      () => {
        // On exit export mode, re-highlight editor
        const codeElement = document.querySelector('#editor-container code') as HTMLElement;
        if (codeElement && editorState.currentMarkdown) {
          updateEditorHighlighting(
            codeElement,
            editorState.currentMarkdown,
            colorSchemes[currentScheme].colors,
            parsedContent
          );
        }
      }
    );

    // Setup hash change listener
    setupHashChangeListener();

    // Load equation from URL hash or default
    const initialEquation = getEquationFromHash(currentEquationId);
    await handleEquationSelected(initialEquation);

    // Expose test helpers for automated testing
    (window as any).__testHelpers = {
      editor: editorState.editor,
      updatePreview: handlePreviewUpdate,
      parsedContent: () => parsedContent,
      generateExport: (format: any) => {
        const { exportContent } = require('../export');
        if (!parsedContent) {
          throw new Error('No content loaded');
        }
        return exportContent(format, parsedContent, colorSchemes[currentScheme]);
      },
    };
  } catch (error) {
    console.error('Failed to load content:', error);
    // Re-throw to fail the build
    throw error;
  }
}
