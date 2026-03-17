/**
 * seed_or_safe_course.js
 * Drop this in: relstone_NMLS/server/
 * Run with:    node seed_or_safe_course.js
 *
 * COURSE STRUCTURE:
 * Step 1  📄 Lesson     — Module 1: Federal Mortgage-Related Laws
 * Step 2  📋 Checkpoint — Module 1 Quiz (5 questions)
 * Step 3  📄 Lesson     — Module 2: Ethical Guidelines for MLOs
 * Step 4  📋 Checkpoint — Module 2 Quiz (5 questions)
 * Step 5  📄 Lesson     — Module 3: Non-Traditional Mortgage Lending
 * Step 6  📋 Checkpoint — Module 3 Quiz (5 questions)
 * Step 7  📄 Lesson     — Module 4: Mortgage Origination
 * Step 8  📋 Checkpoint — Module 4 Quiz (5 questions)
 * Step 9  📄 Lesson     — Module 5: Oregon State Law and Regulations
 * Step 10 📋 Checkpoint — Module 5 Quiz (5 questions)
 * Step 11 📄 Lesson     — FINAL - OREGON (PDF review)
 * Step 12 🏆 Final Exam — Attempt 1: Official 35 Qs | Retry: Random 35 from 70-Q Bank
 *
 * RETRY LOGIC:
 * - Uses the verified 70-question bank from the provided Word document.
 */

const mongoose = require('mongoose');
const dotenv   = require('dotenv');
dotenv.config();

const Course = require('./models/Course');

// ── PDF URLs ──────────────────────────────────────────────────────────
const OR_TEXTBOOK_PDF = 'https://www.dropbox.com/scl/fi/sgkqhrkztq7y6nkr0kjsz/10-Hour-OR-SAFE-Comprehensive-Annual-MLO-Fundamentals.pdf?rlkey=lizk69cnp8zrfoh8jq24r0c0s&st=8e41cllu&raw=1';
const OR_FINAL_PDF    = 'https://www.dropbox.com/scl/fi/dur9515gcc4xtpy6eff3l/Final-Oregon-NMLS-CE.pdf?rlkey=nnpgen0y1rmh1b54fgitgrm9d&st=naaas4uv&raw=1';

// ── 70-Question Verified Bank for Retakes ─────────────────────────────
// Derived directly from "10-Hour OR SAFE Comprehensive - 70 Question Bank.docx"
const QUESTION_BANK_70 = [
  { number: 1, question: 'What is the main purpose of the Truth in Lending Act (TILA)?', options: ['to set state interest rate caps for all mortgages', 'to promote the informed use of consumer credit through disclosures', 'to prohibit all adjustable-rate mortgages', 'to require lenders to offer credit to every applicant'], correct_index: 1 },
  { number: 2, question: 'Which federal agency implements TILA through Regulation Z?', options: ['FDIC', 'CFPB', 'HUD', 'Fannie Mae'], correct_index: 1 },
  { number: 3, question: 'Under TILA, which disclosure represents the cost of credit expressed as a yearly rate?', options: ['loan-to-value ratio', 'principal balance', 'APR', 'note rate'], correct_index: 2 },
  { number: 4, question: 'For most mortgage transactions, an APR is generally considered accurate if it is within:', options: ['1% of the actual APR', '2% of the actual APR', '0.25% of the actual APR', '0.125% of the actual APR'], correct_index: 3 },
  { number: 5, question: 'TILA provides the right of rescission for certain transactions, meaning the consumer may:', options: ['waive all finance charges', 'cancel within a limited period for covered transactions', 'avoid providing income documentation', 'refuse to receive the Closing Disclosure'], correct_index: 1 },
  { number: 6, question: 'RESPA primarily addresses:', options: ['settlement service disclosures and prohibitions on kickbacks', 'credit reporting accuracy requirements', 'property appraisal standards', 'the federal minimum wage'], correct_index: 0 },
  { number: 7, question: 'RESPA Section 8 prohibits:', options: ['using escrow accounts', 'charging any origination fee', 'disclosing affiliate relationships', 'kickbacks and unearned fees related to settlement services'], correct_index: 3 },
  { number: 8, question: 'Under TRID, the Loan Estimate is designed to help consumers:', options: ['replace the promissory note', 'finalize the loan at closing', 'compare loan terms and closing costs early in the process', 'avoid receiving a Closing Disclosure'], correct_index: 2 },
  { number: 9, question: 'Which statement best describes the Closing Disclosure timing requirement?', options: ['it replaces the loan estimate within 24 hours of application', 'it is provided only upon borrower request', 'it is provided at least three business days before consummation', 'it is delivered after the loan has funded'], correct_index: 2 },
  { number: 10, question: 'The Equal Credit Opportunity Act (ECOA) prohibits discrimination based on:', options: ['credit score', 'loan amount', 'marital status', 'property age'], correct_index: 2 },
  { number: 11, question: 'The Fair Housing Act (FHA) prohibits discrimination in housing-related transactions, including:', options: ['checking employment history', 'refusing a loan based on race or national origin', 'requesting a property appraisal', 'requiring a down payment'], correct_index: 1 },
  { number: 12, question: 'The Home Mortgage Disclosure Act (HMDA) was enacted to:', options: ['set mortgage interest rates', 'eliminate the need for appraisals', 'collect and report data to identify potential discriminatory lending', 'provide free home inspections'], correct_index: 2 },
  { number: 13, question: 'Ethics in mortgage lending involves more than just following the law; it involves:', options: ['maximizing the lender’s profits at all costs', 'upholding honesty, fairness, and professional integrity', 'avoiding all communication with borrowers', 'charging the highest fees allowed by law'], correct_index: 1 },
  { number: 14, question: 'Fraud for property is most commonly committed by:', options: ['borrowers misrepresenting information to gain homeownership', 'appraisers inflating values for kickbacks', 'MLOs steering borrowers to high-cost loans', 'investors seeking to strip equity'], correct_index: 0 },
  { number: 15, question: 'Occupancy fraud occurs when a borrower:', options: ['fails to pay property taxes', 'obtains a loan for an investment property but claims it as a primary residence', 'refuses to sign the Closing Disclosure', 'applies for a loan using a false name'], correct_index: 1 },
  { number: 16, question: 'Income fraud involves:', options: ['reporting only a portion of bonuses', 'altering or falsifying paystubs or tax returns to qualify for a larger loan', 'paying off a credit card before applying', 'disclosing all sources of income'], correct_index: 1 },
  { number: 17, question: 'A “straw buyer” is someone who:', options: ['buys a home with a large down payment', 'applies for a mortgage on behalf of another person who cannot qualify', 'refuses to provide a credit report', 'invests exclusively in farmland'], correct_index: 1 },
  { number: 18, question: 'Asset fraud typically includes:', options: ['saving money in a personal account', 'inflating or fabricating bank account balances to meet reserve requirements', 'disclosing a gift from a relative', 'selling a vehicle to gain cash for closing'], correct_index: 1 },
  { number: 19, question: 'Equity stripping is a practice where predatory lenders:', options: ['help borrowers gain equity faster', 'lower the interest rate periodically', 'loan money based on home equity rather than ability to repay', 'require zero fees at closing'], correct_index: 2 },
  { number: 20, question: 'The SAFE Act requires MLOs to act in the best interest of consumers and maintain a:', options: ['minimum sales quota', 'unique identifier through NMLS', 'list of all competitor rates', 'law degree'], correct_index: 1 },
  { number: 21, question: 'Non-traditional mortgage products are defined by the SAFE Act as:', options: ['any loan other than a 30-year fixed-rate mortgage', 'FHA-insured loans only', 'loans with interest rates above 10%', 'VA-guaranteed loans'], correct_index: 0 },
  { number: 22, question: 'Interest-only loans allow borrowers to:', options: ['pay only the principal for the first 10 years', 'delay paying any interest', 'pay only interest for a set period before principal payments begin', 'avoid paying property taxes'], correct_index: 2 },
  { number: 23, question: 'Payment shock occurs when:', options: ['a borrower receives a refund at closing', 'loan payments increase significantly after an initial lower-payment period', 'the interest rate remains fixed for the life of the loan', 'the borrower makes an extra principal payment'], correct_index: 1 },
  { number: 24, question: 'Negative amortization occurs when:', options: ['the loan balance decreases faster than expected', 'the monthly payment does not cover the full interest due, increasing the loan balance', 'the interest rate is zero', 'the borrower pays off the loan early'], correct_index: 1 },
  { number: 25, question: 'Risk layering refers to combining multiple risk factors, such as:', options: ['a low down payment and stable employment', 'a high credit score and a fixed-rate mortgage', 'low documentation and high debt-to-income ratios', 'a 15-year term and full documentation'], correct_index: 2 },
  { number: 26, question: 'Borrower suitability should be assessed by looking at:', options: ['the maximum loan amount a lender will approve', 'the borrower’s long-term ability to repay based on their financial profile', 'only the borrower’s credit score', 'the potential commission for the MLO'], correct_index: 1 },
  { number: 27, question: 'The Interagency Guidance on Nontraditional Mortgage Product Risks emphasizes:', options: ['eliminating all non-traditional loans', 'reducing the amount of disclosures provided', 'ensuring clear communication of risk to consumers', 'increasing interest rates on all ARMs'], correct_index: 2 },
  { number: 28, question: 'Qualified Mortgages (QM) generally prohibit features like:', options: ['30-year terms', 'fixed interest rates', 'negative amortization', 'escrow accounts'], correct_index: 2 },
  { number: 29, question: 'A balloon mortgage typically requires:', options: ['equal payments for 30 years', 'a large final payment at the end of the term', 'no down payment', 'weekly interest payments'], correct_index: 1 },
  { number: 30, question: 'Mortgage origination begins with:', options: ['closing the loan', 'the initial application and information gathering', 'the final underwriting decision', 'recording the deed'], correct_index: 1 },
  { number: 31, question: 'Underwriting is the process of:', options: ['advertising loan products', 'signing the final loan documents', 'evaluating a borrower’s creditworthiness and the collateral value', 'scheduling the closing appointment'], correct_index: 2 },
  { number: 32, question: 'Debt-to-income (DTI) ratio is calculated by dividing:', options: ['total debt by total assets', 'monthly debt obligations by gross monthly income', 'annual income by the loan amount', 'the interest rate by the principal'], correct_index: 1 },
  { number: 33, question: 'Automated Underwriting Systems (AUS) provide:', options: ['guaranteed loan approval', 'a risk assessment and recommendation based on submitted data', 'a final property appraisal', 'direct funding to the borrower'], correct_index: 1 },
  { number: 34, question: 'Loan-to-Value (LTV) is the ratio of:', options: ['the borrower’s income to their debt', 'the loan amount to the property’s appraised value or purchase price', 'the interest rate to the term', 'taxes to insurance'], correct_index: 1 },
  { number: 35, question: 'Oregon’s mortgage lending laws are primarily found in:', options: ['Oregon Revised Statutes (ORS) Chapter 86A', 'The Oregon Constitution', 'The City of Portland Charter', 'Federal RESPA guidelines only'], correct_index: 0 },
  { number: 36, question: 'The Oregon Division of Financial Regulation (DFR) is responsible for:', options: ['selling private mortgage insurance', 'licensing and regulating mortgage professionals in the state', 'setting home prices in Oregon', 'performing home inspections'], correct_index: 1 },
  { number: 37, question: 'Under Oregon law, a “residential mortgage loan” applies to property intended for:', options: ['commercial office use only', 'four or fewer residential units', 'industrial manufacturing', 'unlimited residential units'], correct_index: 1 },
  { number: 38, question: 'In Oregon, an MLO license must be renewed:', options: ['every five years', 'annually', 'only if the MLO changes employers', 'once every decade'], correct_index: 1 },
  { number: 39, question: 'Oregon mortgage law prohibits unlicensed activity, meaning:', options: ['anyone can originate loans as long as they are unpaid', 'only attorneys are exempt from all rules', 'individuals must be licensed or registered to engage in MLO activities', 'licensing is only required for high-interest loans'], correct_index: 2 },
  { number: 40, question: 'Oregon specific continuing education (CE) requirements:', options: ['are optional for experienced MLOs', 'must include Oregon-specific law and regulations as part of the annual 10 hours', 'can be skipped every other year', 'are the same as California’s requirements'], correct_index: 1 },
  { number: 41, question: 'Dishonest or unethical practices in Oregon may lead to:', options: ['a bonus from the state', 'automatic license permanent status', 'administrative penalties, license suspension, or revocation', 'the ability to charge higher fees'], correct_index: 2 },
  { number: 42, question: 'Oregon law requires MLOs to provide disclosures that are:', options: ['clear, concise, and timely', 'written in legal jargon to avoid liability', 'provided only after the loan closes', 'optional if the borrower has a high credit score'], correct_index: 0 },
  { number: 43, question: 'The Oregon “Anti-Coercion” rule relates to:', options: ['forcing borrowers to buy expensive cars', 'prohibiting lenders from requiring borrowers to use a specific insurance provider', 'requiring borrowers to pay for the MLO’s lunch', 'mandating a 20% down payment'], correct_index: 1 },
  { number: 44, question: 'Oregon’s regulatory authority may conduct investigations to:', options: ['find more homes for sale', 'ensure compliance with the Oregon Mortgage Lender Law', 'help MLOs with their marketing', 'raise property taxes'], correct_index: 1 },
  { number: 45, question: 'A primary risk of payment-option ARMs is:', options: ['guaranteed low interest rates', 'potential for significant negative amortization', 'faster loan payoff', 'fixed monthly payments for 30 years'], correct_index: 1 },
  { number: 46, question: 'High-cost loans under HOEPA are also known as:', options: ['Section 32 mortgages', 'Section 8 mortgages', 'FHA loans', 'VA loans'], correct_index: 0 },
  { number: 47, question: 'The "Ability to Repay" rule requires creditors to verify a borrower’s income using:', options: ['verbal confirmation only', 'reasonably reliable third-party records', 'the borrower’s word', 'social media profiles'], correct_index: 1 },
  { number: 48, question: 'Appraisal management companies (AMCs) were regulated to:', options: ['lower appraisal costs', 'ensure appraiser independence and prevent pressure from lenders', 'increase the speed of appraisals', 'eliminate the need for physical inspections'], correct_index: 1 },
  { number: 49, question: 'Redlining is a discriminatory practice based on:', options: ['the borrower’s favorite color', 'the geographic area where the property is located', 'the borrower’s age', 'the size of the loan'], correct_index: 1 },
  { number: 50, question: 'Disparate impact occurs when a policy is neutral on its face but:', options: ['has a disproportionately negative effect on a protected class', 'lowers interest rates for everyone', 'increases the speed of loan processing', 'applies only to commercial loans'], correct_index: 0 },
  { number: 51, question: 'Predatory lending often targets:', options: ['wealthy investors', 'vulnerable populations with limited financial literacy', 'large corporations', 'government agencies'], correct_index: 1 },
  { number: 52, question: 'The TRID rule combined disclosures from which two laws?', options: ['HMDA and ECOA', 'SAFE and HOEPA', 'TILA and RESPA', 'FHA and VA'], correct_index: 2 },
  { number: 53, question: 'The “yield spread premium” was historically used to:', options: ['lower the borrower’s interest rate', 'compensate brokers for originating loans with higher interest rates', 'pay for property taxes', 'fund the NMLS'], correct_index: 1 },
  { number: 54, question: 'The Dodd-Frank Act led to the creation of the:', options: ['HUD', 'CFPB', 'IRS', 'FBI'], correct_index: 1 },
  { number: 55, question: 'A "trigger term" in advertising, such as the down payment amount, requires:', options: ['the ad to be removed', 'full disclosure of other key loan terms', 'a high credit score', 'written approval from HUD'], correct_index: 1 },
  { number: 56, question: 'The Closing Disclosure must be kept by the creditor for:', options: ['1 year', '3 years', '5 years', '10 years'], correct_index: 2 },
  { number: 57, question: ' Oregon law states that MLOs have a "quasi-fiduciary" duty, meaning they must:', options: ['put their own interests first', 'act in good faith and fair dealing toward the borrower', 'guarantee the lowest rate in the country', 'provide legal advice to every borrower'], correct_index: 1 },
  { number: 58, question: 'Unlicensed MLO activity in Oregon is a:', options: ['minor clerical error', 'violation that can result in significant civil penalties', 'requirement for all new employees', 'way to avoid paying taxes'], correct_index: 1 },
  { number: 59, question: 'The NMLS system was established to:', options: ['provide a centralized database for mortgage licensing', 'sell mortgage leads to brokers', 'offer free credit scores to consumers', 'replace the CFPB'], correct_index: 0 },
  { number: 60, question: 'A "Lock-in Agreement" in Oregon must specify:', options: ['the color of the house', 'the expiration date of the interest rate lock', ' the borrower’s previous address', 'the MLO’s home phone number'], correct_index: 1 },
  { number: 61, question: 'Mortgage lending is a complex industry with high risks and long-term obligations, so without legal protections consumers may be vulnerable to:', options: ['guaranteed appreciation', 'zero-cost refinancing', 'automatic foreclosure protections', 'misleading information and unfair practices'], correct_index: 3 },
  { number: 62, question: 'The key topics section lists prohibited acts under Oregon law including unlicensed activity and:', options: ['charging interest', 'collecting escrows', 'fraud and misrepresentation', 'providing disclosures'], correct_index: 2 },
  { number: 63, question: 'The case study describes a borrower complaint being filed with the Oregon DFR after learning they were not presented with:', options: ['a fixed-rate option alongside the ARM', 'any Loan Estimate', 'any Closing Disclosure', 'any appraisal'], correct_index: 1 },
  { number: 64, question: 'From a student’s perspective, the booklet says the DFR serves as both a guardian of consumer interests and:', options: ['a private lender issuing mortgages', 'a credit bureau collecting scores', 'a title insurer recording deeds', 'an oversight authority establishing expectations for licensee conduct'], correct_index: 3 },
  { number: 65, question: 'Which is a protected class under the Fair Housing Act?', options: ['Credit score', 'Disability', 'Income level', 'Loan size'], correct_index: 1 },
  { number: 66, question: 'Reverse redlining refers to:', options: ['Serving all communities equally', 'Targeting protected classes for high-cost loans', 'Avoiding rural lending', 'Lowering rates'], correct_index: 1 },
  { number: 67, question: 'TRID integrated disclosures from:', options: ['ECOA and FHA', 'TILA and RESPA', 'SAFE and HMDA', 'ATR and QM'], correct_index: 1 },
  { number: 68, question: 'The SAFE Act was enacted in:', options: ['2005', '2007', '2008', '2010'], correct_index: 2 },
  { number: 69, question: 'Risk layering increases:', options: ['Loan simplicity', 'Default probability', 'Compliance ease', 'Equity growth'], correct_index: 1 },
  { number: 70, question: 'Documentation standards are essential to:', options: ['Increase commissions', 'Demonstrate compliance', 'Avoid disclosures', 'Remove QM'], correct_index: 1 }
];

// ── Official Final Exam: 35 Questions (Attempt 1) ─────────────────────
// Derived from "10-Hour OR SAFE Comprehensive - Final Exam.docx"
const FINAL_EXAM_35 = [
  { number: 1, question: 'What is the main purpose of the Truth in Lending Act (TILA)?', options: ['to set state interest rate caps for all mortgages', 'to promote the informed use of consumer credit through disclosures', 'to prohibit all adjustable-rate mortgages', 'to require lenders to offer credit to every applicant'], correct_index: 1 },
  { number: 2, question: 'Which federal agency implements TILA through Regulation Z?', options: ['FDIC', 'CFPB', 'HUD', 'Fannie Mae'], correct_index: 1 },
  { number: 3, question: 'Under TILA, which disclosure represents the cost of credit expressed as a yearly rate and includes certain fees?', options: ['loan-to-value ratio', 'principal balance', 'APR', 'note rate'], correct_index: 2 },
  { number: 4, question: 'RESPA primarily addresses:', options: ['settlement service disclosures and prohibitions on kickbacks', 'credit reporting accuracy requirements', 'property appraisal standards', 'the federal minimum wage'], correct_index: 0 },
  { number: 5, question: 'RESPA Section 8 prohibits:', options: ['using escrow accounts', 'charging any origination fee', 'disclosing affiliate relationships', 'kickbacks and unearned fees related to settlement services'], correct_index: 3 },
  { number: 6, question: 'Under TRID, the Loan Estimate is designed to help consumers:', options: ['replace the promissory note', 'finalize the loan at closing', 'compare loan terms and closing costs early in the process', 'avoid receiving a Closing Disclosure'], correct_index: 2 },
  { number: 7, question: 'Which statement best describes the Closing Disclosure timing requirement?', options: ['it replaces the loan estimate within 24 hours of application', 'it is provided only upon borrower request', 'it is provided at least three business days before consummation', 'it is delivered after the loan has funded'], correct_index: 2 },
  { number: 8, question: 'The Equal Credit Opportunity Act (ECOA) prohibits discrimination based on:', options: ['credit score', 'marital status', 'loan amount', 'property age'], correct_index: 1 },
  { number: 9, question: 'The Fair Housing Act (FHA) prohibits discrimination in housing-related transactions, including:', options: ['checking employment history', 'refusing a loan based on race or national origin', 'requesting a property appraisal', 'requiring a down payment'], correct_index: 1 },
  { number: 10, question: 'The Home Mortgage Disclosure Act (HMDA) was enacted to:', options: ['set mortgage interest rates', 'collect and report data to identify potential discriminatory lending', 'eliminate the need for appraisals', 'provide free home inspections'], correct_index: 1 },
  { number: 11, question: 'Ethics in mortgage lending involves more than just following the law; it involves:', options: ['maximizing the lender’s profits at all costs', 'avoiding all communication with borrowers', 'upholding honesty, fairness, and professional integrity', 'charging the highest fees allowed by law'], correct_index: 2 },
  { number: 12, question: 'Fraud for property is most commonly committed by:', options: ['appraisers inflating values for kickbacks', 'borrowers misrepresenting information to gain homeownership', 'MLOs steering borrowers to high-cost loans', 'investors seeking to strip equity'], correct_index: 1 },
  { number: 13, question: 'Occupancy fraud occurs when a borrower:', options: ['fails to pay property taxes', 'obtains a loan for an investment property but claims it as a primary residence', 'refuses to sign the Closing Disclosure', 'applies for a loan using a false name'], correct_index: 1 },
  { number: 14, question: 'In the Oregon State Law module, the regulatory authority is identified as the:', options: ['Oregon Real Estate Agency', 'Oregon Housing and Community Services', 'Oregon Division of Financial Regulation (DFR)', 'Oregon Department of Justice'], correct_index: 2 },
  { number: 15, question: 'According to Oregon law, an individual must be licensed as a mortgage loan originator to:', options: ['clean a mortgage office', 'provide technical support for loan software', 'perform clerical tasks like filing', 'engage in mortgage loan origination activities for residential property'], correct_index: 3 },
  { number: 16, question: 'The Oregon Mortgage Lender Law requires licensees to:', options: ['always charge the maximum interest rate', 'avoid providing disclosures to speed up the process', 'comply with state standards for honesty, fairness, and professional conduct', 'only work with borrowers who have perfect credit'], correct_index: 2 },
  { number: 17, question: 'A prohibited act in Oregon mortgage lending includes:', options: ['disclosing the APR', 'making a material misstatement or omission in a loan application', 'offering a 30-year fixed-rate mortgage', 'conducting a background check on employees'], correct_index: 1 },
  { number: 18, question: 'Under Oregon law, the "lock-in agreement" must be:', options: ['verbal only', 'shared only with the title company', 'provided to the lender after closing', 'in writing and provided to the borrower'], correct_index: 3 },
  { number: 19, question: 'Oregon regulators have the authority to:', options: ['issue home warranties', 'conduct examinations and investigations of licensees', 'guarantee loan approval for all residents', 'set real estate commissions'], correct_index: 3 },
  { number: 20, question: 'The SAFE Act definition of a non-traditional mortgage is:', options: ['any loan with a variable rate', 'a 15-year fixed mortgage', 'any mortgage product other than a 30-year fixed-rate mortgage', 'an FHA loan'], correct_index: 2 },
  { number: 21, question: 'Risk layering is described as combining multiple risk factors, such as:', options: ['high credit score and large down payment', 'fixed-rate loan and stable employment', 'low documentation and high debt-to-income (DTI)', '15-year term and full appraisal'], correct_index: 2 },
  { number: 22, question: 'Interest-only loans are considered non-traditional because:', options: ['they require daily payments', 'they never have a closing cost', 'they do not require any interest payments', 'the initial payments do not reduce the principal balance'], correct_index: 3 },
  { number: 23, question: 'Payment shock is a significant risk for borrowers whose:', options: ['credit score improves', 'property value stays the same', 'monthly payments increase dramatically after an initial period', 'loan is fully amortized from day one'], correct_index: 2 },
  { number: 24, question: 'Negative amortization occurs when the monthly payment:', options: ['exceeds the interest due', 'is exactly equal to the principal due', 'does not cover the full interest due, causing the principal balance to grow', 'is paid in cash'], correct_index: 2 },
  { number: 25, question: 'The Interagency Guidance emphasizes that MLOs should:', options: ['only offer fixed-rate loans', 'avoid disclosing risk to borrowers', 'increase the amount of junk fees charged', 'ensure borrowers clearly understand the risks of non-traditional products'], correct_index: 3 },
  { number: 26, question: 'The Mortgage Origination module identifies the first step of the process as:', options: ['closing', 'application and gathering information', 'recording the deed', 'selling the loan'], correct_index: 1 },
  { number: 27, question: 'Underwriting is defined as the process of:', options: ['finding a house for a borrower', 'advertising mortgage rates', 'evaluating a borrower’s creditworthiness and the collateral’s value', 'preparing the final deed'], correct_index: 2 },
  { number: 28, question: 'The Debt-to-Income (DTI) ratio is a key factor in determining:', options: ['the property’s location', 'a borrower’s capacity to repay the loan', 'the appraiser’s fee', 'the escrow refund amount'], correct_index: 1 },
  { number: 29, question: 'Oregon mortgage law requires that advertisements include:', options: ['the MLO’s personal cell phone number', 'the name of the MLO’s spouse', 'the name of the licensed entity and its NMLS unique identifier', 'a list of all previous clients'], correct_index: 2 },
  { number: 30, question: 'Failure to comply with Oregon’s licensing requirements can result in:', options: ['administrative penalties and license revocation', 'a commendation from the DFR', 'an automatic interest rate reduction', 'a free NMLS account'], correct_index: 1 },
  { number: 31, question: 'The booklet identifies "steering" as an unethical practice where an MLO:', options: ['helps a borrower find a cheaper home', 'explains the benefits of a fixed rate', 'pushes a borrower toward a specific loan for the MLO’s financial benefit above the borrower’s best interest', 'removes the need for disclosures'], correct_index: 2 },
  { number: 32, question: 'Oregon CE requirements reinforce that holding a mortgage license is a position of:', options: ['reduced liability', 'guaranteed income', 'tax exemption', 'trust'], correct_index: 3 },
  { number: 33, question: 'The booklet emphasizes completing CE early to avoid issues such as:', options: ['automatic audits for early completion', 'technical problems or missing credit reporting before renewal', 'loss of the right of rescission', 'higher interest rates'], correct_index: 2 },
  { number: 34, question: 'The booklet describes record-keeping as important because regulators may view poor documentation as:', options: ['proof of full compliance', 'a substitute for CE', 'a warning sign of broader compliance weaknesses', 'a reason to waive renewal fees'], correct_index: 2 },
  { number: 35, question: 'If CE credits are missing in NMLS, licensees should:', options: ['ignore it', 'wait until after renewal', 'file a property tax appeal', 'resolve discrepancies promptly'], correct_index: 3 }
];

// ── Course Data Object ────────────────────────────────────────────────
const courseData = {
  title:           '10-HOUR OR SAFE COMPREHENSIVE: ANNUAL MLO FUNDAMENTALS',
  nmls_course_id:  'CE-OR-SAFE-10HR',
  type:            'CE',
  credit_hours:    10,
  description:     'This 10-hour SAFE Act continuing education course for Oregon mortgage professionals covers Federal Law (3 hrs), Ethics (2 hrs), Non-Traditional Lending (2 hrs), Mortgage Origination (1 hr), and Oregon State Law (2 hrs).',
  price:           129.00,
  states_approved: ['OR'],
  has_textbook:    false,
  is_active:       true,
  pdf_url:         OR_TEXTBOOK_PDF,

  modules: [
    {
      order: 1, title: 'Federal Mortgage-Related Laws', credit_hours: 3,
      pdf_url: OR_TEXTBOOK_PDF,
      quiz: [
        { number: 1, question: 'What is the primary purpose of the Truth in Lending Act (TILA)?', options: ['To promote fair lending practices', 'To ensure lenders offer credit to all consumers', 'To provide clear and standardized disclosures about credit costs', 'To restrict mortgage loan interest rates'], correct_index: 2 },
        { number: 2, question: 'Which act prohibits discrimination in housing-related transactions, including mortgage lending?', options: ['Equal Credit Opportunity Act (ECOA)', 'Fair Housing Act (FHA)', 'Real Estate Settlement Procedures Act (RESPA)', 'Home Mortgage Disclosure Act (HMDA)'], correct_index: 1 },
        { number: 3, question: 'Which of the following requires lenders to disclose settlement costs to consumers and prohibits kickbacks?', options: ['Truth in Lending Act (TILA)', 'Equal Credit Opportunity Act (ECOA)', 'Real Estate Settlement Procedures Act (RESPA)', 'The SAFE Act'], correct_index: 2 },
        { number: 4, question: 'What does ECOA prohibit in mortgage lending?', options: ['Discriminating based on creditworthiness', 'Discriminating based on race, sex, or marital status', 'Failing to issue a Loan Estimate', 'Charging higher interest rates'], correct_index: 1 },
        { number: 5, question: 'Which federal act requires the collection and reporting of mortgage lending data to identify discriminatory practices?', options: ['The SAFE Act', 'Home Mortgage Disclosure Act (HMDA)', 'Fair Housing Act (FHA)', 'Truth in Lending Act (TILA)'], correct_index: 1 }
      ]
    },
    {
      order: 2, title: 'Ethical Guidelines for MLOs', credit_hours: 2,
      pdf_url: OR_TEXTBOOK_PDF,
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
      pdf_url: OR_TEXTBOOK_PDF,
      quiz: [
        { number: 1, question: 'Which of the following is a non-traditional mortgage product?', options: ['Fixed-rate mortgage', 'Interest-only mortgage', 'Fully amortizing adjustable-rate mortgage', 'Conventional loan'], correct_index: 1 },
        { number: 2, question: 'What is the primary risk associated with interest-only mortgages?', options: ['Fixed monthly payments', 'Payment shock after the interest-only period ends', 'High upfront fees', 'No interest rate changes'], correct_index: 1 },
        { number: 3, question: 'How do non-traditional mortgage products typically qualify borrowers?', options: ['Strictly by W-2 income', 'Using alternative income documentation like bank statements', 'Based solely on credit score', 'With no documentation needed'], correct_index: 1 },
        { number: 4, question: 'What does the SAFE Act require for mortgage loan originators involved in non-traditional lending?', options: ['A minimum credit score of 700', 'Enhanced licensing and training', 'Higher commissions for riskier loans', 'No additional requirements compared to traditional lending'], correct_index: 1 },
        { number: 5, question: 'Which of the following is a significant consumer risk with non-traditional mortgage products?', options: ['Predictable payments throughout the loan', 'Lack of transparency in loan terms', 'Long-term cost savings', 'Immediate full repayment of the loan balance'], correct_index: 1 }
      ]
    },
    {
      order: 4, title: 'Mortgage Origination', credit_hours: 1,
      pdf_url: OR_TEXTBOOK_PDF,
      quiz: [
        { number: 1, question: 'Which document must be provided within three business days of receiving a loan application?', options: ['Closing Disclosure', 'Loan Estimate', 'Credit Report', 'Mortgage Deed'], correct_index: 1 },
        { number: 2, question: 'What does the Loan Estimate (LE) include?', options: ['Interest rate only', 'Loan terms, projected payments, and closing costs', "Borrower's credit score", 'Property details'], correct_index: 1 },
        { number: 3, question: 'What is the role of the Mortgage Loan Originator (MLO) in underwriting?', options: ['Approve loans', 'Assess credit risk only', 'Submit applications to underwriters and address conditions', 'Perform final loan closings'], correct_index: 2 },
        { number: 4, question: 'What is the primary function of Automated Underwriting Systems (AUS)?', options: ['Provide final loan approval', 'Assess risk based on borrower data and generate loan recommendations', 'Evaluate the property for loan approval', 'Set loan interest rates'], correct_index: 1 },
        { number: 5, question: 'Which document must be provided to consumers three business days before closing?', options: ['Loan Estimate', 'Closing Disclosure', 'Pre-Approval Letter', 'Credit Report'], correct_index: 1 }
      ]
    },
    {
      order: 5, title: 'Oregon State Law and Regulations', credit_hours: 2,
      pdf_url: OR_TEXTBOOK_PDF,
      quiz: [
        { number: 1, question: 'Which agency is primarily responsible for licensing, supervision, and enforcement of mortgage lenders and mortgage loan originators in Oregon?', options: ['Oregon Real Estate Agency', 'Oregon Division of Financial Regulation', 'U.S. Department of Housing and Urban Development', 'Nationwide Multistate Licensing System (NMLS)'], correct_index: 1 },
        { number: 2, question: 'Which of the following best describes Oregon\'s state-specific continuing education (CE) requirement for mortgage loan originators?', options: ['State-specific CE may be carried forward if excess hours are earned', 'Any mortgage-related training may satisfy state CE requirements', 'Oregon-specific CE must be completed each renewal period and may not be substituted', 'State CE is optional if federal CE requirements are met'], correct_index: 2 },
        { number: 3, question: 'Under Oregon mortgage law, which action is strictly prohibited and may result in enforcement action?', options: ['Providing borrowers with multiple loan options', 'Steering a borrower toward a loan that benefits the MLO\'s compensation over the borrower\'s interest', 'Disclosing all material loan terms accurately', 'Maintaining complete loan files for regulatory review'], correct_index: 1 },
        { number: 4, question: 'Mortgage advertisements in Oregon must include which of the following?', options: ['The personal email address of the mortgage loan originator', 'The licensed mortgage company name and NMLS Unique Identifier', 'A complete list of all interest rates offered', 'Written approval from the DFR before publication'], correct_index: 1 },
        { number: 5, question: 'What may the Oregon Division of Financial Regulation order in response to violations of mortgage law?', options: ['Criminal prosecution only', 'Civil penalties and restitution to affected borrowers', 'Mandatory referral to federal authorities', 'Automatic license reinstatement after a fine is paid'], correct_index: 1 }
      ]
    },
    {
      order: 6, title: 'FINAL - OREGON', credit_hours: 0,
      pdf_url: OR_FINAL_PDF, show_pdf_before_quiz: false,
      quiz: []
    }
  ],

  final_exam: {
    title:              '10-HOUR OR SAFE COMPREHENSIVE — Final Exam',
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

    await Course.deleteOne({ nmls_course_id: 'CE-OR-SAFE-10HR' });
    console.log('🗑️ Removed existing Oregon SAFE course');

    const course = await Course.create(courseData);
    console.log(`\n✅ Course inserted: ${course.title}`);
    console.log(`\n📋 Final Exam Attempt 1: ${FINAL_EXAM_35.length} official questions`);
    console.log(`📋 Retry Bank: ${QUESTION_BANK_70.length} official questions from bank`);
    console.log(`\n🎯 Test at: /courses/CE-OR-SAFE-10HR/learn`);

    await mongoose.disconnect();
    process.exit(0);
  } catch (err) {
    console.error('❌ Seed failed:', err.message);
    process.exit(1);
  }
};

seed();