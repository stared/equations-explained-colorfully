import { exportContent, getFileExtension, type ExportFormat, type ColorScheme } from '../export';
import { type ParsedContent } from '../parser';
import { type EditorState } from './editor';

export function setupExportUI(
  state: EditorState,
  getParsedContent: () => ParsedContent | null,
  getCurrentScheme: () => ColorScheme,
  onExitExportMode: () => void
) {
  const exportBtn = document.getElementById('export-btn');
  const exportSelect = document.getElementById('export-format') as HTMLSelectElement;
  const copyBtn = document.getElementById('copy-btn');
  const downloadBtn = document.getElementById('download-btn');
  const editorContainer = document.getElementById('editor-container');

  let currentExport = '';
  let currentFormat: ExportFormat = 'html';

  const doExport = (format: ExportFormat) => {
    try {
      const parsedContent = getParsedContent();
      if (!parsedContent) {
        throw new Error('No content loaded');
      }

      // Generate export
      currentFormat = format;
      currentExport = exportContent(format, parsedContent, getCurrentScheme());

      // Show export in editor (read-only)
      if (state.editor) {
        state.isExportMode = true;
        state.editor.updateCode(currentExport);
        editorContainer?.classList.add('export-mode');
        // Make editor read-only
        const codeElement = editorContainer?.querySelector('code');
        if (codeElement) {
          (codeElement as HTMLElement).contentEditable = 'false';
        }
        if (exportBtn) exportBtn.textContent = 'Back to Edit';
        if (exportSelect) exportSelect.disabled = true; // Optional: disable change while viewing? Or allow live switch?
        // Let's allow live switch, so re-enable:
        if (exportSelect) exportSelect.disabled = false;
      }
    } catch (error) {
      console.error('Export failed:', error);
      alert(`Export failed: ${error instanceof Error ? error.message : String(error)}`);
    }
  };

  // Toggle export mode
  if (exportBtn) {
    exportBtn.addEventListener('click', (e) => {
      e.stopPropagation();

      if (state.isExportMode) {
        // Back to edit mode
        state.isExportMode = false;
        if (state.editor) {
          state.editor.updateCode(state.currentMarkdown);
          editorContainer?.classList.remove('export-mode');
          // Make editor editable again
          const codeElement = editorContainer?.querySelector('code');
          if (codeElement) {
            (codeElement as HTMLElement).contentEditable = 'true';
          }
        }
        exportBtn.textContent = 'Export';
        onExitExportMode();
      } else {
        // Enter export mode
        const format = (exportSelect?.value || 'html') as ExportFormat;
        doExport(format);
      }
    });
  }

  // Handle format change while in export mode
  if (exportSelect) {
    exportSelect.addEventListener('change', () => {
      if (state.isExportMode) {
        const format = exportSelect.value as ExportFormat;
        doExport(format);
      }
    });
  }

  if (copyBtn) {
    copyBtn.addEventListener('click', async () => {
      try {
        const contentToCopy = state.isExportMode ? currentExport : state.currentMarkdown;
        await navigator.clipboard.writeText(contentToCopy);

        const originalText = copyBtn.textContent;
        copyBtn.textContent = 'Copied!';
        setTimeout(() => {
          if (copyBtn) copyBtn.textContent = originalText;
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
        const parsedContent = getParsedContent();
        const content = state.isExportMode ? currentExport : state.currentMarkdown;
        const extension = state.isExportMode ? getFileExtension(currentFormat) : 'md';
        const mimeType = state.isExportMode ? 'text/html' : 'text/markdown';

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
