<template>
  <code ref="codeRef" class="language-eqmd"></code>
</template>

<script setup lang="ts">
import { ref, computed, watch, onMounted, onUnmounted } from 'vue'
import { CodeJar } from 'codejar'
import Prism from 'prismjs'
import { parseContent } from '../utils/parser'
import type { ColorScheme } from '../export'

// ============================================================================
// Custom Prism language definition for interactive equation markdown
// ============================================================================

Prism.languages.eqmd = {
  // LaTeX \mark[classname]{content}
  // Handles nested braces up to 2 levels deep (sufficient for \frac{\partial\psi}{\partial t})
  'latex-mark': {
    pattern: /\\mark\[[^\]]+\]\{(?:[^{}]|\{(?:[^{}]|\{[^}]*\})*\})*\}/g,
    inside: {
      'mark-class': {
        pattern: /\[[^\]]+\]/,
        lookbehind: true,
      },
      'mark-content': {
        pattern: /\{(?:[^{}]|\{(?:[^{}]|\{[^}]*\})*\})*\}/,
        lookbehind: true,
      },
      'keyword': /\\mark/,
    }
  },

  // Markdown [text]{.classname}
  'md-ref': {
    pattern: /\[[^\]]+\]\{\.[^\}]+\}/g,
    inside: {
      'ref-text': {
        pattern: /\[[^\]]+\]/,
        lookbehind: true,
      },
      'ref-class': {
        pattern: /\{\.[^\}]+\}/,
        lookbehind: true,
      }
    }
  },

  // Heading with class: ## .classname
  'heading-class': {
    pattern: /^##\s+\.[a-z][a-z0-9-]*/gm,
    inside: {
      'class-name': /\.[a-z][a-z0-9-]*/,
      'punctuation': /^##/,
    }
  },

  // Regular markdown heading
  'heading': {
    pattern: /^##\s+[^.\n][^\n]*/gm,
    inside: {
      'punctuation': /^##/,
    }
  },

  // LaTeX display math $$...$$
  'latex-display': {
    pattern: /\$\$[\s\S]+?\$\$/g,
    inside: {
      'punctuation': /\$\$/,
    }
  },

  // LaTeX inline math $...$
  'latex-inline': {
    pattern: /\$[^\$\n]+\$/g,
    inside: {
      'punctuation': /\$/,
    }
  },

  // Bold **text**
  'bold': {
    pattern: /\*\*[^*]+\*\*/g,
    inside: {
      'punctuation': /\*\*/,
    }
  },

  // Italic *text*
  'italic': {
    pattern: /\*[^*]+\*/g,
    inside: {
      'punctuation': /\*/,
    }
  },
}

// Extract ONLY terms from equation section ($$...$$)
function extractEquationTerms(markdown: string): string[] {
  const terms: string[] = []
  const seenTerms = new Set<string>()

  // Extract equation block (everything between $$...$$)
  const equationMatch = markdown.match(/\$\$([\s\S]*?)\$\$/)
  if (!equationMatch) return terms

  const equationContent = equationMatch[1]

  // Extract \mark[classname] in order of appearance
  const markPattern = /\\mark\[([^\]]+)\]/g
  let match
  while ((match = markPattern.exec(equationContent)) !== null) {
    const term = match[1]
    if (!seenTerms.has(term)) {
      terms.push(term)
      seenTerms.add(term)
    }
  }

  return terms
}

// Helper to mark tokens with errors based on a condition
function markTokensWithError(
  element: HTMLElement,
  selector: string,
  pattern: RegExp,
  shouldMarkError: (term: string) => boolean
) {
  element.querySelectorAll(selector).forEach(el => {
    const text = el.textContent || ''
    const match = text.match(pattern)
    if (match && shouldMarkError(match[1])) {
      el.classList.add('has-error')
    }
  })
}

// Mark errors in editor with subtle underlines
function markErrors(
  element: HTMLElement,
  markdown: string,
  errors: string[]
) {
  // Remove any existing error markings
  element.querySelectorAll('.has-error').forEach(el => {
    el.classList.remove('has-error')
  })

  // Get equation terms (source of truth)
  const equationTerms = new Set(extractEquationTerms(markdown))

  // Track terms with errors
  const termsWithoutDefinitions = new Set<string>()

  errors.forEach(error => {
    const termMatch = error.match(/Term "([^"]+)"/)
    if (!termMatch) return
    const term = termMatch[1]

    if (error.includes('has no definition')) {
      termsWithoutDefinitions.add(term)
    }
  })

  // Mark each token type with appropriate error condition
  markTokensWithError(element, '.token.latex-mark', /\\mark\[([^\]]+)\]/, term => termsWithoutDefinitions.has(term))
  markTokensWithError(element, '.token.md-ref', /\{\.([^\}]+)\}/, term => !equationTerms.has(term))
  markTokensWithError(element, '.token.heading-class', /##\s+\.([a-z][a-z0-9-]*)/, term => !equationTerms.has(term))
}

// Helper to apply colors to tokens matching a pattern
function applyColorToTokens(
  element: HTMLElement,
  selector: string,
  pattern: RegExp,
  termOrder: string[],
  colors: string[]
) {
  element.querySelectorAll(selector).forEach(el => {
    const text = el.textContent || ''
    const match = text.match(pattern)
    if (match) {
      const className = match[1]
      const colorIndex = termOrder.indexOf(className)
      if (colorIndex >= 0 && colors[colorIndex]) {
        (el as HTMLElement).style.setProperty('color', colors[colorIndex], 'important')
      }
    }
  })
}

// Apply term colors to highlighted code based on dynamic markdown content
function applyTermColors(
  element: HTMLElement,
  markdown: string,
  colors: string[]
) {
  const termOrder = extractEquationTerms(markdown)

  // Reset all colors to default
  element.querySelectorAll('.token.latex-mark, .token.md-ref, .token.heading-class').forEach(el => {
    (el as HTMLElement).style.removeProperty('color')
  })

  // Apply colors to each token type
  applyColorToTokens(element, '.token.latex-mark', /\\mark\[([^\]]+)\]/, termOrder, colors)
  applyColorToTokens(element, '.token.md-ref', /\{\.([^\}]+)\}/, termOrder, colors)
  applyColorToTokens(element, '.token.heading-class', /##\s+\.([a-z][a-z0-9-]*)/, termOrder, colors)
}

// ============================================================================
// Component logic
// ============================================================================

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
