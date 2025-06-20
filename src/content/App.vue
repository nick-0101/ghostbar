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
    if (msg.aiResponse) {
      streamedResponse.value += msg.aiResponse;
      console.log(msg.aiResponse);
    }

    // Handle complete response array
    if (msg.action === "streamComplete") {
      isStreaming.value = false;
      completeResponses.value = msg.completeResponse;
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

    <button @click="sendQuery('Explain this?')">Send Query</button>

    <!-- AI Output Component with streaming -->
    <AiOutput v-if="isVisible" :streamed-response="streamedResponse" :is-streaming="isStreaming" @clear="clearResponse" @update:toggleOutputOverlay="toggleOverlay" />

    <div v-if="completeResponses.length > 0">
      <p>Complete responses collected: {{ completeResponses.length }}</p>
      <button @click="() => console.log('Complete responses array:', completeResponses)">Log Complete Array</button>
    </div>
  </div>
</template>
