'use client';

import * as React from 'react';

import { cn } from '@/lib/utils';

const buttonVariants = {
  primary: 'bg-pine text-white hover:bg-[#183d35] disabled:bg-pine/50',
  secondary: 'bg-white text-ink border border-black/10 hover:bg-mist',
  ghost: 'bg-transparent text-slate hover:bg-black/5'
} as const;

type ButtonVariant = keyof typeof buttonVariants;

export interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: ButtonVariant;
}

export const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(function Button(
  { className, variant = 'primary', type = 'button', ...props },
  ref
) {
  return (
    <button
      ref={ref}
      type={type}
      className={cn(
        'inline-flex items-center justify-center rounded-xl px-4 py-2.5 text-sm font-semibold transition disabled:cursor-not-allowed',
        buttonVariants[variant],
        className
      )}
      {...props}
    />
  );
});