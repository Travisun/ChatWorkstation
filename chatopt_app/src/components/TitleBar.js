import React from 'react';

const TitleBar = () => {
  const remote = window.remote;
  const win = remote.getCurrentWindow();

  const handleMinimize = () => {
    win.minimize();
  };

  const handleMaximize = () => {
    if (win.isMaximized()) {
      win.unmaximize();
    } else {
      win.maximize();
    }
  };

  const handleClose = () => {
    win.close();
  };

  return (
    <div id="titlebar">
      <span style={{ flexGrow: 1, paddingLeft: '10px' }}>My App</span>
      <button id="minimize" onClick={handleMinimize}>_</button>
      <button id="maximize" onClick={handleMaximize}>[ ]</button>
      <button id="close" onClick={handleClose}>X</button>
    </div>
  );
};

export default TitleBar;
