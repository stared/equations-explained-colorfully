<template>
  <div id="app">
    <AppSidebar>
      <EquationSelector
        :equations="equations"
        :current-id="currentEquationId"
        @select="handleEquationSelect"
      />
    </AppSidebar>

    <MainContent :title="parsedContent?.title">
      <ColorSchemeSwitcher
        :current-scheme="currentSchemeName"
        :schemes="colorSchemes"
        @change="setScheme"
      />

      <EquationDisplay
        :latex="parsedContent?.latex || ''"
        :term-order="termOrder"
        :active-term="activeTerm"
        :active-color="activeColor"
        :get-term-color="getTermColor"
        @hover="setHover"
        @click="handleTermClick"
      />

      <DescriptionPanel
        :description="parsedContent?.description || ''"
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
    </MainContent>

    <EditorSidebar :collapsed="editorCollapsed" @toggle="editorCollapsed = !editorCollapsed">
      <template #controls>
        <ExportControls
          :parsed-content="parsedContent"
          :color-scheme="currentScheme"
        />
      </template>

      <MarkdownEditor
        v-model="editorMarkdown"
        :colors="colors"
        :parsed-content="parsedContent"
      />
    </EditorSidebar>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, watch } from 'vue'
import { loadContent, type ParsedContent } from './parser'
import { useEquations } from './composables/useEquations'
import { useColorScheme, colorSchemes } from './composables/useColorScheme'
import { useHover } from './composables/useHover'

// Layout components
import AppSidebar from './components/layout/AppSidebar.vue'
import MainContent from './components/layout/MainContent.vue'
import EditorSidebar from './components/layout/EditorSidebar.vue'

// Equation components
import EquationDisplay from './components/equation/EquationDisplay.vue'
import DescriptionPanel from './components/equation/DescriptionPanel.vue'
import DefinitionPopup from './components/equation/DefinitionPopup.vue'

// Control components
import EquationSelector from './components/controls/EquationSelector.vue'
import ColorSchemeSwitcher from './components/controls/ColorSchemeSwitcher.vue'
import ExportControls from './components/controls/ExportControls.vue'

// Editor components
import MarkdownEditor from './components/editor/MarkdownEditor.vue'

// State
const parsedContent = ref<ParsedContent | null>(null)
const editorMarkdown = ref('')
const editorCollapsed = ref(false)

// Composables
const { equations, currentEquationId, currentEquation, selectEquation } = useEquations()

const termOrder = computed(() => parsedContent.value?.termOrder ?? [])

const {
  currentSchemeName,
  currentScheme,
  colors,
  getTermColor,
  setScheme,
} = useColorScheme(() => termOrder.value)

const {
  activeTerm,
  activeDefinition,
  activeColor,
  setHover,
  toggleClick,
  clearClick,
} = useHover(
  () => parsedContent.value,
  getTermColor
)

// Handle equation selection
async function handleEquationSelect(id: string) {
  selectEquation(id)
}

// Handle term click
function handleTermClick(term: string) {
  if (term === '') {
    clearClick()
  } else {
    toggleClick(term)
  }
}

// Parse content when equation changes
watch(currentEquation, async (equation) => {
  if (!equation) return

  try {
    const content = await loadContent(equation.content, true)
    parsedContent.value = content
    editorMarkdown.value = equation.content

    // Clear hover state on equation change
    clearClick()
  } catch (error) {
    console.error('Failed to parse equation:', error)
  }
}, { immediate: true })

// Parse content when editor changes
watch(editorMarkdown, async (markdown) => {
  if (!markdown.trim()) return

  try {
    const content = await loadContent(markdown, true)
    parsedContent.value = content
  } catch (error) {
    console.error('Failed to parse markdown:', error)
  }
})

// Expose test helpers for automated testing
if (typeof window !== 'undefined') {
  (window as any).__testHelpers = {
    parsedContent: () => parsedContent.value,
    generateExport: async (format: any) => {
      const { exportContent } = await import('./export')
      if (!parsedContent.value) {
        throw new Error('No content loaded')
      }
      return exportContent(format, parsedContent.value, currentScheme.value)
    },
  }
}
</script>

<style>
/* CSS Variables */
:root {
  --bg-primary: #ffffff;
  --bg-secondary: #f3f4f6;
  --bg-tertiary: #e5e7eb;

  --text-primary: #111827;
  --text-secondary: #4b5563;
  --text-tertiary: #9ca3af;

  --accent-color: #2563eb;
  --accent-hover: #1d4ed8;
  --accent-light: #eff6ff;

  --border-color: #e5e7eb;
  --border-hover: #d1d5db;

  --success: #10b981;
  --danger: #ef4444;

  --font-ui: "Inter", -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto,
    Helvetica, Arial, sans-serif, "Apple Color Emoji", "Segoe UI Emoji",
    "Segoe UI Symbol";
  --font-math: "Crimson Pro", "ETBembo", "Palatino Linotype", "Book Antiqua",
    Palatino, Georgia, serif;
  --font-mono: "Menlo", "Monaco", "Consolas", "Liberation Mono", "Courier New",
    monospace;

  --sidebar-width: 280px;
  --editor-width: 500px;
  --header-height: 60px;
}

* {
  margin: 0;
  padding: 0;
  box-sizing: border-box;
}

body {
  font-family: var(--font-math);
  background-color: var(--bg-primary);
  color: var(--text-primary);
  line-height: 1.6;
  -webkit-font-smoothing: antialiased;
  height: 100vh;
  overflow: hidden;
}

#app {
  display: flex;
  height: 100vh;
  width: 100vw;
  overflow: hidden;
}

@media (max-width: 768px) {
  #app {
    flex-direction: column;
    height: auto;
    overflow-y: auto;
  }
}
</style>
