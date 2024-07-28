// src/components/BootloaderComponent.js
import React, {useEffect, useState} from 'react';
import ServiceChecker from "./ServiceChecker.mjs";



const BootloaderComponent = ({ src, title}) => {

  const [backendStarted, setBackendStarted] = useState(false);
  // 记录Iframe状态是否加载完成
  const [frameReady, setFrameReady] = useState(false);

  // 尝试获取屏幕唤醒权限
  const requestWakeLock = async () => {
    console.log("try to request wakelock");
    try {
      const wakeLock = await navigator.wakeLock.request('screen');
      wakeLock.addEventListener('release', () => {
        console.log('Wake Lock was released');
      });
      console.log('Wake Lock is active');
    } catch (err) {
      console.error(`${err.name}, ${err.message}`);
    }
  };

  useEffect(() => {
    window.electron.onBackendStarted(() => {
      setBackendStarted(true);
    });
  }, []);

  return (
      <>
        {backendStarted && <div onClick={() => requestWakeLock}>
          <iframe
              src={src}
              title={title}
              width="100%"
              height="100vh"
              onLoad={() => setFrameReady(true)}
              style={{border: 'none', display: frameReady ? 'block' : 'none', height: 'calc(100vh - 55px)'}}
              allow="geolocation; microphone; camera; media, clipboard-read; clipboard-write; encrypted-media; screen-wake-lock;" // 添加所有必要的权限
          />
        </div>}
        {/* 服务加载器 */}
        {(!frameReady || !backendStarted) && <ServiceChecker/>}
      </>
  );
};

export default BootloaderComponent;
