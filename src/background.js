// Listen for keyboard command
// chrome.commands.onCommand.addListener((command) => {
//   if (command === "toggle-ghostbar") {
//     // Get the active tab
//     chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => {
//       const activeTab = tabs[0];
//       if (activeTab.id) {
//         // Send message to content script
//         chrome.tabs.sendMessage(activeTab.id, { action: "toggleOverlay" });
//       }
//     });
//   }
// });

// NOTE FOR TOMORROW:
// The issue we're having is that the extension
// is becoming active on every tab, weather it's new or not.

// Track active tabs
const activeTabs = new Set();

// Listen for keyboard command
chrome.commands.onCommand.addListener((command) => {
  console.log("command", command);
  if (command === "toggle-ghostbar") {
    // Get the active tab
    chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => {
      console.log("tabs", tabs);
      const activeTab = tabs[0];
      if (activeTab.id) {
        try {
          // Toggle the active state for this tab
          if (activeTabs.has(activeTab.id)) {
            console.log("deleting tab", activeTab.id);
            activeTabs.delete(activeTab.id);
            chrome.tabs.sendMessage(activeTab.id, { action: "toggleOverlay", isVisible: false });
          } else {
            console.log("adding tab", activeTab.id);
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
  console.log("onCreated", tab);
  // New tabs should not have the extension active
  if (activeTabs.has(tab.id)) {
    activeTabs.delete(tab.id);
  }
});
