import { Router } from 'express';
import { listTemplates, renderTemplate } from '../services/templateService.js';
import { getDb } from '../db/mongo.js';

export const templates = Router();

templates.get('/templates', async (_req, res) => {
  const items = await listTemplates();
  res.json({ templates: items });
});

templates.get('/templates/:slug', async (req, res) => {
  const slug = req.params.slug;
  const tpl = await getDb().collection('templates').findOne({ slug }, { projection: { _id: 0 } });
  if (!tpl) return res.status(404).json({ error: 'not_found' });
  res.json({ template: tpl });
});

templates.post('/templates', async (req, res) => {
  try {
    const { slug, subject, html } = req.body || {};
    if (!slug || !subject || !html) return res.status(400).json({ error: 'slug_subject_html_required' });
    const doc = { slug, subject, html, createdAt: new Date(), updatedAt: new Date() };
    await getDb().collection('templates').insertOne(doc);
    res.status(201).json({ success: true, template: { slug, subject, html } });
  } catch (e: any) {
    if (e.code === 11000) return res.status(409).json({ error: 'slug_conflict' });
    res.status(500).json({ error: e.message });
  }
});

templates.put('/templates/:slug', async (req, res) => {
  const slug = req.params.slug;
  const { subject, html } = req.body || {};
  if (!subject && !html) return res.status(400).json({ error: 'nothing_to_update' });
  const upd: any = { updatedAt: new Date() };
  if (subject) upd.subject = subject;
  if (html) upd.html = html;
  const r = await getDb().collection('templates').findOneAndUpdate(
    { slug }, { $set: upd }, { returnDocument: 'after', projection: { _id: 0 } }
  );
  if (!r.value) return res.status(404).json({ error: 'not_found' });
  res.json({ success: true, template: r.value });
});

templates.delete('/templates/:slug', async (req, res) => {
  const slug = req.params.slug;
  const r = await getDb().collection('templates').deleteOne({ slug });
  res.json({ success: r.deletedCount === 1 });
});

templates.post('/templates/preview', async (req, res) => {
  try {
    const { slug, variables } = req.body || {};
    const preview = await renderTemplate(slug, variables || {});
    res.json({ success: true, preview });
  } catch (e: any) {
    res.status(400).json({ success: false, error: e.message });
  }
});