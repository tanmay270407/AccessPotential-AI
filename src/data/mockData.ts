import { CandidateProfile, JobRole, AssessmentResultData, FutureFitComponents } from '../types';

export const defaultCandidate: CandidateProfile = {
  name: '',
  education: '',
  skills: [],
  experience: '',
  preferredJobRole: '',
  resumeFileName: '',
  supportNeeds: [],
};

export const defaultAssessmentResult: AssessmentResultData = {
  overallPerformance: 0,
  scores: {
    problemSolving: 0,
    reasoning: 0,
    decisionMaking: 0,
    communication: 0,
    technicalApproach: 0,
  },
  learningVelocity: {
    firstTask: 0,
    secondTask: 0,
    improvement: 0,
    label: 'Pending Evaluation',
    explanation: '',
  },
  futureFitComponents: {
    problemSolving: 0,
    learningSpeed: 0,
    adaptability: 0,
    feedbackResponse: 0,
    transferableSkills: 0,
  },
  finalFutureFit: 0,
};

export const sampleJobs: JobRole[] = [
  {
    id: 'data-analyst',
    title: 'Data Analyst',
    category: 'Analytics & Insights',
    skills: ['SQL', 'Excel', 'Python'],
    description: 'Interpret business datasets, build dashboards, and uncover actionable growth opportunities.',
    currentFit: 78,
    futureFitComponents: {
      problemSolving: 90,
      learningSpeed: 95,
      adaptability: 88,
      feedbackResponse: 92,
      transferableSkills: 90,
    },
    assessmentTask: {
      title: 'Sales Trend & Root Cause Analysis',
      scenario: 'Quarterly reporting shows an unexpected 14% drop in monthly revenue despite increased promotional ad spend.',
      question: 'Sales decreased this month. Analyze the data and explain the possible reason and what the company should do.',
      dataset: [
        { Region: 'North', 'Ad Spend ($)': '12,000', 'Last Month Sales': '$48,000', 'This Month Sales': '$42,000', 'Return Rate': '12%' },
        { Region: 'West', 'Ad Spend ($)': '18,500', 'Last Month Sales': '$65,000', 'This Month Sales': '$68,000', 'Return Rate': '4%' },
        { Region: 'East', 'Ad Spend ($)': '15,000', 'Last Month Sales': '$52,000', 'This Month Sales': '$39,000', 'Return Rate': '19%' },
        { Region: 'South', 'Ad Spend ($)': '9,000', 'Last Month Sales': '$31,000', 'This Month Sales': '$30,500', 'Return Rate': '5%' },
      ],
      sampleAnswer:
        'Upon cross-referencing regional metrics, the revenue decline is primarily concentrated in the East (-25%) and North (-12.5%) regions despite steady marketing spend. A key driver is the spike in return rates in East (19%) and North (12%), indicating product quality or logistics bottlenecks rather than customer acquisition failure. The company should investigate fulfillment defects in the East warehouse, pause aggressive ad spend in underperforming corridors, and reallocate budget to the healthy West region while addressing product returns.',
      learningSupport: {
        title: 'Diagnostic Framework & Root Cause Modeling',
        description: 'Review these three concepts before trying the next task:',
        keyConcepts: [
          'Isolate Operational vs. Acquisition Signals: A surge in return rates reflects product/fulfillment defect, not ad fatigue.',
          'Cross-Regional Rebalancing: Calculate delta returns per marketing dollar before suggesting sweeping budget cuts.',
          'Formulate Multi-Horizon Remediation: Combine immediate inventory pauses with medium-term logistics audits.',
        ],
      },
      task2: {
        title: 'Q4 Regional Promotion & Retention Test',
        scenario: 'Following logistics adjustments, the East return rate normalized to 8%, but West shipping lead times increased by 3.5 days, causing a 9% dip in checkout re-orders.',
        question: 'Apply your diagnostic framework to assess whether West budget should be reduced or if supply-chain routing should be prioritized.',
        dataset: [
          { Region: 'North', 'Ad Spend ($)': '11,000', 'Sales Target': '$45,000', 'Actual Sales': '$46,200', 'Return Rate': '7%' },
          { Region: 'West', 'Ad Spend ($)': '20,000', 'Sales Target': '$75,000', 'Actual Sales': '$69,500', 'Return Rate': '5%' },
          { Region: 'East', 'Ad Spend ($)': '14,000', 'Sales Target': '$50,000', 'Actual Sales': '$51,000', 'Return Rate': '8%' },
          { Region: 'South', 'Ad Spend ($)': '9,500', 'Sales Target': '$32,000', 'Actual Sales': '$33,000', 'Return Rate': '4%' },
        ],
        sampleAnswer:
          'Maintain West promotional budget because top-of-funnel demand is robust. Prioritize temporary 3PL cross-docking from North/South fulfillment nodes to compress West lead times back under 2 days. The 9% re-order dip is purely supply-chain friction, not brand churn.',
      },
    },
    workplaceProfile: {
      factors: [
        {
          name: 'Screen Reader Support',
          supported: false,
          impactDescription: 'Legacy reporting portal lacks ARIA landmarks and table semantics.',
        },
        {
          name: 'Accessible Documents',
          supported: false,
          impactDescription: 'Standard internal export templates are un-tagged PDFs.',
        },
        {
          name: 'Flexible Hours',
          supported: true,
          impactDescription: 'Core asynchronous work hours with flexible daily schedule.',
        },
        {
          name: 'Remote Work',
          supported: true,
          impactDescription: 'Distributed team with full cloud access and home setup allowance.',
        },
        {
          name: 'Assistive Technology Allowance',
          supported: true,
          impactDescription: 'Pre-approved budget for personalized input hardware and software.',
        },
      ],
      primaryBarrier: {
        title: 'Internal Tool Accessibility',
        category: 'Software Interface',
        severity: 'Critical',
        description: 'Internal reporting software is screen-reader incompatible and lacks keyboard navigation anchors.',
      },
      adaptation: {
        problem: 'Internal reporting software is not screen-reader compatible.',
        recommendedAction: 'Make the internal tool screen-reader compatible or provide an accessible alternative workflow.',
        initialReadiness: 62,
        improvedReadiness: 91,
        implementationTime: '1 - 2 weeks',
        costEstimate: 'Low (Web standard updates)',
        recommendationLabel: 'Hire + Adapt',
        explanation: 'The candidate has strong potential. The main barrier can be addressed through workplace adaptation.',
      },
    },
  },
  {
    id: 'software-developer',
    title: 'Software Developer',
    category: 'Engineering',
    skills: ['Java', 'JavaScript', 'React'],
    description: 'Design, build, and maintain frontend and backend web applications with high reliability.',
    currentFit: 82,
    futureFitComponents: {
      problemSolving: 92,
      learningSpeed: 90,
      adaptability: 86,
      feedbackResponse: 94,
      transferableSkills: 88,
    },
    assessmentTask: {
      title: 'API Latency Bottleneck Optimization',
      scenario: 'Production endpoint /api/products response time surged from 120ms to 2400ms after a database migration.',
      question: 'Identify the probable performance bottleneck from query logs and propose a two-step remediation plan.',
      dataset: [
        { Query: 'SELECT * FROM products JOIN inventory', 'Avg Time': '1,850 ms', Index: 'Missing (Table Scan)', 'Calls/Min': '4,200' },
        { Query: 'SELECT id, title FROM categories', 'Avg Time': '12 ms', Index: 'Primary Key', 'Calls/Min': '1,100' },
        { Query: 'UPDATE product_views SET count = count + 1', 'Avg Time': '420 ms', Index: 'Non-clustered', 'Calls/Min': '5,800' },
      ],
      sampleAnswer:
        'The primary bottleneck is the full table scan on the products join inventory query averaging 1,850ms under heavy volume (4,200 calls/min). First, create a composite foreign key index on inventory.product_id and limit selected columns. Second, implement Redis caching for static product catalog data with a 5-minute TTL to reduce database hits by 80%.',
      learningSupport: {
        title: 'Backend Scalability & Query Tuning',
        description: 'Review these three concepts before trying the next task:',
        keyConcepts: [
          'High Write Volume Bottlenecks: Offload synchronous counter updates to asynchronous message queues (e.g. SQS/Kafka).',
          'Read/Write Replica Splitting: Direct heavy analytic queries away from the primary transactional leader.',
          'Rate-Limiting & Bulk Updates: Batch write bursts rather than executing single row locks per HTTP request.',
        ],
      },
      task2: {
        title: 'High-Throughput Counter Locking Challenge',
        scenario: 'Product views updates are creating table lock contention during flash sales, causing write timeouts.',
        question: 'Apply write-batching or async caching principles to eliminate database table locks on view counters.',
        dataset: [
          { 'Update Strategy': 'Direct Row Update', 'Lock Time': '380 ms', 'Throughput Capacity': '1,200 req/s', 'Failure Rate': '8.2%' },
          { 'Update Strategy': 'Redis In-Memory Counter + 30s Batch Write', 'Lock Time': '1.2 ms', 'Throughput Capacity': '15,000 req/s', 'Failure Rate': '0.01%' },
        ],
        sampleAnswer:
          'Migrate view counting to Redis INCRBY in memory, flushing totals to Postgres via a worker every 30 seconds. This avoids row lock contention and increases write capacity by 12x.',
      },
    },
    workplaceProfile: {
      factors: [
        {
          name: 'Screen Reader Support',
          supported: false,
          impactDescription: 'Internal code review dashboard misses accessible aria labels on diff viewers.',
        },
        {
          name: 'Accessible Documents',
          supported: true,
          impactDescription: 'Engineering wikis adhere to semantic markdown formatting.',
        },
        {
          name: 'Flexible Hours',
          supported: true,
          impactDescription: 'Flexible work schedule supported across time zones.',
        },
        {
          name: 'Remote Work',
          supported: true,
          impactDescription: 'Full remote team infrastructure with asynchronous pull request reviews.',
        },
        {
          name: 'Assistive Technology Allowance',
          supported: true,
          impactDescription: 'Ergonomic hardware and screen reader license subsidies.',
        },
      ],
      primaryBarrier: {
        title: 'CI/CD Code Review Tooling',
        category: 'Development Environment',
        severity: 'Moderate',
        description: 'Internal diff viewer is keyboard-inaccessible for rapid branch reviews.',
      },
      adaptation: {
        problem: 'Internal code review portal lacks keyboard navigation shortcuts and screen-reader compatibility.',
        recommendedAction: 'Enable GitHub Enterprise native accessible diff viewer and install accessibility extensions.',
        initialReadiness: 68,
        improvedReadiness: 94,
        implementationTime: '< 1 week',
        costEstimate: 'Minimal',
        recommendationLabel: 'Hire + Adapt',
        explanation: 'The candidate exhibits top-tier reasoning velocity. Enabling standard accessible tooling bridges 100% of the operational gap.',
      },
    },
  },
  {
    id: 'ui-ux-designer',
    title: 'UI/UX Designer',
    category: 'Product & Design',
    skills: ['Figma', 'UI Design', 'User Research'],
    description: 'Craft intuitive user journeys, interactive wireframes, and accessible design system components.',
    currentFit: 75,
    futureFitComponents: {
      problemSolving: 88,
      learningSpeed: 92,
      adaptability: 94,
      feedbackResponse: 90,
      transferableSkills: 91,
    },
    assessmentTask: {
      title: 'Checkout Drop-off UX Audit',
      scenario: 'Mobile checkout funnel reveals a 38% drop-off at Step 3 (Payment & Shipping Address Confirmation).',
      question: 'Diagnose the UX friction points from user session recordings and propose 3 specific redesign adjustments.',
      dataset: [
        { FunnelStep: 'Cart View', 'Completion Rate': '91%', 'Avg Time On Screen': '18s', 'Error Rate': '1.2%' },
        { FunnelStep: 'Shipping Input', 'Completion Rate': '84%', 'Avg Time On Screen': '35s', 'Error Rate': '3.1%' },
        { FunnelStep: 'Payment Info', 'Completion Rate': '46%', 'Avg Time On Screen': '94s', 'Error Rate': '18.4%' },
      ],
      sampleAnswer:
        'The steep drop-off at payment (46% completion, 18.4% error rate, 94s dwell time) points to validation friction and cognitive overload. Redesign solutions: 1) Introduce one-click express checkout (Apple Pay / Google Pay) at the top of the modal. 2) Implement inline micro-copy validation for address & CVV rather than post-submit banner errors. 3) Consolidate billing and shipping checkbox with pre-filled defaults to reduce input fields from 9 to 4.',
      learningSupport: {
        title: 'Cognitive Load Reduction & Accessible Micro-Interactions',
        description: 'Review these three concepts before trying the next task:',
        keyConcepts: [
          'Progressive Disclosure: Only display optional fields when explicitly triggered to prevent user intimidation.',
          'Visual Hierarchy & Contrast Accents: Ensure CTA buttons have distinct visual weight and unambiguous affordance.',
          'Inline Error Prevention: Provide assistive inline guidance before user commits input.',
        ],
      },
      task2: {
        title: 'Subscription Onboarding Funnel Redesign',
        scenario: 'Tier selection onboarding has a 28% drop-off at annual billing toggle due to unclear value savings.',
        question: 'Apply progressive disclosure and visual contrast adjustments to improve plan selection clarity.',
        dataset: [
          { 'Design Variant': 'Default Static Table', 'Selection Rate': '52%', 'User Confusion Reports': '22%' },
          { 'Design Variant': 'Badge Highlight + Annual Savings Chip (-20%)', 'Selection Rate': '78%', 'User Confusion Reports': '4%' },
        ],
        sampleAnswer:
          'Default to annual billing with a clear visual "Save 20%" accent chip, highlight the recommended tier with subtle elevation, and collapse add-on configurations under an expandable section.',
      },
    },
    workplaceProfile: {
      factors: [
        {
          name: 'Screen Reader Support',
          supported: false,
          impactDescription: 'Design handoff tool lacks audio cues for collaborative Figma commenting.',
        },
        {
          name: 'Accessible Documents',
          supported: false,
          impactDescription: 'Product requirement specs lack structured contrast tokens.',
        },
        {
          name: 'Flexible Hours',
          supported: true,
          impactDescription: 'Self-paced design sprints with async feedback loops.',
        },
        {
          name: 'Remote Work',
          supported: true,
          impactDescription: 'Fully distributed UX chapter.',
        },
        {
          name: 'Assistive Technology Allowance',
          supported: true,
          impactDescription: 'Specialized high-contrast displays and drawing tablets provided.',
        },
      ],
      primaryBarrier: {
        title: 'Design Handoff Interface',
        category: 'Collaboration Platform',
        severity: 'Moderate',
        description: 'Internal design system library does not support screen-reader navigation of color and typography tokens.',
      },
      adaptation: {
        problem: 'Design token specs are exported in flattened bitmaps without text or screen-reader descriptions.',
        recommendedAction: 'Switch to automated semantic token exports with WCAG contrast metadata and text annotations.',
        initialReadiness: 65,
        improvedReadiness: 92,
        implementationTime: '3 - 5 days',
        costEstimate: 'Zero direct cost',
        recommendationLabel: 'Hire + Adapt',
        explanation: 'Strong visual and empathetic problem solving; standardizing accessible token exports immediately eliminates the barrier.',
      },
    },
  },
  {
    id: 'full-stack-developer',
    title: 'Full Stack Developer',
    category: 'Engineering & Architecture',
    skills: ['React', 'Node.js', 'TypeScript', 'SQL', 'REST APIs'],
    description: 'Build end-to-end web applications bridging accessible React client frontends and scalable Node/SQL backends.',
    currentFit: 80,
    futureFitComponents: {
      problemSolving: 93,
      learningSpeed: 92,
      adaptability: 90,
      feedbackResponse: 94,
      transferableSkills: 91,
    },
    assessmentTask: {
      title: 'Full-Stack Performance & State Architecture',
      scenario: 'A customer-facing dashboard experiences frequent stale state re-renders on the frontend and uncached API endpoint spikes under high concurrent user load.',
      question: 'Analyze the system telemetry data below. Propose an end-to-end solution addressing both frontend state synchronization and backend request throttling.',
      dataset: [
        { Layer: 'React Frontend', 'Issue Identified': 'Un-memoized Context triggering cascade re-renders', 'Client CPU Spike': '78%', 'User Lag': '450ms' },
        { Layer: 'Express API', 'Issue Identified': 'Synchronous DB query per keystroke filter', 'P99 Latency': '2,400ms', 'Error Rate': '4.8%' },
        { Layer: 'PostgreSQL DB', 'Issue Identified': 'Missing index on composite tenant_id + status', 'Connection Pool': '94% saturated', 'Lock Waits': '1.2s' },
      ],
      sampleAnswer:
        '1) Frontend: Split large React context into granular slices and introduce useMemo/useCallback alongside a 300ms debounce on search input. 2) Backend & DB: Implement server-side Redis caching for repeated read queries with a 60s TTL and add a composite index on (tenant_id, status) to eliminate table lock saturation.',
      learningSupport: {
        title: 'Full-Stack Optimization & Granular State Patterns',
        description: 'Review these three concepts before trying the next task:',
        keyConcepts: [
          'Granular Context & Debouncing: Isolate fast-typing input state from global application stores.',
          'Two-Tier Caching: Utilize in-memory client caches (TanStack Query / SWR) combined with edge or Redis caching.',
          'Database Pool Protection: Always queue or rate-limit write bursts and establish query index parity.',
        ],
      },
      task2: {
        title: 'Real-Time Notification & WebSocket Contention',
        scenario: 'Live collaborative notifications cause reconnection loops and server connection spikes when users navigate between tabs.',
        question: 'Apply full-stack resilience patterns to ensure stable real-time synchronization without crashing connection pools.',
        dataset: [
          { 'Connection Architecture': 'Unthrottled Raw WebSockets', 'Reconnect Overhead': 'High (450 conn/s)', 'Server Memory': '92%', 'Dropped Events': '6.1%' },
          { 'Connection Architecture': 'SharedWorker / SSE with Exponential Backoff', 'Reconnect Overhead': 'Low (18 conn/s)', 'Server Memory': '28%', 'Dropped Events': '0.0%' },
        ],
        sampleAnswer:
          'Replace unmanaged WebSocket reconnection loops with Server-Sent Events (SSE) featuring exponential backoff jitter and tab-sharing via BroadcastChannel. This drops server memory from 92% to 28% and guarantees zero dropped events.',
      },
    },
    workplaceProfile: {
      factors: [
        {
          name: 'Screen Reader Support',
          supported: true,
          impactDescription: 'VS Code and CLI terminal environments are fully accessible with NVDA/JAWS.',
        },
        {
          name: 'Accessible Documents',
          supported: false,
          impactDescription: 'Architecture diagram exports are un-described SVG/PNG images.',
        },
        {
          name: 'Flexible Hours',
          supported: true,
          impactDescription: 'Core asynchronous work hours with flexible daily schedule.',
        },
        {
          name: 'Remote Work',
          supported: true,
          impactDescription: 'Distributed engineering team with home workstation allowance.',
        },
        {
          name: 'Assistive Technology Allowance',
          supported: true,
          impactDescription: 'Pre-approved budget for programmable ergonomic keyboards and speech-to-code tooling.',
        },
      ],
      primaryBarrier: {
        title: 'Architecture Diagram Accessibility',
        category: 'Technical Documentation',
        severity: 'Minor',
        description: 'System architectural diagrams are shared as image files without text-based mermaid markdown equivalents.',
      },
      adaptation: {
        problem: 'Engineering architecture diagrams lack text or screen-reader descriptions.',
        recommendedAction: 'Standardize on Mermaid.js markdown syntax embedded directly in GitHub pull requests and repositories.',
        initialReadiness: 68,
        improvedReadiness: 94,
        implementationTime: '1 - 2 days',
        costEstimate: 'Zero cost (Native markdown standard)',
        recommendationLabel: 'Hire + Adapt',
        explanation: 'Candidate demonstrates strong full-stack architectural reasoning. Adopting markdown-based Mermaid diagrams completely resolves the documentation barrier.',
      },
    },
  },
];

export function calculateFutureFit(components: FutureFitComponents): number {
  const { problemSolving, learningSpeed, adaptability, feedbackResponse, transferableSkills } = components;
  const avg = (problemSolving + learningSpeed + adaptability + feedbackResponse + transferableSkills) / 5;
  return Math.round(avg);
}
