// ─── Match & Team ───────────────────────────────────────────

export interface Team {
  id: string;
  name: string;
  shortName: string;
  crest: string;
  league: League;
}

export type League = 'premier-league' | 'la-liga' | 'serie-a' | 'bundesliga' | 'ligue-1';

export interface Match {
  id: string;
  homeTeam: Team;
  awayTeam: Team;
  league: League;
  kickoff: string; // ISO datetime
  status: 'scheduled' | 'live' | 'finished';
  score?: { home: number; away: number };
}

// ─── Form & Stats ───────────────────────────────────────────

export type FormResult = 'W' | 'D' | 'L';

export interface TeamStats {
  recentForm: FormResult[];
  homeForm?: FormResult[];
  awayForm?: FormResult[];
  goalsScored: number;
  goalsConceded: number;
  xG: number;
  xGA: number;
  cleanSheets: number;
  avgPossession: number;
}

export interface SquadSignals {
  injuries: string[];
  suspensions: string[];
  keyAbsences: string[];
  fixtureCongesion: boolean;
}

// ─── Prediction ─────────────────────────────────────────────

export interface Prediction {
  homeWin: number;   // 0–1 probability
  draw: number;
  awayWin: number;
  over25: number;
  under25: number;
  btts: number;
  expectedGoals: { home: number; away: number };
}

// ─── Odds & Value ───────────────────────────────────────────

export interface BookmakerOdds {
  homeWin: number;   // decimal odds
  draw: number;
  awayWin: number;
  over25?: number;
  under25?: number;
  btts?: number;
  bttNo?: number;
  source: string;
  updatedAt: string;
}

export interface ValueOpportunity {
  market: string;
  modelProbability: number;
  impliedProbability: number;
  edge: number;       // modelProb - impliedProb
  odds: number;
  confidence: ConfidenceLevel;
  riskLevel: RiskLevel;
}

export type ConfidenceLevel = 'high' | 'medium' | 'low';
export type RiskLevel = 'low' | 'medium' | 'high';

// ─── AI Analysis ────────────────────────────────────────────

export interface AIAnalysis {
  summary: string;
  reasoning: string[];
  riskFactors: string[];
  valueAssessment: string;
  recommendation: 'bet' | 'small-stake' | 'no-bet' | 'avoid';
  recommendationText: string;
  confidence: ConfidenceLevel;
  contradictions?: string[];
  marketBehaviour?: string;
}

// ─── Bankroll ───────────────────────────────────────────────

export interface BankrollConfig {
  total: number;
  currency: string;
  maxStakePercent: number;    // e.g. 0.05 for 5%
  kellyFraction: number;      // e.g. 0.25 for quarter Kelly
}

export interface StakeSuggestion {
  amount: number;
  percentOfBankroll: number;
  kellyStake: number;
  reasoning: string;
}

// ─── Match Analysis (combined) ──────────────────────────────

export interface MatchAnalysis {
  match: Match;
  homeStats: TeamStats;
  awayStats: TeamStats;
  homeSquad: SquadSignals;
  awaySquad: SquadSignals;
  prediction: Prediction;
  odds: BookmakerOdds;
  valueOpportunities: ValueOpportunity[];
  aiAnalysis: AIAnalysis;
  stakeSuggestion?: StakeSuggestion;
}

// ─── User & Tracking ───────────────────────────────────────

export interface UserBet {
  id: string;
  matchId: string;
  market: string;
  stake: number;
  odds: number;
  result?: 'won' | 'lost' | 'void';
  profit?: number;
  placedAt: string;
}

export interface UserDashboardStats {
  totalBets: number;
  winRate: number;
  roi: number;
  profit: number;
  bankrollHistory: { date: string; value: number }[];
  disciplineScore: number; // 0–100
}
