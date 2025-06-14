<script setup lang="ts">
import { ref } from "vue";
import AiOutput from "./components/AiOutput.vue";
import ContentSelector from "./components/ContentSelector.vue";

const isVisible = ref(false);

function toggleOverlay() {
  isVisible.value = !isVisible.value;
}

// Listen for messages from the extension
chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
  if (message.action === "toggleOverlay") {
    console.log("toggleOverlay", isVisible.value, new Date().getTime());
    isVisible.value = message.isVisible;
  }
  return true; // Indicate we're not doing async work
});
</script>

<template>
  <div :style="{ display: isVisible ? 'block' : 'none' }">
    <ContentSelector :is-visible="isVisible" @update:toggleOutputOverlay="toggleOverlay" />
  </div>
  <!-- <AiOutput v-model:toggleOutputOverlay="isVisible" /> -->
</template>
