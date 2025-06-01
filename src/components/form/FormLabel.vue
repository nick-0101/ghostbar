<script lang="ts" setup>
import { cn } from "@/lib/utils";
import Label from "@/components/ui/label.vue";
import { useFormField } from "@/composable/useFormField";
import type { LabelProps } from "reka-ui";
import type { HTMLAttributes } from "vue";

const props = defineProps<LabelProps & { class?: HTMLAttributes["class"] }>();

const { error, formItemId } = useFormField();
</script>

<template>
  <Label :class="cn(error && 'text-destructive', props.class)" :for="formItemId">
    <slot />
  </Label>
</template>
