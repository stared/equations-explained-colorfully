<template>
  <div id="equation-container" ref="containerRef" @click="emit('click', '')">
    <!-- Inline SVG overlay for highlighting -->
    <svg class="selection-overlay">
      <rect
        v-for="(rect, index) in highlightRects"
        :key="index"
        :x="rect.x"
        :y="rect.y"
        :width="rect.width"
        :height="rect.height"
        rx="4"
        ry="4"
        :style="{ fill: `color-mix(in srgb, ${activeColor} 10%, transparent)` }"
      />
    </svg>
    <div ref="katexRef" class="katex-content"></div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, watch, nextTick, onMounted, onUnmounted } from "vue";
import katex from "katex";
import {
  applyTermColors,
  setupTermListeners,
  enableTermPointerEvents,
} from "../../utils/termDom";

import type { ColorScheme } from "../../export";

const props = defineProps<{
  latex: string;
  termOrder: string[];
  activeTerm: string | null;
  getTermColor: (term: string) => string;
  colors: ColorScheme;
}>();

const emit = defineEmits<{
  hover: [term: string | null];
  click: [term: string];
}>();

const containerRef = ref<HTMLElement | null>(null);
const katexRef = ref<HTMLElement | null>(null);

// Compute active color from active term
const activeColor = computed(() =>
  props.activeTerm ? props.getTermColor(props.activeTerm) : "#000"
);

// --- Highlight overlay logic (inlined from SelectionOverlay) ---
interface HighlightRect {
  x: number;
  y: number;
  width: number;
  height: number;
}
const highlightRects = ref<HighlightRect[]>([]);

function getVisualBoundingRect(element: Element): DOMRect {
  let minX = Infinity,
    minY = Infinity,
    maxX = -Infinity,
    maxY = -Infinity;
  let found = false;

  const processRect = (r: DOMRect) => {
    if (r.width > 0.1 && r.height > 0.1) {
      minX = Math.min(minX, r.left);
      minY = Math.min(minY, r.top);
      maxX = Math.max(maxX, r.right);
      maxY = Math.max(maxY, r.bottom);
      found = true;
    }
  };

  const selfRects = element.getClientRects();
  for (let i = 0; i < selfRects.length; i++) processRect(selfRects[i]);

  element.querySelectorAll("*").forEach((child) => {
    const rects = child.getClientRects();
    for (let i = 0; i < rects.length; i++) processRect(rects[i]);
  });

  return found
    ? new DOMRect(minX, minY, maxX - minX, maxY - minY)
    : element.getBoundingClientRect();
}

function calculateHighlightRects() {
  if (!containerRef.value || !katexRef.value || !props.activeTerm) {
    highlightRects.value = [];
    return;
  }

  const elements = katexRef.value.querySelectorAll(`.term-${props.activeTerm}`);
  if (elements.length === 0) {
    highlightRects.value = [];
    return;
  }

  const containerRect = containerRef.value.getBoundingClientRect();
  const style = window.getComputedStyle(containerRef.value);
  const borderLeft = parseFloat(style.borderLeftWidth) || 0;
  const borderTop = parseFloat(style.borderTopWidth) || 0;
  const padding = 2;

  highlightRects.value = Array.from(elements).map((el) => {
    const rect = getVisualBoundingRect(el);
    return {
      x: rect.left - containerRect.left - borderLeft - padding,
      y: rect.top - containerRect.top - borderTop - padding,
      width: rect.width + padding * 2,
      height: rect.height + padding * 2,
    };
  });
}

// --- KaTeX rendering ---
function renderKatex() {
  if (!katexRef.value || !props.latex) return;

  try {
    katex.render(props.latex, katexRef.value, {
      displayMode: true,
      trust: true,
      strict: false,
      throwOnError: false,
    });

    nextTick(() => {
      if (!katexRef.value) return;
      enableTermPointerEvents(katexRef.value);
      applyTermColors(katexRef.value, props.getTermColor);
      setupTermListeners(
        katexRef.value,
        (term) => emit("hover", term),
        (term) => emit("click", term)
      );
    });
  } catch (error) {
    console.error("KaTeX render error:", error);
    if (katexRef.value) {
      katexRef.value.innerHTML = `<span style="color: red;">Error: ${
        error instanceof Error ? error.message : String(error)
      }</span>`;
    }
  }
}

// Watches
watch(() => props.latex, renderKatex, { immediate: true });
watch(
  () => props.colors,
  () => {
    if (katexRef.value) applyTermColors(katexRef.value, props.getTermColor);
  }
);
watch(() => props.activeTerm, calculateHighlightRects, { immediate: true });

// Resize observer for highlight recalculation
let resizeObserver: ResizeObserver | null = null;
onMounted(() => {
  renderKatex();
  if (containerRef.value) {
    resizeObserver = new ResizeObserver(calculateHighlightRects);
    resizeObserver.observe(containerRef.value);
  }
});
onUnmounted(() => resizeObserver?.disconnect());
</script>

<style scoped>
#equation-container {
  padding: 0.25rem 1rem;
  min-height: 150px; /* Ensure smaller formulas have some breathing room */
  margin-bottom: 1.5rem;
  display: flex;
  justify-content: center;
  align-items: center;
  position: relative;
  z-index: 10;
  background: var(--bg-primary);
}

#equation-container :deep(.katex-display) {
  margin: 0;
}

.selection-overlay {
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  pointer-events: none;
  z-index: 0;
}

.selection-overlay rect {
  opacity: 1;
  transition: opacity 0.15s ease-out;
}

#equation-container :deep(.katex) {
  font-size: 2rem;
  line-height: 1.2;
  position: relative;
  z-index: 1;
}

:deep([class*="term-"]) {
  transition: opacity 0.2s ease;
  border-radius: 4px;
  cursor: pointer;
  position: relative;
}

:deep([class*="term-"] *) {
  pointer-events: none !important;
}

@media (max-width: 768px) {
  #equation-container {
    padding: 0.5rem 1rem;
    overflow-x: auto;
    justify-content: flex-start;
    /* Ensure container can scroll */
    width: 100%;
  }

  #equation-container :deep(.katex) {
    font-size: 1.5rem;
  }
}
</style>
