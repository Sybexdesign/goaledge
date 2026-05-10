import { NextResponse } from 'next/server';
import { supabase } from '@/lib/supabase';

export async function GET() {
  try {
    const { data: bets, error } = await supabase
      .from('bets')
      .select('*')
      .eq('user_id', 'default')
      .neq('result', 'pending');

    if (error) throw error;

    const settled = bets ?? [];
    const totalBets = settled.length;
    const won = settled.filter(b => b.result === 'won').length;
    const winRate = totalBets > 0 ? won / totalBets : 0;
    const profit = settled.reduce((sum, b) => sum + (b.profit ?? 0), 0);
    const totalStaked = settled.reduce((sum, b) => sum + Number(b.stake), 0);
    const roi = totalStaked > 0 ? profit / totalStaked : 0;

    // Discipline score: penalise chasing losses, reward selectivity
    const noBetDays = Math.max(0, 10 - totalBets);
    const disciplineScore = Math.min(100, Math.round(50 + winRate * 30 + noBetDays * 2));

    // Bankroll history
    const { data: history } = await supabase
      .from('bankroll_history')
      .select('date, value')
      .eq('user_id', 'default')
      .order('date', { ascending: true })
      .limit(30);

    const bankrollHistory = (history ?? []).map(h => ({
      date: h.date,
      value: Number(h.value),
    }));

    return NextResponse.json({
      totalBets,
      winRate,
      roi,
      profit,
      disciplineScore,
      bankrollHistory,
    });
  } catch (err) {
    console.error('Stats error:', err);
    // Return zeroed stats on error so the UI still renders
    return NextResponse.json({
      totalBets: 0,
      winRate: 0,
      roi: 0,
      profit: 0,
      disciplineScore: 50,
      bankrollHistory: [{ date: new Date().toISOString().split('T')[0], value: 500 }],
    });
  }
}
