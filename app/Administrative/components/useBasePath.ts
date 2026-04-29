"use client";

import { useState, useEffect } from "react";

export function useBasePath() {
  const [basePath, setBasePath] = useState('/Administrative');
  
  useEffect(() => {
    try {
      const userData = localStorage.getItem('user');
      if (userData) {
        const user = JSON.parse(userData);
        const role = user.role?.toLowerCase();
        if (role === 'schooladmin') {
          setBasePath('/SchoolAdmin/Administrative');
        } else if (role === 'administrative') {
          setBasePath('/Administrative');
        }
      }
    } catch (error) {
      console.error('Error getting basePath:', error);
    }
  }, []);
  
  return basePath;
}
