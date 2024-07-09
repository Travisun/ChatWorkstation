// src/components/BootloaderComponent.js
import React, {useEffect, useState} from 'react';



const BootloaderComponent = ({ src, title}) => {

  const [backendStarted, setBackendStarted] = useState(false);

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
    // window.electron.onBackendStarted(() => {
    //   setBackendStarted(true);
    // });

  }, []);


  // 检测后端服务器启动
  const checkBackendService = async () => {
    try {
      const response = await fetch('http://localhost:8080/api/config');
      if (response.ok) {
        const data = await response.json();
        if (data.version && data.status === true) {
          console.log(`Backend service started with version: ${data.version}`);
          setBackendStarted(true);

          clearInterval(interval);

          // 请求Wakelock权限
          // await requestWakeLock();
        }
      }
    } catch (error) {
      console.log('Backend service is not available yet...');
    }
  };

  const interval = setInterval(checkBackendService, 1000);

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
            <>Loading...</>
        )}
      </>
  );
};

export default BootloaderComponent;
