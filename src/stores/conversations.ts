import { defineStore } from 'pinia'
import { ref } from 'vue'
import { v4 as uuidv4 } from 'uuid'
import { OpenAiModels } from '@/constants'
import type { IAIModel, IConversationMessage } from '@/types'

export const useUserConversationsStore = defineStore('userConversations', () => {
  const conversations = ref<Map<string, IConversationMessage[]>>(new Map())
  const selectedConversationId = ref<string>('')
  const selectedAiModel = ref<IAIModel>(OpenAiModels[0])

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
  }

  const addAssistantResponseToConversation = (response: string) => {
    if (selectedConversationId.value) {
      const previousConversation = conversations.value.get(selectedConversationId.value)
      conversations.value.set(selectedConversationId.value, [
        ...(previousConversation || []),
        { role: 'assistant', content: response }
      ])
    }
  }

  const selectConversationAiModel = (model: IAIModel) => {
    selectedAiModel.value = model
  }

  const getConversationHistory = (conversationId: string) => {
    const conversation = conversations.value.get(conversationId)
    return conversation || []
  }

  return {
    conversations,
    selectedConversationId,
    addUserQueryToConversation,
    addAssistantResponseToConversation,
    selectedAiModel,
    selectConversationAiModel,
    getConversationHistory
  }
})
