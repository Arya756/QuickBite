import mongoose from 'mongoose';
import { MongoMemoryServer } from 'mongodb-memory-server';
import path from 'path';
import fs from 'fs';

async function main() {
  const dbPath = path.join(__dirname, '../../.mongo-data');
  if (!fs.existsSync(dbPath)) {
    console.error('DB path not found:', dbPath);
    process.exit(1);
  }

  const mongod = await MongoMemoryServer.create({
    instance: { dbPath, storageEngine: 'wiredTiger' }
  });
  await mongoose.connect(mongod.getUri());

  const result = await mongoose.connection.collection('users').updateOne(
    { email: 'e2e_admin@test.com' },
    { $set: { role: 'ADMIN' } }
  );
  console.log('Modified:', result.modifiedCount, 'user(s)');

  const users = await mongoose.connection.collection('users')
    .find({}, { projection: { email: 1, role: 1, _id: 0 } }).toArray();
  console.log('All users:', JSON.stringify(users, null, 2));

  await mongoose.disconnect();
  await mongod.stop();
  process.exit(0);
}

main().catch(e => { console.error(e); process.exit(1); });
