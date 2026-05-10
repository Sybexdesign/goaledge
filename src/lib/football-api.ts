import type { Match, TeamStats, SquadSignals, League, FormResult } from '@/types';

// Switched from api-sports.io (free plan limited to seasons ≤2024) to
// football-data.org which provides current-season data on the free tier.
const BASE_URL = 'https://api.football-data.org/v4';

// Competition IDs in football-data.org's numbering (kept as LEAGUE_IDS for
// backward-compat with matches/route.ts which does Object.keys(LEAGUE_IDS))
export const LEAGUE_IDS: Record<League, number> = {
  'premier-league': 2021,
  'la-liga': 2014,
  'serie-a': 2019,
  'bundesliga': 2002,
  'ligue-1': 2015,
};

const LEAGUE_CODES: Record<League, string> = {
  'premier-league': 'PL',
  'la-liga': 'PD',
  'serie-a': 'SA',
  'bundesliga': 'BL1',
  'ligue-1': 'FL1',
};

const COMPETITION_TO_LEAGUE: Record<number, League> = {
  2021: 'premier-league',
  2014: 'la-liga',
  2019: 'serie-a',
  2002: 'bundesliga',
  2015: 'ligue-1',
};

// ─── API Client ──────────────────────────────────────────────

async function apiFetch<T>(path: string): Promise<T> {
  const key = process.env.FOOTBALL_DATA_API_KEY;
  if (!key) throw new Error('FOOTBALL_DATA_API_KEY not set');

  const res = await fetch(`${BASE_URL}${path}`, {
    headers: { 'X-Auth-Token': key },
    next: { revalidate: 3600 },
  });

  if (!res.ok) {
    const body = await res.text().catch(() => '');
    throw new Error(`football-data.org ${res.status}: ${path} — ${body}`);
  }

  return res.json() as Promise<T>;
}

// ─── Response Types ──────────────────────────────────────────

interface FDTeam {
  id: number;
  name: string;
  shortName: string;
  tla: string;
  crest: string;
}

interface FDMatch {
  id: number;
  utcDate: string;
  status: string;
  homeTeam: FDTeam;
  awayTeam: FDTeam;
  competition: { id: number; name: string };
  score?: {
    fullTime?: { home: number | null; away: number | null };
  };
}

interface FDStandingRow {
  team: FDTeam;
  playedGames: number;
  won: number;
  draw: number;
  lost: number;
  goalsFor: number;
  goalsAgainst: number;
  form: string | null;
}

// ─── Helpers ─────────────────────────────────────────────────

function parseForm(form: string | null): FormResult[] {
  if (!form) return ['D', 'D', 'D', 'D', 'D'];
  const results = form
    .split('')
    .slice(-5)
    .map(c => (c === 'W' ? 'W' : c === 'L' ? 'L' : 'D') as FormResult);
  while (results.length < 5) results.unshift('D');
  return results;
}

function fdMatchToMatch(m: FDMatch): Match {
  const league = COMPETITION_TO_LEAGUE[m.competition.id] ?? 'premier-league';
  const status: Match['status'] =
    m.status === 'IN_PLAY' || m.status === 'PAUSED' || m.status === 'HALFTIME'
      ? 'live'
      : m.status === 'FINISHED'
      ? 'finished'
      : 'scheduled';

  const ft = m.score?.fullTime;
  return {
    id: String(m.id),
    homeTeam: {
      id: String(m.homeTeam.id),
      name: m.homeTeam.name,
      shortName: m.homeTeam.tla || m.homeTeam.shortName?.substring(0, 3).toUpperCase() || m.homeTeam.name.substring(0, 3).toUpperCase(),
      crest: m.homeTeam.crest || '⚽',
      league,
    },
    awayTeam: {
      id: String(m.awayTeam.id),
      name: m.awayTeam.name,
      shortName: m.awayTeam.tla || m.awayTeam.shortName?.substring(0, 3).toUpperCase() || m.awayTeam.name.substring(0, 3).toUpperCase(),
      crest: m.awayTeam.crest || '⚽',
      league,
    },
    league,
    kickoff: m.utcDate,
    status,
    score: ft && ft.home !== null ? { home: ft.home ?? 0, away: ft.away ?? 0 } : undefined,
  };
}

function fdStandingToStats(row: FDStandingRow, form: FormResult[]): TeamStats {
  const played = row.playedGames || 1;
  return {
    recentForm: form,
    goalsScored: row.goalsFor,
    goalsConceded: row.goalsAgainst,
    xG: +(row.goalsFor / played).toFixed(2),
    xGA: +(row.goalsAgainst / played).toFixed(2),
    cleanSheets: 0,
    avgPossession: 50,
  };
}

function computeFormFromResults(
  teamId: string,
  matches: FDMatch[]
): FormResult[] {
  const results: FormResult[] = [];
  for (const m of matches) {
    const ft = m.score?.fullTime;
    if (!ft || ft.home === null || ft.away === null) continue;
    const home = ft.home;
    const away = ft.away;
    if (String(m.homeTeam.id) === teamId) {
      results.push(home > away ? 'W' : home < away ? 'L' : 'D');
    } else if (String(m.awayTeam.id) === teamId) {
      results.push(away > home ? 'W' : away < home ? 'L' : 'D');
    }
  }
  const last5 = results.slice(-5);
  while (last5.length < 5) last5.unshift('D');
  return last5;
}

// ─── Fixtures ────────────────────────────────────────────────

export async function getUpcomingFixtures(league?: League): Promise<Match[]> {
  const today = new Date();
  const from = today.toISOString().split('T')[0];
  const to = new Date(today.getTime() + 10 * 24 * 60 * 60 * 1000)
    .toISOString()
    .split('T')[0];

  const leagues = league ? [league] : (Object.keys(LEAGUE_IDS) as League[]);

  const results = await Promise.all(
    leagues.map(l =>
      apiFetch<{ matches: FDMatch[] }>(
        `/competitions/${LEAGUE_CODES[l]}/matches?dateFrom=${from}&dateTo=${to}`
      )
        .then(d =>
          d.matches
            .filter(m => ['SCHEDULED', 'TIMED'].includes(m.status))
            .map(fdMatchToMatch)
        )
        .catch(() => [] as Match[])
    )
  );

  return results.flat().sort((a, b) => a.kickoff.localeCompare(b.kickoff));
}

export async function getFixtureById(fixtureId: string): Promise<Match | null> {
  try {
    const m = await apiFetch<FDMatch>(`/matches/${fixtureId}`);
    if (!m?.id) return null;
    if (!COMPETITION_TO_LEAGUE[m.competition.id]) return null;
    return fdMatchToMatch(m);
  } catch {
    return null;
  }
}

// ─── Standings / Team Stats ───────────────────────────────────

export async function getLeagueStandingsMap(league: League): Promise<Map<string, TeamStats>> {
  try {
    const today = new Date().toISOString().split('T')[0];
    const thirtyDaysAgo = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000)
      .toISOString()
      .split('T')[0];

    const [standingsData, recentData] = await Promise.all([
      apiFetch<{ standings: Array<{ type: string; table: FDStandingRow[] }> }>(
        `/competitions/${LEAGUE_CODES[league]}/standings`
      ),
      apiFetch<{ matches: FDMatch[] }>(
        `/competitions/${LEAGUE_CODES[league]}/matches?status=FINISHED&dateFrom=${thirtyDaysAgo}&dateTo=${today}`
      ).catch(() => ({ matches: [] as FDMatch[] })),
    ]);

    const recentMatches = recentData.matches ?? [];

    const total = standingsData.standings.find(s => s.type === 'TOTAL');
    const map = new Map<string, TeamStats>();
    (total?.table ?? []).forEach(row => {
      const form = computeFormFromResults(String(row.team.id), recentMatches);
      map.set(String(row.team.id), fdStandingToStats(row, form));
    });
    return map;
  } catch {
    return new Map();
  }
}

// ─── Defaults ────────────────────────────────────────────────

export function defaultSquad(): SquadSignals {
  return { injuries: [], suspensions: [], keyAbsences: [], fixtureCongesion: false };
}

export function defaultStats(): TeamStats {
  return {
    recentForm: ['D', 'D', 'D', 'D', 'D'],
    goalsScored: 12,
    goalsConceded: 12,
    xG: 1.2,
    xGA: 1.2,
    cleanSheets: 2,
    avgPossession: 50,
  };
}
