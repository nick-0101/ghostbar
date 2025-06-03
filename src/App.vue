<script setup lang="ts">
import { ref, onMounted } from "vue";
import AppHeader from "@/components/navbar.vue";

// const valueInput = ref("");
// const statusMessage = ref("");
// const statusColor = ref("");

// onMounted(() => {
//   // Load saved value when popup opens
//   chrome.storage.local.get(["savedValue"], (result) => {
//     if (result.savedValue) {
//       valueInput.value = result.savedValue;
//     }
//   });
// });

// const saveValue = () => {
//   chrome.storage.local.set({ savedValue: valueInput.value }, () => {
//     statusMessage.value = "Value saved!";
//     statusColor.value = "green";

//     // Clear status message after 2 seconds
//     setTimeout(() => {
//       statusMessage.value = "";
//     }, 2000);
//   });
// };

chrome.commands.onCommand.addListener((command) => {
  if (command === "_execute_action") {
    // Get the active tab
    console.log("command", command);
    chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => {
      const activeTab = tabs[0];
      if (activeTab.id) {
        // Send message to content script
        chrome.tabs.sendMessage(activeTab.id, { action: "toggleOverlay" });
      }
    });
  }
});
</script>

<template>
  <div class="flex flex-col py-4 border-b w-[350px] h-[400px] bg-gray-50/40 font-inter">
    <AppHeader />
    <RouterView />
  </div>
</template>
