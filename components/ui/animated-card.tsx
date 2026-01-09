/**
 * AnimatedCard - Card with subtle hover lift effect
 *
 * Drop-in replacement for Card component with added CSS animations.
 * Use for interactive cards (clickable, hoverable).
 * For static cards, use regular Card component.
 */

import * as React from 'react';
import { cn } from '@/lib/utils';

interface AnimatedCardProps extends React.HTMLAttributes<HTMLDivElement> {
  /** Whether the card is clickable (adds cursor-pointer) */
  clickable?: boolean;
}

const AnimatedCard = React.forwardRef<HTMLDivElement, AnimatedCardProps>(
  ({ className, clickable = false, ...props }, ref) => {
    return (
      <div
        ref={ref}
        className={cn(
          'rounded-xl border bg-card text-card-foreground shadow',
          'transition-all duration-200 ease-out',
          'hover:shadow-lg hover:-translate-y-1',
          'active:scale-[0.98]',
          clickable && 'cursor-pointer',
          className
        )}
        {...props}
      />
    );
  }
);
AnimatedCard.displayName = 'AnimatedCard';

const AnimatedCardHeader = React.forwardRef<
  HTMLDivElement,
  React.HTMLAttributes<HTMLDivElement>
>(({ className, ...props }, ref) => (
  <div
    ref={ref}
    className={cn('flex flex-col space-y-1.5 p-6', className)}
    {...props}
  />
));
AnimatedCardHeader.displayName = 'AnimatedCardHeader';

const AnimatedCardTitle = React.forwardRef<
  HTMLHeadingElement,
  React.HTMLAttributes<HTMLHeadingElement>
>(({ className, ...props }, ref) => (
  <h2
    ref={ref}
    className={cn('font-semibold leading-none tracking-tight', className)}
    {...props}
  />
));
AnimatedCardTitle.displayName = 'AnimatedCardTitle';

const AnimatedCardDescription = React.forwardRef<
  HTMLDivElement,
  React.HTMLAttributes<HTMLDivElement>
>(({ className, ...props }, ref) => (
  <div
    ref={ref}
    className={cn('text-sm text-muted-foreground', className)}
    {...props}
  />
));
AnimatedCardDescription.displayName = 'AnimatedCardDescription';

const AnimatedCardContent = React.forwardRef<
  HTMLDivElement,
  React.HTMLAttributes<HTMLDivElement>
>(({ className, ...props }, ref) => (
  <div ref={ref} className={cn('p-6 pt-0', className)} {...props} />
));
AnimatedCardContent.displayName = 'AnimatedCardContent';

const AnimatedCardFooter = React.forwardRef<
  HTMLDivElement,
  React.HTMLAttributes<HTMLDivElement>
>(({ className, ...props }, ref) => (
  <div
    ref={ref}
    className={cn('flex items-center p-6 pt-0', className)}
    {...props}
  />
));
AnimatedCardFooter.displayName = 'AnimatedCardFooter';

export {
  AnimatedCard,
  AnimatedCardHeader,
  AnimatedCardFooter,
  AnimatedCardTitle,
  AnimatedCardDescription,
  AnimatedCardContent,
};
