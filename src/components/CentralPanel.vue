<template>
  <div class="central-panel">
    <h1>{{ content.title }}</h1>
    <p class="subtitle">Hover over colored terms to explore their meaning</p>

    <EquationDisplay
      :latex="content.latex"
      :term-order="termOrder"
      :active-term="activeTerm"
      :get-term-color="getTermColor"
      @hover="setHover"
      @click="handleTermClick"
    />

    <DescriptionPanel
      :description="content.description"
      :term-order="termOrder"
      :active-term="activeTerm"
      :get-term-color="getTermColor"
      @hover="setHover"
      @click="handleTermClick"
    />

    <DefinitionPopup
      :definition="activeDefinition"
      :color="activeColor"
      :visible="!!activeTerm"
    />
  </div>
</template>

<script setup lang="ts">
import { ref, computed, watch } from 'vue'
import type { ParsedContent } from '../parser'
import type { ColorScheme } from '../export'
import { getTermColor as getColor } from '../utils/colorSchemes'

import EquationDisplay from './equation/EquationDisplay.vue'
import DescriptionPanel from './equation/DescriptionPanel.vue'
import DefinitionPopup from './equation/DefinitionPopup.vue'

const props = defineProps<{
  content: ParsedContent
  colors: ColorScheme
}>()

const termOrder = computed(() => props.content.termOrder)

// Color helper
function getTermColor(term: string): string {
  return getColor(term, termOrder.value, props.colors)
}

// Hover/click state (owned internally)
const hoveredTerm = ref<string | null>(null)
const clickedTerm = ref<string | null>(null)
const activeTerm = computed(() => clickedTerm.value ?? hoveredTerm.value)

const activeDefinition = computed(() => {
  if (!activeTerm.value) return null
  return props.content.definitions.get(activeTerm.value) ?? null
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

// Clear click when content changes
watch(() => props.content, () => {
  clickedTerm.value = null
})
</script>

<style scoped>
.central-panel {
  display: flex;
  flex-direction: column;
  align-items: center;
  width: 100%;
}

h1 {
  font-family: var(--font-math);
  font-size: 2.5rem;
  font-weight: 400;
  color: var(--text-primary);
  margin-bottom: 0.5rem;
  text-align: center;
  letter-spacing: -0.02em;
}

.subtitle {
  font-family: var(--font-ui);
  font-size: 1rem;
  color: var(--text-secondary);
  margin-bottom: 2.5rem;
  text-align: center;
  opacity: 0.8;
}
</style>
