// public/electron.js
import axios from "axios";
import {spawn} from "child_process";
import {app, BrowserWindow, globalShortcut, ipcMain, session, shell} from 'electron';
import path from 'path';
import treeKill from "tree-kill";
import os from 'os';
import Store from 'electron-store';
import {fileURLToPath} from 'url';

// 获取 __dirname 的替代方法
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const store = new Store({
  name: 'cws-config',
  cwd: path.join(__dirname, '../../') // 自定义存储路径
});

// Chat Workstation 更新服务器
const chat_workstation_server = 'https://api.chatworkstation/api';
// 当前客户端版本
const version = "1100";
if(store.get('version') !== version){ store.set('version', version); }
// 注册客户端获取用作更新和API访问的Token
if(store.get('device_token') === undefined){
  axios.post(chat_workstation_server+'/device/register', {
    client_version: version,
    platform: os.platform(),
    os_version: os.version(),
    arch: os.arch(),
    language: os.locale ? os.locale() : process.env.LANG || process.env.LANGUAGE || process.env.LC_ALL || 'en-US'
  }).then((response)=>{
    console.log('device_token >>>>>', response.data.token)
    store.set('device_token', response.data.token);
  }).catch((reason)=>{
    console.log("errpr>>>>>>", reason)
  })
}
// 检查系统更新
axios.post(chat_workstation_server+'/device/check_updates', {}, {
    headers: {
      Authorization: store.get('device_token')
    }
  }).then((response)=>{
      if (response.data.version > version) {
        console.log('New version available');
        store.set('update_version', response.data.version);
        store.set('update_link', response.data.link);
        store.set('update_title', response.data.title);
        store.set('update_description', response.data.description);
        store.set('update_checked_at', new Date());
    }
      console.log(response);
})


/**
 * RemindUpdateLater 设置一个延期更新的时间戳为当前时间 + 7 天
 */
function RemindUpdateLater() {
    const currentTime = Date.now(); // 当前时间戳（毫秒）
    const sevenDaysLater = currentTime + (7 * 24 * 60 * 60 * 1000); // 当前时间 + 7 天
    store.set('update_remind_after', sevenDaysLater); // 保存时间戳
}

/**
 * GetUpdateRemind 检查用户是否应该被提醒更新
 * @returns {boolean} 如果应该提醒则返回 true，否则返回 false
 */
function GetUpdateRemind() {
    const updateRemindAfter = store.get('update_remind_after');
    const updateVersion = store.get('update_version');

    // 如果没有新版本或者无需更新时返回 false
    if(!updateVersion || updateRemindAfter <= updateRemindAfter){
      return false;
    }

    // 当 store 中没有保存 update_remind_after 时，返回 true
    if (updateRemindAfter === undefined) {
        return true;
    }

    const currentTime = Date.now();

    // 当存在 update_remind_after，且该时间戳早于当前时间，返回 true
    if (updateRemindAfter < currentTime) {
        return true;
    }

    // 其他情况返回 false
    return false;
}


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
  win.loadURL(
    isDev.default
      ? 'http://localhost:3000'
      : `file://${path.join(__dirname, '../build/index.html')}`
  );

  // 处理自定义协议
  app.setAsDefaultProtocolClient('chatws');

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

  // 前端获取所有设置
  ipcMain.on('get-all-config', (event) => {
    const allConfig = store.get(); // retrieve the config data
    event.reply('get-all-config-response', allConfig);
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

  // 获取 store 的 update_remind_after
  ipcMain.handle('get-update-remind', () => {
      return GetUpdateRemind();
  });

  // 设置 store 的 update_remind_after
  ipcMain.handle('remind-update-later', () => {
      return RemindUpdateLater()
  });
  // 获取系统设置
  ipcMain.handle('get-config', (event, name)=>{
    return store.get(name);
  })
  // 设置系统信息
  ipcMain.handle('set-config', (event, settings = []) => {
    settings.map((value, name)=>{
      store.set(name, value);
    })
    return true;
  })

  // 监听渲染进程的请求并返回 JSON 数据
  ipcMain.handle('get-system-info', async () => {
    // 模拟获取系统信息
    const systemInfo = {
      platform: process.platform,
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