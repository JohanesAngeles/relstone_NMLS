/**
 * seed_nm_safe_course.js
 * Drop this in: relstone_NMLS/server/
 * Run with:    node seed_nm_safe_course.js
 *
 * COURSE STRUCTURE:
 *   Step 1  📄 Lesson     — Module 1: Federal Mortgage-Related Laws
 *   Step 2  📋 Checkpoint — Module 1 Quiz (5 questions)
 *   Step 3  📄 Lesson     — Module 2: Ethical Guidelines for MLOs
 *   Step 4  📋 Checkpoint — Module 2 Quiz (5 questions)
 *   Step 5  📄 Lesson     — Module 3: Non-Traditional Mortgage Lending
 *   Step 6  📋 Checkpoint — Module 3 Quiz (5 questions)
 *   Step 7  📄 Lesson     — Module 4: New Mexico State Law and Regulations
 *   Step 8  📋 Checkpoint — Module 4 Quiz (5 questions)
 *   Step 9  📄 Lesson     — FINAL - NEW MEXICO (PDF review, no quiz)
 *   Step 10 🏆 Final Exam — Attempt 1: official 35 Qs | Retry: random 35 from 70-Q bank
 *
 * RETRY LOGIC:
 *   - First attempt:  serve FINAL_EXAM_35 (official verified set)
 *   - On failure:     shuffle QUESTION_BANK_70, slice(0, 35) — new set each retry
 */

const mongoose = require('mongoose');
const dotenv   = require('dotenv');
dotenv.config();

const Course = require('../models/Course');

// ── PDF URLs ──────────────────────────────────────────────────────────
const NM_TEXTBOOK_PDF = 'https://www.dropbox.com/scl/fo/enrih9t4dnji9j47b2mge/ABTCHECkv80RnH0ZcNLnuSo/NEW%20MEXICO/8-Hour%20NM%20SAFE%20Comprehensive%20-%20Annual%20MLO%20Fundamentals.pdf?rlkey=jdwbravxwpfj6idgxzhxr3ynj&st=5ucckhhg&raw=1';
const NM_FINAL_PDF    = 'https://www.dropbox.com/scl/fi/ckue9qmhwf5yb9e9q8n0a/Final-New-Mexico-NMLS-CE.pdf?rlkey=fnkpql353lklm503nmdpzgssk&st=wc7u54ai&raw=1';

// ── 70-Question Retry Bank ────────────────────────────────────────────
const QUESTION_BANK_70 = [
  { number:1,  question:'Under the Ability-to-Repay rule, a creditor must make a:', options:['Collateral-only decision','Reasonable, good-faith determination','Commission-based evaluation','Credit-score-only decision'], correct_index:1 },
  { number:2,  question:'RESPA Section 8 prohibits:', options:['Adjustable-rate mortgages','Kickbacks and unearned fees','Escrow accounts','Balloon payments'], correct_index:1 },
  { number:3,  question:'The SAFE Act requires a minimum of how many hours of pre-licensing education?', options:['15','20','25','30'], correct_index:1 },
  { number:4,  question:'The Loan Estimate must be delivered within:', options:['2 business days','3 business days','5 business days','7 business days'], correct_index:1 },
  { number:5,  question:'APR represents:', options:['Note rate only','Cost of credit expressed as a yearly rate','Escrow balance','Property taxes'], correct_index:1 },
  { number:6,  question:'The federal agency primarily enforcing TILA for nonbanks is:', options:['OCC','FDIC','CFPB','Federal Reserve'], correct_index:2 },
  { number:7,  question:'Which is a protected class under the Fair Housing Act?', options:['Credit score','Disability','Loan size','Income level'], correct_index:1 },
  { number:8,  question:'A Qualified Mortgage generally limits points and fees to:', options:['2%','3%','4%','5%'], correct_index:1 },
  { number:9,  question:'The Closing Disclosure must be provided:', options:['At application','1 day before closing','3 business days before consummation','After closing'], correct_index:2 },
  { number:10, question:'Under ECOA, adverse action notice must be provided within:', options:['15 days','20 days','30 days','45 days'], correct_index:2 },
  { number:11, question:'Section 8(b) of RESPA prohibits:', options:['Balloon loans','Unearned fee splitting','ARMs','Escrow accounts'], correct_index:1 },
  { number:12, question:'Disparate impact refers to:', options:['Intentional discrimination','Neutral policy with discriminatory effect','Credit pricing','ARM resets'], correct_index:1 },
  { number:13, question:'Under New Mexico law, mortgage licenses are issued through:', options:['New Mexico Financial Institutions Division','CFPB','HUD','FDIC'], correct_index:0 },
  { number:14, question:'Which feature is prohibited in most Qualified Mortgages?', options:['Fixed rate','Negative amortization','Escrow account','15-year term'], correct_index:1 },
  { number:15, question:'APR tolerance for regular transactions is:', options:['0.50%','0.25%','0.125%','1%'], correct_index:2 },
  { number:16, question:'The Ability-to-Repay rule was strengthened by:', options:['SAFE Act','Dodd-Frank Act','HMDA','RESPA'], correct_index:1 },
  { number:17, question:'Under ECOA, records must be retained for:', options:['12 months','18 months','24 months','25 months'], correct_index:3 },
  { number:18, question:'Zero-tolerance fees include:', options:['Escrow deposits','Lender origination charges','Insurance premiums','Prepaid interest'], correct_index:1 },
  { number:19, question:'The SAFE Act was enacted in:', options:['2005','2007','2008','2010'], correct_index:2 },
  { number:20, question:'A borrower must receive appraisals:', options:['Only upon request','Free of charge','After closing','Only if denied'], correct_index:1 },
  { number:21, question:'Refusing loans based on race violates:', options:['SAFE Act','RESPA','Fair Housing Act','HMDA'], correct_index:2 },
  { number:22, question:'APR includes:', options:['Property taxes','Interest and certain finance charges','Title fees only','Escrow'], correct_index:1 },
  { number:23, question:'TRID requires redisclosure if APR becomes:', options:['Lower','Inaccurate beyond tolerance','Fixed','Higher than note'], correct_index:1 },
  { number:24, question:'Reverse redlining most directly violates:', options:['SAFE Act','Fair Housing Act','HMDA','ECOA'], correct_index:1 },
  { number:25, question:'Which underwriting factor is required under ATR?', options:['Property appreciation','Credit score only','Current income or assets','Commission structure'], correct_index:2 },
  { number:26, question:'Negative amortization results in:', options:['Faster payoff','Reduced balance','Increasing loan balance','Fixed principal reduction'], correct_index:2 },
  { number:27, question:'Payment shock most commonly occurs when:', options:['Escrow decreases','Interest-only period ends','Loan balance decreases','Rate remains fixed'], correct_index:1 },
  { number:28, question:'Interest-only loans primarily delay:', options:['Escrow','Principal repayment','Insurance','Closing'], correct_index:1 },
  { number:29, question:'Risk layering increases:', options:['Loan simplicity','Default probability','Compliance ease','Equity growth'], correct_index:1 },
  { number:30, question:'An ARM rate is based on:', options:['Fixed rate','Index plus margin','Credit score','Escrow'], correct_index:1 },
  { number:31, question:'Refinancing dependence risk increases when:', options:['Rates fall','Property appreciates','Credit tightens','Income rises'], correct_index:2 },
  { number:32, question:'Consumer protection in non-traditional lending focuses on:', options:['Yield maximization','Suitability and disclosure','Removing ATR','Lower fees'], correct_index:1 },
  { number:33, question:'Which type of mortgage is most predictable?', options:['Payment option ARM','Interest-only','Fully amortizing fixed','Negative amortization'], correct_index:2 },
  { number:34, question:'Equity erosion risk is highest in:', options:['Fixed-rate mortgages','Fully amortizing loans','Negative amortization loans','FHA loans'], correct_index:2 },
  { number:35, question:'Borrower suitability assessment requires:', options:['Maximizing loan size','Evaluating long-term affordability','Ignoring reserves','Avoiding ATR'], correct_index:1 },
  { number:36, question:'Under New Mexico law, operating without a license may result in:', options:['Warning letter only','Administrative penalties','Escrow waiver','Rate reduction'], correct_index:1 },
  { number:37, question:'Administrative enforcement may include:', options:['Cease-and-desist orders','Escrow review','Rate reduction','Credit reporting'], correct_index:0 },
  { number:38, question:'New Mexico enforcement authority comes from:', options:['CFPB','New Mexico Financial Institutions Division','HUD','FDIC'], correct_index:1 },
  { number:39, question:'A Qualified Mortgage requires ATR compliance under:', options:['TILA','Dodd-Frank','HMDA','FHA'], correct_index:1 },
  { number:40, question:'HMDA helps regulators:', options:['Set rates','Detect discriminatory lending','Calculate APR','Approve loans'], correct_index:1 },
  { number:41, question:'Minimum CE hours annually for MLOs:', options:['6','7','8','9'], correct_index:1 },
  { number:42, question:'Under RESPA Section 9, sellers may not:', options:['Require a specific title insurer','Adjust rates','Charge taxes','Require escrow'], correct_index:0 },
  { number:43, question:'A high-cost mortgage requires additional:', options:['Advertising','Counseling disclosures','Appraisal waivers','Escrow removal'], correct_index:1 },
  { number:44, question:'The Fair Housing Act is enforced primarily by:', options:['CFPB','HUD','OCC','FDIC'], correct_index:1 },
  { number:45, question:'Risk of equity erosion increases when:', options:['Balance shrinks','Balance grows','Rate is fixed','Escrow is stable'], correct_index:1 },
  { number:46, question:'Which is NOT protected under FHA but IS under ECOA?', options:['Race','Religion','Marital status','National origin'], correct_index:2 },
  { number:47, question:'An affiliated business arrangement is permitted if:', options:['Mandatory use required','Proper disclosure and optional use','Hidden fee charged','Secret referral paid'], correct_index:1 },
  { number:48, question:'HMDA data must be submitted by:', options:['January 1','February 1','March 1','April 1'], correct_index:2 },
  { number:49, question:'Payment shock is best described as:', options:['Gradual increase','Sudden significant payment increase','Escrow decrease','Fixed payment'], correct_index:1 },
  { number:50, question:'Failure to comply with disclosure requirements may result in:', options:['Higher commissions','Regulatory penalties','Lower APR','Faster closing'], correct_index:1 },
  { number:51, question:'New Mexico CE must include ethics hours totaling:', options:['1 hour','2 hours','3 hours','4 hours'], correct_index:1 },
  { number:52, question:'Bank statement loans are commonly used by:', options:['W-2 employees','Self-employed borrowers','Retirees only','FHA borrowers'], correct_index:1 },
  { number:53, question:'Which is a red flag for fraud?', options:['Clear documentation','Evasive borrower answers','Stable income','Consistent file'], correct_index:1 },
  { number:54, question:'The New Mexico Commissioner may issue:', options:['Stock penalties','Cease-and-desist orders','Escrow waivers','Appraisal exemptions'], correct_index:1 },
  { number:55, question:'Occupancy fraud occurs when:', options:['Taxes are unpaid','Borrower misrepresents primary residence intent','Escrow shortage occurs','ARM resets'], correct_index:1 },
  { number:56, question:'Fraud involving altered income documentation is:', options:['Appraisal fraud','Income fraud','Occupancy fraud','Equity stripping'], correct_index:1 },
  { number:57, question:'Ethical conduct requires placing whose interests first?', options:['Employer profit',"Borrower's best interest",'Sales quotas','Volume targets'], correct_index:1 },
  { number:58, question:'Which CE category must include fraud prevention content?', options:['Federal law','Ethics','Non-traditional mortgage products','Elective hours'], correct_index:1 },
  { number:59, question:'Conflicts of interest in mortgage lending must be:', options:['Hidden from borrowers','Disclosed to the borrower','Reported only to management','Ignored if minor'], correct_index:1 },
  { number:60, question:'A straw buyer scheme involves:', options:['A buyer who occupies the property','Purchasing a property on behalf of an unqualified person','Legitimate FHA financing','Paying a larger down payment'], correct_index:1 },
  { number:61, question:'Which of the following is a red flag indicating potential mortgage fraud?', options:['Consistent and well-organized documentation','Evasive borrower answers about property use','Stable employment history','Clear and verifiable income records'], correct_index:1 },
  { number:62, question:'Zero-tolerance fees under TRID include:', options:['Prepaid interest','Lender origination charges',"Homeowner's insurance premiums",'Escrow deposits'], correct_index:1 },
  { number:63, question:'Section 9 of RESPA prohibits sellers from:', options:['Requiring a specific lender','Requiring a specific title insurance company as a condition of sale','Setting the interest rate','Charging property taxes'], correct_index:1 },
  { number:64, question:'Under ECOA, creditors must retain mortgage application records for:', options:['12 months','18 months','24 months','25 months'], correct_index:3 },
  { number:65, question:'Redlining refers to:', options:['Increasing origination fees','Refusing loans based on neighborhood demographics','Charging a high APR','Adjustable-rate loan increases'], correct_index:1 },
  { number:66, question:'HMDA data requires reporting of:', options:['Employee bonuses','Mortgage application and loan data','Advertising budgets','Underwriting software costs'], correct_index:1 },
  { number:67, question:'An MLO must obtain a unique identifier through:', options:['CFPB','HUD','NMLS','FDIC'], correct_index:2 },
  { number:68, question:'Balloon payments are generally prohibited in:', options:['FHA loans','Qualified Mortgages','Conventional loans','VA loans'], correct_index:1 },
  { number:69, question:'HOEPA applies specifically to:', options:['All conventional mortgage loans','High-cost mortgages exceeding defined thresholds','FHA loans only','USDA rural loans only'], correct_index:1 },
  { number:70, question:'Documentation standards are essential in mortgage lending to:', options:['Increase origination commissions','Demonstrate regulatory compliance','Avoid required disclosures','Remove ATR requirements'], correct_index:1 },
];

// ── Official Final Exam: 35 Questions (first attempt) ─────────────────
// Answer key from document: 1B 2B 3B 4B 5B 6C 7B 8B 9C 10C
//   11B 12B 13B(NM FID) 14C 15B 16D 17B 18B 19B 20B
//   21B 22B 23C 24B 25B 26B 27B 28C 29B 30C
//   31B 32B 33A 34B 35B
const FINAL_EXAM_35 = [
  // ── Module 1: Federal Mortgage-Related Laws ──
  { number:1,  question:'Under the Ability-to-Repay rule, a creditor must make a:', options:['Collateral-only decision','Reasonable, good-faith determination','Commission-based evaluation','Credit-score-only decision'], correct_index:1 },
  { number:2,  question:'RESPA Section 8 prohibits:', options:['Adjustable-rate mortgages','Kickbacks and unearned fees','Escrow accounts','Balloon payments'], correct_index:1 },
  { number:3,  question:'The SAFE Act requires a minimum of how many hours of pre-licensing education?', options:['15','20','25','30'], correct_index:1 },
  { number:4,  question:'The Loan Estimate must be delivered within:', options:['2 business days','3 business days','5 business days','7 business days'], correct_index:1 },
  { number:5,  question:'APR represents:', options:['Note rate only','Cost of credit expressed as a yearly rate','Escrow balance','Property taxes'], correct_index:1 },
  { number:6,  question:'The federal agency primarily enforcing TILA for nonbanks is:', options:['OCC','FDIC','CFPB','Federal Reserve'], correct_index:2 },
  { number:7,  question:'Which is a protected class under the Fair Housing Act?', options:['Credit score','Disability','Loan size','Income level'], correct_index:1 },
  { number:8,  question:'A Qualified Mortgage generally limits points and fees to:', options:['2%','3%','4%','5%'], correct_index:1 },
  { number:9,  question:'The Closing Disclosure must be provided:', options:['At application','1 day before closing','3 business days before consummation','After closing'], correct_index:2 },
  { number:10, question:'Under ECOA, adverse action notice must be provided within:', options:['15 days','20 days','30 days','45 days'], correct_index:2 },
  { number:11, question:'Section 8(b) of RESPA prohibits:', options:['Balloon loans','Unearned fee splitting','ARMs','Escrow accounts'], correct_index:1 },
  { number:12, question:'Disparate impact refers to:', options:['Intentional discrimination','Neutral policy with discriminatory effect','Credit pricing','ARM reset'], correct_index:1 },
  { number:13, question:'Which feature is prohibited in most Qualified Mortgages?', options:['Fixed rate','Negative amortization','Escrow account','15-year term'], correct_index:1 },
  { number:14, question:'APR tolerance for regular transactions is:', options:['0.50%','0.25%','0.125%','1%'], correct_index:2 },
  { number:15, question:'The Ability-to-Repay rule was strengthened by:', options:['SAFE Act','Dodd-Frank Act','HMDA','RESPA'], correct_index:1 },
  { number:16, question:'Under ECOA, records must be retained for:', options:['12 months','18 months','24 months','25 months'], correct_index:3 },
  { number:17, question:'Zero-tolerance fees include:', options:['Escrow deposits','Lender origination charges','Insurance premiums','Prepaid interest'], correct_index:1 },
  // ── Module 2: Ethical Guidelines ──
  { number:18, question:'Occupancy fraud occurs when:', options:['Taxes unpaid','Borrower misrepresents primary residence intent','Escrow shortage','ARM reset'], correct_index:1 },
  { number:19, question:'Fraud involving altered income documentation is:', options:['Appraisal fraud','Income fraud','Occupancy fraud','Equity stripping'], correct_index:1 },
  { number:20, question:'Ethical conduct requires placing:', options:['Employer profit first',"Borrower's best interest first",'Sales quota first','Volume goals first'], correct_index:1 },
  { number:21, question:'Which CE category must include fraud prevention?', options:['Federal law','Ethics','Non-traditional','Elective'], correct_index:1 },
  { number:22, question:'Which is a red flag for fraud?', options:['Clear documentation','Evasive borrower answers','Stable income','Consistent file'], correct_index:1 },
  // ── Module 3: Non-Traditional Mortgage Lending ──
  { number:23, question:'Negative amortization results in:', options:['Faster payoff','Reduced balance','Increasing loan balance','Fixed principal reduction'], correct_index:2 },
  { number:24, question:'Payment shock most commonly occurs when:', options:['Escrow decreases','Interest-only period ends','Loan balance decreases','Rate remains fixed'], correct_index:1 },
  { number:25, question:'Interest-only loans primarily delay:', options:['Escrow','Principal repayment','Insurance','Closing'], correct_index:1 },
  { number:26, question:'Risk layering increases:', options:['Loan simplicity','Default probability','Compliance ease','Equity growth'], correct_index:1 },
  { number:27, question:'An ARM rate is based on:', options:['Fixed rate','Index plus margin','Credit score','Escrow'], correct_index:1 },
  { number:28, question:'Refinancing dependence risk increases when:', options:['Rates fall','Property appreciates','Credit tightens','Income rises'], correct_index:2 },
  { number:29, question:'Consumer protection in non-traditional lending focuses on:', options:['Yield maximization','Suitability and disclosure','Removing ATR','Lower fees'], correct_index:1 },
  { number:30, question:'Which type of mortgage is most predictable?', options:['Payment option ARM','Interest-only','Fully amortizing fixed','Negative amortization'], correct_index:2 },
  // ── Module 4: New Mexico State Law ──
  { number:31, question:'Mortgage licenses in New Mexico are issued through:', options:['CFPB','New Mexico Financial Institutions Division','HUD','FDIC'], correct_index:1 },
  { number:32, question:'Operating without a New Mexico mortgage license may result in:', options:['Warning letter only','Administrative penalties','Escrow waiver','Rate reduction'], correct_index:1 },
  { number:33, question:'Administrative enforcement may include:', options:['Cease-and-desist orders','Escrow review','Rate reduction','Credit reporting'], correct_index:0 },
  { number:34, question:'The New Mexico Commissioner may issue:', options:['Stock penalties','Cease-and-desist orders','Escrow waivers','Appraisal exemptions'], correct_index:1 },
  { number:35, question:'New Mexico enforcement authority comes from:', options:['CFPB','New Mexico Financial Institutions Division','HUD','FDIC'], correct_index:1 },
];

// ─────────────────────────────────────────────────────────────────────
const courseData = {
  title:           '8-HOUR NM SAFE COMPREHENSIVE: ANNUAL MLO FUNDAMENTALS',
  nmls_course_id:  'CE-NM-SAFE-8HR',
  type:            'CE',
  credit_hours:    8,
  description:     'This 8-hour SAFE Act continuing education course covers federal mortgage law (3 hrs), ethics for MLOs (2 hrs), non-traditional mortgage lending (2 hrs), and New Mexico state law & Financial Institutions Division regulations (1 hr). Required annually for New Mexico licensed Mortgage Loan Originators.',
  price:           99.00,
  states_approved: ['NM'],
  has_textbook:    false,
  textbook_price:  0,
  is_active:       true,
  pdf_url:         NM_TEXTBOOK_PDF,

  modules: [

    // ── MODULE 1 ────────────────────────────────────────────────────
    {
      order: 1, title: 'Federal Mortgage-Related Laws', credit_hours: 3,
      pdf_url: NM_TEXTBOOK_PDF, show_pdf_before_quiz: false,
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
      pdf_url: NM_TEXTBOOK_PDF, show_pdf_before_quiz: false,
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
        { number:3, question:'What is the duty of a Mortgage Loan Originator (MLO) when facing conflicts of interest?', options:['To avoid all business relationships','To disclose any conflict clearly and promptly',"To ignore minor conflicts as they don't affect decisions","To rely solely on the employer's guidance"], correct_index:1 },
        { number:4, question:'Which of the following is a common form of mortgage fraud that MLOs must prevent?', options:['Inaccurate income reporting by borrowers','Borrower refusal to sign the Loan Estimate','Failure to provide Closing Disclosure','Offering discounts on closing costs'], correct_index:0 },
        { number:5, question:'What is the potential consequence for a Mortgage Loan Originator if they violate ethical guidelines?', options:['Increased market share','Civil penalties and license suspension','Higher commissions','No consequences'], correct_index:1 },
      ],
    },

    // ── MODULE 3 ────────────────────────────────────────────────────
    {
      order: 3, title: 'Non-Traditional Mortgage Lending', credit_hours: 2,
      pdf_url: NM_TEXTBOOK_PDF, show_pdf_before_quiz: false,
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
      order: 4, title: 'New Mexico State Law and Regulations', credit_hours: 1,
      pdf_url: NM_TEXTBOOK_PDF, show_pdf_before_quiz: false,
      sections: [
        '4.1 Overview of State Regulatory Authority in New Mexico (FID)',
        '4.2 State Continuing Education Requirements',
        '4.3 New Mexico Mortgage Licensing Requirements (NMLS)',
        '4.4 State Enforcement, Penalties, and Disciplinary Actions',
        '4.5 State Consumer Protection Provisions',
        'Module 4 Summary',
        'Case Study: The Unqualified Loan Processor',
      ],
      quiz: [
        // Answer key: 1B 2B 3B 4B 5C
        { number:1, question:'Which agency is responsible for regulating mortgage loan originators in New Mexico?', options:['New Mexico Department of Financial Regulation','New Mexico Financial Institutions Division (FID)','New Mexico Housing Authority','Federal Housing Administration (FHA)'], correct_index:1 },
        { number:2, question:'What is required for an individual to work as a mortgage loan originator in New Mexico?', options:['A high school diploma and 2 years of experience','An active NMLS license and completion of federal and state-specific education','Completion of a state background check only','No licensing requirements if the individual has prior experience'], correct_index:1 },
        { number:3, question:'What is one of the key responsibilities of employers under New Mexico mortgage law?', options:['Allowing unlicensed employees to perform mortgage origination duties while applying for a license','Ensuring all mortgage loan originators are properly licensed through NMLS','Paying for continuing education for employees without requiring NMLS certification','Ignoring licensure status if employees have worked in other states'], correct_index:1 },
        { number:4, question:'Which of the following can result in penalties for engaging in mortgage origination without a license in New Mexico?', options:['Warning and verbal reprimand','Administrative fines and license suspension','Suspension of personal bank accounts','Automatic re-certification'], correct_index:1 },
        { number:5, question:'What should a mortgage loan originator in New Mexico do to ensure they meet continuing education (CE) requirements?', options:['Rely on the employer to handle all CE reporting','Complete federal CE hours only','Complete both federal and New Mexico-specific CE courses through NMLS-approved providers','Submit CE records only if requested by the FID'], correct_index:2 },
      ],
    },

    // ── MODULE 5: FINAL - NEW MEXICO ────────────────────────────────
    // PDF-only lesson — NO quiz
    // Student reviews Final NM PDF then proceeds directly to Final Exam
    {
      order: 5, title: 'FINAL - NEW MEXICO', credit_hours: 0,
      pdf_url: NM_FINAL_PDF, show_pdf_before_quiz: false,
      sections: [
        '8-HOUR NM SAFE COMPREHENSIVE: ANNUAL MLO FUNDAMENTALS',
        'New Mexico State Law & FID Regulations — Full Review',
        'Review all four modules before attempting the Final Exam',
        'Covers: Federal Law · Ethics · Non-Traditional Lending · NM State Law',
      ],
      quiz: [], // ← NO checkpoint — proceeds directly to Final Exam
    },

  ],

  // ── OFFICIAL FINAL EXAM ─────────────────────────────────────────────
  // RETRY LOGIC (implement in your exam controller):
  //   attempt === 1  → serve FINAL_EXAM_35 (official 35-question set)
  //   attempt >= 2   → shuffle QUESTION_BANK_70, slice(0, 35) — new set each time
  final_exam: {
    title:              '8-HOUR NM SAFE COMPREHENSIVE: ANNUAL MLO FUNDAMENTALS — Final Exam',
    passing_score:      70,
    time_limit_minutes: 90,
    questions:          FINAL_EXAM_35,    // first attempt — official 35
    question_bank:      QUESTION_BANK_70, // retries — random 35 drawn from here
  },
};

// ─────────────────────────────────────────────────────────────────────
const seed = async () => {
  try {
    await mongoose.connect(process.env.MONGO_URI);
    console.log('✅ MongoDB connected');

    await Course.deleteOne({ nmls_course_id: 'CE-NM-SAFE-8HR' });
    console.log('🗑️  Removed existing NM SAFE course (if any)');

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
        console.log(`   Step ${(lessonStep + 1).toString().padStart(2)}  📋 Checkpoint — ${m.quiz.length} questions`);
      } else {
        console.log(`   Step ${(lessonStep + 1).toString().padStart(2)}  ⏭️  No Checkpoint — proceeds to Final Exam`);
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
    console.log('\n🎯 Test at: /courses/CE-NM-SAFE-8HR/learn');
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