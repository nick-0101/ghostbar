import { defineStore } from "pinia";
import { computed, ref } from "vue";

export const useAIStore = defineStore("ai", () => {
  const openAiKey = ref("");
  //   const doubleCount = computed(() => count.value * 2);
  //   function increment() {
  //     count.value++;
  //   }

  return { openAiKey };
});
