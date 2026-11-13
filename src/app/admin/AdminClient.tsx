'use client';

import { useState, useEffect, useCallback, useRef } from 'react';
import Link from 'next/link';
import SchoolLogo from '@/components/SchoolLogo';
import MemberPortrait from '@/components/MemberPortrait';
import {
  IconDashboard,
  IconUsers,
  IconCalendar,
  IconMap,
  IconVote,
  IconLightbulb,
  IconMail,
  IconNewspaper,
  IconTrendingUp,
  IconShield,
  IconKey,
  IconEdit,
  IconTrash,
  IconPlus,
  IconClose,
  IconMenu,
  IconCheck,
  IconCheckCircle,
  IconDownload,
  IconCamera,
  IconLogout,
  IconZap,
  IconClock,
  IconHome,
} from '@/components/Icons';

type Tab =
  | 'overview'
  | 'ministers'
  | 'events'
  | 'timeline'
  | 'news'
  | 'polls'
  | 'appeals'
  | 'suggestions'
  | 'stats';

interface AssistantEntry {
  name: string;
  grade: string;
  role?: string;
}

interface MinisterItem {
  id: string;
  login: string;
  password?: string;
  ministry: string;
  ministryNameRu: string;
  ministryNameKk: string;
  nameRu: string;
  nameKk: string;
  grade: string;
  roleRu: string;
  roleKk: string;
  quoteRu: string;
  quoteKk: string;
  bioRu: string;
  bioKk: string;
  photo: string;
  assistants?: string;
  order: number;
}

interface AdminRegistration {
  id?: string;
  name: string;
  grade: string;
  phone?: string;
  createdAt: string;
}

interface AdminEvent {
  id: string;
  slug: string;
  titleRu: string;
  titleKk: string;
  descRu: string;
  descKk: string;
  category: string;
  ministry?: string;
  date: string;
  location: string;
  maxSeats: number;
  archived?: boolean;
  registrations?: AdminRegistration[];
  _count?: { registrations: number };
}

interface AdminTimelineItem {
  id: string;
  titleRu: string;
  titleKk: string;
  descRu: string;
  descKk: string;
  ministry?: string;
  month: number;
  year: number;
  order: number;
}

interface AdminNews {
  id: string;
  slug: string;
  titleRu: string;
  titleKk: string;
  excerpt: string;
  image?: string;
  ministry?: string;
  createdAt?: string;
}

interface AdminPollOption {
  id: string;
  textRu: string;
  textKk: string;
  _count?: { votes: number };
  votesCount?: number;
}

interface AdminPoll {
  id: string;
  questionRu: string;
  questionKk: string;
  active?: boolean;
  options?: AdminPollOption[];
}

interface AdminAppeal {
  id: string;
  type: string;
  ministry: string;
  name: string;
  grade: string;
  text: string;
  anonymous: boolean;
  status: string;
  createdAt: string;
}

interface AdminSuggestion {
  id: string;
  author: string;
  text: string;
  status: string;
  createdAt?: string;
}

interface AdminStat {
  id: string;
  key: string;
  value: number;
  labelRu: string;
  labelKk: string;
}

export default function AdminClient() {
  const [authenticated, setAuthenticated] = useState(false);

  // Login form state
  const [loginInput, setLoginInput] = useState('');
  const [passwordInput, setPasswordInput] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [loginError, setLoginError] = useState('');
  const [loginLoading, setLoginLoading] = useState(false);

  // User state
  const [currentLogin, setCurrentLogin] = useState('');
  const [currentRoleLabel, setCurrentRoleLabel] = useState('');
  const [currentMinistry, setCurrentMinistry] = useState('');
  const [hasFullAccess, setHasFullAccess] = useState(false);
  const [activeTab, setActiveTab] = useState<Tab>('overview');
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [toast, setToast] = useState<{ type: 'success' | 'error'; message: string } | null>(null);
  const initialTabSet = useRef(false);

  const showToast = useCallback((message: string, type: 'success' | 'error' = 'success') => {
    setToast({ type, message });
    setTimeout(() => {
      setToast((prev) => (prev?.message === message ? null : prev));
    }, 3500);
  }, []);

  // Data states
  const [members, setMembers] = useState<MinisterItem[]>([]);
  const [events, setEvents] = useState<AdminEvent[]>([]);
  const [timeline, setTimeline] = useState<AdminTimelineItem[]>([]);
  const [news, setNews] = useState<AdminNews[]>([]);
  const [polls, setPolls] = useState<AdminPoll[]>([]);
  const [appeals, setAppeals] = useState<AdminAppeal[]>([]);
  const [suggestions, setSuggestions] = useState<AdminSuggestion[]>([]);
  const [stats, setStats] = useState<AdminStat[]>([]);

  // Modals & forms
  const [editingMinister, setEditingMinister] = useState<MinisterItem | null>(null);
  const [editingAssistants, setEditingAssistants] = useState<AssistantEntry[]>([]);
  const [saveMessage, setSaveMessage] = useState('');

  const [showAddEvent, setShowAddEvent] = useState(false);
  const [editingEvent, setEditingEvent] = useState<AdminEvent | null>(null);
  const [eventForm, setEventForm] = useState({
    slug: '',
    titleRu: '',
    titleKk: '',
    descRu: '',
    descKk: '',
    category: 'Учёба',
    ministry: 'education',
    date: '',
    location: '',
    maxSeats: 100,
    programRu: '',
    programKk: '',
  });

  const [showAddTimeline, setShowAddTimeline] = useState(false);
  const [timelineForm, setTimelineForm] = useState({
    titleRu: '',
    titleKk: '',
    descRu: '',
    descKk: '',
    ministry: 'general',
    month: 9,
    year: 2025,
    order: 1,
  });

  const [showAddNews, setShowAddNews] = useState(false);
  const [newsForm, setNewsForm] = useState({
    slug: '',
    titleRu: '',
    titleKk: '',
    contentRu: '',
    contentKk: '',
    excerpt: '',
    image: '',
    ministry: 'press',
    published: true,
  });

  const [showAddPoll, setShowAddPoll] = useState(false);
  const [pollLoading, setPollLoading] = useState(false);
  const [pollError, setPollError] = useState<string | null>(null);
  const [pollForm, setPollForm] = useState({
    questionKk: '',
    questionRu: '',
    active: true,
    options: [
      { textKk: '', textRu: '' },
      { textKk: '', textRu: '' },
    ],
  });

  const [selectedEventRegs, setSelectedEventRegs] = useState<AdminRegistration[] | null>(null);
  const [selectedEventTitle, setSelectedEventTitle] = useState('');
  const [appealFilter, setAppealFilter] = useState<'all' | 'new' | 'in_progress' | 'resolved'>('all');

  const fetchAllData = useCallback(async () => {
    try {
      const [evRes, memRes, tlRes, nwRes, plRes, apRes, sgRes, stRes] = await Promise.all([
        fetch('/api/admin/events', { cache: 'no-store' }),
        fetch('/api/admin/members', { cache: 'no-store' }),
        fetch('/api/admin/timeline', { cache: 'no-store' }),
        fetch('/api/admin/news', { cache: 'no-store' }),
        fetch('/api/admin/polls', { cache: 'no-store' }),
        fetch('/api/admin/appeals', { cache: 'no-store' }),
        fetch('/api/admin/suggestions', { cache: 'no-store' }),
        fetch('/api/admin/stats', { cache: 'no-store' }),
      ]);

      if (memRes.status === 401) {
        setAuthenticated(false);
        return;
      }

      setAuthenticated(true);
      if (evRes.ok) setEvents((await evRes.json()).events || []);
      if (memRes.ok) {
        const memData = await memRes.json();
        const memList: MinisterItem[] = memData.members || [];
        setMembers(memList);
        if (memData.currentUser) {
          const fullAccess = Boolean(memData.currentUser.hasFullAccess);
          setCurrentLogin(memData.currentUser.login);
          setHasFullAccess(fullAccess);
          setCurrentMinistry(memData.currentUser.ownMinistry || memData.currentUser.ministry);
          setCurrentRoleLabel(memData.currentUser.role || 'Мектеп Президенті');
          if (!initialTabSet.current) {
            initialTabSet.current = true;
            setActiveTab(fullAccess ? 'overview' : 'ministers');
          }
        }
      }
      if (tlRes.ok) setTimeline((await tlRes.json()).items || []);
      if (nwRes.ok) setNews((await nwRes.json()).news || []);
      if (plRes.ok) setPolls((await plRes.json()).polls || []);
      if (apRes.ok) setAppeals((await apRes.json()).appeals || []);
      if (sgRes.ok) setSuggestions((await sgRes.json()).suggestions || []);
      if (stRes.ok) setStats((await stRes.json()).stats || []);
    } catch {
      // ignore
    } finally {
    }
  }, []);

  useEffect(() => {
    fetchAllData();
  }, [fetchAllData]);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoginError('');
    setLoginLoading(true);

    try {
      const res = await fetch('/api/admin/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ login: loginInput, password: passwordInput }),
      });

      const data = await res.json();
      if (res.ok) {
        setAuthenticated(true);
        if (data.role) setCurrentRoleLabel(data.role);
        if (data.login) setCurrentLogin(data.login);
        setCurrentMinistry(data.ownMinistry || data.ministry || '');
        const full = Boolean(data.hasFullAccess);
        setHasFullAccess(full);
        setActiveTab(full ? 'overview' : 'ministers');
        setPasswordInput('');
        fetchAllData();
      } else {
        setLoginError(data.error || 'Логин немесе құпиясөз қате');
      }
    } catch {
      setLoginError('Сервермен байланыс қатесі');
    } finally {
      setLoginLoading(false);
    }
  };

  const handleLogout = async () => {
    await fetch('/api/admin/logout', { method: 'POST' });
    setAuthenticated(false);
    setCurrentLogin('');
    setCurrentRoleLabel('');
    setMembers([]);
    setEvents([]);
    setAppeals([]);
    setActiveTab('overview');
  };

  const openEditMinister = (m: MinisterItem) => {
    setEditingMinister(m);
    try {
      const parsed = m.assistants ? JSON.parse(m.assistants) : [];
      setEditingAssistants(Array.isArray(parsed) ? parsed : []);
    } catch {
      setEditingAssistants([]);
    }
  };

  const handleSaveMinister = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingMinister) return;
    setSaveMessage('');

    const cleanedAssistants = editingAssistants.filter((a) => a.name.trim() !== '');

    const res = await fetch('/api/admin/members', {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        ...editingMinister,
        assistants: JSON.stringify(cleanedAssistants),
      }),
    });

    if (res.ok) {
      setSaveMessage('Мәліметтер сәтті сақталды!');
      showToast('Министр / фракция мәліметтері сақталды');
      setTimeout(() => {
        setEditingMinister(null);
        setSaveMessage('');
      }, 1000);
      fetchAllData();
    } else {
      const err = await res.json().catch(() => ({}));
      showToast(err.error || 'Сақтау кезінде қате орын алды', 'error');
    }
  };

  const handleDeleteMinister = async (id: string) => {
    if (!confirm('Фракция мүшесін өшіруді растайсыз ба?')) return;
    const res = await fetch(`/api/admin/members?id=${id}`, { method: 'DELETE' });
    if (res.ok) {
      showToast('Фракция мүшесі өшірілді');
    } else {
      const err = await res.json().catch(() => ({}));
      showToast(err.error || 'Өшіру мүмкін болмады', 'error');
    }
    fetchAllData();
  };

  const handleCreateEvent = async (e: React.FormEvent) => {
    e.preventDefault();
    const rawSlug = (eventForm.slug || eventForm.titleKk)
      .toLowerCase()
      .replace(/[^a-z0-9а-яёәіңғүұқөһ]/gi, '-')
      .replace(/-+/g, '-')
      .replace(/^-|-$/g, '')
      .slice(0, 50);
    const finalSlug = eventForm.slug.trim() || `${rawSlug || 'event'}-${Date.now().toString().slice(-4)}`;

    const res = await fetch('/api/admin/events', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        ...eventForm,
        slug: finalSlug,
        ministry: hasFullAccess ? eventForm.ministry : (currentMinistry || currentLogin),
        maxSeats: Number(eventForm.maxSeats),
      }),
    });
    if (res.ok) {
      setShowAddEvent(false);
      setEventForm({
        slug: '',
        titleRu: '',
        titleKk: '',
        descRu: '',
        descKk: '',
        category: 'Учёба',
        ministry: 'education',
        date: '',
        location: '',
        maxSeats: 100,
        programRu: '',
        programKk: '',
      });
      showToast('Жаңа іс-шара сәтті қосылды!');
      fetchAllData();
    } else {
      const err = await res.json().catch(() => ({}));
      showToast(err.error || 'Іс-шараны қосу кезінде қате шықты', 'error');
    }
  };

  const handleUpdateEvent = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingEvent) return;
    const res = await fetch('/api/admin/events', {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        ...editingEvent,
        maxSeats: Number(editingEvent.maxSeats),
      }),
    });
    if (res.ok) {
      setEditingEvent(null);
      showToast('Іс-шара сәтті жаңартылды!');
      fetchAllData();
    } else {
      const err = await res.json().catch(() => ({}));
      showToast(err.error || 'Іс-шараны жаңарту мүмкін болмады', 'error');
    }
  };

  const handleDeleteEvent = async (id: string) => {
    if (!confirm('Іс-шараны өшіруді растайсыз ба?')) return;
    const res = await fetch(`/api/admin/events?id=${id}`, { method: 'DELETE' });
    if (res.ok) {
      showToast('Іс-шара өшірілді');
    } else {
      const err = await res.json().catch(() => ({}));
      showToast(err.error || 'Іс-шараны өшіру мүмкін болмады', 'error');
    }
    fetchAllData();
  };

  const handleCreateTimeline = async (e: React.FormEvent) => {
    e.preventDefault();
    const res = await fetch('/api/admin/timeline', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        ...timelineForm,
        titleRu: timelineForm.titleRu || timelineForm.titleKk,
        descRu: timelineForm.descRu || timelineForm.descKk,
        month: Number(timelineForm.month),
        year: Number(timelineForm.year),
        order: Number(timelineForm.order),
      }),
    });
    if (res.ok) {
      setShowAddTimeline(false);
      setTimelineForm({
        titleRu: '',
        titleKk: '',
        descRu: '',
        descKk: '',
        ministry: 'general',
        month: 9,
        year: 2025,
        order: 1,
      });
      showToast('Жоспар тармағы қосылды!');
      fetchAllData();
    } else {
      const err = await res.json().catch(() => ({}));
      showToast(err.error || 'Жоспар тармағын қосу мүмкін болмады', 'error');
    }
  };

  const handleDeleteTimeline = async (id: string) => {
    if (!confirm('Жоспар тармағын өшіруді растайсыз ба?')) return;
    const res = await fetch(`/api/admin/timeline?id=${id}`, { method: 'DELETE' });
    if (res.ok) {
      showToast('Жоспар тармағы өшірілді');
    } else {
      const err = await res.json().catch(() => ({}));
      showToast(err.error || 'Өшіру мүмкін болмады', 'error');
    }
    fetchAllData();
  };

  const handleCreateNews = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const rawSlug = (newsForm.slug || newsForm.titleKk)
        .toLowerCase()
        .replace(/[^a-z0-9а-яёәіңғүұқөһ]/gi, '-')
        .replace(/-+/g, '-')
        .replace(/^-|-$/g, '')
        .slice(0, 50);
      const finalSlug = (rawSlug || 'post') + '-' + Date.now().toString().slice(-4);

      const payload = {
        ...newsForm,
        slug: newsForm.slug ? newsForm.slug.trim() : finalSlug,
        titleRu: newsForm.titleRu || newsForm.titleKk,
        contentRu: newsForm.contentRu || newsForm.contentKk,
        excerpt: newsForm.excerpt || newsForm.contentKk.slice(0, 160),
        ministry: hasFullAccess ? (newsForm.ministry || 'general') : (currentMinistry || currentLogin),
      };

      const res = await fetch('/api/admin/news', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });

      if (res.ok) {
        setShowAddNews(false);
        setNewsForm({
          slug: '',
          titleRu: '',
          titleKk: '',
          contentRu: '',
          contentKk: '',
          excerpt: '',
          image: '',
          ministry: 'general',
          published: true,
        });
        showToast('Жаңа пост сәтті жарияланды! Сайтта және тізімде көрінеді.');
        setActiveTab('news');
        fetchAllData();
      } else {
        const err = await res.json().catch(() => ({ error: 'Қате' }));
        showToast(err.error || 'Постты жариялау кезінде қате орын алды', 'error');
      }
    } catch {
      showToast('Сервермен байланыс қатесі', 'error');
    }
  };

  const handleDeleteNews = async (id: string) => {
    if (!confirm('Бұл постты / жаңалықты өшіруді растайсыз ба?')) return;
    setNews((prev) => prev.filter((n) => n.id !== id));
    const res = await fetch(`/api/admin/news?id=${id}`, { method: 'DELETE' });
    if (res.ok) {
      showToast('Пост сәтті өшірілді!');
      fetchAllData();
    } else {
      const err = await res.json().catch(() => ({ error: 'Қате' }));
      showToast(err.error || 'Өшіру мүмкін болмады', 'error');
      fetchAllData();
    }
  };

  const handleCreatePoll = async (e: React.FormEvent) => {
    e.preventDefault();
    setPollLoading(true);
    setPollError(null);

    const cleanKk = pollForm.questionKk.trim();
    if (!cleanKk) {
      setPollError('Сауалнама сұрағын толтырыңыз');
      setPollLoading(false);
      return;
    }

    const cleanOptions = pollForm.options
      .map((opt) => ({
        textKk: opt.textKk.trim(),
        textRu: (opt.textRu || opt.textKk).trim(),
      }))
      .filter((opt) => opt.textKk.length > 0);

    if (cleanOptions.length < 2) {
      setPollError('Кемінде 2 жауап нұсқасын толтыру қажет');
      setPollLoading(false);
      return;
    }

    try {
      const res = await fetch('/api/admin/polls', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          questionKk: cleanKk,
          questionRu: (pollForm.questionRu || cleanKk).trim(),
          active: pollForm.active,
          options: cleanOptions,
        }),
      });

      const data = await res.json();
      if (!res.ok) {
        setPollError(data.error || 'Сауалнаманы ашу кезінде қате шықты');
      } else {
        setShowAddPoll(false);
        if (data.poll) {
          setPolls((prev) => [data.poll, ...prev.filter((p) => p.id !== data.poll.id)]);
        }
        setPollForm({
          questionKk: '',
          questionRu: '',
          active: true,
          options: [
            { textKk: '', textRu: '' },
            { textKk: '', textRu: '' },
          ],
        });
        fetchAllData();
      }
    } catch {
      setPollError('Желі қатесі, қайталап көріңіз');
    } finally {
      setPollLoading(false);
    }
  };

  const handleTogglePoll = async (id: string, active: boolean) => {
    setPolls((prev) =>
      prev.map((p) => (p.id === id ? { ...p, active } : active ? { ...p, active: false } : p))
    );
    try {
      const res = await fetch('/api/admin/polls', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id, active }),
      });
      if (res.ok) {
        fetchAllData();
      } else {
        const data = await res.json().catch(() => ({}));
        alert(data.error || 'Сауалнама күйін өзгерту мүмкін болмады');
        fetchAllData();
      }
    } catch {
      alert('Желі қатесі');
      fetchAllData();
    }
  };

  const handleDeletePoll = async (id: string) => {
    if (!confirm('Сауалнаманы өшіруді растайсыз ба? Оған жиналған барлық дауыстар бірге өшеді.')) return;
    setPolls((prev) => prev.filter((p) => p.id !== id));
    try {
      const res = await fetch(`/api/admin/polls?id=${id}`, { method: 'DELETE' });
      if (!res.ok) {
        const data = await res.json().catch(() => ({}));
        alert(data.error || 'Сауалнаманы өшіру мүмкін болмады');
        fetchAllData();
      } else {
        fetchAllData();
      }
    } catch {
      alert('Желі қатесі орын алды');
      fetchAllData();
    }
  };

  const handleAppealStatus = async (id: string, status: string) => {
    setAppeals((prev) => prev.map((a) => (a.id === id ? { ...a, status } : a)));
    await fetch('/api/admin/appeals', {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ id, status }),
    });
    fetchAllData();
  };

  const handleDeleteAppeal = async (id: string) => {
    if (!confirm('Бұл өтінішті / қолхатты өшіруді растайсыз ба?')) return;
    setAppeals((prev) => prev.filter((a) => a.id !== id));
    const res = await fetch(`/api/admin/appeals?id=${id}`, { method: 'DELETE' });
    if (res.ok) {
      showToast('Өтініш / қолхат сәтті өшірілді!');
      fetchAllData();
    } else {
      const err = await res.json().catch(() => ({ error: 'Қате' }));
      showToast(err.error || 'Өшіру мүмкін болмады', 'error');
      fetchAllData();
    }
  };

  const handleDeleteRegistration = async (id: string) => {
    if (!confirm('Бұл оқушының іс-шараға тіркелуін өшіруді растайсыз ба?')) return;
    if (selectedEventRegs) {
      setSelectedEventRegs(selectedEventRegs.filter((r) => r.id !== id));
    }
    setEvents((prev) =>
      prev.map((ev) => ({
        ...ev,
        registrations: ev.registrations?.filter((r) => r.id !== id),
        _count: ev._count
          ? {
              ...ev._count,
              registrations: Math.max(0, (ev._count.registrations || 1) - 1),
            }
          : undefined,
      }))
    );
    const res = await fetch(`/api/admin/events/registrations?id=${id}`, { method: 'DELETE' });
    if (res.ok) {
      showToast('Оқушының іс-шараға тіркелуі сәтті өшірілді!');
      fetchAllData();
    } else {
      const err = await res.json().catch(() => ({ error: 'Қате' }));
      showToast(err.error || 'Тіркелуді өшіру мүмкін болмады', 'error');
      fetchAllData();
    }
  };

  const handleSetFeaturedTimer = async (ev: AdminEvent) => {
    const currentVal = ev.date ? new Date(ev.date).toISOString().slice(0, 16) : '';
    const newDateStr = prompt(
      `«${ev.titleKk || ev.titleRu}» іс-шарасының сайттың басты бетіндегі кері санақ таймер уақытын көрсетіңіз (ЖЖЖЖ-АА-КК Т Сағат:Минут):`,
      currentVal
    );
    if (!newDateStr) return;

    const parsed = new Date(newDateStr);
    if (isNaN(parsed.getTime())) {
      alert('Уақыт форматы қате енгізілді!');
      return;
    }

    const res = await fetch('/api/admin/events', {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        id: ev.id,
        date: parsed.toISOString(),
        archived: false,
      }),
    });

    if (res.ok) {
      alert('Іс-шара таймері сәтті жаңартылды! Басты беттегі кері санақ қосылды.');
      fetchAllData();
    } else {
      alert('Таймерді жаңарту кезінде қате орын алды');
    }
  };

  const handleSuggestionStatus = async (id: string, status: string) => {
    setSuggestions((prev) => prev.map((s) => (s.id === id ? { ...s, status } : s)));
    await fetch('/api/admin/suggestions', {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ id, status }),
    });
    fetchAllData();
  };

  const handleDeleteSuggestion = async (id: string) => {
    if (!confirm('Бұл ұсынысты өшіруді растайсыз ба?')) return;
    setSuggestions((prev) => prev.filter((s) => s.id !== id));
    const res = await fetch(`/api/admin/suggestions?id=${id}`, { method: 'DELETE' });
    if (res.ok) {
      showToast('Ұсыныс сәтті өшірілді!');
      fetchAllData();
    } else {
      const err = await res.json().catch(() => ({ error: 'Қате' }));
      showToast(err.error || 'Ұсынысты өшіру мүмкін болмады', 'error');
      fetchAllData();
    }
  };

  const handleStatUpdate = async (key: string, value: number) => {
    const res = await fetch('/api/admin/stats', {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ key, value: Number(value) }),
    });
    if (res.ok) {
      showToast('Көрсеткіш сәтті сақталды!');
    } else {
      showToast('Көрсеткішті жаңарту мүмкін болмады', 'error');
    }
    fetchAllData();
  };

  const exportCsv = (eventTitle: string, regs: AdminRegistration[]) => {
    const header = 'Аты-жөні,Сынып,Телефон,Тіркелген уақыты\n';
    const rows = regs
      .map(
        (r) =>
          `"${r.name}","${r.grade}","${r.phone || ''}","${new Date(r.createdAt).toLocaleString('kk-KZ')}"`
      )
      .join('\n');
    const blob = new Blob(['\uFEFF' + header + rows], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `registrations-${eventTitle}.csv`;
    a.click();
  };

  // Find my personal member record
  const myMember = members.find((m) => m.login === currentLogin) || members[0];

  // Filter appeals for tab
  const filteredAppeals = appeals.filter((a) => {
    if (appealFilter === 'all') return true;
    return a.status === appealFilter;
  });

  // =========================================================================
  // 1. SLEEK, BEAUTIFUL LOGIN SCREEN (NO EXPOSED LOGINS)
  // =========================================================================
  if (!authenticated) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-[#f0f9ff] via-[#ffffff] to-[#e0f2fe] text-slate-800 flex items-center justify-center p-4 relative overflow-hidden select-none">
        {/* Ambient Bright Glows */}
        <div className="absolute -top-32 -left-32 w-96 h-96 rounded-full bg-[#00afca]/15 blur-[120px] pointer-events-none" />
        <div className="absolute -bottom-32 -right-32 w-96 h-96 rounded-full bg-[#0284c7]/15 blur-[120px] pointer-events-none" />

        <div className="relative z-10 w-full max-w-md">
          {/* Card Box with Crisp White & Blue Accent */}
          <div className="bg-white/95 border border-sky-100 rounded-3xl p-8 sm:p-10 shadow-[0_20px_60px_-15px_rgba(0,175,202,0.18)] backdrop-blur-xl">
            {/* Crest Logo & Title */}
            <div className="text-center mb-8">
              <div className="w-16 h-16 rounded-2xl bg-[#00afca] border border-sky-200 p-2 mx-auto mb-4 flex items-center justify-center shadow-lg shadow-sky-500/25">
                <SchoolLogo className="w-full h-full object-contain" variant="white-on-blue" priority />
              </div>
              <h1 className="text-2xl sm:text-3xl font-black text-slate-900 tracking-tight">
                AQL Council
              </h1>
              <p className="text-xs uppercase font-extrabold text-[#00afca] tracking-widest mt-1.5">
                Басқару Панеліне Кіру
              </p>
              <p className="text-xs text-slate-500 mt-2 font-normal">
                Президент, Вице-президент және 7 фракция министрлері
              </p>
            </div>

            {/* Login Form */}
            <form onSubmit={handleLogin} className="space-y-4">
              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-1.5">
                  Логин
                </label>
                <div className="relative">
                  <input
                    type="text"
                    required
                    value={loginInput}
                    onChange={(e) => setLoginInput(e.target.value)}
                    placeholder="Логинді енгізіңіз (мысалы: it, media, president)..."
                    className="w-full px-4 py-3 rounded-xl bg-slate-50 border border-slate-200 text-slate-900 placeholder-slate-400 text-sm font-medium focus:bg-white focus:outline-none focus:border-[#00afca] focus:ring-2 focus:ring-[#00afca]/20 transition-all"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-1.5">
                  Құпиясөз
                </label>
                <div className="relative">
                  <input
                    type={showPassword ? 'text' : 'password'}
                    required
                    value={passwordInput}
                    onChange={(e) => setPasswordInput(e.target.value)}
                    placeholder="Құпиясөзді енгізіңіз..."
                    className="w-full px-4 py-3 rounded-xl bg-slate-50 border border-slate-200 text-slate-900 placeholder-slate-400 text-sm font-medium focus:bg-white focus:outline-none focus:border-[#00afca] focus:ring-2 focus:ring-[#00afca]/20 transition-all pr-12"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-[#00afca] text-xs font-bold transition-colors"
                  >
                    {showPassword ? 'Жабу' : 'Көру'}
                  </button>
                </div>
              </div>

              {loginError && (
                <div className="p-3 rounded-xl bg-rose-50 border border-rose-200 text-rose-700 text-xs font-semibold text-center animate-in fade-in">
                  {loginError}
                </div>
              )}

              <button
                type="submit"
                disabled={loginLoading}
                className="w-full mt-2 py-3.5 px-4 rounded-xl bg-gradient-to-r from-[#00afca] to-[#0284c7] hover:from-[#0099b0] hover:to-[#0369a1] text-white font-bold text-sm tracking-wide shadow-lg shadow-sky-500/25 transition-all active:scale-[0.98] disabled:opacity-50"
              >
                {loginLoading ? 'Тексерілуде...' : 'Панельге кіру →'}
              </button>
            </form>

            {/* Quick logins guide */}
            <div className="mt-5 p-3.5 rounded-2xl bg-sky-50/80 border border-sky-200 text-slate-700 text-xs">
              <div className="font-bold text-[#00afca] mb-1.5 flex items-center gap-1.5">
                <IconKey className="w-3.5 h-3.5 shrink-0" />
                <span>Жүйеге кіру логиндері (Логины для входа):</span>
              </div>
              <div className="space-y-1 text-[11px] text-slate-600">
                <div>• Президент: <span className="font-mono font-bold text-slate-900 bg-white px-1.5 py-0.5 rounded border border-slate-200">president</span></div>
                <div>• Вице-президент: <span className="font-mono font-bold text-slate-900 bg-white px-1.5 py-0.5 rounded border border-slate-200">vice</span></div>
                <div>• Фракциялар: <span className="font-mono font-bold text-slate-900 bg-white px-1 py-0.5 rounded border border-slate-200">sport</span>, <span className="font-mono font-bold text-slate-900 bg-white px-1 py-0.5 rounded border border-slate-200">it</span>, <span className="font-mono font-bold text-slate-900 bg-white px-1 py-0.5 rounded border border-slate-200">media</span>, <span className="font-mono font-bold text-slate-900 bg-white px-1 py-0.5 rounded border border-slate-200">culture</span>, <span className="font-mono font-bold text-slate-900 bg-white px-1 py-0.5 rounded border border-slate-200">volunteers</span>, <span className="font-mono font-bold text-slate-900 bg-white px-1 py-0.5 rounded border border-slate-200">discipline</span>, <span className="font-mono font-bold text-slate-900 bg-white px-1 py-0.5 rounded border border-slate-200">education</span></div>
              </div>
            </div>

            <div className="mt-6 pt-5 border-t border-slate-100 text-center">
              <Link
                href="/kk"
                className="inline-flex items-center gap-1.5 text-xs font-semibold text-slate-500 hover:text-[#00afca] transition-colors py-2 px-4 rounded-xl hover:bg-slate-50"
              >
                <IconHome className="w-3.5 h-3.5" />
                <span>Негізгі сайтқа оралу</span>
              </Link>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // =========================================================================
  // 2. DASHBOARD VIEW (MATCHES MAIN SITE DESIGN + MOBILE-FIRST NAVIGATION)
  // =========================================================================
  const navItems: { id: Tab; label: string; shortLabel: string; count?: number; icon: React.ReactNode }[] = hasFullAccess
    ? [
        { id: 'overview', label: 'Шолу (KPI)', shortLabel: 'Шолу', icon: <IconDashboard className="w-4 h-4" /> },
        { id: 'ministers', label: 'Министрлер & Фракциялар', shortLabel: 'Команда', count: members.length, icon: <IconUsers className="w-4 h-4" /> },
        { id: 'events', label: 'Барлық іс-шаралар', shortLabel: 'Іс-шара', count: events.length, icon: <IconCalendar className="w-4 h-4" /> },
        { id: 'polls', label: 'Сауалнамалар', shortLabel: 'Дауыс', count: polls.length, icon: <IconVote className="w-4 h-4" /> },
        { id: 'suggestions', label: 'Ұсыныстар', shortLabel: 'Идея', count: suggestions.length, icon: <IconLightbulb className="w-4 h-4" /> },
        { id: 'appeals', label: 'Өтініштер & Қолхаттар', shortLabel: 'Өтініш', count: appeals.length, icon: <IconMail className="w-4 h-4" /> },
        { id: 'news', label: 'Посттар мен Жаңалықтар', shortLabel: 'Посттар', count: news.length, icon: <IconNewspaper className="w-4 h-4" /> },
        { id: 'stats', label: 'Сандық көрсеткіштер', shortLabel: 'Статистика', icon: <IconTrendingUp className="w-4 h-4" /> },
      ]
    : [
        { id: 'ministers', label: 'Менің фракциям & Көмекшілер', shortLabel: 'Фракция', icon: <IconShield className="w-4 h-4" /> },
        { id: 'events', label: 'Фракция іс-шаралары', shortLabel: 'Іс-шара', count: events.length, icon: <IconCalendar className="w-4 h-4" /> },
        { id: 'appeals', label: 'Түскен өтініштер & Қолхаттар', shortLabel: 'Өтініш', count: appeals.length, icon: <IconMail className="w-4 h-4" /> },
        { id: 'news', label: 'Фракция посттары & Жаңалықтар', shortLabel: 'Посттар', count: news.length, icon: <IconNewspaper className="w-4 h-4" /> },
        { id: 'polls', label: 'Сауалнамалар', shortLabel: 'Дауыс', count: polls.length, icon: <IconVote className="w-4 h-4" /> },
      ];

  const bottomNavItems = hasFullAccess
    ? navItems.filter((item) => ['overview', 'events', 'polls', 'news'].includes(item.id))
    : navItems.filter((item) => ['ministers', 'events', 'appeals', 'news'].includes(item.id));

  const selectTab = (tab: Tab) => {
    setActiveTab(tab);
    setMobileMenuOpen(false);
  };

  return (
    <div className="min-h-screen bg-[#ffffff] text-slate-900 flex flex-col font-sans overflow-x-hidden relative">
      {/* Subtle Main-Site Ambient Glow */}
      <div className="pointer-events-none fixed inset-x-0 top-0 h-80 bg-gradient-to-b from-sky-50/80 via-white to-transparent -z-10" />

      {/* Floating Toast Notification */}
      {toast && (
        <div className="fixed top-20 right-4 left-4 sm:left-auto sm:max-w-sm z-50 animate-in fade-in slide-in-from-top-3 duration-200">
          <div
            className={`flex items-center gap-3 px-4 py-3.5 rounded-2xl shadow-2xl border backdrop-blur-md text-xs sm:text-sm font-bold ${
              toast.type === 'success'
                ? 'bg-[#0b0f17]/95 text-white border-[#00afca]/50'
                : 'bg-rose-600 text-white border-rose-400'
            }`}
          >
            {toast.type === 'success' ? (
              <IconCheckCircle className="w-5 h-5 text-[#00afca] shrink-0" />
            ) : (
              <IconClose className="w-5 h-5 text-white shrink-0" />
            )}
            <span className="flex-1">{toast.message}</span>
            <button onClick={() => setToast(null)} className="text-white/70 hover:text-white p-1">
              <IconClose className="w-4 h-4" />
            </button>
          </div>
        </div>
      )}

      {/* Floating Dark Pill Header (Matching Main Site Header.tsx) */}
      <div className="sticky top-2 sm:top-4 z-40 px-2 sm:px-6 lg:px-8">
        <header className="max-w-7xl mx-auto bg-[#0b0f17]/95 text-white rounded-2xl sm:rounded-full px-3 sm:px-6 py-2.5 shadow-2xl border border-white/10 backdrop-blur-md flex items-center justify-between gap-2">
          <div className="flex items-center gap-2.5 sm:gap-3 min-w-0">
            <div className="w-9 h-9 rounded-xl sm:rounded-full bg-[#00afca] border border-white/20 p-1 flex items-center justify-center shadow-sm shrink-0">
              <SchoolLogo className="w-full h-full object-contain" variant="white-on-blue" />
            </div>
            <div className="min-w-0">
              <div className="flex items-center gap-2">
                <span className="font-black text-sm tracking-tight text-white">AQL Council</span>
                <span className="hidden xs:inline-block px-2 py-0.5 rounded-full text-[10px] font-bold uppercase bg-[#00afca]/20 text-[#00afca] border border-[#00afca]/30">
                  {hasFullAccess ? 'Басшылық' : 'Министр'}
                </span>
              </div>
              <div className="text-[10px] sm:text-[11px] text-slate-400 font-medium truncate max-w-[150px] sm:max-w-xs">
                {currentRoleLabel}
              </div>
            </div>
          </div>

          <div className="flex items-center gap-1.5 sm:gap-2 shrink-0">
            <button
              onClick={() => setShowAddNews(true)}
              className="flex items-center gap-1.5 px-3 sm:px-4 py-2 min-h-[40px] rounded-xl sm:rounded-full bg-[#00afca] hover:bg-[#009bb3] text-white font-black text-xs shadow-lg shadow-[#00afca]/30 active:scale-95 transition-all"
              title="Жаңа пост жазу"
            >
              <IconPlus className="w-4 h-4" />
              <span className="hidden sm:inline">ПОСТ ҚОСУ</span>
              <span className="sm:hidden">Пост</span>
            </button>

            <button
              onClick={() => setShowAddEvent(true)}
              className="hidden lg:flex items-center gap-1.5 px-3.5 py-2 min-h-[40px] rounded-full bg-white/10 hover:bg-white/20 text-white font-bold text-xs border border-white/10 transition-all"
              title="Жаңа іс-шара қосу"
            >
              <IconCalendar className="w-3.5 h-3.5 text-[#00afca]" />
              <span>Іс-шара</span>
            </button>

            <Link
              href="/kk"
              className="hidden md:inline-flex items-center gap-1.5 text-xs font-bold text-slate-200 hover:text-white px-3.5 py-2 min-h-[40px] rounded-full bg-white/10 hover:bg-white/20 border border-white/10 transition-colors"
            >
              <IconHome className="w-3.5 h-3.5" />
              <span>Сайтқа</span>
            </Link>

            <button
              onClick={handleLogout}
              className="hidden md:inline-flex items-center gap-1.5 text-xs font-bold text-rose-300 hover:text-white px-3.5 py-2 min-h-[40px] rounded-full bg-rose-500/15 hover:bg-rose-500/30 border border-rose-500/20 transition-colors"
            >
              <IconLogout className="w-3.5 h-3.5" />
              <span>Шығу</span>
            </button>

            {/* Mobile Menu Hamburger */}
            <button
              onClick={() => setMobileMenuOpen(true)}
              className="md:hidden flex items-center justify-center w-11 h-11 rounded-xl bg-white/10 hover:bg-white/20 text-white border border-white/10 transition-colors"
              aria-label="Мәзірді ашу"
            >
              <IconMenu className="w-5 h-5" />
            </button>
          </div>
        </header>
      </div>

      {/* Mobile Slide-Out Navigation Drawer */}
      {mobileMenuOpen && (
        <div
          className="fixed inset-0 z-50 md:hidden bg-black/60 backdrop-blur-sm animate-in fade-in duration-150"
          onClick={() => setMobileMenuOpen(false)}
        >
          <div
            className="absolute right-0 top-0 bottom-0 w-[85vw] max-w-xs bg-[#0b0f17] text-white border-l border-white/10 p-5 flex flex-col justify-between overflow-y-auto shadow-2xl"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="space-y-5">
              <div className="flex items-center justify-between pb-4 border-b border-white/10">
                <div className="flex items-center gap-2.5 min-w-0">
                  <div className="w-9 h-9 rounded-full bg-[#00afca] p-1 flex items-center justify-center shrink-0">
                    <SchoolLogo className="w-full h-full object-contain" variant="white-on-blue" />
                  </div>
                  <div className="min-w-0">
                    <div className="font-black text-sm text-white">AQL Council</div>
                    <div className="text-[11px] text-[#00afca] font-bold truncate">{currentRoleLabel}</div>
                  </div>
                </div>
                <button
                  onClick={() => setMobileMenuOpen(false)}
                  className="w-10 h-10 rounded-xl bg-white/10 hover:bg-white/20 flex items-center justify-center text-white"
                  aria-label="Жабу"
                >
                  <IconClose className="w-5 h-5" />
                </button>
              </div>

              <div className="grid grid-cols-2 gap-2">
                <button
                  onClick={() => {
                    setMobileMenuOpen(false);
                    setShowAddNews(true);
                  }}
                  className="min-h-[44px] px-3 py-2 rounded-xl bg-[#00afca] text-white font-black text-xs flex items-center justify-center gap-1.5"
                >
                  <IconPlus className="w-4 h-4" />
                  <span>Пост қосу</span>
                </button>
                <button
                  onClick={() => {
                    setMobileMenuOpen(false);
                    setShowAddEvent(true);
                  }}
                  className="min-h-[44px] px-3 py-2 rounded-xl bg-white/10 text-white font-bold text-xs flex items-center justify-center gap-1.5 border border-white/10"
                >
                  <IconCalendar className="w-4 h-4 text-[#00afca]" />
                  <span>Іс-шара</span>
                </button>
              </div>

              <nav className="space-y-1.5">
                <div className="text-[10px] uppercase tracking-widest font-bold text-slate-400 px-2 mb-2">
                  Басқару бөлімдері
                </div>
                {navItems.map((item) => {
                  const isActive = activeTab === item.id;
                  return (
                    <button
                      key={item.id}
                      onClick={() => selectTab(item.id)}
                      className={`w-full min-h-[44px] px-3.5 py-2.5 rounded-xl text-xs font-bold flex items-center justify-between gap-2 transition-all ${
                        isActive
                          ? 'bg-[#00afca] text-white shadow-lg shadow-[#00afca]/25'
                          : 'text-slate-300 hover:bg-white/10 hover:text-white'
                      }`}
                    >
                      <span className="flex items-center gap-2.5 min-w-0">
                        {item.icon}
                        <span className="truncate">{item.label}</span>
                      </span>
                      {typeof item.count === 'number' && (
                        <span
                          className={`px-2 py-0.5 rounded-full text-[10px] font-black ${
                            isActive ? 'bg-white/20 text-white' : 'bg-white/10 text-slate-300'
                          }`}
                        >
                          {item.count}
                        </span>
                      )}
                    </button>
                  );
                })}
              </nav>
            </div>

            <div className="pt-4 mt-6 border-t border-white/10 space-y-2">
              <Link
                href="/kk"
                className="w-full min-h-[44px] px-4 py-2.5 rounded-xl bg-white/10 text-white font-bold text-xs flex items-center justify-center gap-2"
              >
                <IconHome className="w-4 h-4" />
                <span>Негізгі сайтқа оралу</span>
              </Link>
              <button
                onClick={() => {
                  setMobileMenuOpen(false);
                  handleLogout();
                }}
                className="w-full min-h-[44px] px-4 py-2.5 rounded-xl bg-rose-500/20 text-rose-300 font-bold text-xs flex items-center justify-center gap-2 border border-rose-500/20"
              >
                <IconLogout className="w-4 h-4" />
                <span>Жүйеден шығу</span>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Main Container */}
      <div className="flex-1 max-w-7xl w-full mx-auto px-3 sm:px-6 lg:px-8 pt-4 sm:pt-6 pb-[calc(env(safe-area-inset-bottom,0px)+6rem)] md:pb-10 space-y-4 sm:space-y-6">
        {/* Quick Action Banner (Matches Main Site Dark + Cyan Aesthetic) */}
        <div className="bg-[#0b0f17] rounded-2xl sm:rounded-3xl p-4 sm:p-6 text-white shadow-xl border border-slate-800 flex flex-col sm:flex-row sm:items-center justify-between gap-4 relative overflow-hidden">
          <div className="absolute -right-12 -top-12 w-48 h-48 rounded-full bg-[#00afca]/20 blur-3xl pointer-events-none" />
          <div className="relative z-10">
            <div className="flex flex-wrap items-center gap-2">
              <span className="px-2.5 py-0.5 rounded-full bg-[#00afca]/20 text-[#00afca] border border-[#00afca]/30 text-[10px] font-black uppercase tracking-wider">
                Блог & Жаңалықтар
              </span>
              <span className="text-xs text-slate-400 font-semibold">Мектеп сайтына жариялау</span>
            </div>
            <h2 className="text-lg sm:text-2xl font-black mt-1.5 tracking-tight">
              Жаңа пост жазу / Добавить пост
            </h2>
            <p className="text-xs text-slate-400 mt-1 max-w-xl">
              Сайттың «Жаңалықтар» бөліміне жаңа пост, мақала және хабарландыру жариялаңыз.
            </p>
          </div>
          <button
            onClick={() => setShowAddNews(true)}
            className="relative z-10 min-h-[44px] px-5 py-3 rounded-2xl bg-[#00afca] hover:bg-[#009bb3] text-white font-black text-xs sm:text-sm shadow-lg shadow-[#00afca]/30 active:scale-95 transition-all flex items-center justify-center gap-2 self-stretch sm:self-auto shrink-0"
          >
            <IconEdit className="w-4 h-4" />
            <span>ЖАҢА ПОСТ ҚОСУ</span>
          </button>
        </div>

        {/* Desktop Navigation Tabs Bar */}
        <div className="hidden md:flex items-center gap-1.5 flex-wrap bg-slate-50/90 p-1.5 rounded-2xl border border-slate-200 shadow-sm">
          {navItems.map((item) => {
            const isActive = activeTab === item.id;
            return (
              <button
                key={item.id}
                onClick={() => setActiveTab(item.id)}
                className={`px-3.5 py-2 rounded-xl text-xs font-bold whitespace-nowrap transition-all flex items-center gap-2 ${
                  isActive
                    ? 'bg-[#0b0f17] text-white shadow-md'
                    : 'text-slate-600 hover:text-slate-900 hover:bg-white'
                }`}
              >
                <span className={isActive ? 'text-[#00afca]' : 'text-slate-400'}>{item.icon}</span>
                <span>{item.label}</span>
                {typeof item.count === 'number' && (
                  <span
                    className={`px-1.5 py-0.5 rounded-full text-[10px] font-black ${
                      isActive ? 'bg-[#00afca] text-white' : 'bg-slate-200/80 text-slate-700'
                    }`}
                  >
                    {item.count}
                  </span>
                )}
              </button>
            );
          })}
        </div>

        {/* ===================================================================
            TAB: OVERVIEW (Master Dashboard KPI)
           =================================================================== */}
        {activeTab === 'overview' && hasFullAccess && (
          <div className="space-y-6">
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
              <div className="p-5 rounded-2xl bg-white border border-slate-200 shadow-sm hover:shadow-md transition-shadow">
                <div className="text-xs font-bold text-slate-500 uppercase tracking-wider">
                  Барлық фракциялар
                </div>
                <div className="text-3xl font-black text-slate-900 mt-1">7</div>
                <div className="text-[11px] text-[#00afca] font-bold mt-1">
                  Барлық министрлер тағайындалған
                </div>
              </div>

              <div className="p-5 rounded-2xl bg-white border border-slate-200 shadow-sm hover:shadow-md transition-shadow">
                <div className="text-xs font-bold text-slate-500 uppercase tracking-wider">
                  Жоспарланған іс-шаралар
                </div>
                <div className="text-3xl font-black text-slate-900 mt-1">{events.length}</div>
                <div className="text-[11px] text-slate-500 font-semibold mt-1">
                  Тіркелген оқушылар саны
                </div>
              </div>

              <div className="p-5 rounded-2xl bg-white border border-slate-200 shadow-sm hover:shadow-md transition-shadow">
                <div className="text-xs font-bold text-slate-500 uppercase tracking-wider">
                  Кері байланыс / Өтініштер
                </div>
                <div className="text-3xl font-black text-slate-900 mt-1">{appeals.length}</div>
                <div className="text-[11px] text-emerald-600 font-bold mt-1">
                  {appeals.filter((a) => a.status === 'new').length} жаңа өтініш
                </div>
              </div>

              <div className="p-5 rounded-2xl bg-white border border-slate-200 shadow-sm hover:shadow-md transition-shadow">
                <div className="text-xs font-bold text-slate-500 uppercase tracking-wider">
                  Оқушылар ұсыныстары
                </div>
                <div className="text-3xl font-black text-slate-900 mt-1">{suggestions.length}</div>
                <div className="text-[11px] text-amber-600 font-bold mt-1">
                  Модерацияны күтуде
                </div>
              </div>
            </div>

            {/* Quick Actions */}
            <div className="p-6 rounded-2xl bg-white border border-slate-200 shadow-sm flex flex-wrap items-center justify-between gap-4">
              <div>
                <h3 className="font-extrabold text-base text-slate-900">Жылдам әрекеттер</h3>
                <p className="text-xs text-slate-500 mt-0.5">
                  Президент және Төралқа құралдары
                </p>
              </div>
              <div className="flex flex-wrap items-center gap-2">
                <button
                  onClick={() => setShowAddEvent(true)}
                  className="px-4 py-2 rounded-xl bg-[#00afca] hover:bg-[#0099b0] text-white text-xs font-bold transition-all shadow-sm shadow-[#00afca]/25"
                >
                  + Жаңа іс-шара
                </button>
                <button
                  onClick={() => setShowAddPoll(true)}
                  className="px-4 py-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-bold border border-slate-200 transition-all"
                >
                  + Жаңа сауалнама
                </button>
                <button
                  onClick={() => setShowAddNews(true)}
                  className="px-4 py-2 rounded-xl bg-gradient-to-r from-[#00afca] to-sky-600 hover:from-[#0099b0] hover:to-sky-700 text-white text-xs font-bold shadow-sm shadow-sky-500/25 transition-all flex items-center gap-1.5"
                >
                  <IconEdit className="w-4 h-4" />
                  <span>+ Жаңа пост жазу</span>
                </button>
              </div>
            </div>
          </div>
        )}

        {/* ===================================================================
            TAB: MINISTERS (Personalized Faction Card OR Full Roster)
           =================================================================== */}
        {activeTab === 'ministers' && (
          <div className="space-y-6">
            {!hasFullAccess ? (
              // Individual Minister's Profile Card & Assistants Editor
              myMember && (
                <div className="p-6 sm:p-8 rounded-3xl bg-white border border-slate-200 shadow-sm space-y-6">
                  <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 pb-6 border-b border-slate-200">
                    <div className="flex items-center gap-4">
                      <div className="w-20 sm:w-24 shrink-0 shadow-md">
                        <MemberPortrait
                          photo={myMember.photo}
                          name={myMember.nameKk}
                          aspect="portrait"
                          className="rounded-2xl border border-slate-200"
                        />
                      </div>
                      <div>
                        <span className="text-[10px] uppercase font-bold tracking-wider px-2 py-0.5 rounded-full bg-sky-50 text-[#00afca] border border-sky-200">
                          {myMember.ministryNameKk}
                        </span>
                        <h2 className="text-xl font-black text-slate-900 mt-1">
                          {myMember.nameKk || 'Министр'}
                        </h2>
                        <p className="text-xs text-slate-500 font-medium">{myMember.roleKk}</p>
                      </div>
                    </div>

                    <button
                      onClick={() => openEditMinister(myMember)}
                      className="px-4 py-2 rounded-xl bg-[#00afca] hover:bg-[#0099b0] text-white text-xs font-bold transition-all shadow-sm shadow-[#00afca]/25"
                    >
                      Профиль мен көмекшілерді өңдеу
                    </button>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="space-y-2">
                      <div className="text-xs uppercase font-bold text-slate-500">
                        Фракция ұраны / Цитата
                      </div>
                      <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-200 text-xs italic text-slate-700">
                        &ldquo;{myMember.quoteKk || 'Ұран енгізілмеген'}&rdquo;
                      </div>
                    </div>

                    <div className="space-y-2">
                      <div className="text-xs uppercase font-bold text-slate-500">
                        Міндеттер мен қызметі
                      </div>
                      <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-200 text-xs text-slate-700 leading-relaxed">
                        {myMember.bioKk || 'Сипаттама жазылмаған'}
                      </div>
                    </div>
                  </div>

                  {/* Assistants List Preview */}
                  <div className="space-y-3 pt-4 border-t border-slate-200">
                    <div className="flex items-center justify-between">
                      <div className="text-xs uppercase font-bold text-slate-500">
                        Фракция көмекшілерінің құрамы
                      </div>
                      <span className="text-[11px] text-slate-500 font-semibold">
                        Өзгерту үшін «Өңдеу» батырмасын басыңыз
                      </span>
                    </div>

                    {myMember.assistants && JSON.parse(myMember.assistants).length > 0 ? (
                      <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5">
                        {JSON.parse(myMember.assistants).map((ast: AssistantEntry, idx: number) => (
                          <div
                            key={idx}
                            className="p-3 rounded-xl bg-slate-50 border border-slate-200 text-xs flex items-center justify-between"
                          >
                            <span className="font-bold text-slate-900">{ast.name}</span>
                            <span className="text-[11px] text-[#00afca] font-bold">
                              {ast.grade}
                            </span>
                          </div>
                        ))}
                      </div>
                    ) : (
                      <div className="p-4 rounded-xl bg-slate-50 border border-slate-200 text-xs text-slate-500 text-center">
                        Көмекшілер тізімі әзірге бос. «Өңдеу» батырмасы арқылы қоса аласыз.
                      </div>
                    )}
                  </div>

                  {/* Minister Quick Actions */}
                  <div className="pt-6 border-t border-slate-200">
                    <h4 className="font-extrabold text-sm text-slate-900 mb-3 flex items-center gap-2">
                      <IconZap className="w-4 h-4 text-[#00afca]" />
                      <span>Фракцияны басқару және жедел әрекеттер:</span>
                    </h4>
                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                      <button
                        onClick={() => setShowAddNews(true)}
                        className="p-4 rounded-2xl bg-gradient-to-br from-sky-500 to-[#00afca] hover:from-sky-600 hover:to-[#0099b0] text-white shadow-md shadow-sky-500/20 text-left transition-all active:scale-[0.98] flex flex-col justify-between group"
                      >
                        <IconEdit className="w-6 h-6 mb-2 group-hover:scale-110 transition-transform" />
                        <div>
                          <div className="font-black text-sm">Жаңа пост жазу</div>
                          <div className="text-[11px] text-white/80 mt-0.5">Сайтқа жаңалық немесе мақала жариялау</div>
                        </div>
                      </button>

                      <button
                        onClick={() => setShowAddEvent(true)}
                        className="p-4 rounded-2xl bg-white border border-slate-200 hover:border-sky-300 hover:bg-sky-50/50 shadow-sm text-left transition-all active:scale-[0.98] flex flex-col justify-between group"
                      >
                        <IconCalendar className="w-6 h-6 mb-2 text-[#00afca] group-hover:scale-110 transition-transform" />
                        <div>
                          <div className="font-black text-sm text-slate-900">Жаңа іс-шара қосу</div>
                          <div className="text-[11px] text-slate-500 mt-0.5">Тіркелу мен қатысушылар тізімі</div>
                        </div>
                      </button>

                      <button
                        onClick={() => setActiveTab('appeals')}
                        className="p-4 rounded-2xl bg-white border border-slate-200 hover:border-sky-300 hover:bg-sky-50/50 shadow-sm text-left transition-all active:scale-[0.98] flex flex-col justify-between group"
                      >
                        <IconMail className="w-6 h-6 mb-2 text-[#00afca] group-hover:scale-110 transition-transform" />
                        <div>
                          <div className="font-black text-sm text-slate-900">Өтініштерді қарау ({appeals.length})</div>
                          <div className="text-[11px] text-slate-500 mt-0.5">Оқушылардан түскен қолхаттар мен хаттар</div>
                        </div>
                      </button>
                    </div>
                  </div>
                </div>
              )
            ) : (
              // President Full Roster View
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <h3 className="font-extrabold text-lg text-slate-900">
                    Парламент мүшелері мен министрлер тізімі
                  </h3>
                  <span className="text-xs text-slate-500 font-semibold px-3 py-1.5 rounded-xl bg-slate-100">Барлығы: 9 фракция</span>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {members.map((m) => (
                    <div
                      key={m.id}
                      className="p-5 rounded-2xl bg-white border border-slate-200 shadow-sm hover:shadow-md flex flex-col justify-between space-y-4 transition-shadow"
                    >
                      <div>
                        <div className="flex items-center justify-between pb-3 border-b border-slate-200">
                          <span className="text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-full bg-sky-50 text-[#00afca] border border-sky-200">
                            login: {m.login}
                          </span>
                          <span className="text-xs text-slate-500 font-semibold">{m.grade}</span>
                        </div>

                        <div className="flex items-center gap-3 mt-3">
                          <div className="w-14 sm:w-16 shrink-0 shadow-sm">
                            <MemberPortrait
                              photo={m.photo}
                              name={m.nameKk}
                              aspect="portrait"
                              className="rounded-xl border border-slate-200"
                            />
                          </div>
                          <div>
                            <h4 className="font-bold text-sm text-slate-900">{m.nameKk}</h4>
                            <p className="text-xs text-slate-500 font-medium">{m.roleKk}</p>
                          </div>
                        </div>

                        <p className="text-xs text-slate-600 line-clamp-2 mt-3 leading-relaxed">
                          {m.bioKk}
                        </p>
                      </div>

                      <div className="flex items-center gap-2 pt-3 border-t border-slate-200">
                        <button
                          onClick={() => openEditMinister(m)}
                          className="flex-1 py-1.5 rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-bold border border-slate-200 transition-colors"
                        >
                          Өңдеу
                        </button>
                        {m.login !== 'president' && (
                          <button
                            onClick={() => handleDeleteMinister(m.id)}
                            className="px-2.5 py-1.5 rounded-lg bg-rose-50 hover:bg-rose-100 text-rose-600 text-xs font-bold border border-rose-200 transition-colors"
                          >
                            Өшіру
                          </button>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        )}

        {/* ===================================================================
            TAB: EVENTS (Personalized or All)
           =================================================================== */}
        {activeTab === 'events' && (
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="font-extrabold text-lg text-slate-900">
                  {hasFullAccess ? 'Барлық іс-шаралар кестесі' : 'Фракцияның іс-шаралары'}
                </h3>
                <p className="text-xs text-slate-500">
                  Іс-шараларға тіркелген оқушыларды көру және CSV-ге жүктеу
                </p>
              </div>
              <button
                onClick={() => setShowAddEvent(true)}
                className="px-4 py-2 rounded-xl bg-[#00afca] hover:bg-[#0099b0] text-white text-xs font-bold transition-all shadow-sm shadow-[#00afca]/25"
              >
                + Жаңа іс-шара
              </button>
            </div>

            {events.length === 0 ? (
              <div className="p-8 rounded-2xl bg-white border border-slate-200 text-center text-slate-500 text-xs">
                Әзірге іс-шаралар жоқ. Жаңа іс-шара қосу үшін батырманы басыңыз.
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {events.map((ev) => {
                  const regCount = ev.registrations?.length ?? ev._count?.registrations ?? 0;
                  return (
                    <div
                      key={ev.id}
                      className="p-5 rounded-2xl bg-white border border-slate-200 shadow-sm hover:shadow-md flex flex-col justify-between space-y-4 transition-shadow"
                    >
                      <div>
                        <div className="flex items-center justify-between text-xs text-slate-500 pb-3 border-b border-slate-200">
                          <div className="flex items-center gap-1.5 flex-wrap">
                            <span className="px-2 py-0.5 rounded-full bg-sky-50 text-[#00afca] font-bold text-[10px] border border-sky-200">
                              {ev.category}
                            </span>
                            {ev.ministry && (
                              <span className="px-2 py-0.5 rounded-full bg-slate-100 text-slate-700 font-semibold text-[10px]">
                                {ev.ministry}
                              </span>
                            )}
                            {ev.archived && (
                              <span className="px-2 py-0.5 rounded-full bg-emerald-50 text-emerald-700 font-bold text-[10px] border border-emerald-200">
                                Өтті
                              </span>
                            )}
                          </div>
                          <span>{new Date(ev.date).toLocaleDateString('kk-KZ')}</span>
                        </div>

                        <h4 className="font-bold text-base text-slate-900 mt-3 leading-snug">
                          {ev.titleKk || ev.titleRu}
                        </h4>
                        <p className="text-xs text-slate-600 mt-1 line-clamp-2">{ev.descKk}</p>

                        <div className="mt-3 p-3 rounded-xl bg-slate-50 border border-slate-200 flex items-center justify-between text-xs">
                          <span className="text-slate-500">Тіркелгендер:</span>
                          <span className="font-bold text-[#00afca]">
                            {regCount} / {ev.maxSeats}
                          </span>
                        </div>
                      </div>

                      <div className="flex flex-wrap items-center gap-2 pt-3 border-t border-slate-200">
                        {ev.registrations && ev.registrations.length > 0 && (
                          <button
                            onClick={() => {
                              setSelectedEventRegs(ev.registrations || []);
                              setSelectedEventTitle(ev.titleKk || ev.titleRu);
                            }}
                            className="flex-1 min-h-[38px] px-2.5 py-1.5 rounded-lg bg-sky-50 hover:bg-sky-100 text-xs font-bold text-[#00afca] border border-sky-200 transition-colors"
                          >
                            Тіркелгендер ({ev.registrations.length})
                          </button>
                        )}
                        <button
                          onClick={() => handleSetFeaturedTimer(ev)}
                          title="Осы іс-шараны басты беттегі кері санақ таймеріне қою"
                          className="min-h-[38px] px-2.5 py-1.5 rounded-lg bg-amber-50 hover:bg-amber-100 text-amber-700 border border-amber-200 text-xs font-bold transition-colors flex items-center gap-1"
                        >
                          <IconClock className="w-3.5 h-3.5" />
                          <span>Таймер</span>
                        </button>
                        <button
                          onClick={() => setEditingEvent(ev)}
                          className="min-h-[38px] px-3 py-1.5 rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-700 border border-slate-200 text-xs font-bold transition-colors"
                        >
                          Өңдеу
                        </button>
                        <button
                          onClick={() => handleDeleteEvent(ev.id)}
                          className="min-h-[38px] px-3 py-1.5 rounded-lg bg-rose-50 hover:bg-rose-100 text-rose-600 border border-rose-200 text-xs font-bold transition-colors"
                        >
                          Өшіру
                        </button>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        )}

        {/* ===================================================================
            TAB: APPEALS (Personalized for Minister or All for President)
           =================================================================== */}
        {activeTab === 'appeals' && (
          <div className="space-y-4">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div>
                <h3 className="font-extrabold text-lg text-slate-900">
                  {hasFullAccess ? 'Оқушылардан түскен барлық өтініштер' : 'Біздің фракцияға түскен өтініштер'}
                </h3>
                <p className="text-xs text-slate-500">
                  Мәртебені ауыстыру: Жаңа → Қаралуда → Шешілді
                </p>
              </div>

              {/* Status filter pills */}
              <div className="flex items-center gap-1.5 bg-white p-1 rounded-xl border border-slate-200 shadow-sm text-xs">
                {(['all', 'new', 'in_progress', 'resolved'] as const).map((st) => (
                  <button
                    key={st}
                    onClick={() => setAppealFilter(st)}
                    className={`px-3 py-1 rounded-lg font-bold capitalize transition-all ${
                      appealFilter === st
                        ? 'bg-[#00afca] text-white shadow-sm'
                        : 'text-slate-600 hover:text-slate-900'
                    }`}
                  >
                    {st === 'all' ? 'Барлығы' : st === 'new' ? 'Жаңа' : st === 'in_progress' ? 'Қаралуда' : 'Шешілді'}
                  </button>
                ))}
              </div>
            </div>

            {filteredAppeals.length === 0 ? (
              <div className="p-8 rounded-2xl bg-white border border-slate-200 text-center text-slate-500 text-xs">
                Бұл санатта өтініштер жоқ.
              </div>
            ) : (
              <div className="space-y-3">
                {filteredAppeals.map((a) => (
                  <div
                    key={a.id}
                    className="p-5 rounded-2xl bg-white border border-slate-200 shadow-sm hover:shadow-md flex flex-col md:flex-row md:items-center justify-between gap-4 transition-shadow"
                  >
                    <div className="space-y-1.5 flex-1">
                      <div className="flex flex-wrap items-center gap-2">
                        <span
                          className={`px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase ${
                            a.status === 'new'
                              ? 'bg-amber-50 text-amber-700 border border-amber-200 font-bold'
                              : a.status === 'in_progress'
                              ? 'bg-sky-50 text-sky-700 border border-sky-200 font-bold'
                              : 'bg-emerald-50 text-emerald-700 border border-emerald-200 font-bold'
                          }`}
                        >
                          {a.status === 'new' ? 'Жаңа' : a.status === 'in_progress' ? 'Қаралуда' : 'Шешілді'}
                        </span>
                        <span className="text-xs font-bold text-slate-900">
                          {a.anonymous ? 'Анонимді оқушы' : `${a.name} (${a.grade})`}
                        </span>
                        <span className="text-[11px] text-slate-500">
                          {new Date(a.createdAt).toLocaleString('kk-KZ')}
                        </span>
                      </div>
                      <p className="text-sm text-slate-700 leading-relaxed font-normal">{a.text}</p>
                    </div>

                    <div className="flex items-center gap-2 flex-wrap">
                      <button
                        onClick={() => handleAppealStatus(a.id, 'in_progress')}
                        className="px-3 py-1.5 rounded-lg bg-sky-50 hover:bg-sky-100 border border-sky-200 text-sky-700 text-xs font-bold transition-colors"
                      >
                        Қаралуда
                      </button>
                      <button
                        onClick={() => handleAppealStatus(a.id, 'resolved')}
                        className="px-3 py-1.5 rounded-lg bg-emerald-50 hover:bg-emerald-100 border border-emerald-200 text-emerald-700 text-xs font-bold transition-colors"
                      >
                        Шешілді
                      </button>
                      <button
                        onClick={() => handleDeleteAppeal(a.id)}
                        className="px-3 py-1.5 rounded-lg bg-rose-50 hover:bg-rose-100 border border-rose-200 text-rose-600 text-xs font-bold transition-colors flex items-center gap-1"
                        title="Өтінішті / қолхатты өшіру"
                      >
                        <span>Өшіру</span>
                        <IconTrash className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* ===================================================================
            TAB: NEWS (Personalized or All)
           =================================================================== */}
        {activeTab === 'news' && (
          <div className="space-y-4">
            <div className="p-6 rounded-3xl bg-gradient-to-r from-sky-500/10 via-teal-500/5 to-transparent border border-sky-200 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div>
                <span className="text-[10px] font-bold uppercase tracking-wider px-2.5 py-0.5 rounded-full bg-[#00afca] text-white">
                  Блог & Жаңалықтар лентасы
                </span>
                <h3 className="font-extrabold text-xl text-slate-900 mt-2">
                  {hasFullAccess ? 'Мектеп парламентінің барлық посттары мен жаңалықтары' : 'Біздің фракция жариялаған посттар'}
                </h3>
                <p className="text-xs text-slate-600 mt-1 max-w-xl">
                  Мұнда жарияланған барлық посттар сайттың басты бетінде және «Жаңалықтар» бөлімінде шығады. Кез келген постты осында өңдеп немесе өшіре аласыз.
                </p>
              </div>
              <button
                onClick={() => setShowAddNews(true)}
                className="px-5 py-3 rounded-2xl bg-gradient-to-r from-[#00afca] to-sky-600 hover:from-[#0099b0] hover:to-sky-700 text-white text-xs font-black shadow-lg shadow-sky-500/25 transition-all flex items-center gap-2 shrink-0 self-start sm:self-auto active:scale-95"
              >
                <IconEdit className="w-4 h-4" />
                <span>+ Жаңа пост жариялау</span>
              </button>
            </div>

            {news.length === 0 ? (
              <div className="p-12 rounded-3xl bg-white border border-slate-200 text-center space-y-4">
                <div className="w-16 h-16 mx-auto rounded-2xl bg-sky-50 flex items-center justify-center text-[#00afca]">
                  <IconEdit className="w-7 h-7" />
                </div>
                <div className="max-w-md mx-auto">
                  <h4 className="font-extrabold text-slate-900 text-base">Әзірге ешқандай пост жарияланбаған</h4>
                  <p className="text-xs text-slate-500 mt-1">
                    {hasFullAccess ? 'Мектеп парламентінің жаңалықтары мен іс-шара қорытындыларын жариялаңыз.' : 'Өз фракцияңыздың жетістіктері мен хабарламаларын жариялаңыз.'}
                  </p>
                </div>
                <button
                  onClick={() => setShowAddNews(true)}
                  className="px-6 py-2.5 rounded-xl bg-[#00afca] hover:bg-[#0099b0] text-white text-xs font-bold shadow-md shadow-sky-500/20 transition-all inline-flex items-center gap-2"
                >
                  <IconEdit className="w-4 h-4" />
                  <span>Алғашқы постты жариялау</span>
                </button>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {news.map((item) => (
                  <div
                    key={item.id}
                    className="p-5 rounded-2xl bg-white border border-slate-200 shadow-sm hover:shadow-md flex flex-col justify-between space-y-3 transition-shadow"
                  >
                    <div>
                      {item.image && (
                        <div className="h-40 rounded-xl overflow-hidden mb-3 bg-slate-100 border border-slate-200">
                          <img
                            src={item.image}
                            alt={item.titleKk || item.titleRu}
                            className="w-full h-full object-cover hover:scale-105 transition-transform duration-300"
                          />
                        </div>
                      )}
                      <div className="flex items-center justify-between pb-2 text-xs text-slate-500 border-b border-slate-200">
                        <span className="text-[#00afca] font-bold text-[10px] uppercase">
                          {item.ministry}
                        </span>
                        {item.createdAt && (
                          <span>{new Date(item.createdAt).toLocaleDateString('kk-KZ')}</span>
                        )}
                      </div>
                      <h4 className="font-bold text-base text-slate-900 mt-2 leading-snug">
                        {item.titleKk || item.titleRu}
                      </h4>
                      <p className="text-xs text-slate-600 mt-1 line-clamp-3">{item.excerpt}</p>
                    </div>

                    <div className="pt-3 border-t border-slate-200 flex items-center justify-between">
                      <a
                        href={`/kk/news/${item.slug}`}
                        target="_blank"
                        rel="noreferrer"
                        className="text-xs font-bold text-[#00afca] hover:underline flex items-center gap-1"
                      >
                        <span>Сайтта көру</span>
                        <span>↗</span>
                      </a>
                      <button
                        onClick={() => handleDeleteNews(item.id)}
                        className="px-3 py-1.5 rounded-lg bg-rose-50 hover:bg-rose-100 text-rose-600 border border-rose-200 text-xs font-bold transition-colors flex items-center gap-1"
                      >
                        <span>Өшіру</span>
                        <IconTrash className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* ===================================================================
            TAB: TIMELINE (Full Access Only)
           =================================================================== */}
        {activeTab === 'timeline' && hasFullAccess && (
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="font-extrabold text-lg text-slate-900">Жылдық жоспар (Қыркүйек — Мамыр)</h3>
              <button
                onClick={() => setShowAddTimeline(true)}
                className="px-4 py-2 rounded-xl bg-[#00afca] hover:bg-[#0099b0] text-white text-xs font-bold transition-all shadow-sm shadow-[#00afca]/25"
              >
                + Жоспар тармағы
              </button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {timeline.map((item) => (
                <div
                  key={item.id}
                  className="p-5 rounded-2xl bg-white border border-slate-200 shadow-sm hover:shadow-md flex flex-col justify-between space-y-3 transition-shadow"
                >
                  <div>
                    <div className="flex items-center justify-between text-xs text-slate-500 pb-2 border-b border-slate-200 font-bold">
                      <span className="text-[#00afca]">
                        Ай: {item.month} / Жыл: {item.year}
                      </span>
                      <span>#{item.order}</span>
                    </div>
                    <h4 className="font-bold text-base text-slate-900 mt-2">
                      {item.titleKk || item.titleRu}
                    </h4>
                    <p className="text-xs text-slate-600 mt-1">{item.descKk}</p>
                  </div>
                  <div className="pt-2 border-t border-slate-200 flex justify-end">
                    <button
                      onClick={() => handleDeleteTimeline(item.id)}
                      className="px-3 py-1.5 rounded-lg bg-rose-50 hover:bg-rose-100 text-rose-600 border border-rose-200 text-xs font-bold transition-colors"
                    >
                      Өшіру
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* ===================================================================
            TAB: POLLS
           =================================================================== */}
        {activeTab === 'polls' && (
          <div className="space-y-4">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
              <div>
                <h3 className="font-extrabold text-lg text-slate-900">Сауалнамалар мен дауыс беру</h3>
                <p className="text-xs text-slate-500 mt-0.5">
                  Белсенді сауалнама сайттағы <strong>/vote</strong> бөлімінде оқушыларға көрінеді
                </p>
              </div>
              <button
                onClick={() => {
                  setPollError(null);
                  setShowAddPoll(true);
                }}
                className="px-4 py-2.5 rounded-xl bg-[#00afca] hover:bg-[#0099b0] text-white text-xs font-bold transition-all shadow-sm shadow-[#00afca]/25 flex items-center justify-center gap-1.5 shrink-0"
              >
                <span>+</span> Жаңа сауалнама ашу
              </button>
            </div>

            {polls.length === 0 ? (
              <div className="p-12 rounded-3xl bg-white border border-slate-200 text-center space-y-3">
                <IconVote className="w-10 h-10 mx-auto text-[#00afca]" />
                <p className="text-sm font-bold text-slate-800">Әзірге сауалнамалар жоқ</p>
                <p className="text-xs text-slate-500 max-w-md mx-auto">
                  «+ Жаңа сауалнама ашу» батырмасын басып, оқушылар үшін жаңа дауыс беру сұрағын жариялаңыз.
                </p>
                <button
                  onClick={() => {
                    setPollError(null);
                    setShowAddPoll(true);
                  }}
                  className="mt-2 px-4 py-2 rounded-xl bg-[#00afca] hover:bg-[#0099b0] text-white text-xs font-bold transition-all inline-flex items-center gap-1.5"
                >
                  + Сауалнама ашу
                </button>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {polls.map((poll) => {
                  const totalVotes =
                    poll.options?.reduce(
                      (acc, o) => acc + (o.votesCount ?? o._count?.votes ?? 0),
                      0
                    ) || 0;

                  return (
                    <div
                      key={poll.id}
                      className={`p-5 rounded-2xl bg-white border transition-all ${
                        poll.active
                          ? 'border-[#00afca]/60 shadow-md ring-1 ring-[#00afca]/20'
                          : 'border-slate-200 shadow-sm opacity-85'
                      } space-y-4`}
                    >
                      <div className="flex items-start justify-between gap-3 pb-3 border-b border-slate-100">
                        <div className="space-y-1.5">
                          <div className="flex flex-wrap items-center gap-2">
                            {poll.active ? (
                              <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-emerald-100 text-emerald-700">
                                <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
                                Белсенді (Сайтта ашық)
                              </span>
                            ) : (
                              <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-slate-100 text-slate-500">
                                Жабық / Тоқтатылған
                              </span>
                            )}
                            <span className="text-[10px] text-slate-400 font-semibold">
                              Барлығы: {totalVotes} дауыс
                            </span>
                          </div>
                          <h4 className="font-bold text-base text-slate-900 leading-snug">
                            {poll.questionKk}
                          </h4>
                          {poll.questionRu && poll.questionRu !== poll.questionKk && (
                            <p className="text-xs text-slate-500">{poll.questionRu}</p>
                          )}
                        </div>

                        <div className="flex items-center gap-1 shrink-0">
                          {poll.active ? (
                            <button
                              onClick={() => handleTogglePoll(poll.id, false)}
                              title="Сауалнаманы сайтта жабу"
                              className="px-2.5 py-1 rounded-lg bg-amber-50 hover:bg-amber-100 text-amber-700 text-xs font-bold border border-amber-200 transition-colors"
                            >
                              Жабу
                            </button>
                          ) : (
                            <button
                              onClick={() => handleTogglePoll(poll.id, true)}
                              title="Сайтта ашу және белсенді ету"
                              className="px-2.5 py-1 rounded-lg bg-emerald-50 hover:bg-emerald-100 text-emerald-700 text-xs font-bold border border-emerald-200 transition-colors"
                            >
                              Ашу
                            </button>
                          )}
                          <button
                            onClick={() => handleDeletePoll(poll.id)}
                            title="Сауалнаманы өшіру"
                            className="p-1.5 rounded-lg hover:bg-rose-50 text-slate-400 hover:text-rose-600 transition-colors text-xs"
                          >
                            <IconTrash className="w-4 h-4" />
                          </button>
                        </div>
                      </div>

                      <div className="space-y-2">
                        {poll.options?.map((opt) => {
                          const v = opt.votesCount ?? opt._count?.votes ?? 0;
                          const pct = totalVotes > 0 ? Math.round((v / totalVotes) * 100) : 0;
                          return (
                            <div
                              key={opt.id}
                              className="p-3 rounded-xl bg-slate-50 border border-slate-200/80 relative overflow-hidden"
                            >
                              <div
                                className="absolute inset-y-0 left-0 bg-[#00afca]/10 transition-all duration-500"
                                style={{ width: `${pct}%` }}
                              />
                              <div className="relative flex items-center justify-between text-xs">
                                <span className="font-semibold text-slate-800">{opt.textKk}</span>
                                <div className="flex items-center gap-2">
                                  <span className="font-mono text-slate-400 text-[11px]">{pct}%</span>
                                  <span className="font-black text-[#00afca]">{v} дауыс</span>
                                </div>
                              </div>
                            </div>
                          );
                        })}
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        )}

        {/* ===================================================================
            TAB: SUGGESTIONS (Full Access Only)
           =================================================================== */}
        {activeTab === 'suggestions' && hasFullAccess && (
          <div className="space-y-4">
            <h3 className="font-extrabold text-lg text-slate-900">
              Оқушылардың идеялары мен бастамалары
            </h3>
            {suggestions.length === 0 ? (
              <div className="p-8 rounded-2xl bg-white border border-slate-200 text-center text-slate-500 text-xs">
                Әзірге жаңа ұсыныстар жоқ.
              </div>
            ) : (
              <div className="space-y-3">
                {suggestions.map((sg) => (
                  <div
                    key={sg.id}
                    className="p-5 rounded-2xl bg-white border border-slate-200 shadow-sm hover:shadow-md flex flex-col md:flex-row md:items-center justify-between gap-4 transition-shadow"
                  >
                    <div>
                      <div className="text-xs font-bold text-white">
                        {sg.author || 'Оқушы'} •{' '}
                        <span className="text-[#00afca] uppercase text-[10px] font-extrabold">
                          {sg.status || 'Жаңа'}
                        </span>
                      </div>
                      <p className="text-sm text-slate-700 mt-1">{sg.text}</p>
                    </div>

                    <div className="flex items-center gap-2">
                      <button
                        onClick={() => handleSuggestionStatus(sg.id, 'approved')}
                        className="px-3 py-1.5 rounded-lg bg-emerald-50 hover:bg-emerald-100 border border-emerald-200 text-emerald-700 text-xs font-bold transition-colors"
                      >
                        Мақұлдау
                      </button>
                      <button
                        onClick={() => handleSuggestionStatus(sg.id, 'rejected')}
                        className="px-3 py-1.5 rounded-lg bg-amber-50 hover:bg-amber-100 border border-amber-200 text-amber-700 text-xs font-bold transition-colors"
                      >
                        Қабылдамау
                      </button>
                      <button
                        onClick={() => handleDeleteSuggestion(sg.id)}
                        className="px-3 py-1.5 rounded-lg bg-rose-50 hover:bg-rose-100 border border-rose-200 text-rose-600 text-xs font-bold transition-colors flex items-center gap-1"
                        title="Өшіру"
                      >
                        <span>Өшіру</span>
                        <IconTrash className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* ===================================================================
            TAB: STATS (Full Access Only)
           =================================================================== */}
        {activeTab === 'stats' && hasFullAccess && (
          <div className="space-y-4">
            <h3 className="font-extrabold text-lg text-slate-900">Сайттағы сандық көрсеткіштер</h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
              {stats.map((st) => (
                <div key={st.id} className="p-5 rounded-2xl bg-white border border-slate-200 shadow-sm space-y-2">
                  <div className="text-xs font-bold text-slate-600">{st.labelKk}</div>
                  <input
                    type="number"
                    defaultValue={st.value}
                    onBlur={(e) => handleStatUpdate(st.key, Number(e.target.value))}
                    className="w-full px-3 py-2 rounded-xl bg-slate-50 border border-slate-200 text-slate-900 focus:bg-white focus:border-[#00afca] focus:ring-1 focus:ring-[#00afca] font-black text-xl"
                  />
                  <div className="text-[10px] text-slate-400 font-semibold">
                    Өзгерту үшін санды енгізіп, сыртына басыңыз
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* =====================================================================
          MODAL: EDIT MINISTER & ASSISTANTS
         ===================================================================== */}
      {editingMinister && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-sm"
          onClick={() => setEditingMinister(null)}
        >
          <div
            className="bg-white border border-slate-200 rounded-2xl sm:rounded-3xl p-4 sm:p-7 max-w-2xl w-full shadow-2xl space-y-5 max-h-[92dvh] overflow-y-auto text-slate-800"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between pb-4 border-b border-slate-200">
              <h3 className="font-black text-lg text-slate-900">
                Профильді өңдеу: {editingMinister.nameKk} ({editingMinister.roleKk})
              </h3>
              <button
                onClick={() => setEditingMinister(null)}
                className="w-8 h-8 rounded-full bg-slate-100 hover:bg-slate-200 flex items-center justify-center text-slate-600"
              >
                <IconClose className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleSaveMinister} className="space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">
                    Аты-жөні (Қазақша)
                  </label>
                  <input
                    type="text"
                    value={editingMinister.nameKk}
                    onChange={(e) =>
                      setEditingMinister({ ...editingMinister, nameKk: e.target.value })
                    }
                    className="w-full px-3.5 py-2.5 sm:py-2 rounded-xl bg-slate-50 border border-slate-200 text-slate-900 focus:bg-white focus:border-[#00afca] focus:ring-2 focus:ring-[#00afca]/20 text-sm sm:text-xs font-medium font-bold"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">
                    Сыныбы (Grade)
                  </label>
                  <input
                    type="text"
                    value={editingMinister.grade}
                    onChange={(e) =>
                      setEditingMinister({ ...editingMinister, grade: e.target.value })
                    }
                    className="w-full px-3.5 py-2.5 sm:py-2 rounded-xl bg-slate-50 border border-slate-200 text-slate-900 focus:bg-white focus:border-[#00afca] focus:ring-2 focus:ring-[#00afca]/20 text-sm sm:text-xs font-medium font-bold"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1.5">
                  Фото суреті (фонда мектеп логотипі болады)
                </label>
                <div className="flex items-center gap-4 p-3 rounded-2xl bg-slate-50 border border-slate-200">
                  <div className="w-20 shrink-0 shadow-md">
                    <MemberPortrait
                      photo={editingMinister.photo}
                      name={editingMinister.nameKk || 'Министр'}
                      aspect="portrait"
                      className="rounded-xl border border-slate-200"
                    />
                  </div>
                  <div className="flex-1 space-y-2">
                    <input
                      type="text"
                      value={editingMinister.photo || ''}
                      onChange={(e) =>
                        setEditingMinister({ ...editingMinister, photo: e.target.value })
                      }
                      placeholder="/images/members/... немесе URL"
                      className="w-full px-3 py-2 rounded-xl bg-white border border-slate-200 text-slate-900 focus:border-[#00afca] text-xs"
                    />
                    <label className="inline-flex items-center gap-2 px-3 py-1.5 rounded-lg bg-[#00afca] hover:bg-[#0099b0] text-white text-xs font-bold cursor-pointer transition-colors">
                      <span className="inline-flex items-center gap-1.5"><IconCamera className="w-4 h-4" /><span>Телефоннан/компьютерден жүктеу</span></span>
                      <input
                        type="file"
                        accept="image/*"
                        className="hidden"
                        onChange={async (e) => {
                          const file = e.target.files?.[0];
                          if (!file) return;
                          const fd = new FormData();
                          fd.append('file', file);
                          try {
                            const res = await fetch('/api/admin/upload', {
                              method: 'POST',
                              body: fd,
                            });
                            const json = await res.json();
                            if (json.url) {
                              setEditingMinister({ ...editingMinister, photo: json.url });
                            }
                          } catch (err) {
                            console.error('File upload failed:', err);
                          }
                        }}
                      />
                    </label>
                  </div>
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  Цитата / Ұраны (Қазақша)
                </label>
                <input
                  type="text"
                  value={editingMinister.quoteKk}
                  onChange={(e) =>
                    setEditingMinister({ ...editingMinister, quoteKk: e.target.value })
                  }
                  className="w-full px-3.5 py-2.5 sm:py-2 rounded-xl bg-slate-50 border border-slate-200 text-slate-900 focus:bg-white focus:border-[#00afca] focus:ring-2 focus:ring-[#00afca]/20 text-sm sm:text-xs font-medium"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  Сипаттамасы / Бағыты (Қазақша)
                </label>
                <textarea
                  rows={3}
                  value={editingMinister.bioKk}
                  onChange={(e) =>
                    setEditingMinister({ ...editingMinister, bioKk: e.target.value })
                  }
                  className="w-full px-3.5 py-2.5 sm:py-2 rounded-xl bg-slate-50 border border-slate-200 text-slate-900 focus:bg-white focus:border-[#00afca] focus:ring-2 focus:ring-[#00afca]/20 text-sm sm:text-xs font-medium"
                />
              </div>

              {/* Password update if full access */}
              {hasFullAccess && (
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">
                    Пароль (Кіру құпиясөзі)
                  </label>
                  <input
                    type="text"
                    value={editingMinister.password || ''}
                    onChange={(e) =>
                      setEditingMinister({ ...editingMinister, password: e.target.value })
                    }
                    className="w-full px-3.5 py-2.5 sm:py-2 rounded-xl bg-slate-50 border border-slate-200 text-slate-900 focus:bg-white focus:border-[#00afca] focus:ring-2 focus:ring-[#00afca]/20 text-sm sm:text-xs font-medium font-mono"
                  />
                </div>
              )}

              {/* Assistants Editor */}
              <div className="space-y-3 pt-3 border-t border-slate-200">
                <div className="flex items-center justify-between">
                  <div className="text-xs font-bold text-slate-900">Фракция көмекшілерін басқару</div>
                  <button
                    type="button"
                    onClick={() =>
                      setEditingAssistants([...editingAssistants, { name: '', grade: '10А' }])
                    }
                    className="px-3 py-1 rounded-lg bg-[#00afca] hover:bg-[#0099b0] text-white text-xs font-bold shadow-sm shadow-[#00afca]/25 transition-all"
                  >
                    + Көмекші қосу
                  </button>
                </div>

                <div className="space-y-2">
                  {editingAssistants.map((ast, idx) => (
                    <div key={idx} className="flex items-center gap-2">
                      <input
                        type="text"
                        placeholder="Көмекшінің аты-жөні..."
                        value={ast.name}
                        onChange={(e) => {
                          const updated = [...editingAssistants];
                          updated[idx].name = e.target.value;
                          setEditingAssistants(updated);
                        }}
                        className="flex-1 px-3.5 py-2.5 sm:py-2 rounded-xl bg-slate-50 border border-slate-200 text-slate-900 focus:bg-white focus:border-[#00afca] focus:ring-2 focus:ring-[#00afca]/20 text-sm sm:text-xs font-medium"
                      />
                      <input
                        type="text"
                        placeholder="Сыныбы (10А)"
                        value={ast.grade}
                        onChange={(e) => {
                          const updated = [...editingAssistants];
                          updated[idx].grade = e.target.value;
                          setEditingAssistants(updated);
                        }}
                        className="w-24 px-3.5 py-2.5 sm:py-2 rounded-xl bg-slate-50 border border-slate-200 text-slate-900 focus:bg-white focus:border-[#00afca] focus:ring-2 focus:ring-[#00afca]/20 text-sm sm:text-xs font-medium"
                      />
                      <button
                        type="button"
                        onClick={() =>
                          setEditingAssistants(editingAssistants.filter((_, i) => i !== idx))
                        }
                        className="px-3 py-2 rounded-xl bg-rose-50 hover:bg-rose-100 text-rose-600 border border-rose-200 text-xs font-bold"
                      >
                        <IconClose className="w-4 h-4" />
                      </button>
                    </div>
                  ))}
                </div>
              </div>

              {saveMessage && (
                <div className="p-3 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-700 font-bold text-xs font-bold text-center">
                  {saveMessage}
                </div>
              )}

              <div className="pt-4 flex items-center justify-end gap-2 border-t border-slate-200">
                <button
                  type="button"
                  onClick={() => setEditingMinister(null)}
                  className="min-h-[44px] px-4 py-2.5 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-bold border border-slate-200 transition-colors"
                >
                  Болдырмау
                </button>
                <button
                  type="submit"
                  className="min-h-[44px] px-5 py-2.5 rounded-xl bg-[#00afca] hover:bg-[#0099b0] text-white text-xs font-bold shadow-md shadow-[#00afca]/25 transition-all"
                >
                  Сақтау
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* =====================================================================
          MODAL: ADD NEW EVENT
         ===================================================================== */}
      {showAddEvent && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-sm"
          onClick={() => setShowAddEvent(false)}
        >
          <div
            className="bg-white border border-slate-200 rounded-2xl sm:rounded-3xl p-4 sm:p-7 max-w-lg w-full shadow-2xl space-y-4 text-slate-800 max-h-[92dvh] overflow-y-auto"
            onClick={(e) => e.stopPropagation()}
          >
            <h3 className="font-bold text-lg text-slate-900">Жаңа іс-шара қосу</h3>
            <form onSubmit={handleCreateEvent} className="space-y-3">
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">Сілтеме (Slug)</label>
                <input
                  type="text"
                  required
                  placeholder="chess-tournament"
                  value={eventForm.slug}
                  onChange={(e) => setEventForm({ ...eventForm, slug: e.target.value })}
                  className="w-full px-3.5 py-2.5 sm:py-2 rounded-xl bg-slate-50 border border-slate-200 text-slate-900 focus:bg-white focus:border-[#00afca] focus:ring-2 focus:ring-[#00afca]/20 text-sm sm:text-xs font-medium"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">Атауы (Қазақша)</label>
                <input
                  type="text"
                  required
                  value={eventForm.titleKk}
                  onChange={(e) => setEventForm({ ...eventForm, titleKk: e.target.value })}
                  className="w-full px-3.5 py-2.5 sm:py-2 rounded-xl bg-slate-50 border border-slate-200 text-slate-900 focus:bg-white focus:border-[#00afca] focus:ring-2 focus:ring-[#00afca]/20 text-sm sm:text-xs font-medium"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">Санаты</label>
                  <select
                    value={eventForm.category}
                    onChange={(e) => setEventForm({ ...eventForm, category: e.target.value })}
                    className="w-full px-3.5 py-2.5 sm:py-2 rounded-xl bg-slate-50 border border-slate-200 text-slate-900 focus:bg-white focus:border-[#00afca] focus:ring-2 focus:ring-[#00afca]/20 text-sm sm:text-xs font-medium"
                  >
                    <option value="Учёба">Білім</option>
                    <option value="Культура">Мәдениет</option>
                    <option value="Спорт">Спорт</option>
                    <option value="Благотворительность">Қайырымдылық</option>
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">Орын саны</label>
                  <input
                    type="number"
                    value={eventForm.maxSeats}
                    onChange={(e) =>
                      setEventForm({ ...eventForm, maxSeats: Number(e.target.value) })
                    }
                    className="w-full px-3.5 py-2.5 sm:py-2 rounded-xl bg-slate-50 border border-slate-200 text-slate-900 focus:bg-white focus:border-[#00afca] focus:ring-2 focus:ring-[#00afca]/20 text-sm sm:text-xs font-medium"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">Уақыты мен күні</label>
                  <input
                    type="datetime-local"
                    required
                    value={eventForm.date}
                    onChange={(e) => setEventForm({ ...eventForm, date: e.target.value })}
                    className="w-full px-3.5 py-2.5 sm:py-2 rounded-xl bg-slate-50 border border-slate-200 text-slate-900 focus:bg-white focus:border-[#00afca] focus:ring-2 focus:ring-[#00afca]/20 text-sm sm:text-xs font-medium"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">Өтетін орны</label>
                  <input
                    type="text"
                    required
                    placeholder="Акт залы"
                    value={eventForm.location}
                    onChange={(e) => setEventForm({ ...eventForm, location: e.target.value })}
                    className="w-full px-3.5 py-2.5 sm:py-2 rounded-xl bg-slate-50 border border-slate-200 text-slate-900 focus:bg-white focus:border-[#00afca] focus:ring-2 focus:ring-[#00afca]/20 text-sm sm:text-xs font-medium"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">Сипаттамасы</label>
                <textarea
                  rows={2}
                  value={eventForm.descKk}
                  onChange={(e) => setEventForm({ ...eventForm, descKk: e.target.value })}
                  className="w-full px-3.5 py-2.5 sm:py-2 rounded-xl bg-slate-50 border border-slate-200 text-slate-900 focus:bg-white focus:border-[#00afca] focus:ring-2 focus:ring-[#00afca]/20 text-sm sm:text-xs font-medium"
                />
              </div>

              <div className="pt-2 flex justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setShowAddEvent(false)}
                  className="min-h-[44px] px-4 py-2.5 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-bold border border-slate-200 transition-colors"
                >
                  Болдырмау
                </button>
                <button
                  type="submit"
                  className="min-h-[44px] px-5 py-2.5 rounded-xl bg-[#00afca] hover:bg-[#0099b0] text-white text-xs font-bold shadow-sm shadow-[#00afca]/25 transition-all"
                >
                  Қосу
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* =====================================================================
          MODAL: EDIT EVENT
         ===================================================================== */}
      {editingEvent && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-sm"
          onClick={() => setEditingEvent(null)}
        >
          <div
            className="bg-white border border-slate-200 rounded-2xl sm:rounded-3xl p-4 sm:p-7 max-w-lg w-full shadow-2xl space-y-4 text-slate-800 max-h-[92dvh] overflow-y-auto"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between pb-3 border-b border-slate-200">
              <h3 className="font-bold text-lg text-slate-900">Іс-шараны өңдеу</h3>
              <button
                onClick={() => setEditingEvent(null)}
                className="w-8 h-8 rounded-full bg-slate-100 hover:bg-slate-200 flex items-center justify-center text-slate-600 font-bold"
              >
                <IconClose className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleUpdateEvent} className="space-y-3">
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">Атауы (Қазақша)</label>
                <input
                  type="text"
                  required
                  value={editingEvent.titleKk}
                  onChange={(e) => setEditingEvent({ ...editingEvent, titleKk: e.target.value })}
                  className="w-full px-3.5 py-2.5 sm:py-2 rounded-xl bg-slate-50 border border-slate-200 text-slate-900 focus:bg-white focus:border-[#00afca] focus:ring-2 focus:ring-[#00afca]/20 text-sm sm:text-xs font-medium font-bold"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">Санаты</label>
                  <select
                    value={editingEvent.category}
                    onChange={(e) => setEditingEvent({ ...editingEvent, category: e.target.value })}
                    className="w-full px-3.5 py-2.5 sm:py-2 rounded-xl bg-slate-50 border border-slate-200 text-slate-900 focus:bg-white focus:border-[#00afca] focus:ring-2 focus:ring-[#00afca]/20 text-sm sm:text-xs font-medium"
                  >
                    <option value="Учёба">Білім</option>
                    <option value="Культура">Мәдениет</option>
                    <option value="Спорт">Спорт</option>
                    <option value="Благотворительность">Қайырымдылық</option>
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">Орын саны</label>
                  <input
                    type="number"
                    value={editingEvent.maxSeats}
                    onChange={(e) =>
                      setEditingEvent({ ...editingEvent, maxSeats: Number(e.target.value) })
                    }
                    className="w-full px-3.5 py-2.5 sm:py-2 rounded-xl bg-slate-50 border border-slate-200 text-slate-900 focus:bg-white focus:border-[#00afca] focus:ring-2 focus:ring-[#00afca]/20 text-sm sm:text-xs font-medium"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">Күні</label>
                  <input
                    type="datetime-local"
                    value={
                      editingEvent.date
                        ? (() => {
                            const d = new Date(editingEvent.date);
                            if (isNaN(d.getTime())) return '';
                            const pad = (n: number) => String(n).padStart(2, '0');
                            return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}T${pad(d.getHours())}:${pad(d.getMinutes())}`;
                          })()
                        : ''
                    }
                    onChange={(e) => setEditingEvent({ ...editingEvent, date: e.target.value })}
                    className="w-full px-3.5 py-2.5 sm:py-2 rounded-xl bg-slate-50 border border-slate-200 text-slate-900 focus:bg-white focus:border-[#00afca] focus:ring-2 focus:ring-[#00afca]/20 text-sm sm:text-xs font-medium"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">Өтетін орны</label>
                  <input
                    type="text"
                    required
                    value={editingEvent.location}
                    onChange={(e) => setEditingEvent({ ...editingEvent, location: e.target.value })}
                    className="w-full px-3.5 py-2.5 sm:py-2 rounded-xl bg-slate-50 border border-slate-200 text-slate-900 focus:bg-white focus:border-[#00afca] focus:ring-2 focus:ring-[#00afca]/20 text-sm sm:text-xs font-medium"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">Сипаттамасы</label>
                <textarea
                  rows={3}
                  value={editingEvent.descKk}
                  onChange={(e) => setEditingEvent({ ...editingEvent, descKk: e.target.value })}
                  className="w-full px-3.5 py-2.5 sm:py-2 rounded-xl bg-slate-50 border border-slate-200 text-slate-900 focus:bg-white focus:border-[#00afca] focus:ring-2 focus:ring-[#00afca]/20 text-sm sm:text-xs font-medium"
                />
              </div>

              <div className="p-3 rounded-xl bg-slate-50 border border-slate-200 flex items-center justify-between">
                <div>
                  <span className="text-xs font-bold text-slate-900 block">Өтті деп белгілеу (Мұрағат)</span>
                  <span className="text-[11px] text-slate-500">Іс-шара өтіп кеткен болса, белгілеңіз</span>
                </div>
                <input
                  type="checkbox"
                  checked={Boolean(editingEvent.archived)}
                  onChange={(e) => setEditingEvent({ ...editingEvent, archived: e.target.checked })}
                  className="w-5 h-5 rounded text-[#00afca] focus:ring-[#00afca]"
                />
              </div>

              <div className="pt-2 flex justify-end gap-2 border-t border-slate-200">
                <button
                  type="button"
                  onClick={() => setEditingEvent(null)}
                  className="min-h-[44px] px-4 py-2.5 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-bold border border-slate-200 transition-colors"
                >
                  Болдырмау
                </button>
                <button
                  type="submit"
                  className="min-h-[44px] px-5 py-2.5 rounded-xl bg-[#00afca] hover:bg-[#0099b0] text-white text-xs font-bold shadow-sm shadow-[#00afca]/25 transition-all"
                >
                  Сақтау
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* =====================================================================
          MODAL: VIEW REGISTRATIONS & CSV EXPORT
         ===================================================================== */}
      {selectedEventRegs && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-sm"
          onClick={() => setSelectedEventRegs(null)}
        >
          <div
            className="bg-white border border-slate-200 rounded-2xl sm:rounded-3xl p-4 sm:p-7 max-w-2xl w-full shadow-2xl space-y-4 text-slate-800 max-h-[92dvh] overflow-y-auto"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between pb-3 border-b border-slate-200">
              <div>
                <h3 className="font-bold text-base text-slate-900">Тіркелген оқушылар тізімі</h3>
                <p className="text-xs text-slate-400">{selectedEventTitle}</p>
              </div>
              <button
                onClick={() => exportCsv(selectedEventTitle, selectedEventRegs)}
                className="px-3.5 py-1.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold shadow-sm"
              >
                <span className="inline-flex items-center gap-1.5"><IconDownload className="w-4 h-4" /><span>CSV-ге жүктеу</span></span>
              </button>
            </div>

            {selectedEventRegs.length === 0 ? (
              <div className="p-6 text-center text-xs text-slate-400">
                Әзірге ешкім тіркелмеген.
              </div>
            ) : (
              <div className="space-y-2">
                {selectedEventRegs.map((r, i) => (
                  <div
                    key={i}
                    className="p-3 rounded-xl bg-slate-50 border border-slate-200 flex items-center justify-between text-xs"
                  >
                    <div>
                      <span className="font-bold text-slate-900">{r.name}</span>
                      <span className="ml-2 px-2 py-0.5 rounded-full bg-sky-50 text-[#00afca] border border-sky-200 font-bold text-[10px]">
                        {r.grade}
                      </span>
                      {r.phone && <span className="ml-2 text-slate-500">тел: {r.phone}</span>}
                    </div>
                    <div className="flex items-center gap-2">
                      <span className="text-[11px] text-slate-500">
                        {new Date(r.createdAt).toLocaleDateString('kk-KZ')}
                      </span>
                      {r.id && (
                        <button
                          onClick={() => r.id && handleDeleteRegistration(r.id)}
                          className="px-2.5 py-1 rounded-lg bg-rose-50 hover:bg-rose-100 text-rose-600 border border-rose-200 text-xs font-bold flex items-center gap-1 transition-colors"
                          title="Тіркелуді өшіру"
                        >
                          <IconTrash className="w-4 h-4" />
                          <span>Өшіру</span>
                        </button>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            )}

            <div className="pt-2 flex justify-end">
              <button
                onClick={() => setSelectedEventRegs(null)}
                className="min-h-[44px] px-4 py-2.5 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-bold border border-slate-200 transition-colors"
              >
                Жабу
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Floating Action Button for Adding Posts */}
      <div className="fixed bottom-20 md:bottom-6 right-4 sm:right-6 z-40">
        <button
          onClick={() => setShowAddNews(true)}
          className="px-5 py-3.5 rounded-full bg-gradient-to-r from-[#00afca] to-sky-600 hover:from-[#0099b0] hover:to-sky-700 text-white font-black text-xs sm:text-sm shadow-2xl shadow-sky-500/50 hover:shadow-sky-500/70 active:scale-95 transition-all flex items-center gap-2.5 border-2 border-white ring-4 ring-sky-400/20 cursor-pointer"
          title="Жаңа пост жазу / Добавить пост"
        >
          <IconEdit className="w-4 h-4" />
          <span>+ ПОСТ ҚОСУ / ДОБАВИТЬ ПОСТ</span>
        </button>
      </div>

      {/* =====================================================================
          MODAL: ADD NEWS
         ===================================================================== */}
      {showAddNews && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-sm"
          onClick={() => setShowAddNews(false)}
        >
          <div
            className="bg-white border border-slate-200 rounded-2xl sm:rounded-3xl p-4 sm:p-7 max-w-lg w-full shadow-2xl space-y-4 text-slate-800 max-h-[92dvh] overflow-y-auto"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <div>
                <h3 className="font-black text-lg text-slate-900 flex items-center gap-2">
                  <IconEdit className="w-4 h-4" />
                  <span>Жаңа пост / Жаңалық жариялау</span>
                </h3>
                <p className="text-xs text-slate-500 mt-0.5">
                  Бұл жазба сайттың басты бетінде және «Жаңалықтар» бөлімінде пайда болады.
                </p>
              </div>
              <button
                type="button"
                onClick={() => setShowAddNews(false)}
                className="w-8 h-8 rounded-full bg-slate-100 hover:bg-slate-200 flex items-center justify-center text-slate-500 text-sm"
              >
                <IconClose className="w-4 h-4" />
              </button>
            </div>
            <form onSubmit={handleCreateNews} className="space-y-3">
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">Тақырыбы (Қазақша)</label>
                <input
                  type="text"
                  required
                  placeholder="Мысалы: Жаңа жылдық кеш немесе IT Hackathon"
                  value={newsForm.titleKk}
                  onChange={(e) => {
                    const title = e.target.value;
                    const autoSlug = title.toLowerCase().replace(/[^a-z0-9а-яёәіңғүұқөһ]/gi, '-').slice(0, 40) + '-' + Date.now().toString().slice(-4);
                    setNewsForm({ ...newsForm, titleKk: title, slug: newsForm.slug ? newsForm.slug : autoSlug });
                  }}
                  className="w-full px-3.5 py-2.5 sm:py-2 rounded-xl bg-slate-50 border border-slate-200 text-slate-900 focus:bg-white focus:border-[#00afca] focus:ring-2 focus:ring-[#00afca]/20 text-sm sm:text-xs font-medium font-semibold"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">Сілтеме коды (Slug)</label>
                <input
                  type="text"
                  required
                  placeholder="post-slug"
                  value={newsForm.slug}
                  onChange={(e) => setNewsForm({ ...newsForm, slug: e.target.value })}
                  className="w-full px-3.5 py-2.5 sm:py-2 rounded-xl bg-slate-50 border border-slate-200 text-slate-900 focus:bg-white focus:border-[#00afca] focus:ring-2 focus:ring-[#00afca]/20 text-sm sm:text-xs font-medium font-mono"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">Фото немесе сурет (міндетті емес)</label>
                <div className="flex flex-col sm:flex-row gap-2">
                  <input
                    type="text"
                    placeholder="/images/instagram/post-1.jpg немесе https://..."
                    value={newsForm.image || ''}
                    onChange={(e) => setNewsForm({ ...newsForm, image: e.target.value })}
                    className="flex-1 px-3.5 py-2.5 sm:py-2 rounded-xl bg-slate-50 border border-slate-200 text-slate-900 focus:bg-white focus:border-[#00afca] focus:ring-2 focus:ring-[#00afca]/20 text-sm sm:text-xs font-medium"
                  />
                  <label className="px-3 py-2 rounded-xl bg-sky-50 hover:bg-sky-100 text-[#00afca] border border-sky-200 text-xs font-bold cursor-pointer inline-flex items-center justify-center gap-1.5 shrink-0">
                    <IconCamera className="w-4 h-4" />
                    <span>Жүктеу</span>
                    <input
                      type="file"
                      accept="image/*"
                      className="hidden"
                      onChange={async (e) => {
                        const file = e.target.files?.[0];
                        if (!file) return;
                        const fd = new FormData();
                        fd.append('file', file);
                        try {
                          const r = await fetch('/api/admin/upload', { method: 'POST', body: fd });
                          const d = await r.json();
                          if (r.ok && d.url) {
                            setNewsForm((prev) => ({ ...prev, image: d.url }));
                            showToast('Сурет сәтті жүктелді!');
                          } else {
                            showToast(d.error || 'Суретті жүктеу мүмкін болмады', 'error');
                          }
                        } catch {
                          showToast('Суретті жүктеу қатесі', 'error');
                        }
                      }}
                    />
                  </label>
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">Қысқаша аңдатпа (міндетті емес)</label>
                <input
                  type="text"
                  placeholder="Бос қалдырсаңыз, мәтіннен автоматты алынады"
                  value={newsForm.excerpt}
                  onChange={(e) => setNewsForm({ ...newsForm, excerpt: e.target.value })}
                  className="w-full px-3.5 py-2.5 sm:py-2 rounded-xl bg-slate-50 border border-slate-200 text-slate-900 focus:bg-white focus:border-[#00afca] focus:ring-2 focus:ring-[#00afca]/20 text-sm sm:text-xs font-medium"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">Мақала мәтіні</label>
                <textarea
                  rows={4}
                  required
                  value={newsForm.contentKk}
                  onChange={(e) => setNewsForm({ ...newsForm, contentKk: e.target.value })}
                  className="w-full px-3.5 py-2.5 sm:py-2 rounded-xl bg-slate-50 border border-slate-200 text-slate-900 focus:bg-white focus:border-[#00afca] focus:ring-2 focus:ring-[#00afca]/20 text-sm sm:text-xs font-medium"
                />
              </div>

              <div className="pt-2 flex justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setShowAddNews(false)}
                  className="min-h-[44px] px-4 py-2.5 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-bold border border-slate-200 transition-colors"
                >
                  Болдырмау
                </button>
                <button
                  type="submit"
                  className="min-h-[44px] px-5 py-2.5 rounded-xl bg-[#00afca] hover:bg-[#0099b0] text-white text-xs font-bold shadow-sm shadow-[#00afca]/25 transition-all"
                >
                  Жариялау
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* =====================================================================
          MODAL: ADD POLL
         ===================================================================== */}
      {showAddPoll && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-sm"
          onClick={() => setShowAddPoll(false)}
        >
          <div
            className="bg-white border border-slate-200 rounded-2xl sm:rounded-3xl p-4 sm:p-7 max-w-lg w-full shadow-2xl space-y-4 text-slate-800 max-h-[92dvh] overflow-y-auto"
            onClick={(e) => e.stopPropagation()}
          >
            <div>
              <h3 className="font-extrabold text-lg text-slate-900">Жаңа сауалнама ашу</h3>
              <p className="text-xs text-slate-500 mt-0.5">
                Оқушылар арасында онлайн дауыс беруді бастау
              </p>
            </div>

            {pollError && (
              <div className="p-3 rounded-xl bg-rose-50 border border-rose-200 text-rose-700 text-xs font-semibold flex items-center gap-2">
                <IconShield className="w-4 h-4 shrink-0" />
                <span>{pollError}</span>
              </div>
            )}

            <form onSubmit={handleCreatePoll} className="space-y-4">
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  Сауалнама сұрағы (Қазақша) *
                </label>
                <input
                  type="text"
                  required
                  placeholder="Мысалы: Лицейде қандай үйірме ашылғанын қалайсыз?"
                  value={pollForm.questionKk}
                  onChange={(e) => setPollForm({ ...pollForm, questionKk: e.target.value })}
                  className="w-full px-3.5 py-2.5 sm:py-2 rounded-xl bg-slate-50 border border-slate-200 text-slate-900 focus:bg-white focus:border-[#00afca] focus:ring-2 focus:ring-[#00afca]/20 text-sm sm:text-xs font-medium"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  Сауалнама сұрағы (Орысша, толтыру міндетті емес)
                </label>
                <input
                  type="text"
                  placeholder="Какой кружок вы бы хотели открыть в лицее?"
                  value={pollForm.questionRu}
                  onChange={(e) => setPollForm({ ...pollForm, questionRu: e.target.value })}
                  className="w-full px-3.5 py-2.5 sm:py-2 rounded-xl bg-slate-50 border border-slate-200 text-slate-900 focus:bg-white focus:border-[#00afca] focus:ring-2 focus:ring-[#00afca]/20 text-sm sm:text-xs font-medium"
                />
              </div>

              <div className="space-y-2 pt-1">
                <div className="flex items-center justify-between">
                  <label className="text-xs font-bold text-slate-700">
                    Жауап нұсқалары (кемінде 2) *
                  </label>
                  {pollForm.options.length < 6 && (
                    <button
                      type="button"
                      onClick={() =>
                        setPollForm({
                          ...pollForm,
                          options: [...pollForm.options, { textKk: '', textRu: '' }],
                        })
                      }
                      className="text-[11px] font-bold text-[#00afca] hover:text-[#0099b0] flex items-center gap-1"
                    >
                      + Нұсқа қосу
                    </button>
                  )}
                </div>

                {pollForm.options.map((opt, idx) => (
                  <div key={idx} className="flex items-center gap-2">
                    <span className="text-xs font-bold text-slate-400 w-5 shrink-0">
                      {idx + 1}.
                    </span>
                    <input
                      type="text"
                      required
                      placeholder={`${idx + 1}-нұсқа мәтіні`}
                      value={opt.textKk}
                      onChange={(e) => {
                        const updated = [...pollForm.options];
                        updated[idx].textKk = e.target.value;
                        setPollForm({ ...pollForm, options: updated });
                      }}
                      className="flex-1 px-3.5 py-2.5 sm:py-2 rounded-xl bg-slate-50 border border-slate-200 text-slate-900 focus:bg-white focus:border-[#00afca] focus:ring-2 focus:ring-[#00afca]/20 text-sm sm:text-xs font-medium"
                    />
                    {pollForm.options.length > 2 && (
                      <button
                        type="button"
                        onClick={() => {
                          const updated = pollForm.options.filter((_, i) => i !== idx);
                          setPollForm({ ...pollForm, options: updated });
                        }}
                        className="p-2 text-slate-400 hover:text-rose-600 rounded-lg hover:bg-rose-50 transition-colors text-xs"
                        title="Нұсқаны жою"
                      >
                        <IconClose className="w-4 h-4" />
                      </button>
                    )}
                  </div>
                ))}
              </div>

              <div className="pt-2">
                <label className="flex items-center gap-2 cursor-pointer select-none">
                  <input
                    type="checkbox"
                    checked={pollForm.active}
                    onChange={(e) => setPollForm({ ...pollForm, active: e.target.checked })}
                    className="w-4 h-4 rounded text-[#00afca] focus:ring-[#00afca] border-slate-300"
                  />
                  <span className="text-xs font-semibold text-slate-700">
                    Сауалнаманы сайтта бірден ашу (Белсенді ету)
                  </span>
                </label>
              </div>

              <div className="pt-3 flex justify-end gap-2 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setShowAddPoll(false)}
                  disabled={pollLoading}
                  className="min-h-[44px] px-4 py-2.5 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-bold border border-slate-200 transition-colors disabled:opacity-50"
                >
                  Болдырмау
                </button>
                <button
                  type="submit"
                  disabled={pollLoading}
                  className="min-h-[44px] px-5 py-2.5 rounded-xl bg-[#00afca] hover:bg-[#0099b0] text-white text-xs font-bold shadow-sm shadow-[#00afca]/25 transition-all disabled:opacity-50 flex items-center gap-1.5"
                >
                  {pollLoading ? (
                    <>
                      <span className="w-3 h-3 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                      <span>Ашылуда...</span>
                    </>
                  ) : (
                    <span>Ашу</span>
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* =====================================================================
          MODAL: ADD TIMELINE
         ===================================================================== */}
      {showAddTimeline && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-sm"
          onClick={() => setShowAddTimeline(false)}
        >
          <div
            className="bg-white border border-slate-200 rounded-2xl sm:rounded-3xl p-4 sm:p-7 max-w-lg w-full shadow-2xl space-y-4 text-slate-800 max-h-[92dvh] overflow-y-auto"
            onClick={(e) => e.stopPropagation()}
          >
            <h3 className="font-bold text-lg text-slate-900">Жыл жоспарына тармақ қосу</h3>
            <form onSubmit={handleCreateTimeline} className="space-y-3">
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">Атауы (Қазақша)</label>
                <input
                  type="text"
                  required
                  value={timelineForm.titleKk}
                  onChange={(e) => setTimelineForm({ ...timelineForm, titleKk: e.target.value })}
                  className="w-full px-3.5 py-2.5 sm:py-2 rounded-xl bg-slate-50 border border-slate-200 text-slate-900 focus:bg-white focus:border-[#00afca] focus:ring-2 focus:ring-[#00afca]/20 text-sm sm:text-xs font-medium"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">Ай нөмірі (1-12)</label>
                  <input
                    type="number"
                    min={1}
                    max={12}
                    value={timelineForm.month}
                    onChange={(e) =>
                      setTimelineForm({ ...timelineForm, month: Number(e.target.value) })
                    }
                    className="w-full px-3.5 py-2.5 sm:py-2 rounded-xl bg-slate-50 border border-slate-200 text-slate-900 focus:bg-white focus:border-[#00afca] focus:ring-2 focus:ring-[#00afca]/20 text-sm sm:text-xs font-medium"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">Жыл</label>
                  <input
                    type="number"
                    value={timelineForm.year}
                    onChange={(e) =>
                      setTimelineForm({ ...timelineForm, year: Number(e.target.value) })
                    }
                    className="w-full px-3.5 py-2.5 sm:py-2 rounded-xl bg-slate-50 border border-slate-200 text-slate-900 focus:bg-white focus:border-[#00afca] focus:ring-2 focus:ring-[#00afca]/20 text-sm sm:text-xs font-medium"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">Сипаттамасы</label>
                <textarea
                  rows={2}
                  value={timelineForm.descKk}
                  onChange={(e) => setTimelineForm({ ...timelineForm, descKk: e.target.value })}
                  className="w-full px-3.5 py-2.5 sm:py-2 rounded-xl bg-slate-50 border border-slate-200 text-slate-900 focus:bg-white focus:border-[#00afca] focus:ring-2 focus:ring-[#00afca]/20 text-sm sm:text-xs font-medium"
                />
              </div>

              <div className="pt-2 flex justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setShowAddTimeline(false)}
                  className="min-h-[44px] px-4 py-2.5 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-bold border border-slate-200 transition-colors"
                >
                  Болдырмау
                </button>
                <button
                  type="submit"
                  className="min-h-[44px] px-5 py-2.5 rounded-xl bg-[#00afca] hover:bg-[#0099b0] text-white text-xs font-bold shadow-sm shadow-[#00afca]/25 transition-all"
                >
                  Қосу
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
      {/* Fixed Bottom Mobile Navigation Bar */}
      <nav className="md:hidden fixed bottom-0 left-0 right-0 z-40 bg-[#0b0f17]/95 text-white border-t border-white/10 backdrop-blur-md px-2 pt-1.5 pb-[max(0.5rem,env(safe-area-inset-bottom,0px))]">
        <div className="grid grid-cols-5 gap-1 max-w-md mx-auto">
          {bottomNavItems.map((item) => {
            const isActive = activeTab === item.id;
            return (
              <button
                key={item.id}
                onClick={() => selectTab(item.id)}
                className={`min-h-[48px] rounded-xl flex flex-col items-center justify-center gap-0.5 px-1 transition-all ${
                  isActive
                    ? 'bg-[#00afca] text-white shadow-md shadow-[#00afca]/25'
                    : 'text-slate-400 hover:text-white'
                }`}
              >
                {item.icon}
                <span className="text-[10px] font-bold truncate max-w-full">{item.shortLabel}</span>
              </button>
            );
          })}
          <button
            onClick={() => setMobileMenuOpen(true)}
            className="min-h-[48px] rounded-xl flex flex-col items-center justify-center gap-0.5 px-1 text-slate-300 hover:text-white bg-white/5"
          >
            <IconMenu className="w-4 h-4" />
            <span className="text-[10px] font-bold">Мәзір</span>
          </button>
        </div>
      </nav>
    </div>
  );
}
