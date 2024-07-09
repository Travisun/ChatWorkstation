// src/components/BootloaderComponent.js
import React, {useEffect, useState} from 'react';
import ServiceChecker from "./ServiceChecker";



const BootloaderComponent = ({ src, title}) => {

  const [backendStarted, setBackendStarted] = useState(false);

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
        {backendStarted ? (
            <div onClick={() => requestWakeLock}>
              <iframe
                  src={src}
                  title={title}
                  width="100%"
                  height="100vh"
                  style={{border: 'none', display: 'block', height: 'calc(100vh - 55px)'}}
                  allow="geolocation; microphone; camera; clipboard-read; clipboard-write; encrypted-media; screen-wake-lock;" // 添加所有必要的权限
              />
            </div>) : (
            <ServiceChecker />
        )}
      </>
  );
};

export default BootloaderComponent;
