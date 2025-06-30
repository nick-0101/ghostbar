import { defineStore } from 'pinia'
import { computed, ref } from 'vue'

export const useAIStore = defineStore('ai', () => {
  const openAiKey = ref('')

  return { openAiKey }
})
