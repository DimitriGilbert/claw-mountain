export type BadgeVariant = 'success' | 'error' | 'warning' | 'neutral';

interface BadgeProps {
  children: React.ReactNode;
  variant?: BadgeVariant;
  className?: string;
}

export function Badge({ children, variant = 'neutral', className = '' }: BadgeProps) {
  const variantStyles = {
    success: 'bg-status-success-bg text-status-success-text border-status-success/30',
    error: 'bg-status-error-bg text-status-error-text border-status-error/30',
    warning: 'bg-status-warning-bg text-status-warning border-status-warning/30',
    neutral: 'bg-bg-tertiary text-text-secondary border-border-primary'
  };

  return (
    <span
      className={`
        inline-flex
        items-center
        px-3
        py-1
        rounded-full
        text-xs
        font-semibold
        uppercase
        tracking-wider
        border
        ${variantStyles[variant]}
        ${className}
      `}
    >
      {children}
    </span>
  );
}
