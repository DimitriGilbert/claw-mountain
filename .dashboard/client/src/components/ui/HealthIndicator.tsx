export type HealthStatus = 'ok' | 'checking' | 'error';

interface HealthIndicatorProps {
  status: HealthStatus;
  label?: string;
  showLabel?: boolean;
  className?: string;
}

export function HealthIndicator({ status, label = 'Health', showLabel = true, className = '' }: HealthIndicatorProps) {
  const statusStyles = {
    ok: 'bg-status-success shadow-success',
    checking: 'bg-status-neutral animate-pulse',
    error: 'bg-status-error shadow-error'
  };

  const statusLabels = {
    ok: 'OK',
    checking: 'Checking...',
    error: 'Error'
  };

  return (
    <div className={`flex items-center gap-2 ${className}`}>
      <div
        className={`
          w-2 h-2 rounded-full
          ${statusStyles[status]}
          shadow-lg
        `}
      />
      {showLabel && (
        <span className="text-sm font-medium text-text-secondary">
          {label}: <span className={status === 'checking' ? 'text-text-muted italic' : ''}>{statusLabels[status]}</span>
        </span>
      )}
    </div>
  );
}
