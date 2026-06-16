const fs = require('fs');
const path = require('path');

const dbPath = path.join(__dirname, 'data', 'db.json');

const studentsData = [
  {
    firstName: 'Ералы', lastName: 'Ануарбеков', patronymic: '',
    dob: '2009-11-25', inn: '91125553607', nationality: 'Казах', birthplace: 'г. Алматы',
    address: 'г. Алматы, ул. Басенова 10, 2к, кв 63', family: 'Полная', phone: '87076452570',
    email: 'elp5616@gmail.com', hobbies: 'Настольный теннис, киберспорт'
  },
  {
    firstName: 'Алихан', lastName: 'Бағдатұлы', patronymic: '',
    dob: '2009-07-10', inn: '90710554206', nationality: 'Казах', birthplace: 'г. Алматы',
    address: 'г. Алматы, Калкаман 2, Казыбекова 37', family: 'Полная', phone: '87475087739',
    email: 'Alihanstar88@gmail.com', hobbies: 'Футбол, мобильная разработка'
  },
  {
    firstName: 'Салават', lastName: 'Базилов', patronymic: 'Дамирович',
    dob: '2009-08-12', inn: '90812550753', nationality: 'Казах', birthplace: 'г. Алматы',
    address: 'г. Алматы, Жетысуский р-он, ул. Крылова 102, кв 14', family: 'Полная', phone: '87775480086',
    email: 'bazilovsalavat0@gmail.com', hobbies: 'Воркаут, программирование на Python'
  },
  {
    firstName: 'Арсений', lastName: 'Белозеров', patronymic: 'Григорьевич',
    dob: '2010-02-12', inn: '100212550805', nationality: 'Русский', birthplace: 'г. Алматы',
    address: 'г. Алматы, ул. Уразбаевой, 27 А', family: 'Полная', phone: '87078583139',
    email: 'arsenijbelozerov2@gmail.com', hobbies: 'Шахматы, веб-дизайн'
  },
  {
    firstName: 'Григорий', lastName: 'Варенов', patronymic: '',
    dob: '2010-04-30', inn: '100430551501', nationality: 'Русский', birthplace: 'Алматинская область',
    address: 'г. Алматы, мкр. Тастак-1, 1Б (Алматинская область, Карасайский район, посёлок Кайнар, улица Абая 11/26)', family: 'Полная', phone: '87082783099',
    email: 'xxratatuyxxx@gmail.com', hobbies: 'Видеомонтаж, аниме'
  },
  {
    firstName: 'Абылай', lastName: 'Ерғали', patronymic: 'Асқарұлы',
    dob: '2009-05-08', inn: '90508554238', nationality: 'Казах', birthplace: 'Алматинская область',
    address: 'Алматинская обл, Карасайский р-н, п.Кыргаулды, ул Жасулан 1537', family: 'Полная', phone: '87073542544',
    email: 'ablaiergali74@gmail.com', hobbies: 'Борьба, компьютерное железо'
  },
  {
    firstName: 'Данилл', lastName: 'Зрячев', patronymic: '',
    dob: '2010-01-05', inn: '100105551178', nationality: 'Русский', birthplace: 'Алматинская область',
    address: 'Алматинская обл, Илийский район, пос. Боралдай, ул Аэродромная дом 2а кв. 36', family: 'Полная', phone: '87074220596',
    email: 'zryachev.daniil@gmail.com', hobbies: 'Стриминг, ремонт техники'
  },
  {
    firstName: 'Денис', lastName: 'Ким', patronymic: 'Семёнович',
    dob: '2010-03-04', inn: '100304552930', nationality: 'Кореец', birthplace: 'г. Талдыкорган',
    address: 'г. Алматы, пр.Райымбека д.245Г, кв.33', family: 'Полная', phone: '87753395423',
    email: 'sb264d@gmail.ru', hobbies: 'Баскетбол, изучение JavaScript'
  },
  {
    firstName: 'Тигран', lastName: 'Маилян', patronymic: 'Эдуардович',
    dob: '2010-01-03', inn: '100103551028', nationality: 'Армянин', birthplace: 'г. Алматы',
    address: 'г. Алматы, Турксибский район, ул. Михаил Майбороды 48', family: 'Полная', phone: '87077530084',
    email: 'kawrxez@gmail.com', hobbies: 'Музыка, гейминг'
  },
  {
    firstName: 'Искандэр', lastName: 'Макаев', patronymic: 'Диасович',
    dob: '2010-06-08', inn: '100608555086', nationality: 'Казах', birthplace: 'Алматинская область',
    address: 'г. Алматы, мкр. Тастак-1, 1Б (Алматинская область, Карасайский район, село Кайнар, Бейбітшілік 4/2)', family: 'Полная', phone: '87789918773',
    email: 'iskandermakaev719@gmail.com', hobbies: 'Футбол, 3D-моделирование'
  },
  {
    firstName: 'Владимир', lastName: 'Мотовилов', patronymic: 'Игоревич',
    dob: '2009-08-17', inn: '90817554812', nationality: 'Русский', birthplace: 'Алматинская область',
    address: 'город Алматы, пр.Райымбека 206/12 кв.204 (Алматинская область, Жамбылский район, село Каргалы, улица Ауэзова 10)', family: 'Полная', phone: '87055822235',
    email: 'Vovan.motvilov@gmail.com', hobbies: 'Гитара, бег'
  },
  {
    firstName: 'Адина', lastName: 'Нурсаин', patronymic: '',
    dob: '2010-04-12', inn: '100412653972', nationality: 'Казахская', birthplace: 'г. Алматы',
    address: 'г. Алматы, мкр. Жетысу 3, 55 дом, 139 кв', family: 'Полная', phone: '87083171857',
    email: 'adinanursain@gmail.com', hobbies: 'Рисование, графический дизайн'
  },
  {
    firstName: 'Кирилл', lastName: 'Павлюченко', patronymic: 'Анатольевич',
    dob: '2009-11-21', inn: '91121500119', nationality: 'Русский', birthplace: 'г. Конаев',
    address: 'г. Алматы, мкр. Тастак-1, 1Б (Алматинская область, город Конаев, мкр Жулдыз, дом 1, КВ 46)', family: 'Полная', phone: '87470643053',
    email: 'kirillpavlucenko63@gmail.com', hobbies: 'Бокс, администрирование Linux'
  },
  {
    firstName: 'Кирилл', lastName: 'Певень', patronymic: 'Сергеевич',
    dob: '2009-08-08', inn: '90808551076', nationality: 'Русский', birthplace: 'Алматинская область',
    address: 'Алматинская область, Карасайский район, Село Кайнар, Беибетшелик 29/2', family: 'Полная', phone: '87002790753',
    email: 'pevenkirill228@gmail.com', hobbies: 'Киберспорт (CS2), качалка'
  },
  {
    firstName: 'Ярослав', lastName: 'Пестов', patronymic: 'Вячеславович',
    dob: '2009-08-25', inn: '90825552720', nationality: 'Русский', birthplace: 'г. Талгар',
    address: 'г. Алматы, микрорайон 7, дом 36, кв 2 (г. Талгар, ул. Кобыланды батыра, дом 3)', family: 'Полная', phone: '87478026326',
    email: 'yara.pest08@gmail.com', hobbies: 'Создание битов, плавание'
  },
  {
    firstName: 'Сергей', lastName: 'Погибалкин', patronymic: 'Александрович',
    dob: '2010-07-27', inn: '100727553007', nationality: 'Русский', birthplace: 'г. Алматы',
    address: 'г. Алматы, ул. Текелийская 80', family: 'Полная', phone: '87472176640',
    email: 'Spogibalkin23@gmail.com', hobbies: 'Велоспорт, программирование C++'
  },
  {
    firstName: 'Руслан', lastName: 'Рахманов', patronymic: 'Сухрабович',
    dob: '2009-07-14', inn: '90714553001', nationality: 'Уйгур', birthplace: 'г. Алматы',
    address: 'г. Алматы, ул Спасская 65, кв 44', family: 'Полная', phone: '87076520382',
    email: 'hanruslan08@gmail.com', hobbies: 'Футбол, мобильный гейминг'
  },
  {
    firstName: 'Дарья', lastName: 'Савинова', patronymic: 'Сергеевна',
    dob: '2009-10-05', inn: '91005654193', nationality: 'Русская', birthplace: 'г. Алматы',
    address: 'г. Алматы, Нурсая 4', family: 'Полная', phone: '87074545210',
    email: 'darasavinova177@gmail.com', hobbies: 'Настольные игры, чтение книг'
  },
  {
    firstName: 'Дамир', lastName: 'Сапиев', patronymic: '',
    dob: '2010-07-23', inn: '100723551376', nationality: 'Казах', birthplace: 'г. Алматы',
    address: 'г.Алматы, мкр.Айнабулак 4, д 166, кв 45', family: 'Полная', phone: '87778025252',
    email: 'damirsapiyevrustemovich@gmail.com', hobbies: 'Баскетбол, backend-разработка'
  },
  {
    firstName: 'Нұрасыл', lastName: 'Сейткарим', patronymic: 'Ниязбекұлы',
    dob: '2010-02-08', inn: '100208552661', nationality: 'Казах', birthplace: 'г. Алматы',
    address: 'г. Алматы, Наурызбайский район, СО Сельхозработник 42', family: 'Полная', phone: '87075654098',
    email: 'nurasyl22808@gmail.com', hobbies: 'Қазақша күрес, компьютерные игры'
  },
  {
    firstName: 'Исмаил', lastName: 'Сулимен', patronymic: 'Нұрланұлы',
    dob: '2010-03-04', inn: '100304553592', nationality: 'Казах', birthplace: 'г. Атырау',
    address: 'г. Алматы, мкр. Тастак-1, 1Б (г. Атырау, проезд Дины Нурпейсовой 13)', family: 'Полная', phone: '87788812336',
    email: 'sulimen.ismail@icloud.com', hobbies: 'Настольный теннис, дизайн интерфейсов'
  },
  {
    firstName: 'Даниил', lastName: 'Фадеев', patronymic: 'Александрович',
    dob: '2008-12-07', inn: '81207552395', nationality: 'Русский', birthplace: 'г. Алматы',
    address: 'г.Алматы, ул.Аносова, дом 47, кв.13', family: 'Полная', phone: '87760888050',
    email: 'morod1323@gmail.com', hobbies: 'Гейминг, изучение баз данных'
  },
  {
    firstName: 'Ильхан', lastName: 'Фахрадов', patronymic: '',
    dob: '2009-11-10', inn: '911110554643', nationality: 'Азербайджанец', birthplace: 'Алматинская область',
    address: 'Алматинская область, Карасайский район, село Коксай, улица Жамбула 10', family: 'Полная', phone: '87078950048',
    email: 'ilhanfahradov1@gmail.com', hobbies: 'Дзюдо, киберспорт'
  },
  {
    firstName: 'Нур', lastName: 'Хия', patronymic: 'Исмарович',
    dob: '2010-02-21', inn: '100221551723', nationality: 'Дунганин', birthplace: 'Жамбылская область',
    address: 'Жамбылская облысы, Кордайский район, Село Бәйтерек, ул абай 42', family: 'Полная', phone: '87715839484',
    email: 'hiyanur0@gmail.com', hobbies: 'Иностранные языки, волейбол'
  },
  {
    firstName: 'Александр', lastName: 'Циммерман', patronymic: 'Григорьевич',
    dob: '2009-04-17', inn: '90417500195', nationality: 'Немец', birthplace: 'Алматинская область',
    address: 'Алматинская область, Илийский район, с.М.Туймебаева, ул.Ереванская 35А', family: 'Полная', phone: '87073438360',
    email: 'cofa57391@gmail.com', hobbies: 'Футбол, электроника'
  },
  {
    firstName: 'Никита', lastName: 'Шахлович', patronymic: 'Сергеевич',
    dob: '2009-04-15', inn: '90415550507', nationality: 'Русский', birthplace: 'г. Конаев',
    address: 'г. Алматы, мкр. Тастак-1, 1Б (Г. Конаев, 8 м., ул. Алатау д. 3)', family: 'Полная', phone: '87473065603',
    email: 'nikitashakhlovich2005@gmail.com', hobbies: 'Сборка ПК, чтение манги'
  }
];

async function seed() {
  if (!fs.existsSync(dbPath)) {
    console.error('db.json not found at', dbPath);
    return;
  }
  
  const raw = fs.readFileSync(dbPath, 'utf8');
  let db = JSON.parse(raw);

  if (!db.users) db.users = [];
  if (!db.students) db.students = [];
  if (!db.groups) db.groups = [];

  const GROUP_NAME = 'ИС25-1Б';
  const CURATOR_NAME = 'Тулепбергенова Динара';

  // Make sure group exists
  if (!db.groups.find(g => g.name === GROUP_NAME)) {
    db.groups.push({
      id: 'groups-' + Date.now(),
      name: GROUP_NAME
    });
    console.log('Group IS25-1B added.');
  }

  let addedCount = 0;

  studentsData.forEach((s, idx) => {
    // Check if user exists by email
    const existingUser = db.users.find(u => u.email.toLowerCase() === s.email.toLowerCase());
    if (existingUser) {
      console.log(`Student ${s.lastName} ${s.firstName} (${s.email}) already exists. Skipping.`);
      return;
    }

    const userId = `user-is251b-${Date.now()}-${idx}`;
    
    db.users.push({
      id: userId,
      email: s.email,
      password: 'password123',
      firstName: s.firstName,
      lastName: s.lastName,
      patronymic: s.patronymic,
      role: 'STUDENT',
      isActive: true,
      phone: s.phone,
      dateOfBirth: s.dob,
      gender: 'MALE', // default
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    });

    db.students.push({
      id: `student-is251b-${Date.now()}-${idx}`,
      userId: userId,
      studentIdNumber: s.inn, // using INN as ID
      departmentId: db.departments?.[0]?.id || '', // default to first dept
      courseYear: 1, // first course
      groupName: GROUP_NAME,
      curatorName: CURATOR_NAME,
      phoneNumber: s.phone,
      birthDate: s.dob,
      nationality: s.nationality,
      birthPlace: s.birthplace,
      actualAddress: s.address,
      familyStatus: s.family,
      hobbies: s.hobbies
    });

    addedCount++;
  });

  fs.writeFileSync(dbPath, JSON.stringify(db, null, 2));
  console.log(`Successfully added ${addedCount} new students!`);
}

seed();
