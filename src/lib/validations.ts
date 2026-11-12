import { z } from 'zod';

export const registrationSchema = z.object({
  eventId: z.string().min(1),
  name: z.string().min(2, 'Минимум 2 символа').max(100),
  grade: z.string().min(1, 'Укажите класс').max(10),
  phone: z.string().max(20).optional().default(''),
  honeypot: z.string().max(0).optional(),
});

export const appealSchema = z.object({
  type: z.enum(['proposal', 'complaint', 'join']),
  ministry: z.string().optional().default('general'),
  name: z.string().max(100).optional().default(''),
  grade: z.string().max(20).optional().default(''),
  text: z.string().min(3, 'Минимум 3 символа').max(2000),
  anonymous: z.boolean().optional().default(false),
  honeypot: z.string().max(0).optional(),
});

export const voteSchema = z.object({
  optionId: z.string().min(1),
  deviceId: z.string().optional(),
});

export const suggestionSchema = z.object({
  text: z.string().min(3, 'Минимум 3 символа').max(500),
  author: z.string().max(100).optional().default('Аноним'),
});

export const eventSchema = z.object({
  slug: z.string().min(1).max(200),
  titleRu: z.string().max(200).optional().default(''),
  titleKk: z.string().min(1, 'Іс-шара атауын енгізіңіз').max(200),
  descRu: z.string().optional().default(''),
  descKk: z.string().min(1, 'Сипаттамасын енгізіңіз'),
  category: z.string().min(1).default('Учёба'),
  ministry: z.string().optional().default('general'),
  date: z.string().min(1, 'Уақытын көрсетіңіз'),
  location: z.string().max(200).optional().default('Мектеп актовый залы'),
  maxSeats: z.number().int().min(1).default(100),
  image: z.string().optional().default(''),
  programRu: z.string().optional().default(''),
  programKk: z.string().optional().default(''),
  archived: z.boolean().optional().default(false),
});

export const memberSchema = z.object({
  login: z.string().min(2).max(50),
  password: z.string().min(4).max(100).optional().default('parliament2025'),
  ministry: z.string().optional().default('general'),
  ministryNameRu: z.string().min(1).max(150),
  ministryNameKk: z.string().min(1).max(150),
  nameRu: z.string().max(100).optional().default(''),
  nameKk: z.string().max(100).optional().default(''),
  grade: z.string().max(20).optional().default(''),
  roleRu: z.string().min(1).max(120),
  roleKk: z.string().min(1).max(120),
  quoteRu: z.string().optional().default(''),
  quoteKk: z.string().optional().default(''),
  bioRu: z.string().optional().default(''),
  bioKk: z.string().optional().default(''),
  photo: z.string().optional().default(''),
  order: z.number().int().optional().default(0),
});

export const newsSchema = z.object({
  slug: z.string().min(1).max(200),
  titleRu: z.string().max(200).optional().default(''),
  titleKk: z.string().min(1, 'Тақырыпты енгізіңіз').max(200),
  contentRu: z.string().optional().default(''),
  contentKk: z.string().min(1, 'Мақала мәтінін енгізіңіз'),
  excerpt: z.string().optional().default(''),
  image: z.string().optional().default(''),
  ministry: z.string().optional().default('general'),
  published: z.boolean().optional().default(true),
});

export const timelineSchema = z.object({
  titleRu: z.string().max(200).optional().default(''),
  titleKk: z.string().min(1).max(200),
  descRu: z.string().optional().default(''),
  descKk: z.string().optional().default(''),
  ministry: z.string().optional().default('general'),
  month: z.number().int().min(1).max(12),
  year: z.number().int().min(2020).max(2035),
  icon: z.string().optional().default('calendar'),
  order: z.number().int().optional().default(0),
});

export const pollSchema = z.object({
  questionKk: z.string().min(1, 'Сұрақ мәтіні бос болмауы керек').max(500),
  questionRu: z.string().max(500).optional().default(''),
  active: z.boolean().optional().default(true),
  options: z
    .array(
      z.object({
        textKk: z.string().min(1, 'Нұсқа бос болмауы керек').max(200),
        textRu: z.string().max(200).optional().default(''),
      })
    )
    .min(2, 'Кемінде 2 жауап нұсқасы қажет'),
});

export const statSchema = z.object({
  key: z.string().min(1),
  value: z.number().int().min(0),
  labelRu: z.string().optional().default(''),
  labelKk: z.string().optional().default(''),
});
