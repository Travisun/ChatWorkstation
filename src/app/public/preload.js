// public/preload.js
const { contextBridge, ipcRenderer, clipboard} = require('electron');

contextBridge.exposeInMainWorld('electron', {
  // onBackendStarted: (callback) => ipcRenderer.on('backend-started', callback),
  ipcRenderer: {
    send: (channel, data) => ipcRenderer.send(channel, data),
    on: (channel, func) => {
      const validChannels = ['window-maximized', 'window-unmaximized'];
      if (validChannels.includes(channel)) {
        ipcRenderer.on(channel, (event, ...args) => func(...args));
      }
    },
    // 后端服务启动通知
    removeListener: (channel, func) => {
      ipcRenderer.removeListener(channel, func);
    },
  },
});

