/**
 * seed_ny_safe_course.js
 * Drop this in: relstone_NMLS/server/
 * Run with:    node seed_ny_safe_course.js
 *
 * COURSE STRUCTURE:
 *   Step 1  📄 Lesson     — Module 1: Federal Mortgage Law
 *   Step 2  📋 Checkpoint — Module 1 Quiz (5 questions)
 *   Step 3  📄 Lesson     — Module 2: Ethics & Consumer Protection
 *   Step 4  📋 Checkpoint — Module 2 Quiz (5 questions)
 *   Step 5  📄 Lesson     — Module 3: Non-Traditional Mortgage Lending
 *   Step 6  📋 Checkpoint — Module 3 Quiz (5 questions)
 *   Step 7  📄 Lesson     — Module 4: Mortgage Origination
 *   Step 8  📋 Checkpoint — Module 4 Quiz (5 questions)
 *   Step 9  📄 Lesson     — Module 5: New York State Law and Regulations
 *   Step 10 📋 Checkpoint — Module 5 Quiz (5 questions)
 *   Step 11 📄 Lesson     — FINAL - NEW YORK (PDF review, no quiz)
 *   Step 12 🏆 Final Exam — Attempt 1: official 35 Qs | Retry: random 35 from 70-Q bank
 *
 * RETRY LOGIC:
 *   - First attempt:  35 questions from FINAL_EXAM_35 (official verified set)
 *   - On failure:     35 questions drawn RANDOMLY from QUESTION_BANK_70
 *   - Each retry gets a fresh random 35 — student sees different questions each time
 *   - The question_bank array on final_exam enables this in the backend
 */

const mongoose = require('mongoose');
const dotenv   = require('dotenv');
dotenv.config();

const Course = require('./models/Course');

// ── PDF URLs ──────────────────────────────────────────────────────────
const MODULE_PDF  = 'https://www.dropbox.com/scl/fi/9h17lbyuhecwqlhsoevqq/11-Hour-NY-SAFE-Comprehensive-Annual-MLO-Fundamentals.pdf?rlkey=22t9d1355w99ai53n2upvmhao&st=cb4lr9s4&raw=1';
const FINAL_NY_PDF = 'https://www.dropbox.com/scl/fi/qj8fccuig00cvwzft3ivj/FINAL-NEW-YORK.pdf?rlkey=qwdeze1ah60rmceel5pwvg5lu&st=thqz8ddv&raw=1';

// ─────────────────────────────────────────────────────────────────────
// 70-QUESTION BANK — used as retry pool when student fails the final exam
// Backend should: on retry, randomly select 35 from this array each time
// ─────────────────────────────────────────────────────────────────────
const QUESTION_BANK_70 = [
  // ── Federal Mortgage Law ──────────────────────────────────────────
  { number:1,  question:'What is the purpose of TILA?', options:['To extend more credit','To make credit easier to obtain','To promote the informed use of consumer credit','To better qualify borrowers'], correct_index:2 },
  { number:2,  question:'Under the Truth in Lending Act (TILA), the APR must include which of the following?', options:['Only the interest rate','Interest rate plus certain other charges','Only fees charged for services','The interest rate plus taxes and insurance'], correct_index:1 },
  { number:3,  question:'Which federal law governs the disclosure of settlement costs in mortgage lending?', options:['TILA','RESPA','ECOA','HMDA'], correct_index:1 },
  { number:4,  question:'Which document provides an estimate of a borrower\'s closing costs?', options:['Loan estimate','Closing disclosure','Credit report','Appraisal report'], correct_index:0 },
  { number:5,  question:'How soon after applying must the lender provide the Loan Estimate?', options:['Within 1 day','Within 3 days','Within 5 days','Within 7 days'], correct_index:1 },
  { number:6,  question:'Under which federal act must lenders verify a borrower\'s ability to repay?', options:['TILA','RESPA','SAFE Act','Dodd-Frank Act'], correct_index:3 },
  { number:7,  question:'What is a "high-cost mortgage" under HOEPA?', options:['A loan with high interest rates','A loan with excessive fees','A loan with balloon payments','All of the above'], correct_index:3 },
  { number:8,  question:'Which action is a violation of TILA?', options:['Misrepresenting the annual percentage rate','Disclosing APR correctly','Providing the loan estimate on time','None of the above'], correct_index:0 },
  { number:9,  question:'Which of these is a prohibited practice under RESPA?', options:['Receiving referral fees','Kickbacks for settlement services','Charging fees for services not performed','All of the above'], correct_index:3 },
  { number:10, question:'Which federal agency oversees RESPA compliance?', options:['Federal Reserve','CFPB','HUD','All of the above'], correct_index:1 },
  { number:11, question:'Which federal law prohibits discrimination in housing-related transactions?', options:['Fair Housing Act','Equal Credit Opportunity Act','HMDA','Dodd-Frank Act'], correct_index:0 },
  { number:12, question:'What is the primary purpose of HMDA?', options:['Promote mortgage availability','Gather data to identify discriminatory lending patterns','Monitor lending risk','Prevent mortgage fraud'], correct_index:1 },
  { number:13, question:'Which is a requirement under the SAFE Act?', options:['Completion of pre-licensing education','Completion of continuing education','Passing a national test','All of the above'], correct_index:3 },
  { number:14, question:'How many hours of continuing education are required annually under SAFE?', options:['8 hours','12 hours','16 hours','20 hours'], correct_index:0 },
  { number:15, question:'What is steering in mortgage lending?', options:['Guiding borrower to best product','Encouraging risky high-cost loans for higher compensation','Providing equal loan access','Denying loans based on credit'], correct_index:1 },
  { number:16, question:'What is the primary function of the CFPB?', options:['Regulate origination fees','Supervise fair lending practices','Oversee credit cards only','Enforce state-specific laws'], correct_index:1 },

  // ── FHA & Government Lending ──────────────────────────────────────
  { number:17, question:'What is the minimum down payment for an FHA loan?', options:['1%','3.5%','5%','10%'], correct_index:1 },
  { number:18, question:'What is the role of the Federal Housing Administration (FHA)?', options:['Insure loans made by approved lenders','Provide loans directly to borrowers','Enforce the Fair Housing Act','Regulate mortgage insurance companies'], correct_index:0 },
  { number:19, question:'What is the maximum FHA loan amount in high-cost areas?', options:['$300,000','$500,000','$750,000','Varies by county'], correct_index:3 },
  { number:20, question:'Which is an acceptable source of funds for a down payment on a conventional loan?', options:['Gift from a family member','Borrowed funds','Employer-paid down payment assistance','All of the above'], correct_index:3 },
  { number:21, question:'What does the term "collateral" refer to in a mortgage loan?', options:['The borrower\'s ability to repay','The property securing the loan','The insurance covering the loan','The credit report'], correct_index:1 },

  // ── Mortgage Market & Qualified Mortgages ─────────────────────────
  { number:22, question:'What is the maximum allowable debt-to-income ratio (DTI) for a qualified mortgage?', options:['36%','43%','45%','50%'], correct_index:1 },
  { number:23, question:'Which of the following is NOT required for a qualified mortgage?', options:['The loan must have a fixed interest rate','The loan must have a term of 30 years or less','The borrower must provide collateral','The loan cannot exceed a 43% debt-to-income ratio'], correct_index:0 },
  { number:24, question:'What is the main purpose of the National Mortgage Licensing System (NMLS)?', options:['To issue licenses to mortgage professionals','To track mortgage loan origination activity','To provide a standardized education program','To enforce lending laws'], correct_index:0 },
  { number:25, question:'Which document provides the final terms and conditions of a loan?', options:['Loan estimate','Closing disclosure','Appraisal report','Credit report'], correct_index:1 },
  { number:26, question:'When is private mortgage insurance (PMI) typically required?', options:['On all conventional loans','When the down payment is less than 20%','Only on government-backed loans','It is optional for all borrowers'], correct_index:1 },
  { number:27, question:'Which type of loan is considered a subprime loan?', options:['Loans to borrowers with excellent credit','Loans to borrowers with bad credit','Loans with low interest rates','Loans backed by the government'], correct_index:1 },
  { number:28, question:'Which of the following is an example of a secondary market activity?', options:['Issuing a loan to a borrower','Collecting mortgage payments','Selling loans to Fannie Mae','Providing pre-approval letters'], correct_index:2 },
  { number:29, question:'What is the role of mortgage-backed securities (MBS)?', options:['They provide funding so lenders can make more loans','They are a type of mortgage loan','They guarantee loans for homeowners','They set mortgage interest rates'], correct_index:0 },
  { number:30, question:'Which type of loan is exempt from TILA requirements?', options:['Business loans','Consumer loans','Residential mortgage loans','All of the above'], correct_index:0 },
  { number:31, question:'What is considered a hard inquiry on a credit report?', options:['A pre-qualification check','A lender\'s review for a loan application','A promotional credit offer','A routine employment check'], correct_index:1 },
  { number:32, question:'How is a mortgage loan typically repaid?', options:['In one lump sum at the end of the term','Through monthly installments of principal and interest','By refinancing the loan','Through lump sum payments every five years'], correct_index:1 },
  { number:33, question:'What is a major responsibility of a mortgage loan originator (MLO)?', options:['To originate mortgage loans','To negotiate loan terms','To disclose loan terms to the borrower','All of the above'], correct_index:3 },
  { number:34, question:'What is the purpose of an appraisal in the mortgage process?', options:['To assess the borrower\'s creditworthiness','To determine the property\'s market value','To estimate the loan interest rate','To determine the mortgage insurance requirement'], correct_index:1 },
  { number:35, question:'What is the conventional loan limit in most counties?', options:['$200,000','$300,000','$500,000','Varies by county'], correct_index:3 },

  // ── Advanced Federal Law ──────────────────────────────────────────
  { number:36, question:'Under the Ability-to-Repay rule, creditors must make a:', options:['Profit-based determination','Reasonable, good-faith determination','Credit-score-only determination','Collateral-only determination'], correct_index:1 },
  { number:37, question:'A Qualified Mortgage generally limits total points and fees to:', options:['2% of the loan amount','3% of the loan amount','4% of the loan amount','5% of the loan amount'], correct_index:1 },
  { number:38, question:'Which loan feature is prohibited in most Qualified Mortgages?', options:['Fixed interest rate','Negative amortization','Escrow accounts','15-year loan term'], correct_index:1 },
  { number:39, question:'A high-cost mortgage under HOEPA is triggered when the APR exceeds APOR by:', options:['3% for a first lien','4% for a first lien','6.5% for a first lien','10% for a first lien'], correct_index:2 },
  { number:40, question:'Section 8(b) of RESPA prohibits:', options:['APR miscalculation','Unearned fee splitting','Adjustable-rate increases','Balloon loan payments'], correct_index:1 },
  { number:41, question:'Affiliated business arrangements under RESPA are permitted if:', options:['Use of the affiliate is mandatory','No disclosure is required','Proper disclosure is made and use is optional','A referral fee is kept confidential'], correct_index:2 },
  { number:42, question:'Under ECOA, an adverse action notice must be provided within:', options:['15 days','20 days','30 days','45 days'], correct_index:2 },
  { number:43, question:'Which of the following is a protected class under the Fair Housing Act?', options:['Credit history','Disability','Loan amount','Employment type'], correct_index:1 },
  { number:44, question:'Redlining refers to:', options:['Increasing origination fees','Refusing loans based on neighborhood demographics','Charging a high APR','Adjustable-rate loan increases'], correct_index:1 },
  { number:45, question:'Disparate impact refers to:', options:['Intentional discrimination','Different pricing tiers for similar borrowers','A neutral policy that causes a discriminatory effect','Credit-based pricing adjustments'], correct_index:2 },

  // ── Non-Traditional Lending ───────────────────────────────────────
  { number:46, question:'Negative amortization primarily results in:', options:['Faster equity growth','A reduced loan balance','An increasing loan balance','A fixed interest rate'], correct_index:2 },
  { number:47, question:'Payment shock most commonly occurs when:', options:['Property taxes decrease','The interest-only period ends','The loan balance decreases','The fixed rate remains stable'], correct_index:1 },
  { number:48, question:'An ARM rate is typically based on:', options:['A fixed note rate only','An index plus a margin','Credit score alone','Escrow account changes'], correct_index:1 },
  { number:49, question:'Interest-only loans primarily delay:', options:['Escrow payments','Interest accrual','Principal repayment','Closing costs'], correct_index:2 },
  { number:50, question:'Bank statement loans are typically used by:', options:['Salaried W-2 employees','Self-employed borrowers','Retirees only','FHA borrowers exclusively'], correct_index:1 },
  { number:51, question:'Risk layering in mortgage lending increases:', options:['Loan simplicity','Regulatory compliance ease','Default probability','Equity growth rate'], correct_index:2 },
  { number:52, question:'Occupancy fraud occurs when a borrower:', options:['Pays additional principal voluntarily','Misrepresents intent to occupy as primary residence','Refinances ahead of schedule','Uses an escrow account'], correct_index:1 },
  { number:53, question:'A straw buyer scheme involves:', options:['A buyer who occupies the property','Purchasing a property on behalf of an unqualified person','Legitimate FHA financing','Paying a larger down payment'], correct_index:1 },
  { number:54, question:'Which of the following is a red flag indicating potential mortgage fraud?', options:['Consistent and well-organized documentation','Evasive borrower answers about property use','Stable employment history','Clear and verifiable income records'], correct_index:1 },
  { number:55, question:'Zero-tolerance fees under TRID include:', options:['Prepaid interest','Lender origination charges','Homeowner\'s insurance premiums','Escrow deposits'], correct_index:1 },

  // ── New York State Law ────────────────────────────────────────────
  { number:56, question:'Which New York state agency has primary authority over mortgage loan originators licensed under the Banking Law?', options:['New York Attorney General','New York Department of Financial Services (DFS)','New York Department of State','Federal Reserve Bank of New York'], correct_index:1 },
  { number:57, question:'New York\'s continuing education requirement for licensed MLOs includes:', options:['Federal content only','Both federal and New York state-specific content','State content only','Ethics content only'], correct_index:1 },
  { number:58, question:'Under New York law, ultimate responsibility for timely CE completion rests with:', options:['The CE course provider','The sponsoring mortgage company','The individual licensee','NMLS'], correct_index:2 },
  { number:59, question:'Practicing mortgage activity with an expired New York license constitutes:', options:['A minor administrative violation only','Unlicensed activity subject to regulatory penalties','An automatic probationary period','A federal SAFE Act violation only'], correct_index:1 },
  { number:60, question:'New York mortgage law in relation to federal law typically:', options:['Mirrors federal requirements exactly','Imposes fewer obligations than federal law','Frequently imposes stricter consumer protections than federal law','Defers entirely to federal standards'], correct_index:2 },
  { number:61, question:'New York law prohibits mortgage professionals from:', options:['Explaining loan terms clearly to borrowers','Charging unauthorized or undisclosed fees and steering consumers into unsuitable products','Providing required disclosures on time','Including NMLS identifiers in advertising'], correct_index:1 },
  { number:62, question:'Under New York DFS, enforcement actions may arise from:', options:['Only formal consumer complaints','Routine examinations, investigations, whistleblower reports, and consumer complaints','Federal agency referrals only','Annual license renewal audits only'], correct_index:1 },
  { number:63, question:'New York DFS monitors mortgage advertising through:', options:['Annual licensee self-reporting only','Examinations, consumer complaints, and market surveillance','A mandatory pre-approval process for all ads','Random sampling of loan files only'], correct_index:1 },
  { number:64, question:'Civil penalties imposed by New York DFS are intended to:', options:['Fund state consumer protection programs','Serve both a punitive and deterrent function','Replace license revocation as a remedy','Apply only to unlicensed individuals'], correct_index:1 },
  { number:65, question:'Loss of a New York mortgage license due to revocation may:', options:['Only affect the licensee\'s status in New York','Negatively impact licensing eligibility in other states due to reciprocal NMLS reporting','Be expunged after one year of good conduct','Be appealed directly to the CFPB'], correct_index:1 },
  { number:66, question:'New York borrowers may report suspected mortgage violations directly to:', options:['NMLS','New York DFS','The New York Attorney General only','HUD'], correct_index:1 },
  { number:67, question:'The New York 11-hour annual CE requirement includes state-specific content covering:', options:['Federal law only','New York Banking Law, DFS regulations, and state consumer protections','Ethics only','Non-traditional mortgage content only'], correct_index:1 },
  { number:68, question:'Which of the following is required for an MLO to maintain a valid New York license?', options:['Completing 11 hours of CE annually','Completing 8 hours of CE annually','No CE requirement — only license renewal fee','Completing 20 hours every two years'], correct_index:0 },
  { number:69, question:'New York\'s predatory lending laws are designed to:', options:['Increase origination volume','Protect borrowers from abusive loan terms and practices','Reduce the number of licensed MLOs','Limit the types of loans available in the state'], correct_index:1 },
  { number:70, question:'Under New York DFS rules, a mortgage loan originator must disclose their NMLS ID:', options:['Only on loan applications','Only on closing documents','In all advertising and on all loan documents','Only when requested by the borrower'], correct_index:2 },
];

// ─────────────────────────────────────────────────────────────────────
// OFFICIAL FINAL EXAM — 35 questions, verified answer key
// Key: 1A 2B 3B 4A 5B 6D 7D 8A 9D 10B 11A 12B 13D 14A 15D
//      16B 17B 18A 19D 20D 21B 22B 23A 24A 25B 26B 27B 28C 29A
//      30A 31B 32B 33D 34B 35D
// ─────────────────────────────────────────────────────────────────────
const FINAL_EXAM_35 = [
  { number:1,  question:'What is the purpose of TILA?', options:['To promote the informed use of consumer credit','To extend more credit','To make credit easier to obtain','To better qualify borrowers'], correct_index:0 },
  { number:2,  question:'Under the Truth in Lending Act (TILA), the APR must include which of the following?', options:['Only the interest rate','Interest rate plus certain other charges','Only fees charged for services','The interest rate plus taxes and insurance'], correct_index:1 },
  { number:3,  question:'Which federal law governs the disclosure of settlement costs in mortgage lending?', options:['TILA','RESPA','ECOA','HMDA'], correct_index:1 },
  { number:4,  question:'Which document provides an estimate of a borrower\'s closing costs?', options:['Loan estimate','Closing disclosure','Credit report','Appraisal report'], correct_index:0 },
  { number:5,  question:'How soon after applying must the lender provide the Loan Estimate?', options:['Within 1 day','Within 3 days','Within 5 days','Within 7 days'], correct_index:1 },
  { number:6,  question:'Under which federal act must lenders verify a borrower\'s ability to repay?', options:['TILA','RESPA','SAFE Act','Dodd-Frank Act'], correct_index:3 },
  { number:7,  question:'What is a "high-cost mortgage" under HOEPA?', options:['A loan with high interest rates','A loan with excessive fees','A loan with balloon payments','All of the above'], correct_index:3 },
  { number:8,  question:'Which action is a violation of TILA?', options:['Misrepresenting the annual percentage rate','Disclosing APR correctly','Providing the loan estimate on time','None of the above'], correct_index:0 },
  { number:9,  question:'Which of these is a prohibited practice under RESPA?', options:['Receiving referral fees','Kickbacks for settlement services','Charging fees for services not performed','All of the above'], correct_index:3 },
  { number:10, question:'Which federal agency oversees RESPA compliance?', options:['Federal Reserve','CFPB','HUD','All of the above'], correct_index:1 },
  { number:11, question:'Which federal law prohibits discrimination in housing-related transactions?', options:['Fair Housing Act','Equal Credit Opportunity Act','HMDA','Dodd-Frank Act'], correct_index:0 },
  { number:12, question:'What is the primary purpose of HMDA?', options:['Promote mortgage availability','Gather data to identify discriminatory lending patterns','Monitor lending risk','Prevent mortgage fraud'], correct_index:1 },
  { number:13, question:'Which is a requirement under the SAFE Act?', options:['Completion of pre-licensing education','Completion of continuing education','Passing a national test','All of the above'], correct_index:3 },
  { number:14, question:'How many hours of continuing education are required annually under SAFE?', options:['8 hours','12 hours','16 hours','20 hours'], correct_index:0 },
  { number:15, question:'What is steering in mortgage lending?', options:['Guiding borrower to best product','Encouraging risky high-cost loans for higher compensation','Providing equal loan access','Denying loans based on credit'], correct_index:3 },
  { number:16, question:'What is the primary function of the CFPB?', options:['Regulate origination fees','Supervise fair lending practices','Oversee credit cards only','Enforce state-specific laws'], correct_index:1 },
  { number:17, question:'What is the minimum down payment for an FHA loan?', options:['1%','3.5%','5%','10%'], correct_index:1 },
  { number:18, question:'What is the role of the Federal Housing Administration (FHA)?', options:['Insure loans made by approved lenders','Provide loans directly to borrowers','Enforce the Fair Housing Act','Regulate mortgage insurance companies'], correct_index:0 },
  { number:19, question:'What is the maximum FHA loan amount in high-cost areas?', options:['$300,000','$500,000','$750,000','Varies by county'], correct_index:3 },
  { number:20, question:'Which is an acceptable source of funds for a down payment on a conventional loan?', options:['Gift from a family member','Borrowed funds','Employer-paid down payment assistance','All of the above'], correct_index:3 },
  { number:21, question:'What does the term "collateral" refer to in a mortgage loan?', options:['The borrower\'s ability to repay','The property securing the loan','The insurance covering the loan','The credit report'], correct_index:1 },
  { number:22, question:'What is the maximum allowable debt-to-income ratio (DTI) for a qualified mortgage?', options:['36%','43%','45%','50%'], correct_index:1 },
  { number:23, question:'Which of the following is NOT required for a qualified mortgage?', options:['The loan must have a fixed interest rate','The loan must have a term of 30 years or less','The borrower must provide collateral','The loan cannot exceed a 43% debt-to-income ratio'], correct_index:0 },
  { number:24, question:'What is the main purpose of the National Mortgage Licensing System (NMLS)?', options:['To issue licenses to mortgage professionals','To track mortgage loan origination activity','To provide a standardized education program','To enforce lending laws'], correct_index:0 },
  { number:25, question:'Which document provides the final terms and conditions of a loan?', options:['Loan estimate','Closing disclosure','Appraisal report','Credit report'], correct_index:1 },
  { number:26, question:'When is private mortgage insurance (PMI) typically required?', options:['On all conventional loans','When the down payment is less than 20%','Only on government-backed loans','It is optional for all borrowers'], correct_index:1 },
  { number:27, question:'Which type of loan is considered a subprime loan?', options:['Loans to borrowers with excellent credit','Loans to borrowers with bad credit','Loans with low interest rates','Loans backed by the government'], correct_index:1 },
  { number:28, question:'Which of the following is an example of a secondary market activity?', options:['Issuing a loan to a borrower','Collecting mortgage payments','Selling loans to Fannie Mae','Providing pre-approval letters'], correct_index:2 },
  { number:29, question:'What is the role of mortgage-backed securities (MBS)?', options:['They provide funding so lenders can make more loans','They are a type of mortgage loan','They guarantee loans for homeowners','They set mortgage interest rates'], correct_index:0 },
  { number:30, question:'Which type of loan is exempt from TILA requirements?', options:['Business loans','Consumer loans','Residential mortgage loans','All of the above'], correct_index:0 },
  { number:31, question:'What is considered a hard inquiry on a credit report?', options:['A pre-qualification check','A lender\'s review for a loan application','A promotional credit offer','A routine employment check'], correct_index:1 },
  { number:32, question:'How is a mortgage loan typically repaid?', options:['In one lump sum at the end of the term','Through monthly installments of principal and interest','By refinancing the loan','Through lump sum payments every five years'], correct_index:1 },
  { number:33, question:'What is a major responsibility of a mortgage loan originator (MLO)?', options:['To originate mortgage loans','To negotiate loan terms','To disclose loan terms to the borrower','All of the above'], correct_index:3 },
  { number:34, question:'What is the purpose of an appraisal in the mortgage process?', options:['To assess the borrower\'s creditworthiness','To determine the property\'s market value','To estimate the loan interest rate','To determine the mortgage insurance requirement'], correct_index:1 },
  { number:35, question:'What is the conventional loan limit in most counties?', options:['$200,000','$300,000','$500,000','Varies by county'], correct_index:3 },
];

// ─────────────────────────────────────────────────────────────────────
const courseData = {
  title:          '11-HOUR NY SAFE COMPREHENSIVE: ANNUAL MLO FUNDAMENTALS',
  nmls_course_id: 'CE-NY-SAFE-11HR',
  type:           'CE',
  credit_hours:   11,
  description:
    'This 11-hour SAFE Act continuing education course covers federal mortgage law ' +
    '(3 hrs), ethics & consumer protection (2 hrs), FHA & government lending (3 hrs), ' +
    'mortgage market & qualified mortgages (2 hrs), and New York state-specific law ' +
    '(1 hr). Required annually for New York-licensed Mortgage Loan Originators.',
  price:           99.00,
  states_approved: ['NY'],
  has_textbook:    false,
  textbook_price:  0,
  is_active:       true,
  pdf_url:         MODULE_PDF,

  modules: [

    // ── MODULE 1 ────────────────────────────────────────────────────
    {
      order:        1,
      title:        'Federal Mortgage Law',
      credit_hours: 3,
      pdf_url:      MODULE_PDF,
      sections: [
        '1.1 Overview of Federal Mortgage Regulation',
        '1.2 Truth in Lending Act (TILA) & TRID',
        '1.3 Real Estate Settlement Procedures Act (RESPA)',
        '1.4 Ability-to-Repay & Qualified Mortgage Rule',
        '1.5 Home Ownership and Equity Protection Act (HOEPA)',
        '1.6 SAFE Act Overview',
        'Module 1 Summary',
        'Case Study: The Disclosure Dilemma',
      ],
      quiz: [
        // Answer key: 1C 2B 3C 4B 5B
        { number:1, question:'What is the primary purpose of the Truth in Lending Act (TILA)?', options:['To promote fair lending practices','To ensure lenders offer credit to all consumers','To provide clear and standardized disclosures about credit costs','To restrict mortgage loan interest rates'], correct_index:2 },
        { number:2, question:'Which act prohibits discrimination in housing-related transactions, including mortgage lending?', options:['Equal Credit Opportunity Act (ECOA)','Fair Housing Act (FHA)','Real Estate Settlement Procedures Act (RESPA)','Home Mortgage Disclosure Act (HMDA)'], correct_index:1 },
        { number:3, question:'Which of the following requires lenders to disclose settlement costs to consumers and prohibits kickbacks?', options:['Truth in Lending Act (TILA)','Equal Credit Opportunity Act (ECOA)','Real Estate Settlement Procedures Act (RESPA)','The SAFE Act'], correct_index:2 },
        { number:4, question:'What does ECOA prohibit in mortgage lending?', options:['Discriminating based on creditworthiness','Discriminating based on race, sex, or marital status','Failing to issue a Loan Estimate','Charging higher interest rates'], correct_index:1 },
        { number:5, question:'Which federal act requires the collection and reporting of mortgage lending data to identify discriminatory practices?', options:['The SAFE Act','Home Mortgage Disclosure Act (HMDA)','Fair Housing Act (FHA)','Truth in Lending Act (TILA)'], correct_index:1 },
      ],
    },

    // ── MODULE 2 ────────────────────────────────────────────────────
    {
      order:        2,
      title:        'Ethics & Consumer Protection',
      credit_hours: 2,
      pdf_url:      MODULE_PDF,
      sections: [
        '2.1 Ethical Standards for Mortgage Loan Originators',
        '2.2 Equal Credit Opportunity Act (ECOA)',
        '2.3 Fair Housing Act & Anti-Discrimination Obligations',
        '2.4 Home Mortgage Disclosure Act (HMDA)',
        '2.5 Fraud Prevention and Ethical Red Flags',
        '2.6 Conflicts of Interest and Disclosure',
        'Module 2 Summary',
        'Case Study: Conflict and Compensation',
      ],
      quiz: [
        // Answer key: 1B 2D 3B 4A 5B
        { number:1, question:'What is the primary responsibility of a Mortgage Loan Originator (MLO)?', options:['To close loans quickly','To ensure compliance with all relevant mortgage laws','To ensure borrowers get the lowest possible interest rate','To make the maximum commission'], correct_index:1 },
        { number:2, question:'What does the Dodd-Frank Act prohibit regarding loan originator compensation?', options:['Payment based on loan interest rates','Dual compensation from both the borrower and the lender','Higher compensation for riskier loans','All of the above'], correct_index:3 },
        { number:3, question:'What is the duty of a Mortgage Loan Originator (MLO) when facing conflicts of interest?', options:['To avoid all business relationships','To disclose any conflict clearly and promptly','To ignore minor conflicts as they don\'t affect decisions','To rely solely on the employer\'s guidance'], correct_index:1 },
        { number:4, question:'Which of the following is a common form of mortgage fraud that MLOs must prevent?', options:['Inaccurate income reporting by borrowers','Borrower refusal to sign the Loan Estimate','Failure to provide Closing Disclosure','Offering discounts on closing costs'], correct_index:0 },
        { number:5, question:'What is the potential consequence for a Mortgage Loan Originator if they violate ethical guidelines?', options:['Increased market share','Civil penalties and license suspension','Higher commissions','No consequences'], correct_index:1 },
      ],
    },

    // ── MODULE 3 ────────────────────────────────────────────────────
    {
      order:        3,
      title:        'Non-Traditional Mortgage Lending',
      credit_hours: 3,
      pdf_url:      MODULE_PDF,
      sections: [
        '3.1 Overview of Non-Traditional Mortgage Products',
        '3.2 Interest-Only Mortgages — Features and Risks',
        '3.3 Alternative Income Documentation Loans',
        '3.4 SAFE Act Requirements for Non-Traditional Lending',
        '3.5 Consumer Risks and Suitability Considerations',
        'Module 3 Summary',
        'Case Study: The ARM Adjustment',
      ],
      quiz: [
        // Answer key: 1B 2B 3B 4B 5B
        { number:1, question:'Which of the following is a non-traditional mortgage product?', options:['Fixed-rate mortgage','Interest-only mortgage','Fully amortizing adjustable-rate mortgage','Conventional loan'], correct_index:1 },
        { number:2, question:'What is the primary risk associated with interest-only mortgages?', options:['Fixed monthly payments','Payment shock after the interest-only period ends','High upfront fees','No interest rate changes'], correct_index:1 },
        { number:3, question:'How do non-traditional mortgage products typically qualify borrowers?', options:['Strictly by W-2 income','Using alternative income documentation like bank statements','Based solely on credit score','With no documentation needed'], correct_index:1 },
        { number:4, question:'What does the SAFE Act require for mortgage loan originators involved in non-traditional lending?', options:['A minimum credit score of 700','Enhanced licensing and training','Higher commissions for riskier loans','No additional requirements compared to traditional lending'], correct_index:1 },
        { number:5, question:'Which of the following is a significant consumer risk with non-traditional mortgage products?', options:['Predictable payments throughout the loan','Lack of transparency in loan terms','Long-term cost savings','Immediate full repayment of the loan balance'], correct_index:1 },
      ],
    },

    // ── MODULE 4 ────────────────────────────────────────────────────
    {
      order:        4,
      title:        'Mortgage Origination',
      credit_hours: 2,
      pdf_url:      MODULE_PDF,
      sections: [
        '4.1 The Loan Application Process',
        '4.2 Loan Estimate and Required Disclosures',
        '4.3 Underwriting — Role of the MLO',
        '4.4 Automated Underwriting Systems (AUS)',
        '4.5 Closing Disclosure and Pre-Closing Requirements',
        'Module 4 Summary',
        'Case Study: The Loan Origination Process',
      ],
      quiz: [
        // Answer key: 1B 2B 3C 4B 5B
        { number:1, question:'Which document must be provided within three business days of receiving a loan application?', options:['Closing Disclosure','Loan Estimate','Credit Report','Mortgage Deed'], correct_index:1 },
        { number:2, question:'What does the Loan Estimate (LE) include?', options:['Interest rate only','Loan terms, projected payments, and closing costs','Borrower\'s credit score','Property details'], correct_index:1 },
        { number:3, question:'What is the role of the Mortgage Loan Originator (MLO) in underwriting?', options:['Approve loans','Assess credit risk only','Submit applications to underwriters and address conditions','Perform final loan closings'], correct_index:2 },
        { number:4, question:'What is the primary function of Automated Underwriting Systems (AUS)?', options:['Provide final loan approval','Assess risk based on borrower data and generate loan recommendations','Evaluate the property for loan approval','Set loan interest rates'], correct_index:1 },
        { number:5, question:'Which document must be provided to consumers three business days before closing?', options:['Loan Estimate','Closing Disclosure','Pre-Approval Letter','Credit Report'], correct_index:1 },
      ],
    },

    // ── MODULE 5: New York State Law and Regulations ────────────────
    {
      order:        5,
      title:        'New York State Law and Regulations',
      credit_hours: 1,
      pdf_url:      MODULE_PDF,
      sections: [
        '5.1 Overview of New York State Regulatory Authority (DFS)',
        '5.2 New York State Continuing Education Requirements',
        '5.3 Mortgage Advertising and Disclosure Requirements',
        '5.4 Enforcement, Penalties, and Disciplinary Actions',
        '5.5 State Consumer Protection Provisions',
        'Module 5 Summary',
        'Case Study: The Unqualified Loan Processor',
      ],
      quiz: [
        // Answer key: 1B 2C 3C 4B 5B
        { number:1, question:'Which agency is primarily responsible for licensing, supervision, and enforcement of mortgage lenders and mortgage loan originators in New York State?', options:['New York State Attorney General\'s Office','New York State Department of Financial Services','U.S. Department of Housing and Urban Development','Nationwide Multistate Licensing System (NMLS)'], correct_index:1 },
        { number:2, question:'Which of the following best describes New York\'s state-specific continuing education (CE) requirement for mortgage loan originators?', options:['State-specific CE may be carried forward if excess hours are earned','Any mortgage-related training may satisfy state CE requirements','New York-specific CE must be completed each renewal period and may not be substituted','State CE is optional if federal CE requirements are met'], correct_index:2 },
        { number:3, question:'Under New York mortgage law, which action may result in administrative enforcement or license revocation?', options:['Providing borrowers with accurate loan disclosures','Advertising mortgage services using truthful information','Allowing unlicensed individuals to perform mortgage origination activities','Maintaining required loan records for regulatory review'], correct_index:2 },
        { number:4, question:'Mortgage advertisements in New York must include which of the following?', options:['The personal phone number of the mortgage loan originator','The licensed mortgage company name and NMLS Unique Identifier','A complete list of all available loan products','Written approval from the DFS before publication'], correct_index:1 },
        { number:5, question:'What may the New York State Department of Financial Services order in response to violations of mortgage law?', options:['Criminal prosecution only','Civil penalties and restitution to affected borrowers','Mandatory referral to federal authorities','Automatic license reinstatement after a fine is paid'], correct_index:1 },
      ],
    },

    // ── MODULE 6: FINAL - NEW YORK ───────────────────────────────────
    // PDF-only lesson — NO quiz
    // Student reads the Final NY PDF, then proceeds directly to the Final Exam
    // On failure: Final Exam retries with random 35 from QUESTION_BANK_70
    {
      order:        6,
      title:        'FINAL - NEW YORK',
      credit_hours: 0,
      pdf_url:      FINAL_NY_PDF,
      sections: [
        '11-HOUR NY SAFE COMPREHENSIVE: ANNUAL MLO FUNDAMENTALS',
        'New York State-Specific Law & DFS Regulations — Full Review',
        'Review all five modules before attempting the Final Exam',
        'Covers: Federal Law · Ethics · Non-Traditional Lending · Mortgage Origination · NY State Law',
      ],
      quiz: [], // ← NO checkpoint — student proceeds directly to Final Exam
    },

  ],

  // ── OFFICIAL FINAL EXAM ─────────────────────────────────────────────
  //
  // RETRY LOGIC (implement in your exam controller):
  //   attempt === 1  → serve FINAL_EXAM_35 (official 35-question set)
  //   attempt >= 2   → randomly shuffle QUESTION_BANK_70, slice first 35
  //                    → each retry gets a different random 35 from the bank
  //
  // The question_bank field stores the 70 questions for backend retry logic.
  // ───────────────────────────────────────────────────────────────────
  final_exam: {
    title:              '11-HOUR NY SAFE COMPREHENSIVE: ANNUAL MLO FUNDAMENTALS — Final Exam',
    passing_score:      70,
    time_limit_minutes: 90,
    questions:          FINAL_EXAM_35,       // first attempt — official 35
    question_bank:      QUESTION_BANK_70,    // retries — random 35 drawn from here
  },
};

// ─────────────────────────────────────────────────────────────────────
const seed = async () => {
  try {
    await mongoose.connect(process.env.MONGO_URI);
    console.log('✅ MongoDB connected');

    await Course.deleteOne({ nmls_course_id: 'CE-NY-SAFE-11HR' });
    console.log('🗑️  Removed existing NY SAFE course (if any)');

    const course = await Course.create(courseData);

    console.log(`\n✅ Course inserted: ${course.title}`);
    console.log(`   ID: ${course._id}`);
    console.log('\n📋 Full Course Structure:');
    console.log('   ─────────────────────────────────────────');
    course.modules.forEach((m, i) => {
      const lessonStep = (i * 2) + 1;
      const hasQuiz = m.quiz && m.quiz.length > 0;
      console.log(`   Step ${lessonStep.toString().padStart(2)}  📄 Lesson     — ${m.title} (${m.credit_hours} hr)`);
      if (hasQuiz) {
        console.log(`   Step ${(lessonStep+1).toString().padStart(2)}  📋 Checkpoint — ${m.quiz.length} questions`);
      } else {
        console.log(`   Step ${(lessonStep+1).toString().padStart(2)}  ⏭️  No Checkpoint — proceeds to Final Exam`);
      }
    });
    const finalStep = (course.modules.length * 2) + 1;
    console.log(`   Step ${finalStep.toString().padStart(2)} 🏆 Final Exam`);
    console.log(`           • Attempt 1:  ${FINAL_EXAM_35.length} official questions`);
    console.log(`           • Retry 2+:   35 random questions drawn from ${QUESTION_BANK_70.length}-question bank`);
    console.log('   ─────────────────────────────────────────');
    console.log('\n📝 Official Answer Key (Attempt 1):');
    console.log('   Q1:A  Q2:B  Q3:B  Q4:A  Q5:B  Q6:D  Q7:D  Q8:A  Q9:D  Q10:B');
    console.log('   Q11:A Q12:B Q13:D Q14:A Q15:D Q16:B Q17:B Q18:A Q19:D Q20:D');
    console.log('   Q21:B Q22:B Q23:A Q24:A Q25:B Q26:B Q27:B Q28:C Q29:A Q30:A');
    console.log('   Q31:B Q32:B Q33:D Q34:B Q35:D');
    console.log('\n⚙️  Retry implementation needed in your exam controller:');
    console.log('   if (attempt === 1) serve final_exam.questions');
    console.log('   if (attempt >= 2)  shuffle final_exam.question_bank, slice(0, 35)');
    console.log('\n🎯 Test at: /courses/CE-NY-SAFE-11HR/learn');
    console.log('\n✅ Done!');

    await mongoose.disconnect();
    process.exit(0);
  } catch (err) {
    console.error('❌ Seed failed:', err.message);
    console.error(err);
    process.exit(1);
  }
};

seed();