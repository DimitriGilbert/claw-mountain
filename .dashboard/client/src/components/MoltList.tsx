import { MoltStatus } from '../types';
import './MoltList.css';

interface MoltListProps {
  molts: MoltStatus[];
  onStart: (name: string) => void;
  onStop: (name: string) => void;
}

export function MoltList({ molts, onStart, onStop }: MoltListProps) {
  if (molts.length === 0) {
    return <div className="no-molts">No molts found. Create one with: clmnt molt create &lt;name&gt;</div>;
  }

  return (
    <div className="molt-list">
      {molts.map((molt) => (
        <div key={molt.name} className={`molt-card ${molt.status.startsWith('running') ? 'running' : 'stopped'}`}>
          <div className="molt-header">
            <h3>{molt.name}</h3>
            <span className={`status-badge ${molt.status.startsWith('running') ? 'running' : 'stopped'}`}>
              {molt.status}
            </span>
          </div>
          
          <div className="molt-details">
            <div className="detail-row">
              <span className="detail-label">Port:</span>
              <span className="detail-value">{molt.port}</span>
            </div>
            <div className="detail-row">
              <span className="detail-label">PID:</span>
              <span className="detail-value">{molt.pid || 'N/A'}</span>
            </div>
            <div className="detail-row">
              <span className="detail-label">Docker:</span>
              <span className="detail-value">{molt.docker}</span>
            </div>
            <div className="detail-row">
              <span className="detail-label">Created:</span>
              <span className="detail-value">{molt.created || 'N/A'}</span>
            </div>
          </div>

          <div className="molt-actions">
            {molt.status.startsWith('running') ? (
              <button type="button" className="btn btn-stop" onClick={() => onStop(molt.name)}>
                Stop
              </button>
            ) : (
              <button type="button" className="btn btn-start" onClick={() => onStart(molt.name)}>
                Start
              </button>
            )}
            <a 
              href={`http://127.0.0.1:${molt.port}/`} 
              target="_blank" 
              rel="noopener noreferrer"
              className="btn btn-dashboard"
            >
              Dashboard
            </a>
          </div>
        </div>
      ))}
    </div>
  );
}
