import { NextRequest, NextResponse } from 'next/server';
import { supabase } from '@/lib/supabase';

// PATCH /api/bets/[id] — settle a bet (won/lost/void)
export async function PATCH(req: NextRequest, { params }: { params: { id: string } }) {
  try {
    const { result } = await req.json();

    if (!['won', 'lost', 'void'].includes(result)) {
      return NextResponse.json({ error: 'Invalid result' }, { status: 400 });
    }

    // Get the bet first to calculate profit
    const { data: bet, error: fetchErr } = await supabase
      .from('bets')
      .select('stake, odds')
      .eq('id', params.id)
      .single();

    if (fetchErr || !bet) return NextResponse.json({ error: 'Bet not found' }, { status: 404 });

    const stake = Number(bet.stake);
    const odds = Number(bet.odds);
    const profit =
      result === 'won' ? +(stake * odds - stake).toFixed(2) :
      result === 'void' ? 0 :
      -stake;

    const { data, error } = await supabase
      .from('bets')
      .update({ result, profit })
      .eq('id', params.id)
      .select()
      .single();

    if (error) return NextResponse.json({ error: error.message }, { status: 500 });

    // Update bankroll: add profit (or return stake for void)
    const bankrollDelta = result === 'won' ? profit + stake : result === 'void' ? stake : 0;
    if (bankrollDelta !== 0) {
      const today = new Date().toISOString().split('T')[0];
      const { data: latest } = await supabase
        .from('bankroll_history')
        .select('value')
        .eq('user_id', 'default')
        .order('date', { ascending: false })
        .limit(1)
        .single();

      const currentValue = latest ? Number(latest.value) : 500;
      await supabase
        .from('bankroll_history')
        .upsert(
          { user_id: 'default', date: today, value: currentValue + bankrollDelta },
          { onConflict: 'user_id,date' }
        );
    }

    return NextResponse.json({ bet: data });
  } catch {
    return NextResponse.json({ error: 'Failed to settle bet' }, { status: 500 });
  }
}
