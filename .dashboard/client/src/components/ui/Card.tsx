export type CardStatus = 'running' | 'stopped' | 'unknown';

interface CardProps {
  children: React.ReactNode;
  status?: CardStatus;
  className?: string;
  onClick?: () => void;
}

export function Card({ children, status = 'unknown', className = '', onClick }: CardProps) {
  const statusColors = {
    running: 'border-l-[3px] border-l-status-success hover:shadow-card-hover hover:shadow-success',
    stopped: 'border-l-[3px] border-l-status-error hover:shadow-card-hover hover:shadow-error',
    unknown: 'border-l-[3px] border-l-border-primary'
  };

  const cardClass = `
    bg-bg-secondary
    rounded-lg
    p-6
    border border-border-primary
    transition-all
    duration-[var(--transition-smooth)]
    ${statusColors[status]}
    hover:border-border-hover
    hover:-translate-y-px
    ${className}
  `;

  if (onClick) {
    return (
      <button
        type="button"
        onClick={onClick}
        className={cardClass}
      >
        {children}
      </button>
    );
  }

  return (
    <div className={cardClass}>
      {children}
    </div>
  );
}
