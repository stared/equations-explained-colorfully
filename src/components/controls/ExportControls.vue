<template>
  <div class="export-controls">
    <select
      v-model="selectedFormat"
      class="toolbar-select"
      title="Export as..."
      @change="handleExport"
    >
      <option value="" disabled>Export as...</option>
      <option value="html">HTML</option>
      <option value="latex">LaTeX</option>
      <option value="beamer">Beamer</option>
      <option value="typst">Typst</option>
    </select>
  </div>
  <button class="toolbar-btn" title="Copy to clipboard" @click="handleCopy">
    Copy
  </button>
</template>

<script setup lang="ts">
import { ref, computed } from 'vue'
import { parseContent } from '../../parser'
import type { ColorScheme, ExportFormat } from '../../export'

const props = defineProps<{
  markdown: string
  colors: ColorScheme
}>()

const selectedFormat = ref('')

// Parse markdown internally when needed
const parsedContent = computed(() => {
  if (!props.markdown.trim()) return null
  try {
    return parseContent(props.markdown)
  } catch {
    return null
  }
})

async function handleExport() {
  if (!selectedFormat.value || !parsedContent.value) return

  const { exportContent, getFileExtension } = await import('../../export')
  const format = selectedFormat.value as ExportFormat
  const content = exportContent(format, parsedContent.value, props.colors)
  const extension = getFileExtension(format)

  // Download file
  const blob = new Blob([content], { type: 'text/plain' })
  const url = URL.createObjectURL(blob)
  const a = document.createElement('a')
  a.href = url
  a.download = `equation.${extension}`
  a.click()
  URL.revokeObjectURL(url)

  // Reset select
  selectedFormat.value = ''
}

async function handleCopy() {
  if (!parsedContent.value) return

  const { exportContent } = await import('../../export')
  const content = exportContent('html', parsedContent.value, props.colors)

  try {
    await navigator.clipboard.writeText(content)
  } catch (e) {
    console.error('Failed to copy:', e)
  }
}
</script>

<style scoped>
.export-controls {
  display: flex;
  gap: 0.5rem;
  align-items: center;
}

.toolbar-select {
  font-family: var(--font-ui);
  font-size: 0.8125rem;
  padding: 0.25rem 0.5rem;
  border: 1px solid transparent;
  border-radius: 0.25rem;
  background-color: transparent;
  color: var(--text-secondary);
  cursor: pointer;
  outline: none;
  transition: all 0.2s ease;
}

.toolbar-select:hover {
  background-color: rgba(0, 0, 0, 0.05);
  color: var(--text-primary);
}

.toolbar-select:focus {
  border-color: var(--border-color);
  background-color: #fff;
}

.toolbar-btn {
  font-family: var(--font-ui);
  padding: 0.25rem 0.5rem;
  border: none;
  background: transparent;
  color: var(--text-secondary);
  font-size: 0.8125rem;
  cursor: pointer;
  border-radius: 0.25rem;
  transition: all 0.2s ease;
  display: flex;
  align-items: center;
  justify-content: center;
}

.toolbar-btn:hover {
  background-color: rgba(0, 0, 0, 0.05);
  color: var(--text-primary);
}
</style>
