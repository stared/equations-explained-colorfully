<template>
  <div class="color-scheme-switcher">
    <button
      v-for="(scheme, key) in schemes"
      :key="key"
      :class="{ active: key === currentScheme }"
      @click="$emit('change', key)"
    >
      {{ scheme.name }}
    </button>
  </div>
</template>

<script setup lang="ts">
import type { ColorScheme } from '../../export'

defineProps<{
  currentScheme: string
  schemes: Record<string, ColorScheme>
}>()

defineEmits<{
  change: [schemeName: string]
}>()
</script>

<style scoped>
.color-scheme-switcher {
  display: flex;
  justify-content: center;
  background-color: var(--bg-secondary);
  padding: 0.25rem;
  border-radius: 0.5rem;
  margin: 0 auto 3rem auto;
  width: fit-content;
}

.color-scheme-switcher button {
  font-family: var(--font-ui);
  padding: 0.375rem 1rem;
  border: none;
  background-color: transparent;
  color: var(--text-secondary);
  font-size: 0.875rem;
  cursor: pointer;
  border-radius: 0.375rem;
  font-weight: 500;
  transition: all 0.2s ease;
}

.color-scheme-switcher button:hover {
  color: var(--text-primary);
}

.color-scheme-switcher button.active {
  background-color: var(--bg-primary);
  color: var(--text-primary);
  box-shadow: 0 1px 2px rgba(0, 0, 0, 0.05);
  font-weight: 600;
}
</style>
