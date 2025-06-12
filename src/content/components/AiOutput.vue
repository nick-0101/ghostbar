<script setup lang="ts">
import { ref, onMounted, onUnmounted } from "vue";
import { XIcon } from "lucide-vue-next";

const emit = defineEmits<{
  "update:toggleOutputOverlay": [];
}>();

const position = ref({ x: 0, y: 0 });
const isDragging = ref(false);
const dragOffset = ref({ x: 0, y: 0 });
const moveSpeed = 10;

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
        <p class="text-2xl">Drag to move or use arrow keys.</p>
        <p class="text-sm">Press Escape to close.</p>
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
  width: 400px;
  min-height: 300px;
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
}

.ghostbar-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding-bottom: 12px;
  border-bottom: 1px solid rgba(0, 0, 0, 0.1);
  user-select: none;
  margin-bottom: 0px;
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
  user-select: none;
}
</style>
