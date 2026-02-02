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
