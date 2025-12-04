<template>
  <div ref="descriptionRef" class="static-description" v-html="description"></div>
</template>

<script setup lang="ts">
import { ref, watch, nextTick, onMounted } from 'vue'
import { applyTermColors, setupTermListeners, getTermElements } from '../../utils/termDom'
import type { ColorScheme } from '../../export'

const props = defineProps<{
  description: string
  termOrder: string[]
  activeTerm: string | null
  getTermColor: (term: string) => string
  colors: ColorScheme
}>()

const emit = defineEmits<{
  hover: [term: string | null]
  click: [term: string]
}>()

const descriptionRef = ref<HTMLElement | null>(null)

function setupDescription() {
  if (!descriptionRef.value) return
  applyTermColors(descriptionRef.value, props.getTermColor)
  setupTermListeners(
    descriptionRef.value,
    (term) => emit('hover', term),
    (term) => emit('click', term)
  )
}

function updateActiveClass() {
  if (!descriptionRef.value) return
  for (const { el, term } of getTermElements(descriptionRef.value)) {
    el.classList.toggle('active', term === props.activeTerm)
  }
}

// Re-setup when description changes
watch(() => props.description, async () => {
  await nextTick()
  setupDescription()
  updateActiveClass()
}, { immediate: true })

// Re-apply colors when color scheme changes
watch(() => props.colors, () => {
  if (descriptionRef.value) applyTermColors(descriptionRef.value, props.getTermColor)
})

// Update active class when activeTerm changes
watch(() => props.activeTerm, updateActiveClass, { immediate: true })

onMounted(setupDescription)
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

@media (max-width: 768px) {
  .static-description {
    padding-top: 0.5rem;
    margin-bottom: 0.5rem;
    font-size: 1rem;
    line-height: 1.5;
  }
}
</style>
