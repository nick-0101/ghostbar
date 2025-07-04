import { defineStore } from 'pinia'
import { computed, onMounted, ref, watch } from 'vue'
import { v4 as uuidv4 } from 'uuid'
import { OpenAiModels } from '@/constants'
import type { IAIModel, IConversationMessage } from '@/types'

export const useUserConversationsStore = defineStore('userConversations', () => {
  const conversations = ref<Map<string, IConversationMessage[]>>(new Map())
  const selectedConversationId = ref<string>('')
  const selectedAiModel = ref<IAIModel>(OpenAiModels[0])
  const inlineInputQuery = ref<string>('')
  const floatingInputQuery = ref<string>('')
  const selectedText = ref<string>('')

  const startNewConversation = () => {
    const newConversationId = uuidv4()
    selectedConversationId.value = newConversationId
    inlineInputQuery.value = ''
    floatingInputQuery.value = ''
    selectedText.value = ''
  }

  const addUserQueryToConversation = (query: string) => {
    if (!selectedConversationId.value) {
      const newConversationId = uuidv4()
      conversations.value.set(newConversationId, [{ role: 'user', content: query }])
      selectedConversationId.value = newConversationId
    } else {
      const previousConversation = conversations.value.get(selectedConversationId.value)
      conversations.value.set(selectedConversationId.value, [
        ...(previousConversation || []),
        { role: 'user', content: query }
      ])
    }
    conversations.value = new Map(conversations.value)
  }

  const startAssistantResponse = () => {
    if (selectedConversationId.value) {
      const previousConversation = conversations.value.get(selectedConversationId.value)
      const newConversation = [
        ...(previousConversation || []),
        { role: 'assistant' as const, content: '' }
      ]
      conversations.value.set(selectedConversationId.value, newConversation)
      conversations.value = new Map(conversations.value)
    }
  }

  const updateAssistantResponse = (content: string) => {
    if (selectedConversationId.value) {
      const conversation = conversations.value.get(selectedConversationId.value)
      if (conversation && conversation.length > 0) {
        const lastMessage = conversation[conversation.length - 1]
        if (lastMessage.role === 'assistant') {
          lastMessage.content += content
          conversations.value = new Map(conversations.value)
        }
      }
    }
  }

  const finalizeAssistantResponse = (finalContent: string) => {
    if (selectedConversationId.value) {
      const conversation = conversations.value.get(selectedConversationId.value)
      if (conversation && conversation.length > 0) {
        const lastMessage = conversation[conversation.length - 1]
        if (lastMessage.role === 'assistant') {
          lastMessage.content = finalContent
          conversations.value = new Map(conversations.value)
        }
      }
    }
  }

  const isThereStreamingResponse = () => {
    if (selectedConversationId.value) {
      const conversation = conversations.value.get(selectedConversationId.value)
      if (conversation && conversation.length > 0) {
        const lastMessage = conversation[conversation.length - 1]
        return lastMessage.role === 'assistant' && lastMessage.content.length > 0
      }
    }
    return false
  }

  const selectConversationAiModel = (model: IAIModel) => {
    selectedAiModel.value = model
  }

  const getConversationHistory = (conversationId: string) => {
    const conversation = conversations.value.get(conversationId)
    return conversation || []
  }

  const clearConversation = () => {
    conversations.value.clear()
    selectedConversationId.value = ''
  }

  return {
    conversations,
    selectedConversationId,
    startNewConversation,
    addUserQueryToConversation,
    startAssistantResponse,
    updateAssistantResponse,
    finalizeAssistantResponse,
    selectedAiModel,
    selectConversationAiModel,
    getConversationHistory,
    clearConversation,
    isThereStreamingResponse,
    inlineInputQuery,
    floatingInputQuery,
    selectedText
  }
})
