// public/preload.js
const { contextBridge, ipcRenderer } = require('electron');

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

// 管理媒体设备权限
window.addEventListener('DOMContentLoaded', () => {
  navigator.mediaDevices.getUserMedia({ audio: true, video: true })
    .then((stream) => {
      console.log('Got MediaStream:', stream);
    })
    .catch((error) => {
      console.error('Error accessing media devices.', error);
    });

  if (navigator.geolocation) {
    navigator.geolocation.getCurrentPosition(
      (position) => {
        console.log('Geolocation position:', position);
      },
      (error) => {
        console.error('Error accessing geolocation.', error);
      }
    );
  } else {
    console.error('Geolocation is not supported by this browser.');
  }
});
