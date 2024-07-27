// public/preload.js
const { contextBridge, ipcRenderer, clipboard} = require('electron');
const os = require('os');

// 暴露给前端界面的 API
contextBridge.exposeInMainWorld('electron', {
  // 暴露操作系统信息，便于版本检测
  osInfo: {platform: os.platform(), release: os.release() , arch: os.arch(), lang:  os.locale ? os.locale() : process.env.LANG || process.env.LANGUAGE || process.env.LC_ALL || 'en-US'},
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

