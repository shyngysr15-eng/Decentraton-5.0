import { cn } from '@/lib/utils';

const badgeVariants = {
  neutral: 'bg-black/5 text-ink',
  success: 'bg-emerald-100 text-emerald-800',
  warning: 'bg-amber-100 text-amber-800',
  danger: 'bg-rose-100 text-rose-800',
  info: 'bg-sky-100 text-sky-800'
} as const;

type BadgeVariant = keyof typeof badgeVariants;

export function Badge({ children, variant = 'neutral' }: { children: React.ReactNode; variant?: BadgeVariant }) {
  return (
    <span className={cn('inline-flex items-center rounded-full px-3 py-1 text-xs font-semibold', badgeVariants[variant])}>
      {children}
    </span>
  );
}