import React from 'react';
import { Button } from './Button';

export interface EmptyStateProps extends React.HTMLAttributes<HTMLDivElement> {
  icon?: React.ReactNode;
  title: string;
  description?: string;
  action?: {
    label: string;
    onClick: () => void;
  };
  variant?: 'default' | 'compact';
}

export const EmptyState = React.forwardRef<HTMLDivElement, EmptyStateProps>(
  (
    {
      icon,
      title,
      description,
      action,
      variant = 'default',
      className = '',
      ...props
    },
    ref
  ) => {
    const isCompact = variant === 'compact';

    return (
      <div
        ref={ref}
        className={`flex flex-col items-center justify-center text-center ${
          isCompact ? 'py-8' : 'py-12'
        } ${className}`}
        {...props}
      >
        {icon && (
          <div
            className={`text-eve-500 mb-4 ${
              isCompact ? 'text-4xl' : 'text-6xl'
            }`}
          >
            {icon}
          </div>
        )}

        <h3
          className={`font-semibold text-eve-100 ${
            isCompact ? 'text-base mb-1' : 'text-lg mb-2'
          }`}
        >
          {title}
        </h3>

        {description && (
          <p
            className={`text-eve-400 max-w-md ${
              isCompact ? 'text-sm mb-3' : 'text-sm mb-4'
            }`}
          >
            {description}
          </p>
        )}

        {action && (
          <Button
            onClick={action.onClick}
            variant="primary"
            size={isCompact ? 'sm' : 'md'}
          >
            {action.label}
          </Button>
        )}
      </div>
    );
  }
);

EmptyState.displayName = 'EmptyState';

// Specialized variants for common use cases
export interface EmptyListProps extends Omit<EmptyStateProps, 'icon' | 'title'> {
  resource?: string;
}

export const EmptyList = React.forwardRef<HTMLDivElement, EmptyListProps>(
  ({ resource = 'items', description, action, ...props }, ref) => {
    return (
      <EmptyState
        ref={ref}
        icon={<span>📋</span>}
        title={`No ${resource} found`}
        description={description || `There are no ${resource} to display yet.`}
        action={action}
        {...props}
      />
    );
  }
);

EmptyList.displayName = 'EmptyList';

export const EmptySearch = React.forwardRef<HTMLDivElement, Omit<EmptyStateProps, 'icon' | 'title'>>(
  ({ description, action, ...props }, ref) => {
    return (
      <EmptyState
        ref={ref}
        icon={<span>🔍</span>}
        title="No results found"
        description={description || 'Try adjusting your search or filters.'}
        action={action}
        variant="compact"
        {...props}
      />
    );
  }
);

EmptySearch.displayName = 'EmptySearch';
