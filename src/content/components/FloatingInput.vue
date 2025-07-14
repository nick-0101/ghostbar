<script setup lang="ts">
import { onMounted, onUnmounted, ref, watch } from 'vue'
import { useUserConversationsStore } from '@/stores/conversations'
import { usePortStore } from '@/stores/portStore'
import { storeToRefs } from 'pinia'
import type { IExecuteQueryMessage } from '@/types'

const cursorPosition = ref({ x: window.innerWidth / 2, y: window.innerHeight - 100 })
const isDragging = ref(false)
const dragOffset = ref({ x: 0, y: 0 })
const userConversationsStore = useUserConversationsStore()
const { selectedText, floatingInputQuery } = storeToRefs(userConversationsStore)
const { sendMessage } = usePortStore()

const handleExecuteQuery = () => {
  userConversationsStore.addUserQueryToConversation(
    `${userConversationsStore.floatingInputQuery} \n\n\n ${selectedText.value}`
  )

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
  <div
    class="ghostbar-floating-input-container"
    :style="{
      left: cursorPosition.x + 'px',
      top: cursorPosition.y + 'px',
      transform: 'translateX(-50%)'
    }"
    @mousedown="handleMouseDown"
  >
    <div class="ghostbar-floating-input-container-inner Card">
      <textarea
        id="ghostbar-floating-input-textarea"
        class="Textarea"
        type="text"
        placeholder="Ask anything"
        v-model="userConversationsStore.floatingInputQuery"
      />
      <!-- <input class="Input" type="text" placeholder="Ask anything" v-model="currentQuery" /> -->
      <button class="ghostbar-floating-input-search-button" @click.stop="handleExecuteQuery">
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
</template>
