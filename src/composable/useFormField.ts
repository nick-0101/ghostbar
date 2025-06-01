// src/components/form/useFormField.ts
import { computed, inject } from "vue";
import { useField } from "vee-validate";
import { FORM_ITEM_INJECTION_KEY } from "@/components/ui/form";

export const useFormField = () => {
  const fieldContext = inject(FORM_ITEM_INJECTION_KEY, "");

  const { errorMessage, value, name } = useField(fieldContext);

  const formItemId = computed(() => `${fieldContext}-form-item`);
  const formDescriptionId = computed(() => `${fieldContext}-form-item-description`);
  const formMessageId = computed(() => `${fieldContext}-form-item-message`);

  return {
    name,
    formItemId,
    formDescriptionId,
    value,
    formMessageId: `${fieldContext}-form-message`,
    error: errorMessage,
  };
};
