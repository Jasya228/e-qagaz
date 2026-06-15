const fs = require('fs');
const path = require('path');

const dbPath = path.join(__dirname, '../frontend/data/db.json');

try {
  const data = JSON.parse(fs.readFileSync(dbPath, 'utf8'));
  let counter = 1;

  if (data.students && Array.isArray(data.students)) {
    data.students.forEach(student => {
      student.studentIdNumber = `STU${counter.toString().padStart(3, '0')}`;
      counter++;
    });

    fs.writeFileSync(dbPath, JSON.stringify(data, null, 2), 'utf8');
    console.log(`Successfully updated ${counter - 1} student IDs.`);
  } else {
    console.log('No students array found in DB.');
  }
} catch (error) {
  console.error('Error updating db.json:', error);
}
