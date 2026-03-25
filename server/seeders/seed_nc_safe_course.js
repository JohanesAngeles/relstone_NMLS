/**
 * seed_nc_safe_course.js
 * Drop this in: relstone_NMLS/server/
 * Run with:    node seed_nc_safe_course.js
 *
 * COURSE STRUCTURE:
 *   Step 1  📄 Lesson     — Module 1: Federal Mortgage-Related Laws
 *   Step 2  📋 Checkpoint — Module 1 Quiz (5 questions)
 *   Step 3  📄 Lesson     — Module 2: Ethical Guidelines for MLOs
 *   Step 4  📋 Checkpoint — Module 2 Quiz (5 questions)
 *   Step 5  📄 Lesson     — Module 3: Non-Traditional Mortgage Lending
 *   Step 6  📋 Checkpoint — Module 3 Quiz (5 questions)
 *   Step 7  📄 Lesson     — Module 4: North Carolina State Law and Regulations
 *   Step 8  📋 Checkpoint — Module 4 Quiz (5 questions)
 *   Step 9  📄 Lesson     — FINAL - NORTH CAROLINA (PDF review, no quiz)
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
const NC_TEXTBOOK_PDF = 'https://www.dropbox.com/scl/fi/ja4entj37q7bbxvl2i0h8/North-Carolina-NMLS-CE.pdf?rlkey=v8k971n9yrm6clcsx3nsdnx9w&st=4z3xauhb&raw=1';
const NC_FINAL_PDF    = 'https://www.dropbox.com/scl/fi/1eulgb35thrz2huijqoi2/North-Carolina-NMLS-CE.pdf?rlkey=srf8lu7l2olhxna07bu3gano8&st=64npf59t&raw=1';

// ── 70-Question Retry Bank ────────────────────────────────────────────
// Answer key from document applied to all 70 questions
const QUESTION_BANK_70 = [
  { number:1,  question:'Under the Ability-to-Repay rule, creditors must make a:', options:['Collateral-only determination','Reasonable, good-faith determination','Profit-based determination','Credit-score-only determination'], correct_index:1 },
  { number:2,  question:'The Truth in Lending Act (TILA) primarily promotes:', options:['Lender profitability','Informed consumer credit decisions','Faster underwriting','Adjustable rate lending'], correct_index:1 },
  { number:3,  question:'RESPA Section 8 prohibits:', options:['Escrow accounts','Adjustable-rate loans','Kickbacks and unearned fees','Loan Estimates'], correct_index:2 },
  { number:4,  question:'The Loan Estimate must be delivered within:', options:['2 business days','3 business days','5 business days','7 business days'], correct_index:1 },
  { number:5,  question:'The Closing Disclosure must be provided at least:', options:['1 business day before closing','2 business days before consummation','3 business days before consummation','After closing'], correct_index:2 },
  { number:6,  question:'HOEPA applies to:', options:['FHA loans only','Reverse mortgages only','High-cost mortgages','USDA loans only'], correct_index:2 },
  { number:7,  question:'ECOA prohibits discrimination based on:', options:['Loan amount','Credit score','Marital status','Property value'], correct_index:2 },
  { number:8,  question:'HMDA requires reporting of:', options:['Commission schedules','Mortgage application data','Escrow balances','Marketing budgets'], correct_index:1 },
  { number:9,  question:'A Qualified Mortgage generally prohibits:', options:['Escrow accounts','Fixed interest rates','Negative amortization','15-year terms'], correct_index:2 },
  { number:10, question:'TRID integrated disclosures under:', options:['ECOA and HMDA','TILA and RESPA','SAFE and HOEPA','FHA and VA'], correct_index:1 },
  { number:11, question:'Redlining refers to:', options:['Charging higher APR','Refusing loans based on neighborhood demographics','Credit-tier pricing','ARM adjustments'], correct_index:1 },
  { number:12, question:'Disparate impact refers to:', options:['Intentional discrimination','Neutral policy causing discriminatory effect','Credit scoring tiers','Loan repricing'], correct_index:1 },
  { number:13, question:'Under ECOA, application records must generally be retained for:', options:['12 months','18 months','24 months','36 months'], correct_index:3 },
  { number:14, question:'The SAFE Act requires minimum pre-licensing education of:', options:['15 hours','20 hours','25 hours','30 hours'], correct_index:1 },
  { number:15, question:'APR represents:', options:['Note rate only','Escrow amount','Cost of credit expressed as a yearly rate','Index rate only'], correct_index:2 },
  { number:16, question:'Ethical integrity requires:', options:['Maximizing commission','Honest representation of loan terms','Steering borrowers','Withholding material information'], correct_index:1 },
  { number:17, question:'Reverse redlining involves:', options:['Equal pricing','Targeting protected classes for high-cost loans','FHA underwriting','Avoiding rural lending'], correct_index:1 },
  { number:18, question:'A straw buyer typically:', options:['Occupies the property','Purchases on behalf of another person','Uses FHA insurance','Pays extra principal'], correct_index:1 },
  { number:19, question:'Income fraud involves:', options:['Inflated appraisal','Altered income documentation','Escrow shortage','ARM miscalculation'], correct_index:1 },
  { number:20, question:'Risk layering increases:', options:['Loan stability','Default probability','Compliance ease','Equity growth'], correct_index:1 },
  { number:21, question:'Payment shock most commonly occurs when:', options:['Taxes decrease','Interest-only period ends','DTI improves','Escrow decreases'], correct_index:1 },
  { number:22, question:'Suitability assessment focuses on:', options:['Maximum loan size','Long-term affordability','Commission potential','Closing speed'], correct_index:1 },
  { number:23, question:'A red flag for fraud includes:', options:['Stable employment','Clear documentation','Evasive borrower answers','Verified income'], correct_index:2 },
  { number:24, question:'Ethical conduct requires placing:', options:['Employer profit first',"Borrower's best interest first",'Volume first','Commission first'], correct_index:1 },
  { number:25, question:'Documentation standards are important to:', options:['Increase sales','Demonstrate compliance','Avoid disclosures','Eliminate ATR'], correct_index:1 },
  { number:26, question:'Negative amortization results in:', options:['Faster equity growth','Reduced loan balance','Increasing loan balance','Fixed payments'], correct_index:2 },
  { number:27, question:'Interest-only loans delay repayment of:', options:['Taxes','Escrow','Principal','Insurance'], correct_index:2 },
  { number:28, question:'An ARM rate is based on:', options:['Note rate only','Index plus margin','Credit score','Escrow change'], correct_index:1 },
  { number:29, question:'Balloon payments are generally prohibited in:', options:['FHA loans','Qualified Mortgages','Conventional loans','VA loans'], correct_index:1 },
  { number:30, question:'The most predictable mortgage product is:', options:['Payment-option ARM','Interest-only','Fully amortizing fixed-rate','Negative amortization'], correct_index:2 },
  { number:31, question:'High-cost mortgage status may be triggered when APR exceeds APOR by:', options:['3%','4%','6.5% (first lien)','10%'], correct_index:2 },
  { number:32, question:'Equity erosion risk increases when the loan balance:', options:['Decreases','Remains fixed','Increases','Is refinanced'], correct_index:2 },
  { number:33, question:'Refinancing dependence creates risk when:', options:['Rates decline','Property appreciates','Credit conditions tighten','Income rises'], correct_index:2 },
  { number:34, question:'Consumer protection in non-traditional lending emphasizes:', options:['Yield spread','Suitability and disclosure','Removing ATR','Lower DTI only'], correct_index:1 },
  { number:35, question:'Bank statement loans are typically used by:', options:['W-2 employees','Self-employed borrowers','FHA borrowers only','Retirees only'], correct_index:1 },
  { number:36, question:'Mortgage licensing in North Carolina is regulated by the:', options:['HUD','CFPB','North Carolina Commissioner of Banks','Federal Reserve'], correct_index:2 },
  { number:37, question:'MLOs must obtain a unique identifier through:', options:['HUD','CFPB','NMLS','FDIC'], correct_index:2 },
  { number:38, question:'Minimum annual CE required under SAFE Act is:', options:['6 hours','7 hours','8 hours','10 hours'], correct_index:2 },
  { number:39, question:'Operating without a mortgage license in North Carolina may result in:', options:['Increased commission','Administrative penalties','Lower APR','Loan approval'], correct_index:1 },
  { number:40, question:'Administrative enforcement may include:', options:['Credit score reduction','Cease-and-desist orders','Escrow suspension','Rate increases'], correct_index:1 },
  { number:41, question:'License renewal requires completion of:', options:['Federal exam','Continuing education','Pre-licensing hours','Appraisal course'], correct_index:1 },
  { number:42, question:'North Carolina regulators may conduct:', options:['Credit scoring','Compliance examinations','Appraisal adjustments','Marketing audits only'], correct_index:1 },
  { number:43, question:'Failure to comply with state disclosure requirements may result in:', options:['Faster closing','Regulatory penalties','Higher APR','Reduced documentation'], correct_index:1 },
  { number:44, question:'The SAFE Act was enacted in:', options:['2005','2007','2008','2010'], correct_index:2 },
  { number:45, question:'Licensees must maintain records primarily to:', options:['Increase sales','Demonstrate compliance','Avoid disclosures','Eliminate ATR'], correct_index:1 },
  { number:46, question:'A Qualified Mortgage generally limits points and fees to:', options:['2%','3%','4%','5%'], correct_index:1 },
  { number:47, question:'Zero-tolerance fees include:', options:['Prepaid interest','Lender origination charges','Escrow deposits','Property taxes'], correct_index:1 },
  { number:48, question:'Section 9 of RESPA prohibits sellers from requiring:', options:['Specific lender','Specific title insurer','FHA loan','Escrow account'], correct_index:1 },
  { number:49, question:'An adverse action notice must generally be provided within:', options:['15 days','20 days','30 days','45 days'], correct_index:2 },
  { number:50, question:'Refusing to make loans based on race violates:', options:['SAFE Act','RESPA','Fair Housing Act','HMDA'], correct_index:2 },
  { number:51, question:'The Fair Housing Act is primarily enforced by:', options:['CFPB','HUD','FDIC','OCC'], correct_index:1 },
  { number:52, question:'APR tolerance for regular transactions is generally:', options:['0.50%','0.25%','0.125%','1%'], correct_index:2 },
  { number:53, question:'CE must include which required category?', options:['Advertising','Fraud prevention','Appraisal standards','Marketing'], correct_index:1 },
  { number:54, question:'Under ATR, creditors must consider how many underwriting factors?', options:['6','7','8','9'], correct_index:2 },
  { number:55, question:'The Closing Disclosure replaced the:', options:['GFE and HUD-1','Note','Deed','Appraisal'], correct_index:0 },
  { number:56, question:'Reverse mortgages are generally available to borrowers age:', options:['55+','60+','62+','65+'], correct_index:2 },
  { number:57, question:'HMDA data helps regulators:', options:['Set interest rates','Identify discriminatory lending patterns','Increase commissions','Determine DTI'], correct_index:1 },
  { number:58, question:'Disparate treatment involves:', options:['Neutral policy','Intentional discrimination','Credit tiers','ARM adjustments'], correct_index:1 },
  { number:59, question:'Equity stripping often involves:', options:['Low fees','Excessive fees','Fixed rates','Low DTI'], correct_index:1 },
  { number:60, question:'A compliance management system helps institutions:', options:['Avoid regulation','Demonstrate regulatory oversight','Increase commissions','Reduce documentation'], correct_index:1 },
  { number:61, question:'APR includes:', options:['Property taxes','HOA dues','Interest and certain finance charges','Escrow deposits'], correct_index:2 },
  { number:62, question:'A high-cost mortgage under HOEPA may trigger at:', options:['3% above APOR','4% above APOR','6.5% above APOR (first lien)','10% above APOR'], correct_index:2 },
  { number:63, question:'Operating without NMLS registration violates:', options:['TILA','HMDA','SAFE Act','FHA'], correct_index:2 },
  { number:64, question:'Documentation accuracy helps prevent:', options:['Equity growth','Fraud','Fixed rates','Escrow accounts'], correct_index:1 },
  { number:65, question:'Interest-only loans increase risk of:', options:['Immediate equity','Equity erosion','Lower DTI','Faster amortization'], correct_index:1 },
  { number:66, question:'Which is a protected class under FHA?', options:['Credit score','Disability','Loan amount','Property value'], correct_index:1 },
  { number:67, question:'A cease-and-desist order is an example of:', options:['Marketing policy','Administrative enforcement','Escrow adjustment','Commission policy'], correct_index:1 },
  { number:68, question:'Failure to comply with federal mortgage law may result in:', options:['Higher commission','Regulatory penalties','Lower APR','Loan acceleration'], correct_index:1 },
  { number:69, question:'Bank statement loans require careful review of:', options:['Escrow deposits','Consistent income patterns','Property taxes','HOA fees'], correct_index:1 },
  { number:70, question:'Ethical transparency requires:', options:['Using industry jargon','Clear explanation of loan terms','Avoiding borrower questions','Hiding APR details'], correct_index:1 },
];

// ── Official Final Exam: 35 Questions (first attempt) ─────────────────
// Answer key: 1B 2C 3B 4C 5C 6C 7B 8B 9C 10B
//             11B 12B 13B 14B 15B 16B 17C 18B 19C 20B
//             21B 22C 23C 24C 25B 26C 27C 28C 29B 30B
//             31B 32B 33C 34B 35B
const FINAL_EXAM_35 = [
  // ── Module 1: Federal Mortgage Law ──────────────────────────────
  { number:1,  question:'Under the Ability-to-Repay rule, creditors must make a:', options:['Profit-based determination','Reasonable, good-faith determination','Collateral-only determination','Credit-score-only determination'], correct_index:1 },
  { number:2,  question:'RESPA Section 8 prohibits:', options:['Escrow accounts','Adjustable-rate loans','Kickbacks and unearned fees','Loan Estimates'], correct_index:2 },
  { number:3,  question:'The Loan Estimate must be delivered within:', options:['2 business days','3 business days','5 business days','7 business days'], correct_index:1 },
  { number:4,  question:'The Closing Disclosure must be provided at least:', options:['1 business day before closing','2 business days before consummation','3 business days before consummation','After closing'], correct_index:2 },
  { number:5,  question:'A Qualified Mortgage generally prohibits:', options:['Escrow accounts','Fixed interest rates','Negative amortization','15-year terms'], correct_index:2 },
  { number:6,  question:'HOEPA applies to:', options:['FHA loans only','Reverse mortgages only','High-cost mortgages','USDA loans only'], correct_index:2 },
  { number:7,  question:'ECOA prohibits discrimination based on:', options:['Loan amount','Credit score','Marital status','Property value'], correct_index:2 },
  { number:8,  question:'HMDA requires reporting of:', options:['Commission schedules','Mortgage application data','Escrow balances','Marketing budgets'], correct_index:1 },
  { number:9,  question:'TRID integrated disclosures under:', options:['ECOA and HMDA','TILA and RESPA','SAFE and HOEPA','FHA and VA'], correct_index:1 },
  { number:10, question:'Redlining refers to:', options:['Charging higher APR','Refusing loans based on neighborhood demographics','Credit-tier pricing','ARM adjustments'], correct_index:1 },
  // ── Module 2: Ethics & Consumer Protection ──────────────────────
  { number:11, question:'Ethical integrity requires:', options:['Maximizing commission','Honest representation of loan terms','Steering borrowers','Withholding material information'], correct_index:1 },
  { number:12, question:'Reverse redlining involves:', options:['Equal pricing','Targeting protected classes for high-cost loans','FHA underwriting','Avoiding rural lending'], correct_index:1 },
  { number:13, question:'A straw buyer typically:', options:['Occupies the property','Purchases on behalf of another person','Uses FHA insurance','Pays extra principal'], correct_index:1 },
  { number:14, question:'Risk layering increases:', options:['Loan stability','Default probability','Compliance ease','Equity growth'], correct_index:1 },
  { number:15, question:'Payment shock most commonly occurs when:', options:['Taxes decrease','Interest-only period ends','DTI improves','Escrow decreases'], correct_index:1 },
  { number:16, question:'Suitability assessment focuses on:', options:['Maximum loan size','Long-term affordability','Commission potential','Closing speed'], correct_index:1 },
  { number:17, question:'A red flag for fraud includes:', options:['Stable employment','Clear documentation','Evasive borrower answers','Verified income'], correct_index:2 },
  { number:18, question:'Ethical conduct requires placing:', options:['Employer profit first',"Borrower's best interest first",'Volume first','Commission first'], correct_index:1 },
  // ── Module 3: Non-Traditional Mortgage Products ─────────────────
  { number:19, question:'Negative amortization results in:', options:['Faster equity growth','Reduced loan balance','Increasing loan balance','Fixed payments'], correct_index:2 },
  { number:20, question:'An ARM rate is based on:', options:['Note rate only','Index plus margin','Credit score','Escrow change'], correct_index:1 },
  { number:21, question:'Balloon payments are generally prohibited in:', options:['FHA loans','Qualified Mortgages','Conventional loans','VA loans'], correct_index:1 },
  { number:22, question:'The most predictable mortgage product is:', options:['Payment-option ARM','Interest-only loan','Fully amortizing fixed-rate','Negative amortization loan'], correct_index:2 },
  { number:23, question:'High-cost mortgage status may be triggered when APR exceeds APOR by:', options:['3%','4%','6.5% (first lien)','10%'], correct_index:2 },
  { number:24, question:'Refinancing dependence creates risk when:', options:['Rates decline','Property appreciates','Credit conditions tighten','Income rises'], correct_index:2 },
  { number:25, question:'Consumer protection in non-traditional lending emphasizes:', options:['Yield spread','Suitability and disclosure','Removing ATR','Lower DTI only'], correct_index:1 },
  // ── Module 4: North Carolina Mortgage Licensing Law ─────────────
  { number:26, question:'Mortgage licensing in North Carolina is regulated by the:', options:['HUD','CFPB','North Carolina Commissioner of Banks','Federal Reserve'], correct_index:2 },
  { number:27, question:'MLOs must obtain a unique identifier through:', options:['HUD','CFPB','NMLS','FDIC'], correct_index:2 },
  { number:28, question:'Minimum annual continuing education required under SAFE Act is:', options:['6 hours','7 hours','8 hours','10 hours'], correct_index:2 },
  { number:29, question:'Operating without a mortgage license in North Carolina may result in:', options:['Increased commission','Administrative penalties','Lower APR','Loan approval'], correct_index:1 },
  { number:30, question:'Administrative enforcement may include:', options:['Credit score reduction','Cease-and-desist orders','Escrow suspension','Rate increases'], correct_index:1 },
  { number:31, question:'License renewal requires completion of:', options:['Federal exam','Continuing education','Pre-licensing hours','Appraisal course'], correct_index:1 },
  { number:32, question:'Failure to comply with state disclosure requirements may result in:', options:['Faster closing','Regulatory penalties','Higher APR','Reduced documentation'], correct_index:1 },
  { number:33, question:'The SAFE Act was enacted in:', options:['2005','2007','2008','2010'], correct_index:2 },
  { number:34, question:'North Carolina regulators may conduct:', options:['Credit scoring','Compliance examinations','Appraisal adjustments','Marketing audits only'], correct_index:1 },
  { number:35, question:'Failure to comply with federal mortgage law may result in:', options:['Higher commission','Regulatory penalties','Lower APR','Loan acceleration'], correct_index:1 },
];

// ─────────────────────────────────────────────────────────────────────
const courseData = {
  title:           '8-HOUR NC SAFE COMPREHENSIVE: ANNUAL MLO FUNDAMENTALS',
  nmls_course_id:  'CE-NC-SAFE-8HR',
  type:            'CE',
  credit_hours:    8,
  description:     'This 8-hour SAFE Act continuing education course covers federal mortgage law (3 hrs), ethics for MLOs (2 hrs), non-traditional mortgage lending (2 hrs), and North Carolina state law & Commissioner of Banks regulations (1 hr). Required annually for North Carolina licensed Mortgage Loan Originators.',
  price:           99.00,
  states_approved: ['NC'],
  has_textbook:    false,
  textbook_price:  0,
  is_active:       true,
  pdf_url:         NC_TEXTBOOK_PDF,

  modules: [

    // ── MODULE 1 ────────────────────────────────────────────────────
    {
      order: 1, title: 'Federal Mortgage-Related Laws', credit_hours: 3,
      pdf_url: NC_TEXTBOOK_PDF, show_pdf_before_quiz: false,
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
      pdf_url: NC_TEXTBOOK_PDF, show_pdf_before_quiz: false,
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
      pdf_url: NC_TEXTBOOK_PDF, show_pdf_before_quiz: false,
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
      order: 4, title: 'North Carolina State Law and Regulations', credit_hours: 1,
      pdf_url: NC_TEXTBOOK_PDF, show_pdf_before_quiz: false,
      sections: [
        '4.1 Overview of North Carolina Regulatory Authority (Commissioner of Banks)',
        '4.2 State Continuing Education Requirements',
        '4.3 North Carolina Mortgage Licensing Requirements (NMLS)',
        '4.4 Prohibited Acts under NCGS 53-243.11',
        '4.5 State Enforcement, Penalties, and Disciplinary Actions',
        'Module 4 Summary',
        'Case Study: The Unqualified Loan Processor',
      ],
      quiz: [
        // Answer key: 1B 2C 3B 4C 5C
        { number:1, question:'Under North Carolina law, what is the minimum passing score required for the NMLS national test for mortgage loan originator applicants?', options:['70%','75%','80%','85%'], correct_index:1 },
        { number:2, question:'Which of the following is NOT a component of the required 8-hour annual continuing education for North Carolina mortgage loan originators?', options:['3 hours of federal law','2 hours of ethics','3 hours of state-specific electives','2 hours of non-traditional mortgage lending'], correct_index:2 },
        { number:3, question:'Under NCGS 53-243.11, which of the following is a prohibited act in North Carolina mortgage lending?', options:['Requiring borrowers to obtain pre-purchase home inspections','Charging fees before providing required disclosures','Offering multiple loan product options to borrowers','Requesting employment verification documentation'], correct_index:1 },
        { number:4, question:'What authority does the North Carolina Commissioner of Banks have regarding examinations of mortgage licensees?', options:['Can only conduct examinations with 30 days advance notice','Can conduct examinations only once per year','Can conduct examinations at any time with or without notice','Must obtain court approval before conducting examinations'], correct_index:2 },
        { number:5, question:'If the Commissioner of Banks identifies violations during an investigation, which of the following is NOT typically an available administrative remedy?', options:['Consent orders','Cease and desist orders','Criminal imprisonment','Orders requiring restitution to consumers'], correct_index:2 },
      ],
    },

    // ── MODULE 5: FINAL - NORTH CAROLINA ────────────────────────────
    // PDF-only lesson — NO quiz
    // Student reads NC Final PDF then proceeds directly to Final Exam
    {
      order: 5, title: 'FINAL - NORTH CAROLINA', credit_hours: 0,
      pdf_url: NC_FINAL_PDF, show_pdf_before_quiz: false,
      sections: [
        '8-HOUR NC SAFE COMPREHENSIVE: ANNUAL MLO FUNDAMENTALS',
        'North Carolina State Law & Commissioner of Banks Regulations — Full Review',
        'Review all four modules before attempting the Final Exam',
        'Covers: Federal Law · Ethics · Non-Traditional Lending · NC State Law',
      ],
      quiz: [], // ← NO checkpoint — proceeds directly to Final Exam
    },

  ],

  // ── OFFICIAL FINAL EXAM ─────────────────────────────────────────────
  // RETRY LOGIC (implement in your exam controller):
  //   attempt === 1  → serve FINAL_EXAM_35 (official 35-question set)
  //   attempt >= 2   → shuffle QUESTION_BANK_70, slice(0, 35) — new set each time
  final_exam: {
    title:              '8-HOUR NC SAFE COMPREHENSIVE: ANNUAL MLO FUNDAMENTALS — Final Exam',
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

    await Course.deleteOne({ nmls_course_id: 'CE-NC-SAFE-8HR' });
    console.log('🗑️  Removed existing NC SAFE course (if any)');

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
    console.log('\n📝 Official Answer Key (Attempt 1):');
    console.log('   Q1:B  Q2:C  Q3:B  Q4:C  Q5:C  Q6:C  Q7:C  Q8:B  Q9:B  Q10:B');
    console.log('   Q11:B Q12:B Q13:B Q14:B Q15:B Q16:B Q17:C Q18:B Q19:C Q20:B');
    console.log('   Q21:B Q22:C Q23:C Q24:C Q25:B Q26:C Q27:C Q28:C Q29:B Q30:B');
    console.log('   Q31:B Q32:B Q33:C Q34:B Q35:B');
    console.log('\n⚙️  Retry implementation in your exam controller:');
    console.log('   if (attempt === 1) serve final_exam.questions');
    console.log('   if (attempt >= 2)  shuffle final_exam.question_bank, slice(0, 35)');
    console.log('\n🎯 Test at: /courses/CE-NC-SAFE-8HR/learn');
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