/**
 * fix-orders.js  — run once from your /server folder:
 *   node fix-orders.js
 *
 * Patches all existing 'pending' orders → 'completed'
 * Leaves 'paid' orders alone (dashboard now accepts both 'paid' and 'completed')
 */

const dotenv = require('dotenv');
dotenv.config();
const mongoose = require('mongoose');
const Order    = require('./models/Order');

const run = async () => {
  try {
    await mongoose.connect(process.env.MONGO_URI);
    console.log('✅ MongoDB connected');

    const result = await Order.updateMany(
      { status: 'pending' },
      { $set: { status: 'completed' } }
    );

    console.log(`✅ Fixed ${result.modifiedCount} pending order(s) → status: 'completed'`);
    console.log(`ℹ️  'paid' orders were left as-is — dashboard accepts both 'paid' and 'completed'`);

  } catch (err) {
    console.error('❌ Error:', err.message);
  } finally {
    await mongoose.disconnect();
    console.log('Done.');
    process.exit(0);
  }
};

run();