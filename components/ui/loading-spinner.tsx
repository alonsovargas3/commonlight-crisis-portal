'use client';

import { Loader2 } from "lucide-react";
import { motion } from "framer-motion";
import { cn } from "@/lib/utils";
import { fadeIn, motionSafe, variantsSafe } from "@/lib/animations";

interface LoadingSpinnerProps {
  size?: "sm" | "md" | "lg";
  text?: string;
  className?: string;
}

export function LoadingSpinner({
  size = "md",
  text,
  className,
}: LoadingSpinnerProps) {
  const sizeClasses = {
    sm: "w-4 h-4",
    md: "w-6 h-6",
    lg: "w-8 h-8",
  };

  return (
    <motion.div
      className={cn("flex flex-col items-center justify-center py-12", className)}
      variants={variantsSafe(fadeIn)}
      initial="initial"
      animate="animate"
      transition={{ duration: 0.2 }}
    >
      <Loader2 className={cn(sizeClasses[size], "animate-spin text-gray-400")} />
      {text && (
        <motion.p
          className="mt-4 text-sm text-gray-500 dark:text-gray-400"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.2, duration: 0.3 }}
        >
          {text}
        </motion.p>
      )}
    </motion.div>
  );
}
