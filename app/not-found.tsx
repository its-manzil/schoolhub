// app/not-found.tsx
'use client';

import React, { useEffect, useState, useMemo, useCallback } from 'react';
import Head from 'next/head';
import { useRouter } from 'next/navigation';
import { motion, AnimatePresence, useMotionValue, useTransform, useAnimation } from 'framer-motion';
import { FiHome, FiArrowLeft } from 'react-icons/fi';
import Image from 'next/image';

// ======================================================================
// Design Constants
// ======================================================================
const DESIGN_CONFIG = {
  IMAGE_URL: 'https://i.ibb.co/xSFScp6B/ddd.gif',
  IMAGE_WIDTH: 1100,
  IMAGE_HEIGHT: 900,
  CROP_TOP: 0.15,
  CROP_BOTTOM: 0.12,
  BUTTON_COLORS: {
    primary: '#10b981',
    hover: '#059669',
    text: '#ffffff',
    secondary: '#ffffff',
    secondaryHover: '#f3f4f6',
    secondaryText: '#10b981'
  },
  ERROR_MESSAGES: [
    "The page you're seeking is in another galaxy.",
    "This cosmic content has drifted beyond the event horizon.",
    "Our interstellar scanners can't locate this page.",
    "This destination has been lost in a wormhole.",
    "The page has achieved light speed and escaped.",
    "Our quantum computers can't find this location.",
    "This address doesn't exist in our space-time continuum.",
    "The page has been sucked into a black hole."
  ],
  SUBTEXT_MESSAGES: [
    "The page you're trying to reach has been lost in space.",
    "Maybe it's on a mission to explore new galaxies?",
    "Perhaps it's orbiting another dimension?",
    "Could be floating in the asteroid belt of our servers.",
    "Might be caught in the gravitational pull of another website."
  ]
};

// ======================================================================
// Background Pattern Component
// ======================================================================
const WhitePatternBackground = () => {
  return (
    <div className="fixed inset-0 -z-50 bg-white overflow-hidden">
      <div className="absolute inset-0 bg-gradient-to-b from-white/80 to-white" />
    </div>
  );
};

// ======================================================================
// Main 404 Component
// ======================================================================
export default function NotFound() {
  const router = useRouter();
  const controls = useAnimation();
  const animatedCount = useMotionValue(0);
  const displayCount = useTransform(animatedCount, Math.round);

  const messages = useMemo(() => DESIGN_CONFIG.ERROR_MESSAGES, []);
  const subtexts = useMemo(() => DESIGN_CONFIG.SUBTEXT_MESSAGES, []);
  
  const [currentMessage, setCurrentMessage] = useState(messages[0]);
  const [currentSubtext, setCurrentSubtext] = useState(subtexts[0]);
  const [isClient, setIsClient] = useState(false);

  useEffect(() => {
    setIsClient(true);
  }, []);

  // Initialize error count animation
  useEffect(() => {
    const animation = async () => {
      await animatedCount.set(0);
      await animatedCount.set(404);
    };
    animation();
  }, [animatedCount]);

  // Rotate messages
  useEffect(() => {
    const messageInterval = setInterval(() => {
      setCurrentMessage(messages[Math.floor(Math.random() * messages.length)]);
    }, 3000);

    const subtextInterval = setInterval(() => {
      setCurrentSubtext(subtexts[Math.floor(Math.random() * subtexts.length)]);
    }, 4000);

    return () => {
      clearInterval(messageInterval);
      clearInterval(subtextInterval);
    };
  }, [messages, subtexts]);

  // Navigation handler
  const handleNavigation = useCallback(async (action: 'home' | 'back') => {
    await controls.start({
      scale: 0.95,
      transition: { duration: 0.1 }
    });
    await controls.start({
      scale: 1,
      transition: { duration: 0.2 }
    });
    
    if (action === 'home') {
      router.push('/');
    } else {
      router.back();
    }
  }, [controls, router]);

  // Calculate cropped image dimensions
  const croppedHeight = DESIGN_CONFIG.IMAGE_HEIGHT * (1 - DESIGN_CONFIG.CROP_TOP - DESIGN_CONFIG.CROP_BOTTOM);

  if (!isClient) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-white">
        <div className="text-center">
          <div className="text-4xl font-bold text-green-500 mb-4">404</div>
          <p className="text-gray-600">Page Not Found</p>
        </div>
      </div>
    );
  }

  return (
    <>
      <Head>
        <title>Page Not Found | Lost in Space</title>
        <meta name="description" content="The page you're looking for doesn't exist in our galaxy" />
      </Head>

      <WhitePatternBackground />

      <main className="min-h-screen flex flex-col items-center justify-center p-4 sm:p-6 relative overflow-hidden">
        <div className="max-w-6xl w-full text-center flex flex-col items-center">
          {/* 404 Image with crop - Responsive adjustments */}
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
            className="mb-8 sm:mb-12 overflow-hidden w-full max-w-3xl"
            style={{
              height: `${croppedHeight * 0.6}px`,
              maxHeight: '400px',
              marginTop: `-${DESIGN_CONFIG.IMAGE_HEIGHT * DESIGN_CONFIG.CROP_TOP * 0.6}px`,
              marginBottom: `-${DESIGN_CONFIG.IMAGE_HEIGHT * DESIGN_CONFIG.CROP_BOTTOM * 0.6}px`
            }}
          >
            <Image
              src={DESIGN_CONFIG.IMAGE_URL}
              alt="Cosmic 404"
              width={DESIGN_CONFIG.IMAGE_WIDTH}
              height={DESIGN_CONFIG.IMAGE_HEIGHT}
              className="w-full h-full object-cover"
              priority
            />
          </motion.div>

          {/* Error Counter */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.5 }}
            className="inline-block px-4 py-2 bg-green-100 text-green-800 rounded-full text-sm font-mono mb-6 sm:mb-8 shadow-md"
          >
            Error <motion.span className="font-bold">{displayCount}</motion.span>
          </motion.div>

          {/* 404 Text */}
          <div className="mb-6 sm:mb-8">
            <motion.div 
              className="relative"
              initial={{ scale: 0.8 }}
              animate={{ scale: 1 }}
              transition={{ duration: 0.5 }}
            >
              <motion.span
                className="text-8xl md:text-[12rem] font-bold bg-clip-text text-transparent bg-gradient-to-r from-green-400 to-green-600"
                animate={{
                  backgroundPosition: ['0% 50%', '100% 50%'],
                }}
                transition={{
                  duration: 3,
                  repeat: Infinity,
                  repeatType: "reverse",
                  ease: "linear",
                }}
                style={{
                  backgroundSize: '200% 200%',
                }}
              >
                404
              </motion.span>
              <motion.div
                className="absolute inset-0 bg-gradient-to-r from-green-400 to-green-600 opacity-20 blur-3xl -z-10 rounded-full"
                animate={{
                  scale: [1, 1.2, 1],
                }}
                transition={{
                  duration: 3,
                  repeat: Infinity,
                  repeatType: "reverse",
                }}
              />
            </motion.div>
          </div>

          {/* Messages */}
          <div className="mb-8 sm:mb-12 px-4">
            <AnimatePresence mode="wait">
              <motion.h2
                key={currentMessage}
                className="text-xl sm:text-2xl md:text-3xl font-medium text-gray-800 mb-3 sm:mb-4"
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                transition={{ duration: 0.3 }}
              >
                {currentMessage}
              </motion.h2>
            </AnimatePresence>

            <AnimatePresence mode="wait">
              <motion.p
                key={currentSubtext}
                className="text-base sm:text-lg text-gray-600 max-w-2xl mx-auto"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                transition={{ duration: 0.3, delay: 0.1 }}
              >
                {currentSubtext}
              </motion.p>
            </AnimatePresence>
          </div>

          {/* Navigation Buttons */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.8 }}
            className="flex flex-col sm:flex-row justify-center gap-4 sm:gap-6 w-full max-w-md px-4"
          >
            <motion.button
              onClick={() => handleNavigation('home')}
              className="px-6 sm:px-8 py-3 sm:py-4 bg-green-500 hover:bg-green-600 text-white font-medium rounded-xl flex items-center justify-center gap-2 sm:gap-3 shadow-lg hover:shadow-green-500/30 transition-all w-full"
              whileHover={{ y: -2 }}
              whileTap={{ scale: 0.95 }}
              animate={controls}
            >
              <FiHome className="text-lg sm:text-xl" />
              <span>Go Home</span>
            </motion.button>

            <motion.button
              onClick={() => handleNavigation('back')}
              className="px-6 sm:px-8 py-3 sm:py-4 bg-white hover:bg-gray-50 text-green-500 font-medium rounded-xl flex items-center justify-center gap-2 sm:gap-3 shadow-lg hover:shadow-gray-200/30 transition-all border border-gray-200 w-full"
              whileHover={{ y: -2 }}
              whileTap={{ scale: 0.95 }}
              animate={controls}
            >
              <FiArrowLeft className="text-lg sm:text-xl" />
              <span>Go Back</span>
            </motion.button>
          </motion.div>
        </div>
      </main>
    </>
  );
}