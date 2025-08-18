import { Router } from 'express';
import { MailgunProvider } from '../provider/mailgun.js';

export const send = Router();

send.post('/send/test', async (req, res) => {
  const { to = 'test@example.com', subject = 'Test', html = '<b>Hello</b>' } = req.body || {};
  const provider = new MailgunProvider(process.env.MAILGUN_API_KEY, process.env.MAILGUN_DOMAIN);
  const result = await provider.sendEmail(to, subject, html);
  res.json(result);
});