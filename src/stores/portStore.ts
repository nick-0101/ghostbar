import { defineStore } from "pinia";

export const usePortStore = defineStore("port", () => {
  let port: chrome.runtime.Port | null = null;

  const connectPort = (name = "ghostbar-api") => {
    if (!port) {
      port = chrome.runtime.connect({ name });
      port.onDisconnect.addListener(() => {
        port = null;
      });
    }
    return port;
  };

  const sendMessage = (message: any) => {
    if (!port) connectPort();
    port?.postMessage(message);
  };

  const disconnectPort = () => {
    port?.disconnect();
    port = null;
  };

  const onMessage = (callback: (msg: any) => void) => {
    connectPort()?.onMessage.addListener(callback);
  };

  return {
    connectPort,
    sendMessage,
    disconnectPort,
    onMessage,
  };
});
