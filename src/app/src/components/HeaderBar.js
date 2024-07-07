// src/components/HeaderBar.js
import React, { useState, useEffect } from 'react';
import { styled } from '@stitches/react';
import * as Toolbar from '@radix-ui/react-toolbar';
import { Cross2Icon, MinusIcon, PlusIcon, FrameIcon } from '@radix-ui/react-icons';

const HeaderContainer = styled(Toolbar.Root, {
  display: 'flex',
  justifyContent: 'space-between',
  alignItems: 'center',
  width: '100%',
  height: '30px',
  backgroundColor: '#282c34',
  color: 'white',
  // padding: '0 10px',
  webkitAppRegion: 'drag', // Enable window dragging
});

const Button = styled(Toolbar.Button, {
  backgroundColor: 'transparent',
  border: 'none',
  color: 'white',
  cursor: 'pointer',
  webkitAppRegion: 'no-drag', // Disable window dragging on buttons
});

const HeaderBar = () => {
  const [isMaximized, setIsMaximized] = useState(false);

  useEffect(() => {
    window.electron.ipcRenderer.on('window-maximized', () => setIsMaximized(true));
    window.electron.ipcRenderer.on('window-unmaximized', () => setIsMaximized(false));
  }, []);

  const handleMinimize = () => {
    window.electron.ipcRenderer.send('minimize-window');
  };

  const handleMaximize = () => {
    window.electron.ipcRenderer.send(isMaximized ? 'unmaximize-window' : 'maximize-window');
  };

  const handleClose = () => {
    window.electron.ipcRenderer.send('close-window');
  };

  return (
    <HeaderContainer>
      <div>My App</div>
      <div>
        <Button onClick={handleMinimize}>
          <MinusIcon />
        </Button>
        <Button onClick={handleMaximize}>
          {isMaximized ? <FrameIcon /> : <PlusIcon />}
        </Button>
        <Button onClick={handleClose}>
          <Cross2Icon />
        </Button>
      </div>
    </HeaderContainer>
  );
};

export default HeaderBar;
