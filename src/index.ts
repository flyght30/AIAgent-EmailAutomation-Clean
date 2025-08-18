import express from 'express';
import helmet from 'helmet';
import dotenv from 'dotenv';
import { connectMongo } from './db/mongo.js';
import { health } from './routes/health.js';
import { templates } from './routes/templates.js';
import { send } from './routes/send.js';
import { apiKeyAuth } from './utils/apiKeyAuth.js';
import { webhooks } from './routes/webhooks.js';
import { campaigns } from './routes/campaigns.js';
import { attachScheduler } from './services/campaignService.js';

dotenv.config();

const app = express();
app.use(helmet());
app.use(express.json());

app.use(apiKeyAuth);

app.use('/', health);
app.use('/api', templates);
app.use('/api', send);
app.use('/api', campaigns);
app.use('/api', webhooks);

const PORT = Number(process.env.PORT || 8085);

async function start() {
  const uri = process.env.MONGO_URL || 'mongodb://localhost:27017';
  const dbname = process.env.DB_NAME || 'email_automation';
  await connectMongo(uri, dbname);
  attachScheduler();
  app.listen(PORT, '0.0.0.0', () => console.log(`Email Automation listening on ${PORT}`));
}

start().catch(err => {
  console.error('Failed to start server', err);
  process.exit(1);
});