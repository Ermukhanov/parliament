'use client';

import { useState, useEffect, useCallback } from 'react';
import Link from 'next/link';
import SchoolLogo from '@/components/SchoolLogo';

type Tab =
  | 'dashboard'
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
  date: string;
  location: string;
  maxSeats: number;
  registrations?: AdminRegistration[];
}

interface AdminTimelineItem {
  id: string;
  titleRu: string;
  titleKk: string;
  descRu: string;
  descKk: string;
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
}

interface AdminPollOption {
  id: string;
  textRu: string;
  textKk: string;
  _count?: { votes: number };
}

interface AdminPoll {
  id: string;
  questionRu: string;
  questionKk: string;
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
}

interface AdminSuggestion {
  id: string;
  author: string;
  text: string;
  status: string;
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
  const [loginInput, setLoginInput] = useState('president');
  const [password, setPassword] = useState('');
  const [currentRoleLabel, setCurrentRoleLabel] = useState('Мектеп Президенті');
  const [currentLogin, setCurrentLogin] = useState('president');
  const [hasFullAccess, setHasFullAccess] = useState(true);
  const [loginError, setLoginError] = useState('');
  const [activeTab, setActiveTab] = useState<Tab>('ministers');

  // Data states
  const [members, setMembers] = useState<MinisterItem[]>([]);
  const [events, setEvents] = useState<AdminEvent[]>([]);
  const [timeline, setTimeline] = useState<AdminTimelineItem[]>([]);
  const [news, setNews] = useState<AdminNews[]>([]);
  const [polls, setPolls] = useState<AdminPoll[]>([]);
  const [appeals, setAppeals] = useState<AdminAppeal[]>([]);
  const [suggestions, setSuggestions] = useState<AdminSuggestion[]>([]);
  const [stats, setStats] = useState<AdminStat[]>([]);

  // Editing minister modal state
  const [editingMinister, setEditingMinister] = useState<MinisterItem | null>(null);
  const [editingAssistants, setEditingAssistants] = useState<AssistantEntry[]>([]);
  const [saveMessage, setSaveMessage] = useState('');

  // New minister form
  const [showAddMinister, setShowAddMinister] = useState(false);
  const [newMinister, setNewMinister] = useState({
    login: '',
    password: 'parliament2025',
    ministry: 'general',
    ministryNameRu: '',
    ministryNameKk: '',
    nameRu: '',
    nameKk: '',
    grade: '',
    roleRu: '',
    roleKk: '',
    quoteRu: '',
    quoteKk: '',
    bioRu: '',
    bioKk: '',
    photo: '',
    order: 10,
  });

  // New event form
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

  // New timeline item form
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

  // New news form
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

  // New poll form
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
  const [appealMinistryFilter, setAppealMinistryFilter] = useState('all');

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
          if (!fullAccess) {
            setActiveTab('ministers');
          }
          const myMember = memList.find((m) => m.login === memData.currentUser.login);
          if (myMember) {
            setCurrentRoleLabel(
              `${myMember.ministryNameKk || myMember.ministryNameRu} (${myMember.nameKk || myMember.nameRu})`
            );
          } else if (memData.currentUser.login === 'admin') {
            setCurrentRoleLabel('Мектеп Президенті • Толық рұқсат');
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
      // ignore initial error
    }
  }, []);

  useEffect(() => {
    fetchAllData();
  }, [fetchAllData]);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoginError('');
    const res = await fetch('/api/admin/login', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ login: loginInput, password }),
    });

    const data = await res.json();
    if (res.ok) {
      setAuthenticated(true);
      if (data.role) setCurrentRoleLabel(data.role);
      if (data.login) setCurrentLogin(data.login);
      setHasFullAccess(Boolean(data.hasFullAccess));
      setActiveTab('ministers');
      fetchAllData();
    } else {
      setLoginError(data.error || 'Неверный логин или пароль');
    }
  };

  const handleLogout = async () => {
    await fetch('/api/admin/logout', { method: 'POST' });
    setAuthenticated(false);
    setMembers([]);
    setActiveTab('ministers');
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
      setSaveMessage('Данные фракции и помощников успешно сохранены!');
      setEditingMinister(null);
      fetchAllData();
    }
  };

  const handleCreateMinister = async (e: React.FormEvent) => {
    e.preventDefault();
    const res = await fetch('/api/admin/members', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        ...newMinister,
        order: Number(newMinister.order),
      }),
    });

    if (res.ok) {
      setShowAddMinister(false);
      setNewMinister({
        login: '',
        password: 'parliament2025',
        ministry: 'general',
        ministryNameRu: '',
        ministryNameKk: '',
        nameRu: '',
        nameKk: '',
        grade: '',
        roleRu: '',
        roleKk: '',
        quoteRu: '',
        quoteKk: '',
        bioRu: '',
        bioKk: '',
        photo: '',
        order: members.length + 1,
      });
      fetchAllData();
    }
  };

  const handleDeleteMinister = async (id: string) => {
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
        maxSeats: Number(eventForm.maxSeats),
      }),
    });
    if (res.ok) {
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

  const handleDeleteEvent = async (id: string) => {
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
      setTimelineForm({
        titleRu: '',
        titleKk: '',
        descRu: '',
        descKk: '',
        ministry: 'general',
        month: 9,
        year: 2025,
        order: timeline.length + 1,
      });
      fetchAllData();
    }
  };

  const handleDeleteTimeline = async (id: string) => {
    await fetch(`/api/admin/timeline?id=${id}`, { method: 'DELETE' });
    fetchAllData();
  };

  const handleCreateNews = async (e: React.FormEvent) => {
    e.preventDefault();
    const res = await fetch('/api/admin/news', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(newsForm),
    });
    if (res.ok) {
      setNewsForm({
        slug: '',
        titleRu: '',
        titleKk: '',
        contentRu: '',
        contentKk: '',
        excerpt: '',
        ministry: 'press',
        published: true,
      });
      fetchAllData();
    }
  };

  const handleDeleteNews = async (id: string) => {
    await fetch(`/api/admin/news?id=${id}`, { method: 'DELETE' });
    fetchAllData();
  };

  const handleCreatePoll = async (e: React.FormEvent) => {
    e.preventDefault();
    const options = [
      { textRu: pollForm.option1Ru, textKk: pollForm.option1Kk || pollForm.option1Ru },
      { textRu: pollForm.option2Ru, textKk: pollForm.option2Kk || pollForm.option2Ru },
    ];
    if (pollForm.option3Ru.trim()) {
      options.push({
        textRu: pollForm.option3Ru,
        textKk: pollForm.option3Kk || pollForm.option3Ru,
      });
    }

    const res = await fetch('/api/admin/polls', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        questionRu: pollForm.questionRu,
        questionKk: pollForm.questionKk || pollForm.questionRu,
        active: true,
        options,
      }),
    });

    if (res.ok) {
      setPollForm({
        questionRu: '',
        questionKk: '',
        option1Ru: '',
        option1Kk: '',
        option2Ru: '',
        option2Kk: '',
        option3Ru: '',
        option3Kk: '',
      });
      fetchAllData();
    }
  };

  const handleDeletePoll = async (id: string) => {
    await fetch(`/api/admin/polls?id=${id}`, { method: 'DELETE' });
    fetchAllData();
  };

  const handleAppealStatus = async (id: string, status: string) => {
    await fetch('/api/admin/appeals', {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ id, status }),
    });
    fetchAllData();
  };

  const handleSuggestionStatus = async (id: string, status: string) => {
    await fetch('/api/admin/suggestions', {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ id, status }),
    });
    fetchAllData();
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
    const header = 'Имя,Класс,Телефон,Дата записи\n';
    const rows = regs
      .map(
        (r) =>
          `"${r.name}","${r.grade}","${r.phone || ''}","${new Date(r.createdAt).toLocaleString('ru-RU')}"`
      )
      .join('\n');
    const blob = new Blob(['\uFEFF' + header + rows], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `registrations-${eventTitle}.csv`;
    a.click();
  };

  const leadershipLoginOptions = [
    { login: 'president', label: '👑 Мектеп Президенті — Хупырұлы Разызаман (Толық рұқсат)' },
    { login: 'vice', label: '👑 Вице-президент — Асанова Жансая (Толық рұқсат)' },
  ];

  const factionLoginOptions = [
    { login: 'it', label: '1. 👑 IT және цифрландыру фракциясы — Ермуханов Мернар (Толық рұқсат)' },
    { login: 'media', label: '2. 🔒 Медиа фракциясы — Асанов Тайыр (Тек өз фракциясы)' },
    { login: 'volunteers', label: '3. 🔒 Еріктілер және қайырымдылық фракциясы — Әлібек Айымжан (Тек өз фракциясы)' },
    { login: 'culture', label: '4. 🔒 Мәдениет және өнер фракциясы — Мусағали Айжан (Тек өз фракциясы)' },
    { login: 'sport', label: '5. 🔒 Спорт фракциясы — Нұрлан Мейірбек (Тек өз фракциясы)' },
    { login: 'discipline', label: '6. 🔒 Құқық және тәртіп фракциясы — Сәндібаев Едіге (Тек өз фракциясы)' },
    { login: 'education', label: '7. 🔒 Білім фракциясы — Жансерік Нұрсүгір (Тек өз фракциясы)' },
  ];

  if (!authenticated) {
    return (
      <div className="min-h-screen bg-[#ffffff] flex items-center justify-center p-4">
        <div className="bg-[#ffffff] border-2 border-[#00afca] rounded-2xl p-8 max-w-md w-full shadow-lg">
          <div className="text-center mb-6">
            <div className="flex justify-center mb-4">
              <SchoolLogo className="w-16 h-16" variant="blue-on-white" />
            </div>
            <h1 className="font-serif text-3xl font-bold text-[#00afca]">
              Мектеп Президенті
            </h1>
            <p className="text-xs text-[#00afca] mt-1 font-semibold">
              Президент, Вице-президент және 7 фракция министрлерінің панелі
            </p>
          </div>

          <form onSubmit={handleLogin} className="space-y-4">
            <div>
              <label className="block text-xs uppercase tracking-wider text-[#00afca] mb-1.5 font-bold">
                Лауазымды немесе фракцияны таңдаңыз (7 фракция)
              </label>
              <select
                value={loginInput}
                onChange={(e) => setLoginInput(e.target.value)}
                className="form-input font-semibold"
              >
                <optgroup label="Басшылық (Толық рұқсат)">
                  {leadershipLoginOptions.map((opt) => (
                    <option key={opt.login} value={opt.login}>
                      {opt.label}
                    </option>
                  ))}
                </optgroup>
                <optgroup label="7 Фракция министрлері">
                  {factionLoginOptions.map((opt) => (
                    <option key={opt.login} value={opt.login}>
                      {opt.label}
                    </option>
                  ))}
                </optgroup>
              </select>
            </div>

            <div>
              <label className="block text-xs uppercase tracking-wider text-[#00afca] mb-1.5 font-bold">
                Құпиясөз / Пароль (parliament2025)
              </label>
              <input
                type="password"
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Құпиясөзді енгізіңіз..."
                className="form-input"
              />
            </div>

            {loginError && (
              <div className="p-3 rounded-xl border-2 border-[#00afca] text-xs font-bold text-[#00afca]">
                {loginError}
              </div>
            )}

            <button type="submit" className="w-full btn-blue py-3 text-sm uppercase tracking-wider">
              Панельге кіру
            </button>
          </form>

          <div className="mt-6 text-center">
            <Link href="/kk" className="text-xs font-bold text-[#00afca] underline">
              ← Мектеп сайтына оралу
            </Link>
          </div>
        </div>
      </div>
    );
  }

  const leadershipMembers = members.filter(
    (m) => m.login === 'president' || m.login === 'vice'
  );
  const factionMembers = members.filter(
    (m) => m.login !== 'president' && m.login !== 'vice'
  );
  const myOwnFaction = members.filter((m) => m.login === currentLogin);

  const tabs: { key: Tab; label: string }[] = hasFullAccess
    ? [
        { key: 'ministers', label: `7 Фракция және Басшылық (${factionMembers.length} фракция)` },
        { key: 'events', label: `Іс-шаралар (${events.length})` },
        { key: 'timeline', label: `Жылдық жоспар (${timeline.length})` },
        { key: 'news', label: `Жаңалықтар (${news.length})` },
        { key: 'polls', label: `Дауыс беру (${polls.length})` },
        { key: 'appeals', label: `Өтініштер (${appeals.length})` },
        { key: 'suggestions', label: `Идеялар (${suggestions.length})` },
        { key: 'stats', label: 'Көрсеткіштер' },
        { key: 'dashboard', label: 'Жалпы есеп' },
      ]
    : [{ key: 'ministers', label: 'Менің фракциям' }];

  const filteredAppeals = !hasFullAccess
    ? appeals
    : appealMinistryFilter === 'all'
      ? appeals
      : appeals.filter((a) => a.ministry === appealMinistryFilter);

  const renderMemberCard = (m: MinisterItem, indexLabel?: string) => {
    let parsedAssistants: AssistantEntry[] = [];
    try {
      parsedAssistants = m.assistants ? JSON.parse(m.assistants) : [];
    } catch {
      parsedAssistants = [];
    }
    const isLeader = m.login === 'president' || m.login === 'vice';

    return (
      <div
        key={m.id}
        className="rounded-2xl border-2 border-[#00afca] p-6 bg-[#ffffff] flex flex-col justify-between"
      >
        <div>
          <div className="flex items-start justify-between gap-3 pb-3 mb-3 border-b border-[#00afca]">
            <div>
              <div className="text-xs font-bold uppercase tracking-wider text-[#00afca]">
                {indexLabel ? `${indexLabel} • ` : ''}
                {m.ministryNameKk || m.ministryNameRu}
              </div>
              <h3 className="font-serif text-xl font-bold text-[#00afca]">
                {m.roleKk || m.roleRu}
              </h3>
            </div>
            <span className="px-3 py-1 rounded-full bg-[#00afca] text-[#ffffff] text-xs font-bold shrink-0">
              {isLeader ? '👑 Басшылық' : `Фракция: ${m.login}`}
            </span>
          </div>

          <div className="space-y-2 text-sm text-[#00afca] mb-4">
            <div>
              <span className="font-bold">
                {isLeader ? 'Тұлға: ' : 'Фракция министрі: '}
              </span>
              {m.nameKk || m.nameRu ? (
                <span className="font-semibold">
                  {m.nameKk || m.nameRu} {m.grade ? `(${m.grade})` : ''}
                </span>
              ) : (
                <span className="underline">Тағайындалмаған</span>
              )}
            </div>

            {!isLeader && (
              <div>
                <div className="font-bold mb-1">
                  Фракция көмекшілері ({parsedAssistants.length}):
                </div>
                {parsedAssistants.length > 0 ? (
                  <div className="flex flex-wrap gap-1.5">
                    {parsedAssistants.map((ast, idx) => (
                      <span
                        key={idx}
                        className="px-2.5 py-1 rounded-lg border border-[#00afca] text-xs font-semibold"
                      >
                        {idx + 1}. {ast.name} {ast.grade ? `(${ast.grade})` : ''}
                      </span>
                    ))}
                  </div>
                ) : (
                  <span className="text-xs">Көмекшілер қосылмаған</span>
                )}
              </div>
            )}

            <p className="text-xs pt-1">{m.bioKk || m.bioRu}</p>
          </div>
        </div>

        <div className="flex items-center gap-3 pt-3 border-t border-[#00afca]">
          <button
            onClick={() => openEditMinister(m)}
            className="flex-1 py-2 px-4 rounded-full bg-[#00afca] text-[#ffffff] border-2 border-[#00afca] hover:bg-[#ffffff] hover:text-[#00afca] text-xs font-bold uppercase tracking-wider transition-colors"
          >
            {isLeader ? 'Мәліметтерді өзгерту' : 'Фракция мен көмекшілерді өзгерту'}
          </button>
          {hasFullAccess && !isLeader && (
            <button
              onClick={() => handleDeleteMinister(m.id)}
              className="py-2 px-4 rounded-full bg-[#ffffff] text-[#00afca] border-2 border-[#00afca] hover:bg-[#00afca] hover:text-[#ffffff] text-xs font-bold uppercase tracking-wider transition-colors"
            >
              Жою
            </button>
          )}
        </div>
      </div>
    );
  };

  return (
    <div className="min-h-screen bg-[#ffffff] text-[#00afca]">
      {/* Top Admin Header */}
      <header className="border-b-2 border-[#00afca] bg-[#ffffff] sticky top-0 z-30">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-3.5 flex flex-wrap items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <SchoolLogo className="w-10 h-10 shrink-0" variant="blue-on-white" />
            <div>
              <div className="font-serif font-bold text-lg text-[#00afca] flex flex-wrap items-center gap-2">
                <span>Мектеп Президенті • Басқару панелі</span>
                <span className="px-2.5 py-0.5 rounded-full bg-[#00afca] text-[#ffffff] font-sans text-[11px] font-bold">
                  {hasFullAccess
                    ? '👑 Толық рұқсат (Президент / Вице-президент / IT)'
                    : '🔒 Тек өз фракциясы'}
                </span>
              </div>
              <div className="text-xs font-bold text-[#00afca]">
                Белсенді профиль: {currentRoleLabel}
              </div>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <Link
              href="/kk"
              className="text-xs font-bold px-4 py-2 rounded-full border-2 border-[#00afca] text-[#00afca] hover:bg-[#00afca] hover:text-[#ffffff] transition-colors"
            >
              Сайтқа өту →
            </Link>
            <button
              onClick={handleLogout}
              className="text-xs px-4 py-2 rounded-full bg-[#00afca] text-[#ffffff] border-2 border-[#00afca] hover:bg-[#ffffff] hover:text-[#00afca] transition-colors font-bold"
            >
              Шығу
            </button>
          </div>
        </div>
      </header>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Tabs Navigation */}
        {hasFullAccess && (
          <div className="flex flex-wrap gap-2 mb-8">
            {tabs.map((t) => (
              <button
                key={t.key}
                onClick={() => setActiveTab(t.key)}
                className={`px-4 py-2.5 rounded-full text-xs font-bold uppercase tracking-wider transition-colors border-2 border-[#00afca] ${
                  activeTab === t.key
                    ? 'bg-[#00afca] text-[#ffffff]'
                    : 'bg-[#ffffff] text-[#00afca] hover:bg-[#00afca] hover:text-[#ffffff]'
                }`}
              >
                {t.label}
              </button>
            ))}
          </div>
        )}

        {/* MINISTERS DATABASE TAB */}
        {(activeTab === 'ministers' || !hasFullAccess) && (
          <div className="space-y-6">
            <div className="flex flex-wrap items-center justify-between gap-4 border-2 border-[#00afca] rounded-2xl p-6 bg-[#ffffff]">
              <div>
                <h2 className="font-serif text-2xl font-bold text-[#00afca]">
                  {hasFullAccess
                    ? `Президент, Вице-президент және ${factionMembers.length} Фракция (Толық басқару)`
                    : 'Менің фракциям'}
                </h2>
                <p className="text-xs sm:text-sm text-[#00afca] mt-1">
                  {hasFullAccess
                    ? 'Президент, Вице-президент және IT министрі барлық 7 фракцияны, министрлерді және олардың көмекшілерін толық басқара алады.'
                    : 'Сізге тек өз фракцияңыз ғана көрінеді. Осы жерден өз фракцияңыздың ақпаратын және көмекшілерін өзгерте аласыз.'}
                </p>
              </div>
              {hasFullAccess && (
                <button
                  onClick={() => setShowAddMinister(!showAddMinister)}
                  className="btn-blue text-xs uppercase tracking-wider"
                >
                  {showAddMinister ? 'Форманы жабу' : '+ Жаңа фракция қосу'}
                </button>
              )}
            </div>

            {saveMessage && (
              <div className="p-4 rounded-xl border-2 border-[#00afca] bg-[#ffffff] text-xs font-bold text-[#00afca]">
                {saveMessage}
              </div>
            )}

            {/* Add New Minister Form */}
            {hasFullAccess && showAddMinister && (
              <form
                onSubmit={handleCreateMinister}
                className="border-2 border-[#00afca] rounded-2xl p-6 bg-[#ffffff] space-y-4"
              >
                <h3 className="font-serif text-xl font-bold text-[#00afca]">
                  Жаңа Фракция қосу
                </h3>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                  <input
                    required
                    placeholder="Логин для входа (напр. media)"
                    value={newMinister.login}
                    onChange={(e) => setNewMinister({ ...newMinister, login: e.target.value })}
                    className="form-input"
                  />
                  <input
                    required
                    placeholder="Пароль входа"
                    value={newMinister.password}
                    onChange={(e) => setNewMinister({ ...newMinister, password: e.target.value })}
                    className="form-input"
                  />
                  <input
                    placeholder="Код министерства (напр. media)"
                    value={newMinister.ministry}
                    onChange={(e) => setNewMinister({ ...newMinister, ministry: e.target.value })}
                    className="form-input"
                  />
                  <input
                    required
                    placeholder="Название министерства (EN)"
                    value={newMinister.ministryNameRu}
                    onChange={(e) =>
                      setNewMinister({ ...newMinister, ministryNameRu: e.target.value })
                    }
                    className="form-input"
                  />
                  <input
                    required
                    placeholder="Фракция атауы (KK)"
                    value={newMinister.ministryNameKk}
                    onChange={(e) =>
                      setNewMinister({ ...newMinister, ministryNameKk: e.target.value })
                    }
                    className="form-input"
                  />
                  <input
                    placeholder="Сыныбы (мыс. 10 «А»)"
                    value={newMinister.grade}
                    onChange={(e) => setNewMinister({ ...newMinister, grade: e.target.value })}
                    className="form-input"
                  />
                  <input
                    placeholder="Министр аты-жөні (EN)"
                    value={newMinister.nameRu}
                    onChange={(e) => setNewMinister({ ...newMinister, nameRu: e.target.value })}
                    className="form-input"
                  />
                  <input
                    placeholder="Министр аты-жөні (KK)"
                    value={newMinister.nameKk}
                    onChange={(e) => setNewMinister({ ...newMinister, nameKk: e.target.value })}
                    className="form-input"
                  />
                  <input
                    type="number"
                    placeholder="Реттік нөмірі"
                    value={newMinister.order}
                    onChange={(e) =>
                      setNewMinister({ ...newMinister, order: Number(e.target.value) })
                    }
                    className="form-input"
                  />
                  <input
                    required
                    placeholder="Лауазымы (EN)"
                    value={newMinister.roleRu}
                    onChange={(e) => setNewMinister({ ...newMinister, roleRu: e.target.value })}
                    className="form-input"
                  />
                  <input
                    required
                    placeholder="Лауазымы (KK)"
                    value={newMinister.roleKk}
                    onChange={(e) => setNewMinister({ ...newMinister, roleKk: e.target.value })}
                    className="form-input"
                  />
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <textarea
                    rows={2}
                    placeholder="Фракция міндеттері (EN)"
                    value={newMinister.bioRu}
                    onChange={(e) => setNewMinister({ ...newMinister, bioRu: e.target.value })}
                    className="form-input"
                  />
                  <textarea
                    rows={2}
                    placeholder="Фракция міндеттері (KK)"
                    value={newMinister.bioKk}
                    onChange={(e) => setNewMinister({ ...newMinister, bioKk: e.target.value })}
                    className="form-input"
                  />
                </div>
                <button type="submit" className="btn-blue text-xs uppercase tracking-wider">
                  Фракцияны сақтау
                </button>
              </form>
            )}

            {hasFullAccess ? (
              <div className="space-y-8">
                {/* Leadership Section (President & Vice-President) */}
                {leadershipMembers.length > 0 && (
                  <div className="space-y-3">
                    <h3 className="font-serif text-lg font-bold uppercase tracking-wider text-[#00afca]">
                      👑 Басшылық — Президент және Вице-президент ({leadershipMembers.length})
                    </h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                      {leadershipMembers.map((m) => renderMemberCard(m))}
                    </div>
                  </div>
                )}

                {/* 7 Factions Section */}
                <div className="space-y-3">
                  <h3 className="font-serif text-lg font-bold uppercase tracking-wider text-[#00afca]">
                    🏛 Барлық Фракциялар ({factionMembers.length} фракция)
                  </h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                    {factionMembers.map((m, idx) =>
                      renderMemberCard(m, `${idx + 1}-фракция`)
                    )}
                  </div>
                </div>
              </div>
            ) : (
              /* Single Faction View for Regular Ministers */
              <div className="max-w-2xl">
                {myOwnFaction.map((m) => renderMemberCard(m))}
              </div>
            )}
          </div>
        )}

        {/* EDIT MINISTER MODAL */}
        {editingMinister && (
          <div
            className="fixed inset-0 z-50 flex items-center justify-center p-4 modal-backdrop"
            onClick={() => setEditingMinister(null)}
          >
            <div
              onClick={(e) => e.stopPropagation()}
              className="bg-[#ffffff] border-2 border-[#00afca] rounded-2xl p-6 sm:p-8 max-w-2xl w-full max-h-[90vh] overflow-y-auto relative"
            >
              <button
                onClick={() => setEditingMinister(null)}
                className="absolute top-4 right-4 w-8 h-8 rounded-full border-2 border-[#00afca] text-[#00afca] hover:bg-[#00afca] hover:text-[#ffffff] font-bold"
              >
                ✕
              </button>

              <h3 className="font-serif text-2xl font-bold text-[#00afca] mb-4">
                Өзгерту: {editingMinister.ministryNameKk || editingMinister.roleRu}
              </h3>

              <form onSubmit={handleSaveMinister} className="space-y-4">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-bold uppercase mb-1">
                      Министр аты-жөні (KK)
                    </label>
                    <input
                      value={editingMinister.nameKk}
                      onChange={(e) =>
                        setEditingMinister({ ...editingMinister, nameKk: e.target.value })
                      }
                      placeholder="Оқушының аты-жөні"
                      className="form-input"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-bold uppercase mb-1">
                      Министр аты-жөні (EN / RU)
                    </label>
                    <input
                      value={editingMinister.nameRu}
                      onChange={(e) =>
                        setEditingMinister({ ...editingMinister, nameRu: e.target.value })
                      }
                      placeholder="Аты-жөні"
                      className="form-input"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-bold uppercase mb-1">Сыныбы</label>
                    <input
                      value={editingMinister.grade || ''}
                      onChange={(e) =>
                        setEditingMinister({ ...editingMinister, grade: e.target.value })
                      }
                      placeholder="Мысалы: 10 «А»"
                      className="form-input"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-bold uppercase mb-1">
                      Фото сілтемесі (міндетті емес)
                    </label>
                    <input
                      value={editingMinister.photo || ''}
                      onChange={(e) =>
                        setEditingMinister({ ...editingMinister, photo: e.target.value })
                      }
                      placeholder="https://..."
                      className="form-input"
                    />
                  </div>
                  {hasFullAccess && (
                    <div>
                      <label className="block text-xs font-bold uppercase mb-1">
                        Кіру логині
                      </label>
                      <input
                        required
                        value={editingMinister.login}
                        onChange={(e) =>
                          setEditingMinister({ ...editingMinister, login: e.target.value })
                        }
                        className="form-input"
                      />
                    </div>
                  )}
                  <div>
                    <label className="block text-xs font-bold uppercase mb-1">
                      Кабинет құпиясөзі (Пароль)
                    </label>
                    <input
                      required
                      value={editingMinister.password || ''}
                      onChange={(e) =>
                        setEditingMinister({ ...editingMinister, password: e.target.value })
                      }
                      className="form-input"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-bold uppercase mb-1">
                      Фракция атауы (KK)
                    </label>
                    <input
                      required
                      value={editingMinister.ministryNameKk}
                      onChange={(e) =>
                        setEditingMinister({ ...editingMinister, ministryNameKk: e.target.value })
                      }
                      className="form-input"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-bold uppercase mb-1">
                      Фракция атауы (EN)
                    </label>
                    <input
                      required
                      value={editingMinister.ministryNameRu}
                      onChange={(e) =>
                        setEditingMinister({ ...editingMinister, ministryNameRu: e.target.value })
                      }
                      className="form-input"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-bold uppercase mb-1">
                      Лауазымы (KK)
                    </label>
                    <input
                      required
                      value={editingMinister.roleKk}
                      onChange={(e) =>
                        setEditingMinister({ ...editingMinister, roleKk: e.target.value })
                      }
                      className="form-input"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-bold uppercase mb-1">
                      Лауазымы (EN)
                    </label>
                    <input
                      required
                      value={editingMinister.roleRu}
                      onChange={(e) =>
                        setEditingMinister({ ...editingMinister, roleRu: e.target.value })
                      }
                      className="form-input"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-bold uppercase mb-1">
                      Ұраны / Дәйексөз (KK)
                    </label>
                    <input
                      value={editingMinister.quoteKk}
                      onChange={(e) =>
                        setEditingMinister({ ...editingMinister, quoteKk: e.target.value })
                      }
                      className="form-input"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-bold uppercase mb-1">
                      Ұраны / Дәйексөз (EN)
                    </label>
                    <input
                      value={editingMinister.quoteRu}
                      onChange={(e) =>
                        setEditingMinister({ ...editingMinister, quoteRu: e.target.value })
                      }
                      className="form-input"
                    />
                  </div>
                </div>

                {/* ASSISTANTS EDITOR */}
                <div className="border-2 border-[#00afca] rounded-xl p-4 space-y-3 bg-[#00afca]/[0.03]">
                  <div className="flex items-center justify-between">
                    <label className="block text-xs font-bold uppercase text-[#00afca]">
                      Фракция көмекшілері ({editingAssistants.length})
                    </label>
                    <button
                      type="button"
                      onClick={() =>
                        setEditingAssistants([...editingAssistants, { name: '', grade: '' }])
                      }
                      className="px-3 py-1 rounded-full bg-[#00afca] text-[#ffffff] text-xs font-bold"
                    >
                      + Көмекші қосу
                    </button>
                  </div>
                  {editingAssistants.length === 0 ? (
                    <p className="text-xs text-[#00afca]">Көмекшілер тізімі бос</p>
                  ) : (
                    <div className="space-y-2">
                      {editingAssistants.map((ast, idx) => (
                        <div key={idx} className="flex items-center gap-2">
                          <input
                            placeholder="Аты-жөні (мыс. Аленов Санжар)"
                            value={ast.name}
                            onChange={(e) => {
                              const copy = [...editingAssistants];
                              copy[idx] = { ...copy[idx], name: e.target.value };
                              setEditingAssistants(copy);
                            }}
                            className="form-input text-xs flex-1"
                          />
                          <input
                            placeholder="Сыныбы (10 «С»)"
                            value={ast.grade}
                            onChange={(e) => {
                              const copy = [...editingAssistants];
                              copy[idx] = { ...copy[idx], grade: e.target.value };
                              setEditingAssistants(copy);
                            }}
                            className="form-input text-xs w-32"
                          />
                          <button
                            type="button"
                            onClick={() =>
                              setEditingAssistants(editingAssistants.filter((_, i) => i !== idx))
                            }
                            className="w-8 h-8 rounded-full border-2 border-[#00afca] text-[#00afca] font-bold text-xs shrink-0"
                          >
                            ✕
                          </button>
                        </div>
                      ))}
                    </div>
                  )}
                </div>

                <div>
                  <label className="block text-xs font-bold uppercase mb-1">
                    Фракция міндеттері мен бағдарламасы (KK)
                  </label>
                  <textarea
                    rows={3}
                    value={editingMinister.bioKk}
                    onChange={(e) =>
                      setEditingMinister({ ...editingMinister, bioKk: e.target.value })
                    }
                    className="form-input"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold uppercase mb-1">
                    Фракция міндеттері мен бағдарламасы (EN)
                  </label>
                  <textarea
                    rows={3}
                    value={editingMinister.bioRu}
                    onChange={(e) =>
                      setEditingMinister({ ...editingMinister, bioRu: e.target.value })
                    }
                    className="form-input"
                  />
                </div>

                <div className="flex justify-end gap-3 pt-2">
                  <button
                    type="button"
                    onClick={() => setEditingMinister(null)}
                    className="px-6 py-2.5 rounded-full border-2 border-[#00afca] text-[#00afca] font-bold text-xs uppercase"
                  >
                    Болдырмау
                  </button>
                  <button type="submit" className="btn-blue text-xs uppercase">
                    Өзгерістерді сақтау
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}

        {/* EVENTS TAB */}
        {activeTab === 'events' && (
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
            <div className="lg:col-span-5 border-2 border-[#00afca] rounded-2xl p-6 bg-[#ffffff]">
              <h2 className="font-serif text-xl font-bold text-[#00afca] mb-4">
                Добавить мероприятие
              </h2>
              <form onSubmit={handleCreateEvent} className="space-y-3">
                <input
                  required
                  placeholder="Slug (например: school-forum)"
                  value={eventForm.slug}
                  onChange={(e) => setEventForm({ ...eventForm, slug: e.target.value })}
                  className="form-input text-sm"
                />
                <input
                  required
                  placeholder="Название (RU)"
                  value={eventForm.titleRu}
                  onChange={(e) => setEventForm({ ...eventForm, titleRu: e.target.value })}
                  className="form-input text-sm"
                />
                <input
                  required
                  placeholder="Название (KK)"
                  value={eventForm.titleKk}
                  onChange={(e) => setEventForm({ ...eventForm, titleKk: e.target.value })}
                  className="form-input text-sm"
                />
                <div className="grid grid-cols-2 gap-3">
                  <select
                    value={eventForm.category}
                    onChange={(e) => setEventForm({ ...eventForm, category: e.target.value })}
                    className="form-input text-sm"
                  >
                    <option value="Учёба">Учёба</option>
                    <option value="Культура">Культура</option>
                    <option value="Спорт">Спорт</option>
                    <option value="Благотворительность">Благотворительность</option>
                  </select>
                  <input
                    required
                    type="number"
                    placeholder="Макс. мест"
                    value={eventForm.maxSeats}
                    onChange={(e) =>
                      setEventForm({ ...eventForm, maxSeats: Number(e.target.value) })
                    }
                    className="form-input text-sm"
                  />
                </div>
                <input
                  required
                  type="datetime-local"
                  value={eventForm.date}
                  onChange={(e) => setEventForm({ ...eventForm, date: e.target.value })}
                  className="form-input text-sm"
                />
                <input
                  required
                  placeholder="Место проведения (напр. Актовый зал)"
                  value={eventForm.location}
                  onChange={(e) => setEventForm({ ...eventForm, location: e.target.value })}
                  className="form-input text-sm"
                />
                <textarea
                  required
                  rows={2}
                  placeholder="Описание (RU)"
                  value={eventForm.descRu}
                  onChange={(e) => setEventForm({ ...eventForm, descRu: e.target.value })}
                  className="form-input text-sm"
                />
                <textarea
                  required
                  rows={2}
                  placeholder="Описание (KK)"
                  value={eventForm.descKk}
                  onChange={(e) => setEventForm({ ...eventForm, descKk: e.target.value })}
                  className="form-input text-sm"
                />
                <button type="submit" className="w-full btn-blue py-2.5 text-xs uppercase">
                  Опубликовать мероприятие
                </button>
              </form>
            </div>

            <div className="lg:col-span-7 space-y-4">
              {events.length === 0 ? (
                <div className="border-2 border-[#00afca] rounded-2xl p-8 text-center">
                  <p className="font-bold text-[#00afca]">Мероприятий пока нет</p>
                </div>
              ) : (
                events.map((ev) => (
                  <div
                    key={ev.id}
                    className="border-2 border-[#00afca] rounded-2xl p-5 bg-[#ffffff] flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4"
                  >
                    <div>
                      <span className="text-xs font-bold uppercase text-[#00afca]">
                        {ev.category} • {new Date(ev.date).toLocaleDateString('ru-RU')}
                      </span>
                      <h3 className="font-serif text-lg font-bold text-[#00afca]">{ev.titleRu}</h3>
                      <div className="text-xs text-[#00afca] mt-1 font-semibold">
                        Записалось: {ev.registrations?.length || 0} / {ev.maxSeats}
                      </div>
                    </div>

                    <div className="flex flex-wrap items-center gap-2">
                      <button
                        onClick={() => {
                          setSelectedEventRegs(ev.registrations || []);
                          setSelectedEventTitle(ev.slug);
                        }}
                        className="text-xs px-3 py-1.5 rounded-full border-2 border-[#00afca] text-[#00afca] font-bold"
                      >
                        Список ({ev.registrations?.length || 0})
                      </button>
                      <button
                        onClick={() => exportCsv(ev.slug, ev.registrations || [])}
                        className="text-xs px-3 py-1.5 rounded-full bg-[#00afca] text-[#ffffff] font-bold"
                      >
                        CSV
                      </button>
                      <button
                        onClick={() => handleDeleteEvent(ev.id)}
                        className="text-xs px-3 py-1.5 rounded-full border-2 border-[#00afca] text-[#00afca] font-bold"
                      >
                        Удалить
                      </button>
                    </div>
                  </div>
                ))
              )}

              {selectedEventRegs && (
                <div className="border-2 border-[#00afca] rounded-2xl p-6 bg-[#ffffff]">
                  <div className="flex items-center justify-between mb-4">
                    <h4 className="font-serif text-lg font-bold text-[#00afca]">
                      Записавшиеся ученики ({selectedEventTitle})
                    </h4>
                    <button
                      onClick={() => setSelectedEventRegs(null)}
                      className="text-xs font-bold text-[#00afca]"
                    >
                      Закрыть ✕
                    </button>
                  </div>
                  {selectedEventRegs.length === 0 ? (
                    <p className="text-xs text-[#00afca]">Записей пока нет</p>
                  ) : (
                    <div className="space-y-2 max-h-60 overflow-y-auto">
                      {selectedEventRegs.map((r, i) => (
                        <div
                          key={i}
                          className="flex justify-between text-xs p-2.5 rounded-lg border border-[#00afca]"
                        >
                          <span className="font-bold text-[#00afca]">
                            {r.name} ({r.grade})
                          </span>
                          <span className="text-[#00afca]">{r.phone || '—'}</span>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              )}
            </div>
          </div>
        )}

        {/* TIMELINE TAB */}
        {activeTab === 'timeline' && (
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
            <div className="lg:col-span-5 border-2 border-[#00afca] rounded-2xl p-6 bg-[#ffffff]">
              <h2 className="font-serif text-xl font-bold text-[#00afca] mb-4">
                Добавить этап в План года
              </h2>
              <form onSubmit={handleCreateTimeline} className="space-y-3">
                <input
                  required
                  placeholder="Название этапа (RU)"
                  value={timelineForm.titleRu}
                  onChange={(e) => setTimelineForm({ ...timelineForm, titleRu: e.target.value })}
                  className="form-input text-sm"
                />
                <input
                  required
                  placeholder="Название этапа (KK)"
                  value={timelineForm.titleKk}
                  onChange={(e) => setTimelineForm({ ...timelineForm, titleKk: e.target.value })}
                  className="form-input text-sm"
                />
                <div className="grid grid-cols-3 gap-3">
                  <input
                    required
                    type="number"
                    min={1}
                    max={12}
                    placeholder="Месяц (1-12)"
                    value={timelineForm.month}
                    onChange={(e) =>
                      setTimelineForm({ ...timelineForm, month: Number(e.target.value) })
                    }
                    className="form-input text-sm"
                  />
                  <input
                    required
                    type="number"
                    placeholder="Год"
                    value={timelineForm.year}
                    onChange={(e) =>
                      setTimelineForm({ ...timelineForm, year: Number(e.target.value) })
                    }
                    className="form-input text-sm"
                  />
                  <input
                    required
                    type="number"
                    placeholder="Порядок"
                    value={timelineForm.order}
                    onChange={(e) =>
                      setTimelineForm({ ...timelineForm, order: Number(e.target.value) })
                    }
                    className="form-input text-sm"
                  />
                </div>
                <textarea
                  rows={2}
                  placeholder="Описание (RU)"
                  value={timelineForm.descRu}
                  onChange={(e) => setTimelineForm({ ...timelineForm, descRu: e.target.value })}
                  className="form-input text-sm"
                />
                <textarea
                  rows={2}
                  placeholder="Описание (KK)"
                  value={timelineForm.descKk}
                  onChange={(e) => setTimelineForm({ ...timelineForm, descKk: e.target.value })}
                  className="form-input text-sm"
                />
                <button type="submit" className="w-full btn-blue py-2.5 text-xs uppercase">
                  Добавить в План года
                </button>
              </form>
            </div>

            <div className="lg:col-span-7 space-y-4">
              {timeline.length === 0 ? (
                <div className="border-2 border-[#00afca] rounded-2xl p-8 text-center">
                  <p className="font-bold text-[#00afca]">Этапы годового плана пока не добавлены</p>
                </div>
              ) : (
                timeline.map((item) => (
                  <div
                    key={item.id}
                    className="border-2 border-[#00afca] rounded-2xl p-5 bg-[#ffffff] flex items-center justify-between gap-4"
                  >
                    <div>
                      <div className="text-xs font-bold uppercase text-[#00afca]">
                        Месяц: {item.month} / {item.year}
                      </div>
                      <h3 className="font-serif text-lg font-bold text-[#00afca]">
                        {item.titleRu}
                      </h3>
                      <p className="text-xs text-[#00afca] mt-1">{item.descRu}</p>
                    </div>
                    <button
                      onClick={() => handleDeleteTimeline(item.id)}
                      className="text-xs px-3 py-1.5 rounded-full border-2 border-[#00afca] text-[#00afca] font-bold"
                    >
                      Удалить
                    </button>
                  </div>
                ))
              )}
            </div>
          </div>
        )}

        {/* NEWS TAB */}
        {activeTab === 'news' && (
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
            <div className="lg:col-span-5 border-2 border-[#00afca] rounded-2xl p-6 bg-[#ffffff]">
              <h2 className="font-serif text-xl font-bold text-[#00afca] mb-4">
                Опубликовать новость
              </h2>
              <form onSubmit={handleCreateNews} className="space-y-3">
                <input
                  required
                  placeholder="Slug (например: parliament-meeting)"
                  value={newsForm.slug}
                  onChange={(e) => setNewsForm({ ...newsForm, slug: e.target.value })}
                  className="form-input text-sm"
                />
                <input
                  required
                  placeholder="Заголовок (RU)"
                  value={newsForm.titleRu}
                  onChange={(e) => setNewsForm({ ...newsForm, titleRu: e.target.value })}
                  className="form-input text-sm"
                />
                <input
                  required
                  placeholder="Заголовок (KK)"
                  value={newsForm.titleKk}
                  onChange={(e) => setNewsForm({ ...newsForm, titleKk: e.target.value })}
                  className="form-input text-sm"
                />
                <input
                  placeholder="Краткое описание (Excerpt)"
                  value={newsForm.excerpt}
                  onChange={(e) => setNewsForm({ ...newsForm, excerpt: e.target.value })}
                  className="form-input text-sm"
                />
                <textarea
                  required
                  rows={3}
                  placeholder="Текст статьи (RU)"
                  value={newsForm.contentRu}
                  onChange={(e) => setNewsForm({ ...newsForm, contentRu: e.target.value })}
                  className="form-input text-sm"
                />
                <textarea
                  required
                  rows={3}
                  placeholder="Текст статьи (KK)"
                  value={newsForm.contentKk}
                  onChange={(e) => setNewsForm({ ...newsForm, contentKk: e.target.value })}
                  className="form-input text-sm"
                />
                <button type="submit" className="w-full btn-blue py-2.5 text-xs uppercase">
                  Опубликовать
                </button>
              </form>
            </div>

            <div className="lg:col-span-7 space-y-4">
              {news.length === 0 ? (
                <div className="border-2 border-[#00afca] rounded-2xl p-8 text-center">
                  <p className="font-bold text-[#00afca]">Новостей пока нет</p>
                </div>
              ) : (
                news.map((n) => (
                  <div
                    key={n.id}
                    className="border-2 border-[#00afca] rounded-2xl p-5 bg-[#ffffff] flex items-center justify-between gap-4"
                  >
                    <div>
                      <h3 className="font-serif text-lg font-bold text-[#00afca]">{n.titleRu}</h3>
                      <p className="text-xs text-[#00afca] mt-1">{n.excerpt}</p>
                    </div>
                    <button
                      onClick={() => handleDeleteNews(n.id)}
                      className="text-xs px-3 py-1.5 rounded-full border-2 border-[#00afca] text-[#00afca] font-bold"
                    >
                      Удалить
                    </button>
                  </div>
                ))
              )}
            </div>
          </div>
        )}

        {/* POLLS TAB */}
        {activeTab === 'polls' && (
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
            <div className="lg:col-span-5 border-2 border-[#00afca] rounded-2xl p-6 bg-[#ffffff]">
              <h2 className="font-serif text-xl font-bold text-[#00afca] mb-4">
                Запустить общешкольное голосование
              </h2>
              <form onSubmit={handleCreatePoll} className="space-y-3">
                <input
                  required
                  placeholder="Вопрос голосования (RU)"
                  value={pollForm.questionRu}
                  onChange={(e) => setPollForm({ ...pollForm, questionRu: e.target.value })}
                  className="form-input text-sm"
                />
                <input
                  placeholder="Вопрос голосования (KK)"
                  value={pollForm.questionKk}
                  onChange={(e) => setPollForm({ ...pollForm, questionKk: e.target.value })}
                  className="form-input text-sm"
                />
                <input
                  required
                  placeholder="Вариант 1 (RU)"
                  value={pollForm.option1Ru}
                  onChange={(e) => setPollForm({ ...pollForm, option1Ru: e.target.value })}
                  className="form-input text-sm"
                />
                <input
                  placeholder="Вариант 1 (KK)"
                  value={pollForm.option1Kk}
                  onChange={(e) => setPollForm({ ...pollForm, option1Kk: e.target.value })}
                  className="form-input text-sm"
                />
                <input
                  required
                  placeholder="Вариант 2 (RU)"
                  value={pollForm.option2Ru}
                  onChange={(e) => setPollForm({ ...pollForm, option2Ru: e.target.value })}
                  className="form-input text-sm"
                />
                <input
                  placeholder="Вариант 2 (KK)"
                  value={pollForm.option2Kk}
                  onChange={(e) => setPollForm({ ...pollForm, option2Kk: e.target.value })}
                  className="form-input text-sm"
                />
                <input
                  placeholder="Вариант 3 (RU, необязательно)"
                  value={pollForm.option3Ru}
                  onChange={(e) => setPollForm({ ...pollForm, option3Ru: e.target.value })}
                  className="form-input text-sm"
                />
                <input
                  placeholder="Вариант 3 (KK, необязательно)"
                  value={pollForm.option3Kk}
                  onChange={(e) => setPollForm({ ...pollForm, option3Kk: e.target.value })}
                  className="form-input text-sm"
                />
                <button type="submit" className="w-full btn-blue py-2.5 text-xs uppercase">
                  Запустить голосование
                </button>
              </form>
            </div>

            <div className="lg:col-span-7 space-y-4">
              {polls.length === 0 ? (
                <div className="border-2 border-[#00afca] rounded-2xl p-8 text-center">
                  <p className="font-bold text-[#00afca]">Опросов пока нет</p>
                </div>
              ) : (
                polls.map((p) => (
                  <div
                    key={p.id}
                    className="border-2 border-[#00afca] rounded-2xl p-5 bg-[#ffffff] space-y-3"
                  >
                    <div className="flex items-center justify-between">
                      <h3 className="font-serif text-lg font-bold text-[#00afca]">
                        {p.questionRu}
                      </h3>
                      <button
                        onClick={() => handleDeletePoll(p.id)}
                        className="text-xs px-3 py-1 rounded-full border-2 border-[#00afca] text-[#00afca] font-bold"
                      >
                        Удалить
                      </button>
                    </div>
                    <div className="space-y-1 text-xs text-[#00afca]">
                      {p.options?.map((o: AdminPollOption) => (
                        <div
                          key={o.id}
                          className="flex justify-between p-2 rounded border border-[#00afca]"
                        >
                          <span className="font-semibold">{o.textRu}</span>
                          <span className="font-bold">{o._count?.votes || 0} голосов</span>
                        </div>
                      ))}
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>
        )}

        {/* APPEALS TAB */}
        {activeTab === 'appeals' && (
          <div className="space-y-4">
            <div className="flex flex-wrap items-center justify-between gap-4 border-2 border-[#00afca] rounded-2xl p-5 bg-[#ffffff]">
              <h2 className="font-serif text-xl font-bold text-[#00afca]">
                {hasFullAccess ? 'Барлық фракцияларға келген өтініштер' : 'Фракцияға келген өтініштер'}
              </h2>
              {hasFullAccess && (
                <select
                  value={appealMinistryFilter}
                  onChange={(e) => setAppealMinistryFilter(e.target.value)}
                  className="form-input max-w-xs text-xs font-bold"
                >
                  <option value="all">Барлық бағыттар</option>
                  <option value="general">Президент / Вице-президент (Жалпы)</option>
                  <option value="it">IT және цифрландыру фракциясы</option>
                  <option value="culture">Мәдениет және өнер фракциясы</option>
                  <option value="sport">Спорт фракциясы</option>
                  <option value="volunteers">Еріктілер және қайырымдылық фракциясы</option>
                  <option value="discipline">Құқық және тәртіп фракциясы</option>
                  <option value="media">Медиа фракциясы</option>
                  <option value="education">Білім фракциясы</option>
                </select>
              )}
            </div>

            {filteredAppeals.length === 0 ? (
              <div className="border-2 border-[#00afca] rounded-2xl p-8 text-center">
                <p className="font-bold text-[#00afca]">Обращений пока нет</p>
              </div>
            ) : (
              filteredAppeals.map((ap) => (
                <div
                  key={ap.id}
                  className="border-2 border-[#00afca] rounded-2xl p-5 bg-[#ffffff] flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4"
                >
                  <div>
                    <div className="flex flex-wrap items-center gap-2 mb-1">
                      <span className="px-3 py-0.5 rounded-full bg-[#00afca] text-[#ffffff] text-xs font-bold uppercase">
                        {ap.ministry || 'general'}
                      </span>
                      <span className="text-xs font-bold uppercase text-[#00afca]">
                        {ap.type === 'proposal'
                          ? 'Предложение'
                          : ap.type === 'complaint'
                          ? 'Вопрос / Проблема'
                          : 'Заявка в министерство'}
                      </span>
                      <span className="text-xs text-[#00afca] font-semibold">
                        • {ap.anonymous ? 'Анонимно' : `${ap.name} (${ap.grade})`}
                      </span>
                    </div>
                    <p className="text-sm text-[#00afca] font-medium">{ap.text}</p>
                  </div>

                  <div className="flex items-center gap-2 shrink-0">
                    {(['new', 'in_progress', 'resolved'] as const).map((st) => (
                      <button
                        key={st}
                        onClick={() => handleAppealStatus(ap.id, st)}
                        className={`text-xs px-3 py-1 rounded-full border-2 border-[#00afca] font-bold ${
                          ap.status === st
                            ? 'bg-[#00afca] text-[#ffffff]'
                            : 'bg-[#ffffff] text-[#00afca]'
                        }`}
                      >
                        {st === 'new' ? 'Новое' : st === 'in_progress' ? 'В работе' : 'Решено'}
                      </button>
                    ))}
                  </div>
                </div>
              ))
            )}
          </div>
        )}

        {/* SUGGESTIONS TAB */}
        {activeTab === 'suggestions' && (
          <div className="space-y-4">
            {suggestions.length === 0 ? (
              <div className="border-2 border-[#00afca] rounded-2xl p-8 text-center">
                <p className="font-bold text-[#00afca]">Предложений для голосования пока нет</p>
              </div>
            ) : (
              suggestions.map((sg) => (
                <div
                  key={sg.id}
                  className="border-2 border-[#00afca] rounded-2xl p-5 bg-[#ffffff] flex items-center justify-between gap-4"
                >
                  <div>
                    <div className="text-xs text-[#00afca] mb-1 font-bold">Автор: {sg.author}</div>
                    <p className="text-sm text-[#00afca] font-medium">{sg.text}</p>
                  </div>
                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => handleSuggestionStatus(sg.id, 'approved')}
                      className={`text-xs px-3 py-1 rounded-full border-2 border-[#00afca] font-bold ${
                        sg.status === 'approved'
                          ? 'bg-[#00afca] text-[#ffffff]'
                          : 'bg-[#ffffff] text-[#00afca]'
                      }`}
                    >
                      Одобрить
                    </button>
                    <button
                      onClick={() => handleSuggestionStatus(sg.id, 'rejected')}
                      className={`text-xs px-3 py-1 rounded-full border-2 border-[#00afca] font-bold ${
                        sg.status === 'rejected'
                          ? 'bg-[#00afca] text-[#ffffff]'
                          : 'bg-[#ffffff] text-[#00afca]'
                      }`}
                    >
                      Отклонить
                    </button>
                  </div>
                </div>
              ))
            )}
          </div>
        )}

        {/* STATS TAB */}
        {activeTab === 'stats' && (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {stats.map((st) => (
              <div key={st.key} className="border-2 border-[#00afca] rounded-2xl p-6 bg-[#ffffff]">
                <div className="text-xs uppercase text-[#00afca] mb-2 font-bold">{st.labelRu}</div>
                <input
                  type="number"
                  defaultValue={st.value}
                  onBlur={(e) => handleStatUpdate(st.key, Number(e.target.value))}
                  className="form-input font-serif text-2xl font-bold text-[#00afca]"
                />
                <div className="text-[11px] text-[#00afca] mt-2 font-medium">
                  Измените число и кликните вне поля для сохранения
                </div>
              </div>
            ))}
          </div>
        )}

        {/* DASHBOARD TAB */}
        {hasFullAccess && activeTab === 'dashboard' && (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            <div className="border-2 border-[#00afca] rounded-2xl p-6 bg-[#ffffff]">
              <div className="text-xs uppercase tracking-wider text-[#00afca] mb-2 font-bold">
                Фракциялар саны
              </div>
              <div className="font-serif text-4xl font-bold text-[#00afca]">
                {factionMembers.length}
              </div>
            </div>
            <div className="border-2 border-[#00afca] rounded-2xl p-6 bg-[#ffffff]">
              <div className="text-xs uppercase tracking-wider text-[#00afca] mb-2 font-bold">
                Іс-шаралар
              </div>
              <div className="font-serif text-4xl font-bold text-[#00afca]">{events.length}</div>
            </div>
            <div className="border-2 border-[#00afca] rounded-2xl p-6 bg-[#ffffff]">
              <div className="text-xs uppercase tracking-wider text-[#00afca] mb-2 font-bold">
                Жаңа өтініштер
              </div>
              <div className="font-serif text-4xl font-bold text-[#00afca]">
                {appeals.filter((a) => a.status === 'new').length}
              </div>
            </div>
            <div className="border-2 border-[#00afca] rounded-2xl p-6 bg-[#ffffff]">
              <div className="text-xs uppercase tracking-wider text-[#00afca] mb-2 font-bold">
                Модерациядағы идеялар
              </div>
              <div className="font-serif text-4xl font-bold text-[#00afca]">
                {suggestions.filter((s) => s.status === 'pending').length}
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
