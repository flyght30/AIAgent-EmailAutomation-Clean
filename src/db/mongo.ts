import { MongoClient, Db } from 'mongodb';

let client: MongoClient;
let db: Db;

export async function connectMongo(uri: string, dbName: string) {
  client = new MongoClient(uri);
  await client.connect();
  db = client.db(dbName);
  await ensureIndexes();
  return db;
}

export function getDb() {
  if (!db) throw new Error('Mongo not connected');
  return db;
}

async function ensureIndexes() {
  const d = getDb();
  await d.collection('templates').createIndex({ slug: 1 }, { unique: true });
  await d.collection('campaigns').createIndex({ status: 1, createdAt: -1 });
  await d.collection('events').createIndex({ timestamp: -1 });
}