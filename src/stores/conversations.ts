import { defineStore } from "pinia";
import { computed, ref } from "vue";
import { v4 as uuidv4 } from "uuid";
import type { IConversationMessage } from "@/types";

export const useUserConversationsStore = defineStore("userConversations", () => {
  const conversations = ref<Map<string, IConversationMessage[]>>(new Map());
  const selectedConversationId = ref<string>("");

  const addUserQueryToConversation = (query: string) => {
    if (!selectedConversationId.value) {
      const newConversationId = uuidv4();
      conversations.value.set(newConversationId, [{ role: "user", content: query }]);
      selectedConversationId.value = newConversationId;
    } else {
      const previousConversation = conversations.value.get(selectedConversationId.value);
      conversations.value.set(selectedConversationId.value, [...(previousConversation || []), { role: "user", content: query }]);
    }
  };

  const addAssistantResponseToConversation = (response: string) => {
    if (selectedConversationId.value) {
      const previousConversation = conversations.value.get(selectedConversationId.value);
      conversations.value.set(selectedConversationId.value, [...(previousConversation || []), { role: "assistant", content: response }]);
    }
  };

  return { conversations, selectedConversationId, addUserQueryToConversation, addAssistantResponseToConversation };
});
