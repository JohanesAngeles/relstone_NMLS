/**
 * seedNmlsCourseId.js
 *
 * Updates ALL courses in the Atlas `test` database to have a proper
 * 4-digit numeric nmls_course_id (e.g. 1001, 1002, 1003 ...).
 *
 * Rules:
 *  - Already valid 4+ digit numeric IDs  →  SKIPPED (untouched)
 *  - Anything else (slug, empty, null)   →  assigned next sequential ID
 *
 * Usage:
 *   node seedNmlsCourseId.js --dry-run     ← preview only, no writes
 *   node seedNmlsCourseId.js               ← apply changes
 */

const { MongoClient } = require('mongodb');

// ─── Config ────────────────────────────────────────────────────────────────
const MONGO_URI  = 'mongodb+srv://relstoneitdepartment_db_admin1:L8GTo8SEKkmHjeL2@relstone-nmls.pau4gyj.mongodb.net/?appName=relstone-NMLS';
const DB_NAME    = 'test';          // ← confirmed from diagnoseMongo output
const COLLECTION = 'courses';       // ← confirmed: 43 docs live here
const START_ID   = 1001;            // first ID to assign
const DRY_RUN    = process.argv.includes('--dry-run');

// ─── Helper ────────────────────────────────────────────────────────────────
/** Returns true only for 4+ digit pure-numeric strings like "1001", "2345" */
function isValidNmlsId(val) {
  if (val === null || val === undefined || val === '') return false;
  return /^\d{4,}$/.test(String(val).trim());
}

// ─── Main ──────────────────────────────────────────────────────────────────
async function seed() {
  console.log('\n🔌 Connecting to Atlas...');
  const client = new MongoClient(MONGO_URI);
  await client.connect();
  console.log('✅ Connected.\n');

  if (DRY_RUN) console.log('⚠️  DRY RUN — no changes will be written.\n');

  const col = client.db(DB_NAME).collection(COLLECTION);

  // 1. Load all courses
  const courses = await col.find({}).toArray();
  console.log(`📦 Total courses found: ${courses.length}\n`);

  // 2. Collect already-valid IDs so we never duplicate
  const usedIds = new Set(
    courses
      .filter(c => isValidNmlsId(c.nmls_course_id))
      .map(c => Number(c.nmls_course_id))
  );

  console.log('🔒 Already-valid nmls_course_ids (will be skipped):');
  console.log(usedIds.size ? '   ' + [...usedIds].sort((a,b)=>a-b).join(', ') : '   (none)');
  console.log();

  // 3. Sequential ID generator that skips over already-used slots
  let nextId = START_ID;
  const getNextId = () => {
    while (usedIds.has(nextId)) nextId++;
    const id = nextId++;
    usedIds.add(id);
    return String(id);
  };

  // 4. Find courses that need updating
  const toUpdate = courses.filter(c => !isValidNmlsId(c.nmls_course_id));
  console.log(`🛠️  Courses that need a new nmls_course_id: ${toUpdate.length}\n`);

  if (toUpdate.length === 0) {
    console.log('✅ Nothing to update — all courses already have valid IDs.\n');
    await client.close();
    return;
  }

  // 5. Preview / apply
  const bulkOps = [];

  for (const course of toUpdate) {
    const newId = getNextId();
    const oldId = course.nmls_course_id ?? '(empty)';

    console.log(
      `  [${DRY_RUN ? 'PREVIEW' : 'UPDATE'}]` +
      `  "${course.title || '(no title)'}"\n` +
      `           old: "${oldId}"  →  new: "${newId}"\n`
    );

    if (!DRY_RUN) {
      bulkOps.push({
        updateOne: {
          filter: { _id: course._id },
          update: { $set: { nmls_course_id: newId } },
        },
      });
    }
  }

  // 6. Execute as a single bulk write (fast + atomic per-doc)
  if (!DRY_RUN && bulkOps.length > 0) {
    console.log(`⏳ Writing ${bulkOps.length} updates to Atlas...`);
    const result = await col.bulkWrite(bulkOps, { ordered: false });
    console.log(`\n✅ Done!`);
    console.log(`   Matched : ${result.matchedCount}`);
    console.log(`   Modified: ${result.modifiedCount}`);

    // 7. Print final state
    console.log('\n📋 Final nmls_course_id assignments:');
    const all = await col
      .find({}, { projection: { title: 1, nmls_course_id: 1 } })
      .sort({ nmls_course_id: 1 })
      .toArray();

    all.forEach(c => {
      const id    = String(c.nmls_course_id ?? '').padEnd(6);
      const valid = isValidNmlsId(c.nmls_course_id) ? '✅' : '⚠️ ';
      console.log(`   ${valid}  ${id}  "${c.title || '(no title)'}"`);
    });

  } else if (DRY_RUN) {
    console.log(`\n🔍 Dry run complete. ${toUpdate.length} course(s) would be updated.`);
    console.log('   Re-run without --dry-run to apply.\n');
  }

  await client.close();
  console.log('\n🔌 Disconnected. Done.\n');
}

seed().catch(err => {
  console.error('❌ Seed crashed:', err.message);
  process.exit(1);
});