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

chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
  if (message.action === "executeQuery") {
    const query = message.query;

    console.log("query", message);
    (async () => {
      // async code goes here
      // ...
      // const result = await getSomething();
      // sendResponse(result);
    })();

    // Create a new ReadableStream to handle the streaming response
    // fetch("https://api.openai.com/v1/chat/completions", {
    //   method: "POST",
    //   headers: {
    //     "Content-Type": "application/json",
    //     Authorization: `Bearer ${process.env.OPENAI_API_KEY}`,
    //   },
    //   body: JSON.stringify({
    //     model: "gpt-3.5-turbo",
    //     messages: [{ role: "user", content: query }],
    //     stream: true,
    //   }),
    // })
    //   .then((response) => {
    //     const reader = response.body.getReader();
    //     const decoder = new TextDecoder();

    //     function readStream() {
    //       reader.read().then(({ done, value }) => {
    //         if (done) {
    //           // Stream is complete
    //           chrome.tabs.sendMessage(sender.tab.id, {
    //             action: "streamComplete",
    //           });
    //           return;
    //         }

    //         // Decode the chunk and process it
    //         const chunk = decoder.decode(value);
    //         const lines = chunk.split("\n").filter((line) => line.trim() !== "");

    //         lines.forEach((line) => {
    //           if (line.startsWith("data: ")) {
    //             const data = line.slice(6);
    //             if (data === "[DONE]") return;

    //             try {
    //               const parsed = JSON.parse(data);
    //               const content = parsed.choices[0]?.delta?.content;
    //               if (content) {
    //                 chrome.tabs.sendMessage(sender.tab.id, {
    //                   action: "streamChunk",
    //                   chunk: content,
    //                 });
    //               }
    //             } catch (e) {
    //               console.error("Error parsing chunk:", e);
    //             }
    //           }
    //         });

    //         // Continue reading the stream
    //         readStream();
    //       });
    //     }

    //     // Start reading the stream
    //     readStream();
    //   })
    //   .catch((error) => {
    //     chrome.tabs.sendMessage(sender.tab.id, {
    //       action: "streamError",
    //       error: error.message,
    //     });
    //   });

    //   const stream = await client.responses.create({
    //     model: "gpt-4.1",
    //     input: [
    //         {
    //             role: "user",
    //             content: "Say 'double bubble bath' ten times fast.",
    //         },
    //     ],
    //     stream: true,
    // });

    // for await (const event of stream) {
    //     console.log(event);
    // }

    return true; // Keep the message channel open
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
