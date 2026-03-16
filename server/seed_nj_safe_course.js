/**
 * seed_nj_safe_course.js
 * Drop this in: relstone_NMLS/server/
 * Run with:     node seed_nj_safe_course.js
 *
 * COURSE STRUCTURE:
 * Step 1  📄 Lesson    — Module 1: Federal Mortgage-Related Laws [cite: 3, 4]
 * Step 2  📋 Checkpoint — Module 1 Quiz (5 questions) [cite: 31]
 * Step 3  📄 Lesson    — Module 2: Ethical Guidelines for MLOs [cite: 32, 33]
 * Step 4  📋 Checkpoint — Module 2 Quiz (5 questions) [cite: 60]
 * Step 5  📄 Lesson    — Module 3: Non-Traditional Mortgage Lending [cite: 61, 62]
 * Step 6  📋 Checkpoint — Module 3 Quiz (5 questions) [cite: 89]
 * Step 7  📄 Lesson    — Module 4: Mortgage Origination [cite: 90, 91]
 * Step 8  📋 Checkpoint — Module 4 Quiz (5 questions) [cite: 118]
 * Step 9  📄 Lesson    — Module 5: New Jersey State Law and Regulations [cite: 119, 120]
 * Step 9b 📋 PDF Gate  — Study Material + checkbox confirmation
 * Step 9c 📝 Fundamentals Exam — NJ Fundamentals (70 questions) [cite: 149]
 * Step 10 🏆 Final Exam — Official Final Exam (35 questions) [cite: 256, 322]
 */

const mongoose = require('mongoose');
const dotenv   = require('dotenv');
dotenv.config();

const Course = require('./models/Course');

// ── Shared PDF URLs ───────────────────────────────────────────────────
const NJ_TEXTBOOK_PDF = 'https://www.dropbox.com/scl/fo/enrih9t4dnji9j47b2mge/AGJ9HITZYEolbvVDD49GdiA/NEW%20JERSEY/12-Hour%20NJ%20SAFE%20Comprehensive%20-%20Annual%20MLO%20Fundamentals.pdf?rlkey=jdwbravxwpfj6idgxzhxr3ynj&st=ndf9v0b7&raw=1';
const NJ_FINAL_PDF    = 'https://www.dropbox.com/scl/fi/q006ex5cqpa1w4r584fjv/FINAL.pdf?rlkey=3vl8y5qwdmhlvutcn977m92ll&st=y56fqyot&raw=1';

// ── 70-Question NJ Fundamentals Bank ─────────────────────────────────
// Correct indices mapping: 0=a, 1=b, 2=c, 3=d
const FUNDAMENTALS_70 = [
  { number: 1, question: 'Under the Ability-to-Repay rule, a creditor must make a:', options: ['Collateral-only decision', 'Reasonable, good-faith determination', 'Commission-based decision', 'Credit-score-only evaluation'], correct_index: 1 }, // [cite: 150, 255]
  { number: 2, question: 'The New Jersey Residential Mortgage Lending Act is administered by the:', options: ['CFPB', 'New Jersey Department of Banking and Insurance', 'HUD', 'FDIC'], correct_index: 1 }, // [cite: 152, 255]
  { number: 3, question: 'RESPA Section 8 prohibits:', options: ['Adjustable-rate mortgages', 'Kickbacks and unearned fees', 'Escrow accounts', 'Balloon payments'], correct_index: 1 }, // [cite: 154, 255]
  { number: 4, question: 'Negative amortization results in:', options: ['Faster loan payoff', 'Reduced loan balance', 'Increasing loan balance', 'Fixed principal payments'], correct_index: 2 }, // [cite: 155, 255]
  { number: 5, question: 'The SAFE Act requires a minimum of how many hours of pre-licensing education?', options: ['15', '20', '25', '30'], correct_index: 1 }, // [cite: 157, 255]
  { number: 6, question: 'The Loan Estimate must be delivered within:', options: ['2 business days', '3 business days', '5 business days', '7 business days'], correct_index: 1 }, // [cite: 159, 255]
  { number: 7, question: 'APR represents:', options: ['Note rate only', 'Cost of credit expressed as a yearly rate', 'Escrow balance', 'Property taxes'], correct_index: 1 }, // [cite: 161, 255]
  { number: 8, question: 'Redlining refers to:', options: ['Charging higher points', 'Refusing loans based on neighborhood demographics', 'Increasing APR', 'Charging appraisal fees'], correct_index: 1 }, // [cite: 163, 255]
  { number: 9, question: 'Annual continuing education for MLOs requires:', options: ['6 hours', '7 hours', '8 hours', '12 hours'], correct_index: 2 }, // [cite: 165, 255]
  { number: 10, question: 'An MLO must obtain a unique identifier through:', options: ['HUD', 'CFPB', 'NMLS', 'OCC'], correct_index: 2 }, // [cite: 166, 255]
  { number: 11, question: 'Payment shock most commonly occurs when:', options: ['Escrow decreases', 'Interest-only period ends', 'Loan balance decreases', 'Rate remains fixed'], correct_index: 1 }, // [cite: 167, 255]
  { number: 12, question: 'The federal agency primarily enforcing TILA for nonbanks is:', options: ['OCC', 'FDIC', 'CFPB', 'Federal Reserve'], correct_index: 2 }, // [cite: 169, 255]
  { number: 13, question: 'Under ECOA, adverse action notice must be provided within:', options: ['15 days', '20 days', '30 days', '45 days'], correct_index: 2 }, // [cite: 170, 255]
  { number: 14, question: 'Which is a protected class under the Fair Housing Act?', options: ['Credit score', 'Disability', 'Income level', 'Loan size'], correct_index: 1 }, // [cite: 172, 255]
  { number: 15, question: 'A Qualified Mortgage generally limits points and fees to:', options: ['2%', '3%', '4%', '5%'], correct_index: 1 }, // [cite: 174, 255]
  { number: 16, question: 'HMDA requires reporting of:', options: ['Advertising expenses', 'Mortgage application data', 'Employee bonuses', 'Underwriting software'], correct_index: 1 }, // [cite: 175, 255]
  { number: 17, question: 'TRID integrated disclosures from:', options: ['ECOA and FHA', 'TILA and RESPA', 'SAFE and HMDA', 'ATR and QM'], correct_index: 1 }, // [cite: 176, 255]
  { number: 18, question: 'Reverse redlining refers to:', options: ['Serving all communities equally', 'Targeting protected classes for high-cost loans', 'Avoiding rural lending', 'Lowering rates'], correct_index: 1 }, // [cite: 178, 255]
  { number: 19, question: 'The Closing Disclosure must be provided:', options: ['At application', '1 day before closing', '3 business days before consummation', 'After closing'], correct_index: 2 }, // [cite: 180, 255]
  { number: 20, question: 'The SAFE exam requires a minimum passing score of:', options: ['70%', '75%', '80%', '85%'], correct_index: 1 }, // [cite: 182, 255]
  { number: 21, question: 'Section 8(b) of RESPA prohibits:', options: ['Balloon loans', 'Unearned fee splitting', 'ARMs', 'Escrow accounts'], correct_index: 1 }, // [cite: 183, 255]
  { number: 22, question: 'Disparate impact refers to:', options: ['Intentional discrimination', 'Neutral policy with discriminatory effect', 'Rate changes', 'Credit scoring'], correct_index: 1 }, // [cite: 184, 255]
  { number: 23, question: 'Under New Jersey law, mortgage licenses are issued through:', options: ['CFPB', 'NJ Department of Banking and Insurance', 'HUD', 'Federal Reserve'], correct_index: 1 }, // [cite: 186, 255]
  { number: 24, question: 'Which feature is prohibited in most Qualified Mortgages?', options: ['Fixed rate', 'Negative amortization', 'Escrow account', '15-year term'], correct_index: 1 }, // [cite: 188, 255]
  { number: 25, question: 'APR tolerance for regular transactions is:', options: ['0.50%', '0.25%', '0.125%', '1%'], correct_index: 2 }, // [cite: 190, 255]
  { number: 26, question: 'The Ability-to-Repay rule was strengthened by:', options: ['SAFE Act', 'Dodd-Frank Act', 'HMDA', 'RESPA'], correct_index: 1 }, // [cite: 191, 255]
  { number: 27, question: 'Under ECOA, records must be retained for:', options: ['12 months', '18 months', '24 months', '25 months'], correct_index: 3 }, // [cite: 192, 255]
  { number: 28, question: 'Zero-tolerance fees include:', options: ['Escrow deposits', 'Lender origination charges', 'Insurance premiums', 'Prepaid interest'], correct_index: 1 }, // [cite: 194, 255]
  { number: 29, question: 'HOEPA applies to:', options: ['All conventional loans', 'High-cost mortgages', 'FHA loans only', 'USDA loans only'], correct_index: 1 }, // [cite: 195, 255]
  { number: 30, question: 'The SAFE Act was enacted in:', options: ['2005', '2007', '2008', '2010'], correct_index: 2 }, // [cite: 196, 255]
  { number: 31, question: 'Occupancy fraud occurs when:', options: ['Taxes unpaid', 'Borrower misrepresents primary residence intent', 'Escrow shortage', 'ARM reset'], correct_index: 1 }, // [cite: 197, 255]
  { number: 32, question: 'Fraud involving altered income documentation is:', options: ['Appraisal fraud', 'Income fraud', 'Occupancy fraud', 'Equity stripping'], correct_index: 1 }, // [cite: 199, 255]
  { number: 33, question: 'Which is a red flag for fraud?', options: ['Clear documentation', 'Evasive borrower answers', 'Stable income', 'Consistent file'], correct_index: 1 }, // [cite: 200, 255]
  { number: 34, question: 'Ethical conduct requires placing:', options: ['Employer profit first', 'Borrower’s best interest first', 'Sales quota first', 'Volume goals first'], correct_index: 1 }, // [cite: 202, 255]
  { number: 35, question: 'Disparate treatment is:', options: ['Neutral policy effect', 'Intentional discrimination', 'Credit pricing', 'ARM reset'], correct_index: 1 }, // [cite: 204, 255]
  { number: 36, question: 'Negative amortization primarily causes:', options: ['Reduced balance', 'Increased balance', 'Fixed payment', 'Lower risk'], correct_index: 1 }, // [cite: 205, 255]
  { number: 37, question: 'Interest-only loans primarily delay:', options: ['Escrow', 'Principal repayment', 'Insurance', 'Closing'], correct_index: 1 }, // [cite: 206, 255]
  { number: 38, question: 'Risk layering increases:', options: ['Loan simplicity', 'Default probability', 'Compliance ease', 'Equity growth'], correct_index: 1 }, // [cite: 207, 255]
  { number: 39, question: 'An ARM rate is based on:', options: ['Fixed rate only', 'Index plus margin', 'Credit score', 'Escrow'], correct_index: 1 }, // [cite: 208, 255]
  { number: 40, question: 'Refinancing dependence risk increases when:', options: ['Rates fall', 'Property appreciates', 'Credit tightens', 'Income rises'], correct_index: 2 }, // [cite: 210, 255]
  { number: 41, question: 'Consumer protection in non-traditional lending focuses on:', options: ['Yield maximization', 'Suitability and disclosure', 'Removing ATR', 'Lower fees'], correct_index: 1 }, // [cite: 211, 255]
  { number: 42, question: 'Which type of mortgage is most predictable?', options: ['Payment option ARM', 'Interest-only', 'Fully amortizing fixed', 'Negative amortization'], correct_index: 2 }, // [cite: 213, 255]
  { number: 43, question: 'Equity erosion risk is highest in:', options: ['Fixed-rate mortgages', 'Fully amortizing loans', 'Negative amortization loans', 'FHA loans'], correct_index: 2 }, // [cite: 215, 255]
  { number: 44, question: 'Borrower suitability assessment requires:', options: ['Maximizing loan size', 'Evaluating long-term affordability', 'Ignoring reserves', 'Avoiding ATR'], correct_index: 1 }, // [cite: 217, 255]
  { number: 45, question: 'Under New Jersey law, operating without a license may result in:', options: ['Warning letter only', 'Administrative penalties', 'Escrow waiver', 'Rate reduction'], correct_index: 1 }, // [cite: 218, 255]
  { number: 46, question: 'Administrative enforcement may include:', options: ['Cease-and-desist orders', 'Escrow review', 'Rate reductions', 'Credit reporting'], correct_index: 0 }, // [cite: 220, 255]
  { number: 47, question: 'New Jersey enforcement authority comes from:', options: ['CFPB', 'NJ Department of Banking and Insurance', 'HUD', 'FDIC'], correct_index: 1 }, // [cite: 221, 255]
  { number: 48, question: 'Bank statement loans are commonly used by:', options: ['W-2 employees', 'Self-employed borrowers', 'Retirees only', 'FHA borrowers'], correct_index: 1 }, // [cite: 223, 255]
  { number: 49, question: 'A Qualified Mortgage requires ATR compliance under:', options: ['TILA', 'Dodd-Frank', 'HMDA', 'FHA'], correct_index: 1 }, // [cite: 225, 255]
  { number: 50, question: 'HMDA helps regulators:', options: ['Set rates', 'Detect discriminatory lending', 'Calculate APR', 'Approve loans'], correct_index: 1 }, // [cite: 226, 255]
  { number: 51, question: 'A borrower must receive appraisals:', options: ['Only upon request', 'Free of charge', 'After closing', 'Only if denied'], correct_index: 1 }, // [cite: 227, 255]
  { number: 52, question: 'Refusing loans based on race violates:', options: ['SAFE Act', 'RESPA', 'Fair Housing Act', 'HMDA'], correct_index: 2 }, // [cite: 229, 255]
  { number: 53, question: 'Minimum CE hours annually for MLOs:', options: ['6', '7', '8', '12'], correct_index: 3 }, // [cite: 230, 255]
  { number: 54, question: 'APR includes:', options: ['Property taxes', 'Interest and certain finance charges', 'Title fees only', 'Escrow'], correct_index: 1 }, // [cite: 231, 255]
  { number: 55, question: 'Under RESPA Section 9, sellers may not:', options: ['Require specific title insurer', 'Adjust rates', 'Charge taxes', 'Require escrow'], correct_index: 0 }, // [cite: 232, 255]
  { number: 56, question: 'TRID requires redisclosure if APR becomes:', options: ['Lower', 'Inaccurate beyond tolerance', 'Fixed', 'Higher than note'], correct_index: 1 }, // [cite: 234, 255]
  { number: 57, question: 'A high-cost mortgage requires additional:', options: ['Advertising', 'Counseling disclosures', 'Appraisal waivers', 'Escrow removal'], correct_index: 1 }, // [cite: 235, 255]
  { number: 58, question: 'The Fair Housing Act is enforced primarily by:', options: ['CFPB', 'HUD', 'OCC', 'FDIC'], correct_index: 1 }, // [cite: 236, 255]
  { number: 59, question: 'Risk of equity erosion increases when:', options: ['Balance shrinks', 'Balance grows', 'Rate fixed', 'Escrow stable'], correct_index: 1 }, // [cite: 237, 255]
  { number: 60, question: 'Which is NOT protected under FHA but IS under ECOA?', options: ['Race', 'Religion', 'Marital status', 'National origin'], correct_index: 2 }, // [cite: 238, 255]
  { number: 61, question: 'An affiliated business arrangement is permitted if:', options: ['Mandatory use', 'Proper disclosure and optional use', 'Hidden fee', 'Secret referral'], correct_index: 1 }, // [cite: 240, 255]
  { number: 62, question: 'Documentation standards are essential to:', options: ['Increase commissions', 'Demonstrate compliance', 'Avoid disclosures', 'Remove QM'], correct_index: 1 }, // [cite: 242, 255]
  { number: 63, question: 'Which CE category must include fraud prevention?', options: ['Federal law', 'Ethics', 'Non-traditional', 'Elective'], correct_index: 1 }, // [cite: 243, 255]
  { number: 64, question: 'Reverse redlining most directly violates:', options: ['SAFE Act', 'Fair Housing Act', 'HMDA', 'ECOA'], correct_index: 1 }, // [cite: 244, 255]
  { number: 65, question: 'Which underwriting factor is required under ATR?', options: ['Property appreciation', 'Credit score only', 'Current income or assets', 'Commission structure'], correct_index: 2 }, // [cite: 245, 255]
  { number: 66, question: 'HMDA data must be submitted by:', options: ['January 1', 'February 1', 'March 1', 'April 1'], correct_index: 2 }, // [cite: 247, 255]
  { number: 67, question: 'The New Jersey Commissioner may issue:', options: ['Stock penalties', 'Cease-and-desist orders', 'Escrow waivers', 'Appraisal exemptions'], correct_index: 1 }, // [cite: 248, 255]
  { number: 68, question: 'Payment shock is best described as:', options: ['Gradual increase', 'Sudden significant payment increase', 'Escrow decrease', 'Fixed payment'], correct_index: 1 }, // [cite: 249, 255]
  { number: 69, question: 'Negative amortization is most commonly associated with:', options: ['Fully amortizing loans', 'Payment option ARMs', '15-year fixed loans', 'FHA loans'], correct_index: 1 }, // [cite: 251, 255]
  { number: 70, question: 'Failure to comply with disclosure requirements may result in:', options: ['Higher commissions', 'Regulatory penalties', 'Lower APR', 'Faster closing'], correct_index: 1 } // [cite: 253, 255]
];

// ── Official Final Exam: 35 Questions ────────────────────────────────
const FINAL_EXAM_35 = [
  { number: 1, question: 'Under the Ability-to-Repay rule, a creditor must make a:', options: ['Collateral-only decision', 'Reasonable, good-faith determination', 'Commission-based decision', 'Credit-score-only evaluation'], correct_index: 1 }, // [cite: 258, 322]
  { number: 2, question: 'RESPA Section 8 prohibits:', options: ['Adjustable-rate mortgages', 'Kickbacks and unearned fees', 'Escrow accounts', 'Balloon payments'], correct_index: 1 }, // [cite: 260, 322]
  { number: 3, question: 'The SAFE Act requires a minimum of how many hours of pre-licensing education?', options: ['15', '20', '25', '30'], correct_index: 1 }, // [cite: 261, 322]
  { number: 4, question: 'The Loan Estimate must be delivered within:', options: ['2 business days', '3 business days', '5 business days', '7 business days'], correct_index: 1 }, // [cite: 263, 322]
  { number: 5, question: 'APR represents:', options: ['Note rate only', 'Cost of credit expressed as a yearly rate', 'Escrow balance', 'Property taxes'], correct_index: 1 }, // [cite: 265, 322]
  { number: 6, question: 'Redlining refers to:', options: ['Charging higher points', 'Refusing loans based on neighborhood demographics', 'Increasing APR', 'Charging appraisal fees'], correct_index: 1 }, // [cite: 267, 322]
  { number: 7, question: 'Annual continuing education for MLOs requires:', options: ['6 hours', '7 hours', '8 hours', '12 hours'], correct_index: 2 }, // [cite: 269, 322]
  { number: 8, question: 'An MLO must obtain a unique identifier through:', options: ['HUD', 'CFPB', 'NMLS', 'OCC'], correct_index: 2 }, // [cite: 270, 322]
  { number: 9, question: 'Occupancy fraud occurs when:', options: ['Taxes unpaid', 'Borrower misrepresents primary residence intent', 'Escrow shortage', 'ARM reset'], correct_index: 1 }, // [cite: 271, 322]
  { number: 10, question: 'Fraud involving altered income documentation is:', options: ['Appraisal fraud', 'Income fraud', 'Occupancy fraud', 'Equity stripping'], correct_index: 1 }, // [cite: 273, 322]
  { number: 11, question: 'Which is a red flag for fraud?', options: ['Clear documentation', 'Evasive borrower answers', 'Stable income', 'Consistent file'], correct_index: 1 }, // [cite: 274, 322]
  { number: 12, question: 'Ethical conduct requires placing:', options: ['Employer profit first', 'Borrower’s best interest first', 'Sales quota first', 'Volume goals first'], correct_index: 1 }, // [cite: 276, 322]
  { number: 13, question: 'Which CE category must include fraud prevention?', options: ['Federal law', 'Ethics', 'Non-traditional', 'Elective'], correct_index: 1 }, // [cite: 278, 322]
  { number: 14, question: 'Negative amortization results in:', options: ['Faster loan payoff', 'Reduced loan balance', 'Increasing loan balance', 'Fixed principal payments'], correct_index: 2 }, // [cite: 279, 322]
  { number: 15, question: 'Payment shock most commonly occurs when:', options: ['Escrow decreases', 'Interest-only period ends', 'Loan balance decreases', 'Rate remains fixed'], correct_index: 1 }, // [cite: 281, 322]
  { number: 16, question: 'Interest-only loans primarily delay:', options: ['Escrow', 'Principal repayment', 'Insurance', 'Closing'], correct_index: 1 }, // [cite: 283, 322]
  { number: 17, question: 'Risk layering increases:', options: ['Loan simplicity', 'Default probability', 'Compliance ease', 'Equity growth'], correct_index: 1 }, // [cite: 284, 322]
  { number: 18, question: 'An ARM rate is based on:', options: ['Fixed rate only', 'Index plus margin', 'Credit score', 'Escrow'], correct_index: 1 }, // [cite: 285, 322]
  { number: 19, question: 'Refinancing dependence risk increases when:', options: ['Rates fall', 'Property appreciates', 'Credit tightens', 'Income rises'], correct_index: 2 }, // [cite: 287, 322]
  { number: 20, question: 'Consumer protection in non-traditional lending focuses on:', options: ['Yield maximization', 'Suitability and disclosure', 'Removing ATR', 'Lower fees'], correct_index: 1 }, // [cite: 288, 322]
  { number: 21, question: 'Which type of mortgage is most predictable?', options: ['Payment option ARM', 'Interest-only', 'Fully amortizing fixed', 'Negative amortization'], correct_index: 2 }, // [cite: 290, 322]
  { number: 22, question: 'Equity erosion risk is highest in:', options: ['Fixed-rate mortgages', 'Fully amortizing loans', 'Negative amortization loans', 'FHA loans'], correct_index: 2 }, // [cite: 292, 322]
  { number: 23, question: 'Borrower suitability assessment requires:', options: ['Maximizing loan size', 'Evaluating long-term affordability', 'Ignoring reserves', 'Avoiding ATR'], correct_index: 1 }, // [cite: 294, 322]
  { number: 24, question: 'Payment shock is best described as:', options: ['Gradual increase', 'Sudden significant payment increase', 'Escrow decrease', 'Fixed payment'], correct_index: 1 }, // [cite: 295, 322]
  { number: 25, question: 'Negative amortization is most commonly associated with:', options: ['Fully amortizing loans', 'Payment option ARMs', '15-year fixed loans', 'FHA loans'], correct_index: 1 }, // [cite: 297, 322]
  { number: 26, question: 'Risk of equity erosion increases when:', options: ['Balance shrinks', 'Balance grows', 'Rate fixed', 'Escrow stable'], correct_index: 1 }, // [cite: 299, 322]
  { number: 27, question: 'A Mortgage Loan Originator is an individual who:', options: ['only underwrites loans', 'only processes closing documents', 'takes an application or offers/negotiates terms', 'only orders appraisals'], correct_index: 2 }, // [cite: 301, 322]
  { number: 28, question: 'The “Loan Manufacturing Initiator” role primarily focuses on:', options: ['setting interest rates', 'verifying borrower info and document collection', 'approving credit decisions', 'issuing Closing Disclosures'], correct_index: 1 }, // [cite: 304, 322]
  { number: 29, question: 'The MLO’s role as a “Consumer Advisor & Advocate” is best described as:', options: ['encouraging highest loan amounts', 'assessing borrower needs through profiling and guidance', 'avoiding product comparisons', 'limiting disclosures'], correct_index: 1 }, // [cite: 307, 322]
  { number: 30, question: 'The New Jersey Residential Mortgage Lending Act is administered by the:', options: ['CFPB', 'New Jersey Department of Banking and Insurance', 'HUD', 'FDIC'], correct_index: 1 }, // [cite: 311, 322]
  { number: 31, question: 'Under New Jersey law, mortgage licenses are issued through:', options: ['CFPB', 'NJ Department of Banking and Insurance', 'HUD', 'Federal Reserve'], correct_index: 1 }, // [cite: 313, 322]
  { number: 32, question: 'Under New Jersey law, operating without a license may result in:', options: ['Warning letter only', 'Administrative penalties', 'Escrow waiver', 'Rate reduction'], correct_index: 1 }, // [cite: 315, 322]
  { number: 33, question: 'Administrative enforcement may include:', options: ['Cease-and-desist orders', 'Escrow review', 'Rate reductions', 'Credit reporting'], correct_index: 0 }, // [cite: 317, 322]
  { number: 34, question: 'New Jersey enforcement authority comes from:', options: ['CFPB', 'NJ Department of Banking and Insurance', 'HUD', 'FDIC'], correct_index: 1 }, // [cite: 318, 322]
  { number: 35, question: 'The New Jersey Commissioner may issue:', options: ['Stock penalties', 'Cease-and-desist orders', 'Escrow waivers', 'Appraisal exemptions'], correct_index: 1 } // [cite: 320, 322]
];

// ── Course Data ───────────────────────────────────────────────────────
const courseData = {
  title:          '12-HOUR NJ SAFE COMPREHENSIVE: ANNUAL MLO FUNDAMENTALS',
  nmls_course_id: 'CE-NJ-SAFE-12HR',
  type:           'CE',
  credit_hours:   12,
  description:    'Comprehensive 12-hour SAFE Act continuing education course covering Federal Mortgage-Related Laws, Ethical Guidelines, Non-Traditional Lending, Mortgage Origination, and New Jersey State Law & Regulations.',
  price:          149.00,
  states_approved: ['NJ'],
  has_textbook:    false,
  textbook_price:  0,
  is_active:       true,
  pdf_url:         NJ_TEXTBOOK_PDF,

  modules: [
    {
      order: 1,
      title: 'Federal Mortgage-Related Laws',
      credit_hours: 3,
      pdf_url: NJ_TEXTBOOK_PDF,
      show_pdf_before_quiz: false,
      sections: ['TILA Overview', 'ECOA and Fair Housing', 'RESPA and Settlement Costs', 'HMDA Reporting Requirements'],
      quiz: [
        { number: 1, question: 'What is the primary purpose of TILA?', options: ['Promote fair lending', 'Ensure credit for all', 'Standardized disclosures of credit costs', 'Restrict interest rates'], correct_index: 2 }, // [cite: 5, 31]
        { number: 2, question: 'Which act prohibits housing discrimination?', options: ['ECOA', 'Fair Housing Act', 'RESPA', 'HMDA'], correct_index: 1 }, // [cite: 10, 31]
        { number: 3, question: 'Which requires disclosure of settlement costs and prohibits kickbacks?', options: ['TILA', 'ECOA', 'RESPA', 'SAFE Act'], correct_index: 2 }, // [cite: 15, 31]
        { number: 4, question: 'What does ECOA prohibit?', options: ['Creditworthiness checks', 'Discrimination based on race/sex/status', 'No Loan Estimate', 'High rates'], correct_index: 1 }, // [cite: 20, 31]
        { number: 5, question: 'Which act requires reporting data to identify discriminatory practices?', options: ['SAFE Act', 'HMDA', 'FHA', 'TILA'], correct_index: 1 } // [cite: 25, 31]
      ]
    },
    {
      order: 2,
      title: 'Ethical Guidelines for Mortgage Loan Originators',
      credit_hours: 2,
      pdf_url: NJ_TEXTBOOK_PDF,
      show_pdf_before_quiz: false,
      sections: ['MLO Responsibilities', 'Compensation Prohibition', 'Conflicts of Interest', 'Fraud Prevention'],
      quiz: [
        { number: 1, question: 'What is the primary responsibility of an MLO?', options: ['Close quickly', 'Ensure compliance', 'Lowest rate', 'Max commission'], correct_index: 1 }, // [cite: 34, 60]
        { number: 2, question: 'Dodd-Frank prohibits compensation based on:', options: ['Interest rates', 'Dual compensation', 'Riskier loans', 'All of the above'], correct_index: 3 }, // [cite: 39, 60]
        { number: 3, question: 'Duty when facing conflicts of interest?', options: ['Avoid all business', 'Disclose clearly/promptly', 'Ignore minor conflicts', 'Rely on employer'], correct_index: 1 }, // [cite: 44, 60]
        { number: 4, question: 'Common form of fraud MLOs must prevent?', options: ['Inaccurate income reporting', 'Refusal to sign LE', 'Failure to provide CD', 'Closing discounts'], correct_index: 0 }, // [cite: 49, 60]
        { number: 5, question: 'Potential consequence of ethical violation?', options: ['Market share increase', 'Civil penalties/suspension', 'Higher commissions', 'No consequences'], correct_index: 1 } // [cite: 54, 60]
      ]
    },
    {
      order: 3,
      title: 'Non-Traditional Mortgage Lending',
      credit_hours: 2,
      pdf_url: NJ_TEXTBOOK_PDF,
      show_pdf_before_quiz: false,
      sections: ['Non-Traditional Products', 'Interest-Only Risks', 'Qualification Documentation'],
      quiz: [
        { number: 1, question: 'Which is a non-traditional product?', options: ['Fixed-rate', 'Interest-only', 'Fully amortizing ARM', 'Conventional'], correct_index: 1 }, // [cite: 63, 89]
        { number: 2, question: 'Primary risk of interest-only mortgages?', options: ['Fixed payments', 'Payment shock after IO period', 'Upfront fees', 'No rate changes'], correct_index: 1 }, // [cite: 68, 89]
        { number: 3, question: 'Qualification typically uses:', options: ['Strict W-2', 'Bank statements/Alternative docs', 'Credit score only', 'No docs'], correct_index: 1 }, // [cite: 73, 89]
        { number: 4, question: 'SAFE Act requires for non-traditional lending:', options: ['700 credit score', 'Enhanced licensing/training', 'Higher commissions', 'No extra requirements'], correct_index: 1 }, // [cite: 78, 89]
        { number: 5, question: 'Significant consumer risk?', options: ['Predictable payments', 'Lack of transparency', 'Long-term savings', 'Immediate repayment'], correct_index: 1 } // [cite: 83, 89]
      ]
    },
    {
      order: 4,
      title: 'Mortgage Origination',
      credit_hours: 2,
      pdf_url: NJ_TEXTBOOK_PDF,
      show_pdf_before_quiz: false,
      sections: ['Disclosure Timelines', 'Loan Estimate Contents', 'AUS Functions'],
      quiz: [
        { number: 1, question: 'Document provided within 3 business days of application?', options: ['Closing Disclosure', 'Loan Estimate', 'Credit Report', 'Mortgage Deed'], correct_index: 1 }, // [cite: 92, 118]
        { number: 2, question: 'What does the Loan Estimate include?', options: ['Rate only', 'Terms, payments, and closing costs', 'Credit score', 'Property details'], correct_index: 1 }, // [cite: 97, 118]
        { number: 3, question: 'MLO role in underwriting?', options: ['Approve loans', 'Assess risk only', 'Submit apps and address conditions', 'Final closings'], correct_index: 2 }, // [cite: 102, 118]
        { number: 4, question: 'Primary function of AUS?', options: ['Final approval', 'Assess risk/recommendations', 'Evaluate property', 'Set rates'], correct_index: 1 }, // [cite: 107, 118]
        { number: 5, question: 'Document provided 3 business days before closing?', options: ['Loan Estimate', 'Closing Disclosure', 'Pre-approval', 'Credit report'], correct_index: 1 } // [cite: 112, 118]
      ]
    },
    {
      order: 5,
      title: 'New Jersey State Law and Regulations',
      credit_hours: 3,
      pdf_url: NJ_FINAL_PDF,
      show_pdf_before_quiz: true,
      sections: ['Regulatory Purpose', 'Prohibited Acts', 'Employer Liability', 'Continuing Education'],
      quiz: FUNDAMENTALS_70
    }
  ],

  final_exam: {
    title:              '12-HOUR NJ SAFE COMPREHENSIVE — Final Exam',
    passing_score:      75,
    time_limit_minutes: 120,
    questions:          FINAL_EXAM_35
  }
};

// ── Seed Script Logic ─────────────────────────────────────────────────
const seed = async () => {
  try {
    await mongoose.connect(process.env.MONGO_URI);
    console.log('✅ MongoDB connected');

    await Course.deleteOne({ nmls_course_id: 'CE-NJ-SAFE-12HR' });
    console.log('🗑️ Removed existing NJ SAFE course');

    const course = await Course.create(courseData);
    console.log(`\n✅ Course inserted: ${course.title}`);
    console.log(`\n🎯 Test at: /courses/CE-NJ-SAFE-12HR/learn`);

    await mongoose.disconnect();
    process.exit(0);
  } catch (err) {
    console.error('❌ Seed failed:', err.message);
    process.exit(1);
  }
};

seed();