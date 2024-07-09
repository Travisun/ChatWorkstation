// public/preload.js
const { contextBridge, ipcRenderer, clipboard} = require('electron');

// 暴露给前端界面的 API
contextBridge.exposeInMainWorld('electron', {
  onBackendStarted: (callback) => ipcRenderer.on('backend-started', callback),
  onBackendFailed: (callback) => ipcRenderer.on('backend-failed', callback),
  retryBackend: () => ipcRenderer.send('retry-backend'),
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

