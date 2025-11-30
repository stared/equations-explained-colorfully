import { exportContent, getFileExtension, type ExportFormat, type ColorScheme } from '../export';
import { type ParsedContent } from '../parser';
import { type EditorState } from './editor';

export function setupExportUI(
  state: EditorState,
  getParsedContent: () => ParsedContent | null,
  getCurrentScheme: () => ColorScheme,
  _onExitExportMode: () => void
) {
  const exportSelect = document.getElementById('export-format') as HTMLSelectElement;
  const copyBtn = document.getElementById('copy-btn');

  const downloadExport = (format: ExportFormat) => {
    try {
      const parsedContent = getParsedContent();
      if (!parsedContent) {
        throw new Error('No content loaded');
      }

      // Generate export content
      const content = exportContent(format, parsedContent, getCurrentScheme());
      const extension = getFileExtension(format);
      const mimeType = format === 'html' ? 'text/html' : 'text/plain';

      // Trigger download
      const blob = new Blob([content], { type: mimeType });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `${parsedContent.title || 'equation'}.${extension}`.toLowerCase().replace(/[^a-z0-9.]+/g, '-');
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);

    } catch (error) {
      console.error('Export failed:', error);
      alert(`Export failed: ${error instanceof Error ? error.message : String(error)}`);
    }
  };

  // Handle format selection (Trigger Download)
  if (exportSelect) {
    exportSelect.addEventListener('change', () => {
      const format = exportSelect.value;
      if (format) {
        downloadExport(format as ExportFormat);
        
        // Reset selector to default "Export as..."
        exportSelect.value = ""; 
      }
    });
  }

  if (copyBtn) {
    copyBtn.addEventListener('click', async () => {
      try {
        // Always copy the markdown source since we don't have a preview mode anymore
        const contentToCopy = state.currentMarkdown;
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
}
