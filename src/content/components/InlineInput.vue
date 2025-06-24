<script setup lang="ts">
import { computed, onMounted, onUnmounted, ref } from "vue";
import { useUserQueriesStore } from "@/stores/queries";
import { storeToRefs } from "pinia";
import { usePortStore } from "@/stores/portStore";

const cursorPosition = ref({ x: window.innerWidth / 2, y: window.innerHeight - 100 });
const isDragging = ref(false);
const dragOffset = ref({ x: 0, y: 0 });
const userQueriesStore = useUserQueriesStore();
const { queries, currentQuery } = storeToRefs(userQueriesStore);
const { sendMessage } = usePortStore();

const props = defineProps<{
  selectedText: string;
}>();

const handleExecuteQuery = () => {
  sendMessage({
    action: "executeQuery",
    selectedText: props.selectedText,
    prompt: currentQuery.value,
  });
};

const handleMouseDown = (event: MouseEvent) => {
  isDragging.value = true;
  dragOffset.value = {
    x: event.clientX - cursorPosition.value.x,
    y: event.clientY - cursorPosition.value.y,
  };
};

const handleMouseMove = (event: MouseEvent) => {
  if (isDragging.value) {
    cursorPosition.value = {
      x: event.clientX - dragOffset.value.x,
      y: event.clientY - dragOffset.value.y,
    };
  }
};

const handleMouseUp = () => {
  isDragging.value = false;
};

onMounted(() => {
  window.addEventListener("mousemove", handleMouseMove);
  window.addEventListener("mouseup", handleMouseUp);
});

onUnmounted(() => {
  window.removeEventListener("mousemove", handleMouseMove);
  window.removeEventListener("mouseup", handleMouseUp);
});
</script>

<template>
  <div class="ghostbar-inline-input-container" @mousedown="handleMouseDown">
    <div class="ghostbar-inline-input-container-inner Card">
      <textarea id="ghostbar-inline-input-textarea" class="Textarea" type="text" placeholder="Ask anything" v-model="currentQuery" />
      <button class="Button ghostbar-inline-input-search-button" variant="icon" @click.stop="handleExecuteQuery">
        <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
          <path d="m5 12 7-7 7 7" />
          <path d="M12 19V5" />
        </svg>
      </button>
    </div>
  </div>
</template>
