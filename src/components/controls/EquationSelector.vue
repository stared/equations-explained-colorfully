<template>
  <nav class="equation-selector">
    <button
      v-for="equation in equations"
      :key="equation.id"
      :class="{
        active: equation.id === currentId,
        'new-equation': equation.id === 'new'
      }"
      @click="selectEquation(equation.id)"
    >
      {{ equation.title }}
    </button>
  </nav>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { parseContent } from '../../utils/parser'

interface EquationInfo {
  id: string
  title: string
  content: string
}

const emit = defineEmits<{
  change: [markdown: string]
}>()

const equations = ref<EquationInfo[]>([])
const currentId = ref('')

// Vite glob import for markdown files
const equationFiles = import.meta.glob('../../examples/*.md', { query: '?raw', import: 'default', eager: true })

async function loadEquations(): Promise<EquationInfo[]> {
  const result: EquationInfo[] = []

  for (const path in equationFiles) {
    const content = equationFiles[path] as string
    const filename = path.split('/').pop() || ''
    const id = filename.replace('.md', '')
    const parsed = parseContent(content)

    result.push({ id, title: parsed.title, content })
  }

  return result.sort((a, b) => {
    if (a.id === 'new') return -1
    if (b.id === 'new') return 1
    return a.title.localeCompare(b.title)
  })
}

function selectEquation(id: string) {
  const equation = equations.value.find(eq => eq.id === id)
  if (!equation) return

  currentId.value = id
  window.location.hash = id
  emit('change', equation.content)
}

function getIdFromHash(): string {
  return window.location.hash.slice(1) || ''
}

onMounted(async () => {
  equations.value = await loadEquations()

  // Get initial equation from URL hash or default
  const hashId = getIdFromHash()
  const exists = equations.value.some(eq => eq.id === hashId)
  const initialId = exists ? hashId : (equations.value[0]?.id ?? '')

  if (initialId) {
    selectEquation(initialId)
  }

  // Listen for hash changes
  window.addEventListener('hashchange', () => {
    const newId = getIdFromHash()
    if (newId && newId !== currentId.value) {
      selectEquation(newId)
    }
  })
})
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
