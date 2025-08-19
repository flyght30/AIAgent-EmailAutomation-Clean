import { Router } from 'express';
import { getDb } from '../db/mongo.js';

export const events = Router();

events.get('/events', async (req, res) => {
  const limit = Math.min(parseInt(String(req.query.limit || '20'), 10) || 20, 200);
  const provider = req.query.provider as string | undefined;
  const type = req.query.type as string | undefined;
  const q: any = {};
  if (provider) q.provider = provider;
  if (type) q.type = type;
  const items = await getDb().collection('events').find(q).sort({ timestamp: -1, receivedAt: -1 }).limit(limit).project({ _id: 0 }).toArray();
  res.json({ events: items, count: items.length });
});