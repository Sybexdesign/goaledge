import type { Match, TeamStats, SquadSignals, BookmakerOdds, Prediction, AIAnalysis, ValueOpportunity, MatchAnalysis, UserDashboardStats } from '@/types';

// ─── Teams ──────────────────────────────────────────────────

const teams = {
  arsenal: { id: 'ars', name: 'Arsenal', shortName: 'ARS', crest: '🔴', league: 'premier-league' as const },
  astonVilla: { id: 'avl', name: 'Aston Villa', shortName: 'AVL', crest: '🟣', league: 'premier-league' as const },
  liverpool: { id: 'liv', name: 'Liverpool', shortName: 'LIV', crest: '🔴', league: 'premier-league' as const },
  manCity: { id: 'mci', name: 'Manchester City', shortName: 'MCI', crest: '🔵', league: 'premier-league' as const },
  chelsea: { id: 'che', name: 'Chelsea', shortName: 'CHE', crest: '🔵', league: 'premier-league' as const },
  tottenham: { id: 'tot', name: 'Tottenham', shortName: 'TOT', crest: '⚪', league: 'premier-league' as const },
  realMadrid: { id: 'rma', name: 'Real Madrid', shortName: 'RMA', crest: '⚪', league: 'la-liga' as const },
  barcelona: { id: 'fcb', name: 'Barcelona', shortName: 'FCB', crest: '🔵🔴', league: 'la-liga' as const },
  interMilan: { id: 'int', name: 'Inter Milan', shortName: 'INT', crest: '🔵⚫', league: 'serie-a' as const },
  acMilan: { id: 'acm', name: 'AC Milan', shortName: 'ACM', crest: '🔴⚫', league: 'serie-a' as const },
};

// ─── Mock Matches ───────────────────────────────────────────

export const mockMatches: Match[] = [
  {
    id: 'match-001',
    homeTeam: teams.arsenal,
    awayTeam: teams.astonVilla,
    league: 'premier-league',
    kickoff: new Date(Date.now() + 3 * 60 * 60 * 1000).toISOString(),
    status: 'scheduled',
  },
  {
    id: 'match-002',
    homeTeam: teams.liverpool,
    awayTeam: teams.manCity,
    league: 'premier-league',
    kickoff: new Date(Date.now() + 6 * 60 * 60 * 1000).toISOString(),
    status: 'scheduled',
  },
  {
    id: 'match-003',
    homeTeam: teams.chelsea,
    awayTeam: teams.tottenham,
    league: 'premier-league',
    kickoff: new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString(),
    status: 'scheduled',
  },
  {
    id: 'match-004',
    homeTeam: teams.realMadrid,
    awayTeam: teams.barcelona,
    league: 'la-liga',
    kickoff: new Date(Date.now() + 28 * 60 * 60 * 1000).toISOString(),
    status: 'scheduled',
  },
  {
    id: 'match-005',
    homeTeam: teams.interMilan,
    awayTeam: teams.acMilan,
    league: 'serie-a',
    kickoff: new Date(Date.now() + 48 * 60 * 60 * 1000).toISOString(),
    status: 'scheduled',
  },
];

// ─── Mock Stats ─────────────────────────────────────────────

export const mockStats: Record<string, TeamStats> = {
  ars: { recentForm: ['W','W','D','W','L'], goalsScored: 18, goalsConceded: 7, xG: 1.85, xGA: 0.92, cleanSheets: 4, avgPossession: 61 },
  avl: { recentForm: ['W','L','D','W','W'], goalsScored: 14, goalsConceded: 10, xG: 1.42, xGA: 1.12, cleanSheets: 2, avgPossession: 52 },
  liv: { recentForm: ['W','W','W','D','W'], goalsScored: 21, goalsConceded: 6, xG: 2.10, xGA: 0.85, cleanSheets: 5, avgPossession: 58 },
  mci: { recentForm: ['W','D','W','W','L'], goalsScored: 17, goalsConceded: 8, xG: 1.92, xGA: 0.95, cleanSheets: 3, avgPossession: 64 },
  che: { recentForm: ['D','W','L','W','D'], goalsScored: 12, goalsConceded: 9, xG: 1.35, xGA: 1.08, cleanSheets: 2, avgPossession: 55 },
  tot: { recentForm: ['L','W','W','D','L'], goalsScored: 13, goalsConceded: 12, xG: 1.48, xGA: 1.30, cleanSheets: 1, avgPossession: 50 },
  rma: { recentForm: ['W','W','W','W','D'], goalsScored: 19, goalsConceded: 5, xG: 1.95, xGA: 0.78, cleanSheets: 5, avgPossession: 60 },
  fcb: { recentForm: ['W','D','W','W','W'], goalsScored: 22, goalsConceded: 8, xG: 2.25, xGA: 1.02, cleanSheets: 3, avgPossession: 66 },
  int: { recentForm: ['W','W','D','W','W'], goalsScored: 16, goalsConceded: 6, xG: 1.72, xGA: 0.88, cleanSheets: 4, avgPossession: 54 },
  acm: { recentForm: ['L','D','W','L','W'], goalsScored: 11, goalsConceded: 11, xG: 1.28, xGA: 1.18, cleanSheets: 2, avgPossession: 49 },
};

// ─── Mock Squad Signals ─────────────────────────────────────

export const mockSquad: Record<string, SquadSignals> = {
  ars: { injuries: ['Timber (ACL)'], suspensions: [], keyAbsences: ['Timber'], fixtureCongesion: false },
  avl: { injuries: [], suspensions: [], keyAbsences: [], fixtureCongesion: false },
  liv: { injuries: ['Jota (hamstring)'], suspensions: [], keyAbsences: ['Jota'], fixtureCongesion: true },
  mci: { injuries: ['Rodri (ACL)'], suspensions: [], keyAbsences: ['Rodri'], fixtureCongesion: false },
  che: { injuries: [], suspensions: ['Caicedo (yellow cards)'], keyAbsences: ['Caicedo'], fixtureCongesion: false },
  tot: { injuries: ['Romero (muscle)'], suspensions: [], keyAbsences: ['Romero'], fixtureCongesion: false },
  rma: { injuries: [], suspensions: [], keyAbsences: [], fixtureCongesion: false },
  fcb: { injuries: ['Pedri (thigh)'], suspensions: [], keyAbsences: ['Pedri'], fixtureCongesion: true },
  int: { injuries: [], suspensions: [], keyAbsences: [], fixtureCongesion: false },
  acm: { injuries: ['Hernandez (knee)'], suspensions: [], keyAbsences: ['Hernandez'], fixtureCongesion: false },
};

// ─── Mock Odds ──────────────────────────────────────────────

export const mockOdds: Record<string, BookmakerOdds> = {
  'match-001': { homeWin: 1.95, draw: 3.50, awayWin: 4.10, over25: 1.72, under25: 2.10, btts: 1.80, bttNo: 1.95, source: 'Composite', updatedAt: new Date().toISOString() },
  'match-002': { homeWin: 2.30, draw: 3.40, awayWin: 3.00, over25: 1.65, under25: 2.20, btts: 1.75, bttNo: 2.00, source: 'Composite', updatedAt: new Date().toISOString() },
  'match-003': { homeWin: 2.45, draw: 3.30, awayWin: 2.90, over25: 1.80, under25: 2.00, btts: 1.72, bttNo: 2.05, source: 'Composite', updatedAt: new Date().toISOString() },
  'match-004': { homeWin: 2.10, draw: 3.40, awayWin: 3.50, over25: 1.55, under25: 2.45, btts: 1.62, bttNo: 2.20, source: 'Composite', updatedAt: new Date().toISOString() },
  'match-005': { homeWin: 1.85, draw: 3.60, awayWin: 4.20, over25: 1.85, under25: 1.95, btts: 1.90, bttNo: 1.85, source: 'Composite', updatedAt: new Date().toISOString() },
};

// ─── Mock Predictions ───────────────────────────────────────

export const mockPredictions: Record<string, Prediction> = {
  'match-001': { homeWin: 0.56, draw: 0.24, awayWin: 0.20, over25: 0.62, under25: 0.38, btts: 0.58, expectedGoals: { home: 1.85, away: 1.02 } },
  'match-002': { homeWin: 0.42, draw: 0.28, awayWin: 0.30, over25: 0.68, under25: 0.32, btts: 0.64, expectedGoals: { home: 1.72, away: 1.45 } },
  'match-003': { homeWin: 0.35, draw: 0.30, awayWin: 0.35, over25: 0.55, under25: 0.45, btts: 0.52, expectedGoals: { home: 1.35, away: 1.28 } },
  'match-004': { homeWin: 0.45, draw: 0.25, awayWin: 0.30, over25: 0.72, under25: 0.28, btts: 0.65, expectedGoals: { home: 2.05, away: 1.38 } },
  'match-005': { homeWin: 0.52, draw: 0.26, awayWin: 0.22, over25: 0.48, under25: 0.52, btts: 0.45, expectedGoals: { home: 1.42, away: 0.88 } },
};

// ─── Mock AI Analyses ───────────────────────────────────────

export const mockAnalyses: Record<string, AIAnalysis> = {
  'match-001': {
    summary: 'Arsenal hold moderate statistical advantage at home with superior xG metrics.',
    reasoning: [
      'Arsenal\'s home xG of 1.85 significantly exceeds Villa\'s away output.',
      'Villa\'s recent form is strong (3W in last 5) but away numbers are weaker.',
      'Timber\'s absence weakens Arsenal defensively but doesn\'t negate attacking edge.',
      'Model probability of 56% vs implied 51.3% suggests slim value on home win.',
    ],
    riskFactors: [
      'Timber\'s absence introduces defensive volatility.',
      'Villa are capable of counter-attacking upsets — 4 away wins this season.',
      'Edge is narrow (4.7%) — borderline value territory.',
    ],
    valueAssessment: 'Slight value detected on Home Win market. Model gives 56% vs bookmaker implied 51.3%. Edge of 4.7% is above threshold but not commanding.',
    recommendation: 'small-stake',
    recommendationText: 'Small stake on Arsenal Home Win. Edge is real but narrow. Avoid accumulators with this selection.',
    confidence: 'medium',
    contradictions: ['Arsenal\'s strong xG contrasts with defensive vulnerability from Timber absence.'],
    marketBehaviour: 'Odds stable since opening. No significant sharp money movement detected.',
  },
  'match-002': {
    summary: 'Blockbuster fixture with both teams in strong form. Goals expected but outcome uncertain.',
    reasoning: [
      'Liverpool\'s home xG of 2.10 is elite — best in the league.',
      'City missing Rodri fundamentally changes their midfield structure.',
      'Fixture congestion affects Liverpool but squad depth mitigates this.',
      'Over 2.5 goals probability at 68% vs implied 60.6% shows value.',
    ],
    riskFactors: [
      'Big match dynamics often produce cagey first halves.',
      'City\'s tactical flexibility under Guardiola remains dangerous.',
      'Result market is too close to call — no value on 1X2.',
    ],
    valueAssessment: 'Value detected on Over 2.5 Goals. Model says 68% vs implied 60.6%. Combined xG of 3.17 supports goals. No value in result market.',
    recommendation: 'bet',
    recommendationText: 'Bet on Over 2.5 Goals. Avoid the result market — too tight. Both teams\' attacking metrics strongly support goals.',
    confidence: 'medium',
    contradictions: ['Liverpool\'s fixture congestion could suppress intensity despite high xG baseline.'],
    marketBehaviour: 'Over 2.5 odds have shortened from 1.75 to 1.65 — sharp money agrees with our model.',
  },
  'match-003': {
    summary: 'Evenly matched London derby with no clear statistical edge for either side.',
    reasoning: [
      'Chelsea\'s home form is inconsistent (2W, 2D, 1L in last 5 home).',
      'Tottenham\'s away xGA of 1.30 is poor — they concede chances.',
      'Caicedo\'s suspension weakens Chelsea\'s midfield control.',
      'Model gives near-identical probabilities for both outcomes.',
    ],
    riskFactors: [
      'Derby matches are inherently unpredictable.',
      'Both teams have inconsistent form.',
      'No statistical edge exceeds the noise threshold.',
    ],
    valueAssessment: 'No value detected in any market. Model probabilities align closely with bookmaker implied probabilities across all outcomes.',
    recommendation: 'no-bet',
    recommendationText: 'No bet recommended. This is a coin-flip derby with no identifiable edge. Discipline means sitting this one out.',
    confidence: 'low',
    contradictions: [],
    marketBehaviour: 'Market is efficiently priced. No significant movement.',
  },
  'match-004': {
    summary: 'El Clásico favours Real Madrid at home but both teams\' attacking quality guarantees goals.',
    reasoning: [
      'Real Madrid\'s defensive record is exceptional (5 clean sheets in 10).',
      'Barcelona\'s xG of 2.25 is the highest in the dataset — they create volume.',
      'Pedri\'s absence limits Barcelona\'s midfield creativity.',
      'BTTS at 65% vs implied 61.7% offers marginal value.',
    ],
    riskFactors: [
      'Clásico dynamics override normal statistical patterns.',
      'Barcelona\'s fixture congestion may affect late-game intensity.',
      'Tactical chess matches between elite coaches can produce low-scoring affairs.',
    ],
    valueAssessment: 'Marginal value on BTTS market. Model says 65% vs implied 61.7%. Over 2.5 also shows value at 72% vs 64.5% implied.',
    recommendation: 'small-stake',
    recommendationText: 'Small stake on Over 2.5 Goals. The Clásico historically delivers goals and both teams\' xG metrics support this.',
    confidence: 'medium',
    contradictions: ['Real Madrid\'s elite defensive record vs Barcelona\'s elite attacking xG creates genuine uncertainty.'],
    marketBehaviour: 'Home win odds have shortened slightly — money coming for Real Madrid.',
  },
  'match-005': {
    summary: 'Inter Milan are clear favourites in the Derby della Madonnina with superior form and metrics.',
    reasoning: [
      'Inter\'s xG advantage (1.72 vs 1.28) is substantial.',
      'AC Milan\'s defensive fragility (11 conceded in 10) is concerning.',
      'Hernandez\'s absence weakens Milan\'s left flank significantly.',
      'Model gives Inter 52% vs implied 54.1% — no value on home win despite them being favourites.',
    ],
    riskFactors: [
      'Derby matches can defy form — Milan have won here against the odds before.',
      'Under 2.5 at 52% vs implied 51.3% is too thin to act on.',
    ],
    valueAssessment: 'No actionable value detected. Inter are the better team but the market has priced them correctly. Bookmaker accuracy is high here.',
    recommendation: 'no-bet',
    recommendationText: 'No bet recommended. Inter should win but the odds reflect this. Wait for better value elsewhere.',
    confidence: 'medium',
    contradictions: [],
    marketBehaviour: 'Stable odds. Market consensus is strong.',
  },
};

// ─── Mock Value Opportunities ───────────────────────────────

export const mockValueOpportunities: Record<string, ValueOpportunity[]> = {
  'match-001': [
    { market: 'Home Win', modelProbability: 0.56, impliedProbability: 0.513, edge: 0.047, odds: 1.95, confidence: 'medium', riskLevel: 'medium' },
    { market: 'Over 2.5 Goals', modelProbability: 0.62, impliedProbability: 0.581, edge: 0.039, odds: 1.72, confidence: 'medium', riskLevel: 'low' },
  ],
  'match-002': [
    { market: 'Over 2.5 Goals', modelProbability: 0.68, impliedProbability: 0.606, edge: 0.074, odds: 1.65, confidence: 'medium', riskLevel: 'low' },
    { market: 'BTTS', modelProbability: 0.64, impliedProbability: 0.571, edge: 0.069, odds: 1.75, confidence: 'medium', riskLevel: 'low' },
  ],
  'match-003': [],
  'match-004': [
    { market: 'Over 2.5 Goals', modelProbability: 0.72, impliedProbability: 0.645, edge: 0.075, odds: 1.55, confidence: 'medium', riskLevel: 'low' },
  ],
  'match-005': [],
};

// ─── Mock Dashboard Stats ───────────────────────────────────

export const mockDashboardStats: UserDashboardStats = {
  totalBets: 47,
  winRate: 0.553,
  roi: 0.082,
  profit: 41.20,
  disciplineScore: 78,
  bankrollHistory: [
    { date: '2025-04-01', value: 500 },
    { date: '2025-04-08', value: 485 },
    { date: '2025-04-15', value: 512 },
    { date: '2025-04-22', value: 498 },
    { date: '2025-04-29', value: 525 },
    { date: '2025-05-06', value: 518 },
    { date: '2025-05-13', value: 541 },
  ],
};

// ─── Assembled Match Analyses ───────────────────────────────

export function getMockMatchAnalysis(matchId: string): MatchAnalysis | null {
  const match = mockMatches.find((m) => m.id === matchId);
  if (!match) return null;

  return {
    match,
    homeStats: mockStats[match.homeTeam.id],
    awayStats: mockStats[match.awayTeam.id],
    homeSquad: mockSquad[match.homeTeam.id],
    awaySquad: mockSquad[match.awayTeam.id],
    prediction: mockPredictions[matchId],
    odds: mockOdds[matchId],
    valueOpportunities: mockValueOpportunities[matchId] || [],
    aiAnalysis: mockAnalyses[matchId],
  };
}

export function getAllMockAnalyses(): MatchAnalysis[] {
  return mockMatches.map((m) => getMockMatchAnalysis(m.id)!).filter(Boolean);
}
