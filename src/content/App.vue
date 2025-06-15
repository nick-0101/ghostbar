<script setup lang="ts">
import { ref, onMounted, onUnmounted } from "vue";
import AiOutput from "./components/AiOutput.vue";
import ContentSelector from "./components/ContentSelector.vue";

const isVisible = ref(false);

function toggleOverlay() {
  isVisible.value = !isVisible.value;
}

// Listen for messages from the extension
const messageListener = (message: any, sender: any, sendResponse: any) => {
  if (message.action === "toggleOverlay") {
    console.log("toggleOverlay", isVisible.value, new Date().getTime());
    isVisible.value = message.isVisible;
  }
  return true; // Indicate we're not doing async work
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
    <ContentSelector :is-visible="isVisible" @update:toggleOutputOverlay="toggleOverlay" />
  </div>
  <!-- <AiOutput v-model:toggleOutputOverlay="isVisible" /> -->
</template>
