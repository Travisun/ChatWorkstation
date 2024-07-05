const { app, BrowserWindow } = require('electron');
const path = require('path');
const { exec } = require('child_process');
const treeKill = require('tree-kill');

let pythonServer;
let pythonServerPid;
let mainWindow;

function createWindow() {
  // 创建浏览器窗口
  mainWindow = new BrowserWindow({
    width: 800,
    height: 600,
    webPreferences: {
      preload: path.join(__dirname, 'preload.js')
    }
  });

  // 加载初始页面
  mainWindow.loadFile('loading.html');

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
    treeKill(pythonServerPid);
  }
});
