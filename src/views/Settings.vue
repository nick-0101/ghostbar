<script setup lang="ts">
import { ref, onMounted } from "vue";
import Container from "@/components/container.vue";
import Input from "@/components/ui/input.vue";
import Label from "@/components/ui/label.vue";
import Button from "@/components/ui/button.vue";

const apiKeyInput = ref("");

const saveValue = () => {
  console.log(chrome.storage);
  chrome.storage.local.set({ savedValue: apiKeyInput.value }, () => {
    // statusMessage.value = "Value saved!";
    // statusColor.value = "green";
    // // Clear status message after 2 seconds
    // setTimeout(() => {
    //   statusMessage.value = "";
    // }, 2000);
  });
};

onMounted(() => {
  // Load saved value when popup opens
  console.log(chrome.storage);
  chrome.storage?.local.get(["apiKey"], (result) => {
    console.log(result);
    if (result.apiKey) {
      apiKeyInput.value = result.apiKey;
    }
  });
});
</script>

<template>
  <Container class="pt-4">
    <template #default>
      <div class="grid w-full max-w-sm items-center gap-1.5">
        <Label for="api-key">API Key</Label>
        <Input id="api-key" placeholder="OpenAI API Key" v-model="apiKeyInput" />
        <Button class="mt-2 cursor-pointer" @click="saveValue">Save</Button>
      </div>
    </template>
  </Container>
</template>
