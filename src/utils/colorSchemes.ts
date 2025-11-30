import type { ColorScheme } from '../export'

// App color schemes (used by ColorSchemeSwitcher)
export const colorSchemes: Record<string, ColorScheme> = {
  vibrant: {
    name: 'Vibrant',
    colors: [
      '#8b5cf6', '#10b981', '#ec4899', '#3b82f6', '#ef4444', '#06b6d4', '#f59e0b',
      '#a855f7', '#14b8a6', '#84cc16', '#6366f1', '#f97316',
    ],
  },
  accessible: {
    name: 'Accessible',
    colors: [
      '#0072B2', '#D55E00', '#009E73', '#882255', '#E69F00', '#56B4E9', '#F0E442',
      '#000000', '#999999', '#4B0082', '#8B4513', '#2F4F4F',
    ],
  },
  contrast: {
    name: 'High Contrast',
    colors: [
      '#0066CC', '#CC3300', '#00AA88', '#9933CC', '#CC0066', '#CCAA00', '#FF6600',
      '#006600', '#660099', '#996633', '#336699', '#663366',
    ],
  },
  nocolor: {
    name: 'No color',
    colors: Array(12).fill('#000000'),
  },
}

// Default scheme
export const defaultScheme = colorSchemes.vibrant

// Helper to get term color from scheme + termOrder
export function getTermColor(term: string, termOrder: string[], scheme: ColorScheme): string {
  const index = termOrder.indexOf(term)
  return scheme.colors[index] ?? '#000000'
}
