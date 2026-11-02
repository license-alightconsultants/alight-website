'use client';

import { MotionConfig } from 'framer-motion';

// reducedMotion="user" makes every Framer Motion animation respect prefers-reduced-motion.
export default function Providers({ children }) {
  return <MotionConfig reducedMotion="user">{children}</MotionConfig>;
}
