/**
 * NMLS Course Seed File
 * Run with: node seed.js
 * Seeds all CE courses per state based on NMLS Course List
 * Place this file in your server root (same level as index.js)
 */

const mongoose = require('mongoose');
const dotenv = require('dotenv');
const Course = require('../models/Course');

dotenv.config();

// ── States that use the GENERAL 8-hour CE course (no state elective) ──
const GENERAL_CE_STATES = [
  'AL', 'AK', 'AR', 'CA', // California-DRE
  'CO', 'DE', 'GU', 'IL',
  'IN', // Indiana-DFI & Indiana-SOS
  'IA', 'KS', 'LA', 'ME',
  'MI', 'MS', 'MT', 'NE',
  'NH', 'ND', 'OH', 'OK',
  'PR', 'SD', 'TN',
  'TX', // Texas-OCCC & Texas-SML
  'UT', // Utah-DFI
  'VT', 'VI', 'VA', 'WI', 'WY'
];

// ── States that have their own state-specific CE course ──
const STATE_SPECIFIC_CE = [
  { state: 'AZ', title: '8-HOUR AZ SAFE COMPREHENSIVE: ANNUAL MLO FUNDAMENTALS' },
  { state: 'CA', title: '8-HOUR CA-DFPI SAFE COMPREHENSIVE: ANNUAL MLO FUNDAMENTALS' }, // California-DFPI
  { state: 'CT', title: '8-HOUR CT SAFE COMPREHENSIVE: ANNUAL MLO FUNDAMENTALS' },
  { state: 'DC', title: '8-HOUR DC SAFE COMPREHENSIVE: ANNUAL MLO FUNDAMENTALS' },
  { state: 'FL', title: '8-HOUR FL SAFE COMPREHENSIVE: ANNUAL MLO FUNDAMENTALS' },
  { state: 'GA', title: '8-HOUR GA SAFE COMPREHENSIVE: ANNUAL MLO FUNDAMENTALS' },
  { state: 'HI', title: '8-HOUR HI SAFE COMPREHENSIVE: ANNUAL MLO FUNDAMENTALS' },
  { state: 'ID', title: '8-HOUR ID SAFE COMPREHENSIVE: ANNUAL MLO FUNDAMENTALS' },
  { state: 'KY', title: '8-HOUR KY SAFE COMPREHENSIVE: ANNUAL MLO FUNDAMENTALS' },
  { state: 'MD', title: '8-HOUR MD SAFE COMPREHENSIVE: ANNUAL MLO FUNDAMENTALS' },
  { state: 'MA', title: '8-HOUR MA SAFE COMPREHENSIVE: ANNUAL MLO FUNDAMENTALS' },
  { state: 'MN', title: '8-HOUR MN SAFE COMPREHENSIVE: ANNUAL MLO FUNDAMENTALS' },
  { state: 'MO', title: '8-HOUR MO SAFE COMPREHENSIVE: ANNUAL MLO FUNDAMENTALS' },
  { state: 'NV', title: '8-HOUR NV SAFE COMPREHENSIVE: ANNUAL MLO FUNDAMENTALS' },
  { state: 'NJ', title: '8-HOUR NJ SAFE COMPREHENSIVE: ANNUAL MLO FUNDAMENTALS' },
  { state: 'NM', title: '8-HOUR NM SAFE COMPREHENSIVE: ANNUAL MLO FUNDAMENTALS' },
  { state: 'NY', title: '8-HOUR NY SAFE COMPREHENSIVE: ANNUAL MLO FUNDAMENTALS' },
  { state: 'NC', title: '8-HOUR NC SAFE COMPREHENSIVE: ANNUAL MLO FUNDAMENTALS' },
  { state: 'OR', title: '8-HOUR OR SAFE COMPREHENSIVE: ANNUAL MLO FUNDAMENTALS' },
  { state: 'PA', title: '8-HOUR PA SAFE COMPREHENSIVE: ANNUAL MLO FUNDAMENTALS' },
  { state: 'RI', title: '8-HOUR RI SAFE COMPREHENSIVE: ANNUAL MLO FUNDAMENTALS' },
  { state: 'SC', title: '8-HOUR SC-BFI SAFE COMPREHENSIVE: ANNUAL MLO FUNDAMENTALS' }, // SC-BFI
  { state: 'SC', title: '8-HOUR SC-DCA SAFE COMPREHENSIVE: ANNUAL MLO FUNDAMENTALS' }, // SC-DCA
  { state: 'UT', title: '8-HOUR UT-DRE SAFE COMPREHENSIVE: ANNUAL MLO FUNDAMENTALS' }, // Utah-DRE
  { state: 'WA', title: '8-HOUR WA SAFE COMPREHENSIVE: ANNUAL MLO FUNDAMENTALS' },
  { state: 'WV', title: '8-HOUR WV SAFE COMPREHENSIVE: ANNUAL MLO FUNDAMENTALS' },
];

// ── Build courses array ──
const courses = [];

// 1. General CE Course (covers all general states)
courses.push({
  title: '8-HOUR SAFE COMPREHENSIVE: MORTGAGE LOAN ORIGINATOR',
  nmls_course_id: 'CE-GENERAL-8HR',
  type: 'CE',
  credit_hours: 8,
  description:
    'The 8-hour SAFE Comprehensive continuing education course for Mortgage Loan Originators. ' +
    'Covers federal law updates (3 hrs), ethics and consumer protection (2 hrs), ' +
    'non-traditional mortgage products (2 hrs), and elective content (1 hr). ' +
    'Required annually for MLO license renewal. Must be completed by December 31st each year.',
  price: 99.00,
  states_approved: GENERAL_CE_STATES,
  has_textbook: false,
  textbook_price: 0,
  is_active: true,
  modules: [
    { title: 'Federal Mortgage-Related Law Updates', order: 1 },
    { title: 'Ethics, Fraud & Consumer Protection', order: 2 },
    { title: 'Non-Traditional Mortgage Products', order: 3 },
    { title: 'Elective: Mortgage Industry Best Practices', order: 4 },
  ]
});

// 2. State-Specific CE Courses
STATE_SPECIFIC_CE.forEach((item, index) => {
  // Generate a unique nmls_course_id
  const stateCode = item.title.match(/8-HOUR ([A-Z\-]+) SAFE/)?.[1] || item.state;
  courses.push({
    title: item.title,
    nmls_course_id: `CE-${stateCode}-8HR`,
    type: 'CE',
    credit_hours: 8,
    description:
      `The 8-hour SAFE Comprehensive continuing education course for ${item.state} Mortgage Loan Originators. ` +
      'Covers federal law updates (3 hrs), ethics and consumer protection (2 hrs), ' +
      'non-traditional mortgage products (2 hrs), and state-specific elective content (1 hr). ' +
      'Required annually for MLO license renewal. Must be completed by December 31st each year.',
    price: 99.00,
    states_approved: [item.state],
    has_textbook: false,
    textbook_price: 0,
    is_active: true,
    modules: [
      { title: 'Federal Mortgage-Related Law Updates', order: 1 },
      { title: 'Ethics, Fraud & Consumer Protection', order: 2 },
      { title: 'Non-Traditional Mortgage Products', order: 3 },
      { title: `${item.state} State-Specific Elective`, order: 4 },
    ]
  });
});

// 3. PE Course — 20-Hour SAFE Act Pre-Licensing (all states)
courses.push({
  title: '20-HOUR SAFE ACT PRE-LICENSING EDUCATION (PE)',
  nmls_course_id: 'PE-NATIONAL-20HR',
  type: 'PE',
  credit_hours: 20,
  description:
    'The required 20-hour SAFE Act pre-licensing education course for first-time Mortgage Loan Originator applicants. ' +
    'Covers federal mortgage-related law (3 hrs), ethics, fraud and consumer protection (3 hrs), ' +
    'non-traditional mortgage products (2 hrs), and elective topics (12 hrs). ' +
    'Required before applying for an MLO license in any state.',
  price: 199.00,
  states_approved: [
    'AL','AK','AZ','AR','CA','CO','CT','DC','DE','FL','GA',
    'GU','HI','ID','IL','IN','IA','KS','KY','LA','ME','MD',
    'MA','MI','MN','MS','MO','MT','NE','NV','NH','NJ','NM',
    'NY','NC','ND','OH','OK','OR','PA','PR','RI','SC','SD',
    'TN','TX','UT','VT','VI','VA','WA','WV','WI','WY'
  ],
  has_textbook: false,
  textbook_price: 0,
  is_active: true,
  modules: [
    { title: 'Federal Mortgage-Related Law', order: 1 },
    { title: 'Ethics, Fraud & Consumer Protection', order: 2 },
    { title: 'Non-Traditional Mortgage Products', order: 3 },
    { title: 'Elective: Mortgage Origination Fundamentals', order: 4 },
    { title: 'Elective: Loan Products & Underwriting', order: 5 },
    { title: 'Elective: Closing, Settlement & Compliance', order: 6 },
  ]
});

// ── Seed function ──
const seedCourses = async () => {
  try {
    await mongoose.connect(process.env.MONGO_URI);
    console.log('✅ MongoDB connected');

    // Clear existing courses
    await Course.deleteMany({});
    console.log('🗑️  Existing courses cleared');

    // Insert all courses
    const inserted = await Course.insertMany(courses);
    console.log(`✅ ${inserted.length} courses seeded successfully:`);

    inserted.forEach(c => {
      console.log(`   → [${c.type}] ${c.title} (${c.states_approved.length} state(s))`);
    });

    console.log('\n📊 Summary:');
    console.log(`   PE Courses: ${inserted.filter(c => c.type === 'PE').length}`);
    console.log(`   CE Courses: ${inserted.filter(c => c.type === 'CE').length}`);
    console.log(`   Total:      ${inserted.length}`);

    mongoose.disconnect();
    console.log('\n✅ Done! Database seeded.');
    process.exit(0);

  } catch (err) {
    console.error('❌ Seed failed:', err.message);
    process.exit(1);
  }
};

seedCourses();