import katex from 'katex';
import { type ParsedContent } from '../parser';

// Render LaTeX in text (handles $...$ inline math)
function renderLatexInText(text: string): string {
  return text.replace(/\$([^\$]+)\$/g, (_match, latex) => {
    try {
      return katex.renderToString(latex, { 
        displayMode: false, 
        throwOnError: false, 
        strict: false, // Disable strict mode to allow \htmlClass
        trust: true // Enable \htmlClass even in inline mode if needed
      });
    } catch (e) {
      return `$${latex}$`;
    }
  });
}

export function renderEquation(parsedContent: ParsedContent) {
  const equationContainer = document.getElementById('equation-container');
  if (!equationContainer) return;

  try {
    katex.render(parsedContent.latex, equationContainer, {
      displayMode: true,
      trust: true, // Enable \htmlClass
      strict: false, // Disable strict mode to allow \htmlClass
      throwOnError: false, // Don't throw on error, just render error message in red
    });
  } catch (error) {
    console.error('KaTeX render error:', error);
    equationContainer.innerHTML = `<span style="color: red;">Error rendering equation: ${error instanceof Error ? error.message : String(error)}</span>`;
  }

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

export function renderDescription(parsedContent: ParsedContent) {
  const staticDescDiv = document.getElementById('static-description');
  if (!staticDescDiv) return;

  staticDescDiv.innerHTML = `<p>${parsedContent.description}</p>`;
}

export function refreshDisplay(
  parsedContent: ParsedContent,
  currentScheme: string,
  applyColorScheme: (schemeName: string) => void,
  setupHoverEffects: () => void
) {
  const equationContainer = document.getElementById('equation-container');
  const descriptionContainer = document.getElementById('static-description');
  const hoverContainer = document.getElementById('hover-explanation');

  if (equationContainer) equationContainer.innerHTML = '';
  if (descriptionContainer) descriptionContainer.innerHTML = '';
  if (hoverContainer) {
    hoverContainer.innerHTML = '';
    hoverContainer.classList.remove('visible');
  }

  renderEquation(parsedContent);
  renderDescription(parsedContent);
  applyColorScheme(currentScheme);
  setupHoverEffects();
}

export { renderLatexInText };
