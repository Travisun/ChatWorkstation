// public/preload.js
const { contextBridge, ipcRenderer, clipboard} = require('electron');

contextBridge.exposeInMainWorld('electron', {
  ipcRenderer: {
    send: (channel, data) => ipcRenderer.send(channel, data),
    on: (channel, func) => {
      const validChannels = ['window-maximized', 'window-unmaximized'];
      if (validChannels.includes(channel)) {
        ipcRenderer.on(channel, (event, ...args) => func(...args));
      }
    },
    removeListener: (channel, func) => {
      ipcRenderer.removeListener(channel, func);
    },
  },
});
