import { ref, computed } from 'vue'
import { type ColorScheme } from '../export'

// Color schemes for interactive UI (12 colors each)
export const colorSchemes: Record<string, ColorScheme> = {
  vibrant: {
    name: 'Vibrant',
    colors: [
      '#8b5cf6', // 0: Purple
      '#10b981', // 1: Green
      '#ec4899', // 2: Pink
      '#3b82f6', // 3: Blue
      '#ef4444', // 4: Red
      '#06b6d4', // 5: Cyan
      '#f59e0b', // 6: Amber
      '#a855f7',
      '#14b8a6',
      '#84cc16',
      '#6366f1',
      '#f97316'
    ],
  },
  accessible: {
    name: 'Accessible',
    colors: [
      '#0072B2', // 0: Blue
      '#D55E00', // 1: Vermillion
      '#009E73', // 2: Bluish Green
      '#882255', // 3: Wine/Red-Purple
      '#E69F00', // 4: Orange
      '#56B4E9', // 5: Sky Blue
      '#F0E442', // 6: Yellow
      '#000000',
      '#999999',
      '#4B0082',
      '#8B4513',
      '#2F4F4F'
    ],
  },
  contrast: {
    name: 'High Contrast',
    colors: [
      '#0066CC', '#CC3300', '#00AA88', '#9933CC', '#CC0066', '#CCAA00', '#FF6600',
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
}

export function useColorScheme(termOrder: () => string[]) {
  const currentSchemeName = ref('vibrant')

  const currentScheme = computed(() => colorSchemes[currentSchemeName.value])

  const colors = computed(() => currentScheme.value?.colors ?? [])

  function getTermColor(termClass: string): string {
    const order = termOrder()
    const index = order.indexOf(termClass)
    return colors.value[index] ?? '#000000'
  }

  function setScheme(schemeName: string) {
    if (colorSchemes[schemeName]) {
      currentSchemeName.value = schemeName
    }
  }

  return {
    currentSchemeName,
    currentScheme,
    colors,
    colorSchemes,
    getTermColor,
    setScheme,
  }
}
