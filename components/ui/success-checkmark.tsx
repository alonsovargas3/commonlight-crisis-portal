/**
 * SuccessCheckmark - Animated success indicator
 *
 * Shows a checkmark with scale animation for successful operations.
 * Use after form submissions, file uploads, etc.
 */

'use client';

import { CheckCircle2 } from 'lucide-react';
import { motion } from 'framer-motion';
import { cn } from '@/lib/utils';
import { successCheckmark, motionSafe, variantsSafe } from '@/lib/animations';

interface SuccessCheckmarkProps {
  size?: 'sm' | 'md' | 'lg';
  text?: string;
  className?: string;
}

export function SuccessCheckmark({
  size = 'md',
  text,
  className,
}: SuccessCheckmarkProps) {
  const sizeClasses = {
    sm: 'w-6 h-6',
    md: 'w-12 h-12',
    lg: 'w-16 h-16',
  };

  return (
    <div className={cn('flex flex-col items-center justify-center py-12', className)}>
      <motion.div
        variants={variantsSafe(successCheckmark)}
        initial="initial"
        animate="animate"
        transition={{
          duration: 0.5,
          times: [0, 0.6, 1],
          ease: 'easeOut',
        }}
      >
        <CheckCircle2 className={cn(sizeClasses[size], 'text-green-500')} />
      </motion.div>
      {text && (
        <motion.p
          className="mt-4 text-sm text-gray-700 dark:text-gray-300 font-medium"
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3, duration: 0.3 }}
        >
          {text}
        </motion.p>
      )}
    </div>
  );
}
