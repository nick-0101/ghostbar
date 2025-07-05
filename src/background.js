import { OpenAI } from 'openai'

// Track active tabs
const activeTabs = new Set()
const SESSION_EXPIRATION_IN_MIN = 30
const GA_ENDPOINT = 'https://www.google-analytics.com/mp/collect'
const MEASUREMENT_ID = `G-ZZF8SD9FRK`
const API_SECRET = `8D9mehD2QMOuqq6H4Q7usg`
const DEFAULT_ENGAGEMENT_TIME_IN_MSEC = 100

const getOrCreateClientId = async () => {
  const result = await chrome.storage.local.get('clientId')
  let clientId = result.clientId
  if (!clientId) {
    // Generate a unique client ID, the actual value is not relevant
    clientId = self.crypto.randomUUID()
    await chrome.storage.local.set({ clientId })
  }
  return clientId
}

const getOrCreateSessionId = async () => {
  // Store session in memory storage
  let { sessionData } = await chrome.storage.session.get('sessionData')
  // Check if session exists and is still valid
  const currentTimeInMs = Date.now()
  if (sessionData && sessionData.timestamp) {
    // Calculate how long ago the session was last updated
    const durationInMin = (currentTimeInMs - sessionData.timestamp) / 60000
    // Check if last update lays past the session expiration threshold
    if (durationInMin > SESSION_EXPIRATION_IN_MIN) {
      // Delete old session id to start a new session
      sessionData = null
    } else {
      // Update timestamp to keep session alive
      sessionData.timestamp = currentTimeInMs
      await chrome.storage.session.set({ sessionData })
    }
  }
  if (!sessionData) {
    // Create and store a new session
    sessionData = {
      session_id: currentTimeInMs.toString(),
      timestamp: currentTimeInMs.toString()
    }
    await chrome.storage.session.set({ sessionData })
  }
  return sessionData.session_id
}

const sendAnalyticsEvent = async (name, params = {}) => {
  const sessionId = await getOrCreateSessionId()

  fetch(`${GA_ENDPOINT}?measurement_id=${MEASUREMENT_ID}&api_secret=${API_SECRET}`, {
    method: 'POST',
    body: JSON.stringify({
      client_id: await getOrCreateClientId(),
      events: [
        {
          name,
          params: {
            session_id: sessionId,
            engagement_time_msec: DEFAULT_ENGAGEMENT_TIME_IN_MSEC,
            ...params
          }
        }
      ]
    })
  })
}

// Listen for keyboard command
chrome.commands.onCommand.addListener(command => {
  console.log(command)
  if (command === 'toggle-ghostbar') {
    sendAnalyticsEvent('toggle_ghostbar')

    // Get the active tab
    chrome.tabs.query({ active: true, currentWindow: true }, tabs => {
      const activeTab = tabs[0]
      if (activeTab.id) {
        try {
          // Toggle the active state for this tab
          if (activeTabs.has(activeTab.id)) {
            activeTabs.delete(activeTab.id)
            chrome.tabs.sendMessage(activeTab.id, { action: 'toggleOverlay', isVisible: false })
          } else {
            activeTabs.add(activeTab.id)
            chrome.tabs.sendMessage(activeTab.id, { action: 'toggleOverlay', isVisible: true })
          }
        } catch (error) {
          console.error('Error:', error)
        }
      }
    })
  }
})

chrome.runtime.onMessage.addListener(request => {
  switch (request.action) {
    case 'clearConversation':
      chrome.tabs.query({ active: true, currentWindow: true }, tabs => {
        const activeTab = tabs[0]
        if (activeTab.id) {
          try {
            // Toggle the active state for this tab
            if (activeTabs.has(activeTab.id)) {
              activeTabs.delete(activeTab.id)
            }
          } catch (error) {
            console.error('Error:', error)
          }
        }
      })
      break
    case 'logAnalytics':
      ;(async () => {
        await sendAnalyticsEvent(request.name, request.params)
      })()
      break
    default:
      break
  }
})

chrome.runtime.onConnect.addListener(port => {
  if (port.name === 'ghostbar-api') {
    port.onMessage.addListener(msg => {
      // Handle messages from content script if needed
      if (msg.action === 'executeQuery') {
        ;(async () => {
          try {
            port.postMessage({
              action: 'streamStart'
            })

            const storageRes = await chrome.storage.sync.get('apiKey')

            const client = new OpenAI({
              apiKey: storageRes.apiKey
            })

            const stream = await client.responses.create({
              model: msg.aiModel,
              input: [...msg.history],
              stream: true
            })

            for await (const chunk of stream) {
              switch (chunk.type) {
                case 'response.output_text.delta':
                  port.postMessage({ action: 'streamResponse', aiResponse: chunk.delta })
                  break
                case 'response.output_item.done':
                  port.postMessage({
                    action: 'streamComplete',
                    completeResponse: chunk?.item?.content?.[0]?.text || ''
                  })
                  break
                default:
                  break
              }
            }

            console.log('Streaming completed successfully')
            await sendAnalyticsEvent('execute_query')
          } catch (error) {
            console.error('Error during streaming:', error)
            port.postMessage({
              action: 'streamError',
              error: error.message
            })
          }
        })()
      }
    })

    port.onDisconnect.addListener(() => {
      console.log('GhostBar stream port disconnected')
    })
  }
})

// Clean up when tab is closed
chrome.tabs.onRemoved.addListener(tabId => {
  activeTabs.delete(tabId)
})

// Clean up when tab is updated (e.g., navigation)
chrome.tabs.onUpdated.addListener((tabId, changeInfo) => {
  if (changeInfo.status === 'loading') {
    activeTabs.delete(tabId)
  }
})

// When a new tab is created, ensure it's not active by default
chrome.tabs.onCreated.addListener(tab => {
  // New tabs should not have the extension active
  if (activeTabs.has(tab.id)) {
    activeTabs.delete(tab.id)
  }
})

chrome.runtime.onInstalled.addListener(async () => {
  try {
    await getOrCreateClientId()

    // Create parent menu
    await chrome.contextMenus.create({
      title: 'GhostBar',
      id: 'ghostbar-context-parent',
      contexts: ['all']
    })

    // Create child menu
    await chrome.contextMenus.create({
      title: 'Prompt on the fly',
      id: 'ghostbar-context-child-prompt-on-the-fly',
      contexts: ['selection', 'page', 'link', 'editable'],
      parentId: 'ghostbar-context-parent'
    })

    console.log('Context menus created successfully')
  } catch (error) {
    console.error('Error creating context menus:', error)
  }
})

// Only add the click listener if contextMenus is available
if (chrome.contextMenus) {
  chrome.contextMenus.onClicked.addListener(async (info, tab) => {
    if (info.menuItemId === 'ghostbar-context-child-prompt-on-the-fly') {
      if (tab?.id) {
        try {
          // Toggle the active state for this tab
          if (activeTabs.has(tab.id)) {
            activeTabs.delete(tab.id)
            chrome.tabs.sendMessage(tab.id, {
              action: 'onTheFlyPrompt',
              isVisible: true,
              selectedText: info.selectionText
            })
          } else {
            activeTabs.add(tab.id)
            chrome.tabs.sendMessage(tab.id, {
              action: 'onTheFlyPrompt',
              isVisible: true,
              selectedText: info.selectionText
            })
          }

          await sendAnalyticsEvent('prompt_on_the_fly')
        } catch (error) {
          console.error('Error:', error)
        }
      }
    }
  })
}

addEventListener('unhandledrejection', async event => {
  sendAnalyticsEvent('extension_error', {
    message: event.reason.message,
    stack: event.reason.stack
  })
})
