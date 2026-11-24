import type { Case, CaseStatus, RiskLevel } from '../models/cases.model';
const TITLES = [
  'Doute Trace Review',
  'Customer Feedback Analysis',
  'System Performance Evaluation',
  'Security Audit Report',
  'Compliance Check',
  'Data Migration Assessment',
  'User Experience Study',
  'Market Research Summary',
]

const OWNERS = [
  'Alice Johnson',
  'Bob Smith',
  'Charlie Brown',
  'Diana Prince'
];

const STATUSES: CaseStatus[] = ['open', 'closed', 'pending'];
const RISK_LEVELS: RiskLevel[] = ['low', 'medium', 'high'];

function mulberry32(seed: number): () => number {
  return () => {
    seed |= 0;
    seed = (seed + 0x6d2b79f5) | 0;
    let t = Math.imul(seed ^ (seed >>> 15), 1 | seed);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  }
}

export function generateMockCase(count = 20000): Case[] {
  const rand = mulberry32(20261120);
  const now = new Date();
  const cases: Case[] = [];

  for (let i = 0; i < count; i++) {
    const title = TITLES[Math.floor(rand() * TITLES.length)];
    const owner = OWNERS[Math.floor(rand() * OWNERS.length)];
    const status = STATUSES[Math.floor(rand() * STATUSES.length)];
    const riskLevel = RISK_LEVELS[Math.floor(rand() * RISK_LEVELS.length)];
    const dayAgo = Math.floor(rand() * 90);

    cases.push({
      id: `CASE-${String(i + 1).padStart(6, '0')}`,
      title,
      owner,
      status,
      riskLevel,
      updateAt: new Date(now.getTime() - dayAgo * 24 * 60 * 60 * 1000).toISOString()
    });
  }

  return cases;
}

export const MOCK_CASE_COUNT = 20000;