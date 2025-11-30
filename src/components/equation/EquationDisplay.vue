<template>
  <div id="equation-container" ref="containerRef" @click="handleContainerClick">
    <SelectionOverlay
      :elements="highlightedElements"
      :color="activeColor || '#000'"
      :container-ref="containerRef"
    />
    <div ref="katexRef" class="katex-content"></div>
  </div>
</template>

<script setup lang="ts">
import { ref, watch, nextTick, onMounted } from 'vue'
import katex from 'katex'
import SelectionOverlay from './SelectionOverlay.vue'

const props = defineProps<{
  latex: string
  termOrder: string[]
  activeTerm: string | null
  activeColor: string | null
  getTermColor: (termClass: string) => string
}>()

const emit = defineEmits<{
  hover: [term: string | null]
  click: [term: string]
}>()

const containerRef = ref<HTMLElement | null>(null)
const katexRef = ref<HTMLElement | null>(null)
const highlightedElements = ref<Element[]>([])

function renderKatex() {
  if (!katexRef.value || !props.latex) return

  try {
    katex.render(props.latex, katexRef.value, {
      displayMode: true,
      trust: true,
      strict: false,
      throwOnError: false,
    })

    // Apply pointer-events and colors
    nextTick(() => {
      applyTermStyles()
      setupTermListeners()
    })
  } catch (error) {
    console.error('KaTeX render error:', error)
    if (katexRef.value) {
      katexRef.value.innerHTML = `<span style="color: red;">Error rendering equation: ${error instanceof Error ? error.message : String(error)}</span>`
    }
  }
}

function applyTermStyles() {
  if (!katexRef.value) return

  katexRef.value.querySelectorAll('.katex *').forEach((el) => {
    const classList = el.classList
    const hasTermClass = Array.from(classList).some(c => c.startsWith('term-'))
    const htmlEl = el as HTMLElement

    if (hasTermClass) {
      htmlEl.style.pointerEvents = 'auto'
      htmlEl.style.cursor = 'pointer'

      // Apply color
      const termClass = Array.from(classList).find(c => c.startsWith('term-'))
      if (termClass) {
        const term = termClass.replace('term-', '')
        htmlEl.style.color = props.getTermColor(term)
      }
    } else {
      htmlEl.style.pointerEvents = 'none'
    }
  })
}

function setupTermListeners() {
  if (!katexRef.value) return

  katexRef.value.querySelectorAll('[class*="term-"]').forEach((element) => {
    const termClass = Array.from(element.classList).find(c => c.startsWith('term-'))
    if (!termClass) return

    const term = termClass.replace('term-', '')

    element.addEventListener('mouseenter', () => {
      emit('hover', term)
    })

    element.addEventListener('mouseleave', () => {
      emit('hover', null)
    })

    element.addEventListener('click', (e) => {
      e.stopPropagation()
      emit('click', term)
    })
  })
}

function handleContainerClick() {
  // Clear clicked state when clicking outside terms
  emit('click', '')
}

// Update highlighted elements when activeTerm changes
watch(() => props.activeTerm, (term) => {
  if (!katexRef.value || !term) {
    highlightedElements.value = []
    return
  }
  highlightedElements.value = Array.from(katexRef.value.querySelectorAll(`.term-${term}`))
}, { immediate: true })

// Re-render when latex changes
watch(() => props.latex, () => {
  renderKatex()
}, { immediate: true })

// Re-apply colors when color scheme changes
watch(() => props.termOrder, () => {
  applyTermStyles()
}, { deep: true })

onMounted(() => {
  renderKatex()
})
</script>

<style scoped>
#equation-container {
  padding: 3rem 2rem;
  margin-bottom: 2.5rem;
  display: flex;
  justify-content: center;
  align-items: center;
  position: relative;
  z-index: 10;
  background: var(--bg-primary);
}

#equation-container :deep(.katex) {
  font-size: 2rem;
  line-height: 1.2;
  position: relative;
  z-index: 1;
}

:deep([class*="term-"]) {
  transition: all 0.2s ease;
  border-radius: 4px;
  cursor: pointer;
  position: relative;
}

:deep([class*="term-"] *) {
  pointer-events: none !important;
}
</style>
