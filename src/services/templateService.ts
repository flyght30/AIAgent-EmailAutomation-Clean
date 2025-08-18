import { getDb } from '../db/mongo.js';

export async function listTemplates() {
  return getDb().collection('templates').find().project({ _id: 0 }).toArray();
}

export async function getTemplate(slug: string) {
  return getDb().collection('templates').findOne({ slug }, { projection: { _id: 0 } });
}

export async function renderTemplate(slug: string, vars: Record<string, any>) {
  const tpl = await getTemplate(slug);
  if (!tpl) throw new Error('template_not_found');
  const html = (tpl.html || '').replace(/{{(\w+)}}/g, (_: any, k: string) => (vars[k] ?? ''));
  const subject = (tpl.subject || '').replace(/{{(\w+)}}/g, (_: any, k: string) => (vars[k] ?? ''));
  return { subject, html };
}