export type ButtonVariant = 'primary' | 'secondary' | 'success' | 'danger' | 'ghost';
export type ButtonSize = 'sm' | 'md' | 'lg';

interface ButtonProps {
  children: React.ReactNode;
  variant?: ButtonVariant;
  size?: ButtonSize;
  disabled?: boolean;
  loading?: boolean;
  className?: string;
  onClick?: () => void;
  type?: 'button' | 'submit' | 'reset';
  href?: string;
  target?: string;
  rel?: string;
}

export function Button({
  children,
  variant = 'primary',
  size = 'md',
  disabled = false,
  loading = false,
  className = '',
  onClick,
  type = 'button',
  href,
  target,
  rel
}: ButtonProps) {
  const variantStyles = {
    primary: 'bg-action-primary text-text-inverse hover:bg-action-primary-hover hover:scale-[1.02]',
    secondary: 'bg-action-secondary text-text-inverse hover:bg-action-secondary-hover hover:scale-[1.02]',
    success: 'bg-action-success text-text-inverse hover:bg-action-success-hover hover:scale-[1.02]',
    danger: 'bg-action-danger text-action-danger-text border border-action-danger-border hover:bg-action-danger-bg-hover',
    ghost: 'bg-action-ghost text-action-ghost-text border border-action-ghost-border hover:bg-action-ghost-hover hover:text-action-ghost-text-hover'
  };

  const sizeStyles = {
    sm: 'px-3 py-1.5 text-sm',
    md: 'px-4 py-2 text-sm',
    lg: 'px-6 py-3 text-base'
  };

  const baseStyles = `
    font-medium
    rounded-lg
    transition-all
    duration-[var(--transition-base)]
    ease-out
    focus:outline-none
    focus:ring-2
    focus:ring-action-secondary
    focus:ring-offset-2
    focus:ring-offset-bg-primary
    disabled:opacity-50
    disabled:cursor-not-allowed
    disabled:pointer-events-none
    ${variantStyles[variant]}
    ${sizeStyles[size]}
  `;

  const buttonElement = (
    <button
      type={type}
      disabled={disabled || loading}
      onClick={onClick}
      className={`${baseStyles} ${className}`}
    >
      {loading ? (
        <>
          <span className="inline-flex items-center">
            <span className="w-4 h-4 mr-2 border-2 border-current border-t-transparent rounded-full animate-spin" />
            {children}
          </span>
        </>
      ) : (
        children
      )}
    </button>
  );

  if (href) {
    return (
      <a
        href={href}
        target={target}
        rel={rel}
        className={`${baseStyles} ${className} no-underline`}
      >
        {children}
      </a>
    );
  }

  return buttonElement;
}
