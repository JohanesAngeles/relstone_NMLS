/**
 * seed_tx_occc_course.js
 * Drop this in: relstone_NMLS/server/seeders/
 * Run with:    node seeders/seed_tx_occc_course.js   (from the /server directory)
 *
 * COURSE STRUCTURE:
 *   Step 1  📄 Lesson     — Module 1: Federal Mortgage-Related Laws
 *   Step 2  📋 Checkpoint — Module 1 Quiz (5 questions)
 *   Step 3  📄 Lesson     — Module 2: Ethical Guidelines for MLOs
 *   Step 4  📋 Checkpoint — Module 2 Quiz (5 questions)
 *   Step 5  📄 Lesson     — Module 3: Non-Traditional Mortgage Lending
 *   Step 6  📋 Checkpoint — Module 3 Quiz (5 questions)
 *   Step 7  📄 Lesson     — Module 4: Mortgage Origination
 *   Step 8  📋 Checkpoint — Module 4 Quiz (5 questions)
 *   Step 9  🏆 Final Exam — Attempt 1: official 35 Qs | Retry: random 35 from 70-Q bank
 *
 * RETRY LOGIC:
 *   - First attempt:  serve FINAL_EXAM_35 (official verified set)
 *   - On failure:     shuffle QUESTION_BANK_70, slice(0, 35) — new set each retry
 */

const mongoose = require('mongoose');
const dotenv   = require('dotenv');
const path     = require('path');
dotenv.config({ path: path.resolve(__dirname, '../.env') });

const Course = require('../models/Course');

// ── PDF URL ───────────────────────────────────────────────────────────
const TX_TEXTBOOK_PDF = 'https://www.dropbox.com/scl/fi/q6kdqdor2n48dmjbsywdf/8-Hour-SAFE-Comprehensive-Mortgage-Loan-Originator.pdf?rlkey=qoc23azp2mqly2b6xhyc70te8&st=3fqe6voz&raw=1';

// ── 70-Question Retry Bank ────────────────────────────────────────────
// Answer key: 1C 2C 3A 4B 5B 6B 7B 8B 9B 10B 11B 12B 13B 14B 15B
//             16B 17C 18B 19B 20B 21B 22B 23B 24A 25C 26B 27B 28B
//             29D 30B 31A 32A 33B 34C 35B 36A 37B 38B 39C 40B 41A
//             42C 43A 44A 45B 46B 47B 48A 49C 50B 51B 52B 53B 54B
//             55B 56C 57C 58B 59C 60B 61B 62A 63C 64B 65B 66B 67B
//             68B 69B 70B
const QUESTION_BANK_70 = [
  { number:1,  question:'What is the primary purpose of the Truth in Lending Act (TILA)?', options:['To ensure lenders offer credit to all consumers','To make credit easier to obtain','To promote the informed use of consumer credit','To better qualify borrowers'], correct_index:2 },
  { number:2,  question:'Which of these laws requires creditors to provide standardized information about loan terms, costs, and risks to consumers?', options:['Fair Housing Act','Equal Credit Opportunity Act','Truth in Lending Act','Real Estate Settlement Procedures Act'], correct_index:2 },
  { number:3,  question:'Who is responsible for enforcing the Real Estate Settlement Procedures Act (RESPA)?', options:['The Department of Housing and Urban Development','The Federal Reserve','The Consumer Financial Protection Bureau (CFPB)','The National Mortgage Licensing System'], correct_index:0 },
  { number:4,  question:'What does the Equal Credit Opportunity Act (ECOA) prohibit in mortgage lending?', options:['Discriminating based on creditworthiness','Discriminating based on race, sex, or marital status','Failing to issue a Loan Estimate','Charging higher interest rates'], correct_index:1 },
  { number:5,  question:'Which federal act requires the collection and reporting of mortgage lending data to identify discriminatory practices?', options:['The SAFE Act','Home Mortgage Disclosure Act (HMDA)','Fair Housing Act (FHA)','Truth in Lending Act (TILA)'], correct_index:1 },
  { number:6,  question:'What is the main feature of an Adjustable Rate Mortgage (ARM)?', options:['Fixed interest rate for the life of the loan','Variable interest rate that adjusts periodically','Interest-only payments','No principal repayment for the first 5 years'], correct_index:1 },
  { number:7,  question:'Under the Equal Credit Opportunity Act (ECOA), which of the following is a prohibited basis for discrimination?', options:['Age','Marital status','Sexual orientation','Creditworthiness'], correct_index:1 },
  { number:8,  question:'Which of the following best describes the SAFE Act\'s main goal?', options:['To allow mortgage brokers to set their own qualifications','To ensure mortgage loan originators are properly licensed and registered','To prevent discrimination in lending','To eliminate all consumer mortgage fees'], correct_index:1 },
  { number:9,  question:'What is a key feature of the TILA-RESPA Integrated Disclosure (TRID) rule?', options:['It eliminates all closing costs','It combines TILA and RESPA disclosures into two forms: the Loan Estimate and Closing Disclosure','It changes the way mortgages are underwritten','It mandates the use of automated underwriting systems'], correct_index:1 },
  { number:10, question:'How does the Consumer Financial Protection Bureau (CFPB) enforce the Truth in Lending Act (TILA)?', options:['By providing legal defense for lenders','By issuing regulations, conducting examinations, and enforcing compliance','By offering financial incentives to compliant lenders','By creating mortgage products'], correct_index:1 },
  { number:11, question:'What is the purpose of the Home Mortgage Disclosure Act (HMDA)?', options:['To establish underwriting rules','To provide public access to mortgage data to identify discrimination','To determine eligibility for government loans','To provide a registry of loan originators'], correct_index:1 },
  { number:12, question:'Which of the following is a key requirement under the Dodd-Frank Act?', options:['It mandates the creation of mortgage-backed securities','It created the Consumer Financial Protection Bureau (CFPB)','It allows lenders to grant loans without verifying income','It reduces the capital requirements for banks'], correct_index:1 },
  { number:13, question:'What is a key responsibility of the Mortgage Loan Originator (MLO) under RESPA?', options:['To provide a loan estimate within 5 business days','To ensure borrowers receive the Closing Disclosure three days before closing','To approve the mortgage application','To provide the borrower with a credit report'], correct_index:1 },
  { number:14, question:'What must be included in the Loan Estimate (LE)?', options:['Closing Disclosure details','Interest rate, monthly payment, and costs at closing','Loan\'s credit history','Borrower\'s credit score'], correct_index:1 },
  { number:15, question:'According to the Truth in Lending Act (TILA), which of the following disclosures must be provided to the borrower?', options:['Total amount paid for the loan','Loan repayment schedule','APR and finance charges','Tax deductions for interest payments'], correct_index:2 },
  { number:16, question:'What does the Fair Housing Act (FHA) primarily prohibit?', options:['Discrimination based on race in mortgage lending','Inaccurate credit reporting','Loan origination fraud','Discrimination in real estate advertising'], correct_index:0 },
  { number:17, question:'What does the Equal Credit Opportunity Act (ECOA) protect consumers against?', options:['Unfair interest rates','Discrimination based on race, sex, and marital status','High closing costs','Unclear loan disclosures'], correct_index:1 },
  { number:18, question:'Which of the following is a prohibited practice under RESPA\'s Section 8?', options:['Offering mortgage insurance','Providing a referral fee for settlement services','Charging a late fee on loans','Disclosing the APR'], correct_index:1 },
  { number:19, question:'What is the main role of the Consumer Financial Protection Bureau (CFPB)?', options:['To regulate the mortgage interest rate','To promote consumer protection in financial markets','To license mortgage originators','To administer the FHA insurance program'], correct_index:1 },
  { number:20, question:'What does the SAFE Act require for mortgage loan originators?', options:['A written financial statement','A background check and fingerprinting','The approval of a loan application','A loan origination fee'], correct_index:1 },
  { number:21, question:'What is the primary purpose of the National Mortgage Licensing System (NMLS)?', options:['To issue loans directly to borrowers','To serve as the licensing and registration system for loan originators','To set the interest rates for mortgages','To provide mortgage funding'], correct_index:1 },
  { number:22, question:'Under the SAFE Act, what is required of mortgage loan originators to maintain their licenses?', options:['Submit biannual credit reports','Complete annual continuing education','Pay an annual licensing fee','Undergo yearly background checks'], correct_index:1 },
  { number:23, question:'What is a "qualified mortgage" under the Dodd-Frank Act?', options:['A loan with an interest rate below 10%','A loan that meets specific underwriting criteria and benefits from a presumption of compliance with the ability-to-repay rule','A loan with a 15-year term','A loan insured by the FHA'], correct_index:1 },
  { number:24, question:'What does the Home Ownership and Equity Protection Act (HOEPA) address?', options:['High-cost mortgages with excessive fees','Loan modifications for homeowners','Consumer credit counseling services','The regulation of mortgage-backed securities'], correct_index:0 },
  { number:25, question:'How does the Equal Credit Opportunity Act (ECOA) ensure fair lending practices?', options:['By setting maximum interest rates','By providing the same loan terms to all applicants','By prohibiting discrimination based on certain personal characteristics','By guaranteeing loan approval to all applicants'], correct_index:2 },
  { number:26, question:'What is the primary feature of a balloon mortgage?', options:['A fixed interest rate for the life of the loan','The entire loan balance is due in a lump sum at the end of the term','The borrower pays only interest for the life of the loan','Payments are made on a 15-year amortization schedule'], correct_index:1 },
  { number:27, question:'What is the typical role of a mortgage loan originator (MLO)?', options:['To provide mortgage funding to consumers','To ensure compliance with lending laws and advise borrowers on suitable loan options','To perform property appraisals','To underwrite mortgage applications'], correct_index:1 },
  { number:28, question:'Which regulation establishes specific consumer protections related to mortgage servicing?', options:['TILA','RESPA','SAFE Act','ECOA'], correct_index:1 },
  { number:29, question:'What is one of the key responsibilities of a loan processor?', options:['To approve loans','To manage borrower communication during underwriting','To perform credit analysis','To clear loan conditions after underwriting review'], correct_index:3 },
  { number:30, question:'What document provides the final terms and costs of a mortgage transaction?', options:['Loan Estimate','Closing Disclosure','Pre-Approval Letter','Promissory Note'], correct_index:1 },
  { number:31, question:'What must a lender provide within three business days of receiving a loan application?', options:['Loan Estimate','Closing Disclosure','Annual Percentage Rate (APR)','Loan Application Form'], correct_index:0 },
  { number:32, question:'What is the purpose of the TILA-RESPA Integrated Disclosure (TRID) rule?', options:['To combine loan disclosures under TILA and RESPA into one document','To eliminate the Loan Estimate form','To simplify the loan application process','To allow borrowers to skip disclosures'], correct_index:0 },
  { number:33, question:'What is a key characteristic of a fully amortizing mortgage?', options:['Interest-only payments for the term of the loan','Monthly payments include both principal and interest, reducing the loan balance','No principal payments for the first 10 years','A balloon payment due at the end of the term'], correct_index:1 },
  { number:34, question:'Which mortgage product typically requires a lower initial payment but may result in higher payments later?', options:['Adjustable-rate mortgage (ARM)','Fixed-rate mortgage','Interest-only mortgage','Fully amortizing mortgage'], correct_index:2 },
  { number:35, question:'What does the Home Mortgage Disclosure Act (HMDA) require lenders to report?', options:['Borrower income and employment history','Information about mortgage applications, including race, ethnicity, and loan type','The names of loan originators','The exact closing costs'], correct_index:1 },
  { number:36, question:'Which of the following is a prohibited practice under Section 8 of RESPA?', options:['Payment for services not rendered','Charging high interest rates','Providing a loan estimate','Collecting an application fee'], correct_index:0 },
  { number:37, question:'How does the Equal Credit Opportunity Act (ECOA) enforce fair lending practices?', options:['By requiring loan originators to provide a credit score to the borrower','By prohibiting discrimination based on certain characteristics, such as race and sex','By mandating specific loan terms','By ensuring interest rates are the same for all borrowers'], correct_index:1 },
  { number:38, question:'What type of loan allows for principal payments to be deferred, increasing the loan balance?', options:['Fixed-rate mortgage','Negative amortization loan','Interest-only loan','Adjustable-rate mortgage'], correct_index:1 },
  { number:39, question:'What is the main benefit of using a non-traditional mortgage product for self-employed borrowers?', options:['They offer lower interest rates','They require fewer documents and no credit check','They use alternative methods to verify income, such as bank statements','They have no closing costs'], correct_index:2 },
  { number:40, question:'What is the maximum allowable debt-to-income ratio (DTI) for a General Qualified Mortgage (QM)?', options:['40%','43%','50%','30%'], correct_index:1 },
  { number:41, question:'What is a key feature of a Payment Option ARM?', options:['It allows borrowers to choose from multiple payment options','It locks in a fixed interest rate for the loan term','The principal is paid off in full by the end of the term','It requires a down payment of 20%'], correct_index:0 },
  { number:42, question:'What type of fraud occurs when a borrower misrepresents their income to qualify for a mortgage?', options:['Appraisal fraud','Occupancy fraud','Income fraud','Asset fraud'], correct_index:2 },
  { number:43, question:'What does the SAFE Act require for mortgage loan originators (MLOs) to be eligible for licensing?', options:['They must complete pre-licensing education, pass a written exam, and submit to background checks','They must meet a minimum credit score','They must complete 12 months of on-the-job training','They must pass an industry-specific financial exam'], correct_index:0 },
  { number:44, question:'What does the TILA-RESPA Integrated Disclosure (TRID) rule combine?', options:['Loan Estimate and Closing Disclosure','Annual Percentage Rate and Finance Charge','Pre-approval letter and loan origination fee','Interest rate and monthly payment breakdown'], correct_index:0 },
  { number:45, question:'Which of these is considered a conflict of interest in mortgage lending?', options:['Recommending a product that meets the borrower\'s needs','Referring a borrower to an affiliated service provider without disclosure','Offering multiple mortgage products with the same terms','Educating the borrower about various loan options'], correct_index:1 },
  { number:46, question:'What is the main objective of the Fair Housing Act (FHA)?', options:['To regulate interest rates in mortgage lending','To ensure equal housing opportunities and prohibit discrimination','To promote adjustable-rate mortgages','To protect mortgage brokers from unfair competition'], correct_index:1 },
  { number:47, question:'What is the most significant risk associated with negative amortization loans?', options:['Lower monthly payments','Loan balance increases even though payments are made','Fixed monthly payments','Payment stability over time'], correct_index:1 },
  { number:48, question:'What must an MLO do if a loan estimate is revised after a rate change?', options:['Provide a new Loan Estimate and restart the waiting period','Proceed to closing without changes','Provide only a Closing Disclosure','Adjust the loan interest rate retroactively'], correct_index:0 },
  { number:49, question:'What does the National Mortgage Licensing System (NMLS) track for mortgage loan originators?', options:['Credit scores of loan originators','Annual income of mortgage professionals','Licensing, education, and enforcement actions','Borrower credit reports'], correct_index:2 },
  { number:50, question:'What is the main purpose of the Home Mortgage Disclosure Act (HMDA)?', options:['To ensure loans are provided to all applicants regardless of credit','To increase transparency in the mortgage market and identify discriminatory lending patterns','To mandate standard loan terms across all lenders','To guarantee approval for all loan applicants'], correct_index:1 },
  { number:51, question:'Which of the following must be disclosed by lenders under the Truth in Lending Act (TILA)?', options:['Borrower\'s credit score','Monthly payment and the total cost of the loan','Loan origination fee only','Borrower\'s employment status'], correct_index:1 },
  { number:52, question:'Which of these best describes a qualified mortgage (QM)?', options:['A loan with no restrictions on fees or rates','A loan that meets specific underwriting standards and benefits from a presumption of compliance with the ability-to-repay rule','A loan that is guaranteed by the government','A loan that is issued by a non-depository institution'], correct_index:1 },
  { number:53, question:'What does the Equal Credit Opportunity Act (ECOA) specifically protect against?', options:['Unfairly high interest rates','Discrimination in lending based on race, sex, marital status, or other protected characteristics','High settlement fees','Lack of transparency in loan terms'], correct_index:1 },
  { number:54, question:'Which document provides a summary of a loan transaction, including the loan terms and costs at closing?', options:['Loan Estimate','Closing Disclosure','Pre-Qualification Letter','Application Form'], correct_index:1 },
  { number:55, question:'According to the Dodd-Frank Act, which agency was created to protect consumers in financial markets?', options:['Federal Reserve','Consumer Financial Protection Bureau (CFPB)','Federal Deposit Insurance Corporation (FDIC)','Department of Housing and Urban Development (HUD)'], correct_index:1 },
  { number:56, question:'What is a typical feature of an interest-only mortgage?', options:['Monthly payments include both principal and interest','Payments are based on a fixed interest rate','Borrowers pay only interest for a certain period, with no principal payments','The loan balance decreases rapidly over time'], correct_index:2 },
  { number:57, question:'Under the Equal Credit Opportunity Act (ECOA), creditors must notify an applicant of adverse action within how many days?', options:['7 days','14 days','30 days','60 days'], correct_index:2 },
  { number:58, question:'What is the primary concern with balloon mortgages?', options:['The interest rate fluctuates constantly','The entire loan balance is due in one lump sum at the end of the term','The monthly payment never changes','There is no requirement for a down payment'], correct_index:1 },
  { number:59, question:'Under the Fair Housing Act (FHA), which of the following is prohibited in mortgage lending?', options:['Offering loans with a higher interest rate to first-time homebuyers','Charging an application fee for every loan','Discriminating based on race, religion, sex, or disability','Offering a loan to a borrower with a high credit score'], correct_index:2 },
  { number:60, question:'What is the purpose of the Home Mortgage Disclosure Act (HMDA)?', options:['To regulate the interest rates of mortgage loans','To require lenders to report mortgage application data for analysis of discriminatory lending patterns','To regulate the qualifications of mortgage loan originators','To guarantee that all applicants receive a mortgage loan'], correct_index:1 },
  { number:61, question:'What does the SAFE Act require for mortgage loan originators (MLOs)?', options:['To pay licensing fees annually','To undergo criminal background checks and meet minimum licensing standards','To maintain an active portfolio of loans','To file quarterly reports with the CFPB'], correct_index:1 },
  { number:62, question:'Which document is required to be provided within three business days of receiving a loan application?', options:['Loan Estimate','Closing Disclosure','Credit Report','Loan Approval'], correct_index:0 },
  { number:63, question:'What is the term for a loan that requires only the payment of interest for a set period, followed by full payment of the principal balance at the end of the term?', options:['Fully amortizing loan','Balloon loan','Interest-only loan','Reverse mortgage'], correct_index:2 },
  { number:64, question:'Which of the following is an example of a non-traditional mortgage product?', options:['Fixed-rate mortgage','Interest-only mortgage','FHA-insured mortgage','USDA loan'], correct_index:1 },
  { number:65, question:'What is a major risk associated with adjustable-rate mortgages (ARMs)?', options:['Fixed payments for the life of the loan','Monthly payments can increase after an initial fixed-rate period','The loan balance remains the same throughout the term','No down payment is required'], correct_index:1 },
  { number:66, question:'What is the primary responsibility of a mortgage loan originator (MLO)?', options:['To set the loan interest rate','To evaluate borrower eligibility for mortgage loans and ensure compliance with regulations','To manage a bank\'s loan portfolio','To negotiate terms of the loan'], correct_index:1 },
  { number:67, question:'What is required for a loan to be considered a "qualified mortgage" under the Dodd-Frank Act?', options:['The loan must have an interest rate below 5%','The loan must be fully amortizing with no risky features such as negative amortization or balloon payments','The borrower must have an income above $100,000','The loan must be backed by the government'], correct_index:1 },
  { number:68, question:'What must lenders provide on a Closing Disclosure (CD)?', options:['The initial interest rate','A breakdown of final loan terms and costs at closing','The borrower\'s credit score','The estimated closing time'], correct_index:1 },
  { number:69, question:'What is the consequence for a mortgage loan originator found guilty of violating the Safe Act\'s licensing requirements?', options:['Fines and additional testing requirements','License revocation or suspension','Increased compensation','No consequences'], correct_index:1 },
  { number:70, question:'What is the primary role of the Consumer Financial Protection Bureau (CFPB) in mortgage lending?', options:['To provide financial services to borrowers','To regulate the mortgage industry and protect consumers from unfair practices','To issue mortgages to low-income borrowers','To sell mortgage-backed securities'], correct_index:1 },
];

// ── Official Final Exam: 35 Questions (first attempt) ─────────────────
// Answer key per provided materials:
// 1C 2C 3A 4B 5B 6B 7B 8B 9B 10B
// 11B 12B 13B 14B 15B 16B 17C 18A 19B 20B
// 21B 22B 23C 24B 25C 26B 27B 28B 29B 30D
// 31B 32A 33B 34A 35B
const FINAL_EXAM_35 = [
  { number:1,  question:'What is the primary purpose of the Truth in Lending Act (TILA)?', options:['To ensure lenders offer credit to all consumers','To make credit easier to obtain','To promote the informed use of consumer credit','To better qualify borrowers'], correct_index:2 },
  { number:2,  question:'Which of these laws requires creditors to provide standardized information about loan terms, costs, and risks to consumers?', options:['Fair Housing Act','Equal Credit Opportunity Act','Truth in Lending Act','Real Estate Settlement Procedures Act'], correct_index:2 },
  { number:3,  question:'Who is responsible for enforcing the Real Estate Settlement Procedures Act (RESPA)?', options:['The Department of Housing and Urban Development','The Federal Reserve','The Consumer Financial Protection Bureau (CFPB)','The National Mortgage Licensing System'], correct_index:0 },
  { number:4,  question:'What does the Equal Credit Opportunity Act (ECOA) prohibit in mortgage lending?', options:['Discriminating based on creditworthiness','Discriminating based on race, sex, or marital status','Failing to issue a Loan Estimate','Charging higher interest rates'], correct_index:1 },
  { number:5,  question:'Under the Equal Credit Opportunity Act (ECOA), which of the following is a prohibited basis for discrimination?', options:['Age','Marital status','Sexual orientation','Creditworthiness'], correct_index:1 },
  { number:6,  question:'What is a key feature of the TILA-RESPA Integrated Disclosure (TRID) rule?', options:['It eliminates all closing costs','It combines TILA and RESPA disclosures into two forms: the Loan Estimate and Closing Disclosure','It changes the way mortgages are underwritten','It mandates the use of automated underwriting systems'], correct_index:1 },
  { number:7,  question:'How does the Consumer Financial Protection Bureau (CFPB) enforce the Truth in Lending Act (TILA)?', options:['By providing legal defense for lenders','By issuing regulations, conducting examinations, and enforcing compliance','By offering financial incentives to compliant lenders','By creating mortgage products'], correct_index:1 },
  { number:8,  question:'Which of the following is a key requirement under the Dodd-Frank Act?', options:['It mandates the creation of mortgage-backed securities','It created the Consumer Financial Protection Bureau (CFPB)','It allows lenders to grant loans without verifying income','It reduces the capital requirements for banks'], correct_index:1 },
  { number:9,  question:'What must be included in the Loan Estimate (LE)?', options:['Closing Disclosure details','Interest rate, monthly payment, and costs at closing','Loan\'s credit history','Borrower\'s credit score'], correct_index:1 },
  { number:10, question:'Which federal act requires the collection and reporting of mortgage lending data to identify discriminatory practices?', options:['The SAFE Act','Home Mortgage Disclosure Act (HMDA)','Fair Housing Act (FHA)','Truth in Lending Act (TILA)'], correct_index:1 },
  { number:11, question:'Which of the following best describes the SAFE Act\'s main goal?', options:['To allow mortgage brokers to set their own qualifications','To ensure mortgage loan originators are properly licensed and registered','To prevent discrimination in lending','To eliminate all consumer mortgage fees'], correct_index:1 },
  { number:12, question:'What is the purpose of the Home Mortgage Disclosure Act (HMDA)?', options:['To establish underwriting rules','To provide public access to mortgage data to identify discrimination','To determine eligibility for government loans','To provide a registry of loan originators'], correct_index:1 },
  { number:13, question:'What does the SAFE Act require for mortgage loan originators?', options:['A written financial statement','A background check and fingerprinting','The approval of a loan application','A loan origination fee'], correct_index:1 },
  { number:14, question:'What is the primary purpose of the National Mortgage Licensing System (NMLS)?', options:['To issue loans directly to borrowers','To serve as the licensing and registration system for loan originators','To set the interest rates for mortgages','To provide mortgage funding'], correct_index:1 },
  { number:15, question:'Under the SAFE Act, what is required of mortgage loan originators to maintain their licenses?', options:['Submit biannual credit reports','Complete annual continuing education','Pay an annual licensing fee','Undergo yearly background checks'], correct_index:1 },
  { number:16, question:'What does the Home Mortgage Disclosure Act (HMDA) require lenders to report?', options:['Borrower income and employment history','Information about mortgage applications, including race, ethnicity, and loan type','The names of loan originators','The exact closing costs'], correct_index:1 },
  { number:17, question:'What type of fraud occurs when a borrower misrepresents their income to qualify for a mortgage?', options:['Appraisal fraud','Occupancy fraud','Income fraud','Asset fraud'], correct_index:2 },
  { number:18, question:'What does the SAFE Act require for mortgage loan originators (MLOs) to be eligible for licensing?', options:['They must complete pre-licensing education, pass a written exam, and submit to background checks','They must meet a minimum credit score','They must complete 12 months of on-the-job training','They must pass an industry-specific financial exam'], correct_index:0 },
  { number:19, question:'Which of these is considered a conflict of interest in mortgage lending?', options:['Recommending a product that meets the borrower\'s needs','Referring a borrower to an affiliated service provider without disclosure','Offering multiple mortgage products with the same terms','Educating the borrower about various loan options'], correct_index:1 },
  { number:20, question:'What is the main feature of an Adjustable Rate Mortgage (ARM)?', options:['Fixed interest rate for the life of the loan','Variable interest rate that adjusts periodically','Interest-only payments','No principal repayment for the first 5 years'], correct_index:1 },
  { number:21, question:'What is the primary feature of a balloon mortgage?', options:['A fixed interest rate for the life of the loan','The entire loan balance is due in a lump sum at the end of the term','The borrower pays only interest for the life of the loan','Payments are made on a 15-year amortization schedule'], correct_index:1 },
  { number:22, question:'What is a key characteristic of a fully amortizing mortgage?', options:['Interest-only payments for the term of the loan','Monthly payments include both principal and interest, reducing the loan balance','No principal payments for the first 10 years','A balloon payment due at the end of the term'], correct_index:1 },
  { number:23, question:'Which mortgage product typically requires a lower initial payment but may result in higher payments later?', options:['Adjustable-rate mortgage (ARM)','Fixed-rate mortgage','Interest-only mortgage','Fully amortizing mortgage'], correct_index:2 },
  { number:24, question:'What type of loan allows for principal payments to be deferred, increasing the loan balance?', options:['Fixed-rate mortgage','Negative amortization loan','Interest-only loan','Adjustable-rate mortgage'], correct_index:1 },
  { number:25, question:'What is the main benefit of using a non-traditional mortgage product for self-employed borrowers?', options:['They offer lower interest rates','They require fewer documents and no credit check','They use alternative methods to verify income, such as bank statements','They have no closing costs'], correct_index:2 },
  { number:26, question:'What is a key feature of a Payment Option ARM?', options:['It allows borrowers to choose from multiple payment options','It locks in a fixed interest rate for the loan term','The principal is paid off in full by the end of the term','It requires a down payment of 20%'], correct_index:1 },
  { number:27, question:'What is the most significant risk associated with negative amortization loans?', options:['Lower monthly payments','Loan balance increases even though payments are made','Fixed monthly payments','Payment stability over time'], correct_index:1 },
  { number:28, question:'What is a key responsibility of the Mortgage Loan Originator (MLO) under RESPA?', options:['To provide a loan estimate within 5 business days','To ensure borrowers receive the Closing Disclosure three days before closing','To approve the mortgage application','To provide the borrower with a credit report'], correct_index:1 },
  { number:29, question:'What is the typical role of a mortgage loan originator (MLO)?', options:['To provide mortgage funding to consumers','To ensure compliance with lending laws and advise borrowers on suitable loan options','To perform property appraisals','To underwrite mortgage applications'], correct_index:1 },
  { number:30, question:'What is one of the key responsibilities of a loan processor?', options:['To approve loans','To manage borrower communication during underwriting','To perform credit analysis','To clear loan conditions after underwriting review'], correct_index:3 },
  { number:31, question:'What document provides the final terms and costs of a mortgage transaction?', options:['Loan Estimate','Closing Disclosure','Pre-Approval Letter','Promissory Note'], correct_index:1 },
  { number:32, question:'What must a lender provide within three business days of receiving a loan application?', options:['Loan Estimate','Closing Disclosure','Annual Percentage Rate (APR)','Loan Application Form'], correct_index:0 },
  { number:33, question:'Which document provides a summary of a loan transaction, including the loan terms and costs at closing?', options:['Loan Estimate','Closing Disclosure','Pre-Qualification Letter','Application Form'], correct_index:1 },
  { number:34, question:'Which document is required to be provided within three business days of receiving a loan application?', options:['Loan Estimate','Closing Disclosure','Credit Report','Loan Approval'], correct_index:0 },
  { number:35, question:'What is the primary responsibility of a mortgage loan originator (MLO)?', options:['To set the loan interest rate','To evaluate borrower eligibility for mortgage loans and ensure compliance with regulations','To manage a bank\'s loan portfolio','To negotiate terms of the loan'], correct_index:1 },
];

// ─────────────────────────────────────────────────────────────────────
const courseData = {
  title:           '8-HOUR SAFE COMPREHENSIVE: MORTGAGE LOAN ORIGINATOR (TX-OCCC)',
  nmls_course_id:  'CE-TX-OCCC-8HR',
  type:            'CE',
  credit_hours:    8,
  description:     'This 8-hour SAFE Act continuing education course covers federal mortgage law (3 hrs), ethics for MLOs (2 hrs), non-traditional mortgage lending (2 hrs), and mortgage origination (1 hr). Required annually for Texas OCCC licensed Mortgage Loan Originators.',
  price:           99.00,
  states_approved: ['TX'],
  has_textbook:    false,
  textbook_price:  0,
  is_active:       true,
  pdf_url:         TX_TEXTBOOK_PDF,

  modules: [

    // ── MODULE 1 ────────────────────────────────────────────────────
    {
      order: 1, title: 'Federal Mortgage-Related Laws', credit_hours: 3,
      pdf_url: TX_TEXTBOOK_PDF, pdf_start_page: 1, show_pdf_before_quiz: false,
      sections: [
        '1.1 Truth in Lending Act (TILA) & TRID',
        '1.2 Real Estate Settlement Procedures Act (RESPA)',
        '1.3 Equal Credit Opportunity Act (ECOA)',
        '1.4 Fair Housing Act (FHA)',
        '1.5 Home Mortgage Disclosure Act (HMDA)',
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
      order: 2, title: 'Ethical Guidelines for Mortgage Loan Originators', credit_hours: 2,
      pdf_url: TX_TEXTBOOK_PDF, pdf_start_page: 25, show_pdf_before_quiz: false,
      sections: [
        '2.1 Ethical Standards in Mortgage Lending',
        '2.2 Conflicts of Interest and Disclosure',
        '2.3 Fraud Prevention and Ethical Red Flags',
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
      order: 3, title: 'Non-Traditional Mortgage Lending', credit_hours: 2,
      pdf_url: TX_TEXTBOOK_PDF, pdf_start_page: 45, show_pdf_before_quiz: false,
      sections: [
        '3.1 Overview of Non-Traditional Mortgage Products',
        '3.2 Risks to Consumers and Lenders',
        '3.3 Compliance and Suitability Considerations',
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
      order: 4, title: 'Mortgage Origination', credit_hours: 1,
      pdf_url: TX_TEXTBOOK_PDF, pdf_start_page: 60, show_pdf_before_quiz: false,
      sections: [
        '4.1 The Loan Application Process',
        '4.2 Loan Estimate and Closing Disclosure',
        '4.3 The Role of the MLO in Underwriting',
        '4.4 Automated Underwriting Systems (AUS)',
        '4.5 Loan Processing and Conditions',
        'Module 4 Summary',
        'Case Study: The Underwriting Challenge',
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

  ],

  // ── OFFICIAL FINAL EXAM ─────────────────────────────────────────────
  // RETRY LOGIC (implement in your exam controller):
  //   attempt === 1  → serve FINAL_EXAM_35 (official 35-question set)
  //   attempt >= 2   → shuffle QUESTION_BANK_70, slice(0, 35) — new set each time
  final_exam: {
    title:              '8-HOUR SAFE COMPREHENSIVE: MORTGAGE LOAN ORIGINATOR (TX-OCCC) — Final Exam',
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

    await Course.deleteOne({ nmls_course_id: 'CE-TX-OCCC-8HR' });
    console.log('🗑️  Removed existing TX-OCCC course (if any)');

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
    console.log('\n🎯 Test at: /courses/CE-TX-OCCC-8HR/learn');
    console.log('\n▶️  Run from /server dir:  node seeders/seed_tx_occc_course.js');
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