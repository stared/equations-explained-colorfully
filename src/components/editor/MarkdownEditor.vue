<template>
  <code ref="codeRef" class="language-eqmd"></code>
</template>

<script setup lang="ts">
import { ref, watch, onMounted, onUnmounted } from 'vue'
import { CodeJar } from 'codejar'
import Prism from 'prismjs'
import '../../prismCustom'
import { applyTermColors, markErrors } from '../../prismCustom'
import type { ParsedContent } from '../../parser'

const props = defineProps<{
  modelValue: string
  colors: string[]
  parsedContent: ParsedContent | null
}>()

const emit = defineEmits<{
  'update:modelValue': [value: string]
}>()

const codeRef = ref<HTMLElement | null>(null)
let jar: CodeJar | null = null
let isInternalUpdate = false
let debounceTimeout: number | null = null

function highlight(el: HTMLElement) {
  const code = el.textContent || ''
  el.innerHTML = Prism.highlight(code, Prism.languages.eqmd, 'eqmd')

  // Apply term colors
  applyTermColors(el, code, props.colors)

  // Re-apply after a short delay for browser DOM normalization
  setTimeout(() => {
    applyTermColors(el, code, props.colors)
  }, 50)

  // Mark errors if any
  if (props.parsedContent && props.parsedContent.errors.length > 0) {
    markErrors(el, code, props.parsedContent.errors)
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
watch(() => props.colors, () => {
  if (codeRef.value) {
    highlight(codeRef.value)
  }
}, { deep: true })

// Re-highlight when parsed content changes (for error marking)
watch(() => props.parsedContent, () => {
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
