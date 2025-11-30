import { ref, computed } from 'vue'
import type { ParsedContent } from '../parser'

export function useHover(
  parsedContent: () => ParsedContent | null,
  getTermColor: (termClass: string) => string
) {
  const hoveredTerm = ref<string | null>(null)
  const clickedTerm = ref<string | null>(null)

  // Active term is clicked if set, otherwise hovered
  const activeTerm = computed(() => clickedTerm.value ?? hoveredTerm.value)

  const activeDefinition = computed(() => {
    if (!activeTerm.value) return null
    const content = parsedContent()
    if (!content) return null
    return content.definitions.get(activeTerm.value) ?? null
  })

  const activeColor = computed(() => {
    if (!activeTerm.value) return null
    return getTermColor(activeTerm.value)
  })

  function setHover(term: string | null) {
    hoveredTerm.value = term
  }

  function toggleClick(term: string) {
    if (clickedTerm.value === term) {
      clickedTerm.value = null
    } else {
      clickedTerm.value = term
    }
  }

  function clearClick() {
    clickedTerm.value = null
  }

  function clearAll() {
    hoveredTerm.value = null
    clickedTerm.value = null
  }

  return {
    hoveredTerm,
    clickedTerm,
    activeTerm,
    activeDefinition,
    activeColor,
    setHover,
    toggleClick,
    clearClick,
    clearAll,
  }
}
