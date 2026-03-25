const BASE_REQUIREMENT = {
  preLicensingHours: 20,
  subjectBreakdown: [
    { label: 'Federal Law', hours: 3 },
    { label: 'Ethics', hours: 3 },
    { label: 'Non-Traditional Mortgage Lending', hours: 2 },
    { label: 'General Elective', hours: 12 },
  ],
  exam: {
    format: 'National SAFE MLO test with 125 scored multiple-choice questions and 10 unscored questions.',
    passScore: '75%',
    scheduling: 'Schedule through NMLS testing partner after your MU4 filing and pre-licensing education are marked complete.',
  },
  postExamSteps: [
    'Submit MU4 and complete criminal background check and fingerprints.',
    'Authorize credit report and satisfy sponsorship requirements, if required by your regulator.',
    'Pay state filing fees and monitor regulator requests in your NMLS account.',
  ],
  ceRenewal: {
    hours: 8,
    frequency: 'Annually, by December 31',
    breakdown: [
      { label: 'Federal Law', hours: 3 },
      { label: 'Ethics', hours: 2 },
      { label: 'Non-Traditional Mortgage Lending', hours: 2 },
      { label: 'Elective', hours: 1 },
    ],
  },
};

export const STATE_REQUIREMENTS = {
  CA: {
    preLicensingHours: 20,
    subjectBreakdown: [
      { label: 'Federal Law', hours: 3 },
      { label: 'Ethics', hours: 3 },
      { label: 'Non-Traditional Mortgage Lending', hours: 2 },
      { label: 'California DBO/DFPI Elective', hours: 12 },
    ],
    exam: {
      format: 'National SAFE MLO test (multiple choice). California no longer requires a separate state test for most licensees.',
      passScore: '75%',
      scheduling: 'Reserve your exam session in NMLS once your education status is posted complete.',
    },
    postExamSteps: [
      'Submit MU4 with California DFPI sponsorship details and disclosures.',
      'Complete fingerprints and background checks according to DFPI instructions.',
      'Respond to DFPI deficiency notices and wait for final approval in NMLS.',
    ],
    ceRenewal: {
      hours: 8,
      frequency: 'Annually, by December 31',
      breakdown: [
        { label: 'Federal Law', hours: 3 },
        { label: 'Ethics', hours: 2 },
        { label: 'Non-Traditional Mortgage Lending', hours: 2 },
        { label: 'Elective', hours: 1 },
      ],
    },
  },
  FL: {
    postExamSteps: [
      'Submit MU4 with Florida Office of Financial Regulation employer sponsorship.',
      'Complete required fingerprints through approved vendors.',
      'Track open deficiencies and upload any requested documents in NMLS.',
    ],
  },
  HI: {
    postExamSteps: [
      'File MU4 and provide Hawaii company sponsorship in NMLS.',
      'Complete criminal background check and fulfill state documentation requests.',
      'Await regulator approval before conducting licensed activities.',
    ],
  },
  NC: {
    postExamSteps: [
      'Submit MU4 for North Carolina Commissioner of Banks review.',
      'Complete all background, credit, and sponsorship requirements.',
      'Monitor NMLS for any state-specific follow-up items.',
    ],
  },
  NJ: {
    ceRenewal: {
      hours: 8,
      frequency: 'Annually, by December 31',
      breakdown: [
        { label: 'Federal Law', hours: 3 },
        { label: 'Ethics', hours: 2 },
        { label: 'Non-Traditional Mortgage Lending', hours: 2 },
        { label: 'New Jersey Elective', hours: 1 },
      ],
    },
  },
  NM: {
    ceRenewal: {
      hours: 8,
      frequency: 'Annually, by December 31',
      breakdown: [
        { label: 'Federal Law', hours: 3 },
        { label: 'Ethics', hours: 2 },
        { label: 'Non-Traditional Mortgage Lending', hours: 2 },
        { label: 'New Mexico Elective', hours: 1 },
      ],
    },
  },
  NY: {
    preLicensingHours: 20,
    subjectBreakdown: [
      { label: 'Federal Law', hours: 3 },
      { label: 'Ethics', hours: 3 },
      { label: 'Non-Traditional Mortgage Lending', hours: 2 },
      { label: 'New York Elective', hours: 12 },
    ],
    ceRenewal: {
      hours: 11,
      frequency: 'Annually, by December 31',
      breakdown: [
        { label: 'Federal Law', hours: 3 },
        { label: 'Ethics', hours: 3 },
        { label: 'Non-Traditional Mortgage Lending', hours: 2 },
        { label: 'New York Elective', hours: 3 },
      ],
    },
  },
  OR: {
    ceRenewal: {
      hours: 10,
      frequency: 'Annually, by December 31',
      breakdown: [
        { label: 'Federal Law', hours: 3 },
        { label: 'Ethics', hours: 2 },
        { label: 'Non-Traditional Mortgage Lending', hours: 2 },
        { label: 'Oregon Elective', hours: 3 },
      ],
    },
  },
  PA: {
    ceRenewal: {
      hours: 8,
      frequency: 'Annually, by December 31',
      breakdown: [
        { label: 'Federal Law', hours: 3 },
        { label: 'Ethics', hours: 2 },
        { label: 'Non-Traditional Mortgage Lending', hours: 2 },
        { label: 'Pennsylvania Elective', hours: 1 },
      ],
    },
  },
  RI: {
    ceRenewal: {
      hours: 8,
      frequency: 'Annually, by December 31',
      breakdown: [
        { label: 'Federal Law', hours: 3 },
        { label: 'Ethics', hours: 2 },
        { label: 'Non-Traditional Mortgage Lending', hours: 2 },
        { label: 'Rhode Island Elective', hours: 1 },
      ],
    },
  },
};

function mergeRequirement(base, override = {}) {
  return {
    preLicensingHours: override.preLicensingHours ?? base.preLicensingHours,
    subjectBreakdown: override.subjectBreakdown ?? base.subjectBreakdown,
    exam: {
      ...base.exam,
      ...(override.exam || {}),
    },
    postExamSteps: override.postExamSteps ?? base.postExamSteps,
    ceRenewal: {
      ...base.ceRenewal,
      ...(override.ceRenewal || {}),
      breakdown: override.ceRenewal?.breakdown ?? base.ceRenewal.breakdown,
    },
  };
}

export function getStateRequirement(stateCode) {
  const code = String(stateCode || '').toUpperCase();
  const override = STATE_REQUIREMENTS[code] || {};
  return mergeRequirement(BASE_REQUIREMENT, override);
}
