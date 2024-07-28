// src/components/BootloaderComponent.js
import React, {useEffect, useState} from 'react';
import {Text, Flex, Callout, Button} from "@radix-ui/themes";
import LogoLoadingComponent from "./LogoLoadingComponent.mjs";
import {InfoCircledIcon} from "@radix-ui/react-icons";

import { useTranslation } from 'react-i18next';


const ServiceCheckerComponent = ({ src, title}) => {
  const { t } = useTranslation();
  const [backendStarted, setBackendStarted] = useState(false);
  const [backendFailed, setBackendFailed] = useState(false);
  const [backendTrying, setBackendTrying] = useState(false);

    const retryBackend = () => {
        window.electron.retryBackend();
        setBackendFailed(false);
        console.log("Retrying start backend.");
        setBackendTrying(true);
      };

  useEffect(() => {
    window.electron.onBackendStarted(() => {
      setBackendStarted(true);
      setBackendFailed(false);
      setBackendTrying(false);
    });

    window.electron.onBackendFailed(() => {
      setBackendStarted(false);
      setBackendFailed(true);
      setBackendTrying(false);
    });

    // 组件挂载后启动后端服务
    retryBackend();

  }, []);

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
                <div>
                    <span style={{height: '185px', width: '185px', display: 'block'}}>
                        <LogoLoadingComponent />
                    </span>
                </div>
              {backendFailed && <div>
                <Callout.Root color="gray">
                  <Callout.Icon>
                    <InfoCircledIcon />
                  </Callout.Icon>
                  <Callout.Text>
                    <Flex as="span" align="center" gap="4">
                      <Text>{t('backend_failed')}</Text>
                      <Button loading={backendTrying} onClick={retryBackend} variant="surface" size="1" my="-2">
                        {t('start_backend')}
                      </Button>
                    </Flex>
                  </Callout.Text>
                </Callout.Root>
                </div>}
                {/*<div style={{ padding: '20px', background: 'lightgray', borderRadius: '8px' }}>*/}
                {/*Item 3*/}
                {/*</div>*/}
          </Flex>
      </Flex>
  );
};

export default ServiceCheckerComponent;