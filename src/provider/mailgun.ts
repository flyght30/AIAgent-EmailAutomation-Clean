import axios from 'axios';
import type { EmailProvider } from './providerTypes.js';

export class MailgunProvider implements EmailProvider {
  private apiKey: string;
  private domain: string;

  constructor(apiKey?: string, domain?: string) {
    this.apiKey = apiKey || '';
    this.domain = domain || '';
  }

  async sendEmail(to: string, subject: string, html: string, text?: string) {
    if (!this.apiKey || !this.domain) {
      return { success: false, error: 'provider_not_configured' };
    }
    const auth = Buffer.from(`api:${this.apiKey}`).toString('base64');
    try {
      const url = `https://api.mailgun.net/v3/${this.domain}/messages`;
      const form = new URLSearchParams();
      form.append('from', `Legal AI <noreply@${this.domain}>`);
      form.append('to', to);
      form.append('subject', subject);
      form.append('html', html);
      if (text) form.append('text', text);
      const res = await axios.post(url, form, { headers: { Authorization: `Basic ${auth}` } });
      return { success: true, id: res.data?.id };
    } catch (e: any) {
      return { success: false, error: e.message };
    }
  }
}