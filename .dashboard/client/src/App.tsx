import { useState, useEffect, useCallback } from 'react';
import { MoltList } from './components/MoltList';
import { BroadcastPanel } from './components/BroadcastPanel';
import { MoltStatus } from './types';
import './App.css';

function App() {
  const [molts, setMolts] = useState<MoltStatus[]>([]);
  const [summary, setSummary] = useState({ total: 0, running: 0, stopped: 0 });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchMolts = useCallback(async () => {
    try {
      setLoading(true);
      const response = await fetch('/api/molts');
      const data = await response.json();
      
      if (data.error) {
        setError(data.error);
      } else {
        setMolts(data.molts || []);
        setSummary(data.summary || { total: 0, running: 0, stopped: 0 });
        setError(null);
      }
    } catch (err) {
      setError('Failed to fetch molts');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchMolts();
    // Auto-refresh every 5 seconds
    const interval = setInterval(fetchMolts, 5000);
    return () => clearInterval(interval);
  }, [fetchMolts]);

  const handleStart = async (name: string) => {
    try {
      await fetch(`/api/molts/${name}/start`, { method: 'POST' });
      fetchMolts();
    } catch (err) {
      console.error('Failed to start molt:', err);
    }
  };

  const handleStop = async (name: string) => {
    try {
      await fetch(`/api/molts/${name}/stop`, { method: 'POST' });
      fetchMolts();
    } catch (err) {
      console.error('Failed to stop molt:', err);
    }
  };

  return (
    <div className="app">
      <header className="header">
        <h1>🦕 Molt Fleet Dashboard</h1>
        <div className="summary">
          <div className="summary-item">
            <span className="summary-value">{summary.total}</span>
            <span className="summary-label">Total</span>
          </div>
          <div className="summary-item running">
            <span className="summary-value">{summary.running}</span>
            <span className="summary-label">Running</span>
          </div>
          <div className="summary-item stopped">
            <span className="summary-value">{summary.stopped}</span>
            <span className="summary-label">Stopped</span>
          </div>
        </div>
        <button type="button" onClick={fetchMolts} className="refresh-btn" disabled={loading}>
          {loading ? 'Loading...' : 'Refresh'}
        </button>
      </header>

      {error && <div className="error">{error}</div>}

      <main className="main">
        <section className="molts-section">
          <h2>Active Molts</h2>
          <MoltList 
            molts={molts} 
            onStart={handleStart} 
            onStop={handleStop}
          />
        </section>

        <aside className="sidebar">
          <BroadcastPanel onBroadcast={fetchMolts} />
        </aside>
      </main>
    </div>
  );
}

export default App;
