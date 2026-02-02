interface StatProps {
  value: number;
  label: string;
  color?: 'primary' | 'success' | 'error' | 'neutral';
}

export function Stat({ value, label, color = 'neutral' }: StatProps) {
  const colorStyles = {
    primary: 'text-primary',
    success: 'text-status-success',
    error: 'text-status-error',
    neutral: 'text-text-secondary'
  };

  return (
    <div className="text-center min-w-[4rem]">
      <span className={`block text-2xl font-bold font-display ${colorStyles[color]}`}>
        {value}
      </span>
      <span className="block text-xs uppercase tracking-wider text-text-muted mt-0.5">
        {label}
      </span>
    </div>
  );
}
