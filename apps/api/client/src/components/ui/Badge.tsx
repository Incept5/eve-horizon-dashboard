import React from 'react';

export type BadgeVariant =
  | 'default'
  | 'success'
  | 'warning'
  | 'error'
  | 'info'
  | 'idea'
  | 'backlog'
  | 'ready'
  | 'active'
  | 'review'
  | 'done'
  | 'cancelled';

export interface BadgeProps extends React.HTMLAttributes<HTMLSpanElement> {
  variant?: BadgeVariant;
}

const variantStyles: Record<BadgeVariant, string> = {
  default: 'bg-eve-800 text-eve-200 border-eve-700',
  success: 'bg-success-900/50 text-success-300 border-success-700',
  warning: 'bg-warning-900/50 text-warning-300 border-warning-700',
  error: 'bg-error-900/50 text-error-300 border-error-700',
  info: 'bg-info-900/50 text-info-300 border-info-700',
  // Phase-specific badges
  idea: 'bg-gray-800 text-gray-300 border-gray-700',
  backlog: 'bg-purple-900/50 text-purple-300 border-purple-700',
  ready: 'bg-blue-900/50 text-blue-300 border-blue-700',
  active: 'bg-amber-900/50 text-amber-300 border-amber-700',
  review: 'bg-orange-900/50 text-orange-300 border-orange-700',
  done: 'bg-green-900/50 text-green-300 border-green-700',
  cancelled: 'bg-red-900/50 text-red-300 border-red-700',
};

const variantLabels: Record<BadgeVariant, string> = {
  default: 'Default',
  success: 'Success',
  warning: 'Warning',
  error: 'Error',
  info: 'Info',
  idea: 'Idea',
  backlog: 'Backlog',
  ready: 'Ready',
  active: 'Active',
  review: 'Review',
  done: 'Done',
  cancelled: 'Cancelled',
};

export const Badge = React.forwardRef<HTMLSpanElement, BadgeProps>(
  ({ variant = 'default', className = '', children, ...props }, ref) => {
    const baseStyles =
      'inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium border';

    return (
      <span
        ref={ref}
        className={`${baseStyles} ${variantStyles[variant]} ${className}`}
        {...props}
      >
        {children || variantLabels[variant]}
      </span>
    );
  }
);

Badge.displayName = 'Badge';

// Helper component for phase badges specifically
export interface PhaseBadgeProps extends Omit<BadgeProps, 'variant'> {
  phase: 'idea' | 'backlog' | 'ready' | 'active' | 'review' | 'done' | 'cancelled';
}

export const PhaseBadge = React.forwardRef<HTMLSpanElement, PhaseBadgeProps>(
  ({ phase, ...props }, ref) => {
    return <Badge ref={ref} variant={phase} {...props} />;
  }
);

PhaseBadge.displayName = 'PhaseBadge';
