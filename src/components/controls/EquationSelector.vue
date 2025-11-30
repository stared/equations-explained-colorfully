<template>
  <nav class="equation-selector">
    <button
      v-for="equation in equations"
      :key="equation.id"
      :class="{
        active: equation.id === currentId,
        'new-equation': equation.id === 'new'
      }"
      @click="$emit('select', equation.id)"
    >
      {{ equation.title }}
    </button>
  </nav>
</template>

<script setup lang="ts">
import type { EquationInfo } from '../../composables/useEquations'

defineProps<{
  equations: EquationInfo[]
  currentId: string
}>()

defineEmits<{
  select: [id: string]
}>()
</script>

<style scoped>
.equation-selector {
  display: flex;
  flex-direction: column;
  gap: 0.25rem;
}

.equation-selector button {
  font-family: var(--font-ui);
  padding: 0.625rem 0.75rem;
  border: none;
  background: transparent;
  color: var(--text-secondary);
  font-size: 0.9375rem;
  cursor: pointer;
  text-align: left;
  border-radius: 0.375rem;
  transition: all 0.2s ease;
  font-weight: 500;
}

.equation-selector button:hover {
  background-color: rgba(0, 0, 0, 0.03);
  color: var(--text-primary);
}

.equation-selector button.active {
  background-color: #fff;
  color: var(--accent-color);
  box-shadow: 0 1px 2px rgba(0, 0, 0, 0.05);
  font-weight: 600;
}

.equation-selector button.new-equation {
  margin-bottom: 0.5rem;
  border: 1px dashed var(--border-color);
  color: var(--text-secondary);
}

.equation-selector button.new-equation:hover {
  border-color: var(--accent-color);
  color: var(--accent-color);
  background-color: var(--accent-light);
}

.equation-selector button.new-equation.active {
  border-style: solid;
  border-color: transparent;
}
</style>
