/**
 * StaggerList - Animated list with staggered children
 *
 * Wraps a list to animate children with staggered timing.
 * Each child fades in and slides up sequentially.
 *
 * Usage:
 * <StaggerList>
 *   <StaggerItem>Item 1</StaggerItem>
 *   <StaggerItem>Item 2</StaggerItem>
 *   <StaggerItem>Item 3</StaggerItem>
 * </StaggerList>
 */

'use client';

import { motion } from 'framer-motion';
import { staggerContainer, staggerItem, motionSafe, variantsSafe } from '@/lib/animations';

interface StaggerListProps {
  children: React.ReactNode;
  className?: string;
  /** Delay between each child animation (in seconds) */
  staggerDelay?: number;
}

export function StaggerList({ children, className, staggerDelay = 0.05 }: StaggerListProps) {
  const containerVariants = {
    ...staggerContainer,
    animate: {
      transition: {
        staggerChildren: staggerDelay,
      },
    },
  };

  return (
    <motion.div
      variants={variantsSafe(containerVariants)}
      initial="initial"
      animate="animate"
      className={className}
    >
      {children}
    </motion.div>
  );
}

interface StaggerItemProps {
  children: React.ReactNode;
  className?: string;
}

export function StaggerItem({ children, className }: StaggerItemProps) {
  return (
    <motion.div
      variants={variantsSafe(staggerItem)}
      transition={{ duration: 0.2 }}
      className={className}
    >
      {children}
    </motion.div>
  );
}
