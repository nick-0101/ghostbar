<script setup lang="ts">
import { ref, onMounted, onBeforeUnmount, watch, onUnmounted, nextTick } from 'vue'
import AiOutput from './components/AiOutput.vue'
import ContentSelector from './components/ContentSelector.vue'
import { usePortStore } from '@/stores/portStore'
import { useUserConversationsStore } from '@/stores/conversations'
import { storeToRefs } from 'pinia'

const { connectPort, onMessage, sendMessage, disconnectPort } = usePortStore()
const isVisible = ref(false)
const isStreaming = ref(false)
const streamingError = ref('')
const contentSelectorEnabled = ref(true)
const userConversationsStore = useUserConversationsStore()
const { selectedText } = storeToRefs(userConversationsStore)

const toggleOverlay = () => {
  isVisible.value = !isVisible.value
}

// Listen for messages from the extension
const messageListener = (message: any, sender: any, sendResponse: any) => {
  if (message.action === 'toggleOverlay') {
    isVisible.value = message.isVisible
  }

  return true
}

const handleKeyDown = async (event: KeyboardEvent) => {
  if (event.key === 'Escape' && isVisible.value) {
    toggleOverlay()
    userConversationsStore.clearConversation()
    await chrome.runtime.sendMessage({
      action: 'clearConversation'
    })
  }
}

watch(isVisible, newVal => {
  if (newVal) {
    const shadowHost = document.getElementById('ghostbar-shadow-host')
    const appContainer = shadowHost?.shadowRoot?.getElementById('crx-root')
    if (appContainer) {
      appContainer.classList.remove('ghostbar-hidden')
      appContainer.classList.add('ghostbar-visible')
    }
  } else {
    const shadowHost = document.getElementById('ghostbar-shadow-host')
    const appContainer = shadowHost?.shadowRoot?.getElementById('crx-root')
    if (appContainer) {
      appContainer.classList.remove('ghostbar-visible')
      appContainer.classList.add('ghostbar-hidden')
    }
  }
})

onMounted(() => {
  document.addEventListener('keydown', handleKeyDown)

  chrome.runtime.onMessage.addListener((message: any) => {
    console.log('message', message)
    switch (message.action) {
      case 'toggleOverlay':
        isVisible.value = message.isVisible
        break
      case 'onTheFlyPrompt':
        isVisible.value = message.isVisible
        contentSelectorEnabled.value = false

        nextTick(() => {
          selectedText.value = message.selectedText
          console.log('selectedText', selectedText.value)
        })
        break
      default:
        break
    }

    return true
  })
  connectPort()

  // Listen for streaming state changes
  onMessage(msg => {
    switch (msg.action) {
      case 'streamStart':
        isStreaming.value = true
        streamingError.value = ''
        break
      case 'streamComplete':
        isStreaming.value = false
        break
      case 'streamError':
        isStreaming.value = false
        streamingError.value = msg.error
        break
    }
  })
})

onBeforeUnmount(() => {
  chrome.runtime.onMessage.removeListener(messageListener)
  disconnectPort()
})

onUnmounted(() => {
  document.removeEventListener('keydown', handleKeyDown)
})
</script>

<template>
  <AiOutput
    v-show="isStreaming || userConversationsStore.isThereStreamingResponse() || !!streamingError"
    :streaming-error="streamingError"
    :is-streaming="isStreaming"
    @update:toggleOutputOverlay="toggleOverlay"
  />
  <ContentSelector
    v-show="!isStreaming && !userConversationsStore.isThereStreamingResponse()"
    :is-visible="isVisible"
    :content-selector-enabled="contentSelectorEnabled"
    @update:toggleOutputOverlay="toggleOverlay"
  />
</template>
