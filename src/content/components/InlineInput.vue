<script setup lang="ts">
import { computed, onMounted, onUnmounted, ref } from 'vue'
import { useUserConversationsStore } from '@/stores/conversations'
import { usePortStore } from '@/stores/portStore'
import Popover from './ui/Popover.vue'
import { OpenAiModels } from '@/constants'
import type { IAIModel, IExecuteQueryMessage } from '@/types'

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
    aiModel: userConversationsStore.selectedAiModel.name,
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
  isPopoverOpen.value = value
}

const handleAiModelChange = (model: IAIModel) => {
  userConversationsStore.selectedAiModel = model
  isPopoverOpen.value = false
}

const availableAiModels = computed(() => {
  return [
    {
      OpenAI: [...OpenAiModels]
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
          placement="bottom"
          :open="isPopoverOpen"
          @update:open="handlePopoverChange"
        >
          <template #trigger>
            <button class="ghostbar-inline-input-model-selector Button" data-variant="ghost">
              Model: {{ userConversationsStore.selectedAiModel.label }}
            </button>
          </template>

          <div class="popover-options">
            <div v-for="(provider, index) in availableAiModels" :key="index">
              <div
                v-for="[providerName, models] in Object.entries(provider)"
                :key="providerName"
                class="popover-option-group"
              >
                <p class="popover-label">{{ providerName }}</p>
                <button
                  v-for="(model, idx) in models"
                  :key="model.name"
                  class="popover-option"
                  :class="{ active: userConversationsStore.selectedAiModel.name === model.name }"
                  @click="handleAiModelChange(model)"
                >
                  <p class="popover-option-name">{{ model.label }}</p>
                  <p class="popover-option-subtitle">{{ model.description }}</p>
                </button>
              </div>
            </div>
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
