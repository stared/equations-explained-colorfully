<template>
  <div ref="descriptionRef" class="static-description" v-html="description"></div>
</template>

<script setup lang="ts">
import { ref, watch, nextTick, onMounted } from 'vue'

const props = defineProps<{
  description: string
  termOrder: string[]
  activeTerm: string | null
  getTermColor: (termClass: string) => string
}>()

const emit = defineEmits<{
  hover: [term: string | null]
  click: [term: string]
}>()

const descriptionRef = ref<HTMLElement | null>(null)

function applyTermStyles() {
  if (!descriptionRef.value) return

  descriptionRef.value.querySelectorAll('[class*="term-"]').forEach((el) => {
    const termClass = Array.from(el.classList).find(c => c.startsWith('term-'))
    if (!termClass) return

    const term = termClass.replace('term-', '')
    const htmlEl = el as HTMLElement
    htmlEl.style.color = props.getTermColor(term)
  })
}

function setupTermListeners() {
  if (!descriptionRef.value) return

  descriptionRef.value.querySelectorAll('[class*="term-"]').forEach((element) => {
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

// Update active class when activeTerm changes
watch(() => props.activeTerm, (term) => {
  if (!descriptionRef.value) return

  descriptionRef.value.querySelectorAll('span').forEach((el) => {
    if (term && el.classList.contains(`term-${term}`)) {
      el.classList.add('active')
    } else {
      el.classList.remove('active')
    }
  })
}, { immediate: true })

// Re-setup when description changes
watch(() => props.description, async () => {
  await nextTick()
  applyTermStyles()
  setupTermListeners()
}, { immediate: true })

// Re-apply colors when color scheme changes
watch(() => props.termOrder, () => {
  applyTermStyles()
}, { deep: true })

onMounted(() => {
  applyTermStyles()
  setupTermListeners()
})
</script>

<style scoped>
.static-description {
  border-top: 1px solid var(--border-color);
  padding-top: 2rem;
  margin-bottom: 1.5rem;
  font-size: 1.125rem;
  line-height: 1.7;
  position: relative;
  z-index: 1;
  text-align: left;
  max-width: 700px;
  margin-left: auto;
  margin-right: auto;
}

.static-description :deep(p) {
  margin: 0;
  color: var(--text-primary);
}

.static-description :deep(span) {
  font-weight: 600;
  padding: 0 2px;
  border-radius: 3px;
  transition: background-color 0.2s;
  cursor: pointer;
}

.static-description :deep(span.active) {
  background-color: var(--accent-light);
}
</style>
