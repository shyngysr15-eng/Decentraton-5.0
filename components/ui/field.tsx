import { cn } from '@/lib/utils';

export function Field({
  label,
  htmlFor,
  hint,
  error,
  children,
  className
}: {
  label: string;
  htmlFor?: string;
  hint?: string;
  error?: string;
  children: React.ReactNode;
  className?: string;
}) {
  return (
    <label htmlFor={htmlFor} className={cn('flex flex-col gap-2', className)}>
      <span className="flex items-center justify-between gap-3 text-sm font-medium text-ink">
        <span>{label}</span>
        {hint ? <span className="text-xs font-normal text-slate">{hint}</span> : null}
      </span>
      {children}
      {error ? <span className="text-xs text-rose-700">{error}</span> : null}
    </label>
  );
}

export function inputClassName(hasError?: boolean) {
  return cn(
    'w-full rounded-2xl border bg-white px-4 py-3 text-sm text-ink outline-none transition placeholder:text-slate/70 focus:border-pine focus:ring-2 focus:ring-pine/15',
    hasError ? 'border-rose-300 ring-2 ring-rose-200' : 'border-black/10'
  );
}