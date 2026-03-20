export const RESOURCE_CATEGORIES = [
  'Study Tips',
  'State Guides',
  'Career Advice',
  'Industry News',
];

export const RESOURCE_ARTICLES = [
  {
    id: 1,
    slug: 'nmls-study-plan-first-30-days',
    title: 'Your First 30 Days: A Practical NMLS Study Plan',
    excerpt:
      'Build momentum in your first month with a repeatable routine that balances coursework, retention, and practice exams.',
    category: 'Study Tips',
    publishedAt: '2026-02-20',
    readMinutes: 8,
    featured: true,
    coverImage:
      'https://images.unsplash.com/photo-1454165804606-c3d57bc86b40?auto=format&fit=crop&w=1400&q=80',
    author: {
      name: 'Jasmine Cole',
      role: 'Curriculum Lead',
    },
    content: [
      {
        heading: 'Start with weekly outcomes, not hourly goals',
        paragraphs: [
          'Most learners overcommit in week one and burn out by week three. Instead of assigning large daily study blocks, define one weekly target: modules completed, quiz score threshold, and one recap session.',
          'This approach lowers friction and keeps your progress measurable. Small wins create consistency, and consistency drives exam readiness.',
        ],
      },
      {
        heading: 'Use active recall at the end of every module',
        paragraphs: [
          'After each lesson, close your notes and write down three key points from memory. Then verify accuracy. This is one of the fastest ways to improve long-term retention.',
          'Pair this with spaced review: revisit your summary at 24 hours, 7 days, and 14 days.',
        ],
      },
      {
        heading: 'Treat practice tests like diagnostics',
        paragraphs: [
          'Do not wait for perfect confidence before taking practice exams. Start early, then use incorrect answers to prioritize what to review next.',
          'Track weak domains by topic and schedule focused review blocks each weekend.',
        ],
      },
    ],
  },
  {
    id: 2,
    slug: 'california-mlo-license-roadmap',
    title: 'California MLO Licensing Roadmap: What to Do First',
    excerpt:
      'A step-by-step guide for California candidates, from education setup to exam timing and application sequencing.',
    category: 'State Guides',
    publishedAt: '2026-01-26',
    readMinutes: 7,
    featured: false,
    coverImage:
      'https://images.unsplash.com/photo-1469474968028-56623f02e42e?auto=format&fit=crop&w=1400&q=80',
    author: {
      name: 'Ethan Parker',
      role: 'Compliance Advisor',
    },
    content: [
      {
        heading: 'Sequence your milestones to avoid delays',
        paragraphs: [
          'Begin with your approved education, then schedule exam preparation, and only then move into filing steps. Sequence matters because mismatched timing creates avoidable waiting periods.',
        ],
      },
      {
        heading: 'Document readiness is part of exam readiness',
        paragraphs: [
          'Keep all application-related documents organized in one folder while you study. This reduces stress and prevents post-exam bottlenecks.',
        ],
      },
    ],
  },
  {
    id: 3,
    slug: 'new-mlo-career-first-90-days',
    title: 'Starting Your MLO Career: The First 90 Days That Matter',
    excerpt:
      'How new mortgage loan originators can structure onboarding, mentorship, and pipeline habits for long-term growth.',
    category: 'Career Advice',
    publishedAt: '2025-12-10',
    readMinutes: 9,
    featured: false,
    coverImage:
      'https://images.unsplash.com/photo-1552664730-d307ca884978?auto=format&fit=crop&w=1400&q=80',
    author: {
      name: 'Nicole Grant',
      role: 'Career Coach',
    },
    content: [
      {
        heading: 'Build repeatable lead follow-up routines',
        paragraphs: [
          'Top performers are consistent before they are exceptional. Block daily time for follow-up, referral outreach, and pipeline updates.',
        ],
      },
      {
        heading: 'Create one source of truth for your pipeline',
        paragraphs: [
          'A single CRM workflow improves response time and gives managers clear visibility into your progress.',
        ],
      },
    ],
  },
  {
    id: 4,
    slug: 'industry-outlook-rates-and-volume-2026',
    title: 'Industry Outlook 2026: Rates, Volume, and Borrower Behavior',
    excerpt:
      'A quick market briefing on what MLOs should watch this year and how to adapt education and sales strategy.',
    category: 'Industry News',
    publishedAt: '2026-03-01',
    readMinutes: 6,
    featured: false,
    coverImage:
      'https://images.unsplash.com/photo-1611974789855-9c2a0a7236a3?auto=format&fit=crop&w=1400&q=80',
    author: {
      name: 'Miles Turner',
      role: 'Industry Analyst',
    },
    content: [
      {
        heading: 'Borrowers are shopping harder and earlier',
        paragraphs: [
          'Expect more comparison behavior and longer decision cycles. MLOs who educate early and often are more likely to convert in competitive scenarios.',
        ],
      },
      {
        heading: 'Advisory positioning beats transactional positioning',
        paragraphs: [
          'Clients respond to clarity and planning. Communicate next steps and timelines in plain language to build trust.',
        ],
      },
    ],
  },
  {
    id: 5,
    slug: 'how-to-review-state-specific-requirements-fast',
    title: 'How to Review State-Specific Requirements Quickly',
    excerpt:
      'Use a checklist framework to compare state-specific rules without losing time or missing critical details.',
    category: 'State Guides',
    publishedAt: '2025-11-05',
    readMinutes: 5,
    featured: false,
    coverImage:
      'https://images.unsplash.com/photo-1486406146926-c627a92ad1ab?auto=format&fit=crop&w=1400&q=80',
    author: {
      name: 'Olivia Chen',
      role: 'Licensing Specialist',
    },
    content: [
      {
        heading: 'Use one worksheet across all states',
        paragraphs: [
          'Track education hours, exam rules, and renewal timelines in a single table. This keeps your comparisons objective and easy to update.',
        ],
      },
    ],
  },
  {
    id: 6,
    slug: 'exam-week-mental-prep-for-mlo-candidates',
    title: 'Exam Week Mental Prep for MLO Candidates',
    excerpt:
      'A calm, practical approach for the final week before your licensing exam.',
    category: 'Study Tips',
    publishedAt: '2025-10-18',
    readMinutes: 4,
    featured: false,
    coverImage:
      'https://images.unsplash.com/photo-1506784365847-bbad939e9335?auto=format&fit=crop&w=1400&q=80',
    author: {
      name: 'Liam Hudson',
      role: 'Exam Prep Mentor',
    },
    content: [
      {
        heading: 'Protect sleep and simplify your review',
        paragraphs: [
          'In the final week, prioritize sleep and short review bursts over late-night cramming. Clarity and recall improve when your routine is stable.',
        ],
      },
    ],
  },
  {
    id: 7,
    slug: 'how-to-build-a-weekly-quiz-routine',
    title: 'How to Build a Weekly Quiz Routine That Actually Sticks',
    excerpt:
      'A simple cadence for quiz review that improves retention without overwhelming your schedule.',
    category: 'Study Tips',
    publishedAt: '2026-03-07',
    readMinutes: 6,
    featured: false,
    coverImage:
      'https://images.unsplash.com/photo-1434030216411-0b793f4b4173?auto=format&fit=crop&w=1400&q=80',
    author: {
      name: 'Avery Mills',
      role: 'Learning Strategist',
    },
    content: [
      {
        heading: 'Anchor quizzes to your calendar',
        paragraphs: [
          'Pick two fixed weekly windows for quizzes and protect them like appointments. Consistency matters more than session length.',
          'Use your first session for new content checks and the second for cumulative review.',
        ],
      },
      {
        heading: 'Review misses with a pattern lens',
        paragraphs: [
          'Do not just mark answers wrong. Label each miss by type: concept confusion, misread question, or time pressure. Then target the pattern that appears most.',
        ],
      },
    ],
  },
  {
    id: 8,
    slug: 'texas-state-elective-common-mistakes',
    title: 'Texas State Elective: Common Mistakes and How to Avoid Them',
    excerpt:
      'A practical checklist for avoiding the most common compliance misunderstandings in Texas state content.',
    category: 'State Guides',
    publishedAt: '2026-02-08',
    readMinutes: 7,
    featured: false,
    coverImage:
      'https://images.unsplash.com/photo-1517048676732-d65bc937f952?auto=format&fit=crop&w=1400&q=80',
    author: {
      name: 'Mason Bell',
      role: 'State Compliance Specialist',
    },
    content: [
      {
        heading: 'Do not generalize from federal-only examples',
        paragraphs: [
          'Many candidates apply federal examples too broadly. Texas elective material should be studied with state-specific definitions side by side.',
        ],
      },
      {
        heading: 'Map each rule to a real workflow step',
        paragraphs: [
          'If you can attach each policy to a step in the loan lifecycle, you will recall it faster under exam pressure.',
        ],
      },
    ],
  },
  {
    id: 9,
    slug: 'from-student-to-producing-loan-officer',
    title: 'From Student to Producing Loan Officer: Your Transition Plan',
    excerpt:
      'What to focus on in your first year so your licensing effort translates into real production habits.',
    category: 'Career Advice',
    publishedAt: '2026-02-14',
    readMinutes: 8,
    featured: false,
    coverImage:
      'https://images.unsplash.com/photo-1462899006636-339e08d1844e?auto=format&fit=crop&w=1400&q=80',
    author: {
      name: 'Sienna Rhodes',
      role: 'Industry Mentor',
    },
    content: [
      {
        heading: 'Build a production rhythm early',
        paragraphs: [
          'Create daily rituals around outreach, follow-up, and pipeline hygiene. Your early habits matter more than perfect scripts.',
        ],
      },
      {
        heading: 'Find coaching loops, not just motivation',
        paragraphs: [
          'Track conversion metrics weekly and review with a mentor. Progress compounds when feedback is frequent and specific.',
        ],
      },
    ],
  },
  {
    id: 10,
    slug: 'what-changing-rate-cycles-mean-for-new-mlos',
    title: 'What Changing Rate Cycles Mean for New MLOs',
    excerpt:
      'How to reposition your borrower conversations when rates and refinance demand shift across quarters.',
    category: 'Industry News',
    publishedAt: '2026-03-10',
    readMinutes: 6,
    featured: false,
    coverImage:
      'https://images.unsplash.com/photo-1450101499163-c8848c66ca85?auto=format&fit=crop&w=1400&q=80',
    author: {
      name: 'Daniel Knox',
      role: 'Market Research Editor',
    },
    content: [
      {
        heading: 'Purchase education should lead every conversation',
        paragraphs: [
          'As refinance volume shifts, borrower education around affordability and timing becomes a stronger differentiator for MLOs.',
        ],
      },
      {
        heading: 'Local context beats generic macro headlines',
        paragraphs: [
          'Translate market signals into local borrower implications. Clients respond better to practical guidance than broad national narratives.',
        ],
      },
    ],
  },
];

export const getArticleBySlug = (slug) =>
  RESOURCE_ARTICLES.find((article) => article.slug === slug);

export const getRelatedArticles = (article, limit = 3) => {
  if (!article) return [];

  return RESOURCE_ARTICLES
    .filter((candidate) =>
      candidate.slug !== article.slug && candidate.category === article.category
    )
    .slice(0, limit);
};
