<script setup lang="ts">
import { ref, watch } from 'vue'
import FloatingInput from './FloatingInput.vue'

const cursorPosition = ref({ x: 0, y: 0 })
const hoveredElement = ref<HTMLElement | null>(null)
const clickedElement = ref<HTMLElement | null>(null)
const selectedText = ref<string>('')
const scrollPosition = ref({ x: 0, y: 0 })

const props = defineProps<{
  isVisible: boolean
}>()

const HIGHLIGHT_CLASS = 'ghostbar-highlighted-selected-element'

const handleMouseMove = (event: MouseEvent) => {
  cursorPosition.value = { x: event.clientX, y: event.clientY }

  // Get element under cursor
  const element = document.elementFromPoint(event.clientX, event.clientY) as HTMLElement
  if (element && element !== hoveredElement.value) {
    hoveredElement.value = element
  }
}

const handleClick = (event: MouseEvent) => {
  event.preventDefault()
  event.stopPropagation()

  if (hoveredElement.value) {
    // Remove highlight from previous element
    if (clickedElement.value) {
      clickedElement.value.classList.remove(HIGHLIGHT_CLASS)
    }

    selectedText.value = hoveredElement.value.textContent?.trim() || ''
    clickedElement.value = hoveredElement.value
    hoveredElement.value = null

    // Add highlight class to the clicked element
    clickedElement.value.classList.add(HIGHLIGHT_CLASS)

    // Remove mousemove listener to disable hover
    document.removeEventListener('mousemove', handleMouseMove)
  }
}

const updateScrollPosition = () => {
  scrollPosition.value = {
    x: window.scrollX,
    y: window.scrollY
  }
}

const handleAddEventListeners = () => {
  document.addEventListener('mousemove', handleMouseMove)
  document.addEventListener('click', handleClick)
  window.addEventListener('scroll', updateScrollPosition)
}

const handleRemoveEventListeners = () => {
  document.removeEventListener('mousemove', handleMouseMove)
  document.removeEventListener('click', handleClick)
  window.removeEventListener('scroll', updateScrollPosition)
}

watch(
  () => props.isVisible,
  newValue => {
    if (newValue) {
      handleAddEventListeners()
    } else {
      handleRemoveEventListeners()
      if (clickedElement.value) {
        clickedElement.value.classList.remove(HIGHLIGHT_CLASS)
      }
      selectedText.value = ''
      clickedElement.value = null
      hoveredElement.value = null
    }
  }
)
</script>

<template>
  <div class="ghostbar-content-selector">
    <div
      class="ghostbar-selector"
      :style="{ top: `${cursorPosition.y}px`, left: `${cursorPosition.x}px` }"
    ></div>
    <div
      v-if="hoveredElement"
      class="element-highlight"
      :style="{
        top: hoveredElement?.getBoundingClientRect()?.top + 'px',
        left: hoveredElement?.getBoundingClientRect()?.left + 'px',
        width: hoveredElement?.getBoundingClientRect()?.width + 'px',
        height: hoveredElement?.getBoundingClientRect()?.height + 'px'
      }"
    ></div>
    <FloatingInput :selectedText="selectedText" />
  </div>
</template>
