const mongoose = require('mongoose');
const dotenv = require('dotenv');
const Course = require('./models/Course');

dotenv.config();

const testCourse = {
  title: 'TEST COURSE',
  nmls_course_id: 'CE-TEST-8HR',
  type: 'CE',
  credit_hours: 8,
  description: 'A test course seeded to verify state approval number behavior.',
  price: 0,
  states_approved: ['CA'],
  state_approval_number: 'CE-TEST-8HR',
  has_textbook: false,
  textbook_price: 0,
  is_active: true,
  modules: [
    { title: 'Test Module 1', order: 1 },
    { title: 'Test Module 2', order: 2 },
    { title: 'Test Module 3', order: 3 },
    { title: 'Test Module 4', order: 4 },
  ],
};

const seedTestCourse = async () => {
  try {
    await mongoose.connect(process.env.MONGO_URI, {
      useNewUrlParser: true,
      useUnifiedTopology: true,
    });

    console.log('✅ MongoDB connected');

    const course = await Course.findOneAndUpdate(
      { title: testCourse.title },
      { $set: testCourse },
      { new: true, upsert: true, setDefaultsOnInsert: true }
    );

    console.log('\n✅ TEST COURSE seeded:');
    console.log(`  title:               ${course.title}`);
    console.log(`  nmls_course_id:      ${course.nmls_course_id}`);
    console.log(`  state_approval_number: ${course.state_approval_number}`);
    console.log(`  states_approved:     ${course.states_approved.join(', ')}`);

    await mongoose.disconnect();
    console.log('\n✅ Done. Run the verify page or certificate flow to confirm state approval output.');
    process.exit(0);
  } catch (err) {
    console.error('❌ Seed test failed:', err);
    process.exit(1);
  }
};

seedTestCourse();
