import { ref, computed, onMounted } from 'vue'
import { loadContent, type ParsedContent } from '../parser'
import type { ColorScheme } from '../export'

// --- Color Schemes ---
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

// --- Equation Info ---
export interface EquationInfo {
  id: string
  title: string
  file: string
  content: string
}

// Vite glob import for markdown files
const equationFiles = import.meta.glob('../examples/*.md', { query: '?raw', import: 'default', eager: true })

export function useEquationApp() {
  // === Equations State ===
  const equations = ref<EquationInfo[]>([])
  const currentEquationId = ref('schrodinger')
  const currentEquation = computed(() =>
    equations.value.find(eq => eq.id === currentEquationId.value)
  )

  // === Parsed Content ===
  const parsedContent = ref<ParsedContent | null>(null)
  const editorMarkdown = ref('')
  const termOrder = computed(() => parsedContent.value?.termOrder ?? [])

  // === Color Scheme ===
  const currentSchemeName = ref('vibrant')
  const currentScheme = computed(() => colorSchemes[currentSchemeName.value])
  const colors = computed(() => currentScheme.value?.colors ?? [])

  function getTermColor(term: string): string {
    const index = termOrder.value.indexOf(term)
    return colors.value[index] ?? '#000000'
  }

  function setScheme(name: string) {
    if (colorSchemes[name]) {
      currentSchemeName.value = name
    }
  }

  // === Hover/Click State ===
  const hoveredTerm = ref<string | null>(null)
  const clickedTerm = ref<string | null>(null)
  const activeTerm = computed(() => clickedTerm.value ?? hoveredTerm.value)

  const activeDefinition = computed(() => {
    if (!activeTerm.value || !parsedContent.value) return null
    return parsedContent.value.definitions.get(activeTerm.value) ?? null
  })

  const activeColor = computed(() =>
    activeTerm.value ? getTermColor(activeTerm.value) : null
  )

  function setHover(term: string | null) {
    hoveredTerm.value = term
  }

  function handleTermClick(term: string) {
    if (term === '') {
      clickedTerm.value = null
    } else if (clickedTerm.value === term) {
      clickedTerm.value = null
    } else {
      clickedTerm.value = term
    }
  }

  function clearClick() {
    clickedTerm.value = null
  }

  // === Equation Loading ===
  async function loadEquationsList(): Promise<EquationInfo[]> {
    const result: EquationInfo[] = []

    for (const path in equationFiles) {
      const content = equationFiles[path] as string
      const filename = path.split('/').pop() || ''
      const id = filename.replace('.md', '')
      const parsed = await loadContent(content, true)
      const title = parsed.title || id.charAt(0).toUpperCase() + id.slice(1)

      result.push({ id, title, file: filename, content })
    }

    return result.sort((a, b) => {
      if (a.id === 'new') return -1
      if (b.id === 'new') return 1
      return a.title.localeCompare(b.title)
    })
  }

  function selectEquation(id: string, updateHash = true) {
    currentEquationId.value = id
    if (updateHash) {
      window.location.hash = id
    }
  }

  function getEquationFromHash(defaultId: string): string {
    const hash = window.location.hash.slice(1)
    return hash || defaultId
  }

  // === Initialization ===
  onMounted(async () => {
    equations.value = await loadEquationsList()

    const initialId = getEquationFromHash(currentEquationId.value)
    const equationExists = equations.value.some(eq => eq.id === initialId)
    selectEquation(equationExists ? initialId : (equations.value[0]?.id ?? 'schrodinger'), false)

    window.addEventListener('hashchange', () => {
      const newId = getEquationFromHash(currentEquationId.value)
      if (newId !== currentEquationId.value) {
        selectEquation(newId, false)
      }
    })
  })

  return {
    // Equations
    equations,
    currentEquationId,
    currentEquation,
    selectEquation,

    // Content
    parsedContent,
    editorMarkdown,
    termOrder,

    // Colors
    currentSchemeName,
    currentScheme,
    colors,
    getTermColor,
    setScheme,

    // Hover/Click
    activeTerm,
    activeDefinition,
    activeColor,
    setHover,
    handleTermClick,
    clearClick,
  }
}
