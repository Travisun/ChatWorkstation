// src/components/HeaderBar.js
import React, {useEffect, useState} from 'react';
import {Cross2Icon, EnterFullScreenIcon, ExitFullScreenIcon, GearIcon, MinusIcon} from '@radix-ui/react-icons';
import {Box, Button, Dialog, Flex, IconButton} from "@radix-ui/themes";

import "./HeaderBar.scss"
import "../static/logo_text.svg"
import LogoHeaderComponent from "./LogoHeader.mjs";


const HeaderBar = () => {
  const [isMaximized, setIsMaximized] = useState(false);
  const [configSettings, setConfigSettings] = useState({});
  const [needUpdate, setNeedUpdate] = useState(false);

  // const system_lang = os.locale ? os.locale() : process.env.LANG || process.env.LANGUAGE || process.env.LC_ALL || 'en-US'
  // 使用系统浏览器打开外部链接
  const open_extranel_link = (link) => {
    // 通过 IPC 发送链接地址到主进程
    console.log(link);
    window.electron.ipcRenderer.send('open-external-link', link);
  }

  const remindMeLater = () => {
    // waiting for implementation
  }

  useEffect(() => {
    // 同步更新设置
    window.electron.getUpdateRemind().then((res)=>{
      setNeedUpdate(res)
    })

    window.electron.getAllConfig((data) => {
      setConfigSettings(data);
    });

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
          {needUpdate && <Dialog.Root>
            <Dialog.Trigger>
              <Button color="orange" className="updateMewButton" variant="soft">Update</Button>
            </Dialog.Trigger>
            <Dialog.Content>
              <Dialog.Title>{configSettings.update_title}</Dialog.Title>
              <Dialog.Description>
                <>{configSettings.update_description}</>
              </Dialog.Description>
              <Flex gap="3" justify="end">
                <Button variant="soft" color="primary" onClick={()=> {open_extranel_link(configSettings.update_link)}}>
                   <GearIcon /> Update Now
                </Button>
                <Dialog.Close>
                  <Button variant="soft" color="gray" onClick={()=>{remindMeLater()}}>
                    Later
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
