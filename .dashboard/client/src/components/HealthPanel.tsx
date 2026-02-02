import { useState, useEffect, useCallback } from 'react';
import { HealthStatus, HealthHistory, HealthWatchState } from '../types';

interface HealthPanelProps {
  moltName: string;
  isRunning: boolean;
}

export function HealthPanel({ moltName, isRunning }: HealthPanelProps) {
  const [health, setHealth] = useState<HealthStatus | null>(null);
  const [history, setHistory] = useState<HealthHistory | null>(null);
  const [watchState, setWatchState] = useState<HealthWatchState | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [showDetails, setShowDetails] = useState(false);

  const fetchHealthData = useCallback(async () => {
    if (!isRunning) return;
    
    setLoading(true);
    setError(null);
    
    try {
      const [healthRes, historyRes, watchRes] = await Promise.all([
        fetch(`/api/molts/${moltName}/health`),
        fetch(`/api/molts/${moltName}/history`),
        fetch(`/api/molts/${moltName}/watch-state`)
      ]);
      
      const healthData = await healthRes.json();
      const historyData = await historyRes.json();
      const watchData = await watchRes.json();
      
      if (!healthData.error) setHealth(healthData);
      if (!historyData.error) setHistory(historyData);
      if (!watchData.error) setWatchState(watchData);
    } catch (err) {
      setError('Failed to fetch health data');
    } finally {
      setLoading(false);
    }
  }, [moltName, isRunning]);

  const handleSetupHealth = async () => {
    try {
      const response = await fetch(`/api/molts/${moltName}/health/setup`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ interval: 5 })
      });
      
      if (response.ok) {
        fetchHealthData();
      }
    } catch (err) {
      console.error('Failed to setup health monitoring:', err);
    }
  };

  useEffect(() => {
    if (isRunning) {
      fetchHealthData();
      const interval = setInterval(() => fetchHealthData(), 30000);
      return () => clearInterval(interval);
    }
  }, [fetchHealthData, isRunning]);

  const getHealthColorClass = (status: string) => {
    switch (status) {
      case 'healthy': return 'bg-status-success';
      case 'unhealthy': return 'bg-status-warning';
      case 'dead': return 'bg-status-error';
      default: return 'bg-status-neutral';
    }
  };

  const getHealthTextClass = (status: string) => {
    switch (status) {
      case 'healthy': return 'text-status-success-text';
      case 'unhealthy': return 'text-status-warning-text';
      case 'dead': return 'text-status-error-text';
      default: return 'text-text-muted';
    }
  };

  if (!isRunning) {
    return (
      <div className="mt-2 pt-2 border-t border-border-primary">
        <span className="px-3 py-1 rounded-full text-xs font-semibold uppercase tracking-wider text-text-inverse bg-status-neutral">
          Stopped
        </span>
      </div>
    );
  }

  if (loading && !health) {
    return (
      <div className="mt-4 pt-4 border-t border-border-primary">
        <span className="text-sm text-text-muted">Loading...</span>
      </div>
    );
  }

  if (error || !health) {
    return (
      <div className="mt-4 pt-4 border-t border-border-primary">
        <button 
          type="button"
          className="px-4 py-2 bg-action-secondary text-text-inverse rounded font-medium text-sm hover:opacity-90 transition-opacity"
          onClick={handleSetupHealth}
        >
          Setup Health Monitoring
        </button>
      </div>
    );
  }

  return (
    <div className="mt-4 pt-4 border-t border-border-primary">
      <div className="flex justify-between items-center">
        <span className={`px-3 py-1 rounded-full text-xs font-semibold uppercase tracking-wider text-text-inverse ${getHealthColorClass(health.status)}`}>
          {health.status}
        </span>
        <button
          type="button"
          className="px-2 py-1 bg-action-ghost border border-border-secondary rounded text-xs text-text-muted hover:border-border-hover hover:text-text-secondary transition-all"
          onClick={() => setShowDetails(!showDetails)}
        >
          {showDetails ? 'Hide' : 'Details'}
        </button>
      </div>

      {showDetails && (
        <div className="mt-4 p-4 bg-bg-input rounded border border-border-primary">
          <div className="mb-4">
            <h4 className="text-sm text-text-muted uppercase tracking-wider mb-2">Current Status</h4>
            <div className="flex justify-between py-1.5 border-b border-bg-secondary">
              <span className="text-sm text-text-muted">Status:</span>
              <span className={`text-sm font-medium ${getHealthTextClass(health.status)}`}>
                {health.status}
              </span>
            </div>
            <div className="flex justify-between py-1.5 border-b border-bg-secondary">
              <span className="text-sm text-text-muted">Last Check:</span>
              <span className="text-sm text-text-secondary font-medium">{new Date(health.timestamp).toLocaleString()}</span>
            </div>
            <div className="flex justify-between py-1.5 border-b border-bg-secondary">
              <span className="text-sm text-text-muted">PID:</span>
              <span className="text-sm text-text-secondary font-medium">{health.pid}</span>
            </div>
            <div className="flex justify-between py-1.5 border-b border-bg-secondary">
              <span className="text-sm text-text-muted">Port:</span>
              <span className="text-sm text-text-secondary font-medium">{health.port}</span>
            </div>
            <div className="flex justify-between py-1.5 border-b border-bg-secondary">
              <span className="text-sm text-text-muted">Response Time:</span>
              <span className="text-sm text-text-secondary font-medium">{health.response_time_ms}ms</span>
            </div>
            <div className="flex justify-between py-1.5">
              <span className="text-sm text-text-muted">HTTP Status:</span>
              <span className="text-sm text-text-secondary font-medium">{health.http_status}</span>
            </div>
          </div>

          {watchState && (
            <div className="mb-4">
              <h4 className="text-sm text-text-muted uppercase tracking-wider mb-2">Watch State</h4>
              <div className="flex justify-between py-1.5 border-b border-bg-secondary">
                <span className="text-sm text-text-muted">Consecutive Failures:</span>
                <span className={`text-sm font-medium ${watchState.consecutive_failures > 0 ? 'text-status-warning-text' : 'text-text-secondary'}`}>
                  {watchState.consecutive_failures} / {watchState.threshold}
                </span>
              </div>
              {watchState.last_success && (
                <div className="flex justify-between py-1.5 border-b border-bg-secondary">
                  <span className="text-sm text-text-muted">Last Success:</span>
                  <span className="text-sm text-text-secondary font-medium">{new Date(watchState.last_success).toLocaleString()}</span>
                </div>
              )}
              {watchState.alert_sent && (
                <div className="mt-2 p-2 bg-status-error text-text-inverse rounded text-sm text-center">
                  Alert has been sent!
                </div>
              )}
            </div>
          )}

          {history && history.count > 0 && (
            <div>
              <h4 className="text-sm text-text-muted uppercase tracking-wider mb-2">Uptime History</h4>
              <div className="h-2 bg-bg-tertiary rounded overflow-hidden mb-2">
                <div 
                  className={`h-full transition-all duration-300 ${getHealthColorClass(history.uptime_percent > 95 ? 'healthy' : history.uptime_percent > 80 ? 'unhealthy' : 'dead')}`}
                  style={{ width: `${history.uptime_percent}%` }}
                />
              </div>
              <div className="flex justify-between py-1.5 border-b border-bg-secondary">
                <span className="text-sm text-text-muted">Uptime:</span>
                <span className="text-sm text-text-secondary font-medium">{history.uptime_percent}%</span>
              </div>
              <div className="flex justify-between py-1.5">
                <span className="text-sm text-text-muted">Total Checks:</span>
                <span className="text-sm text-text-secondary font-medium">{history.count}</span>
              </div>
              
              <div className="flex gap-0.5 mt-3 items-end">
                {history.entries.slice(-20).map((entry) => (
                  <div
                    key={`${entry.timestamp}-${entry.status}`}
                    className={`w-2 h-2 rounded-full flex-shrink-0 ${getHealthColorClass(entry.status)}`}
                    title={`${entry.timestamp}: ${entry.status} (${entry.response_time_ms}ms)`}
                  />
                ))}
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}

