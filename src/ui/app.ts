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
    try {
      parsedContent = parsed;
      doRefreshDisplay();

      // Update editor highlighting
      // We DON'T call updateCode here anymore because it causes crashes (error1) when recursive.
      // Instead, we rely on CodeJar's natural input event to trigger highlighting.
      //
      // BUT, if we need to show *new* errors/colors immediately after parsing, we can
      // manually trigger highlighting if we are sure it's safe.
      // The safest way is to do NOTHING here and let the user keep typing.
      // The colors will update on the NEXT keystroke.
      //
      // However, if we want immediate feedback, we can try to manually update the class names
      // on the EXISTING DOM nodes without touching innerHTML or restore().
      //
      // Let's just update the parsedContent reference (done above).
      // The highlightEditor callback inside editor.ts calls getParsedContent().
      // So the NEXT time highlightEditor runs, it will see the new content.
      //
      // Can we trigger highlightEditor manually?
      // editor.ts exports updateEditorHighlighting.
      //
      // Let's try to NOT update the editor at all here.
      // This is the "Rewrite" strategy: stop fighting CodeJar.
      
    } catch (e) {
      console.error('Error during UI update after parse:', e);
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
    // Note: We must initialize editor BEFORE loading the equation so that loadEquation can populate it
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
    // If the initial equation from hash doesn't exist (e.g. we deleted it or it's invalid), fallback to the first available one
    const equationExists = equations.some(eq => eq.id === initialEquation);
    const equationToLoad = equationExists ? initialEquation : (equations.length > 0 ? equations[0].id : currentEquationId);
    
    await handleEquationSelected(equationToLoad);

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
