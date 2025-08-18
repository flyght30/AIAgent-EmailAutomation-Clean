import dotenv from 'dotenv';
import { connectMongo, getDb } from '../db/mongo.js';

dotenv.config();

async function run() {
  const uri = process.env.MONGO_URL || 'mongodb://localhost:27017';
  const dbname = process.env.DB_NAME || 'email_automation';
  await connectMongo(uri, dbname);

  const welcome = {
    slug: 'welcome',
    subject: 'Welcome to {{firmName}}',
    html: `<h1>Welcome, {{firstName}}!</h1><p>We're excited to help you. — {{firmName}}</p>`,
    createdAt: new Date(),
    updatedAt: new Date()
  };

  await getDb().collection('templates').updateOne(
    { slug: welcome.slug },
    { $set: welcome },
    { upsert: true }
  );

  console.log('Seeded template: welcome');
  process.exit(0);
}

run().catch(err => { console.error(err); process.exit(1); });