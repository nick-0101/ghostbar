<script setup lang="ts">
import { ref, onMounted, onUnmounted, computed, watch, nextTick } from "vue";
import { XIcon } from "lucide-vue-next";

interface Props {
  streamedResponse: string;
  isStreaming: boolean;
}

const props = defineProps<Props>();
const emit = defineEmits<{
  "update:toggleOutputOverlay": [];
  clear: [];
}>();

const position = ref({ x: 0, y: 0 });
const isDragging = ref(false);
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

function updatePosition() {
  const overlay = document.getElementById("ghostbar-overlay");
  if (overlay) {
    overlay.style.transform = `translate(calc(-50% + ${position.value.x}px), calc(-50% + ${position.value.y}px))`;
  }
}

function handleKeyDown(e: KeyboardEvent) {
  switch (e.key) {
    case "ArrowUp":
      position.value.y -= moveSpeed;
      break;
    case "ArrowDown":
      position.value.y += moveSpeed;
      break;
    case "ArrowLeft":
      position.value.x -= moveSpeed;
      break;
    case "ArrowRight":
      position.value.x += moveSpeed;
      break;
    case "Escape":
      toggleOutputOverlay();
      return;
  }

  updatePosition();
}

function handleMouseDown(e: MouseEvent) {
  const target = e.target as HTMLElement;
  if (target.id === "ghostbar-overlay" || target.closest(".ghostbar-header")) {
    isDragging.value = true;
    const overlay = document.getElementById("ghostbar-overlay");
    if (overlay) {
      const rect = overlay.getBoundingClientRect();
      dragOffset.value = {
        x: e.clientX - rect.left,
        y: e.clientY - rect.top,
      };
      overlay.style.transition = "none";
    }
  }
}

function handleMouseMove(e: MouseEvent) {
  if (!isDragging.value) return;

  const overlay = document.getElementById("ghostbar-overlay");
  if (overlay) {
    const x = e.clientX - dragOffset.value.x;
    const y = e.clientY - dragOffset.value.y;

    position.value = {
      x: x - window.innerWidth / 2 + overlay.offsetWidth / 2,
      y: y - window.innerHeight / 2 + overlay.offsetHeight / 2,
    };

    updatePosition();
  }
}

function handleMouseUp() {
  if (isDragging.value) {
    isDragging.value = false;
    const overlay = document.getElementById("ghostbar-overlay");
    if (overlay) {
      overlay.style.transition = "all 0.2s ease-in-out";
    }
  }
}

function toggleOutputOverlay() {
  emit("update:toggleOutputOverlay");
}

onMounted(() => {
  document.addEventListener("keydown", handleKeyDown);
  document.addEventListener("mousemove", handleMouseMove);
  document.addEventListener("mouseup", handleMouseUp);
});

onUnmounted(() => {
  document.removeEventListener("keydown", handleKeyDown);
  document.removeEventListener("mousemove", handleMouseMove);
  document.removeEventListener("mouseup", handleMouseUp);
});
</script>

<template>
  <div id="ghostbar-overlay" class="ghostbar-overlay font-inter" @mousedown="handleMouseDown">
    <div class="ghostbar-overlay-content">
      <div class="ghostbar-header">
        <h2 class="ghostbar-title">Ghost Bar</h2>
        <button class="ghostbar-close" type="submit" @click="toggleOutputOverlay">
          <XIcon class="w-4 h-4" />
        </button>
      </div>

      <div class="ghostbar-body">
        <!-- Streaming Indicator -->
        <div v-if="isStreaming" class="streaming-indicator">
          <div class="typing-indicator">
            <span></span>
            <span></span>
            <span></span>
          </div>
          <span class="streaming-text">AI is responding...</span>
        </div>

        <!-- Response Content -->
        <div v-if="streamedResponse" class="response-content">
          <div class="response-header">
            <div class="response-meta">
              <span class="char-count">{{ streamedResponse.length }} characters</span>
              <span v-if="isStreaming" class="live-indicator">● Live</span>
            </div>
          </div>

          <div class="response-text" ref="responseText">
            <pre v-if="isCodeBlock">{{ streamedResponse }}</pre>
            <div v-else v-html="formattedResponse"></div>
          </div>

          <div v-if="!isStreaming && streamedResponse" class="response-actions">
            <button @click="copyToClipboard" class="action-btn"><span>📋</span> Copy</button>
            <button @click="clearResponse" class="action-btn"><span>🗑️</span> Clear</button>
          </div>
        </div>

        <!-- Default content when no response -->
        <div v-if="!streamedResponse && !isStreaming" class="default-content">
          <p class="text-2xl">Drag to move or use arrow keys.</p>
          <p class="text-sm">Press Escape to close.</p>
        </div>
      </div>
    </div>
  </div>
</template>

<style scoped>
.ghostbar-selector {
  position: fixed;
  transform: translate(-50%, -50%);
  background-color: rgba(255, 255, 255, 0.4);
}

/* Ghostbar AI Output */
.ghostbar-overlay {
  position: fixed;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
  background-color: rgba(255, 255, 255, 0.4);
  width: 500px;
  min-height: 400px;
  max-height: 600px;
  border-radius: 12px;
  box-shadow: 0 8px 32px rgba(0, 0, 0, 0.1);
  z-index: 9999;
  transition: all 0.2s ease-in-out;
  backdrop-filter: blur(12px) saturate(180%);
  -webkit-backdrop-filter: blur(12px) saturate(180%);
  border: 1px solid rgba(255, 255, 255, 0.3);
  cursor: move;
  background-image: linear-gradient(135deg, rgba(255, 255, 255, 0.4), rgba(255, 255, 255, 0.2));
}

.ghostbar-overlay-content {
  padding: 24px;
  color: #333;
  font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Oxygen, Ubuntu, Cantarell, sans-serif;
  text-shadow: 0 1px 2px rgba(0, 0, 0, 0.1);
  height: 100%;
  display: flex;
  flex-direction: column;
}

.ghostbar-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding-bottom: 12px;
  border-bottom: 1px solid rgba(0, 0, 0, 0.1);
  user-select: none;
  margin-bottom: 16px;
  flex-shrink: 0;
}

.ghostbar-title {
  font-size: 20px;
  font-weight: 600;
  color: #1a1a1a;
  margin-bottom: 0px;
}

.ghostbar-close {
  background: none;
  border: none;
  cursor: pointer;
  padding: 8px;
  border-radius: 6px;
  transition: background-color 0.2s;
}

.ghostbar-close:hover {
  background-color: rgba(0, 0, 0, 0.05);
}

.ghostbar-body {
  flex: 1;
  display: flex;
  flex-direction: column;
  overflow: hidden;
}

.default-content {
  user-select: none;
  text-align: center;
  margin-top: 40px;
}

/* Streaming Styles */
.streaming-indicator {
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 12px 16px;
  background: rgba(255, 255, 255, 0.6);
  border-radius: 8px;
  margin-bottom: 16px;
}

.typing-indicator {
  display: flex;
  gap: 4px;
}

.typing-indicator span {
  width: 8px;
  height: 8px;
  border-radius: 50%;
  background: #007bff;
  animation: typing 1.4s infinite ease-in-out;
}

.typing-indicator span:nth-child(1) {
  animation-delay: -0.32s;
}
.typing-indicator span:nth-child(2) {
  animation-delay: -0.16s;
}

@keyframes typing {
  0%,
  80%,
  100% {
    transform: scale(0.8);
    opacity: 0.5;
  }
  40% {
    transform: scale(1);
    opacity: 1;
  }
}

.streaming-text {
  color: #6c757d;
  font-size: 14px;
  font-weight: 500;
}

.response-content {
  flex: 1;
  display: flex;
  flex-direction: column;
  background: rgba(255, 255, 255, 0.7);
  border-radius: 8px;
  overflow: hidden;
}

.response-header {
  display: flex;
  justify-content: flex-end;
  align-items: center;
  padding: 12px 16px;
  background: rgba(248, 249, 250, 0.8);
  border-bottom: 1px solid rgba(233, 236, 239, 0.8);
}

.response-meta {
  display: flex;
  align-items: center;
  gap: 12px;
  font-size: 12px;
}

.char-count {
  color: #6c757d;
}

.live-indicator {
  color: #28a745;
  font-weight: 500;
  animation: pulse 2s infinite;
}

@keyframes pulse {
  0%,
  100% {
    opacity: 1;
  }
  50% {
    opacity: 0.5;
  }
}

.response-text {
  flex: 1;
  overflow-y: auto;
  padding: 16px;
  line-height: 1.6;
  color: #212529;
}

.response-text pre {
  background: rgba(248, 249, 250, 0.8);
  padding: 16px;
  border-radius: 8px;
  overflow-x: auto;
  font-family: "Monaco", "Menlo", "Ubuntu Mono", monospace;
  font-size: 14px;
  line-height: 1.4;
  border: 1px solid rgba(233, 236, 239, 0.8);
}

.response-text code {
  background: rgba(241, 243, 244, 0.8);
  padding: 2px 6px;
  border-radius: 4px;
  font-family: "Monaco", "Menlo", "Ubuntu Mono", monospace;
  font-size: 0.9em;
}

.response-actions {
  display: flex;
  gap: 8px;
  padding: 12px 16px;
  background: rgba(248, 249, 250, 0.8);
  border-top: 1px solid rgba(233, 236, 239, 0.8);
}

.action-btn {
  display: flex;
  align-items: center;
  gap: 6px;
  padding: 8px 12px;
  background: rgba(255, 255, 255, 0.8);
  border: 1px solid rgba(222, 226, 230, 0.8);
  border-radius: 6px;
  font-size: 14px;
  color: #495057;
  cursor: pointer;
  transition: all 0.2s ease;
}

.action-btn:hover {
  background: rgba(248, 249, 250, 0.8);
  border-color: rgba(173, 181, 189, 0.8);
}

.action-btn:active {
  transform: translateY(1px);
}

/* Scrollbar styling */
.response-text::-webkit-scrollbar {
  width: 6px;
}

.response-text::-webkit-scrollbar-track {
  background: rgba(241, 241, 241, 0.5);
}

.response-text::-webkit-scrollbar-thumb {
  background: rgba(193, 193, 193, 0.8);
  border-radius: 3px;
}

.response-text::-webkit-scrollbar-thumb:hover {
  background: rgba(168, 168, 168, 0.8);
}
</style>
