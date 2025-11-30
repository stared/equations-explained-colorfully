<template>
  <aside class="editor-sidebar" :class="{ collapsed }">
    <div class="editor-toolbar">
      <button class="toolbar-btn" title="Show/hide editor" @click="$emit('toggle')">
        <span class="icon">{{ collapsed ? '▶' : '◀' }}</span>
      </button>
      <slot name="controls"></slot>
      <a
        href="https://github.com/stared/equations-explained-colorfully"
        class="toolbar-link"
        target="_blank"
        rel="noopener"
      >
        Contribute
      </a>
    </div>
    <div class="editor-container">
      <slot></slot>
    </div>
  </aside>
</template>

<script setup lang="ts">
defineProps<{
  collapsed: boolean
}>()

defineEmits<{
  toggle: []
}>()
</script>

<style scoped>
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

.toolbar-link {
  font-family: var(--font-ui);
  font-size: 0.8125rem;
  color: var(--text-secondary);
  text-decoration: none;
  padding: 0.25rem 0.5rem;
}

.editor-sidebar.collapsed .toolbar-btn span:not(.icon),
.editor-sidebar.collapsed .toolbar-link {
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

@media (max-width: 1024px) {
  .editor-sidebar {
    position: absolute;
    right: 0;
    top: 0;
    bottom: 0;
    width: 100%;
    max-width: 500px;
    transform: translateX(100%);
  }

  .editor-sidebar:not(.collapsed) {
    transform: translateX(0);
  }

  .editor-sidebar.collapsed {
    width: 48px;
    min-width: 48px;
    transform: translateX(0);
    background: transparent;
    border: none;
    box-shadow: none;
  }

  .editor-sidebar.collapsed .editor-toolbar {
    background: transparent;
    border: none;
  }
}

@media (max-width: 768px) {
  .editor-sidebar {
    position: relative;
    width: 100%;
    max-width: 100%;
    height: 500px;
    transform: none;
  }

  .editor-sidebar.collapsed {
    height: 50px;
    width: 100%;
    min-width: 100%;
  }
}
</style>
