import React from 'react';

export interface SkeletonProps extends React.HTMLAttributes<HTMLDivElement> {
  className?: string;
}

export const SkeletonText = React.forwardRef<HTMLDivElement, SkeletonProps>(
  ({ className = '', ...props }, ref) => {
    return (
      <div
        ref={ref}
        className={`animate-pulse bg-eve-700 rounded ${className}`}
        {...props}
      />
    );
  }
);

SkeletonText.displayName = 'SkeletonText';

export const SkeletonCard = React.forwardRef<HTMLDivElement, SkeletonProps>(
  ({ className = '', ...props }, ref) => {
    return (
      <div
        ref={ref}
        className={`animate-pulse bg-eve-800 rounded-lg border border-eve-700 p-6 ${className}`}
        {...props}
      >
        <SkeletonText className="h-4 w-3/4 mb-2" />
        <SkeletonText className="h-3 w-1/2" />
      </div>
    );
  }
);

SkeletonCard.displayName = 'SkeletonCard';

export const SkeletonTable = React.forwardRef<HTMLDivElement, SkeletonProps>(
  ({ className = '', ...props }, ref) => {
    return (
      <div
        ref={ref}
        className={`animate-pulse space-y-3 ${className}`}
        {...props}
      >
        <div className="flex gap-4">
          <SkeletonText className="h-4 flex-1" />
          <SkeletonText className="h-4 flex-1" />
          <SkeletonText className="h-4 flex-1" />
        </div>
        <div className="flex gap-4">
          <SkeletonText className="h-4 flex-1" />
          <SkeletonText className="h-4 flex-1" />
          <SkeletonText className="h-4 flex-1" />
        </div>
        <div className="flex gap-4">
          <SkeletonText className="h-4 flex-1" />
          <SkeletonText className="h-4 flex-1" />
          <SkeletonText className="h-4 flex-1" />
        </div>
      </div>
    );
  }
);

SkeletonTable.displayName = 'SkeletonTable';

export const SkeletonBadge = React.forwardRef<HTMLDivElement, SkeletonProps>(
  ({ className = '', ...props }, ref) => {
    return (
      <div
        ref={ref}
        className={`animate-pulse bg-eve-700 rounded-full h-5 w-16 ${className}`}
        {...props}
      />
    );
  }
);

SkeletonBadge.displayName = 'SkeletonBadge';

// Size variant interfaces for more flexibility
export interface SkeletonSizeProps extends SkeletonProps {
  size?: 'sm' | 'md' | 'lg';
}

const sizeClasses = {
  sm: 'h-3',
  md: 'h-4',
  lg: 'h-6',
};

export const SkeletonLine = React.forwardRef<HTMLDivElement, SkeletonSizeProps>(
  ({ size = 'md', className = '', ...props }, ref) => {
    return (
      <SkeletonText
        ref={ref}
        className={`${sizeClasses[size]} ${className}`}
        {...props}
      />
    );
  }
);

SkeletonLine.displayName = 'SkeletonLine';
