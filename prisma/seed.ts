import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  console.log('Очистка старых данных членов парламента...');
  await prisma.member.deleteMany();

  console.log('Заполнение новыми реальными данными (Президент, Вице-президент и фракции с министрами и помощниками)...');

  await prisma.member.createMany({
    data: [
      {
        login: 'president',
        password: 'parliament2025',
        ministry: 'president',
        ministryNameRu: 'Президиум AQL Council',
        ministryNameKk: 'AQL Council Төралқасы',
        nameRu: 'Хупырулы Разызаман',
        nameKk: 'Хупырұлы Разызаман',
        grade: '10А',
        roleRu: 'Президент Школьного Парламента',
        roleKk: 'Мектеп Парламентінің Президенті',
        quoteRu: 'Біз бірге мықтымыз. Оқушылар үні — мектептің болашағы.',
        quoteKk: 'Біз бірге мықтымыз. Оқушылар үні — мектептің болашағы.',
        bioRu: 'Общее руководство школьным парламентом, представление интересов учащихся и координация работы всех 7 фракций.',
        bioKk: 'Мектеп парламентіне жалпы басшылық жасау, оқушылар мүддесін қорғау және 7 фракцияның қызметін үйлестіру.',
        assistants: JSON.stringify([]),
        photo: '',
        order: 1,
      },
      {
        login: 'vice',
        password: 'parliament2025',
        ministry: 'vice',
        ministryNameRu: 'Аппарат Вице-президента',
        ministryNameKk: 'Вице-президент аппараты',
        nameRu: 'Асанова Жансая',
        nameKk: 'Асанова Жансая',
        grade: '10В',
        roleRu: 'Вице-президент Школьного Парламента',
        roleKk: 'Мектеп Парламентінің Вице-президенті',
        quoteRu: 'Әрбір оқушының бастамасы маңызды.',
        quoteKk: 'Әрбір оқушының бастамасы маңызды.',
        bioRu: 'Координация совместной работы фракций, контроль за реализацией проектов и взаимодействие с ученическим сообществом.',
        bioKk: 'Фракциялардың бірлескен жұмысын үйлестіру, жобалардың орындалуын бақылау және оқушылармен байланыс орнату.',
        assistants: JSON.stringify([]),
        photo: '',
        order: 2,
      },
      {
        login: 'it',
        password: 'parliament2025',
        ministry: 'it',
        ministryNameRu: 'Фракция IT и цифровизации',
        ministryNameKk: 'IT және цифрландыру фракциясы',
        nameRu: 'Ермуханов Мернар',
        nameKk: 'Ермуханов Мернар',
        grade: '10А',
        roleRu: 'Министр IT и цифровизации',
        roleKk: 'IT және цифрландыру фракциясының министрі',
        quoteRu: 'Технологиялар мен инновациялар арқылы болашаққа.',
        quoteKk: 'Технологиялар мен инновациялар арқылы болашаққа.',
        bioRu: 'Развитие школьного сайта, цифровых сервисов, IT-мероприятий и хакатонов.',
        bioKk: 'Мектептің цифрлық қызметтерін, веб-ресурстарын дамыту және IT жобаларды қолдау.',
        assistants: JSON.stringify([
          { name: 'Аленов Санжар', grade: '10С', role: 'Көмекші' },
          { name: 'Айтмағамбетова Інжу', grade: '10А', role: 'Көмекші' },
          { name: 'Баймуратов Артур', grade: '10А', role: 'Көмекші' },
          { name: 'Қазыбаев Амир', grade: '10С', role: 'Көмекші' },
        ]),
        photo: '/images/members/it_mernar.jpg',
        order: 3,
      },
      {
        login: 'media',
        password: 'parliament2025',
        ministry: 'media',
        ministryNameRu: 'Медиа фракция',
        ministryNameKk: 'Медиа фракциясы',
        nameRu: 'Асанов Тайыр',
        nameKk: 'Асанов Тайыр',
        grade: '10А',
        roleRu: 'Министр медиа фракции',
        roleKk: 'Медиа фракциясының министрі',
        quoteRu: 'Шындық, сапалы контент және жедел ақпарат.',
        quoteKk: 'Шындық, сапалы контент және жедел ақпарат.',
        bioRu: 'Освещение всех событий школы, медиа-проекты, видеорепортажи, социальные сети и пресс-центр парламента.',
        bioKk: 'Мектеп жаңалықтары мен іс-шараларын жариялау, әлеуметтік желілерді жүргізу, фото-бейне контент дайындау.',
        assistants: JSON.stringify([
          { name: 'Сағымжан Досымжан', grade: '10С', role: 'Көмекші' },
          { name: 'Жақсылықова Хабиба', grade: '9С', role: 'Көмекші' },
        ]),
        photo: '',
        order: 4,
      },
      {
        login: 'volunteers',
        password: 'parliament2025',
        ministry: 'volunteers',
        ministryNameRu: 'Фракция волонтеров и благотворительности',
        ministryNameKk: 'Еріктілер және қайырымдылық фракциясы',
        nameRu: 'Алибек Айымжан',
        nameKk: 'Әлібек Айымжан',
        grade: '10А',
        roleRu: 'Министр волонтерской фракции',
        roleKk: 'Еріктілер фракциясының министрі',
        quoteRu: 'Жақсылық жасау — әрқайсымыздың қолымызда.',
        quoteKk: 'Жақсылық жасау — әрқайсымыздың қолымызда.',
        bioRu: 'Организация благотворительных акций, социальные инициативы, волонтерская помощь и добрые дела.',
        bioKk: 'Қайырымдылық акцияларын ұйымдастыру, еріктілер қозғалысын дамыту, мұқтаж жандарға көмек көрсету.',
        assistants: JSON.stringify([
          { name: 'Сабытай Абдали', grade: '10В', role: 'Көмекші' },
          { name: 'Асқар Елхан', grade: '10В', role: 'Көмекші' },
          { name: 'Амангелдиев Нур Али', grade: '9В', role: 'Көмекші' },
          { name: 'Тасболатова Камилла', grade: '9С', role: 'Көмекші' },
          { name: 'Бахиткереева Айару', grade: '10А', role: 'Көмекші' },
        ]),
        photo: '',
        order: 5,
      },
      {
        login: 'culture',
        password: 'parliament2025',
        ministry: 'culture',
        ministryNameRu: 'Фракция культуры и искусства',
        ministryNameKk: 'Мәдениет және өнер фракциясы',
        nameRu: 'Мусагали Айжан',
        nameKk: 'Мусағали Айжан',
        grade: '9С',
        roleRu: 'Министр культуры и искусства',
        roleKk: 'Мәдениет және өнер фракциясының министрі',
        quoteRu: 'Өнер — ұлттың жаны, мектептің ажары.',
        quoteKk: 'Өнер — ұлттың жаны, мектептің ажары.',
        bioRu: 'Школьные праздники, концерты, творческие вечера, выставки и развитие талантов учащихся.',
        bioKk: 'Мектеп мерекелерін, шығармашылық кештерді, көрмелер мен мәдени фестивальдерді ұйымдастыру.',
        assistants: JSON.stringify([
          { name: 'Серік Қарақат', grade: '10', role: 'Көмекші' },
          { name: 'Қанибаева Малика', grade: '9Б', role: 'Көмекші' },
          { name: 'Жанибек Нұркөркем', grade: '9А', role: 'Көмекші' },
        ]),
        photo: '',
        order: 6,
      },
      {
        login: 'sport',
        password: 'parliament2025',
        ministry: 'sport',
        ministryNameRu: 'Спортивная фракция',
        ministryNameKk: 'Спорт фракциясы',
        nameRu: 'Нурлан Мейырбек',
        nameKk: 'Нұрлан Мейірбек',
        grade: '10С',
        roleRu: 'Министр спорта',
        roleKk: 'Спорт фракциясының министрі',
        quoteRu: 'Салауатты өмір салты — жеңістің кілті.',
        quoteKk: 'Салауатты өмір салты — жеңістің кілті.',
        bioRu: 'Спортивные турниры, спартакиады, командные игры (футбол, баскетбол, волейбол) и продвижение здорового образа жизни.',
        bioKk: 'Мектеп спартакиадаларын, спорттық ойындар мен турнирлерді ұйымдастыру, салауатты өмір салтын дәріптеу.',
        assistants: JSON.stringify([
          { name: 'Исағали Ильжан', grade: '10В', role: 'Көмекші' },
          { name: 'Тайшығұлова Амина', grade: '9А', role: 'Көмекші' },
          { name: 'Қадырқұлов Жансен', grade: '10В', role: 'Көмекші' },
        ]),
        photo: '',
        order: 7,
      },
      {
        login: 'discipline',
        password: 'parliament2025',
        ministry: 'discipline',
        ministryNameRu: 'Фракция права и порядка',
        ministryNameKk: 'Құқық және тәртіп фракциясы',
        nameRu: 'Сандибаев Едиге',
        nameKk: 'Сәндібаев Едіге',
        grade: '10С',
        roleRu: 'Министр права и порядка',
        roleKk: 'Құқық және тәртіп фракциясының министрі',
        quoteRu: 'Тәртіп пен заң — табыстың негізі.',
        quoteKk: 'Тәртіп пен заң — табыстың негізі.',
        bioRu: 'Контроль за соблюдением правил школы, защита прав учащихся и медиация.',
        bioKk: 'Мектеп ережелерінің орындалуын қадағалау, оқушылар құқықтарын қорғау және татуластыру.',
        assistants: JSON.stringify([
          { name: 'Серікбай Ершат', grade: '10А', role: 'Көмекші' },
          { name: 'Гумарова Амина', grade: '10С', role: 'Көмекші' },
          { name: 'Бақытжан Абзал', grade: '10А', role: 'Көмекші' },
        ]),
        photo: '',
        order: 8,
      },
      {
        login: 'education',
        password: 'parliament2025',
        ministry: 'education',
        ministryNameRu: 'Фракция образования',
        ministryNameKk: 'Білім фракциясы',
        nameRu: 'Жансерик Нурсугир',
        nameKk: 'Жансерік Нұрсүгір',
        grade: '10В',
        roleRu: 'Министр образования',
        roleKk: 'Білім фракциясының министрі',
        quoteRu: 'Білім — сарқылмас қазына.',
        quoteKk: 'Білім — сарқылмас қазына.',
        bioRu: 'Интеллектуальные игры, дебатный клуб, олимпиады, помощь учащимся в учебе и научные конференции.',
        bioKk: 'Зияткерлік ойындар, дебаттар, олимпиадалар, оқу үлгерімін арттыруға бағытталған жобалар мен ғылыми жұмыстар.',
        assistants: JSON.stringify([
          { name: 'Қали Дархан', grade: '10А', role: 'Көмекші' },
          { name: 'Нұруллаева Нұрай', grade: '10В', role: 'Көмекші' },
          { name: 'Есенгалиев Карим', grade: '10А', role: 'Көмекші' },
          { name: 'Иделия', grade: '9С', role: 'Көмекші' },
        ]),
        photo: '',
        order: 9,
      },
    ],
  });

  console.log('Данные успешно сохранены!');

  console.log('Создание актуального опроса для звонков...');
  await prisma.vote.deleteMany();
  await prisma.pollOption.deleteMany();
  await prisma.poll.deleteMany();
  await prisma.poll.create({
    data: {
      questionKk: 'Қоңырауда қандай өлең тұрғанын қалайсыз?',
      questionRu: 'Какую песню вы бы хотели слышать на звонке?',
      active: true,
      options: {
        create: [
          { textKk: 'Yenlik - 16 Qyz', textRu: 'Yenlik - 16 Qyz' },
          { textKk: 'E.Yeah - Ninety One', textRu: 'E.Yeah - Ninety One' },
          { textKk: 'Men Qazaq - Yerbolat Qudaibergenov', textRu: 'Men Qazaq - Yerbolat Qudaibergenov' },
        ],
      },
    },
  });
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
