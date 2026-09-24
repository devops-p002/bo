import { forwardRef } from 'react';

const Button = forwardRef<HTMLButtonElement, any>(({
  children,
  type = 'button',
  variant = 'primary',
  size = 'md',
  fullWidth = false,
  isLoading = false,
  disabled = false,
  className = '',
  onClick,
  ...props
}, ref) => {
  
  // Base classes
  const baseClasses = 'inline-flex items-center justify-center font-medium rounded focus:outline-none transition-colors';
  
  // Size classes
  const sizeClasses = {
    sm: 'px-3 py-1.5 text-xs',
    md: 'px-4 py-2 text-sm',
    lg: 'px-5 py-2.5 text-base',
    xl: 'px-6 py-3 text-lg',
  };
  
  // Variant classes
  const variantClasses = {
    primary: 'bg-blue-600 text-white hover:bg-blue-700 focus:ring-2 focus:ring-blue-500 focus:ring-opacity-50',
    secondary: 'bg-gray-200 text-gray-800 hover:bg-gray-300 focus:ring-2 focus:ring-gray-300 focus:ring-opacity-50',
    success: 'bg-green-600 text-white hover:bg-green-700 focus:ring-2 focus:ring-green-500 focus:ring-opacity-50',
    danger: 'bg-red-600 text-white hover:bg-red-700 focus:ring-2 focus:ring-red-500 focus:ring-opacity-50',
    warning: 'bg-yellow-500 text-white hover:bg-yellow-600 focus:ring-2 focus:ring-yellow-400 focus:ring-opacity-50',
    info: 'bg-cyan-500 text-white hover:bg-cyan-600 focus:ring-2 focus:ring-cyan-400 focus:ring-opacity-50',
    light: 'bg-white text-gray-700 border border-gray-300 hover:bg-gray-100 focus:ring-2 focus:ring-gray-300 focus:ring-opacity-50',
    dark: 'bg-gray-800 text-white hover:bg-gray-900 focus:ring-2 focus:ring-gray-700 focus:ring-opacity-50',
    link: 'bg-transparent text-blue-600 hover:text-blue-800 hover:underline',
  };
  
  // States
  const disabledClasses = 'opacity-60 cursor-not-allowed';
  const fullWidthClasses = 'w-full';
  
  const buttonClasses = [
    baseClasses,
    sizeClasses[size] || sizeClasses.md,
    variantClasses[variant] || variantClasses.primary,
    fullWidth ? fullWidthClasses : '',
    (disabled || isLoading) ? disabledClasses : '',
    className,
  ].filter(Boolean).join(' ');
  
  return (
    <button
      ref={ref}
      type={type}
      className={buttonClasses}
      disabled={disabled || isLoading}
      onClick={onClick}
      {...props}
    >
      {isLoading && (
        <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-current" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
          <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
        </svg>
      )}
      {children}
    </button>
  );
});

Button.displayName = 'Button';

export default Button; 