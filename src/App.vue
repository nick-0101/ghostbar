<script setup lang="ts">
import { ref, onMounted } from "vue";

const valueInput = ref("");
const statusMessage = ref("");
const statusColor = ref("");

onMounted(() => {
  // Load saved value when popup opens
  chrome.storage.local.get(["savedValue"], (result) => {
    if (result.savedValue) {
      valueInput.value = result.savedValue;
    }
  });
});

const saveValue = () => {
  chrome.storage.local.set({ savedValue: valueInput.value }, () => {
    statusMessage.value = "Value saved!";
    statusColor.value = "green";

    // Clear status message after 2 seconds
    setTimeout(() => {
      statusMessage.value = "";
    }, 2000);
  });
};
</script>

<template>
  <div class="container">
    <h2>Save Value</h2>
    <input type="text" v-model="valueInput" placeholder="Enter a value" />
    <button @click="saveValue">Save</button>
    <p :style="{ color: statusColor }">{{ statusMessage }}</p>
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
