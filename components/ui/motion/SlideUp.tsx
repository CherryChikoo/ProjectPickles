'use client';

import { motion } from 'framer-motion';
import React from 'react';

interface SlideUpProps {
  children: React.ReactNode;
  delay?: number;
  duration?: number;
  yOffset?: number;
  className?: string;
}

export const SlideUp = ({ children, delay = 0, duration = 0.5, yOffset = 30, className = '' }: SlideUpProps) => {
  return (
    <motion.div
      initial={{ opacity: 0, y: yOffset }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: "-50px" }}
      transition={{ duration, delay, ease: [0.25, 0.1, 0.25, 1.0] }} // smooth ease-out curve
      className={className}
    >
      {children}
    </motion.div>
  );
};
