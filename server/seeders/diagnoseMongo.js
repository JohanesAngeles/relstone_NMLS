/**
 * diagnoseMongo.js
 * Connects to MongoDB and lists ALL databases + collections + document counts.
 * Run this to find where your courses actually live.
 *
 * Usage:
 *   node diagnoseMongo.js
 */

const { MongoClient } = require('mongodb');

// ✅ Your real Atlas URI
const MONGO_URI =
  'mongodb+srv://relstoneitdepartment_db_admin1:L8GTo8SEKkmHjeL2@relstone-nmls.pau4gyj.mongodb.net/?appName=relstone-NMLS';

async function diagnose() {
  console.log('\n🔌 Connecting with URI:', MONGO_URI, '\n');

  const client = new MongoClient(MONGO_URI);
  await client.connect();

  const adminDb = client.db('admin');
  const { databases } = await adminDb.command({ listDatabases: 1 });

  console.log('📦 Databases found:\n');

  for (const dbInfo of databases) {
    const db = client.db(dbInfo.name);
    const collections = await db.listCollections().toArray();

    console.log(`  🗄️  ${dbInfo.name}`);

    if (collections.length === 0) {
      console.log('       (no collections)');
    }

    for (const col of collections) {
      const count = await db.collection(col.name).countDocuments();
      const sample = count > 0
        ? await db.collection(col.name).findOne({}, { projection: { _id: 1, title: 1, nmls_course_id: 1, name: 1 } })
        : null;

      const preview = sample
        ? `  ← sample: ${JSON.stringify(sample)}`
        : '';

      console.log(`       📁 ${col.name}  (${count} docs)${preview}`);
    }

    console.log();
  }

  await client.close();
  console.log('✅ Done. Copy the correct DB name into your MONGO_URI or seed script.\n');
}

diagnose().catch(err => {
  console.error('❌ Error:', err.message);
  process.exit(1);
});