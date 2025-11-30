import { CodeJar } from "codejar";
import Prism from "prismjs";
import "../prism-custom";
import { applyTermColors, markErrors } from "../prism-custom";
import { loadContent, type ParsedContent } from "../parser";

export interface EditorState {
  editor: CodeJar | null;
  currentMarkdown: string;
  previewTimeout: number | null;
  isExportMode: boolean;
}

export function createEditorState(): EditorState {
  return {
    editor: null,
    currentMarkdown: "",
    previewTimeout: null,
    isExportMode: false,
  };
}

function highlightEditor(
  editorElement: HTMLElement,
  markdown: string,
  colors: string[],
  parsedContent: ParsedContent | null
) {
  // Use Prism to highlight
  editorElement.innerHTML = Prism.highlight(
    markdown,
    Prism.languages.eqmd,
    "eqmd"
  );

  // Apply term colors dynamically based on current markdown
  applyTermColors(editorElement, markdown, colors);

  // Mark errors with red underlines if parsed content has errors
  if (parsedContent && parsedContent.errors.length > 0) {
    markErrors(editorElement, markdown, parsedContent.errors);
  }
}

export function initializeEditor(
  state: EditorState,
  colors: string[],
  getParsedContent: () => ParsedContent | null,
  onUpdate: (code: string) => void
) {
  const editorContainer = document.getElementById("editor-container");
  if (!editorContainer) return;

  // Create code element for CodeJar
  const codeElement = document.createElement("code");
  codeElement.className = "language-eqmd";
  editorContainer.appendChild(codeElement);

  // Initialize CodeJar with Prism highlighting
  state.editor = CodeJar(
    codeElement,
    (el) =>
      highlightEditor(el, el.textContent || "", colors, getParsedContent()),
    {
      tab: "  ", // 2 spaces for tab
      indentOn: /[({[]$/,
    }
  );

  // Update preview on change (debounced)
  state.editor.onUpdate((code: string) => {
    // Don't update preview when in export mode
    if (state.isExportMode) {
      return;
    }

    state.currentMarkdown = code;

    // Clear previous timeout
    if (state.previewTimeout !== null) {
      clearTimeout(state.previewTimeout);
    }

    // Debounce: update after 500ms of inactivity
    state.previewTimeout = window.setTimeout(async () => {
      await onUpdate(code);
    }, 500);
  });
}

export async function updatePreview(
  markdown: string,
  onContentParsed: (parsedContent: ParsedContent) => void | Promise<void>
): Promise<ParsedContent | null> {
  if (!markdown.trim()) return null;

  try {
    // Parse markdown content
    const parsedContent = await loadContent(markdown, true); // true = from string

    // Update title if present in markdown
    if (parsedContent.title) {
      const titleElement = document.getElementById("equation-title");
      if (titleElement) {
        titleElement.textContent = parsedContent.title;
      }
    }

    await onContentParsed(parsedContent);

    return parsedContent;
  } catch (error) {
    console.error("Failed to parse markdown or update UI:", error);
    if (error instanceof Error) {
      console.error("Stack trace:", error.stack);
    }
    // Don't leave the error unhandled, return null so the caller knows parsing failed
    return null;
  }
}

export function updateEditorHighlighting(
  editorElement: HTMLElement,
  markdown: string,
  colors: string[],
  parsedContent: ParsedContent | null
) {
  highlightEditor(editorElement, markdown, colors, parsedContent);
}

export function setupEditorControls() {
  // Toggle editor collapse/expand
  const toggleBtn = document.getElementById("toggle-editor-btn");
  const editorSidebar = document.getElementById("editor-sidebar");

  if (toggleBtn && editorSidebar) {
    toggleBtn.addEventListener("click", () => {
      editorSidebar.classList.toggle("collapsed");
    });
  }
}
