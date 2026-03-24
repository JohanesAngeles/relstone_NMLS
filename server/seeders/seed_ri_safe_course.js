/**
 * seed_ri_safe_course.js
 * Drop this in: relstone_NMLS/server/
 * Run with:    node seed_ri_safe_course.js
 *
 * COURSE STRUCTURE (Rhode Island 8-Hour):
 * Step 1  📄 Lesson     — Module 1: Federal Mortgage-Related Laws
 * Step 2  📋 Checkpoint — Module 1 Quiz (5 questions)
 * Step 3  📄 Lesson     — Module 2: Ethical Guidelines for MLOs
 * Step 4  📋 Checkpoint — Module 2 Quiz (5 questions)
 * Step 5  📄 Lesson     — Module 3: Non-Traditional Mortgage Lending
 * Step 6  📋 Checkpoint — Module 3 Quiz (5 questions)
 * Step 7  📄 Lesson     — Module 4: Rhode Island State Law and Regulations
 * Step 8  📋 Checkpoint — Module 4 Quiz (5 questions)
 * Step 9  📄 Lesson     — FINAL - RHODE ISLAND (PDF review)
 * Step 10 🏆 Final Exam — Attempt 1: official 35 Qs | Retry: random 35 from 70-Q bank
 */

const mongoose = require('mongoose');
const dotenv   = require('dotenv');
dotenv.config();

const Course = require('../models/Course');

// ── PDF URLs ──────────────────────────────────────────────────────────
const RI_TEXTBOOK_PDF = 'https://www.dropbox.com/scl/fi/xucqzwcxqmyf3j0cuo7an/8-Hour-RI-SAFE-Comprehensive-Annual-MLO-Fundamentals.pdf?rlkey=ap35y87grw6g6rzy537y8mc92&st=jrqj1jvm&raw=1';
const RI_FINAL_PDF    = 'https://www.dropbox.com/scl/fi/90060bf8jcexj5n2q08xf/Final-Rhode-Island-NMLS-CE.pdf?rlkey=6tubuuu0uc6ol5irysad83kxj&st=vh8rmqvb&raw=1';

// ── 70-Question Retry Bank ────────────────────────────────────────────
const QUESTION_BANK_70 = [
  { number: 1,  question: 'Under the Ability-to-Repay rule, creditors must make a:', options: ['Profit-based determination', 'Reasonable, good-faith determination', 'Collateral-only determination', 'Credit-score-only determination'], correct_index: 1 },
  { number: 2,  question: 'The Truth in Lending Act (TILA) is primarily designed to:', options: ['Increase lender revenue', 'Promote informed consumer credit decisions', 'Standardize underwriting models', 'Eliminate adjustable rates'], correct_index: 1 },
  { number: 3,  question: 'RESPA Section 8 prohibits:', options: ['Adjustable-rate loans', 'Escrow accounts', 'Kickbacks and unearned fees', 'Loan Estimates'], correct_index: 2 },
  { number: 4,  question: 'The Loan Estimate must be delivered within:', options: ['2 business days', '3 business days', '5 business days', '7 business days'], correct_index: 1 },
  { number: 5,  question: 'The Closing Disclosure must be delivered at least:', options: ['1 day before closing', '2 business days before consummation', '3 business days before consummation', 'After closing'], correct_index: 2 },
  { number: 6,  question: 'APR represents:', options: ['Note rate only', 'Escrow total', 'Cost of credit expressed as a yearly rate', 'Index rate'], correct_index: 2 },
  { number: 7,  question: 'HOEPA applies to:', options: ['All FHA loans', 'High-cost mortgages', 'Reverse mortgages only', 'USDA loans only'], correct_index: 1 },
  { number: 8,  question: 'ECOA prohibits discrimination based on:', options: ['Loan amount', 'Credit score', 'Marital status', 'Property value'], correct_index: 2 },
  { number: 9,  question: 'HMDA requires reporting of:', options: ['Commission splits', 'Mortgage application data', 'Marketing expenses', 'Escrow balances'], correct_index: 1 },
  { number: 10, question: 'A Qualified Mortgage generally prohibits:', options: ['Fixed interest rates', 'Escrow accounts', 'Negative amortization', '15-year terms'], correct_index: 2 },
  { number: 11, question: 'Redlining refers to:', options: ['Charging higher APR', 'Refusing loans based on neighborhood demographics', 'Increasing underwriting overlays', 'Denying high-DTI loans'], correct_index: 1 },
  { number: 12, question: 'Disparate impact refers to:', options: ['Intentional discrimination', 'Neutral policy causing discriminatory effect', 'ARM adjustments', 'Credit-tier pricing'], correct_index: 1 },
  { number: 13, question: 'TRID integrated disclosures under:', options: ['ECOA and HMDA', 'TILA and RESPA', 'SAFE and HOEPA', 'FHA and VA'], correct_index: 1 },
  { number: 14, question: 'Under ECOA, application records must generally be retained for:', options: ['12 months', '18 months', '24 months', '36 months'], correct_index: 3 },
  { number: 15, question: 'The SAFE Act requires minimum pre-licensing education of:', options: ['15 hours', '20 hours', '25 hours', '30 hours'], correct_index: 1 },
  { number: 16, question: 'Ethical integrity requires:', options: ['Maximizing commission', 'Honest representation of loan terms', 'Steering borrowers', 'Withholding material information'], correct_index: 1 },
  { number: 17, question: 'Reverse redlining involves:', options: ['Avoiding urban lending', 'Targeting protected classes for high-cost loans', 'Equal pricing', 'FHA underwriting'], correct_index: 1 },
  { number: 18, question: 'A straw buyer typically:', options: ['Occupies the property', 'Purchases on behalf of another person', 'Uses FHA insurance', 'Pays extra principal'], correct_index: 1 },
  { number: 19, question: 'Income fraud involves:', options: ['Inflated appraisal', 'Altered income documentation', 'Escrow shortage', 'ARM miscalculation'], correct_index: 1 },
  { number: 20, question: 'Risk layering increases:', options: ['Equity growth', 'Default probability', 'Compliance ease', 'Loan stability'], correct_index: 1 },
  { number: 21, question: 'Payment shock most commonly occurs when:', options: ['Taxes decrease', 'Interest-only period ends', 'DTI improves', 'Escrow decreases'], correct_index: 1 },
  { number: 22, question: 'Suitability assessment focuses on:', options: ['Maximum loan amount', 'Long-term affordability', 'Commission potential', 'Closing speed'], correct_index: 1 },
  { number: 23, question: 'A red flag for fraud includes:', options: ['Stable employment', 'Clear documentation', 'Evasive borrower answers', 'Verified income'], correct_index: 2 },
  { number: 24, question: 'Ethical conduct requires placing:', options: ['Employer profit first', "Borrower's best interest first", 'Volume first', 'Commission first'], correct_index: 1 },
  { number: 25, question: 'Documentation standards are important to:', options: ['Increase sales', 'Demonstrate compliance', 'Avoid disclosures', 'Eliminate ATR'], correct_index: 1 },
  { number: 26, question: 'Negative amortization results in:', options: ['Faster equity growth', 'Reduced loan balance', 'Increasing loan balance', 'Fixed payments'], correct_index: 2 },
  { number: 27, question: 'Interest-only loans delay repayment of:', options: ['Taxes', 'Escrow', 'Principal', 'Insurance'], correct_index: 2 },
  { number: 28, question: 'An ARM rate is based on:', options: ['Note rate only', 'Index plus margin', 'Credit score', 'Escrow change'], correct_index: 1 },
  { number: 29, question: 'Balloon payments are generally prohibited in:', options: ['FHA loans', 'Qualified Mortgages', 'Conventional loans', 'VA loans'], correct_index: 1 },
  { number: 30, question: 'The most predictable mortgage product is:', options: ['Payment-option ARM', 'Interest-only', 'Fully amortizing fixed-rate', 'Negative amortization'], correct_index: 2 },
  { number: 31, question: 'High-cost mortgage status may be triggered when APR exceeds APOR by:', options: ['3%', '4%', '6.5% (first lien)', '10%'], correct_index: 2 },
  { number: 32, question: 'Equity erosion risk increases when the loan balance:', options: ['Decreases', 'Remains fixed', 'Increases', 'Is refinanced'], correct_index: 2 },
  { number: 33, question: 'Refinancing dependence creates risk when:', options: ['Rates decline', 'Property appreciates', 'Credit conditions tighten', 'Income rises'], correct_index: 2 },
  { number: 34, question: 'Consumer protection in non-traditional lending emphasizes:', options: ['Yield spread', 'Suitability and disclosure', 'Removing ATR', 'Lower DTI only'], correct_index: 1 },
  { number: 35, question: 'Bank statement loans are typically used by:', options: ['W-2 employees', 'Self-employed borrowers', 'FHA borrowers only', 'Retirees only'], correct_index: 1 },
  { number: 36, question: 'Rhode Island mortgage licensing is regulated by the:', options: ['HUD', 'CFPB', 'Rhode Island Department of Business Regulation', 'Federal Reserve'], correct_index: 2 },
  { number: 37, question: 'MLOs must obtain a unique identifier through:', options: ['HUD', 'CFPB', 'NMLS', 'FDIC'], correct_index: 2 },
  { number: 38, question: 'Minimum annual CE required under SAFE Act is:', options: ['6 hours', '7 hours', '8 hours', '10 hours'], correct_index: 2 },
  { number: 39, question: 'Operating without a mortgage license in Rhode Island may result in:', options: ['Increased commission', 'Administrative penalties', 'Lower APR', 'Loan approval'], correct_index: 1 },
  { number: 40, question: 'Administrative enforcement may include:', options: ['Credit score reduction', 'Cease-and-desist orders', 'Escrow suspension', 'Rate increases'], correct_index: 1 },
  { number: 41, question: 'Rhode Island regulators may conduct:', options: ['Credit scoring', 'Compliance examinations', 'Appraisal adjustments', 'Marketing audits only'], correct_index: 1 },
  { number: 42, question: 'Failure to comply with state disclosure requirements may result in:', options: ['Faster closing', 'Regulatory penalties', 'Higher APR', 'Reduced documentation'], correct_index: 1 },
  { number: 43, question: 'License renewal requires completion of:', options: ['Federal exam', 'Continuing education', 'Pre-licensing hours', 'Appraisal course'], correct_index: 1 },
  { number: 44, question: 'The SAFE Act was enacted in:', options: ['2005', '2007', '2008', '2010'], correct_index: 2 },
  { number: 45, question: 'Rhode Island mortgage brokers must maintain records to:', options: ['Increase sales', 'Demonstrate compliance', 'Avoid disclosures', 'Eliminate ATR'], correct_index: 1 },
  { number: 46, question: 'A Qualified Mortgage generally limits points and fees to:', options: ['2%', '3%', '4%', '5%'], correct_index: 1 },
  { number: 47, question: 'Zero-tolerance fees include:', options: ['Prepaid interest', 'Lender origination charges', 'Escrow deposits', 'Property taxes'], correct_index: 1 },
  { number: 48, question: 'Section 9 of RESPA prohibits sellers from requiring:', options: ['Specific lender', 'Specific title insurer', 'FHA loan', 'Escrow account'], correct_index: 1 },
  { number: 49, question: 'An adverse action notice must generally be provided within:', options: ['15 days', '20 days', '30 days', '45 days'], correct_index: 2 },
  { number: 50, question: 'Refusing to make loans based on race violates:', options: ['SAFE Act', 'RESPA', 'Fair Housing Act', 'HMDA'], correct_index: 2 },
  { number: 51, question: 'The Fair Housing Act is primarily enforced by:', options: ['CFPB', 'HUD', 'FDIC', 'OCC'], correct_index: 1 },
  { number: 52, question: 'APR tolerance for regular transactions is generally:', options: ['0.50%', '0.25%', '0.125%', '1%'], correct_index: 2 },
  { number: 53, question: 'CE must include which required category?', options: ['Advertising', 'Fraud prevention', 'Appraisal standards', 'Marketing'], correct_index: 1 },
  { number: 54, question: 'Under ATR, creditors must consider how many underwriting factors?', options: ['6', '7', '8', '9'], correct_index: 2 },
  { number: 55, question: 'The Closing Disclosure replaced the:', options: ['GFE and HUD-1', 'Note', 'Deed', 'Appraisal'], correct_index: 0 },
  { number: 56, question: 'Reverse mortgages are generally available to borrowers age:', options: ['55+', '60+', '62+', '65+'], correct_index: 2 },
  { number: 57, question: 'HMDA data helps regulators:', options: ['Set interest rates', 'Identify discriminatory lending patterns', 'Increase commissions', 'Determine DTI'], correct_index: 1 },
  { number: 58, question: 'Disparate treatment involves:', options: ['Neutral policy', 'Intentional discrimination', 'ARM adjustments', 'Credit tiers'], correct_index: 1 },
  { number: 59, question: 'Equity stripping often involves:', options: ['Low fees', 'Excessive fees', 'Fixed rates', 'Low DTI'], correct_index: 1 },
  { number: 60, question: 'A compliance management system helps institutions:', options: ['Avoid regulation', 'Demonstrate regulatory oversight', 'Increase commissions', 'Reduce documentation'], correct_index: 1 },
  { number: 61, question: 'APR includes:', options: ['Property taxes', 'HOA dues', 'Interest and certain finance charges', 'Escrow deposits'], correct_index: 2 },
  { number: 62, question: 'A high-cost mortgage under HOEPA may trigger at:', options: ['3% above APOR', '4% above APOR', '6.5% above APOR (first lien)', '10% above APOR'], correct_index: 2 },
  { number: 63, question: 'Operating without NMLS registration violates:', options: ['TILA', 'HMDA', 'SAFE Act', 'FHA'], correct_index: 2 },
  { number: 64, question: 'Documentation accuracy helps prevent:', options: ['Equity growth', 'Fraud', 'Fixed rates', 'Escrow accounts'], correct_index: 1 },
  { number: 65, question: 'Interest-only loans increase risk of:', options: ['Immediate equity', 'Equity erosion', 'Lower DTI', 'Faster amortization'], correct_index: 1 },
  { number: 66, question: 'Which is a protected class under FHA?', options: ['Credit score', 'Disability', 'Loan amount', 'Property value'], correct_index: 1 },
  { number: 67, question: 'A cease-and-desist order is an example of:', options: ['Marketing policy', 'Administrative enforcement', 'Escrow adjustment', 'Commission policy'], correct_index: 1 },
  { number: 68, question: 'Failure to comply with federal mortgage law may result in:', options: ['Higher commission', 'Regulatory penalties', 'Lower APR', 'Loan acceleration'], correct_index: 1 },
  { number: 69, question: 'Bank statement loans require careful review of:', options: ['Escrow deposits', 'Consistent income patterns', 'Property taxes', 'HOA fees'], correct_index: 1 },
  { number: 70, question: 'Ethical transparency requires:', options: ['Using industry jargon', 'Clear explanation of loan terms', 'Avoiding borrower questions', 'Hiding APR details'], correct_index: 1 },
];

// ── Official Final Exam: 35 Questions (Attempt 1) ─────────────────────
// Answer key: 1B 2C 3B 4C 5C 6C 7B 8B 9C 10B
//             11B 12B 13B 14B 15B 16B 17C 18B 19C 20B
//             21B 22C 23C 24C 25B 26C 27C 28C 29B 30B
//             31B 32B 33C 34B 35B
const FINAL_EXAM_35 = [
  { number: 1,  question: 'Under the Ability-to-Repay rule, creditors must make a:', options: ['Profit-based determination', 'Reasonable, good-faith determination', 'Collateral-only determination', 'Credit-score-only determination'], correct_index: 1 },
  { number: 2,  question: 'RESPA Section 8 prohibits:', options: ['Escrow accounts', 'Adjustable-rate loans', 'Kickbacks and unearned fees', 'Loan Estimates'], correct_index: 2 },
  { number: 3,  question: 'The Loan Estimate must be delivered within:', options: ['2 business days', '3 business days', '5 business days', '7 business days'], correct_index: 1 },
  { number: 4,  question: 'The Closing Disclosure must be provided at least:', options: ['1 business day before closing', '2 business days before consummation', '3 business days before consummation', 'After closing'], correct_index: 2 },
  { number: 5,  question: 'A Qualified Mortgage generally prohibits:', options: ['Escrow accounts', 'Fixed interest rates', 'Negative amortization', '15-year terms'], correct_index: 2 },
  { number: 6,  question: 'ECOA prohibits discrimination based on:', options: ['Loan amount', 'Credit score', 'Marital status', 'Property value'], correct_index: 2 },
  { number: 7,  question: 'TRID integrated disclosures under:', options: ['ECOA and HMDA', 'TILA and RESPA', 'SAFE and HOEPA', 'FHA and VA'], correct_index: 1 },
  { number: 8,  question: 'HMDA requires reporting of:', options: ['Commission schedules', 'Mortgage application data', 'Marketing expenses', 'Escrow balances'], correct_index: 1 },
  { number: 9,  question: 'HOEPA applies to:', options: ['FHA loans only', 'Reverse mortgages only', 'High-cost mortgages', 'USDA loans only'], correct_index: 2 },
  { number: 10, question: 'Redlining refers to:', options: ['Charging higher APR', 'Refusing loans based on neighborhood demographics', 'Credit-tier pricing', 'Adjustable rate increases'], correct_index: 1 },
  { number: 11, question: 'Ethical integrity requires:', options: ['Maximizing commission', 'Honest representation of loan terms', 'Steering borrowers', 'Withholding material information'], correct_index: 1 },
  { number: 12, question: 'Reverse redlining involves:', options: ['Equal pricing', 'Targeting protected classes for high-cost loans', 'Avoiding rural lending', 'FHA underwriting'], correct_index: 1 },
  { number: 13, question: 'A straw buyer typically:', options: ['Occupies the property', 'Purchases on behalf of another person', 'Uses FHA insurance', 'Pays extra principal'], correct_index: 1 },
  { number: 14, question: 'Risk layering increases:', options: ['Loan stability', 'Default probability', 'Compliance ease', 'Equity growth'], correct_index: 1 },
  { number: 15, question: 'Payment shock most commonly occurs when:', options: ['Taxes decrease', 'Interest-only period ends', 'Escrow decreases', 'DTI improves'], correct_index: 1 },
  { number: 16, question: 'Suitability assessment focuses on:', options: ['Maximum loan size', 'Long-term affordability', 'Commission potential', 'Closing speed'], correct_index: 1 },
  { number: 17, question: 'A red flag for fraud includes:', options: ['Stable employment', 'Clear documentation', 'Evasive borrower answers', 'Verified income'], correct_index: 2 },
  { number: 18, question: 'Ethical conduct requires placing:', options: ['Employer profit first', "Borrower's best interest first", 'Volume first', 'Commission first'], correct_index: 1 },
  { number: 19, question: 'Negative amortization results in:', options: ['Faster equity growth', 'Reduced loan balance', 'Increasing loan balance', 'Fixed payments'], correct_index: 2 },
  { number: 20, question: 'An ARM rate is based on:', options: ['Note rate only', 'Index plus margin', 'Credit score', 'Escrow change'], correct_index: 1 },
  { number: 21, question: 'Balloon payments are generally prohibited in:', options: ['FHA loans', 'Qualified Mortgages', 'Conventional loans', 'VA loans'], correct_index: 1 },
  { number: 22, question: 'The most predictable mortgage product is:', options: ['Payment-option ARM', 'Interest-only loan', 'Fully amortizing fixed-rate', 'Negative amortization loan'], correct_index: 2 },
  { number: 23, question: 'High-cost mortgage status may be triggered when APR exceeds APOR by:', options: ['3%', '4%', '6.5% (first lien)', '10%'], correct_index: 2 },
  { number: 24, question: 'Refinancing dependence creates risk when:', options: ['Rates decline', 'Property appreciates', 'Credit conditions tighten', 'Income rises'], correct_index: 2 },
  { number: 25, question: 'Consumer protection in non-traditional lending emphasizes:', options: ['Yield spread', 'Suitability and disclosure', 'Removing ATR', 'Lower DTI only'], correct_index: 1 },
  { number: 26, question: 'Rhode Island mortgage licensing is regulated by the:', options: ['HUD', 'CFPB', 'Rhode Island Department of Business Regulation', 'Federal Reserve'], correct_index: 2 },
  { number: 27, question: 'MLOs must obtain a unique identifier through:', options: ['HUD', 'CFPB', 'NMLS', 'FDIC'], correct_index: 2 },
  { number: 28, question: 'Minimum annual continuing education required under SAFE Act is:', options: ['6 hours', '7 hours', '8 hours', '10 hours'], correct_index: 2 },
  { number: 29, question: 'Operating without a mortgage license in Rhode Island may result in:', options: ['Increased commission', 'Administrative penalties', 'Lower APR', 'Loan approval'], correct_index: 1 },
  { number: 30, question: 'Administrative enforcement may include:', options: ['Credit score reduction', 'Cease-and-desist orders', 'Escrow suspension', 'Rate increases'], correct_index: 1 },
  { number: 31, question: 'License renewal requires completion of:', options: ['Federal exam', 'Continuing education', 'Pre-licensing hours', 'Appraisal course'], correct_index: 1 },
  { number: 32, question: 'Failure to comply with state disclosure requirements may result in:', options: ['Faster closing', 'Regulatory penalties', 'Higher APR', 'Reduced documentation'], correct_index: 1 },
  { number: 33, question: 'The SAFE Act was enacted in:', options: ['2005', '2007', '2008', '2010'], correct_index: 2 },
  { number: 34, question: 'Rhode Island regulators may conduct:', options: ['Credit scoring', 'Compliance examinations', 'Appraisal adjustments', 'Marketing audits only'], correct_index: 1 },
  { number: 35, question: 'Failure to comply with federal mortgage law may result in:', options: ['Higher commission', 'Regulatory penalties', 'Lower APR', 'Loan acceleration'], correct_index: 1 },
];

// ── Course Data Object ────────────────────────────────────────────────
const courseData = {
  title:           '8-HOUR RI SAFE COMPREHENSIVE: ANNUAL MLO FUNDAMENTALS',
  nmls_course_id:  'CE-RI-SAFE-8HR',
  type:            'CE',
  credit_hours:    8,
  description:     'NMLS-approved 8-hour continuing education course for Rhode Island MLOs covering federal mortgage law, ethics, non-traditional lending, and Rhode Island state law.',
  price:           99.00,
  states_approved: ['RI'],
  has_textbook:    false,
  is_active:       true,
  pdf_url:         RI_TEXTBOOK_PDF,

  modules: [
    // ── Module 1: Federal Mortgage-Related Laws ──────────────────────
    {
      order: 1, title: 'Federal Mortgage-Related Laws', credit_hours: 3,
      pdf_url: RI_TEXTBOOK_PDF,
      quiz: [
        {
          number: 1,
          question: 'What is the primary purpose of the Truth in Lending Act (TILA)?',
          options: ['To promote fair lending practices', 'To ensure lenders offer credit to all consumers', 'To provide clear and standardized disclosures about credit costs', 'To restrict mortgage loan interest rates'],
          correct_index: 2,
        },
        {
          number: 2,
          question: 'Which act prohibits discrimination in housing-related transactions, including mortgage lending?',
          options: ['Equal Credit Opportunity Act (ECOA)', 'Fair Housing Act (FHA)', 'Real Estate Settlement Procedures Act (RESPA)', 'Home Mortgage Disclosure Act (HMDA)'],
          correct_index: 1,
        },
        {
          number: 3,
          question: 'Which of the following requires lenders to disclose settlement costs to consumers and prohibits kickbacks?',
          options: ['Truth in Lending Act (TILA)', 'Equal Credit Opportunity Act (ECOA)', 'Real Estate Settlement Procedures Act (RESPA)', 'The SAFE Act'],
          correct_index: 2,
        },
        {
          number: 4,
          question: 'What does ECOA prohibit in mortgage lending?',
          options: ['Discriminating based on creditworthiness', 'Discriminating based on race, sex, or marital status', 'Failing to issue a Loan Estimate', 'Charging higher interest rates'],
          correct_index: 1,
        },
        {
          number: 5,
          question: 'Which federal act requires the collection and reporting of mortgage lending data to identify discriminatory practices?',
          options: ['The SAFE Act', 'Home Mortgage Disclosure Act (HMDA)', 'Fair Housing Act (FHA)', 'Truth in Lending Act (TILA)'],
          correct_index: 1,
        },
      ],
    },

    // ── Module 2: Ethical Guidelines for MLOs ───────────────────────
    {
      order: 2, title: 'Ethical Guidelines for Mortgage Loan Originators', credit_hours: 2,
      pdf_url: RI_TEXTBOOK_PDF,
      quiz: [
        {
          number: 1,
          question: 'What is the primary responsibility of a Mortgage Loan Originator (MLO)?',
          options: ['To close loans quickly', 'To ensure compliance with all relevant mortgage laws', 'To ensure borrowers get the lowest possible interest rate', 'To make the maximum commission'],
          correct_index: 1,
        },
        {
          number: 2,
          question: 'What does the Dodd-Frank Act prohibit regarding loan originator compensation?',
          options: ['Payment based on loan interest rates', 'Dual compensation from both the borrower and the lender', 'Higher compensation for riskier loans', 'All of the above'],
          correct_index: 3,
        },
        {
          number: 3,
          question: 'What is the duty of a Mortgage Loan Originator (MLO) when facing conflicts of interest?',
          options: ['To avoid all business relationships', 'To disclose any conflict clearly and promptly', "To ignore minor conflicts as they don't affect decisions", "To rely solely on the employer's guidance"],
          correct_index: 1,
        },
        {
          number: 4,
          question: 'Which of the following is a common form of mortgage fraud that MLOs must prevent?',
          options: ['Inaccurate income reporting by borrowers', 'Borrower refusal to sign the Loan Estimate', 'Failure to provide Closing Disclosure', 'Offering discounts on closing costs'],
          correct_index: 0,
        },
        {
          number: 5,
          question: 'What is the potential consequence for a Mortgage Loan Originator if they violate ethical guidelines?',
          options: ['Increased market share', 'Civil penalties and license suspension', 'Higher commissions', 'No consequences'],
          correct_index: 1,
        },
      ],
    },

    // ── Module 3: Non-Traditional Mortgage Lending ───────────────────
    {
      order: 3, title: 'Non-Traditional Mortgage Lending', credit_hours: 2,
      pdf_url: RI_TEXTBOOK_PDF,
      quiz: [
        {
          number: 1,
          question: 'Which of the following is a non-traditional mortgage product?',
          options: ['Fixed-rate mortgage', 'Interest-only mortgage', 'Fully amortizing adjustable-rate mortgage', 'Conventional loan'],
          correct_index: 1,
        },
        {
          number: 2,
          question: 'What is the primary risk associated with interest-only mortgages?',
          options: ['Fixed monthly payments', 'Payment shock after the interest-only period ends', 'High upfront fees', 'No interest rate changes'],
          correct_index: 1,
        },
        {
          number: 3,
          question: 'How do non-traditional mortgage products typically qualify borrowers?',
          options: ['Strictly by W-2 income', 'Using alternative income documentation like bank statements', 'Based solely on credit score', 'With no documentation needed'],
          correct_index: 1,
        },
        {
          number: 4,
          question: 'What does the SAFE Act require for mortgage loan originators involved in non-traditional lending?',
          options: ['A minimum credit score of 700', 'Enhanced licensing and training', 'Higher commissions for riskier loans', 'No additional requirements compared to traditional lending'],
          correct_index: 1,
        },
        {
          number: 5,
          question: 'Which of the following is a significant consumer risk with non-traditional mortgage products?',
          options: ['Predictable payments throughout the loan', 'Lack of transparency in loan terms', 'Long-term cost savings', 'Immediate full repayment of the loan balance'],
          correct_index: 1,
        },
      ],
    },

    // ── Module 4: Rhode Island State Law and Regulations ─────────────
    {
      order: 4, title: 'Rhode Island State Law and Regulations', credit_hours: 1,
      pdf_url: RI_TEXTBOOK_PDF,
      quiz: [
        {
          number: 1,
          question: 'Which agency regulates mortgage professionals in Rhode Island?',
          options: ['Rhode Island Secretary of State', 'Rhode Island Housing', 'Rhode Island Department of Business Regulation through the Division of Banking', 'Nationwide Multistate Licensing System (NMLS)'],
          correct_index: 2,
        },
        {
          number: 2,
          question: 'Why does Rhode Island require state-specific continuing education?',
          options: ['To replace federal CE requirements', 'To increase renewal fees', 'To ensure licensees understand Rhode Island-specific laws and consumer protections', 'To limit competition in the mortgage industry'],
          correct_index: 2,
        },
        {
          number: 3,
          question: 'Which action may result from serious violations of the Rhode Island mortgage law?',
          options: ['Written warning only', 'Temporary marketing restrictions', 'Reduced loan limits', 'License suspension or revocation'],
          correct_index: 3,
        },
        {
          number: 4,
          question: 'How many hours of continuing education must Rhode Island mortgage loan originators complete annually?',
          options: ['4 hours', '6 hours', '8 hours', '12 hours'],
          correct_index: 2,
        },
        {
          number: 5,
          question: 'Under Rhode Island law, which of the following is a prohibited practice for mortgage professionals?',
          options: ['Providing accurate loan term information', 'Steering borrowers into unsuitable loan products', 'Completing required disclosures on time', 'Maintaining proper documentation'],
          correct_index: 1,
        },
      ],
    },

    // ── Module 5: Final PDF Review ───────────────────────────────────
    {
      order: 5, title: 'FINAL - RHODE ISLAND', credit_hours: 0,
      pdf_url: RI_FINAL_PDF, show_pdf_before_quiz: false,
      quiz: [],
    },
  ],

  final_exam: {
    title:              '8-HOUR RI SAFE COMPREHENSIVE — Final Exam',
    passing_score:      75,
    time_limit_minutes: 90,
    questions:          FINAL_EXAM_35,
    question_bank:      QUESTION_BANK_70,
  },
};

// ── Seed Script Logic ─────────────────────────────────────────────────
const seed = async () => {
  try {
    await mongoose.connect(process.env.MONGO_URI);
    console.log('✅ MongoDB connected');

    await Course.deleteOne({ nmls_course_id: 'CE-RI-SAFE-8HR' });
    console.log('🗑️  Removed existing Rhode Island SAFE course (if any)');

    const course = await Course.create(courseData);
    console.log(`\n✅ Course inserted: ${course.title}`);
    console.log(`   ID: ${course._id}`);
    console.log(`\n🎯 Test at: /courses/CE-RI-SAFE-8HR/learn`);

    await mongoose.disconnect();
    process.exit(0);
  } catch (err) {
    console.error('❌ Seed failed:', err.message);
    process.exit(1);
  }
};

seed();