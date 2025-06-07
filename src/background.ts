// Listen for keyboard command
chrome.commands.onCommand.addListener((command) => {
  if (command === "toggle-ghostbar") {
    // Get the active tab
    chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => {
      const activeTab = tabs[0];
      if (activeTab.id) {
        console.log("toggle-ghostbar");
        // Send message to content script
        chrome.tabs.sendMessage(activeTab.id, { action: "toggleOverlay" });
      }
    });
  }
});
