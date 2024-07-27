// src/components/HeaderBar.js
import React, { useState, useEffect } from 'react';
import {
  Cross2Icon,
  MinusIcon,
  EnterFullScreenIcon,
  ExitFullScreenIcon, GearIcon
} from '@radix-ui/react-icons';
import {Box, Button, Flex, IconButton, Inset, Dialog, Spinner} from "@radix-ui/themes";
import axios from 'axios';
import ReactMarkdown from 'react-markdown';

import "./HeaderBar.scss"
import "../static/logo_text.svg"
import LogoHeaderComponent from "./LogoHeader";


const HeaderBar = () => {
  const [isMaximized, setIsMaximized] = useState(false);

  const chat_workstation_client_version = 1100;
  const [updatePageLink, setUpdatePageLink] = useState("https://chatworkstation.org/update_instruction?version="+ chat_workstation_client_version);
  const [needUpdate, setNeedUpdate] = useState(false);
  const [updateInfo, setUpdateInfo] = useState({
    title: null,
    description: null,
  });

  // 使用系统浏览器打开外部链接
  const open_extranel_link = (link) => {
    // 通过 IPC 发送链接地址到主进程
    console.log(link);
    window.electron.ipcRenderer.send('open-external-link', link);
  }
  // 检查远端版本更新状态
  const checkForUpdates = async () => {
    const dataToSend = { "system": window.osInfo, "client_version": chat_workstation_client_version }; // The data about client version check to send
    try {
      const response = await axios.post('https://api.chatworkstation.org/check_update', dataToSend);
      const res = response.data;
      setNeedUpdate(res?.needUpdate);
      if (res?.updatePageLink){
        setUpdatePageLink(res.updatePageLink);
      }
      // 解析标题和介绍信息
      setUpdateInfo(res?.updateInfo);
    } catch (err) {
      console.error('Client Update Check Error!', err);
    }
  };

  useEffect(() => {
    // 渲染第一次检查更新
    checkForUpdates();
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
      <Flex justify={"start"} className="header-brand"><span style={{height: '30px', width:'138px', marginTop: '8px'}} ><LogoHeaderComponent /></span></Flex>
      <Box position={"right"} className="action-box">
        <Flex className="header-actions" align={"end"} justify={"end"}>
          {!needUpdate && <Spinner />}
          {needUpdate && <Dialog.Root>
            <Dialog.Trigger>
              <Button color="orange" className="updateMewButton" variant="soft">Update</Button>
            </Dialog.Trigger>
            <Dialog.Content>
              <Dialog.Title>{updateInfo.title}</Dialog.Title>
              <Dialog.Description>
                <ReactMarkdown>{updateInfo.description}</ReactMarkdown>
              </Dialog.Description>
              <Flex gap="3" justify="end">
                <Button variant="soft" color="primary" onClick={()=> open_extranel_link(updatePageLink)}>
                   <GearIcon /> Update Chat Workstation Now
                </Button>
                <Dialog.Close>
                  <Button variant="soft" color="gray">
                    Not Now
                  </Button>
                </Dialog.Close>
              </Flex>
            </Dialog.Content>
          </Dialog.Root>}
          <IconButton className="header-button" onClick={handleMinimize}  variant="soft">
            <MinusIcon width={18} height={18} />
          </IconButton>
          <IconButton style={{display: isMaximized?'none':'flex'}} className="header-button" onClick={handleMaximize}  variant="soft">
            <EnterFullScreenIcon width={18} height={18} />
          </IconButton>
          <IconButton style={{display: isMaximized?'flex':'none'}} className="header-button" onClick={handleMaximize}  variant="soft">
            <ExitFullScreenIcon width={18} height={18} />
          </IconButton>
          <IconButton className="header-button close-btn" onClick={handleClose}  variant="soft">
            <Cross2Icon width={18} height={18} />
          </IconButton>
        </Flex>
      </Box>
    </div>
  );
};

export default HeaderBar;
