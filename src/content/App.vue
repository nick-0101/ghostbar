<script setup lang="ts">
import { ref, onMounted, onUnmounted, onBeforeUnmount } from "vue";
import AiOutput from "./components/AiOutput.vue";
import ContentSelector from "./components/ContentSelector.vue";
import { usePortStore } from "@/stores/portStore";

const isVisible = ref(false);
const streamedResponse = ref("");
const isStreaming = ref(false);
const completeResponses = ref<any[]>([]);
const { connectPort, sendMessage, onMessage, disconnectPort } = usePortStore();

function toggleOverlay() {
  isVisible.value = !isVisible.value;
}

// Listen for messages from the extension
const messageListener = (message: any, sender: any, sendResponse: any) => {
  if (message.action === "toggleOverlay") {
    isVisible.value = message.isVisible;
  }

  return true;
};

function sendQuery(prompt: string) {
  sendMessage({
    action: "executeQuery",
    prompt,
  });
  streamedResponse.value = "";
  isStreaming.value = true;
}

function clearResponse() {
  streamedResponse.value = "";
  isStreaming.value = false;
}

onMounted(() => {
  chrome.runtime.onMessage.addListener(messageListener);
  connectPort();

  onMessage((msg) => {
    switch (msg.action) {
      case "streamStart":
        clearResponse();
        break;
      case "streamResponse":
        streamedResponse.value += msg.aiResponse;
        break;
      case "streamComplete":
        isStreaming.value = false;
        completeResponses.value = msg.completeResponse;
        break;
      default:
        break;
    }
  });
});

onBeforeUnmount(() => {
  chrome.runtime.onMessage.removeListener(messageListener);
  disconnectPort();
});
</script>

<template>
  <div :class="isVisible ? 'ghostbar-visible' : 'ghostbar-hidden'">
    <ContentSelector :is-visible="isVisible" @update:toggleOutputOverlay="toggleOverlay" :streamed-response="streamedResponse" :is-streaming="isStreaming" />
    <AiOutput v-show="isStreaming || streamedResponse" :streamed-response="streamedResponse" :is-streaming="isStreaming" @clear="clearResponse" @update:toggleOutputOverlay="toggleOverlay" />
  </div>
</template>
