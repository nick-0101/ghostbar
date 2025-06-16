<script setup lang="ts">
import { ref, onMounted, onUnmounted } from "vue";
import AiOutput from "./components/AiOutput.vue";
import ContentSelector from "./components/ContentSelector.vue";
import SearchInput from "./components/SearchInput.vue";

const isVisible = ref(false);
const streamedResponse = ref("");
const isStreaming = ref(false);

function toggleOverlay() {
  isVisible.value = !isVisible.value;
}

// Listen for messages from the extension
const messageListener = (message: any, sender: any, sendResponse: any) => {
  if (message.action === "toggleOverlay") {
    isVisible.value = message.isVisible;
  } else if (message.action === "streamChunk") {
    streamedResponse.value += message.chunk;
  } else if (message.action === "streamComplete") {
    isStreaming.value = false;
  } else if (message.action === "streamError") {
    console.error("Streaming error:", message.error);
    isStreaming.value = false;
  }
  return true;
};

const handleExecuteQuery = () => {
  console.log("execute query");
  chrome.runtime.sendMessage({ action: "executeQuery", selectedText: props.selectedText, query: currentQuery.value });
};

onMounted(() => {
  chrome.runtime.onMessage.addListener(messageListener);
});

onUnmounted(() => {
  chrome.runtime.onMessage.removeListener(messageListener);
});
</script>

<template>
  <div v-show="isVisible">
    <ContentSelector :is-visible="isVisible" @update:toggleOutputOverlay="toggleOverlay" :streamed-response="streamedResponse" :is-streaming="isStreaming" />
    <SearchInput selectedText="Test" />

    <button class="Button ghostbar-search-button" variant="icon" @click="handleExecuteQuery">
      <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
        <path d="m5 12 7-7 7 7" />
        <path d="M12 19V5" />
      </svg>
    </button>
  </div>
  <!-- <AiOutput v-model:toggleOutputOverlay="isVisible" /> -->
</template>
