import { MoltStatus } from '../types';
import { Card, Badge, Button, TerminalText } from './ui';
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
        <TerminalText>
          echo "No molts found"
        </TerminalText>
      </div>
    );
  }

  return (
    <div className="grid gap-4">
      {molts.map((molt) => {
        const isRunning = molt.status.startsWith('running');

        return (
          <Card key={molt.name} status={isRunning ? 'running' : 'stopped'}>
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-xl font-semibold font-display text-text-primary">{molt.name}</h3>
              <Badge variant={isRunning ? 'success' : 'error'}>
                {molt.status}
              </Badge>
            </div>

            <div className="grid grid-cols-[repeat(auto-fit,minmax(140px,1fr))] gap-3 mb-4">
              <div className="flex gap-2">
                <span className="text-text-muted text-sm">Port:</span>
                <TerminalText className="text-sm font-medium">{molt.port}</TerminalText>
              </div>
              <div className="flex gap-2">
                <span className="text-text-muted text-sm">PID:</span>
                <TerminalText className="text-sm font-medium">{molt.pid || 'N/A'}</TerminalText>
              </div>
              <div className="flex gap-2">
                <span className="text-text-muted text-sm">Docker:</span>
                <TerminalText className="text-sm font-medium">{molt.docker}</TerminalText>
              </div>
              <div className="flex gap-2">
                <span className="text-text-muted text-sm">Created:</span>
                <TerminalText className="text-sm font-medium">{molt.created || 'N/A'}</TerminalText>
              </div>
            </div>

            <HealthPanel
              moltName={molt.name}
              isRunning={isRunning}
            />

            <div className="flex gap-2 mt-4">
              {isRunning ? (
                <Button variant="danger" onClick={() => onStop(molt.name)}>
                  Stop
                </Button>
              ) : (
                <Button variant="success" onClick={() => onStart(molt.name)}>
                  Start
                </Button>
              )}
              <Button
                variant="primary"
                href={`http://127.0.0.1:${molt.port}/`}
                target="_blank"
                rel="noopener noreferrer"
              >
                Dashboard
              </Button>
            </div>
          </Card>
        );
      })}
    </div>
  );
}

