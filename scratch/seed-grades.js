const fs = require('fs');
const path = require('path');

const dbPath = path.join(__dirname, '../frontend/data/db.json');

const randGrade100 = () => {
  const min = 50;
  const max = 100;
  return Math.floor(Math.random() * (max - min + 1)) + min;
};

const randDate = () => {
  const start = new Date(2026, 8, 1); // Sept 1
  const end = new Date();
  return new Date(start.getTime() + Math.random() * (end.getTime() - start.getTime())).toISOString().split('T')[0];
};

const subjectNames = ['Математика', 'Физика', 'История', 'Базы Данных', 'Веб Разработка'];

try {
  const data = JSON.parse(fs.readFileSync(dbPath, 'utf8'));
  
  // Clear old grades, lessons, and subjects
  data.grades = [];
  data.lessons = [];
  data.subjects = [];
  
  // Group students by groupName
  const studentsByGroup = {};
  data.students.forEach(s => {
    const gn = s.groupName || 'Unknown';
    if (!studentsByGroup[gn]) studentsByGroup[gn] = [];
    studentsByGroup[gn].push(s);
  });

  // For each group, determine its courseYear
  Object.keys(studentsByGroup).forEach(groupName => {
    const students = studentsByGroup[groupName];
    const courseYear = students[0].courseYear || 1;
    const semester = 1; // Requirement: 1st semester for all (both 1st and 4th years)
    const departmentId = students[0].departmentId || '';

    // Create subjects specifically for this courseYear and semester
    const groupSubjects = [];
    subjectNames.forEach(name => {
      const subject = { 
        id: `subj-${courseYear}-${semester}-${Date.now()}-${Math.random().toString(36).substr(2, 5)}`, 
        name: `${name} (${courseYear} курс)`,
        courseYear: courseYear,
        semester: semester,
        credits: 3,
        departmentId: departmentId
      };
      data.subjects.push(subject);
      groupSubjects.push(subject);
    });

    // Create 7 lessons for this group using its specific subjects
    for (let i = 0; i < 7; i++) {
      const subject = groupSubjects[Math.floor(Math.random() * groupSubjects.length)];
      const lessonId = `lesson-${groupName}-${Date.now()}-${i}`;
      
      data.lessons.push({
        id: lessonId,
        courseYear: courseYear,
        semester: semester,
        departmentId: departmentId,
        subjectId: subject.id,
        date: randDate(),
        groupName: groupName,
        createdAt: new Date().toISOString()
      });

      // Assign 100-point grades to each student
      students.forEach(student => {
        data.grades.push({
          id: `grade-${Date.now()}-${Math.random().toString(36).substr(2, 5)}`,
          studentId: student.userId,
          lessonId: lessonId,
          subjectId: subject.id,
          score: randGrade100(),
          createdAt: new Date().toISOString()
        });
      });
    }
  });

  fs.writeFileSync(dbPath, JSON.stringify(data, null, 2), 'utf8');
  console.log(`Successfully generated specific subjects, lessons, and grades for all groups based on courseYear!`);
} catch (err) {
  console.error('Error generating grades:', err);
}
