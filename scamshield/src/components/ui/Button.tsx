import type { ButtonHTMLAttributes, ReactNode } from 'react';
import { Link } from 'react-router-dom';

type Variant = 'primary' | 'secondary' | 'ghost' | 'danger';
type Size = 'sm' | 'md' | 'lg';

const base =
  'inline-flex items-center justify-center gap-2 rounded-xl font-medium transition-colors disabled:cursor-not-allowed disabled:opacity-50 whitespace-nowrap';
const variants: Record<Variant, string> = {
  primary: 'bg-sky-500 text-ink-950 hover:bg-sky-400 shadow-[0_8px_24px_-10px_rgba(14,165,233,0.7)]',
  secondary: 'border border-white/10 bg-white/[0.04] text-slate-100 hover:bg-white/[0.08]',
  ghost: 'text-slate-300 hover:bg-white/[0.06] hover:text-slate-50',
  danger: 'border border-red-400/30 bg-red-500/10 text-red-200 hover:bg-red-500/20',
};
const sizes: Record<Size, string> = {
  sm: 'h-9 px-3 text-sm',
  md: 'h-11 px-4 text-sm',
  lg: 'h-12 px-5 text-[15px]',
};

export function buttonClass(variant: Variant = 'primary', size: Size = 'md', extra = '') {
  return `${base} ${variants[variant]} ${sizes[size]} ${extra}`;
}

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: Variant;
  size?: Size;
}

export function Button({ variant = 'primary', size = 'md', className = '', type = 'button', ...rest }: ButtonProps) {
  return <button type={type} className={buttonClass(variant, size, className)} {...rest} />;
}

export function ButtonLink({
  to,
  variant = 'primary',
  size = 'md',
  className = '',
  children,
}: {
  to: string;
  variant?: Variant;
  size?: Size;
  className?: string;
  children: ReactNode;
}) {
  return (
    <Link to={to} className={buttonClass(variant, size, className)}>
      {children}
    </Link>
  );
}
