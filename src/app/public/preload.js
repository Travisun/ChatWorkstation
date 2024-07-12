// public/preload.js
const { contextBridge, ipcRenderer, clipboard} = require('electron');

// 暴露给前端界面的 API
contextBridge.exposeInMainWorld('electron', {
  onBackendStarted: (callback) => ipcRenderer.on('backend-started', callback),
  onBackendFailed: (callback) => ipcRenderer.on('backend-failed', callback),
  retryBackend: () => ipcRenderer.send('retry-backend'),
  // 处理自定义协议的数据传输
  onProtocolParams: (callback) => ipcRenderer.on('protocol-params', (event, params) => callback(params)),
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

