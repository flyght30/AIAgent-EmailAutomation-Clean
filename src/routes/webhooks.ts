import { Router } from 'express';
import crypto from 'crypto';
import { getDb } from '../db/mongo.js';

export const webhooks = Router();

function verifyMailgunSignature(payload: any, signingKey?: string) {
  try {
    if (!signingKey) return false;
    const { signature } = payload || {};
    const timestamp = signature?.timestamp;
    const token = signature?.token;
    const sig = signature?.signature;
    if (!timestamp || !token || !sig) return false;
    const data = Buffer.from(timestamp + token, 'utf8');
    const hmac = crypto.createHmac('sha256', signingKey).update(data).digest('hex');
    return crypto.timingSafeEqual(Buffer.from(hmac), Buffer.from(sig));
  } catch {
    return false;
  }
}

webhooks.post('/webhooks/mailgun', async (req, res) => {
  const signingKey = process.env.MAILGUN_SIGNING_KEY;
  const ok = verifyMailgunSignature(req.body, signingKey);
  if (!ok) return res.status(401).json({ received: false, error: 'invalid_signature' });
  try {
    const evt = req.body;
    await getDb().collection('events').insertOne({ ...evt, receivedAt: new Date(), provider: 'mailgun' });
    res.json({ received: true });
  } catch (e: any) {
    res.status(500).json({ received: false, error: e.message });
  }
});