"use client";

import Image from 'next/image';
import { useState, useEffect } from 'react';

export default function Logo() {
  const [isClient, setIsClient] = useState(false);

  useEffect(() => {
    setIsClient(true);
  }, []);

  
  if (!isClient) {
    return (
      <>
        <div className="hidden lg:flex items-center space-x-2">
          <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-indigo-600 overflow-hidden">
            <div className="w-8 h-8 bg-transparent"></div>
          </div>
          <span className="text-lg font-semibold text-gray-800">SchoolHub</span>
        </div>
        <div className="lg:hidden flex h-10 w-10 items-center justify-center rounded-lg bg-indigo-600 overflow-hidden">
          <div className="w-8 h-8 bg-transparent"></div>
        </div>
      </>
    );
  }

  return (
    <>
      <div className="hidden lg:flex items-center space-x-2">
        <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-indigo-600 overflow-hidden">
          <Image 
            src="/Logo.png" 
            alt="SchoolHub Logo" 
            width={40}
            height={40}
            className="object-contain"
            priority
          />
        </div>
        <span className="text-lg font-semibold text-gray-800">SchoolHub</span>
      </div>
      <div className="lg:hidden flex h-10 w-10 items-center justify-center rounded-lg bg-indigo-600 overflow-hidden">
        <Image 
          src="/Logo.png" 
          alt="SchoolHub Logo" 
          width={40}
          height={40}
          className="object-contain"
          priority
        />
      </div>
    </>
  );
}