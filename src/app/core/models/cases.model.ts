export type CaseStatus = 'open' | 'closed' | 'pending';
export type RiskLevel = 'low' | 'medium' | 'high';

export interface Case {
  id: string;
  title: string;
  status: CaseStatus;
  riskLevel: RiskLevel;
  owner: string;
  updateAt: string;
}