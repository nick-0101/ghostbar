import { defineStore } from "pinia";
import { computed, ref } from "vue";

export const useUserQueriesStore = defineStore("userQueries", () => {
  const queries = ref<string[]>([]);
  const currentQuery = ref<string>("");
  //   const doubleCount = computed(() => count.value * 2);
  //   function increment() {
  //     count.value++;
  //   }

  return { queries, currentQuery };
});
