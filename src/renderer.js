const { remote } = require('electron');
window.remote = remote;
const win = remote.getCurrentWindow();

document.getElementById('minimize').addEventListener('click', () => {
  win.minimize();
});

document.getElementById('maximize').addEventListener('click', () => {
  if (win.isMaximized()) {
    win.unmaximize();
  } else {
    win.maximize();
  }
});

document.getElementById('close').addEventListener('click', () => {
  win.close();
});
