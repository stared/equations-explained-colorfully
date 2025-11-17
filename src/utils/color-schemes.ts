import { type ParsedContent } from '../parser';
import { type ColorScheme } from '../export';

// Color schemes for interactive UI (12 colors each)
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

// Export/test color schemes (used for static exports and testing)
export const vibrantScheme: ColorScheme = {
  name: 'vibrant',
  colors: ['#e6194B', '#3cb44b', '#ffe119', '#4363d8', '#f58231'],
};

export const vibrant10Scheme: ColorScheme = {
  name: 'vibrant',
  colors: [
    '#e6194B', '#3cb44b', '#ffe119', '#4363d8', '#f58231',
    '#911eb4', '#46f0f0', '#f032e6', '#bcf60c', '#fabebe',
  ],
};

export const viridisScheme: ColorScheme = {
  name: 'viridis',
  colors: ['#440154', '#31688e', '#35b779', '#fde724', '#20908d', '#5ec962', '#3b528b'],
};

export const viridis10Scheme: ColorScheme = {
  name: 'viridis',
  colors: [
    '#440154', '#31688e', '#35b779', '#fde724', '#20908d',
    '#5ec962', '#3b528b', '#29af7f', '#2c728e', '#482173',
  ],
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
