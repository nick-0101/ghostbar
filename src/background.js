import { OpenAI } from "openai";

// Track active tabs
const activeTabs = new Set();

// Listen for keyboard command
chrome.commands.onCommand.addListener((command) => {
  if (command === "toggle-ghostbar") {
    // Get the active tab
    chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => {
      const activeTab = tabs[0];
      if (activeTab.id) {
        try {
          // Toggle the active state for this tab
          if (activeTabs.has(activeTab.id)) {
            activeTabs.delete(activeTab.id);
            chrome.tabs.sendMessage(activeTab.id, { action: "toggleOverlay", isVisible: false });
          } else {
            activeTabs.add(activeTab.id);
            chrome.tabs.sendMessage(activeTab.id, { action: "toggleOverlay", isVisible: true });
          }
        } catch (error) {
          console.error("Error:", error);
        }
      }
    });
  }
});

chrome.runtime.onConnect.addListener((port) => {
  console.log("Port connected:", port.name);

  if (port.name === "ghostbar-api") {
    console.log("GhostBar stream port connected successfully");

    port.onMessage.addListener((msg) => {
      console.log("Received message:", msg);

      // Handle messages from content script if needed
      if (msg.action === "executeQuery") {
        console.log("Executing query:", msg.prompt);

        (async () => {
          try {
            const client = new OpenAI({
              apiKey: "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",
            });

            const stream = await client.responses.create({
              model: "gpt-4.1",
              input: [
                {
                  role: "user",
                  content: msg.prompt,
                },
              ],
              stream: true,
            });

            for await (const chunk of stream) {
              if (chunk.type === "response.output_text.delta") {
                port.postMessage({ aiResponse: chunk.delta });
              }
            }

            port.postMessage({
              action: "streamComplete",
              completeResponse: "Stream completed",
            });

            console.log("Streaming completed successfully");
          } catch (error) {
            console.error("Error during streaming:", error);
            port.postMessage({
              action: "streamError",
              error: error.message,
            });
          }
        })();
      }
    });

    port.onDisconnect.addListener(() => {
      console.log("GhostBar stream port disconnected");
    });
  }
});

// Clean up when tab is closed
chrome.tabs.onRemoved.addListener((tabId) => {
  activeTabs.delete(tabId);
});

// Clean up when tab is updated (e.g., navigation)
chrome.tabs.onUpdated.addListener((tabId, changeInfo) => {
  if (changeInfo.status === "loading") {
    activeTabs.delete(tabId);
  }
});

// When a new tab is created, ensure it's not active by default
chrome.tabs.onCreated.addListener((tab) => {
  // New tabs should not have the extension active
  if (activeTabs.has(tab.id)) {
    activeTabs.delete(tab.id);
  }
});
