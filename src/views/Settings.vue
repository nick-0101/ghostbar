<script setup lang="ts">
import { ref, watch, onMounted } from 'vue'
import Container from '@/components/container.vue'
import Button from '@/components/ui/button.vue'
import PasswordInput from '@/components/ui/passwordinput.vue'
import { useAI } from '@/composable/useAI'
import { toTypedSchema } from '@vee-validate/zod'
import * as z from 'zod'
import FormControl from '@/components/ui/form/FormControl.vue'
import FormDescription from '@/components/ui/form/FormDescription.vue'
import FormItem from '@/components/ui/form/FormItem.vue'
import FormLabel from '@/components/ui/form/FormLabel.vue'
import FormMessage from '@/components/ui/form/FormMessage.vue'
import { Field as FormField } from 'vee-validate'
import { useForm } from 'vee-validate'
import { useAIStore } from '@/stores/ai'

const aiStore = useAIStore()
const { handleSetOpenAiKey } = useAI()

const statusMessage = ref('')
const showPassword = ref(false)

const formSchema = toTypedSchema(
  z.object({
    apiKey: z.string().min(1, 'API key is required')
  })
)

const form = useForm({
  validationSchema: formSchema,
  initialValues: {
    apiKey: aiStore.openAiKey
  }
})

const onSubmit = form.handleSubmit(async values => {
  await handleSetOpenAiKey(values.apiKey)
  statusMessage.value = 'API key saved successfully!'

  await chrome.runtime.sendMessage({
    action: 'logAnalytics',
    name: 'api_key_saved'
  })

  setTimeout(() => {
    statusMessage.value = ''
  }, 2000)
})

watch(
  () => aiStore.openAiKey,
  newKey => {
    form.setFieldValue('apiKey', newKey)
  }
)
</script>

<template>
  <Container class="pt-4">
    <template #default>
      <form @submit="onSubmit" class="grid w-full max-w-sm items-center gap-1.5">
        <FormField v-slot="{ field }" name="apiKey">
          <FormItem>
            <FormLabel>API Key</FormLabel>
            <FormControl>
              <PasswordInput
                v-model="field.value"
                v-model:showPassword="showPassword"
                placeholder="OpenAI API Key"
                @blur="field.onBlur"
                @input="field.onChange"
              />
            </FormControl>
            <!-- <FormDescription>Enter your OpenAI API key to enable AI features.</FormDescription> -->
            <FormMessage />
            <p v-if="statusMessage" class="text-sm font-medium text-green-500">
              {{ statusMessage }}
            </p>
          </FormItem>
        </FormField>
        <Button type="submit"> Save </Button>
      </form>
    </template>
  </Container>
</template>
