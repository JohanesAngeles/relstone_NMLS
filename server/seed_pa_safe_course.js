/**
 * seed_pa_safe_course.js
 * Drop this in: relstone_NMLS/server/
 * Run with:    node seed_pa_safe_course.js
 *
 * COURSE STRUCTURE (Pennsylvania 8-Hour):
 * Step 1  📄 Lesson     — Module 1: Federal Mortgage-Related Laws
 * Step 2  📋 Checkpoint — Module 1 Quiz (5 questions)
 * Step 3  📄 Lesson     — Module 2: Ethical Guidelines for MLOs
 * Step 4  📋 Checkpoint — Module 2 Quiz (5 questions)
 * Step 5  📄 Lesson     — Module 3: Non-Traditional Mortgage Lending
 * Step 6  📋 Checkpoint — Module 3 Quiz (5 questions)
 * Step 7  📄 Lesson     — Module 4: Pennsylvania Mortgage Licensing Law
 * Step 8  📋 Checkpoint — Module 4 Quiz (5 questions)
 * Step 9  📄 Lesson     — FINAL - PENNSYLVANIA (PDF review)
 * Step 10 🏆 Final Exam — Attempt 1: official 35 Qs | Retry: random 35 from 70-Q bank
 */

const mongoose = require('mongoose');
const dotenv   = require('dotenv');
dotenv.config();

const Course = require('./models/Course');

// ── PDF URLs ──────────────────────────────────────────────────────────
const PA_TEXTBOOK_PDF = 'https://www.dropbox.com/scl/fi/5ef7tnhhurhkfvwwymc6w/8-Hour-PA-SAFE-Comprehensive-Annual-MLO-Fundamentals.pdf?rlkey=5tom6dxbx2mbem9xxl0by1fbl&st=vs127wo2&raw=1';
const PA_FINAL_PDF    = 'https://www.dropbox.com/scl/fi/hfps3lws0tqd5fo3dgdhf/FINAL-PENNSYLVANIA.pdf?rlkey=7wbq3amytaq7ovitrosq73gog&st=jmq9nms4&raw=1';

// ── 70-Question Retry Bank ────────────────────────────────────────────
// Derived from "8-Hour PA SAFE Comprehensive - 70 Question Bank.docx"
const QUESTION_BANK_70 = [
  { number: 1, question: 'Under the Ability-to-Repay rule, a creditor must make a:', options: ['Collateral-based determination', 'Reasonable, good-faith determination', 'Profit-based determination', 'Credit-score-only determination'], correct_index: 1 },
  { number: 2, question: 'The Truth in Lending Act (TILA) primarily promotes:', options: ['Lender profitability', 'Informed consumer credit decisions', 'Faster underwriting', 'Adjustable rate lending'], correct_index: 1 },
  { number: 3, question: 'RESPA Section 8 prohibits:', options: ['Escrow accounts', 'Fee tolerances', 'Kickbacks and unearned fees', 'Adjustable rate loans'], correct_index: 2 },
  { number: 4, question: 'The Loan Estimate must be delivered within:', options: ['2 business days', '3 business days', '5 business days', '7 business days'], correct_index: 1 },
  { number: 5, question: 'The Closing Disclosure must be provided at least:', options: ['1 day before closing', '2 business days before consummation', '3 business days before consummation', 'After closing'], correct_index: 2 },
  { number: 6, question: 'The APR represents:', options: ['The note rate only', 'Total escrow amount', 'Cost of credit expressed as a yearly rate', 'The index rate only'], correct_index: 2 },
  { number: 7, question: 'HOEPA applies to:', options: ['All FHA loans', 'High-cost mortgages', 'Reverse mortgages only', 'USDA loans'], correct_index: 1 },
  { number: 8, question: 'ECOA prohibits discrimination based on:', options: ['Loan amount', 'Credit score', 'Marital status', 'Property type'], correct_index: 2 },
  { number: 9, question: 'Under ECOA, creditors must retain mortgage application records for:', options: ['12 months', '18 months', '24 months', '36 months'], correct_index: 2 },
  { number: 10, question: 'The Dodd-Frank Act strengthened which rule?', options: ['HMDA', 'ATR/QM', 'SAFE Act', 'FHA'], correct_index: 1 },
  { number: 11, question: 'HMDA requires reporting of:', options: ['Advertising budgets', 'Loan application data', 'Commission schedules', 'Credit score models'], correct_index: 1 },
  { number: 12, question: 'Redlining refers to:', options: ['Charging higher interest', 'Refusing loans based on neighborhood demographics', 'Increasing lender fees', 'Adjusting ARM rates'], correct_index: 1 },
  { number: 13, question: 'Disparate impact occurs when:', options: ['Discrimination is intentional', 'A neutral policy has a discriminatory effect', 'Rates are set by credit score', 'Escrow is required'], correct_index: 1 },
  { number: 14, question: 'TILA-RESPA Integrated Disclosures (TRID) combined forms from:', options: ['ECOA and FHA', 'HMDA and SAFE', 'TILA and RESPA', 'HOEPA and ATR'], correct_index: 2 },
  { number: 15, question: 'The Right of Rescission generally applies to:', options: ['Purchase transactions', 'Refinances on primary residences', 'Investment properties', 'Commercial loans'], correct_index: 1 },
  { number: 16, question: 'Occupancy fraud occurs when:', options: ['Property taxes are unpaid', 'Borrower misrepresents primary residence intent', 'Escrow is waived', 'ARM resets'], correct_index: 1 },
  { number: 17, question: 'Income fraud involves:', options: ['Inflated appraisals', 'Straw buyers', 'Altered or falsified income documentation', 'Equity stripping'], correct_index: 2 },
  { number: 18, question: 'A straw buyer typically:', options: ['Occupies the property', 'Uses FHA insurance', 'Purchases on behalf of another person', 'Pays extra principal'], correct_index: 2 },
  { number: 19, question: 'Equity stripping involves:', options: ['Reducing interest rates', 'Lending based on home equity without regard for repayment ability', 'Providing free counseling', 'Lowering loan fees'], correct_index: 1 },
  { number: 20, question: 'Ethical conduct for MLOs includes:', options: ['Prioritizing company profit', 'Steering to higher rates', 'Providing clear and honest disclosures', 'Avoiding borrower questions'], correct_index: 2 },
  { number: 21, question: 'Under the SAFE Act, MLOs must obtain a:', options: ['Stock license', 'Unique identifier through NMLS', 'Property appraisal license', 'Law degree'], correct_index: 1 },
  { number: 22, question: 'Annual CE for MLOs must include how many hours of Ethics?', options: ['1', '2', '3', '4'], correct_index: 1 },
  { number: 23, question: 'A red flag for mortgage fraud includes:', options: ['Clear documentation', 'Consistent employment', 'Evasive or suspicious borrower behavior', 'Verified assets'], correct_index: 2 },
  { number: 24, question: 'Ethical integrity requires placing:', options: ['Commission first', 'Employer volume first', "The borrower's best interest first", 'Market share first'], correct_index: 2 },
  { number: 25, question: 'Reverse redlining targets:', options: ['Wealthy neighborhoods', 'Protected classes for high-cost or predatory loans', 'Rural areas only', 'Commercial investors'], correct_index: 1 },
  { number: 26, question: 'Negative amortization occurs when:', options: ['Loan balance decreases', 'Principal is paid early', 'Interest due exceeds the monthly payment', 'Rate remains fixed'], correct_index: 2 },
  { number: 27, question: 'Payment shock is most common in:', options: ['Fixed-rate loans', 'Fully amortizing ARMs', 'Interest-only or option ARMs when payments reset', '15-year mortgages'], correct_index: 2 },
  { number: 28, question: 'The interest rate on an ARM is typically:', options: ['Fixed forever', 'Set by the MLO', 'Based on an index plus a margin', 'Reduced every year'], correct_index: 2 },
  { number: 29, question: 'Risk layering increases:', options: ['Loan stability', 'The probability of default', 'Compliance ease', 'Equity growth'], correct_index: 1 },
  { number: 30, question: 'Suitability assessment focuses on:', options: ['Maximizing loan amount', 'Borrower’s long-term ability to afford the loan', 'Commission potential', 'Closing speed'], correct_index: 1 },
  { number: 31, question: 'The primary risk of interest-only loans is:', options: ['Lower initial payments', 'Lack of principal reduction leading to payment shock', 'Fixed interest rates', 'Escrow requirement'], correct_index: 1 },
  { number: 32, question: 'Non-traditional mortgage products under SAFE are:', options: ['FHA loans', 'VA loans', 'Anything other than a 30-year fixed-rate mortgage', '15-year fixed'], correct_index: 2 },
  { number: 33, question: 'High-cost mortgage status is triggered by:', options: ['Low credit scores', 'APR or points and fees exceeding specific thresholds', 'Property location', 'Borrower age'], correct_index: 1 },
  { number: 34, question: 'Refinancing dependence occurs when:', options: ['Borrowers pay cash', 'Borrowers rely on constant refinancing to manage debt', 'Rates are fixed', 'LTV is low'], correct_index: 1 },
  { number: 35, question: 'Consumer protection in non-traditional lending emphasizes:', options: ['Yield spread premiums', 'Clear disclosure of risks and suitability', 'Removing ATR rules', 'Higher DTI limits'], correct_index: 1 },
  { number: 36, question: 'Pennsylvania mortgage oversight is administered by:', options: ['HUD', 'CFPB', 'Department of Banking and Securities (DoBS)', 'Pennsylvania Real Estate Commission'], correct_index: 2 },
  { number: 37, question: 'MLOs in Pennsylvania must renew their license:', options: ['Every 2 years', 'Annually', 'Every 5 years', 'Once only'], correct_index: 1 },
  { number: 38, question: 'A Pennsylvania prohibited act includes:', options: ['Providing LE within 3 days', 'Making material misstatements on applications', 'Maintaining records', 'Registering with NMLS'], correct_index: 1 },
  { number: 39, question: 'Unlicensed activity in Pennsylvania may lead to:', options: ['Increased commission', 'Administrative penalties and fines', 'Lower APR', 'Faster closing'], correct_index: 1 },
  { number: 40, question: 'The Pennsylvania "no late CE" policy means:', options: ['CE can be done anytime', 'CE must be completed before the renewal deadline', 'Late fees are never charged', 'Employers do CE for you'], correct_index: 1 },
  { number: 41, question: 'Pennsylvania examiners may review:', options: ['Criminal records only', 'Loan files, advertising, and compliance controls', 'Only borrower credit', 'MLO personal bank accounts'], correct_index: 1 },
  { number: 42, question: 'Administrative enforcement in PA may include:', options: ['Stock penalties', 'Cease-and-desist orders', 'Rate reductions', 'Escrow waivers'], correct_index: 1 },
  { number: 43, question: 'Pennsylvania record-keeping requirements ensure:', options: ['Faster sales', 'Regulatory compliance and accountability', 'Higher interest rates', 'Lower documentation'], correct_index: 1 },
  { number: 44, question: 'The Pennsylvania MLO quasi-fiduciary duty requires:', options: ['Putting self first', 'Good faith and fair dealing', 'Guaranteeing low rates', 'Providing legal advice'], correct_index: 1 },
  { number: 45, question: 'PA continuing education requires how many state-specific hours?', options: ['0', '1', '2', '3'], correct_index: 0 },
  { number: 46, question: 'Which law created the SAFE Act?', options: ['Dodd-Frank', 'HERA', 'RESPA', 'TILA'], correct_index: 1 },
  { number: 47, question: 'Zero-tolerance fees include:', options: ['Prepaid interest', 'Lender origination charges', 'Insurance premiums', 'Escrow deposits'], correct_index: 1 },
  { number: 48, question: 'Qualified Mortgages (QM) generally prohibit:', options: ['30-year terms', 'Escrow accounts', 'Negative amortization', 'Fixed rates'], correct_index: 2 },
  { number: 49, question: 'APR includes which of the following?', options: ['Appraisal fee', 'Title insurance', 'Interest and prepaid finance charges', 'Property taxes'], correct_index: 2 },
  { number: 50, question: 'The Loan Estimate replaced which form?', options: ['GFE and Initial TIL', 'HUD-1', 'Note', 'Deed'], correct_index: 0 },
  { number: 51, question: 'Under RESPA, affiliated business arrangements must be:', options: ['Prohibited', 'Disclosed to the borrower', 'Hidden', 'Mandatory'], correct_index: 1 },
  { number: 52, question: 'Mortgage fraud for profit usually involves:', options: ['Borrowers wanting a home', 'Industry professionals (MLOs, appraisers, etc.)', 'Utility companies', 'State regulators'], correct_index: 1 },
  { number: 53, question: 'Redlining violates which law?', options: ['HMDA', 'Fair Housing Act', 'SAFE Act', 'TILA'], correct_index: 1 },
  { number: 54, question: 'A straw buyer is an example of:', options: ['Good credit', 'Mortgage fraud', 'Legal investment', 'Escrow management'], correct_index: 1 },
  { number: 55, question: 'Risk layering is often found in:', options: ['Prime loans', 'Subprime or non-traditional lending', 'FHA loans', '15-year fixed loans'], correct_index: 1 },
  { number: 56, question: 'Borrower "payment shock" often leads to:', options: ['Lower DTI', 'Increased default risk', 'Faster equity', 'Lower interest'], correct_index: 1 },
  { number: 57, question: 'The DoBS stands for:', options: ['Department of Banking and Securities', 'Division of Business Standards', 'Director of Building Services', 'Department of Bureaucracy'], correct_index: 0 },
  { number: 58, question: 'An MLO cannot charge a fee for:', options: ['Appraisal', 'Loan origination', 'Preparing a Loan Estimate', 'Credit report'], correct_index: 2 },
  { number: 59, question: 'If an MLO’s license is suspended, they must:', options: ['Work harder', 'Cease all MLO activity', 'Change their name', 'Move states'], correct_index: 1 },
  { number: 60, question: 'CE completion is reported by:', options: ['The borrower', 'The MLO', 'The course provider', 'The NMLS directly'], correct_index: 2 },
  { number: 61, question: 'Which represents the cost of credit as a dollar amount?', options: ['APR', 'Finance charge', 'LTV', 'DTI'], correct_index: 1 },
  { number: 62, question: 'Lenders must provide an Appraisal report:', options: ['Only if borrower pays', 'Promptly upon completion or 3 days before closing', 'After closing', 'Only if the loan is denied'], correct_index: 1 },
  { number: 63, question: 'Risk of equity erosion is highest when loan balance:', options: ['Decreases', 'Remains fixed', 'Increases', 'Is refinanced'], correct_index: 2 },
  { number: 64, question: 'A compliance management system helps institutions:', options: ['Avoid state law', 'Demonstrate regulatory oversight', 'Increase commissions', 'Reduce documentation'], correct_index: 1 },
  { number: 65, question: 'The Closing Disclosure replaced the:', options: ['GFE and HUD-1', 'Note', 'Deed', 'Appraisal'], correct_index: 0 },
  { number: 66, question: 'Which is considered a non-traditional mortgage product?', options: ['30-year fixed', '15-year fixed', 'Payment-option ARM', 'Fully amortizing FHA'], correct_index: 2 },
  { number: 67, question: 'Under SAFE, MLOs must complete CE annually before:', options: ['Loan closing', 'License renewal', 'Application submission', 'Commission payout'], correct_index: 1 },
  { number: 68, question: 'Pennsylvania regulators may impose:', options: ['Stock penalties', 'Civil monetary penalties', 'Credit score changes', 'Escrow increases'], correct_index: 1 },
  { number: 69, question: 'Failure to comply with federal mortgage law may result in:', options: ['Higher commission', 'Regulatory penalties', 'Lower APR', 'Loan acceleration'], correct_index: 1 },
  { number: 70, question: 'Ethical conduct requires placing:', options: ['Commission first', "Borrower's best interest first", 'Employer volume first', 'Market share first'], correct_index: 1 }
];

// ── Official Final Exam: 35 Questions (Attempt 1) ─────────────────────
// Derived from "8-Hour PA SAFE Comprehensive - Final Exam.docx"
const FINAL_EXAM_35 = [
  { number: 1, question: 'Under the Ability-to-Repay rule, a creditor must make a:', options: ['Collateral-only determination', 'Reasonable, good-faith determination', 'Profit-based determination', 'Credit-score-only determination'], correct_index: 1 },
  { number: 2, question: 'RESPA Section 8 prohibits:', options: ['Adjustable rate loans', 'Escrow accounts', 'Kickbacks and unearned fees', 'Loan Estimates'], correct_index: 2 },
  { number: 3, question: 'The Loan Estimate must be delivered within:', options: ['2 business days', '3 business days', '5 business days', '7 business days'], correct_index: 1 },
  { number: 4, question: 'The Closing Disclosure must be provided at least:', options: ['1 business day before closing', '2 business days before consummation', '3 business days before consummation', 'After closing'], correct_index: 2 },
  { number: 5, question: 'HOEPA applies to:', options: ['All conventional loans', 'High-cost mortgages', 'FHA loans only', 'USDA loans only'], correct_index: 1 },
  { number: 6, question: 'Under ECOA, creditors must retain mortgage application records for:', options: ['12 months', '18 months', '24 months', '36 months'], correct_index: 2 },
  { number: 7, question: 'Redlining refers to:', options: ['Charging higher APR', 'Refusing loans based on neighborhood demographics', 'Increasing lender compensation', 'Denying based on DTI'], correct_index: 1 },
  { number: 8, question: 'TRID integrated disclosures under:', options: ['ECOA and HMDA', 'TILA and RESPA', 'SAFE and HOEPA', 'FHA and VA'], correct_index: 1 },
  { number: 9, question: 'A Qualified Mortgage generally prohibits:', options: ['Escrow accounts', 'Fixed rates', 'Negative amortization', '15-year terms'], correct_index: 2 },
  { number: 10, question: 'HMDA requires reporting of:', options: ['Advertising budgets', 'Loan application data', 'Commission schedules', 'Credit score models'], correct_index: 1 },
  { number: 11, question: 'Ethical conduct for MLOs includes:', options: ['Prioritizing company profit', 'Providing clear and honest disclosures', 'Steering to higher rates', 'Avoiding borrower questions'], correct_index: 1 },
  { number: 12, question: 'Mortgage fraud "for property" is typically committed by:', options: ['Lenders stripping equity', 'Appraisers inflating value', 'Borrowers misrepresenting information to gain homeownership', 'MLOs steering to high-cost products'], correct_index: 2 },
  { number: 13, question: 'Occupancy fraud involves:', options: ['Failing to pay property taxes', 'Borrower misrepresenting primary residence intent', 'Escrow waiver', 'ARM reset'], correct_index: 1 },
  { number: 14, question: 'Equity stripping involves:', options: ['Reducing interest rates', 'Providing free counseling', 'Lending based on home equity without regard for repayment ability', 'Lowering loan fees'], correct_index: 2 },
  { number: 15, question: 'A red flag for mortgage fraud includes:', options: ['Clear documentation', 'Evasive or suspicious borrower behavior', 'Consistent employment', 'Verified assets'], correct_index: 1 },
  { number: 16, question: 'The SAFE Act requires MLOs to act in the best interest of consumers and maintain a:', options: ['Minimum sales quota', 'Unique identifier through NMLS', 'List of all competitor rates', 'Law degree'], correct_index: 1 },
  { number: 17, question: 'Reverse redlining targets:', options: ['Wealthy neighborhoods', 'Rural areas only', 'Protected classes for high-cost or predatory loans', 'Commercial investors'], correct_index: 2 },
  { number: 18, question: 'Ethical integrity requires placing:', options: ['Commission first', 'Employer volume first', "The borrower's best interest first", 'Market share first'], correct_index: 2 },
  { number: 19, question: 'Negative amortization occurs when:', options: ['Loan balance decreases', 'Interest due exceeds the monthly payment', 'Principal is paid early', 'Rate remains fixed'], correct_index: 1 },
  { number: 20, question: 'An ARM rate is based on:', options: ['Fixed rate forever', 'Set by the MLO', 'Based on an index plus a margin', 'Reduced every year'], correct_index: 2 },
  { number: 21, question: 'Payment shock is most common in:', options: ['Fixed-rate loans', 'Interest-only or option ARMs when payments reset', 'Fully amortizing ARMs', '15-year mortgages'], correct_index: 1 },
  { number: 22, question: 'Risk layering increases:', options: ['Loan stability', 'Compliance ease', 'The probability of default', 'Equity growth'], correct_index: 2 },
  { number: 23, question: 'The primary risk of interest-only loans is:', options: ['Lower initial payments', 'Fixed interest rates', 'Lack of principal reduction leading to payment shock', 'Escrow requirement'], correct_index: 2 },
  { number: 24, question: 'Suitability assessment focuses on:', options: ['Maximizing loan amount', 'Commission potential', 'Borrower’s long-term ability to afford the loan', 'Closing speed'], correct_index: 2 },
  { number: 25, question: 'Non-traditional lending emphasizes:', options: ['Yield spread', 'Suitability and disclosure', 'Removing ATR', 'Lower fees'], correct_index: 1 },
  { number: 26, question: 'Pennsylvania mortgage licensing oversight is administered by the:', options: ['HUD', 'CFPB', 'Pennsylvania Department of Banking and Securities', 'Federal Reserve'], correct_index: 2 },
  { number: 27, question: 'MLOs must obtain a unique identifier through:', options: ['HUD', 'CFPB', 'NMLS', 'FDIC'], correct_index: 2 },
  { number: 28, question: 'Minimum annual continuing education hours required under SAFE Act:', options: ['6', '7', '8', '10'], correct_index: 2 },
  { number: 29, question: 'Operating without a mortgage license in Pennsylvania may result in:', options: ['Increased commission', 'Administrative penalties', 'Lower APR', 'Loan approval'], correct_index: 1 },
  { number: 30, question: 'Administrative enforcement actions may include:', options: ['Credit score reduction', 'Cease-and-desist orders', 'Rate increases', 'Escrow suspension'], correct_index: 1 },
  { number: 31, question: 'SAFE Act was enacted in:', options: ['2005', '2007', '2008', '2010'], correct_index: 2 },
  { number: 32, question: 'CE must include which required category?', options: ['Advertising', 'Fraud prevention', 'Appraisal standards', 'Marketing'], correct_index: 1 },
  { number: 33, question: 'Failure to comply with state disclosure requirements may result in:', options: ['Faster closing', 'Regulatory penalties', 'Higher APR', 'Reduced documentation'], correct_index: 1 },
  { number: 34, question: 'Pennsylvania regulators may conduct:', options: ['Credit scoring', 'Compliance examinations', 'Appraisal adjustments', 'Marketing reviews only'], correct_index: 1 },
  { number: 35, question: 'Failure to comply with federal mortgage law may result in:', options: ['Higher commission', 'Regulatory penalties', 'Lower APR', 'Loan acceleration'], correct_index: 1 }
];

// ── Course Data Object ────────────────────────────────────────────────
const courseData = {
  title:           '8-HOUR PA SAFE COMPREHENSIVE: ANNUAL MLO FUNDAMENTALS',
  nmls_course_id:  'CE-PA-SAFE-8HR',
  type:            'CE',
  credit_hours:    8,
  description:     'NMLS-approved 8-hour continuing education course for Pennsylvania MLOs covering federal mortgage law, ethics, non-traditional lending, and Pennsylvania state law.',
  price:           99.00,
  states_approved: ['PA'],
  has_textbook:    false,
  is_active:       true,
  pdf_url:         PA_TEXTBOOK_PDF,

  modules: [
    {
      order: 1, title: 'Federal Mortgage-Related Laws', credit_hours: 3,
      pdf_url: PA_TEXTBOOK_PDF,
      quiz: [
        { number: 1, question: 'What is the primary purpose of TILA?', options: ['promote fair lending', 'ensure credit for all', 'provide standardized disclosures about credit costs', 'restrict interest rates'], correct_index: 2 },
        { number: 2, question: 'Which act prohibits discrimination in housing transactions?', options: ['ECOA', 'Fair Housing Act (FHA)', 'RESPA', 'HMDA'], correct_index: 1 },
        { number: 3, question: 'Which requires disclosure of settlement costs and prohibits kickbacks?', options: ['TILA', 'ECOA', 'Real Estate Settlement Procedures Act (RESPA)', 'The SAFE Act'], correct_index: 2 },
        { number: 4, question: 'What does ECOA prohibit in mortgage lending?', options: ['Discriminating based on creditworthiness', 'Discriminating based on race, sex, or marital status', 'Failing to issue a Loan Estimate', 'Charging higher rates'], correct_index: 1 },
        { number: 5, question: 'Which federal act requires reporting of mortgage lending data to identify discriminatory practices?', options: ['The SAFE Act', 'Home Mortgage Disclosure Act (HMDA)', 'Fair Housing Act (FHA)', 'Truth in Lending Act (TILA)'], correct_index: 1 }
      ]
    },
    {
      order: 2, title: 'Ethical Guidelines for MLOs', credit_hours: 2,
      pdf_url: PA_TEXTBOOK_PDF,
      quiz: [
        { number: 1, question: 'What is the primary responsibility of a Mortgage Loan Originator (MLO)?', options: ['To close loans quickly', 'To ensure compliance with all relevant mortgage laws', 'To ensure borrowers get the lowest possible interest rate', 'To make the maximum commission'], correct_index: 1 },
        { number: 2, question: 'What does the Dodd-Frank Act prohibit regarding loan originator compensation?', options: ['Payment based on loan interest rates', 'Dual compensation from both the borrower and the lender', 'Higher compensation for riskier loans', 'All of the above'], correct_index: 3 },
        { number: 3, question: 'What is the duty of a Mortgage Loan Originator (MLO) when facing conflicts of interest?', options: ['To avoid all business relationships', 'To disclose any conflict clearly and promptly', "To ignore minor conflicts as they don't affect decisions", "To rely solely on the employer's guidance"], correct_index: 1 },
        { number: 4, question: 'Which of the following is a common form of mortgage fraud that MLOs must prevent?', options: ['Inaccurate income reporting by borrowers', 'Borrower refusal to sign the Loan Estimate', 'Failure to provide Closing Disclosure', 'Offering discounts on closing costs'], correct_index: 0 },
        { number: 5, question: 'What is the potential consequence for a Mortgage Loan Originator if they violate ethical guidelines?', options: ['Increased market share', 'Civil penalties and license suspension', 'Higher commissions', 'No consequences'], correct_index: 1 }
      ]
    },
    {
      order: 3, title: 'Non-Traditional Mortgage Lending', credit_hours: 2,
      pdf_url: PA_TEXTBOOK_PDF,
      quiz: [
        { number: 1, question: 'Which of the following is a non-traditional mortgage product?', options: ['Fixed-rate mortgage', 'Interest-only mortgage', 'Fully amortizing adjustable-rate mortgage', 'Conventional loan'], correct_index: 1 },
        { number: 2, question: 'What is the primary risk associated with interest-only mortgages?', options: ['Fixed monthly payments', 'Payment shock after the interest-only period ends', 'High upfront fees', 'No interest rate changes'], correct_index: 1 },
        { number: 3, question: 'How do non-traditional mortgage products typically qualify borrowers?', options: ['Strictly by W-2 income', 'Using alternative income documentation like bank statements', 'Based solely on credit score', 'With no documentation needed'], correct_index: 1 },
        { number: 4, question: 'What does the SAFE Act require for mortgage loan originators involved in non-traditional lending?', options: ['A minimum credit score of 700', 'Enhanced licensing and training', 'Higher commissions for riskier loans', 'No additional requirements compared to traditional lending'], correct_index: 1 },
        { number: 5, question: 'Which of the following is a significant consumer risk with non-traditional mortgage products?', options: ['Predictable payments throughout the loan', 'Lack of transparency in loan terms', 'Long-term cost savings', 'Immediate full repayment of the loan balance'], correct_index: 1 }
      ]
    },
    {
      order: 4, title: 'Pennsylvania Mortgage Licensing Law', credit_hours: 1,
      pdf_url: PA_TEXTBOOK_PDF,
      quiz: [
        { number: 1, question: 'Which agency is responsible for licensing and regulating mortgage professionals in PA?', options: ['PA Dept of Consumer Affairs', 'Department of Banking and Securities (DoBS)', 'FHFA', 'NMLS'], correct_index: 1 },
        { number: 2, question: 'How many hours of DoBS-approved CE are required annually for PA MLOs?', options: ['4', '6', '8', '10'], correct_index: 2 },
        { number: 3, question: 'Which is a prohibited act under Pennsylvania mortgage law?', options: ['Providing LE within 3 days', 'Charging excessive or undisclosed fees', 'Retaining certificates for audit', 'Registering through NMLS'], correct_index: 1 },
        { number: 4, question: 'What is the first step in the DoBS enforcement process when a violation is identified?', options: ['License revocation', 'Referral to federal regulators', 'Administrative actions such as cease-and-desist', 'Criminal prosecution'], correct_index: 2 },
        { number: 5, question: 'Which disclosure documents are required under TRID for residential transactions in PA?', options: ['GFE and TIL', 'HUD-1 and initial escrow', 'Loan Estimate and Closing Disclosure', '1003 and DoBS form'], correct_index: 2 }
      ]
    },
    {
      order: 5, title: 'FINAL - PENNSYLVANIA', credit_hours: 0,
      pdf_url: PA_FINAL_PDF, show_pdf_before_quiz: false,
      quiz: []
    }
  ],

  final_exam: {
    title:              '8-HOUR PA SAFE COMPREHENSIVE — Final Exam',
    passing_score:      75,
    time_limit_minutes: 90,
    questions:          FINAL_EXAM_35,
    question_bank:      QUESTION_BANK_70
  }
};

// ── Seed Script Logic ─────────────────────────────────────────────────
const seed = async () => {
  try {
    await mongoose.connect(process.env.MONGO_URI);
    console.log('✅ MongoDB connected');

    await Course.deleteOne({ nmls_course_id: 'CE-PA-SAFE-8HR' });
    console.log('🗑️ Removed existing Pennsylvania SAFE course');

    const course = await Course.create(courseData);
    console.log(`\n✅ Course inserted: ${course.title}`);
    console.log(`\n🎯 Test at: /courses/CE-PA-SAFE-8HR/learn`);

    await mongoose.disconnect();
    process.exit(0);
  } catch (err) {
    console.error('❌ Seed failed:', err.message);
    process.exit(1);
  }
};

seed();