const fs = require('fs');
const path = require('path');

const dbPath = path.join(__dirname, '../frontend/data/db.json');

const firstNamesMale = ['Азамат', 'Бекзат', 'Данияр', 'Ерлан', 'Марат', 'Руслан', 'Тимур', 'Санжар', 'Арман', 'Ильяс'];
const firstNamesFemale = ['Айгерим', 'Динара', 'Асель', 'Жанар', 'Мадина', 'Алуа', 'Амина', 'Дана', 'Камила', 'Самал'];
const lastNames = ['Абдрахманов', 'Омаров', 'Сыздыков', 'Искаков', 'Нургалиев', 'Ахметов', 'Каримов', 'Садыков', 'Жумабаев', 'Сулейменов'];
const lastNamesFemale = ['Абдрахманова', 'Омарова', 'Сыздыкова', 'Искакова', 'Нургалиева', 'Ахметова', 'Каримова', 'Садыкова', 'Жумабаева', 'Сулейменова'];

const randElement = (arr) => arr[Math.floor(Math.random() * arr.length)];
const randInt = (min, max) => Math.floor(Math.random() * (max - min + 1)) + min;

try {
  const data = JSON.parse(fs.readFileSync(dbPath, 'utf8'));
  
  // Create groups and curators if missing
  let group1 = data.groups?.find(g => g.name === 'П22-4В');
  if (!group1) {
    group1 = { id: `groups-${Date.now()}-1`, name: 'П22-4В' };
    data.groups = data.groups || [];
    data.groups.push(group1);
  }
  let group2 = data.groups?.find(g => g.name === 'П25-1А');
  if (!group2) {
    group2 = { id: `groups-${Date.now()}-2`, name: 'П25-1А' };
    data.groups = data.groups || [];
    data.groups.push(group2);
  }

  let curator1 = data.curators?.find(c => c.name.includes('Абдраимова'));
  if (!curator1) {
    curator1 = { id: `curators-${Date.now()}-1`, name: 'Абдраимова Асыл' };
    data.curators = data.curators || [];
    data.curators.push(curator1);
  }
  let curator2 = data.curators?.find(c => c.name.includes('Нариманова'));
  if (!curator2) {
    curator2 = { id: `curators-${Date.now()}-2`, name: 'Нариманова Елмес' };
    data.curators = data.curators || [];
    data.curators.push(curator2);
  }

  let maxIdNum = 0;
  data.students?.forEach((s) => {
    if (s.studentIdNumber && s.studentIdNumber.startsWith('STU')) {
      const num = parseInt(s.studentIdNumber.replace('STU', ''), 10);
      if (!isNaN(num) && num > maxIdNum) maxIdNum = num;
    }
  });

  const generateStudents = (groupName, curatorName, courseYear, count) => {
    for (let i = 0; i < count; i++) {
      const isMale = Math.random() > 0.5;
      const fName = isMale ? randElement(firstNamesMale) : randElement(firstNamesFemale);
      const lName = isMale ? randElement(lastNames) : randElement(lastNamesFemale);
      const email = `${fName.toLowerCase()}.${lName.toLowerCase()}${randInt(10, 99)}@aspc.kz`;

      const userId = `user-${Date.now()}-${Math.random().toString(36).substr(2, 5)}`;
      const newUser = {
        id: userId,
        email: email,
        firstName: fName,
        lastName: lName,
        patronymic: '',
        phone: `8 707 ${randInt(100, 999)} ${randInt(10, 99)} ${randInt(10, 99)}`,
        dateOfBirth: `200${randInt(2, 6)}-0${randInt(1, 9)}-1${randInt(0, 9)}`,
        gender: isMale ? 'MALE' : 'FEMALE',
        role: 'STUDENT',
        isActive: true,
        passwordHash: 'password123'
      };
      
      maxIdNum++;
      const studentIdNum = `STU${maxIdNum.toString().padStart(3, '0')}`;
      const newStudent = {
        id: `stu-profile-${Date.now()}-${Math.random().toString(36).substr(2, 5)}`,
        userId: userId,
        departmentId: data.departments && data.departments.length > 0 ? data.departments[0].id : '',
        studentIdNumber: studentIdNum,
        courseYear: courseYear,
        groupName: groupName,
        curatorName: curatorName,
        nationality: 'Казах',
        birthPlace: 'Казахстан, Алматы',
        actualAddress: 'Алматы, ул. Абая 100',
        familyStatus: 'Полная',
        hobbies: 'Спорт, IT'
      };

      data.users.push(newUser);
      data.students.push(newStudent);

      // Add a document 50% of the time
      if (Math.random() > 0.5) {
        data.documents = data.documents || [];
        data.documents.push({
          id: `doc-${Date.now()}-${Math.random().toString(36).substr(2, 5)}`,
          userId: userId,
          title: `Справка с места учебы - ${fName} ${lName}`,
          type: 'Справка',
          status: 'READY',
          fileUrl: '/mock-document.pdf',
          createdAt: new Date().toISOString()
        });
      }
    }
  };

  // Generate 8 students for each
  generateStudents('П22-4В', 'Абдраимова Асыл', 4, 8);
  generateStudents('П25-1А', 'Нариманова Елмес', 1, 8);

  fs.writeFileSync(dbPath, JSON.stringify(data, null, 2), 'utf8');
  console.log('Successfully generated students and documents!');
} catch (err) {
  console.error('Error generating students:', err);
}
