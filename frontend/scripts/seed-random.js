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

  // 2. Очищаем старые тестовые данные
  db.subjects = db.subjects?.filter(s => !s.name.includes('(1 сем)') && !s.name.includes('(2 сем)')) || [];
  db.lessons = [];
  db.grades = [];
  db.totalScores = [];

  const groups = db.groups || [];
  const departments = db.departments || [];
  const deptId = departments.length > 0 ? departments[0].id : 'dept-1';

  const basicSubjects = ['Математика', 'Химия', 'Физика', 'История', 'Казахский язык', 'Информатика'];
  const advancedSubjects = ['БМ 1.1', 'ПМ 2.4', 'ОН 4.5', 'КМ 3.1', 'СМ 2.2', 'ПМ 1.2', 'ОД 3.4'];

  groups.forEach(group => {
    const groupStudents = students.filter(s => s.groupName === group.name);
    if (groupStudents.length === 0) return;

    const courseYear = groupStudents[0].courseYear || 1;
    [1, 2].forEach(semester => {
      for (let i = 0; i < 2; i++) {
        let subjName = courseYear === 1 ? 
          basicSubjects[Math.floor(Math.random() * basicSubjects.length)] : 
          advancedSubjects[Math.floor(Math.random() * advancedSubjects.length)];
        
        subjName += ` (${semester} сем)`;

        const subjectId = `subj-${Date.now()}-${Math.floor(Math.random() * 100000)}`;
        
        db.subjects.push({
          id: subjectId,
          name: subjName,
          departmentId: deptId,
          credits: 3 + Math.floor(Math.random() * 3),
          courseYear,
          semester
        });

        let totalScoreMap = {};
        
        // 3 урока (случайные даты в месяце)
        for (let l = 1; l <= 3; l++) {
          const lessonId = `lesson-${Date.now()}-${Math.floor(Math.random() * 100000)}`;
          const day = Math.floor(Math.random() * 28) + 1;
          const month = semester === 1 ? (Math.floor(Math.random() * 4) + 9) : (Math.floor(Math.random() * 5) + 1);
          const dateStr = `2023-${month.toString().padStart(2, '0')}-${day.toString().padStart(2, '0')}`;

          db.lessons.push({
            id: lessonId,
            subjectId,
            groupName: group.name,
            date: dateStr,
            topic: `Тема урока ${l}`,
            courseYear,
            semester
          });

          // Оценки
          groupStudents.forEach(s => {
            if (Math.random() < 0.8) {
              const score = 60 + Math.floor(Math.random() * 41);
              db.grades.push({
                id: `grade-${Date.now()}-${Math.floor(Math.random() * 100000)}`,
                studentId: s.userId,
                lessonId,
                subjectId,
                score
              });
              totalScoreMap[s.userId] = (totalScoreMap[s.userId] || 0) + score;
            } else if (Math.random() < 0.2) {
              db.grades.push({
                id: `grade-${Date.now()}-${Math.floor(Math.random() * 100000)}`,
                studentId: s.userId,
                lessonId,
                subjectId,
                score: "НБ"
              });
            }
          });
        }

        // Запишем totalScores (считаем среднее)
        groupStudents.forEach(s => {
          if (totalScoreMap[s.userId]) {
            const avg = Math.floor(totalScoreMap[s.userId] / 3);
            db.totalScores.push({
              id: `total-${Date.now()}-${Math.floor(Math.random() * 100000)}`,
              studentId: s.userId,
              subjectId,
              semester,
              score: avg
            });
          }
        });
      }
    });
  });

  console.log('Предметы, даты, уроки и оценки успешно сгенерированы в правильном формате!');

  fs.writeFileSync(DB_PATH, JSON.stringify(db, null, 2), 'utf-8');
  console.log('База данных успешно обновлена.');
}

seedRandomData();
