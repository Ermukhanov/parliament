'use client';

import { useState, useEffect, useCallback, useRef } from 'react';
import Link from 'next/link';
import SchoolLogo from '@/components/SchoolLogo';
import MemberPortrait from '@/components/MemberPortrait';

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
  const initialTabSet = useRef(false);

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
    ministry: 'press',
    published: true,
  });

  const [showAddPoll, setShowAddPoll] = useState(false);
  const [pollForm, setPollForm] = useState({
    questionRu: '',
    questionKk: '',
    option1Ru: '',
    option1Kk: '',
    option2Ru: '',
    option2Kk: '',
    option3Ru: '',
    option3Kk: '',
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
      setTimeout(() => {
        setEditingMinister(null);
        setSaveMessage('');
      }, 1000);
      fetchAllData();
    }
  };

  const handleDeleteMinister = async (id: string) => {
    if (!confirm('Фракция мүшесін өшіруді растайсыз ба?')) return;
    await fetch(`/api/admin/members?id=${id}`, { method: 'DELETE' });
    fetchAllData();
  };

  const handleCreateEvent = async (e: React.FormEvent) => {
    e.preventDefault();
    const res = await fetch('/api/admin/events', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        ...eventForm,
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
      fetchAllData();
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
      fetchAllData();
    }
  };

  const handleDeleteEvent = async (id: string) => {
    if (!confirm('Іс-шараны өшіруді растайсыз ба?')) return;
    await fetch(`/api/admin/events?id=${id}`, { method: 'DELETE' });
    fetchAllData();
  };

  const handleCreateTimeline = async (e: React.FormEvent) => {
    e.preventDefault();
    const res = await fetch('/api/admin/timeline', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        ...timelineForm,
        month: Number(timelineForm.month),
        year: Number(timelineForm.year),
        order: Number(timelineForm.order),
      }),
    });
    if (res.ok) {
      setShowAddTimeline(false);
      fetchAllData();
    }
  };

  const handleDeleteTimeline = async (id: string) => {
    if (!confirm('Жоспар тармағын өшіруді растайсыз ба?')) return;
    await fetch(`/api/admin/timeline?id=${id}`, { method: 'DELETE' });
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
          ministry: 'general',
          published: true,
        });
        alert('✅ Жаңа пост сәтті жарияланды! Сайтта және тізімде көрінеді.');
        setActiveTab('news');
        fetchAllData();
      } else {
        const err = await res.json().catch(() => ({ error: 'Қате' }));
        alert(err.error || 'Постты жариялау кезінде қате орын алды');
      }
    } catch {
      alert('Сервермен байланыс қатесі');
    }
  };

  const handleDeleteNews = async (id: string) => {
    if (!confirm('Бұл постты / жаңалықты өшіруді растайсыз ба?')) return;
    setNews((prev) => prev.filter((n) => n.id !== id));
    const res = await fetch(`/api/admin/news?id=${id}`, { method: 'DELETE' });
    if (res.ok) {
      alert('✅ Пост сәтті өшірілді!');
      fetchAllData();
    } else {
      const err = await res.json().catch(() => ({ error: 'Қате' }));
      alert(err.error || 'Өшіру мүмкін болмады');
      fetchAllData();
    }
  };

  const handleCreatePoll = async (e: React.FormEvent) => {
    e.preventDefault();
    const res = await fetch('/api/admin/polls', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(pollForm),
    });
    if (res.ok) {
      setShowAddPoll(false);
      fetchAllData();
    }
  };

  const handleDeletePoll = async (id: string) => {
    if (!confirm('Сауалнаманы өшіруді растайсыз ба?')) return;
    await fetch(`/api/admin/polls?id=${id}`, { method: 'DELETE' });
    fetchAllData();
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
      alert('✅ Өтініш / қолхат сәтті өшірілді!');
      fetchAllData();
    } else {
      const err = await res.json().catch(() => ({ error: 'Қате' }));
      alert(err.error || 'Өшіру мүмкін болмады');
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
      alert('✅ Оқушының іс-шараға тіркелуі сәтті өшірілді!');
      fetchAllData();
    } else {
      const err = await res.json().catch(() => ({ error: 'Қате' }));
      alert(err.error || 'Тіркелуді өшіру мүмкін болмады');
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
      alert('✅ Ұсыныс сәтті өшірілді!');
      fetchAllData();
    } else {
      const err = await res.json().catch(() => ({ error: 'Қате' }));
      alert(err.error || 'Ұсынысты өшіру мүмкін болмады');
      fetchAllData();
    }
  };

  const handleStatUpdate = async (key: string, value: number) => {
    await fetch('/api/admin/stats', {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ key, value: Number(value) }),
    });
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

            <div className="mt-8 pt-6 border-t border-slate-100 text-center">
              <Link
                href="/kk"
                className="text-xs font-semibold text-slate-500 hover:text-[#00afca] transition-colors"
              >
                ← Негізгі сайтқа оралу
              </Link>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // =========================================================================
  // 2. DASHBOARD VIEW (PERSONALIZED PER USER, DARK HIGH-END PALETTE)
  // =========================================================================
  return (
    <div className="min-h-screen bg-[#f8fafc] text-slate-900 flex flex-col font-sans">
      {/* Top Navigation Bar */}
      <header className="sticky top-0 z-40 bg-white/95 border-b border-slate-200 shadow-sm backdrop-blur-md px-3 sm:px-8 py-2.5 sm:py-3.5 flex items-center justify-between gap-2">
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-xl bg-[#00afca] border border-sky-200 p-1 flex items-center justify-center shadow-sm">
            <SchoolLogo className="w-full h-full object-contain" variant="white-on-blue" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="font-black text-sm tracking-tight text-slate-900">AQL Council</span>
              <span className="px-2 py-0.5 rounded-full text-[10px] font-bold uppercase bg-sky-50 text-[#00afca] border border-sky-200">
                {hasFullAccess ? 'Басшылық' : 'Фракция министрі'}
              </span>
            </div>
            <div className="text-[10px] sm:text-[11px] text-slate-500 font-medium truncate max-w-[130px] sm:max-w-none">
              {currentRoleLabel}
            </div>
          </div>
        </div>

        <div className="flex items-center gap-2 sm:gap-3">
          <button
            onClick={() => setShowAddNews(true)}
            className="flex items-center gap-1.5 px-3 sm:px-4 py-1.5 sm:py-2 rounded-xl bg-gradient-to-r from-[#00afca] to-sky-600 hover:from-[#0099b0] hover:to-sky-700 text-white font-bold text-xs shadow-md shadow-sky-500/25 active:scale-95 transition-all"
            title="Жаңа пост, мақала немесе жаңалық жариялау"
          >
            <span className="text-sm">✍️</span>
            <span>Жаңа пост жазу</span>
          </button>

          <button
            onClick={() => setShowAddEvent(true)}
            className="hidden sm:flex items-center gap-1.5 px-3 py-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold text-xs border border-slate-200 transition-all"
            title="Жаңа іс-шара қосу"
          >
            <span>📅</span>
            <span>+ Іс-шара</span>
          </button>

          <Link
            href="/kk"
            className="text-[11px] sm:text-xs font-bold text-slate-700 hover:text-[#00afca] px-2.5 sm:px-3.5 py-1.5 sm:py-2 rounded-xl bg-slate-100 hover:bg-sky-50 border border-slate-200 transition-colors inline-block"
          >
            Сайтқа ↗
          </Link>
          <button
            onClick={handleLogout}
            className="text-[11px] sm:text-xs font-bold text-rose-600 hover:text-rose-700 px-2.5 sm:px-3.5 py-1.5 sm:py-2 rounded-xl bg-rose-50 hover:bg-rose-100 border border-rose-200 transition-colors"
          >
            Шығу
          </button>
        </div>
      </header>

      {/* Main Container */}
      <div className="flex-1 max-w-7xl w-full mx-auto p-3 sm:p-6 lg:p-8 space-y-4 sm:space-y-6">
        {/* Navigation Tabs Bar */}
        <div className="flex items-center gap-1.5 overflow-x-auto pb-2 border-b border-slate-200 no-scrollbar -mx-3 px-3 sm:mx-0 sm:px-0">
          {hasFullAccess ? (
            <>
              <button
                onClick={() => setActiveTab('overview')}
                className={`px-4 py-2 rounded-xl text-xs font-bold whitespace-nowrap transition-all ${
                  activeTab === 'overview'
                    ? 'bg-[#00afca] text-white shadow-md shadow-[#00afca]/25'
                    : 'text-slate-600 hover:text-slate-900 hover:bg-white border border-transparent hover:border-slate-200'
                }`}
              >
                📊 Шолу (KPI)
              </button>
              <button
                onClick={() => setActiveTab('ministers')}
                className={`px-4 py-2 rounded-xl text-xs font-bold whitespace-nowrap transition-all ${
                  activeTab === 'ministers'
                    ? 'bg-[#00afca] text-white shadow-md shadow-[#00afca]/25'
                    : 'text-slate-600 hover:text-slate-900 hover:bg-white border border-transparent hover:border-slate-200'
                }`}
              >
                👥 Министрлер & Фракциялар ({members.length})
              </button>
              <button
                onClick={() => setActiveTab('events')}
                className={`px-4 py-2 rounded-xl text-xs font-bold whitespace-nowrap transition-all ${
                  activeTab === 'events'
                    ? 'bg-[#00afca] text-white shadow-md shadow-[#00afca]/25'
                    : 'text-slate-600 hover:text-slate-900 hover:bg-white border border-transparent hover:border-slate-200'
                }`}
              >
                📅 Барлық іс-шаралар ({events.length})
              </button>
              <button
                onClick={() => setActiveTab('timeline')}
                className={`px-4 py-2 rounded-xl text-xs font-bold whitespace-nowrap transition-all ${
                  activeTab === 'timeline'
                    ? 'bg-[#00afca] text-white shadow-md shadow-[#00afca]/25'
                    : 'text-slate-600 hover:text-slate-900 hover:bg-white border border-transparent hover:border-slate-200'
                }`}
              >
                🗺️ Жыл жоспары ({timeline.length})
              </button>
              <button
                onClick={() => setActiveTab('polls')}
                className={`px-4 py-2 rounded-xl text-xs font-bold whitespace-nowrap transition-all ${
                  activeTab === 'polls'
                    ? 'bg-[#00afca] text-white shadow-md shadow-[#00afca]/25'
                    : 'text-slate-600 hover:text-slate-900 hover:bg-white border border-transparent hover:border-slate-200'
                }`}
              >
                🗳️ Сауалнамалар ({polls.length})
              </button>
              <button
                onClick={() => setActiveTab('suggestions')}
                className={`px-4 py-2 rounded-xl text-xs font-bold whitespace-nowrap transition-all ${
                  activeTab === 'suggestions'
                    ? 'bg-[#00afca] text-white shadow-md shadow-[#00afca]/25'
                    : 'text-slate-600 hover:text-slate-900 hover:bg-white border border-transparent hover:border-slate-200'
                }`}
              >
                💡 Ұсыныстар ({suggestions.length})
              </button>
              <button
                onClick={() => setActiveTab('appeals')}
                className={`px-4 py-2 rounded-xl text-xs font-bold whitespace-nowrap transition-all ${
                  activeTab === 'appeals'
                    ? 'bg-[#00afca] text-white shadow-md shadow-[#00afca]/25'
                    : 'text-slate-600 hover:text-slate-900 hover:bg-white border border-transparent hover:border-slate-200'
                }`}
              >
                📨 Өтініштер & Қолхаттар ({appeals.length})
              </button>
              <button
                onClick={() => setActiveTab('news')}
                className={`px-4 py-2 rounded-xl text-xs font-bold whitespace-nowrap transition-all ${
                  activeTab === 'news'
                    ? 'bg-[#00afca] text-white shadow-md shadow-[#00afca]/25'
                    : 'text-slate-600 hover:text-slate-900 hover:bg-white border border-transparent hover:border-slate-200'
                }`}
              >
                📰 Посттар мен Жаңалықтар ({news.length})
              </button>
              <button
                onClick={() => setActiveTab('stats')}
                className={`px-4 py-2 rounded-xl text-xs font-bold whitespace-nowrap transition-all ${
                  activeTab === 'stats'
                    ? 'bg-[#00afca] text-white shadow-md shadow-[#00afca]/25'
                    : 'text-slate-600 hover:text-slate-900 hover:bg-white border border-transparent hover:border-slate-200'
                }`}
              >
                📈 Сандық көрсеткіштер
              </button>
            </>
          ) : (
            // Personalized Faction Minister Tabs
            <>
              <button
                onClick={() => setActiveTab('ministers')}
                className={`px-4 py-2 rounded-xl text-xs font-bold whitespace-nowrap transition-all ${
                  activeTab === 'ministers'
                    ? 'bg-[#00afca] text-white shadow-md shadow-[#00afca]/25'
                    : 'text-slate-600 hover:text-slate-900 hover:bg-white border border-transparent hover:border-slate-200'
                }`}
              >
                🛡️ Менің фракциям & Көмекшілер
              </button>
              <button
                onClick={() => setActiveTab('events')}
                className={`px-4 py-2 rounded-xl text-xs font-bold whitespace-nowrap transition-all ${
                  activeTab === 'events'
                    ? 'bg-[#00afca] text-white shadow-md shadow-[#00afca]/25'
                    : 'text-slate-600 hover:text-slate-900 hover:bg-white border border-transparent hover:border-slate-200'
                }`}
              >
                📅 Фракция іс-шаралары ({events.length})
              </button>
              <button
                onClick={() => setActiveTab('appeals')}
                className={`px-4 py-2 rounded-xl text-xs font-bold whitespace-nowrap transition-all ${
                  activeTab === 'appeals'
                    ? 'bg-[#00afca] text-white shadow-md shadow-[#00afca]/25'
                    : 'text-slate-600 hover:text-slate-900 hover:bg-white border border-transparent hover:border-slate-200'
                }`}
              >
                📨 Бізге түскен өтініштер & Қолхаттар ({appeals.length})
              </button>
              <button
                onClick={() => setActiveTab('news')}
                className={`px-4 py-2 rounded-xl text-xs font-bold whitespace-nowrap transition-all ${
                  activeTab === 'news'
                    ? 'bg-[#00afca] text-white shadow-md shadow-[#00afca]/25'
                    : 'text-slate-600 hover:text-slate-900 hover:bg-white border border-transparent hover:border-slate-200'
                }`}
              >
                📰 Фракция посттары & Жаңалықтары ({news.length})
              </button>
            </>
          )}
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
                  <span>✍️</span>
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
                      ✏️ Профиль мен көмекшілерді өңдеу
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
                      <span>⚡</span>
                      <span>Фракцияны басқару және жедел әрекеттер:</span>
                    </h4>
                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                      <button
                        onClick={() => setShowAddNews(true)}
                        className="p-4 rounded-2xl bg-gradient-to-br from-sky-500 to-[#00afca] hover:from-sky-600 hover:to-[#0099b0] text-white shadow-md shadow-sky-500/20 text-left transition-all active:scale-[0.98] flex flex-col justify-between group"
                      >
                        <span className="text-2xl mb-2 group-hover:scale-110 transition-transform">✍️</span>
                        <div>
                          <div className="font-black text-sm">Жаңа пост жазу</div>
                          <div className="text-[11px] text-white/80 mt-0.5">Сайтқа жаңалық немесе мақала жариялау</div>
                        </div>
                      </button>

                      <button
                        onClick={() => setShowAddEvent(true)}
                        className="p-4 rounded-2xl bg-white border border-slate-200 hover:border-sky-300 hover:bg-sky-50/50 shadow-sm text-left transition-all active:scale-[0.98] flex flex-col justify-between group"
                      >
                        <span className="text-2xl mb-2 group-hover:scale-110 transition-transform">📅</span>
                        <div>
                          <div className="font-black text-sm text-slate-900">Жаңа іс-шара қосу</div>
                          <div className="text-[11px] text-slate-500 mt-0.5">Тіркелу мен қатысушылар тізімі</div>
                        </div>
                      </button>

                      <button
                        onClick={() => setActiveTab('appeals')}
                        className="p-4 rounded-2xl bg-white border border-slate-200 hover:border-sky-300 hover:bg-sky-50/50 shadow-sm text-left transition-all active:scale-[0.98] flex flex-col justify-between group"
                      >
                        <span className="text-2xl mb-2 group-hover:scale-110 transition-transform">📨</span>
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
                                ✅ Өтті
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

                      <div className="flex items-center gap-2 pt-3 border-t border-slate-200">
                        {ev.registrations && ev.registrations.length > 0 && (
                          <button
                            onClick={() => {
                              setSelectedEventRegs(ev.registrations || []);
                              setSelectedEventTitle(ev.titleKk || ev.titleRu);
                            }}
                            className="flex-1 py-1.5 rounded-lg bg-sky-50 hover:bg-sky-100 text-xs font-bold text-[#00afca] border border-sky-200 transition-colors"
                          >
                            Тіркелгендер ({ev.registrations.length})
                          </button>
                        )}
                        <button
                          onClick={() => handleSetFeaturedTimer(ev)}
                          title="Осы іс-шараны басты беттегі кері санақ таймеріне қою"
                          className="px-2.5 py-1.5 rounded-lg bg-amber-50 hover:bg-amber-100 text-amber-700 border border-amber-200 text-xs font-bold transition-colors flex items-center gap-1"
                        >
                          <span>⏳</span>
                          <span>Таймер</span>
                        </button>
                        <button
                          onClick={() => setEditingEvent(ev)}
                          className="px-3 py-1.5 rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-700 border border-slate-200 text-xs font-bold transition-colors"
                        >
                          Өңдеу
                        </button>
                        <button
                          onClick={() => handleDeleteEvent(ev.id)}
                          className="px-3 py-1.5 rounded-lg bg-rose-50 hover:bg-rose-100 text-rose-600 border border-rose-200 text-xs font-bold transition-colors"
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
                        Шешілді ✓
                      </button>
                      <button
                        onClick={() => handleDeleteAppeal(a.id)}
                        className="px-3 py-1.5 rounded-lg bg-rose-50 hover:bg-rose-100 border border-rose-200 text-rose-600 text-xs font-bold transition-colors flex items-center gap-1"
                        title="Өтінішті / қолхатты өшіру"
                      >
                        <span>Өшіру</span>
                        <span>🗑️</span>
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
                <span className="text-base">✍️</span>
                <span>+ Жаңа пост жариялау</span>
              </button>
            </div>

            {news.length === 0 ? (
              <div className="p-12 rounded-3xl bg-white border border-slate-200 text-center space-y-4">
                <div className="w-16 h-16 mx-auto rounded-2xl bg-sky-50 flex items-center justify-center text-3xl">
                  ✍️
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
                  <span>✍️</span>
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
                        <span>🗑️</span>
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
            TAB: POLLS (Full Access Only)
           =================================================================== */}
        {activeTab === 'polls' && hasFullAccess && (
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="font-extrabold text-lg text-slate-900">Сауалнамалар мен дауыс беру</h3>
              <button
                onClick={() => setShowAddPoll(true)}
                className="px-4 py-2 rounded-xl bg-[#00afca] hover:bg-[#0099b0] text-white text-xs font-bold transition-all shadow-sm shadow-[#00afca]/25"
              >
                + Жаңа сауалнама
              </button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {polls.map((poll) => (
                <div
                  key={poll.id}
                  className="p-5 rounded-2xl bg-white border border-slate-200 shadow-sm hover:shadow-md space-y-4 transition-shadow"
                >
                  <div className="flex items-center justify-between pb-2 border-b border-slate-200">
                    <h4 className="font-bold text-base text-slate-900">{poll.questionKk}</h4>
                    <button
                      onClick={() => handleDeletePoll(poll.id)}
                      className="text-xs text-rose-600 hover:text-rose-700 font-bold"
                    >
                      Өшіру
                    </button>
                  </div>

                  <div className="space-y-2">
                    {poll.options?.map((opt) => {
                      const v = opt.votesCount ?? opt._count?.votes ?? 0;
                      return (
                        <div
                          key={opt.id}
                          className="p-3 rounded-xl bg-slate-50 border border-slate-200 flex items-center justify-between text-xs"
                        >
                          <span className="font-semibold text-slate-800">{opt.textKk}</span>
                          <span className="font-black text-[#00afca]">{v} дауыс</span>
                        </div>
                      );
                    })}
                  </div>
                </div>
              ))}
            </div>
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
                        Мақұлдау ✓
                      </button>
                      <button
                        onClick={() => handleSuggestionStatus(sg.id, 'rejected')}
                        className="px-3 py-1.5 rounded-lg bg-amber-50 hover:bg-amber-100 border border-amber-200 text-amber-700 text-xs font-bold transition-colors"
                      >
                        Қабылдамау ✕
                      </button>
                      <button
                        onClick={() => handleDeleteSuggestion(sg.id)}
                        className="px-3 py-1.5 rounded-lg bg-rose-50 hover:bg-rose-100 border border-rose-200 text-rose-600 text-xs font-bold transition-colors flex items-center gap-1"
                        title="Өшіру"
                      >
                        <span>Өшіру</span>
                        <span>🗑️</span>
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
            className="bg-white border border-slate-200 rounded-3xl p-6 sm:p-8 max-w-2xl w-full shadow-2xl space-y-6 max-h-[90vh] overflow-y-auto text-slate-800"
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
                ✕
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
                    className="w-full px-3 py-2 rounded-xl bg-slate-50 border border-slate-200 text-slate-900 focus:bg-white focus:border-[#00afca] focus:ring-1 focus:ring-[#00afca] text-xs font-bold"
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
                    className="w-full px-3 py-2 rounded-xl bg-slate-50 border border-slate-200 text-slate-900 focus:bg-white focus:border-[#00afca] focus:ring-1 focus:ring-[#00afca] text-xs font-bold"
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
                      <span>📁 Телефоннан/компьютерден жүктеу</span>
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
                  className="w-full px-3 py-2 rounded-xl bg-slate-50 border border-slate-200 text-slate-900 focus:bg-white focus:border-[#00afca] focus:ring-1 focus:ring-[#00afca] text-xs"
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
                  className="w-full px-3 py-2 rounded-xl bg-slate-50 border border-slate-200 text-slate-900 focus:bg-white focus:border-[#00afca] focus:ring-1 focus:ring-[#00afca] text-xs"
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
                    className="w-full px-3 py-2 rounded-xl bg-slate-50 border border-slate-200 text-slate-900 focus:bg-white focus:border-[#00afca] focus:ring-1 focus:ring-[#00afca] text-xs font-mono"
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
                        className="flex-1 px-3 py-2 rounded-xl bg-slate-50 border border-slate-200 text-slate-900 focus:bg-white focus:border-[#00afca] focus:ring-1 focus:ring-[#00afca] text-xs"
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
                        className="w-24 px-3 py-2 rounded-xl bg-slate-50 border border-slate-200 text-slate-900 focus:bg-white focus:border-[#00afca] focus:ring-1 focus:ring-[#00afca] text-xs"
                      />
                      <button
                        type="button"
                        onClick={() =>
                          setEditingAssistants(editingAssistants.filter((_, i) => i !== idx))
                        }
                        className="px-3 py-2 rounded-xl bg-rose-50 hover:bg-rose-100 text-rose-600 border border-rose-200 text-xs font-bold"
                      >
                        ✕
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
                  className="px-4 py-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-bold border border-slate-200 transition-colors"
                >
                  Болдырмау
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 rounded-xl bg-[#00afca] hover:bg-[#0099b0] text-white text-xs font-bold shadow-md shadow-[#00afca]/25 transition-all"
                >
                  Сақтау ✓
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
            className="bg-white border border-slate-200 rounded-3xl p-6 sm:p-8 max-w-lg w-full shadow-2xl space-y-4 text-slate-800 max-h-[90vh] overflow-y-auto"
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
                  className="w-full px-3 py-2 rounded-xl bg-slate-50 border border-slate-200 text-slate-900 focus:bg-white focus:border-[#00afca] focus:ring-1 focus:ring-[#00afca] text-xs"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">Атауы (Қазақша)</label>
                <input
                  type="text"
                  required
                  value={eventForm.titleKk}
                  onChange={(e) => setEventForm({ ...eventForm, titleKk: e.target.value })}
                  className="w-full px-3 py-2 rounded-xl bg-slate-50 border border-slate-200 text-slate-900 focus:bg-white focus:border-[#00afca] focus:ring-1 focus:ring-[#00afca] text-xs"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">Санаты</label>
                  <select
                    value={eventForm.category}
                    onChange={(e) => setEventForm({ ...eventForm, category: e.target.value })}
                    className="w-full px-3 py-2 rounded-xl bg-slate-50 border border-slate-200 text-slate-900 focus:bg-white focus:border-[#00afca] focus:ring-1 focus:ring-[#00afca] text-xs"
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
                    className="w-full px-3 py-2 rounded-xl bg-slate-50 border border-slate-200 text-slate-900 focus:bg-white focus:border-[#00afca] focus:ring-1 focus:ring-[#00afca] text-xs"
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
                    className="w-full px-3 py-2 rounded-xl bg-slate-50 border border-slate-200 text-slate-900 focus:bg-white focus:border-[#00afca] focus:ring-1 focus:ring-[#00afca] text-xs"
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
                    className="w-full px-3 py-2 rounded-xl bg-slate-50 border border-slate-200 text-slate-900 focus:bg-white focus:border-[#00afca] focus:ring-1 focus:ring-[#00afca] text-xs"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">Сипаттамасы</label>
                <textarea
                  rows={2}
                  value={eventForm.descKk}
                  onChange={(e) => setEventForm({ ...eventForm, descKk: e.target.value })}
                  className="w-full px-3 py-2 rounded-xl bg-slate-50 border border-slate-200 text-slate-900 focus:bg-white focus:border-[#00afca] focus:ring-1 focus:ring-[#00afca] text-xs"
                />
              </div>

              <div className="pt-2 flex justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setShowAddEvent(false)}
                  className="px-4 py-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-bold border border-slate-200 transition-colors"
                >
                  Болдырмау
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 rounded-xl bg-[#00afca] hover:bg-[#0099b0] text-white text-xs font-bold shadow-sm shadow-[#00afca]/25 transition-all"
                >
                  Қосу ✓
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
            className="bg-white border border-slate-200 rounded-3xl p-6 sm:p-8 max-w-lg w-full shadow-2xl space-y-4 text-slate-800 max-h-[90vh] overflow-y-auto"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between pb-3 border-b border-slate-200">
              <h3 className="font-bold text-lg text-slate-900">Іс-шараны өңдеу</h3>
              <button
                onClick={() => setEditingEvent(null)}
                className="w-8 h-8 rounded-full bg-slate-100 hover:bg-slate-200 flex items-center justify-center text-slate-600 font-bold"
              >
                ✕
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
                  className="w-full px-3 py-2 rounded-xl bg-slate-50 border border-slate-200 text-slate-900 focus:bg-white focus:border-[#00afca] focus:ring-1 focus:ring-[#00afca] text-xs font-bold"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">Санаты</label>
                  <select
                    value={editingEvent.category}
                    onChange={(e) => setEditingEvent({ ...editingEvent, category: e.target.value })}
                    className="w-full px-3 py-2 rounded-xl bg-slate-50 border border-slate-200 text-slate-900 focus:bg-white focus:border-[#00afca] focus:ring-1 focus:ring-[#00afca] text-xs"
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
                    className="w-full px-3 py-2 rounded-xl bg-slate-50 border border-slate-200 text-slate-900 focus:bg-white focus:border-[#00afca] focus:ring-1 focus:ring-[#00afca] text-xs"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">Күні</label>
                  <input
                    type="datetime-local"
                    value={editingEvent.date ? new Date(editingEvent.date).toISOString().slice(0, 16) : ''}
                    onChange={(e) => setEditingEvent({ ...editingEvent, date: e.target.value })}
                    className="w-full px-3 py-2 rounded-xl bg-slate-50 border border-slate-200 text-slate-900 focus:bg-white focus:border-[#00afca] focus:ring-1 focus:ring-[#00afca] text-xs"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">Өтетін орны</label>
                  <input
                    type="text"
                    required
                    value={editingEvent.location}
                    onChange={(e) => setEditingEvent({ ...editingEvent, location: e.target.value })}
                    className="w-full px-3 py-2 rounded-xl bg-slate-50 border border-slate-200 text-slate-900 focus:bg-white focus:border-[#00afca] focus:ring-1 focus:ring-[#00afca] text-xs"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">Сипаттамасы</label>
                <textarea
                  rows={3}
                  value={editingEvent.descKk}
                  onChange={(e) => setEditingEvent({ ...editingEvent, descKk: e.target.value })}
                  className="w-full px-3 py-2 rounded-xl bg-slate-50 border border-slate-200 text-slate-900 focus:bg-white focus:border-[#00afca] focus:ring-1 focus:ring-[#00afca] text-xs"
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
                  className="px-4 py-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-bold border border-slate-200 transition-colors"
                >
                  Болдырмау
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 rounded-xl bg-[#00afca] hover:bg-[#0099b0] text-white text-xs font-bold shadow-sm shadow-[#00afca]/25 transition-all"
                >
                  Сақтау ✓
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
            className="bg-white border border-slate-200 rounded-3xl p-6 sm:p-8 max-w-2xl w-full shadow-2xl space-y-4 text-slate-800 max-h-[85vh] overflow-y-auto"
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
                📥 CSV-ге жүктеу
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
                          onClick={() => handleDeleteRegistration(r.id)}
                          className="px-2.5 py-1 rounded-lg bg-rose-50 hover:bg-rose-100 text-rose-600 border border-rose-200 text-xs font-bold flex items-center gap-1 transition-colors"
                          title="Тіркелуді өшіру"
                        >
                          <span>🗑️</span>
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
                className="px-4 py-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-bold border border-slate-200 transition-colors"
              >
                Жабу
              </button>
            </div>
          </div>
        </div>
      )}

      {/* =====================================================================
          MODAL: ADD NEWS
         ===================================================================== */}
      {showAddNews && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-sm"
          onClick={() => setShowAddNews(false)}
        >
          <div
            className="bg-white border border-slate-200 rounded-3xl p-6 sm:p-8 max-w-lg w-full shadow-2xl space-y-4 text-slate-800 max-h-[90vh] overflow-y-auto"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <div>
                <h3 className="font-black text-lg text-slate-900 flex items-center gap-2">
                  <span>✍️</span>
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
                ✕
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
                  className="w-full px-3 py-2 rounded-xl bg-slate-50 border border-slate-200 text-slate-900 focus:bg-white focus:border-[#00afca] focus:ring-1 focus:ring-[#00afca] text-xs font-semibold"
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
                  className="w-full px-3 py-2 rounded-xl bg-slate-50 border border-slate-200 text-slate-900 focus:bg-white focus:border-[#00afca] focus:ring-1 focus:ring-[#00afca] text-xs font-mono"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">Фото немесе сурет сілтемесі (міндетті емес)</label>
                <input
                  type="text"
                  placeholder="/images/instagram/post-1.jpg немесе https://..."
                  value={newsForm.image || ''}
                  onChange={(e) => setNewsForm({ ...newsForm, image: e.target.value })}
                  className="w-full px-3 py-2 rounded-xl bg-slate-50 border border-slate-200 text-slate-900 focus:bg-white focus:border-[#00afca] focus:ring-1 focus:ring-[#00afca] text-xs"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">Қысқаша аңдатпа (Excerpt)</label>
                <input
                  type="text"
                  required
                  value={newsForm.excerpt}
                  onChange={(e) => setNewsForm({ ...newsForm, excerpt: e.target.value })}
                  className="w-full px-3 py-2 rounded-xl bg-slate-50 border border-slate-200 text-slate-900 focus:bg-white focus:border-[#00afca] focus:ring-1 focus:ring-[#00afca] text-xs"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">Мақала мәтіні</label>
                <textarea
                  rows={4}
                  required
                  value={newsForm.contentKk}
                  onChange={(e) => setNewsForm({ ...newsForm, contentKk: e.target.value })}
                  className="w-full px-3 py-2 rounded-xl bg-slate-50 border border-slate-200 text-slate-900 focus:bg-white focus:border-[#00afca] focus:ring-1 focus:ring-[#00afca] text-xs"
                />
              </div>

              <div className="pt-2 flex justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setShowAddNews(false)}
                  className="px-4 py-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-bold border border-slate-200 transition-colors"
                >
                  Болдырмау
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 rounded-xl bg-[#00afca] hover:bg-[#0099b0] text-white text-xs font-bold shadow-sm shadow-[#00afca]/25 transition-all"
                >
                  Жариялау ✓
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
            className="bg-white border border-slate-200 rounded-3xl p-6 sm:p-8 max-w-lg w-full shadow-2xl space-y-4 text-slate-800 max-h-[90vh] overflow-y-auto"
            onClick={(e) => e.stopPropagation()}
          >
            <h3 className="font-bold text-lg text-slate-900">Жаңа сауалнама ашу</h3>
            <form onSubmit={handleCreatePoll} className="space-y-3">
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  Сауалнама сұрағы (Қазақша)
                </label>
                <input
                  type="text"
                  required
                  value={pollForm.questionKk}
                  onChange={(e) => setPollForm({ ...pollForm, questionKk: e.target.value })}
                  className="w-full px-3 py-2 rounded-xl bg-slate-50 border border-slate-200 text-slate-900 focus:bg-white focus:border-[#00afca] focus:ring-1 focus:ring-[#00afca] text-xs"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  1-нұсқа (Қазақша)
                </label>
                <input
                  type="text"
                  required
                  value={pollForm.option1Kk}
                  onChange={(e) => setPollForm({ ...pollForm, option1Kk: e.target.value })}
                  className="w-full px-3 py-2 rounded-xl bg-slate-50 border border-slate-200 text-slate-900 focus:bg-white focus:border-[#00afca] focus:ring-1 focus:ring-[#00afca] text-xs"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  2-нұсқа (Қазақша)
                </label>
                <input
                  type="text"
                  required
                  value={pollForm.option2Kk}
                  onChange={(e) => setPollForm({ ...pollForm, option2Kk: e.target.value })}
                  className="w-full px-3 py-2 rounded-xl bg-slate-50 border border-slate-200 text-slate-900 focus:bg-white focus:border-[#00afca] focus:ring-1 focus:ring-[#00afca] text-xs"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  3-нұсқа (міндетті емес)
                </label>
                <input
                  type="text"
                  value={pollForm.option3Kk}
                  onChange={(e) => setPollForm({ ...pollForm, option3Kk: e.target.value })}
                  className="w-full px-3 py-2 rounded-xl bg-slate-50 border border-slate-200 text-slate-900 focus:bg-white focus:border-[#00afca] focus:ring-1 focus:ring-[#00afca] text-xs"
                />
              </div>

              <div className="pt-2 flex justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setShowAddPoll(false)}
                  className="px-4 py-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-bold border border-slate-200 transition-colors"
                >
                  Болдырмау
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 rounded-xl bg-[#00afca] hover:bg-[#0099b0] text-white text-xs font-bold shadow-sm shadow-[#00afca]/25 transition-all"
                >
                  Ашу ✓
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
            className="bg-white border border-slate-200 rounded-3xl p-6 sm:p-8 max-w-lg w-full shadow-2xl space-y-4 text-slate-800 max-h-[90vh] overflow-y-auto"
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
                  className="w-full px-3 py-2 rounded-xl bg-slate-50 border border-slate-200 text-slate-900 focus:bg-white focus:border-[#00afca] focus:ring-1 focus:ring-[#00afca] text-xs"
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
                    className="w-full px-3 py-2 rounded-xl bg-slate-50 border border-slate-200 text-slate-900 focus:bg-white focus:border-[#00afca] focus:ring-1 focus:ring-[#00afca] text-xs"
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
                    className="w-full px-3 py-2 rounded-xl bg-slate-50 border border-slate-200 text-slate-900 focus:bg-white focus:border-[#00afca] focus:ring-1 focus:ring-[#00afca] text-xs"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">Сипаттамасы</label>
                <textarea
                  rows={2}
                  value={timelineForm.descKk}
                  onChange={(e) => setTimelineForm({ ...timelineForm, descKk: e.target.value })}
                  className="w-full px-3 py-2 rounded-xl bg-slate-50 border border-slate-200 text-slate-900 focus:bg-white focus:border-[#00afca] focus:ring-1 focus:ring-[#00afca] text-xs"
                />
              </div>

              <div className="pt-2 flex justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setShowAddTimeline(false)}
                  className="px-4 py-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-bold border border-slate-200 transition-colors"
                >
                  Болдырмау
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 rounded-xl bg-[#00afca] hover:bg-[#0099b0] text-white text-xs font-bold shadow-sm shadow-[#00afca]/25 transition-all"
                >
                  Қосу ✓
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
