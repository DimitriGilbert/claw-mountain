import { useState, useEffect, useCallback } from "react";
import { HealthStatus, HealthHistory, HealthWatchState } from "../types";
import { Badge, Button, TerminalText } from "./ui";

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
        fetch(`/api/molts/${moltName}/watch-state`),
      ]);

      const healthData = await healthRes.json();
      const historyData = await historyRes.json();
      const watchData = await watchRes.json();

      if (!healthData.error) setHealth(healthData);
      if (!historyData.error) setHistory(historyData);
      if (!watchData.error) setWatchState(watchData);
    } catch (err) {
      setError("Failed to fetch health data");
    } finally {
      setLoading(false);
    }
  }, [moltName, isRunning]);

  const handleSetupHealth = async () => {
    try {
      const response = await fetch(`/api/molts/${moltName}/health/setup`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ interval: 5 }),
      });

      if (response.ok) {
        fetchHealthData();
      }
    } catch (err) {
      console.error("Failed to setup health monitoring:", err);
    }
  };

  useEffect(() => {
    if (isRunning) {
      fetchHealthData();
      const interval = setInterval(() => fetchHealthData(), 30000);
      return () => clearInterval(interval);
    }
  }, [fetchHealthData, isRunning]);

  const getHealthBadgeVariant = (
    status: string,
  ): "success" | "warning" | "error" | "neutral" => {
    switch (status) {
      case "healthy":
        return "success";
      case "unhealthy":
        return "warning";
      case "dead":
        return "error";
      default:
        return "neutral";
    }
  };

  const getHealthTextColor = (status: string) => {
    switch (status) {
      case "healthy":
        return "text-status-success";
      case "unhealthy":
        return "text-status-warning";
      case "dead":
        return "text-status-error";
      default:
        return "text-text-muted";
    }
  };

  if (!isRunning) {
    return (
      <div className="mt-2 pt-2 border-t border-border-primary">
        <Badge variant="neutral">Stopped</Badge>
      </div>
    );
  }

  if (loading && !health) {
    return (
      <div className="mt-4 pt-4 border-t border-border-primary">
        <span className="text-sm text-text-muted italic">Loading...</span>
      </div>
    );
  }

  if (error || !health) {
    return (
      <div className="mt-4 pt-4 border-t border-border-primary">
        <Button variant="secondary" onClick={handleSetupHealth}>
          Setup Health Monitoring
        </Button>
      </div>
    );
  }

  return (
    <div className="mt-4 pt-4 border-t border-border-primary">
      <div className="flex justify-between items-center">
        <Badge variant={getHealthBadgeVariant(health.status)}>
          {health.status}
        </Badge>
        <Button
          variant="ghost"
          size="sm"
          onClick={() => setShowDetails(!showDetails)}
        >
          {showDetails ? "Hide" : "Details"}
        </Button>
      </div>

      {showDetails && (
        <div className="mt-4 p-4 bg-bg-input rounded-lg border border-border-primary">
          <div className="mb-4">
            <h4 className="text-sm text-text-muted uppercase tracking-wider mb-2 font-medium">
              Current Status
            </h4>
            <div className="flex justify-between py-1.5 border-b border-border-primary">
              <span className="text-sm text-text-muted">Status:</span>
              <span
                className={`text-sm font-medium ${getHealthTextColor(health.status)}`}
              >
                {health.status}
              </span>
            </div>
            <div className="flex justify-between py-1.5 border-b border-border-primary">
              <span className="text-sm text-text-muted">Last Check:</span>
              <TerminalText className="text-sm">
                {new Date(health.timestamp).toLocaleString()}
              </TerminalText>
            </div>
            <div className="flex justify-between py-1.5 border-b border-border-primary">
              <span className="text-sm text-text-muted">PID:</span>
              <TerminalText className="text-sm">{health.pid}</TerminalText>
            </div>
            <div className="flex justify-between py-1.5 border-b border-border-primary">
              <span className="text-sm text-text-muted">Port:</span>
              <TerminalText className="text-sm">{health.port}</TerminalText>
            </div>
            <div className="flex justify-between py-1.5 border-b border-border-primary">
              <span className="text-sm text-text-muted">Response Time:</span>
              <TerminalText className="text-sm">
                {health.response_time_ms}ms
              </TerminalText>
            </div>
            <div className="flex justify-between py-1.5">
              <span className="text-sm text-text-muted">HTTP Status:</span>
              <TerminalText className="text-sm">
                {health.http_status}
              </TerminalText>
            </div>
          </div>

          {watchState && (
            <div className="mb-4">
              <h4 className="text-sm text-text-muted uppercase tracking-wider mb-2 font-medium">
                Watch State
              </h4>
              <div className="flex justify-between py-1.5 border-b border-border-primary">
                <span className="text-sm text-text-muted">
                  Consecutive Failures:
                </span>
                <span
                  className={`text-sm font-medium ${watchState.consecutive_failures > 0 ? "text-status-warning" : "text-text-secondary"}`}
                >
                  {watchState.consecutive_failures} / {watchState.threshold}
                </span>
              </div>
              {watchState.last_success && (
                <div className="flex justify-between py-1.5 border-b border-border-primary">
                  <span className="text-sm text-text-muted">Last Success:</span>
                  <TerminalText className="text-sm">
                    {new Date(watchState.last_success).toLocaleString()}
                  </TerminalText>
                </div>
              )}
              {watchState.alert_sent && (
                <div className="mt-2 p-2 bg-status-error-bg text-status-error-text rounded-lg text-sm text-center border border-status-error/30">
                  Alert has been sent!
                </div>
              )}
            </div>
          )}

          {history && history.count > 0 && (
            <div>
              <h4 className="text-sm text-text-muted uppercase tracking-wider mb-2 font-medium">
                Uptime History
              </h4>
              <div className="h-2 bg-bg-tertiary rounded-full overflow-hidden mb-2">
                <div
                  className={`h-full transition-all duration-300 rounded-full ${
                    history.uptime_percent > 95
                      ? "bg-status-success"
                      : history.uptime_percent > 80
                        ? "bg-status-warning"
                        : "bg-status-error"
                  }`}
                  style={{ width: `${history.uptime_percent}%` }}
                />
              </div>
              <div className="flex justify-between py-1.5 border-b border-border-primary">
                <span className="text-sm text-text-muted">Uptime:</span>
                <TerminalText className="text-sm">
                  {history.uptime_percent}%
                </TerminalText>
              </div>
              <div className="flex justify-between py-1.5">
                <span className="text-sm text-text-muted">Total Checks:</span>
                <TerminalText className="text-sm">{history.count}</TerminalText>
              </div>

              <div className="flex gap-1 mt-3 items-end">
                {history.entries.slice(-20).map((entry) => (
                  <div
                    key={`${entry.timestamp}-${entry.status}`}
                    className={`
                      w-2 h-2 rounded-full shrink-0
                      ${
                        entry.status === "healthy"
                          ? "bg-status-success"
                          : entry.status === "unhealthy"
                            ? "bg-status-warning"
                            : "bg-status-error"
                      }
                    `}
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
