// src/components/HeaderBar.js
import React, { useState, useEffect } from 'react';
import {
  Cross2Icon,
  MinusIcon,
  EnterFullScreenIcon,
  ExitFullScreenIcon
} from '@radix-ui/react-icons';
import {Box, Flex, IconButton} from "@radix-ui/themes";

import "./HeaderBar.scss"
import LogoComponent from "./Logo";

const HeaderBar = () => {
  const [isMaximized, setIsMaximized] = useState(false);

  useEffect(() => {
    const handleMaximize = () => setIsMaximized(true);
    const handleUnmaximize = () => setIsMaximized(false);

    window.electron.ipcRenderer.on('window-maximized', handleMaximize);
    window.electron.ipcRenderer.on('window-unmaximized', handleUnmaximize);

    return () => {
      window.electron.ipcRenderer.removeListener('window-maximized', handleMaximize);
      window.electron.ipcRenderer.removeListener('window-unmaximized', handleUnmaximize);
    };
  }, []);

  const handleMinimize = () => {
    console.log(200)
    window.electron.ipcRenderer.send('minimize-window');
  };

  const handleMaximize = () => {
    window.electron.ipcRenderer.send(isMaximized ? 'unmaximize-window' : 'maximize-window');
  };

  const handleClose = () => {
    window.electron.ipcRenderer.send('close-window');
  };

  return (
    <div className="header-container">
      <Flex justify={"start"} className="header-brand"><span style={{height: '25px', width: '25px'}} ><LogoComponent /></span> <span className={"brand"}>Chat Workstation</span></Flex>
      <Box position={"right"}>
        <Flex className="header-actions" align={"end"} justify={"end"}>
          <IconButton className="header-button" onClick={handleMinimize}  variant="soft">
            <MinusIcon width={18} height={18} />
          </IconButton>
          <IconButton style={{display: isMaximized?'none':'flex'}} className="header-button" onClick={handleMaximize}  variant="soft">
            <EnterFullScreenIcon width={18} height={18} />
          </IconButton>
          <IconButton style={{display: isMaximized?'flex':'none'}} className="header-button" onClick={handleMaximize}  variant="soft">
            <ExitFullScreenIcon width={18} height={18} />
          </IconButton>
          <IconButton className="header-button" onClick={handleClose}  variant="soft">
            <Cross2Icon width={18} height={18} />
          </IconButton>
        </Flex>
      </Box>
    </div>
  );
};

export default HeaderBar;
