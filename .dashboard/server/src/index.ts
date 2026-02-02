import { Elysia } from 'elysia';
import { cors } from '@elysiajs/cors';
import { staticPlugin } from '@elysiajs/static';
import { exec } from 'child_process';
import { promisify } from 'util';
import { readFile, readdir } from 'fs/promises';
import { join, resolve } from 'path';

const execAsync = promisify(exec);

// Get project root (parent of .dashboard directory)
const PROJECT_ROOT = resolve(process.cwd(), '..');
const CLMNT_BIN = join(PROJECT_ROOT, 'clmnt');

const app = new Elysia()
  .use(cors())
  .use(staticPlugin({
    assets: join(process.cwd(), '../client/dist'),
    prefix: '/'
  }))
  
  // Health check
  .get('/api/health', () => ({ status: 'ok', timestamp: new Date().toISOString() }))
  
  // List all molts (JSON)
  .get('/api/molts', async () => {
    try {
      const { stdout } = await execAsync(`${CLMNT_BIN} molt list --json`);
      return JSON.parse(stdout);
    } catch (error) {
      return { error: 'Failed to list molts', molts: [], summary: { total: 0, running: 0, stopped: 0 } };
    }
  })
  
  // Get specific molt status
  .get('/api/molts/:name/status', async ({ params: { name } }) => {
    try {
      const { stdout } = await execAsync(`${CLMNT_BIN} molt status ${name}`);
      return { name, status: stdout };
    } catch (error) {
      return { error: `Failed to get status for ${name}` };
    }
  })
  
  // Start molt
  .post('/api/molts/:name/start', async ({ params: { name } }) => {
    try {
      const { stdout } = await execAsync(`${CLMNT_BIN} molt start ${name}`);
      return { name, action: 'start', result: stdout };
    } catch (error) {
      return { error: `Failed to start ${name}` };
    }
  })
  
  // Stop molt
  .post('/api/molts/:name/stop', async ({ params: { name } }) => {
    try {
      const { stdout } = await execAsync(`${CLMNT_BIN} molt stop ${name}`);
      return { name, action: 'stop', result: stdout };
    } catch (error) {
      return { error: `Failed to stop ${name}` };
    }
  })
  
  // Get molt logs
  .get('/api/molts/:name/logs', async ({ params: { name }, query }) => {
    try {
      const lines = query.lines || '50';
      const { stdout } = await execAsync(`${CLMNT_BIN} molt logs ${name} -n ${lines}`);
      return { name, logs: stdout.split('\n') };
    } catch (error) {
      return { error: `Failed to get logs for ${name}` };
    }
  })
  
  // Get molt dashboard URL
  .get('/api/molts/:name/dashboard', async ({ params: { name } }) => {
    try {
      // Read config to get port
      const configPath = join(PROJECT_ROOT, name, '.openclaw/openclaw.json');
      const config = await readFile(configPath, 'utf-8');
      const port = config.match(/"port":\s*(\d+)/)?.[1] || '19001';
      return { name, url: `http://127.0.0.1:${port}/` };
    } catch (error) {
      return { error: `Failed to get dashboard URL for ${name}` };
    }
  })
  
  // Broadcast message to all active molts
  .post('/api/broadcast', async ({ body }) => {
    const { message } = body as { message: string };
    
    try {
      // Get list of molts
      const { stdout } = await execAsync(`${CLMNT_BIN} molt list --json`);
      const data = JSON.parse(stdout);
      
      const results: any[] = [];
      
      // Send to each running molt via webhook
      for (const molt of data.molts) {
        if (molt.status.startsWith('running')) {
          try {
            const configPath = join(PROJECT_ROOT, molt.name, '.openclaw/openclaw.json');
            const config = await readFile(configPath, 'utf-8');
            const port = config.match(/"port":\s*(\d+)/)?.[1] || molt.port;
            const token = config.match(/"token":\s*"([^"]*)"/)?.[1] || '';
            
            // Send webhook
            const response = await fetch(`http://127.0.0.1:${port}/hooks/agent`, {
              method: 'POST',
              headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${token}`
              },
              body: JSON.stringify({
                name: 'Dashboard Broadcast',
                sessionTarget: 'isolated',
                wakeMode: 'now',
                payload: {
                  kind: 'agentTurn',
                  message: `[Dashboard] ${message}`,
                  deliver: false
                },
                isolation: {
                  postToMainPrefix: 'Dashboard',
                  postToMainMode: 'summary'
                }
              })
            });
            
            results.push({ name: molt.name, status: response.ok ? 'sent' : 'failed' });
          } catch (err) {
            results.push({ name: molt.name, status: 'error', error: String(err) });
          }
        }
      }
      
      return { message, recipients: results };
    } catch (error) {
      return { error: 'Failed to broadcast message' };
    }
  })
  
  // Serve React app for all other routes
  .get('*', () => {
    return new Response(Bun.file(join(process.cwd(), '../client/dist/index.html')));
  })
  
  .listen(3000);

console.log(`🦕 Dashboard server running at http://localhost:${app.server?.port}`);
console.log(`📁 Project root: ${PROJECT_ROOT}`);
