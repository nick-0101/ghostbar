<script setup lang="ts">
import { ref, onMounted, onUnmounted } from "vue";
import { XIcon } from "lucide-vue-next";

const isVisible = ref(false);
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
  if (!isVisible.value) return;

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
      toggleOverlay();
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

function toggleOverlay() {
  isVisible.value = !isVisible.value;
}

// Listen for messages from the extension
chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
  if (message.action === "toggleOverlay") {
    toggleOverlay();
  }
  return true;
});

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
  <div id="ghostbar-overlay" :style="{ display: isVisible ? 'block' : 'none' }" @mousedown="handleMouseDown" class="ghostbar-overlay font-inter">
    <div class="ghostbar-overlay-content">
      <div class="ghostbar-header">
        <h2 class="ghostbar-title">Ghost Bar</h2>
        <button class="ghostbar-close" type="submit" @click="toggleOverlay">
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
