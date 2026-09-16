import React from 'react';

interface NeoButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary' | 'danger' | 'ghost';
  size?: 'sm' | 'md' | 'lg';
  children: React.ReactNode;
}

const variantClasses: Record<NonNullable<NeoButtonProps['variant']>, string> = {
  primary: 'bg-neo-yellow text-black hover:bg-yellow-300',
  secondary: 'bg-white text-black hover:bg-gray-100',
  danger: 'bg-neo-red text-white hover:bg-red-600',
  ghost: 'bg-neo-lime text-black hover:bg-lime-300',
};

const sizeClasses: Record<NonNullable<NeoButtonProps['size']>, string> = {
  sm: 'px-3 py-1.5 text-sm',
  md: 'px-5 py-2.5 text-base',
  lg: 'px-7 py-3.5 text-lg',
};

export const NeoButton: React.FC<NeoButtonProps> = ({
  variant = 'primary',
  size = 'md',
  className = '',
  children,
  ...props
}) => {
  return (
    <button
      {...props}
      className={`
        font-black uppercase tracking-wide
        border-[3px] border-black
        shadow-neo
        transition-transform duration-75
        active:translate-x-[3px] active:translate-y-[3px] active:shadow-none
        hover:translate-x-[2px] hover:translate-y-[2px] hover:shadow-neo-sm
        disabled:opacity-50 disabled:cursor-not-allowed
        cursor-pointer
        ${variantClasses[variant]}
        ${sizeClasses[size]}
        ${className}
      `}
    >
      {children}
    </button>
  );
};
