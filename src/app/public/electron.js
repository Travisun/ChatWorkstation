// public/electron.js
const { exec } = require('child_process');

const { app, BrowserWindow, ipcMain, session } = require('electron');
const path = require('path');
const treeKill = require('tree-kill');

let pythonServer;
let pythonServerPid;
let win;

async function createWindow() {
  const isDev = await import('electron-is-dev');
  win = new BrowserWindow({
    width: 800,
    height: 600,
    minWidth: 470,
    minHeight: 760,
    webPreferences: {
      nodeIntegration: false,
      preload: path.join(__dirname, 'preload.js'),
      contextIsolation: true,
      enableRemoteModule: false,
      // 允许访问媒体设备
      media: true,
    },
    frame: false,
  });

  win.loadURL(
    isDev.default
      ? 'http://localhost:3000'
      : `file://${path.join(__dirname, '../build/index.html')}`
  );

  if (isDev.default) {
    win.webContents.openDevTools();
  }

  win.on('maximize', () => {
    win.webContents.send('window-maximized');
  });

  win.on('unmaximize', () => {
    win.webContents.send('window-unmaximized');
  });

  ipcMain.on('minimize-window', () => {
    win.minimize();
  });

  ipcMain.on('maximize-window', () => {
    win.maximize();
  });

  ipcMain.on('unmaximize-window', () => {
    win.unmaximize();
  });

  ipcMain.on('close-window', () => {
    console.log("Get Command for Close Window")
    win.close();
  });

  // 监听窗口关闭事件
  win.on('closed', () => {
    // 终止Python服务器进程
    if (pythonServerPid) {
      treeKill(pythonServerPid);
    }
    win = null;
  });
}

app.whenReady().then(() => {
  // 启动Python服务器
  pythonServer = exec('python ./../../start.py', (error, stdout, stderr) => {
    if (error) {
      console.error(`exec error: ${error}`);
      return;
    }
    console.log(`stdout: ${stdout}`);
    console.error(`stderr: ${stderr}`);
  });

  // 获取Python服务器进程的PID
  pythonServerPid = pythonServer.pid;

  createWindow();

  app.on('activate', () => {
    if (BrowserWindow.getAllWindows().length === 0) {
      createWindow();
    }
  });

  // 处理权限请求
    session.defaultSession.setPermissionRequestHandler((webContents, permission, callback) => {
        console.log("Permission request handler: " + permission)
        if (['clipboard-read', 'media', 'audioCapture', 'videoCapture'].includes(permission)) {
            callback(true);
        } else {
            callback(false);
        }
    });

});

app.on('will-quit', () => {
  // 终止Python服务器进程
  if (pythonServerPid) {
    treeKill(pythonServerPid);
  }
});

app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') {
    app.quit();
  }
});

