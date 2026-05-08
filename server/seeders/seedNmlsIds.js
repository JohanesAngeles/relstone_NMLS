const mongoose = require('mongoose');
const User = require('../models/User');

require('dotenv').config({ path: '../.env' });

async function seedNmlsIds() {
  await mongoose.connect(process.env.MONGO_URI);
  console.log('MongoDB connected');

  // Get all users sorted by createdAt so IDs are assigned in order
  const users = await User.find({}).sort({ createdAt: 1 });
  console.log(`Found ${users.length} users`);

  let counter = 1;
  for (const user of users) {
    // Skip if already has RELSTONE format
    if (user.nmls_id && user.nmls_id.startsWith('RELSTONE')) {
      // Extract the number to keep counter in sync
      const num = parseInt(user.nmls_id.replace('RELSTONE', ''));
      if (!isNaN(num) && num >= counter) counter = num + 1;
      console.log(`⏭  Skipping ${user.email} — already has ${user.nmls_id}`);
      continue;
    }

    const newNmlsId = `RELSTONE${String(counter).padStart(3, '0')}`;
    await User.findByIdAndUpdate(user._id, { nmls_id: newNmlsId });
    console.log(`✅ ${user.email} → ${newNmlsId}`);
    counter++;
  }

  console.log('\nDone! All users updated.');
  await mongoose.disconnect();
}

seedNmlsIds().catch(err => {
  console.error('Error:', err);
  process.exit(1);
});