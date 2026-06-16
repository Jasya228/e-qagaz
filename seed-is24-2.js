const fs = require('fs');
const path = require('path');

const dbPath = path.join(__dirname, 'frontend/data/db.json');
let db = JSON.parse(fs.readFileSync(dbPath, 'utf-8'));

// Department for IS
const departmentId = "dept-1"; // Information Systems
const groupName = "ИС24-2";
const curatorName = "Байбалакова Жанат Дангыловна";

const newStudents = [
  { name: "Абдрасул Диана Серікқызы", email: "dianaabdrasul1@gmail.com", inn: "902166525188", phone: "+77773303658", dob: "16.02.2009", nationality: "Қазақ", birthPlace: "Алматы облысы, Панфилов ауданы, Алтыүй ауылы", address: "Алматы обл., Іле ауданы, Жапек батыр, Береке саяжайы, 8-көше, 10-үй", family: "Полная", hobbies: "Мобилография, ведение блогов, настольный теннис" },
  { name: "Елгелдиева Айнур Ерқосайқызы", email: "elgeldievaajnur899@gmail.com", inn: "812216000788", phone: "+77073488291", dob: "16.12.2008", nationality: "Қазақ", birthPlace: "Түркістан облысы, Келес ауданы, Шынар ауылы", address: "Алматы обл., Іле ауданы, Жапек батыр, Береке саяжайы, 8-көше, 13-үй", family: "Полная", hobbies: "Графический дизайн, изучение английского языка, волейбол" },
  { name: "Елшінбай Тоғжан Қуандыққызы", email: "elshinbaevat@gmail.com", inn: "90515651525", phone: "+77767301082", dob: "15.05.2009", nationality: "Қазақ", birthPlace: "Түркістан облысы, Сарыағаш ауданы, Сарыүйсін ауылы", address: "мкр. Шугыла, Шугыла City, 340/4, 7-кіру", family: "Полная", hobbies: "Современные танцы, чтение книг по саморазвитию, UI/UX дизайн" },
  { name: "Әли Дана Қуандыққызы", email: "alidana0905@gmail.com", inn: "90510653366", phone: "+77757520039", dob: "10.05.2009", nationality: "Қазақ", birthPlace: "г. Алматы, Турксибский район", address: "г. Алматы, Турксибский район, мкр. Жас қанат 1-4", family: "Полная", hobbies: "Рисование на планшете, кулинария, мобильный гейминг" },
  { name: "Жағыпар Даниал Дәуренұлы", email: "zagipardanial3@gmail.com", inn: "90727554060", phone: "+7715181854", dob: "27.07.2009", nationality: "Қазақ", birthPlace: "г. Алматы, Наурызбайский район", address: "г. Алматы, Наурызбайский район, мкр. Шұғыла 341/5, 3-кіру, 12-кв", family: "Полная", hobbies: "Программирование на C++, киберспорт (Valorant), шахматы" },
  { name: "Жапарқұл Мадина Мұқтарқызы", email: "themadizz@gmail.com", inn: "81002653345", phone: "+77768238674", dob: "26.02.2008", nationality: "Қазақ", birthPlace: "Жамбыл облысы, Қордай ауданы, Кенен ауылы", address: "Жамбыл облысы, Қордай ауданы, Кенен ауылы, ул. Абая 15", family: "Полная", hobbies: "Чтение зарубежной классики, фотография, изучение корейского языка" },
  { name: "Жолдасбекова Амина Нурлановна", email: "amizholdasbekova@icloud.com", inn: "81215652276", phone: "+77477264495", dob: "15.12.2008", nationality: "Қазақ", birthPlace: "г. Алматы", address: "г. Алматы, мкр. Айнабулак, ул. Крыжицкая 3", family: "Полная", hobbies: "Кастомизация одежды, фитнес, блогинг в TikTok" },
  { name: "Заидуллаева Сандуғаш Амангелдиқызы", email: "Zaidullaevasandu2024@gmail.com", inn: "71130000192", phone: "+77476923642", dob: "30.11.2007", nationality: "Қазақ", birthPlace: "г. Алматы", address: "г. Алматы, Алатауский район, ул. Ақбулақ, ул. Бейсекбаев 25", family: "Полная", hobbies: "Чтение манхвы, веб-верстка, настольные игры" },
  { name: "Ибрагим Фарида Мұратқызы", email: "faridaibragimm@icloud.com", inn: "90430650773", phone: "+77079758237", dob: "30.04.2009", nationality: "Қазақ", birthPlace: "Алматы облысы, Қарасай ауданы", address: "Алматы обл., Қарасай ауданы, Іргелі ауылы, ул. Ақжол 12", family: "Полная", hobbies: "Изучение Python, игра на укулеле, плавание" },
  { name: "Исабай Дамир Нұрланұлы", email: "d84584513@gmail.com", inn: "80902553225", phone: "+77057432637", dob: "25.09.2008", nationality: "Қазақ", birthPlace: "Алматы облысы, Қарасай ауданы", address: "Алматы обл., Қарасай ауданы, Рахат-1, ул. Абая 266 (19-й км)", family: "Полная", hobbies: "Футбол, сборка ПК, автосимуляторы" },
  { name: "Касенов Баглан Бауржанович", email: "baglantaken@gmail.com", inn: "81127553834", phone: "+77714386461", dob: "27.11.2008", nationality: "Қазақ", birthPlace: "г. Алматы, Бостандыкский район", address: "г. Алматы, Бостандыкский район, проспект Абай 164/4, кв. 93", family: "Полная", hobbies: "Силовой воркаут, программирование на JavaScript, киберспорт (CS2)" },
  { name: "Қайрат Дарын Қуатұлы", email: "Kairatdaryn300409@gmail.com", inn: "90430553563", phone: "+77075619511", dob: "30.04.2009", nationality: "Қазақ", birthPlace: "Алматы облысы, Қарасай ауданы, Жамбыл ауылы", address: "Алматы обл., Қарасай ауданы, Жамбыл ауылы, ул. Жерұйық 14Б", family: "Полная", hobbies: "Бокс, администрирование баз данных, музыкальные треки" },
  { name: "Қуандыққызы Жания", email: "z.kuandykkyzy@mail.ru", inn: "80529654029", phone: "+77762203667", dob: "29.05.2008", nationality: "Қазақ", birthPlace: "Алматы облысы", address: "Сарыбел ауылы, ул. Бектұрсынов 17", family: "Полная", hobbies: "Рукоделие, 3D-моделирование, баскетбол" },
  { name: "Мәулетхан Санжар Амантайұлы", email: "malikderzki@gmail.com", inn: "90131550286", phone: "+77474402676", dob: "31.01.2009", nationality: "Қазақ", birthPlace: "Алматы облысы, Іле ауданы", address: "Алматы обл., Іле ауданы, Көкқайнар, ПКСТ Күн шуақ", family: "Полная", hobbies: "Качалка, создание битов (Beatmaking), киберспорт" },
  { name: "Оқас Сұңқар Ерлікұлы", email: "sunkarokas270@gmail.com", inn: "90420553599", phone: "+77058054053", dob: "20.04.2009", nationality: "Қазақ", birthPlace: "г. Алматы, Медеуский район", address: "г. Алматы, Медеуский район, Кульджинский тракт, дом 16-3, кв. 24", family: "Полная", hobbies: "Легкая атлетика, разработка мобильных приложений, фотография" },
  { name: "Орынбасар Айым Еркебұланқызы", email: "aiymgulnara01@gmail.com", inn: "90304652665", phone: "+77475739185", dob: "04.03.2009", nationality: "Қазақ", birthPlace: "г. Алматы", address: "г. Алматы, ул. Берімжанова 2Б", family: "Полная", hobbies: "Чтение манги, рисование аниме-артов, SMM" },
  { name: "Серікбай Серғазы Баймаханұлы", email: "sergaziserikbaev8@gmail.com", inn: "80706551723", phone: "+77713247005", dob: "06.07.2008", nationality: "Қазақ", birthPlace: "Алматы облысы, Қарасай ауданы", address: "Алматы обл., Қарасай ауданы, Бұлақты ауылы, ул. Самал 60", family: "Полная", hobbies: "Вольная борьба, компьютерное железо, игры" },
  { name: "Сұлтанбай Ұлықпан", email: "sultanbayulikpan2000@gmail.com", inn: "80130500202", phone: "+77058673157", dob: "05.03.2008", nationality: "Қазақ", birthPlace: "Алматы облысы, Жамбыл ауданы", address: "Алматы обл., Жамбыл ауданы, Мынбаев ауылы, ул. Жібек жолы 1", family: "Полная", hobbies: "Конный спорт, ремонт техники, Backend-разработка" },
  { name: "Токжигитов Алихан Канатович", email: "tokzigitovalihan@gmail.com", inn: "81006550534", phone: "+77057722622", dob: "06.10.2008", nationality: "Қазақ", birthPlace: "г. Алматы, Ауэзовский район", address: "г. Алматы, Ауэзовский район, мкр. Ақсай-2, үй 5, кв. 21", family: "Полная", hobbies: "Настольный теннис, программирование на Python, гейминг" },
  { name: "Тұрлығазы Дәулет Алтайұлы", email: "turlygazyda@gmail.com", inn: "91112552320", phone: "+77073156202", dob: "12.11.2009", nationality: "Қазақ", birthPlace: "Алматы облысы, Жамбыл ауданы, Мынбаев ауылы", address: "Алматы обл., Жамбыл ауданы, Мынбаев ауылы, ул. Аманкелді, үй 5", family: "Полная", hobbies: "Футбол, тренажерный зал, системное администрирование" },
  { name: "Урунбай Бағлан Таласұлы", email: "orynbaibaglan@icloud.com", inn: "80515550300", phone: "+77053715630", dob: "15.05.2008", nationality: "Қазақ", birthPlace: "г. Алматы", address: "г. Алматы, ул. Ыкылас 3В", family: "Полная", hobbies: "Музыкальные редакторы, баскетбол, видеоигры" },
  { name: "Ушуров Амир Керимжанович", email: "amirushurov85@gmail.com", inn: "80730552019", phone: "+77078449238", dob: "05.03.2008", nationality: "Уйгур", birthPlace: "Алматинская область, Карасайский район", address: "Алматы обл., Карасайский район, село Райымбек (село Жаркент), дом 21А", family: "Полная", hobbies: "Монтаж видео, автозвук, киберспорт" },
  { name: "Аллымбек Аружан Сағынқызы", email: "Aruzhan67890@gmail.com", inn: "90810655224", phone: "+77473546034", dob: "10.08.2009", nationality: "Қазақ", birthPlace: "Алматы облысы, Жамбыл ауданы", address: "Алматы обл., Жамбыл ауданы, Ынтымақ ауылы, ул. Сулубекова 15А", family: "Полная", hobbies: "Фотосъемка, рисование, изучение веб-технологий" }
];

let maxIdNum = 0;
db.students.forEach((s) => {
  if (s.studentIdNumber && s.studentIdNumber.startsWith('STU')) {
    const num = parseInt(s.studentIdNumber.replace('STU', ''), 10);
    if (!isNaN(num) && num > maxIdNum) {
      maxIdNum = num;
    }
  }
});

let addedCount = 0;
newStudents.forEach(st => {
  const existingUser = db.users.find(u => u.email === st.email);
  if (existingUser) {
    console.log(`Skipping ${st.email}, already exists`);
    return;
  }
  
  const [lastName, firstName, ...patronymicArr] = st.name.split(' ');
  const patronymic = patronymicArr.join(' ');
  const gender = st.name.endsWith('ва') || st.name.endsWith('қызы') ? 'FEMALE' : 'MALE';
  
  const userDateObj = new Date(st.dob.split('.').reverse().join('-'));

  const user = {
    id: `user-${Date.now()}-${Math.floor(Math.random() * 10000)}`,
    email: st.email,
    passwordHash: "password123",
    role: "STUDENT",
    firstName,
    lastName,
    patronymic,
    phone: st.phone,
    gender,
    dateOfBirth: userDateObj.toISOString().split('T')[0],
    isActive: true
  };
  
  db.users.push(user);
  maxIdNum++;
  
  const student = {
    id: `stu-${Date.now()}-${Math.floor(Math.random() * 10000)}`,
    userId: user.id,
    departmentId,
    studentIdNumber: `STU${maxIdNum.toString().padStart(3, '0')}`,
    courseYear: 1,
    groupName,
    curatorName,
    nationality: st.nationality,
    birthPlace: st.birthPlace,
    actualAddress: st.address,
    familyStatus: st.family,
    hobbies: st.hobbies
  };
  
  db.students.push(student);
  addedCount++;
});

// Also add Curator to references if not exists
if (!db.references) db.references = { groups: [], curators: [], departments: [] };
if (!db.references.groups.find(g => g.name === groupName)) {
  db.references.groups.push({ id: `group-${Date.now()}`, name: groupName, departmentId });
}
if (!db.references.curators.find(c => c.name === curatorName)) {
  db.references.curators.push({ id: `curator-${Date.now()}`, name: curatorName, departmentId });
}

fs.writeFileSync(dbPath, JSON.stringify(db, null, 2));
console.log(`Successfully added ${addedCount} students to ${groupName}!`);
