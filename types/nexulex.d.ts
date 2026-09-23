export type PartyCode =
  | 'buyer'
  | 'seller'
  | 'customer'
  | 'client'
  | 'provider'
  | 'freelancer'
  | 'auto'
  | string;

export interface ContractDraftResult {
  title: string;
  draft: string;
  summary: string;
  keyProtections: string[];
  empty?: boolean;
}

export type DiffWinner = 'USER' | 'OTHER' | 'NEUTRAL' | 'MIXED';

export interface DiffChange {
  topic: string;
  original: string;
  revised: string;
  winner: 'USER' | 'OTHER' | 'NEUTRAL';
  worsened: boolean;
  note: string;
}

export interface DiffResult {
  summary: string;
  whoGained: 'USER' | 'OTHER' | 'MIXED';
  revisedText: string;
  changes: DiffChange[];
  signStatus?: {
    met: number;
    total: number;
    lights: Array<{
      id: string;
      met: boolean;
      confidence: string;
      evidence?: string;
      unmetReason?: string;
    }>;
    updatedAt?: string;
  } | null;
}

export interface ClauseCard {
  clauseTitle: string;
  originalText: string;
  riskLevel: string;
  issue: string;
  legalReference: string;
  counterOffer: string;
  legalStatus: string;
  cancellationRight: string;
}
