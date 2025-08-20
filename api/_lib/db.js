// api/_lib/db.js
// Purpose: Create a single cached MongoDB connection for Vercel functions.

let cachedClient = null;
let cachedDb = null;

export async function getDb() {
  if (cachedDb) return cachedDb;
  const { MongoClient } = await import('mongodb');

  const uri = process.env.MONGODB_URI;
  const dbName = process.env.MONGODB_DB_NAME || 'homi';
  if (!uri) throw new Error('MONGODB_URI is not set');

  if (!cachedClient) {
    cachedClient = new MongoClient(uri, { ignoreUndefined: true });
    await cachedClient.connect();
  }
  cachedDb = cachedClient.db(dbName);
  return cachedDb;
}


