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
  if (port.name === "ghostbar-api") {
    port.onMessage.addListener((msg) => {
      console.log("Received message:", msg);

      // Handle messages from content script if needed
      if (msg.action === "executeQuery") {
        // For debugging
        // console.log("Executing query:", msg.prompt);

        // port.postMessage({ action: "streamResponse", aiResponse: "Hello, world!" });

        // port.postMessage({
        //   action: "streamComplete",
        //   completeResponse: "Stream completed",
        // });

        (async () => {
          try {
            port.postMessage({
              action: "streamStart",
            });

            const storageRes = await chrome.storage.sync.get("apiKey");

            const client = new OpenAI({
              apiKey: storageRes.apiKey,
            });

            const stream = await client.responses.create({
              model: "gpt-4.1",
              input: [
                ...msg.history,
                {
                  role: "user",
                  content: `${msg.prompt}\n\n${msg.selectedText}`,
                },
              ],
              stream: true,
            });

            for await (const chunk of stream) {
              if (chunk.type === "response.output_text.delta") {
                port.postMessage({ action: "streamResponse", aiResponse: chunk.delta });
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
