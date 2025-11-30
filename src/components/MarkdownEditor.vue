<template>
  <code ref="codeRef" class="language-eqmd"></code>
</template>

<script setup lang="ts">
import { ref, computed, watch, onMounted, onUnmounted } from 'vue'
import { CodeJar } from 'codejar'
import Prism from 'prismjs'
import '../prismCustom'
import { applyTermColors, markErrors } from '../prismCustom'
import { parseContent } from '../parser'
import type { ColorScheme } from '../export'

const props = defineProps<{
  modelValue: string
  colors: ColorScheme
}>()

const emit = defineEmits<{
  'update:modelValue': [value: string]
}>()

const codeRef = ref<HTMLElement | null>(null)
let jar: CodeJar | null = null
let isInternalUpdate = false
let debounceTimeout: number | null = null

// Parse markdown internally for error detection
const parsedContent = computed(() => {
  if (!props.modelValue.trim()) return null
  try {
    return parseContent(props.modelValue)
  } catch {
    return null
  }
})

const colorArray = computed(() => props.colors.colors)

function highlight(el: HTMLElement) {
  const code = el.textContent || ''
  el.innerHTML = Prism.highlight(code, Prism.languages.eqmd, 'eqmd')

  // Apply term colors
  applyTermColors(el, code, colorArray.value)

  // Re-apply after a short delay for browser DOM normalization
  setTimeout(() => {
    applyTermColors(el, code, colorArray.value)
  }, 50)

  // Mark errors if any
  if (parsedContent.value && parsedContent.value.errors.length > 0) {
    markErrors(el, code, parsedContent.value.errors)
  }
}

onMounted(() => {
  if (!codeRef.value) return

  jar = CodeJar(codeRef.value, highlight, {
    tab: '  ',
    indentOn: /[({[]$/,
  })

  jar.updateCode(props.modelValue)

  jar.onUpdate((code: string) => {
    if (isInternalUpdate) return

    // Debounce updates
    if (debounceTimeout !== null) {
      clearTimeout(debounceTimeout)
    }

    debounceTimeout = window.setTimeout(() => {
      emit('update:modelValue', code)
    }, 500)
  })
})

// Sync external changes to editor
watch(() => props.modelValue, (newVal) => {
  if (jar && codeRef.value) {
    const currentCode = codeRef.value.textContent || ''
    if (currentCode !== newVal) {
      isInternalUpdate = true
      jar.updateCode(newVal)
      isInternalUpdate = false
    }
  }
})

// Re-highlight when colors change
watch(colorArray, () => {
  if (codeRef.value) {
    highlight(codeRef.value)
  }
}, { deep: true })

// Re-highlight when parsed content changes (for error marking)
watch(parsedContent, () => {
  if (codeRef.value) {
    highlight(codeRef.value)
  }
})

onUnmounted(() => {
  if (debounceTimeout !== null) {
    clearTimeout(debounceTimeout)
  }
  jar = null
})
</script>

<style scoped>
code {
  display: block;
  white-space: pre-wrap;
  word-wrap: break-word;
  color: var(--text-primary);
  outline: none;
}

:deep(.token.heading) {
  font-weight: 600;
  color: var(--accent-color);
}

:deep(.token.bold) {
  font-weight: 600;
}

:deep(.token.italic) {
  font-style: italic;
}

:deep(.token.punctuation) {
  color: var(--text-tertiary);
}

:deep(.token.latex-mark) {
  color: inherit;
}

:deep(.token.keyword) {
  color: var(--text-secondary);
  font-weight: 500;
}

:deep(.token.md-ref) {
  color: inherit;
}

:deep(.token.latex-mark .token.keyword),
:deep(.token.latex-mark .token.punctuation),
:deep(.token.latex-mark .token.mark-class),
:deep(.token.latex-mark .token.mark-content),
:deep(.token.md-ref .token.ref-text),
:deep(.token.md-ref .token.ref-class),
:deep(.token.md-ref .token.punctuation),
:deep(.token.heading-class .token.punctuation),
:deep(.token.heading-class .token.class-name) {
  color: inherit;
}

:deep(.token.has-error) {
  text-decoration: underline dotted var(--danger);
  text-decoration-thickness: 1px;
  text-underline-offset: 3px;
}
</style>
