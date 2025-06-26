<script setup lang="ts">
import { ref, onMounted, onUnmounted, computed, watch, nextTick } from "vue";
import { XIcon, SquarePenIcon } from "lucide-vue-next";
import InlineInput from "./InlineInput.vue";
import VueMarkdown from "vue-markdown-render";
import MarkdownItHighlightjs from "markdown-it-highlightjs";

interface Props {
  streamedResponse: string;
  isStreaming: boolean;
}

const props = defineProps<Props>();
const emit = defineEmits<{
  "update:toggleOutputOverlay": [];
}>();

const vueMarkdownPlugins = [MarkdownItHighlightjs];
const isDragging = ref(false);
// const position = ref({ x: 0, y: -100 });
const cursorPosition = ref({ x: window.innerWidth / 2, y: 100 });
const dragOffset = ref({ x: 0, y: 0 });
const moveSpeed = 10;
const contentContainer = ref<HTMLElement>();

// Auto-scroll to bottom as new content arrives
watch(
  () => props.streamedResponse,
  async () => {
    await nextTick();
    if (contentContainer.value) {
      contentContainer.value.scrollTop = contentContainer.value.scrollHeight;
    }
  }
);

// Copy response to clipboard
// const copyToClipboard = async () => {
//   try {
//     await navigator.clipboard.writeText(props.streamedResponse);
//     console.log("Response copied to clipboard");
//   } catch (err) {
//     console.error("Failed to copy to clipboard:", err);
//   }
// };

// // Clear the response
// const clearResponse = () => {
//   emit("clear");
// };

// function updatePosition() {
//   const overlay = document.getElementById("ghostbar-overlay");
//   if (overlay) {
//     overlay.style.transform = `translate(calc(-50% + ${position.value.x}px), calc(-50% + ${position.value.y}px))`;
//   }
// }

function handleKeyDown(e: KeyboardEvent) {
  switch (e.key) {
    // case "ArrowUp":
    //   position.value.y -= moveSpeed;
    //   break;
    // case "ArrowDown":
    //   position.value.y += moveSpeed;
    //   break;
    // case "ArrowLeft":
    //   position.value.x -= moveSpeed;
    //   break;
    // case "ArrowRight":
    //   position.value.x += moveSpeed;
    //   break;
    case "Escape":
      toggleOutputOverlay();
      return;
  }

  // updatePosition();
}

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

function handleMouseUp() {
  isDragging.value = false;

  // if (isDragging.value) {
  //   isDragging.value = false;
  //   const overlay = document.getElementById("ghostbar-overlay");
  //   if (overlay) {
  //     overlay.style.transition = "all 0.2s ease-in-out";
  //   }
  // }
}

function toggleOutputOverlay() {
  emit("update:toggleOutputOverlay");
}

onMounted(() => {
  document.addEventListener("keydown", handleKeyDown);
  window.addEventListener("mousemove", handleMouseMove);
  window.addEventListener("mouseup", handleMouseUp);
});

onUnmounted(() => {
  document.removeEventListener("keydown", handleKeyDown);
  window.removeEventListener("mousemove", handleMouseMove);
  window.removeEventListener("mouseup", handleMouseUp);
});
</script>

<template>
  <div
    class="ghostbar-overlay"
    :style="{
      left: cursorPosition.x + 'px',
      top: cursorPosition.y + 'px',
      transform: 'translateX(-50%)',
    }"
    @mousedown="handleMouseDown"
  >
    <div class="ghostbar-overlay-inner">
      <div class="ghostbar-overlay-content">
        <div class="ghostbar-header">
          <button class="ghostbar-close Button" data-variant="ghost" @click="toggleOutputOverlay">
            <XIcon :color="'var(--muted-foreground)'" :size="18" />
          </button>

          <button class="ghostbar-new-chat Button" data-variant="ghost" @click="toggleOutputOverlay">
            <SquarePenIcon :color="'var(--muted-foreground)'" :size="18" />
          </button>
        </div>

        <span v-if="isStreaming && !streamedResponse" class="streaming-indicator"></span>
        <div class="ghostbar-body">
          <div v-if="streamedResponse" id="stream-response" class="response-text" ref="contentContainer">
            <vue-markdown :source="streamedResponse" :plugins="vueMarkdownPlugins" />
          </div>
        </div>
      </div>
      <div class="response-actions">
        <InlineInput selected-text="selectedText" />
      </div>
    </div>
  </div>
</template>
