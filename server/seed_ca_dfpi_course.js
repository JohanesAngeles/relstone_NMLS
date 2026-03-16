/**
 * seed_ca_dfpi_course.js
 * Drop this in: relstone_NMLS/server/
 * Run with:    node seed_ca_dfpi_course.js
 *
 * COURSE STRUCTURE:
 *   Step 1  📄 Lesson    — Module 1: Federal Mortgage-Related Laws
 *   Step 2  📋 Checkpoint — Module 1 Quiz (5 questions)
 *   Step 3  📄 Lesson    — Module 2: Ethical Guidelines for MLOs
 *   Step 4  📋 Checkpoint — Module 2 Quiz (5 questions)
 *   Step 5  📄 Lesson    — Module 3: Non-Traditional Mortgage Lending
 *   Step 6  📋 Checkpoint — Module 3 Quiz (5 questions)
 *   Step 7  📄 Lesson    — Module 4: California State Law and Regulations
 *   Step 8  📋 Checkpoint — Module 4 Quiz (5 questions)
 *   Step 9  📄 Lesson    — FINAL - CALIFORNIA DFPI (PDF textbook)
 *   Step 9b 📋 Checkpoint — CA-DFPI Fundamentals (70 questions)
 *   Step 10 🏆 Final Exam — Official Final Exam (35 questions, verified answer key)
 */

const mongoose = require('mongoose');
const dotenv   = require('dotenv');
dotenv.config();

const Course = require('./models/Course');

// ── 70-Question CA-DFPI Fundamentals Bank ────────────────────────────
const FUNDAMENTALS_70 = [
  { number:1,  question:'Under the Ability-to-Repay rule, creditors must make a:', options:['Profit-based determination','Reasonable, good-faith determination','Credit-score-only determination','Collateral-only determination'], correct_index:1 },
  { number:2,  question:'Which federal law prohibits kickbacks in real estate settlement services?', options:['TILA','ECOA','RESPA','HMDA'], correct_index:2 },
  { number:3,  question:'The APR represents:', options:['Only the note rate','Lender compensation only','Cost of credit expressed as a yearly rate','The escrow amount'], correct_index:2 },
  { number:4,  question:'The Loan Estimate must be delivered within how many business days of application?', options:['1 business day','2 business days','3 business days','5 business days'], correct_index:2 },
  { number:5,  question:'The Closing Disclosure must be provided at least how many business days before consummation?', options:['1 business day','2 business days','3 business days','5 business days'], correct_index:2 },
  { number:6,  question:'How many underwriting factors must be considered under the Ability-to-Repay rule?', options:['6','7','8','9'], correct_index:2 },
  { number:7,  question:'A Qualified Mortgage generally limits total points and fees to:', options:['2% of the loan amount','3% of the loan amount','4% of the loan amount','5% of the loan amount'], correct_index:1 },
  { number:8,  question:'Which loan feature is prohibited in most Qualified Mortgages?', options:['Fixed interest rate','Negative amortization','Escrow accounts','15-year loan term'], correct_index:1 },
  { number:9,  question:'A high-cost mortgage under HOEPA is triggered when the APR exceeds APOR by:', options:['3% for a first lien','4% for a first lien','6.5% for a first lien','10% for a first lien'], correct_index:2 },
  { number:10, question:'Section 8(b) of RESPA prohibits:', options:['APR miscalculation','Unearned fee splitting','Adjustable-rate increases','Balloon loan payments'], correct_index:1 },
  { number:11, question:'Affiliated business arrangements under RESPA are permitted if:', options:['Use of the affiliate is mandatory','No disclosure is required','Proper disclosure is made and use is optional','A referral fee is kept confidential'], correct_index:2 },
  { number:12, question:'Section 9 of RESPA prohibits sellers from:', options:['Requiring a specific lender','Requiring a specific title insurance company as a condition of sale','Setting the interest rate','Charging property taxes'], correct_index:1 },
  { number:13, question:'Under ECOA, an adverse action notice must be provided within:', options:['15 days','20 days','30 days','45 days'], correct_index:2 },
  { number:14, question:'Under ECOA, creditors must retain mortgage application records for:', options:['12 months','18 months','24 months','25 months'], correct_index:2 },
  { number:15, question:'Which of the following is a protected class under the Fair Housing Act?', options:['Credit history','Disability','Loan amount','Employment type'], correct_index:1 },
  { number:16, question:'Redlining refers to:', options:['Increasing origination fees','Refusing loans based on neighborhood demographics','Charging a high APR','Adjustable-rate loan increases'], correct_index:1 },
  { number:17, question:'Reverse redlining refers to:', options:['Serving minority neighborhoods fairly','Avoiding rural lending','Targeting protected classes for high-cost loans','Reducing fees for minority borrowers'], correct_index:2 },
  { number:18, question:'Disparate impact refers to:', options:['Intentional discrimination','Different pricing tiers for similar borrowers','A neutral policy that causes a discriminatory effect','Credit-based pricing adjustments'], correct_index:2 },
  { number:19, question:'HMDA data requires reporting of:', options:['Employee bonuses','Mortgage application and loan data','Advertising budgets','Underwriting software costs'], correct_index:1 },
  { number:20, question:'HMDA primarily helps regulators:', options:['Set interest rates','Identify discriminatory lending patterns','Determine loan profitability','Assign credit scores'], correct_index:1 },
  { number:21, question:'HMDA data must be submitted annually by:', options:['January 1','February 1','March 1','April 1'], correct_index:2 },
  { number:22, question:'The SAFE Act was enacted in:', options:['2005','2007','2008','2010'], correct_index:2 },
  { number:23, question:'The SAFE Act requires a minimum of how many hours of pre-licensing education?', options:['15 hours','20 hours','25 hours','30 hours'], correct_index:1 },
  { number:24, question:'An MLO must obtain a unique identifier through:', options:['CFPB','HUD','NMLS','FDIC'], correct_index:2 },
  { number:25, question:'Annual continuing education for MLOs requires a minimum of:', options:['6 hours','8 hours','10 hours','12 hours'], correct_index:1 },
  { number:26, question:'The SAFE exam requires a minimum passing score of:', options:['70%','75%','80%','85%'], correct_index:1 },
  { number:27, question:'Which agency has primary enforcement power over state-licensed MLOs?', options:['HUD','CFPB','State regulator','Federal Reserve'], correct_index:2 },
  { number:28, question:'Operating as an MLO without a valid license violates:', options:['TILA','HMDA','The SAFE Act','FHA'], correct_index:2 },
  { number:29, question:'The federal agency primarily enforcing TILA for nonbank mortgage companies is:', options:['HUD','FDIC','CFPB','OCC'], correct_index:2 },
  { number:30, question:'Zero-tolerance fees under TRID include:', options:['Prepaid interest','Lender origination charges',"Homeowner's insurance premiums",'Escrow deposits'], correct_index:1 },
  { number:31, question:'Ethical integrity requires mortgage loan originators to:', options:['Maximize commissions above all else','Withhold complex information from borrowers','Provide honest representation of all loan terms','Steer borrowers to higher-margin products'], correct_index:2 },
  { number:32, question:'Ethical conduct requires placing whose interests first?', options:['Employer profit',"Borrower's best interest",'Sales quotas','Volume targets'], correct_index:1 },
  { number:33, question:'A key component of ethical transparency is:', options:['Using technical industry jargon','Explaining loan terms clearly to borrowers','Avoiding borrower questions','Concealing APR details'], correct_index:1 },
  { number:34, question:'Occupancy fraud occurs when a borrower:', options:['Pays additional principal voluntarily','Misrepresents intent to occupy as primary residence','Refinances ahead of schedule','Uses an escrow account'], correct_index:1 },
  { number:35, question:'Fraud involving altered income documentation is classified as:', options:['Appraisal fraud','Income fraud','Occupancy fraud','Equity stripping'], correct_index:1 },
  { number:36, question:'A straw buyer scheme involves:', options:['A buyer who occupies the property','Purchasing a property on behalf of an unqualified person','Legitimate FHA financing','Paying a larger down payment'], correct_index:1 },
  { number:37, question:'Which of the following is a red flag indicating potential mortgage fraud?', options:['Consistent and well-organized documentation','Evasive borrower answers about property use','Stable employment history','Clear and verifiable income records'], correct_index:1 },
  { number:38, question:'Which CE category must include fraud prevention content?', options:['Federal law','Ethics','Non-traditional mortgage products','Elective hours'], correct_index:1 },
  { number:39, question:'Conflicts of interest in mortgage lending must be:', options:['Hidden from borrowers to avoid confusion','Disclosed to the borrower','Reported only to management','Ignored if they are minor'], correct_index:1 },
  { number:40, question:'Which type of mortgage provides the most predictable payment schedule?', options:['Payment option ARM','Interest-only mortgage','Fully amortizing fixed-rate mortgage','Negative amortization mortgage'], correct_index:2 },
  { number:41, question:'Negative amortization primarily results in:', options:['Faster equity growth','A reduced loan balance','An increasing loan balance','A fixed interest rate'], correct_index:2 },
  { number:42, question:'Equity erosion risk is highest with:', options:['Fully amortizing loans','Fixed-rate mortgages','Negative amortization loans','FHA-insured loans'], correct_index:2 },
  { number:43, question:'Payment shock most commonly occurs when:', options:['Property taxes decrease','The interest-only period ends','The loan balance decreases','The fixed rate remains stable'], correct_index:1 },
  { number:44, question:'Which risk increases when a loan balance grows instead of shrinking?', options:['Liquidity risk','Equity erosion','Escrow deficiency','Appraisal risk'], correct_index:1 },
  { number:45, question:'Refinancing dependence creates risk when:', options:['Property values appreciate','Interest rates decline','Market conditions worsen or credit tightens','Debt-to-income ratio decreases'], correct_index:2 },
  { number:46, question:'An ARM rate is typically based on:', options:['A fixed note rate only','An index plus a margin','Credit score alone','Escrow account changes'], correct_index:1 },
  { number:47, question:'Interest-only loans primarily delay:', options:['Escrow payments','Interest accrual','Principal repayment','Closing costs'], correct_index:2 },
  { number:48, question:'Bank statement loans are typically used by:', options:['Salaried W-2 employees','Self-employed borrowers','Retirees only','FHA borrowers exclusively'], correct_index:1 },
  { number:49, question:'Risk layering in mortgage lending increases:', options:['Loan simplicity','Regulatory compliance ease','Default probability','Equity growth rate'], correct_index:2 },
  { number:50, question:'Consumer protection in non-traditional lending focuses on:', options:['Maximizing yield for the lender','Suitability assessment and full disclosure','Lowering DTI only','Removing ATR requirements'], correct_index:1 },
  { number:51, question:'Borrower suitability assessment requires:', options:['Maximizing the loan size','Evaluating long-term affordability for the borrower','Avoiding income documentation','Ignoring reserve requirements'], correct_index:1 },
  { number:52, question:'Documentation standards are essential in mortgage lending to:', options:['Increase origination commissions','Demonstrate regulatory compliance','Avoid required disclosures','Remove ATR requirements'], correct_index:1 },
  { number:53, question:'Balloon payments are generally prohibited in:', options:['FHA loans','Qualified Mortgages','Conventional loans','VA loans'], correct_index:1 },
  { number:54, question:'HOEPA applies specifically to:', options:['All conventional mortgage loans','High-cost mortgages exceeding defined thresholds','FHA loans only','USDA rural loans only'], correct_index:1 },
  { number:55, question:'Administrative enforcement actions for compliance violations may include:', options:['Stock market penalties','Cease-and-desist orders','Automatic interest rate adjustments','Credit score reductions'], correct_index:1 },
  { number:56, question:'Failure to comply with mortgage disclosure requirements may result in:', options:['Higher origination commissions','Regulatory penalties and civil liability','A lower APR for the borrower','Faster loan closing'], correct_index:1 },
  { number:57, question:'Which agency is the primary regulator of mortgage lending for non-depository institutions in California?', options:['California Department of Real Estate (DRE)','California Department of Financial Protection and Innovation (DFPI)','California Bureau of Real Estate Appraisers','California Department of Consumer Affairs'], correct_index:1 },
  { number:58, question:'DFPI was created to:', options:['Replace the CFPB at the state level',"Consolidate and modernize California's financial regulatory framework",'Exclusively regulate banks and credit unions','Administer federal mortgage insurance programs'], correct_index:1 },
  { number:59, question:'The two primary statutes DFPI enforces for mortgage professionals are:', options:['TILA and RESPA','The California Residential Mortgage Lending Act (CRMLA) and California Finance Lenders Law (CFLL)','The California Civil Code and Penal Code','HMDA and ECOA'], correct_index:1 },
  { number:60, question:'Under DFPI, a California mortgage license is best described as:', options:['A permanent entitlement once issued','A conditional authorization requiring continuous compliance','A one-time approval with no renewal requirements','A federal registration administered by NMLS only'], correct_index:1 },
  { number:61, question:"California's continuing education requirement for DFPI-regulated MLOs includes:", options:['Federal content only','Both federal and California state-specific content','State content only','Ethics content only'], correct_index:1 },
  { number:62, question:'Under DFPI policy, ultimate responsibility for timely CE completion rests with:', options:['The CE course provider','The sponsoring mortgage company','The individual licensee','NMLS'], correct_index:2 },
  { number:63, question:'Practicing mortgage activity with an expired California license constitutes:', options:['A minor administrative violation only','Unlicensed activity subject to regulatory penalties','An automatic probationary period','A federal SAFE Act violation only'], correct_index:1 },
  { number:64, question:'California mortgage law in relation to federal law typically:', options:['Mirrors federal requirements exactly','Imposes fewer obligations than federal law','Frequently imposes stricter consumer protections than federal law','Defers entirely to federal standards'], correct_index:2 },
  { number:65, question:'California law prohibits mortgage professionals from:', options:['Explaining loan terms clearly to borrowers','Charging unauthorized or undisclosed fees and steering consumers into unsuitable products','Providing required disclosures on time','Including NMLS identifiers in advertising'], correct_index:1 },
  { number:66, question:'Under DFPI, enforcement actions may arise from:', options:['Only formal consumer complaints','Routine examinations, investigations, whistleblower reports, and consumer complaints','Federal agency referrals only','Annual license renewal audits only'], correct_index:1 },
  { number:67, question:'DFPI monitors mortgage advertising through:', options:['Annual licensee self-reporting only','Examinations, consumer complaints, and market surveillance','A mandatory pre-approval process for all ads','Random sampling of loan files only'], correct_index:1 },
  { number:68, question:'Civil penalties imposed by DFPI are intended to:', options:['Fund state consumer protection programs','Serve both a punitive and deterrent function','Replace license revocation as a remedy','Apply only to unlicensed individuals'], correct_index:1 },
  { number:69, question:'Loss of a California mortgage license due to revocation may:', options:["Only affect the licensee's status in California",'Negatively impact licensing eligibility in other states due to reciprocal NMLS reporting','Be expunged after one year of good conduct','Be appealed directly to the CFPB'], correct_index:1 },
  { number:70, question:'California borrowers may report suspected mortgage violations directly to:', options:['NMLS','DFPI','The California Attorney General only','HUD'], correct_index:1 },
];

// ── Official Final Exam: 35 Qs, verified answer key ──────────────────
const FINAL_EXAM_35 = [
  { number:1,  question:'Under the Ability-to-Repay rule, creditors must make a:', options:['Profit-based determination','Reasonable, good-faith determination','Credit-score-only determination','Collateral-only determination'], correct_index:1 },
  { number:2,  question:'Which federal law prohibits kickbacks in real estate settlement services?', options:['TILA','ECOA','RESPA','HMDA'], correct_index:2 },
  { number:3,  question:'The Loan Estimate must be delivered within how many business days of application?', options:['1 business day','2 business days','3 business days','5 business days'], correct_index:2 },
  { number:4,  question:'The Closing Disclosure must be provided at least how many business days before consummation?', options:['1 business day','2 business days','3 business days','5 business days'], correct_index:2 },
  { number:5,  question:'A Qualified Mortgage generally limits total points and fees to:', options:['2% of the loan amount','3% of the loan amount','4% of the loan amount','5% of the loan amount'], correct_index:1 },
  { number:6,  question:'Which loan feature is prohibited in most Qualified Mortgages?', options:['Fixed interest rate','Negative amortization','Escrow accounts','15-year loan term'], correct_index:1 },
  { number:7,  question:'Section 8(b) of RESPA prohibits:', options:['APR miscalculation','Unearned fee splitting','Adjustable-rate increases','Balloon loan payments'], correct_index:1 },
  { number:8,  question:'Under ECOA, an adverse action notice must be provided within:', options:['15 days','20 days','30 days','45 days'], correct_index:2 },
  { number:9,  question:'Which of the following is a protected class under the Fair Housing Act?', options:['Credit history','Disability','Loan amount','Employment type'], correct_index:1 },
  { number:10, question:'Disparate impact refers to:', options:['Intentional discrimination','Different pricing tiers for similar borrowers','A neutral policy that causes a discriminatory effect','Credit-based pricing adjustments'], correct_index:2 },
  { number:11, question:'HMDA primarily helps regulators:', options:['Set interest rates','Identify discriminatory lending patterns','Determine loan profitability','Assign credit scores'], correct_index:1 },
  { number:12, question:'The SAFE Act requires a minimum of how many hours of pre-licensing education?', options:['15 hours','20 hours','25 hours','30 hours'], correct_index:1 },
  { number:13, question:'Annual continuing education for MLOs requires a minimum of:', options:['6 hours','8 hours','10 hours','12 hours'], correct_index:1 },
  { number:14, question:'Zero-tolerance fees under TRID include:', options:['Prepaid interest','Lender origination charges',"Homeowner's insurance premiums",'Escrow deposits'], correct_index:1 },
  { number:15, question:'Reverse redlining refers to:', options:['Serving minority neighborhoods fairly','Avoiding rural lending','Targeting protected classes for high-cost loans','Reducing fees for minority borrowers'], correct_index:2 },
  { number:16, question:'Ethical integrity requires mortgage loan originators to:', options:['Maximize commissions above all else','Withhold complex information from borrowers','Provide honest representation of all loan terms','Steer borrowers to higher-margin products'], correct_index:2 },
  { number:17, question:'Ethical conduct requires placing whose interests first?', options:['Employer profit',"Borrower's best interest",'Sales quotas','Volume targets'], correct_index:1 },
  { number:18, question:'Occupancy fraud occurs when a borrower:', options:['Pays additional principal voluntarily','Misrepresents intent to occupy as primary residence','Refinances ahead of schedule','Uses an escrow account'], correct_index:1 },
  { number:19, question:'A straw buyer scheme involves:', options:['A buyer who occupies the property','Purchasing a property on behalf of an unqualified person','Legitimate FHA financing','Paying a larger down payment'], correct_index:1 },
  { number:20, question:'Which of the following is a red flag indicating potential mortgage fraud?', options:['Consistent and well-organized documentation','Evasive borrower answers about property use','Stable employment history','Clear and verifiable income records'], correct_index:1 },
  { number:21, question:'Negative amortization primarily results in:', options:['Faster equity growth','A reduced loan balance','An increasing loan balance','A fixed interest rate'], correct_index:2 },
  { number:22, question:'Payment shock most commonly occurs when:', options:['Property taxes decrease','The interest-only period ends','The loan balance decreases','The fixed rate remains stable'], correct_index:1 },
  { number:23, question:'An ARM rate is typically based on:', options:['A fixed note rate only','An index plus a margin','Credit score alone','Escrow account changes'], correct_index:1 },
  { number:24, question:'Risk layering in mortgage lending increases:', options:['Loan simplicity','Regulatory compliance ease','Default probability','Equity growth rate'], correct_index:2 },
  { number:25, question:'Bank statement loans are typically used by:', options:['Salaried W-2 employees','Self-employed borrowers','Retirees only','FHA borrowers exclusively'], correct_index:1 },
  { number:26, question:'Which agency is the primary regulator of mortgage lending for non-depository institutions in California?', options:['California Department of Real Estate (DRE)','California Department of Financial Protection and Innovation (DFPI)','California Bureau of Real Estate Appraisers','California Department of Consumer Affairs'], correct_index:1 },
  { number:27, question:'DFPI was created to:', options:['Replace the CFPB at the state level',"Consolidate and modernize California's financial regulatory framework",'Exclusively regulate banks and credit unions','Administer federal mortgage insurance programs'], correct_index:1 },
  { number:28, question:'The two primary statutes DFPI enforces for mortgage professionals are:', options:['TILA and RESPA','The California Residential Mortgage Lending Act (CRMLA) and California Finance Lenders Law (CFLL)','The California Civil Code and Penal Code','HMDA and ECOA'], correct_index:1 },
  { number:29, question:'Under DFPI, a California mortgage license is best described as:', options:['A permanent entitlement once issued','A conditional authorization requiring continuous compliance','A one-time approval with no renewal requirements','A federal registration administered by NMLS only'], correct_index:1 },
  { number:30, question:"California's continuing education requirement for DFPI-regulated MLOs includes:", options:['Federal content only','Both federal and California state-specific content','State content only','Ethics content only'], correct_index:1 },
  { number:31, question:'Under DFPI policy, ultimate responsibility for timely CE completion rests with:', options:['The CE course provider','The sponsoring mortgage company','The individual licensee','NMLS'], correct_index:2 },
  { number:32, question:'Practicing mortgage activity with an expired California license constitutes:', options:['A minor administrative violation only','Unlicensed activity subject to regulatory penalties','An automatic probationary period','A federal SAFE Act violation only'], correct_index:1 },
  { number:33, question:'California mortgage law in relation to federal law typically:', options:['Mirrors federal requirements exactly','Imposes fewer obligations than federal law','Frequently imposes stricter consumer protections than federal law','Defers entirely to federal standards'], correct_index:2 },
  { number:34, question:'California law prohibits mortgage professionals from:', options:['Explaining loan terms clearly to borrowers','Charging unauthorized or undisclosed fees and steering consumers into unsuitable products','Providing required disclosures on time','Including NMLS identifiers in advertising'], correct_index:1 },
  { number:35, question:'Under DFPI, enforcement actions may arise from:', options:['Only formal consumer complaints','Routine examinations, investigations, whistleblower reports, and consumer complaints','Federal agency referrals only','Annual license renewal audits only'], correct_index:1 },
];

// ─────────────────────────────────────────────────────────────────────
const courseData = {
  title:          '8-HOUR CA-DFPI SAFE COMPREHENSIVE: ANNUAL MLO FUNDAMENTALS',
  nmls_course_id: 'CE-CA-DFPI-8HR',
  type:           'CE',
  credit_hours:   8,
  description:
    'This 8-hour SAFE Act continuing education course covers federal mortgage law ' +
    '(3 hrs), ethics for MLOs (2 hrs), non-traditional mortgage lending (2 hrs), and ' +
    'California state law & DFPI regulations (1 hr). Required annually for CA-DFPI ' +
    'licensed Mortgage Loan Originators.',
  price:           99.00,
  states_approved: ['CA'],
  has_textbook:    false,
  textbook_price:  0,
  is_active:       true,

  // ── Course-level PDF (fallback for all modules) ────────────────────
  // Replace with CA-DFPI PDF URL when available
  pdf_url: 'https://www.dropbox.com/scl/fo/enrih9t4dnji9j47b2mge/AJlfq4abtljhjBkysTe8kDQ/FLORIDA/8-Hour%20FL%20SAFE%20Comprehensive%20-%20Annual%20MLO%20Fundamentals.pdf?rlkey=jdwbravxwpfj6idgxzhxr3ynj&st=jad72fw1&raw=1',

  modules: [

    // ── MODULE 1 ────────────────────────────────────────────────────
    {
      order:        1,
      title:        'Federal Mortgage-Related Laws',
      credit_hours: 3,
      pdf_url:      null, // inherits course-level pdf_url
      sections: [
        '1.1 Overview of Federal Mortgage Regulation',
        '1.2 Truth in Lending Act (TILA) & TRID',
        '1.3 Real Estate Settlement Procedures Act (RESPA)',
        '1.4 Equal Credit Opportunity Act (ECOA)',
        '1.5 Fair Housing Act (FHA)',
        '1.6 Home Mortgage Disclosure Act (HMDA)',
        '1.7 SAFE Act Overview',
        'Module 1 Summary',
        'Case Study: The Disclosure Dilemma',
      ],
      quiz: [
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
        pdf_url: 'https://www.dropbox.com/scl/fo/enrih9t4dnji9j47b2mge/AJlfq4abtljhjBkysTe8kDQ/FLORIDA/8-Hour%20FL%20SAFE%20Comprehensive%20-%20Annual%20MLO%20Fundamentals.pdf?rlkey=jdwbravxwpfj6idgxzhxr3ynj&st=jad72fw1&raw=1',
        sections: [
        '2.1 Ethical Standards in Mortgage Lending',
        '2.2 Conflicts of Interest and Disclosure',
        '2.3 Fraud Prevention and Ethical Red Flags',
        'Module 2 Summary',
        'Case Study: Conflict and Compensation',
      ],
      quiz: [
        { number:1, question:'What is the primary responsibility of a Mortgage Loan Originator (MLO)?', options:['To close loans quickly','To ensure compliance with all relevant mortgage laws','To ensure borrowers get the lowest possible interest rate','To make the maximum commission'], correct_index:1 },
        { number:2, question:'What does the Dodd-Frank Act prohibit regarding loan originator compensation?', options:['Payment based on loan interest rates','Dual compensation from both the borrower and the lender','Higher compensation for riskier loans','All of the above'], correct_index:3 },
        { number:3, question:"What is the duty of a Mortgage Loan Originator (MLO) when facing conflicts of interest?", options:['To avoid all business relationships','To disclose any conflict clearly and promptly',"To ignore minor conflicts as they don't affect decisions",'To rely solely on the employer\'s guidance'], correct_index:1 },
        { number:4, question:'Which of the following is a common form of mortgage fraud that MLOs must prevent?', options:['Inaccurate income reporting by borrowers','Borrower refusal to sign the Loan Estimate','Failure to provide Closing Disclosure','Offering discounts on closing costs'], correct_index:0 },
        { number:5, question:'What is the potential consequence for a Mortgage Loan Originator if they violate ethical guidelines?', options:['Increased market share','Civil penalties and license suspension','Higher commissions','No consequences'], correct_index:1 },
      ],
    },

    // ── MODULE 3 ────────────────────────────────────────────────────
    {
      order:        3,
      title:        'Non-Traditional Mortgage Lending',
      credit_hours: 2,
      pdf_url: 'https://www.dropbox.com/scl/fo/enrih9t4dnji9j47b2mge/AJlfq4abtljhjBkysTe8kDQ/FLORIDA/8-Hour%20FL%20SAFE%20Comprehensive%20-%20Annual%20MLO%20Fundamentals.pdf?rlkey=jdwbravxwpfj6idgxzhxr3ynj&st=jad72fw1&raw=1',

      sections: [
        '3.1 Overview of Non-Traditional Mortgage Products',
        '3.2 Risks to Consumers and Lenders',
        '3.3 Compliance and Suitability Considerations',
        'Module 3 Summary',
        'Case Study: The ARM Adjustment',
      ],
      quiz: [
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
      title:        'California State Law and Regulations',
      credit_hours: 1,
      pdf_url: 'https://www.dropbox.com/scl/fo/enrih9t4dnji9j47b2mge/AJlfq4abtljhjBkysTe8kDQ/FLORIDA/8-Hour%20FL%20SAFE%20Comprehensive%20-%20Annual%20MLO%20Fundamentals.pdf?rlkey=jdwbravxwpfj6idgxzhxr3ynj&st=jad72fw1&raw=1',
      sections: [
        '4.1 Overview of State Regulatory Authority in California (DFPI)',
        '4.2 State Continuing Education Requirements',
        '4.3 State-Specific Mortgage Laws (CRMLA & CFLL)',
        '4.4 State Enforcement, Penalties, and Disciplinary Actions',
        '4.5 State Consumer Protection Provisions',
        'Module 4 Summary',
        'Case Study: The Unqualified Loan Processor',
      ],
      quiz: [
        { number:1, question:'Which agency regulates mortgage lenders under the California Residential Mortgage Lending Act?', options:['Department of Real Estate','Department of Financial Protection and Innovation','Federal Reserve Board','Consumer Financial Protection Bureau'], correct_index:1 },
        { number:2, question:'What may occur if a licensee fails to complete required CE before renewal?', options:['Automatic extension','No consequence if unintentional','License expiration or enforcement action','Provider responsibility only'], correct_index:2 },
        { number:3, question:'Which practice is prohibited under California mortgage law?', options:['Accurate loan disclosures','Truthful advertising','Misrepresentation of loan terms','Maintaining CE records'], correct_index:2 },
        { number:4, question:'Which system is used for submitting and maintaining mortgage license applications and renewals?', options:['State Licensing Portal','California Compliance Registry','Nationwide Multistate Licensing System (NMLS)','Federal Licensing Exchange'], correct_index:2 },
        { number:5, question:'Which of the following is a possible consequence of serious or repeated violations of California mortgage law?', options:['Mandatory vacation leave','License suspension or revocation','Reduced CE requirements','Automatic license transfer to another state'], correct_index:1 },
      ],
    },

    // ── MODULE 5: FINAL - CALIFORNIA DFPI ───────────────────────────
    // This is the pre-exam study module — shows the PDF textbook first,
    // then the student takes the 70-question fundamentals exam.
    //
    // TO ADD PDF: Replace pdf_url null with your URL:
    //   Google Drive: 'https://drive.google.com/file/d/YOUR_FILE_ID/preview'
    //   Dropbox:      'https://www.dropbox.com/s/FILEID/filename.pdf?raw=1'
    {
      order:        5,
      title:        'FINAL - CALIFORNIA DFPI',
      credit_hours: 0,
      pdf_url: "https://www.dropbox.com/scl/fi/2lqm5jbkk4ei6ig12tba9/FINAL-CALIFORNIA-DFPI-1.pdf?rlkey=0ph2l6b8rezmmc6kpcgkup3ei&st=u6o5eelg&raw=1#page=63", // ← PASTE YOUR PDF URL HERE when ready
      sections: [
        '8-HOUR CA-DFPI SAFE COMPREHENSIVE: ANNUAL MLO FUNDAMENTALS',
        'California-DFPI 70-Item Question Bank',
        'Review all four modules before attempting the fundamentals exam',
        'Covers: Federal Law · Ethics · Non-Traditional Lending · CA State Law',
      ],
      quiz: FUNDAMENTALS_70,
    },

  ],

  // ── OFFICIAL FINAL EXAM ─────────────────────────────────────────────
  final_exam: {
    title:              '8-HOUR CA-DFPI SAFE COMPREHENSIVE: ANNUAL MLO FUNDAMENTALS — Final Exam',
    passing_score:      70,
    time_limit_minutes: 90,
    questions:          FINAL_EXAM_35,
  },
};

// ─────────────────────────────────────────────────────────────────────
const seed = async () => {
  try {
    await mongoose.connect(process.env.MONGO_URI);
    console.log('✅ MongoDB connected');

    await Course.deleteOne({ nmls_course_id: 'CE-CA-DFPI-8HR' });
    console.log('🗑️  Removed existing CA-DFPI course (if any)');

    const course = await Course.create(courseData);

    console.log(`\n✅ Course inserted: ${course.title}`);
    console.log(`   ID: ${course._id}`);
    console.log('\n📋 Full Course Structure:');
    console.log('   ─────────────────────────────────────────');
    course.modules.forEach((m, i) => {
      const step = (i * 2) + 1;
      console.log(`   Step ${step}  📄 Lesson     — ${m.title} (${m.credit_hours} hr)`);
      console.log(`   Step ${step+1}  📋 Checkpoint — ${m.quiz.length} questions`);
      if (m.pdf_url) console.log(`          📎 PDF: ${m.pdf_url.substring(0,60)}...`);
    });
    console.log(`   Step 10 🏆 Final Exam  — ${course.final_exam.questions.length} questions (official, verified)`);
    console.log('   ─────────────────────────────────────────');
    console.log('\n⚠️  Module 5 PDF is currently null.');
    console.log('   To add it, update pdf_url in Module 5 and reseed.');
    console.log('\n🎯 Test at: /courses/CE-CA-DFPI-8HR/learn');
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