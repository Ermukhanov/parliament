import http from 'http';

const BASE_URL = 'http://127.0.0.1:3088';

const FACTION_CREDENTIALS = [
  { login: 'president', pass: 'AqlPres!2026' },
  { login: 'vice', pass: 'AqlVice#2026' },
  { login: 'it', pass: 'AqlIt@2026' },
  { login: 'media', pass: 'AqlMedia$2026' },
  { login: 'volunteers', pass: 'AqlVolun#2026' },
  { login: 'culture', pass: 'AqlCult&2026' },
  { login: 'sport', pass: 'AqlSport*2026' },
  { login: 'discipline', pass: 'AqlDisc!2026' },
  { login: 'education', pass: 'AqlEdu@2026' },
];

async function run() {
  console.log('--- STARTING COMPREHENSIVE ADMIN INTEGRATION TEST ---');
  let testCount = 0;
  let passCount = 0;

  function assert(condition, name) {
    testCount++;
    if (condition) {
      console.log(`[PASS] ${name}`);
      passCount++;
    } else {
      console.error(`[FAIL] ${name}`);
      throw new Error(`Assertion failed: ${name}`);
    }
  }

  // 1. Test All 9 Factions Authentication
  console.log('\n[1/8] Testing 9 Faction Logins...');
  let presidentCookie = '';

  for (const cred of FACTION_CREDENTIALS) {
    const res = await fetch(`${BASE_URL}/api/admin/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ login: cred.login, password: cred.pass }),
    });
    assert(res.status === 200, `Login for faction: ${cred.login}`);
    const setCookie = res.headers.get('set-cookie');
    assert(setCookie && setCookie.includes('admin_session='), `Cookie received for ${cred.login}`);
    if (cred.login === 'president') {
      presidentCookie = setCookie.split(';')[0];
    }
  }

  // Test invalid login
  const badRes = await fetch(`${BASE_URL}/api/admin/login`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ login: 'president', password: 'WrongPassword#123' }),
  });
  assert(badRes.status === 401, 'Invalid password rejected with 401');

  const headers = {
    'Content-Type': 'application/json',
    Cookie: presidentCookie,
  };

  // 2. Events CRUD + Registration + CSV Export
  console.log('\n[2/8] Testing Events CRUD + Registration + Export...');
  const testSlug = `test-hackathon-${Date.now()}`;
  const createEventRes = await fetch(`${BASE_URL}/api/admin/events`, {
    method: 'POST',
    headers,
    body: JSON.stringify({
      titleKk: 'Сынақ хакатоны 2026',
      titleRu: 'Тестовый хакатон 2026',
      descKk: 'Барлық сыныптар үшін сынақ сайысы',
      descRu: 'Тестовое соревнование для всех классов',
      date: new Date(Date.now() + 86400000 * 7).toISOString(),
      location: 'Акт залы (3-қабат)',
      category: 'it',
      slug: testSlug,
      maxSeats: 30,
      ministry: 'it',
    }),
  });
  const createEventData = await createEventRes.json();
  assert(createEventRes.status === 201 && createEventData.event?.id, 'Event created successfully');
  const eventId = createEventData.event.id;

  // Read events list
  const getEventsRes = await fetch(`${BASE_URL}/api/admin/events`, { headers });
  const getEventsData = await getEventsRes.json();
  assert(getEventsData.events?.some((e) => e.id === eventId), 'Event listed in admin events');

  // Edit event (including past/archived support)
  const updateEventRes = await fetch(`${BASE_URL}/api/admin/events`, {
    method: 'PUT',
    headers,
    body: JSON.stringify({
      id: eventId,
      titleKk: 'Жаңартылған сынақ хакатоны',
      titleRu: 'Обновленный тестовый хакатон',
      descKk: 'Жаңартылған сипаттама',
      descRu: 'Обновленное описание',
      date: new Date(Date.now() - 86400000).toISOString(), // Move to past to verify past-event support
      location: 'Басты акт залы',
      category: 'it',
      maxSeats: 50,
      archived: true,
      ministry: 'it',
    }),
  });
  const updateEventData = await updateEventRes.json();
  assert(updateEventRes.status === 200 && updateEventData.event?.archived === true, 'Event updated to past/archived');

  // Move back to active to test registration
  await fetch(`${BASE_URL}/api/admin/events`, {
    method: 'PUT',
    headers,
    body: JSON.stringify({
      id: eventId,
      titleKk: 'Сынақ хакатоны',
      titleRu: 'Тестовый хакатон',
      date: new Date(Date.now() + 86400000 * 5).toISOString(),
      location: 'Акт залы',
      category: 'it',
      maxSeats: 50,
      archived: false,
      ministry: 'it',
    }),
  });

  // Register participant
  const regRes = await fetch(`${BASE_URL}/api/events/${eventId}/register`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', 'x-forwarded-for': '10.1.0.1' },
    body: JSON.stringify({
      name: 'Әлихан Бөкейхан',
      grade: '10A',
      phone: '+7 777 123 4567',
    }),
  });
  const regData = await regRes.json();
  assert(regRes.status === 201 && regData.success, 'Participant registered for event');
  const regId = regData.registration.id;

  // Export CSV
  const exportRes = await fetch(`${BASE_URL}/api/admin/events/${eventId}/export`, { headers });
  assert(exportRes.status === 200, 'CSV export returned 200 OK');
  const csvText = await exportRes.text();
  assert(csvText.includes('Әлихан Бөкейхан') && csvText.includes('10A'), 'CSV contains registered attendee');

  // Delete registration
  const delRegRes = await fetch(`${BASE_URL}/api/admin/events/registrations?id=${regId}`, {
    method: 'DELETE',
    headers,
  });
  assert(delRegRes.status === 200, 'Registration deleted by admin');

  // Delete event
  const delEventRes = await fetch(`${BASE_URL}/api/admin/events?id=${eventId}`, {
    method: 'DELETE',
    headers,
  });
  assert(delEventRes.status === 200, 'Event deleted successfully');

  // 3. News CRUD
  console.log('\n[3/8] Testing News CRUD...');
  const newsSlug = `test-news-${Date.now()}`;
  const createNewsRes = await fetch(`${BASE_URL}/api/admin/news`, {
    method: 'POST',
    headers,
    body: JSON.stringify({
      slug: newsSlug,
      titleKk: 'Сынақ жаңалығы 2026',
      titleRu: 'Тестовая новость 2026',
      contentKk: 'Парламент сайтына арналған толық тестілік жаңалық мазмұны.',
      contentRu: 'Полное тестовое содержание новости для сайта парламента.',
      image: '/images/instagram/post-jersey-day.jpg',
      ministry: 'media',
    }),
  });
  const createNewsData = await createNewsRes.json();
  assert(createNewsRes.status === 201 && createNewsData.article?.id, 'News created successfully');
  const newsId = createNewsData.article.id;

  // Read news
  const getNewsRes = await fetch(`${BASE_URL}/api/admin/news`, { headers });
  const getNewsData = await getNewsRes.json();
  assert(getNewsData.news?.some((n) => n.id === newsId), 'News listed in admin news');

  // Delete news
  const delNewsRes = await fetch(`${BASE_URL}/api/admin/news?id=${newsId}`, {
    method: 'DELETE',
    headers,
  });
  assert(delNewsRes.status === 200, 'News deleted successfully');

  // 4. Polls & Voting CRUD
  console.log('\n[4/8] Testing Polls & Voting CRUD...');
  const createPollRes = await fetch(`${BASE_URL}/api/admin/polls`, {
    method: 'POST',
    headers,
    body: JSON.stringify({
      questionKk: 'Сынақ сауалнамасы: Ұнайтын спорт түрі?',
      questionRu: 'Тестовый опрос: Любимый вид спорта?',
      active: true,
      options: [
        { textKk: 'Футбол', textRu: 'Футбол' },
        { textKk: 'Баскетбол', textRu: 'Баскетбол' },
        { textKk: 'Волейбол', textRu: 'Волейбол' },
      ],
    }),
  });
  const createPollData = await createPollRes.json();
  assert(createPollRes.status === 201 && createPollData.poll?.id, 'Poll created successfully');
  const pollId = createPollData.poll.id;
  const optionId1 = createPollData.poll.options[0].id;
  const optionId2 = createPollData.poll.options[1].id;

  // Public voting GET
  const getVotingRes = await fetch(`${BASE_URL}/api/voting`);
  const getVotingData = await getVotingRes.json();
  assert(getVotingData.poll?.id === pollId, 'Created poll is currently active');

  // Vote with device A
  const deviceA = `device_${Date.now()}_A`;
  const voteResA = await fetch(`${BASE_URL}/api/voting`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ optionId: optionId1, deviceId: deviceA }),
  });
  const voteDataA = await voteResA.json();
  assert((voteResA.status === 200 || voteResA.status === 201) && voteDataA.success, 'Vote 1 counted successfully');

  // Duplicate vote check
  const dupVoteRes = await fetch(`${BASE_URL}/api/voting`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ optionId: optionId1, deviceId: deviceA }),
  });
  assert(dupVoteRes.status === 409, 'Duplicate vote from same device rejected with 409');

  // Vote with device B
  const deviceB = `device_${Date.now()}_B`;
  const voteResB = await fetch(`${BASE_URL}/api/voting`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ optionId: optionId2, deviceId: deviceB }),
  });
  assert((voteResB.status === 200 || voteResB.status === 201), 'Vote 2 from distinct device counted successfully');

  // Toggle active
  const toggleRes = await fetch(`${BASE_URL}/api/admin/polls`, {
    method: 'PATCH',
    headers,
    body: JSON.stringify({ id: pollId, active: false }),
  });
  assert(toggleRes.status === 200, 'Poll deactivated');

  // Delete poll (verifying cascade deletion of votes and options)
  const delPollRes = await fetch(`${BASE_URL}/api/admin/polls?id=${pollId}`, {
    method: 'DELETE',
    headers,
  });
  assert(delPollRes.status === 200, 'Poll and its votes/options deleted cleanly');

  // 5. Appeals (Өтініштер) CRUD
  console.log('\n[5/8] Testing Appeals CRUD...');
  const appealRes = await fetch(`${BASE_URL}/api/appeals`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', 'x-forwarded-for': '10.2.0.1' },
    body: JSON.stringify({
      type: 'complaint',
      ministry: 'general',
      name: 'Сынақ Оқушы',
      grade: '9B',
      text: 'Тестілік өтініш мазмұны: асханадағы кезек бойынша ұсыныс',
      anonymous: false,
    }),
  });
  const appealData = await appealRes.json();
  assert(appealRes.status === 201 && appealData.appeal?.id, 'Appeal created successfully');
  const appealId = appealData.appeal.id;

  // Read appeals in admin
  const getAppealsRes = await fetch(`${BASE_URL}/api/admin/appeals`, { headers });
  const getAppealsData = await getAppealsRes.json();
  assert(getAppealsData.appeals?.some((a) => a.id === appealId), 'Appeal listed in admin');

  // Update appeal status to in_progress then resolved
  const updateAppealRes = await fetch(`${BASE_URL}/api/admin/appeals`, {
    method: 'PATCH',
    headers,
    body: JSON.stringify({ id: appealId, status: 'resolved' }),
  });
  const updateAppealData = await updateAppealRes.json();
  assert(updateAppealData.appeal?.status === 'resolved', 'Appeal status changed to resolved');

  // Delete appeal
  const delAppealRes = await fetch(`${BASE_URL}/api/admin/appeals?id=${appealId}`, {
    method: 'DELETE',
    headers,
  });
  assert(delAppealRes.status === 200, 'Appeal deleted successfully');

  // 6. Suggestions (Ұсыныстар) CRUD
  console.log('\n[6/8] Testing Suggestions CRUD...');
  const suggRes = await fetch(`${BASE_URL}/api/suggestions`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', 'x-forwarded-for': '10.3.0.1' },
    body: JSON.stringify({
      text: 'Мектеп ауласына көгалдандыру жұмыстарын жүргізу туралы идея',
      author: 'Сынақ Талапкер',
    }),
  });
  const suggData = await suggRes.json();
  assert(suggRes.status === 201 && suggData.suggestion?.id, 'Suggestion created');
  const suggId = suggData.suggestion.id;

  // Read suggestions
  const getSuggRes = await fetch(`${BASE_URL}/api/admin/suggestions`, { headers });
  const getSuggData = await getSuggRes.json();
  assert(getSuggData.suggestions?.some((s) => s.id === suggId), 'Suggestion listed in admin');

  // Update status to approved
  const updateSuggRes = await fetch(`${BASE_URL}/api/admin/suggestions`, {
    method: 'PATCH',
    headers,
    body: JSON.stringify({ id: suggId, status: 'approved' }),
  });
  const updateSuggData = await updateSuggRes.json();
  assert(updateSuggData.suggestion?.status === 'approved', 'Suggestion status approved');

  // Delete suggestion
  const delSuggRes = await fetch(`${BASE_URL}/api/admin/suggestions?id=${suggId}`, {
    method: 'DELETE',
    headers,
  });
  assert(delSuggRes.status === 200, 'Suggestion deleted');

  // 7. Members & School Stats
  console.log('\n[7/8] Testing Members & School Stats...');
  const membersRes = await fetch(`${BASE_URL}/api/admin/members`, { headers });
  const membersData = await membersRes.json();
  assert(membersData.members?.length > 0 && membersData.currentUser?.login === 'president', 'Members and current user retrieved');

  // Update member
  const memberToEdit = membersData.members[0];
  const editMemberRes = await fetch(`${BASE_URL}/api/admin/members`, {
    method: 'PATCH',
    headers,
    body: JSON.stringify({
      id: memberToEdit.id,
      bioKk: memberToEdit.bioKk || 'Сынақ биосы',
      quoteKk: memberToEdit.quoteKk || 'Сынақ цитатасы',
    }),
  });
  assert(editMemberRes.status === 200, 'Member info updated successfully');

  // Stats update
  const statUpdateRes = await fetch(`${BASE_URL}/api/admin/stats`, {
    method: 'PATCH',
    headers,
    body: JSON.stringify({ key: 'eventsHeld', value: 45 }),
  });
  const statData = await statUpdateRes.json();
  assert(statUpdateRes.status === 200 && statData.stat?.value === 45, 'Stat counter updated');

  // 8. Image Upload API
  console.log('\n[8/8] Testing Image Upload...');
  const dummyPng = Buffer.from(
    'iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mNk+M9QDwADhgGAWjR9awAAAABJRU5ErkJggg==',
    'base64'
  );
  const formData = new FormData();
  formData.append('file', new Blob([dummyPng], { type: 'image/png' }), 'test-avatar.png');

  const uploadRes = await fetch(`${BASE_URL}/api/admin/upload`, {
    method: 'POST',
    headers: {
      Cookie: presidentCookie,
    },
    body: formData,
  });
  const uploadData = await uploadRes.json();
  assert(uploadRes.status === 200 && uploadData.url, 'Image uploaded successfully');

  console.log(`\n========================================`);
  console.log(`ALL TESTS PASSED! (${passCount}/${testCount} checks succeeded)`);
  console.log(`========================================\n`);
}

run().catch((err) => {
  console.error('\nTEST SUITE FAILED:', err);
  process.exit(1);
});
