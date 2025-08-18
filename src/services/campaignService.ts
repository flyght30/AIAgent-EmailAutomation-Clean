import { ObjectId } from 'mongodb';
import { getDb } from '../db/mongo.js';
import { MailgunProvider } from '../provider/mailgun.js';

export type CampaignStatus = 'queued' | 'running' | 'stopped' | 'completed';

export async function createCampaign(input: { name: string; templateSlug: string; recipients: string[] }) {
  const doc = {
    name: input.name,
    templateSlug: input.templateSlug,
    recipients: input.recipients,
    status: 'queued' as CampaignStatus,
    createdAt: new Date(),
    updatedAt: new Date(),
    progress: { sent: 0, total: input.recipients.length }
  };
  const r = await getDb().collection('campaigns').insertOne(doc);
  return { id: r.insertedId.toString(), ...doc };
}

export async function listCampaigns() {
  return getDb().collection('campaigns').find().project({ _id: 0 }).toArray();
}

export async function getCampaign(id: string) {
  const doc = await getDb().collection('campaigns').findOne({ _id: new ObjectId(id) });
  if (!doc) return null;
  const { _id, ...rest } = doc as any;
  return { id: _id.toString(), ...rest };
}

export async function setCampaignStatus(id: string, status: CampaignStatus) {
  await getDb().collection('campaigns').updateOne({ _id: new ObjectId(id) }, { $set: { status, updatedAt: new Date() } });
}

async function sendBatch(campaignId: string, limit = 20) {
  const campaign = await getDb().collection('campaigns').findOne({ _id: new ObjectId(campaignId) });
  if (!campaign || campaign.status !== 'running') return;
  const tpl = await getDb().collection('templates').findOne({ slug: campaign.templateSlug });
  if (!tpl) return;
  const provider = new MailgunProvider(process.env.MAILGUN_API_KEY, process.env.MAILGUN_DOMAIN);
  const sentEmails = new Set<string>();
  const sentCursor = getDb().collection('events').find({ provider: 'mailgun', 'campaign.id': campaignId, type: 'sent' });
  await sentCursor.forEach((e: any) => { if (e?.recipient) sentEmails.add(e.recipient); });
  const remaining = campaign.recipients.filter((r: string) => !sentEmails.has(r)).slice(0, limit);
  for (const to of remaining) {
    const subject = tpl.subject.replace(/{{(\w+)}}/g, (_: any, k: string) => (k === 'firstName' ? to.split('@')[0] : (k === 'firmName' ? 'Your Firm' : '')));
    const html = tpl.html.replace(/{{(\w+)}}/g, (_: any, k: string) => (k === 'firstName' ? to.split('@')[0] : (k === 'firmName' ? 'Your Firm' : '')));
    const res = await provider.sendEmail(to, subject, html);
    await getDb().collection('events').insertOne({ provider: 'mailgun', type: 'sent', recipient: to, result: res, campaign: { id: campaignId }, timestamp: new Date() });
  }
  const newSent = (campaign.progress?.sent || 0) + remaining.length;
  const done = newSent >= campaign.recipients.length;
  await getDb().collection('campaigns').updateOne({ _id: new ObjectId(campaignId) }, { $set: { 'progress.sent': newSent, status: done ? 'completed' : campaign.status, updatedAt: new Date() } });
}

export function attachScheduler() {
  setInterval(async () => {
    try {
      const running = await getDb().collection('campaigns').find({ status: 'running' }).toArray();
      for (const c of running) await sendBatch(c._id.toString(), 25);
    } catch (e) {
      console.error('Scheduler error', (e as any).message);
    }
  }, 30000);
}