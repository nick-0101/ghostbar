import { onMounted, ref } from "vue";
import { useAIStore } from "@/stores/ai";
import { storeToRefs } from "pinia";

export const useAI = () => {
  const aiStore = useAIStore();
  const { openAiKey } = storeToRefs(aiStore);

  const fetchOpenAiKey = async () => {
    const data = await chrome.storage.sync.get("apiKey");
    if (data.apiKey) {
      openAiKey.value = data.apiKey;
    }
  };

  const handleSetOpenAiKey = async (key: string) => {
    await chrome.storage.sync.set({ apiKey: key });
  };

  onMounted(async () => {
    if (!openAiKey.value) {
      console.log("refetching");
      await fetchOpenAiKey();
    }
  });

  return { openAiKey, fetchOpenAiKey, handleSetOpenAiKey };
};
