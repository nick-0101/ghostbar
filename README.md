## The Vision

I want to be able to highlight any piece of content on the web, weather that be text or an image, and be able to click a keyboard shortcut to immediately pull up a chatgpt window with that selected text as context.

## Concepts

- Popup Script (popup.js):

  - Runs in the extension's popup
  - Can use Chrome extension APIs
  - Can't directly access webpage content
  - Runs only when popup is open

- Content Script (content.js):
  - Runs in the context of web pages
  - Can use Chrome extension APIs
  - Can read and modify webpage content
  - Runs automatically on matching pages
  - Can communicate with popup scripts using chrome.runtime.sendMessage
