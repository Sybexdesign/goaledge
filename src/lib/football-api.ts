import type { Match, TeamStats, SquadSignals, League, FormResult } from '@/types';

const BASE_URL = 'https://v3.football.api-sports.io';
const SEASON = 2025;

export const LEAGUE_IDS: Record<League, number> = {
  'premier-league': 39,
  'la-liga': 140,
  'serie-a': 135,
  'bundesliga': 78,
  'ligue-1': 61,
};

const LEAGUE_BY_ID: Record<number, League> = {
  39: 'premier-league',
  140: 'la-liga',
  135: 'serie-a',
  78: 'bundesliga',
  61: 'ligue-1',
};

// ─── API Client ──────────────────────────────────────────────

async function apiFetch<T>(path: string): Promise<T> {
  const key = process.env.FOOTBALL_DATA_API_KEY;
  if (!key) throw new Error('FOOTBALL_DATA_API_KEY not set');

  const res = await fetch(`${BASE_URL}${path}`, {
    headers: { 'x-apisports-key': key },
    next: { revalidate: 3600 },
  });

  if (!res.ok) throw new Error(`API-Sports ${res.status}: ${path}`);

  const json = await res.json();
  if (json.errors && Object.keys(json.errors).length > 0) {
    throw new Error(`API-Sports: ${JSON.stringify(json.errors)}`);
  }

  return json.response as T;
}

// ─── Response Types ──────────────────────────────────────────

interface ApiFixture {
  fixture: { id: number; date: string; status: { short: string } };
  league: { id: number };
  teams: {
    home: { id: number; name: string; logo: string };
    away: { id: number; name: string; logo: string };
  };
  goals: { home: number | null; away: number | null };
}

interface ApiStanding {
  team: { id: number; name: string };
  form: string;
  all: {
    played: number;
    goals: { for: number; against: number };
  };
}

// ─── Helpers ─────────────────────────────────────────────────

function parseForm(form: string): FormResult[] {
  const results = (form ?? '')
    .split('')
    .slice(-5)
    .map(c => (c === 'W' ? 'W' : c === 'L' ? 'L' : 'D') as FormResult);
  // Pad to 5 if shorter
  while (results.length < 5) results.push('D');
  return results;
}

function mapStatus(short: string): Match['status'] {
  if (['1H', '2H', 'HT', 'ET', 'P', 'LIVE', 'BT'].includes(short)) return 'live';
  if (['FT', 'AET', 'PEN'].includes(short)) return 'finished';
  return 'scheduled';
}

function abbrev(name: string): string {
  const words = name.replace(/[^a-zA-Z ]/g, '').split(' ').filter(Boolean);
  if (words.length === 1) return words[0].substring(0, 3).toUpperCase();
  const initials = words.map(w => w[0]).join('');
  if (initials.length >= 3) return initials.substring(0, 3).toUpperCase();
  return (words[0].substring(0, 2) + words[1][0]).toUpperCase();
}

// ─── Fixtures ────────────────────────────────────────────────

function fixtureToMatch(f: ApiFixture): Match {
  const league = LEAGUE_BY_ID[f.league.id] ?? 'premier-league';
  return {
    id: String(f.fixture.id),
    homeTeam: {
      id: String(f.teams.home.id),
      name: f.teams.home.name,
      shortName: abbrev(f.teams.home.name),
      crest: f.teams.home.logo,
      league,
    },
    awayTeam: {
      id: String(f.teams.away.id),
      name: f.teams.away.name,
      shortName: abbrev(f.teams.away.name),
      crest: f.teams.away.logo,
      league,
    },
    league,
    kickoff: f.fixture.date,
    status: mapStatus(f.fixture.status.short),
    score:
      f.goals.home !== null
        ? { home: f.goals.home ?? 0, away: f.goals.away ?? 0 }
        : undefined,
  };
}

export async function getUpcomingFixtures(league?: League): Promise<Match[]> {
  const leagues = league ? [league] : (Object.keys(LEAGUE_IDS) as League[]);
  const results = await Promise.all(
    leagues.map(l =>
      apiFetch<ApiFixture[]>(`/fixtures?league=${LEAGUE_IDS[l]}&season=${SEASON}&next=3`)
    )
  );
  return results.flat().map(fixtureToMatch);
}

export async function getFixtureById(fixtureId: string): Promise<Match | null> {
  const fixtures = await apiFetch<ApiFixture[]>(`/fixtures?id=${fixtureId}`);
  if (!fixtures.length) return null;
  return fixtureToMatch(fixtures[0]);
}

// ─── Standings / Team Stats ───────────────────────────────────

function standingToStats(s: ApiStanding): TeamStats {
  const played = s.all.played || 1;
  return {
    recentForm: parseForm(s.form),
    goalsScored: s.all.goals.for,
    goalsConceded: s.all.goals.against,
    xG: +(s.all.goals.for / played).toFixed(2),
    xGA: +(s.all.goals.against / played).toFixed(2),
    cleanSheets: 0,
    avgPossession: 50,
  };
}

export async function getLeagueStandingsMap(league: League): Promise<Map<string, TeamStats>> {
  const raw = await apiFetch<Array<{ league: { standings: ApiStanding[][] } }>>(
    `/standings?league=${LEAGUE_IDS[league]}&season=${SEASON}`
  );
  const standings = raw[0]?.league?.standings?.[0] ?? [];
  const map = new Map<string, TeamStats>();
  standings.forEach(s => map.set(String(s.team.id), standingToStats(s)));
  return map;
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
