import { Router } from 'express';
import { getDb } from '../db/mongo.js';

export const health = Router();

health.get('/health', async (_req, res) => {
  try {
    const db = getDb();
    const stats = await db.command({ ping: 1 });
    res.json({ status: 'ok', db: stats.ok === 1, timestamp: new Date().toISOString() });
  } catch (e: any) {
    res.status(200).json({ status: 'degraded', error: e.message, timestamp: new Date().toISOString() });
  }
});