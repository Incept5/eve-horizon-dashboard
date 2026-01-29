import React from 'react';

export interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  error?: string;
  helperText?: string;
  fullWidth?: boolean;
}

export const Input = React.forwardRef<HTMLInputElement, InputProps>(
  (
    {
      label,
      error,
      helperText,
      fullWidth = false,
      className = '',
      id,
      disabled,
      ...props
    },
    ref
  ) => {
    const inputId = id || `input-${Math.random().toString(36).substr(2, 9)}`;

    const baseStyles =
      'px-4 py-2 bg-eve-900 border rounded-lg text-white placeholder-eve-400 transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-eve-600 focus:border-transparent disabled:opacity-50 disabled:cursor-not-allowed';

    const errorStyles = error
      ? 'border-error-600 focus:ring-error-600'
      : 'border-eve-700 hover:border-eve-600';

    const widthStyles = fullWidth ? 'w-full' : '';

    return (
      <div className={fullWidth ? 'w-full' : ''}>
        {label && (
          <label
            htmlFor={inputId}
            className="block text-sm font-medium text-eve-200 mb-2"
          >
            {label}
          </label>
        )}
        <input
          ref={ref}
          id={inputId}
          disabled={disabled}
          className={`${baseStyles} ${errorStyles} ${widthStyles} ${className}`}
          {...props}
        />
        {error && (
          <p className="mt-1.5 text-sm text-error-400 flex items-center gap-1">
            <svg
              className="w-4 h-4"
              fill="currentColor"
              viewBox="0 0 20 20"
              xmlns="http://www.w3.org/2000/svg"
            >
              <path
                fillRule="evenodd"
                d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z"
                clipRule="evenodd"
              />
            </svg>
            {error}
          </p>
        )}
        {helperText && !error && (
          <p className="mt-1.5 text-sm text-eve-400">{helperText}</p>
        )}
      </div>
    );
  }
);

Input.displayName = 'Input';
