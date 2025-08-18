import { Router } from 'express';
import { createCampaign, getCampaign, listCampaigns, setCampaignStatus } from '../services/campaignService.js';

export const campaigns = Router();

campaigns.get('/campaigns', async (_req, res) => {
  const items = await listCampaigns();
  res.json({ campaigns: items });
});

campaigns.get('/campaigns/:id', async (req, res) => {
  const item = await getCampaign(req.params.id);
  if (!item) return res.status(404).json({ error: 'not_found' });
  res.json({ campaign: item });
});

campaigns.post('/campaigns', async (req, res) => {
  try {
    const { name, templateSlug, recipients } = req.body || {};
    if (!name || !templateSlug || !Array.isArray(recipients) || recipients.length === 0) {
      return res.status(400).json({ error: 'name_templateSlug_recipients_required' });
    }
    const result = await createCampaign({ name, templateSlug, recipients });
    res.status(201).json({ success: true, campaign: result });
  } catch (e: any) {
    res.status(500).json({ error: e.message });
  }
});

campaigns.post('/campaigns/:id/start', async (req, res) => {
  const id = req.params.id;
  await setCampaignStatus(id, 'running');
  res.json({ success: true, status: 'running' });
});

campaigns.post('/campaigns/:id/stop', async (req, res) => {
  const id = req.params.id;
  await setCampaignStatus(id, 'stopped');
  res.json({ success: true, status: 'stopped' });
});