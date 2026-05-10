# GoalEdge — AI Football Intelligence Platform

An AI-assisted football decision platform that identifies value opportunities, risk levels, and staking suggestions. Built with Next.js 14, Tailwind CSS, and Claude AI.

## Philosophy

GoalEdge is **not** a prediction app. It's a **decision-support engine** that helps users:

- Avoid bad bets by surfacing data-backed reasoning
- Identify value where bookmaker odds diverge from model probability
- Maintain bankroll discipline with position-sizing guidance
- Track performance with honest, transparent analytics

## Architecture

```
┌─────────────────────────────────────────────┐
│                  Frontend                    │
│         Next.js 14 + Tailwind CSS           │
├─────────────────────────────────────────────┤
│              API Layer (Next.js)             │
│   /api/matches  /api/analyze  /api/predict  │
├──────────────┬──────────────────────────────┤
│  Statistical │     LLM Analysis Layer       │
│   Engine     │     (Claude Sonnet 4)        │
│  (Poisson /  │  Reasoning + Explanation     │
│   XGBoost)   │  Risk + Value Detection      │
├──────────────┴──────────────────────────────┤
│              Data Layer                      │
│   PostgreSQL + Prisma + Football APIs        │
└─────────────────────────────────────────────┘
```

## Stack

- **Frontend**: Next.js 14 (App Router), Tailwind CSS, Recharts, Framer Motion
- **Backend**: Next.js API Routes, Python prediction microservice
- **AI**: Anthropic Claude API (reasoning + analysis layer)
- **Database**: PostgreSQL via Prisma ORM
- **Data**: Football-data.org API, odds API feeds

## Getting Started

### Prerequisites

- Node.js 18+
- PostgreSQL
- Anthropic API key
- Football-data.org API key (free tier available)

### Installation

```bash
git clone https://github.com/YOUR_USERNAME/goaledge.git
cd goaledge
npm install
```

### Environment Variables

Create `.env.local`:

```env
DATABASE_URL="postgresql://user:pass@localhost:5432/goaledge"
ANTHROPIC_API_KEY="sk-ant-..."
FOOTBALL_DATA_API_KEY="your-key"
NEXT_PUBLIC_APP_URL="http://localhost:3000"
```

### Database Setup

```bash
npx prisma migrate dev --name init
npx prisma db seed
```

### Run Development Server

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000).

## Project Structure

```
src/
├── app/
│   ├── api/
│   │   ├── analyze/     # Claude AI analysis endpoint
│   │   ├── matches/     # Match data endpoints
│   │   └── predictions/ # Statistical predictions
│   ├── match/[id]/      # Individual match analysis
│   ├── layout.tsx       # Root layout
│   └── page.tsx         # Dashboard home
├── components/
│   ├── ui/              # Design system primitives
│   ├── match/           # Match-specific components
│   ├── dashboard/       # Dashboard widgets
│   └── layout/          # Navigation, header
├── lib/
│   ├── claude.ts        # Claude API integration
│   ├── prediction.ts    # Statistical prediction engine
│   ├── value.ts         # Value detection logic
│   └── bankroll.ts      # Kelly criterion staking
├── hooks/               # React hooks
├── types/               # TypeScript types
└── data/                # Mock/seed data
```

## Key Features

### Value Detection Engine
Compares model probability against bookmaker implied probability. Flags opportunities where statistical edge exceeds a configurable threshold (default: 3%).

### AI Reasoning Layer
Claude analyzes structured match data — form, xG, injuries, market signals — and produces human-readable explanations, risk assessments, and no-bet recommendations.

### No-Bet Detection
The system frequently recommends **not** betting. This builds trust and enforces discipline. If no statistical edge exists, the app says so clearly.

### Bankroll Management
Position sizing via fractional Kelly criterion. Users set their bankroll, and the system recommends stake sizes relative to edge and confidence.

## Build Phases

- **Phase 1** ✅ Data collection + probability engine + value detector
- **Phase 2** ✅ Claude AI explanations + reasoning layer
- **Phase 3** ✅ User bankroll tracking + dashboard
- **Phase 4** 🔜 Behavioral analytics + alerts + premium features

## License

MIT
