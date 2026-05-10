import { NextRequest, NextResponse } from 'next/server';
import { supabase } from '@/lib/supabase';

// GET /api/bets — list all bets for the default user
export async function GET() {
  const { data, error } = await supabase
    .from('bets')
    .select('*')
    .eq('user_id', 'default')
    .order('placed_at', { ascending: false });

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json({ bets: data });
}

// POST /api/bets — record a new bet
export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { matchId, homeTeam, awayTeam, league, market, stake, odds } = body;

    if (!matchId || !market || !stake || !odds) {
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 });
    }

    const { data, error } = await supabase
      .from('bets')
      .insert({
        user_id: 'default',
        match_id: matchId,
        home_team: homeTeam ?? '',
        away_team: awayTeam ?? '',
        league: league ?? '',
        market,
        stake: Number(stake),
        odds: Number(odds),
        result: 'pending',
      })
      .select()
      .single();

    if (error) return NextResponse.json({ error: error.message }, { status: 500 });

    // Update bankroll history entry for today
    await updateBankroll(-Number(stake));

    return NextResponse.json({ bet: data }, { status: 201 });
  } catch (err) {
    return NextResponse.json({ error: 'Failed to record bet' }, { status: 500 });
  }
}

async function updateBankroll(delta: number) {
  const today = new Date().toISOString().split('T')[0];

  // Get the latest bankroll value
  const { data: latest } = await supabase
    .from('bankroll_history')
    .select('value')
    .eq('user_id', 'default')
    .order('date', { ascending: false })
    .limit(1)
    .single();

  const currentValue = latest ? Number(latest.value) : 500;
  const newValue = Math.max(0, currentValue + delta);

  await supabase
    .from('bankroll_history')
    .upsert({ user_id: 'default', date: today, value: newValue }, { onConflict: 'user_id,date' });
}
