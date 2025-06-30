<script setup lang="ts">
import { ref, onMounted, onUnmounted, computed, watch, nextTick } from 'vue'
import { XIcon, SquarePenIcon } from 'lucide-vue-next'
import InlineInput from './InlineInput.vue'
import VueMarkdown from 'vue-markdown-render'
import MarkdownItHighlightjs from 'markdown-it-highlightjs'
import { getShadowDocument } from '@/lib/utils'
import { useUserConversationsStore } from '@/stores/conversations'
import { storeToRefs } from 'pinia'

interface Props {
  isStreaming: boolean
  streamingError?: string
}

const props = defineProps<Props>()
const emit = defineEmits<{
  'update:toggleOutputOverlay': []
}>()

const userConversationsStore = useUserConversationsStore()
const { conversations } = storeToRefs(userConversationsStore)

const conversationsArray = computed(() => {
  return Array.from(conversations.value.entries())
})

const vueMarkdownPlugins = [MarkdownItHighlightjs]
const isDragging = ref(false)
const cursorPosition = ref({ x: window.innerWidth / 2, y: 100 })
const dragOffset = ref({ x: 0, y: 0 })
const moveSpeed = 10
const contentContainer = ref<HTMLElement>()
const userScrolled = ref(false)

// Auto-scroll to bottom as new content arrives
watch(
  () => conversationsArray.value,
  async () => {
    await nextTick()
    if (contentContainer.value && !userScrolled.value) {
      contentContainer.value.scrollTop = contentContainer.value.scrollHeight
    }
  },
  { deep: true }
)

const handleScroll = () => {
  if (contentContainer.value) {
    const { scrollTop, scrollHeight, clientHeight } = contentContainer.value
    const isAtBottom = scrollTop + clientHeight >= scrollHeight - 10 // 10px threshold

    // If user scrolls away from bottom, mark as user-scrolled
    if (!isAtBottom && !userScrolled.value) {
      userScrolled.value = true
    }

    // If user scrolls back to bottom, re-enable auto-scroll
    if (isAtBottom && userScrolled.value) {
      userScrolled.value = false
    }
  }
}

function handleKeyDown(e: KeyboardEvent) {
  e.stopPropagation()

  switch (e.key) {
    case 'ArrowLeft':
      cursorPosition.value.x -= moveSpeed
      break
    case 'ArrowRight':
      cursorPosition.value.x += moveSpeed
      break
    case 'Escape':
      toggleOutputOverlay()
      return
  }
}

const handleMouseDown = (event: MouseEvent) => {
  isDragging.value = true
  dragOffset.value = {
    x: event.clientX - cursorPosition.value.x,
    y: event.clientY - cursorPosition.value.y
  }
}

const handleMouseMove = (event: MouseEvent) => {
  if (isDragging.value) {
    cursorPosition.value = {
      x: event.clientX - dragOffset.value.x,
      y: event.clientY - dragOffset.value.y
    }
  }
}

function handleMouseUp() {
  isDragging.value = false
}

const toggleOutputOverlay = () => {
  emit('update:toggleOutputOverlay')
}

const handleCloseModal = async () => {
  userConversationsStore.clearConversation()
  await chrome.runtime.sendMessage({
    action: 'clearConversation'
  })
  emit('update:toggleOutputOverlay')
}

// Get the shadow root's document for event listeners
onMounted(async () => {
  const shadowDocument = getShadowDocument()
  shadowDocument.addEventListener('keydown', handleKeyDown as EventListener)
  window.addEventListener('mousemove', handleMouseMove)
  window.addEventListener('mouseup', handleMouseUp)

  // Add scroll listener to the actual scrollable element
  await nextTick()
  if (contentContainer.value) {
    contentContainer.value.addEventListener('scroll', handleScroll)
  }
})

onUnmounted(() => {
  const shadowDocument = getShadowDocument()
  shadowDocument.removeEventListener('keydown', handleKeyDown as EventListener)
  window.removeEventListener('mousemove', handleMouseMove)
  window.removeEventListener('mouseup', handleMouseUp)

  // Remove scroll listener from the scrollable element
  if (contentContainer.value) {
    contentContainer.value.removeEventListener('scroll', handleScroll)
  }
})
</script>

<template>
  <div
    class="ghostbar-overlay"
    :style="{
      left: cursorPosition.x + 'px',
      top: cursorPosition.y + 'px',
      transform: 'translateX(-50%)'
    }"
    @mousedown="handleMouseDown"
  >
    <div class="ghostbar-overlay-inner">
      <div class="ghostbar-overlay-content">
        <div class="ghostbar-header">
          <button class="ghostbar-close Button" data-variant="ghost" @click="handleCloseModal">
            <XIcon :color="'var(--muted-foreground)'" :size="18" />
          </button>

          <button
            class="ghostbar-new-chat Button"
            data-variant="ghost"
            @click="toggleOutputOverlay"
          >
            <SquarePenIcon :color="'var(--muted-foreground)'" :size="18" />
          </button>
        </div>

        <div class="ghostbar-body" ref="contentContainer">
          <div v-for="[conversationId, conversation] in conversationsArray" :key="conversationId">
            <div v-for="(message, index) in conversation" :key="`${conversationId}-${index}`">
              <div v-if="message.role === 'user'" class="user-query">
                <p>{{ message.content }}</p>
              </div>

              <div v-if="message.role === 'assistant'" id="stream-response" class="response-text">
                <vue-markdown :source="message.content" :plugins="vueMarkdownPlugins" />
              </div>
            </div>
          </div>
          <span
            v-if="
              props.isStreaming &&
              !props.streamingError &&
              !userConversationsStore.isThereStreamingResponse()
            "
            class="streaming-indicator"
          ></span>

          <div v-if="props.streamingError" class="streaming-error">
            <p>
              {{ props.streamingError }}
            </p>
          </div>
        </div>
      </div>
      <div class="response-actions">
        <InlineInput selected-text="selectedText" />
      </div>
    </div>
  </div>
</template>
