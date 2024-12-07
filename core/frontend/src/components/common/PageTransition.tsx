// core/frontend/src/components/common/PageTransition.tsx

import React from 'react';
import { motion } from 'framer-motion';

const pageVariants = {
  initial: {
    opacity: 0,
    x: -200
  },
  in: {
    opacity: 1,
    x: 0
  },
  out: {
    opacity: 0,
    x: 200
  }
};

const pageTransition = {
  type: "tween",
  ease: "anticipate",
  duration: 0.5
};

export const PageTransition: React.FC<{ children: React.ReactNode }> = ({ 
  children 
}) => {
  return (
    <motion.div
      initial="initial"
      animate="in"
      exit="out"
      variants={pageVariants}
      transition={pageTransition}
    >
      {children}
    </motion.div>
  );
};

// Update your routes to use PageTransition
<Route 
  path="/dashboard" 
  element={
    <PageTransition>
      <Dashboard />
    </PageTransition>
  } 
/>
