<template>
  <aside class="sidebar">
    <h2>Equations</h2>
    <slot></slot>

    <footer class="sidebar-footer">
      <p>
        Demo by <a href="https://p.migdal.pl" target="_blank" rel="noopener">Piotr Migdał</a>
      </p>
      <p>
        Source: <a href="https://github.com/stared/equations-explained-colorfully" target="_blank" rel="noopener">github.com/stared/equations-explained-colorfully</a>
      </p>
      <p>
        For more on interactive explanations, see:
        <a href="https://p.migdal.pl/blog/2024/05/science-games-explorable-explanations/" target="_blank" rel="noopener">Science, games, and explorable explanations</a>
      </p>
    </footer>
  </aside>
</template>

<style scoped>
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
  border-bottom: none;
  transition: all 0.2s ease;
}

.sidebar-footer a:hover {
  text-decoration: underline;
}

@media (max-width: 768px) {
  .sidebar {
    width: 100%;
    min-width: 100%;
    border-right: none;
    border-bottom: 1px solid var(--border-color);
    height: auto;
    max-height: 200px;
  }
}
</style>
