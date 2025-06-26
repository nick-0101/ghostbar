<script setup lang="ts">
import { ref, onMounted, onUnmounted, onBeforeUnmount, watch } from "vue";
import AiOutput from "./components/AiOutput.vue";
import ContentSelector from "./components/ContentSelector.vue";
import { usePortStore } from "@/stores/portStore";
import { useUserConversationsStore } from "@/stores/conversations";
import { storeToRefs } from "pinia";

const { connectPort, onMessage, disconnectPort } = usePortStore();
const userConversationsStore = useUserConversationsStore();
const isVisible = ref(false);
const streamedResponse = ref("Hello"); // set to empty string, only "hello world in dev"
const isStreaming = ref(false); //set to false, true only for dev

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

watch(isVisible, (newVal) => {
  if (newVal) {
    const shadowHost = document.getElementById("ghostbar-shadow-host");
    const appContainer = shadowHost?.shadowRoot?.getElementById("crx-root");
    if (appContainer) {
      appContainer.classList.remove("ghostbar-hidden");
      appContainer.classList.add("ghostbar-visible");
    }
  } else {
    const shadowHost = document.getElementById("ghostbar-shadow-host");
    const appContainer = shadowHost?.shadowRoot?.getElementById("crx-root");
    if (appContainer) {
      appContainer.classList.remove("ghostbar-visible");
      appContainer.classList.add("ghostbar-hidden");
    }
  }
});

onMounted(() => {
  chrome.runtime.onMessage.addListener((message: any) => {
    if (message.action === "toggleOverlay") {
      isVisible.value = message.isVisible;
    }

    return true;
  });
  connectPort();

  onMessage((msg) => {
    switch (msg.action) {
      case "streamStart":
        streamedResponse.value = "";
        isStreaming.value = true;
        break;
      case "streamResponse":
        streamedResponse.value += msg.aiResponse;
        break;
      case "streamComplete":
        isStreaming.value = false;
        userConversationsStore.addAssistantResponseToConversation(msg.completeResponse);
        break;
      case "streamError":
        // TODO: handle error
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
  <AiOutput v-show="isStreaming || streamedResponse" :streamed-response="streamedResponse" :is-streaming="isStreaming" @update:toggleOutputOverlay="toggleOverlay" />
  <ContentSelector v-show="!isStreaming && !streamedResponse" :is-visible="isVisible" :streamed-response="streamedResponse" :is-streaming="isStreaming" @update:toggleOutputOverlay="toggleOverlay" />
</template>
