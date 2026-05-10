export interface GoalEdgeSettings {
  bankrollAmount: number;
  currency: 'GBP' | 'EUR' | 'USD';
  stakingMethod: 'kelly' | 'fixed';
  maxStakePct: number;
  kellyFraction: number;
  fixedStakeAmount: number;
  minConfidence: number;
  minEdgePct: number;
  leagues: string[];
  emailAlerts: boolean;
  highConfOnly: boolean;
}

export const SETTINGS_DEFAULTS: GoalEdgeSettings = {
  bankrollAmount: 500,
  currency: 'GBP',
  stakingMethod: 'kelly',
  maxStakePct: 3,
  kellyFraction: 0.25,
  fixedStakeAmount: 10,
  minConfidence: 62,
  minEdgePct: 3,
  leagues: ['premier-league', 'la-liga', 'serie-a', 'bundesliga', 'ligue-1'],
  emailAlerts: false,
  highConfOnly: false,
};

export const SETTINGS_KEY = 'goaledge_settings';

export function loadSettings(): GoalEdgeSettings {
  if (typeof window === 'undefined') return SETTINGS_DEFAULTS;
  try {
    const raw = localStorage.getItem(SETTINGS_KEY);
    return raw ? { ...SETTINGS_DEFAULTS, ...JSON.parse(raw) } : SETTINGS_DEFAULTS;
  } catch {
    return SETTINGS_DEFAULTS;
  }
}
