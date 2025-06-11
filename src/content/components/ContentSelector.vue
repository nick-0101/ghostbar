<script setup lang="ts">
import { onMounted, onUnmounted, ref } from "vue";

const cursorPosition = ref({ x: 0, y: 0 });

function handleMouseMove(event: MouseEvent) {
  cursorPosition.value = { x: event.clientX, y: event.clientY };
}

onMounted(() => {
  document.addEventListener("mousemove", handleMouseMove);
});

onUnmounted(() => {
  document.removeEventListener("mousemove", handleMouseMove);
});
</script>

<template>
  <div class="ghostbar-selector" :style="{ top: `${cursorPosition.y}px`, left: `${cursorPosition.x}px` }">
    <div class="ghostbar-content-selector-content">
      <h1>Content Selector</h1>
      <p>Click to select content</p>
    </div>
  </div>
</template>
