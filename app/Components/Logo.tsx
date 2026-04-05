import React from 'react';
import Image from 'next/image';

const Logo = ({ width = 40, height = 40 }) => {
  return (
    <Image
      src="/Logo.png"
      alt="School Hub Logo"
      width={width}
      height={height}
      priority
    />
  );
};

export default Logo;
