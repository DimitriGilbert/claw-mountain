import { useState, useEffect, useCallback } from 'react';
import { MoltList } from './components/MoltList';
import { BroadcastPanel } from './components/BroadcastPanel';
import { MoltStatus } from './types';

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
    <div className="min-h-screen flex flex-col bg-bg-primary text-text-primary">
      <header className="bg-bg-secondary px-8 py-6 border-b border-border-primary flex items-center justify-between gap-8">
        <h1 className="text-2xl font-bold bg-gradient-to-r from-blue-400 to-violet-400 bg-clip-text text-transparent">
          🦕 Molt Fleet Dashboard
        </h1>
        <div className="flex gap-8">
          <div className="text-center">
            <span className="block text-2xl font-bold text-text-secondary">{summary.total}</span>
            <span className="block text-xs uppercase tracking-wider text-text-muted">Total</span>
          </div>
          <div className="text-center">
            <span className="block text-2xl font-bold text-status-success">{summary.running}</span>
            <span className="block text-xs uppercase tracking-wider text-text-muted">Running</span>
          </div>
          <div className="text-center">
            <span className="block text-2xl font-bold text-status-error">{summary.stopped}</span>
            <span className="block text-xs uppercase tracking-wider text-text-muted">Stopped</span>
          </div>
        </div>
        <button 
          type="button" 
          onClick={fetchMolts} 
          className="px-4 py-2 bg-action-primary text-text-inverse rounded font-medium hover:opacity-90 disabled:opacity-50 disabled:cursor-not-allowed transition-opacity"
          disabled={loading}
        >
          {loading ? 'Loading...' : 'Refresh'}
        </button>
      </header>

      {error && (
        <div className="bg-status-error text-text-inverse px-4 py-3 text-center">
          {error}
        </div>
      )}

      <main className="flex-1 grid grid-cols-1 lg:grid-cols-[1fr_350px] gap-8 p-8 max-w-[1400px] mx-auto w-full">
        <section>
          <h2 className="text-text-secondary mb-4">Active Molts</h2>
          <MoltList 
            molts={molts} 
            onStart={handleStart} 
            onStop={handleStop}
          />
        </section>

        <aside>
          <BroadcastPanel onBroadcast={fetchMolts} />
        </aside>
      </main>
    </div>
  );
}

export default App;
