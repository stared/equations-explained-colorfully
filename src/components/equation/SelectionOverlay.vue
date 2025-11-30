<template>
  <svg
    class="selection-overlay"
    :style="{
      position: 'absolute',
      top: 0,
      left: 0,
      width: '100%',
      height: '100%',
      pointerEvents: 'none',
      zIndex: 0
    }"
  >
    <rect
      v-for="(rect, index) in highlightRects"
      :key="index"
      :x="rect.x"
      :y="rect.y"
      :width="rect.width"
      :height="rect.height"
      rx="4"
      ry="4"
      :style="{
        fill: `color-mix(in srgb, ${color} 10%, transparent)`,
        opacity: 1,
        transition: 'opacity 0.15s ease-out'
      }"
    />
  </svg>
</template>

<script setup lang="ts">
import { ref, watch, onMounted, onUnmounted } from 'vue'

const props = defineProps<{
  elements: Element[]
  color: string
  containerRef: HTMLElement | null
}>()

interface HighlightRect {
  x: number
  y: number
  width: number
  height: number
}

const highlightRects = ref<HighlightRect[]>([])

function getVisualBoundingRect(element: Element): DOMRect | null {
  let minX = Infinity, minY = Infinity, maxX = -Infinity, maxY = -Infinity
  let found = false

  const processRect = (r: DOMRect) => {
    if (r.width > 0.1 && r.height > 0.1) {
      minX = Math.min(minX, r.left)
      minY = Math.min(minY, r.top)
      maxX = Math.max(maxX, r.right)
      maxY = Math.max(maxY, r.bottom)
      found = true
    }
  }

  const selfRects = element.getClientRects()
  for (let i = 0; i < selfRects.length; i++) processRect(selfRects[i])

  const descendants = element.querySelectorAll('*')
  if (descendants.length > 0) {
    descendants.forEach((child) => {
      const rects = child.getClientRects()
      for (let i = 0; i < rects.length; i++) processRect(rects[i])
    })
  }

  if (!found) {
    return element.getBoundingClientRect()
  }

  return new DOMRect(minX, minY, maxX - minX, maxY - minY)
}

function calculateRects() {
  if (!props.containerRef || props.elements.length === 0) {
    highlightRects.value = []
    return
  }

  const containerRect = props.containerRef.getBoundingClientRect()
  const containerStyle = window.getComputedStyle(props.containerRef)
  const borderLeft = parseFloat(containerStyle.borderLeftWidth) || 0
  const borderTop = parseFloat(containerStyle.borderTopWidth) || 0
  const padding = 2

  const rects: HighlightRect[] = []

  props.elements.forEach((el) => {
    const visualRect = getVisualBoundingRect(el)
    if (!visualRect) return

    rects.push({
      x: visualRect.left - containerRect.left - borderLeft - padding,
      y: visualRect.top - containerRect.top - borderTop - padding,
      width: visualRect.width + padding * 2,
      height: visualRect.height + padding * 2
    })
  })

  highlightRects.value = rects
}

watch(() => [props.elements, props.containerRef], calculateRects, { deep: true, immediate: true })

// Recalculate on resize
let resizeObserver: ResizeObserver | null = null

onMounted(() => {
  if (props.containerRef) {
    resizeObserver = new ResizeObserver(calculateRects)
    resizeObserver.observe(props.containerRef)
  }
})

onUnmounted(() => {
  resizeObserver?.disconnect()
})
</script>
