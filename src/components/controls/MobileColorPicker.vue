<template>
  <div class="mobile-color-picker" :class="{ open: isOpen }">
    <button class="picker-toggle" @click="isOpen = !isOpen">
      <span class="icon">⊞</span> Colors <span class="toggle-icon">{{ isOpen ? '▲' : '▼' }}</span>
    </button>
    <div class="picker-dropdown" v-show="isOpen">
      <button
        v-for="(scheme, key) in colorSchemes"
        :key="key"
        :class="{ active: key === currentKey }"
        @click="selectScheme(key)"
      >
        {{ scheme.name }}
      </button>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted, onUnmounted } from 'vue'
import { colorSchemes, defaultScheme } from '../../utils/colorSchemes'
import type { ColorScheme } from '../../export'

const emit = defineEmits<{
  change: [scheme: ColorScheme]
}>()

const isOpen = ref(false)
const currentKey = ref('vibrant')

const previewColor = computed(() => {
  const scheme = colorSchemes[currentKey.value]
  return scheme?.colors[0] ?? '#666'
})

function selectScheme(key: string) {
  if (colorSchemes[key]) {
    currentKey.value = key
    emit('change', colorSchemes[key])
    isOpen.value = false
  }
}

// Close on outside click
function handleClickOutside(e: MouseEvent) {
  const target = e.target as HTMLElement
  if (!target.closest('.mobile-color-picker')) {
    isOpen.value = false
  }
}

onMounted(() => {
  document.addEventListener('click', handleClickOutside)
  emit('change', defaultScheme)
})

onUnmounted(() => {
  document.removeEventListener('click', handleClickOutside)
})
</script>

<style scoped>
.mobile-color-picker {
  position: relative;
}

.picker-toggle {
  display: flex;
  align-items: center;
  gap: 0.25rem;
  padding: 0.25rem 0.5rem;
  border: 1px solid var(--border-color);
  border-radius: 3px;
  background: transparent;
  cursor: pointer;
  font-family: var(--font-ui);
  font-size: 0.75rem;
  color: var(--text-primary);
}

.icon {
  font-size: 0.875rem;
}

.toggle-icon {
  font-size: 0.5rem;
  color: var(--text-secondary);
}

.picker-dropdown {
  position: absolute;
  top: 100%;
  left: 50%;
  transform: translateX(-50%);
  margin-top: 0.25rem;
  background: var(--bg-primary);
  border: 1px solid var(--border-color);
  border-radius: 6px;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
  z-index: 200;
  min-width: 120px;
  overflow: hidden;
}

.picker-dropdown button {
  display: block;
  width: 100%;
  padding: 0.5rem 0.75rem;
  border: none;
  background: transparent;
  text-align: left;
  font-family: var(--font-ui);
  font-size: 0.8125rem;
  color: var(--text-secondary);
  cursor: pointer;
}

.picker-dropdown button:hover {
  background: var(--bg-secondary);
  color: var(--text-primary);
}

.picker-dropdown button.active {
  background: var(--accent-light);
  color: var(--accent-color);
  font-weight: 600;
}
</style>
