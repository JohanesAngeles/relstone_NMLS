/**
 * seed_nj_safe_course.js
 * Drop this in: relstone_NMLS/server/
 * Run with:     node seed_nj_safe_course.js
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
 *   Step 9  📄 Lesson     — Module 5: New Jersey State Law and Regulations
 *   Step 10 📋 Checkpoint — Module 5 Quiz (5 questions)
 *   Step 11 📄 Lesson     — FINAL - NEW JERSEY (PDF review, no quiz)
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
const NJ_TEXTBOOK_PDF = 'https://www.dropbox.com/scl/fo/enrih9t4dnji9j47b2mge/AGJ9HITZYEolbvVDD49GdiA/NEW%20JERSEY/12-Hour%20NJ%20SAFE%20Comprehensive%20-%20Annual%20MLO%20Fundamentals.pdf?rlkey=jdwbravxwpfj6idgxzhxr3ynj&st=ndf9v0b7&raw=1';
const NJ_FINAL_PDF    = 'https://www.dropbox.com/scl/fi/q006ex5cqpa1w4r584fjv/FINAL.pdf?rlkey=3vl8y5qwdmhlvutcn977m92ll&st=y56fqyot&raw=1';

// ─────────────────────────────────────────────────────────────────────
// 70-QUESTION BANK — used as retry pool when student fails the final exam
// Backend: attempt === 1 → serve FINAL_EXAM_35
//          attempt >= 2  → shuffle QUESTION_BANK_70, slice(0, 35)
// ─────────────────────────────────────────────────────────────────────
const QUESTION_BANK_70 = [
  { number:1,  question:'Under the Ability-to-Repay rule, a creditor must make a:', options:['Collateral-only decision','Reasonable, good-faith determination','Commission-based decision','Credit-score-only evaluation'], correct_index:1 },
  { number:2,  question:'The New Jersey Residential Mortgage Lending Act is administered by the:', options:['CFPB','New Jersey Department of Banking and Insurance','HUD','FDIC'], correct_index:1 },
  { number:3,  question:'RESPA Section 8 prohibits:', options:['Adjustable-rate mortgages','Kickbacks and unearned fees','Escrow accounts','Balloon payments'], correct_index:1 },
  { number:4,  question:'Negative amortization results in:', options:['Faster loan payoff','Reduced loan balance','Increasing loan balance','Fixed principal payments'], correct_index:2 },
  { number:5,  question:'The SAFE Act requires a minimum of how many hours of pre-licensing education?', options:['15','20','25','30'], correct_index:1 },
  { number:6,  question:'The Loan Estimate must be delivered within:', options:['2 business days','3 business days','5 business days','7 business days'], correct_index:1 },
  { number:7,  question:'APR represents:', options:['Note rate only','Cost of credit expressed as a yearly rate','Escrow balance','Property taxes'], correct_index:1 },
  { number:8,  question:'Redlining refers to:', options:['Charging higher points','Refusing loans based on neighborhood demographics','Increasing APR','Charging appraisal fees'], correct_index:1 },
  { number:9,  question:'Annual continuing education for MLOs requires:', options:['6 hours','7 hours','8 hours','12 hours'], correct_index:2 },
  { number:10, question:'An MLO must obtain a unique identifier through:', options:['HUD','CFPB','NMLS','OCC'], correct_index:2 },
  { number:11, question:'Payment shock most commonly occurs when:', options:['Escrow decreases','Interest-only period ends','Loan balance decreases','Rate remains fixed'], correct_index:1 },
  { number:12, question:'The federal agency primarily enforcing TILA for nonbanks is:', options:['OCC','FDIC','CFPB','Federal Reserve'], correct_index:2 },
  { number:13, question:'Under ECOA, adverse action notice must be provided within:', options:['15 days','20 days','30 days','45 days'], correct_index:2 },
  { number:14, question:'Which is a protected class under the Fair Housing Act?', options:['Credit score','Disability','Income level','Loan size'], correct_index:1 },
  { number:15, question:'A Qualified Mortgage generally limits points and fees to:', options:['2%','3%','4%','5%'], correct_index:1 },
  { number:16, question:'HMDA requires reporting of:', options:['Advertising expenses','Mortgage application data','Employee bonuses','Underwriting software'], correct_index:1 },
  { number:17, question:'TRID integrated disclosures from:', options:['ECOA and FHA','TILA and RESPA','SAFE and HMDA','ATR and QM'], correct_index:1 },
  { number:18, question:'Reverse redlining refers to:', options:['Serving all communities equally','Targeting protected classes for high-cost loans','Avoiding rural lending','Lowering rates'], correct_index:1 },
  { number:19, question:'The Closing Disclosure must be provided:', options:['At application','1 day before closing','3 business days before consummation','After closing'], correct_index:2 },
  { number:20, question:'The SAFE exam requires a minimum passing score of:', options:['70%','75%','80%','85%'], correct_index:1 },
  { number:21, question:'Section 8(b) of RESPA prohibits:', options:['Balloon loans','Unearned fee splitting','ARMs','Escrow accounts'], correct_index:1 },
  { number:22, question:'Disparate impact refers to:', options:['Intentional discrimination','Neutral policy with discriminatory effect','Rate changes','Credit scoring'], correct_index:1 },
  { number:23, question:'Under New Jersey law, mortgage licenses are issued through:', options:['CFPB','NJ Department of Banking and Insurance','HUD','Federal Reserve'], correct_index:1 },
  { number:24, question:'Which feature is prohibited in most Qualified Mortgages?', options:['Fixed rate','Negative amortization','Escrow account','15-year term'], correct_index:1 },
  { number:25, question:'APR tolerance for regular transactions is:', options:['0.50%','0.25%','0.125%','1%'], correct_index:2 },
  { number:26, question:'The Ability-to-Repay rule was strengthened by:', options:['SAFE Act','Dodd-Frank Act','HMDA','RESPA'], correct_index:1 },
  { number:27, question:'Under ECOA, records must be retained for:', options:['12 months','18 months','24 months','25 months'], correct_index:3 },
  { number:28, question:'Zero-tolerance fees include:', options:['Escrow deposits','Lender origination charges','Insurance premiums','Prepaid interest'], correct_index:1 },
  { number:29, question:'HOEPA applies to:', options:['All conventional loans','High-cost mortgages','FHA loans only','USDA loans only'], correct_index:1 },
  { number:30, question:'The SAFE Act was enacted in:', options:['2005','2007','2008','2010'], correct_index:2 },
  { number:31, question:'Occupancy fraud occurs when:', options:['Taxes unpaid','Borrower misrepresents primary residence intent','Escrow shortage','ARM reset'], correct_index:1 },
  { number:32, question:'Fraud involving altered income documentation is:', options:['Appraisal fraud','Income fraud','Occupancy fraud','Equity stripping'], correct_index:1 },
  { number:33, question:'Which is a red flag for fraud?', options:['Clear documentation','Evasive borrower answers','Stable income','Consistent file'], correct_index:1 },
  { number:34, question:"Ethical conduct requires placing:", options:['Employer profit first',"Borrower's best interest first",'Sales quota first','Volume goals first'], correct_index:1 },
  { number:35, question:'Disparate treatment is:', options:['Neutral policy effect','Intentional discrimination','Credit pricing','ARM reset'], correct_index:1 },
  { number:36, question:'Negative amortization primarily causes:', options:['Reduced balance','Increased balance','Fixed payment','Lower risk'], correct_index:1 },
  { number:37, question:'Interest-only loans primarily delay:', options:['Escrow','Principal repayment','Insurance','Closing'], correct_index:1 },
  { number:38, question:'Risk layering increases:', options:['Loan simplicity','Default probability','Compliance ease','Equity growth'], correct_index:1 },
  { number:39, question:'An ARM rate is based on:', options:['Fixed rate only','Index plus margin','Credit score','Escrow'], correct_index:1 },
  { number:40, question:'Refinancing dependence risk increases when:', options:['Rates fall','Property appreciates','Credit tightens','Income rises'], correct_index:2 },
  { number:41, question:'Consumer protection in non-traditional lending focuses on:', options:['Yield maximization','Suitability and disclosure','Removing ATR','Lower fees'], correct_index:1 },
  { number:42, question:'Which type of mortgage is most predictable?', options:['Payment option ARM','Interest-only','Fully amortizing fixed','Negative amortization'], correct_index:2 },
  { number:43, question:'Equity erosion risk is highest in:', options:['Fixed-rate mortgages','Fully amortizing loans','Negative amortization loans','FHA loans'], correct_index:2 },
  { number:44, question:'Borrower suitability assessment requires:', options:['Maximizing loan size','Evaluating long-term affordability','Ignoring reserves','Avoiding ATR'], correct_index:1 },
  { number:45, question:'Under New Jersey law, operating without a license may result in:', options:['Warning letter only','Administrative penalties','Escrow waiver','Rate reduction'], correct_index:1 },
  { number:46, question:'Administrative enforcement may include:', options:['Cease-and-desist orders','Escrow review','Rate reductions','Credit reporting'], correct_index:0 },
  { number:47, question:'New Jersey enforcement authority comes from:', options:['CFPB','NJ Department of Banking and Insurance','HUD','FDIC'], correct_index:1 },
  { number:48, question:'Bank statement loans are commonly used by:', options:['W-2 employees','Self-employed borrowers','Retirees only','FHA borrowers'], correct_index:1 },
  { number:49, question:'A Qualified Mortgage requires ATR compliance under:', options:['TILA','Dodd-Frank','HMDA','FHA'], correct_index:1 },
  { number:50, question:'HMDA helps regulators:', options:['Set rates','Detect discriminatory lending','Calculate APR','Approve loans'], correct_index:1 },
  { number:51, question:'A borrower must receive appraisals:', options:['Only upon request','Free of charge','After closing','Only if denied'], correct_index:1 },
  { number:52, question:'Refusing loans based on race violates:', options:['SAFE Act','RESPA','Fair Housing Act','HMDA'], correct_index:2 },
  { number:53, question:'Minimum CE hours annually for MLOs:', options:['6','7','8','12'], correct_index:3 },
  { number:54, question:'APR includes:', options:['Property taxes','Interest and certain finance charges','Title fees only','Escrow'], correct_index:1 },
  { number:55, question:'Under RESPA Section 9, sellers may not:', options:['Require specific title insurer','Adjust rates','Charge taxes','Require escrow'], correct_index:0 },
  { number:56, question:'TRID requires redisclosure if APR becomes:', options:['Lower','Inaccurate beyond tolerance','Fixed','Higher than note'], correct_index:1 },
  { number:57, question:'A high-cost mortgage requires additional:', options:['Advertising','Counseling disclosures','Appraisal waivers','Escrow removal'], correct_index:1 },
  { number:58, question:'The Fair Housing Act is enforced primarily by:', options:['CFPB','HUD','OCC','FDIC'], correct_index:1 },
  { number:59, question:'Risk of equity erosion increases when:', options:['Balance shrinks','Balance grows','Rate fixed','Escrow stable'], correct_index:1 },
  { number:60, question:'Which is NOT protected under FHA but IS under ECOA?', options:['Race','Religion','Marital status','National origin'], correct_index:2 },
  { number:61, question:'An affiliated business arrangement is permitted if:', options:['Mandatory use','Proper disclosure and optional use','Hidden fee','Secret referral'], correct_index:1 },
  { number:62, question:'Documentation standards are essential to:', options:['Increase commissions','Demonstrate compliance','Avoid disclosures','Remove QM'], correct_index:1 },
  { number:63, question:'Which CE category must include fraud prevention?', options:['Federal law','Ethics','Non-traditional','Elective'], correct_index:1 },
  { number:64, question:'Reverse redlining most directly violates:', options:['SAFE Act','Fair Housing Act','HMDA','ECOA'], correct_index:1 },
  { number:65, question:'Which underwriting factor is required under ATR?', options:['Property appreciation','Credit score only','Current income or assets','Commission structure'], correct_index:2 },
  { number:66, question:'HMDA data must be submitted by:', options:['January 1','February 1','March 1','April 1'], correct_index:2 },
  { number:67, question:'The New Jersey Commissioner may issue:', options:['Stock penalties','Cease-and-desist orders','Escrow waivers','Appraisal exemptions'], correct_index:1 },
  { number:68, question:'Payment shock is best described as:', options:['Gradual increase','Sudden significant payment increase','Escrow decrease','Fixed payment'], correct_index:1 },
  { number:69, question:'Negative amortization is most commonly associated with:', options:['Fully amortizing loans','Payment option ARMs','15-year fixed loans','FHA loans'], correct_index:1 },
  { number:70, question:'Failure to comply with disclosure requirements may result in:', options:['Higher commissions','Regulatory penalties','Lower APR','Faster closing'], correct_index:1 },
];

// ── Official Final Exam: 35 Questions (first attempt) ─────────────────
const FINAL_EXAM_35 = [
  { number:1,  question:'Under the Ability-to-Repay rule, a creditor must make a:', options:['Collateral-only decision','Reasonable, good-faith determination','Commission-based decision','Credit-score-only evaluation'], correct_index:1 },
  { number:2,  question:'RESPA Section 8 prohibits:', options:['Adjustable-rate mortgages','Kickbacks and unearned fees','Escrow accounts','Balloon payments'], correct_index:1 },
  { number:3,  question:'The SAFE Act requires a minimum of how many hours of pre-licensing education?', options:['15','20','25','30'], correct_index:1 },
  { number:4,  question:'The Loan Estimate must be delivered within:', options:['2 business days','3 business days','5 business days','7 business days'], correct_index:1 },
  { number:5,  question:'APR represents:', options:['Note rate only','Cost of credit expressed as a yearly rate','Escrow balance','Property taxes'], correct_index:1 },
  { number:6,  question:'Redlining refers to:', options:['Charging higher points','Refusing loans based on neighborhood demographics','Increasing APR','Charging appraisal fees'], correct_index:1 },
  { number:7,  question:'Annual continuing education for MLOs requires:', options:['6 hours','7 hours','8 hours','12 hours'], correct_index:2 },
  { number:8,  question:'An MLO must obtain a unique identifier through:', options:['HUD','CFPB','NMLS','OCC'], correct_index:2 },
  { number:9,  question:'Occupancy fraud occurs when:', options:['Taxes unpaid','Borrower misrepresents primary residence intent','Escrow shortage','ARM reset'], correct_index:1 },
  { number:10, question:'Fraud involving altered income documentation is:', options:['Appraisal fraud','Income fraud','Occupancy fraud','Equity stripping'], correct_index:1 },
  { number:11, question:'Which is a red flag for fraud?', options:['Clear documentation','Evasive borrower answers','Stable income','Consistent file'], correct_index:1 },
  { number:12, question:"Ethical conduct requires placing:", options:['Employer profit first',"Borrower's best interest first",'Sales quota first','Volume goals first'], correct_index:1 },
  { number:13, question:'Which CE category must include fraud prevention?', options:['Federal law','Ethics','Non-traditional','Elective'], correct_index:1 },
  { number:14, question:'Negative amortization results in:', options:['Faster loan payoff','Reduced loan balance','Increasing loan balance','Fixed principal payments'], correct_index:2 },
  { number:15, question:'Payment shock most commonly occurs when:', options:['Escrow decreases','Interest-only period ends','Loan balance decreases','Rate remains fixed'], correct_index:1 },
  { number:16, question:'Interest-only loans primarily delay:', options:['Escrow','Principal repayment','Insurance','Closing'], correct_index:1 },
  { number:17, question:'Risk layering increases:', options:['Loan simplicity','Default probability','Compliance ease','Equity growth'], correct_index:1 },
  { number:18, question:'An ARM rate is based on:', options:['Fixed rate only','Index plus margin','Credit score','Escrow'], correct_index:1 },
  { number:19, question:'Refinancing dependence risk increases when:', options:['Rates fall','Property appreciates','Credit tightens','Income rises'], correct_index:2 },
  { number:20, question:'Consumer protection in non-traditional lending focuses on:', options:['Yield maximization','Suitability and disclosure','Removing ATR','Lower fees'], correct_index:1 },
  { number:21, question:'Which type of mortgage is most predictable?', options:['Payment option ARM','Interest-only','Fully amortizing fixed','Negative amortization'], correct_index:2 },
  { number:22, question:'Equity erosion risk is highest in:', options:['Fixed-rate mortgages','Fully amortizing loans','Negative amortization loans','FHA loans'], correct_index:2 },
  { number:23, question:'Borrower suitability assessment requires:', options:['Maximizing loan size','Evaluating long-term affordability','Ignoring reserves','Avoiding ATR'], correct_index:1 },
  { number:24, question:'Payment shock is best described as:', options:['Gradual increase','Sudden significant payment increase','Escrow decrease','Fixed payment'], correct_index:1 },
  { number:25, question:'Negative amortization is most commonly associated with:', options:['Fully amortizing loans','Payment option ARMs','15-year fixed loans','FHA loans'], correct_index:1 },
  { number:26, question:'Risk of equity erosion increases when:', options:['Balance shrinks','Balance grows','Rate fixed','Escrow stable'], correct_index:1 },
  { number:27, question:'A Mortgage Loan Originator is an individual who:', options:['only underwrites loans','only processes closing documents','takes an application or offers/negotiates terms','only orders appraisals'], correct_index:2 },
  { number:28, question:'The "Loan Manufacturing Initiator" role primarily focuses on:', options:['setting interest rates','verifying borrower info and document collection','approving credit decisions','issuing Closing Disclosures'], correct_index:1 },
  { number:29, question:"The MLO's role as a 'Consumer Advisor & Advocate' is best described as:", options:['encouraging highest loan amounts','assessing borrower needs through profiling and guidance','avoiding product comparisons','limiting disclosures'], correct_index:1 },
  { number:30, question:'The New Jersey Residential Mortgage Lending Act is administered by the:', options:['CFPB','New Jersey Department of Banking and Insurance','HUD','FDIC'], correct_index:1 },
  { number:31, question:'Under New Jersey law, mortgage licenses are issued through:', options:['CFPB','NJ Department of Banking and Insurance','HUD','Federal Reserve'], correct_index:1 },
  { number:32, question:'Under New Jersey law, operating without a license may result in:', options:['Warning letter only','Administrative penalties','Escrow waiver','Rate reduction'], correct_index:1 },
  { number:33, question:'Administrative enforcement may include:', options:['Cease-and-desist orders','Escrow review','Rate reductions','Credit reporting'], correct_index:0 },
  { number:34, question:'New Jersey enforcement authority comes from:', options:['CFPB','NJ Department of Banking and Insurance','HUD','FDIC'], correct_index:1 },
  { number:35, question:'The New Jersey Commissioner may issue:', options:['Stock penalties','Cease-and-desist orders','Escrow waivers','Appraisal exemptions'], correct_index:1 },
];

// ─────────────────────────────────────────────────────────────────────
const courseData = {
  title:           '12-HOUR NJ SAFE COMPREHENSIVE: ANNUAL MLO FUNDAMENTALS',
  nmls_course_id:  'CE-NJ-SAFE-12HR',
  type:            'CE',
  credit_hours:    12,
  description:     'Comprehensive 12-hour SAFE Act continuing education course covering Federal Mortgage-Related Laws, Ethical Guidelines, Non-Traditional Lending, Mortgage Origination, and New Jersey State Law & Regulations.',
  price:           149.00,
  states_approved: ['NJ'],
  has_textbook:    false,
  textbook_price:  0,
  is_active:       true,
  pdf_url:         NJ_TEXTBOOK_PDF,

  modules: [

    // ── MODULE 1 ────────────────────────────────────────────────────
    {
      order:        1,
      title:        'Federal Mortgage-Related Laws',
      credit_hours: 3,
      pdf_url:      NJ_TEXTBOOK_PDF,
      show_pdf_before_quiz: false,
      sections: [
        '1.1 TILA Overview',
        '1.2 ECOA and Fair Housing',
        '1.3 RESPA and Settlement Costs',
        '1.4 HMDA Reporting Requirements',
        '1.5 SAFE Act Overview',
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
      title:        'Ethical Guidelines for Mortgage Loan Originators',
      credit_hours: 2,
      pdf_url:      NJ_TEXTBOOK_PDF,
      show_pdf_before_quiz: false,
      sections: [
        '2.1 MLO Responsibilities',
        '2.2 Dodd-Frank Compensation Prohibitions',
        '2.3 Conflicts of Interest and Disclosure',
        '2.4 Fraud Prevention',
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
      credit_hours: 2,
      pdf_url:      NJ_TEXTBOOK_PDF,
      show_pdf_before_quiz: false,
      sections: [
        '3.1 Overview of Non-Traditional Mortgage Products',
        '3.2 Interest-Only Mortgage Risks',
        '3.3 Alternative Income Documentation',
        '3.4 SAFE Act Requirements for Non-Traditional Lending',
        '3.5 Consumer Risks and Suitability',
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
      pdf_url:      NJ_TEXTBOOK_PDF,
      show_pdf_before_quiz: false,
      sections: [
        '4.1 The Loan Application Process',
        '4.2 Loan Estimate — Contents and Timelines',
        '4.3 Role of the MLO in Underwriting',
        '4.4 Automated Underwriting Systems (AUS)',
        '4.5 Closing Disclosure Requirements',
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

    // ── MODULE 5 ────────────────────────────────────────────────────
    {
      order:        5,
      title:        'New Jersey State Law and Regulations',
      credit_hours: 3,
      pdf_url:      NJ_TEXTBOOK_PDF,
      show_pdf_before_quiz: false,
      sections: [
        '5.1 New Jersey Department of Banking and Insurance (DOBI)',
        '5.2 NJ Residential Mortgage Lending Act (RMLA)',
        '5.3 Licensing Requirements and NMLS',
        '5.4 Prohibited Acts and Enforcement',
        '5.5 Continuing Education Requirements',
        '5.6 Consumer Protection Provisions',
        'Module 5 Summary',
        'Case Study: The Unlicensed Activity Problem',
      ],
      quiz: [
        // Answer key: 1B 2C 3C 4B 5C
        { number:1, question:'Which of the following best describes the primary purpose of New Jersey\'s state regulatory authority over mortgage lending?', options:['To maximize state tax revenue from mortgage transactions','To ensure mortgage transactions are conducted in a lawful, ethical, transparent, and consumer-focused manner','To set federal baseline lending standards applicable nationwide','To provide mortgage loans directly to qualified borrowers'], correct_index:1 },
        { number:2, question:'Under New Jersey law, which of the following is NOT listed as a prohibited act or practice for mortgage professionals?', options:['Material misrepresentation or omission of information','Engaging in mortgage activity without proper licensure','Requesting clarification from legal counsel when uncertainty exists','Failure to supervise employees or third-party vendors'], correct_index:2 },
        { number:3, question:'A licensed mortgage entity discovers that one of its employees has been engaging in deceptive practices with borrowers without the employer\'s knowledge. What is most likely true regarding the employer\'s liability under New Jersey law?', options:['The employer bears no liability because the misconduct was committed by another person','Only the employee can be subject to enforcement action, not the licensed entity','The licensed entity may face enforcement action for failure to adequately supervise','Liability is limited to situations where the employer directed the misconduct'], correct_index:2 },
        { number:4, question:'When the New Jersey regulatory authority conducts a regulatory examination, which of the following may examiners review to assess compliance?', options:['Only the licensee\'s criminal background and personal financial statements','Loan files, disclosures, advertising materials, internal policies, training records, and compliance controls','Exclusively the borrower\'s credit reports and income documentation','Only records that the licensee voluntarily agrees to provide'], correct_index:1 },
        { number:5, question:'According to the module, what is the significance of completing state-required continuing education from a regulatory perspective?', options:['It serves as a guaranteed defense against any enforcement action brought by the state','It is merely an administrative formality with no bearing on a licensee\'s compliance standing','It demonstrates ongoing professional competence and that the licensee has taken reasonable steps to remain informed and compliant','It only applies to new licensees obtaining their initial mortgage license'], correct_index:2 },
      ],
    },

    // ── MODULE 6: FINAL - NEW JERSEY ────────────────────────────────
    // PDF-only lesson — NO quiz
    // Student reads the Final NJ PDF, then proceeds directly to the Final Exam
    // On failure: Final Exam retries with random 35 from QUESTION_BANK_70
    {
      order:        6,
      title:        'FINAL - NEW JERSEY',
      credit_hours: 0,
      pdf_url:      NJ_FINAL_PDF,
      show_pdf_before_quiz: false,
      sections: [
        '12-HOUR NJ SAFE COMPREHENSIVE: ANNUAL MLO FUNDAMENTALS',
        'New Jersey State-Specific Law & DOBI Regulations — Full Review',
        'Review all five modules before attempting the Final Exam',
        'Covers: Federal Law · Ethics · Non-Traditional Lending · Mortgage Origination · NJ State Law',
      ],
      quiz: [], // ← NO checkpoint — student proceeds directly to Final Exam
    },

  ],

  // ── OFFICIAL FINAL EXAM ─────────────────────────────────────────────
  //
  // RETRY LOGIC (implement in your exam controller):
  //   attempt === 1  → serve FINAL_EXAM_35 (official 35-question set)
  //   attempt >= 2   → shuffle QUESTION_BANK_70, slice(0, 35)
  //                    → each retry gets a different random 35 from the bank
  //
  // The question_bank field stores the 70 questions for backend retry logic.
  // ───────────────────────────────────────────────────────────────────
  final_exam: {
    title:              '12-HOUR NJ SAFE COMPREHENSIVE: ANNUAL MLO FUNDAMENTALS — Final Exam',
    passing_score:      75,
    time_limit_minutes: 120,
    questions:          FINAL_EXAM_35,     // first attempt — official 35
    question_bank:      QUESTION_BANK_70,  // retries — random 35 drawn from here
  },
};

// ─────────────────────────────────────────────────────────────────────
const seed = async () => {
  try {
    await mongoose.connect(process.env.MONGO_URI);
    console.log('✅ MongoDB connected');

    await Course.deleteOne({ nmls_course_id: 'CE-NJ-SAFE-12HR' });
    console.log('🗑️  Removed existing NJ SAFE course (if any)');

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
    console.log('\n🎯 Test at: /courses/CE-NJ-SAFE-12HR/learn');
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