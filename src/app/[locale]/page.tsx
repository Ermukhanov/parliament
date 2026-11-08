import prisma from '@/lib/prisma';
import Header from '@/components/Header';
import HeroSection from '@/components/HeroSection';
import Marquee from '@/components/Marquee';
import StatsSection from '@/components/StatsSection';
import EventsSection from '@/components/EventsSection';
import TimelineSection from '@/components/TimelineSection';
import TeamSection from '@/components/TeamSection';
import VotingSection from '@/components/VotingSection';
import AppealsSection from '@/components/AppealsSection';
import NewsSection from '@/components/NewsSection';
import Footer from '@/components/Footer';
import BackgroundEffects from '@/components/BackgroundEffects';

export const revalidate = 0;

export default async function HomePage({
  params: { locale },
}: {
  params: { locale: string };
}) {
  const now = new Date();

  const nextEvent = await prisma.event.findFirst({
    where: {
      date: { gte: now },
      archived: false,
    },
    orderBy: { date: 'asc' },
  });

  const stats = await prisma.stat.findMany();

  const rawEvents = await prisma.event.findMany({
    orderBy: { date: 'asc' },
    include: {
      _count: {
        select: { registrations: true },
      },
    },
  });

  const events = rawEvents.map((ev) => ({
    id: ev.id,
    slug: ev.slug,
    titleRu: ev.titleRu,
    titleKk: ev.titleKk,
    descRu: ev.descRu,
    descKk: ev.descKk,
    category: ev.category,
    ministry: ev.ministry,
    date: ev.date.toISOString(),
    location: ev.location,
    image: ev.image,
    maxSeats: ev.maxSeats,
    archived: ev.archived,
    registrationsCount: ev._count.registrations,
  }));

  const timeline = await prisma.timelineItem.findMany({
    orderBy: { order: 'asc' },
  });

  const members = await prisma.member.findMany({
    orderBy: { order: 'asc' },
  });

  const poll = await prisma.poll.findFirst({
    where: { active: true },
    include: {
      options: {
        include: {
          _count: {
            select: { votes: true },
          },
        },
      },
    },
  });

  const formattedPoll = poll
    ? {
        id: poll.id,
        questionRu: poll.questionRu,
        questionKk: poll.questionKk,
        options: poll.options.map((opt) => ({
          id: opt.id,
          textRu: opt.textRu,
          textKk: opt.textKk,
          votesCount: opt._count.votes,
        })),
      }
    : null;

  const rawNews = await prisma.news.findMany({
    where: { published: true },
    orderBy: { createdAt: 'desc' },
  });

  const news = rawNews.map((n) => ({
    id: n.id,
    slug: n.slug,
    titleRu: n.titleRu,
    titleKk: n.titleKk,
    excerpt: n.excerpt,
    ministry: n.ministry,
    createdAt: n.createdAt.toISOString(),
  }));

  return (
    <main className="relative min-h-screen bg-[#ffffff] text-[#00afca] overflow-x-hidden">
      <BackgroundEffects />
      <Header locale={locale} />

      <HeroSection
        locale={locale}
        nextEvent={
          nextEvent
            ? {
                id: nextEvent.id,
                slug: nextEvent.slug,
                titleRu: nextEvent.titleRu,
                titleKk: nextEvent.titleKk,
                date: nextEvent.date.toISOString(),
                location: nextEvent.location,
              }
            : null
        }
      />

      <Marquee locale={locale} />

      <StatsSection locale={locale} stats={stats} />

      <TeamSection locale={locale} members={members} />

      <EventsSection locale={locale} events={events} />

      <TimelineSection locale={locale} items={timeline} />

      <VotingSection locale={locale} poll={formattedPoll} />

      <AppealsSection locale={locale} />

      <NewsSection locale={locale} news={news} />

      <Footer locale={locale} />
    </main>
  );
}
