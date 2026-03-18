/**
 * seed_fl_safe_course.js
 * Drop this in: relstone_NMLS/server/
 * Run with:    node seed_fl_safe_course.js
 *
 * COURSE STRUCTURE:
 *   Step 1  📄 Lesson     — Module 1: Federal Mortgage-Related Laws
 *   Step 2  📋 Checkpoint — Module 1 Quiz (5 questions)
 *   Step 3  📄 Lesson     — Module 2: Ethical Guidelines for MLOs
 *   Step 4  📋 Checkpoint — Module 2 Quiz (5 questions)
 *   Step 5  📄 Lesson     — Module 3: Non-Traditional Mortgage Lending
 *   Step 6  📋 Checkpoint — Module 3 Quiz (5 questions)
 *   Step 7  📄 Lesson     — Module 4: Florida State Law and Regulations
 *   Step 8  📋 Checkpoint — Module 4 Quiz (5 questions)
 *   Step 9  📄 Lesson     — FINAL - FLORIDA (PDF review, no quiz)
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
const FL_TEXTBOOK_PDF = 'https://www.dropbox.com/scl/fo/enrih9t4dnji9j47b2mge/AJlfq4abtljhjBkysTe8kDQ/FLORIDA/8-Hour%20FL%20SAFE%20Comprehensive%20-%20Annual%20MLO%20Fundamentals.pdf?rlkey=jdwbravxwpfj6idgxzhxr3ynj&st=jad72fw1&raw=1';
const FL_FINAL_PDF    = 'https://www.dropbox.com/scl/fi/176bn9lukq5l97v556dyj/FINAL-FLORIDA.pdf?rlkey=g0vaxm5zph8sph1648dcs8k29&st=n59y65fc&raw=1';

// ── 70-Question Retry Bank ────────────────────────────────────────────
const QUESTION_BANK_70 = [
  { number:1,  question:'Under the Ability-to-Repay rule, creditors must make a:', options:['Profit-based determination','Reasonable, good-faith determination','Credit-score-only determination','Collateral-only determination'], correct_index:1 },
  { number:2,  question:'Which federal law prohibits kickbacks in settlement services?', options:['TILA','ECOA','RESPA','HMDA'], correct_index:2 },
  { number:3,  question:'Negative amortization primarily results in:', options:['Faster equity growth','Reduced loan balance','Increasing loan balance','Fixed interest rate'], correct_index:2 },
  { number:4,  question:'An adverse action notice must be provided within:', options:['15 days','20 days','30 days','45 days'], correct_index:2 },
  { number:5,  question:'The SAFE Act requires a minimum of how many hours of pre-licensing education?', options:['15','20','25','30'], correct_index:1 },
  { number:6,  question:'Payment shock most commonly occurs when:', options:['Taxes decrease','Interest-only period ends','Loan balance decreases','Fixed rate remains stable'], correct_index:1 },
  { number:7,  question:'The APR represents:', options:['Only the note rate','Lender compensation','Cost of credit expressed as yearly rate','Escrow amount'], correct_index:2 },
  { number:8,  question:'Redlining refers to:', options:['Increasing fees','Refusing loans based on neighborhood demographics','Charging high APR','Adjustable rate increases'], correct_index:1 },
  { number:9,  question:'How many underwriting factors must be considered under ATR?', options:['6','7','8','9'], correct_index:2 },
  { number:10, question:'Which of the following is a protected class under the Fair Housing Act?', options:['Credit history','Disability','Loan amount','Employment type'], correct_index:1 },
  { number:11, question:'A Qualified Mortgage generally limits points and fees to:', options:['2%','3%','4%','5%'], correct_index:1 },
  { number:12, question:'The Loan Estimate must be delivered within:', options:['2 business days','3 business days','5 business days','7 business days'], correct_index:1 },
  { number:13, question:'HMDA requires reporting of:', options:['Employee bonuses','Mortgage application data','Advertising budgets','Underwriting software'], correct_index:1 },
  { number:14, question:'An affiliated business arrangement is permitted if:', options:['Use is mandatory','Disclosure is not required','Proper disclosure is given, and use is optional','Referral fee is hidden'], correct_index:2 },
  { number:15, question:'Annual continuing education for MLOs requires:', options:['6 hours','8 hours','10 hours','12 hours'], correct_index:1 },
  { number:16, question:'Occupancy fraud occurs when a borrower:', options:['Pays extra principal','Misrepresents primary residence intent','Refinances early','Uses escrow'], correct_index:1 },
  { number:17, question:'The Closing Disclosure must be provided:', options:['At application','1 day before closing','3 business days before consummation','After closing'], correct_index:2 },
  { number:18, question:'Disparate impact refers to:', options:['Intentional discrimination','Different pricing tiers','Neutral policy causing discriminatory effect','Credit-based pricing'], correct_index:2 },
  { number:19, question:'Section 8(b) of RESPA prohibits:', options:['APR miscalculation','Unearned fee splitting','Adjustable rates','Balloon loans'], correct_index:1 },
  { number:20, question:'Equity erosion risk is highest in:', options:['Fully amortizing loans','Fixed-rate mortgages','Negative amortization loans','FHA loans'], correct_index:2 },
  { number:21, question:'The federal agency primarily enforcing TILA for nonbanks is:', options:['HUD','FDIC','CFPB','OCC'], correct_index:2 },
  { number:22, question:'Ethical integrity requires:', options:['Maximizing commissions','Withholding complex information','Honest representation of loan terms','Steering borrowers'], correct_index:2 },
  { number:23, question:'HOEPA applies to:', options:['All conventional loans','High-cost mortgages','FHA loans only','USDA loans only'], correct_index:1 },
  { number:24, question:'HMDA data must be submitted by:', options:['January 1','February 1','March 1','April 1'], correct_index:2 },
  { number:25, question:'Bank statement loans are typically used by:', options:['Salaried W-2 employees','Self-employed borrowers','Retirees only','FHA borrowers'], correct_index:1 },
  { number:26, question:'Florida CE includes how many state hours?', options:['1 hour','2 hours','3 hours','4 hours'], correct_index:0 },
  { number:27, question:'Refinancing dependence creates risk when:', options:['Property appreciates','Rates decline','Market conditions worsen','DTI decreases'], correct_index:2 },
  { number:28, question:'APR tolerance for regular transactions is:', options:['0.50%','0.25%','0.125%','1%'], correct_index:2 },
  { number:29, question:'Straw buyer schemes involve:', options:['Owner occupancy','Legitimate refinancing','Purchasing on behalf of an unqualified person','FHA underwriting'], correct_index:2 },
  { number:30, question:'The SAFE Act was enacted in:', options:['2005','2007','2008','2010'], correct_index:2 },
  { number:31, question:'Under ECOA, creditors must retain mortgage application records for:', options:['12 months','18 months','24 months','25 months'], correct_index:3 },
  { number:32, question:'Which is considered payment shock?', options:['Gradual tax increases','Sudden increase in monthly mortgage payment','Decrease in escrow','Lowering interest rates'], correct_index:1 },
  { number:33, question:'A high-cost mortgage under HOEPA may be triggered when APR exceeds APOR by:', options:['3%','4%','6.5% (first lien)','10%'], correct_index:2 },
  { number:34, question:'The SAFE exam requires a minimum passing score of:', options:['70%','75%','80%','85%'], correct_index:1 },
  { number:35, question:'Which feature is prohibited in most Qualified Mortgages?', options:['Fixed interest rate','Negative amortization','Escrow accounts','15-year terms'], correct_index:1 },
  { number:36, question:'Reverse redlining refers to:', options:['Serving minority neighborhoods fairly','Avoiding rural lending','Targeting protected classes for high-cost loans','Reducing fees'], correct_index:2 },
  { number:37, question:'An MLO must obtain a unique identifier through:', options:['CFPB','HUD','NMLS','FDIC'], correct_index:2 },
  { number:38, question:'Which is a key component of ethical transparency?', options:['Using industry jargon','Explaining loan terms clearly','Avoiding borrower questions','Hiding APR details'], correct_index:1 },
  { number:39, question:'HMDA primarily helps regulators:', options:['Set interest rates','Identify discriminatory lending patterns','Determine loan profitability','Set credit scores'], correct_index:1 },
  { number:40, question:'An increase beyond zero-tolerance fees requires:', options:['Borrower waiver','Refund of excess','No action','New application'], correct_index:1 },
  { number:41, question:'Interest-only loans primarily delay:', options:['Escrow payments','Interest payments','Principal repayment','Closing costs'], correct_index:2 },
  { number:42, question:'The Fair Housing Act is enforced primarily by:', options:['CFPB','OCC','HUD','NMLS'], correct_index:2 },
  { number:43, question:'Fraud involving altered income documentation is:', options:['Appraisal fraud','Income fraud','Occupancy fraud','Equity stripping'], correct_index:1 },
  { number:44, question:'Which CE category must include fraud prevention?', options:['Federal law','Ethics','Non-traditional','Elective'], correct_index:1 },
  { number:45, question:'An ARM rate is based on:', options:['Fixed note rate only','Index plus margin','Credit score only','Escrow changes'], correct_index:1 },
  { number:46, question:'Refusing to make loans based on race violates:', options:['SAFE Act','RESPA','Fair Housing Act','HMDA'], correct_index:2 },
  { number:47, question:'Which risk increases when loan balance grows instead of shrinking?', options:['Liquidity risk','Equity erosion','Escrow deficiency','Appraisal risk'], correct_index:1 },
  { number:48, question:'Under RESPA Section 9, sellers may not:', options:['Require specific lender','Require specific title insurer','Set interest rates','Charge taxes'], correct_index:1 },
  { number:49, question:'A straw buyer typically:', options:['Lives in the property','Purchases for another person','Uses FHA insurance','Pays extra down payment'], correct_index:1 },
  { number:50, question:'The Ability-to-Repay rule was strengthened by:', options:['HMDA','Dodd-Frank Act','SAFE Act','RESPA'], correct_index:1 },
  { number:51, question:'Borrower suitability assessment requires:', options:['Maximizing loan size','Evaluating long-term affordability','Avoiding documentation','Ignoring reserves'], correct_index:1 },
  { number:52, question:'Which agency has enforcement power over state-licensed MLOs?', options:['HUD','CFPB','State regulator','Federal Reserve'], correct_index:2 },
  { number:53, question:'An example of disparate treatment is:', options:['Neutral policy with unequal effect','Intentional different treatment based on protected class','Credit-based pricing','ARM adjustments'], correct_index:1 },
  { number:54, question:'APR includes:', options:['Title fees','Appraisal fees','Interest and certain finance charges','Property taxes'], correct_index:2 },
  { number:55, question:'TRID integrated:', options:['ECOA and FHA','TILA and RESPA disclosures','HMDA and SAFE','ATR and QM'], correct_index:1 },
  { number:56, question:'Balloon payments are generally prohibited in:', options:['FHA loans','Qualified Mortgages','Conventional loans','VA loans'], correct_index:1 },
  { number:57, question:'Which is NOT protected under FHA but IS under ECOA?', options:['Race','Religion','Marital status','National origin'], correct_index:2 },
  { number:58, question:'Minimum annual CE hours required:', options:['6','7','8','9'], correct_index:2 },
  { number:59, question:'A borrower must receive appraisals:', options:['Only upon request','Free of charge','After closing','Only if denied'], correct_index:1 },
  { number:60, question:'Risk layering increases:', options:['Loan simplicity','Compliance ease','Default probability','Equity growth'], correct_index:2 },
  { number:61, question:'Consumer protection in non-traditional lending focuses on:', options:['Maximizing yield','Suitability and disclosure','Lower DTI only','Removing ATR'], correct_index:1 },
  { number:62, question:'Operating without a license violates:', options:['TILA','HMDA','SAFE Act','FHA'], correct_index:2 },
  { number:63, question:'Zero-tolerance fees include:', options:['Prepaid interest','Lender origination charges','Insurance premiums','Escrow deposits'], correct_index:1 },
  { number:64, question:'Refinancing dependence risk increases when:', options:['Rates fall','Property appreciates','Credit tightens','Income rises'], correct_index:2 },
  { number:65, question:'Documentation standards are essential to:', options:['Increase commissions','Demonstrate compliance','Avoid disclosures','Remove ATR'], correct_index:1 },
  { number:66, question:'Which is a red flag for fraud?', options:['Consistent documentation','Evasive borrower answers','Stable income history','Clear employment records'], correct_index:1 },
  { number:67, question:"Ethical conduct requires placing:", options:['Employer profit first',"Borrower's best interest first",'Sales quotas first','Volume targets first'], correct_index:1 },
  { number:68, question:'Which type of mortgage is most predictable?', options:['Payment option ARM','Interest-only','Fully amortizing fixed','Negative amortization'], correct_index:2 },
  { number:69, question:'Administrative enforcement may include:', options:['Stock market penalties','Cease-and-desist orders','Rate adjustments','Credit score reductions'], correct_index:1 },
  { number:70, question:'Failure to comply with disclosure requirements may result in:', options:['Higher commissions','Regulatory penalties','Lower APR','Faster closing'], correct_index:1 },
];

// ── Official Final Exam: 35 Questions (first attempt) ─────────────────
const FINAL_EXAM_35 = [
  { number:1,  question:'Under the Ability-to-Repay rule, creditors must make a:', options:['Profit-based determination','Reasonable, good-faith determination','Credit-score-only determination','Collateral-only determination'], correct_index:1 },
  { number:2,  question:'Which federal law prohibits kickbacks in settlement services?', options:['TILA','ECOA','RESPA','HMDA'], correct_index:2 },
  { number:3,  question:'An adverse action notice must be provided within:', options:['15 days','20 days','30 days','45 days'], correct_index:2 },
  { number:4,  question:'The SAFE Act requires a minimum of how many hours of pre-licensing education?', options:['15','20','25','30'], correct_index:1 },
  { number:5,  question:'The APR represents:', options:['Only the note rate','Lender compensation','Cost of credit expressed as yearly rate','Escrow amount'], correct_index:2 },
  { number:6,  question:'Redlining refers to:', options:['Increasing fees','Refusing loans based on neighborhood demographics','Charging high APR','Adjustable rate increases'], correct_index:1 },
  { number:7,  question:'How many underwriting factors must be considered under ATR?', options:['6','7','8','9'], correct_index:2 },
  { number:8,  question:'Which of the following is a protected class under the Fair Housing Act?', options:['Credit history','Disability','Loan amount','Employment type'], correct_index:1 },
  { number:9,  question:'A Qualified Mortgage generally limits points and fees to:', options:['2%','3%','4%','5%'], correct_index:1 },
  { number:10, question:'The Loan Estimate must be delivered within:', options:['2 business days','3 business days','5 business days','7 business days'], correct_index:1 },
  { number:11, question:'HMDA requires reporting of:', options:['Employee bonuses','Mortgage application data','Advertising budgets','Underwriting software'], correct_index:1 },
  { number:12, question:'An affiliated business arrangement is permitted if:', options:['Use is mandatory','Disclosure is not required','Proper disclosure is given, and use is optional','Referral fee is hidden'], correct_index:2 },
  { number:13, question:'Annual continuing education for MLOs requires:', options:['6 hours','8 hours','10 hours','12 hours'], correct_index:1 },
  { number:14, question:'Ethical integrity requires:', options:['Maximizing commissions','Withholding complex information','Honest representation of loan terms','Steering borrowers'], correct_index:2 },
  { number:15, question:'Occupancy fraud occurs when a borrower:', options:['Pays extra principal','Misrepresents primary residence intent','Refinances early','Uses escrow'], correct_index:1 },
  { number:16, question:'Straw buyer schemes involve:', options:['Owner occupancy','Legitimate refinancing','Purchasing on behalf of an unqualified person','FHA underwriting'], correct_index:2 },
  { number:17, question:'Which is a key component of ethical transparency?', options:['Using industry jargon','Explaining loan terms clearly','Avoiding borrower questions','Hiding APR details'], correct_index:1 },
  { number:18, question:'Fraud involving altered income documentation is:', options:['Appraisal fraud','Income fraud','Occupancy fraud','Equity stripping'], correct_index:1 },
  { number:19, question:'Which CE category must include fraud prevention?', options:['Federal law','Ethics','Non-traditional','Elective'], correct_index:1 },
  { number:20, question:'A straw buyer typically:', options:['Lives in the property','Purchases for another person','Uses FHA insurance','Pays extra down payment'], correct_index:1 },
  { number:21, question:'Which is a red flag for fraud?', options:['Consistent documentation','Evasive borrower answers','Stable income history','Clear employment records'], correct_index:1 },
  { number:22, question:"Ethical conduct requires placing:", options:['Employer profit first',"Borrower's best interest first",'Sales quotas first','Volume targets first'], correct_index:1 },
  { number:23, question:'Negative amortization primarily results in:', options:['Faster equity growth','Reduced loan balance','Increasing loan balance','Fixed interest rate'], correct_index:2 },
  { number:24, question:'Payment shock most commonly occurs when:', options:['Taxes decrease','Interest-only period ends','Loan balance decreases','Fixed rate remains stable'], correct_index:1 },
  { number:25, question:'Equity erosion risk is highest in:', options:['Fully amortizing loans','Fixed-rate mortgages','Negative amortization loans','FHA loans'], correct_index:2 },
  { number:26, question:'Bank statement loans are typically used by:', options:['Salaried W-2 employees','Self-employed borrowers','Retirees only','FHA borrowers'], correct_index:1 },
  { number:27, question:'Refinancing dependence creates risk when:', options:['Property appreciates','Rates decline','Market conditions worsen','DTI decreases'], correct_index:2 },
  { number:28, question:'Which is considered payment shock?', options:['Gradual tax increases','Sudden increase in monthly mortgage payment','Decrease in escrow','Lowering interest rates'], correct_index:1 },
  { number:29, question:'Interest-only loans primarily delay:', options:['Escrow payments','Interest payments','Principal repayment','Closing costs'], correct_index:2 },
  { number:30, question:'An ARM rate is based on:', options:['Fixed note rate only','Index plus margin','Credit score only','Escrow changes'], correct_index:1 },
  { number:31, question:'Which risk increases when loan balance grows instead of shrinking?', options:['Liquidity risk','Equity erosion','Escrow deficiency','Appraisal risk'], correct_index:1 },
  { number:32, question:'Borrower suitability assessment requires:', options:['Maximizing loan size','Evaluating long-term affordability','Avoiding documentation','Ignoring reserves'], correct_index:1 },
  { number:33, question:'Florida CE includes how many state hours?', options:['1 hour','2 hours','3 hours','4 hours'], correct_index:0 },
  { number:34, question:'Administrative enforcement may include:', options:['Stock market penalties','Cease-and-desist orders','Rate adjustments','Credit score reductions'], correct_index:1 },
  { number:35, question:'Failure to comply with disclosure requirements may result in:', options:['Higher commissions','Regulatory penalties','Lower APR','Faster closing'], correct_index:1 },
];

// ─────────────────────────────────────────────────────────────────────
const courseData = {
  title:           '8-HOUR FL SAFE COMPREHENSIVE: ANNUAL MLO FUNDAMENTALS',
  nmls_course_id:  'CE-FL-SAFE-8HR',
  type:            'CE',
  credit_hours:    8,
  description:     'This 8-hour SAFE Act continuing education course covers federal mortgage law (3 hrs), ethics for MLOs (2 hrs), non-traditional mortgage lending (2 hrs), and Florida state law & regulations (1 hr). Required annually for Florida-licensed MLOs.',
  price:           99.00,
  states_approved: ['FL'],
  has_textbook:    false,
  textbook_price:  0,
  is_active:       true,
  pdf_url:         FL_TEXTBOOK_PDF,

  modules: [

    // ── MODULE 1 ────────────────────────────────────────────────────
    {
      order: 1, title: 'Federal Mortgage-Related Laws', credit_hours: 3,
      pdf_url: FL_TEXTBOOK_PDF, show_pdf_before_quiz: false,
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
      pdf_url: FL_TEXTBOOK_PDF, show_pdf_before_quiz: false,
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
      pdf_url: FL_TEXTBOOK_PDF, show_pdf_before_quiz: false,
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
      order: 4, title: 'Florida State Law and Regulations', credit_hours: 1,
      pdf_url: FL_TEXTBOOK_PDF, show_pdf_before_quiz: false,
      sections: ['4.1 Overview of State Regulatory Authority in Florida','4.2 State Continuing Education Requirements','4.3 State-Specific Mortgage Laws','4.4 Enforcement, Penalties, and Disciplinary Actions','4.5 Consumer Protection Provisions','Module 4 Summary'],
      quiz: [
        // Answer key: 1C 2C 3C 4B 5B
        { number:1, question:'Which Florida agency is primarily responsible for licensing, regulating, and enforcing compliance among financial institutions and mortgage professionals in the state?', options:['Florida Attorney General\'s Office','Federal Reserve Board','Florida Department of Financial Regulation','Consumer Financial Protection Bureau (CFPB)'], correct_index:2 },
        { number:2, question:'Which of the following actions is considered a prohibited practice under Florida mortgage law?', options:['Providing timely and accurate loan disclosures','Completing continuing education through an approved provider','Steering a borrower into an unsuitable loan product for compensation','Maintaining records of CE completion'], correct_index:2 },
        { number:3, question:'What is a potential consequence for a Florida mortgage professional who fails to complete required continuing education by the license renewal deadline?', options:['Automatic license transfer to another state','No consequence if CE is completed later','License expiration, penalties, or suspension','Mandatory federal prosecution'], correct_index:2 },
        { number:4, question:'Which of the following is a responsibility of the Florida Department of Financial Regulation (FDFR) regarding mortgage professionals?', options:['Creating loan products','Enforcing compliance with Florida\'s mortgage laws','Reviewing real estate market trends','Setting mortgage interest rates for lenders'], correct_index:1 },
        { number:5, question:'If a Florida mortgage professional fails to complete their Continuing Education (CE) requirements by the license renewal deadline, which of the following is a potential consequence?', options:['Automatic renewal of their license','License expiration and penalties','No consequences if CE is completed after the deadline','Immediate dismissal from the mortgage industry'], correct_index:1 },
      ],
    },

    // ── MODULE 5: FINAL - FLORIDA ────────────────────────────────────
    // PDF-only lesson — NO quiz
    // Student reads FINAL-FLORIDA.pdf then proceeds directly to Final Exam
    {
      order: 5, title: 'FINAL - FLORIDA', credit_hours: 0,
      pdf_url: FL_FINAL_PDF, show_pdf_before_quiz: false,
      sections: ['8-HOUR FL SAFE COMPREHENSIVE: ANNUAL MLO FUNDAMENTALS','Florida State Law & FDFR Regulations — Full Review','Review all four modules before attempting the Final Exam','Covers: Federal Law · Ethics · Non-Traditional Lending · FL State Law'],
      quiz: [], // ← NO checkpoint — proceeds directly to Final Exam
    },

  ],

  // ── OFFICIAL FINAL EXAM ─────────────────────────────────────────────
  // RETRY LOGIC (implement in your exam controller):
  //   attempt === 1  → serve FINAL_EXAM_35 (official 35-question set)
  //   attempt >= 2   → shuffle QUESTION_BANK_70, slice(0, 35) — new set each time
  final_exam: {
    title:              '8-HOUR FL SAFE COMPREHENSIVE: ANNUAL MLO FUNDAMENTALS — Final Exam',
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

    await Course.deleteOne({ nmls_course_id: 'CE-FL-SAFE-8HR' });
    console.log('🗑️  Removed existing FL SAFE course (if any)');

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
    console.log('\n🎯 Test at: /courses/CE-FL-SAFE-8HR/learn');
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