import { defineStore } from 'pinia'
import { useUserConversationsStore } from './conversations'

export const usePortStore = defineStore('port', () => {
  let port: chrome.runtime.Port | null = null
  const userConversationsStore = useUserConversationsStore()

  const connectPort = (name = 'ghostbar-api') => {
    if (!port) {
      port = chrome.runtime.connect({ name })
      port.onDisconnect.addListener(() => {
        port = null
      })

      // Set up message handling for streaming
      port.onMessage.addListener((msg: any) => {
        switch (msg.action) {
          case 'streamStart':
            userConversationsStore.startAssistantResponse()
            break
          case 'streamResponse':
            userConversationsStore.updateAssistantResponse(msg.aiResponse)
            break
          case 'streamComplete':
            userConversationsStore.finalizeAssistantResponse(msg.completeResponse)
            break
          case 'streamError':
            console.error('Streaming error:', msg.error)
            break
        }
      })
    }
    return port
  }

  const sendMessage = <T>(message: T) => {
    if (!port) connectPort()
    return port?.postMessage(message)
  }

  const disconnectPort = () => {
    port?.disconnect()
    port = null
  }

  const onMessage = (callback: (msg: any) => void) => {
    connectPort()?.onMessage.addListener(callback)
  }

  return {
    connectPort,
    sendMessage,
    disconnectPort,
    onMessage
  }
})
