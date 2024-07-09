// src/components/BootloaderComponent.js
import React, {useEffect, useState} from 'react';



const BootloaderComponent = ({ src, title}) => {

  const [backendStarted, setBackendStarted] = useState(false);

  // useEffect(() => {
  //   window.electron.onBackendStarted(() => {
  //     setBackendStarted(true);
  //   });
  // }, []);


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
          <iframe
              src={src}
              title={title}
              width="100%"
              height="100vh"
              style={{border: 'none', display: 'block', height: 'calc(100vh - 55px)'}}
          />): (
            <>Loading...</>
          )}
      </>
  );
};

export default BootloaderComponent;
