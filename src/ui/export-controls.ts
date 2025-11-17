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
        exportBtn.textContent = 'Export as...';
        exportMenu.style.display = 'none';
        onExitExportMode();
      } else {
        // Toggle menu
        const isVisible = exportMenu.style.display === 'block';
        exportMenu.style.display = isVisible ? 'none' : 'block';
      }
    });

    // Close menu when clicking outside
    document.addEventListener('click', () => {
      if (!state.isExportMode) {
        exportMenu.style.display = 'none';
      }
    });

    // Handle format selection
    exportMenu.querySelectorAll('.export-option').forEach((option) => {
      option.addEventListener('click', (e) => {
        e.stopPropagation();
        const format = (option as HTMLElement).dataset.format as ExportFormat;

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
        const contentToCopy = state.isExportMode ? currentExport : state.currentMarkdown;
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
