/**
 * Animation Utilities - Reusable motion variants for consistent UI polish
 *
 * Uses framer-motion for smooth, accessible animations.
 * All animations respect prefers-reduced-motion.
 */

import { Variants } from 'framer-motion';

/**
 * Check if user prefers reduced motion
 */
export const prefersReducedMotion = (): boolean => {
  if (typeof window === 'undefined') return false;
  return window.matchMedia('(prefers-reduced-motion: reduce)').matches;
};

/**
 * Page transition variants (fade in)
 */
export const pageTransition: Variants = {
  initial: { opacity: 0 },
  animate: { opacity: 1 },
  exit: { opacity: 0 },
};

export const pageTransitionConfig = {
  initial: 'initial',
  animate: 'animate',
  exit: 'exit',
  transition: { duration: 0.2, ease: 'easeInOut' },
};

/**
 * Modal/Sheet slide-in variants
 */
export const modalSlideIn: Variants = {
  initial: { y: 20, opacity: 0 },
  animate: { y: 0, opacity: 1 },
  exit: { y: 20, opacity: 0 },
};

export const modalSlideInConfig = {
  initial: 'initial',
  animate: 'animate',
  exit: 'exit',
  transition: { duration: 0.25, ease: 'easeOut' },
};

/**
 * Card hover lift effect
 */
export const cardHover = {
  rest: { y: 0, scale: 1 },
  hover: { y: -4, scale: 1.01 },
  tap: { scale: 0.98 },
};

export const cardHoverConfig = {
  initial: 'rest',
  whileHover: 'hover',
  whileTap: 'tap',
  transition: { duration: 0.2, ease: 'easeOut' },
};

/**
 * Button interaction variants
 */
export const buttonPress = {
  rest: { scale: 1 },
  hover: { scale: 1.02 },
  tap: { scale: 0.95 },
};

export const buttonPressConfig = {
  initial: 'rest',
  whileHover: 'hover',
  whileTap: 'tap',
  transition: { duration: 0.15, ease: 'easeInOut' },
};

/**
 * Toast notification slide-in (from right)
 */
export const toastSlideIn: Variants = {
  initial: { x: 400, opacity: 0 },
  animate: { x: 0, opacity: 1 },
  exit: { x: 400, opacity: 0 },
};

export const toastSlideInConfig = {
  initial: 'initial',
  animate: 'animate',
  exit: 'exit',
  transition: { duration: 0.3, ease: 'easeOut' },
};

/**
 * Fade in variants (for content loading)
 */
export const fadeIn: Variants = {
  initial: { opacity: 0 },
  animate: { opacity: 1 },
  exit: { opacity: 0 },
};

export const fadeInConfig = {
  initial: 'initial',
  animate: 'animate',
  exit: 'exit',
  transition: { duration: 0.2 },
};

/**
 * Stagger children animation (for lists)
 */
export const staggerContainer: Variants = {
  initial: {},
  animate: {
    transition: {
      staggerChildren: 0.05,
    },
  },
};

export const staggerItem: Variants = {
  initial: { opacity: 0, y: 10 },
  animate: { opacity: 1, y: 0 },
};

export const staggerConfig = {
  container: {
    initial: 'initial',
    animate: 'animate',
    variants: staggerContainer,
  },
  item: {
    variants: staggerItem,
    transition: { duration: 0.2 },
  },
};

/**
 * Scale in animation (for modals, popovers)
 */
export const scaleIn: Variants = {
  initial: { scale: 0.9, opacity: 0 },
  animate: { scale: 1, opacity: 1 },
  exit: { scale: 0.9, opacity: 0 },
};

export const scaleInConfig = {
  initial: 'initial',
  animate: 'animate',
  exit: 'exit',
  transition: { duration: 0.2, ease: 'easeOut' },
};

/**
 * Loading spinner rotation (continuous)
 */
export const spinnerRotate = {
  animate: {
    rotate: 360,
  },
};

export const spinnerRotateConfig = {
  animate: 'animate',
  transition: {
    duration: 1,
    repeat: Infinity,
    ease: 'linear',
  },
};

/**
 * Success checkmark animation (scale + fade)
 */
export const successCheckmark: Variants = {
  initial: { scale: 0, opacity: 0 },
  animate: {
    scale: [0, 1.2, 1],
    opacity: 1,
  },
};

export const successCheckmarkConfig = {
  initial: 'initial',
  animate: 'animate',
  transition: {
    duration: 0.5,
    times: [0, 0.6, 1],
    ease: 'easeOut',
  },
};

/**
 * Progress bar fill animation
 */
export const progressFill = (progress: number) => ({
  initial: { width: '0%' },
  animate: { width: `${progress}%` },
});

export const progressFillConfig = {
  transition: { duration: 0.5, ease: 'easeInOut' },
};

/**
 * Skeleton pulse animation (for loading states)
 */
export const skeletonPulse: Variants = {
  animate: {
    opacity: [0.5, 1, 0.5],
  },
};

export const skeletonPulseConfig = {
  animate: 'animate',
  transition: {
    duration: 1.5,
    repeat: Infinity,
    ease: 'easeInOut',
  },
};

/**
 * Accordion expand/collapse
 */
export const accordionExpand: Variants = {
  collapsed: { height: 0, opacity: 0 },
  expanded: { height: 'auto', opacity: 1 },
};

export const accordionExpandConfig = {
  initial: 'collapsed',
  animate: 'expanded',
  exit: 'collapsed',
  transition: { duration: 0.25, ease: 'easeInOut' },
};

/**
 * Helper: Create motion-safe animation config
 * Returns instant transitions if user prefers reduced motion
 */
export const motionSafe = <T extends object>(config: T): T => {
  if (prefersReducedMotion()) {
    return {
      ...config,
      transition: { duration: 0 },
    } as T;
  }
  return config;
};

/**
 * Helper: Create motion-safe variants
 * Returns same state for all variants if user prefers reduced motion
 */
export const variantsSafe = (variants: Variants): Variants => {
  if (prefersReducedMotion()) {
    const animateState = variants.animate;
    return {
      initial: animateState,
      animate: animateState,
      exit: animateState,
      hover: animateState,
      tap: animateState,
    };
  }
  return variants;
};
