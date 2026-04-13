"use client";

import Image from "next/image";

export default function Logo() {
  return (
    <Image 
      src="/Schoolhub logo.png" 
      alt="Schoolhub Logo" 
      width={40}
      height={40}
      className="logo-img" 
    />
  );
}
