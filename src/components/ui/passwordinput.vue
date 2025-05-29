<script setup lang="ts">
import Input from "./input.vue";
import { ref } from "vue";
import EyeIcon from "@/components/icons/eye.vue";
import EyeOffIcon from "@/components/icons/eye-off.vue";

const showPassword = ref(false);

const toggleViewPassword = () => {
  showPassword.value = !showPassword.value;
};
</script>

<template>
  <Input :type="showPassword ? 'text' : 'password'">
    <template #icon>
      <EyeIcon class="cursor-pointer w-4 h-4 text-muted-foreground" v-if="showPassword" @click="toggleViewPassword" />
      <EyeOffIcon class="cursor-pointer w-4 h-4 text-muted-foreground" v-else @click="toggleViewPassword" />
    </template>
  </Input>
</template>
