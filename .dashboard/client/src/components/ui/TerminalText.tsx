interface TerminalTextProps {
  children: React.ReactNode;
  prompt?: string;
  showPrompt?: boolean;
  className?: string;
}

export function TerminalText({ children, prompt = '$', showPrompt = true, className = '' }: TerminalTextProps) {
  return (
    <code className={`
      font-terminal
      text-sm
      ${className}
    `}>
      {showPrompt && (
        <span className="text-terminal-prompt mr-2">
          {prompt}
        </span>
      )}
      <span className="text-text-secondary">
        {children}
      </span>
    </code>
  );
}
