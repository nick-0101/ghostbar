<script setup lang="ts">
import { ref, watch, onMounted } from "vue";
import Container from "@/components/container.vue";
import Input from "@/components/ui/input.vue";
import Label from "@/components/ui/label.vue";
import Button from "@/components/ui/button.vue";
import PasswordInput from "@/components/ui/passwordinput.vue";
import { useAI } from "@/composable/useAI";
import { toTypedSchema } from "@vee-validate/zod";
import * as z from "zod";
import FormControl from "@/components/ui/form/FormControl.vue";
import FormDescription from "@/components/ui/form/FormDescription.vue";
import FormItem from "@/components/ui/form/FormItem.vue";
import FormLabel from "@/components/ui/form/FormLabel.vue";
import FormMessage from "@/components/ui/form/FormMessage.vue";
import { Form, Field as FormField } from "vee-validate";
import { useForm } from "vee-validate";

const { openAiKey, handleSetOpenAiKey } = useAI();
const statusMessage = ref("");

const formSchema = toTypedSchema(
  z.object({
    apiKey: z.string().min(1, "API key is required").max(3, "Too long"),
  })
);

const form = useForm({
  validationSchema: formSchema,
  initialValues: {
    apiKey: openAiKey.value,
  },
});

const onSubmit = form.handleSubmit(async (values) => {
  console.log(values);
  // await handleSetOpenAiKey(values.apiKey);
  // statusMessage.value = "API key saved successfully!";
});

const saveValue = async () => {
  await handleSetOpenAiKey(openAiKey.value);
};
</script>

<template>
  <Container class="pt-4">
    <template #default>
      <form @submit="onSubmit" class="grid w-full max-w-sm items-center gap-1.5">
        <!-- <Label for="api-key">API Key</Label>
        <PasswordInput id="api-key" placeholder="OpenAI API Key" v-model="openAiKey" />
        <Button class="mt-2 cursor-pointer" @click="saveValue">Save</Button>

        {{ statusMessage }} -->

        <FormField v-slot="{ componentField }" name="apiKey">
          <FormItem>
            <FormLabel>API Key</FormLabel>
            <FormControl>
              <PasswordInput type="text" placeholder="OpenAI API Key" v-bind="componentField" />
            </FormControl>
            <FormDescription>Enter your OpenAI API key to enable AI features.</FormDescription>
            <FormMessage />
          </FormItem>
        </FormField>
        <Button type="submit"> Save </Button>
      </form>
    </template>
  </Container>
</template>
