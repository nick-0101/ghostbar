<script setup lang="ts">
import { ref, onMounted, onUnmounted } from "vue";
import AiOutput from "./components/AiOutput.vue";
import ContentSelector from "./components/ContentSelector.vue";

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
  }

  console.log(message);
  return true;
};

onMounted(() => {
  chrome.runtime.onMessage.addListener(messageListener);
});

onUnmounted(() => {
  chrome.runtime.onMessage.removeListener(messageListener);
});
</script>

<template>
  <div :class="{ 'ghostbar-hidden': !isVisible }">
    <ContentSelector :is-visible="isVisible" @update:toggleOutputOverlay="toggleOverlay" :streamed-response="streamedResponse" :is-streaming="isStreaming" />
  </div>
</template>
