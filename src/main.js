const { app, BrowserWindow } = require('electron');
const path = require('path');
const { exec } = require('child_process');
const treeKill = require('tree-kill');
require('@electron/remote/main').initialize();

let pythonServer;
let pythonServerPid;
let mainWindow;

async function createWindow() {
  const { default: isDev } = await import('electron-is-dev');
  // 创建浏览器窗口
  mainWindow = new BrowserWindow({
    width: 800,
    height: 600,
    // frame: false, // 无框窗口
    webPreferences: {
      nodeIntegration: true,
      contextIsolation: false,
      enableRemoteModules: true, // 启用远程模块
      preload: path.join(__dirname, 'preload.js')
    }
  });

  // 加载远程命令控制
  require('@electron/remote/main').enable(mainWindow.webContents);

  // 加载初始页面
  if (isDev) {
    mainWindow.loadURL('http://localhost:3000');
    mainWindow.webContents.openDevTools(); // 开启调试窗口
  } else {
    mainWindow.loadFile(path.join(__dirname, 'ChatWorkstation_app/build/index.html'));
  }

  // 打开开发者工具
  // mainWindow.webContents.openDevTools();

  // 监听窗口关闭事件
  mainWindow.on('closed', () => {
    // 终止Python服务器进程
    if (pythonServerPid) {
      treeKill(pythonServerPid);
    }
    mainWindow = null;
  });
}

app.whenReady().then(() => {
  // 启动Python服务器
  pythonServer = exec('python ./start.py', (error, stdout, stderr) => {
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
});

app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') {
    app.quit();
  }
});

app.on('will-quit', () => {
  // 终止Python服务器进程
  if (pythonServerPid) {
    // treeKill(pythonServerPid);
  }
});
