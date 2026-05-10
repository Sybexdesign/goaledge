import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  // Create teams
  const teams = [
    { name: 'Arsenal', shortName: 'ARS', league: 'premier-league' },
    { name: 'Aston Villa', shortName: 'AVL', league: 'premier-league' },
    { name: 'Liverpool', shortName: 'LIV', league: 'premier-league' },
    { name: 'Manchester City', shortName: 'MCI', league: 'premier-league' },
    { name: 'Chelsea', shortName: 'CHE', league: 'premier-league' },
    { name: 'Tottenham', shortName: 'TOT', league: 'premier-league' },
    { name: 'Real Madrid', shortName: 'RMA', league: 'la-liga' },
    { name: 'Barcelona', shortName: 'FCB', league: 'la-liga' },
    { name: 'Inter Milan', shortName: 'INT', league: 'serie-a' },
    { name: 'AC Milan', shortName: 'ACM', league: 'serie-a' },
  ];

  for (const team of teams) {
    await prisma.team.upsert({
      where: { id: team.shortName.toLowerCase() },
      update: {},
      create: {
        id: team.shortName.toLowerCase(),
        ...team,
      },
    });
  }

  // Create default user
  await prisma.user.upsert({
    where: { email: 'demo@goaledge.app' },
    update: {},
    create: {
      email: 'demo@goaledge.app',
      name: 'Demo User',
      bankroll: 500,
      currency: 'GBP',
    },
  });

  console.log('Seed complete.');
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
