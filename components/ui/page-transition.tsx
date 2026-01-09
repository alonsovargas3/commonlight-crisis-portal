/**
 * PageTransition - Smooth fade-in page transitions
 *
 * Wrap page content with this component for consistent page load animations.
 * Respects prefers-reduced-motion.
 */

'use client';

import { motion } from 'framer-motion';
import { pageTransition, motionSafe, variantsSafe } from '@/lib/animations';

interface PageTransitionProps {
  children: React.ReactNode;
  className?: string;
}

export function PageTransition({ children, className }: PageTransitionProps) {
  return (
    <motion.div
      variants={variantsSafe(pageTransition)}
      initial="initial"
      animate="animate"
      exit="exit"
      transition={{ duration: 0.2, ease: 'easeInOut' }}
      className={className}
    >
      {children}
    </motion.div>
  );
}
