interface EmptyStateProps {
  title: string;
  message?: string;
  command?: string;
  icon?: React.ReactNode;
  className?: string;
}

export function EmptyState({ title, message, command, icon, className = '' }: EmptyStateProps) {
  return (
    <div className={`
      text-center
      p-12
      bg-bg-secondary
      rounded-lg
      border-2
      border-dashed
      border-border-primary
      ${className}
    `}>
      {icon && (
        <div className="mb-4">
          {icon}
        </div>
      )}
      <h3 className="text-lg font-semibold text-text-primary mb-2">
        {title}
      </h3>
      {message && (
        <p className="text-text-secondary mb-4">
          {message}
        </p>
      )}
      {command && (
        <div className="bg-bg-input rounded px-4 py-3 inline-block">
          <code className="text-sm font-terminal text-primary">
            <span className="text-terminal-prompt">$</span> {command}
          </code>
        </div>
      )}
    </div>
  );
}
