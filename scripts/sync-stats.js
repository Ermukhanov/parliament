const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function syncStats() {
  const pastEvents = await prisma.event.count({ where: { archived: true } });
  const upcomingEvents = await prisma.event.count({ where: { archived: false } });
  const members = await prisma.member.findMany();
  let totalTeam = members.length;
  for (const m of members) {
    try {
      const ast = JSON.parse(m.assistants || '[]');
      totalTeam += ast.length;
    } catch {}
  }

  const statDefs = [
    {
      key: 'past_events',
      value: pastEvents,
      labelKk: 'Өткен іс-шаралар',
      labelRu: 'Прошедших мероприятий',
    },
    {
      key: 'upcoming_events',
      value: upcomingEvents,
      labelKk: 'Алдағы іс-шаралар',
      labelRu: 'Запланированных мероприятий',
    },
    {
      key: 'members',
      value: 7,
      labelKk: 'Белсенді фракциялар',
      labelRu: 'Активных фракций',
    },
    {
      key: 'students',
      value: totalTeam,
      labelKk: 'Парламент құрамы мен көмекшілер',
      labelRu: 'Членов парламента и помощников',
    },
    // Keep old keys synced as well for backward compatibility
    {
      key: 'events',
      value: pastEvents + upcomingEvents,
      labelKk: 'Барлық іс-шаралар',
      labelRu: 'Всего мероприятий',
    },
    {
      key: 'initiatives',
      value: 18,
      labelKk: 'Іске асырылған бастамалар',
      labelRu: 'Реализованных инициатив',
    },
  ];

  for (const st of statDefs) {
    await prisma.stat.upsert({
      where: { key: st.key },
      update: {
        value: st.value,
        labelKk: st.labelKk,
        labelRu: st.labelRu,
      },
      create: {
        key: st.key,
        value: st.value,
        labelKk: st.labelKk,
        labelRu: st.labelRu,
      },
    });
  }

  console.log('Статистика сәтті синхрондалды:', statDefs);
}

syncStats()
  .catch(console.error)
  .finally(() => prisma.$disconnect());
