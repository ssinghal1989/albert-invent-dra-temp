import React from 'react';
import { InlineLoader } from './Loader';

interface LoadingButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  loading?: boolean;
  loadingText?: string;
  variant?: 'primary' | 'secondary' | 'outline' | 'ghost';
  size?: 'sm' | 'md' | 'lg' | 'xl';
  children: React.ReactNode;
  style?: React.CSSProperties;
}

export function LoadingButton({
  loading = false,
  loadingText,
  variant = 'primary',
  size = 'md',
  children,
  disabled,
  className = '',
  ...props
}: LoadingButtonProps) {
  const baseClasses = 'inline-flex items-center justify-center font-semibold rounded-xl transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-offset-2';
  
  const variantClasses = {
    primary: 'bg-primary text-white hover:opacity-90 focus:ring-primary disabled:bg-gray-300',
    secondary: 'bg-secondary text-white hover:bg-gray-600 focus:ring-secondary disabled:bg-gray-300',
    outline: 'border-2 border-primary text-primary hover:bg-primary hover:text-white focus:ring-primary disabled:border-gray-300 disabled:text-gray-400',
    ghost: 'text-primary hover:bg-blue-50 focus:ring-primary disabled:text-gray-400'
  };

  const sizeClasses = {
    sm: 'px-3 py-2 text-sm',
    md: 'px-6 py-3 text-base',
    lg: 'px-8 py-3 text-lg',
    xl: 'px-12 py-4 text-xl',
  };

  const isDisabled = disabled || loading;

  return (
    <button
      {...props}
      disabled={isDisabled}
      className={`${baseClasses} ${variantClasses[variant]} ${sizeClasses[size]} ${className} ${
        isDisabled ? 'cursor-not-allowed' : 'cursor-pointer'
      }`}
    >
      {loading && (
        <InlineLoader 
          size={size === 'lg' ? 'md' : 'sm'} 
          color={variant === 'outline' || variant === 'ghost' ? 'primary' : 'white'}
          className="mr-2" 
        />
      )}
      <span>{loading && loadingText ? loadingText : children}</span>
    </button>
  );
}