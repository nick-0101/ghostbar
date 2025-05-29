<script setup lang="ts">
import { ref, watch, onMounted } from "vue";
import Container from "@/components/container.vue";
import Input from "@/components/ui/input.vue";
import Label from "@/components/ui/label.vue";
import Button from "@/components/ui/button.vue";
import PasswordInput from "@/components/ui/passwordinput.vue";
import { useAI } from "@/composable/useAI";

const { openAiKey, handleSetOpenAiKey } = useAI();
const statusMessage = ref("");

const saveValue = async () => {
  await handleSetOpenAiKey(openAiKey.value);
};
</script>

<template>
  <Container class="pt-4">
    <template #default>
      <div class="grid w-full max-w-sm items-center gap-1.5">
        <Label for="api-key">API Key</Label>
        <PasswordInput id="api-key" placeholder="OpenAI API Key" v-model="openAiKey" />
        <Button class="mt-2 cursor-pointer" @click="saveValue">Save</Button>

        {{ statusMessage }}
      </div>
    </template>
  </Container>
</template>
