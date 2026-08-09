'use client';

import { motion } from 'framer-motion';
import React from 'react';

interface StaggerContainerProps {
  children: React.ReactNode;
  delayChildren?: number;
  staggerChildren?: number;
  className?: string;
  forceAnimate?: boolean;
}

export const StaggerContainer = ({ 
  children, 
  delayChildren = 0, 
  staggerChildren = 0.1, 
  className = '',
  forceAnimate = false
}: StaggerContainerProps) => {
  return (
    <motion.div
      initial="hidden"
      whileInView={!forceAnimate ? "visible" : undefined}
      animate={forceAnimate ? "visible" : undefined}
      viewport={!forceAnimate ? { once: true, margin: "-50px" } : undefined}
      variants={{
        hidden: {},
        visible: {
          transition: {
            delayChildren,
            staggerChildren,
          },
        },
      }}
      className={className}
    >
      {children}
    </motion.div>
  );
};

interface StaggerItemProps {
  children: React.ReactNode;
  className?: string;
  yOffset?: number;
  xOffset?: number;
}

export const StaggerItem = ({ children, className = '', yOffset = 20, xOffset = 0 }: StaggerItemProps) => {
  return (
    <motion.div
      variants={{
        hidden: { opacity: 0, y: yOffset, x: xOffset },
        visible: { 
          opacity: 1, 
          y: 0,
          x: 0,
          transition: { duration: 0.5, ease: [0.25, 0.1, 0.25, 1.0] }
        }
      }}
      className={className}
    >
      {children}
    </motion.div>
  );
};
