<template>
  <div id="app">
    <!-- Mobile Header -->
    <header class="mobile-header">
      <button class="mobile-menu-btn" @click="mobileMenuOpen = !mobileMenuOpen">
        <span class="icon">☰</span> Equations
      </button>
      <button
        class="mobile-menu-btn"
        @click="mobileEditorOpen = !mobileEditorOpen"
      >
        <span class="icon">✎</span> Code
      </button>
    </header>

    <!-- Left Sidebar -->
    <aside class="sidebar" :class="{ 'mobile-open': mobileMenuOpen }">
      <div class="mobile-close-header">
        <h2>Equations</h2>
        <button class="close-btn" @click="mobileMenuOpen = false">✕</button>
      </div>
      <EquationSelector
        @change="
          markdown = $event;
          mobileMenuOpen = false;
        "
      />
      <footer class="sidebar-footer">
        <p>
          Demo by
          <a href="https://p.migdal.pl" target="_blank" rel="noopener"
            >Piotr Migdał</a
          >
        </p>
        <p>
          Source:
          <a
            href="https://github.com/stared/equations-explained-colorfully"
            target="_blank"
            rel="noopener"
            >github.com/stared/equations-explained-colorfully</a
          >
        </p>
        <p>
          For more:
          <a
            href="https://p.migdal.pl/blog/2024/05/science-games-explorable-explanations/"
            target="_blank"
            rel="noopener"
            >Science, games, and explorable explanations</a
          >
        </p>
      </footer>
    </aside>

    <!-- Main Content -->
    <main class="main-content">
      <ColorSchemeSwitcher @change="colorScheme = $event" />
      <CentralPanel
        v-if="parsedContent"
        :content="parsedContent"
        :colors="colorScheme"
      />
    </main>

    <!-- Editor Sidebar -->
    <aside
      class="editor-sidebar"
      :class="{ collapsed: editorCollapsed, 'mobile-open': mobileEditorOpen }"
    >
      <div class="mobile-close-header">
        <span class="edit-label">EDITOR</span>
        <button class="close-btn" @click="mobileEditorOpen = false">✕</button>
      </div>
      <div class="editor-toolbar">
        <button
          class="toolbar-btn toggle-btn desktop-only"
          title="Show/hide editor"
          @click="editorCollapsed = !editorCollapsed"
        >
          <span class="icon">{{ editorCollapsed ? "◀" : "▶" }}</span>
          <template v-if="editorCollapsed">
            <span class="edit-label">EDIT</span>
            <span class="edit-label">CODE</span>
          </template>
        </button>
        <template v-if="!editorCollapsed">
          <ExportControls
            :parsed-content="parsedContent"
            :colors="colorScheme"
          />
          <a
            href="https://github.com/stared/equations-explained-colorfully/blob/main/README.md#content-format"
            class="toolbar-link"
            target="_blank"
            rel="noopener"
            >Syntax help</a
          >
          <a
            href="https://github.com/stared/equations-explained-colorfully/blob/main/CONTRIBUTE.md"
            class="toolbar-link"
            target="_blank"
            rel="noopener"
            >Contribute</a
          >
        </template>
      </div>
      <div class="editor-container">
        <MarkdownEditor v-model="markdown" :colors="colorScheme" />
      </div>
    </aside>
  </div>
</template>

<script setup lang="ts">
import { ref, computed } from "vue";
import type { ColorScheme } from "./export";
import { defaultScheme } from "./utils/colorSchemes";
import { parseContent } from "./utils/parser";

// Components
import CentralPanel from "./components/CentralPanel.vue";
import EquationSelector from "./components/controls/EquationSelector.vue";
import ColorSchemeSwitcher from "./components/controls/ColorSchemeSwitcher.vue";
import ExportControls from "./components/controls/ExportControls.vue";
import MarkdownEditor from "./components/MarkdownEditor.vue";

// Core state
const markdown = ref("");
const colorScheme = ref<ColorScheme>(defaultScheme);
const editorCollapsed = ref(false);
const mobileMenuOpen = ref(false);
const mobileEditorOpen = ref(false);

// Parsed content derived from markdown
const parsedContent = computed(() => {
  if (!markdown.value.trim()) return null;
  try {
    return parseContent(markdown.value);
  } catch {
    return null;
  }
});

// Test helpers for Playwright
if (typeof window !== "undefined") {
  (window as any).__testHelpers = {
    parsedContent: () => parsedContent.value,
    generateExport: async (format: any) => {
      const { exportContent } = await import("./export");
      if (!parsedContent.value) return "";
      return exportContent(format, parsedContent.value, colorScheme.value);
    },
  };
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
    Helvetica, Arial, sans-serif;
  --font-math: "Crimson Pro", "ETBembo", "Palatino Linotype", "Book Antiqua",
    Palatino, Georgia, serif;
  --font-mono: "Menlo", "Monaco", "Consolas", "Liberation Mono", "Courier New",
    monospace;
  --sidebar-width: 280px;
  --editor-width: 500px;
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

.sidebar-footer p {
  margin: 0.5rem 0;
  line-height: 1.5;
}
.sidebar-footer a {
  color: var(--accent-color);
  text-decoration: none;
}
.sidebar-footer a:hover {
  text-decoration: underline;
}

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

.toolbar-btn .icon {
  font-size: 0.75rem;
}

.toggle-btn {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 0;
}

.edit-label {
  font-size: 0.6875rem;
  line-height: 1.2;
  text-transform: uppercase;
  letter-spacing: 0.05em;
}

.toolbar-link {
  font-family: var(--font-ui);
  font-size: 0.8125rem;
  color: var(--text-secondary);
  text-decoration: none;
  padding: 0.25rem 0.5rem;
}

.editor-sidebar.collapsed .editor-container {
  display: none;
}

.editor-container {
  flex: 1;
  overflow: auto;
  padding: 1.5rem;
  font-family: var(--font-mono);
  font-size: 0.875rem;
  line-height: 1.6;
  background-color: var(--bg-primary);
}

/* Mobile Header */
.mobile-header {
  display: none;
  height: 50px;
  background-color: var(--bg-secondary);
  border-bottom: 1px solid var(--border-color);
  padding: 0 1rem;
  align-items: center;
  justify-content: space-between;
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  z-index: 40;
}

.mobile-menu-btn {
  background: transparent;
  border: 1px solid var(--border-color);
  padding: 0.5rem 1rem;
  border-radius: 4px;
  color: var(--text-primary);
  font-family: var(--font-ui);
  font-size: 0.875rem;
  cursor: pointer;
  display: flex;
  align-items: center;
  gap: 0.5rem;
}

.mobile-close-header {
  display: none;
  padding: 1rem;
  border-bottom: 1px solid var(--border-color);
  align-items: center;
  justify-content: space-between;
  margin-bottom: 1rem;
}

.close-btn {
  background: transparent;
  border: none;
  font-size: 1.25rem;
  color: var(--text-secondary);
  cursor: pointer;
  padding: 0.25rem;
}

/* Responsive */
@media (max-width: 768px) {
  #app {
    flex-direction: column;
    height: auto;
    overflow-y: auto;
    padding-top: 50px; /* Space for mobile header */
  }

  .mobile-header {
    display: flex;
  }

  .mobile-close-header {
    display: flex;
  }

  .desktop-only {
    display: none;
  }

  .sidebar {
    position: fixed;
    inset: 0;
    z-index: 100;
    width: 100%;
    max-width: 100%;
    height: 100%;
    max-height: 100vh;
    transform: translateX(-100%);
    transition: transform 0.3s ease;
    border-right: none;
  }

  .sidebar.mobile-open {
    transform: translateX(0);
  }

  .sidebar h2 {
    display: none; /* Hidden in favor of mobile-close-header */
  }

  .sidebar .mobile-close-header h2 {
    display: block;
    margin: 0;
    padding: 0;
  }

  .main-content {
    padding: 2rem 1rem;
    overflow: visible;
  }

  .editor-sidebar {
    position: fixed;
    inset: 0;
    z-index: 100;
    width: 100%;
    max-width: 100%;
    height: 100%;
    transform: translateY(100%);
    transition: transform 0.3s ease;
    border-left: none;
  }

  .editor-sidebar.mobile-open {
    transform: translateY(0);
  }

  .editor-sidebar.collapsed {
    height: 100%;
    width: 100%;
    min-width: 100%;
  }

  .editor-sidebar .editor-toolbar {
    padding: 0 1rem; /* Adjust padding for mobile */
  }
}
</style>
