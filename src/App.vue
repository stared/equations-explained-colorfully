<template>
  <div id="app">
    <!-- Left Sidebar -->
    <aside class="sidebar">
      <h2>Equations</h2>
      <EquationSelector
        :equations="equations"
        :current-id="currentEquationId"
        @select="selectEquation"
      />
      <footer class="sidebar-footer">
        <p>Demo by <a href="https://p.migdal.pl" target="_blank" rel="noopener">Piotr Migdał</a></p>
        <p>Source: <a href="https://github.com/stared/equations-explained-colorfully" target="_blank" rel="noopener">github.com/stared/equations-explained-colorfully</a></p>
        <p>For more: <a href="https://p.migdal.pl/blog/2024/05/science-games-explorable-explanations/" target="_blank" rel="noopener">Science, games, and explorable explanations</a></p>
      </footer>
    </aside>

    <!-- Main Content -->
    <main class="main-content">
      <h1>{{ parsedContent?.title || 'Interactive Equations' }}</h1>
      <p class="subtitle">Hover over colored terms to explore their meaning</p>

      <ColorSchemeSwitcher
        :current-scheme="currentSchemeName"
        :schemes="colorSchemes"
        @change="setScheme"
      />

      <EquationDisplay
        :latex="parsedContent?.latex || ''"
        :term-order="termOrder"
        :active-term="activeTerm"
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
    </main>

    <!-- Editor Sidebar -->
    <aside class="editor-sidebar" :class="{ collapsed: editorCollapsed }">
      <div class="editor-toolbar">
        <button class="toolbar-btn" title="Show/hide editor" @click="editorCollapsed = !editorCollapsed">
          <span class="icon">{{ editorCollapsed ? '▶' : '◀' }}</span>
        </button>
        <ExportControls
          :parsed-content="parsedContent"
          :color-scheme="currentScheme"
        />
        <a href="https://github.com/stared/equations-explained-colorfully" class="toolbar-link" target="_blank" rel="noopener">Contribute</a>
      </div>
      <div class="editor-container">
        <MarkdownEditor
          v-model="editorMarkdown"
          :colors="colors"
          :parsed-content="parsedContent"
        />
      </div>
    </aside>
  </div>
</template>

<script setup lang="ts">
import { watch } from 'vue'
import { loadContent } from './parser'
import { useEquationApp, colorSchemes } from './composables/useEquationApp'

// Components
import EquationDisplay from './components/equation/EquationDisplay.vue'
import DescriptionPanel from './components/equation/DescriptionPanel.vue'
import DefinitionPopup from './components/equation/DefinitionPopup.vue'
import EquationSelector from './components/controls/EquationSelector.vue'
import ColorSchemeSwitcher from './components/controls/ColorSchemeSwitcher.vue'
import ExportControls from './components/controls/ExportControls.vue'
import MarkdownEditor from './components/editor/MarkdownEditor.vue'
import { ref } from 'vue'

const editorCollapsed = ref(false)

const {
  equations,
  currentEquationId,
  currentEquation,
  selectEquation,
  parsedContent,
  editorMarkdown,
  termOrder,
  currentSchemeName,
  currentScheme,
  colors,
  getTermColor,
  setScheme,
  activeTerm,
  activeDefinition,
  activeColor,
  setHover,
  handleTermClick,
  clearClick,
} = useEquationApp()

// Parse content when equation changes
watch(currentEquation, async (equation) => {
  if (!equation) return
  try {
    const content = await loadContent(equation.content, true)
    parsedContent.value = content
    editorMarkdown.value = equation.content
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

// Test helpers
if (typeof window !== 'undefined') {
  (window as any).__testHelpers = {
    parsedContent: () => parsedContent.value,
    generateExport: async (format: any) => {
      const { exportContent } = await import('./export')
      if (!parsedContent.value) throw new Error('No content loaded')
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
  --font-ui: "Inter", -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Helvetica, Arial, sans-serif;
  --font-math: "Crimson Pro", "ETBembo", "Palatino Linotype", "Book Antiqua", Palatino, Georgia, serif;
  --font-mono: "Menlo", "Monaco", "Consolas", "Liberation Mono", "Courier New", monospace;
  --sidebar-width: 280px;
  --editor-width: 500px;
}

* { margin: 0; padding: 0; box-sizing: border-box; }

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

/* Sidebar */
.sidebar {
  width: var(--sidebar-width);
  min-width: var(--sidebar-width);
  background-color: var(--bg-secondary);
  border-right: 1px solid var(--border-color);
  padding: 2rem 1rem;
  overflow-y: auto;
  display: flex;
  flex-direction: column;
}

.sidebar h2 {
  font-family: var(--font-ui);
  font-size: 0.75rem;
  text-transform: uppercase;
  letter-spacing: 0.05em;
  font-weight: 600;
  color: var(--text-tertiary);
  margin-bottom: 1rem;
  padding-left: 0.75rem;
}

.sidebar-footer {
  margin-top: auto;
  padding-top: 2rem;
  font-family: var(--font-ui);
  font-size: 0.8125rem;
  color: var(--text-secondary);
}

.sidebar-footer p { margin: 0.5rem 0; line-height: 1.5; }
.sidebar-footer a { color: var(--accent-color); text-decoration: none; }
.sidebar-footer a:hover { text-decoration: underline; }

/* Main Content */
.main-content {
  flex: 1;
  padding: 3rem 4rem;
  max-width: 100%;
  overflow-y: auto;
  display: flex;
  flex-direction: column;
  align-items: center;
}

.main-content h1 {
  font-family: var(--font-math);
  font-size: 2.5rem;
  font-weight: 400;
  color: var(--text-primary);
  margin-bottom: 0.5rem;
  text-align: center;
  letter-spacing: -0.02em;
}

.subtitle {
  font-family: var(--font-ui);
  font-size: 1rem;
  color: var(--text-secondary);
  margin-bottom: 2.5rem;
  text-align: center;
  opacity: 0.8;
}

/* Editor Sidebar */
.editor-sidebar {
  width: var(--editor-width);
  min-width: var(--editor-width);
  background-color: var(--bg-primary);
  border-left: 1px solid var(--border-color);
  display: flex;
  flex-direction: column;
  transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
  overflow: hidden;
  box-shadow: -4px 0 15px rgba(0, 0, 0, 0.03);
  z-index: 20;
}

.editor-sidebar.collapsed {
  width: 48px;
  min-width: 48px;
}

.editor-toolbar {
  display: flex;
  gap: 0.75rem;
  padding: 0.75rem;
  border-bottom: 1px solid var(--border-color);
  background-color: var(--bg-secondary);
  align-items: center;
  height: 48px;
}

.editor-sidebar.collapsed .editor-toolbar {
  flex-direction: column;
  padding: 0.75rem 0;
  height: 100%;
  gap: 1rem;
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

.toolbar-btn .icon { font-size: 0.75rem; }

.toolbar-link {
  font-family: var(--font-ui);
  font-size: 0.8125rem;
  color: var(--text-secondary);
  text-decoration: none;
  padding: 0.25rem 0.5rem;
}

.editor-sidebar.collapsed .toolbar-btn span:not(.icon),
.editor-sidebar.collapsed .toolbar-link,
.editor-sidebar.collapsed .export-controls { display: none; }

.editor-container {
  flex: 1;
  overflow: auto;
  padding: 1.5rem;
  font-family: var(--font-mono);
  font-size: 0.875rem;
  line-height: 1.6;
  background-color: var(--bg-primary);
}

/* Responsive */
@media (max-width: 768px) {
  #app { flex-direction: column; height: auto; overflow-y: auto; }
  .sidebar { width: 100%; min-width: 100%; border-right: none; border-bottom: 1px solid var(--border-color); height: auto; max-height: 200px; }
  .main-content { padding: 2rem 1rem; overflow: visible; }
  .editor-sidebar { position: relative; width: 100%; max-width: 100%; height: 500px; transform: none; }
  .editor-sidebar.collapsed { height: 50px; width: 100%; min-width: 100%; }
}
</style>
