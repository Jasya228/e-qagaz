const fs = require('fs');
const path = require('path');

const DB_PATH = path.join(process.cwd(), 'data', 'db.json');

function seedRandomData() {
  console.log('Чтение базы данных...');
  const dbStr = fs.readFileSync(DB_PATH, 'utf-8');
  const db = JSON.parse(dbStr);

  const students = db.students || [];
  if (students.length === 0) {
    console.log('Студентов нет, нечего обновлять.');
  }

  // 1. Добавляем документы и достижения 50% студентов
  if (!db.documents) db.documents = [];
  if (!db.achievements) db.achievements = [];

  let docsAdded = 0;
  let achsAdded = 0;

  students.forEach(student => {
    if (Math.random() < 0.5) {
      db.documents.push({
        id: `doc-${Date.now()}-${Math.floor(Math.random() * 10000)}`,
        userId: student.userId,
        title: "Студенческий билет (Авто-генерация)",
        type: "STUDENT_ID",
        status: "READY",
        fileUrl: "/placeholder.jpg",
        createdAt: new Date().toISOString()
      });
      docsAdded++;

      db.achievements.push({
        id: `ach-${Date.now()}-${Math.floor(Math.random() * 10000)}`,
        userId: student.userId,
        title: "Победитель олимпиады (Авто)",
        description: "Занял призовое место",
        category: "OLYMPIAD",
        scale: "Городской",
        status: "APPROVED",
        fileUrl: "/placeholder.jpg",
        fileType: "image/jpeg",
        fileSize: 102400,
        createdAt: new Date().toISOString()
      });
      achsAdded++;
    }
  });

  console.log(`Добавлено ${docsAdded} документов и ${achsAdded} достижений.`);

  // 2. Создаем по 2 предмета для каждой группы + оценки
  if (!db.subjects) db.subjects = [];
  if (!db.lessons) db.lessons = [];
  if (!db.totalScores) db.totalScores = [];

  const groups = db.groups || [];
  const departments = db.departments || [];
  const deptId = departments.length > 0 ? departments[0].id : 'dept-1';

  const basicSubjects = ['Математика', 'Химия', 'Физика', 'История', 'Казахский язык', 'Информатика'];
  const advancedSubjects = ['БМ 1.1', 'ПМ 2.4', 'ОН 4.5', 'КМ 3.1', 'СМ 2.2', 'ПМ 1.2', 'ОД 3.4'];

  groups.forEach(group => {
    // Найдем студентов этой группы
    const groupStudents = students.filter(s => s.groupName === group.name);
    if (groupStudents.length === 0) return;

    // Определяем курс группы по первому студенту
    const courseYear = groupStudents[0].courseYear || 1;
    // Сделаем для двух семестров этого курса (1 и 2)
    [1, 2].forEach(semester => {
      // По 2 предмета
      for (let i = 0; i < 2; i++) {
        let subjName = '';
        if (courseYear === 1) {
          subjName = basicSubjects[Math.floor(Math.random() * basicSubjects.length)] + ` (${semester} сем)`;
        } else {
          subjName = advancedSubjects[Math.floor(Math.random() * advancedSubjects.length)] + ` (${semester} сем)`;
        }

        const subjectId = `subj-${Date.now()}-${Math.floor(Math.random() * 100000)}`;
        
        db.subjects.push({
          id: subjectId,
          name: subjName,
          departmentId: deptId,
          credits: 3 + Math.floor(Math.random() * 3),
          courseYear,
          semester
        });

        // Создадим 3 урока для этого предмета в этой группе
        let totalScoreMap = {};
        
        for (let l = 1; l <= 3; l++) {
          const lessonId = `lesson-${Date.now()}-${Math.floor(Math.random() * 100000)}`;
          let grades = {};

          groupStudents.forEach(s => {
            // 80% шанс получить оценку
            if (Math.random() < 0.8) {
              const score = 60 + Math.floor(Math.random() * 41); // 60-100
              grades[s.userId] = score;
              totalScoreMap[s.userId] = (totalScoreMap[s.userId] || 0) + score;
            } else if (Math.random() < 0.2) {
              grades[s.userId] = "НБ";
            }
          });

          db.lessons.push({
            id: lessonId,
            subjectId,
            groupName: group.name,
            date: `2024-0${Math.floor(Math.random() * 5) + 1}-1${l}`,
            topic: `Тема урока ${l}`,
            courseYear,
            semester,
            grades
          });
        }

        // Запишем totalScores
        groupStudents.forEach(s => {
          const tScore = totalScoreMap[s.userId] ? Math.floor(totalScoreMap[s.userId] / 3) : null;
          const examScore = Math.random() < 0.8 ? 60 + Math.floor(Math.random() * 41) : null;
          
          db.totalScores.push({
            id: `ts-${Date.now()}-${Math.floor(Math.random() * 100000)}`,
            subjectId,
            studentId: s.userId,
            semester: semester,
            examScore: examScore,
            totalScore: (tScore && examScore) ? Math.floor((tScore + examScore) / 2) : (tScore || examScore || null)
          });
        });
      }
    });
  });

  console.log('Предметы, уроки и оценки успешно сгенерированы!');

  fs.writeFileSync(DB_PATH, JSON.stringify(db, null, 2), 'utf-8');
  console.log('База данных успешно обновлена.');
}

seedRandomData();
