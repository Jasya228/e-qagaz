const fs = require('fs');
const path = require('path');

const DB_PATH = path.join(__dirname, 'data', 'db.json');

const studentsData = [
  {
    lastName: "Асанов", firstName: "Саят", patronymic: "Жаксилик Оглы",
    dob: "2005-11-06", nationality: "Казах",
    birthPlace: "Алматы",
    actualAddress: "Алматы",
    familyStatus: "Полная", homePhone: "", mobilePhone: "8 707 705 1106",
    hobbies: "Программирование", gender: "MALE", emailPrefix: "asanovsayat"
  },
  {
    lastName: "Алфёрова", firstName: "Анна", patronymic: "Александровна",
    dob: "2006-06-23", nationality: "русская",
    birthPlace: "Ауэзовский район, Утеген батыра 92, кв 8",
    actualAddress: "Ауэзовский район, Утеген батыра 92, кв 8",
    familyStatus: "Полная (2)", homePhone: "8 727 320 9792", mobilePhone: "8 707 850 5449",
    hobbies: "Хоровое пение, настольные игры", gender: "FEMALE", emailPrefix: "AnnaAlferova"
  },
  {
    lastName: "Марченко", firstName: "Савелий", patronymic: "Юрьевич",
    dob: "2006-04-27", nationality: "Русский",
    birthPlace: "г. Алматы",
    actualAddress: "Алматинская область, Енбекшиказахский район, с. Байтерек, ул. Дружбы 6, кв. 6",
    familyStatus: "В разводе (3)", homePhone: "", mobilePhone: "+77081042934",
    hobbies: "Гитара, гейминг", gender: "MALE", emailPrefix: "SaveliyMarchenko"
  },
  {
    lastName: "Кенесарин", firstName: "Рамазан", patronymic: "Айтжанұлы",
    dob: "2006-09-29", nationality: "Қазақ",
    birthPlace: "г. Алматы, Ауэзовский район",
    actualAddress: "Алматинская область, Карасайский район, село Абай, ул. Майлина 24а",
    familyStatus: "Полная (2)", homePhone: "389 04 69", mobilePhone: "+77088336121",
    hobbies: "Футбол", gender: "MALE", emailPrefix: "RamazanKenesarin"
  },
  {
    lastName: "Карасёв", firstName: "Кирилл", patronymic: "Владимирович",
    dob: "2006-03-12", nationality: "Русский",
    birthPlace: "г. Алматы",
    actualAddress: "ул. Санаторная, дом 2, кв. 19",
    familyStatus: "Полная (2)", homePhone: "", mobilePhone: "+77785865821",
    hobbies: "Бокс, воркаут, программирование, режиссёрства, съёмка клипов, фильмов", gender: "MALE", emailPrefix: "KirillKarasev"
  },
  {
    lastName: "Змагамбетов", firstName: "Алан", patronymic: "Серикович",
    dob: "2007-01-23", nationality: "Казах",
    birthPlace: "г. Алматы",
    actualAddress: "г. Алматы, Ауэзовский район, Тастак-2, дом 21, кв. 78",
    familyStatus: "Неполная, в разводе (2)", homePhone: "", mobilePhone: "87714565991",
    hobbies: "Баскетбол", gender: "MALE", emailPrefix: "AlanZmagambetov"
  },
  {
    lastName: "Ешпанов", firstName: "Булат", patronymic: "Нурланович",
    dob: "2006-02-01", nationality: "Казах",
    birthPlace: "г. Алматы, Алатауский район",
    actualAddress: "г. Алматы, Алатауский район, 2-я Кисловодская, 31-й дом, кв. 5",
    familyStatus: "Полная (1)", homePhone: "", mobilePhone: "+7 777 356 1542",
    hobbies: "Программирование, видеоигры", gender: "MALE", emailPrefix: "BulatEshpanov"
  },
  {
    lastName: "Еспаева", firstName: "Арина", patronymic: "Денисовна",
    dob: "2007-08-19", nationality: "Русская",
    birthPlace: "г. Алматы",
    actualAddress: "г. Алматы, Жетысуский р-н, Крыжицкого 18/2",
    familyStatus: "Сирота (1)", homePhone: "", mobilePhone: "+77769802657",
    hobbies: "Рисование", gender: "FEMALE", emailPrefix: "ArinaEspaeva"
  },
  {
    lastName: "Гордиенко", firstName: "Семён", patronymic: "Викторович",
    dob: "2006-08-02", nationality: "Русский",
    birthPlace: "г. Алматы, Турксибский район",
    actualAddress: "г. Алматы, Илийский район, пос. М. Туймебаев, ул. 50 лет победы, дом 40",
    familyStatus: "Неполная (2)", homePhone: "", mobilePhone: "+77471313808",
    hobbies: "Футбол, workout", gender: "MALE", emailPrefix: "SemenGordienko"
  },
  {
    lastName: "Буравов", firstName: "Данил", patronymic: "Константинович",
    dob: "2006-03-21", nationality: "Русский",
    birthPlace: "г. Алматы",
    actualAddress: "г. Алматы, с. Казцик, мкр. Байтал, 6 линия, 22",
    familyStatus: "Полная (2)", homePhone: "", mobilePhone: "+7 777 010 7149",
    hobbies: "Киберспорт, музыка", gender: "MALE", emailPrefix: "DanilBuravov"
  },
  {
    lastName: "Беляков", firstName: "Владимир", patronymic: "Дмитриевич",
    dob: "2006-10-06", nationality: "Русский",
    birthPlace: "г. Алматы, Айнабулак-3",
    actualAddress: "г. Алматы, Айнабулак-3, ул. Палладина, дом 111",
    familyStatus: "Полная (2)", homePhone: "", mobilePhone: "+77055077710",
    hobbies: "Компьютерная графика", gender: "MALE", emailPrefix: "VladimirBelyakov"
  },
  {
    lastName: "Басымбек", firstName: "Ерасыл", patronymic: "Димашбекұлы",
    dob: "2006-12-23", nationality: "Казах",
    birthPlace: "г. Алматы, пос. Боролдай",
    actualAddress: "г. Алматы, пос. Боролдай, мкр. Жайнак, ул. Байтерек, дом 45",
    familyStatus: "Полная (3)", homePhone: "", mobilePhone: "+7 778 325 6868",
    hobbies: "Продакшн музыки, игры, спорт", gender: "MALE", emailPrefix: "ErasylBasymbek"
  },
  {
    lastName: "Байжан", firstName: "Дінмұхаммед", patronymic: "Бахытұлы",
    dob: "2007-01-16", nationality: "Казах",
    birthPlace: "г. Алматы",
    actualAddress: "Наурызбайский район, Калкаман-2, Айбергенова 140",
    familyStatus: "Полная (4)", homePhone: "", mobilePhone: "7 776 983 95 62",
    hobbies: "Плавание, велоспорт, игры", gender: "MALE", emailPrefix: "DinmukhammedBayzhan"
  },
  {
    lastName: "Бадирова", firstName: "Аяжан", patronymic: "Маратовна",
    dob: "2005-12-04", nationality: "Қазақ",
    birthPlace: "Акмолинская область, г. Кокшетау",
    actualAddress: "г. Алматы, Наурызбайский район, мкр. Alma City, ул. Жунисова 14/9, кв. 45",
    familyStatus: "Неполная (1)", homePhone: "", mobilePhone: "8 747 319 0174",
    hobbies: "Рисование", gender: "FEMALE", emailPrefix: "AyazhanBadirova"
  },
  {
    lastName: "Әлібек", firstName: "Рауан", patronymic: "Бағланұлы",
    dob: "2006-08-19", nationality: "Казах",
    birthPlace: "г. Уштобе",
    actualAddress: "г. Алматы, Алатауский район, Арычная 26",
    familyStatus: "Полная (1)", homePhone: "", mobilePhone: "+77715809152",
    hobbies: "Чтение манги", gender: "MALE", emailPrefix: "RauanAlibek"
  },
  {
    lastName: "Аманкелдин", firstName: "Саид", patronymic: "Аманкелдіұлы",
    dob: "2006-04-15", nationality: "Казах",
    birthPlace: "г. Усть-Каменогорск",
    actualAddress: "г. Алматы, мкр. Калкаман, ЖК Гульдер, ул. Абишева 36-16",
    familyStatus: "Полная (4)", homePhone: "", mobilePhone: "8 747 615 2926",
    hobbies: "Монтаж видео, устраивание мероприятий", gender: "MALE", emailPrefix: "SaidAmankeldin"
  }
];

function seed() {
  const db = JSON.parse(fs.readFileSync(DB_PATH, 'utf-8'));
  
  // Do NOT clear old users and students to preserve Asanov Sayat
  if (!db.students) db.students = [];
  
  // Also we need to make sure department and group exist
  const departmentId = db.departments[0]?.id || "departments-1";
  const groupName = "ИС22-4Б";
  if (!db.groups.find(g => g.name === groupName)) {
    db.groups.push({ id: `groups-${Date.now()}`, name: groupName });
  }
  const curatorName = "Сейсекулова Сауле";
  if (!db.curators.find(c => c.name === curatorName)) {
    db.curators.push({ id: `curators-${Date.now()}`, name: curatorName });
  }

  studentsData.forEach((s, i) => {
    const email = `${s.emailPrefix}@aspc.kz`.toLowerCase();
    
    // Check if student already exists to prevent duplicates
    if (db.users.find(u => u.email === email)) {
      return; // Skip if exists
    }

    const userId = `user-${Date.now()}-${i}`;
    const studentProfileId = `stu-profile-${Date.now()}-${i}`;
    
    db.users.push({
      id: userId,
      email: `${s.emailPrefix}@aspc.kz`.toLowerCase(),
      firstName: s.firstName,
      lastName: s.lastName,
      patronymic: s.patronymic,
      phone: s.mobilePhone,
      dateOfBirth: s.dob,
      gender: s.gender,
      role: "STUDENT",
      isActive: true,
      passwordHash: "password123"
    });
    
    db.students.push({
      id: studentProfileId,
      userId: userId,
      departmentId: departmentId,
      studentIdNumber: `STU${String(i+1).padStart(3, '0')}`,
      courseYear: 4,
      groupName: groupName,
      curatorName: curatorName,
      nationality: s.nationality,
      birthPlace: s.birthPlace,
      actualAddress: s.actualAddress,
      familyStatus: s.familyStatus,
      phoneNumber: s.mobilePhone,
      hobbies: s.hobbies
    });
  });
  
  fs.writeFileSync(DB_PATH, JSON.stringify(db, null, 2), 'utf-8');
  console.log('Students seeded successfully!');
}

seed();
