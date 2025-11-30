import type { ColorScheme } from '../export'

// App color schemes
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

export const defaultScheme = colorSchemes.vibrant

// Get color for a term - returns fallback if not found
export function getTermColor(term: string, termOrder: string[], scheme: ColorScheme): string {
  const index = termOrder.indexOf(term)
  if (index === -1) return '#000000'
  return scheme.colors[index] ?? '#000000'
}

// Build term→color map for O(1) lookups (use in computed properties)
export function buildTermColorMap(termOrder: string[], scheme: ColorScheme): Map<string, string> {
  return new Map(
    termOrder.map((term, i) => [term, scheme.colors[i] ?? '#000000'])
  )
}
