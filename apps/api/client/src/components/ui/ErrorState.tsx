import React from 'react';
import { Button } from './Button';

export interface ErrorStateProps extends React.HTMLAttributes<HTMLDivElement> {
  error?: Error | string;
  title?: string;
  message?: string;
  onRetry?: () => void;
  retryLabel?: string;
  variant?: 'default' | 'compact' | 'inline';
}

export const ErrorState = React.forwardRef<HTMLDivElement, ErrorStateProps>(
  (
    {
      error,
      title = 'Something went wrong',
      message,
      onRetry,
      retryLabel = 'Try again',
      variant = 'default',
      className = '',
      ...props
    },
    ref
  ) => {
    const errorMessage =
      message ||
      (error instanceof Error ? error.message : error) ||
      'An unexpected error occurred. Please try again.';

    const isCompact = variant === 'compact';
    const isInline = variant === 'inline';

    if (isInline) {
      return (
        <div
          ref={ref}
          className={`flex items-center gap-3 px-4 py-3 bg-error-900/50 border border-error-700 rounded-lg ${className}`}
          {...props}
        >
          <span className="text-error-400 text-xl">⚠️</span>
          <div className="flex-1 min-w-0">
            <p className="text-sm text-error-200">{errorMessage}</p>
          </div>
          {onRetry && (
            <Button onClick={onRetry} variant="secondary" size="sm">
              {retryLabel}
            </Button>
          )}
        </div>
      );
    }

    return (
      <div
        ref={ref}
        className={`flex flex-col items-center justify-center text-center ${
          isCompact ? 'py-8' : 'py-12'
        } ${className}`}
        {...props}
      >
        <div
          className={`text-error-400 mb-4 ${
            isCompact ? 'text-4xl' : 'text-6xl'
          }`}
        >
          ⚠️
        </div>

        <h3
          className={`font-semibold text-error-200 ${
            isCompact ? 'text-base mb-1' : 'text-lg mb-2'
          }`}
        >
          {title}
        </h3>

        <p
          className={`text-eve-400 max-w-md ${
            isCompact ? 'text-sm mb-3' : 'text-sm mb-4'
          }`}
        >
          {errorMessage}
        </p>

        {onRetry && (
          <Button
            onClick={onRetry}
            variant="secondary"
            size={isCompact ? 'sm' : 'md'}
          >
            {retryLabel}
          </Button>
        )}
      </div>
    );
  }
);

ErrorState.displayName = 'ErrorState';

// Network error variant
export interface NetworkErrorProps extends Omit<ErrorStateProps, 'title' | 'error'> {
  message?: string;
}

export const NetworkError = React.forwardRef<HTMLDivElement, NetworkErrorProps>(
  ({ message, onRetry, ...props }, ref) => {
    return (
      <ErrorState
        ref={ref}
        title="Connection error"
        message={message || 'Unable to connect to the server. Please check your connection.'}
        onRetry={onRetry}
        retryLabel="Reconnect"
        {...props}
      />
    );
  }
);

NetworkError.displayName = 'NetworkError';

// Permission error variant
export interface PermissionErrorProps extends Omit<ErrorStateProps, 'title' | 'error'> {
  message?: string;
}

export const PermissionError = React.forwardRef<HTMLDivElement, PermissionErrorProps>(
  ({ message, ...props }, ref) => {
    return (
      <ErrorState
        ref={ref}
        title="Access denied"
        message={message || "You don't have permission to access this resource."}
        {...props}
      />
    );
  }
);

PermissionError.displayName = 'PermissionError';
