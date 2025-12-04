<template>
  <div
    class="hover-explanation"
    :class="{ visible: visible && definition }"
    :style="{ borderColor: color || 'var(--border-color)' }"
    v-html="renderedDefinition"
  ></div>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import katex from 'katex'

const props = defineProps<{
  definition: string | null
  color: string | null
  visible: boolean
}>()

// Render inline LaTeX in definition
function renderLatexInText(text: string): string {
  return text.replace(/\$([^\$]+)\$/g, (_match, latex) => {
    try {
      return katex.renderToString(latex, {
        displayMode: false,
        throwOnError: false,
        strict: false,
        trust: true
      })
    } catch (e) {
      return `$${latex}$`
    }
  })
}

const renderedDefinition = computed(() => {
  if (!props.definition) return ''
  return renderLatexInText(props.definition)
})
</script>

<style scoped>
.hover-explanation {
  min-height: 3rem;
  opacity: 0;
  transition: opacity 0.3s ease;
  font-size: 1.125rem;
  line-height: 1.7;
  color: var(--text-secondary);
  text-align: left;
  font-family: var(--font-math);
  margin: 1rem auto 0 auto;
  border: 1px solid var(--accent-color);
  background-color: #fff;
  padding: 1rem;
  border-radius: 4px;
  width: 100%;
  max-width: 700px;
}

.hover-explanation.visible {
  opacity: 1;
}

@media (max-width: 768px) {
  .hover-explanation {
    font-size: 1rem;
    line-height: 1.5;
    padding: 0.75rem;
    margin-top: 0.5rem;
    min-height: 2rem;
  }
}
</style>
