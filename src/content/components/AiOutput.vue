<script setup lang="ts">
import { ref, onMounted, onUnmounted, computed, watch, nextTick } from "vue";
import { XIcon } from "lucide-vue-next";
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
  clear: [];
}>();

const vueMarkdownPlugins = [MarkdownItHighlightjs];
const isDragging = ref(false);
// const position = ref({ x: 0, y: -100 });
const cursorPosition = ref({ x: window.innerWidth / 2, y: 100 });
const dragOffset = ref({ x: 0, y: 0 });
const moveSpeed = 10;
const contentContainer = ref<HTMLElement>();

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

const testOutput = ref(`
Sure! Let's break it down:

### 1. **What is Shadow DOM?**

**Shadow DOM** is a web standard that allows you to encapsulate part of your DOM and its styles within a 'shadow tree'. This makes a **shadow boundary**—styles and markup inside cannot be accidentally affected by the styles outside (and vice versa), ensuring stronger encapsulation for reusable components.

#### Example

\`\`\`js
class MyComponent extends HTMLElement {
  constructor() {
    super();
    this.attachShadow({ mode: 'open' }); // Attach shadow DOM
  }
}
customElements.define('my-component', MyComponent);
\`\`\`
`);
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
          <button class="ghostbar-close Button" data-variant="ghost" type="submit" @click="toggleOutputOverlay">
            <XIcon :color="'var(--muted-foreground)'" :size="18" />
          </button>
        </div>

        <span v-if="isStreaming" class="streaming-indicator"></span>
        <div class="ghostbar-body">
          <div v-if="streamedResponse" class="response-content">
            <div class="response-text" ref="contentContainer">
              <pre v-if="isCodeBlock">{{ streamedResponse }}</pre>
              <!-- <div v-else v-html="formattedResponse"></div> -->
              <div v-else>
                <pre>
                  <vue-markdown :source="testOutput" :plugins="vueMarkdownPlugins" />
                </pre>
                <!-- 
                <pre>
                  Sure! Let's break it down:

### 1. **What is Shadow DOM?**

**Shadow DOM** is a web standard that allows you to encapsulate part of your DOM and its styles within a "shadow tree". This makes a **shadow boundary**—styles and markup inside cannot be accidentally affected by the styles outside (and vice versa), ensuring stronger encapsulation for reusable components.

#### Example
```html
&lt;my-component&gt;&lt;/my-component&gt;
```
Inside your `&lt;my-component&gt;`, you might attach a shadow root:

```js
class MyComponent extends HTMLElement {
  constructor() {
    super();
    this.attachShadow({ mode: 'open' }); // Attach shadow DOM
  }
}
customElements.define('my-component', MyComponent);
```

Then your component's DOM is separated from the rest of the page's DOM.

---

### 2. **Why Shadow DOM?**

- **Style encapsulation**: Styles inside the shadow DOM are not affected by global styles.
- **DOM encapsulation**: DOM inside the shadow boundary cannot be accessed directly by outside scripts and vice versa (unless you use `mode: 'open'` and access `element.shadowRoot`).

---

### 3. **Using Shadow DOM with Dynamic Stylesheets**

In your case, you want your WebComponent to load and apply different stylesheets to the shadow DOM, depending on content type, and these stylesheets are **fetched from the server**.

#### General Workflow

1. **Component Mounts**
   - Determine what content type needs to be displayed.
2. **Fetch Stylesheets**
   - Fetch the list of CSS URLs from your backend.
3. **Apply Stylesheets to Shadow DOM**
   - Dynamically inject `&lt;link&gt;` or `&lt;style&gt;` elements into the shadow DOM.

#### Example Implementation

```js
class MyComponent extends HTMLElement {
  constructor() {
    super();
    this.shadow = this.attachShadow({ mode: 'open' });
  }

  async connectedCallback() {
    // 1. Determine content type (simplified for example)
    const contentType = this.getAttribute('data-type');
    // 2. Fetch css URLs from server
      const res = await fetch(`/api/styles?type=${contentType}`);
      const styleUrls = await res.json(); // e.g., ['https://example.com/style1.css', ...]

      // 3. Inject stylesheet links into shadow DOM
      for (const url of styleUrls) {
        const link = document.createElement('link');
        link.setAttribute('rel', 'stylesheet');
        link.setAttribute('href', url);
        this.shadow.appendChild(link);
      }

      // Add content
      const contentDiv = document.createElement('div');
      contentDiv.textContent = `Content for type: ${contentType}`;
      this.shadow.appendChild(contentDiv);
    }
  }
  customElements.define('my-component', MyComponent);
  ```

  #### Important Notes:
  - **Only styles placed inside the shadow DOM will affect its content**. External CSS (from the main page) cannot "leak in".
  - Loading CSS via `&lt;link rel="stylesheet"&gt;` works just as in regular HTML, but you must append the `&lt;link&gt;` to the shadow root.
  - If your server returns raw CSS, you can also use a `&lt;style&gt;` tag.

  ---

  ### 4. **Summary**

  - **Shadow DOM** provides style and DOM encapsulation for your component.
  - To **dynamically load styles**, fetch the CSS in JS and inject it into the shadow root.
  - This technique lets your component switch styles depending on the content type, while keeping them isolated from the rest of the page.

  If you have a specific problem or error, let me know! I can provide more detail or troubleshooting tips.

                </pre> -->
              </div>
            </div>
          </div>
        </div>
      </div>
      <div v-if="!isStreaming && streamedResponse" class="response-actions">
        <InlineInput selected-text="selectedText" />
      </div>
    </div>
  </div>
</template>
