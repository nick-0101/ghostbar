<script setup lang="ts">
import { onMounted, onUnmounted, ref, watch } from "vue";

const cursorPosition = ref({ x: 0, y: 0 });
const hoveredElement = ref<HTMLElement | null>(null);
const selectedText = ref<string>("");

const props = defineProps<{
  isVisible: boolean;
}>();

const emit = defineEmits<{
  "update:toggleOutputOverlay": [];
}>();

const handleMouseMove = (event: MouseEvent) => {
  cursorPosition.value = { x: event.clientX, y: event.clientY };

  // Get element under cursor
  const element = document.elementFromPoint(event.clientX, event.clientY) as HTMLElement;
  if (element && element !== hoveredElement.value) {
    hoveredElement.value = element;
  }
};

const handleClick = (event: MouseEvent) => {
  event.preventDefault();
  event.stopPropagation();

  if (hoveredElement.value) {
    selectedText.value = hoveredElement.value.textContent || "";
    // You can emit this selected text to parent component or handle it as needed
    // chrome.runtime.sendMessage({ action: "selectedContent", type: "text", text: selectedText.value });

    emit("update:toggleOutputOverlay");
    handleRemoveEventListeners();
  }
};

const handleScroll = () => {
  handleRemoveEventListeners();
  emit("update:toggleOutputOverlay");
};

const handleAddEventListeners = () => {
  document.addEventListener("mousemove", handleMouseMove);
  document.addEventListener("click", handleClick, true);
  document.addEventListener("scroll", handleScroll, true);
};

const handleRemoveEventListeners = () => {
  document.removeEventListener("mousemove", handleMouseMove);
  document.removeEventListener("click", handleClick, true);
  document.removeEventListener("scroll", handleScroll), true;
};

watch(
  () => props.isVisible,
  (newValue) => {
    if (newValue) {
      handleAddEventListeners();
    } else {
      handleRemoveEventListeners();
    }
  }
);

onMounted(() => {
  console.log("mounted");
  handleAddEventListeners();
});

onUnmounted(() => {
  handleRemoveEventListeners();
});
</script>

<template>
  <div class="ghostbar-selector" :style="{ top: `${cursorPosition.y}px`, left: `${cursorPosition.x}px` }">
    <div class="ghostbar-content-selector-content">
      <!-- <div class="selector-icon">👆</div>
      <p>Click to select text</p> -->
    </div>
  </div>
  <div
    v-if="hoveredElement"
    class="element-highlight"
    :style="{
      top: hoveredElement.getBoundingClientRect().top + 'px',
      left: hoveredElement.getBoundingClientRect().left + 'px',
      width: hoveredElement.getBoundingClientRect().width + 'px',
      height: hoveredElement.getBoundingClientRect().height + 'px',
    }"
  ></div>
</template>

<style scoped>
.ghostbar-selector {
  position: fixed;
  transform: translate(-50%, -50%);
  pointer-events: none;
  z-index: 999999;
}

.ghost-cursor {
  position: relative;
  width: 24px;
  height: 24px;
}

.ghost-body {
  position: absolute;
  width: 24px;
  height: 24px;
  background: rgba(255, 255, 255, 0.9);
  border-radius: 50% 50% 50% 50%;
  box-shadow: 0 0 10px rgba(255, 255, 255, 0.5);
  animation: float 2s ease-in-out infinite;
}

.ghost-tail {
  position: absolute;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
  width: 40px;
  height: 40px;
  background: rgba(111, 168, 220, 0.3);
  border-radius: 50%;
  filter: blur(8px);
  animation: pulse 2s ease-in-out infinite;
}

.element-highlight {
  position: fixed;
  /* background: rgba(255, 255, 255, 0.1);
  border: 2px solid rgba(255, 255, 255, 0.3); */

  background: rgba(111, 168, 220, 0.2);
  border: 2px solid rgb(111, 168, 220);

  pointer-events: none;
  z-index: 999998;
  box-sizing: border-box;
  animation: glow 2s ease-in-out infinite;
}

@keyframes float {
  0%,
  100% {
    transform: translateY(0);
  }
  50% {
    transform: translateY(-5px);
  }
}

@keyframes pulse {
  0%,
  100% {
    transform: translate(-50%, -50%) scale(1);
    opacity: 0.3;
  }
  50% {
    transform: translate(-50%, -50%) scale(1.2);
    opacity: 0.5;
  }
}

@keyframes glow {
  0%,
  100% {
    box-shadow: 0 0 5px rgba(111, 168, 220, 0.2);
  }
  50% {
    box-shadow: 0 0 15px rgba(111, 168, 220, 0.4);
  }
}
</style>
