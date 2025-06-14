<script setup lang="ts">
import { ref } from "vue";
import { useUserQueriesStore } from "@/stores/queries";
import { storeToRefs } from "pinia";

const userQueriesStore = useUserQueriesStore();
const { queries, currentQuery } = storeToRefs(userQueriesStore);

const emit = defineEmits<{
  executeQuery: [value: string];
}>();

const handleExecuteQuery = () => {
  emit("executeQuery", currentQuery.value);
};
</script>

<template>
  <div class="ghostbar-search-input-container">
    <input type="text" placeholder="Ask anything" v-model="currentQuery" />
    <button class="search-input-button" @click="handleExecuteQuery">
      <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
        <circle cx="12" cy="12" r="12" fill="white" />
        <path d="M10 12h4m0 0l-2-2m2 2l-2 2" stroke="#222" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" />
      </svg>
    </button>
  </div>
</template>

<style scoped>
.ghostbar-search-input-container {
  position: fixed;
  left: 50%;
  bottom: 40px;
  transform: translateX(-50%);
  z-index: 999997;
  display: flex;
  align-items: center;
  background: none;
  width: 100%;
  margin: 32px auto 0 auto;
}

.ghostbar-search-input-container input {
  width: 100%;
  background: #232427;
  border: none;
  outline: none;
  color: #fff;
  font-size: 1.25rem;
  padding: 14px 20px 14px 20px;
  border-radius: 16px 40px 40px 16px;
  font-family: inherit;
  transition: box-shadow 0.2s;
  box-shadow: 0 1px 4px 0 rgba(0, 0, 0, 0.1);
}

.ghostbar-search-input-container input::placeholder {
  color: #b0b3b8;
  opacity: 1;
}

.search-input-button {
  position: absolute;
  right: 8px;
  top: 50%;
  transform: translateY(-50%);
  background: #fff;
  border: none;
  width: 40px;
  height: 40px;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  box-shadow: 0 2px 8px 0 rgba(0, 0, 0, 0.1);
  cursor: pointer;
  padding: 0;
  z-index: 1;
}

.search-input-button svg {
  display: block;
}
</style>
