import express from 'express';
import cors from 'cors';
import { randomUUID } from 'crypto';
import {
  initDb, getDb,
  updatePlan,
  createProvider, updateProvider, deleteProvider,
  findUserByUsername, findUserById, addUser,
} from './db.js';
import type { MigrationStep } from '../src/types/migration.js';

const app = express();
const PORT = 3001;

app.use(cors());
app.use(express.json());

await initDb();

// token → userId (in-memory sessions; lost on server restart — fine for demo)
const sessions = new Map<string, string>();

// ── Auth middleware ──────────────────────────────────────────
function requireAuth(
  req: express.Request,
  res: express.Response,
  next: express.NextFunction,
) {
  const token = req.headers.authorization?.replace('Bearer ', '');
  if (!token) { res.status(401).json({ error: 'No token provided' }); return; }
  const userId = sessions.get(token);
  if (!userId) { res.status(401).json({ error: 'Invalid or expired session' }); return; }
  (req as express.Request & { userId: string }).userId = userId;
  next();
}

function requireAdmin(
  req: express.Request,
  res: express.Response,
  next: express.NextFunction,
) {
  requireAuth(req, res, () => {
    const userId = (req as express.Request & { userId: string }).userId;
    const user = findUserById(userId);
    if (!user || user.role !== 'admin') {
      res.status(403).json({ error: 'Admin access required' });
      return;
    }
    next();
  });
}

// ── Auth endpoints ───────────────────────────────────────────
app.post('/api/auth/login', (req, res) => {
  const { username, password } = req.body ?? {};
  if (!username || !password) {
    res.status(400).json({ error: 'username and password required' });
    return;
  }
  const user = findUserByUsername(username);
  if (!user || user.password !== password) {
    res.status(401).json({ error: 'Invalid credentials' });
    return;
  }
  const token = randomUUID();
  sessions.set(token, user.id);
  res.json({
    token,
    user: { id: user.id, username: user.username, role: user.role, displayName: user.displayName },
  });
});

app.get('/api/auth/me', requireAuth, (req, res) => {
  const userId = (req as express.Request & { userId: string }).userId;
  const user = findUserById(userId);
  if (!user) { res.status(404).json({ error: 'User not found' }); return; }
  res.json({ id: user.id, username: user.username, role: user.role, displayName: user.displayName });
});

app.post('/api/auth/logout', requireAuth, (req, res) => {
  const token = req.headers.authorization?.replace('Bearer ', '') ?? '';
  sessions.delete(token);
  res.json({ ok: true });
});

app.post('/api/auth/register', async (req, res) => {
  const { username, password, displayName } = req.body ?? {};
  if (!username || !password || !displayName) {
    res.status(400).json({ error: 'username, password, and displayName are required' });
    return;
  }
  if (findUserByUsername(username)) {
    res.status(409).json({ error: 'Username already taken' });
    return;
  }
  const user = await addUser({ username, password, role: 'demo', displayName });
  const token = randomUUID();
  sessions.set(token, user.id);
  res.status(201).json({
    token,
    user: { id: user.id, username: user.username, role: user.role, displayName: user.displayName },
  });
});

app.post('/api/auth/google', async (req, res) => {
  const { credential } = req.body ?? {};
  if (!credential) { res.status(400).json({ error: 'credential required' }); return; }
  try {
    const verifyRes = await fetch(`https://oauth2.googleapis.com/tokeninfo?id_token=${credential}`);
    if (!verifyRes.ok) { res.status(401).json({ error: 'Invalid Google token' }); return; }
    const payload = await verifyRes.json() as { email?: string; name?: string };
    if (!payload.email) { res.status(401).json({ error: 'No email in Google token' }); return; }

    let user = findUserByUsername(payload.email);
    if (!user) {
      user = await addUser({
        username: payload.email,
        password: '',
        role: 'demo',
        displayName: payload.name ?? payload.email,
      });
    }
    const token = randomUUID();
    sessions.set(token, user.id);
    res.json({ token, user: { id: user.id, username: user.username, role: user.role, displayName: user.displayName } });
  } catch {
    res.status(500).json({ error: 'Google authentication failed' });
  }
});

// ── Providers ────────────────────────────────────────────────
app.get('/api/providers', (_req, res) => {
  res.json(getDb().data.providers);
});

app.post('/api/providers', requireAuth, async (req, res) => {
  const { name, kind, url } = req.body;
  if (!name || !kind || !url) { res.status(400).json({ error: 'name, kind and url required' }); return; }
  const provider = await createProvider({ name, kind, url, status: 'unknown', vmCount: 0 });
  res.status(201).json(provider);
});

app.put('/api/providers/:id', requireAdmin, async (req, res) => {
  try {
    const provider = await updateProvider(String(req.params.id), req.body);
    res.json(provider);
  } catch (e) {
    res.status(404).json({ error: (e as Error).message });
  }
});

app.delete('/api/providers/:id', requireAdmin, async (req, res) => {
  try {
    await deleteProvider(String(req.params.id));
    res.json({ ok: true });
  } catch (e) {
    res.status(404).json({ error: (e as Error).message });
  }
});

// ── VMs ──────────────────────────────────────────────────────
app.get('/api/vms', (_req, res) => {
  res.json(getDb().data.vms);
});

// ── Plans ────────────────────────────────────────────────────
app.get('/api/plans', (_req, res) => {
  res.json(getDb().data.plans);
});

app.get('/api/plans/:id', (req, res) => {
  const plan = getDb().data.plans.find((p) => p.id === req.params.id);
  if (!plan) { res.status(404).json({ error: 'Plan not found' }); return; }
  res.json(plan);
});

app.post('/api/plans', requireAuth, async (req, res) => {
  const db = getDb();
  const { name, description, source, target, vms, networkMap, storageMap } = req.body;
  const newPlan = {
    id: `plan-${Date.now()}`,
    name,
    description: description ?? '',
    source,
    target,
    vms,
    networkMap,
    storageMap,
    status: 'ready' as const,
    progress: 0,
    createdAt: new Date().toISOString(),
    steps: vms.map((vmId: string) => ({
      vmId,
      phase: 'pending' as const,
      progressPercent: 0,
    })),
  };
  db.data.plans.unshift(newPlan);
  await db.write();
  res.status(201).json(newPlan);
});

app.put('/api/plans/:id', requireAuth, async (req, res) => {
  try {
    const plan = await updatePlan(String(req.params.id), req.body);
    res.json(plan);
  } catch (e) {
    res.status(404).json({ error: (e as Error).message });
  }
});

// ── SSE migration progress ───────────────────────────────────
app.get('/api/plans/:id/events', (req, res) => {
  const planId = String(req.params.id);
  const db = getDb();
  const plan = db.data.plans.find((p) => p.id === planId);
  if (!plan) { res.status(404).json({ error: 'Plan not found' }); return; }

  res.setHeader('Content-Type', 'text/event-stream');
  res.setHeader('Cache-Control', 'no-cache');
  res.setHeader('Connection', 'keep-alive');
  res.setHeader('Access-Control-Allow-Origin', '*');

  let elapsed = 0;
  const maxElapsed = plan.vms.length * 120;

  const interval = setInterval(async () => {
    elapsed += 3;
    if (elapsed > maxElapsed) {
      const allDone = plan.vms.every((_, idx) => elapsed - idx * 15 >= 100);
      if (allDone) {
        const finalSteps: MigrationStep[] = plan.vms.map((vmId) => ({
          vmId, phase: 'completed', progressPercent: 100,
          startedAt: plan.createdAt, completedAt: new Date().toISOString(),
        }));
        await updatePlan(planId, { steps: finalSteps, progress: 100, status: 'succeeded' });
        res.write(`data: ${JSON.stringify({ status: 'succeeded', progress: 100 })}\n\n`);
        clearInterval(interval);
        res.end();
      }
      return;
    }

    const updatedSteps: MigrationStep[] = plan.vms.map((vmId, idx) => {
      const offset = idx * 15;
      const progress = Math.min(100, elapsed - offset);
      let phase: MigrationStep['phase'] = 'precopy';
      if (progress <= 0)   phase = 'pending';
      else if (progress < 60) phase = 'precopy';
      else if (progress < 90) phase = 'cutover';
      else if (progress >= 100) phase = 'completed';
      return {
        vmId, phase,
        progressPercent: Math.max(0, progress),
        startedAt: plan.createdAt,
        ...(phase === 'completed' ? { completedAt: new Date().toISOString() } : {}),
      };
    });

    const avgProgress = Math.round(
      updatedSteps.reduce((sum, s) => sum + s.progressPercent, 0) / updatedSteps.length,
    );
    await updatePlan(planId, { steps: updatedSteps, progress: avgProgress, status: 'running' });
    res.write(`data: ${JSON.stringify({ steps: updatedSteps, progress: avgProgress })}\n\n`);
  }, 500);

  req.on('close', () => { clearInterval(interval); res.end(); });
});

app.listen(PORT, () => {
  console.log(`Migration Toolkit API running on http://localhost:${PORT}`);
  console.log(`  Users: demo/demo (read+create)  |  admin/admin (full access)`);
});
