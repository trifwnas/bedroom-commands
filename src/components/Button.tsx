import type { ReactNode, ButtonHTMLAttributes } from 'react';
import type { LucideIcon } from 'lucide-react';

interface Props extends ButtonHTMLAttributes<HTMLButtonElement> {
  icon?: LucideIcon;
  children: ReactNode;
  variant?: 'primary' | 'secondary' | 'danger' | 'ghost';
  size?: 'sm' | 'md' | 'lg';
  fullWidth?: boolean;
}

const variants = {
  primary: 'bg-[var(--primary)] text-white hover:opacity-90 shadow-lg shadow-[var(--primary)]/20',
  secondary: 'bg-[var(--surface)] text-[var(--text)] border border-[var(--border)] hover:bg-[var(--border)]',
  danger: 'bg-red-500 text-white hover:bg-red-600',
  ghost: 'bg-transparent text-[var(--text-sec)] hover:bg-[var(--border)]',
};

const sizes = {
  sm: 'px-3 py-1.5 text-sm gap-1.5',
  md: 'px-4 py-2.5 text-sm gap-2',
  lg: 'px-6 py-3.5 text-base gap-2.5',
};

export function Button({ icon: Icon, children, variant = 'primary', size = 'md', fullWidth, className = '', disabled, ...props }: Props) {
  return (
    <button
      className={`inline-flex items-center justify-center rounded-xl font-semibold transition-all active:scale-95 disabled:opacity-40 disabled:pointer-events-none ${variants[variant]} ${sizes[size]} ${fullWidth ? 'w-full' : ''} ${className}`}
      disabled={disabled}
      {...props}
    >
      {Icon && <Icon size={size === 'sm' ? 14 : size === 'lg' ? 20 : 16} />}
      {children}
    </button>
  );
}
