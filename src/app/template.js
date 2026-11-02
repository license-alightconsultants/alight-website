'use client';

import { motion } from 'framer-motion';

// Re-mounts on every navigation, giving each page a soft entrance. Respects reduced motion via MotionConfig.
export default function Template({ children }) {
  return (
    // Opacity only: a transform here would break position:fixed/sticky descendants (e.g. the admin sidebar).
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ duration: 0.4, ease: [0.22, 1, 0.36, 1] }}>
      {children}
    </motion.div>
  );
}
