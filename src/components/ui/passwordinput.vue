<script setup lang="ts">
import Input from "./input.vue";
import EyeIcon from "@/components/icons/eye.vue";
import EyeOffIcon from "@/components/icons/eye-off.vue";

const props = defineProps<{
  modelValue?: string | number;
  showPassword?: boolean;
}>();

const emit = defineEmits<{
  (e: "update:modelValue", value: string | number): void;
  (e: "update:showPassword", value: boolean): void;
}>();

const toggleViewPassword = () => {
  emit("update:showPassword", !props.showPassword);
};
</script>

<template>
  <Input :type="showPassword ? 'text' : 'password'" :modelValue="modelValue" @update:modelValue="emit('update:modelValue', $event)">
    <template #icon>
      <EyeIcon class="cursor-pointer w-4 h-4 text-muted-foreground" v-if="showPassword" @click="toggleViewPassword" />
      <EyeOffIcon class="cursor-pointer w-4 h-4 text-muted-foreground" v-else @click="toggleViewPassword" />
    </template>
  </Input>
</template>
