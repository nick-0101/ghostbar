<script setup lang="ts">
import { ref, onMounted } from "vue";
import AppHeader from "@/components/navbar.vue";
import Home from "@/views/Home.vue";

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
</script>

<template>
  <div class="flex flex-col py-4 border-b w-[350px] h-[400px] bg-gray-50/40 font-inter">
    <AppHeader />
    <RouterView />
  </div>
</template>

<style scoped>
.logo {
  height: 6em;
  padding: 1.5em;
  will-change: filter;
  transition: filter 300ms;
}
.logo:hover {
  filter: drop-shadow(0 0 2em #646cffaa);
}
.logo.vue:hover {
  filter: drop-shadow(0 0 2em #42b883aa);
}
</style>
