import { ref, computed, onMounted } from 'vue'
import { loadContent } from '../parser'

// Use Vite's glob import to load all markdown files
const equationFiles = import.meta.glob('../examples/*.md', { query: '?raw', import: 'default', eager: true })

export interface EquationInfo {
  id: string
  title: string
  file: string
  content: string
}

export function useEquations() {
  const equations = ref<EquationInfo[]>([])
  const currentEquationId = ref('schrodinger')
  const isLoading = ref(false)

  const currentEquation = computed(() =>
    equations.value.find(eq => eq.id === currentEquationId.value)
  )

  async function loadEquationsList(): Promise<EquationInfo[]> {
    const result: EquationInfo[] = []

    for (const path in equationFiles) {
      const content = equationFiles[path] as string
      const filename = path.split('/').pop() || ''
      const id = filename.replace('.md', '')

      const parsed = await loadContent(content, true)
      const title = parsed.title || id.charAt(0).toUpperCase() + id.slice(1)

      result.push({
        id,
        title,
        file: filename,
        content
      })
    }

    // Sort alphabetically, but put "new" first
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

  onMounted(async () => {
    isLoading.value = true
    equations.value = await loadEquationsList()

    // Load initial equation from hash
    const initialId = getEquationFromHash(currentEquationId.value)
    const equationExists = equations.value.some(eq => eq.id === initialId)
    const equationToLoad = equationExists ? initialId : (equations.value.length > 0 ? equations.value[0].id : currentEquationId.value)

    selectEquation(equationToLoad, false)
    isLoading.value = false

    // Listen for hash changes
    window.addEventListener('hashchange', () => {
      const newId = getEquationFromHash(currentEquationId.value)
      if (newId !== currentEquationId.value) {
        selectEquation(newId, false)
      }
    })
  })

  return {
    equations,
    currentEquationId,
    currentEquation,
    isLoading,
    selectEquation,
  }
}
