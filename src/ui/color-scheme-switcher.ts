import { type ParsedContent } from '../parser';
import { type ColorScheme } from '../export';

// Color schemes - arrays indexed by order of appearance
export const colorSchemes: Record<string, ColorScheme> = {
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

export function applyColorScheme(schemeName: string, parsedContent: ParsedContent) {
  const scheme = colorSchemes[schemeName];
  if (!scheme) return;

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
}

export function createColorSchemeSwitcher(
  currentScheme: string,
  onSchemeChange: (schemeName: string) => void
) {
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
      onSchemeChange(schemeKey);
    });
    switcherDiv.appendChild(button);
  });
}
