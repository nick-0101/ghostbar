<script setup lang="ts">
import { ref, onMounted, onUnmounted, nextTick, watch } from 'vue'

interface Props {
  trigger: 'click' | 'hover'
  placement?:
    | 'top'
    | 'bottom'
    | 'left'
    | 'right'
    | 'top-start'
    | 'top-end'
    | 'bottom-start'
    | 'bottom-end'
    | 'left-start'
    | 'left-end'
    | 'right-start'
    | 'right-end'
  offset?: number
  open?: boolean
}

const props = withDefaults(defineProps<Props>(), {
  placement: 'bottom',
  offset: 8,
  open: false
})

const emit = defineEmits<{
  'update:open': [value: boolean]
}>()

const popoverRef = ref<HTMLElement>()
const triggerRef = ref<HTMLElement>()
const position = ref({ top: 0, left: 0 })

const getShadowDocument = () => {
  const shadowHost = document.getElementById('ghostbar-shadow-host')
  return shadowHost?.shadowRoot || document
}

// Update isOpen when prop changes
watch(
  () => props.open,
  newValue => {
    if (props.open) {
      nextTick(() => {
        calculatePosition()
      })
    }
  },
  { immediate: true }
)

const togglePopover = () => {
  emit('update:open', !props.open)
}

const calculatePosition = () => {
  if (!triggerRef.value || !popoverRef.value) return

  const triggerRect = triggerRef.value.getBoundingClientRect()
  const popoverRect = popoverRef.value.getBoundingClientRect()
  const viewportWidth = window.innerWidth
  const viewportHeight = window.innerHeight

  let top = 0
  let left = 0

  const baseOffset = props.offset

  switch (props.placement) {
    case 'top':
      top = -popoverRect.height - baseOffset
      left = triggerRect.width / 2 - popoverRect.width / 2

      break
    case 'top-start':
      top = -popoverRect.height - baseOffset
      left = 0
      break
    case 'top-end':
      top = -popoverRect.height - baseOffset
      left = triggerRect.width - popoverRect.width

      break
    case 'bottom':
      top = triggerRect.height + baseOffset
      left = triggerRect.width / 2 - popoverRect.width / 2

      break
    case 'bottom-start':
      top = triggerRect.height + baseOffset
      left = 0

      break
    case 'bottom-end':
      top = triggerRect.height + baseOffset
      left = triggerRect.width - popoverRect.width

      break
    case 'left':
      top = triggerRect.height / 2 - popoverRect.height / 2
      left = -popoverRect.width - baseOffset

      break
    case 'left-start':
      top = 0
      left = -popoverRect.width - baseOffset

      break
    case 'left-end':
      top = triggerRect.height - popoverRect.height
      left = -popoverRect.width - baseOffset

      break
    case 'right':
      top = triggerRect.height / 2 - popoverRect.height / 2
      left = triggerRect.width + baseOffset

      break
    case 'right-start':
      top = 0
      left = triggerRect.width + baseOffset

      break
    case 'right-end':
      top = triggerRect.height - popoverRect.height
      left = triggerRect.width + baseOffset

      break
  }

  // Ensure popover stays within viewport bounds
  const containerRect = triggerRef.value.getBoundingClientRect()
  const popoverLeft = containerRect.left + left
  const popoverTop = containerRect.top + top

  if (popoverLeft < 0) left = -containerRect.left + 8
  if (popoverLeft + popoverRect.width > viewportWidth)
    left = viewportWidth - containerRect.left - popoverRect.width - 8
  if (popoverTop < 0) top = -containerRect.top + 8
  if (popoverTop + popoverRect.height > viewportHeight)
    top = viewportHeight - containerRect.top - popoverRect.height - 8

  position.value = { top, left }
}

const closePopover = () => {
  emit('update:open', false)
}

const handleClickOutside = (event: Event) => {
  if (props.trigger === 'click' && props.open) {
    const target = event.target as HTMLElement
    if (!popoverRef.value?.contains(target) && !triggerRef.value?.contains(target)) {
      closePopover()
    }
  }
}

const handleKeyDown = (event: KeyboardEvent) => {
  if (event.key === 'Escape' && props.open) {
    closePopover()
  }
}

onMounted(() => {
  const shadowDocument = getShadowDocument()
  shadowDocument.addEventListener('click', handleClickOutside as EventListener)
  shadowDocument.addEventListener('keydown', handleKeyDown as EventListener)
  window.addEventListener('resize', calculatePosition)
  window.addEventListener('scroll', calculatePosition)
})

onUnmounted(() => {
  const shadowDocument = getShadowDocument()
  shadowDocument.removeEventListener('click', handleClickOutside as EventListener)
  shadowDocument.removeEventListener('keydown', handleKeyDown as EventListener)
  window.removeEventListener('resize', calculatePosition)
  window.removeEventListener('scroll', calculatePosition)
})
</script>

<template>
  <div class="popover-container">
    <!-- Trigger element -->
    <div ref="triggerRef" class="popover-trigger" @click="togglePopover()">
      <slot name="trigger" />
    </div>

    <!-- Popover content -->
    <div
      v-if="props.open"
      ref="popoverRef"
      class="popover"
      :class="[`popover--${placement}`]"
      :style="{
        top: position.top + 'px',
        left: position.left + 'px'
      }"
    >
      <div class="popover-content">
        <slot />
      </div>
    </div>
  </div>
</template>
