// public/electron.js
const { spawn } = require('child_process');
const remote = require('@electron/remote/main');
const { app, BrowserWindow, ipcMain, session, shell } = require('electron');
const path = require('path');
const treeKill = require('tree-kill');
const os = require('os');

let pythonServer;
let pythonServerPid;
let win;
let interval;
let timeout;
let isDev;

async function createWindow() {
  win = new BrowserWindow({
    width: 900,
    height: 650,
    minWidth: 450,
    minHeight: 650,
    title: "Chat Workstation",  // 这里设置窗口标题
    webPreferences: {
      nodeIntegration: false,
      preload: path.join(__dirname, 'preload.js'),
      contextIsolation: true,
      enableRemoteModule: false, // Disable the remote module
      sandbox: true, // Enable sandboxing for security
      // 允许访问媒体设备
      media: true,
    },
    frame: false,
  });
  remote.initialize();
  win.loadURL(
    isDev.default
      ? 'http://localhost:3000'
      : `file://${path.join(__dirname, '../build/index.html')}`
  );

  // 处理自定义协议
  app.setAsDefaultProtocolClient('chatws');

  // 监听键盘事件 打开开发者控制台
  const { globalShortcut } = require('electron');

  globalShortcut.register('Shift+Tab+F2', () => {
    if (win) {
      win.webContents.openDevTools();
    }
  });
  // 开发模式下 打开调试控制台
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

  // 监听渲染进程的请求并返回 JSON 数据
  ipcMain.handle('get-system-info', async () => {
    // 模拟获取系统信息
    const systemInfo = {
      system: process.platform,
      version: process.version,
      architecture: process.arch,
      language: process.env.LANG || 'en_US'
    };

    return systemInfo; // 返回 JSON 数据
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


// 后端服务状态管理
function startBackendCheck() {
  clearInterval(interval);
  clearTimeout(timeout);

  const checkBackendService = async () => {
    try {
      console.log("Start Backend Service Check...")
      const response = await fetch('http://localhost:8080/api/config');
      if (response.ok) {
        const data = await response.json();
        if (data.version) {
          console.log(`Backend service started with version: ${data.version}`);
          win.webContents.send('backend-started', data.version);
          clearInterval(interval);
          clearTimeout(timeout);
        }
      }
    } catch (error) {
      console.log('Backend service is not available yet...');
    }
  };

  interval = setInterval(checkBackendService, 5000); // 每5秒检测一次
  timeout = setTimeout(() => {
    clearInterval(interval);
    win.webContents.send('backend-failed');
    console.log('Backend service failed to start within 60 seconds.');
  }, 60000); // 60秒超时
}


// 启动后端服务
function startBackendService() {
  if (pythonServerPid) {
    console.log("Killing exist backend service...")
    treeKill(pythonServerPid);
  }
  console.log("Trying to start backend service.")
  let backendProcess;
  // 开发环境启动脚本服务
  try{
    if(isDev.default){
      backendProcess = spawn('python', ['start.py'], { cwd: path.join(__dirname, '../../../') });
    }else{
      // 启动后端服务
        backendProcess =  spawn(path.join(__dirname, '../../Backend'));
    }
  }catch (e){
    console.log('Backend error found...'+ e);
  }


  backendProcess.stdout.on('data', (data) => {
    console.log(`stdout: ${data}`);
  });

  backendProcess.stderr.on('data', (data) => {
    console.error(`stderr: ${data}`);
  });

  backendProcess.on('close', (code) => {
    console.log(`backend process exited with code ${code}`);
  });
  return backendProcess;
}

// 收到前端消息, 继续启动后端服务
ipcMain.on('retry-backend', () => {
  // 启动Python服务器
  pythonServer = startBackendService();
  // 获取Python服务器进程的PID
  pythonServerPid = pythonServer.pid;
  // 重启服务检查
  startBackendCheck();
});

// Ready Actions Call
app.whenReady().then(async () => {

  isDev = await import('electron-is-dev');
  // 启动Python服务器
  console.log("Trying to start backend service.")
  // pythonServer = startBackendService();
  //
  // // 获取Python服务器进程的PID
  // pythonServerPid = pythonServer.pid;

  // 注册私有协议处理逻辑
  // protocol.registerFileProtocol('chatws', (request, callback) => {
  //   const parsedUrl = url.parse(request.url, true);
  //   console.log('Protocol URL:', parsedUrl);
  //
  //   // Extract parameters from the URL
  //   const params = parsedUrl.query;
  //   console.log('Parameters:', params);
  //
  //   // Pass parameters to the renderer process or handle them in the main process
  //   win.webContents.on('did-finish-load', () => {
  //     win.webContents.send('protocol-params', {...params, actionUrl: parsedUrl});
  //   });
  //   // 此处应该根据不同的 parseUrl 执行对应操作
  //   callback({ path: `file://${path.join(__dirname, '../build/index.html')}`});
  // });

  // 先创建窗口，避免堵塞卡画面
  await createWindow();

  app.on('activate', () => {
    if (BrowserWindow.getAllWindows().length === 0) {
      createWindow();
    }
  });

  // 处理权限请求
  session.defaultSession.setPermissionRequestHandler((webContents, permission, callback) => {
    console.log("Permission request handler: " + permission)
    if (['clipboard-read', 'media', 'audioCapture', 'videoCapture', 'screen-wake-lock'].includes(permission)) {
      callback(true);
    } else {
      callback(false);
    }
  });
  // 启动后端检查
  // startBackendCheck();

  // 监听来自渲染进程的事件
  ipcMain.on('open-external-link', (event, url) => {
    shell.openExternal(url);
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

// Listen for URL protocol activation (macOS)
app.on('open-url', (event, url) => {
  const parsedUrl = new URL(url);
  const params = parsedUrl.searchParams;
  const paramsObject = {};
  params.forEach((value, key) => {
    paramsObject[key] = value;
  });
  console.log('Parameters:', paramsObject);

  if (win) {
    win.webContents.on('did-finish-load', () => {
      win.webContents.send('protocol-params', {...paramsObject, actionUrl: parsedUrl});
    });
  }
});