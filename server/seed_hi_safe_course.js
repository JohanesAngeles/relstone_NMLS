/**
 * seed_hi_safe_course.js
 * Drop this in: relstone_NMLS/server/
 * Run with:    node seed_hi_safe_course.js
 *
 * COURSE STRUCTURE:
 *   Step 1  📄 Lesson     — Module 1: Federal Mortgage-Related Laws
 *   Step 2  📋 Checkpoint — Module 1 Quiz (5 questions)
 *   Step 3  📄 Lesson     — Module 2: Ethical Guidelines for MLOs
 *   Step 4  📋 Checkpoint — Module 2 Quiz (5 questions)
 *   Step 5  📄 Lesson     — Module 3: Non-Traditional Mortgage Lending
 *   Step 6  📋 Checkpoint — Module 3 Quiz (5 questions)
 *   Step 7  📄 Lesson     — Module 4: Hawaii State Law and Regulations
 *   Step 8  📋 Checkpoint — Module 4 Quiz (5 questions)
 *   Step 9  📄 Lesson     — FINAL - HAWAII (PDF review, no quiz)
 *   Step 10 🏆 Final Exam — Attempt 1: official 35 Qs | Retry: random 35 from 70-Q bank
 *
 * RETRY LOGIC:
 *   - First attempt:  serve FINAL_EXAM_35 (official verified set)
 *   - On failure:     shuffle QUESTION_BANK_70, slice(0, 35) — new set each retry
 */

const mongoose = require('mongoose');
const dotenv   = require('dotenv');
dotenv.config();

const Course = require('./models/Course');

// ── PDF URLs ──────────────────────────────────────────────────────────
const HI_TEXTBOOK_PDF = 'https://www.dropbox.com/scl/fi/962aawzbago5qd26sqkch/8-Hour-HI-SAFE-Comprehensive-Annual-MLO-Fundamentals.pdf?rlkey=vok7z92nqvtq40v4kaemg8jr2&st=muhc0que&raw=1';
const HI_FINAL_PDF    = 'https://www.dropbox.com/scl/fi/yanz5gzvhox1uc6ii490m/FINAL-HAWAII.pdf?rlkey=4qk17ubtf2tetxdgft6xyoh4g&st=qx2nlfa1&raw=1';

// ── 70-Question Retry Bank ────────────────────────────────────────────
const QUESTION_BANK_70 = [
  { number:1,  question:'What is the primary purpose of TILA?', options:['To extend more credit','To make credit easier to obtain','To promote the informed use of consumer credit','To better qualify borrowers'], correct_index:2 },
  { number:2,  question:'Which federal law prohibits discrimination based on race, color, religion, sex, marital status, and national origin?', options:['Equal Credit Opportunity Act (ECOA)','Real Estate Settlement Procedures Act (RESPA)','Fair Housing Act (FHA)','Home Mortgage Disclosure Act (HMDA)'], correct_index:2 },
  { number:3,  question:'What is the minimum down payment for an FHA loan?', options:['1 percent','3.5 percent','10 percent','20 percent'], correct_index:1 },
  { number:4,  question:'Which of the following is prohibited under RESPA Section 8?', options:['Offering gifts to borrowers','Kickbacks for referrals','Providing cash discounts','Providing free title insurance'], correct_index:1 },
  { number:5,  question:'Under the SAFE Act, how many hours of continuing education are required annually for MLOs?', options:['8 hours','12 hours','16 hours','20 hours'], correct_index:0 },
  { number:6,  question:'In a non-traditional mortgage, what feature allows lower payments in the initial years?', options:['Interest-only payment option','Fixed-rate loan','Fully amortizing loan','Negative amortization'], correct_index:0 },
  { number:7,  question:'Who is responsible for issuing credit to all applicants without discrimination under ECOA?', options:['The lender','The borrower','The mortgage broker','The federal government'], correct_index:0 },
  { number:8,  question:'According to Hawaii state law, which is a prohibited act for mortgage loan originators?', options:['Charging unreasonably high fees','Offering educational courses','Offering competitive rates','Offering free property assessments'], correct_index:0 },
  { number:9,  question:'Which law establishes the legal framework governing mortgage loan origination and servicing in Hawaii?', options:['HRS Chapter 454M','ECOA','TILA','RESPA'], correct_index:0 },
  { number:10, question:'What is a common risk associated with non-traditional mortgage products?', options:['Payment shock','Full amortization','Predictable payments','Fixed interest rates'], correct_index:0 },
  { number:11, question:'Which of these is NOT required as part of an MLO application in Hawaii?', options:['Fingerprints','Proof of college degree','Criminal background check','Credit report'], correct_index:1 },
  { number:12, question:'Which document outlines loan terms including the APR, loan fees, and estimated monthly payments?', options:['Closing Disclosure','Loan Estimate','Mortgage Application','HUD-1'], correct_index:1 },
  { number:13, question:'Which mortgage product allows the borrower to make only interest payments for a specified period?', options:['Adjustable-Rate Mortgage (ARM)','Interest-Only Mortgage','Fixed-rate mortgage','Conventional loan'], correct_index:1 },
  { number:14, question:'In Hawaii, what is the penalty for an MLO conducting business with an expired license?', options:['Cease and desist orders','Civil fines','License suspension','All of the above'], correct_index:3 },
  { number:15, question:'Which of the following best describes the SAFE Act?', options:['It provides tax incentives for mortgage lenders','It regulates the mortgage industry in California','It sets minimum standards for mortgage loan originator licensing','It regulates real estate brokers'], correct_index:2 },
  { number:16, question:'Which is a key feature of a non-traditional adjustable-rate mortgage (ARM)?', options:['Fixed interest rate','Payments increase over time','Full amortization from the start','No interest payments'], correct_index:1 },
  { number:17, question:'According to Hawaii law, which action requires the MLO to disclose information to the consumer?', options:['Providing a Loan Estimate','Offering a discount for prompt payment','Recommending the highest rate loan','Offering unregulated services'], correct_index:0 },
  { number:18, question:'What does the Fair Housing Act prohibit in the context of mortgage lending?', options:['Steering borrowers to higher-cost loans','Charging lower rates to certain groups','Requiring home inspections for all loans','Offering higher fees based on income'], correct_index:0 },
  { number:19, question:'Under the SAFE Act, what must mortgage professionals complete annually?', options:['Pre-licensing courses','Criminal background checks','Continuing education','Homeownership counseling'], correct_index:2 },
  { number:20, question:'What must be disclosed under RESPA Section 8 for affiliated business arrangements?', options:['The ownership interest','The relationship between the parties','The fees paid','All of the above'], correct_index:3 },
  { number:21, question:'Which is a characteristic of an interest-only mortgage loan?', options:['Payments only cover interest for a period','The principal is paid down gradually','The loan is fully amortizing','It has a fixed rate for the full term'], correct_index:0 },
  { number:22, question:'Who is responsible for ensuring that an MLO license is renewed in Hawaii?', options:['The MLO themselves','The employer','The Division of Financial Institutions','The lender'], correct_index:0 },
  { number:23, question:'What is the primary benefit of non-traditional mortgage products?', options:['Low interest rates','Increased access to credit for certain borrowers','Fixed interest payments','No documentation required'], correct_index:1 },
  { number:24, question:'Which document must a lender provide outlining final mortgage terms, including changes from the Loan Estimate?', options:['Loan Estimate','Closing Disclosure','Truth in Lending Disclosure','Pre-Qualification Letter'], correct_index:1 },
  { number:25, question:'Which of the following is required to be disclosed under TILA regarding mortgage loans?', options:['The APR','The loan amount','The monthly payment','All of the above'], correct_index:3 },
  { number:26, question:'When is a Loan Estimate required to be provided to the borrower?', options:['At least 3 days after the application','At least 7 days before the closing','Within 24 hours of receiving the application','At the time of signing'], correct_index:0 },
  { number:27, question:'What is a key difference between traditional and non-traditional mortgages?', options:['Traditional mortgages always have fixed rates','Non-traditional mortgages have flexible repayment terms','Non-traditional mortgages have lower interest rates','Traditional mortgages are always for home purchases'], correct_index:1 },
  { number:28, question:'Which of the following can result in disciplinary action for MLOs in Hawaii?', options:['Misleading advertising','Charging unauthorized fees','Failing to complete continuing education','All of the above'], correct_index:3 },
  { number:29, question:'What should a mortgage professional do if they suspect fraud during the loan process?', options:['Ignore it and proceed','Report it to the compliance department','Try to fix it internally','Continue processing the loan'], correct_index:1 },
  { number:30, question:'Which of the following is a requirement under the SAFE Act for MLOs?', options:['Completion of 20 hours of pre-licensing education','Criminal background check','Passing a licensing exam','All of the above'], correct_index:3 },
  { number:31, question:'Which penalty can be imposed if an MLO is found operating without a valid license in Hawaii?', options:['Administrative fines','License suspension','Civil penalties','All of the above'], correct_index:3 },
  { number:32, question:'How can mortgage professionals avoid conflicts of interest in their recommendations?', options:['Provide full disclosure of affiliations','Offer higher compensation for higher-risk loans','Disclose personal financial interests','All of the above'], correct_index:0 },
  { number:33, question:"Who is responsible for ensuring compliance with RESPA's Section 8 regarding kickbacks?", options:['The consumer','The mortgage lender','The real estate agent','The broker'], correct_index:1 },
  { number:34, question:"Which of the following is NOT a prohibited act under Hawaii's mortgage lending laws?", options:['Charging unreasonably high fees','Offering competitive rates','Offering educational courses','Offering free property assessments'], correct_index:1 },
  { number:35, question:'Which federal law requires lenders to provide a Loan Estimate to borrowers within three days of application?', options:['TILA','RESPA','Dodd-Frank Act','The SAFE Act'], correct_index:0 },
  { number:36, question:"Which is the correct penalty for an MLO who fails to comply with Hawaii's mortgage advertising laws?", options:['Cease and desist order','License suspension','Civil fines','All of the above'], correct_index:3 },
  { number:37, question:'What is the role of the Hawaii Department of Financial Institutions (DFI)?', options:['Enforcing mortgage lending laws','Providing education to mortgage professionals','Supervising mortgage brokers','All of the above'], correct_index:3 },
  { number:38, question:'Which type of mortgage loan can be classified as a non-traditional mortgage?', options:['Fixed-rate mortgage','Adjustable-rate mortgage with a fixed term','Interest-only mortgage','FHA-insured mortgage'], correct_index:2 },
  { number:39, question:'Which is required for a non-traditional mortgage loan to meet federal guidelines?', options:['The loan must have a fixed interest rate','Borrowers must be fully amortizing','The loan must be suitable for the borrower\'s financial profile','The borrower must have high credit scores'], correct_index:2 },
  { number:40, question:'How often must mortgage loan originators renew their licenses in Hawaii?', options:['Annually','Every two years','Every three years','Upon request from the state'], correct_index:0 },
  { number:41, question:'Which of the following documents must be delivered to a borrower before loan closing?', options:['Loan Estimate','Closing Disclosure','Final APR','Mortgage loan application'], correct_index:1 },
  { number:42, question:"What is the penalty for violating RESPA's Section 9, which prohibits sellers from requiring a specific title insurance company?", options:['Civil fines','License suspension','Criminal penalties','All of the above'], correct_index:3 },
  { number:43, question:'What action should an MLO take if they suspect a borrower is providing false information about income or assets?', options:['Proceed with the application','Report the issue to their supervisor or compliance department','Ignore the discrepancy','Approve the loan anyway'], correct_index:1 },
  { number:44, question:'Which mortgage product typically offers lower initial payments but higher payments later on?', options:['Fixed-rate mortgage','Interest-only mortgage','Adjustable-rate mortgage (ARM)','Balloon mortgage'], correct_index:1 },
  { number:45, question:'What is the primary purpose of the Home Mortgage Disclosure Act (HMDA)?', options:['To prevent mortgage fraud','To ensure mortgage loan originators are licensed','To collect data on mortgage lending patterns to identify discriminatory practices','To ensure all applicants receive the same interest rate'], correct_index:2 },
  { number:46, question:"What must an MLO do when a borrower's credit report shows discrepancies?", options:['Ignore the issue and proceed','Report the issue and delay the loan','Ensure the borrower corrects the information and provide accurate documentation','Proceed if the borrower insists'], correct_index:2 },
  { number:47, question:'Which is required for mortgage loan originators under the SAFE Act?', options:['To pass an annual exam','To have a college degree','To complete at least 8 hours of continuing education annually','To file a quarterly report'], correct_index:2 },
  { number:48, question:'What action is prohibited under Section 8 of RESPA?', options:['Paying for appraisals','Providing kickbacks or referral fees','Offering loan discounts','Offering free property inspections'], correct_index:1 },
  { number:49, question:'What is the function of the National Mortgage Licensing System (NMLS)?', options:['To license mortgage brokers','To provide home loan information to borrowers','To serve as the registry for mortgage loan originators','To evaluate the financial stability of mortgage companies'], correct_index:2 },
  { number:50, question:'Under TILA, how must interest rates be disclosed to borrowers?', options:['As the nominal rate','As the annual percentage rate (APR)','As the daily interest rate','As the total interest paid over the life of the loan'], correct_index:1 },
  { number:51, question:'Which of the following must be disclosed to a borrower in the Loan Estimate under TILA?', options:['The APR','The lender\'s profit margin','The number of loan officers involved','The borrower\'s credit score'], correct_index:0 },
  { number:52, question:'What is the role of the Hawaii Department of Commerce and Consumer Affairs (DCCA)?', options:['Enforcing Hawaii\'s mortgage lending laws','Administering federal mortgage law in Hawaii','Supervising real estate agents','None of the above'], correct_index:0 },
  { number:53, question:"In Hawaii, what happens if a borrower's mortgage application is denied?", options:['The lender must provide a notice of adverse action','The lender must offer a second loan at a higher rate','The lender is required to provide a refund','The borrower must pay an additional fee'], correct_index:0 },
  { number:54, question:'Which of the following is required when applying for a mortgage loan in Hawaii?', options:['Proof of employment','Proof of a college degree','Criminal background check','Proof of citizenship'], correct_index:0 },
  { number:55, question:"Under Hawaii's mortgage laws, who is responsible for ensuring a borrower receives timely disclosures?", options:['The lender','The borrower','The real estate agent','The mortgage loan originator'], correct_index:3 },
  { number:56, question:'Which mortgage product has an interest rate that adjusts periodically?', options:['Fixed-rate mortgage','Interest-only mortgage','Adjustable-rate mortgage (ARM)','Balloon mortgage'], correct_index:2 },
  { number:57, question:'What is the penalty for an MLO who fails to complete continuing education in Hawaii?', options:['Civil fines','License revocation','Suspension of activities','All of the above'], correct_index:3 },
  { number:58, question:'What type of mortgage product is suitable for borrowers expecting a short-term income increase?', options:['Fixed-rate mortgage','Interest-only mortgage','Adjustable-rate mortgage','Non-traditional adjustable-rate mortgage'], correct_index:3 },
  { number:59, question:'Which document is required within 3 business days of receiving a loan application under TRID?', options:['Closing Disclosure','Loan Estimate','Final Truth in Lending Disclosure','Pre-Qualification Letter'], correct_index:1 },
  { number:60, question:'Which of the following is an example of a non-traditional mortgage product?', options:['Fixed-rate mortgage','Interest-only mortgage','FHA-insured mortgage','VA loan'], correct_index:1 },
  { number:61, question:'What does the Dodd-Frank Act address in the mortgage industry?', options:['It sets new rules for interest rate disclosures','It restructured the mortgage industry and created the CFPB','It created the SAFE Act','It prohibits all adjustable-rate mortgages'], correct_index:1 },
  { number:62, question:'Which of the following would indicate potential occupancy fraud?', options:['The borrower intends to rent out the property','The borrower declares the property as a primary residence but does not live there','The borrower submits a large down payment','The borrower has no debt-to-income ratio'], correct_index:1 },
  { number:63, question:"Which of these would be included in an appraiser's site analysis?", options:['Topography','Gross living area','Structural design','Neighborhood conformity'], correct_index:0 },
  { number:64, question:'What is the maximum term for an FHA-insured mortgage?', options:['10 years','15 years','30 years','35 years'], correct_index:2 },
  { number:65, question:'Which agency within the DCCA administers mortgage-related regulatory functions in Hawaii?', options:['Office of Consumer Protection','Division of Financial Institutions (DFI)','Real Estate Commission','Insurance Division'], correct_index:1 },
  { number:66, question:"Hawaii's mortgage lending laws are primarily governed by which statute?", options:['HRS Chapter 467','HRS Chapter 431','HRS Chapter 454M','HRS Chapter 480'], correct_index:2 },
  { number:67, question:"Under Hawaii's 'no late CE' policy, what must an MLO do if they miss the CE deadline?", options:['Pay a late fee and continue working','Request a 30-day extension','Cease mortgage activity until reinstatement requirements are met','File a waiver with the DFI'], correct_index:2 },
  { number:68, question:'Which of the following is a prohibited advertising practice under Hawaii mortgage law?', options:['Including the NMLS ID in advertisements','Disclosing material loan terms','Using "Guaranteed Lowest Rates" without disclosing conditions','Using the company\'s licensed name in marketing'], correct_index:2 },
  { number:69, question:'What type of examination may the DFI initiate when consumer complaints indicate patterns of misconduct?', options:['Routine examination','For-cause examination','Annual audit','Self-assessment review'], correct_index:1 },
  { number:70, question:'Which of the following grounds can lead to license suspension or revocation in Hawaii?', options:['Completing CE early','Changing employers','Fraud or material misrepresentation','Voluntarily surrendering a license'], correct_index:2 },
];

// ── Official Final Exam: 35 Questions (first attempt) ─────────────────
const FINAL_EXAM_35 = [
  { number:1,  question:'What is the primary purpose of TILA?', options:['To extend more credit','To make credit easier to obtain','To promote the informed use of consumer credit','To better qualify borrowers'], correct_index:2 },
  { number:2,  question:'Which federal law prohibits discrimination based on race, color, religion, sex, marital status, and national origin?', options:['Equal Credit Opportunity Act (ECOA)','Real Estate Settlement Procedures Act (RESPA)','Fair Housing Act (FHA)','Home Mortgage Disclosure Act (HMDA)'], correct_index:2 },
  { number:3,  question:'What is the minimum down payment for an FHA loan?', options:['1 percent','3.5 percent','10 percent','20 percent'], correct_index:1 },
  { number:4,  question:'Which of the following is prohibited under RESPA Section 8?', options:['Offering gifts to borrowers','Kickbacks for referrals','Providing cash discounts','Providing free title insurance'], correct_index:1 },
  { number:5,  question:'Under the SAFE Act, how many hours of continuing education are required annually for MLOs?', options:['8 hours','12 hours','16 hours','20 hours'], correct_index:0 },
  { number:6,  question:'Which of the following best describes the SAFE Act?', options:['It provides tax incentives for mortgage lenders','It regulates the mortgage industry in California','It sets minimum standards for mortgage loan originator licensing','It regulates real estate brokers'], correct_index:2 },
  { number:7,  question:'What is the penalty for failing to complete continuing education in Hawaii?', options:['Civil fines','License revocation','Suspension of activities','All of the above'], correct_index:3 },
  { number:8,  question:'In a non-traditional mortgage, what feature allows lower payments in the initial years?', options:['Interest-only payment option','Fixed-rate loan','Fully amortizing loan','Negative amortization'], correct_index:0 },
  { number:9,  question:'Who is responsible for issuing credit to all applicants without discrimination under ECOA?', options:['The lender','The borrower','The mortgage broker','The federal government'], correct_index:0 },
  { number:10, question:'Which document outlines the terms of the loan, including the APR, loan fees, and estimated monthly payments?', options:['Closing Disclosure','Loan Estimate','Mortgage Application','HUD-1'], correct_index:0 },
  { number:11, question:'What is a common risk associated with non-traditional mortgage products?', options:['Payment shock','Full amortization','Predictable payments','Fixed interest rates'], correct_index:0 },
  { number:12, question:'According to Hawaii state law, which is a prohibited act for mortgage loan originators?', options:['Charging unreasonably high fees','Offering educational courses','Offering competitive rates','Offering free property assessments'], correct_index:0 },
  { number:13, question:'Which of these is NOT required as part of an MLO application in Hawaii?', options:['Fingerprints','Proof of college degree','Criminal background check','Credit report'], correct_index:1 },
  { number:14, question:'Which mortgage product allows the borrower to make only interest payments for a specified period?', options:['Adjustable-Rate Mortgage (ARM)','Interest-Only Mortgage','Fixed-rate mortgage','Conventional loan'], correct_index:1 },
  { number:15, question:'Which of the following best describes an interest-only mortgage?', options:['Payments only cover interest for a period','The principal is paid down gradually','The loan is fully amortizing','It has a fixed rate for the full term'], correct_index:0 },
  { number:16, question:'In Hawaii, what is the penalty for an MLO conducting business with an expired license?', options:['Cease and desist orders','Civil fines','License suspension','All of the above'], correct_index:3 },
  { number:17, question:'What must be disclosed under RESPA Section 8 for affiliated business arrangements?', options:['The ownership interest','The relationship between the parties','The fees paid','All of the above'], correct_index:3 },
  { number:18, question:'Which law establishes the legal framework governing mortgage loan origination and servicing in Hawaii?', options:['HRS Chapter 454M','ECOA','TILA','RESPA'], correct_index:0 },
  { number:19, question:'How often must mortgage loan originators renew their licenses in Hawaii?', options:['Annually','Every two years','Every three years','Upon request from the state'], correct_index:0 },
  { number:20, question:'Which of the following can result in disciplinary action for MLOs in Hawaii?', options:['Misleading advertising','Charging unauthorized fees','Failing to complete continuing education','All of the above'], correct_index:3 },
  { number:21, question:'According to Hawaii law, which action requires the MLO to disclose information to the consumer?', options:['Providing a Loan Estimate','Offering a discount for prompt payment','Recommending the highest rate loan','Offering unregulated services'], correct_index:0 },
  { number:22, question:'Which of the following is required when applying for a mortgage loan in Hawaii?', options:['Proof of employment','Proof of a college degree','Criminal background check','Proof of citizenship'], correct_index:0 },
  { number:23, question:"In Hawaii, what happens if a borrower's mortgage application is denied?", options:['The lender must provide a notice of adverse action','The lender must offer a second loan at a higher rate','The lender is required to provide a refund','The borrower must pay an additional fee'], correct_index:0 },
  { number:24, question:'What is the penalty for failing to complete continuing education in Hawaii?', options:['Civil fines','License revocation','Suspension of activities','All of the above'], correct_index:3 },
  { number:25, question:'Which document must a lender provide outlining final mortgage terms, including changes from the Loan Estimate?', options:['Loan Estimate','Closing Disclosure','Truth in Lending Disclosure','Pre-Qualification Letter'], correct_index:1 },
  { number:26, question:'Which is a key difference between traditional and non-traditional mortgages?', options:['Traditional mortgages always have fixed rates','Non-traditional mortgages have flexible repayment terms','Non-traditional mortgages have lower interest rates','Traditional mortgages are always for home purchases'], correct_index:1 },
  { number:27, question:'Which of the following must be disclosed to a borrower in the Loan Estimate under TILA?', options:['The APR','The lender\'s profit margin','The number of loan officers involved','The borrower\'s credit score'], correct_index:0 },
  { number:28, question:"Who is responsible for ensuring compliance with RESPA's Section 8 regarding kickbacks?", options:['The consumer','The mortgage lender','The real estate agent','The broker'], correct_index:1 },
  { number:29, question:'Which mortgage product allows only interest payments for a specified period?', options:['Adjustable-Rate Mortgage (ARM)','Interest-Only Mortgage','Fixed-rate mortgage','Conventional loan'], correct_index:1 },
  { number:30, question:'What is the penalty for violating RESPA guidelines on kickbacks?', options:['Civil fines','Criminal penalties','License suspension','All of the above'], correct_index:0 },
  { number:31, question:'What must an MLO do to maintain their license in Hawaii?', options:['Complete continuing education','Pay annual fees','Maintain records for 5 years','All of the above'], correct_index:3 },
  { number:32, question:'Which agency within the DCCA administers mortgage-related regulatory functions in Hawaii?', options:['Office of Consumer Protection','Division of Financial Institutions (DFI)','Real Estate Commission','Insurance Division'], correct_index:1 },
  { number:33, question:"Hawaii's mortgage lending laws are primarily governed by which statute?", options:['HRS Chapter 467','HRS Chapter 431','HRS Chapter 454M','HRS Chapter 480'], correct_index:2 },
  { number:34, question:"Under Hawaii's 'no late CE' policy, what must an MLO do if they miss the CE deadline?", options:['Pay a late fee and continue working','Request a 30-day extension','Cease mortgage activity until reinstatement requirements are met','File a waiver with the DFI'], correct_index:2 },
  { number:35, question:'Which grounds can lead to license suspension or revocation in Hawaii?', options:['Completing CE early','Changing employers','Fraud or material misrepresentation','Voluntarily surrendering a license'], correct_index:2 },
];

// ─────────────────────────────────────────────────────────────────────
const courseData = {
  title:           '8-HOUR HI SAFE COMPREHENSIVE: ANNUAL MLO FUNDAMENTALS',
  nmls_course_id:  'CE-HI-SAFE-8HR',
  type:            'CE',
  credit_hours:    8,
  description:     'This 8-hour SAFE Act continuing education course covers federal mortgage law (3 hrs), ethics for MLOs (2 hrs), non-traditional mortgage lending (2 hrs), and Hawaii state law & regulations (1 hr). Required annually for Hawaii-licensed MLOs.',
  price:           99.00,
  states_approved: ['HI'],
  has_textbook:    false,
  textbook_price:  0,
  is_active:       true,
  pdf_url:         HI_TEXTBOOK_PDF,

  modules: [

    // ── MODULE 1 ────────────────────────────────────────────────────
    {
      order: 1, title: 'Federal Mortgage-Related Laws', credit_hours: 3,
      pdf_url: HI_TEXTBOOK_PDF, show_pdf_before_quiz: false,
      sections: ['1.1 Truth in Lending Act (TILA) & TRID','1.2 Real Estate Settlement Procedures Act (RESPA)','1.3 Equal Credit Opportunity Act (ECOA)','1.4 Fair Housing Act (FHA)','1.5 Home Mortgage Disclosure Act (HMDA)','1.6 SAFE Act Overview','Module 1 Summary'],
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
      order: 2, title: 'Ethical Guidelines for Mortgage Loan Originators', credit_hours: 2,
      pdf_url: HI_TEXTBOOK_PDF, show_pdf_before_quiz: false,
      sections: ['2.1 Ethical Standards in Mortgage Lending','2.2 Conflicts of Interest and Disclosure','2.3 Fraud Prevention and Ethical Red Flags','Module 2 Summary'],
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
      order: 3, title: 'Non-Traditional Mortgage Lending', credit_hours: 2,
      pdf_url: HI_TEXTBOOK_PDF, show_pdf_before_quiz: false,
      sections: ['3.1 Overview of Non-Traditional Mortgage Products','3.2 Risks to Consumers and Lenders','3.3 Compliance and Suitability Considerations','Module 3 Summary'],
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
      order: 4, title: 'Hawaii State Law and Regulations', credit_hours: 1,
      pdf_url: HI_TEXTBOOK_PDF, show_pdf_before_quiz: false,
      sections: ['4.1 Overview of State Regulatory Authority (DCCA/DFI)','4.2 HRS Chapter 454M — Mortgage Lending Laws','4.3 Licensing Requirements and Renewal','4.4 Enforcement, Penalties, and Disciplinary Actions','4.5 Continuing Education — No Late CE Policy','4.6 Advertising Compliance','Module 4 Summary'],
      quiz: [
        // Answer key: 1B 2B 3B 4C 5C
        { number:1, question:'Which agency is responsible for licensing and regulating mortgage loan originators in Hawaii?', options:['Hawaii Office of Consumer Protection','Hawaii Department of Commerce and Consumer Affairs, Division of Financial Institutions','Hawaii Real Estate Commission','Hawaii Attorney General\'s Office'], correct_index:1 },
        { number:2, question:'What statute primarily governs mortgage loan origination and servicing in Hawaii?', options:['HRS Chapter 480','HRS Chapter 454M','HRS Chapter 431','HRS Chapter 467'], correct_index:1 },
        { number:3, question:'Which of the following may result in license suspension or revocation in Hawaii?', options:['Completing CE early','Fraud or material misrepresentation','Changing employers','Voluntarily surrendering a license'], correct_index:1 },
        { number:4, question:"Under Hawaii's 'no late CE' policy, what happens if an MLO fails to complete required continuing education before the renewal deadline?", options:['The license automatically renews with a late fee','The licensee may continue originating loans for 30 days','The license cannot be renewed and mortgage activity must cease until reinstated','Only a warning letter is issued'], correct_index:2 },
        { number:5, question:'Which of the following advertising practices would violate Hawaii mortgage law?', options:['Including the NMLS identification number in advertisements','Clearly disclosing material loan terms and conditions','Advertising "Guaranteed Lowest Rates" without disclosing conditions','Using the company\'s licensed name in marketing materials'], correct_index:2 },
      ],
    },

    // ── MODULE 5: FINAL - HAWAII ─────────────────────────────────────
    // PDF-only lesson — NO quiz
    // Student reads FINAL-HAWAII.pdf then proceeds directly to Final Exam
    {
      order: 5, title: 'FINAL - HAWAII', credit_hours: 0,
      pdf_url: HI_FINAL_PDF, show_pdf_before_quiz: false,
      sections: ['8-HOUR HI SAFE COMPREHENSIVE: ANNUAL MLO FUNDAMENTALS','Hawaii State Law & DFI Regulations — Full Review','Review all four modules before attempting the Final Exam','Covers: Federal Law · Ethics · Non-Traditional Lending · HI State Law'],
      quiz: [], // ← NO checkpoint — proceeds directly to Final Exam
    },

  ],

  // ── OFFICIAL FINAL EXAM ─────────────────────────────────────────────
  // RETRY LOGIC (implement in your exam controller):
  //   attempt === 1  → serve FINAL_EXAM_35 (official 35-question set)
  //   attempt >= 2   → shuffle QUESTION_BANK_70, slice(0, 35) — new set each time
  final_exam: {
    title:              '8-HOUR HI SAFE COMPREHENSIVE: ANNUAL MLO FUNDAMENTALS — Final Exam',
    passing_score:      70,
    time_limit_minutes: 90,
    questions:          FINAL_EXAM_35,     // first attempt — official 35
    question_bank:      QUESTION_BANK_70,  // retries — random 35 drawn from here
  },
};

// ─────────────────────────────────────────────────────────────────────
const seed = async () => {
  try {
    await mongoose.connect(process.env.MONGO_URI);
    console.log('✅ MongoDB connected');

    await Course.deleteOne({ nmls_course_id: 'CE-HI-SAFE-8HR' });
    console.log('🗑️  Removed existing HI SAFE course (if any)');

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
    console.log('\n⚙️  Retry implementation in your exam controller:');
    console.log('   if (attempt === 1) serve final_exam.questions');
    console.log('   if (attempt >= 2)  shuffle final_exam.question_bank, slice(0, 35)');
    console.log('\n🎯 Test at: /courses/CE-HI-SAFE-8HR/learn');
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