import { MoltStatus } from '../types';
import { HealthPanel } from './HealthPanel';

interface MoltListProps {
  molts: MoltStatus[];
  onStart: (name: string) => void;
  onStop: (name: string) => void;
}

export function MoltList({ molts, onStart, onStop }: MoltListProps) {
  if (molts.length === 0) {
    return (
      <div className="text-center p-12 text-text-muted bg-bg-secondary rounded-lg border-2 border-dashed border-border-primary">
        No molts found. Create one with: clmnt molt create &lt;name&gt;
      </div>
    );
  }

  return (
    <div className="grid gap-4">
      {molts.map((molt) => (
        <div 
          key={molt.name} 
          className={`bg-bg-secondary rounded-lg p-6 border border-border-primary transition-all hover:border-border-hover hover:-translate-y-0.5 ${
            molt.status.startsWith('running') ? 'border-l-4 border-l-status-success' : 'border-l-4 border-l-status-error'
          }`}
        >
          <div className="flex justify-between items-center mb-4">
            <h3 className="text-xl font-semibold text-text-primary">{molt.name}</h3>
            <span className={`px-3 py-1 rounded-full text-xs font-semibold uppercase tracking-wider text-text-inverse ${
              molt.status.startsWith('running') ? 'bg-status-success' : 'bg-status-error'
            }`}>
              {molt.status}
            </span>
          </div>
          
          <div className="grid grid-cols-[repeat(auto-fit,minmax(150px,1fr))] gap-3 mb-4">
            <div className="flex gap-2">
              <span className="text-text-muted text-sm">Port:</span>
              <span className="text-text-secondary text-sm font-medium">{molt.port}</span>
            </div>
            <div className="flex gap-2">
              <span className="text-text-muted text-sm">PID:</span>
              <span className="text-text-secondary text-sm font-medium">{molt.pid || 'N/A'}</span>
            </div>
            <div className="flex gap-2">
              <span className="text-text-muted text-sm">Docker:</span>
              <span className="text-text-secondary text-sm font-medium">{molt.docker}</span>
            </div>
            <div className="flex gap-2">
              <span className="text-text-muted text-sm">Created:</span>
              <span className="text-text-secondary text-sm font-medium">{molt.created || 'N/A'}</span>
            </div>
          </div>

          <HealthPanel 
            moltName={molt.name} 
            isRunning={molt.status.startsWith('running')} 
          />

          <div className="flex gap-2 mt-4">
            {molt.status.startsWith('running') ? (
              <button 
                type="button" 
                className="px-4 py-2 bg-action-danger text-text-inverse rounded font-medium text-sm hover:opacity-90 transition-opacity"
                onClick={() => onStop(molt.name)}
              >
                Stop
              </button>
            ) : (
              <button 
                type="button" 
                className="px-4 py-2 bg-action-success text-text-inverse rounded font-medium text-sm hover:opacity-90 transition-opacity"
                onClick={() => onStart(molt.name)}
              >
                Start
              </button>
            )}
            <a 
              href={`http://127.0.0.1:${molt.port}/`} 
              target="_blank" 
              rel="noopener noreferrer"
              className="px-4 py-2 bg-action-primary text-text-inverse rounded font-medium text-sm hover:opacity-90 transition-opacity text-center no-underline"
            >
              Dashboard
            </a>
          </div>
        </div>
      ))}
    </div>
  );
}

