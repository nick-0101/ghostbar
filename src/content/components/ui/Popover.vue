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
  console.log(triggerRef.value, 'triggerRef')
  console.log(popoverRef.value, 'popoverRef')

  if (!triggerRef.value || !popoverRef.value) return

  const triggerRect = triggerRef.value.getBoundingClientRect()
  const popoverRect = popoverRef.value.getBoundingClientRect()
  const viewportWidth = window.innerWidth
  const viewportHeight = window.innerHeight

  let top = 0
  let left = 0

  const baseOffset = props.offset

  console.log(triggerRect, 'triggerRect')
  console.log(popoverRect, 'popoverRect')
  console.log(viewportWidth, 'viewportWidth')
  console.log(viewportHeight, 'viewportHeight')

  switch (props.placement) {
    case 'top':
      top = triggerRect.top - popoverRect.height - baseOffset
      left = triggerRect.left + triggerRect.width / 2 - popoverRect.width / 2

      break
    case 'top-start':
      top = triggerRect.top - popoverRect.height - baseOffset
      left = triggerRect.left
      break
    case 'top-end':
      top = triggerRect.top - popoverRect.height - baseOffset
      left = triggerRect.right - popoverRect.width

      break
    case 'bottom':
      top = triggerRect.bottom + baseOffset
      left = triggerRect.left + triggerRect.width / 2 - popoverRect.width / 2

      break
    case 'bottom-start':
      top = triggerRect.bottom + baseOffset
      left = triggerRect.left

      break
    case 'bottom-end':
      top = triggerRect.bottom + baseOffset
      left = triggerRect.right - popoverRect.width

      break
    case 'left':
      top = triggerRect.top + triggerRect.height / 2 - popoverRect.height / 2
      left = triggerRect.left - popoverRect.width - baseOffset

      break
    case 'left-start':
      top = triggerRect.top
      left = triggerRect.left - popoverRect.width - baseOffset

      break
    case 'left-end':
      top = triggerRect.bottom - popoverRect.height
      left = triggerRect.left - popoverRect.width - baseOffset

      break
    case 'right':
      top = triggerRect.top + triggerRect.height / 2 - popoverRect.height / 2
      left = triggerRect.right + baseOffset

      break
    case 'right-start':
      top = triggerRect.top
      left = triggerRect.right + baseOffset

      break
    case 'right-end':
      top = triggerRect.bottom - popoverRect.height
      left = triggerRect.right + baseOffset

      break
  }

  // Ensure popover stays within viewport
  if (left < 0) left = 8
  if (left + popoverRect.width > viewportWidth) left = viewportWidth - popoverRect.width - 8
  if (top < 0) top = 8
  if (top + popoverRect.height > viewportHeight) top = viewportHeight - popoverRect.height - 8

  position.value = { top, left }
}

const closePopover = () => {
  emit('update:open', false)
}

const handleClickOutside = (event: Event) => {
  //   console.log(props.open, "from handleClickOutside");
  //   if (props.trigger === "click" && props.open) {
  //     const target = event.target as HTMLElement;
  //     if (!popoverRef.value?.contains(target) && !triggerRef.value?.contains(target)) {
  //       closePopover();
  //     }
  //   }
}

const handleKeyDown = (event: KeyboardEvent) => {
  if (event.key === 'Escape' && props.open) {
    closePopover()
  }
}

onMounted(() => {
  document.addEventListener('click', handleClickOutside)
  document.addEventListener('keydown', handleKeyDown)
  window.addEventListener('resize', calculatePosition)
  window.addEventListener('scroll', calculatePosition)
})

onUnmounted(() => {
  document.removeEventListener('click', handleClickOutside)
  document.removeEventListener('keydown', handleKeyDown)
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
