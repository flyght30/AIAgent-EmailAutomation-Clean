import { Router } from 'express';
import crypto from 'crypto';
import { getDb } from '../db/mongo.js';

export const webhooks = Router();

function timingSafeEq(a: string, b: string) {
  try {
    return crypto.timingSafeEqual(Buffer.from(a), Buffer.from(b));
  } catch {
    return false;
  }
}

function signHmac(timestamp: string, token: string, signingKey: string) {
  const data = Buffer.from(timestamp + token, 'utf8');
  return crypto.createHmac('sha256', signingKey).update(data).digest('hex');
}

function verifyHmacFromBody(payload: any, signingKey?: string) {
  if (!signingKey) return false;
  const signature = payload?.signature || payload;
  const ts = signature?.timestamp;
  const token = signature?.token;
  const sig = signature?.signature;
  if (!ts || !token || !sig) return false;
  const mac = signHmac(ts, token, signingKey);
  return timingSafeEq(mac, sig);
}

function verifyHmacFromHeaders(headers: Record<string, any>, signingKey?: string) {
  if (!signingKey) return false;
  // Support both canonical and lowercase header names
  const ts = headers['x-mailgun-timestamp'] || headers['X-Mailgun-Timestamp'] || headers['timestamp'] || headers['Timestamp'];
  const token = headers['x-mailgun-token'] || headers['X-Mailgun-Token'] || headers['token'] || headers['Token'];
  const sig = headers['x-mailgun-signature'] || headers['X-Mailgun-Signature'] || headers['signature'] || headers['Signature'];
  if (!ts || !token || !sig) return false;
  const mac = signHmac(String(ts), String(token), signingKey);
  return timingSafeEq(mac, String(sig));
}

// Mailgun event webhook with dual verification (header-based or body-based HMAC)
webhooks.post('/webhooks/mailgun', async (req, res) => {
  const signingKey = process.env.MAILGUN_SIGNING_KEY;
  const ok = verifyHmacFromHeaders(req.headers as any, signingKey) || verifyHmacFromBody(req.body, signingKey);
  if (!ok) return res.status(401).json({ received: false, error: 'invalid_signature' });
  try {
    const evt = req.body;
    await getDb().collection('events').insertOne({ ...evt, receivedAt: new Date(), provider: 'mailgun' });
    res.json({ received: true });
  } catch (e: any) {
    res.status(500).json({ received: false, error: e.message });
  }
});