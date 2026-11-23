const BASE_URL = 'http://127.0.0.1:3099';

async function testAll() {
  console.log('--- STARTING STICKER CONTEST & QR & VOTING TEST ---');
  let testCount = 0;
  let passCount = 0;

  function assert(cond, name) {
    testCount++;
    if (cond) {
      console.log(`[PASS] ${name}`);
      passCount++;
    } else {
      console.error(`[FAIL] ${name}`);
      throw new Error(`Assertion failed: ${name}`);
    }
  }

  // 1. A4 QR Poster test
  console.log('\n[1/4] Testing A4 QR Poster route...');
  const qrRes = await fetch(`${BASE_URL}/kk/qr`);
  assert(qrRes.status === 200, 'A4 QR Poster page returns 200 OK');
  const qrHtml = await qrRes.text();
  assert(qrHtml.includes('Парламент сайты') || qrHtml.includes('ПАРЛАМЕНТ САЙТЫ'), 'Poster contains "Парламент сайты"');
  assert(qrHtml.includes('<svg'), 'Poster renders SVG QR code');

  // 2. Admin login for sticker management
  console.log('\n[2/4] Testing Admin login...');
  const loginRes = await fetch(`${BASE_URL}/api/admin/login`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ login: 'president', password: 'AqlPres!2026' }),
  });
  assert(loginRes.status === 200, 'President login succeeded');
  const adminCookie = loginRes.headers.get('set-cookie')?.split(';')[0];
  const adminHeaders = { 'Content-Type': 'application/json', Cookie: adminCookie };

  // 3. Sticker Upload (One per student enforcement)
  console.log('\n[3/4] Testing Sticker Upload & Single-Submission enforcement...');
  const dummyPng = Buffer.from(
    'iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mNk+M9QDwADhgGAWjR9awAAAABJRU5ErkJggg==',
    'base64'
  );

  const deviceStudent1 = `device_${Date.now()}_student1`;
  const form1 = new FormData();
  form1.append('authorName', 'Сұлтан Бақыт');
  form1.append('authorGrade', '10А');
  form1.append('title', 'ҰБТ күні');
  form1.append('deviceId', deviceStudent1);
  form1.append('file', new Blob([dummyPng], { type: 'image/png' }), 'sticker1.png');

  const uploadRes1 = await fetch(`${BASE_URL}/api/stickers/upload`, {
    method: 'POST',
    headers: { 'x-forwarded-for': '10.5.0.1' },
    body: form1,
  });
  const uploadData1 = await uploadRes1.json();
  assert(uploadRes1.status === 201 && uploadData1.sticker?.id, 'Student 1 uploaded sticker 1');
  const sticker1Id = uploadData1.sticker.id;
  const student1Cookie = uploadRes1.headers.get('set-cookie');

  // Student 1 tries to upload a SECOND sticker
  const form1Dup = new FormData();
  form1Dup.append('authorName', 'Сұлтан Бақыт');
  form1Dup.append('authorGrade', '10А');
  form1Dup.append('title', 'Екінші стикер');
  form1Dup.append('deviceId', deviceStudent1);
  form1Dup.append('file', new Blob([dummyPng], { type: 'image/png' }), 'sticker1_dup.png');

  const dupUploadRes = await fetch(`${BASE_URL}/api/stickers/upload`, {
    method: 'POST',
    headers: {
      'x-forwarded-for': '10.5.0.1',
      Cookie: student1Cookie || '',
    },
    body: form1Dup,
  });
  assert(dupUploadRes.status === 409, 'Duplicate sticker upload blocked with 409 Conflict');

  // Student 2 uploads sticker 2
  const deviceStudent2 = `device_${Date.now()}_student2`;
  const form2 = new FormData();
  form2.append('authorName', 'Аяулым Маратқызы');
  form2.append('authorGrade', '9Б');
  form2.append('title', 'Мектеп үзілісі');
  form2.append('deviceId', deviceStudent2);
  form2.append('file', new Blob([dummyPng], { type: 'image/png' }), 'sticker2.png');

  const uploadRes2 = await fetch(`${BASE_URL}/api/stickers/upload`, {
    method: 'POST',
    headers: { 'x-forwarded-for': '10.5.0.2' },
    body: form2,
  });
  const uploadData2 = await uploadRes2.json();
  assert(uploadRes2.status === 201 && uploadData2.sticker?.id, 'Student 2 uploaded sticker 2');
  const sticker2Id = uploadData2.sticker.id;

  // 4. Sticker Voting & Strict One-Person-One-Vote Across Contest
  console.log('\n[4/4] Testing Sticker Voting (Strict 1 Vote Per Contest)...');
  const voterDeviceC = `device_${Date.now()}_voterC`;

  // Voter C votes for Sticker 1
  const voteRes1 = await fetch(`${BASE_URL}/api/stickers/${sticker1Id}/vote`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', 'x-forwarded-for': '10.5.0.3' },
    body: JSON.stringify({ deviceId: voterDeviceC }),
  });
  const voteData1 = await voteRes1.json();
  assert(voteRes1.status === 201 && voteData1.success, 'Voter C voted for Sticker 1');
  const voterCCookie = voteRes1.headers.get('set-cookie');

  // Voter C tries to vote for Sticker 1 AGAIN (duplicate)
  const dupVote1 = await fetch(`${BASE_URL}/api/stickers/${sticker1Id}/vote`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'x-forwarded-for': '10.5.0.3',
      Cookie: voterCCookie || '',
    },
    body: JSON.stringify({ deviceId: voterDeviceC }),
  });
  assert(dupVote1.status === 409, 'Duplicate vote for same sticker blocked with 409');

  // Voter C tries to vote for Sticker 2 (cannot vote for multiple stickers!)
  const dupVote2 = await fetch(`${BASE_URL}/api/stickers/${sticker2Id}/vote`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'x-forwarded-for': '10.5.0.3',
      Cookie: voterCCookie || '',
    },
    body: JSON.stringify({ deviceId: voterDeviceC }),
  });
  assert(dupVote2.status === 409, 'Vote for second sticker blocked with 409 (1 vote per contest enforced)');

  // Voter D votes for Sticker 2
  const voterDeviceD = `device_${Date.now()}_voterD`;
  const voteRes2 = await fetch(`${BASE_URL}/api/stickers/${sticker2Id}/vote`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', 'x-forwarded-for': '10.5.0.4' },
    body: JSON.stringify({ deviceId: voterDeviceD }),
  });
  assert(voteRes2.status === 201, 'Voter D voted for Sticker 2');

  // Public GET /api/stickers check
  const publicStickersRes = await fetch(`${BASE_URL}/api/stickers`);
  const publicData = await publicStickersRes.json();
  assert(publicData.stickers?.length >= 2, 'Public API returns both stickers');
  assert(publicData.totalVotes >= 2, 'Total votes counted correctly');

  // Admin GET /api/admin/stickers
  const adminStickersRes = await fetch(`${BASE_URL}/api/admin/stickers`, { headers: adminHeaders });
  const adminStickersData = await adminStickersRes.json();
  assert(adminStickersData.stickers?.some(s => s.id === sticker1Id), 'Sticker 1 listed in Admin');
  assert(adminStickersData.stickers?.some(s => s.id === sticker2Id), 'Sticker 2 listed in Admin');

  // Clean up: Admin deletes both test stickers
  const del1 = await fetch(`${BASE_URL}/api/admin/stickers?id=${sticker1Id}`, {
    method: 'DELETE',
    headers: adminHeaders,
  });
  assert(del1.status === 200, 'Admin deleted test sticker 1');

  const del2 = await fetch(`${BASE_URL}/api/admin/stickers?id=${sticker2Id}`, {
    method: 'DELETE',
    headers: adminHeaders,
  });
  assert(del2.status === 200, 'Admin deleted test sticker 2');

  console.log(`\n========================================`);
  console.log(`ALL NEW FEATURE TESTS PASSED! (${passCount}/${testCount} checks succeeded)`);
  console.log(`========================================\n`);
}

testAll().catch((err) => {
  console.error('\nTEST SUITE FAILED:', err);
  process.exit(1);
});
