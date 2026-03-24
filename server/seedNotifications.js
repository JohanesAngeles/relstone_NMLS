/**
 * Dev script: seeds sample rows into User.notifications.
 * Run from repo root: node server/seedNotifications.js
 * Requires MONGO_URI in server/.env (see server/index.js dotenv path).
 */

const path = require('path');
const mongoose = require('mongoose');
const dotenv = require('dotenv');
const User = require('./models/User');

dotenv.config({ path: path.join(__dirname, '.env') });

const TEST_NOTIFICATIONS = [
  {
    type: 'new',
    title: 'New Course Available: NY CE 2024',
    body: 'A new 8-hour NY-specific CE course is now available for enrollment.',
    read: false,
  },
  {
    type: 'ce',
    title: 'CE Renewal Deadline Approaching',
    body: 'Your CE renewal is due in 30 days. Complete by December 31, 2024.',
    read: false,
  },
  {
    type: 'milestones',
    title: 'Milestone Unlocked: Expert Student',
    body: 'You\'ve completed 5 courses! Unlock the expert badge on your profile.',
    read: false,
  },
  {
    type: 'quiz',
    title: 'Quiz Score: 95% on Federal Law Updates',
    body: 'Great job! You scored 95% on the Federal Law Updates quiz. View detailed feedback.',
    read: true, // Read notification
  },
  {
    type: 'system',
    title: 'System Maintenance Scheduled',
    body: 'Platform maintenance on Feb 20, 10 PM - 12 AM EST. No outages expected.',
    read: true, // Read notification
  },
  {
    type: 'promotions',
    title: 'Your Bundle Deal: Save 20%',
    body: 'Complete all 5 courses in the Mortgage Originator Bundle and save 20%.',
    read: false,
  },
  {
    type: 'milestones',
    title: 'Certificate Ready: 8-hr CE Course',
    body: 'You\'ve earned your certificate! Download now or view in your profile.',
    read: false,
  },
  {
    type: 'quiz',
    title: 'Quiz Reminder: Ethics & Compliance',
    body: 'You have a quiz pending. Complete the Ethics & Compliance quiz to progress.',
    read: false,
  },
];

const seedNotifications = async () => {
  try {
    await mongoose.connect(process.env.MONGO_URI);
    console.log('✓ Connected to MongoDB');

    // Find a test user (create one if doesn't exist)
    let user = await User.findOne({ email: 'test@example.com' });

    if (!user) {
      console.log('ℹ Creating test user');
      user = new User({
        name: 'Test User',
        email: 'test@example.com',
        password: 'hashed_password_here', // This won't be used in login; just for seed
        role: 'student',
        isVerified: true,
      });
      await user.save();
      console.log('✓ Created test user:', user.email);
    }

    // Clear existing notifications
    const oldCount = user.notifications.length;
    user.notifications = [];
    await user.save();
    console.log(`✓ Cleared ${oldCount} old notifications`);

    // Add test notifications with staggered timestamps (realistic)
    const now = new Date();
    TEST_NOTIFICATIONS.forEach((notif, index) => {
      const createdAt = new Date(now.getTime() - (index * 3600000)); // Each 1 hour apart
      user.notifications.push({
        ...notif,
        createdAt,
      });
    });

    await user.save();
    console.log(`✓ Added ${TEST_NOTIFICATIONS.length} test notifications`);

    // Display summary
    const unreadCount = user.notifications.filter(n => !n.read).length;
    console.log('\n📊 Notification Summary:');
    console.log(`   Total: ${user.notifications.length}`);
    console.log(`   Unread: ${unreadCount}`);
    console.log(`   Read: ${user.notifications.length - unreadCount}`);

    console.log('\n📝 Notifications:');
    user.notifications.forEach((n, i) => {
      const status = n.read ? '✅' : '🔔';
      console.log(`   ${status} ${i + 1}. [${n.type}] ${n.title}`);
    });

    console.log('\n✨ Test data seeded successfully!');
    console.log('💡 Login with email: test@example.com');

    process.exit(0);
  } catch (err) {
    console.error('❌ Seeding error:', err.message);
    process.exit(1);
  }
};

seedNotifications();
