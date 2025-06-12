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
    toggleOverlay();
  }
  return true;
});
</script>

<template>
  <div :style="{ display: isVisible ? 'block' : 'none' }">
    <ContentSelector @update:toggleOutputOverlay="toggleOverlay" />
  </div>
  <!-- <AiOutput v-model:toggleOutputOverlay="isVisible" /> -->
</template>
