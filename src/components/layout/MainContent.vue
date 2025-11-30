<template>
  <main class="main-content">
    <h1>{{ title || 'Interactive Equations' }}</h1>
    <p class="subtitle">Hover over colored terms to explore their meaning</p>
    <slot></slot>
  </main>
</template>

<script setup lang="ts">
defineProps<{
  title?: string
}>()
</script>

<style scoped>
.main-content {
  flex: 1;
  padding: 3rem 4rem;
  max-width: 100%;
  overflow-y: auto;
  display: flex;
  flex-direction: column;
  align-items: center;
}

h1 {
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

@media (max-width: 768px) {
  .main-content {
    padding: 2rem 1rem;
    overflow: visible;
  }
}
</style>
