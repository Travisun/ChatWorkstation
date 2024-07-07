// src/components/BootloaderComponent.js
import React from 'react';

const BootloaderComponent = ({ src, title}) => {
  return (
    <iframe
      src={src}
      title={title}
      width="100%"
      height="100vh"
      style={{ border: 'none', display: 'block' , height: 'calc(100vh - 55px)'}}
    />
  );
};

export default BootloaderComponent;
