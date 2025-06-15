<script setup lang="ts">
import { onMounted, onUnmounted, ref, watch } from "vue";
import SearchInput from "./SearchInput.vue";

const cursorPosition = ref({ x: 0, y: 0 });
const hoveredElement = ref<HTMLElement | null>(null);
const clickedElement = ref<HTMLElement | null>(null);
const selectedText = ref<string>("");
const scrollPosition = ref({ x: 0, y: 0 });

const props = defineProps<{
  isVisible: boolean;
}>();

const HIGHLIGHT_CLASS = "ghostbar-highlighted-selected-element";

const updateScrollPosition = () => {
  scrollPosition.value = {
    x: window.scrollX,
    y: window.scrollY,
  };
};

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
    // Remove highlight from previous element
    if (clickedElement.value) {
      clickedElement.value.classList.remove(HIGHLIGHT_CLASS);
    }

    selectedText.value = hoveredElement.value.textContent || "";
    clickedElement.value = hoveredElement.value;
    hoveredElement.value = null;

    console.log("selectedText", selectedText.value);
    // Add highlight class to the clicked element
    clickedElement.value.classList.add(HIGHLIGHT_CLASS);

    // Remove mousemove listener to disable hover
    document.removeEventListener("mousemove", handleMouseMove);
  }
};

const handleAddEventListeners = () => {
  document.addEventListener("mousemove", handleMouseMove);
  document.addEventListener("click", handleClick, true);
  window.addEventListener("scroll", updateScrollPosition);
  //   document.addEventListener("scroll", handleScroll, true);
};

const handleRemoveEventListeners = () => {
  document.removeEventListener("mousemove", handleMouseMove);
  document.removeEventListener("click", handleClick, true);
  window.removeEventListener("scroll", updateScrollPosition);
  //   document.removeEventListener("scroll", handleScroll), true;
};

watch(
  () => props.isVisible,
  (newValue) => {
    console.log("newValue from watch function", newValue);
    if (newValue) {
      handleAddEventListeners();
    } else {
      handleRemoveEventListeners();
      if (clickedElement.value) {
        clickedElement.value.classList.remove(HIGHLIGHT_CLASS);
      }
      selectedText.value = "";
      clickedElement.value = null;
      hoveredElement.value = null;
    }
  }
);
</script>

<template>
  <div class="ghostbar-content-selector">
    <div class="ghostbar-selector" :style="{ top: `${cursorPosition.y}px`, left: `${cursorPosition.x}px` }">
      <div class="ghostbar-content-selector-content"></div>
    </div>
    <div
      v-if="hoveredElement"
      class="element-highlight"
      :style="{
        top: hoveredElement?.getBoundingClientRect()?.top + 'px',
        left: hoveredElement?.getBoundingClientRect()?.left + 'px',
        width: hoveredElement?.getBoundingClientRect()?.width + 'px',
        height: hoveredElement?.getBoundingClientRect()?.height + 'px',
      }"
    ></div>

    <SearchInput v-if="selectedText" @executeQuery="() => {}" />
  </div>
</template>
