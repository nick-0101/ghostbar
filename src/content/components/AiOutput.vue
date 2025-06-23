<script setup lang="ts">
import { ref, onMounted, onUnmounted, computed, watch, nextTick } from "vue";
import { XIcon } from "lucide-vue-next";
import InlineInput from "./InlineInput.vue";

interface Props {
  streamedResponse: string;
  isStreaming: boolean;
}

const props = defineProps<Props>();
const emit = defineEmits<{
  "update:toggleOutputOverlay": [];
  clear: [];
}>();

const isDragging = ref(false);
// const position = ref({ x: 0, y: -100 });
const cursorPosition = ref({ x: window.innerWidth / 2, y: 100 });
const dragOffset = ref({ x: 0, y: 0 });
const moveSpeed = 10;
const responseText = ref<HTMLElement>();

// Check if the response looks like code
const isCodeBlock = computed(() => {
  const response = props.streamedResponse.trim();
  return response.startsWith("```") || response.includes("function") || response.includes("const ") || response.includes("let ") || response.includes("var ") || response.includes("import ") || response.includes("export ");
});

// Format the response with basic markdown-like formatting
const formattedResponse = computed(() => {
  if (!props.streamedResponse) return "";

  return props.streamedResponse
    .replace(/\*\*(.*?)\*\*/g, "<strong>$1</strong>")
    .replace(/\*(.*?)\*/g, "<em>$1</em>")
    .replace(/`(.*?)`/g, "<code>$1</code>")
    .replace(/\n/g, "<br>");
});

// Auto-scroll to bottom as new content arrives
watch(
  () => props.streamedResponse,
  async () => {
    await nextTick();
    if (responseText.value) {
      responseText.value.scrollTop = responseText.value.scrollHeight;
    }
  }
);

// Copy response to clipboard
const copyToClipboard = async () => {
  try {
    await navigator.clipboard.writeText(props.streamedResponse);
    console.log("Response copied to clipboard");
  } catch (err) {
    console.error("Failed to copy to clipboard:", err);
  }
};

// Clear the response
const clearResponse = () => {
  emit("clear");
};

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
          <button class="ghostbar-close" type="submit" @click="toggleOutputOverlay">
            <XIcon style="width: 16px; height: 16px" />
          </button>
        </div>

        <div class="ghostbar-body">
          <div v-if="isStreaming" class="streaming-indicator">
            <div class="typing-indicator">
              <span></span>
              <span></span>
              <span></span>
            </div>
            <span class="streaming-text">AI is responding...</span>
          </div>

          <div v-if="streamedResponse" class="response-content">
            <div v-if="isStreaming" class="response-header">
              <span class="streaming-indicator">●</span>
            </div>

            <div class="response-text" ref="responseText">
              <pre v-if="isCodeBlock">{{ streamedResponse }}</pre>
              <!-- v-html="formattedResponse" -->
              <div v-else>
                Lorem ipsum dolor sit amet, consectetur adipiscing elit. Vestibulum pellentesque purus a dui cursus, eget tempor arcu eleifend. Ut ligula eros, semper at suscipit nec, interdum laoreet leo. Pellentesque mattis posuere nibh, sed lacinia odio fringilla nec. Sed molestie ut metus at rutrum. In hac habitasse platea dictumst. Nam tellus nunc, fermentum ac velit vitae, pretium maximus dolor. Aliquam in lobortis purus, et interdum velit. In consectetur, erat nec faucibus congue, nunc urna porta tortor, non aliquam neque nulla nec tellus. Aenean elementum mi eu efficitur vehicula.
                Curabitur porta, purus sed pretium vehicula, nisl nunc luctus lorem, fermentum vehicula augue ante quis elit. Sed blandit nunc eu augue aliquet, sit amet rutrum arcu bibendum. Fusce at mauris arcu. Maecenas hendrerit facilisis diam, eu blandit arcu vestibulum id. Praesent quis diam mollis, luctus purus ut, sodales nulla. Curabitur in enim pharetra, pretium diam ac, gravida sem. In non gravida nunc. Vestibulum ullamcorper ultrices dapibus. Donec eget nisl turpis. Ut sagittis aliquam cursus. Morbi sit amet lacus vitae ante bibendum venenatis. Nulla a turpis sit amet nunc
                facilisis dignissim vel quis ipsum. In elementum, erat et condimentum ultricies, augue nulla varius massa, in viverra odio nibh sed erat. In tincidunt nunc ut nisi scelerisque, in tempus leo sagittis. In nec varius quam. Pellentesque convallis, purus nec porta accumsan, nulla turpis suscipit metus, ut dapibus diam est id lectus. Nam sit amet augue in sapien vulputate pellentesque et ut dui. Suspendisse elementum malesuada suscipit. Proin felis lacus, egestas quis mi egestas, sodales lacinia diam. Nam faucibus placerat sem, facilisis sagittis diam vehicula id. Integer gravida ex
                sit amet enim porttitor, eget dignissim sem blandit. Nullam vitae condimentum nibh, ac tempus sapien.
              </div>
            </div>

            <div v-if="!isStreaming && streamedResponse" class="response-actions">
              <InlineInput selected-text="selectedText" />
            </div>
          </div>

          <div v-if="!streamedResponse && !isStreaming" class="default-content">
            <p class="text-2xl">Drag to move or use arrow keys.</p>
            <p class="text-sm">Press Escape to close.</p>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>
