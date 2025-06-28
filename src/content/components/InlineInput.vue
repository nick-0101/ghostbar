<script setup lang="ts">
import { computed, onMounted, onUnmounted, ref } from 'vue'
import { useUserConversationsStore } from '@/stores/conversations'
import { storeToRefs } from 'pinia'
import { usePortStore } from '@/stores/portStore'
import type { IExecuteQueryMessage } from '@/types'
import Popover from './ui/Popover.vue'

const cursorPosition = ref({ x: window.innerWidth / 2, y: window.innerHeight - 100 })
const isDragging = ref(false)
const dragOffset = ref({ x: 0, y: 0 })
const userConversationsStore = useUserConversationsStore()
const { sendMessage } = usePortStore()
const searchQuery = ref('')
const isPopoverOpen = ref(false)

const handleExecuteQuery = () => {
  userConversationsStore.addUserQueryToConversation(searchQuery.value)

  sendMessage<IExecuteQueryMessage>({
    action: 'executeQuery',
    aiModel: userConversationsStore.selectedAiModel,
    history: userConversationsStore.getConversationHistory(
      userConversationsStore.selectedConversationId
    )
  })
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

const handleMouseUp = () => {
  isDragging.value = false
}

const handlePopoverChange = (value: boolean) => {
  console.log(value, 'from handlePopoverChange')
  isPopoverOpen.value = value
}

const availableAiModels = computed(() => {
  return [
    {
      name: 'GPT-4o',
      subtitle: 'Great for most tasks'
    },
    {
      name: 'gpt-4o-mini',
      subtitle: 'Smaller model, cheaper'
    },
    {
      name: 'gpt-4.1',
      subtitle: 'Newest model, best for complex tasks'
    }
  ]
})

onMounted(() => {
  window.addEventListener('mousemove', handleMouseMove)
  window.addEventListener('mouseup', handleMouseUp)
})

onUnmounted(() => {
  window.removeEventListener('mousemove', handleMouseMove)
  window.removeEventListener('mouseup', handleMouseUp)
})
</script>

<template>
  <div class="ghostbar-inline-input-container" @mousedown="handleMouseDown">
    <div class="ghostbar-inline-input-container-inner Card">
      <textarea
        id="ghostbar-inline-input-textarea"
        class="Textarea"
        type="text"
        placeholder="Ask anything"
        v-model="searchQuery"
      />
      <div class="ghostbar-inline-input-actions-container">
        <Popover
          trigger="click"
          placement="top"
          :open="isPopoverOpen"
          @update:open="handlePopoverChange"
        >
          <template #trigger>
            <button class="ghostbar-inline-input-model-selector Button" data-variant="ghost">
              Model: {{ userConversationsStore.selectedAiModel }}
            </button>
          </template>

          <div class="model-options">
            <button
              v-for="model in availableAiModels"
              :key="model.name"
              class="model-option"
              :class="{ active: userConversationsStore.selectedAiModel === model.name }"
              @click="userConversationsStore.selectedAiModel = model.name"
            >
              <p>{{ model.name }}</p>
              <p>{{ model.subtitle }}</p>
            </button>
          </div>
        </Popover>

        <button class="ghostbar-inline-input-search-button" @click.stop="handleExecuteQuery">
          <svg
            xmlns="http://www.w3.org/2000/svg"
            width="20"
            height="20"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            stroke-width="2"
            stroke-linecap="round"
            stroke-linejoin="round"
          >
            <path d="m5 12 7-7 7 7" />
            <path d="M12 19V5" />
          </svg>
        </button>
      </div>
    </div>
  </div>
</template>
