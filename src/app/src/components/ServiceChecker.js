// src/components/BootloaderComponent.js
import React, {useEffect, useState} from 'react';
import {Box, Flex} from "@radix-ui/themes";
import LogoComponent from "./Logo";
import LogoLoadingComponent from "./LogoLoadingComponent";



const ServiceCheckerComponent = ({ src, title}) => {

  const [backendStarted, setBackendStarted] = useState(false);

  return (
      <Flex
          style={{
              width: '100vw',
              height: 'calc(100vh - 55px)',
              alignItems: 'center',
              justifyContent: 'center',
              overflow: 'none',
          }}
      >
          <Flex
            direction="column"
            style={{
              gap: '10px',
              alignItems: 'center',
            }}
          >
                <div style={{padding: '20px', borderRadius: '8px'}}>
                <span style={{height: '185px', width: '185px', display: 'block'}}>
                    <LogoLoadingComponent />
                </span>
                </div>
                <div style={{padding: '20px', background: 'lightgray', borderRadius: '8px'}}>
                Chat Workstation
                </div>
                <div style={{ padding: '20px', background: 'lightgray', borderRadius: '8px' }}>
                Item 3
                </div>
          </Flex>
      </Flex>
  );
};

export default ServiceCheckerComponent;
