import express from 'express';
import cors from 'cors';
import { initDb, getDb, updatePlan } from './db.js';
import type { MigrationStep } from '../src/types/migration.js';

const app = express();
const PORT = 3001;

app.use(cors());
app.use(express.json());

await initDb();

app.get('/api/providers', (_req, res) => {
  const db = getDb();
  res.json(db.data.providers);
});

app.get('/api/vms', (_req, res) => {
  const db = getDb();
  res.json(db.data.vms);
});

app.get('/api/plans', (_req, res) => {
  const db = getDb();
  res.json(db.data.plans);
});

app.get('/api/plans/:id', (req, res) => {
  const db = getDb();
  const plan = db.data.plans.find((p) => p.id === req.params.id);
  if (!plan) return res.status(404).json({ error: 'Plan not found' });
  res.json(plan);
});

app.post('/api/plans', async (req, res) => {
  const db = getDb();
  const { name, description, source, target, vms, networkMap, storageMap } = req.body;
  const newPlan = {
    id: `plan-${Date.now()}`,
    name,
    description,
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

app.put('/api/plans/:id', async (req, res) => {
  try {
    const plan = await updatePlan(req.params.id, req.body);
    res.json(plan);
  } catch (e) {
    res.status(404).json({ error: (e as Error).message });
  }
});

app.get('/api/plans/:id/events', (req, res) => {
  const planId = req.params.id;
  const db = getDb();
  const plan = db.data.plans.find((p) => p.id === planId);
  if (!plan) return res.status(404).json({ error: 'Plan not found' });

  res.setHeader('Content-Type', 'text/event-stream');
  res.setHeader('Cache-Control', 'no-cache');
  res.setHeader('Connection', 'keep-alive');
  res.setHeader('Access-Control-Allow-Origin', '*');

  let elapsed = 0;
  const maxElapsed = plan.vms.length * 120;

  const interval = setInterval(async () => {
    elapsed += 3;
    if (elapsed > maxElapsed) {
      const allDone = plan.vms.map((vmId, idx) => {
        const offset = idx * 15;
        return elapsed - offset >= 100;
      }).every(Boolean);

      if (allDone) {
        const finalSteps: MigrationStep[] = plan.vms.map((vmId) => ({
          vmId,
          phase: 'completed',
          progressPercent: 100,
          startedAt: plan.createdAt,
          completedAt: new Date().toISOString(),
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
      if (progress <= 0) phase = 'pending';
      else if (progress < 60) phase = 'precopy';
      else if (progress < 90) phase = 'cutover';
      else if (progress >= 100) phase = 'completed';
      return {
        vmId,
        phase,
        progressPercent: Math.max(0, progress),
        startedAt: plan.createdAt,
        ...(phase === 'completed' ? { completedAt: new Date().toISOString() } : {}),
      };
    });

    const avgProgress = Math.round(updatedSteps.reduce((sum, s) => sum + s.progressPercent, 0) / updatedSteps.length);
    await updatePlan(planId, { steps: updatedSteps, progress: avgProgress, status: 'running' });

    res.write(`data: ${JSON.stringify({ steps: updatedSteps, progress: avgProgress })}\n\n`);
  }, 500);

  req.on('close', () => {
    clearInterval(interval);
    res.end();
  });
});

app.listen(PORT, () => {
  console.log(`🚀 Migration Toolkit API server running on http://localhost:${PORT}`);
});
