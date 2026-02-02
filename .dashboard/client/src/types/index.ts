export interface MoltStatus {
  name: string;
  port: string;
  home: string;
  status: string;
  pid: string;
  created: string;
  docker: string;
}

export interface MoltSummary {
  total: number;
  running: number;
  stopped: number;
}

export interface MoltsResponse {
  molts: MoltStatus[];
  summary: MoltSummary;
  error?: string;
}

export interface HealthStatus {
  status: 'healthy' | 'unhealthy' | 'dead' | 'unknown';
  timestamp: string;
  pid: number;
  port: number;
  http_status: number;
  response_time_ms: number;
}

export interface HealthHistoryEntry {
  timestamp: string;
  status: string;
  response_time_ms: number;
  http_status: number;
}

export interface HealthHistory {
  entries: HealthHistoryEntry[];
  count: number;
  uptime_percent: number;
}

export interface HealthWatchState {
  consecutive_failures: number;
  last_success: string | null;
  alert_sent: boolean;
  threshold: number;
}

export interface MoltHealth {
  status: HealthStatus | null;
  history: HealthHistory | null;
  watchState: HealthWatchState | null;
  loading: boolean;
  error: string | null;
}

export interface BroadcastRecipient {
  name: string;
  status: 'sent' | 'failed';
  error?: string;
}

export interface BroadcastResponse {
  recipients: BroadcastRecipient[];
  total: number;
  successful: number;
  failed: number;
}
